from fastapi import APIRouter, HTTPException
from database.supabase_client import supabase
from data.grant_checklists import get_checklist_for_grant
import json

router = APIRouter(prefix="/api/portal", tags=["Portal"])


@router.get("/{session_id}")
def get_portal_data(session_id: str):
    """
    Returns all data needed for the customer portal:
    company info, plan summary, matched grants + their document checklists.
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

    # Grants
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
