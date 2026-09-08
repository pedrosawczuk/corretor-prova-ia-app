"""Gera os gráficos (rosca e barras) usados no relatório de auditoria de segurança."""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

SEVERITY_COLORS = {
    "Crítica": "#B91C1C",
    "Alta": "#EA580C",
    "Média": "#D97706",
    "Baixa": "#2563EB",
    "Informativa": "#6B7280",
}
STRONG_POINT_COLOR = "#059669"

plt.rcParams["font.family"] = "DejaVu Sans"
plt.rcParams["text.color"] = "#1F2937"
plt.rcParams["axes.edgecolor"] = "#1F2937"


def donut_chart(counts: dict, out_path: str):
    labels = [k for k, v in counts.items() if v > 0]
    values = [v for v in counts.values() if v > 0]
    colors = [SEVERITY_COLORS[k] for k in labels]

    fig, ax = plt.subplots(figsize=(4.6, 4.6), dpi=200)
    wedges, _ = ax.pie(
        values,
        colors=colors,
        startangle=90,
        counterclock=False,
        wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2),
    )
    total = sum(values)
    ax.text(0, 0.08, str(total), ha="center", va="center", fontsize=30, fontweight="bold", color="#111827")
    ax.text(0, -0.18, "achados", ha="center", va="center", fontsize=12, color="#6B7280")

    legend_labels = [f"{l} ({v})" for l, v in zip(labels, values)]
    ax.legend(
        wedges,
        legend_labels,
        loc="center left",
        bbox_to_anchor=(1.02, 0.5),
        frameon=False,
        fontsize=11,
    )
    ax.set_aspect("equal")
    fig.tight_layout()
    fig.savefig(out_path, transparent=True, bbox_inches="tight")
    plt.close(fig)


def bar_chart(categories: list, out_path: str):
    names = [c[0] for c in categories]
    real_values = [c[1] for c in categories]
    colors = [c[2] for c in categories]
    max_real = max(real_values) if max(real_values) > 0 else 1
    draw_values = [v if v > 0 else max_real * 0.035 for v in real_values]

    fig, ax = plt.subplots(figsize=(8.6, 4.0), dpi=200)
    bars = ax.barh(names, draw_values, color=colors, height=0.55)

    for bar, v in zip(bars, real_values):
        ax.text(
            bar.get_width() + max_real * 0.03,
            bar.get_y() + bar.get_height() / 2,
            str(v),
            va="center",
            ha="left",
            fontsize=11,
            fontweight="bold",
            color="#111827",
        )

    ax.set_xlim(0, max_real * 1.2)
    ax.invert_yaxis()
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_visible(False)
    ax.tick_params(axis="y", length=0, labelsize=11)
    ax.tick_params(axis="x", length=0, labelsize=9, colors="#6B7280")
    ax.xaxis.grid(True, color="#E5E7EB", linewidth=0.8)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(out_path, transparent=True, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    severity_counts = {
        "Alta": 1,
        "Média": 0,
        "Baixa": 3,
        "Informativa": 3,
    }
    donut_chart(severity_counts, "charts/severity_donut.png")

    category_counts = [
        ("1. Isolamento (owner_id)", 0, STRONG_POINT_COLOR),
        ("2. Permissão no navegador", 2, SEVERITY_COLORS["Baixa"]),
        ("3. IDOR", 1, SEVERITY_COLORS["Alta"]),
        ("4. Chaves expostas", 4, SEVERITY_COLORS["Baixa"]),
        ("5. XSS / inputs", 0, STRONG_POINT_COLOR),
    ]
    bar_chart(category_counts, "charts/category_bar.png")
    print("charts generated")
