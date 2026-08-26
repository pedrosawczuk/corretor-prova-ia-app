# Brand Identity & Design System Specification: CorretorProvaIa

> **Technical Design System Specification Document**
> Generated on: 2026-08-26 | Designed for AI code generators, LLM prompt engineering, frontend developers, and UI/UX designers.

---

## 1. Brand Color Palette (Primary & Secondary)

| Token Name | HEX Code | RGB (Screen) | CMYK (Print) | HSL | Semantic Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Linear Violet | `#6E56CF` | `110 86 207` | `47 58 0 19` | `252° 56% 57%` | Primary |
| Obsidian Dark | `#0C0D0E` | `12 13 14` | `14 7 0 95` | `210° 8% 5%` | Dark Canvas |
| Soft Light | `#F8FAFC` | `248 250 252` | `2 1 0 1` | `210° 40% 98%` | Light Canvas |

---

## 2. Automatic Tonal Gradients (50 to 950)

#### Linear Violet (#6E56CF)
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `#F6F5FA` | `#E9E7F4` | `#D3CDEA` | `#B5AADF` | `#9281D5` | `#6E56CF` | `#4E36B0` | `#3D2C81` | `#291E52` | `#181330` | `#0D0A19` |

#### Obsidian Dark (#0C0D0E)
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `#F7F7F8` | `#EAEBEC` | `#D4D6D8` | `#B6BABE` | `#969CA2` | `#757D84` | `#5C636A` | `#454A4F` | `#2A2E32` | `#171A1C` | `#0C0D0E` |

#### Soft Light (#F8FAFC)
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `#F8FAFC` | `#E6EDF4` | `#CAD9E8` | `#A8BFD7` | `#7FA1C3` | `#5380AC` | `#436689` | `#334D66` | `#233343` | `#151F28` | `#0C1217` |


---

## 3. Support & Functional Feedback Colors

| Token Name | HEX Code | RGB (Screen) | CMYK (Print) | Logical Role | Recommended Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Success | `#10B981` | `16 185 129` | `91 0 30 27` | Sucesso & Confirmação | Pagamentos aprovados, ações concluídas com sucesso e status positivos. |
| Warning | `#F59E0B` | `245 158 11` | `0 36 96 4` | Alerta & Atenção | Avisos intermediários, alterações que requerem cautela e limites de uso. |
| Danger / Alert | `#EF4444` | `239 68 68` | `0 72 72 6` | Erro & Ação Crítica | Erros de formulário, exclusão de dados e falhas de conexão. |
| Info | `#3B82F6` | `59 130 246` | `76 47 0 4` | Informação & Dicas | Dicas de navegação, novidades da plataforma e comunicados neutros. |

---

## 4. Typography System

| Role | Font Family | Category | Default Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Primary Font | **Sora** | `sans-serif` | Weight: `400` | Line Height: `1.5` | Letter Spacing: `0px` |

---

## 5. Physical Design Foundations & Spatial Tokens

### Border Radii Scale:
- `radius-sm`: `4px` (Micro elements, chips, tags, and small badges)
- `radius-md`: `8px` (Standard inputs, buttons, and form controls)
- `radius-lg`: `12px` (Cards, panels, popovers, and containers)
- `radius-xl`: `16px` (Modals, dialog overlays, and slide-in drawers)
- `radius-full`: `9999px` (Pill buttons and circular avatar frames)

### Spacing & Grid Metrics (Base 4px Scale):
- `space-xs`: `4px`
- `space-sm`: `8px`
- `space-md`: `16px`
- `space-lg`: `24px`
- `space-xl`: `32px`
- `space-xxl`: `48px`

### Border Metrics:
- `border-width`: `1px`

### Box Shadow & Elevation System:
- `shadow-sm`: `0px 1px 2px 0px rgba(0, 0, 0, 0.12)`
- `shadow-md`: `0px 3px 6px -1px rgba(0, 0, 0, 0.16)`
- `shadow-lg`: `0px 8px 16px -2px rgba(0, 0, 0, 0.22)`
- `shadow-xl`: `0px 16px 28px -4px rgba(0, 0, 0, 0.28)`

---

## 6. Official Iconography Guidelines

- **Official Icon Package:** `Lucide Icons` (`lucide-react`)
- **Default Stroke Style:** Continuous outline with stroke width of `1.5px`.
- **Optical Bounding Box:** Base `24x24px` square frame with `2px` internal optical padding.

### Standard Icon Size Metrics:
| Size Token | Pixel Dimension | Hierarchy Level | Recommended Usage Context |
| :--- | :--- | :--- | :--- |
| `icon-sm` | `16px` | Micro (sm) | Badges, inputs inline e microtooltips |
| `icon-md` | `20px` | Padrão (md) | Botões, itens de menu e tabelas |
| `icon-lg` | `24px` | Destaque (lg) | Navegação principal e cabeçalhos de card |
| `icon-xl` | `32px` | Hero (xl) | Banners de destaque e cards de feature |
| `icon-2xl` | `48px` | Display (2xl) | Estados vazios e ilustrações funcionais |

---

*Generated automatically by Brand Guide Studio.*
