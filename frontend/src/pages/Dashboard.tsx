import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TimerIcon from "@mui/icons-material/Timer";
import SavingsIcon from "@mui/icons-material/Savings";

const benefits = [
  {
    icon: <AutoFixHighIcon sx={{ fontSize: 40 }} />,
    title: "AI-Powered Auto-Fill",
    description:
      "Our intelligent assistant fills out complex funding forms for you — just provide your company details and we handle the rest.",
  },
  {
    icon: <TimerIcon sx={{ fontSize: 40 }} />,
    title: "Save Hours of Work",
    description:
      "What normally takes days of paperwork can be done in minutes. Focus on your business, not bureaucracy.",
  },
  {
    icon: <SavingsIcon sx={{ fontSize: 40 }} />,
    title: "Maximize Your Funding",
    description:
      "Access thousands of funding programs across Germany. Many businesses miss out on subsidies simply because they don't know they exist.",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Hero */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #00897B 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          px: 2,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <RocketLaunchIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" gutterBottom>
            Funding Made Simple
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, fontWeight: 400, opacity: 0.9, maxWidth: 600, mx: "auto" }}
          >
            Stop leaving money on the table. German government funding programs
            can cover up to 50% of your costs — let our AI assistant handle the
            paperwork.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/app/company")}
            sx={{
              bgcolor: "white",
              color: "primary.dark",
              "&:hover": { bgcolor: "grey.100" },
              px: 5,
              py: 1.5,
              fontSize: "1.1rem",
            }}
          >
            Start New Application
          </Button>
        </Container>
      </Box>

      {/* Benefits */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h5" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Why use FundingPilot?
        </Typography>
        <Grid container spacing={3}>
          {benefits.map((b) => (
            <Grid size={{ xs: 12, md: 4 }} key={b.title}>
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ color: "primary.main", mb: 2 }}>{b.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {b.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Box sx={{ bgcolor: "grey.100", py: 6, textAlign: "center" }}>
        <Container maxWidth="sm">
          <Typography variant="h5" gutterBottom>
            Ready to get started?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            It takes less than 10 minutes to complete your application. Our AI
            does the heavy lifting.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/app/company")}
          >
            Start New Application
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
