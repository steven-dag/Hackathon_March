import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import EuroIcon from "@mui/icons-material/Euro";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import StepperLayout from "../components/StepperLayout";
import { useSession } from "../context/SessionContext";
import { getGrants } from "../services/api";
import type { GrantMatch } from "../services/api";

export default function FundingSelection() {
  const { sessionId, grants, setGrants } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    if (grants.length > 0) return;

    setLoading(true);
    setError(null);
    getGrants(sessionId)
      .then((data) => setGrants(data))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Fehler beim Laden der Förderungen.")
      )
      .finally(() => setLoading(false));
  }, [sessionId]);

  const scoreColor = (score: number): "success" | "warning" | "primary" => {
    if (score >= 0.75) return "success";
    if (score >= 0.5) return "warning";
    return "primary";
  };

  return (
    <StepperLayout nextDisabled={loading || grants.length === 0}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Passende Förderprogramme
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Basierend auf Ihrem Unternehmensprofil haben wir die besten
        Förderprogramme aus deutschen Förderdatenbanken gefunden.
      </Typography>

      {!sessionId && (
        <Alert severity="warning">
          Keine Session gefunden. Bitte gehen Sie zurück und füllen Sie die Firmendaten aus.
        </Alert>
      )}

      {loading && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" fontWeight={600}>
            KI analysiert passende Förderungen...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Wir durchsuchen Digital Jetzt, BAFA, KfW, go-digital und weitere Datenbanken
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && grants.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {grants.map((g: GrantMatch) => (
            <Card
              key={g.id}
              sx={{
                borderLeft: "4px solid",
                borderColor:
                  g.passgenauigkeit_score >= 0.75
                    ? "success.main"
                    : g.passgenauigkeit_score >= 0.5
                    ? "warning.main"
                    : "grey.400",
                borderRadius: 2,
              }}
              elevation={2}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.05rem" }}>
                      {g.programm_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {g.antragsteller}
                      {g.frist ? ` · Frist: ${g.frist}` : ""}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<AutoFixHighIcon />}
                    label={`${Math.round(g.passgenauigkeit_score * 100)} % Passgenauigkeit`}
                    color={scoreColor(g.passgenauigkeit_score)}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {g.beschreibung}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={g.passgenauigkeit_score * 100}
                  color={scoreColor(g.passgenauigkeit_score)}
                  sx={{ height: 6, borderRadius: 3, mb: 1.5 }}
                />

                <Divider sx={{ mb: 1.5 }} />

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                  {g.foerder_summe_max && (
                    <Chip
                      icon={<EuroIcon />}
                      label={`Max. ${g.foerder_summe_max.toLocaleString("de-DE")} EUR`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                  {g.foerder_quote_prozent && (
                    <Chip
                      label={`${g.foerder_quote_prozent} % Förderquote`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    icon={<OpenInNewIcon />}
                    label="Mehr erfahren"
                    size="small"
                    variant="outlined"
                    onClick={() => window.open(g.quelle_url, "_blank", "noopener,noreferrer")}
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!loading && !error && grants.length === 0 && sessionId && (
        <Alert severity="info">
          Keine passenden Förderprogramme gefunden. Unser Team kann Ihnen bei einer
          individuellen Suche helfen.
        </Alert>
      )}
    </StepperLayout>
  );
}
