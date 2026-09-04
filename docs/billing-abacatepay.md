# 💳 Integração de Pagamentos — AbacatePay

Este documento cobre a integração com a [AbacatePay](https://docs.abacatepay.com) para os planos Avulso, Essencial e Pro (ver `TASKS.md` para o backlog completo da integração).

> ⚠️ **Atenção:** a API pública atual da AbacatePay é a **v2** (`https://api.abacatepay.com/v2`), com endpoints `/checkouts`, `/subscriptions` e `/products` baseados em **produtos pré-cadastrados**. Isso é diferente do modelo assumido inicialmente no bloco 0/2+ de `TASKS.md` (que mencionava `frequency: MULTIPLE_PAYMENTS` e itens ad-hoc no corpo da requisição, prováveis resquícios de uma v1 da API). Ao implementar os blocos 2 em diante, usar como referência os endpoints e payloads descritos abaixo, não os exemplos antigos do `TASKS.md`.

---

## 1. Onde ficam as chaves

| Variável | O que é | Onde é usada |
| :--- | :--- | :--- |
| `ABACATEPAY_API_KEY` | Chave de API (Bearer token). O modo (`devMode: true`/sandbox vs. produção) é determinado **pela própria chave**, não pela URL — sandbox e produção usam o mesmo endpoint (`api.abacatepay.com`). | `apps/api/src/lib/billing/abacatepay-client.ts` (bloco 3) |
| `ABACATEPAY_WEBHOOK_SECRET` | Segredo informado por nós ao cadastrar o endpoint de webhook no dashboard AbacatePay (`secret` do `POST /webhooks/create`). **Não é a mesma coisa que `ABACATEPAY_API_KEY`.** | Verificação de assinatura do webhook (bloco 3.5) |
| `ABACATEPAY_API_BASE_URL` | Base da API. Tem `.default('https://api.abacatepay.com/v2')` — não precisa ser sobrescrita em dev/sandbox. | `abacatepay-client.ts` |

As três variáveis estão centralizadas em `packages/env/src/index.ts` (`apiEnvSchema`), sem `.optional()` — se faltarem, o boot da API falha imediatamente. Adicione os valores reais no seu `.env` local (nunca commitado — está no `.gitignore`).

`ABACATEPAY_WEBHOOK_SECRET` não vem de conta nenhuma — é um valor que **nós** escolhemos e informamos à AbacatePay ao cadastrar o endpoint de webhook (tarefa 1.4). Por isso o `.env` de dev já tem um valor gerado aleatoriamente (`crypto.randomBytes(32).toString('hex')`) só para não travar o boot local antes do cadastro do webhook existir; ao cadastrar o webhook de verdade (produção e/ou sandbox), usar esse mesmo valor no dashboard AbacatePay, ou gerar um novo e atualizar o `.env`/secret manager correspondente.

**Como gerar/rotacionar a API key:** Dashboard AbacatePay → seção de Integração → "Criar Chave", com uma descrição identificando o uso (ex.: "Produção — Corretor de Prova IA"). Ao rotacionar, gerar a nova chave antes de revogar a antiga para evitar downtime.

**Quem tem acesso ao painel AbacatePay:** a definir pelo time — registrar aqui o(s) responsável(is) quando o acesso for concedido.

---

## 2. Endpoints confirmados (API v2)

Autenticação em todas as chamadas: header `Authorization: Bearer ${ABACATEPAY_API_KEY}`.

### 2.1 Produtos (pré-requisito para assinaturas)

`POST /products/create` — os planos recorrentes (Essencial, Pro) precisam de um **produto cadastrado previamente** com o campo `cycle`. Uma assinatura não aceita itens ad-hoc no corpo — só referencia o `id` de um produto já existente.

```json
{
  "externalId": "essencial-mensal",
  "name": "Plano Essencial",
  "price": 3990,
  "currency": "BRL",
  "cycle": "MONTHLY"
}
```

- `cycle`: `WEEKLY` | `MONTHLY` | `QUARTERLY` | `SEMIANNUALLY` | `ANNUALLY`. Omitido/`null` = produto avulso (cobrança única).
- `price` em centavos.
- Resposta: `data.id` (`prod_...`) — é esse id que entra em `items[].id` no checkout/assinatura. **Resolvido na tarefa 4.2:** `plansTable` agora tem a coluna `abacatepayProductId` (nullable, migration `0013_careful_electro.sql`). Fica nula até o produto ser cadastrado manualmente no dashboard/API da AbacatePay (ação externa — não é possível automatizar isso sem credenciais reais rodando contra a conta de produção/sandbox); `create-checkout.ts` recusa o checkout com `BillingProviderError` (502) enquanto a coluna estiver vazia para aquele plano.

### 2.2 Checkout avulso (plano Avulso)

`POST /checkouts/create`

```json
{
  "items": [{ "id": "prod_xxx", "quantity": 1 }],
  "customerId": "cust_xxx",
  "methods": ["PIX", "CARD"],
  "returnUrl": "https://...",
  "completionUrl": "https://..."
}
```

Resposta: `{ data: { id: "bill_...", url: "https://app.abacatepay.com/pay/bill_...", status: "PENDING", ... } }`. `url` é o link de checkout para redirecionar o professor; `id` é o que referenciamos depois.

### 2.3 Assinatura (planos Essencial/Pro)

`POST /subscriptions/create` — **cria um checkout**, não a assinatura em si. A assinatura (`subs_...`) só existe depois que o pagamento é confirmado (webhook `subscription.completed`).

```json
{
  "items": [{ "id": "prod_xxx", "quantity": 1 }],
  "customerId": "cust_xxx",
  "methods": ["PIX", "CARD"],
  "card": { "maxInstallments": 1 },
  "retryPolicy": { "maxRetry": 3, "retryEvery": 1 },
  "returnUrl": "https://...",
  "completionUrl": "https://..."
}
```

- `items` deve ter **exatamente 1** produto.
- `retryPolicy`: tentativas automáticas de recobrança em caso de falha (default `maxRetry: 3`, `retryEvery: 1` dia). Se todas as tentativas falharem, a AbacatePay cancela a assinatura automaticamente (`cancelledDueTo: "max_payment_retries_exceeded"`) — relevante para o bloco 8 (não precisamos duplicar essa lógica de tentativas no nosso lado, só reagir ao evento final).
- **`metadata` (não documentado oficialmente, inferido na tarefa 4.2):** `create-checkout.ts` envia `metadata: { userId, planSlug }` tanto no checkout avulso quanto no de assinatura. O webhook (bloco 5) espera encontrar esses dois campos em `payload.data.metadata` para saber a quem creditar a compra/assinatura — sem `metadata` ecoado de volta pela AbacatePay no evento, o processamento do webhook não tem como associar o pagamento a um usuário. Validar esse comportamento contra a sandbox real antes de produção; se a API não ecoar `metadata`, o bloco 5 precisa de uma estratégia alternativa (ex.: `externalId` do produto + lookup por `customerId`).

### 2.4 Cancelamento de assinatura

`POST /subscriptions/cancel`

```json
{ "id": "subs_abc123xyz" }
```

**Cancela imediatamente** — sem carência no lado da AbacatePay. A lógica de "acesso continua até o fim do ciclo pago" (bloco 8.4) é responsabilidade nossa: chamamos esse endpoint imediatamente para garantir que não sai nova cobrança, mas só movemos `subscriptions.status` para `canceled` no nosso banco quando `currentPeriodEnd` passar (`cancelAtPeriodEnd = true` até lá).

### 2.5 Clientes

Criação/recuperação de cliente segue o padrão idempotente por `taxId`/CNPJ mencionado no bloco 3.2 do `TASKS.md` — confirmar payload exato (`/customers/create` ou similar) ao implementar o bloco 3, não coberto em detalhe nesta pesquisa.

---

## 3. Webhook

### 3.1 Cadastro

`POST /webhooks/create`, body `{ name, endpoint, secret, events }`. O `endpoint` precisa ser HTTPS e não pode apontar para endereço local/IP privado — por isso staging/sandbox precisa de uma URL pública (ex.: túnel ou ambiente de staging real), não `localhost`.

### 3.2 Verificação de assinatura (bloco 3.5)

- Header: **`X-Webhook-Signature`**
- Algoritmo: **HMAC-SHA256**, calculado sobre o **corpo bruto (raw body)** da requisição.
- Segredo: o mesmo `secret` informado por nós ao cadastrar o webhook (`ABACATEPAY_WEBHOOK_SECRET`) — **não** o `ABACATEPAY_API_KEY`.
- Comparação deve ser *timing-safe* (`crypto.timingSafeEqual`), não `===`.

```typescript
import crypto from 'node:crypto'

export function verifyAbacatePaySignature(rawBody: string, signatureFromHeader: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(Buffer.from(rawBody, 'utf8')).digest('base64')
  const a = Buffer.from(expected)
  const b = Buffer.from(signatureFromHeader)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
```

### 3.3 Enumeração completa de eventos

18 eventos possíveis, agrupados por origem:

| Grupo | Eventos |
| :--- | :--- |
| Checkout avulso | `checkout.completed`, `checkout.refunded`, `checkout.disputed`, `checkout.lost` |
| Cobrança transparente (PIX direto) | `transparent.completed`, `transparent.refunded`, `transparent.disputed`, `transparent.lost` |
| Assinatura | `subscription.completed`, `subscription.cancelled`, `subscription.renewed`, `subscription.trial_started` |
| Financeiro (saque/repasse — não usado por nós) | `payout.completed`, `payout.failed`, `transfer.completed`, `transfer.failed` |

Para o bloco 5.4:
- Pagamento avulso confirmado → `checkout.completed` (plano Avulso).
- Primeira ativação de assinatura → `subscription.completed`.
- Renovação de ciclo → `subscription.renewed` (evento distinto de `.completed`, confirmado — cada renovação dispara esse evento específico).
- Falha/cancelamento → `subscription.cancelled` (inclui cancelamento manual via 2.4 e cancelamento automático por esgotar `retryPolicy`; o payload deve trazer o motivo para diferenciar os dois casos no log).

---

## 4. SDK: decisão — usar REST puro via `fetch`

`TASKS.md` (bloco 0) pedia para não assumir o nome do pacote npm. Pesquisa feita:

- **`abacatepay-nodejs-sdk`** (pacote histórico, `npm install abacatepay-nodejs-sdk`): documentação do próprio repositório GitHub marca como **oficialmente descontinuado** ("deprecated"), com API antiga (`abacate.billing.create({ frequency: 'ONE_TIME', ... })`) que não bate com os endpoints v2 confirmados na seção 2.
- **`@abacatepay/sdk`** (novo, parte do monorepo `github.com/AbacatePay/ecosystem`): existe e é apontado como sucessor, mas não foi possível confirmar maturidade/estabilidade (sem acesso à página do pacote no npm durante esta pesquisa).

**Decisão:** seguir o padrão já usado no projeto para integrações externas (`apps/api/src/lib/ai/gemini.ts`, `apps/api/src/lib/storage/storage.ts` — wrapper fino, funções puras, sem "SDK completo") e implementar via `fetch` direto contra `ABACATEPAY_API_BASE_URL`, sem dependência de SDK de terceiros. Evita ficar preso à manutenção de um pacote cuja estabilidade não foi confirmada, e mantém consistência com o resto do código. Reavaliar apenas se o volume de chamadas justificar a tipagem forte do `@abacatepay/sdk`.

---

## 5. Decisões de produto já confirmadas

- Correção que falha no processamento (foto ilegível, erro da IA) **consome** 1 unidade da cota mesmo assim — sem lógica de estorno.
- Troca de plano (upgrade/downgrade) **sem prorate** — vale a partir da próxima renovação (bloco 7).

## 6. Pendências que ainda dependem de ação manual (não codificáveis)

- **Cadastro do endpoint de webhook de produção** no painel AbacatePay (tarefa 1.4) — precisa da URL pública final da API implantada; fazer via dashboard quando o domínio de produção estiver definido. Registrar também um endpoint separado para staging/sandbox se o time tiver esse ambiente.
- **Preços finais dos planos** (R$39,90 / R$99,90 / pacote avulso) seguem como hipótese de concorrência — não travar em copy de marketing até confirmar custo real de IA de visão + storage por correção (ver `TASKS.md` bloco 0).
