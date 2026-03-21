"""
Hardcoded document checklists per grant program.
Keep this updated when grant requirements change.
"""

from typing import List, Dict

GRANT_CHECKLISTS: Dict[str, List[Dict]] = {
    "Digitalbonus (Länderprogramme – regional)": [
        {"id": "hr", "label": "Handelsregisterauszug (nicht älter als 3 Monate)", "kategorie": "Unternehmen"},
        {"id": "gewerbe", "label": "Gewerbeanmeldung", "kategorie": "Unternehmen"},
        {"id": "kmu", "label": "KMU-Erklärung (Vorlage beim zuständigen Fördermittelgeber)", "kategorie": "Unternehmen"},
        {"id": "mitarbeiter", "label": "Mitarbeiterliste mit Qualifikationen / Abschlüssen", "kategorie": "Personal"},
        {"id": "invest", "label": "Investitionsplan / Kostenaufstellung", "kategorie": "Projekt"},
        {"id": "angebote", "label": "Mindestens 2 Angebote / Kostenvoranschläge", "kategorie": "Projekt"},
        {"id": "steuer", "label": "Letzter Steuerbescheid", "kategorie": "Finanzen"},
    ],
    "BAFA – Förderung unternehmerischen Know-hows": [
        {"id": "hr", "label": "Handelsregisterauszug", "kategorie": "Unternehmen"},
        {"id": "kmu", "label": "KMU-Nachweis (De-minimis-Erklärung)", "kategorie": "Unternehmen"},
        {"id": "berater_angebot", "label": "Angebot des zugelassenen Beratungsunternehmens", "kategorie": "Beratung"},
        {"id": "jahres", "label": "Letzter Jahresabschluss oder aktuelle BWA", "kategorie": "Finanzen"},
        {"id": "vertrag", "label": "Beratungsvertrag (nach Bewilligung)", "kategorie": "Beratung"},
        {"id": "bericht", "label": "Beratungsbericht (nach Abschluss)", "kategorie": "Beratung"},
    ],
    "KfW Digitalisierungskredit (ERP-Digitalisierungs- und Innovationskredit)": [
        {"id": "jahres2", "label": "Jahresabschlüsse der letzten 2 Geschäftsjahre", "kategorie": "Finanzen"},
        {"id": "bwa", "label": "Aktuelle BWA (nicht älter als 3 Monate)", "kategorie": "Finanzen"},
        {"id": "business", "label": "Businessplan mit Investitionsbeschreibung", "kategorie": "Projekt"},
        {"id": "invest", "label": "Detaillierter Investitionsplan mit Kostenaufstellung", "kategorie": "Projekt"},
        {"id": "hr", "label": "Handelsregisterauszug", "kategorie": "Unternehmen"},
        {"id": "bank", "label": "Kontaktaufnahme mit Hausbank (KfW-Antrag läuft über Hausbank)", "kategorie": "Finanzen"},
    ],
    "Mittelstand-Digital Zentren (BMWK – kostenfreie Beratung)": [
        {"id": "kontakt", "label": "Kontaktaufnahme mit dem nächstgelegenen Mittelstand-Digital Zentrum", "kategorie": "Kontakt"},
        {"id": "vorhaben", "label": "Kurzbeschreibung des Digitalisierungsvorhabens (1 Seite)", "kategorie": "Projekt"},
    ],
    "ZIM – Zentrales Innovationsprogramm Mittelstand": [
        {"id": "hr", "label": "Handelsregisterauszug", "kategorie": "Unternehmen"},
        {"id": "jahres2", "label": "Jahresabschlüsse der letzten 2 Geschäftsjahre", "kategorie": "Finanzen"},
        {"id": "projekt", "label": "Technische Projektbeschreibung (Innovationsgehalt, Stand der Technik)", "kategorie": "Projekt"},
        {"id": "kosten", "label": "Detaillierter Kosten- und Finanzierungsplan", "kategorie": "Projekt"},
        {"id": "qual", "label": "Qualifikationsnachweise der beteiligten Mitarbeitenden", "kategorie": "Personal"},
        {"id": "zeitplan", "label": "Arbeits- und Zeitplan", "kategorie": "Projekt"},
    ],
    "Handwerk Digital (HWK-Programme – regional)": [
        {"id": "hwk", "label": "Nachweis der HWK-Mitgliedschaft", "kategorie": "Unternehmen"},
        {"id": "gewerbe", "label": "Gewerbeanmeldung / Handwerksrolleneintrag", "kategorie": "Unternehmen"},
        {"id": "invest", "label": "Investitionsplan / Kostenvoranschlag", "kategorie": "Projekt"},
        {"id": "angebote", "label": "Mindestens 2 Angebote von Anbietern", "kategorie": "Projekt"},
        {"id": "kontoverbindung", "label": "Aktuelle Bankverbindung (IBAN)", "kategorie": "Finanzen"},
    ],
}


def get_checklist_for_grant(programm_name: str) -> List[Dict]:
    """Return document checklist for a grant. Falls back to generic list if unknown."""
    if programm_name in GRANT_CHECKLISTS:
        return GRANT_CHECKLISTS[programm_name]

    # Generic fallback for unknown/live-scraped grants
    return [
        {"id": "hr", "label": "Handelsregisterauszug", "kategorie": "Unternehmen"},
        {"id": "invest", "label": "Investitionsplan", "kategorie": "Projekt"},
        {"id": "jahres", "label": "Letzter Jahresabschluss", "kategorie": "Finanzen"},
    ]
