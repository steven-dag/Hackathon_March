"""
PDF Generator for .birdie Digitalisierungspläne
Uses ReportLab to create professional PDFs.
"""

import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

# ─── Color Palette ────────────────────────────────────────────────────────────
BLACK      = colors.HexColor("#0a0a0a")
GREEN      = colors.HexColor("#4ADE80")
DARK_GRAY  = colors.HexColor("#374151")
MID_GRAY   = colors.HexColor("#6B7280")
LIGHT_GRAY = colors.HexColor("#F3F4F6")
WHITE      = colors.white


def _styles():
    base = getSampleStyleSheet()
    return {
        "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=22,
                             textColor=BLACK, spaceAfter=4, leading=26),
        "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=14,
                             textColor=BLACK, spaceBefore=14, spaceAfter=6, leading=18),
        "h3": ParagraphStyle("h3", fontName="Helvetica-Bold", fontSize=11,
                             textColor=BLACK, spaceBefore=8, spaceAfter=3, leading=14),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10,
                               textColor=DARK_GRAY, leading=15, spaceAfter=3),
        "caption": ParagraphStyle("caption", fontName="Helvetica", fontSize=8,
                                  textColor=MID_GRAY, leading=11),
        "bold": ParagraphStyle("bold", fontName="Helvetica-Bold", fontSize=10,
                               textColor=BLACK, leading=14),
        "green_label": ParagraphStyle("green_label", fontName="Helvetica-Bold",
                                      fontSize=8, textColor=GREEN, leading=10),
        "tag": ParagraphStyle("tag", fontName="Helvetica-Bold", fontSize=9,
                              textColor=WHITE, leading=11),
    }


def generate_plan_pdf(
    company: dict,
    assessment: dict,
    plan: dict,
) -> bytes:
    """
    Generate a PDF from company info, assessment and plan data.
    Returns raw PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=18*mm, bottomMargin=18*mm,
        title=f".birdie Digitalplan – {company.get('name', '')}",
    )

    s = _styles()
    story = []

    # ── HEADER BAR (simulated with a table) ──────────────────────────────────
    now = datetime.now().strftime("%d.%m.%Y")
    header_data = [[
        Paragraph("<b>.birdie</b>", ParagraphStyle("logo", fontName="Helvetica-Bold",
                  fontSize=16, textColor=WHITE)),
        Paragraph(f"Erstellt am {now}", ParagraphStyle("date", fontName="Helvetica",
                  fontSize=9, textColor=colors.HexColor("#9CA3AF"), alignment=TA_RIGHT)),
    ]]
    header_table = Table(header_data, colWidths=["60%", "40%"])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BLACK),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (0, -1), 12),
        ("RIGHTPADDING",  (-1, 0), (-1, -1), 12),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8*mm))

    # ── TITLE ─────────────────────────────────────────────────────────────────
    story.append(Paragraph("Ihr persönlicher Digitalplan", s["h1"]))
    story.append(Paragraph(
        f"Maßgeschneiderter 12-Monats-Fahrplan für <b>{company.get('name', '')}</b> "
        f"– erstellt mit KI-Analyse",
        s["body"]
    ))
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 5*mm))

    # ── COMPANY INFO ──────────────────────────────────────────────────────────
    story.append(Paragraph("Unternehmensdaten", s["h2"]))
    company_rows = [
        ["Firmenname", company.get("name", "–")],
        ["Branche", company.get("branche", "–")],
        ["Mitarbeiter", str(company.get("mitarbeiter_anzahl", "–"))],
        ["PLZ / Bundesland", f"{company.get('plz', '–')} {company.get('bundesland', '')}".strip()],
    ]
    company_table = Table(company_rows, colWidths=["35%", "65%"])
    company_table.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 0), (0, -1), MID_GRAY),
        ("TEXTCOLOR",     (1, 0), (1, -1), DARK_GRAY),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
    ]))
    story.append(company_table)
    story.append(Spacer(1, 5*mm))

    # ── ASSESSMENT SUMMARY ────────────────────────────────────────────────────
    story.append(Paragraph("Digitalstatus", s["h2"]))
    tools = ", ".join(assessment.get("aktuelle_tools", [])) or "–"
    schmerz = ", ".join(assessment.get("schmerz_punkte", [])) or "–"
    ziel = assessment.get("ziel", "–")
    grad_map = {1:"Kaum digital",2:"Erste Schritte",3:"Teilweise digital",
                4:"Weitgehend digital",5:"Voll digitalisiert"}
    grad = grad_map.get(assessment.get("digitalisierungs_grad", 1), "–")
    budget = assessment.get("budget_vorstellung") or "Nicht angegeben"

    assess_rows = [
        ["Aktuell genuzte Tools", tools],
        ["Schmerzpunkte", schmerz],
        ["Ziel", ziel],
        ["Digitalisierungsgrad", grad],
        ["Budgetvorstellung", budget],
    ]
    assess_table = Table(assess_rows, colWidths=["35%", "65%"])
    assess_table.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 0), (0, -1), MID_GRAY),
        ("TEXTCOLOR",     (1, 0), (1, -1), DARK_GRAY),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
        ("WORDWRAP",      (1, 0), (1, -1), True),
    ]))
    story.append(assess_table)
    story.append(Spacer(1, 5*mm))

    # ── ZUSAMMENFASSUNG ───────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("Zusammenfassung", s["h2"]))
    story.append(Paragraph(plan.get("zusammenfassung", ""), s["body"]))
    story.append(Spacer(1, 5*mm))

    # ── 12-MONATS-PHASEN ──────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("12-Monats-Fahrplan", s["h2"]))

    phasen = plan.get("phasen", [])
    for phase in phasen:
        monat    = phase.get("monat", "")
        titel    = phase.get("titel", "")
        beschr   = phase.get("beschreibung", "")
        massn    = phase.get("massnahmen", [])
        kosten   = phase.get("kosten_geschaetzt")

        # Phase header row
        kosten_str = f"{int(kosten):,} EUR".replace(",", ".") if kosten else ""
        header_row = [[
            Paragraph(f"<b>{monat}</b>", ParagraphStyle("ph", fontName="Helvetica-Bold",
                      fontSize=9, textColor=WHITE)),
            Paragraph(f"<b>{titel}</b>", ParagraphStyle("pt", fontName="Helvetica-Bold",
                      fontSize=9, textColor=WHITE)),
            Paragraph(kosten_str, ParagraphStyle("pk", fontName="Helvetica",
                      fontSize=9, textColor=colors.HexColor("#9CA3AF"),
                      alignment=TA_RIGHT)),
        ]]
        phase_header = Table(header_row, colWidths=["22%", "55%", "23%"])
        phase_header.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), BLACK),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (-1, 0), (-1, -1), 8),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ]))

        # Phase body
        body_content = [Paragraph(beschr, s["body"])]
        for m in massn:
            body_content.append(Paragraph(f"• {m}", s["body"]))

        phase_body = Table([[body_content]], colWidths=["100%"])
        phase_body.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), LIGHT_GRAY),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (-1, 0), (-1, -1), 8),
        ]))

        story.append(KeepTogether([phase_header, phase_body, Spacer(1, 2*mm)]))

    story.append(Spacer(1, 5*mm))

    # ── KOSTENAUFSTELLUNG ─────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("Kostenaufstellung", s["h2"]))

    kosten_auf = plan.get("kosten_aufstellung", {})
    def fmt_eur(v):
        if not v: return "–"
        return f"{int(v):,} EUR".replace(",", ".")

    cost_rows = []
    for label, key in [("Entwicklung","entwicklung"),("Lizenzen","lizenzen"),
                        ("Beratung","beratung"),("Hardware","hardware")]:
        if kosten_auf.get(key):
            cost_rows.append([label, fmt_eur(kosten_auf[key])])
    cost_rows.append(["GESAMT", fmt_eur(kosten_auf.get("gesamt", 0))])
    if kosten_auf.get("foerderung_abzug"):
        cost_rows.append([f"Förderung (Abzug)", f"- {fmt_eur(kosten_auf['foerderung_abzug'])}"])
    if kosten_auf.get("eigenanteil"):
        cost_rows.append(["Ihr Eigenanteil", fmt_eur(kosten_auf["eigenanteil"])])

    cost_table = Table(cost_rows, colWidths=["60%", "40%"])
    ts = [
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",     (0, 0), (-1, -1), DARK_GRAY),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("ALIGN",         (1, 0), (1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID",          (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
    ]
    # Bold GESAMT row
    gesamt_idx = next((i for i, r in enumerate(cost_rows) if r[0] == "GESAMT"), None)
    if gesamt_idx is not None:
        ts += [
            ("FONTNAME",    (0, gesamt_idx), (-1, gesamt_idx), "Helvetica-Bold"),
            ("TEXTCOLOR",   (0, gesamt_idx), (-1, gesamt_idx), BLACK),
            ("LINEABOVE",   (0, gesamt_idx), (-1, gesamt_idx), 1, BLACK),
        ]
    # Green Eigenanteil row
    eigen_idx = next((i for i, r in enumerate(cost_rows) if "Eigenanteil" in r[0]), None)
    if eigen_idx is not None:
        ts += [
            ("FONTNAME",    (0, eigen_idx), (-1, eigen_idx), "Helvetica-Bold"),
            ("TEXTCOLOR",   (0, eigen_idx), (-1, eigen_idx), colors.HexColor("#16a34a")),
            ("BACKGROUND",  (0, eigen_idx), (-1, eigen_idx), colors.HexColor("#f0fdf4")),
        ]
    cost_table.setStyle(TableStyle(ts))
    story.append(cost_table)
    story.append(Spacer(1, 5*mm))

    # ── NÄCHSTE SCHRITTE ──────────────────────────────────────────────────────
    naechste = plan.get("naechste_schritte", [])
    if naechste:
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
        story.append(Spacer(1, 4*mm))
        story.append(Paragraph("Nächste Schritte", s["h2"]))
        for i, step in enumerate(naechste, 1):
            story.append(Paragraph(f"{i}. {step}", s["body"]))
        story.append(Spacer(1, 5*mm))

    # ── EMPFOHLENE FÖRDERUNGEN ────────────────────────────────────────────────
    foerderungen = plan.get("empfohlene_foerderungen", [])
    if foerderungen:
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY))
        story.append(Spacer(1, 4*mm))
        story.append(Paragraph("Empfohlene Förderprogramme", s["h2"]))
        story.append(Paragraph(", ".join(foerderungen), s["body"]))
        story.append(Spacer(1, 5*mm))

    # ── FOOTER ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_GRAY))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "Erstellt von .birdie · KI-gestützter Digitalisierungsberater · birdie.app",
        ParagraphStyle("footer", fontName="Helvetica", fontSize=8,
                       textColor=MID_GRAY, alignment=TA_CENTER)
    ))

    doc.build(story)
    return buffer.getvalue()
