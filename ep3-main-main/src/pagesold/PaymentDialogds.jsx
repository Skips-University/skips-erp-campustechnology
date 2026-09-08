// components/dsPaymentDialog.jsx

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  border: "1px solid #e9ecef",
  marginBottom: theme.spacing(2),
  background: "#f8f9fa",
}));

function PaymentDialogds({ open, ledger, onClose, onPaid, loading }) {
  const [paymode, setPaymode] = useState("online");
  const [paydetails, setPaydetails] = useState("");

  const handleSubmit = () => {
    if (!paymode || !paydetails.trim()) {
      alert("Please fill all payment details");
      return;
    }
    onPaid(paymode, paydetails);
  };

  if (!ledger) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Math.abs(amount));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
        Record Payment
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <StyledCard>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Payment Details
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Student:</strong> {ledger.student}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Reg. No:</strong> {ledger.regno}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fee Item:</strong> {ledger.feeitem}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Amount:</strong>{" "}
                <span style={{ color: "#e74c3c", fontWeight: 700 }}>
                  {formatCurrency(ledger.amount)}
                </span>
              </Typography>
              <Typography variant="body2">
                <strong>Due Date:</strong>{" "}
                {ledger.duedate
                  ? new Date(ledger.duedate).toLocaleDateString("en-IN")
                  : "-"}
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>

        <Alert severity="info" sx={{ mb: 2 }}>
          Enter payment details to mark this entry as paid
        </Alert>

        <TextField
          fullWidth
          select
          label="Payment Mode"
          value={paymode}
          onChange={(e) => setPaymode(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
        >
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="cheque">Cheque</MenuItem>
          <MenuItem value="online">Online Transfer</MenuItem>
          <MenuItem value="credit_card">Credit Card</MenuItem>
          <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Payment Details"
          placeholder="e.g., Transaction ID, Cheque Number, etc."
          value={paydetails}
          onChange={(e) => setPaydetails(e.target.value)}
          multiline
          rows={3}
          size="small"
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
            fontWeight: 600,
          }}
        >
          {loading ? "Processing..." : "Confirm Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentDialogds;
