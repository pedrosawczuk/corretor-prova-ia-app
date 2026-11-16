# Corrige Go - Documento de Requisitos (MVP)

## Visão Geral
O aplicativo é uma plataforma para o ciclo completo de avaliações escolares: desde a **criação e refinamento de provas com IA**, passando pela **formatação e impressão**, até a **correção automática por leitura de imagem com IA (Gemini Vision), conferida pelo pipeline OpenCV quando os marcadores de canto aparecem na foto,** através de fotos tiradas pela câmera ou escolhidas na galeria do smartphone do professor.

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
*   **RF10.1 - Leitura das Marcações:** Cada foto é lida por IA de visão (Gemini, duas leituras independentes por página) sem depender dos marcadores de canto, localizando cada questão pelo número impresso — funciona com bolinha preenchida, letra pintada, círculo, X ou check, com fotos fora de ordem e com questões que quebram de página. A IA transcreve o início do texto de cada alternativa marcada e o código o casa com o texto do gabarito, então a correção usa a alternativa certa mesmo se a letra impressa divergir da letra salva (prova editada depois de impressa); texto sem correspondência clara vai para revisão. Se o modelo principal (`GEMINI_MODEL`) estiver sem cota ou indisponível, a leitura tenta o modelo reserva (`GEMINI_READING_FALLBACK_MODEL`). Quando os 4 marcadores de canto são encontrados, o pipeline OpenCV (fill-ratio) roda em paralelo como conferência; se a IA não estiver configurada ou falhar, o OpenCV é usado sozinho.
*   **RF10.2 - Regras de Correção Automática:** Uma alternativa marcada é corrigida contra o gabarito; mais de uma alternativa marcada na mesma questão anula a questão (nota zero, exibindo as letras marcadas). Questão lida como sem marcação vai para revisão do professor em vez de zerar automaticamente — evita penalizar o aluno quando uma marcação fraca passa despercebida. As regras só são aplicadas automaticamente quando a leitura é confiável.
*   **RF11 - Intervenção Manual (Dúvida do OCR/IA):** O professor indica manualmente a alternativa quando a leitura não é confiável: as duas leituras da IA divergem, nenhuma marcação foi encontrada, a questão está ilegível/cortada/coberta na foto, ou a leitura OpenCV confiável discorda da IA.
*   **RF12 - Relatório Final de Correção:** Exibição imediata da nota total, acertos/erros por questão e justificativas.

### 2.5. Convites e Cortesia de Lançamento
*   **RF13 - Convite por E-mail:** O admin convida um professor pelo e-mail (`/admin/convites`). O sistema envia um link `/convite/<token>` válido por 14 dias, de uso único e atrelado àquele e-mail. Só o hash do token é salvo. O admin pode reenviar (novo token e nova validade) ou revogar convites pendentes.
*   **RF14 - E-mails Privilegiados:** O admin mantém uma lista de e-mails (`/admin/privilegiados`) que ganham a cortesia automaticamente ao entrar, sem convite e sem envio de e-mail.
*   **RF15 - Cortesia de 3 Meses do Plano Pro:** Convidados e privilegiados ganham 3 meses do plano Pro, contados a partir do primeiro acesso com o e-mail verificado (login após verificação, login com Google ou a primeira carga do dashboard de quem já estava logado). Cada usuário recebe no máximo uma cortesia na vida. A assinatura paga tem prioridade sobre a cortesia; ao vencer, a conta volta para o plano gratuito sem nenhuma cobrança. O admin pode revogar uma cortesia (`/admin/cortesias`).
*   **RF16 - Lembretes de Fim da Cortesia:** O professor recebe e-mails faltando 30 dias, 7 dias e 1 dia para a cortesia acabar. Cada lembrete é enviado uma única vez; se vários ficarem para trás, só o mais urgente é enviado. Quem já assinou não recebe lembretes. O dashboard mostra um banner com a data de fim, em destaque na última semana.

---

## 3. Requisitos Não-Funcionais (Non-Functional Requirements)
*   **RNF01 - Saída Estruturada da IA (Structured Outputs):** A geração e refatoração de provas devem usar JSON Schemas estritos (Zod) para garantir a integridade estrutural das questões.
*   **RNF02 - Processamento Síncrono da Correção:** A leitura (IA + visão computacional, `extract-submission-answers.ts`) roda de forma síncrona dentro da própria requisição HTTP de `POST /submissions/:submissionId/process` — não há SSE, WebSockets nem qualquer streaming incremental de progresso.
*   **RNF03 - Responsividade Mobile-First:** A interface de escaneamento de provas deve ser 100% fluida e otimizada para uso em smartphones.
*   **RNF04 - Arquitetura do Sistema:** Monorepo com Turborepo, Fastify (Backend), React (Frontend), PostgreSQL com Drizzle ORM e `better-auth`.
