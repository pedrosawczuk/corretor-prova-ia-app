# 📋 Requisitos e Regras de Negócio

Este documento formaliza todos os requisitos e regras de negócio que governam a plataforma **Corretor de Prova IA**.

---

## 1. Requisitos Funcionais (RF)

### 👤 1.1 Autenticação e Gestão de Usuários
- **RF01:** O sistema deve permitir que professores e administradores se cadastrem usando e-mail/senha ou OAuth (Google).
- **RF02:** O sistema deve permitir a autenticação e emissão de tokens de sessão (JWT/Cookies seguros).
- **RF03:** O sistema deve permitir gerenciamento de perfil, organização (escola/instituição) e plano de assinatura.

### 📝 1.2 Criação e Gestão de Provas / Avaliações
- **RF04:** O professor deve poder criar uma prova informando título, matéria, turma, pontuação total e instruções.
- **RF05:** O sistema deve permitir gerar questões automaticamente via IA a partir de:
  - Tópico ou habilidade (ex: diretrizes BNCC);
  - Conteúdo colado em texto;
  - Arquivos anexados (PDF, DOCX, imagens de material de aula).
- **RF06:** O professor deve poder criar e editar questões manualmente (múltipla escolha, verdadeiro/falso, dissertativas, numéricas).
- **RF07:** Para cada questão, o sistema deve registrar:
  - Enunciado e opções (se aplicável);
  - Resposta correta / Gabarito oficial;
  - Critérios de correção (rubricas) e pontuação máxima.
- **RF08:** O sistema deve gerar e exportar a prova pronta para impressão em PDF (com layout padronizado, folha de respostas e identificador único via QR Code/código de barras).

### 📷 1.3 Digitalização e Correção com IA
- **RF09:** O professor deve poder enviar folhas de resposta escaneadas ou fotografadas (individuais ou em lote em formato PDF/imagem).
- **RF10:** O sistema deve reconhecer o identificador da prova e o aluno correspondente através do cabeçalho / QR Code.
- **RF11:** O sistema deve processar as respostas manuscritas e objetivas utilizando o pipeline de Visão Computacional / IA Multimodal.
- **RF12:** O sistema deve atribuir pontuação a cada questão com base nos critérios/gabaritos pré-definidos.
- **RF13:** O sistema deve gerar um feedback explicativo para cada questão corrigida.
- **RF14:** O professor deve ter uma tela de revisão rápida para validar, aceitar ou ajustar notas manuais antes do fechamento final.

### 📊 1.4 Relatórios e Exportação
- **RF15:** O sistema deve calcular estatísticas gerais da turma (média, desvio, taxa de acerto por questão, questões mais erradas).
- **RF16:** O sistema deve permitir a exportação das notas em formatos padrão (CSV, XLSX, PDF).

---

## 2. Regras de Negócio (RN)

- **RN01 (Unicidade de Identificador):** Cada folha de prova gerada deve conter um identificador único rastreável (QR Code) para vinculação imediata no momento do upload.
- **RN02 (Limite de Cotas por Plano):** A quantidade de gerações de provas e digitalizações mensais é restrita pelo plano contratado pelo professor ou instituição.
- **RN03 (Confiança de Leitura / Flag de Revisão):** Se o modelo de IA classificar a legibilidade ou certeza de uma resposta abaixo de um limiar crítico (ex: 80%), a questão deve ser marcada com o status `NEEDS_REVIEW` para aprovação obrigatória do professor.
- **RN04 (Imutabilidade Pós-Fechamento):** Uma prova com status `COMPLETED` não pode ter suas notas recalculadas automaticamente, a menos que o professor reabra a revisão explicitamente.
- **RN05 (Isolamento Multitenancy):** Professores só têm acesso aos dados, turmas e provas de suas respectivas contas e organizações autorizadas.
- **RN06 (Armazenamento Seguro de Imagens):** As imagens enviadas para correção devem ser armazenadas em storage seguro (S3-compatible) com URLs temporárias assinadas (Signed URLs).

---

## 3. Requisitos Não Funcionais (RNF)

- **RNF01 (Performance de OCR/IA):** O processamento de uma página de prova não deve exceder 5 segundos em processamento padrão ou deve ser enfileirado de forma assíncrona para lotes grandes.
- **RNF02 (Escalabilidade de Filas):** O upload em lote de 100+ páginas de prova deve ser processado via filas em background sem bloquear requisições HTTP da API.
- **RNF03 (Segurança e LGPD):** Dados sensíveis de alunos e professores devem ser criptografados em repouso e em trânsito (HTTPS / TLS 1.3).
- **RNF04 (Disponibilidade):** A API deve ter meta de disponibilidade mínima de 99.5%.
- **RNF05 (Auditoria):** Todas as alterações manuais de notas feitas por professores devem registrar log com timestamp e ID do usuário.
