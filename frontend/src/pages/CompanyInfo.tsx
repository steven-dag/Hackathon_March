import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  MenuItem,
  Slider,
  TextField,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StepperLayout from "../components/StepperLayout";
import { useNavigate } from "react-router-dom";
import { createSession, saveCompany, saveAssessment, lookupCompany } from "../services/api";
import { useSession } from "../context/SessionContext";

const branches = [
  "Handwerk",
  "Bau & Immobilien",
  "Einzelhandel",
  "Gastronomie & Hotellerie",
  "Produktion & Fertigung",
  "Logistik & Transport",
  "IT & Software",
  "Beratung & Dienstleistung",
  "Gesundheit & Pflege",
  "Sonstiges",
];

const bundeslaender = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

const toolOptions = [
  "Excel / Office",
  "Buchhaltungssoftware (z. B. DATEV, Lexware)",
  "ERP-System (z. B. SAP, Sage)",
  "CRM-System",
  "Handwerker-Software (z. B. Craftware, Streit)",
  "Zeiterfassung digital",
  "Cloud-Speicher",
  "Kein digitales Tool",
];

const schmerzPunkteOptions = [
  "Papierbasierte Prozesse",
  "Zeiterfassung noch analog",
  "Keine digitale Kundenkommunikation",
  "Lagerverwaltung unübersichtlich",
  "Keine Online-Präsenz / Website",
  "Manuelle Buchhaltung / Rechnungsstellung",
  "Fehlende Auftragsverwaltung",
  "Kein mobiler Zugriff für Außendienst",
];

const zielOptions = [
  "Digitalisierung der Geschäftsprozesse",
  "Einführung eines ERP-Systems",
  "Aufbau eines Online-Shops",
  "IT-Sicherheit verbessern",
  "Digitales Marketing stärken",
  "Mitarbeiter digital qualifizieren",
  "Kundenkommunikation digitalisieren",
  "Homeoffice / Remote Work ermöglichen",
];

const digitalisierungsGradLabels: { [k: number]: string } = {
  1: "Kaum digital",
  2: "Erste Schritte",
  3: "Teilweise digital",
  4: "Weitgehend digital",
  5: "Voll digitalisiert",
};

export default function CompanyInfo() {
  const navigate = useNavigate();
  const { setSessionId, setCompanyName } = useSession();

  const [name, setName] = useState("");
  const [branche, setBranche] = useState("");
  const [mitarbeiter, setMitarbeiter] = useState("");
  const [plz, setPlz] = useState("");
  const [bundesland, setBundesland] = useState("");

  const [aktivTools, setAktivTools] = useState<string[]>([]);
  const [schmerzPunkte, setSchmerzPunkte] = useState<string[]>([]);
  const [ziel, setZiel] = useState("");
  const [digitGrad, setDigitGrad] = useState<number>(2);
  const [budget, setBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Lookup state ──
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupFound, setLookupFound] = useState(false);
  const [lookupDesc, setLookupDesc] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupFound(false);
    setLookupDesc(null);
    try {
      const result = await lookupCompany(lookupQuery.trim());
      if (result.name) setName(result.name);
      if (result.branche && branches.includes(result.branche)) setBranche(result.branche);
      if (result.mitarbeiter) setMitarbeiter(result.mitarbeiter);
      if (result.plz) setPlz(result.plz);
      if (result.bundesland && bundeslaender.includes(result.bundesland)) setBundesland(result.bundesland);
      if (result.beschreibung) setLookupDesc(result.beschreibung);
      setLookupFound(true);
    } catch {
      setError("Unternehmen konnte nicht gefunden werden. Bitte manuell ausfüllen.");
    } finally {
      setLookupLoading(false);
    }
  };

  const toggleCheck = (
    val: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(val) ? list.filter((x) => x !== val) : [...list, val]
    );
  };

  const isValid =
    name.trim() &&
    branche &&
    mitarbeiter &&
    parseInt(mitarbeiter) > 0 &&
    plz.trim().length >= 4 &&
    ziel;

  const handleNext = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      const session = await createSession();
      const sid = session.id;
      setSessionId(sid);
      setCompanyName(name.trim());

      await saveCompany({
        session_id: sid,
        name: name.trim(),
        branche,
        mitarbeiter_anzahl: parseInt(mitarbeiter),
        plz: plz.trim(),
        bundesland: bundesland || undefined,
      });

      await saveAssessment({
        session_id: sid,
        aktuelle_tools: aktivTools,
        schmerz_punkte: schmerzPunkte,
        digitalisierungs_grad: digitGrad,
        ziel,
        budget_vorstellung: budget.trim() || undefined,
      });

      navigate("/app/funding");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Fehler beim Speichern. Bitte erneut versuchen."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepperLayout
      onNext={handleNext}
      nextLoading={loading}
      nextDisabled={!isValid}
      hideNext
    >
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Ihr Unternehmen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Geben Sie Ihre Unternehmensdaten ein, damit wir passende Förderprogramme
        und einen individuellen KI-Plan erstellen können.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ── Company Lookup ── */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 2,
          bgcolor: "#f8f9fc",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
          Unternehmen automatisch finden
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          Website-URL oder Firmenname eingeben — wir füllen das Formular vor.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <TextField
            placeholder="z. B. musterbetrieb.de oder Muster GmbH Köln"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleLookup}
            disabled={!lookupQuery.trim() || lookupLoading}
            sx={{
              bgcolor: "#0a0a0a",
              fontWeight: 700,
              whiteSpace: "nowrap",
              px: 2.5,
              py: "6.5px",
              "&:hover": { bgcolor: "#222" },
            }}
          >
            {lookupLoading ? <CircularProgress size={18} color="inherit" /> : "Suchen"}
          </Button>
        </Box>
        {lookupFound && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Chip label="Gefunden" color="success" size="small" sx={{ fontWeight: 700 }} />
            {lookupDesc && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {lookupDesc}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Unternehmensdaten
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Firmenname *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Branche *"
            select
            value={branche}
            onChange={(e) => setBranche(e.target.value)}
            fullWidth
          >
            {branches.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Anzahl Mitarbeiter *"
            type="number"
            value={mitarbeiter}
            onChange={(e) => setMitarbeiter(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="PLZ *"
            value={plz}
            onChange={(e) => setPlz(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            label="Bundesland"
            select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            fullWidth
          >
            <MenuItem value="">-- Bitte wählen --</MenuItem>
            {bundeslaender.map((bl) => (
              <MenuItem key={bl} value={bl}>
                {bl}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Ihr aktueller Digitalstatus
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Welche digitalen Tools nutzen Sie bereits?
      </Typography>
      <FormGroup sx={{ mb: 3, display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {toolOptions.map((t) => (
          <FormControlLabel
            key={t}
            control={
              <Checkbox
                checked={aktivTools.includes(t)}
                onChange={() => toggleCheck(t, aktivTools, setAktivTools)}
                size="small"
              />
            }
            label={<Typography variant="body2">{t}</Typography>}
            sx={{ width: { xs: "100%", sm: "50%" }, mr: 0 }}
          />
        ))}
      </FormGroup>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Wo drückt der Schuh? (Schmerzpunkte)
      </Typography>
      <FormGroup sx={{ mb: 3, display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {schmerzPunkteOptions.map((s) => (
          <FormControlLabel
            key={s}
            control={
              <Checkbox
                checked={schmerzPunkte.includes(s)}
                onChange={() => toggleCheck(s, schmerzPunkte, setSchmerzPunkte)}
                size="small"
              />
            }
            label={<Typography variant="body2">{s}</Typography>}
            sx={{ width: { xs: "100%", sm: "50%" }, mr: 0 }}
          />
        ))}
      </FormGroup>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Hauptziel der Digitalisierung *"
            select
            value={ziel}
            onChange={(e) => setZiel(e.target.value)}
            fullWidth
          >
            {zielOptions.map((z) => (
              <MenuItem key={z} value={z}>
                {z}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Aktueller Digitalisierungsgrad:{" "}
            <strong>{digitalisierungsGradLabels[digitGrad]}</strong>
          </Typography>
          <Slider
            value={digitGrad}
            onChange={(_, v) => setDigitGrad(v as number)}
            min={1}
            max={5}
            step={1}
            marks={[1, 2, 3, 4, 5].map((v) => ({
              value: v,
              label: String(v),
            }))}
            sx={{ mt: 1 }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Budgetvorstellung (optional, z. B. 10.000 - 30.000 EUR)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!isValid || loading}
          onClick={handleNext}
          sx={{ py: 1.5, fontWeight: 700 }}
        >
          {loading ? "Wird gespeichert..." : "Weiter: Förderungen finden"}
        </Button>
      </Box>
    </StepperLayout>
  );
}
