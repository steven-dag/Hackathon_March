import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box, Typography, Paper, Chip, Checkbox, FormControlLabel,
  LinearProgress, Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Button, Divider, IconButton, TextField, Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockIcon from "@mui/icons-material/Lock";
import BirdLogo from "../components/BirdLogo";

const BASE_URL = "http://localhost:8000";

interface Dokument { id: string; label: string; kategorie: string; }
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
interface ChatMsg { role: "user" | "bot"; text: string; }

function scoreColor(score: number) {
  if (score >= 0.7) return "#4ADE80";
  if (score >= 0.4) return "#FACC15";
  return "#F87171";
}

// ── Chat Widget ────────────────────────────────────────────────────────────
function ChatWidget({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "bot", text: "Hallo! Ich bin Ihr .birdie-Assistent. Wie kann ich Ihnen bei den Förderprogrammen oder der Digitalisierung helfen?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [msgs, open]);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMsgs((p) => [...p, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/portal/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMsgs((p) => [...p, { role: "bot", text: data.reply || "Bitte wenden Sie sich direkt an Ihren Berater." }]);
    } catch {
      setMsgs((p) => [...p, { role: "bot", text: "Verbindungsfehler. Bitte versuchen Sie es erneut." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <Paper elevation={0} sx={{
          position: "fixed", bottom: 88, right: 24, width: 368, height: 500,
          bgcolor: "#0d1117",
          border: "1px solid rgba(74,222,128,0.15)",
          borderRadius: 4,
          display: "flex", flexDirection: "column",
          zIndex: 1300, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.08)",
        }}>
          {/* Header */}
          <Box sx={{
            px: 2.5, py: 2,
            background: "linear-gradient(135deg, #0d1117 0%, #111827 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #4ADE80, #22c55e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 12px rgba(74,222,128,0.4)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0a">
                  <path d="M22 4c0 0-7.5 1-10 5-1.5 2.4-1.2 5.1 0 7C8 19 4 20 2 20c2-1 3.5-3 4-5-2 1-4 1-4 1s4-2 5-5C8.5 7 14 4 22 4z" />
                </svg>
              </Box>
              <Box>
                <Typography fontWeight={700} sx={{ color: "#fff", fontSize: 14, lineHeight: 1.2 }}>.birdie Support</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ADE80" }} />
                  <Typography sx={{ color: "#4ADE80", fontSize: 11 }}>Online</Typography>
                </Box>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#6b7280", "&:hover": { color: "#fff" } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 1.5,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#1f2937", borderRadius: 2 },
          }}>
            {msgs.map((m, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <Box sx={{
                  maxWidth: "82%", px: 2, py: 1.25,
                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user"
                    ? "linear-gradient(135deg, #4ADE80, #22c55e)"
                    : "rgba(255,255,255,0.04)",
                  border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.06)",
                  color: m.role === "user" ? "#0a0a0a" : "#d1d5db",
                  fontSize: 13, lineHeight: 1.6,
                  fontWeight: m.role === "user" ? 600 : 400,
                }}>
                  {m.text}
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", pl: 0.5 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <Box key={i} sx={{
                    width: 7, height: 7, borderRadius: "50%", bgcolor: "#4ADE80",
                    animation: "pulse 1.2s ease-in-out infinite",
                    animationDelay: `${d}s`,
                    "@keyframes pulse": { "0%,100%": { opacity: 0.3, transform: "scale(0.8)" }, "50%": { opacity: 1, transform: "scale(1)" } },
                  }} />
                ))}
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 1 }}>
            <TextField fullWidth size="small" placeholder="Nachricht eingeben..."
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2.5, fontSize: 13, color: "#fff",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { borderColor: "rgba(74,222,128,0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#4ADE80" },
                },
                "& input::placeholder": { color: "#4b5563" },
              }}
            />
            <IconButton onClick={send} disabled={!input.trim() || loading} sx={{
              width: 40, height: 40, borderRadius: 2.5, flexShrink: 0,
              background: "linear-gradient(135deg, #4ADE80, #22c55e)",
              "&:hover": { background: "linear-gradient(135deg, #22c55e, #16a34a)" },
              "&.Mui-disabled": { bgcolor: "#1f2937", background: "#1f2937" },
            }}>
              <SendIcon sx={{ fontSize: 16, color: "#0a0a0a" }} />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Tooltip title={open ? "Schließen" : "Support-Chat"} placement="left">
        <IconButton onClick={() => setOpen(!open)} sx={{
          position: "fixed", bottom: 24, right: 24,
          width: 56, height: 56,
          background: "linear-gradient(135deg, #4ADE80, #22c55e)",
          boxShadow: "0 4px 24px rgba(74,222,128,0.45)",
          zIndex: 1300,
          "&:hover": { transform: "scale(1.08)", boxShadow: "0 6px 32px rgba(74,222,128,0.55)" },
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          {open
            ? <CloseIcon sx={{ color: "#0a0a0a" }} />
            : <ChatIcon sx={{ color: "#0a0a0a" }} />}
        </IconButton>
      </Tooltip>
    </>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Box sx={{
      bgcolor: accent ? "rgba(74,222,128,0.07)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${accent ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 2.5, px: 2, py: 1.5,
    }}>
      <Typography sx={{ color: accent ? "#4ADE80" : "#fff", fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 11, mt: 0.25 }}>{label}</Typography>
    </Box>
  );
}

// ── Main Portal ────────────────────────────────────────────────────────────
export default function Portal() {
  const [params] = useSearchParams();
  const sessionId = params.get("session");

  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!sessionId) { setError("Kein gültiger Zugangslink."); setLoading(false); return; }
    const saved = localStorage.getItem(`birdie_checklist_${sessionId}`);
    if (saved) setChecked(JSON.parse(saved));

    fetch(`${BASE_URL}/api/portal/${sessionId}`)
      .then((r) => { if (!r.ok) throw new Error("Session nicht gefunden"); return r.json(); })
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

  function grantProgress(gi: number, docs: Dokument[]) {
    const done = docs.filter((d) => checked[`${gi}-${d.id}`]).length;
    return { done, total: docs.length, pct: docs.length ? (done / docs.length) * 100 : 0 };
  }

  if (loading) return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#060608" }}>
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress sx={{ color: "#4ADE80", mb: 2 }} />
        <Typography sx={{ color: "#6b7280", fontSize: 13 }}>Portal wird geladen…</Typography>
      </Box>
    </Box>
  );

  if (error || !data) return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#060608", p: 3 }}>
      <BirdLogo light size="lg" />
      <Box sx={{ mt: 4, p: 3, bgcolor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 3, maxWidth: 440, width: "100%", textAlign: "center" }}>
        <Typography sx={{ color: "#F87171", fontWeight: 600, mb: 1 }}>Zugang nicht möglich</Typography>
        <Typography sx={{ color: "#9ca3af", fontSize: 13 }}>{error || "Ungültiger Link."}</Typography>
      </Box>
    </Box>
  );

  const totalDocs = data.grants.reduce((s, g) => s + g.dokumente.length, 0);
  const totalDone = data.grants.reduce((s, g, gi) => s + g.dokumente.filter((d) => checked[`${gi}-${d.id}`]).length, 0);
  const overallPct = totalDocs ? (totalDone / totalDocs) * 100 : 0;
  const readyCount = data.grants.filter((_, gi) => {
    const { pct } = grantProgress(gi, data.grants[gi].dokumente);
    return pct === 100;
  }).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#060608", color: "#fff" }}>

      {/* ── TOP NAV ── */}
      <Box sx={{
        px: { xs: 3, md: 5 }, py: 2,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "sticky", top: 0, zIndex: 200,
        bgcolor: "rgba(6,6,8,0.85)", backdropFilter: "blur(16px)",
      }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BirdLogo light size="md" />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #4ADE80, #22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#0a0a0a",
            }}>
              {data.company.name.charAt(0).toUpperCase()}
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{data.company.name}</Typography>
              {data.company.branche && (
                <Typography sx={{ color: "#6b7280", fontSize: 11 }}>{data.company.branche}</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      </Box>

      {/* ── HERO STRIP ── */}
      <Box sx={{
        px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 },
        background: "linear-gradient(180deg, rgba(74,222,128,0.04) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography sx={{ color: "#4ADE80", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", mb: 1 }}>
          Ihr persönliches Förder-Portal
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: "#fff", mb: 1, fontSize: { xs: 24, md: 30 } }}>
          {data.grants.length > 0
            ? `${data.grants.length} Förderprogramme bereit`
            : "Ihr Plan wird vorbereitet"}
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 3 }}>
          {data.company.name}
          {data.company.branche ? ` · ${data.company.branche}` : ""}
          {data.company.bundesland ? ` · ${data.company.bundesland}` : ""}
        </Typography>

        {/* Stats */}
        {data.grants.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <StatCard label="Programme" value={String(data.grants.length)} />
            <StatCard label="Max. Förderung" value={`${(data.grants.reduce((s, g) => s + (g.foerder_summe_max || 0), 0) / 1000).toFixed(0)}k EUR`} accent />
            <StatCard label="Unterlagen bereit" value={`${totalDone}/${totalDocs}`} />
            {readyCount > 0 && <StatCard label="Programme vollständig" value={String(readyCount)} accent />}
          </Box>
        )}
        </Box>
      </Box>

      {/* ── MAIN ── */}
      <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", display: "flex", minHeight: "calc(100vh - 180px)" }}>

        {/* Sidebar */}
        {data.plan && (
          <Box sx={{
            width: 320, flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.05)",
            px: 3, py: 4,
            display: { xs: "none", lg: "block" },
          }}>
            {/* Progress ring area */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", mb: 2 }}>
                Fortschritt
              </Typography>
              <Box sx={{ position: "relative", mb: 2 }}>
                <LinearProgress variant="determinate" value={overallPct} sx={{
                  height: 10, borderRadius: 5,
                  bgcolor: "rgba(255,255,255,0.05)",
                  "& .MuiLinearProgress-bar": {
                    background: overallPct === 100
                      ? "linear-gradient(90deg, #4ADE80, #22c55e)"
                      : "linear-gradient(90deg, #3b82f6, #6366f1)",
                    borderRadius: 5,
                  },
                }} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: "#6b7280", fontSize: 12 }}>{totalDone} von {totalDocs} Unterlagen</Typography>
                <Typography sx={{ color: overallPct === 100 ? "#4ADE80" : "#fff", fontWeight: 700, fontSize: 13 }}>
                  {Math.round(overallPct)}%
                </Typography>
              </Box>
              {overallPct === 100 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, px: 2, py: 1, bgcolor: "rgba(74,222,128,0.08)", borderRadius: 2, border: "1px solid rgba(74,222,128,0.15)" }}>
                  <CheckCircleOutlineIcon sx={{ color: "#4ADE80", fontSize: 16 }} />
                  <Typography sx={{ color: "#4ADE80", fontSize: 12, fontWeight: 600 }}>Alle Unterlagen vollständig!</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 3 }} />

            {/* Plan */}
            <Typography sx={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", mb: 2 }}>
              Ihr Digitalplan
            </Typography>
            <Typography sx={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.7, mb: 3 }}>
              {data.plan.zusammenfassung}
            </Typography>

            {data.plan.naechste_schritte.length > 0 && (
              <>
                <Typography sx={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", mb: 1.5 }}>
                  Nächste Schritte
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {data.plan.naechste_schritte.slice(0, 4).map((s, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 1.5, p: 1.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.04)" }}>
                      <Typography sx={{ color: "#4ADE80", fontSize: 12, fontWeight: 800, mt: "1px", flexShrink: 0 }}>{i + 1}</Typography>
                      <Typography sx={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.5 }}>{s}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, px: { xs: 3, md: 5 }, py: 4, overflowY: "auto" }}>

          {/* No grants yet */}
          {data.grants.length === 0 && (
            <Box sx={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              minHeight: 400, textAlign: "center",
            }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", mb: 3,
              }}>
                <LockIcon sx={{ color: "#6b7280", fontSize: 32 }} />
              </Box>
              <Typography fontWeight={700} sx={{ color: "#fff", fontSize: 20, mb: 1 }}>
                Ihr Plan wird vorbereitet
              </Typography>
              <Typography sx={{ color: "#6b7280", fontSize: 14, maxWidth: 380, lineHeight: 1.7 }}>
                Ihr Berater schaltet nach dem Gespräch Ihre persönlichen Förderprogramme frei.
                Sie erhalten eine E-Mail sobald alles bereit ist.
              </Typography>
            </Box>
          )}

          {/* Grants */}
          {data.grants.length > 0 && (
            <Box>
              <Typography sx={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", mb: 3 }}>
                Förderprogramme & Unterlagen
              </Typography>

              {data.grants.map((grant, gi) => {
                const { done, total, pct } = grantProgress(gi, grant.dokumente);
                const byKat = grant.dokumente.reduce<Record<string, Dokument[]>>((acc, d) => {
                  (acc[d.kategorie] ??= []).push(d);
                  return acc;
                }, {});
                const isComplete = pct === 100;

                return (
                  <Accordion key={gi} defaultExpanded={gi === 0} elevation={0} sx={{
                    bgcolor: "rgba(255,255,255,0.02)",
                    color: "#fff", mb: 2,
                    borderRadius: "16px !important",
                    "&:before": { display: "none" },
                    border: isComplete
                      ? "1px solid rgba(74,222,128,0.2)"
                      : "1px solid rgba(255,255,255,0.06)",
                    "&.Mui-expanded": {
                      border: isComplete
                        ? "1px solid rgba(74,222,128,0.25)"
                        : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: isComplete
                        ? "0 0 0 4px rgba(74,222,128,0.04)"
                        : "none",
                    },
                    transition: "all 0.2s",
                  }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#6b7280" }} />}
                      sx={{ px: 3, py: 1.5, "& .MuiAccordionSummary-content": { my: 0 } }}
                    >
                      <Box sx={{ width: "100%", pr: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 1.5 }}>
                          {/* Grant icon */}
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                            background: isComplete
                              ? "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.1))"
                              : "rgba(255,255,255,0.04)",
                            border: isComplete ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isComplete
                              ? <CheckCircleOutlineIcon sx={{ color: "#4ADE80", fontSize: 20 }} />
                              : <Typography sx={{ color: "#6b7280", fontWeight: 800, fontSize: 14 }}>{gi + 1}</Typography>
                            }
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography fontWeight={700} sx={{ fontSize: 14, color: "#fff", mb: 0.5, lineHeight: 1.3 }}>
                              {grant.programm_name}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {grant.passgenauigkeit_score != null && (
                                <Chip label={`${Math.round(grant.passgenauigkeit_score * 100)}% Match`} size="small"
                                  sx={{ bgcolor: scoreColor(grant.passgenauigkeit_score) + "18", color: scoreColor(grant.passgenauigkeit_score), fontWeight: 700, fontSize: 10, height: 20, border: `1px solid ${scoreColor(grant.passgenauigkeit_score)}30` }} />
                              )}
                              {grant.foerder_summe_max && (
                                <Chip label={`bis ${grant.foerder_summe_max.toLocaleString("de-DE")} EUR`} size="small"
                                  sx={{ bgcolor: "rgba(255,255,255,0.04)", color: "#9ca3af", fontSize: 10, height: 20, border: "1px solid rgba(255,255,255,0.07)" }} />
                              )}
                              <Chip
                                label={isComplete ? "✓ Vollständig" : `${done}/${total} Dok.`}
                                size="small"
                                sx={{ bgcolor: isComplete ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)", color: isComplete ? "#4ADE80" : "#6b7280", fontWeight: isComplete ? 700 : 400, fontSize: 10, height: 20, border: isComplete ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(255,255,255,0.06)" }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        <LinearProgress variant="determinate" value={pct} sx={{
                          height: 3, borderRadius: 2, bgcolor: "rgba(255,255,255,0.05)",
                          "& .MuiLinearProgress-bar": {
                            background: isComplete
                              ? "linear-gradient(90deg, #4ADE80, #22c55e)"
                              : "linear-gradient(90deg, #3b82f6, #6366f1)",
                            borderRadius: 2,
                          },
                        }} />
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                      {/* Meta info */}
                      {(grant.frist || grant.foerder_quote_prozent) && (
                        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                          {grant.frist && (
                            <Box sx={{ px: 2, py: 1, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
                              <Typography sx={{ color: "#6b7280", fontSize: 10, mb: 0.25, textTransform: "uppercase", letterSpacing: 0.5 }}>Frist</Typography>
                              <Typography sx={{ color: "#d1d5db", fontSize: 13, fontWeight: 600 }}>{grant.frist}</Typography>
                            </Box>
                          )}
                          {grant.foerder_quote_prozent && (
                            <Box sx={{ px: 2, py: 1, bgcolor: "rgba(74,222,128,0.06)", borderRadius: 2, border: "1px solid rgba(74,222,128,0.12)" }}>
                              <Typography sx={{ color: "#6b7280", fontSize: 10, mb: 0.25, textTransform: "uppercase", letterSpacing: 0.5 }}>Förderquote</Typography>
                              <Typography sx={{ color: "#4ADE80", fontSize: 13, fontWeight: 700 }}>{grant.foerder_quote_prozent}%</Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Checklist */}
                      <Typography sx={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", mb: 2 }}>
                        Benötigte Unterlagen
                      </Typography>

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {Object.entries(byKat).map(([kat, docs]) => (
                          <Box key={kat}>
                            <Typography sx={{ color: "#4ADE80", fontSize: 10, fontWeight: 700, mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>
                              {kat}
                            </Typography>
                            <Paper elevation={0} sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                              {docs.map((doc, di) => {
                                const key = `${gi}-${doc.id}`;
                                const isDone = !!checked[key];
                                return (
                                  <Box key={doc.id} sx={{
                                    display: "flex", alignItems: "center",
                                    px: 2, py: 1.25,
                                    borderBottom: di < docs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                    bgcolor: isDone ? "rgba(74,222,128,0.04)" : "transparent",
                                    transition: "background 0.15s",
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: isDone ? "rgba(74,222,128,0.07)" : "rgba(255,255,255,0.03)" },
                                  }} onClick={() => toggle(key)}>
                                    <Checkbox checked={isDone} onChange={() => toggle(key)}
                                      onClick={(e) => e.stopPropagation()}
                                      size="small"
                                      sx={{ p: 0, mr: 1.5, color: "#374151", "&.Mui-checked": { color: "#4ADE80" } }} />
                                    <Typography sx={{
                                      fontSize: 13, flex: 1,
                                      color: isDone ? "#4b5563" : "#d1d5db",
                                      textDecoration: isDone ? "line-through" : "none",
                                      transition: "all 0.15s",
                                    }}>
                                      {doc.label}
                                    </Typography>
                                    {isDone && <CheckCircleOutlineIcon sx={{ color: "#4ADE80", fontSize: 16, ml: 1 }} />}
                                  </Box>
                                );
                              })}
                            </Paper>
                          </Box>
                        ))}
                      </Box>

                      <Button size="small" endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                        href={grant.quelle_url} target="_blank" rel="noopener noreferrer"
                        sx={{ color: "#6b7280", mt: 2.5, fontSize: 12, px: 0, textTransform: "none", "&:hover": { color: "#4ADE80", bgcolor: "transparent" } }}>
                        Offizielles Förderprogramm
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {sessionId && <ChatWidget sessionId={sessionId} />}
    </Box>
  );
}
