"""
Google Gemini integration for .birdie plan generation.
Uses gemini-2.0-flash via google-genai SDK.
"""

import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-2.5-flash"


# ─── Plan Generation ──────────────────────────────────────────────────────────

def generate_digitalization_plan(
    company_name: str,
    branche: str,
    mitarbeiter: int,
    aktuelle_tools: List[str],
    schmerz_punkte: List[str],
    ziel: str,
    budget_vorstellung: str,
    matched_grants: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Generates a tailored digitalization roadmap using Gemini 2.0 Flash.
    Returns structured JSON matching the PlanResponse schema.
    """

    grants_summary = "\n".join(
        [f"- {g['programm_name']}: bis {g.get('foerder_summe_max', 'k.A.')} €, {g.get('foerder_quote_prozent', '?')}% Förderquote"
         for g in matched_grants[:3]]
    ) or "Keine spezifischen Programme gefunden"

    zeitraum = 12 if ziel in ["SaaS", "Komplettlösung"] else 6

    prompt = f"""Du bist ein erfahrener Digitalisierungsberater für deutsche Handwerks- und KMU-Betriebe.
Du erstellst strukturierte, realistische Digitalisierungspläne auf Deutsch.
Antworte IMMER als valides JSON ohne Markdown-Codeblöcke.
Sei konkret und praxisnah.

Erstelle einen Digitalisierungsplan für folgendes Unternehmen:

Unternehmen: {company_name}
Branche: {branche}
Mitarbeiter: {mitarbeiter}
Aktuell genutzte Tools: {', '.join(aktuelle_tools)}
Schmerzpunkte: {', '.join(schmerz_punkte)}
Ziel: {ziel}
Budget: {budget_vorstellung or 'nicht angegeben'}

Passende Förderprogramme:
{grants_summary}

Erstelle einen Plan für {zeitraum} Monate als JSON mit exakt dieser Struktur:
{{
  "zusammenfassung": "2-3 Sätze Zusammenfassung",
  "zeitraum_monate": {zeitraum},
  "phasen": [
    {{
      "monat": "Monat 1-2",
      "titel": "Titel der Phase",
      "beschreibung": "Was passiert in dieser Phase",
      "massnahmen": ["Maßnahme 1", "Maßnahme 2"],
      "kosten_geschaetzt": 2500.0
    }}
  ],
  "kosten_aufstellung": {{
    "entwicklung": 15000.0,
    "lizenzen": 3000.0,
    "beratung": 5000.0,
    "hardware": 0.0,
    "gesamt": 23000.0,
    "foerderung_abzug": 9200.0,
    "eigenanteil": 13800.0
  }},
  "empfohlene_foerderungen": ["Programmname 1", "Programmname 2"],
  "naechste_schritte": ["Schritt 1", "Schritt 2", "Schritt 3"]
}}"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    return json.loads(response.text)
