# 📐 Padrões de Código e Boas Práticas (Code Patterns)

Este guia estabelece as convenções de desenvolvimento adotadas no projeto para manter consistência, legibilidade e alta manutenibilidade.

---

## 1. Organização de Pastas no `apps/api`

Adotamos uma arquitetura orientada a módulos de domínio e separação clara de responsabilidades:

```text
apps/api/src/
├── app.ts                  # Configuração do Fastify e middlewares globais
├── server.ts               # Ponto de entrada (Listen / Inicialização da porta)
├── env.ts                  # Validação das variáveis de ambiente com Zod
├── routes/                 # Registro e agrupamento de rotas HTTP por módulo
│   ├── auth/
│   ├── exams/
│   ├── submissions/
│   └── classrooms/
├── controllers/ / http/    # Handlers das requisições HTTP (validação de entrada/saída)
├── services/ / use-cases/  # Regras de negócio puras (sem acoplamento ao framework HTTP)
├── repositories/           # Acesso ao banco de dados / queries Drizzle
├── lib/ / config/          # Clientes de terceiros (S3, OpenAI/Gemini, Drizzle db instance)
└── errors/                 # Classes de erro customizadas (ex: AppError, UnauthorizedError)
```

---

## 2. Padrões de Nomenclatura

| Elemento | Convenção | Exemplo |
| :--- | :--- | :--- |
| **Arquivos e Pastas** | `kebab-case` | `create-exam.ts`, `database-modeling.md` |
| **Variáveis e Funções** | `camelCase` | `calculateTotalScore`, `examRepository` |
| **Classes e Interfaces** | `PascalCase` | `ExamService`, `ZodTypeProvider` |
| **Constantes Globais/Enums** | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE_MB`, `DEFAULT_PAGE_LIMIT` |
| **Schemas Zod** | `camelCase` + sufixo `Schema` | `createExamSchema`, `studentQuerySchema` |
| **Tipos TypeScript** | `PascalCase` | `CreateExamInput`, `SubmissionStatus` |

---

## 3. Validação de Dados e Tipagem com Zod & Fastify

- **Sempre** definir contratos de entrada (`body`, `params`, `query`) e resposta (`response`) com Zod.
- Usar `fastify-type-provider-zod` para inferência automática de tipos nas rotas:

```typescript
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const examRoutes: FastifyPluginAsyncZod = async (app) => {
	app.post(
		'/exams',
		{
			schema: {
				tags: ['Exams'],
				summary: 'Cria uma nova avaliação',
				body: z.object({
					title: z.string().min(3),
					subject: z.string(),
					totalPoints: z.number().positive(),
				}),
				response: {
					201: z.object({
						id: z.string().uuid(),
						title: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { title, subject, totalPoints } = request.body
			// Lógica do use case...
			return reply.status(201).send({ id: '...', title })
		},
	)
}
```

---

## 4. Tratamento de Erros Padronizado

- Centralizar o tratamento de erros no `setErrorHandler` do Fastify no `app.ts`.
- Criar classes de erro que estendam uma base `AppError` com status code HTTP semântico:

```typescript
export class AppError extends Error {
	constructor(
		public readonly message: string,
		public readonly statusCode: number = 400,
	) {
		super(message)
	}
}

export class ResourceNotFoundError extends AppError {
	constructor(resource: string) {
		super(`${resource} não encontrado(a).`, 404)
	}
}
```

---

## 5. Importações e Path Aliases

- Utilizar sempre o alias `@/` para arquivos internos da aplicação (`@/services/...`, `@/routes/...`).
- Para pacotes compartilhados do monorepo, utilizar o namespace `@app/` (`@app/db`, `@app/typescript-config`).
- Evitar caminhos relativos profundos (ex: `../../../utils`).
