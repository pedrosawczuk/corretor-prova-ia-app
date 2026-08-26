# 📚 Documentação do Projeto: Corretor de Prova IA

Bem-vindo à documentação oficial do **Corretor de Prova IA** — uma plataforma SaaS projetada para professores e instituições de ensino automatizarem a criação de avaliações, digitalização de respostas e correção inteligente com IA.

---

## 🗂️ Estrutura da Documentação

| Documento | Descrição |
| :--- | :--- |
| [**Requisitos & Regras de Negócio**](./requirements.md) | Catálogo de Requisitos Funcionais (RF), Regras de Negócio (RN) e Requisitos Não Funcionais (RNF). |
| [**Modelagem de Dados**](./database-modeling.md) | Estrutura relacional das entidades, dicionário de dados e diagrama de banco (pré-Drizzle). |
| [**Padrões de Código (Code Patterns)**](./code-patterns.md) | Convenções de nomenclatura, arquitetura de camadas, tratamento de erros e boas práticas. |
| [**Arquitetura do Sistema**](./architecture.md) | Visão geral da infraestrutura, fluxo do pipeline de IA/OCR e comunicação entre módulos. |

---

## 🛠️ Stack Tecnológica Principal

- **Gerenciador de Pacotes:** `pnpm` (Workspaces)
- **Monorepo Build System:** `Turborepo`
- **Linter & Formatter:** `Biome.js`
- **Backend / API:** `Node.js (v24)`, `Fastify`, `Zod`, `fastify-type-provider-zod`
- **Banco de Dados & ORM:** `PostgreSQL`, `Drizzle ORM`
- **Processamento de IA:** Modelos de Visão Multimodal (OCR manuscrito, extração semântica e rubricas)
