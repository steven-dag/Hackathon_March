import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Paper, Typography, TextField, Button,
  CircularProgress, Alert,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PortalLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/api/portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "E-Mail nicht gefunden.");
        return;
      }

      const data = await res.json();
      navigate(`/portal?session=${data.session_id}`);
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0d1117", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        px: { xs: 3, md: 6 },
        py: 1.8,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Box sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 1 }} onClick={() => navigate("/")}>
          {/* .birdie logo */}
          <Box sx={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #4ADE80, #22c55e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(74,222,128,0.35)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0a">
              <path d="M22 4c0 0-7.5 1-10 5-1.5 2.4-1.2 5.1 0 7C8 19 4 20 2 20c2-1 3.5-3 4-5-2 1-4 1-4 1s4-2 5-5C8.5 7 14 4 22 4z" />
            </svg>
          </Box>
          <Typography fontWeight={800} sx={{ color: "#fff", fontSize: 16, letterSpacing: "-0.3px" }}>
            .birdie
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>
          KUNDEN-PORTAL
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 6 }}>
        <Container maxWidth="xs">
          {/* Glow effect */}
          <Box sx={{
            position: "absolute",
            width: 300, height: 300,
            background: "radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            transform: "translate(-50%, -60%)",
            left: "50%",
            zIndex: 0,
          }} />

          <Paper elevation={0} sx={{
            position: "relative", zIndex: 1,
            p: { xs: 3, md: 4.5 },
            borderRadius: 4,
            bgcolor: "#111827",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}>
            {/* Icon */}
            <Box sx={{
              width: 52, height: 52, borderRadius: 2.5,
              background: "linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))",
              border: "1px solid rgba(74,222,128,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              mb: 3,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#4ADE80">
                <path d="M22 4c0 0-7.5 1-10 5-1.5 2.4-1.2 5.1 0 7C8 19 4 20 2 20c2-1 3.5-3 4-5-2 1-4 1-4 1s4-2 5-5C8.5 7 14 4 22 4z" />
              </svg>
            </Box>

            <Typography variant="h5" fontWeight={800} sx={{ mb: 0.75, color: "#fff" }}>
              Förder-Portal
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 14, mb: 4, lineHeight: 1.6 }}>
              Geben Sie die E-Mail-Adresse ein, mit der Sie Ihr Beratungsgespräch gebucht haben.
            </Typography>

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                type="email"
                label="E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                    "&.Mui-focused fieldset": { borderColor: "#4ADE80" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#4ADE80" },
                }}
              />

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    bgcolor: "rgba(248,113,113,0.1)",
                    color: "#F87171",
                    border: "1px solid rgba(248,113,113,0.2)",
                    "& .MuiAlert-icon": { color: "#F87171" },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!email.trim() || loading}
                endIcon={loading
                  ? <CircularProgress size={18} color="inherit" />
                  : <ArrowForwardIcon />}
                sx={{
                  background: "linear-gradient(135deg, #4ADE80, #22c55e)",
                  color: "#0a0a0a",
                  fontWeight: 700,
                  fontSize: 15,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "0 4px 20px rgba(74,222,128,0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5BEF90, #33d66e)",
                    boxShadow: "0 6px 24px rgba(74,222,128,0.45)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                {loading ? "Wird gesucht…" : "Portal öffnen"}
              </Button>
            </form>

            <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Noch kein Gespräch gebucht?{" "}
                <Box component="a" href="/"
                  sx={{ color: "#4ADE80", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                  Jetzt kostenlos starten
                </Box>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
