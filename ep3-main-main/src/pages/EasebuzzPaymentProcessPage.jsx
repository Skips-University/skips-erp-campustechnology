import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ArrowBack, Payment } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = {
  student: "",
  regno: "",
  feeitem: "",
  amount: "",
  type: "Student",
  email: "",
  phone: "",
  description: ""
};

const normalizedGateway = (value) => String(value || "").replace(/\s|-/g, "").toLowerCase();

const EasebuzzPaymentProcessPage = () => {
  const navigate = useNavigate();
  const colid = useMemo(() => global1.colid, []);
  const currentUser = useMemo(() => global1.user, []);
  const currentName = useMemo(() => global1.name || global1.user || "NA", []);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedGateway = useMemo(
    () => gateways.find((gateway) => gateway._id === selectedGatewayId),
    [gateways, selectedGatewayId]
  );

  useEffect(() => {
    const loadGateways = async () => {
      try {
        const res = await ep1.get("/api/v2/mastergateway", { params: { colid, status: "Active" } });
        const activeGateways = res.data.data || [];
        setGateways(activeGateways);
        const defaultGateway = activeGateways.find((gateway) => gateway.default === "Yes") || activeGateways[0];
        if (defaultGateway) setSelectedGatewayId(defaultGateway._id);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to load payment gateways");
      }
    };
    if (colid) loadGateways();
  }, [colid]);

  const payNow = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const gatewayName = normalizedGateway(selectedGateway?.gatewayname);
      const endpoint = gatewayName.includes("icici") ? "/api/v2/icicipayment/initiate" : "/api/v2/easebuzzpayment/initiate";
      if (selectedGateway?.type === "External" && !gatewayName.includes("easebuzz") && !gatewayName.includes("icici")) {
        if (!selectedGateway.externallink) {
          setError("Selected gateway is not configured with an external payment link.");
          return;
        }
        const params = new URLSearchParams({
          ...form,
          colid: String(colid),
          user: currentUser,
          name: currentName,
          gateway: selectedGateway.gatewayname || "",
          returnurl: selectedGateway.callbackurl || window.location.href
        });
        const joiner = selectedGateway.externallink.includes("?") ? "&" : "?";
        window.location.assign(`${selectedGateway.externallink}${joiner}${params.toString()}`);
        return;
      }
      const res = await ep1.post(endpoint, {
        ...form,
        colid,
        user: currentUser,
        name: currentName,
        gateway: selectedGateway?.gatewayname || "",
        frontendcallbackurl: window.location.href
      });
      const paymentUrl = res.data?.data?.paymenturl || res.data?.paymenturl;
      setMessage(`Payment initiated. Reference no: ${res.data.data?.refno || ""}`);
      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }
      setError("Payment was initiated but payment URL was not returned.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Payment processing</Typography>
          <Typography variant="body2" color="text.secondary">Select a gateway and proceed to payment.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back to dashboard</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Payment gateway</InputLabel>
            <Select label="Payment gateway" value={selectedGatewayId} onChange={(e) => setSelectedGatewayId(e.target.value)}>
              {gateways.map((gateway) => (
                <MenuItem key={gateway._id} value={gateway._id}>{gateway.gatewayname} ({gateway.type})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField size="small" label="Student" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required />
          <TextField size="small" label="Reg no" value={form.regno} onChange={(e) => setForm({ ...form, regno: e.target.value })} required />
          <TextField size="small" label="Fee item" value={form.feeitem} onChange={(e) => setForm({ ...form, feeitem: e.target.value })} required />
          <TextField size="small" label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField size="small" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField size="small" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<Payment />}
            disabled={loading || !selectedGatewayId || !form.student || !form.regno || !form.feeitem || !form.amount}
            onClick={payNow}
          >
            Pay
          </Button>
          <Button variant="outlined" onClick={() => setForm(emptyForm)}>Clear</Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default EasebuzzPaymentProcessPage;
