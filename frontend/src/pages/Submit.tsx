import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";
import StepperLayout from "../components/StepperLayout";
import { useSession } from "../context/SessionContext";
import { createBooking } from "../services/api";

type Status = "form" | "submitting" | "success" | "error";

export default function Submit() {
  const navigate = useNavigate();
  const { sessionId, companyName } = useSession();

  const [kontaktName, setKontaktName] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [wunschtermin, setWunschtermin] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [status, setStatus] = useState<Status>("form");
  const [errorMsg, setErrorMsg] = useState("");

  const isValid = kontaktName.trim() && email.trim().includes("@");

  const handleBooking = async () => {
    if (!isValid || !sessionId) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      await createBooking({
        session_id: sessionId,
        name: kontaktName.trim(),
        email: email.trim(),
        telefon: telefon.trim() || undefined,
        wunschtermin: wunschtermin || undefined,
        nachricht: nachricht.trim() || undefined,
      });
      setStatus("success");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Buchung fehlgeschlagen.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <StepperLayout hideNext>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 88, color: "success.main", mb: 2 }}
          />
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Beratung gebucht!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
            Vielen Dank, {kontaktName}! Wir melden uns innerhalb von 24 Stunden
            bei Ihnen unter <strong>{email}</strong> und bestätigen Ihren Termin.
          </Typography>
          {wunschtermin && (
            <Alert severity="success" sx={{ maxWidth: 480, mx: "auto", mb: 3 }}>
              Wunschtermin: <strong>{new Date(wunschtermin).toLocaleDateString("de-DE", { dateStyle: "full" })}</strong>
            </Alert>
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{ borderRadius: 8 }}
          >
            Zurück zur Startseite
          </Button>
        </Box>
      </StepperLayout>
    );
  }

  return (
    <StepperLayout hideNext>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <EventIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Kostenlose Beratung buchen
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {companyName
          ? `Unser Experte wird sich mit Ihnen in Verbindung setzen und den Digitalisierungsplan für ${companyName} gemeinsam mit Ihnen umsetzen.`
          : "Unser Experte wird sich mit Ihnen in Verbindung setzen und den Digitalisierungsplan mit Ihnen besprechen."}
      </Typography>

      {!sessionId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Keine Session gefunden. Bitte gehen Sie zurück und füllen Sie die Firmendaten aus.
        </Alert>
      )}

      {status === "error" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Card variant="outlined" sx={{ borderColor: "primary.light", borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Ihr Name *"
                value={kontaktName}
                onChange={(e) => setKontaktName(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="E-Mail-Adresse *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Telefonnummer (optional)"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Wunschtermin (optional)"
                type="date"
                value={wunschtermin}
                onChange={(e) => setWunschtermin(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nachricht / Fragen (optional)"
                multiline
                rows={3}
                value={nachricht}
                onChange={(e) => setNachricht(e.target.value)}
                fullWidth
                placeholder="Haben Sie spezifische Fragen oder Anmerkungen zu Ihrem Digitalisierungsplan?"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!isValid || !sessionId || status === "submitting"}
              onClick={handleBooking}
              startIcon={
                status === "submitting" ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <EventIcon />
                )
              }
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              {status === "submitting"
                ? "Wird gebucht..."
                : "Beratungstermin kostenfrei anfragen"}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, textAlign: "center" }}>
              Kostenlos & unverbindlich · Keine versteckten Kosten
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </StepperLayout>
  );
}
