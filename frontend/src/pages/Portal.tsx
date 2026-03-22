import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box, Typography, Paper, Chip, Checkbox,
  LinearProgress, Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Button, Divider, IconButton, TextField, Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BirdLogo from "../components/BirdLogo";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatEUR(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1).replace(".", ",")} Mio. EUR`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}k EUR`;
  return `${val.toLocaleString("de-DE")} EUR`;
}

function scoreColor(score: number) {
  if (score >= 0.7) return "#4ADE80";
  if (score >= 0.4) return "#FACC15";
  return "#F87171";
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Dokument { id: string; label: string; kategorie: string; }
interface Grant {
  id: string;
  programm_name: string;
  foerder_summe_max?: number;
  foerder_quote_prozent?: number;
  passgenauigkeit_score?: number;
  frist?: string;
  quelle_url: string;
  freigegeben: boolean;
  dokumente: Dokument[];
}
interface PortalData {
  session_id: string;
  company: { name: string; branche: string; bundesland: string };
  plan?: { zusammenfassung: string; zeitraum_monate: number; naechste_schritte: string[] };
  grants: Grant[];
}
interface ChatMsg { role: "user" | "bot"; text: string; }

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
          {open ? <CloseIcon sx={{ color: "#0a0a0a" }} /> : <ChatIcon sx={{ color: "#0a0a0a" }} />}
        </IconButton>
      </Tooltip>
    </>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
interface DocMatch { grant: string; doc_id: string; relevanz: number; begruendung: string; }
interface AnalyzedDoc {
  filename: string;
  zusammenfassung: string;
  relevant: boolean;
  nicht_relevant_grund?: string;
  matches: DocMatch[];
  loading?: boolean;
  error?: string;
}

// ── Document Container ──────────────────────────────────────────────────────
function DocContainer({ sessionId, onMatch }: { sessionId: string; onMatch: (docId: string, grantName: string) => void }) {
  const [docs, setDocs] = useState<AnalyzedDoc[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function analyzeFile(file: File) {
    const placeholder: AnalyzedDoc = { filename: file.name, zusammenfassung: "", relevant: true, matches: [], loading: true };
    setDocs((prev) => [placeholder, ...prev]);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}/api/portal/${sessionId}/documents/analyze`, {
        method: "POST",
        body: form,
      });
      const data: AnalyzedDoc = await res.json();
      setDocs((prev) => prev.map((d) => d.filename === file.name && d.loading ? data : d));
      // Auto-check matched items
      data.matches.forEach((m) => {
        if (m.relevanz >= 70) onMatch(m.doc_id, m.grant);
      });
    } catch {
      setDocs((prev) => prev.map((d) =>
        d.filename === file.name && d.loading
          ? { ...d, loading: false, error: "Analyse fehlgeschlagen" }
          : d
      ));
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(analyzeFile);
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography sx={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", mb: 2 }}>
        Dokumente hochladen
      </Typography>

      {/* Drop Zone */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: `2px dashed ${dragging ? "#4ADE80" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 3, p: 4, textAlign: "center", cursor: "pointer",
          bgcolor: dragging ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)",
          transition: "all 0.2s",
          "&:hover": { borderColor: "rgba(74,222,128,0.35)", bgcolor: "rgba(74,222,128,0.03)" },
        }}
      >
        <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx"
          style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
        <CloudUploadIcon sx={{ color: dragging ? "#4ADE80" : "#6b7280", fontSize: 36, mb: 1 }} />
        <Typography fontWeight={600} sx={{ color: dragging ? "#4ADE80" : "#fff", fontSize: 14, mb: 0.5 }}>
          Dokumente hierher ziehen oder klicken
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: 12 }}>
          PDF, JPG, PNG, DOCX · KI prüft automatisch welche Checklisten-Punkte abgedeckt sind
        </Typography>
        <Typography sx={{ color: "#4b5563", fontSize: 11, mt: 0.5 }}>
          ℹ️ Große Dateien werden vollständig analysiert — bei viel Inhalt kann die Analyse etwas länger dauern.
        </Typography>
      </Box>

      {/* Analyzed Docs */}
      {docs.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {docs.map((doc, i) => (
            <Paper key={i} elevation={0} sx={{
              p: 2.5, borderRadius: 3,
              bgcolor: doc.loading ? "rgba(255,255,255,0.03)" : doc.error ? "rgba(248,113,113,0.05)" : doc.relevant ? "rgba(255,255,255,0.03)" : "rgba(248,113,113,0.04)",
              border: doc.loading ? "1px solid rgba(255,255,255,0.07)" : doc.error ? "1px solid rgba(248,113,113,0.15)" : doc.relevant ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(248,113,113,0.15)",
            }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <InsertDriveFileOutlinedIcon sx={{ color: "#6b7280", mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography fontWeight={700} sx={{ color: "#fff", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.filename}
                    </Typography>
                    {doc.loading && <CircularProgress size={14} sx={{ color: "#4ADE80", flexShrink: 0 }} />}
                    {!doc.loading && !doc.error && doc.relevant && <CheckIcon sx={{ color: "#4ADE80", fontSize: 16, flexShrink: 0 }} />}
                    {!doc.loading && !doc.error && !doc.relevant && <ErrorOutlineIcon sx={{ color: "#F87171", fontSize: 16, flexShrink: 0 }} />}
                  </Box>

                  {doc.loading && (
                    <Typography sx={{ color: "#6b7280", fontSize: 12 }}>KI analysiert Dokument…</Typography>
                  )}
                  {doc.error && (
                    <Typography sx={{ color: "#F87171", fontSize: 12 }}>{doc.error}</Typography>
                  )}
                  {!doc.loading && !doc.error && (
                    <>
                      {doc.zusammenfassung && (
                        <Typography sx={{ color: "#9ca3af", fontSize: 12, mb: doc.matches.length > 0 ? 1.5 : 0 }}>
                          {doc.zusammenfassung}
                        </Typography>
                      )}
                      {!doc.relevant && doc.nicht_relevant_grund && (
                        <Typography sx={{ color: "#F87171", fontSize: 12 }}>{doc.nicht_relevant_grund}</Typography>
                      )}
                      {doc.matches.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {doc.matches.map((m, mi) => (
                            <Chip key={mi} size="small"
                              label={`${m.relevanz}% · ${m.doc_id}`}
                              title={m.begruendung}
                              sx={{
                                bgcolor: m.relevanz >= 80 ? "rgba(74,222,128,0.12)" : "rgba(250,204,21,0.1)",
                                color: m.relevanz >= 80 ? "#4ADE80" : "#FACC15",
                                fontSize: 10, height: 20, fontWeight: 700,
                                border: m.relevanz >= 80 ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(250,204,21,0.2)",
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      {doc.relevant && doc.matches.length === 0 && (
                        <Typography sx={{ color: "#6b7280", fontSize: 12 }}>
                          Dokument erkannt, aber kein direkter Checklisten-Match gefunden.
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
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
  // use programm_name as key (id may be empty in DB)
  const [freigegeben, setFreigegeben] = useState<Record<string, boolean>>({});
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    if (!sessionId) { setError("Kein gültiger Zugangslink."); setLoading(false); return; }
    const saved = localStorage.getItem(`birdie_checklist_${sessionId}`);
    if (saved) setChecked(JSON.parse(saved));

    fetch(`${BASE_URL}/api/portal/${sessionId}`)
      .then((r) => { if (!r.ok) throw new Error("Session nicht gefunden"); return r.json(); })
      .then((d: PortalData) => {
        setData(d);
        // init freigegeben state keyed by programm_name
        const fg: Record<string, boolean> = {};
        d.grants.forEach((g) => { fg[g.programm_name] = g.freigegeben; });
        const anySelected = d.grants.some((g) => g.freigegeben);
        setFreigegeben(fg);
        // if none selected yet → start in selection mode
        setSelectionMode(!anySelected);
      })
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

  // Stable key: programm_name + doc_id (never index-based)
  function checkKey(grantName: string, docId: string) {
    return `${grantName}__${docId}`;
  }

  async function toggleFreigeben(grant: Grant, current: boolean) {
    const next = !current;
    // key by programm_name to avoid empty-id bug
    setFreigegeben((prev) => ({ ...prev, [grant.programm_name]: next }));
    try {
      if (grant.id) {
        await fetch(`${BASE_URL}/api/portal/${sessionId}/grants/${grant.id}/freigeben`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ freigegeben: next }),
        });
      }
    } catch {
      setFreigegeben((prev) => ({ ...prev, [grant.programm_name]: current }));
    }
  }

  function confirmSelection() {
    setSelectionMode(false);
  }

  // Called by DocContainer when AI finds a match ≥70%
  function handleDocMatch(docId: string, grantName: string) {
    if (!data) return;
    setChecked((prev) => {
      const next = { ...prev };
      // Check the specific grant, or all grants if no name given
      const targets = grantName
        ? data.grants.filter((g) => g.programm_name === grantName)
        : data.grants;
      targets.forEach((g) => {
        const key = checkKey(g.programm_name, docId);
        if (!next[key]) next[key] = true;
      });
      localStorage.setItem(`birdie_checklist_${sessionId}`, JSON.stringify(next));
      return next;
    });
  }

  function grantProgress(grantName: string, docs: Dokument[]) {
    const done = docs.filter((d) => checked[checkKey(grantName, d.id)]).length;
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

  const selectedGrants = data.grants.filter((g) => freigegeben[g.programm_name]);
  // in selection mode → show all; otherwise → only selected
  const visibleGrants = selectionMode ? data.grants : selectedGrants;
  const totalEUR = selectedGrants.reduce((s, g) => s + (g.foerder_summe_max || 0), 0);
  const totalDocs = selectedGrants.reduce((s, g) => s + g.dokumente.length, 0);
  const totalDone = selectedGrants.reduce((s, g) => s + g.dokumente.filter((d) => checked[checkKey(g.programm_name, d.id)]).length, 0);
  const overallPct = totalDocs ? (totalDone / totalDocs) * 100 : 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#060608", color: "#fff" }}>

      {/* ── TOP NAV ── */}
      <Box sx={{
        px: { xs: 3, md: 5 }, py: 2,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "sticky", top: 0, zIndex: 200,
        bgcolor: "rgba(6,6,8,0.9)", backdropFilter: "blur(16px)",
      }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <BirdLogo light size="md" />
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
            {data.grants.length} Förderprogramme gefunden
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 3 }}>
            {data.company.name}
            {data.company.branche ? ` · ${data.company.branche}` : ""}
            {data.company.bundesland ? ` · ${data.company.bundesland}` : ""}
          </Typography>

          {selectedGrants.length > 0 && (
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ px: 2.5, py: 1.5, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2.5 }}>
                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{selectedGrants.length}</Typography>
                <Typography sx={{ color: "#6b7280", fontSize: 11, mt: 0.25 }}>Ausgewählt</Typography>
              </Box>
              {totalEUR > 0 && (
                <Box sx={{ px: 2.5, py: 1.5, bgcolor: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 2.5 }}>
                  <Typography sx={{ color: "#4ADE80", fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{formatEUR(totalEUR)}</Typography>
                  <Typography sx={{ color: "#6b7280", fontSize: 11, mt: 0.25 }}>Max. Förderung</Typography>
                </Box>
              )}
              {totalDocs > 0 && (
                <Box sx={{ px: 2.5, py: 1.5, bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2.5 }}>
                  <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{totalDone}/{totalDocs}</Typography>
                  <Typography sx={{ color: "#6b7280", fontSize: 11, mt: 0.25 }}>Unterlagen</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── MAIN ── */}
      <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", display: "flex", minHeight: "calc(100vh - 200px)" }}>

        {/* Sidebar — Plan */}
        {data.plan && (
          <Box sx={{
            width: 300, flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.05)",
            px: 3, py: 4,
            display: { xs: "none", lg: "block" },
          }}>
            {selectedGrants.length > 0 && totalDocs > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", mb: 2 }}>
                  Unterlagen-Fortschritt
                </Typography>
                <LinearProgress variant="determinate" value={overallPct} sx={{
                  height: 8, borderRadius: 4, mb: 1.5,
                  bgcolor: "rgba(255,255,255,0.05)",
                  "& .MuiLinearProgress-bar": {
                    background: overallPct === 100
                      ? "linear-gradient(90deg, #4ADE80, #22c55e)"
                      : "linear-gradient(90deg, #3b82f6, #6366f1)",
                    borderRadius: 4,
                  },
                }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#6b7280", fontSize: 12 }}>{totalDone} von {totalDocs}</Typography>
                  <Typography sx={{ color: overallPct === 100 ? "#4ADE80" : "#fff", fontWeight: 700, fontSize: 12 }}>
                    {Math.round(overallPct)}%
                  </Typography>
                </Box>
              </Box>
            )}

            <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 3 }} />

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
        <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, py: 4 }}>

          {/* Selection mode banner */}
          {selectionMode ? (
            <Box sx={{
              mb: 3, px: 3, py: 2.5,
              bgcolor: "rgba(74,222,128,0.05)",
              border: "1px solid rgba(74,222,128,0.15)",
              borderRadius: 3,
              display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
            }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #4ADE80, #22c55e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 13, color: "#0a0a0a",
              }}>1</Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700} sx={{ color: "#fff", fontSize: 14, mb: 0.25 }}>
                  Welche Programme wurden im Call besprochen?
                </Typography>
                <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                  Wählen Sie die Programme aus und klicken Sie auf „Auswahl bestätigen".
                </Typography>
              </Box>
              <Button
                variant="contained"
                disabled={selectedGrants.length === 0}
                onClick={confirmSelection}
                sx={{
                  bgcolor: "#4ADE80", color: "#0a0a0a", fontWeight: 700,
                  fontSize: 13, px: 3, py: 1, borderRadius: 2, textTransform: "none", flexShrink: 0,
                  "&:hover": { bgcolor: "#22c55e" },
                  "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.2)" },
                }}
              >
                Auswahl bestätigen ({selectedGrants.length})
              </Button>
            </Box>
          ) : (
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Ihre Förderprogramme
              </Typography>
              <Button size="small" onClick={() => setSelectionMode(true)}
                sx={{ color: "#6b7280", fontSize: 12, textTransform: "none", "&:hover": { color: "#4ADE80" } }}>
                Auswahl ändern
              </Button>
            </Box>
          )}

          {/* Data disclaimer */}
          {!selectionMode && (
            <Box sx={{
              mb: 3, px: 2.5, py: 1.75,
              bgcolor: "rgba(250,204,21,0.04)",
              border: "1px solid rgba(250,204,21,0.12)",
              borderRadius: 2.5,
              display: "flex", alignItems: "flex-start", gap: 1.5,
            }}>
              <Typography sx={{ color: "#FACC15", fontSize: 15, lineHeight: 1, mt: "1px", flexShrink: 0 }}>ℹ</Typography>
              <Typography sx={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.6 }}>
                <Box component="span" sx={{ color: "#d1d5db", fontWeight: 600 }}>Angaben ohne Gewähr.</Box>
                {" "}Förderhöhen, Quoten und Fristen basieren auf öffentlichen Quellen und werden regelmäßig aktualisiert.
                Vor einem Antrag immer die offizielle Programmseite prüfen — die Links finden Sie direkt bei jedem Programm.
              </Typography>
            </Box>
          )}

          {/* Grants */}
          {visibleGrants.map((grant) => {
            const isSelected = !!freigegeben[grant.programm_name];
            const { done, total, pct } = grantProgress(grant.programm_name, grant.dokumente);
            const byKat = grant.dokumente.reduce<Record<string, Dokument[]>>((acc, d) => {
              (acc[d.kategorie] ??= []).push(d);
              return acc;
            }, {});
            const isComplete = isSelected && pct === 100;

            return (
              <Accordion
                key={grant.id}
                defaultExpanded={false}
                elevation={0}
                sx={{
                  bgcolor: isSelected ? "rgba(74,222,128,0.03)" : "rgba(255,255,255,0.02)",
                  color: "#fff", mb: 2,
                  borderRadius: "14px !important",
                  "&:before": { display: "none" },
                  border: isComplete
                    ? "1px solid rgba(74,222,128,0.3)"
                    : isSelected
                      ? "1px solid rgba(74,222,128,0.15)"
                      : "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.2s",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#6b7280" }} />}
                  sx={{ px: 3, py: 1.5, "& .MuiAccordionSummary-content": { my: 0 } }}
                >
                  <Box sx={{ width: "100%", pr: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {/* Number / check icon */}
                      <Box sx={{
                        width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                        background: isComplete
                          ? "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.1))"
                          : isSelected
                            ? "rgba(74,222,128,0.08)"
                            : "rgba(255,255,255,0.04)",
                        border: isSelected ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(255,255,255,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isComplete
                          ? <CheckCircleOutlineIcon sx={{ color: "#4ADE80", fontSize: 18 }} />
                          : <Typography sx={{ color: isSelected ? "#4ADE80" : "#6b7280", fontWeight: 800, fontSize: 13 }}>{visibleGrants.indexOf(grant) + 1}</Typography>
                        }
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} sx={{ fontSize: 14, color: isSelected ? "#fff" : "rgba(255,255,255,0.55)", mb: 0.5, lineHeight: 1.3 }}>
                          {grant.programm_name}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                          {grant.passgenauigkeit_score != null && (
                            <Chip label={`${Math.round(grant.passgenauigkeit_score * 100)}% Match`} size="small"
                              sx={{ bgcolor: scoreColor(grant.passgenauigkeit_score) + "18", color: scoreColor(grant.passgenauigkeit_score), fontWeight: 700, fontSize: 10, height: 20, border: `1px solid ${scoreColor(grant.passgenauigkeit_score)}30` }} />
                          )}
                          {grant.foerder_summe_max != null && (
                            <Chip label={`bis ${formatEUR(grant.foerder_summe_max)}`} size="small"
                              sx={{ bgcolor: "rgba(255,255,255,0.04)", color: "#9ca3af", fontSize: 10, height: 20, border: "1px solid rgba(255,255,255,0.07)" }} />
                          )}
                          {isSelected && (
                            <Chip
                              label={isComplete ? "✓ Vollständig" : `${done}/${total} Dok.`}
                              size="small"
                              sx={{ bgcolor: isComplete ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)", color: isComplete ? "#4ADE80" : "#6b7280", fontWeight: isComplete ? 700 : 400, fontSize: 10, height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Freigeben toggle */}
                      <Tooltip title={isSelected ? "Im Call besprochen ✓" : "Als besprochen markieren"} placement="left">
                        <Box
                          onClick={(e) => { e.stopPropagation(); toggleFreigeben(grant, isSelected); }}
                          sx={{
                            display: "flex", alignItems: "center", gap: 1,
                            px: 1.5, py: 0.75, borderRadius: 2, flexShrink: 0,
                            bgcolor: isSelected ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)",
                            border: isSelected ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": { bgcolor: isSelected ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)" },
                          }}
                        >
                          {isSelected
                            ? <CheckCircleOutlineIcon sx={{ color: "#4ADE80", fontSize: 16 }} />
                            : <RadioButtonUncheckedIcon sx={{ color: "#6b7280", fontSize: 16 }} />
                          }
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#4ADE80" : "#6b7280" }}>
                            {isSelected ? "Ausgewählt" : "Auswählen"}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>

                    {isSelected && (
                      <LinearProgress variant="determinate" value={pct} sx={{
                        height: 2, borderRadius: 2, mt: 2, bgcolor: "rgba(255,255,255,0.05)",
                        "& .MuiLinearProgress-bar": {
                          background: isComplete
                            ? "linear-gradient(90deg, #4ADE80, #22c55e)"
                            : "linear-gradient(90deg, #3b82f6, #6366f1)",
                          borderRadius: 2,
                        },
                      }} />
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  {!isSelected ? (
                    <Box sx={{ py: 3, textAlign: "center" }}>
                      <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                        Markieren Sie dieses Programm als „Ausgewählt", um die Unterlagen-Checkliste zu aktivieren.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {(grant.frist || grant.foerder_quote_prozent) && (
                        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                          {grant.frist && (
                            <Box sx={{ px: 2, py: 1, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
                              <Typography sx={{ color: "#6b7280", fontSize: 10, mb: 0.25, textTransform: "uppercase", letterSpacing: 0.5 }}>Frist</Typography>
                              <Typography sx={{ color: "#d1d5db", fontSize: 13, fontWeight: 600 }}>{grant.frist}</Typography>
                            </Box>
                          )}
                          {grant.foerder_quote_prozent != null && (
                            <Box sx={{ px: 2, py: 1, bgcolor: "rgba(74,222,128,0.06)", borderRadius: 2, border: "1px solid rgba(74,222,128,0.12)" }}>
                              <Typography sx={{ color: "#6b7280", fontSize: 10, mb: 0.25, textTransform: "uppercase", letterSpacing: 0.5 }}>Förderquote</Typography>
                              <Typography sx={{ color: "#4ADE80", fontSize: 13, fontWeight: 700 }}>{grant.foerder_quote_prozent}%</Typography>
                            </Box>
                          )}
                        </Box>
                      )}

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
                                const key = checkKey(grant.programm_name, doc.id);
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

                      {grant.quelle_url && (
                        <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                          <Typography sx={{ color: "#4b5563", fontSize: 11 }}>
                            Angaben ohne Gewähr — vor Antragstellung offizielle Quelle prüfen
                          </Typography>
                          <Button size="small" endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
                            href={grant.quelle_url} target="_blank" rel="noopener noreferrer"
                            sx={{
                              color: "#4ADE80", fontSize: 12, px: 1.5, py: 0.5,
                              textTransform: "none", borderRadius: 1.5,
                              bgcolor: "rgba(74,222,128,0.06)",
                              border: "1px solid rgba(74,222,128,0.15)",
                              fontWeight: 600,
                              "&:hover": { bgcolor: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" },
                            }}>
                            Offizielle Programmseite
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
          {/* Document Container — only show after selection confirmed */}
          {!selectionMode && selectedGrants.length > 0 && sessionId && (
            <DocContainer sessionId={sessionId} onMatch={handleDocMatch} />
          )}

        </Box>
      </Box>

      {sessionId && <ChatWidget sessionId={sessionId} />}
    </Box>
  );
}
