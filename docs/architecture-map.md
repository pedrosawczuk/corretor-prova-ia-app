# Mapa de Arquitetura do Monorepo

Visão estrutural de como os workspaces, configurações, migrations e scripts auxiliares se conectam. Complementa o grafo de conhecimento gerado pelo graphify em `graphify-out/` (veja a seção [Grafo de conhecimento](#grafo-de-conhecimento)).

---

## Workspaces

| Workspace | Pacote | Papel |
| :--- | :--- | :--- |
| `apps/api` | `apps/api/package.json` | API Fastify (módulos, casos de uso, billing Asaas, leitura OMR). |
| `apps/web` | `apps/web/package.json` | Front-end Next.js (rotas `(public)`, `(private)`, `(admin)`). |
| `packages/db` | `packages/db/package.json` | Schemas Drizzle, migrations SQL, seed de planos e script de migração. |
| `packages/env` | `packages/env/package.json` | Schemas Zod de variáveis de ambiente e `resolveDatabaseUrl`. |
| `packages/shared` | `packages/shared/package.json` | Tipos, schemas e constantes compartilhados entre API e Web. |
| `packages/ui` | `packages/ui/package.json` | Design system (`@app/ui`), estilos globais e setup de testes. |
| `packages/dayjs` | `packages/dayjs/package.json` | Instância configurada do dayjs (locale e plugins). |
| `packages/typescript-config` | `packages/typescript-config/package.json` | Configuração TypeScript base (`base.json`). |

A orquestração fica na raiz: `package.json` (scripts e husky), `turbo.json` (pipeline de tasks) e `biome.json` (lint e formatação).

---

## Configuração TypeScript

Todos os workspaces de biblioteca e a API estendem `@app/typescript-config/base.json`:

- `apps/api/tsconfig.json`
- `packages/db/tsconfig.json`
- `packages/env/tsconfig.json`
- `packages/shared/tsconfig.json`
- `packages/ui/tsconfig.json`
- `packages/dayjs/tsconfig.json`

`apps/web/tsconfig.json` é independente (gerado pelo Next.js, com plugin `next` e paths próprios).

---

## Estilos do Web

`apps/web/postcss.config.mjs` registra o plugin `@tailwindcss/postcss`, que processa `apps/web/src/app/globals.css` e os estilos globais de `packages/ui/src/styles/globals.css`.

---

## Testes do Design System

`packages/ui/vitest.config.ts` carrega `packages/ui/src/test/setup.ts`, que adiciona um polyfill de `Element.prototype.scrollIntoView` (ausente no jsdom e exigido pelos componentes de seleção/combobox).

---

## Migrations do Banco

`packages/db/drizzle.config.ts` gera as migrations em `packages/db/drizzle/` a partir de `packages/db/src/schema/index.ts`; `packages/db/src/migrate.ts` as aplica.

| Migration | Mudança | Schema afetado |
| :--- | :--- | :--- |
| `0000_acoustic_echo` | Cria `user`, `session`, `account`, `verification` (better-auth). | `users.ts`, `sessions.ts`, `accounts.ts`, `verifications.ts` |
| `0001_thick_richard_fisk` | IDs de auth passam a `text`; recria FKs. | `users.ts`, `sessions.ts`, `accounts.ts` |
| `0002_overjoyed_misty_knight` | Adiciona `account.issuer`. | `accounts.ts` |
| `0003_curious_black_widow` | Cria turmas, provas, questões, alternativas, submissões e enums de status. | `classrooms.ts`, `exams.ts`, `questions.ts`, `question-options.ts`, `submissions.ts` |
| `0004_late_lord_hawal` | Cria `audit_logs` e índices. | `audit-logs.ts` |
| `0005_normal_dragon_lord` | Cria `two_factor` e `user.two_factor_enabled`. | `two-factor.ts`, `users.ts` |
| `0006_sturdy_slyde` | Adiciona `user.phone_number`. | `users.ts` |
| `0007_add_admin_role_fields` | Campos de admin: `role`, `banned`, `impersonated_by`. | `users.ts`, `sessions.ts` |
| `0008_bizarre_hairball` | Cria `subjects` e `classrooms.subject_id`. | `subjects.ts`, `classrooms.ts` |
| `0009_sudden_eternals` | `classrooms.subject_id` obrigatório; remove `classrooms.subject`. | `classrooms.ts` |
| `0010_free_morlocks` | Adiciona `submission_answers.marked_option_id`. | `submission-answers.ts` |
| `0011_sad_smasher` | Metadados do gabarito: páginas e marcadores. | `exams.ts`, `question-options.ts` |
| `0012_chilly_steve_rogers` | Billing: planos, assinaturas, créditos, eventos e clientes. | `plans.ts`, `subscriptions.ts`, `correction-credits.ts`, `billing-events.ts`, `billing-customers.ts` |
| `0013_careful_electro` | Adiciona `plans.abacatepay_product_id` (legado da integração AbacatePay). | `plans.ts` |

---

## Auditoria de Segurança

`docs/security-audit/` contém o gerador do relatório em PDF:

- `generate_charts.py` produz os gráficos de severidade e categoria.
- `generate_report.py` monta o PDF consumindo esses gráficos.
- `verify_pdf.py` valida o PDF gerado.

---

## Grafo de conhecimento

O projeto é mapeado pelo [graphify](https://graphify.com). Saídas em `graphify-out/`:

- `GRAPH_REPORT.md` — god nodes, comunidades, conexões surpreendentes e perguntas sugeridas.
- `graph.html` — visualização interativa (abrir no navegador).
- `graph.json` — grafo completo para `graphify query`, `graphify path` e `graphify explain`.

Comandos úteis:

```bash
graphify query "como funciona o webhook do Asaas?"
graphify path "processSubmission" "submissionsTable"
graphify explain "readSubmissionAnswers"
graphify update .        # após mudanças de código (só AST, sem custo de LLM)
```

Após mudanças em documentação, rode `/graphify . --update` no Claude Code para reextrair a camada semântica.
