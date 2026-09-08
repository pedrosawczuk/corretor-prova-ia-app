# -*- coding: utf-8 -*-
"""
Gera o Relatório de Auditoria de Segurança (PDF) do projeto Gabarita / Corretor de Prova IA.

Uso:
    .venv/Scripts/python.exe generate_report.py

Regenera docs/security-audit/relatorio-auditoria-seguranca.pdf a partir dos achados
descritos neste arquivo. Os gráficos são produzidos por generate_charts.py.
"""

import datetime
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Frame,
    BaseDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_PDF = os.path.join(HERE, "relatorio-auditoria-seguranca.pdf")

REPORT_TITLE = "Relatório de Auditoria de Segurança — Gabarita (Corretor de Prova IA)"
REPORT_DATE = datetime.date(2026, 8, 31).strftime("%d/%m/%Y")

# ---------------------------------------------------------------------------
# Paleta
# ---------------------------------------------------------------------------
C_CRITICA = colors.HexColor("#B91C1C")
C_ALTA = colors.HexColor("#EA580C")
C_MEDIA = colors.HexColor("#D97706")
C_BAIXA = colors.HexColor("#2563EB")
C_INFO = colors.HexColor("#6B7280")
C_FORTE = colors.HexColor("#059669")
C_INK = colors.HexColor("#111827")
C_MUTED = colors.HexColor("#4B5563")
C_LIGHT = colors.HexColor("#F3F4F6")
C_BORDER = colors.HexColor("#E5E7EB")
C_PRIMARY = colors.HexColor("#4338CA")

SEVERITY_COLOR = {
    "Crítica": C_CRITICA,
    "Alta": C_ALTA,
    "Média": C_MEDIA,
    "Baixa": C_BAIXA,
    "Informativa": C_INFO,
}

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm

# ---------------------------------------------------------------------------
# Estilos
# ---------------------------------------------------------------------------
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    name="CoverTitle", fontName="Helvetica-Bold", fontSize=25, leading=30,
    textColor=C_INK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="CoverSub", fontName="Helvetica", fontSize=12.5, leading=17,
    textColor=C_MUTED, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="H1", fontName="Helvetica-Bold", fontSize=17, leading=21,
    textColor=C_INK, spaceBefore=4, spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="H2", fontName="Helvetica-Bold", fontSize=13, leading=16,
    textColor=C_PRIMARY, spaceBefore=14, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="H3", fontName="Helvetica-Bold", fontSize=11, leading=14,
    textColor=C_INK, spaceBefore=8, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="Body", fontName="Helvetica", fontSize=9.6, leading=14,
    textColor=C_INK, alignment=TA_JUSTIFY, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="BodySmall", fontName="Helvetica", fontSize=8.7, leading=12.5,
    textColor=C_MUTED, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="CodeBlock", fontName="Courier", fontSize=8, leading=11,
    textColor=C_INK, backColor=C_LIGHT, borderPadding=6,
    alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="TableCell", fontName="Helvetica", fontSize=8.4, leading=11.5,
    textColor=C_INK, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="TableCellMono", fontName="Courier", fontSize=7.8, leading=11,
    textColor=C_INK, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="MetaLabel", fontName="Helvetica-Bold", fontSize=9, leading=13,
    textColor=C_MUTED,
))
styles.add(ParagraphStyle(
    name="Quote", fontName="Helvetica-Oblique", fontSize=9.3, leading=13.5,
    textColor=C_MUTED, leftIndent=10, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="IssueTitle", fontName="Helvetica-Bold", fontSize=11, leading=14,
    textColor=colors.white, backColor=C_INK,
))
styles.add(ParagraphStyle(
    name="IssueMono", fontName="Courier", fontSize=7.6, leading=10.6,
    textColor=C_INK,
))
styles.add(ParagraphStyle(
    name="IssueBody", fontName="Helvetica", fontSize=8.6, leading=12.4,
    textColor=C_INK,
))


def sev_chip(sev: str):
    color = SEVERITY_COLOR.get(sev, C_INFO)
    t = Table([[sev.upper()]], colWidths=[2.35 * cm], rowHeights=[0.48 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.3),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ]))
    return t


# ---------------------------------------------------------------------------
# Cabeçalho / rodapé
# ---------------------------------------------------------------------------
def draw_header_footer(canv: pdfcanvas.Canvas, doc):
    canv.saveState()
    if doc.page > 1:
        canv.setStrokeColor(C_BORDER)
        canv.setLineWidth(0.6)
        canv.line(MARGIN, PAGE_H - 1.35 * cm, PAGE_W - MARGIN, PAGE_H - 1.35 * cm)
        canv.setFont("Helvetica", 8)
        canv.setFillColor(C_MUTED)
        canv.drawString(MARGIN, PAGE_H - 1.15 * cm, "Relatório de Auditoria de Segurança — Gabarita")
        canv.drawRightString(PAGE_W - MARGIN, PAGE_H - 1.15 * cm, REPORT_DATE)

    canv.setStrokeColor(C_BORDER)
    canv.setLineWidth(0.6)
    canv.line(MARGIN, 1.35 * cm, PAGE_W - MARGIN, 1.35 * cm)
    canv.setFont("Helvetica", 8)
    canv.setFillColor(C_MUTED)
    canv.drawString(MARGIN, 1.0 * cm, "Confidencial — uso interno")
    canv.drawRightString(PAGE_W - MARGIN, 1.0 * cm, f"Página {doc.page}")
    canv.restoreState()


def draw_cover(canv: pdfcanvas.Canvas, doc):
    canv.saveState()
    canv.setFillColor(C_PRIMARY)
    canv.rect(0, PAGE_H - 3.2 * cm, PAGE_W, 3.2 * cm, stroke=0, fill=1)
    canv.setFillColor(colors.white)
    canv.setFont("Helvetica-Bold", 13)
    canv.drawString(MARGIN, PAGE_H - 1.9 * cm, "GABARITA.APP")
    canv.setFont("Helvetica", 9.5)
    canv.drawString(MARGIN, PAGE_H - 2.55 * cm, "Auditoria de Segurança de Aplicação")

    canv.setFillColor(C_MUTED)
    canv.setFont("Helvetica", 8)
    canv.drawCentredString(PAGE_W / 2, 1.0 * cm, "Confidencial — uso interno")
    canv.restoreState()


# ---------------------------------------------------------------------------
# Documento
# ---------------------------------------------------------------------------
doc = BaseDocTemplate(
    OUT_PDF,
    pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=1.8 * cm, bottomMargin=1.8 * cm,
    title=REPORT_TITLE,
    author="Auditoria de Segurança",
)

frame_cover = Frame(MARGIN, MARGIN, PAGE_W - 2 * MARGIN, PAGE_H - 2 * MARGIN, id="cover")
frame_body = Frame(MARGIN, MARGIN, PAGE_W - 2 * MARGIN, PAGE_H - 2 * MARGIN - 0.4 * cm, id="body")

doc.addPageTemplates([
    PageTemplate(id="Cover", frames=[frame_cover], onPage=draw_cover),
    PageTemplate(id="Body", frames=[frame_body], onPage=draw_header_footer),
])

story = []

# ===========================================================================
# CAPA
# ===========================================================================
story.append(Spacer(1, 5.0 * cm))
story.append(Paragraph(REPORT_TITLE, styles["CoverTitle"]))
story.append(Spacer(1, 0.3 * cm))
story.append(Paragraph(f"Data da auditoria: {REPORT_DATE}", styles["CoverSub"]))
story.append(Paragraph(
    "Escopo: monorepo pnpm — <b>apps/api</b> (backend Fastify), <b>apps/web</b> (frontend Next.js), "
    "<b>packages/db</b> (schema Drizzle ORM), <b>packages/env</b>, arquivos de configuração e deploy "
    "(.env, .env.example, docker-compose.dev.yml) e histórico Git.",
    styles["CoverSub"],
))
story.append(Spacer(1, 1.0 * cm))

stack_rows_raw = [
    ["Camada", "Tecnologia detectada"],
    ["Backend", "Fastify + TypeScript (Vertical Slice Architecture, 1 arquivo = 1 caso de uso)"],
    ["ORM / Banco", "Drizzle ORM (drizzle-orm/node-postgres) sobre PostgreSQL — sem RLS nativo"],
    ["Autenticação", "better-auth (email+senha, Google OAuth, 2FA/TOTP, plugin admin)"],
    ["Cache / Fila", "Redis (ioredis)"],
    ["Armazenamento", "MinIO (S3-compatible) — buckets privados com URL assinada"],
    ["Frontend", "Next.js (App Router) + React, Tailwind, componentes @app/ui"],
    ["E-mail", "Resend + @react-email/components (templates JSX)"],
    ["IA / Visão", "Google Gemini (geração de questões) + OpenCV/pdfjs (leitura de gabarito escaneado)"],
    ["Deploy local", "docker-compose.dev.yml (Postgres, Redis, MinIO) — sem CI/CD (.github/workflows) no repo"],
]
stack_rows = [stack_rows_raw[0]] + [
    [Paragraph(f"<b>{r[0]}</b>", styles["TableCell"]), Paragraph(r[1], styles["TableCell"])]
    for r in stack_rows_raw[1:]
]
t = Table(stack_rows, colWidths=[3.6 * cm, 12.4 * cm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), C_INK),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 8.6),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_LIGHT]),
    ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
]))
story.append(t)

# A metodologia começa em página própria (template "Body", com cabeçalho/rodapé
# padrão) para não correr o risco de a tabela transbordar por baixo da faixa
# roxa da capa caso não caiba inteira na página 1.
story.append(NextPageTemplate("Body"))
story.append(PageBreak())

story.append(Paragraph("Nota metodológica — mapeamento das categorias para esta stack", styles["H2"]))
method_rows = [
    ["Categoria solicitada", "Equivalente mapeado nesta stack"],
    ["1. Banco sem tranca (isolamento)", "Projeto não usa Supabase/RLS. O mecanismo de isolamento é manual: cada query "
     "em apps/api/src/modules deve filtrar por teacherId (turmas) ou creatorId (provas), derivados da sessão "
     "better-auth via getAuthenticatedUser(request) — nunca de parâmetro de URL/body."],
    ["2. Permissão definida no navegador", "Único papel do sistema é o admin do plugin better-auth (session.user.role). "
     "Verificado se toda rota /admin/* e /api/auth/admin/* revalida role==='admin' (+2FA +sessão fresca) no servidor, "
     "e não apenas oculta UI no Next.js."],
    ["3. IDOR", "Todo handler Fastify que recebe um :id (params) foi percorrido individualmente para confirmar "
     "que o recurso pai E os recursos aninhados (ex.: opção de questão dentro de uma questão) são validados "
     "contra o dono autenticado antes de leitura/escrita/exclusão."],
    ["4. Chaves expostas", ".env / .env.example / docker-compose.dev.yml / packages/env (validação Zod de startup) "
     "/ histórico Git (git log -p) / busca por padrões de chave (Google, Resend, Gemini) em todo o código rastreado."],
    ["5. Inputs sem tratamento (XSS)", "React (JSX) escapa por padrão; procurou-se por dangerouslySetInnerHTML, "
     "innerHTML, eval, renderização de markdown sem sanitização e href/src com URL controlada pelo usuário, "
     "tanto no frontend quanto nos templates de e-mail do backend (@react-email/components)."],
]
method_rows_p = [method_rows[0]] + [
    [Paragraph(f"<b>{r[0]}</b>", styles["TableCell"]), Paragraph(r[1], styles["TableCell"])]
    for r in method_rows[1:]
]
mt = Table(method_rows_p, colWidths=[4.3 * cm, 11.7 * cm])
mt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), C_PRIMARY),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, 0), 8.6),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_LIGHT]),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
]))
story.append(mt)
story.append(PageBreak())

# ===========================================================================
# RESUMO EXECUTIVO
# ===========================================================================
story.append(Paragraph("1. Resumo Executivo", styles["H1"]))
story.append(Paragraph(
    "A auditoria percorreu, arquivo por arquivo, os 5 módulos de domínio do backend "
    "(<b>classrooms</b>, <b>exams</b>, <b>submissions</b>, <b>subjects</b>, <b>admin</b>, <b>auth</b>), "
    "toda a camada de autenticação/autorização (better-auth, guarda de admin, 2FA), a camada de armazenamento "
    "(MinIO), os templates de e-mail, a validação de ambiente e todo o frontend em busca de sinks de HTML não "
    "sanitizado. Foram identificados <b>7 achados</b> — nenhum crítico, 1 de severidade alta (falha de "
    "autorização de objeto aninhado) e 6 de severidade baixa/informativa — sobre uma base de código que aplica "
    "de forma consistente o padrão de verificação de posse (<i>ownership check</i>) em praticamente toda a "
    "superfície de API.",
    styles["Body"],
))

story.append(Spacer(1, 0.3 * cm))
img_donut = Image(os.path.join(HERE, "charts", "severity_donut.png"))
img_donut._restrictSize(8.6 * cm, 8.6 * cm)
img_bar = Image(os.path.join(HERE, "charts", "category_bar.png"))
img_bar._restrictSize(9.6 * cm, 9.6 * cm)

chart_table = Table([[img_donut, img_bar]], colWidths=[8.7 * cm, 9.7 * cm])
chart_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ALIGN", (0, 0), (0, 0), "CENTER"),
    ("ALIGN", (1, 0), (1, 0), "CENTER"),
]))
story.append(chart_table)
cap_table = Table([[
    Paragraph("<b>Achados por severidade</b>", styles["BodySmall"]),
    Paragraph("<b>Achados por categoria</b> (1–5, conforme escopo solicitado)", styles["BodySmall"]),
]], colWidths=[8.7 * cm, 9.7 * cm])
story.append(cap_table)

story.append(Spacer(1, 0.4 * cm))
summary_rows = [["Severidade", "Qtde.", "Descrição"]]
summary_data = [
    ("Crítica", 0, "Nenhum achado crítico (sem RCE, sem bypass total de autenticação, sem exposição pública de dados de terceiros)."),
    ("Alta", 1, "Falha de autorização de objeto aninhado (IDOR) em edição de alternativa de questão."),
    ("Média", 0, "Nenhum achado de severidade média."),
    ("Baixa", 3, "Guarda de admin por handler sem hook central; defaults inseguros no docker-compose de desenvolvimento; validação de startup não rejeita segredos padrão conhecidos em produção."),
    ("Informativa", 3, "Higiene de segredos (.env local e .env.example) e ausência de checagem de sessão no servidor para o layout privado do dashboard (a API já protege os dados de qualquer forma)."),
]
for sev, qty, desc in summary_data:
    summary_rows.append([sev_chip(sev), str(qty), Paragraph(desc, styles["TableCell"])])
sw = Table(summary_rows, colWidths=[3.0 * cm, 1.4 * cm, 12.2 * cm])
sw.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), C_INK),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 8.6),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ALIGN", (1, 0), (1, -1), "CENTER"),
    ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_LIGHT]),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
]))
story.append(sw)

story.append(PageBreak())

# ===========================================================================
# PONTOS FORTES / FRACOS
# ===========================================================================
story.append(Paragraph("2. Pontos Fortes e Pontos Fracos", styles["H1"]))
story.append(Paragraph("2.1 Pontos fortes (verificados, com evidência)", styles["H2"]))

strengths = [
    ("Isolamento por dono aplicado em 100% das rotas de leitura/listagem",
     "Todos os handlers de <b>classrooms</b>, <b>exams</b> e <b>submissions</b> (create, get, list, update, delete "
     "— 24 arquivos lidos integralmente) filtram explicitamente por <code>teacherId</code>/<code>creatorId</code> "
     "igual ao usuário autenticado, incluindo quando o dado vem de cache Redis (o campo de posse é revalidado "
     "após a leitura do cache). Ex.: apps/api/src/modules/classrooms/list-classrooms.ts:22-23, "
     "apps/api/src/modules/exams/get-exam.ts:22, apps/api/src/modules/submissions/fetch-owned-submission.ts:14."),
    ("Guarda de admin consistente (8/8 rotas) com defesa em profundidade",
     "Todo handler em apps/api/src/modules/admin/*.ts chama <code>getAuthenticatedAdmin(request)</code> como "
     "primeira linha, que verifica role==='admin', 2FA ativo e frescor de sessão (≤30 min) — "
     "apps/api/src/lib/auth/get-authenticated-admin.ts:18-38. As rotas nativas do plugin admin do better-auth "
     "(/api/auth/admin/*, que por padrão só teriam o check de role da própria lib) recebem uma guarda adicional "
     "explícita em apps/api/src/app.ts:79-102 + apps/api/src/lib/auth/guard-admin-auth-routes.ts, fechando um "
     "gap documentado no próprio comentário do código."),
    ("Nenhum sink de HTML não sanitizado no frontend",
     "Busca exaustiva por dangerouslySetInnerHTML, innerHTML, __html, v-html, eval( e document.write em "
     "apps/web/src, packages/ui e packages/shared não retornou nenhuma ocorrência. Não há biblioteca de "
     "markdown/HTML rendering no projeto. Toda a interpolação de dados do usuário passa por JSX (auto-escapado)."),
    ("Templates de e-mail seguros por construção",
     "Os 5 templates em apps/api/src/lib/mail/templates/*.tsx usam @react-email/components — texto do usuário "
     "(nome, dispositivo, IP) é sempre interpolado como filho de &lt;Text&gt;, nunca concatenado em HTML bruto."),
    ("Segredos carregados só de variável de ambiente, com validação de startup",
     "packages/env/src/index.ts:29 exige BETTER_AUTH_SECRET (min 1 caractere, sem valor default) via schema Zod; "
     "o processo falha ao iniciar (dbEnvSchema.parse / apiEnvSchema.parse) se DATABASE_URL, REDIS_URL ou "
     "BETTER_AUTH_SECRET estiverem ausentes. Nenhum fallback tipo <code>process.env.X || 'valor-fixo'</code> foi "
     "encontrado para segredos de produção."),
    (".env nunca foi versionado",
     "<code>.env</code> está listado em .gitignore:69 e `git ls-files` confirma que só .env.example está "
     "rastreado; `git log --all --diff-filter=A -- .env` não retornou nenhum commit em todo o histórico."),
    ("Revogação de sessão validada no lado do servidor pela própria lib de auth",
     "revoke-session.ts encaminha o token para better-auth; o handler da lib "
     "(node_modules/better-auth/dist/api/routes/session.mjs:398-400) só apaga a sessão se "
     "session.userId === ctx.context.session.user.id — um usuário não consegue revogar sessão de outro."),
    ("Object storage de dados sensíveis é privado, com URL assinada de curta duração",
     "A policy pública do bucket MinIO (apps/api/src/lib/storage/storage.ts:24-37) libera GetObject apenas para "
     "o prefixo avatars/*. Fotos de folhas de resposta (submission-pages/*) e PDFs de gabarito travado "
     "(exam-templates/*) não têm policy pública — o acesso é sempre via presignedGetObject de 1 hora, gerado "
     "só depois do ownership check em fetchOwnedSubmission."),
    ("Proteção contra open redirect no login social e nenhuma injeção de SQL",
     "signInWithSocialSchema (apps/api/src/modules/auth/sign-in-with-social-schema.ts:6-18) restringe callbackURL "
     "à origem de BETTER_AUTH_URL. Nenhuma query com sql.raw ou interpolação de string foi encontrada em todo "
     "apps/api/src — 100% das queries usam o construtor Drizzle parametrizado (eq, inArray etc.)."),
    ("Script de seed recusa rodar em produção",
     "apps/api/src/scripts/seed.ts:135-140 verifica <code>env.NODE_ENV === 'prod'</code> e aborta o processo "
     "(<code>process.exit(1)</code>) antes de criar contas de teste com senha fixa conhecida — o único lugar do "
     "código que já implementa exatamente o tipo de guarda de startup recomendado na seção 4 para os demais "
     "segredos padrão do projeto."),
]

for title, body in strengths:
    story.append(KeepTogether([
        Paragraph(f"✓ {title}", styles["H3"]),
        Paragraph(body, styles["Body"]),
    ]))

story.append(Paragraph("2.2 Pontos fracos (risco central)", styles["H2"]))
weaknesses = [
    ("Autorização de objeto aninhado quebrada em 1 endpoint de escrita",
     "apps/api/src/modules/exams/update-question.ts valida a posse da <i>prova</i> e da <i>questão</i>, mas "
     "atualiza cada <code>question_options</code> usando o <code>id</code> enviado no corpo da requisição sem "
     "confirmar que essa opção pertence à questão validada — permitindo, em tese, sobrescrever a alternativa de "
     "outro professor. Ver achado detalhado na seção 4."),
    ("Guarda de admin depende de disciplina por arquivo, não de um hook central",
     "Hoje a cobertura é 8/8, mas nada no roteador (apps/api/src/modules/admin/admin-routes.ts) obriga uma nova "
     "rota futura a chamar getAuthenticatedAdmin — o padrão já usado no catch-all /api/auth/admin/* "
     "(preHandler central) não foi replicado para /admin/*."),
    ("Segredos de terceiros vivos em texto plano em .env local + defaults fracos herdáveis",
     "O .env local contém chaves de API que parecem válidas (Google OAuth, Resend, Gemini, BETTER_AUTH_SECRET); "
     "embora nunca commitadas, isso é um ponto de exposição caso o arquivo seja copiado manualmente. "
     "docker-compose.dev.yml e .env.example também usam credenciais padrão triviais (postgres/postgres, "
     "minioadmin/minioadmin) sem aviso explícito de \"nunca usar em produção\"."),
    ("Validação de ambiente não rejeita segredos padrão conhecidos, mesmo em produção",
     "packages/env/src/index.ts:15-52 garante presença/formato das variáveis via Zod, mas não recusa valores "
     "iguais aos defaults de desenvolvimento (ex.: MINIO_SECRET_KEY='minioadmin', "
     "POSTGRES_PASSWORD='postgres') quando NODE_ENV='prod' — diferente do próprio apps/api/src/scripts/seed.ts, "
     "que já implementa esse tipo de guarda para a senha de seed."),
]
for title, body in weaknesses:
    story.append(KeepTogether([
        Paragraph(f"✗ {title}", styles["H3"]),
        Paragraph(body, styles["Body"]),
    ]))

story.append(PageBreak())

# ===========================================================================
# ACHADOS DETALHADOS
# ===========================================================================
story.append(Paragraph("3. Achados Detalhados por Categoria", styles["H1"]))


def finding_block(sev, category, file_line, title, description, code, evidence_note=None, exploit=None, condition=None):
    header_table = Table(
        [[sev_chip(sev), Paragraph(f"<b>{title}</b>", styles["TableCell"])]],
        colWidths=[2.5 * cm, 13.9 * cm],
    )
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
    ]))
    flow = [
        header_table,
        Spacer(1, 3),
        Paragraph(f"<font color='#4338CA'><b>{file_line}</b></font> · categoria: {category}", styles["BodySmall"]),
        Spacer(1, 4),
        Paragraph(description, styles["Body"]),
    ]
    if code:
        flow.append(Paragraph(code.replace("\n", "<br/>"), styles["CodeBlock"]))
    if exploit:
        flow.append(Paragraph(f"<b>Por que é explorável:</b> {exploit}", styles["Body"]))
    if condition:
        flow.append(Paragraph(f"<b>Condição de explorabilidade:</b> {condition}", styles["Body"]))
    if evidence_note:
        flow.append(Paragraph(evidence_note, styles["BodySmall"]))
    flow.append(Spacer(1, 10))
    return KeepTogether(flow)


story.append(Paragraph("3.1 Categoria 1 — Banco sem tranca (isolamento de dono)", styles["H2"]))
story.append(Paragraph(
    "<b>Nenhum achado.</b> Não aplicável no formato Supabase/RLS: o projeto usa PostgreSQL puro via Drizzle ORM, "
    "sem políticas RLS. O mecanismo de isolamento equivalente é o filtro manual por <code>teacherId</code>/"
    "<code>creatorId</code> em cada query, obtido de <code>getAuthenticatedUser(request)</code> — nunca de um "
    "parâmetro de URL. Foram lidos integralmente os 24 arquivos de caso de uso de classrooms/exams/submissions "
    "e todos aplicam o filtro corretamente em toda operação de listagem, agregação e exportação (ver evidências "
    "na seção 2.1). O único gap de autorização encontrado no projeto é de granularidade mais fina (objeto "
    "aninhado dentro de um recurso já validado) e está classificado na categoria 3 — IDOR, abaixo.",
    styles["Body"],
))

story.append(Paragraph("3.2 Categoria 2 — Permissão definida no navegador", styles["H2"]))
story.append(finding_block(
    sev="Baixa",
    category="2. Permissão no navegador / arquitetura de autorização",
    file_line="apps/api/src/modules/admin/admin-routes.ts (todas as rotas) · apps/api/src/lib/auth/get-authenticated-admin.ts:18",
    title="Checagem de privilégio de admin é replicada por handler, sem hook central no roteador",
    description=(
        "O frontend oculta a navegação e as páginas de admin (apps/web/src/app/(admin)/admin/layout.tsx:20 e 24) "
        "e o backend <b>revalida corretamente</b> em todos os 8 handlers atuais de apps/api/src/modules/admin/*.ts, "
        "cada um chamando <code>await getAuthenticatedAdmin(request)</code> como primeira instrução. Isso não é, "
        "hoje, um bypass — é uma fragilidade estrutural: <code>admin-routes.ts</code> registra as rotas sem nenhum "
        "<code>preHandler</code> que force essa checagem, então a proteção depende inteiramente de cada novo "
        "arquivo lembrar de chamar a função manualmente. O próprio projeto já reconhece esse risco: o catch-all "
        "<code>/api/auth/admin/*</code> (rotas nativas do plugin admin do better-auth) recebe uma guarda "
        "centralizada em apps/api/src/app.ts:79-102 exatamente para não depender de disciplina por handler — o "
        "mesmo padrão não foi replicado para as rotas de negócio em /admin/*."
    ),
    code="// admin-routes.ts registra as rotas sem preHandler central:\n"
         "export function adminRoutes(app: FastifyInstance) {\n"
         "  app.get('/overview', ADMIN_ROUTE_OPTIONS, getAdminOverviewModule)\n"
         "  // ... nenhuma verificação aqui; getAuthenticatedAdmin() só roda\n"
         "  // porque CADA módulo chama a função manualmente na 1a linha",
    exploit=(
        "Não há exploit hoje (cobertura 8/8 confirmada por leitura integral de todos os arquivos do módulo). "
        "O risco é de regressão: uma rota futura adicionada a admin-routes.ts sem a chamada manual ficaria "
        "acessível a qualquer usuário autenticado (ou até anônimo) sem que nenhum teste de integração aponte "
        "isso automaticamente, pois nada no roteador Fastify reforça o requisito."
    ),
    condition="Só vira exploit se uma rota nova for adicionada sem chamar getAuthenticatedAdmin — não há evidência de que isso já ocorreu.",
))
story.append(finding_block(
    sev="Informativa",
    category="2. Permissão no navegador",
    file_line="apps/web/src/app/(private)/layout.tsx:1-23",
    title="Layout do dashboard privado não repete a checagem de sessão no servidor feita pelo layout de admin",
    description=(
        "Diferente de apps/web/src/app/(admin)/admin/layout.tsx (que chama <code>getAuthSession()</code> e "
        "redireciona no servidor antes de renderizar), o layout de <code>(private)</code> — usado pelas páginas "
        "de turmas, provas e submissões do professor comum — não faz nenhuma verificação de sessão; ele apenas "
        "monta o shell (sidebar) e renderiza os filhos diretamente."
    ),
    code="export default function PrivateLayout({ children }: { children: React.ReactNode }) {\n"
         "  return (\n"
         "    <SidebarProvider>\n"
         "      <DashboardSidebar />\n"
         "      <SidebarInset>{children}</SidebarInset>\n"
         "    </SidebarProvider>\n"
         "  )\n"
         "}",
    exploit=(
        "Não expõe dado nenhum: toda chamada de dados do dashboard passa por apps/web/src/lib/api-client.ts com "
        "<code>credentials: 'include'</code>, e o backend autentica cada requisição de forma independente via "
        "<code>getAuthenticatedUser(request)</code> (confirmado em todos os handlers de classrooms/exams/"
        "submissions na seção 2.1). Um visitante não autenticado só veria o esqueleto vazio da página (sidebar "
        "sem dados), nunca informação de outro usuário."
    ),
    condition="Puramente uma inconsistência de defesa em profundidade / UX (flash do shell antes do redirecionamento client-side em caso de 401) — não é, por si só, explorável.",
))

story.append(Paragraph("3.3 Categoria 3 — IDOR (Insecure Direct Object Reference)", styles["H2"]))
story.append(finding_block(
    sev="Alta",
    category="3. IDOR",
    file_line="apps/api/src/modules/exams/update-question.ts:51-59",
    title="Atualização de alternativa (question_options) por ID do corpo sem validar posse em relação à questão",
    description=(
        "O handler valida corretamente que <code>examId</code> pertence ao professor autenticado (linha 32) e que "
        "<code>questionId</code> pertence a esse <code>examId</code> (linha 41). Porém, ao aplicar as alterações "
        "de cada alternativa, o loop usa o <code>option.id</code> vindo do corpo da requisição diretamente na "
        "cláusula WHERE, sem checar se esse <code>option.id</code> realmente pertence à <code>questionId</code> "
        "já validada — diferente do padrão correto aplicado em <code>update-correct-option.ts:47-53</code>, que "
        "explicitamente rejeita a requisição se <code>option.questionId !== questionId</code>."
    ),
    code="// update-question.ts:51-59\n"
         "for (const [index, option] of options.entries()) {\n"
         "  await tx\n"
         "    .update(questionOptionsTable)\n"
         "    .set({\n"
         "      text: option.text,\n"
         "      letter: letterForOptionIndex(question.type, index),\n"
         "    })\n"
         "    .where(eq(questionOptionsTable.id, option.id))  // <- sem checar dono\n"
         "}\n\n"
         "// Contraste — o padrão CORRETO, já usado em update-correct-option.ts:47-53:\n"
         "const [option] = await db.select().from(questionOptionsTable)\n"
         "  .where(eq(questionOptionsTable.id, optionId))\n"
         "if (!option || option.questionId !== questionId) {\n"
         "  throw new NotFoundError('Alternativa não encontrada.')\n"
         "}",
    exploit=(
        "Um professor autenticado (qualquer conta, a barreira de entrada é só se cadastrar) pode enviar "
        "PATCH /exams/&lt;prova-própria&gt;/questions/&lt;questão-própria&gt; com corpo "
        "<code>{ statement: '...', options: [{ id: '&lt;uuid-de-outra-conta&gt;', text: 'texto malicioso' }] }</code>. "
        "A query final executa <code>UPDATE question_options SET text=..., letter=... WHERE id = &lt;uuid alheio&gt;</code>, "
        "sobrescrevendo o texto/letra de uma alternativa de <b>outro professor</b>, mesmo sem qualquer relação "
        "entre as duas contas. O schema de validação (packages/shared/.../update-question-schema.ts:17) só exige "
        "que <code>id</code> seja um UUID válido — não valida propriedade."
    ),
    condition=(
        "Exige conhecer (ou obter em algum outro fluxo) o UUID de uma question_option de outra conta — não há, "
        "hoje, nenhum endpoint do sistema que vaze esse UUID para um usuário não-dono. Ou seja: é uma falha real "
        "de autorização, mas a exploração prática atual depende de um vetor secundário de vazamento de ID "
        "(logs, integração futura, força bruta de UUID — inviável em escala). Deve ser corrigida independente da "
        "dificuldade atual de exploração, pois qualquer novo endpoint que devolva IDs de outras contas (ex.: "
        "exportação, integração, webhook) tornaria o ataque diretamente utilizável."
    ),
))

story.append(Paragraph("3.4 Categoria 4 — Chaves expostas (hardcode)", styles["H2"]))
story.append(finding_block(
    sev="Baixa",
    category="4. Chaves expostas",
    file_line="docker-compose.dev.yml:7-8, 45-46",
    title="Defaults inseguros herdáveis (${VAR:-default}) sem aviso de \"não usar em produção\"",
    description=(
        "docker-compose.dev.yml usa fallback do tipo <code>${POSTGRES_PASSWORD:-postgres}</code> e "
        "<code>${MINIO_ROOT_USER:-minioadmin}</code>/<code>${MINIO_ROOT_PASSWORD:-minioadmin}</code>. O arquivo é "
        "nomeado explicitamente \"dev\" e não há indício de que seja usado como artefato de deploy em produção "
        "(não há docker-compose.prod.yml nem pipeline de CI/CD no repositório). O risco é organizacional: nada "
        "impede alguém de reaproveitar este arquivo como base para um ambiente publicamente acessível sem trocar "
        "os defaults."
    ),
    code='POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}\n'
         'MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}\n'
         'MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}',
    exploit="Só é explorável se este compose (ou seus defaults) for promovido a um ambiente acessível pela rede sem sobrescrever as variáveis.",
    condition="Requer decisão operacional futura de reusar o compose de dev fora de localhost.",
))
story.append(finding_block(
    sev="Informativa",
    category="4. Chaves expostas",
    file_line=".env.example:35-36, 41-42",
    title="Credenciais padrão do MinIO como valor literal, em vez de placeholder vazio",
    description=(
        "Diferente das demais chaves sensíveis do arquivo (RESEND_API_KEY, GEMINI_API_KEY, GOOGLE_CLIENT_SECRET, "
        "que corretamente ficam em branco em .env.example), MINIO_ROOT_USER/MINIO_ACCESS_KEY/MINIO_SECRET_KEY já "
        "vêm preenchidos com <code>minioadmin</code>. Isso reduz o atrito para alguém copiar .env.example → .env "
        "e subir um ambiente com credencial pública e amplamente conhecida sem perceber."
    ),
    code=None,
    exploit=None,
    condition="Baixo risco isolado; some ao achado anterior (docker-compose) se o mesmo ambiente reutilizar ambos.",
))
story.append(finding_block(
    sev="Informativa",
    category="4. Chaves expostas",
    file_line=".env (arquivo local, não versionado)",
    title="Higiene de segredos: .env local contém chaves aparentemente válidas de serviços de terceiros",
    description=(
        "O arquivo .env local (confirmado fora do controle de versão — .gitignore:69-71 e "
        "<code>git log --all --diff-filter=A -- .env</code> sem nenhum resultado em todo o histórico) contém "
        "valores com formato de chave real para BETTER_AUTH_SECRET, GOOGLE_CLIENT_SECRET, RESEND_API_KEY e "
        "GEMINI_API_KEY. Os valores não são reproduzidos neste relatório. Não é uma vulnerabilidade de código, "
        "mas uma recomendação de higiene: se este arquivo já foi colado em algum chat, ticket ou repositório "
        "secundário, as chaves devem ser rotacionadas; para times, prefira um cofre de segredos "
        "(1Password, Doppler, Vault) em vez de compartilhar .env por fora do Git."
    ),
    code=None,
    exploit=None,
    condition=None,
))
story.append(finding_block(
    sev="Baixa",
    category="4. Chaves expostas",
    file_line="packages/env/src/index.ts:15-52",
    title="Validação de startup não rejeita valores de segredo iguais aos defaults conhecidos de desenvolvimento",
    description=(
        "O schema Zod de ambiente (<code>apiEnvSchema</code>) garante que as variáveis existam e tenham o "
        "formato certo, mas não recusa iniciar quando um valor bate com um default público conhecido "
        "(<code>MINIO_SECRET_KEY='minioadmin'</code>, <code>POSTGRES_PASSWORD='postgres'</code>, o "
        "<code>BETTER_AUTH_SECRET='minha-chave-secreta-dev'</code> de .env.example) mesmo com "
        "<code>NODE_ENV='prod'</code>. Contraste direto com apps/api/src/scripts/seed.ts:135-140, que já "
        "implementa exatamente esse tipo de guarda (recusa rodar com senha de teste fixa quando NODE_ENV='prod')."
    ),
    code="export const apiEnv = apiEnvSchema.parse(process.env)\n"
         "// nenhuma checagem de \"valor conhecido como inseguro\" é feita aqui,\n"
         "// diferente do guard explícito já usado em scripts/seed.ts:135-140",
    exploit="Amplia a janela do achado anterior (docker-compose): se um deploy real herdar esses defaults, nada no boot da aplicação recusa subir.",
    condition="Só se materializa combinado a um erro operacional de deploy com as variáveis de dev.",
))

story.append(KeepTogether([
    Paragraph("3.5 Categoria 5 — Inputs sem tratamento (XSS)", styles["H2"]),
    Paragraph(
        "<b>Nenhum achado.</b> Busca exaustiva (grep recursivo) por <code>dangerouslySetInnerHTML</code>, "
        "<code>innerHTML</code>, <code>__html</code>, <code>eval(</code>, <code>new Function(</code> e "
        "<code>document.write</code> em apps/web/src, packages/ui/src e packages/shared/src não encontrou nenhuma "
        "ocorrência. Não há biblioteca de renderização de markdown/HTML no projeto (react-markdown, rehype, remark) "
        "nem DOMPurify/sanitize-html — porque não há, hoje, nenhum ponto que precise deles: toda saída de dados do "
        "usuário passa por nós de texto JSX (auto-escapados pelo React) ou por componentes @react-email/components "
        "no backend (também JSX, também escapados). Todos os usos de atributo <code>href</code> dinâmico encontrados "
        "(apps/web/src/components/dashboard/*.tsx, admin-sidebar.tsx) constroem rotas internas do Next.js a partir "
        "de UUIDs da própria API — não há campo de texto livre do usuário alimentando um atributo href/src. Não "
        "aplicável / sem vetor de exploração identificado.",
        styles["Body"],
    ),
]))

story.append(PageBreak())

# ===========================================================================
# RECOMENDAÇÕES
# ===========================================================================
story.append(Paragraph("4. Recomendações Priorizadas", styles["H1"]))
recs = [
    ("P1", C_ALTA, "Corrigir o IDOR em update-question.ts",
     "Antes do UPDATE de cada alternativa, buscar as question_options existentes da questão (uma única query "
     "com WHERE questionId = :questionId) e validar que todo option.id do corpo pertence a esse conjunto — "
     "rejeitando a requisição inteira (400/404) caso qualquer ID não pertença. Replicar o padrão já usado em "
     "update-correct-option.ts:47-53."),
    ("P2", C_BAIXA, "Centralizar a guarda de admin com um preHandler no registro das rotas",
     "Registrar getAuthenticatedAdmin como preHandler na chamada app.register(adminRoutes, { prefix: '/admin' }) "
     "(ou via onRequest hook dentro de adminRoutes), como já é feito para /api/auth/admin/* em app.ts. Isso torna "
     "estruturalmente impossível esquecer a checagem numa rota futura, mesmo que os handlers atuais já a chamem "
     "corretamente."),
    ("P3", C_BAIXA, "Adicionar avisos explícitos de \"não usar em produção\" aos defaults de desenvolvimento",
     "Adicionar comentário no topo de docker-compose.dev.yml e trocar os valores literais de MINIO_ROOT_USER/"
     "MINIO_ACCESS_KEY/MINIO_SECRET_KEY em .env.example por placeholders vazios ou claramente marcados como "
     "\"trocar antes de expor a rede\", alinhando com o padrão já usado para RESEND_API_KEY/GEMINI_API_KEY."),
    ("P4", C_BAIXA, "Replicar em packages/env o guard de startup que já existe em scripts/seed.ts",
     "Adicionar um refine/checagem pós-parse em apiEnvSchema que falhe o boot quando NODE_ENV='prod' e algum "
     "segredo bater com um valor padrão conhecido (postgres, minioadmin, minha-chave-secreta-dev) — mesmo "
     "espírito da guarda que já existe em apps/api/src/scripts/seed.ts:135-140 para a senha de seed."),
    ("P5", C_INFO, "Adotar um cofre de segredos para o time e rotacionar chaves que já circularam fora do Git",
     "Migrar .env de desenvolvimento compartilhado para um gerenciador de segredos (1Password, Doppler, Vault) e "
     "rotacionar BETTER_AUTH_SECRET/GOOGLE_CLIENT_SECRET/RESEND_API_KEY/GEMINI_API_KEY caso o arquivo .env local "
     "já tenha sido compartilhado por qualquer canal fora do controle de versão. Opcionalmente, replicar em "
     "apps/web/src/app/(private)/layout.tsx a mesma checagem de sessão server-side já usada no layout de admin, "
     "por consistência de defesa em profundidade."),
]
for tag, color, title, body in recs:
    tag_cell = Table([[tag]], colWidths=[1.3 * cm], rowHeights=[0.55 * cm])
    tag_cell.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    row = Table(
        [[tag_cell, Paragraph(f"<b>{title}</b><br/><br/>{body}", styles["Body"])]],
        colWidths=[1.6 * cm, 14.8 * cm],
    )
    row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(row)

story.append(PageBreak())

# ===========================================================================
# ISSUES PARA O GITHUB
# ===========================================================================
story.append(Paragraph("5. Issues para o GitHub", styles["H1"]))
story.append(Paragraph(
    "Texto completo, em Markdown, pronto para copiar e colar em cada issue. Achados triviais e relacionados do "
    "tema \"defaults inseguros de desenvolvimento\" foram agrupados em uma única issue para evitar spam.",
    styles["Body"],
))


def issue_block(n, md_text):
    lines = md_text.strip("\n").split("\n")
    para = Paragraph("<br/>".join(l.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") for l in lines), styles["IssueMono"])
    box = Table(
        [[Paragraph(f"--- ISSUE {n} ---", styles["IssueTitle"])], [Spacer(1, 4)], [para], [Spacer(1, 2)],
         [Paragraph(f"--- FIM ISSUE {n} ---", styles["IssueTitle"])]],
        colWidths=[16.4 * cm],
    )
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.7, C_BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return KeepTogether(box)


issue_1 = """
# [Segurança] IDOR: update-question permite sobrescrever alternativa de outro professor

**Labels sugeridas:** security, severity:high

## Descrição do problema
`updateQuestionModule` (apps/api/src/modules/exams/update-question.ts) valida que `examId` e `questionId`
pertencem ao professor autenticado, mas ao atualizar cada `question_options` usa o `option.id` recebido no
corpo da requisição diretamente na cláusula WHERE, sem confirmar que essa opção pertence a `questionId`.
Isso quebra o modelo de autorização por posse (ownership) usado em todo o resto do backend.

## Evidência
apps/api/src/modules/exams/update-question.ts:51-59
```ts
for (const [index, option] of options.entries()) {
  await tx
    .update(questionOptionsTable)
    .set({
      text: option.text,
      letter: letterForOptionIndex(question.type, index),
    })
    .where(eq(questionOptionsTable.id, option.id))
}
```
Compare com o padrão correto em apps/api/src/modules/exams/update-correct-option.ts:47-53, que explicitamente
rejeita `option.questionId !== questionId`.

## Impacto
Um professor autenticado que conheça (ou consiga, por qualquer vetor futuro) o UUID de uma `question_option`
de outra conta pode sobrescrever seu texto/letra via PATCH em uma prova/questão que ele próprio possui.
Corrupção de dados de terceiros sem relação com a conta atacante.

## Sugestão de correção
Antes do loop de update, buscar todas as `question_options` da `questionId` já validada e checar que
`options.every(o => existingIds.has(o.id))`; rejeitar com 404/400 caso contrário. Reaproveitar exatamente o
padrão de `update-correct-option.ts`.

## Critérios de aceite
- [ ] PATCH /exams/:examId/questions/:questionId com um `options[].id` que não pertence a `questionId` retorna 404 (ou 400) e não altera nenhuma linha no banco
- [ ] Teste de integração cobrindo o caso acima adicionado em update-question.spec.ts
- [ ] Fluxo legítimo (todas as opções pertencentes à questão) continua funcionando sem regressão
"""

issue_2 = """
# [Segurança] Guarda de admin sem preHandler central no roteador /admin

**Labels sugeridas:** security, severity:low, tech-debt

## Descrição do problema
Cada handler em apps/api/src/modules/admin/*.ts chama `getAuthenticatedAdmin(request)` manualmente como
primeira linha. Hoje a cobertura é 8/8, mas não há nenhum preHandler/onRequest no registro das rotas
(admin-routes.ts) que torne essa checagem obrigatória — uma rota nova poderia ser adicionada sem a chamada e
ficaria acessível sem verificação de privilégio. O catch-all /api/auth/admin/* já usa o padrão correto
(guarda centralizada em app.ts:79-102) e deveria ser replicado aqui.

## Evidência
apps/api/src/modules/admin/admin-routes.ts (registro de rotas sem preHandler)
apps/api/src/lib/auth/get-authenticated-admin.ts:18-38 (função chamada manualmente em cada handler)

## Impacto
Nenhum hoje (cobertura confirmada). Risco de regressão silenciosa em features futuras.

## Sugestão de correção
Adicionar `getAuthenticatedAdmin` como preHandler no `app.register(adminRoutes, { prefix: '/admin' })` em
app.ts, ou como `onRequest` hook dentro de `adminRoutes()`.

## Critérios de aceite
- [ ] Uma rota admin hipotética sem chamada manual a getAuthenticatedAdmin ainda assim exige role==='admin' + 2FA + sessão fresca
- [ ] Handlers existentes continuam funcionando (chamada manual duplicada não quebra nada, ou é removida)
"""

issue_3 = """
# [Segurança] Defaults inseguros de desenvolvimento sem aviso (docker-compose + .env.example)

**Labels sugeridas:** security, severity:low, documentation

## Descrição do problema
Agrupando dois achados triviais do mesmo tema — credenciais padrão previsíveis usadas como fallback/exemplo:

1. docker-compose.dev.yml usa `${POSTGRES_PASSWORD:-postgres}`, `${MINIO_ROOT_USER:-minioadmin}` e
   `${MINIO_ROOT_PASSWORD:-minioadmin}` sem nenhum aviso de que esses defaults nunca devem chegar a um
   ambiente acessível pela rede.
2. .env.example preenche MINIO_ROOT_USER/MINIO_ACCESS_KEY/MINIO_SECRET_KEY com o valor literal `minioadmin`,
   diferente das demais chaves sensíveis do arquivo (RESEND_API_KEY, GEMINI_API_KEY, GOOGLE_CLIENT_SECRET),
   que corretamente ficam em branco.

## Evidência
docker-compose.dev.yml:7-8, 45-46
.env.example:35-36, 41-42

## Impacto
Baixo isoladamente (arquivo é nomeado "dev", sem CI/CD ou compose de produção no repo). Torna-se relevante
apenas se alguém reusar este arquivo/valores como base para um ambiente exposto publicamente.

## Sugestão de correção
- Adicionar comentário no topo de docker-compose.dev.yml: "Apenas para desenvolvimento local — nunca expor estas credenciais em rede pública."
- Trocar os valores literais de MINIO_* em .env.example por placeholder vazio ou por um valor claramente marcado como "trocar antes de subir".

## Critérios de aceite
- [ ] docker-compose.dev.yml tem aviso explícito no cabeçalho
- [ ] .env.example não contém nenhuma credencial MinIO literal reaproveitável
"""

issue_4 = """
# [Segurança] Validação de ambiente não rejeita segredos padrão conhecidos em produção

**Labels sugeridas:** security, severity:low

## Descrição do problema
`apiEnvSchema` (packages/env/src/index.ts:15-52) garante presença e formato das variáveis via Zod, mas não
recusa iniciar quando um valor bate com um default público conhecido (`MINIO_SECRET_KEY='minioadmin'`,
`POSTGRES_PASSWORD='postgres'`, `BETTER_AUTH_SECRET='minha-chave-secreta-dev'` de .env.example) mesmo com
`NODE_ENV='prod'`. O próprio projeto já implementa esse tipo de guarda em outro lugar
(apps/api/src/scripts/seed.ts:135-140, que recusa rodar com senha de seed fixa quando NODE_ENV='prod') — só
não foi replicado para o carregamento de ambiente da API.

## Evidência
packages/env/src/index.ts:15-52
```ts
export const apiEnv = apiEnvSchema.parse(process.env)
// nenhuma checagem de "valor conhecido como inseguro" é feita aqui,
// diferente do guard explícito já usado em scripts/seed.ts:135-140
```

## Impacto
Amplia a janela de exploração de qualquer segredo/credencial default (ex.: docker-compose.dev.yml, ver issue
de defaults inseguros): se um deploy real herdar essas variáveis por engano, nada no boot da aplicação recusa
subir com elas.

## Sugestão de correção
Adicionar um `refine`/checagem pós-parse em `apiEnvSchema` que falhe o boot (`process.exit(1)` ou lançar) quando
`NODE_ENV==='prod'` e algum segredo bater com uma lista de valores padrão conhecidos (`postgres`, `minioadmin`,
`minha-chave-secreta-dev`), no mesmo espírito da guarda já existente em `apps/api/src/scripts/seed.ts:135-140`.

## Critérios de aceite
- [ ] Com NODE_ENV='prod' e qualquer segredo monitorado igual a um valor padrão conhecido, o processo falha ao iniciar com uma mensagem clara
- [ ] Com NODE_ENV!=='prod', o comportamento atual (sem restrição) é preservado
- [ ] Teste unitário cobrindo ao menos um caso de rejeição e um caso de boot normal
"""

for i, text in enumerate([issue_1, issue_2, issue_3, issue_4], start=1):
    story.append(issue_block(i, text))
    story.append(Spacer(1, 10))

doc.build(story)
print(f"PDF gerado em: {OUT_PDF}")
