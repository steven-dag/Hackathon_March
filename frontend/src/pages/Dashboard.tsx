import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import EuroIcon from "@mui/icons-material/Euro";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

const benefits = [
  {
    icon: <AutoGraphIcon sx={{ fontSize: 44 }} />,
    title: "KI-Analyse in Minuten",
    description:
      "Unser KI-System analysiert Ihr Unternehmen und erstellt einen maßgeschneiderten Digitalisierungsplan – kostenlos und in unter 10 Minuten.",
  },
  {
    icon: <EuroIcon sx={{ fontSize: 44 }} />,
    title: "Bis zu 50 % Förderung",
    description:
      "Wir finden passende Förderprogramme von Bund und Ländern – Digital Jetzt, BAFA, KfW, go-digital und weitere – die Sie direkt beantragen können.",
  },
  {
    icon: <RocketLaunchIcon sx={{ fontSize: 44 }} />,
    title: "Klarer Fahrplan",
    description:
      "Sie erhalten einen konkreten 12-Monats-Plan mit Maßnahmen, Zeitrahmen und einer detaillierten Kostenaufstellung inklusive Förderabzug.",
  },
];

const steps = [
  "Unternehmensdaten & Digitalstatus eingeben",
  "Passende Förderprogramme entdecken",
  "KI-Digitalisierungsplan erhalten",
  "Kostenlose Beratung buchen",
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: "primary.main", letterSpacing: "-0.5px" }}
        >
          .birdie
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate("/app/company")}
          sx={{ borderRadius: 8 }}
        >
          Jetzt starten
        </Button>
      </Box>

      {/* Hero */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #00695C 100%)",
          color: "white",
          py: { xs: 8, md: 14 },
          px: 2,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Chip
            label="🐦 KI-gestützte Digitalisierung"
            sx={{
              mb: 3,
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              backdropFilter: "blur(4px)",
            }}
          />
          <Typography
            variant="h2"
            gutterBottom
            sx={{ fontWeight: 800, fontSize: { xs: "2.2rem", md: "3.2rem" }, letterSpacing: "-1px" }}
          >
            Ihr Weg in die
            <br />
            digitale Zukunft.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 5,
              fontWeight: 400,
              opacity: 0.9,
              maxWidth: 580,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            .birdie erstellt für Ihr Handwerks- oder KMU-Unternehmen einen
            KI-generierten Digitalisierungsplan – inklusive passender
            Fördermittel aus über 5 deutschen Förderdatenbanken.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/app/company")}
            sx={{
              bgcolor: "white",
              color: "primary.dark",
              fontWeight: 700,
              fontSize: "1.05rem",
              "&:hover": { bgcolor: "grey.100" },
              px: 6,
              py: 1.8,
              borderRadius: 8,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            Kostenlos starten
          </Button>
          <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: 0.7 }}>
            Kein Account nötig · Dauert nur 5 Minuten
          </Typography>
        </Container>
      </Box>

      {/* How it works */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography
          variant="overline"
          color="primary"
          sx={{ display: "block", textAlign: "center", mb: 1, fontWeight: 700 }}
        >
          So funktioniert es
        </Typography>
        <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 700, mb: 5 }}>
          In 4 Schritten zum Förderplan
        </Typography>
        <Grid container spacing={2}>
          {steps.map((step, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step}>
              <Box sx={{ textAlign: "center", px: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    mx: "auto",
                    mb: 1.5,
                  }}
                >
                  {i + 1}
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {step}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits */}
      <Box sx={{ bgcolor: "grey.50", py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="overline"
            color="primary"
            sx={{ display: "block", textAlign: "center", mb: 1, fontWeight: 700 }}
          >
            Warum .birdie?
          </Typography>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 700, mb: 5 }}>
            Ihr Vorteil auf einen Blick
          </Typography>
          <Grid container spacing={3}>
            {benefits.map((b) => (
              <Grid size={{ xs: 12, md: 4 }} key={b.title}>
                <Card
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
                    },
                    borderRadius: 3,
                  }}
                  elevation={2}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ color: "primary.main", mb: 2 }}>{b.icon}</Box>
                    <Typography variant="h6" gutterBottom fontWeight={700}>
                      {b.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                      {b.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #00695C 0%, #0D47A1 100%)",
          py: 8,
          textAlign: "center",
          color: "white",
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" gutterBottom fontWeight={800}>
            Bereit loszulegen?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.7 }}>
            Erhalten Sie noch heute Ihren persönlichen Digitalisierungsplan mit
            passenden Fördermitteln – völlig kostenlos.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/app/company")}
            sx={{
              bgcolor: "white",
              color: "primary.dark",
              fontWeight: 700,
              "&:hover": { bgcolor: "grey.100" },
              px: 6,
              py: 1.8,
              borderRadius: 8,
            }}
          >
            Jetzt kostenlos starten
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "grey.900", color: "grey.400", py: 3, textAlign: "center" }}>
        <Typography variant="caption">
          © 2026 .birdie · KI-Digitalisierungsberatung für den deutschen Mittelstand
        </Typography>
      </Box>
    </Box>
  );
}
