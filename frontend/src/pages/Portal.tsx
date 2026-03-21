import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const BASE_URL = "http://localhost:8000";

interface Dokument {
  id: string;
  label: string;
  kategorie: string;
}

interface Grant {
  programm_name: string;
  foerder_summe_max?: number;
  foerder_quote_prozent?: number;
  passgenauigkeit_score?: number;
  frist?: string;
  quelle_url: string;
  dokumente: Dokument[];
}

interface PortalData {
  session_id: string;
  company: { name: string; branche: string; bundesland: string };
  plan?: { zusammenfassung: string; zeitraum_monate: number; naechste_schritte: string[] };
  grants: Grant[];
}

function scoreColor(score: number) {
  if (score >= 0.7) return "#4ADE80";
  if (score >= 0.4) return "#FACC15";
  return "#F87171";
}

export default function Portal() {
  const [params] = useSearchParams();
  const sessionId = params.get("session");

  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Checklist state: { "grantIndex-docId": boolean }
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!sessionId) {
      setError("Kein gültiger Zugangslink.");
      setLoading(false);
      return;
    }

    // Load saved checklist from localStorage
    const saved = localStorage.getItem(`birdie_checklist_${sessionId}`);
    if (saved) setChecked(JSON.parse(saved));

    fetch(`${BASE_URL}/api/portal/${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Session nicht gefunden");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`birdie_checklist_${sessionId}`, JSON.stringify(next));
      return next;
    });
  }

  function grantProgress(grantIdx: number, docs: Dokument[]) {
    const done = docs.filter((d) => checked[`${grantIdx}-${d.id}`]).length;
    return { done, total: docs.length, pct: docs.length ? (done / docs.length) * 100 : 0 };
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0a0a0a" }}>
        <CircularProgress sx={{ color: "#4ADE80" }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0a0a0a", p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 480 }}>
          {error || "Unbekannter Fehler"}
        </Alert>
      </Box>
    );
  }

  const totalDocs = data.grants.reduce((s, g) => s + g.dokumente.length, 0);
  const totalDone = data.grants.reduce(
    (s, g, gi) => s + g.dokumente.filter((d) => checked[`${gi}-${d.id}`]).length,
    0
  );
  const overallPct = totalDocs ? (totalDone / totalDocs) * 100 : 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", color: "#fff", pb: 8 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#0a0a0a", borderBottom: "1px solid #1f2937", py: 2, px: 3 }}>
        <Typography sx={{ color: "#4ADE80", fontWeight: 800, fontSize: 22 }}>
          .birdie
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ pt: 5 }}>
        {/* Welcome */}
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Ihr Förder-Portal
        </Typography>
        <Typography sx={{ color: "#9ca3af", mb: 1 }}>
          {data.company.name} · {data.company.branche}
          {data.company.bundesland ? ` · ${data.company.bundesland}` : ""}
        </Typography>

        {/* Overall progress */}
        <Paper sx={{ bgcolor: "#111827", p: 3, borderRadius: 3, mb: 4, mt: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight={600}>Unterlagen-Fortschritt</Typography>
            <Typography sx={{ color: "#4ADE80", fontWeight: 700 }}>
              {totalDone} / {totalDocs}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallPct}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: "#1f2937",
              "& .MuiLinearProgress-bar": { bgcolor: "#4ADE80", borderRadius: 5 },
            }}
          />
          {overallPct === 100 && (
            <Typography sx={{ color: "#4ADE80", mt: 1.5, fontWeight: 600, fontSize: 14 }}>
              Alle Unterlagen bereit — melden Sie sich bei Ihrem Berater!
            </Typography>
          )}
        </Paper>

        {/* Plan summary */}
        {data.plan && (
          <Paper sx={{ bgcolor: "#111827", p: 3, borderRadius: 3, mb: 4 }}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              Ihr Digitalplan ({data.plan.zeitraum_monate} Monate)
            </Typography>
            <Typography sx={{ color: "#d1d5db", fontSize: 14, mb: 2 }}>
              {data.plan.zusammenfassung}
            </Typography>
            {data.plan.naechste_schritte.length > 0 && (
              <>
                <Divider sx={{ borderColor: "#1f2937", mb: 2 }} />
                <Typography fontWeight={600} sx={{ mb: 1, fontSize: 14 }}>
                  Nächste Schritte
                </Typography>
                {data.plan.naechste_schritte.map((s, i) => (
                  <Typography key={i} sx={{ color: "#9ca3af", fontSize: 13, mb: 0.5 }}>
                    {i + 1}. {s}
                  </Typography>
                ))}
              </>
            )}
          </Paper>
        )}

        {/* Grant checklists */}
        <Typography fontWeight={700} sx={{ mb: 2 }}>
          Ihre Förderprogramme & benötigte Unterlagen
        </Typography>

        {data.grants.map((grant, gi) => {
          const { done, total, pct } = grantProgress(gi, grant.dokumente);
          const byKat = grant.dokumente.reduce<Record<string, Dokument[]>>((acc, d) => {
            (acc[d.kategorie] ??= []).push(d);
            return acc;
          }, {});

          return (
            <Accordion
              key={gi}
              defaultExpanded={gi === 0}
              sx={{
                bgcolor: "#111827",
                color: "#fff",
                mb: 2,
                borderRadius: "12px !important",
                "&:before": { display: "none" },
                border: "1px solid #1f2937",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#9ca3af" }} />} sx={{ px: 3, py: 1 }}>
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 1 }}>
                    <Typography fontWeight={700} sx={{ flex: 1 }}>
                      {grant.programm_name}
                    </Typography>
                    {grant.passgenauigkeit_score != null && (
                      <Chip
                        label={`${Math.round(grant.passgenauigkeit_score * 100)}% Match`}
                        size="small"
                        sx={{
                          bgcolor: scoreColor(grant.passgenauigkeit_score) + "22",
                          color: scoreColor(grant.passgenauigkeit_score),
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      />
                    )}
                    <Chip
                      label={`${done}/${total} Dokumente`}
                      size="small"
                      sx={{ bgcolor: "#1f2937", color: "#9ca3af", fontSize: 12 }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: "#1f2937",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: pct === 100 ? "#4ADE80" : "#3b82f6",
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                {grant.frist && (
                  <Typography sx={{ color: "#9ca3af", fontSize: 13, mb: 2 }}>
                    Frist: {grant.frist}
                    {grant.foerder_summe_max
                      ? ` · Max. ${grant.foerder_summe_max.toLocaleString("de-DE")} EUR`
                      : ""}
                  </Typography>
                )}

                {Object.entries(byKat).map(([kat, docs]) => (
                  <Box key={kat} sx={{ mb: 2 }}>
                    <Typography sx={{ color: "#4ADE80", fontSize: 12, fontWeight: 700, mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {kat}
                    </Typography>
                    {docs.map((doc) => (
                      <FormControlLabel
                        key={doc.id}
                        control={
                          <Checkbox
                            checked={!!checked[`${gi}-${doc.id}`]}
                            onChange={() => toggle(`${gi}-${doc.id}`)}
                            sx={{ color: "#4ADE80", "&.Mui-checked": { color: "#4ADE80" }, py: 0.5 }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: 14, color: checked[`${gi}-${doc.id}`] ? "#6b7280" : "#d1d5db", textDecoration: checked[`${gi}-${doc.id}`] ? "line-through" : "none" }}>
                            {doc.label}
                          </Typography>
                        }
                        sx={{ display: "flex", ml: 0, mb: 0.25 }}
                      />
                    ))}
                  </Box>
                ))}

                <Button
                  size="small"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  href={grant.quelle_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "#4ADE80", mt: 1, fontSize: 13, px: 0, textTransform: "none" }}
                >
                  Zum offiziellen Förderprogramm
                </Button>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Container>
    </Box>
  );
}
