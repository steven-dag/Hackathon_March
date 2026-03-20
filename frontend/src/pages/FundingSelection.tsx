import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import StepperLayout from "../components/StepperLayout";

const mockFunding = [
  {
    id: 1,
    name: "Digital Jetzt",
    provider: "BMWi",
    maxAmount: "50,000 EUR",
    coverage: "up to 50%",
    description:
      "Supports SMEs in investing in digital technologies and employee qualification.",
    tags: ["Digitalization", "IT", "Training"],
    aiRecommended: true,
  },
  {
    id: 2,
    name: "go-digital",
    provider: "BMWi",
    maxAmount: "16,500 EUR",
    coverage: "50%",
    description:
      "Consulting subsidies for digitalization of business processes, IT security, and online marketing.",
    tags: ["Consulting", "IT Security", "Marketing"],
    aiRecommended: true,
  },
  {
    id: 3,
    name: "ERP-Gründerkredit",
    provider: "KfW",
    maxAmount: "125,000 EUR",
    coverage: "Low-interest loan",
    description:
      "Favorable loans for startups and young companies up to 5 years old.",
    tags: ["Startup", "Loan", "Investment"],
    aiRecommended: false,
  },
  {
    id: 4,
    name: "ZIM – Zentrales Innovationsprogramm Mittelstand",
    provider: "BMWi",
    maxAmount: "380,000 EUR",
    coverage: "up to 45%",
    description:
      "Funding for research and development projects of innovative SMEs.",
    tags: ["R&D", "Innovation", "Technology"],
    aiRecommended: false,
  },
];

export default function FundingSelection() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = mockFunding.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      f.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StepperLayout>
      <Typography variant="h5" gutterBottom>
        Select a Funding Program
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Based on your company profile, we've highlighted the best matches. You
        can also search for specific programs.
      </Typography>

      <TextField
        placeholder="Search funding programs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map((f) => {
          const isSelected = selectedId === f.id;
          return (
            <Card
              key={f.id}
              onClick={() => setSelectedId(isSelected ? null : f.id)}
              sx={{
                cursor: "pointer",
                border: "2px solid",
                borderColor: isSelected ? "primary.main" : "transparent",
                bgcolor: isSelected ? "primary.50" : "background.paper",
                "&:hover": {
                  borderColor: isSelected ? "primary.main" : "primary.light",
                  bgcolor: isSelected ? "primary.50" : "grey.50",
                },
                transition: "all 0.2s",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {isSelected ? (
                      <CheckCircleIcon color="primary" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" />
                    )}
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
                        {f.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {f.provider} · Max {f.maxAmount} · Coverage: {f.coverage}
                      </Typography>
                    </Box>
                  </Box>
                  {f.aiRecommended && (
                    <Chip
                      icon={<AutoFixHighIcon />}
                      label="AI Recommended"
                      color="secondary"
                      size="small"
                    />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5, ml: 4.5 }}
                >
                  {f.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", ml: 4.5 }}>
                  {f.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No funding programs match your search.
          </Typography>
        )}
      </Box>
    </StepperLayout>
  );
}
