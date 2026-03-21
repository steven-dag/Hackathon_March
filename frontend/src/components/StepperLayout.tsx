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

const steps = [
  { label: "Firmendaten", path: "/app/company" },
  { label: "Förderungen", path: "/app/funding" },
  { label: "Ihr KI-Plan", path: "/app/review" },
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
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: "primary.main", letterSpacing: "-0.5px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          .birdie
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3, borderRadius: 3 }} elevation={2}>
          <Stepper
            activeStep={activeIndex}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{ mb: 4 }}
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
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={nextLoading}
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
