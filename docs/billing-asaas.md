# 💳 Integração de Pagamentos — Asaas

Este documento cobre a integração com o [Asaas](https://docs.asaas.com) (API v3) para os planos Avulso, Essencial e Pro. A integração usa a API direta (clientes, cobranças e assinaturas), sem o Checkout hospedado do Asaas.

---

## 1. Variáveis de ambiente

| Variável | O que é | De onde vem |
| :--- | :--- | :--- |
| `ASAAS_API_KEY` | Chave de API enviada no header `access_token` de toda chamada. A chave define o ambiente: chave de sandbox só funciona na URL de sandbox e vice-versa. | Painel do Asaas → Integrações → Chaves de API. |
| `ASAAS_WEBHOOK_TOKEN` | Token que **nós** escolhemos e cadastramos no webhook do painel. O Asaas o envia no header `asaas-access-token` de cada notificação. Deve ter entre 32 e 255 caracteres e **não pode ser a API key**. | Gerado por nós (ex.: `openssl rand -hex 32`) e copiado para o painel. |
| `ASAAS_API_BASE_URL` | Base da API, sem default. Sandbox: `https://api-sandbox.asaas.com/v3`. Produção: `https://api.asaas.com/v3`. | Fixa por ambiente. |

As três ficam em `packages/env/src/index.ts` (`apiEnvSchema`), sem `.optional()`: se faltar alguma, a API não sobe.

---

## 2. Fluxo de checkout

1. **Cliente.** `POST /billing/checkout` recebe `{ planSlug, cpfCnpj? }`. Se o usuário ainda não tem linha em `billing_customers`, o `cpfCnpj` é obrigatório (sem ele: 400 `Informe seu CPF ou CNPJ para continuar.`). O documento é validado (dígitos verificadores), enviado ao Asaas em `POST /customers` e **não é salvo** no nosso banco; guardamos só o `asaas_customer_id`. Nas compras seguintes o cliente é reaproveitado.
2. **Cobrança.**
   - Avulso (`one_time`): `POST /payments` com `billingType: 'PIX'`, vencimento hoje e `callback.successUrl`. A resposta traz o `invoiceUrl`.
   - Essencial/Pro (`recurring`): `POST /subscriptions` com `billingType: 'CREDIT_CARD'`, `cycle: 'MONTHLY'`, primeiro vencimento hoje e `callback.successUrl`. Depois, `GET /subscriptions/{id}/payments` busca a primeira cobrança gerada.
3. **Redirecionamento.** A API devolve `{ checkoutUrl }` com o `invoiceUrl`. Após pagar, o Asaas redireciona para `${WEB_URL}/dashboard/configuracoes?checkout=success`.

A troca imediata de plano (`POST /billing/change-plan` com `immediate: true`) cancela a assinatura atual no Asaas (`DELETE /subscriptions/{id}`) e cria uma nova pelo mesmo fluxo recorrente. O cancelamento (`POST /billing/cancel`) exclui a assinatura no Asaas e mantém o acesso até o fim do ciclo pago.

Valores: o Asaas trabalha em reais decimais (`39.9`) e o banco em centavos (`3990`). A conversão fica em `apps/api/src/lib/billing/to-asaas-value.ts`.

---

## 3. `externalReference`

Cobranças e assinaturas são criadas com `externalReference = "<userId>:<planSlug>"` (ex.: `abc123:essencial`). O webhook usa esse valor para descobrir o dono e o plano. O Asaas não documenta se as cobranças de uma assinatura herdam o `externalReference` da assinatura. Por isso, quando o pagamento não traz um valor válido, o webhook consulta `GET /subscriptions/{id}` antes de abrir a transação.

---

## 4. Webhook (`POST /billing/webhook`)

- **Autenticação:** o header `asaas-access-token` é comparado com `ASAAS_WEBHOOK_TOKEN` em tempo constante. Token ausente ou inválido → 401 sem tocar no banco.
- **Idempotência por evento:** cada notificação é gravada em `billing_events` pelo `id` (`evt_...`), que é único. Se o evento for reenviado, nada é reprocessado.
- **Payload inválido:** JSON malformado ou fora do formato esperado → log + 200 (para o Asaas não reenviar algo que nunca vai ser aceito).
- **Logs:** nunca logamos o payload inteiro, que pode conter dados do pagador. Os logs trazem só `eventId`, `event`, `paymentId` e `asaasSubscriptionId`.

### Eventos tratados

| Evento | Sem `payment.subscription` (avulso PIX) | Com `payment.subscription` (cartão) |
| :--- | :--- | :--- |
| `PAYMENT_CONFIRMED` / `PAYMENT_RECEIVED` | Credita `creditsGranted` do plano em `correction_credits` com `referenceId = payment.id` e envia e-mail de pagamento recebido. | Se a assinatura local existe: renova o período por 1 mês e promove `pendingPlanId` quando é downgrade/lateral ou o valor cobrado bate com o plano pendente. Uma assinatura local `canceled` não é reativada. Se não existe: cria a assinatura `active` para o dono resolvido e envia e-mail de pagamento recebido. |
| `PAYMENT_OVERDUE` | Apenas log (PIX avulso vencido). | Assinatura `active` sem cancelamento agendado → `past_due` + e-mail de falha de pagamento. Depois de 3 dias em `past_due`, `reconcile-subscription-status.ts` cancela a assinatura no Asaas e localmente. |
| `SUBSCRIPTION_DELETED` | — | Se fomos nós que cancelamos (`cancelAtPeriodEnd` ou já `canceled`), nada muda. Caso contrário (excluída pelo painel), vira `canceled` + e-mail de assinatura cancelada. |
| Outros | 200 + `console.warn`. | |

### Deduplicação CONFIRMED / RECEIVED

No cartão, o mesmo pagamento gera dois eventos: `PAYMENT_CONFIRMED` (aprovação) e, dias depois, `PAYMENT_RECEIVED` (liquidação). No PIX, chega só `PAYMENT_RECEIVED`. Cada evento grava `asaas_payment_id` em `billing_events`. Antes de aplicar créditos ou renovação, o webhook verifica se já existe outro evento `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED` processado para o mesmo `asaas_payment_id`. Se existir, só marca `processedAt` e encerra.

---

## 5. Pendências manuais

- [ ] **Cadastrar o webhook no painel** (sandbox e produção): Integrações → Webhooks. Usar uma URL HTTPS pública apontando para `/billing/webhook`, o mesmo token de `ASAAS_WEBHOOK_TOKEN` e os eventos `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE` e `SUBSCRIPTION_DELETED`.
- [ ] **Cadastrar o domínio do `WEB_URL`** nos dados comerciais da conta. O Asaas pode recusar `callback.successUrl` de domínios não cadastrados.
- [ ] **Chaves de API:** gerar uma chave de sandbox para dev e outra de produção para o deploy. Cada uma vai com o seu `ASAAS_API_BASE_URL`.
- [ ] **Validar o payload real:** fazer um pagamento na sandbox e conferir no log de webhooks do painel se `payment.subscription`, `payment.value` e `payment.externalReference` chegam como descrito acima.
