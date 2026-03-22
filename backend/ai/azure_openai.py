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

_api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=_api_key) if _api_key else None

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

    prompt = f"""Digitalisierungsberater für deutsche KMU. Antworte NUR als valides JSON.

Firma: {company_name} | Branche: {branche} | Mitarbeiter: {mitarbeiter}
Tools: {', '.join(aktuelle_tools[:3])} | Probleme: {', '.join(schmerz_punkte[:3])}
Ziel: {ziel} | Budget: {budget_vorstellung or 'offen'}
Förderungen: {grants_summary[:200]}

Erstelle einen INDIVIDUELLEN Digitalplan. Entscheide selbst wie viele Monate realistisch sind (6-24), basierend auf Komplexität, Unternehmensgröße und Budget. Denke wie ein erfahrener Berater: Was ist menschlich machbar? Baue 15-20% Puffer für unerwartete Ereignisse ein. "phasen" = eine Einheit pro Monat, je max. 2 Maßnahmen.
{{
  "zusammenfassung": "2-3 Sätze, inkl. warum dieser Zeitrahmen gewählt wurde",
  "zeitraum_monate": <KI entscheidet: 6-24>,
  "phasen": [
    {{"monat":"Monat 1","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":1500}},
    {{"monat":"Monat 2","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":2000}}
  ],
  "kosten_aufstellung": {{"entwicklung":0,"lizenzen":0,"beratung":0,"hardware":0,"gesamt":0,"foerderung_abzug":0,"eigenanteil":0}},
  "empfohlene_foerderungen": ["..."],
  "naechste_schritte": ["...","...","..."]
}}"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        ),
    )

    return json.loads(response.text)
