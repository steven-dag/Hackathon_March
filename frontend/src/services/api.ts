const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  status: string;
  created_at: string;
}

export interface Company {
  id: string;
  session_id: string;
  name: string;
  branche: string;
  mitarbeiter_anzahl: number;
  plz: string;
  bundesland?: string;
}

export interface Assessment {
  id: string;
  session_id: string;
  aktuelle_tools: string[];
  schmerz_punkte: string[];
  digitalisierungs_grad: number;
  ziel: string;
  budget_vorstellung?: string;
}

export interface GrantMatch {
  id: string;
  session_id: string;
  programm_name: string;
  beschreibung: string;
  foerder_summe_max?: number;
  foerder_quote_prozent?: number;
  quelle_url: string;
  passgenauigkeit_score: number;
  antragsteller: string;
  frist?: string;
}

export interface PlanPhase {
  monat: string;
  titel: string;
  beschreibung: string;
  massnahmen: string[];
  kosten_geschaetzt?: number;
}

export interface KostenAufstellung {
  entwicklung?: number;
  lizenzen?: number;
  beratung?: number;
  hardware?: number;
  gesamt: number;
  foerderung_abzug?: number;
  eigenanteil?: number;
}

export interface Plan {
  session_id: string;
  zusammenfassung: string;
  zeitraum_monate: number;
  phasen: PlanPhase[];
  kosten_aufstellung: KostenAufstellung;
  empfohlene_foerderungen: string[];
  naechste_schritte: string[];
}

export interface Booking {
  id: string;
  session_id: string;
  name: string;
  email: string;
  telefon?: string;
  wunschtermin?: string;
  nachricht?: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function post<T>(path: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

// Company Lookup
export interface LookupResult {
  name?: string | null;
  branche?: string | null;
  mitarbeiter?: string | null;
  plz?: string | null;
  bundesland?: string | null;
  beschreibung?: string | null;
}
export const lookupCompany = (query: string) =>
  post<LookupResult>("/api/onboarding/lookup", { query });

// Sessions
export const createSession = () => post<Session>("/api/onboarding/session");

// Company
export const saveCompany = (data: {
  session_id: string;
  name: string;
  branche: string;
  mitarbeiter_anzahl: number;
  plz: string;
  bundesland?: string;
}) => post<Company>("/api/onboarding/company", data);

// Assessment
export const saveAssessment = (data: {
  session_id: string;
  aktuelle_tools: string[];
  schmerz_punkte: string[];
  digitalisierungs_grad: number;
  ziel: string;
  budget_vorstellung?: string;
}) => post<Assessment>("/api/onboarding/assessment", data);

// Grants
export const getGrants = (session_id: string) =>
  get<GrantMatch[]>(`/api/grants/${session_id}`);

// Plan
export const generatePlan = (session_id: string) =>
  post<Plan>("/api/plan/generate", { session_id });

export const getPlan = (session_id: string) =>
  get<Plan>(`/api/plan/${session_id}`);

// Booking
export const createBooking = (data: {
  session_id: string;
  name: string;
  email: string;
  telefon?: string;
  wunschtermin?: string;
  nachricht?: string;
}) => post<Booking>("/api/onboarding/booking", data);
