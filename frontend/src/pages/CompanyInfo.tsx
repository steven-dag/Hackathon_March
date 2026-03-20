import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EditIcon from "@mui/icons-material/Edit";
import StepperLayout from "../components/StepperLayout";

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-250 employees",
  "251-500 employees",
];

const industries = [
  "Technology / IT",
  "Manufacturing",
  "Healthcare",
  "Retail / E-Commerce",
  "Construction",
  "Energy",
  "Agriculture",
  "Education",
  "Other",
];

interface CompanyData {
  companyName: string;
  companySize: string;
  industry: string;
  street: string;
  postalCode: string;
  city: string;
  state: string;
  revenue: string;
  yearFounded: string;
  taxId: string;
}

const emptyData: CompanyData = {
  companyName: "",
  companySize: "",
  industry: "",
  street: "",
  postalCode: "",
  city: "",
  state: "",
  revenue: "",
  yearFounded: "",
  taxId: "",
};

type AiFilledFields = Partial<Record<keyof CompanyData, boolean>>;

type Mode = "choose" | "importing" | "imported" | "manual";

async function fetchCompanyFromUrl(
  url: string
): Promise<{ data: Partial<CompanyData>; aiFields: AiFilledFields }> {
  // TODO: Replace with real backend call:
  //   const res = await fetch("/api/company/import", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ url }),
  //   });
  //   return res.json();

  await new Promise((r) => setTimeout(r, 2000));

  let domain = "";
  try {
    domain = new URL(url).hostname.replace("www.", "");
  } catch {
    domain = url;
  }
  const name = domain.split(".")[0];
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    data: {
      companyName: capitalized,
      companySize: "51-250 employees",
      industry: "Technology / IT",
      street: "Musterstraße 1",
      postalCode: "53113",
      city: "Bonn",
      state: "Nordrhein-Westfalen",
      yearFounded: "1969",
    },
    aiFields: {
      companyName: true,
      companySize: true,
      industry: true,
      street: true,
      postalCode: true,
      city: true,
      state: true,
      yearFounded: true,
    },
  };
}

export default function CompanyInfo() {
  const [mode, setMode] = useState<Mode>("choose");
  const [url, setUrl] = useState("");
  const [form, setForm] = useState<CompanyData>(emptyData);
  const [aiFields, setAiFields] = useState<AiFilledFields>({});

  const updateField = (field: keyof CompanyData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImport = async () => {
    if (!url.trim()) return;
    setMode("importing");
    try {
      const result = await fetchCompanyFromUrl(url);
      setForm((prev) => ({ ...prev, ...result.data }));
      setAiFields(result.aiFields);
      setMode("imported");
    } catch {
      setMode("choose");
    }
  };

  const badge = (field: keyof CompanyData) =>
    aiFields[field] ? (
      <Chip
        icon={<AutoFixHighIcon />}
        label="Auto-filled"
        size="small"
        color="secondary"
        variant="outlined"
        sx={{
          mt: 0.5,
          height: 22,
          "& .MuiChip-label": { px: 0.5, fontSize: "0.7rem" },
        }}
      />
    ) : null;

  return (
    <StepperLayout>
      <Typography variant="h5" gutterBottom>
        Tell us about your company
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Paste a link and we'll fill in your details automatically — or enter
        them manually.
      </Typography>

      <Collapse in={mode === "choose" || mode === "importing"}>
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderColor: "primary.light",
            borderWidth: 2,
            bgcolor: "primary.50",
          }}
        >
          <CardContent sx={{ py: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AutoFixHighIcon color="primary" />
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Quick fill — paste a link
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Provide your company's LinkedIn page, website, or any public
              profile and our AI will extract the details for you.
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                placeholder="https://linkedin.com/company/… or https://yourcompany.de"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        {url.includes("linkedin") ? (
                          <LinkedInIcon color="primary" />
                        ) : (
                          <LanguageIcon color="action" />
                        )}
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={!url.trim() || mode === "importing"}
                sx={{ whiteSpace: "nowrap", minWidth: 120 }}
              >
                {mode === "importing" ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Import"
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setMode("manual")}
            >
              I'll fill it in manually instead
            </Button>
          </CardContent>
        </Card>
      </Collapse>

      <Collapse in={mode === "imported"}>
        <Card
          variant="outlined"
          sx={{ mb: 3, borderColor: "secondary.main", bgcolor: "#e0f2f1" }}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: "12px !important",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoFixHighIcon color="secondary" />
              <Typography variant="body2">
                We imported details from <strong>{url}</strong> — review and
                adjust below.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      <Collapse in={mode === "imported" || mode === "manual"}>
        <Box component="form" noValidate>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Company Name"
                required
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
              />
              {badge("companyName")}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Company Size"
                select
                required
                value={form.companySize}
                onChange={(e) => updateField("companySize", e.target.value)}
              >
                {companySizes.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
              {badge("companySize")}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Industry"
                select
                required
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
              >
                {industries.map((i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </TextField>
              {badge("industry")}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Street Address"
                value={form.street}
                onChange={(e) => updateField("street", e.target.value)}
              />
              {badge("street")}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Postal Code"
                value={form.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
              />
              {badge("postalCode")}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
              {badge("city")}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="State (Bundesland)"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
              {badge("state")}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Annual Revenue (EUR)"
                type="number"
                value={form.revenue}
                onChange={(e) => updateField("revenue", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Year Founded"
                type="number"
                value={form.yearFounded}
                onChange={(e) => updateField("yearFounded", e.target.value)}
              />
              {badge("yearFounded")}
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Tax ID (Steuernummer)"
                value={form.taxId}
                onChange={(e) => updateField("taxId", e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </StepperLayout>
  );
}
