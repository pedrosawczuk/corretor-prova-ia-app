import fitz
import os

HERE = os.path.dirname(os.path.abspath(__file__))
pdf_path = os.path.join(HERE, "relatorio-auditoria-seguranca.pdf")
out_dir = os.path.join(HERE, "verify_pages")
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Páginas: {doc.page_count}")
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.6, 1.6))
    out_path = os.path.join(out_dir, f"page-{i+1:02d}.png")
    pix.save(out_path)
    print(f"  page {i+1}: {page.rect.width:.0f}x{page.rect.height:.0f}pt -> {out_path}")
doc.close()
