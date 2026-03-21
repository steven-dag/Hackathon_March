from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.supabase_client import supabase
from data.grant_checklists import get_checklist_for_grant
from ai.azure_openai import client, MODEL
from google.genai import types
import json

router = APIRouter(prefix="/api/portal", tags=["Portal"])


# ── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str


@router.post("/login")
def portal_login(body: LoginRequest):
    """Find session_id for a customer by email (from their booking)."""
    res = (
        supabase.table("bookings")
        .select("session_id, name")
        .eq("email", body.email.strip().lower())
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Keine Buchung mit dieser E-Mail gefunden.")
    entry = res.data[-1]  # latest booking
    return {"session_id": entry["session_id"], "name": entry["name"]}


@router.get("/{session_id}")
def get_portal_data(session_id: str):
    """
    Returns all data needed for the customer portal.
    Only returns grants where freigegeben = true (set by advisor after call).
    Falls back to all grants if the column doesn't exist yet.
    """
    # Company
    company_res = (
        supabase.table("companies")
        .select("*")
        .eq("session_id", session_id)
        .execute()
    )
    if not company_res.data:
        raise HTTPException(status_code=404, detail="Session nicht gefunden")
    company = company_res.data[0]

    # Grants — only freigegeben ones; fall back to all if column not yet added
    try:
        grants_res = (
            supabase.table("grant_matches")
            .select("*")
            .eq("session_id", session_id)
            .eq("freigegeben", True)
            .execute()
        )
        grants = grants_res.data or []
        if not grants:
            # Column exists but advisor hasn't approved any yet
            grants = []
    except Exception:
        # Column doesn't exist yet — show all grants
        grants_res = (
            supabase.table("grant_matches")
            .select("*")
            .eq("session_id", session_id)
            .execute()
        )
        grants = grants_res.data or []

    # Plan (optional — may not exist yet)
    plan_summary = None
    plan_res = (
        supabase.table("plans")
        .select("plan_json, zeitraum_monate")
        .eq("session_id", session_id)
        .execute()
    )
    if plan_res.data:
        plan_json = json.loads(plan_res.data[0]["plan_json"])
        plan_summary = {
            "zusammenfassung": plan_json.get("zusammenfassung", ""),
            "zeitraum_monate": plan_res.data[0].get("zeitraum_monate", 12),
            "naechste_schritte": plan_json.get("naechste_schritte", []),
        }

    # Build grants with checklists
    grants_with_checklists = []
    for g in grants:
        grants_with_checklists.append({
            "programm_name": g["programm_name"],
            "foerder_summe_max": g.get("foerder_summe_max"),
            "foerder_quote_prozent": g.get("foerder_quote_prozent"),
            "passgenauigkeit_score": g.get("passgenauigkeit_score"),
            "frist": g.get("frist"),
            "quelle_url": g.get("quelle_url", ""),
            "dokumente": get_checklist_for_grant(g["programm_name"]),
        })

    return {
        "session_id": session_id,
        "company": {
            "name": company["name"],
            "branche": company.get("branche", ""),
            "bundesland": company.get("bundesland", ""),
        },
        "plan": plan_summary,
        "grants": grants_with_checklists,
    }


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str


@router.post("/{session_id}/chat")
def chat_with_assistant(session_id: str, body: ChatRequest):
    """Gemini-powered support chat with session context."""
    company_res = (
        supabase.table("companies")
        .select("name, branche, bundesland")
        .eq("session_id", session_id)
        .execute()
    )
    company = company_res.data[0] if company_res.data else {}

    grants_res = (
        supabase.table("grant_matches")
        .select("programm_name, foerder_summe_max, foerder_quote_prozent")
        .eq("session_id", session_id)
        .execute()
    )
    grants = grants_res.data or []
    grants_text = "\n".join([
        f"- {g['programm_name']}: bis {int(g['foerder_summe_max']) if g.get('foerder_summe_max') else '?'} EUR ({g.get('foerder_quote_prozent','?')}% Förderquote)"
        for g in grants
    ]) or "Keine Förderprogramme hinterlegt"

    prompt = f"""Du bist ein freundlicher Digitalisierungsberater-Assistent von .birdie.
Du hilfst dem Kunden bei Fragen zu Förderprogrammen und Digitalisierung.
Antworte IMMER auf Deutsch, kurz und verständlich (max. 3 Sätze).
Wenn du etwas nicht weißt, sag dass der Berater weiterhelfen kann.

Unternehmenskontext:
- Firma: {company.get('name', 'Unbekannt')}
- Branche: {company.get('branche', '')}
- Bundesland: {company.get('bundesland', '')}

Freigeschaltete Förderprogramme:
{grants_text}

Frage des Nutzers: {body.message}"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        ),
    )

    return {"reply": response.text}
