# TASKS.md

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

- [ ] 8. Mensagens de erro de upload específicas por causa
  - O que fazer: `handleCapture` em `corrigir-prova.tsx:103-112` hoje sempre mostra o mesmo toast genérico ("Não foi possível enviar a foto. Tente novamente.") em qualquer falha de `useUploadSubmissionPage`. Trocar para exibir a mensagem real retornada pelo backend via `toastApiError` (já existem mensagens específicas em `upload-submission-page.ts`, e as novas das tarefas 2 e 3), caindo no texto genérico só quando a API não retornar mensagem utilizável.
  - Arquivos: `apps/web/src/components/dashboard/corrigir-prova.tsx`
  - Pronto quando: escolher da galeria uma foto de resolução baixa (tarefa 2) mostra no toast a mensagem específica do backend, não a genérica.
  - Depende de: 2, 3, 7

- [ ] 9. Validação manual ponta a ponta (câmera + galeria + HEIC)
  - O que fazer: rodar manualmente o fluxo completo em um navegador (mobile real e/ou desktop com dispositivo simulado): iniciar correção, tirar 1 foto pela câmera para a página 1, escolher da galeria uma foto para a página 2, revisar as duas prévias, corrigir e conferir o resultado. Repetir o teste escolhendo especificamente um arquivo `.heic` real de iPhone (ou fixture equivalente) para validar a tarefa 1 de ponta a ponta pelo app, não só pelo teste automatizado de backend.
  - Arquivos: n/a — validação manual, sem alteração de código nesta tarefa
  - Pronto quando: o fluxo completo funciona sem erros com fotos de origens mistas (câmera + galeria), e uma foto `.heic` é aceita e lida corretamente até o relatório final.
  - Depende de: 1, 4, 6, 7, 8

**Trilha C — Robustez da leitura (pipeline OpenCV) — paralela à Trilha A/B**

- [ ] 10. Persistir diagnóstico por página quando os marcadores não são encontrados
  - O que fazer: hoje `readPage` (`read-submission-answers.ts:250-289`, especificamente a linha `if (!found) return` em 264-265) falha silenciosamente quando os 4 marcadores de canto não são localizados — a página inteira vira "sem marcação" (fill ratio 0) para todas as alternativas, indistinguível de "o aluno realmente não marcou nada". Mudar `readSubmissionAnswers` para também retornar, por página, se os marcadores foram encontrados (ex: `Map<pageNumber, { markersFound: boolean }>`), e em `process-submission.ts` gravar esse diagnóstico no campo `rawOcrPayload` (jsonb, já existe em `submission_pages` — hoje sempre `null`, nenhuma migration necessária) do registro `submission_pages` correspondente.
  - Arquivos: `apps/api/src/lib/vision/read-submission-answers.ts`, `apps/api/src/modules/submissions/process-submission.ts`
  - Pronto quando: ao processar uma submissão em que uma página não tem os 4 marcadores detectados, o `submission_pages.rawOcrPayload` daquela página fica preenchido com `{ markersFound: false }` (ou equivalente); teste unitário cobre o caso via o retorno estruturado de `readSubmissionAnswers`.
  - Depende de: nenhuma

- [ ] 11. Avisar o professor quando uma página específica falhou no alinhamento
  - O que fazer: usar o diagnóstico da tarefa 10 para, na resposta de `processSubmissionModule` (e no tipo `Submission` compartilhado em `packages/shared/src/types/submission.ts`), sinalizar quais páginas tiveram falha de alinhamento. Hoje o professor só vê "N questão(ões) precisam da sua revisão manual" (`corrigir-prova.tsx:127-132`), sem saber se a causa foi uma foto ilegível (recuperável tirando outra foto) ou marcações realmente ambíguas. Adicionar um aviso específico na tela de resultado (`corrigir-prova.tsx` / `corrigir-prova-resultado.tsx`), ex.: "A página 2 não pôde ser alinhada automaticamente — todas as questões dela precisam de revisão manual".
  - Arquivos: `apps/api/src/modules/submissions/process-submission.ts`, `packages/shared/src/types/submission.ts`, `apps/web/src/components/dashboard/corrigir-prova.tsx`, `apps/web/src/components/dashboard/corrigir-prova-resultado.tsx`
  - Pronto quando: numa submissão de teste com uma página sem marcadores detectáveis, a tela de resultado mostra o aviso específico citando o número da página, distinto do aviso genérico de questões pendentes.
  - Depende de: 10

- [ ] 12. Segunda tentativa com margem de busca de marcador mais ampla
  - O que fazer: `CORNER_SEARCH_MARGIN = 0.32` (`read-submission-answers.ts:42`) é fixo; uma foto levemente descentralizada além dessa margem faz a página inteira falhar sem necessidade. Em `locateAlignmentMarkers`, se a primeira tentativa com a margem padrão não encontrar os 4 marcadores, tentar novamente com uma margem maior (ex: `0.45`) antes de desistir e marcar a página como `markersFound: false`. A margem maior só entra como fallback, sem afetar o caso padrão.
  - Arquivos: `apps/api/src/lib/vision/read-submission-answers.ts`
  - Pronto quando: um fixture de página com marcadores fora de 0.32 mas dentro de 0.45 passa a ser lido corretamente (antes falhava); teste de regressão garante que o caso padrão continua sendo resolvido já na primeira tentativa.
  - Depende de: nenhuma

- [ ] 13. Testes com imagens degradadas (blur, inclinação, iluminação irregular)
  - O que fazer: `read-submission-answers.test.ts` hoje só cobre páginas geradas em SVG, perfeitamente alinhadas e limpas. Adicionar fixtures derivados do mesmo gerador aplicando (via `sharp`) blur gaussiano moderado, rotação leve (ex: 5°), e um gradiente de brilho simulando iluminação desigual — cobrindo: leitura ainda correta sob blur/rotação leve dentro da tolerância; marcador cortado/ausente retorna `markersFound: false` sem lançar exceção (usa o retorno estruturado da tarefa 10); o retry da tarefa 12 é exercitado por um fixture desalinhado dentro da margem estendida.
  - Arquivos: `apps/api/src/lib/vision/read-submission-answers.test.ts`
  - Pronto quando: os cenários acima têm teste passando, cobrindo tanto o caminho degradado que ainda funciona quanto a falha esperada e sinalizada de marcador ausente.
  - Depende de: 10, 12

**Trilha D — Documentação (paralela, sem bloquear nada)**

- [ ] 14. Atualizar RF09 em `docs/requisitos.md` para incluir a opção de galeria
  - O que fazer: RF09 hoje descreve apenas "o app abre a câmera em tela cheia... para capturar fotos". Atualizar a redação para refletir que o professor pode tirar foto ou escolher uma imagem da galeria para cada página.
  - Arquivos: `docs/requisitos.md`
  - Pronto quando: RF09 menciona as duas fontes de imagem disponíveis.
  - Depende de: 5

- [ ] 15. Corrigir RF10/RNF02 em `docs/requisitos.md` para refletir a implementação real
  - O que fazer: confirmado durante o levantamento desta feature que não existe chamada a Vision LLM nem streaming (SSE/WebSocket) na correção — `POST /submissions/:submissionId/process` é síncrono e a leitura é 100% OpenCV determinístico (`read-submission-answers.ts`). RF10 ("Feedback em Tempo Real... Corrigindo questão 1...") e RNF02 ("Uso de SSE ou WebSockets") descrevem algo que nunca foi implementado. Ajustar os dois itens para descrever o comportamento real (resposta única após processamento síncrono) ou, se o streaming ainda for uma meta futura, marcar explicitamente como "planejado, não implementado" em vez de deixar parecer que já existe.
  - Arquivos: `docs/requisitos.md`
  - Pronto quando: RF10/RNF02 não descrevem mais um comportamento (Vision LLM, streaming) que diverge do código atual.
  - Depende de: nenhuma
