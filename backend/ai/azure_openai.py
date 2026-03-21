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

    prompt = f"""Digitalisierungsberater für deutsche KMU. Antworte NUR als valides JSON.

Firma: {company_name} | Branche: {branche} | Mitarbeiter: {mitarbeiter}
Tools: {', '.join(aktuelle_tools[:3])} | Probleme: {', '.join(schmerz_punkte[:3])}
Ziel: {ziel} | Budget: {budget_vorstellung or 'offen'}
Förderungen: {grants_summary[:200]}

Erstelle einen 12-Monats-Plan. "phasen" = GENAU 12 Einträge (Monat 1 bis Monat 12), je max. 2 Maßnahmen.
{{
  "zusammenfassung": "2-3 Sätze",
  "zeitraum_monate": 12,
  "phasen": [
    {{"monat":"Monat 1","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":1500}},
    {{"monat":"Monat 2","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":2000}},
    {{"monat":"Monat 3","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":2000}},
    {{"monat":"Monat 4","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":2500}},
    {{"monat":"Monat 5","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":2500}},
    {{"monat":"Monat 6","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":1000}},
    {{"monat":"Monat 7","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":2000}},
    {{"monat":"Monat 8","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":2000}},
    {{"monat":"Monat 9","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":1500}},
    {{"monat":"Monat 10","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":1500}},
    {{"monat":"Monat 11","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":1000}},
    {{"monat":"Monat 12","titel":"...","beschreibung":"1 Satz","massnahmen":["...","..."],"kosten_geschaetzt":500}}
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
