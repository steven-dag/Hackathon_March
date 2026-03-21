import { useEffect, useState } from "react";
import { Box, Typography, Chip, Button } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import StepperLayout from "../components/StepperLayout";
import { useSession } from "../context/SessionContext";
import { useNavigate } from "react-router-dom";

const CALENDLY_URL = "https://calendly.com/vogels671/30min";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: Element | null }) => void;
    };
  }
}

export default function Submit() {
  const { companyName } = useSession();
  const navigate = useNavigate();
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    // Load Calendly widget script
    if (!document.querySelector('script[src*="calendly.com"]')) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }

    // Load Calendly stylesheet
    if (!document.querySelector('link[href*="calendly.com"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }

    // Listen for Calendly booking completion event
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_scheduled") {
        setBooked(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ── Success screen after booking ──────────────────────────────────────────
  if (booked) {
    return (
      <StepperLayout hideNext>
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: "#4ADE80" }} />
          <Typography variant="h5" fontWeight={800}>
            Termin bestätigt!
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth={440}>
            {companyName
              ? `Wir freuen uns auf das Gespräch mit ${companyName}. Sie erhalten in Kürze eine Bestätigung per E-Mail mit dem Google Meet Link.`
              : "Wir freuen uns auf das Gespräch. Sie erhalten in Kürze eine Bestätigung per E-Mail mit dem Google Meet Link."}
          </Typography>
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{
                bgcolor: "#0a0a0a",
                fontWeight: 700,
                px: 3,
                py: 1.2,
                "&:hover": { bgcolor: "#222" },
              }}
            >
              Zurück zur Startseite
            </Button>
          </Box>
        </Box>
      </StepperLayout>
    );
  }

  // ── Booking screen ─────────────────────────────────────────────────────────
  return (
    <StepperLayout hideNext>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <EventIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Kostenlose Beratung buchen
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {companyName
          ? `Wählen Sie direkt Ihren Wunschtermin – wir besprechen den Digitalplan für ${companyName} und klären alle Fragen zur Förderung.`
          : "Wählen Sie direkt Ihren Wunschtermin – wir besprechen Ihren Digitalplan und klären alle Fragen zur Förderung."}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Chip label="Kostenlos & unverbindlich" size="small" color="success" variant="outlined" />
        <Chip label="30 Min. Online-Termin" size="small" color="primary" variant="outlined" />
        <Chip label="Bestätigung per E-Mail" size="small" color="primary" variant="outlined" />
      </Box>

      {/* Calendly Inline Widget */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          height: 820,
        }}
      >
        <div
          className="calendly-inline-widget"
          data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=0a0a0a`}
          style={{ minWidth: "320px", width: "100%", height: "100%" }}
        />
      </Box>

      {/* Always-visible home button */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          variant="text"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ color: "text.secondary", fontWeight: 600 }}
        >
          Zurück zur Startseite
        </Button>
      </Box>
    </StepperLayout>
  );
}
