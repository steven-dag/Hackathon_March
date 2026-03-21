import { useEffect } from "react";
import { Box, Typography, Chip } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import StepperLayout from "../components/StepperLayout";
import { useSession } from "../context/SessionContext";

// ─── CALENDLY CONFIG ───────────────────────────────────────────────────────────
// Replace with your own Calendly scheduling URL
const CALENDLY_URL = "https://calendly.com/vogels671/30min";
// ──────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: Element | null }) => void;
    };
  }
}

export default function Submit() {
  const { companyName } = useSession();

  useEffect(() => {
    // Load Calendly widget script if not already present
    const existing = document.querySelector('script[src*="calendly.com"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }

    // Load Calendly stylesheet if not already present
    const existingLink = document.querySelector('link[href*="calendly.com"]');
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <StepperLayout hideNext>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <EventIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Kostenlose Beratung buchen
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {companyName
          ? `Wählen Sie direkt Ihren Wunschtermin – wir besprechen den Digitalplan für ${companyName} mit Ihnen und klären alle Fragen zur Förderung.`
          : "Wählen Sie direkt Ihren Wunschtermin – wir besprechen Ihren Digitalplan und klären alle Fragen zur Förderung."}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
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
          data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=1565C0`}
          style={{ minWidth: "320px", width: "100%", height: "100%" }}
        />
      </Box>
    </StepperLayout>
  );
}
