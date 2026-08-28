# Code Patterns — Convenções Gerais

> **Propósito deste documento:** Este arquivo define as regras globais de engenharia e estilo válidas para todo o monorepo (Backend e Frontend). Qualquer agente de IA deve seguir estritamente estas diretrizes.

---

## 1. Stack e Convenções Globais

| Item | Padrão |
|---|---|
| Linguagem | TypeScript / Node.js (Strict mode) |
| Gerenciador de Pacotes | pnpm (Monorepo com workspaces e Turborepo) |
| Estilo de Módulo | ESM (`"type": "module"`) |
| Formatação & Linter | BiomeJS — regras em `biome.json` |
| Idioma dos Commits e Código | Inglês (commits com Conventional Commits, nomes de branches, variáveis, funções e código em geral) |
| Idioma das Mensagens ao Usuário | PT-BR (mensagens de erro da API, validações Zod, toasts, alertas e qualquer texto exibido ao usuário final — o público é brasileiro) |
| Nomenclatura de Arquivos | `kebab-case` (ex: `create-exam.ts`, `use-camera.ts`) |
| Nomenclatura de Variáveis/Funções | `camelCase` (ex: `createExamModule`, `isValid`) |
| Nomenclatura de Classes/Tipos/Interfaces | `PascalCase` (ex: `AppError`, `CreateExamInput`) |
| Nomenclatura de Constantes Globais | `UPPER_SNAKE_CASE` (ex: `MAX_QUESTIONS_LIMIT`) |

---

## 2. Variáveis de Ambiente (`env.ts`)

- Toda variável de ambiente é validada por **um único schema Zod**, centralizado (ex: `env.ts` ou `@app/env`) — nenhum arquivo lê `process.env.X` diretamente no código de negócio.
- Usa `z.coerce` para valores numéricos ou booleanos e `.default()` quando houver fallback seguro.
- Variável obrigatória sem default não leva `.optional()` nem fallback silencioso — se faltar, o boot da aplicação deve falhar imediatamente.
- Todo o código consome o objeto `env` tipado e validado.

```typescript
// packages/env/src/index.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

---

## 3. Tipagem e Tipos Primitivos

- `any` e `unknown` como tipos finais são proibidos.
- Toda tipagem de entrada e saída vem de schemas **Zod**, utilizando `z.infer<typeof schema>`.
- Não duplique interfaces TypeScript manualmente se já houver um schema Zod correspondente.

---

## 4. Comentários e Documentação de Código

- Não usamos comentários para explicar o que o código faz. Se o código precisa de explicação, o nome das funções/variáveis deve ser refatorado ou a lógica dividida.
- **Única exceção permitida:** `// TODO:` e `// FIXME:` para marcar pendências técnicas conhecidas.

---

## 5. O que este projeto explicitamente NÃO faz (Regras Gerais)

- Não usamos `any` nem `unknown` para tipar dados.
- Não usamos `moment.js` — usar `day.js` apenas.
- Não usamos `export default` (exceto em arquivos obrigatórios do Next.js como `page.tsx` e `layout.tsx`).
- Não lemos `process.env.X` diretamente fora dos arquivos de validação de ambiente (`env.ts`).
- Não escrevemos comentários explicativos no código.
