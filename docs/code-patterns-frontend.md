# Code Patterns — Frontend (Next.js & UI)

> **Propósito deste documento:** Este arquivo é a fonte de verdade para o desenvolvimento do Frontend (Next.js App Router, shadcn/ui, formulários, rotas e consumo de API).

---

## 1. Stack do Frontend

| Item | Padrão |
|---|---|
| Framework | Next.js (App Router) |
| Linguagem | TypeScript (Strict mode) |
| Componentes de UI | shadcn/ui centralizado em `packages/ui` (`@app/ui`) |
| Formulários & Validação | React Hook Form + `@hookform/resolvers/zod` |
| Data Fetching / Server State | TanStack Query (`@tanstack/react-query`) |
| URL State / Search Params | `nuqs` (Type-safe search params) |
| Estado Global Client | `zustand` |
| Feedback Visual / Toasts | `sonner` (`@app/ui/sonner`) |
| Ícones | `lucide-react` |

---

## 2. Componentes de UI e Monorepo (`packages/ui`)

- **Design System Compartilhado:** Todos os componentes primitivos (botões, inputs, dialogs, dropdowns, etc.) vivem no pacote `packages/ui` (`@app/ui`).
- Os aplicativos (ex: `apps/web`) apenas importam os componentes prontos de `@app/ui`.
- Componentes com regras de negócio específicas de uma tela pertencem ao próprio app, nunca dentro do pacote compartilhado `packages/ui`.

---

## 3. Server Components vs. Client Components

- **Regra de Ouro:** Toda página e componente no Next.js App Router é um **Server Component por padrão**.
- Adicione `'use client'` exclusivamente nas folhas da árvore de componentes que necessitam de interatividade imediata (eventos `onClick`, hooks do React como `useState`, hooks de formulário, acesso à câmera ou TanStack Query mutations).
- **Proibido:** Marcar um `page.tsx` ou `layout.tsx` inteiro como `'use client'` se apenas uma parte dele for interativa — isole a interatividade em um componente cliente separado.

---

## 4. Formulários e Validação

- Todo formulário usa obrigatoriamente **React Hook Form** integrado com **Zod** através de `@hookform/resolvers/zod`.
- Os schemas de validação residem em arquivos `*-schema.ts` ou são importados dos pacotes de tipos da aplicação.
- É estritamente proibido controlar formulários usando múltiplos `useState` manuais para cada campo.

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Form, FormField, FormItem, FormLabel, FormMessage } from '@app/ui'

const createExamSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  topic: z.string().min(1, 'Informe o tema da prova'),
  questionsCount: z.coerce.number().min(1).max(50),
})

type CreateExamInput = z.infer<typeof createExamSchema>

export function CreateExamForm() {
  const form = useForm<CreateExamInput>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      title: '',
      topic: '',
      questionsCount: 10,
    },
  })

  function onSubmit(data: CreateExamInput) {
    // chamada via TanStack Query
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* campos FormField */}
        <Button type="submit">Gerar Prova</Button>
      </form>
    </Form>
  )
}
```

---

## 5. Estrutura de Rotas e Middleware de Autenticação

- **Route Groups com Parênteses `()`:**
  - `app/(public)/`: Rotas sem autenticação obrigatória (`/sign-in`, `/sign-up`, `/pricing`, `/`). Possui seu próprio `layout.tsx` focado em onboarding.
  - `app/(private)/`: Rotas autenticadas protegidas (`/dashboard`, `/turmas`, `/provas`). Possui seu próprio `layout.tsx` (sidebar, header, menu do professor).
- **Middleware no Edge (`middleware.ts`):**
  - Executa apenas verificações leves e síncronas de cookies de sessão (`session_token`), sem chamadas pesadas ao banco no Edge.
  - Se rota privada e sem token -> redireciona para `/sign-in` com `request.nextUrl.clone()`.
  - Se rota de autenticação (`/sign-in`) e com token -> redireciona para `/dashboard`.
  - Se rota pública informativa (`/pricing`) -> permite acesso irrestrito.

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/sign-in', '/sign-up']
const PUBLIC_INFORMATIVE_ROUTES = ['/', '/pricing']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session_token')?.value

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
  const isPublicRoute = isAuthRoute || PUBLIC_INFORMATIVE_ROUTES.some((route) => pathname === route)
  const isPrivateRoute = !isPublicRoute

  if (isPrivateRoute && !token) {
    const signInUrl = request.nextUrl.clone()
    signInUrl.pathname = '/sign-in'
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthRoute && token) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## 6. Client HTTP Centralizado (`api-client.ts`)

- Todas as chamadas para a API passam por um cliente centralizado (`api-client.ts`).
- Inclui automaticamente `NEXT_PUBLIC_API_URL`, `credentials: 'include'` e parsing padronizado de erros do backend.

---

## 7. Data Fetching, URL State e Estado Global

- **Data Fetching:** Usamos `@tanstack/react-query` para consultas assíncronas e mutações no client. É proibido fazer chamadas `fetch` soltas dentro de `useEffect`.
- **URL State (`nuqs`):** Filtros de busca, ordenações e abas são sincronizados na URL através da biblioteca `nuqs`.
- **Estado Global (`zustand`):** Estados em memória compartilhados entre componentes (ex: fila de digitalização da câmera, sessão ativa) utilizam stores focadas em Zustand (`useScannerStore`).

---

## 8. Notificações, Loading e Acessibilidade

- **Notificações (`sonner`):** Usamos toasts do Sonner. Para mutações, priorizamos `toast.promise`. Proibido `window.alert()` ou `console.error`.
- **Loading & Empty States:** Usar `loading.tsx` / `<Suspense fallback={<Skeleton />}>` para Server Components. Listagens sem registros devem obrigatoriamente exibir um componente de Empty State com CTA.
- **Error Boundaries (`error.tsx`):** Pastas de rotas principais devem possuir `error.tsx` com interface amigável e botão `reset()`.
- **Acesso à Câmera (`use-camera.ts`):** Encapsular `getUserMedia` exclusivamente em um hook dedicado com liberação dos tracks de vídeo no unmount (`track.stop()`).
- **Ícones (`lucide-react`):** Utilizar exclusivamente `lucide-react` com classes utilitárias do Tailwind (`size-4`, `size-5`, `size-8`).

---

## 9. Organização de Componentes e Responsabilidade Única

- **Regra de Ouro:** Um arquivo `.tsx` de componente contém **apenas** o componente (JSX + estado + handlers que chamam outras funções). Ele não é o lugar para funções puras (cálculo, formatação, agrupamento de dados) nem para subcomponentes de apresentação genéricos.
- **Colocation de helpers (`*.utils.ts`):** Funções puras usadas só por aquele componente vivem em um arquivo irmão `nome-do-componente.utils.ts`, no mesmo diretório. O componente importa dali.
- **Subcomponentes de apresentação:** Um pedaço de UI reaproveitável dentro de uma página (ex: um card de estatística, um item de lista) vira seu próprio arquivo de componente — nunca uma função declarada dentro do arquivo principal.
- **Nunca duplicar entre arquivos:** Se a mesma função ou subcomponente (ex: um tooltip de gráfico) aparece em mais de uma tela, ele sai dos dois arquivos e vira um componente/util compartilhado (ex: `components/charts/chart-tooltip.tsx`).
- **Teste rápido:** ao abrir um `.tsx`, se existe um `function algumaCoisa(...)` que não retorna JSX do componente principal, essa função pertence a um `.utils.ts` ao lado.

```
components/admin/
  admin-activity-charts.tsx        # só o componente (JSX, estado, hooks)
  admin-activity-charts.utils.ts   # buildLoginsPerDay, outcomeBadgeVariant, constantes
  stat-card.tsx                    # subcomponente de apresentação, próprio arquivo

components/charts/
  chart-tooltip.tsx                # tooltip de gráfico compartilhado entre várias telas
```

```typescript
// admin-activity-charts.utils.ts — função pura, sem JSX
export function buildLoginsPerDay(createdAtDates: string[]) {
  // agrupa por dia e retorna os dados prontos para o gráfico
}
```

```typescript
// admin-activity-charts.tsx — só o componente
import { buildLoginsPerDay } from './admin-activity-charts.utils'
import { ChartTooltip } from '@/components/charts/chart-tooltip'

export function AdminActivityCharts() {
  const loginsPerDay = React.useMemo(() => buildLoginsPerDay(dates), [dates])
  // ...
}
```

---

## 10. O que este projeto explicitamente NÃO faz (Frontend)

- Não usamos `'use client'` em páginas ou layouts inteiros sem necessidade.
- Não controlamos formulários com múltiplos `useState` manuais — sempre React Hook Form + Zod.
- Não fazemos data fetching client-side com `useEffect` solto — sempre TanStack Query.
- Não chamamos `fetch` com URLs hardcoded — sempre utilizar o `api-client.ts`.
- Não usamos `window.alert()` ou `console.error` como feedback ao usuário — sempre utilizar `sonner`.
- Não manipulamos câmera diretamente nos componentes — sempre utilizar o hook `use-camera.ts`.
- Não misturamos bibliotecas de ícones — usar estritamente `lucide-react`.
- Não criamos componentes primitivos de design system fora de `packages/ui`.
- Não usamos Context API para gerenciar estados globais com mutações frequentes — usamos `zustand`.
- Não deixamos funções puras (helpers, formatadores, builders de dados de gráfico) declaradas dentro do arquivo do componente — elas vão para um `*.utils.ts` colocado ao lado.
- Não duplicamos subcomponentes de apresentação genéricos (ex: tooltip de gráfico, card de estatística) entre arquivos — extraímos para um componente compartilhado ou colocado.
