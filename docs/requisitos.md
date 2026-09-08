# Corretor & Gerador de Provas IA - Documento de Requisitos (MVP)

## Visão Geral
O aplicativo é uma plataforma para o ciclo completo de avaliações escolares: desde a **criação e refinamento de provas com IA**, passando pela **formatação e impressão**, até a **correção automática por visão computacional clássica (OpenCV, sem Vision LLM)** através de fotos tiradas pela câmera ou escolhidas na galeria do smartphone do professor.

---

## 1. Regras de Negócio (Business Rules)
*   **Foco na Produtividade do Professor:** A ferramenta serve como um assistente para o professor. Não há interface ou login para alunos.
*   **Organização por Turmas (Pastas Organizadoras):** O sistema organiza as avaliações em "Turmas" (ex: "8º Ano A - História"). Turmas funcionam puramente como agrupadores visuais/pastas, sem exigir cadastro de alunos ou matrículas no MVP.
*   **Ciclo de Vida da Prova (Estados):** 
    *   `RASCUNHO`: Em processo de criação/edição/regeneração de questões.
    *   `FINALIZADA`: Gabarito e questões travadas, pronta para impressão e sessões de correção.
*   **Gabarito Automático:** Provas geradas pela IA já nascem com o gabarito oficial e justificativas associados no banco de dados.
*   **Sem Gestão de Alunos (Scope Cut):** O sistema não gerencia cadastros de matrículas individuais. O professor escaneia, visualiza a nota e transcreve para seu diário de classe oficial.
*   **Human-in-the-Loop (Humano no Controle):** A IA não "chuta" respostas em caso de dúvida (rasuras, marcações ambíguas). Nesses casos, o sistema delega a decisão para o professor via interface.
*   **Escopo de Questões:** O MVP suporta questões objetivas: **Múltipla Escolha (A, B, C, D, E)** e **Verdadeiro ou Falso (V/F)**.

---

## 2. Requisitos Funcionais (Functional Requirements)

### 2.1. Autenticação e Usuário
*   **RF01 - Autenticação de Usuário:** Cadastro e login via e-mail/senha ou Google OAuth.
*   **RF02 - Vínculo de Contas (Account Linking):** Suporte nativo para associar múltiplos métodos de autenticação (Google e senha) ao mesmo usuário via `better-auth`.

### 2.2. Gestão de Turmas (Pastas Organizadoras)
*   **RF03 - CRUD de Turmas/Pastas:** O professor pode criar, editar e excluir turmas com informações básicas (`Nome da Turma`, `Disciplina/Matéria` e `Descrição`).
*   **RF04 - Navegação e Listagem:** Dashboard organizado por cartões de turmas, exibindo a listagem de provas vinculadas a cada uma.

### 2.3. Geração e Gestão de Provas
*   **RF05 - Geração de Prova via Prompt:** O professor seleciona a turma e insere um prompt com tema, quantidade de questões, nível de dificuldade, nome da prova e descrição para a IA gerar a avaliação.
*   **RF06 - Refinamento e Regeneração Granular:**
    *   **Regenerar Questão:** Recria o enunciado e as opções de uma questão específica sem alterar o restante da prova.
    *   **Refatorar Alternativas:** Mantém o enunciado da questão e gera novas opções de resposta e gabarito.
    *   **Edição Manual:** Permite que o professor edite qualquer texto diretamente nos campos.
*   **RF07 - Criação Manual de Gabarito (Opcional):** Permite cadastrar uma prova inserindo apenas o gabarito em texto corrido (ex: "1-A, 2-C, 3-V"), sem gerar as questões via IA.
*   **RF08 - Layout de Impressão com QR Code:** Visualização formatada e diagramada da prova pronta para impressão (`@media print`), incluindo um **QR Code único** no rodapé/cabeçalho com o identificador da prova (`provaId`).

### 2.4. Correção por Visão Computacional
*   **RF09 - Modo Scanner Direto:** Na página da prova (ou ao ler o QR Code da folha), o app abre a câmera em tela cheia otimizada para capturar fotos das folhas de respostas em sequência, com a opção de, em vez de fotografar, escolher uma foto já existente na galeria/arquivos do dispositivo para a página atual (inclusive arquivos `.heic`/`.heif` de iPhone).
*   **RF10 - Feedback de Processamento:** Ao final do envio das fotos, o professor aciona o processamento e vê uma animação indicando que a leitura está em andamento; o backend processa a submissão de forma síncrona (sem streaming incremental por questão) e devolve o relatório completo de uma só vez ao final.
*   **RF11 - Intervenção Manual (Dúvida do OCR/IA):** Modal para o professor indicar manualmente a alternativa caso a IA identifique ambiguidade ou ilegibilidade na foto.
*   **RF12 - Relatório Final de Correção:** Exibição imediata da nota total, acertos/erros por questão e justificativas.

---

## 3. Requisitos Não-Funcionais (Non-Functional Requirements)
*   **RNF01 - Saída Estruturada da IA (Structured Outputs):** A geração e refatoração de provas devem usar JSON Schemas estritos (Zod) para garantir a integridade estrutural das questões.
*   **RNF02 - Processamento Síncrono da Correção:** A leitura por visão computacional (`read-submission-answers.ts`) roda de forma síncrona dentro da própria requisição HTTP de `POST /submissions/:submissionId/process` — não há SSE, WebSockets nem qualquer streaming incremental de progresso.
*   **RNF03 - Responsividade Mobile-First:** A interface de escaneamento de provas deve ser 100% fluida e otimizada para uso em smartphones.
*   **RNF04 - Arquitetura do Sistema:** Monorepo com Turborepo, Fastify (Backend), React (Frontend), PostgreSQL com Drizzle ORM e `better-auth`.
