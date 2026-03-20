import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Container,
  Paper,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const steps = [
  { label: "Company Info", path: "/app/company" },
  { label: "Funding Selection", path: "/app/funding" },
  { label: "Project Details", path: "/app/project" },
  { label: "Documents & Review", path: "/app/review" },
  { label: "Submit", path: "/app/submit" },
];

interface StepperLayoutProps {
  children: React.ReactNode;
}

export default function StepperLayout({ children }: StepperLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const currentIndex = steps.findIndex((s) => s.path === location.pathname);

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate("/");
    } else {
      navigate(steps[currentIndex - 1].path);
    }
  };

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      navigate(steps[currentIndex + 1].path);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
          <Stepper
            activeStep={currentIndex}
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
            >
              {currentIndex === 0 ? "Dashboard" : "Back"}
            </Button>
            {currentIndex < steps.length - 1 && (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
