from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.schemas import (
    SessionResponse,
    CompanyCreate, CompanyResponse,
    AssessmentCreate, AssessmentResponse,
    BookingCreate, BookingResponse,
)
from database.supabase_client import supabase
from ai.azure_openai import client, MODEL
from utils.email_sender import send_customer_portal_email
from google.genai import types
import requests
import json
from bs4 import BeautifulSoup

router = APIRouter(prefix="/api/onboarding", tags=["Onboarding"])


# ─── Company Lookup ───────────────────────────────────────────────────────────

class LookupRequest(BaseModel):
    query: str  # URL or company name

class LookupResponse(BaseModel):
    name: str | None = None
    branche: str | None = None
    mitarbeiter: str | None = None
    plz: str | None = None
    bundesland: str | None = None
    beschreibung: str | None = None


@router.post("/lookup", response_model=LookupResponse)
def lookup_company(data: LookupRequest):
    """Scrape a company website or search by name and extract key info via Gemini."""
    query = data.query.strip()
    page_text = ""

    # ── 1. Fetch website if URL given ──
    try:
        url = query if query.startswith("http") else f"https://{query}"
        headers = {"User-Agent": "Mozilla/5.0 (compatible; birdie-bot/1.0)"}
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.ok:
            soup = BeautifulSoup(resp.text, "html.parser")
            # Remove scripts and styles
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            page_text = soup.get_text(separator=" ", strip=True)[:4000]
    except Exception:
        pass

    # ── 2. Build Gemini prompt ──
    if page_text:
        context = f"Webseiteninhalt von {query}:\n{page_text}"
    else:
        context = f"Firmenname oder Suchbegriff: {query}"

    prompt = f"""Du analysierst eine deutsche Firma. Extrahiere folgende Informationen aus dem Text.
Antworte AUSSCHLIESSLICH als valides JSON ohne Markdown, ohne Erklärungen.
Falls eine Information nicht erkennbar ist, gib null zurück.

Branche muss EINER dieser Werte sein (sonst null):
Handwerk, Bau & Immobilien, Einzelhandel, Gastronomie & Hotellerie, Produktion & Fertigung,
Logistik & Transport, IT & Software, Beratung & Dienstleistung, Gesundheit & Pflege, Sonstiges

{context}

JSON-Struktur:
{{
  "name": "Firmenname oder null",
  "branche": "Eine der vorgegebenen Branchen oder null",
  "mitarbeiter": "Geschätzte Mitarbeiteranzahl als String (z.B. '12') oder null",
  "plz": "Postleitzahl 5-stellig oder null",
  "bundesland": "Deutsches Bundesland ausgeschrieben oder null",
  "beschreibung": "1 Satz was die Firma macht, oder null"
}}"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        result = json.loads(response.text)
        return LookupResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lookup fehlgeschlagen: {str(e)}")


# ─── Create Session ──────────────────────────────────────────────────────────

@router.post("/session", response_model=SessionResponse)
def create_session():
    """Start a new onboarding session. Frontend calls this on first load."""
    result = supabase.table("sessions").insert({"status": "in_progress"}).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create session")
    return result.data[0]


# ─── Save Company Info ───────────────────────────────────────────────────────

@router.post("/company", response_model=CompanyResponse)
def save_company(data: CompanyCreate):
    """Step 1 — Save company information."""
    result = supabase.table("companies").insert(data.model_dump(mode="json")).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Could not save company info")
    return result.data[0]


# ─── Save Assessment ─────────────────────────────────────────────────────────

@router.post("/assessment", response_model=AssessmentResponse)
def save_assessment(data: AssessmentCreate):
    """Step 2 — Save pain points and current tech stack."""
    result = supabase.table("assessments").insert(data.model_dump(mode="json")).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Could not save assessment")
    return result.data[0]


# ─── Book a Call ─────────────────────────────────────────────────────────────

@router.post("/booking", response_model=BookingResponse)
def create_booking(data: BookingCreate):
    """Step final — Book a call after the plan is shown."""
    result = supabase.table("bookings").insert(data.model_dump(mode="json")).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create booking")

    # Mark session as completed
    supabase.table("sessions").update({"status": "completed"}).eq("id", str(data.session_id)).execute()

    # Send customer portal link email (non-blocking)
    try:
        company_res = (
            supabase.table("companies")
            .select("name")
            .eq("session_id", str(data.session_id))
            .execute()
        )
        company_name = company_res.data[0]["name"] if company_res.data else ""
        send_customer_portal_email(
            customer_name=data.name,
            customer_email=data.email,
            company_name=company_name,
            session_id=str(data.session_id),
        )
    except Exception as e:
        print(f"[booking] Customer email failed (non-fatal): {e}")

    return result.data[0]
