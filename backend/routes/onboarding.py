from fastapi import APIRouter, HTTPException
from models.schemas import (
    SessionResponse,
    CompanyCreate, CompanyResponse,
    AssessmentCreate, AssessmentResponse,
    BookingCreate, BookingResponse,
)
from database.supabase_client import supabase

router = APIRouter(prefix="/api/onboarding", tags=["Onboarding"])


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

    return result.data[0]
