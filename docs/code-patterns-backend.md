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

## 6. Testes com Banco Real (Factories, sem Mocks)

- Não usamos mocks (`vi.mock`) para chamadas de banco de dados.
- Testes rodam contra o banco PostgreSQL de testes real (`TEST_DATABASE_URL`).
- Dados de teste são gerados através de **factories** com `@faker-js/faker` localizadas em `packages/db/tests/factories/make-<recurso>.ts`.
- O arquivo `setup.ts` roda um `TRUNCATE CASCADE` antes de cada teste (`beforeEach`).

```typescript
// apps/api/src/modules/exams/create-exam.spec.ts
import { makeClass } from '@app/db/tests/factories/make-class'

it('deve criar uma prova com sucesso', async () => {
  const schoolClass = await makeClass()

  const response = await app.inject({
    method: 'POST',
    url: '/exams',
    payload: { classId: schoolClass.id, title: 'História Geral' },
  })

  expect(response.statusCode).toBe(201)
})
```

---

## 7. O que este projeto explicitamente NÃO faz (Backend)

- Não temos camada separada de controller/service/repository.
- Não fazemos `try/catch` manual em cada caso de uso.
- Não lançamos `Error` genérico sem `statusCode` e `errorCode`.
- Não importamos erros diretamente do arquivo individual fora da pasta `core/errors` — sempre pelo barrel.
- Não usamos sintaxe estilo Prisma (`db.recurso.findFirst()`) — apenas queries Drizzle padrão.
- Não usamos mocks de banco de dados nos testes — sempre factories com banco real.
- Não realizamos escritas relacionadas fora de uma transação `db.transaction`.
