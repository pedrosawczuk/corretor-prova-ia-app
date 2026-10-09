# Code Patterns — Backend (Fastify & Drizzle ORM)

> **Propósito deste documento:** Este arquivo é a fonte de verdade para o desenvolvimento do Backend em `apps/api` e pacotes relacionados (`packages/db`).

---

## 1. Stack do Backend

| Item | Padrão |
|---|---|
| Runtime / Framework | Fastify |
| ORM | Drizzle ORM (`drizzle-orm/node-postgres`) em `packages/db` |
| Banco de Dados | PostgreSQL (conexão via `pg.Pool`) e Redis |
| Autenticação | `better-auth` integrado ao Drizzle |
| Validação de Entrada | Zod com `fastify-type-provider-zod` |
| Testes | Vitest com factories e banco de dados real |

---

## 2. Estrutura de Pastas (Vertical Slice Architecture)

```
apps/api/src/
  core/
    errors/
      app-error.ts                  # Classe abstrata base
      conflict-error.ts             # Erros específicos
      not-found-error.ts
      unauthorized-error.ts
      index.ts                      # Barrel export obrigatório
  modules/
    <modulo>/
      <acao>-<recurso>.ts           # 1 arquivo = 1 caso de uso (ex: create-exam.ts)
      <acao>-<recurso>.spec.ts      # Teste unitário/integração ao lado do arquivo
      <acao>-<recurso>-schema.ts    # Schema Zod de validação de body/params/query
      <modulo>-routes.ts            # Registro e mapa de rotas do módulo
  app.ts                            # Setup de plugins, rotas e error handler
  server.ts                         # Inicialização do servidor HTTP
```

**Regra Fundamental:** Não usamos separação tradicional de controller/service/repository. Cada caso de uso é um arquivo autocontido em `modules/<modulo>/` contendo a validação, regra de negócio e chamadas ao banco via Drizzle ORM.

---

## 3. Padrão de Caso de Uso (1 Arquivo = 1 Ação)

- Nome do arquivo: `<verbo>-<recurso>.ts` (kebab-case).
- Nome da função: camelCase com sufixo `Module` (ex: `createExamModule`).
- Validação de entrada via schema Zod.
- O acesso ao banco utiliza o client central importado de `@app/db`.
- Tabelas do Drizzle são nomeadas com sufixo `Table` (ex: `examsTable`, `classesTable`).

```typescript
// apps/api/src/modules/exams/create-exam.ts
import { db, eq, examsTable } from '@app/db'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConflictError } from '@/core/errors'
import type { CreateExamSchema } from './create-exam-schema'

export async function createExamModule(
  request: FastifyRequest<{ Body: CreateExamSchema }>,
  reply: FastifyReply,
) {
  const { title, classId, prompt } = request.body

  const [existing] = await db
    .select()
    .from(examsTable)
    .where(eq(examsTable.title, title))

  if (existing) throw new ConflictError('Já existe uma prova com este título')

  const [exam] = await db
    .insert(examsTable)
    .values({ title, classId, prompt })
    .returning()

  return reply.status(201).send(exam)
}
```

```typescript
// apps/api/src/modules/exams/exam-routes.ts — apenas mapa de rotas
import type { FastifyInstance } from 'fastify'
import { createExamModule } from './create-exam'
import { createExamSchema } from './create-exam-schema'

export function examRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { schema: { body: createExamSchema } },
    createExamModule,
  )
}
```

---

## 4. Transações no Banco de Dados

- Sempre que múltiplas tabelas precisam ser escritas de forma atômica, use `db.transaction(async (tx) => { ... })`.
- Dentro da transação, todo acesso ao banco usa a instância `tx`.
- Consultas que apenas validam permissões devem ficar fora e antes da transação.
- O rollback é automático ao lançar uma exceção (`throw`).

```typescript
await db.transaction(async (tx) => {
  const [newExam] = await tx.insert(examsTable).values(examData).returning()
  await tx.insert(questionsTable).values(
    questions.map((q) => ({ examId: newExam.id, ...q })),
  )
})
```

---

## 5. Tratamento de Erros e Barrel Exports

- Todos os erros estendem `AppError` e definem `statusCode` e `errorCode`.
- Erros são lançados diretamente com `throw` e tratados no `app.setErrorHandler` global.
- Todo erro deve ser reexportado por `src/core/errors/index.ts` e importado exclusivamente através do barrel `@/core/errors`.

```typescript
// core/errors/app-error.ts
export abstract class AppError extends Error {
  public readonly statusCode: number
  public readonly errorCode: string

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    Object.setPrototypeOf(this, AppError.prototype)
  }
}
```

---

## 6. Testes (Unitários com Mocks e Integração com Banco Real)

O `apps/api/vitest.config.ts` declara dois projetos Vitest (`test.projects`):

| Projeto | Arquivos | Banco | Comando |
| --- | --- | --- | --- |
| `unit` | `src/**/*.test.ts` | `@app/db` mockado | `pnpm --filter @app/api test:unit` |
| `integration` | `src/**/*.spec.ts` | PostgreSQL real (`TEST_DATABASE_URL`) | `pnpm --filter @app/api test:integration` |

`pnpm --filter @app/api test` roda os dois.

### 6.1 Testes unitários (`*.test.ts`)

- `apps/api/src/test/setup.ts` faz `vi.mock('@app/db')` global e importa `apps/api/src/test/mock-external-services.ts` (auth, e-mail, Redis).
- Queries são simuladas com `createDbChain` (`apps/api/src/test/create-db-chain.ts`).
- Dados em memória vêm das factories `make-<recurso>.ts` em `apps/api/src/test/factories/` (sem gravar nada).
- Use para lógica pura e para fluxos cujo comportamento não depende do banco.

### 6.2 Testes de integração (`*.spec.ts`)

- Com `NODE_ENV=test`, `@app/env` troca `DATABASE_URL` por `TEST_DATABASE_URL`. O processo aborta se ela estiver ausente, for igual a `DATABASE_URL` ou se o nome do banco não terminar em `_test`.
- `apps/api/src/test/integration-global-setup.ts` cria o banco (no mesmo Postgres do `docker-compose.dev.yml`) se ele não existir e aplica as migrations de `packages/db/drizzle` antes da suíte.
- `apps/api/src/test/integration-setup.ts` **não** mocka `@app/db`: só os serviços externos (`mock-external-services.ts`). Antes de cada teste roda `truncateDatabase()` (`TRUNCATE ... RESTART IDENTITY CASCADE` em todas as tabelas de `public`, após revalidar o sufixo `_test`).
- Como o truncate apaga também os planos da migration, cada teste cria os dados de que precisa.
- Dados são gravados pelas factories `insert-<recurso>.ts` em `apps/api/src/test/db-factories/` (função `insert<Recurso>(overrides)`, que retorna a linha inserida).
- O resultado é verificado consultando o banco com `db.select`.

```typescript
// apps/api/src/modules/admin/create-admin-subject.spec.ts
it('retorna 409 e não duplica quando já existe disciplina com o mesmo nome', async () => {
  await db.insert(subjectsTable).values({ name: 'História' })

  const response = await app.inject({
    method: 'POST',
    url: '/admin/subjects',
    payload: { name: 'História' },
  })

  expect(response.statusCode).toBe(409)

  const rows = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.name, 'História'))

  expect(rows).toHaveLength(1)
})
```

---

## 7. O que este projeto explicitamente NÃO faz (Backend)

- Não temos camada separada de controller/service/repository.
- Não fazemos `try/catch` manual em cada caso de uso.
- Não lançamos `Error` genérico sem `statusCode` e `errorCode`.
- Não importamos erros diretamente do arquivo individual fora da pasta `core/errors` — sempre pelo barrel.
- Não usamos sintaxe estilo Prisma (`db.recurso.findFirst()`) — apenas queries Drizzle padrão.
- Não mockamos o banco de dados nos testes de integração (`*.spec.ts`): eles sempre usam factories `insert-*` com banco real.
- Não realizamos escritas relacionadas fora de uma transação `db.transaction`.
