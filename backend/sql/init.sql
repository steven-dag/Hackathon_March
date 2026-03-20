-- .birdie Supabase Schema
-- Run this in the Supabase SQL Editor

-- ─── Sessions ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status      TEXT NOT NULL DEFAULT 'in_progress', -- in_progress | completed
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Companies ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    branche             TEXT NOT NULL,
    mitarbeiter_anzahl  INT NOT NULL,
    plz                 TEXT NOT NULL,
    bundesland          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Assessments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    aktuelle_tools          TEXT[] NOT NULL DEFAULT '{}',
    schmerz_punkte          TEXT[] NOT NULL DEFAULT '{}',
    digitalisierungs_grad   INT NOT NULL CHECK (digitalisierungs_grad BETWEEN 1 AND 5),
    ziel                    TEXT NOT NULL,
    budget_vorstellung      TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Grant Matches ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grant_matches (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    programm_name           TEXT NOT NULL,
    beschreibung            TEXT NOT NULL,
    foerder_summe_max       NUMERIC,
    foerder_quote_prozent   NUMERIC,
    quelle_url              TEXT NOT NULL,
    passgenauigkeit_score   NUMERIC NOT NULL,
    antragsteller           TEXT NOT NULL,
    frist                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Plans ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    plan_json               TEXT NOT NULL,
    zeitraum_monate         INT NOT NULL DEFAULT 12,
    kosten_aufstellung_json TEXT NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Bookings ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL,
    telefon         TEXT,
    wunschtermin    TEXT,
    nachricht       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_companies_session ON companies(session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_session ON assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_grant_matches_session ON grant_matches(session_id);
CREATE INDEX IF NOT EXISTS idx_plans_session ON plans(session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id);
