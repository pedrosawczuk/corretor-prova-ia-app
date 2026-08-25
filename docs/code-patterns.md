# Code Patterns — Padrões de Código do Projeto

> **Propósito deste documento:** este arquivo é a fonte de verdade que qualquer agente de IA (Copilot, Claude, Cursor, etc.) deve ler ANTES de gerar, revisar ou refatorar código neste repositório. Ele não descreve o que o sistema faz — descreve COMO o código deve ser escrito. Sempre que houver conflito entre "o que parece idiomático em geral" e "o que está aqui", este documento vence.

---

## 1. Como usar este arquivo (instruções para o agente)

- Antes de escrever qualquer código novo, releia as seções relevantes à tarefa.
- Ao gerar código, prefira copiar a *forma* dos exemplos abaixo (nomes, ordem de camadas, tratamento de erro) em vez de inventar uma estrutura nova.
- Os nomes usados nos exemplos (`users`, `address`, `menu-item`, `ConflictError`, etc.) são apenas ilustrações da forma — aplique o mesmo padrão estrutural a qualquer módulo/recurso real do projeto, trocando os nomes conforme o domínio.
- Se uma tarefa exigir um padrão não coberto aqui, sinalize isso explicitamente na resposta ao invés de decidir silenciosamente — e proponha adicionar o novo padrão a este documento.
- Nunca "corrija" um padrão documentado aqui achando que é uma boa prática melhor, sem perguntar antes.

---

## 2. Stack e convenções gerais

| Item | Padrão |
|---|---|
| Linguagem | TypeScript / Node.js |
| Runtime / Framework | Fastify |
| Test runner | Vitest (`*.spec.ts` colocado ao lado do arquivo testado) |
| Validação | Zod (schemas em arquivos `*-schema.ts` separados) |
| Gerenciador de pacotes | pnpm |
| Estilo de módulo | ESM |
| Formatação | BiomeJS — regras em `biome.json` |
| Linguagem de commits/comentários | Português |
| Nomenclatura de arquivos | kebab-case |
| Nomenclatura de variáveis/funções | camelCase |
| Nomenclatura de classes/tipos | PascalCase |
| Nomenclatura de constantes globais | UPPER_SNAKE_CASE |

---

## 3. Estrutura de pastas

```
src/
  core/
    errors/
      app-error.ts          # classe base
      <dominio>-conflict-error.ts   # erro específico de domínio quando fizer sentido
      unauthorized-error.ts
      index.ts               # barrel — re-exporta todos os erros
  modules/
    <nome-do-modulo>/
      <acao>-<recurso>.ts           # 1 arquivo = 1 caso de uso (ex: create-menu-item.ts)
      <acao>-<recurso>.spec.ts      # teste colocado ao lado, mesmo nome
      <acao>-<recurso>-schema.ts    # schema Zod do caso de uso, quando o body/query precisa de validação própria
      <nome-do-modulo>-routes.ts    # registra as rotas do módulo e liga cada uma ao seu caso de uso
  utils/
    schemas/
      <recurso>-id-schema.ts        # schemas reutilizáveis entre módulos (ids, paginação)
  tests/
    setup.ts
  app.ts
  server.ts
```

**Regra:** não há camada controller/service/repository separada. Cada caso de uso é um arquivo autocontido em `modules/<modulo>/` — request, regra de negócio e chamada ao banco (via ORM) vivem juntos nesse arquivo. O `-routes.ts` do módulo é só o "mapa": liga método+path ao arquivo de caso de uso correspondente, sem lógica.

---

## 4. Padrão de caso de uso (1 arquivo = 1 ação)

> O módulo `users`/`address` abaixo é só um exemplo da forma — o mesmo padrão (arquivo por ação, rotas separadas, schemas Zod, sufixo `Module`) se aplica a qualquer módulo/recurso do projeto.

Não usamos separação controller/service/repository. Cada ação de um módulo (`create-x`, `get-x`, `list-x`, `update-x`, `delete-x`, `cancel-x`) é uma função exportada em seu próprio arquivo, tipada com os generics do Fastify. A validação de entrada acontece via schema Zod (inline se for simples, ou em `<acao>-<recurso>-schema.ts` se for reutilizado/complexo).

- O nome do arquivo é `<verbo>-<recurso>.ts` (kebab-case). O nome da função exportada é o mesmo em camelCase, com sufixo `Module` (ex: `createUserAddressModule`).
- A função recebe `FastifyRequest<{ Body/Params/Querystring: X }>` e `FastifyReply` tipados.
- Regra de negócio (checar duplicidade, checar permissão, etc.) fica dentro da própria função, lançando os erros de `core/errors` quando aplicável — não há camada de service separada para isso.
- O acesso ao banco (Prisma/ORM) é chamado diretamente dentro da função do caso de uso.
- O arquivo `-routes.ts` do módulo apenas importa cada caso de uso e registra a rota — zero lógica ali.

```typescript
// modules/users/create-user-address.ts
export async function createUserAddressModule(
  request: FastifyRequest<{ Body: CreateUserAddressBody }>,
  reply: FastifyReply
) {
  const { userId, street, city } = request.body;

  const existing = await db.address.findFirst({ where: { userId, street } });
  if (existing) throw new AddressConflictError();

  const address = await db.address.create({ data: { userId, street, city } });

  return reply.status(201).send(address);
}
```

```typescript
// app.ts — registra o módulo com prefixo de rota
app.register(userRoutes, { prefix: '/users' })
```

```typescript
// modules/users/user-routes.ts — apenas o mapa, sem lógica
export function userRoutes(app: FastifyInstance) {
	app.get(
		'/:userId/address',
		{ schema: { params: userIdSchema, querystring: paginationQuerySchema } },
		listUserAddressModule,
	)
	app.put(
		'/:userId/address/:addressId',
		{
			schema: {
				params: z.intersection(userIdSchema, addressIdSchema),
				body: updateUserAddressSchema,
			},
		},
		updateUserAddressModule,
	)
	app.post(
		'/:userId/address',
		{
			schema: {
				params: userIdSchema,
				body: createUserAddressSchema,
			},
		},
		createUserAddressModule,
	)
	app.delete(
		'/:userId/address/:addressId',
		{
			schema: {
				params: z.intersection(userIdSchema, addressIdSchema),
			},
		},
		deleteUserAddresModule,
	)
}
```

- Prefixo do módulo (`/users`) é definido uma vez no `app.register`, nunca repetido dentro de cada rota do `-routes.ts`.
- Params compostos por mais de um schema reutilizável (ex: `userIdSchema` + `addressIdSchema`) são combinados com `z.intersection`, não reescritos manualmente.
- Cada método HTTP tem seu próprio objeto `schema` com `params`/`querystring`/`body` conforme o que a rota precisa — nunca todos juntos por padrão.
- O nome da função do caso de uso importada nas rotas leva o sufixo `Module` (ex: `createUserAddressModule`).

---

## 5. Tratamento de erros

- Todos os erros de negócio vivem em `src/core/errors/` e estendem `AppError` (classe abstrata). Nunca `throw new Error('string')` solto.
- `AppError` guarda `statusCode` e `errorCode` — todo erro de negócio tem os dois, não só uma mensagem.
- Erros genéricos e reutilizáveis (`NotFoundError`, `ConflictError`, `UnauthorizedError`) ficam em `core/errors/` na raiz, um arquivo por erro.
- Erro específico de um domínio (ex: `AddressConflictError`) também vive em `core/errors/`, um arquivo por erro.
- Exportações de `core/errors/` seguem o **barrel pattern**: tudo é re-exportado por um `index.ts`, e o resto do código sempre importa de `core/errors` (o barrel), nunca do arquivo individual do erro. Esse mesmo padrão vale para qualquer pasta com múltiplas exportações específicas relacionadas (ex: `utils/schemas/index.ts`).
- Dentro do caso de uso, o erro é lançado com `throw`, sem `try/catch` local — o handler de erro do Fastify (`app.setErrorHandler`) é quem converte `AppError` em resposta HTTP.

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

```typescript
// core/errors/conflict-error.ts
import { AppError } from './app-error'

export class ConflictError extends AppError {
	constructor(message = 'Conflict') {
		super(message, 409, 'CONFLICT')
	}
}
```

```typescript
// core/errors/index.ts — barrel
export * from './app-error'
export * from './conflict-error'
export * from './not-found-error'
export * from './unauthorized-error'

// uso dentro de um caso de uso — sempre importando do barrel
import { ConflictError } from '@/core/errors'

const existing = await db.address.findFirst({ where: { userId, street } })
if (existing) throw new ConflictError('Endereço já cadastrado')
```

---

## 6. Nomenclatura e assinatura de funções

- Funções assíncronas que buscam dados começam com `find`/`get`; as que persistem, com `create`/`update`/`delete`.
- Booleans começam com `is`/`has`/`should`.
- Evitar parâmetros posicionais quando houver mais de 2 argumentos — usar objeto de opções tipado.

```typescript
// ❌
function createOrder(userId: string, items: Item[], coupon: string, isGift: boolean) {}

// ✅
function createOrder(params: CreateOrderParams) {}
```

---

## 7. Tipagem

- `any` é proibido. `unknown` também não é usado como saída — toda tipagem vem de schema Zod, nunca de `unknown` + narrowing manual.
- Toda entrada de API (body/query/params) tem um schema Zod em arquivo próprio (`*-schema.ts`), que também gera o tipo via `z.infer` — não duplicar tipo manualmente.

```typescript
// create-user-schema.ts
export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
```

---

## 8. Testes

- Framework: Vitest.
- Todo caso de uso novo (`<acao>-<recurso>.ts`) tem seu `<acao>-<recurso>.spec.ts` colocado no mesmo diretório, ao lado do arquivo — não em uma pasta `__tests__/` separada.
- Setup global de teste fica em `src/tests/setup.ts`.
- Padrão AAA (Arrange, Act, Assert) nos testes.
- Nomes de teste descrevem comportamento, não implementação: `"deve lançar NotFoundError quando usuário não existe"`, não `"testa findById"`.

---

## 9. Comentários e documentação

- Não usamos comentários no código, com uma única exceção: `// TODO:` e `// FIXME:` são permitidos para marcar pendência ou problema conhecido — não para explicar lógica.
- Se sentir necessidade de comentar para explicar o "porquê" de algo, é sinal de que o nome da função/variável precisa melhorar, ou que a lógica deveria ser quebrada em uma função com nome descritivo — não de que falta um comentário.

---

## 10. Coisas que este projeto explicitamente NÃO faz

- Não usamos `any` nem `unknown` para tipar entrada/saída — sempre Zod, em arquivo de schema próprio.
- Não usamos `moment.js` — `day.js` apenas.
- Não usamos `export default` — sempre named exports.
- Não temos camada separada de controller/service/repository — cada caso de uso é um arquivo autocontido (ver seção 4).
- Não fazemos `try/catch` manual em cada caso de uso — o erro é lançado (`throw`) e tratado centralmente pelo error handler do Fastify.
- Não lançamos `Error` genérico — sempre uma subclasse de `AppError` vinda de `core/errors`.
- Não criamos erro sem `statusCode` e `errorCode` — os dois são obrigatórios no construtor de `AppError`.
- Não importamos direto do arquivo individual de um erro (ex: `from './conflict-error'`) fora da pasta `core/errors` — sempre pelo barrel (`from '@/core/errors'`).
- Não escrevemos comentários no código, exceto `// TODO:` e `// FIXME:` para marcar pendência/problema conhecido — nunca para explicar lógica. Nome ruim vira refactor, não comentário.# Code Patterns — Padrões de Código do Projeto

> **Propósito deste documento:** este arquivo é a fonte de verdade que qualquer agente de IA (Copilot, Claude, Cursor, etc.) deve ler ANTES de gerar, revisar ou refatorar código neste repositório. Ele não descreve o que o sistema faz — descreve COMO o código deve ser escrito. Sempre que houver conflito entre "o que parece idiomático em geral" e "o que está aqui", este documento vence.

---

## 1. Como usar este arquivo (instruções para o agente)

- Antes de escrever qualquer código novo, releia as seções relevantes à tarefa.
- Ao gerar código, prefira copiar a *forma* dos exemplos abaixo (nomes, ordem de camadas, tratamento de erro) em vez de inventar uma estrutura nova.
- Os nomes usados nos exemplos (`users`, `address`, `menu-item`, `ConflictError`, etc.) são apenas ilustrações da forma — aplique o mesmo padrão estrutural a qualquer módulo/recurso real do projeto, trocando os nomes conforme o domínio.
- Se uma tarefa exigir um padrão não coberto aqui, sinalize isso explicitamente na resposta ao invés de decidir silenciosamente — e proponha adicionar o novo padrão a este documento.
- Nunca "corrija" um padrão documentado aqui achando que é uma boa prática melhor, sem perguntar antes.

---

## 2. Stack e convenções gerais

| Item | Padrão |
|---|---|
| Linguagem | TypeScript / Node.js |
| Runtime / Framework | Fastify |
| Test runner | Vitest (`*.spec.ts` colocado ao lado do arquivo testado) |
| Validação | Zod (schemas em arquivos `*-schema.ts` separados) |
| Gerenciador de pacotes | pnpm |
| Estilo de módulo | ESM |
| Formatação | BiomeJS — regras em `biome.json` |
| Linguagem de commits/comentários | Português |
| Nomenclatura de arquivos | kebab-case |
| Nomenclatura de variáveis/funções | camelCase |
| Nomenclatura de classes/tipos | PascalCase |
| Nomenclatura de constantes globais | UPPER_SNAKE_CASE |

---

## 3. Estrutura de pastas

```
src/
  core/
    errors/
      app-error.ts          # classe base
      <dominio>-conflict-error.ts   # erro específico de domínio quando fizer sentido
      unauthorized-error.ts
      index.ts               # barrel — re-exporta todos os erros
  modules/
    <nome-do-modulo>/
      <acao>-<recurso>.ts           # 1 arquivo = 1 caso de uso (ex: create-menu-item.ts)
      <acao>-<recurso>.spec.ts      # teste colocado ao lado, mesmo nome
      <acao>-<recurso>-schema.ts    # schema Zod do caso de uso, quando o body/query precisa de validação própria
      <nome-do-modulo>-routes.ts    # registra as rotas do módulo e liga cada uma ao seu caso de uso
  utils/
    schemas/
      <recurso>-id-schema.ts        # schemas reutilizáveis entre módulos (ids, paginação)
  tests/
    setup.ts
  app.ts
  server.ts
```

**Regra:** não há camada controller/service/repository separada. Cada caso de uso é um arquivo autocontido em `modules/<modulo>/` — request, regra de negócio e chamada ao banco (via ORM) vivem juntos nesse arquivo. O `-routes.ts` do módulo é só o "mapa": liga método+path ao arquivo de caso de uso correspondente, sem lógica.

---

## 4. Padrão de caso de uso (1 arquivo = 1 ação)

> O módulo `users`/`address` abaixo é só um exemplo da forma — o mesmo padrão (arquivo por ação, rotas separadas, schemas Zod, sufixo `Module`) se aplica a qualquer módulo/recurso do projeto.

Não usamos separação controller/service/repository. Cada ação de um módulo (`create-x`, `get-x`, `list-x`, `update-x`, `delete-x`, `cancel-x`) é uma função exportada em seu próprio arquivo, tipada com os generics do Fastify. A validação de entrada acontece via schema Zod (inline se for simples, ou em `<acao>-<recurso>-schema.ts` se for reutilizado/complexo).

- O nome do arquivo é `<verbo>-<recurso>.ts` (kebab-case). O nome da função exportada é o mesmo em camelCase, com sufixo `Module` (ex: `createUserAddressModule`).
- A função recebe `FastifyRequest<{ Body/Params/Querystring: X }>` e `FastifyReply` tipados.
- Regra de negócio (checar duplicidade, checar permissão, etc.) fica dentro da própria função, lançando os erros de `core/errors` quando aplicável — não há camada de service separada para isso.
- O acesso ao banco (Prisma/ORM) é chamado diretamente dentro da função do caso de uso.
- O arquivo `-routes.ts` do módulo apenas importa cada caso de uso e registra a rota — zero lógica ali.

```typescript
// modules/users/create-user-address.ts
export async function createUserAddressModule(
  request: FastifyRequest<{ Body: CreateUserAddressBody }>,
  reply: FastifyReply
) {
  const { userId, street, city } = request.body;

  const existing = await db.address.findFirst({ where: { userId, street } });
  if (existing) throw new AddressConflictError();

  const address = await db.address.create({ data: { userId, street, city } });

  return reply.status(201).send(address);
}
```

```typescript
// app.ts — registra o módulo com prefixo de rota
app.register(userRoutes, { prefix: '/users' })
```

```typescript
// modules/users/user-routes.ts — apenas o mapa, sem lógica
export function userRoutes(app: FastifyInstance) {
	app.get(
		'/:userId/address',
		{ schema: { params: userIdSchema, querystring: paginationQuerySchema } },
		listUserAddressModule,
	)
	app.put(
		'/:userId/address/:addressId',
		{
			schema: {
				params: z.intersection(userIdSchema, addressIdSchema),
				body: updateUserAddressSchema,
			},
		},
		updateUserAddressModule,
	)
	app.post(
		'/:userId/address',
		{
			schema: {
				params: userIdSchema,
				body: createUserAddressSchema,
			},
		},
		createUserAddressModule,
	)
	app.delete(
		'/:userId/address/:addressId',
		{
			schema: {
				params: z.intersection(userIdSchema, addressIdSchema),
			},
		},
		deleteUserAddresModule,
	)
}
```

- Prefixo do módulo (`/users`) é definido uma vez no `app.register`, nunca repetido dentro de cada rota do `-routes.ts`.
- Params compostos por mais de um schema reutilizável (ex: `userIdSchema` + `addressIdSchema`) são combinados com `z.intersection`, não reescritos manualmente.
- Cada método HTTP tem seu próprio objeto `schema` com `params`/`querystring`/`body` conforme o que a rota precisa — nunca todos juntos por padrão.
- O nome da função do caso de uso importada nas rotas leva o sufixo `Module` (ex: `createUserAddressModule`).

---

## 5. Tratamento de erros

- Todos os erros de negócio vivem em `src/core/errors/` e estendem `AppError` (classe abstrata). Nunca `throw new Error('string')` solto.
- `AppError` guarda `statusCode` e `errorCode` — todo erro de negócio tem os dois, não só uma mensagem.
- Erros genéricos e reutilizáveis (`NotFoundError`, `ConflictError`, `UnauthorizedError`) ficam em `core/errors/` na raiz, um arquivo por erro.
- Erro específico de um domínio (ex: `AddressConflictError`) também vive em `core/errors/`, um arquivo por erro.
- Exportações de `core/errors/` seguem o **barrel pattern**: tudo é re-exportado por um `index.ts`, e o resto do código sempre importa de `core/errors` (o barrel), nunca do arquivo individual do erro. Esse mesmo padrão vale para qualquer pasta com múltiplas exportações específicas relacionadas (ex: `utils/schemas/index.ts`).
- Dentro do caso de uso, o erro é lançado com `throw`, sem `try/catch` local — o handler de erro do Fastify (`app.setErrorHandler`) é quem converte `AppError` em resposta HTTP.

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

```typescript
// core/errors/conflict-error.ts
import { AppError } from './app-error'

export class ConflictError extends AppError {
	constructor(message = 'Conflict') {
		super(message, 409, 'CONFLICT')
	}
}
```

```typescript
// core/errors/index.ts — barrel
export * from './app-error'
export * from './conflict-error'
export * from './not-found-error'
export * from './unauthorized-error'

// uso dentro de um caso de uso — sempre importando do barrel
import { ConflictError } from '@/core/errors'

const existing = await db.address.findFirst({ where: { userId, street } })
if (existing) throw new ConflictError('Endereço já cadastrado')
```

---

## 6. Nomenclatura e assinatura de funções

- Funções assíncronas que buscam dados começam com `find`/`get`; as que persistem, com `create`/`update`/`delete`.
- Booleans começam com `is`/`has`/`should`.
- Evitar parâmetros posicionais quando houver mais de 2 argumentos — usar objeto de opções tipado.

```typescript
// ❌
function createOrder(userId: string, items: Item[], coupon: string, isGift: boolean) {}

// ✅
function createOrder(params: CreateOrderParams) {}
```

---

## 7. Tipagem

- `any` é proibido. `unknown` também não é usado como saída — toda tipagem vem de schema Zod, nunca de `unknown` + narrowing manual.
- Toda entrada de API (body/query/params) tem um schema Zod em arquivo próprio (`*-schema.ts`), que também gera o tipo via `z.infer` — não duplicar tipo manualmente.

```typescript
// create-user-schema.ts
export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
```

---

## 8. Testes

- Framework: Vitest.
- Todo caso de uso novo (`<acao>-<recurso>.ts`) tem seu `<acao>-<recurso>.spec.ts` colocado no mesmo diretório, ao lado do arquivo — não em uma pasta `__tests__/` separada.
- Setup global de teste fica em `src/tests/setup.ts`.
- Padrão AAA (Arrange, Act, Assert) nos testes.
- Nomes de teste descrevem comportamento, não implementação: `"deve lançar NotFoundError quando usuário não existe"`, não `"testa findById"`.

---

## 9. Comentários e documentação

- Não usamos comentários no código, com uma única exceção: `// TODO:` e `// FIXME:` são permitidos para marcar pendência ou problema conhecido — não para explicar lógica.
- Se sentir necessidade de comentar para explicar o "porquê" de algo, é sinal de que o nome da função/variável precisa melhorar, ou que a lógica deveria ser quebrada em uma função com nome descritivo — não de que falta um comentário.

---

## 10. Coisas que este projeto explicitamente NÃO faz

- Não usamos `any` nem `unknown` para tipar entrada/saída — sempre Zod, em arquivo de schema próprio.
- Não usamos `moment.js` — `day.js` apenas.
- Não usamos `export default` — sempre named exports.
- Não temos camada separada de controller/service/repository — cada caso de uso é um arquivo autocontido (ver seção 4).
- Não fazemos `try/catch` manual em cada caso de uso — o erro é lançado (`throw`) e tratado centralmente pelo error handler do Fastify.
- Não lançamos `Error` genérico — sempre uma subclasse de `AppError` vinda de `core/errors`.
- Não criamos erro sem `statusCode` e `errorCode` — os dois são obrigatórios no construtor de `AppError`.
- Não importamos direto do arquivo individual de um erro (ex: `from './conflict-error'`) fora da pasta `core/errors` — sempre pelo barrel (`from '@/core/errors'`).
- Não escrevemos comentários no código, exceto `// TODO:` e `// FIXME:` para marcar pendência/problema conhecido — nunca para explicar lógica. Nome ruim vira refactor, não comentário.