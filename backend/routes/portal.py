from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from database.supabase_client import supabase
from data.grant_checklists import get_checklist_for_grant
from ai.azure_openai import client, MODEL
from google.genai import types
import json
import io

# PDF text extraction
try:
    import pdfplumber
    HAS_PDF = True
except ImportError:
    HAS_PDF = False

router = APIRouter(prefix="/api/portal", tags=["Portal"])


@router.get("/debug")
def debug_env():
    import os, traceback
    try:
        res = supabase.table("companies").select("id").execute()
        return {"supabase": "ok", "rows": len(res.data or [])}
    except Exception as e:
        return {"supabase": "error", "detail": str(e), "trace": traceback.format_exc()}


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
    Returns all matched grants for the customer portal.
    freigegeben flag is included so the frontend can show selection state.
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

    # All grants — sorted by score desc, deduplicated by programm_name
    grants_res = (
        supabase.table("grant_matches")
        .select("*")
        .eq("session_id", session_id)
        .execute()
    )
    if grants_res.data:
        grants_res.data.sort(key=lambda g: g.get("passgenauigkeit_score") or 0, reverse=True)
    # Deduplicate: keep first (highest score) per programm_name
    seen = set()
    grants = []
    for g in (grants_res.data or []):
        name = g.get("programm_name", "")
        if name not in seen:
            seen.add(name)
            grants.append(g)

    # Plan (optional)
    plan_summary = None
    plan_res = (
        supabase.table("plans")
        .select("plan_json, zeitraum_monate")
        .eq("session_id", session_id)
        .execute()
    )
    if plan_res.data:
        raw = plan_res.data[0]["plan_json"]
        plan_json = raw if isinstance(raw, dict) else json.loads(raw)
        plan_summary = {
            "zusammenfassung": plan_json.get("zusammenfassung", ""),
            "zeitraum_monate": plan_res.data[0].get("zeitraum_monate", 12),
            "naechste_schritte": plan_json.get("naechste_schritte", []),
        }

    # Build grants with checklists
    grants_with_checklists = []
    for g in grants:
        grants_with_checklists.append({
            "id": str(g.get("id", "")),
            "programm_name": g["programm_name"],
            "foerder_summe_max": g.get("foerder_summe_max"),
            "foerder_quote_prozent": g.get("foerder_quote_prozent"),
            "passgenauigkeit_score": g.get("passgenauigkeit_score"),
            "frist": g.get("frist"),
            "quelle_url": g.get("quelle_url", ""),
            "freigegeben": bool(g.get("freigegeben", False)),
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


class FreigebenRequest(BaseModel):
    freigegeben: bool


@router.patch("/{session_id}/grants/{grant_id}/freigeben")
def toggle_grant_freigeben(session_id: str, grant_id: str, body: FreigebenRequest):
    """Toggle freigegeben for a single grant (called from portal UI)."""
    res = (
        supabase.table("grant_matches")
        .update({"freigegeben": body.freigegeben})
        .eq("id", grant_id)
        .eq("session_id", session_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Grant nicht gefunden")
    return {"ok": True}


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


# ── Document Analysis ─────────────────────────────────────────────────────────

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx"}
MAX_FILE_SIZE_MB = 200  # no hard cap — Gemini handles large files, just takes longer


@router.post("/{session_id}/documents/analyze")
async def analyze_document(session_id: str, file: UploadFile = File(...)):
    """
    Analyze an uploaded document against all grant checklists for this session.
    Documents are processed in-memory and NEVER stored persistently.
    """
    # ── Security: validate session ──
    company_res = supabase.table("companies").select("name").eq("session_id", session_id).execute()
    if not company_res.data:
        raise HTTPException(status_code=404, detail="Session nicht gefunden")

    # ── Security: validate file type ──
    filename = (file.filename or "").lower()
    ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""
    content_type = (file.content_type or "").lower()

    if ext not in ALLOWED_EXTENSIONS and content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Dateityp nicht erlaubt. Erlaubt: PDF, JPG, PNG, DOCX"
        )

    # ── Security: read with size limit ──
    chunk_size = 64 * 1024  # 64KB chunks
    file_bytes = b""
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        file_bytes += chunk
        if len(file_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"Datei zu groß für die Verarbeitung (>{MAX_FILE_SIZE_MB} MB)"
            )

    # Get all grants for this session
    grants_res = (
        supabase.table("grant_matches")
        .select("programm_name, freigegeben")
        .eq("session_id", session_id)
        .execute()
    )
    seen = set()
    grants = []
    for g in (grants_res.data or []):
        if g["programm_name"] not in seen:
            seen.add(g["programm_name"])
            grants.append(g)

    # Build checklist context
    all_items = []
    for g in grants:
        checklist = get_checklist_for_grant(g["programm_name"])
        for item in checklist:
            all_items.append({
                "grant": g["programm_name"],
                "id": item["id"],
                "label": item["label"],
                "kategorie": item["kategorie"],
            })

    # Use already-read file_bytes (with size limit applied above)
    display_filename = file.filename or "unbekannt"

    # Extract text from file
    extracted_text = ""
    use_vision = False

    if "pdf" in content_type or ext == ".pdf":
        if HAS_PDF:
            try:
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    pages_text = []
                    for page in pdf.pages[:6]:
                        t = page.extract_text()
                        if t:
                            pages_text.append(t)
                    extracted_text = "\n".join(pages_text)[:4000]
            except Exception:
                extracted_text = ""
    elif ext in {".jpg", ".jpeg", ".png", ".webp"} or "image/" in content_type:
        use_vision = True

    # Build prompt
    checklist_text = "\n".join([
        f'- [{item["grant"]}] {item["label"]} (ID: {item["id"]})'
        for item in all_items
    ])

    json_schema = """{
  "zusammenfassung": "Kurze Beschreibung was das Dokument ist (1 Satz)",
  "relevant": true/false,
  "matches": [
    {"grant": "Programmname", "doc_id": "id", "relevanz": 0-100, "begruendung": "Warum passt es"}
  ],
  "nicht_relevant_grund": "Nur wenn relevant=false: Warum nicht?"
}"""

    if use_vision:
        prompt_parts = [
            f"""Du bist ein Fördermittel-Experte. Analysiere dieses Dokument.
Dateiname: {display_filename}

Geforderte Unterlagen:
{checklist_text}

Antworte NUR als JSON:
{json_schema}""",
            types.Part.from_bytes(data=file_bytes, mime_type=content_type or "image/jpeg")
        ]
        response = client.models.generate_content(
            model=MODEL, contents=prompt_parts,
            config=types.GenerateContentConfig(thinking_config=types.ThinkingConfig(thinking_budget=0)),
        )
    else:
        doc_content = extracted_text if extracted_text else f"[Dateiname: {display_filename}]"
        prompt = f"""Du bist ein Fördermittel-Experte. Analysiere diesen Dokumenteninhalt.

Inhalt: {doc_content}
Dateiname: {display_filename}

Geforderte Unterlagen:
{checklist_text}

Antworte NUR als JSON (nur Matches mit relevanz >= 60):
{json_schema}"""
        response = client.models.generate_content(
            model=MODEL, contents=prompt,
            config=types.GenerateContentConfig(thinking_config=types.ThinkingConfig(thinking_budget=0)),
        )

    # Parse AI response
    try:
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
    except Exception:
        result = {"zusammenfassung": "Dokument analysiert", "relevant": True, "matches": []}

    # NOTE: file_bytes is NOT stored anywhere — analysis only, then discarded
    return {
        "filename": display_filename,
        "zusammenfassung": result.get("zusammenfassung", ""),
        "relevant": result.get("relevant", True),
        "nicht_relevant_grund": result.get("nicht_relevant_grund", ""),
        "matches": result.get("matches", []),
    }
