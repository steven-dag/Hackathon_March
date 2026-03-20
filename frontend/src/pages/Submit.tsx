import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useNavigate } from "react-router-dom";
import StepperLayout from "../components/StepperLayout";

const costBreakdown = [
  { label: "Application preparation & AI form-filling", price: 299 },
  { label: "Document review & compliance check", price: 149 },
  { label: "Submission handling & follow-up", price: 99 },
];

const totalPrice = costBreakdown.reduce((sum, item) => sum + item.price, 0);

type Status = "pricing" | "declined" | "booking" | "submitting" | "success";

export default function Submit() {
  const [status, setStatus] = useState<Status>("pricing");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const navigate = useNavigate();

  const handleConfirmBooking = () => {
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 2000);
  };

  if (status === "declined") {
    return (
      <StepperLayout>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h5" gutterBottom>
            No problem!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your application data has been saved. You can come back anytime to
            continue or explore other funding options.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </Box>
      </StepperLayout>
    );
  }

  if (status === "success") {
    return (
      <StepperLayout>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 80, color: "secondary.main", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your in-person consultation has been booked. We'll handle the rest
            of your funding application from here.
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 500, mx: "auto", mb: 2 }}>
            Reference number: <strong>FP-2026-00042</strong>
          </Alert>
          {bookingDate && bookingTime && (
            <Alert severity="success" sx={{ maxWidth: 500, mx: "auto", mb: 4 }}>
              Appointment: <strong>{bookingDate}</strong> at{" "}
              <strong>{bookingTime}</strong>
            </Alert>
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </Box>
      </StepperLayout>
    );
  }

  return (
    <StepperLayout>
      <Typography variant="h5" gutterBottom>
        Pricing & Booking
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review our service costs below. If you'd like to proceed, book an
        in-person consultation to finalize everything.
      </Typography>

      {/* Cost Breakdown */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <ReceiptLongIcon color="primary" />
        <Typography variant="h6">Cost Breakdown</Typography>
      </Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <List disablePadding>
            {costBreakdown.map((item, i) => (
              <Box key={item.label}>
                <ListItem disableGutters>
                  <ListItemText primary={item.label} />
                  <Typography variant="body1" fontWeight={600}>
                    {item.price.toFixed(2)} EUR
                  </Typography>
                </ListItem>
                {i < costBreakdown.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
          <Divider sx={{ my: 1.5 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Total</Typography>
            <Chip
              label={`${totalPrice.toFixed(2)} EUR`}
              color="primary"
              sx={{ fontSize: "1rem", fontWeight: 700, py: 2.5, px: 1 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            One-time fixed price. No hidden fees. Payment due after consultation.
          </Typography>
        </CardContent>
      </Card>

      {/* Booking or Proceed/Decline */}
      {status === "pricing" && (
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => setStatus("declined")}
          >
            Not right now
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<EventIcon />}
            onClick={() => setStatus("booking")}
          >
            Proceed & Book Consultation
          </Button>
        </Box>
      )}

      {(status === "booking" || status === "submitting") && (
        <Card variant="outlined" sx={{ borderColor: "primary.light" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <EventIcon color="primary" />
              <Typography variant="h6">Book Your In-Person Consultation</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a date and time that works for you. Our funding expert will
              walk you through the final steps and submit the application on your
              behalf.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                label="Preferred Date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Preferred Time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleConfirmBooking}
              disabled={!bookingDate || !bookingTime || status === "submitting"}
              endIcon={
                status === "submitting" ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {status === "submitting"
                ? "Confirming..."
                : "Confirm Booking & Submit Application"}
            </Button>
          </CardContent>
        </Card>
      )}
    </StepperLayout>
  );
}
