# Corrige Go: kit de logo

**Ideia:** os cantos do scanner da câmera se fecham sobre um visto. A prova é escaneada e corrigida, num relance.

## Cores

| Nome | HEX | RGB | Uso |
|---|---|---|---|
| Linear Violet | `#6E56CF` | 110 86 207 | Símbolo, fundo do ícone do app, `theme-color` |
| Obsidian Dark | `#0C0D0E` | 12 13 14 | Nome no logo, fundos escuros |
| Soft Light | `#F8FAFC` | 248 250 252 | Fundo claro padrão |
| Branco | `#FFFFFF` | 255 255 255 | Símbolo e nome sobre o violeta |

- Contraste do branco sobre `#6E56CF`: 5,4:1 (passa AA também para texto).
- Contraste do violeta sobre `#0C0D0E`: 3,6:1 (passa o mínimo de 3:1 para gráficos). No fundo escuro, o nome fica branco.

## Tipografia

O nome usa **Plus Jakarta Sans Bold** (licença OFL, `source/font/OFL.txt`), com espaçamento entre letras de −2%. As letras estão convertidas em curvas nos SVGs, então não é preciso instalar a fonte para usar o logo. Para títulos no site, a mesma família combina bem.

## Arquivos

```
svg/
  corrigego-symbol-{violet,ink,black,white}.svg     símbolo (master, a partir de 32 px)
  corrigego-symbol-small-{violet,white}.svg         versão para tamanho pequeno (até 32 px): cantos e visto mais grossos
  corrigego-app-icon.svg                            símbolo branco sobre violeta, quadrado inteiro (o sistema aplica a máscara)
  corrigego-lockup-horizontal.svg                   principal: símbolo violeta + nome Obsidian, sobre claro
  corrigego-lockup-horizontal-{black,white}.svg     uma cor
  corrigego-lockup-horizontal-on-{violet,ink}.svg   com fundo (redes sociais, slides)
  corrigego-lockup-stacked[-white].svg              empilhado (telas de login, splash)
  corrigego-wordmark.svg                            só o nome
web/
  favicon.ico, favicon.svg, favicon-{16,32,48}.png, apple-touch-icon.png,
  icon-192.png, icon-512.png, maskable-512.png, site.webmanifest, head-snippet.html
png/
  versões horizontais em 1600 px, versões empilhadas, símbolo e ícone do app em 1024 px
source/
  build_kit.py   gera todos os SVGs:  python source/build_kit.py source/font/PlusJakartaSans.ttf svg
```

## No app (Next.js / web)

Copie o conteúdo de `web/` para `public/` e coloque no `<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#6E56CF">
```

No Next.js App Router, também dá para usar `app/icon.svg` (copie `web/favicon.svg`) e `app/apple-icon.png` (copie `web/apple-touch-icon.png`).

## Regras de uso

- **Área de proteção:** em volta do logo, deixe livre pelo menos a largura de um canto do scanner (1/4 da altura do símbolo).
- **Tamanho mínimo:** símbolo com 16 px (use a versão `small` até 32 px). Versão horizontal com 24 px de altura na tela ou 8 mm impressa.
- **Fundos aprovados:** Soft Light, branco, Obsidian e o violeta (em cima do violeta, sempre a versão branca).
- **Não faça:** mudar as cores, separar o visto dos cantos, girar o símbolo, aplicar sombra, contorno ou degradê, deformar o logo, ou recriar o nome com outra fonte.

## Pendências

- Busca de marca registrada (INPI) antes do lançamento.
- O símbolo "enquadrar + visto" é um padrão visual conhecido. A combinação com o nome e o violeta torna o conjunto próprio, mas vale fazer a busca com atenção.
