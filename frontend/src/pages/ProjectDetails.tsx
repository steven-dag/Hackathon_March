import { Box, Grid, TextField, Typography, Chip } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import StepperLayout from "../components/StepperLayout";

function AiFilledLabel({ label }: { label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {label}
      <Chip
        icon={<AutoFixHighIcon />}
        label="AI suggestion"
        size="small"
        color="secondary"
        variant="outlined"
        sx={{ height: 20, "& .MuiChip-label": { px: 0.5, fontSize: "0.7rem" } }}
      />
    </Box>
  );
}

export default function ProjectDetails() {
  return (
    <StepperLayout>
      <Typography variant="h5" gutterBottom>
        Project Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Describe your project. Fields marked with an AI badge have been
        pre-filled — review and adjust as needed.
      </Typography>

      <Box component="form" noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField label="Project Title" required />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={<AiFilledLabel label="Project Summary" />}
              multiline
              rows={4}
              placeholder="Briefly describe what your project aims to achieve..."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Project Budget (EUR)"
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Requested Funding Amount (EUR)"
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={<AiFilledLabel label="Expected Outcomes" />}
              multiline
              rows={3}
              placeholder="What measurable results do you expect from this project?"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={<AiFilledLabel label="Innovation Description" />}
              multiline
              rows={3}
              placeholder="What is innovative about your project?"
            />
          </Grid>
        </Grid>
      </Box>
    </StepperLayout>
  );
}
