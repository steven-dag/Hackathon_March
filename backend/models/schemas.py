from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ─── Session ────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    pass

class SessionResponse(BaseModel):
    id: UUID
    status: str
    created_at: datetime


# ─── Company ────────────────────────────────────────────────────────────────

class CompanyCreate(BaseModel):
    session_id: UUID
    name: str
    branche: str                  # e.g. "Schlosserei", "Sanitär", "Elektro"
    mitarbeiter_anzahl: int
    plz: str                      # for regional grant matching
    bundesland: Optional[str] = None

class CompanyResponse(CompanyCreate):
    id: UUID
    created_at: datetime


# ─── Assessment ─────────────────────────────────────────────────────────────

class AssessmentCreate(BaseModel):
    session_id: UUID
    aktuelle_tools: List[str]     # e.g. ["Excel", "Papier", "WhatsApp"]
    schmerz_punkte: List[str]     # e.g. ["Zeitplanung", "Rechnungsstellung"]
    digitalisierungs_grad: int    # 1 (gar nicht) – 5 (sehr digital)
    ziel: str                     # "App" | "SaaS" | "Prozessautomatisierung" | "Komplettlösung"
    budget_vorstellung: Optional[str] = None  # "<5k" | "5k-20k" | ">20k"

class AssessmentResponse(AssessmentCreate):
    id: UUID
    created_at: datetime


# ─── Grant Match ─────────────────────────────────────────────────────────────

class GrantMatch(BaseModel):
    session_id: UUID
    programm_name: str
    beschreibung: str
    foerder_summe_max: Optional[float] = None
    foerder_quote_prozent: Optional[float] = None
    quelle_url: str
    passgenauigkeit_score: float  # 0.0 – 1.0
    antragsteller: str            # wer kann beantragen
    frist: Optional[str] = None

class GrantMatchResponse(GrantMatch):
    id: UUID
    created_at: datetime


# ─── Plan ────────────────────────────────────────────────────────────────────

class PlanRequest(BaseModel):
    session_id: UUID

class PlanPhase(BaseModel):
    monat: str                    # e.g. "Monat 1-2"
    titel: str
    beschreibung: str
    massnahmen: List[str]
    kosten_geschaetzt: Optional[float] = None

class KostenAufstellung(BaseModel):
    entwicklung: Optional[float] = None
    lizenzen: Optional[float] = None
    beratung: Optional[float] = None
    hardware: Optional[float] = None
    gesamt: float
    foerderung_abzug: Optional[float] = None
    eigenanteil: Optional[float] = None

class PlanResponse(BaseModel):
    session_id: UUID
    zusammenfassung: str
    zeitraum_monate: int
    phasen: List[PlanPhase]
    kosten_aufstellung: KostenAufstellung
    empfohlene_foerderungen: List[str]
    naechste_schritte: List[str]


# ─── Booking ─────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    session_id: UUID
    name: str
    email: str
    telefon: Optional[str] = None
    wunschtermin: Optional[str] = None
    nachricht: Optional[str] = None

class BookingResponse(BookingCreate):
    id: UUID
    created_at: datetime
