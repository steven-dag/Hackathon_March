import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Alert,
  LinearProgress,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EuroIcon from "@mui/icons-material/Euro";
import StepperLayout from "../components/StepperLayout";
import { useSession } from "../context/SessionContext";
import { generatePlan, getPlan } from "../services/api";
import type { Plan } from "../services/api";

export default function DocumentsReview() {
  const { sessionId, plan, setPlan } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPlan, setLocalPlan] = useState<Plan | null>(plan);

  useEffect(() => {
    if (!sessionId) return;
    if (plan) {
      setLocalPlan(plan);
      return;
    }

    setLoading(true);
    setError(null);

    generatePlan(sessionId)
      .then((data) => {
        setPlan(data);
        setLocalPlan(data);
      })
      .catch(async () => {
        try {
          const existing = await getPlan(sessionId);
          setPlan(existing);
          setLocalPlan(existing);
        } catch (e2: unknown) {
          setError(
            e2 instanceof Error
              ? e2.message
              : "Fehler beim Laden des Plans."
          );
        }
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <StepperLayout nextDisabled={loading || !localPlan}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Ihr KI-Digitalisierungsplan
        </Typography>
        <Chip
          icon={<AutoFixHighIcon />}
          label="Generiert von KI"
          size="small"
          color="secondary"
          variant="outlined"
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ihr persönlicher 12-Monats-Plan mit Maßnahmen, Zeitplan und
        Förderoptionen – erstellt von Gemini AI.
      </Typography>

      {!sessionId && (
        <Alert severity="warning">
          Keine Session gefunden. Bitte gehen Sie zurück und füllen Sie die Firmendaten aus.
        </Alert>
      )}

      {loading && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={52} sx={{ mb: 2 }} />
          <Typography variant="body1" fontWeight={600}>
            KI erstellt Ihren Digitalisierungsplan...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            Gemini AI analysiert Ihr Unternehmen und erstellt einen maßgeschneiderten Plan
          </Typography>
          <LinearProgress sx={{ borderRadius: 2 }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {localPlan && !loading && (
        <Box>
          {/* Summary */}
          <Card
            sx={{
              mb: 3,
              borderLeft: "4px solid",
              borderColor: "secondary.main",
              borderRadius: 2,
            }}
            elevation={2}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Zusammenfassung
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                {localPlan.zusammenfassung}
              </Typography>
            </CardContent>
          </Card>

          {/* Phases */}
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Umsetzungsphasen ({localPlan.zeitraum_monate} Monate)
          </Typography>
          {localPlan.phasen.map((phase, i) => (
            <Card key={i} sx={{ mb: 2, borderRadius: 2 }} elevation={1}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Chip
                    label={phase.monat}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  />
                  <Typography variant="subtitle1" fontWeight={700}>
                    {phase.titel}
                  </Typography>
                  {phase.kosten_geschaetzt && (
                    <Chip
                      icon={<EuroIcon />}
                      label={`${phase.kosten_geschaetzt.toLocaleString("de-DE")} EUR`}
                      size="small"
                      variant="outlined"
                      sx={{ ml: "auto" }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {phase.beschreibung}
                </Typography>
                <List dense disablePadding>
                  {phase.massnahmen.map((m, j) => (
                    <ListItem key={j} disableGutters sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={m}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}

          {/* Cost breakdown */}
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, mt: 3 }}>
            Kostenaufstellung
          </Typography>
          <Card sx={{ mb: 3, borderRadius: 2 }} elevation={2}>
            <CardContent>
              {localPlan.kosten_aufstellung.entwicklung && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Entwicklung</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {localPlan.kosten_aufstellung.entwicklung.toLocaleString("de-DE")} EUR
                  </Typography>
                </Box>
              )}
              {localPlan.kosten_aufstellung.lizenzen && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Lizenzen</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {localPlan.kosten_aufstellung.lizenzen.toLocaleString("de-DE")} EUR
                  </Typography>
                </Box>
              )}
              {localPlan.kosten_aufstellung.beratung && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Beratung</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {localPlan.kosten_aufstellung.beratung.toLocaleString("de-DE")} EUR
                  </Typography>
                </Box>
              )}
              {localPlan.kosten_aufstellung.hardware && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Hardware</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {localPlan.kosten_aufstellung.hardware.toLocaleString("de-DE")} EUR
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body1" fontWeight={700}>
                  Gesamtkosten
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {localPlan.kosten_aufstellung.gesamt.toLocaleString("de-DE")} EUR
                </Typography>
              </Box>
              {localPlan.kosten_aufstellung.foerderung_abzug && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Förderung (Abzug)
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    -{localPlan.kosten_aufstellung.foerderung_abzug.toLocaleString("de-DE")} EUR
                  </Typography>
                </Box>
              )}
              {localPlan.kosten_aufstellung.eigenanteil && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                    p: 1.5,
                    bgcolor: "primary.50",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight={700} color="primary.main">
                    Ihr Eigenanteil
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="primary.main">
                    {localPlan.kosten_aufstellung.eigenanteil.toLocaleString("de-DE")} EUR
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Next steps */}
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Nächste Schritte
          </Typography>
          <Card sx={{ mb: 2, borderRadius: 2 }} elevation={1}>
            <CardContent>
              <List dense disablePadding>
                {localPlan.naechste_schritte.map((step, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Chip
                        label={i + 1}
                        size="small"
                        color="primary"
                        sx={{
                          height: 24,
                          width: 24,
                          "& .MuiChip-label": { px: 0 },
                          fontWeight: 700,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={step}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Recommended grants */}
          {localPlan.empfohlene_foerderungen.length > 0 && (
            <>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, mt: 3 }}>
                Empfohlene Förderprogramme
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {localPlan.empfohlene_foerderungen.map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    variant="outlined"
                    color="secondary"
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      )}
    </StepperLayout>
  );
}
