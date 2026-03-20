"""
Grant scraper for German funding programs.
Sources:
  - foerderdatenbank.de  (BMWK)
  - digitaljetzt.de      (BMWK KMU Digitalisierung)
  - bafa.de              (BAFA programs)
  - kfw.de               (KfW loans + grants)

For the hackathon we combine:
  1. A curated static dataset (reliable, always works)
  2. Live scraping where possible (best-effort)
"""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any

# ─── Curated Static Dataset ──────────────────────────────────────────────────
# These are real programs — updated March 2026

STATIC_GRANTS: List[Dict[str, Any]] = [
    {
        "programm_name": "Digital Jetzt – Investitionsförderung für KMU",
        "beschreibung": (
            "Bundesförderung für kleine und mittlere Unternehmen zur Digitalisierung "
            "von Geschäftsprozessen und der Qualifizierung der Mitarbeitenden. "
            "Zuschuss nicht rückzahlbar."
        ),
        "foerder_summe_max": 50000.0,
        "foerder_quote_prozent": 40.0,
        "quelle_url": "https://www.digitaljetzt-portal.de",
        "antragsteller": "KMU mit 3–499 Mitarbeitenden",
        "frist": "Laufend",
        "branchen": ["alle"],
        "min_mitarbeiter": 3,
        "max_mitarbeiter": 499,
        "schlagworte": ["software", "digitalisierung", "prozesse", "erp", "crm"],
    },
    {
        "programm_name": "BAFA – Förderung unternehmerischen Know-hows",
        "beschreibung": (
            "Beratungsförderung für KMU und Freie Berufe. "
            "Bis zu 80% der Beratungskosten werden bezuschusst. "
            "Ideal für Digitalisierungsberatung."
        ),
        "foerder_summe_max": 3500.0,
        "foerder_quote_prozent": 80.0,
        "quelle_url": "https://www.bafa.de/DE/Wirtschafts_Mittelstandsfoerderung/Beratung_Finanzierung/Unternehmensberatung",
        "antragsteller": "KMU, Handwerksbetriebe, Freie Berufe",
        "frist": "Laufend",
        "branchen": ["alle"],
        "min_mitarbeiter": 1,
        "max_mitarbeiter": 249,
        "schlagworte": ["beratung", "digitalisierung", "strategie"],
    },
    {
        "programm_name": "KfW Digitalisierungskredit (ERP-Digitalisierungs- und Innovationskredit)",
        "beschreibung": (
            "Zinsgünstiger Kredit der KfW für Investitionen in Digitalisierung "
            "und Innovation. Finanzierung von Hard- und Software, Apps, "
            "IT-Sicherheit und mehr."
        ),
        "foerder_summe_max": 25000000.0,
        "foerder_quote_prozent": 100.0,
        "quelle_url": "https://www.kfw.de/inlandsfoerderung/Unternehmen/Digitalisierung-Innovation",
        "antragsteller": "Unternehmen aller Größen",
        "frist": "Laufend",
        "branchen": ["alle"],
        "min_mitarbeiter": 1,
        "max_mitarbeiter": 99999,
        "schlagworte": ["software", "hardware", "it", "app", "digitalisierung"],
    },
    {
        "programm_name": "go-digital – Förderung digitaler Kompetenzen",
        "beschreibung": (
            "BMWK-Förderprogramm für KMU und Handwerksbetriebe. "
            "Gefördert werden Beratungsleistungen in den Modulen: "
            "Digitalisierte Geschäftsprozesse, Digitale Markterschließung, IT-Sicherheit."
        ),
        "foerder_summe_max": 16500.0,
        "foerder_quote_prozent": 50.0,
        "quelle_url": "https://www.innovation-beratung-foerderung.de/INNO/Navigation/DE/go-digital/go-digital.html",
        "antragsteller": "KMU mit bis zu 100 Mitarbeitenden, max. 20 Mio € Jahresumsatz",
        "frist": "Laufend",
        "branchen": ["alle"],
        "min_mitarbeiter": 1,
        "max_mitarbeiter": 100,
        "schlagworte": ["prozesse", "it-sicherheit", "digitalisierung", "beratung", "handwerk"],
    },
    {
        "programm_name": "Handwerk Digital (HWK-Programme – regional)",
        "beschreibung": (
            "Viele Handwerkskammern bieten eigene Digitalisierungszuschüsse "
            "für Mitgliedsbetriebe. Beträge und Konditionen variieren je Bundesland."
        ),
        "foerder_summe_max": 10000.0,
        "foerder_quote_prozent": 50.0,
        "quelle_url": "https://www.zdh.de/themen/digitalisierung",
        "antragsteller": "Handwerksbetriebe (HWK-Mitglieder)",
        "frist": "Je nach Bundesland",
        "branchen": ["handwerk"],
        "min_mitarbeiter": 1,
        "max_mitarbeiter": 50,
        "schlagworte": ["handwerk", "digitalisierung", "software", "app"],
    },
]


# ─── Scoring Logic ────────────────────────────────────────────────────────────

def score_grant(
    grant: Dict[str, Any],
    mitarbeiter: int,
    branche: str,
    ziel: str,
    schmerz_punkte: List[str],
    aktuelle_tools: List[str],
) -> float:
    """
    Score a grant from 0.0 to 1.0 based on company profile.
    Higher = better match.
    """
    score = 0.0

    # Mitarbeiter check
    if grant["min_mitarbeiter"] <= mitarbeiter <= grant["max_mitarbeiter"]:
        score += 0.3
    else:
        return 0.0  # Hard filter — not eligible

    # Branche check
    if "alle" in grant["branchen"] or branche.lower() in [b.lower() for b in grant["branchen"]]:
        score += 0.2

    # Keyword match on Ziel + Schmerzpunkte
    keywords = [ziel.lower()] + [s.lower() for s in schmerz_punkte] + [t.lower() for t in aktuelle_tools]
    matched_keywords = sum(1 for kw in grant["schlagworte"] if any(kw in k for k in keywords))
    score += min(matched_keywords * 0.1, 0.5)

    return round(min(score, 1.0), 2)


# ─── Main Matching Function ───────────────────────────────────────────────────

def match_grants(
    mitarbeiter: int,
    branche: str,
    ziel: str,
    schmerz_punkte: List[str],
    aktuelle_tools: List[str],
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Returns the top N matching grants for a company profile.
    Combines static dataset + live scraping (best-effort).
    """
    all_grants = STATIC_GRANTS.copy()

    # Try to enrich with live data — fail silently for hackathon
    try:
        live = _scrape_foerderdatenbank(branche)
        all_grants.extend(live)
    except Exception:
        pass  # Static fallback is enough

    # Score and sort
    scored = []
    for grant in all_grants:
        s = score_grant(grant, mitarbeiter, branche, ziel, schmerz_punkte, aktuelle_tools)
        if s > 0:
            scored.append({**grant, "passgenauigkeit_score": s})

    scored.sort(key=lambda x: x["passgenauigkeit_score"], reverse=True)
    return scored[:top_n]


# ─── Live Scraper: foerderdatenbank.de ───────────────────────────────────────

def _scrape_foerderdatenbank(branche: str) -> List[Dict[str, Any]]:
    """
    Best-effort scraper for foerderdatenbank.de.
    Returns parsed grants or empty list on failure.
    """
    url = "https://www.foerderdatenbank.de/FDB/DE/Foerderprogramme/foerderprogramme.html"
    headers = {"User-Agent": "Mozilla/5.0 (compatible; birdie-bot/1.0)"}

    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    results = []

    # Parse program entries (structure may change — static fallback is primary)
    for item in soup.select(".foerderprogram-item, .result-item")[:10]:
        name_el = item.select_one("h3, .title, .programm-name")
        desc_el = item.select_one("p, .description, .teaser")
        link_el = item.select_one("a[href]")

        if not name_el:
            continue

        results.append({
            "programm_name": name_el.get_text(strip=True),
            "beschreibung": desc_el.get_text(strip=True) if desc_el else "",
            "foerder_summe_max": None,
            "foerder_quote_prozent": None,
            "quelle_url": "https://www.foerderdatenbank.de" + link_el["href"] if link_el else url,
            "antragsteller": "KMU",
            "frist": "Siehe Website",
            "branchen": ["alle"],
            "min_mitarbeiter": 1,
            "max_mitarbeiter": 99999,
            "schlagworte": ["digitalisierung"],
        })

    return results
