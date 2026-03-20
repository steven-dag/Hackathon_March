from fastapi import APIRouter, HTTPException
from models.schemas import PlanRequest, PlanResponse
from ai.azure_openai import generate_digitalization_plan
from database.supabase_client import supabase
import json

router = APIRouter(prefix="/api/plan", tags=["Plan"])


@router.post("/generate", response_model=PlanResponse)
def generate_plan(data: PlanRequest):
    """
    Generates a tailored digitalization plan using Azure OpenAI.
    Requires company + assessment + grant_matches to exist for the session.
    """
    session_id = str(data.session_id)

    # Load company
    company_res = (
        supabase.table("companies")
        .select("*")
        .eq("session_id", session_id)
        .single()
        .execute()
    )
    if not company_res.data:
        raise HTTPException(status_code=404, detail="Company not found for this session")

    # Load assessment
    assessment_res = (
        supabase.table("assessments")
        .select("*")
        .eq("session_id", session_id)
        .single()
        .execute()
    )
    if not assessment_res.data:
        raise HTTPException(status_code=404, detail="Assessment not found for this session")

    # Load grant matches (optional — use empty list if none)
    grants_res = (
        supabase.table("grant_matches")
        .select("*")
        .eq("session_id", session_id)
        .execute()
    )
    grants = grants_res.data or []

    company = company_res.data
    assessment = assessment_res.data

    # Generate plan via Azure OpenAI
    try:
        plan_data = generate_digitalization_plan(
            company_name=company["name"],
            branche=company["branche"],
            mitarbeiter=company["mitarbeiter_anzahl"],
            aktuelle_tools=assessment["aktuelle_tools"],
            schmerz_punkte=assessment["schmerz_punkte"],
            ziel=assessment["ziel"],
            budget_vorstellung=assessment.get("budget_vorstellung", ""),
            matched_grants=grants,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI plan generation failed: {str(e)}")

    # Persist plan to DB
    supabase.table("plans").insert({
        "session_id": session_id,
        "plan_json": json.dumps(plan_data, ensure_ascii=False),
        "zeitraum_monate": plan_data.get("zeitraum_monate", 12),
        "kosten_aufstellung_json": json.dumps(plan_data.get("kosten_aufstellung", {}), ensure_ascii=False),
    }).execute()

    return {
        "session_id": data.session_id,
        **plan_data,
    }


@router.get("/{session_id}", response_model=PlanResponse)
def get_plan(session_id: str):
    """Retrieve an already generated plan for a session."""
    result = (
        supabase.table("plans")
        .select("*")
        .eq("session_id", session_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No plan found for this session")

    plan_data = json.loads(result.data["plan_json"])
    return {
        "session_id": session_id,
        **plan_data,
    }
