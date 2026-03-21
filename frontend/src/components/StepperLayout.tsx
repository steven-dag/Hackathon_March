import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Container,
  Paper,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BirdLogo from "./BirdLogo";

const steps = [
  { label: "Firmendaten", path: "/app/company" },
  { label: "Förderungen", path: "/app/funding" },
  { label: "Digitalplan", path: "/app/review" },
  { label: "Beratung", path: "/app/submit" },
];

interface StepperLayoutProps {
  children: React.ReactNode;
  onNext?: () => Promise<void> | void;
  nextLoading?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  hideNext?: boolean;
}

export default function StepperLayout({
  children,
  onNext,
  nextLoading,
  nextDisabled,
  nextLabel,
  hideNext,
}: StepperLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const currentIndex = steps.findIndex((s) => s.path === location.pathname);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  const handleBack = () => {
    if (activeIndex === 0) {
      navigate("/");
    } else {
      navigate(steps[activeIndex - 1].path);
    }
  };

  const handleNext = async () => {
    if (onNext) {
      await onNext();
    } else if (activeIndex < steps.length - 1) {
      navigate(steps[activeIndex + 1].path);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#0a0a0a",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          px: { xs: 3, md: 6 },
          py: 1.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <BirdLogo light />
        </Box>
        {/* Step indicator */}
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
          Schritt {activeIndex + 1} von {steps.length}
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 5 },
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
          elevation={0}
        >
          <Stepper
            activeStep={activeIndex}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{
              mb: 4,
              "& .MuiStepLabel-label": { fontWeight: 600, fontSize: "0.8rem" },
              "& .MuiStepIcon-root.Mui-active": { color: "#0a0a0a" },
              "& .MuiStepIcon-root.Mui-completed": { color: "#4ADE80" },
            }}
          >
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 300 }}>{children}</Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
              pt: 3,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={nextLoading}
              sx={{ borderColor: "rgba(0,0,0,0.15)", color: "text.secondary", fontWeight: 600 }}
            >
              {activeIndex === 0 ? "Startseite" : "Zurück"}
            </Button>
            {!hideNext && activeIndex < steps.length - 1 && (
              <Button
                variant="contained"
                endIcon={
                  nextLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArrowForwardIcon />
                  )
                }
                onClick={handleNext}
                disabled={nextDisabled || nextLoading}
                sx={{
                  bgcolor: "#0a0a0a",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#222" },
                  "&:disabled": { bgcolor: "rgba(0,0,0,0.12)" },
                }}
              >
                {nextLoading ? "Wird gespeichert..." : (nextLabel ?? "Weiter")}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
