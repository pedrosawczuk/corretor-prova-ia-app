# TASKS.md

## Status
Em andamento: nenhuma
Concluídas: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
Bloqueadas: nenhuma

## Feature: Remediação da Auditoria de Segurança (`full-audit-run-2`)

### Contexto

Plano de remediação baseado na auditoria completa `C:\Users\pedroh.monteiro\security-audit-skill\full-audit-run-2` (`REPORT.md`, `FINDINGS-DETAIL.md` e `NEEDS-VALIDATION.md`, referência de commit `1ad6d946b35c6daeb1f8429724403492a540420a`).

**Escopo acordado:** todos os **9 achados confirmados** (2 High, 7 Medium) + os **2 leads de `NEEDS-VALIDATION.md`** tratados com fix defensivo e teste de regressão (11 tarefas no total). Os itens informativos de *Hardening Notes* (seção 6 do `REPORT.md`) ficaram fora deste ciclo.

**Decisões de arquitetura/produto definidas:**
- **`GABARITA-SUBMISSIONS-REPROCESS-STATE-QUOTA-BYPASS`:** bloquear troca de páginas e reprocessamento em submissões `needs_review` e `completed` (o professor utiliza o fluxo de revisão manual existente).
- **`GABARITA-BILLING-QUOTA-RESET-VIA-CLASSROOM-CASCADE-DELETE`:** manter hard delete de turmas/provas e criar tabela imutável `correction_usage_logs` ligada a `userId` para contabilizar a cota mensal sem reset por `ON DELETE CASCADE`.
- **`GABARITA-AUTH-DELETE-ACCOUNT-NO-STEP-UP`:** delegar a exclusão de conta para `auth.api.deleteUser` do Better Auth (`user.deleteUser.enabled: true`), exigindo sessão recente + senha atual (contas com senha) ou confirmação por e-mail (contas apenas OAuth/Google), ajustando a UI correspondente.
- **Leads de `NEEDS-VALIDATION.md`:** implementar diretamente as proteções defensivas (checagem de dimensões no header HEIC antes do `heicConvert`, limite de páginas por `exam.templatePageCount` e limite de concorrência na leitura por IA) acompanhadas de testes automatizados de regressão.

**Caminho crítico e paralelismo:** as trilhas **A (Auth & Admin)**, **B (Billing & Grants)** e **C (Storage & Submissions/IA)** atuam em módulos independentes e podem ser executadas em paralelo. Dentro de cada trilha, tarefas que editam os mesmos arquivos estão sequenciadas.

**Conflitos de arquivo sinalizados (não executar em paralelo dentro da mesma trilha):**
- `apps/api/src/lib/auth/guard-admin-auth-routes.ts` é editado em **1** e **2**.
- `apps/api/src/lib/auth/auth.ts` é editado em **2**, **3** e **4**.
- `apps/api/src/modules/billing/assert-correction-quota-available.ts` é editado em **6** e **7**.
- `apps/api/src/modules/submissions/process-submission.ts` é editado em **9** e **11**.
- `apps/api/src/modules/submissions/upload-submission-page.ts` é editado em **10** e **11**.

---

### Tarefas

**Trilha A — Autenticação, Admin Step-Up e Ciclo de Conta**

- [x] 1. [HIGH] Normalizar URL antes dos guards de `/api/auth/admin/*` e rotas sensíveis (`GABARITA-AUTH-ADMIN-GUARD-PATH-NORMALIZATION-BYPASS`)
  - O que fazer: em `apps/api/src/app.ts` e `apps/api/src/lib/auth/guard-admin-auth-routes.ts`, canonicalizar o `pathname` da requisição via parser WHATWG `new URL(request.url, 'http://localhost')` (colapsando barras consecutivas) antes de avaliar `isAdminAuthRoute` e `SENSITIVE_AUTH_PATH_PATTERN` (`apps/api/src/lib/http/sensitive-auth-paths.ts`), ou rejeitar com `400`/`403` qualquer requisição `/api/auth/*` contendo dot-segments (`/./`, `/../`) ou barras duplicadas antes de repassar ao `toNodeHandler(auth)`. Garantir que `guardAdminAuthRoute` e `recordAdminAuthAuditLog` não possam ser contornados por caminhos como `/api/auth/./admin/set-role` ou `/api/auth/x/../admin/impersonate-user`.
  - Arquivos: `apps/api/src/app.ts`, `apps/api/src/lib/auth/guard-admin-auth-routes.ts`, `apps/api/src/lib/http/sensitive-auth-paths.ts`
  - Pronto quando: requisições para `/api/auth/./admin/*` e `/api/auth/x/../admin/*` com sessão admin sem 2FA ou >30 min são bloqueadas com 403 (ou rejeitadas antes do Better Auth) e operações válidas continuam gravando em `audit_logs`; teste automatizado cobre caminhos com dot-segments e barras duplicadas.
  - Depende de: nenhuma

- [x] 2. [MEDIUM] Vincular verificação explícita de 2FA à sessão nos guards de admin (`GABARITA-AUTH-ADMIN-STEP-UP-2FA-ASSURANCE-BYPASS`)
  - O que fazer: hoje `getAuthenticatedAdmin` e `guardAdminAuthRoute` checam apenas `user.twoFactorEnabled === true` e `session.createdAt <= 30 min`, permitindo que login via Google OAuth ou cookie `better-auth.trust_device` crie uma sessão recente sem desafio 2FA. Registrar estado/timestamp explícito de verificação 2FA vinculado ao `session.id` quando `/two-factor/verify-totp` ou `/two-factor/verify-otp` for concluído com sucesso (em coluna dedicada na tabela `sessions` ou registro vinculado em `verifications`/Redis com TTL), e exigir essa comprovação de 2FA da sessão atual dentro da janela de 30 minutos em `getAuthenticatedAdmin` e `guardAdminAuthRoute`.
  - Arquivos: `apps/api/src/lib/auth/auth.ts`, `apps/api/src/lib/auth/get-authenticated-admin.ts`, `apps/api/src/lib/auth/guard-admin-auth-routes.ts`, `packages/db/src/schema/sessions.ts` (se usar coluna em `sessions`, com migration)
  - Pronto quando: uma sessão admin recém-criada via Google OAuth ou `trust_device` sem verificação TOTP/OTP naquela sessão recebe 403 em `/admin/*` e `/api/auth/admin/*`; após completar 2FA na sessão, o acesso funciona por 30 minutos; teste automatizado cobre o bypass e o fluxo válido.
  - Depende de: 1

- [x] 3. [MEDIUM] Revogar sessões existentes ao redefinir senha (`GABARITA-AUTH-PASSWORD-RESET-NO-SESSION-REVOCATION`)
  - O que fazer: em `apps/api/src/lib/auth/auth.ts`, adicionar `revokeSessionsOnPasswordReset: true` dentro da configuração `emailAndPassword` passada para `betterAuth(...)`, garantindo que todas as sessões ativas (até 30 dias) sejam invalidadas no banco quando o usuário concluir `/auth/reset-password` (ou `/api/auth/reset-password`).
  - Arquivos: `apps/api/src/lib/auth/auth.ts`, `apps/api/src/modules/auth/reset-password.test.ts` (ou spec correspondente)
  - Pronto quando: após concluir um reset de senha com token válido, cookies de sessão emitidos antes do reset retornam `401` em rotas autenticadas e `GET /api/auth/get-session` retorna `null`; teste automatizado valida a revogação.
  - Depende de: 2

- [x] 4. [MEDIUM] Exigir step-up na exclusão de conta via `auth.api.deleteUser` (`GABARITA-AUTH-DELETE-ACCOUNT-NO-STEP-UP`)
  - O que fazer: habilitar `user.deleteUser.enabled: true` em `apps/api/src/lib/auth/auth.ts` (configurando `sendDeleteAccountVerification` para contas apenas OAuth/Google e `freshAge` adequado para sessão recente) e delegar `deleteAccountModule` (`apps/api/src/modules/auth/delete-account.ts`) para `auth.api.deleteUser`, removendo o `db.delete(userTable)` direto sem verificação de senha/frescor. Atualizar o schema (`packages/shared`) e o componente `apps/web/src/components/dashboard/configuracoes/deletar-conta-section.tsx` para coletar a senha atual (quando aplicável) ou iniciar o fluxo de confirmação por e-mail para contas OAuth.
  - Arquivos: `apps/api/src/lib/auth/auth.ts`, `apps/api/src/modules/auth/delete-account.ts`, `packages/shared/src/schemas/auth/` (schema de delete-account), `apps/web/src/components/dashboard/configuracoes/deletar-conta-section.tsx`
  - Pronto quando: chamar `POST /auth/delete-account` apenas com `{ email }` e sessão antiga ou sem senha/token de verificação falha; contas com senha exigem senha atual + sessão recente e contas OAuth exigem verificação por e-mail/sessão recente; testes automatizados cobrem os dois cenários.
  - Depende de: 3

**Trilha B — Billing, Cotas e Cortesias (`access_grants`)**

- [x] 5. [MEDIUM] Persistir reivindicação e revogação em `privileged_emails` (`GABARITA-ACCESS-GRANTS-PRIVILEGED-EMAIL-RECLAIM-ON-ACCOUNT-DELETE`)
  - O que fazer: adicionar colunas `claimedAt` e `revokedAt` (timestamp, nullable) em `packages/db/src/schema/privileged-emails.ts` (com migration). Em `claimAccessGrant` (`apps/api/src/modules/access-grants/claim-access-grant.ts`), fazer `UPDATE ... WHERE email = ... AND claimedAt IS NULL AND revokedAt IS NULL` atomicamente em transação antes de inserir o registro em `access_grants`. Em `revokeAccessGrantModule` (`apps/api/src/modules/access-grants/revoke-access-grant.ts`), quando a cortesia revogada tiver origem `privileged_email`, marcar `revokedAt = now` na linha correspondente de `privileged_emails`.
  - Arquivos: `packages/db/src/schema/privileged-emails.ts`, `apps/api/src/modules/access-grants/claim-access-grant.ts`, `apps/api/src/modules/access-grants/revoke-access-grant.ts`, `apps/api/src/modules/access-grants/claim-access-grant.spec.ts`
  - Pronto quando: um usuário com e-mail em `privileged_emails` que deletar a conta e se recadastrar não recebe uma nova cortesia de 3 meses Pro, nem após revogação administrativa; teste automatizado cobre re-cadastro após expiração/exclusão e após revogação.
  - Depende de: nenhuma

- [x] 6. [MEDIUM] Bloquear uso de assinaturas expiradas não reconciliadas (`GABARITA-BILLING-EXPIRED-SUBSCRIPTION-UNRECONCILED-QUOTA-BYPASS`)
  - O que fazer: em `assertCorrectionQuotaAvailable` (`apps/api/src/modules/billing/assert-correction-quota-available.ts`) e `assertDocxExportAllowed` (`apps/api/src/modules/billing/assert-docx-export-allowed.ts`), filtrar assinaturas ativas exigindo `gt(subscriptionsTable.currentPeriodEnd, now)` (ou executar `reconcileSubscriptionStatus` dentro da transação antes de checar entitlements quando `cancelAtPeriodEnd = true` e `currentPeriodEnd <= now`). Garantir que após `currentPeriodEnd`, mesmo sem chamada prévia a `GET /billing/status`, submissões não passem pela cota da assinatura expirada e exportação DOCX seja bloqueada.
  - Arquivos: `apps/api/src/modules/billing/assert-correction-quota-available.ts`, `apps/api/src/modules/billing/assert-docx-export-allowed.ts`, testes unitários/integração de billing
  - Pronto quando: com assinatura `status = 'active'`, `cancelAtPeriodEnd = true` e `currentPeriodEnd` no passado (sem chamar `GET /billing/status`), `POST /exams/:examId/submissions` não usa mais a cota da assinatura expirada e `GET /exams/:examId/export/docx` retorna erro de plano/pagamento; teste automatizado cobre ambos os endpoints.
  - Depende de: nenhuma

- [x] 7. [MEDIUM] Contabilizar cota mensal em tabela imutável `correction_usage_logs` (`GABARITA-BILLING-QUOTA-RESET-VIA-CLASSROOM-CASCADE-DELETE`)
  - O que fazer: criar schema `packages/db/src/schema/correction-usage-logs.ts` (exportado em `packages/db/src/schema/index.ts`, com migration) contendo `id`, `userId` (FK para `users` ou sem cascade de turma/prova), `submissionId` (nullable/sem cascade delete), `billingPeriodStart`, `createdAt`, indexado por `(userId, createdAt)`. Em `createSubmissionModule` (`apps/api/src/modules/submissions/create-submission.ts`), inserir um registro em `correction_usage_logs` dentro da mesma transação quando a submissão consumir cota mensal. Atualizar `assertCorrectionQuotaAvailable` e `getBillingStatusModule` (`apps/api/src/modules/billing/get-billing-status.ts`) para contar `correctionsUsed` a partir de `correction_usage_logs` em vez de `submissionsTable`.
  - Arquivos: `packages/db/src/schema/correction-usage-logs.ts` (novo), `packages/db/src/schema/index.ts`, `apps/api/src/modules/submissions/create-submission.ts`, `apps/api/src/modules/billing/assert-correction-quota-available.ts`, `apps/api/src/modules/billing/get-billing-status.ts`
  - Pronto quando: atingir o limite mensal, deletar a turma (`DELETE /classrooms/:id`), criar nova turma/prova e tentar criar nova submissão continua bloqueado pela cota já consumida no período; teste automatizado valida que `correctionsUsed` permanece inalterado após `DELETE /classrooms/:id`.
  - Depende de: 6

**Trilha C — Storage (MinIO) e Integridade de Submissões/IA**

- [x] 8. [MEDIUM] Escopar chaves de avatar por `userId` e validar ownership na deleção (`GABARITA-STORAGE-ARBITRARY-OBJECT-DELETE`)
  - O que fazer: em `uploadAvatarModule` (`apps/api/src/modules/auth/upload-avatar.ts`), passar a gravar avatares sob `avatars/${userId}/${uuid}.webp` (e bloquear/ignorar remoção caso `previousImage` não pertença ao usuário). Em `deleteObjectByPublicUrl` (`apps/api/src/lib/storage/storage.ts`), exigir `userId` como parâmetro obrigatório e validar via regex estrita que a chave extraída casa exatamente com `^avatars/${userId}/[0-9a-f-]+\.webp$` (sem dot-segments ou barras extras) antes de chamar `storageClient.removeObject`.
  - Arquivos: `apps/api/src/lib/storage/storage.ts`, `apps/api/src/modules/auth/upload-avatar.ts`, testes de storage/avatar
  - Pronto quando: definir `user.image` via `/api/auth/update-user` para a URL do avatar de outro usuário e enviar `POST /auth/upload-avatar` nunca remove o objeto do outro usuário no MinIO; apenas objetos sob `avatars/${callerUserId}/` podem ser removidos; teste automatizado cobre tentativa cross-user e dot-segments.
  - Depende de: nenhuma

- [x] 9. [HIGH] Bloquear edição de páginas e reprocessamento em `needs_review` e `completed` (`GABARITA-SUBMISSIONS-REPROCESS-STATE-QUOTA-BYPASS`)
  - O que fazer: incluir `'needs_review'` em `NON_EDITABLE_SUBMISSION_STATUSES` (`apps/api/src/modules/submissions/non-editable-submission-statuses.ts`) para impedir `POST`/`DELETE`/reordenação de páginas após a correção. Em `processSubmissionModule` (`apps/api/src/modules/submissions/process-submission.ts`), restringir a transição de estado para aceitar apenas `'pending_processing'` ou `'failed'` (rejeitando `'needs_review'` e `'completed'` com `ConflictError`/`BadRequestError` antes de baixar páginas ou chamar a IA).
  - Arquivos: `apps/api/src/modules/submissions/non-editable-submission-statuses.ts`, `apps/api/src/modules/submissions/process-submission.ts`, testes de submissão
  - Pronto quando: após uma submissão atingir `'needs_review'`, chamadas a `DELETE /submissions/:id/pages/:pageId`, `POST /submissions/:id/pages` e `POST /submissions/:id/process` são rejeitadas; o fluxo de revisão manual (`review-submission-answer`) continua funcionando normalmente; teste automatizado cobre a tentativa de reprocessamento.
  - Depende de: nenhuma

- [x] 10. [NEEDS VALIDATION] Validar dimensões do header HEIC/HEIF antes de `heicConvert` (`GABARITA-SUBMISSIONS-HEIC-PRE-SHARP-DECODE-AMPLIFICATION`)
  - O que fazer: em `uploadSubmissionPageModule` (`apps/api/src/modules/submissions/upload-submission-page.ts`), inspecionar as dimensões do frame HEIC/HEIF (via parser de boxes ISOBMFF `ispe` no buffer ou metadados antes de `decodeToJpegCompatibleBuffer`) e rejeitar com `BadRequestError` se `width * height > MAX_INPUT_PIXELS` (`30_000_000`) antes de invocar `heicConvert` (que decodifica RGBA em WASM + `jpeg-js` síncrono sem limite). Se as dimensões não puderem ser lidas com segurança do container, rejeitar a imagem.
  - Arquivos: `apps/api/src/modules/submissions/upload-submission-page.ts`, `apps/api/src/modules/submissions/upload-submission-page.test.ts`
  - Pronto quando: um payload HEIC/HEIF com header declarando dimensões acima de `30_000_000` pixels é rejeitado imediatamente antes de `heicConvert` ser chamado; imagens HEIC válidas dentro do limite continuam funcionando; teste automatizado em `upload-submission-page.test.ts` cobre o caso.
  - Depende de: nenhuma

- [x] 11. [NEEDS VALIDATION] Limitar páginas por `exam.templatePageCount` e concorrência na leitura por IA (`GABARITA-SUBMISSIONS-UNBOUNDED-PAGE-CARDINALITY`)
  - O que fazer: em `uploadSubmissionPageModule` (`apps/api/src/modules/submissions/upload-submission-page.ts`), dentro de transação com lock na submissão pai, verificar que `existingPages.length < exam.templatePageCount` antes de inserir nova página (e adicionar constraint única `(submission_id, page_number)` em `packages/db/src/schema/submission-pages.ts` se ainda não existir). Em `processSubmissionModule` (`apps/api/src/modules/submissions/process-submission.ts`), rejeitar se `pages.length > exam.templatePageCount`. Em `readAnswersWithAi` (`apps/api/src/modules/submissions/read-answers-with-ai.ts`), limitar a concorrência de chamadas `readPageMarkedAnswers` (ex: pool/semáforo com limite fixo por execução) em vez de disparar `2 * pages.length` em `Promise.all` irrestrito.
  - Arquivos: `apps/api/src/modules/submissions/upload-submission-page.ts`, `apps/api/src/modules/submissions/process-submission.ts`, `apps/api/src/modules/submissions/read-answers-with-ai.ts`, `packages/db/src/schema/submission-pages.ts`, `apps/api/src/modules/submissions/upload-submission-page.test.ts`
  - Pronto quando: tentar enviar mais páginas do que `exam.templatePageCount` retorna erro tratado (400/409); `processSubmissionModule` rejeita submissões com excesso de páginas; `readAnswersWithAi` respeita o limite de concorrência; testes automatizados cobrem o limite de páginas e concorrência.
  - Depende de: 9, 10
