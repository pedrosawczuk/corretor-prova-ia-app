# TASKS.md

## Status
Em andamento: nenhuma
Concluídas: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
Bloqueadas: nenhuma

## Feature: Corrigir prova por foto — aceitar câmera ou galeria, com leitura mais confiável

### Contexto

Hoje a correção de prova (`apps/web/src/components/dashboard/corrigir-prova-camera.tsx`) só permite fotografar a folha de respostas pela câmera (`apps/web/src/hooks/use-camera.ts`), uma página por vez, em ordem. O pedido é acrescentar a opção de escolher uma foto já existente na galeria/arquivos do dispositivo, mantendo o fluxo sequencial (1 foto por página) — e, junto disso, tornar a leitura das respostas mais robusta.

**Achado importante do levantamento do código real:** não existe "OCR" nem Vision LLM na correção — `apps/api/src/lib/vision/read-submission-answers.ts` é um pipeline 100% determinístico de visão computacional clássica (OpenCV via `@techstark/opencv-js`): localiza 4 marcadores pretos de canto na foto, calcula uma transformação de perspectiva e mede o percentual de pixels escuros dentro de uma caixa fixa por alternativa (fill-ratio) para decidir a resposta. Por decisão do usuário, "leitura funcionar perfeitamente" aqui significa **fortalecer esse pipeline OpenCV existente** (checagens de qualidade de imagem, diagnóstico explícito de falha de marcador, tolerância a leve desalinhamento, testes com fotos degradadas) — não substituir por um Vision LLM.

Também por decisão do usuário: a galeria é usada **uma foto por vez, no lugar da câmera**, em cada etapa de página (sem seleção múltipla nem tela de reordenação), e o backend **deve decodificar HEIC** nativamente (formato padrão de fotos de galeria do iPhone), já que o `sharp@0.35.4` instalado só decodifica HEIF de arquivos `.avif` — HEIC real (codec HEVC) não é suportado pelos binários pré-compilados do libvips por questão de licenciamento de patente, e precisa de um decodificador adicional.

**Caminho crítico:** tarefas 1 → 2 → 3 → 4 (backend passa a aceitar imagens de qualquer fonte com segurança) → 5 → 6 → 7 → 8 → 9 (frontend expõe a galeria e valida ponta a ponta). A trilha de robustez de leitura (10-13) e a atualização de documentação (14-15) são independentes desse caminho e podem ser feitas em paralelo a qualquer momento a partir do início.

### Tarefas

**Trilha A — Backend aceita imagens de qualquer fonte com segurança (caminho crítico)**

- [x] 1. Suporte a decodificação de HEIC/HEIF no upload de página
  - O que fazer: `sharp(originalBuffer)` em `upload-submission-page.ts:59-67` não decodifica arquivos `.heic` reais (confirmado: `sharp.format.heif.input.fileSuffix` só lista `.avif` nesta instalação). Fotos de galeria de iPhone são `.heic` por padrão. Detectar esse caso via o `fileType` já obtido de `fileTypeFromBuffer` (mime `image/heic`/`image/heif`) e, quando detectado, converter o buffer para JPEG usando uma biblioteca de decodificação HEIC independente do libvips nativo (ex: `heic-convert`, baseada em WASM/`libheif-js`) **antes** de passar o resultado para o pipeline `sharp` existente (rotate/resize/grayscale/jpeg). Adicionar a dependência em `apps/api/package.json`.
  - Arquivos: `apps/api/src/modules/submissions/upload-submission-page.ts`, `apps/api/package.json`
  - Pronto quando: um arquivo `.heic` real (fixture de teste) enviado a `POST /submissions/:submissionId/pages` é aceito, convertido e a página é salva normalmente pelo mesmo pipeline de normalização; existe teste automatizado cobrindo esse caso.
  - Depende de: nenhuma

- [x] 2. Checagem de resolução mínima antes de aceitar a página
  - O que fazer: em `upload-submission-page.ts`, após decodificar o buffer (já incluindo a conversão de HEIC da tarefa 1), ler `width`/`height` via `sharp(buffer).metadata()` e rejeitar com `BadRequestError` (ex: "A foto está com resolução muito baixa para leitura confiável — tire a foto mais de perto ou com mais qualidade.") quando a menor dimensão for menor que uma constante nova, ex. `MIN_PAGE_DIMENSION = 900` px. Abaixo disso a caixa do glifo da alternativa (~14×11pt mapeados para poucos pixels) não tem resolução suficiente para o fill-ratio (`read-submission-answers.ts`) ser confiável. Isso é crítico especialmente para arquivos de galeria (podem ser screenshots, recortes ou downloads em baixa qualidade), diferente da câmera controlada que sempre pede `1920×1080` ideal em `use-camera.ts:25-26`.
  - Arquivos: `apps/api/src/modules/submissions/upload-submission-page.ts`
  - Pronto quando: upload de uma imagem abaixo do mínimo definido retorna 400 com mensagem específica antes de rodar o pipeline OpenCV; teste cobre o limite exato (no mínimo passa, um pixel a menos falha).
  - Depende de: 1 (mesmo arquivo/fluxo de decodificação)

- [x] 3. Limite de pixels de entrada no `sharp` (proteção contra decompression bomb)
  - O que fazer: passar `{ limitInputPixels: 30_000_000 }` (ajustável) ao construtor `sharp(...)` em todos os usos dentro de `upload-submission-page.ts` (checagem de metadata da tarefa 2 e pipeline de normalização). Arquivos de galeria podem ter qualquer resolução/origem, diferente da câmera que nunca gera mais que `1920×1080`; sem esse limite, decodificar uma imagem gigante antes do `resize` custa CPU/memória desnecessários e é vetor de negação de serviço.
  - Arquivos: `apps/api/src/modules/submissions/upload-submission-page.ts`
  - Pronto quando: uma imagem sintética acima do limite de pixels é rejeitada com erro tratado (400), sem estourar memória do processo; teste cobre o caso.
  - Depende de: 1

- [x] 4. Testes de `upload-submission-page.ts` (arquivo hoje sem nenhum teste direto)
  - O que fazer: criar `upload-submission-page.test.ts` cobrindo: rejeição de arquivo não-imagem (magic byte falso vs. `Content-Type` mentiroso), rejeição de arquivo >10MB (`MAX_SUBMISSION_PAGE_SIZE_BYTES`), normalização correta de EXIF (imagem com orientação EXIF chega corrigida via `.rotate()`), conversão de HEIC (tarefa 1), rejeição por resolução mínima (tarefa 2), rejeição por limite de pixels (tarefa 3), e bloqueio de upload quando `submission.status` é `processing`/`completed` (`NON_UPLOADABLE_STATUSES`).
  - Arquivos: `apps/api/src/modules/submissions/upload-submission-page.test.ts` (novo)
  - Pronto quando: todos os casos acima têm teste passando, seguindo o padrão de factories com banco real descrito em `docs/code-patterns-backend.md` (sem `vi.mock` de banco).
  - Depende de: 1, 2, 3

**Trilha B — Frontend: escolher foto da galeria (caminho crítico)**

- [x] 5. Botão "Escolher da galeria" na tela de captura
  - O que fazer: em `corrigir-prova-camera.tsx`, adicionar um `<input type="file" accept="image/*" capture="environment" className="sr-only">` com `ref` (mesmo padrão já usado em `apps/web/src/components/dashboard/configuracoes/perfil-section.tsx:183-190`), acionado por um novo botão ao lado do obturador (ícone `Images`/`ImageUp` de `lucide-react`, seguindo a regra de ícones exclusivos do projeto). No `onChange`, pegar `event.target.files?.[0]` — um `File` já é um `Blob` — e chamar o mesmo `onCapture(blob)` recebido via props, reaproveitando 100% do fluxo de upload/preview já existente em `handleCapture` (`corrigir-prova.tsx:103-112`). Resetar `input.value = ''` após o `onChange` para permitir escolher o mesmo arquivo de novo em uma página seguinte.
  - Arquivos: `apps/web/src/components/dashboard/corrigir-prova-camera.tsx`
  - Pronto quando: na tela de captura, o professor consegue tanto tirar foto pela câmera quanto escolher uma imagem da galeria para a página atual corrente, e ambas seguem para o mesmo preview/upload/avanço de página.
  - Depende de: nenhuma (pode ser feita em paralelo à Trilha A)

- [x] 6. Galeria como alternativa quando a câmera falha ou está indisponível
  - O que fazer: hoje, quando `useCamera` retorna `error` (permissão negada, sem câmera, contexto inseguro), `corrigir-prova-camera.tsx:53-57` só mostra um texto, sem nenhuma ação possível — o professor fica travado. Garantir que o botão "Escolher da galeria" da tarefa 5 continue visível e funcional mesmo nesse estado de erro, e ajustar o layout para que ele fique em destaque quando não há câmera disponível.
  - Arquivos: `apps/web/src/components/dashboard/corrigir-prova-camera.tsx`
  - Pronto quando: simulando permissão de câmera negada no navegador, ainda é possível completar a captura de todas as páginas via galeria.
  - Depende de: 5

- [x] 7. Validação client-side antes do upload (tipo e tamanho)
  - O que fazer: no handler do `<input type="file">` da tarefa 5, antes de chamar `onCapture`, rejeitar (via `toast.error` do `sonner` — nunca `window.alert`) arquivos cujo `file.type` não comece com `image/`, e arquivos maiores que o limite aceito pelo backend. Extrair o valor `10 * 1024 * 1024` de `MAX_SUBMISSION_PAGE_SIZE_BYTES` (hoje só existe em `apps/api/src/lib/storage/storage.ts:67`) para uma constante compartilhada em `packages/shared` para não duplicar o número mágico entre frontend e backend.
  - Arquivos: `apps/web/src/components/dashboard/corrigir-prova-camera.tsx`, `packages/shared/src/constants/submission.ts` (novo), `apps/api/src/lib/storage/storage.ts` (passa a importar a constante compartilhada)
  - Pronto quando: escolher da galeria um arquivo não-imagem ou maior que o limite mostra um toast de erro imediatamente, sem chamar a API; o valor do limite existe em um único lugar (`packages/shared`), importado por ambos os apps.
  - Depende de: 5

- [x] 8. Mensagens de erro de upload específicas por causa
  - O que fazer: `handleCapture` em `corrigir-prova.tsx:103-112` hoje sempre mostra o mesmo toast genérico ("Não foi possível enviar a foto. Tente novamente.") em qualquer falha de `useUploadSubmissionPage`. Trocar para exibir a mensagem real retornada pelo backend via `toastApiError` (já existem mensagens específicas em `upload-submission-page.ts`, e as novas das tarefas 2 e 3), caindo no texto genérico só quando a API não retornar mensagem utilizável.
  - Arquivos: `apps/web/src/components/dashboard/corrigir-prova.tsx`
  - Pronto quando: escolher da galeria uma foto de resolução baixa (tarefa 2) mostra no toast a mensagem específica do backend, não a genérica.
  - Depende de: 2, 3, 7

- [x] 9. Validação manual ponta a ponta (câmera + galeria + HEIC)
  - O que fazer: rodar manualmente o fluxo completo em um navegador (mobile real e/ou desktop com dispositivo simulado): iniciar correção, tirar 1 foto pela câmera para a página 1, escolher da galeria uma foto para a página 2, revisar as duas prévias, corrigir e conferir o resultado. Repetir o teste escolhendo especificamente um arquivo `.heic` real de iPhone (ou fixture equivalente) para validar a tarefa 1 de ponta a ponta pelo app, não só pelo teste automatizado de backend.
  - Arquivos: n/a — validação manual, sem alteração de código nesta tarefa
  - Pronto quando: o fluxo completo funciona sem erros com fotos de origens mistas (câmera + galeria), e uma foto `.heic` é aceita e lida corretamente até o relatório final.
  - Depende de: 1, 4, 6, 7, 8

**Trilha C — Robustez da leitura (pipeline OpenCV) — paralela à Trilha A/B**

- [x] 10. Persistir diagnóstico por página quando os marcadores não são encontrados
  - O que fazer: hoje `readPage` (`read-submission-answers.ts:250-289`, especificamente a linha `if (!found) return` em 264-265) falha silenciosamente quando os 4 marcadores de canto não são localizados — a página inteira vira "sem marcação" (fill ratio 0) para todas as alternativas, indistinguível de "o aluno realmente não marcou nada". Mudar `readSubmissionAnswers` para também retornar, por página, se os marcadores foram encontrados (ex: `Map<pageNumber, { markersFound: boolean }>`), e em `process-submission.ts` gravar esse diagnóstico no campo `rawOcrPayload` (jsonb, já existe em `submission_pages` — hoje sempre `null`, nenhuma migration necessária) do registro `submission_pages` correspondente.
  - Arquivos: `apps/api/src/lib/vision/read-submission-answers.ts`, `apps/api/src/modules/submissions/process-submission.ts`
  - Pronto quando: ao processar uma submissão em que uma página não tem os 4 marcadores detectados, o `submission_pages.rawOcrPayload` daquela página fica preenchido com `{ markersFound: false }` (ou equivalente); teste unitário cobre o caso via o retorno estruturado de `readSubmissionAnswers`.
  - Depende de: nenhuma

- [x] 11. Avisar o professor quando uma página específica falhou no alinhamento
  - O que fazer: usar o diagnóstico da tarefa 10 para, na resposta de `processSubmissionModule` (e no tipo `Submission` compartilhado em `packages/shared/src/types/submission.ts`), sinalizar quais páginas tiveram falha de alinhamento. Hoje o professor só vê "N questão(ões) precisam da sua revisão manual" (`corrigir-prova.tsx:127-132`), sem saber se a causa foi uma foto ilegível (recuperável tirando outra foto) ou marcações realmente ambíguas. Adicionar um aviso específico na tela de resultado (`corrigir-prova.tsx` / `corrigir-prova-resultado.tsx`), ex.: "A página 2 não pôde ser alinhada automaticamente — todas as questões dela precisam de revisão manual".
  - Arquivos: `apps/api/src/modules/submissions/process-submission.ts`, `packages/shared/src/types/submission.ts`, `apps/web/src/components/dashboard/corrigir-prova.tsx`, `apps/web/src/components/dashboard/corrigir-prova-resultado.tsx`
  - Pronto quando: numa submissão de teste com uma página sem marcadores detectáveis, a tela de resultado mostra o aviso específico citando o número da página, distinto do aviso genérico de questões pendentes.
  - Depende de: 10

- [x] 12. Segunda tentativa com margem de busca de marcador mais ampla
  - O que fazer: `CORNER_SEARCH_MARGIN = 0.32` (`read-submission-answers.ts:42`) é fixo; uma foto levemente descentralizada além dessa margem faz a página inteira falhar sem necessidade. Em `locateAlignmentMarkers`, se a primeira tentativa com a margem padrão não encontrar os 4 marcadores, tentar novamente com uma margem maior (ex: `0.45`) antes de desistir e marcar a página como `markersFound: false`. A margem maior só entra como fallback, sem afetar o caso padrão.
  - Arquivos: `apps/api/src/lib/vision/read-submission-answers.ts`
  - Pronto quando: um fixture de página com marcadores fora de 0.32 mas dentro de 0.45 passa a ser lido corretamente (antes falhava); teste de regressão garante que o caso padrão continua sendo resolvido já na primeira tentativa.
  - Depende de: nenhuma

- [x] 13. Testes com imagens degradadas (blur, inclinação, iluminação irregular)
  - O que fazer: `read-submission-answers.test.ts` hoje só cobre páginas geradas em SVG, perfeitamente alinhadas e limpas. Adicionar fixtures derivados do mesmo gerador aplicando (via `sharp`) blur gaussiano moderado, rotação leve (ex: 5°), e um gradiente de brilho simulando iluminação desigual — cobrindo: leitura ainda correta sob blur/rotação leve dentro da tolerância; marcador cortado/ausente retorna `markersFound: false` sem lançar exceção (usa o retorno estruturado da tarefa 10); o retry da tarefa 12 é exercitado por um fixture desalinhado dentro da margem estendida.
  - Arquivos: `apps/api/src/lib/vision/read-submission-answers.test.ts`
  - Pronto quando: os cenários acima têm teste passando, cobrindo tanto o caminho degradado que ainda funciona quanto a falha esperada e sinalizada de marcador ausente.
  - Depende de: 10, 12

**Trilha D — Documentação (paralela, sem bloquear nada)**

- [x] 14. Atualizar RF09 em `docs/requisitos.md` para incluir a opção de galeria
  - O que fazer: RF09 hoje descreve apenas "o app abre a câmera em tela cheia... para capturar fotos". Atualizar a redação para refletir que o professor pode tirar foto ou escolher uma imagem da galeria para cada página.
  - Arquivos: `docs/requisitos.md`
  - Pronto quando: RF09 menciona as duas fontes de imagem disponíveis.
  - Depende de: 5

- [x] 15. Corrigir RF10/RNF02 em `docs/requisitos.md` para refletir a implementação real
  - O que fazer: confirmado durante o levantamento desta feature que não existe chamada a Vision LLM nem streaming (SSE/WebSocket) na correção — `POST /submissions/:submissionId/process` é síncrono e a leitura é 100% OpenCV determinístico (`read-submission-answers.ts`). RF10 ("Feedback em Tempo Real... Corrigindo questão 1...") e RNF02 ("Uso de SSE ou WebSockets") descrevem algo que nunca foi implementado. Ajustar os dois itens para descrever o comportamento real (resposta única após processamento síncrono) ou, se o streaming ainda for uma meta futura, marcar explicitamente como "planejado, não implementado" em vez de deixar parecer que já existe.
  - Arquivos: `docs/requisitos.md`
  - Pronto quando: RF10/RNF02 não descrevem mais um comportamento (Vision LLM, streaming) que diverge do código atual.
  - Depende de: nenhuma

## Feature: Dashboard com métricas de produto, não de vaidade

### Contexto

`dashboard-overview.tsx` hoje só mostra contagens de cadastro (turmas, matérias, provas) e dois gráficos derivados dessas mesmas contagens ("turmas por matéria", "crescimento de turmas"). Nenhum desses números responde à pergunta que importa para o professor: como minha turma foi na prova. Os dados para responder isso já existem no banco e não usados em lugar nenhum da UI hoje: `submissions.totalScore` (nota obtida), `exams.totalPoints` (nota máxima da prova) e `submission_answers.finalScore`/`questions.maxPoints` (acerto por questão). Não existe hoje nenhum endpoint que agregue esses dados — `list-submissions.ts` só lista submissões de uma prova por vez, sem agregação, e o frontend não tem nenhum hook nem tela consumindo nota ou taxa de acerto.

**Achado importante do levantamento do código real:** submissões com `status = 'needs_review'` têm respostas com `finalScore = null` (`grade-submission-answers.ts`) até a revisão manual. Qualquer média de nota ou taxa de acerto precisa considerar **apenas submissões `completed`**, senão o número fica artificialmente mais baixo.

**Caminho crítico:** 16 → 17 → 18 → 19 → 20 (backend agrega os dados, depois o frontend expõe e substitui a UI de vaidade). 21 fecha com validação manual ponta a ponta.

**Conflito de arquivo sinalizado:** 19 e 20 editam o mesmo arquivo (`dashboard-overview.tsx` e `dashboard-overview.utils.ts`) — por isso são sequenciais (20 depende de 19), não devem ser executadas em paralelo por agentes diferentes.

### Tarefas

- [x] 16. Endpoint de nota média e desempenho por turma
  - O que fazer: criar módulo novo `apps/api/src/modules/dashboard/` com `get-performance-overview.ts` (função `getPerformanceOverviewModule`) e `dashboard-routes.ts` (`dashboardRoutes`), registrados em `apps/api/src/app.ts` (`app.register(dashboardRoutes, { prefix: '/dashboard' })`) e em `apps/api/src/test/create-test-app.ts`. Rota `GET /dashboard/performance-overview`, autenticada com `getAuthenticatedUser` (mesmo padrão de `apps/api/src/modules/exams/list-exams.ts`). Calcular, escopado a `classroomsTable.teacherId = user.id` e apenas sobre `submissionsTable.status = 'completed'`: `overall.averageScorePercentage` (média de `totalScore / exams.totalPoints * 100` entre as submissões completed do professor, arredondada a 1 casa decimal, `null` se não houver nenhuma), `overall.correctedSubmissionsCount` (contagem dessas submissões), e `byClassroom` (array com `classroomId`, `classroomName`, `averageScorePercentage`, `correctedSubmissionsCount`, só turmas com ao menos 1 submissão completed). Join necessário: `submissionsTable` → `examsTable` (`examId`) → `classroomsTable` (`classroomId`). Seguir o padrão de agregação com `leftJoin`/`groupBy`/`sql<number>` já usado em `apps/api/src/modules/admin/get-admin-overview.ts`. Adicionar o tipo `PerformanceOverview` em `packages/shared/src/types/dashboard.ts` (novo) e exportar em `packages/shared/src/index.ts`, só com os campos acima (taxa de acerto é da tarefa 17).
  - Arquivos: `apps/api/src/modules/dashboard/get-performance-overview.ts` (novo), `apps/api/src/modules/dashboard/dashboard-routes.ts` (novo), `apps/api/src/app.ts`, `apps/api/src/test/create-test-app.ts`, `packages/shared/src/types/dashboard.ts` (novo), `packages/shared/src/index.ts`
  - Pronto quando: `GET /dashboard/performance-overview` retorna `overall`/`byClassroom` corretos para um cenário com 2 turmas e submissões completed + needs_review misturadas (needs_review fica de fora do cálculo); professor sem nenhuma submissão completed recebe `averageScorePercentage: null`, `correctedSubmissionsCount: 0`, `byClassroom: []`; submissões de turma de outro professor nunca aparecem; teste automatizado cobre os três casos com as factories reais (`make-classroom`, `make-exam`, `make-submission`, `make-submission-answer`), sem mocks de banco.
  - Depende de: nenhuma

- [x] 17. Adicionar taxa de acerto ao endpoint de desempenho
  - O que fazer: estender `getPerformanceOverviewModule` (tarefa 16) com `overall.accuracyRate`: percentual de `submission_answers` cujo `finalScore` é igual ao `maxPoints` da questão (`questionsTable.maxPoints`), entre as respostas de submissões completed do professor, arredondado a 1 casa decimal, `null` se não houver nenhuma resposta. Join adicional: `submissionAnswersTable` → `submissionsTable` (`submissionId`) reaproveitando a cadeia até `classroomsTable` da tarefa 16, e → `questionsTable` (`questionId`) para o `maxPoints`. Atualizar o tipo `PerformanceOverview` para incluir `accuracyRate`. Só o valor geral do professor é pedido aqui, não por turma.
  - Arquivos: `apps/api/src/modules/dashboard/get-performance-overview.ts`, `packages/shared/src/types/dashboard.ts`
  - Pronto quando: no mesmo cenário de teste da tarefa 16, uma submissão completed com 3 de 4 respostas corretas contribui com 75% para `accuracyRate`, testado agregando mais de uma submissão; `accuracyRate` é `null` quando não há nenhuma resposta de submissão completed.
  - Depende de: 16

- [x] 18. Hook `usePerformanceOverview` no frontend
  - O que fazer: criar `apps/web/src/hooks/use-dashboard.ts` com `usePerformanceOverview()`, seguindo o padrão de `useQuery` de `apps/web/src/hooks/use-submissions.ts` (query key `['dashboard', 'performance-overview']`), chamando `apiClient<PerformanceOverview>('/dashboard/performance-overview')` (tipo de `@app/shared`).
  - Arquivos: `apps/web/src/hooks/use-dashboard.ts` (novo)
  - Pronto quando: o hook expõe dados tipados de `PerformanceOverview` e a chamada bate corretamente no endpoint da tarefa 17.
  - Depende de: 17

- [x] 19. Cards de nota média e taxa de acerto no dashboard
  - O que fazer: em `dashboard-overview.tsx`, chamar `usePerformanceOverview()` (tarefa 18). Trocar o card "Matérias" (ícone `BookOpen`, `totalMaterias`) por um card "Nota média" com `overall.averageScorePercentage` formatado como porcentagem (ex: `72%`), mostrando "—" durante o carregamento ou quando `null`. Adicionar um quarto card "Taxa de acerto" com `overall.accuracyRate`, mesmo tratamento de loading/vazio. Ajustar o grid de `sm:grid-cols-3` para `sm:grid-cols-2 lg:grid-cols-4`. Manter os cards "Turmas" e "Provas" como estão. O gráfico "Turmas por matéria" (e `totalMaterias`/`buildSubjectData`) continuam existindo até a tarefa 20 removê-los.
  - Arquivos: `apps/web/src/components/dashboard/dashboard-overview.tsx`
  - Pronto quando: com professor que já corrigiu provas, o dashboard mostra nota média e taxa de acerto reais (validado manualmente); sem nenhuma correção, os dois cards novos mostram "—" sem erro no console.
  - Depende de: 18

- [x] 20. Substituir gráfico "Turmas por matéria" por "Desempenho por turma"
  - O que fazer: em `dashboard-overview.utils.ts`, remover `buildSubjectData` (e `MAX_SUBJECTS`, se ficar sem uso) e adicionar `buildClassroomPerformanceData(byClassroom: PerformanceOverview['byClassroom'])`, ordenando por `averageScorePercentage` crescente (pior desempenho primeiro) e limitando a uma constante nova `MAX_CLASSROOMS_IN_CHART = 6`. Em `dashboard-overview.tsx`, trocar o card "Turmas por matéria" (`BarChart` com `subjectData`) por "Desempenho por turma", usando `buildClassroomPerformanceData(performanceOverview?.byClassroom ?? [])`, eixo X com `classroomName`, eixo Y de 0 a 100, `ChartTooltip` com `suffix="%"` — mesmo componente visual, só trocando os dados. Estado vazio (nenhuma turma com correção completed) segue o padrão existente de mensagem no lugar do gráfico (ex: "Corrija provas para ver o desempenho por turma."). O gráfico "Crescimento de turmas" continua como está.
  - Arquivos: `apps/web/src/components/dashboard/dashboard-overview.tsx`, `apps/web/src/components/dashboard/dashboard-overview.utils.ts`, `apps/web/src/components/dashboard/dashboard-overview.utils.test.ts` (novo)
  - Pronto quando: com 2+ turmas com submissões completed e notas médias diferentes, o gráfico mostra as turmas da pior para a melhor nota média com tooltip em `%`; sem nenhuma correção completed aparece a mensagem de estado vazio; teste unitário cobre `buildClassroomPerformanceData` (ordenação e limite).
  - Depende de: 19

- [ ] 21. Validação manual ponta a ponta das métricas de desempenho no dashboard
  - O que fazer: corrigir ao menos duas provas de turmas diferentes (uma com nota alta, outra com nota baixa, incluindo ao menos uma questão errada e uma que caia em revisão manual) e conferir que o dashboard mostra nota média, taxa de acerto e o gráfico "Desempenho por turma" condizentes com os dados reais; conferir que uma submissão `needs_review` ainda não revisada manualmente não entra nesses números.
  - Arquivos: n/a — validação manual, sem alteração de código nesta tarefa
  - Pronto quando: os valores exibidos no dashboard batem com o cálculo manual esperado para o cenário de teste usado.
  - Depende de: 16, 17, 18, 19, 20

## Feature: Identificação do aluno na correção (com sugestão por turma)

### Contexto

Hoje `corrigir-prova.tsx:97` chama `createSubmission.mutate(undefined, ...)` — a submissão nasce sem nenhum vínculo com um aluno. A coluna `studentIdentifier` já existe em `submissions` (`packages/db/src/schema/submissions.ts:24`) e o backend já aceita esse campo em `createSubmissionBodySchema` (`create-submission-schema.ts`), mas o frontend nunca preenche. Resultado: o professor corrige, vê a nota na tela do `CorrigirProvaResultado`, e se não anotar em outro lugar, a informação de quem é o aluno se perde — o que esvazia o requisito do próprio `docs/requisitos.md` de o app apoiar o professor a "transcrever para seu diário de classe oficial".

A captura tem que ser por turma, não por prova: um aluno faz várias provas ao longo do ano na mesma turma, e o nome digitado numa prova só serve de sugestão nas provas seguintes se a busca olhar a turma inteira, não uma prova isolada. Hoje isso não é possível de forma confiável porque `studentIdentifier` só existe amarrado a `submissions.examId` — não há como listar "quem já respondeu algo nesta turma" sem passar por todas as provas dela.

**Decisão de escopo:** sem tabela `students`, sem tela de cadastro, sem exigir preenchimento. O nome é texto livre com autocomplete alimentado pelos nomes já usados nas provas anteriores da mesma turma — meramente para reduzir fragmentação por digitação divergente ("João Silva" vs. "Joao S."), não para virar gestão de matrícula. Isso respeita o corte de escopo já registrado em `docs/requisitos.md` ("Sem Gestão de Alunos"). Sem uma tabela `students`, a normalização é best-effort: dois nomes digitados de forma diferente continuam sendo dois registros distintos — o autocomplete reduz a fragmentação, não a elimina.

**Achado importante do levantamento do código real:** o tipo compartilhado `Submission` (`packages/shared/src/types/submission.ts`) já tem `studentIdentifier: string | null` — exibir esse campo depois de capturado (Trilha C) não depende de nenhuma mudança de schema ou de tipo, só de UI. Por isso as tarefas 26 e 27 não dependem tecnicamente da 25, mesmo que só fiquem com dado real para mostrar depois que ela existir.

Sem exibir o nome depois de capturado, a feature não fecha o loop — por isso a Trilha C mostra o identificador no resultado imediato e na listagem de submissões da prova (endpoint `GET /exams/:examId/submissions` já existe em `list-submissions.ts` e nunca é consumido pelo frontend hoje).

**Caminho crítico:** 22 → 23 → 24 → 25 (endpoint de sugestões → hook → autocomplete → gravação do nome). A Trilha C (26, 27) não tem dependência técnica de schema/tipo com a Trilha B e pode ser feita em paralelo — só fica com dado real para mostrar depois que a 25 existir.

**Conflito de arquivo sinalizado:** 24 e 25 editam o mesmo arquivo (`corrigir-prova.tsx`) — 25 depende do estado (`studentName`) criado em 24, por isso são sequenciais, não devem ser executadas em paralelo.

### Tarefas

**Trilha A — Backend: sugestões de nome por turma**

- [x] 22. Endpoint de sugestões de aluno por turma
  - O que fazer: criar `GET /classrooms/:classroomId/students`, retornando um array de `studentIdentifier` distintos já usados em submissões de qualquer prova daquela turma, ordenados por uso mais recente primeiro. Seguir o padrão de `get-classroom.ts`: primeiro buscar a turma e validar `classroom.teacherId === user.id` (senão `NotFoundError`), só então rodar a query de sugestões usando `classroomId` já validado. Query: `submissionsTable` `innerJoin` `examsTable` (`examsTable.id = submissionsTable.examId`), `where(and(eq(examsTable.classroomId, classroomId), isNotNull(submissionsTable.studentIdentifier)))`, `groupBy(submissionsTable.studentIdentifier)`, `orderBy(desc(sql`max(${submissionsTable.createdAt})`))` — helpers `and`/`eq`/`isNotNull`/`desc`/`sql` todos vêm do barrel `@app/db`.
  - Arquivos: `apps/api/src/modules/classrooms/list-classroom-students.ts` (novo, `listClassroomStudentsModule`), `apps/api/src/modules/classrooms/list-classroom-students-schema.ts` (novo, `listClassroomStudentsParamsSchema` com `classroomId: z.uuid(...)`), `apps/api/src/modules/classrooms/list-classroom-students.test.ts` (novo), `apps/api/src/modules/classrooms/classroom-routes.ts` (nova rota `GET /:classroomId/students`)
  - Pronto quando: chamar o endpoint com uma turma que tem 2 provas corrigidas, cada uma com alunos parcialmente repetidos, retorna a lista sem duplicata e sem os `null`, ordenada pela submissão mais recente daquele nome; teste automatizado cobre isolamento por `teacherId` (turma de outro professor retorna 404, nunca vaza nomes); teste usa as factories reais (`make-classroom`, `make-exam`, `make-submission`), sem mocks de banco.
  - Depende de: nenhuma

**Trilha B — Frontend: capturar o nome na correção (caminho crítico)**

- [x] 23. Hook de sugestões de aluno
  - O que fazer: `useClassroomStudentSuggestions(classroomId: string)` em `apps/web/src/hooks/use-classrooms.ts`, seguindo o mesmo padrão de `useClassroom` (query key `['classrooms', classroomId, 'students']`, `enabled: Boolean(classroomId)`), chamando `apiClient<string[]>(`/classrooms/${classroomId}/students`)`.
  - Arquivos: `apps/web/src/hooks/use-classrooms.ts`
  - Pronto quando: o hook retorna a lista tipada de strings e cacheia por `classroomId`, batendo corretamente no endpoint da tarefa 22.
  - Depende de: 22

- [x] 24. Campo "Nome do aluno (opcional)" com autocomplete na tela de intro da correção
  - O que fazer: na tela `step === 'intro'` de `corrigir-prova.tsx` (linhas 146-193), adicionar um estado `studentName` e um `Input` (label "Nome do aluno (opcional)") logo acima do botão "Iniciar correção", usando `useClassroomStudentSuggestions(turmaId)` (tarefa 23) para alimentar um `<datalist>` nativo associado via `list="student-suggestions"` no `Input` (o componente `Input` de `@app/ui` já repassa props desconhecidas para o `<input>` nativo — não precisa de um componente de combobox novo). O campo é sempre opcional: não bloqueia nem exige preenchimento para habilitar "Iniciar correção".
  - Arquivos: `apps/web/src/components/dashboard/corrigir-prova.tsx`
  - Pronto quando: na tela de intro, digitar parte do nome de um aluno já corrigido antes na mesma turma mostra ele como sugestão do `<datalist>`; o campo aceita normalmente um nome novo que não está na lista; deixar em branco não impede iniciar a correção.
  - Depende de: 23

- [x] 25. Passar o nome capturado para `createSubmission`
  - O que fazer: em `handleStart` (`corrigir-prova.tsx:96-106`), trocar `createSubmission.mutate(undefined, ...)` por `createSubmission.mutate(studentName.trim() || undefined, ...)`, usando o estado `studentName` criado na tarefa 24. Sem mudança de contrato em `useCreateSubmission` (`use-submissions.ts:18-26`), que já aceita `studentIdentifier?: string`.
  - Arquivos: `apps/web/src/components/dashboard/corrigir-prova.tsx`
  - Pronto quando: corrigir uma prova preenchendo o nome grava `studentIdentifier` na submissão (conferível via `GET /submissions/:id`); corrigir sem preencher continua funcionando como hoje (`studentIdentifier: null`).
  - Depende de: 24

**Trilha C — Fechar o loop: mostrar o nome depois de capturado (sem dependência técnica da Trilha B, paralela)**

- [x] 26. Exibir o nome do aluno no resultado imediato da correção
  - O que fazer: em `CorrigirProvaResultado` (`corrigir-prova-resultado.tsx`) ou no cabeçalho de resultado em `corrigir-prova.tsx` (bloco `Card variant="subtle"` com "Nota apurada", linhas 311-333), receber/usar `submission.studentIdentifier` (já existe no tipo `Submission`) e mostrar como título ou badge acima da nota, ex.: "Correção de {nome}" quando preenchido, ou "Correção sem identificação" quando `null`.
  - Arquivos: `apps/web/src/components/dashboard/corrigir-prova.tsx` e/ou `apps/web/src/components/dashboard/corrigir-prova-resultado.tsx`
  - Pronto quando: uma submissão com `studentIdentifier` preenchido mostra o nome na tela de resultado; uma submissão com `studentIdentifier: null` mostra o texto de "sem identificação", sem quebrar o layout existente. Pode ser validado com um registro de teste com o campo preenchido manualmente, mesmo antes da tarefa 25 estar pronta.
  - Depende de: nenhuma

- [x] 27. Listagem de submissões já corrigidas na página da prova
  - O que fazer: adicionar `useSubmissions(examId)` em `apps/web/src/hooks/use-submissions.ts` consumindo o `GET /exams/:examId/submissions` que já existe (`list-submissions.ts`, hoje sem nenhum consumidor no frontend), seguindo o padrão de `useQuery` do arquivo (query key `['submissions', 'byExam', examId]`). Renderizar em `ProvaDetail` (`prova-detail.tsx`), abaixo do cabeçalho e antes/depois de `ProvaResultado`, uma lista simples com nome (`studentIdentifier ?? 'Sem identificação'`), nota (`totalScore ?? '0.00'`), status e data — cada linha é um `Link` para `` `/dashboard/turmas/${turmaId}/provas/${examId}/corrigir?submissionId=${submission.id}` ``. Em `corrigir-prova.tsx`, ler esse `submissionId` da URL via `useSearchParams` (next/navigation): se presente, pular direto para `step: 'result'` com esse id (sem passar por `intro`/`capturing`/`review`) — o restante do fluxo de resultado (`useSubmission`, skeleton de carregamento, `CorrigirProvaResultado`) já funciona para qualquer submissão existente, sem mudança adicional.
  - Arquivos: `apps/web/src/hooks/use-submissions.ts`, `apps/web/src/components/dashboard/prova-detail.tsx`, `apps/web/src/components/dashboard/corrigir-prova.tsx`
  - Pronto quando: depois de corrigir 2 alunos da mesma prova, a página da prova lista os 2, com nome (ou "Sem identificação") e nota; clicar numa linha abre a tela de resultado daquela submissão específica sem refazer a correção.
  - Depende de: nenhuma

## Feature: Consertar o checkbox "Lembrar deste dispositivo por 30 dias" no login

### Contexto

Confirmado no código real: o checkbox de `entrar-form.tsx` é decorativo. `onSubmit` (linhas 52-65) lê `data.remember` do formulário mas só envia `email`/`password` para `POST /auth/sign-in` — o valor do checkbox é descartado antes de chegar na API. O schema compartilhado `signInWithEmailSchema` (`packages/shared/src/schemas/auth/sign-in-with-email-schema.ts`) é um `z.strictObject` sem nenhum campo de "lembrar", então mesmo que o frontend mandasse o valor, a API rejeitaria por campo extra. E `signInWithEmailModule` (`sign-in-with-email.ts:10-16`) chama `auth.api.signInEmail` só com `email`/`password`, nunca repassando a opção correspondente do better-auth.

**Achado importante do levantamento do código real:** o better-auth (`node_modules/better-auth`, v1.7.1) já suporta nativamente `rememberMe` no body de `signInEmail` — quando `rememberMe === false`, ele cria um cookie de sessão **não-persistente** (expira ao fechar o navegador) em vez do cookie persistente padrão; **o padrão do better-auth já é `rememberMe: true`** quando o campo não é enviado, ou seja, hoje toda sessão já nasce "persistente" por omissão — o bug do checkbox é não conseguir desligar isso, não precisar ligá-lo.

**Segundo achado, que muda o texto do fix:** a duração da sessão (`session.expiresIn`) nunca foi configurada em `apps/api/src/lib/auth/auth.ts` — não existe nenhuma chave `session: {...}` no objeto passado a `betterAuth(...)` (só existe `databaseHooks.session`, que é outra coisa). Isso faz o better-auth cair no padrão dele: **7 dias**, não 30. Ou seja, mesmo depois de religar o checkbox, marcar "lembrar por 30 dias" hoje resultaria numa sessão persistente de 7 dias — a própria promessa do texto continuaria falsa. Corrigir isso exige configurar `session.expiresIn` explicitamente, não só repassar `rememberMe`.

**Caminho crítico:** 29 → 30 → 31 (schema → backend → frontend). A tarefa 28 (duração da sessão) é uma config independente e pode ser feita a qualquer momento, em paralelo.

### Tarefas

- [x] 28. Configurar a sessão do better-auth para durar 30 dias
  - O que fazer: em `apps/api/src/lib/auth/auth.ts`, adicionar a chave `session: { expiresIn: 60 * 60 * 24 * 30 }` (30 dias em segundos) ao objeto passado para `betterAuth(...)` — hoje essa chave não existe e o better-auth usa o padrão dele de 7 dias. Isso é uma config global de duração máxima de sessão, não específica do checkbox: com ou sem "lembrar", nenhuma sessão deve durar mais que isso; sem essa mudança, ligar o checkbox como pedido na tarefa 30 continuaria resultando numa sessão de 7 dias, não 30. Não confundir com `databaseHooks.session`, que já existe e é um hook de auditoria/e-mail, não a config de duração.
  - Arquivos: `apps/api/src/lib/auth/auth.ts`
  - Pronto quando: um login (com ou sem "lembrar") gera um cookie de sessão cujo `maxAge`/expiração corresponde a 30 dias, não mais 7; teste automatizado cobre a config (ex.: inspecionar `auth.options.session.expiresIn` ou o cookie retornado por um sign-in de teste).
  - Depende de: nenhuma

- [x] 29. Adicionar campo `remember` ao schema compartilhado de sign-in
  - O que fazer: em `packages/shared/src/schemas/auth/sign-in-with-email-schema.ts`, adicionar `remember: z.boolean().optional().default(true)` ao `signInWithEmailSchema` (`z.strictObject`). O default `true` preserva o comportamento atual para qualquer chamada que não envie o campo (inclusive o teste existente `sign-in-with-email.test.ts`, cujo `makeSignInPayload()` não inclui `remember`) — hoje toda sessão já nasce persistente, então omitir o campo não pode mudar esse comportamento.
  - Arquivos: `packages/shared/src/schemas/auth/sign-in-with-email-schema.ts`
  - Pronto quando: `SignInWithEmailInput` passa a incluir `remember: boolean`; o teste existente de `POST /auth/sign-in` que não envia `remember` continua passando sem alteração (confirma que o default não quebrou nada).
  - Depende de: nenhuma

- [x] 30. Repassar `remember` como `rememberMe` para o better-auth
  - O que fazer: em `signInWithEmailModule` (`sign-in-with-email.ts:10-16`), extrair `remember` de `request.body` (agora tipado pela tarefa 29) e passar `rememberMe: remember` dentro de `body` na chamada a `auth.api.signInEmail` (mapeando o nome do campo — o schema compartilhado usa `remember` para casar com o campo do formulário em `entrar-form.tsx`; o better-auth espera `rememberMe`).
  - Arquivos: `apps/api/src/modules/auth/sign-in-with-email.ts`, `apps/api/src/modules/auth/sign-in-with-email.test.ts`
  - Pronto quando: um teste cobre que enviar `remember: false` no body de `POST /auth/sign-in` chama `auth.api.signInEmail` com `rememberMe: false` (mock de `auth.api.signInEmail`, mesmo padrão já usado no arquivo); enviar `remember: true` (ou omitir) chama com `rememberMe: true`.
  - Depende de: 29

- [x] 31. Frontend: enviar o valor do checkbox para a API
  - O que fazer: em `entrar-form.tsx`, remover o `.extend({ remember: z.boolean() })` local (linhas 29-31) e usar `signInWithEmailSchema` diretamente como resolver do formulário, já que o campo `remember` passa a existir no schema compartilhado (tarefa 29). Em `onSubmit` (linhas 52-65), incluir `remember: data.remember` no `body` enviado a `POST /auth/sign-in`, junto de `email`/`password`.
  - Arquivos: `apps/web/src/components/auth/entrar-form.tsx`
  - Pronto quando: desmarcar "Lembrar deste dispositivo por 30 dias" e fazer login grava um cookie de sessão não-persistente (expira ao fechar o navegador, verificável nas DevTools — sem `Expires`/`Max-Age`); deixar marcado (comportamento hoje já padrão) continua gerando cookie persistente, agora com validade de 30 dias (tarefa 28).
  - Depende de: 30
