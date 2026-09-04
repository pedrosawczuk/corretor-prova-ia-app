# 📚 Documentação do Projeto: Corretor de Prova IA

Bem-vindo à documentação oficial do **Corretor de Prova IA** — uma plataforma SaaS projetada para professores e instituições de ensino automatizarem a criação de avaliações, digitalização de respostas e correção inteligente com IA.

---

## 🗂️ Estrutura da Documentação

| Documento | Descrição |
| :--- | :--- |
| [**Requisitos & Regras de Negócio**](./requisitos.md) | Catálogo de Requisitos Funcionais (RF), Regras de Negócio (RN) e Requisitos Não Funcionais (RNF). |
| [**Modelagem de Dados**](./database-modeling.md) | Estrutura relacional das entidades e dicionário de dados dos schemas Drizzle. |
| [**Padrões de Código — Geral**](./code-patterns-general.md) | Convenções globais de estilo, nomenclatura e variáveis de ambiente. |
| [**Padrões de Código — Backend**](./code-patterns-backend.md) | Arquitetura de camadas, casos de uso, transações e tratamento de erros do Fastify/Drizzle. |
| [**Padrões de Código — Frontend**](./code-patterns-frontend.md) | Convenções do Next.js, formulários, data fetching e design system. |
| [**Design System**](./design-system.md) | Tokens visuais e componentes do `packages/ui`. |
| [**Pagamentos — AbacatePay**](./billing-abacatepay.md) | Endpoints, webhook e credenciais da integração de cobrança (planos Avulso, Essencial, Pro). |

---

## 🛠️ Stack Tecnológica Principal

- **Gerenciador de Pacotes:** `pnpm` (Workspaces)
- **Monorepo Build System:** `Turborepo`
- **Linter & Formatter:** `Biome.js`
- **Backend / API:** `Node.js (v24)`, `Fastify`, `Zod`, `fastify-type-provider-zod`
- **Banco de Dados & ORM:** `PostgreSQL`, `Drizzle ORM`
- **Processamento de IA:** Modelos de Visão Multimodal (OCR manuscrito, extração semântica e rubricas)
