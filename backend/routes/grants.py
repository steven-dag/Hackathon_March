from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from models.schemas import GrantMatch, GrantMatchResponse
from scraper.grants_scraper import match_grants
from database.supabase_client import supabase

router = APIRouter(prefix="/api/grants", tags=["Grants"])


@router.get("/{session_id}", response_model=List[GrantMatchResponse])
def get_grants_for_session(session_id: UUID):
    """
    Fetch and match grants for a session.
    Pulls company + assessment data, runs scoring, saves matches to DB.
    """
    # Load company data
    company_res = (
        supabase.table("companies")
        .select("*")
        .eq("session_id", str(session_id))
        .single()
        .execute()
    )
    if not company_res.data:
        raise HTTPException(status_code=404, detail="Company not found for this session")

    # Load assessment data
    assessment_res = (
        supabase.table("assessments")
        .select("*")
        .eq("session_id", str(session_id))
        .single()
        .execute()
    )
    if not assessment_res.data:
        raise HTTPException(status_code=404, detail="Assessment not found for this session")

    company = company_res.data[0]
    assessment = assessment_res.data[0]

    # Run matching
    matched = match_grants(
        mitarbeiter=company["mitarbeiter_anzahl"],
        branche=company["branche"],
        ziel=assessment["ziel"],
        schmerz_punkte=assessment["schmerz_punkte"],
        aktuelle_tools=assessment["aktuelle_tools"],
        top_n=5,
    )

    if not matched:
        return []

    # Save matches to DB
    rows = [
        {
            "session_id": str(session_id),
            "programm_name": g["programm_name"],
            "beschreibung": g["beschreibung"],
            "foerder_summe_max": g.get("foerder_summe_max"),
            "foerder_quote_prozent": g.get("foerder_quote_prozent"),
            "quelle_url": g["quelle_url"],
            "passgenauigkeit_score": g["passgenauigkeit_score"],
            "antragsteller": g["antragsteller"],
            "frist": g.get("frist"),
        }
        for g in matched
    ]

    result = supabase.table("grant_matches").insert(rows).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Could not save grant matches")

    return result.data
