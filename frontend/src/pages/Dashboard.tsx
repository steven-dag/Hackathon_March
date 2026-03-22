import { Box, Button, Container, Typography, Grid, Chip, Accordion, AccordionSummary, AccordionDetails, Tooltip, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useNavigate } from "react-router-dom";
import BirdLogo from "../components/BirdLogo";

const stats = [
  { value: "50%", label: "max. Förderung" },
  { value: "5 Min.", label: "bis zum Plan" },
  { value: "100%", label: "kostenlos" },
  { value: "Ihr Plan", label: "individuell" },
];

const steps = [
  {
    num: "01",
    title: "Firmendaten eingeben",
    desc: "Branche, Mitarbeiter, aktuelle Tools und Ziele – in unter 3 Minuten ausgefüllt.",
  },
  {
    num: "02",
    title: "Förderprogramme entdecken",
    desc: "Wir matchen Ihr Unternehmen mit BAFA, KfW, Digitalbonus und weiteren Programmen.",
  },
  {
    num: "03",
    title: "Fördergelder sichern",
    desc: "Kein Neukauf, kein Systemwechsel. Wir schauen was Sie bereits haben und holen das Maximum raus. Ihr persönlicher Plan zeigt, welche Fördertöpfe Sie anzapfen können – und wie viel vom Staat zurückkommt.",
  },
  {
    num: "04",
    title: "Beratung buchen",
    desc: "Kostenloser 30-Minuten-Termin. Wir klären alles – und beantragen gemeinsam.",
  },
];

const painPoints = [
  "Papierberge statt digitaler Prozesse",
  "Fördermittel ungenutzt verfallen",
  "Keine Zeit für Digitalisierung",
  "Keine Ahnung, wo anfangen",
  "Tools vorhanden, aber nicht ausgeschöpft",
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0a", color: "white" }}>
      {/* ── NAV ── */}
      <Box
        sx={{
          px: { xs: 3, md: 6 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <BirdLogo light />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Mein Portal" placement="bottom">
            <IconButton
              onClick={() => navigate("/portal/login")}
              sx={{
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                p: 0.9,
                "&:hover": {
                  color: "#4ADE80",
                  borderColor: "rgba(74,222,128,0.4)",
                  bgcolor: "rgba(74,222,128,0.06)",
                },
                transition: "all 0.2s",
              }}
            >
              <AccountCircleOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            onClick={() => navigate("/app/company")}
            sx={{
              bgcolor: "#4ADE80",
              color: "#0a0a0a",
              fontWeight: 700,
              fontSize: "0.85rem",
              px: 3,
              py: 1,
              borderRadius: 8,
              "&:hover": { bgcolor: "#22c55e" },
            }}
          >
            Kostenlos starten
          </Button>
        </Box>
      </Box>

      {/* ── HERO ── */}
      <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 }, maxWidth: 900, mx: "auto" }}>
        <Chip
          label="KI-gestützte Digitalisierungsberatung"
          sx={{
            mb: 4,
            bgcolor: "rgba(74,222,128,0.12)",
            color: "#4ADE80",
            fontWeight: 600,
            fontSize: "0.8rem",
            border: "1px solid rgba(74,222,128,0.3)",
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.8rem", md: "5rem" },
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-2px",
            mb: 3,
          }}
        >
          Digitalisierung.
          <br />
          <Box component="span" sx={{ color: "#4ADE80" }}>
            Endlich einfach.
          </Box>
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.55)",
            fontWeight: 400,
            lineHeight: 1.7,
            maxWidth: 560,
            mb: 5,
            fontSize: { xs: "1rem", md: "1.15rem" },
          }}
        >
          Erfahren Sie, welche Fördermittel Ihnen zustehen – und bekommen
          Sie einen konkreten Plan, wie Sie Ihr Unternehmen digitalisieren.
          In 5 Minuten. Kostenlos und unverbindlich.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/app/company")}
            sx={{
              bgcolor: "#4ADE80",
              color: "#0a0a0a",
              fontWeight: 800,
              fontSize: "1rem",
              px: 5,
              py: 1.8,
              borderRadius: 8,
              "&:hover": { bgcolor: "#22c55e" },
              boxShadow: "0 0 32px rgba(74,222,128,0.3)",
            }}
          >
            Fördercheck starten →
          </Button>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
            Kein Account · Keine Kreditkarte
          </Typography>
        </Box>
      </Box>

      {/* ── STATS ── */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Container maxWidth="md">
          <Grid container>
            {stats.map((s, i) => (
              <Grid
                size={{ xs: 6, md: 3 }}
                key={s.label}
                sx={{
                  py: 4,
                  textAlign: "center",
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <Typography variant="h3" fontWeight={900} sx={{ color: "#4ADE80", fontSize: { xs: "2rem", md: "2.5rem" } }}>
                  {s.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", mt: 0.5, fontWeight: 500 }}>
                  {s.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── PAIN POINTS ── */}
      <Box sx={{ bgcolor: "#111", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ color: "#4ADE80", fontWeight: 700, letterSpacing: 2, display: "block", mb: 2 }}
          >
            Kommt Ihnen das bekannt vor?
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 5, fontSize: { xs: "1.8rem", md: "2.5rem" }, letterSpacing: "-1px" }}>
            Digitalisierung fühlt sich an wie{" "}
            <Box component="span" sx={{ color: "rgba(255,255,255,0.3)" }}>
              ein Dschungel.
            </Box>
          </Typography>
          <Grid container spacing={2}>
            {painPoints.map((p, i) => (
              <Grid size={{ xs: 12, sm: 6 }} key={p} sx={i === painPoints.length - 1 && painPoints.length % 2 !== 0 ? { mx: "auto" } : {}}>
                <Box
                  sx={{
                    p: 3,
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    bgcolor: "rgba(255,255,255,0.02)",
                    "&:hover": { borderColor: "rgba(74,222,128,0.3)", bgcolor: "rgba(74,222,128,0.04)" },
                    transition: "all 0.2s",
                  }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.2)", flexShrink: 0, mt: 0.8 }} />
                  <Typography variant="body1" fontWeight={600} sx={{ color: "rgba(255,255,255,0.8)" }}>
                    {p}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 5, p: 3, bgcolor: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600} sx={{ color: "#4ADE80" }}>
              .birdie bringt Klarheit — wir arbeiten mit dem, was Sie haben. Kein Neukauf, keine Überzeugungsarbeit.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ── HOW IT WORKS ── */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#0a0a0a" }}>
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ color: "#4ADE80", fontWeight: 700, letterSpacing: 2, display: "block", mb: 2 }}
          >
            So funktioniert's
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 6, fontSize: { xs: "1.8rem", md: "2.5rem" }, letterSpacing: "-1px" }}>
            Von 0 zum Förderplan in{" "}
            <Box component="span" sx={{ color: "#4ADE80" }}>4 Schritten.</Box>
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {steps.map((step, i) => (
              <Box
                key={step.num}
                sx={{
                  display: "flex",
                  gap: 4,
                  py: 3.5,
                  borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.2)",
                    minWidth: 32,
                    letterSpacing: 1,
                    mt: 0.5,
                  }}
                >
                  {step.num}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── FAQ ── */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "#0a0a0a" }}>
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ color: "#4ADE80", fontWeight: 700, letterSpacing: 2, display: "block", mb: 2 }}
          >
            Häufige Fragen
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 6, fontSize: { xs: "1.8rem", md: "2.5rem" }, letterSpacing: "-1px" }}>
            Was Sie wissen{" "}
            <Box component="span" sx={{ color: "rgba(255,255,255,0.3)" }}>möchten.</Box>
          </Typography>
          {[
            {
              q: "Was kostet das?",
              a: "Gar nichts. Analyse, Digitalplan und Beratungsgespräch sind vollständig kostenlos und unverbindlich. Kein Verkaufsgespräch, keine versteckten Kosten.",
            },
            {
              q: "Wie lange dauert der Fördercheck?",
              a: "Ca. 5 Minuten. Sie geben Ihre Firmendaten ein, wir matchen automatisch passende Förderprogramme und erstellen Ihren persönlichen Digitalplan. Kein Account, keine Kreditkarte.",
            },
            {
              q: "Wie individuell ist der Plan wirklich?",
              a: "Sehr. Wir verkaufen nichts Neues – wir schauen, was Sie bereits nutzen, und bauen darauf auf. Die KI analysiert Ihre bestehenden Tools, Ihre Branche und Ziele. Der Zeitrahmen wird realistisch berechnet, mit Puffer für das echte Leben.",
            },
            {
              q: "Welche Förderprogramme gibt es?",
              a: "BAFA Digitalisierungsberatung, KfW Digitalisierungskredit, Digitalbonus Bayern, go-digital (BMWi) und viele weitere Landes- und Bundesprogramme. Welche für Sie in Frage kommen, ermitteln wir automatisch.",
            },
            {
              q: "Was passiert nach dem Beratungsgespräch?",
              a: "Sie erhalten Zugang zu Ihrem persönlichen Förder-Portal. Dort sehen Sie alle freigeschalteten Programme, die benötigten Unterlagen als Checkliste – und können jederzeit mit unserem Assistenten chatten.",
            },
            {
              q: "Sind meine Daten sicher?",
              a: "Ja. Alle Daten werden ausschließlich zur Erstellung Ihres Plans verwendet und nicht an Dritte weitergegeben. Server in Deutschland, DSGVO-konform.",
            },
          ].map((faq, i) => (
            <Accordion
              key={i}
              elevation={0}
              disableGutters
              sx={{
                bgcolor: "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                "&:before": { display: "none" },
                "&.Mui-expanded": { bgcolor: "rgba(74,222,128,0.03)" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#4ADE80" }} />}
                sx={{ px: 0, py: 1 }}
              >
                <Typography fontWeight={700} sx={{ color: "#fff", fontSize: { xs: 15, md: 16 } }}>
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.5 }}>
                <Typography sx={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontSize: 14 }}>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          textAlign: "center",
          bgcolor: "#111",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h3" fontWeight={900} sx={{ mb: 2, fontSize: { xs: "2rem", md: "3rem" }, letterSpacing: "-1px" }}>
            Bereit für Ihren
            <br />
            <Box component="span" sx={{ color: "#4ADE80" }}>Digitalplan?</Box>
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.45)", mb: 5, lineHeight: 1.7 }}>
            Kostenlos, unverbindlich, in 5 Minuten. Kein Account erforderlich.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/app/company")}
            sx={{
              bgcolor: "#4ADE80",
              color: "#0a0a0a",
              fontWeight: 800,
              fontSize: "1rem",
              px: 6,
              py: 2,
              borderRadius: 8,
              "&:hover": { bgcolor: "#22c55e" },
              boxShadow: "0 0 40px rgba(74,222,128,0.25)",
            }}
          >
            Jetzt kostenlos starten →
          </Button>
        </Container>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.06)", py: 3, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 .birdie · KI-Digitalisierungsberatung für den deutschen Mittelstand
        </Typography>
      </Box>
    </Box>
  );
}
