import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { AccountBalanceWallet, ArrowBack, Payment, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate, useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const normalizedGateway = (value) => String(value || "").replace(/\s|-/g, "").toLowerCase();
const selectionToArray = (selection) => Array.from(selection?.ids || selection || []);
const validEmail = (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim()) ? String(value || "").trim() : "");
const validPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? digits : "";
};

const columns = [
  { field: "academicyear", headerName: "Year", minWidth: 110 },
  { field: "feegroup", headerName: "Fee Group", minWidth: 180, flex: 1 },
  { field: "feeitem", headerName: "Fee Item", minWidth: 240, flex: 1 },
  { field: "feecategory", headerName: "Category", minWidth: 130 },
  { field: "feetype", headerName: "Fee Type", minWidth: 130 },
  { field: "semester", headerName: "Semester", minWidth: 110 },
  { field: "amount", headerName: "Amount", minWidth: 130, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "paid", headerName: "Paid", minWidth: 120, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "concession", headerName: "Concession", minWidth: 130, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "balance", headerName: "Balance Payable", minWidth: 160, type: "number", valueFormatter: (params) => currency(params.value) }
];

export default function StudentOnlineFeePaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fees, setFees] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("success");
  const [error, setError] = useState("");

  const colid = useMemo(() => global1.colid, []);
  const regno = useMemo(() => global1.regno || global1.user || "", []);
  const selectedGateway = useMemo(
    () => gateways.find((gateway) => gateway._id === selectedGatewayId),
    [gateways, selectedGatewayId]
  );
  const selectedFees = useMemo(
    () => fees.filter((row) => selectedRows.includes(row._id)),
    [fees, selectedRows]
  );
  const totalPayable = useMemo(
    () => selectedFees.reduce((sum, row) => sum + Number(row.balance || 0), 0),
    [selectedFees]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [feeRes, gatewayRes] = await Promise.all([
        ep1.get("/api/v2/studentonlinepayment/pending", { params: { colid, regno } }),
        ep1.get("/api/v2/mastergateway", { params: { colid, status: "Active" } })
      ]);
      setFees(feeRes.data.data || []);
      const activeGateways = (gatewayRes.data.data || []).filter((gateway) => String(gateway.status || "").toLowerCase() === "active");
      setGateways(activeGateways);
      const preferred = activeGateways.find((gateway) => gateway.default === "Yes") || activeGateways[0];
      setSelectedGatewayId((current) => {
        if (current && activeGateways.some((gateway) => gateway._id === current)) return current;
        return preferred?._id || "";
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load pending fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("status")) {
      const status = searchParams.get("status");
      const success = String(status || "").toUpperCase() === "SUCCESS";
      setMessageSeverity(success ? "success" : "error");
      setMessage(success ? "Payment completed successfully. Ledger balance will refresh below." : `Payment failed or was not completed. Status: ${status}`);
    }
    if (colid && regno) loadData();
  }, [colid, regno]);

  const startPayment = async () => {
    if (selectedRows.length === 0) {
      setError("Please select at least one fee item.");
      return;
    }
    if (!selectedGateway) {
      setError("Please select a payment gateway.");
      return;
    }
    setPaying(true);
    setError("");
    setMessage("");
    setMessageSeverity("success");
    try {
      const sessionRes = await ep1.post("/api/v2/studentonlinepayment/session", {
        colid,
        regno,
        ledgerids: selectedRows,
        gatewayid: selectedGatewayId,
        student: global1.name || "",
        name: global1.name || "",
        user: global1.user || "",
        email: validEmail(global1.email) || validEmail(global1.user),
        phone: validPhone(global1.phone),
        program: global1.program || "",
        programcode: global1.programcode || "",
        regulation: global1.regulation || "",
        academicyear: global1.academicyear || "",
        semester: global1.semester || "",
        section: global1.section || ""
      });
      const session = sessionRes.data.data;
      const gatewayName = normalizedGateway(selectedGateway.gatewayname);
      if (selectedGateway.type === "External" && !gatewayName.includes("easebuzz") && !gatewayName.includes("icici")) {
        if (!selectedGateway.externallink) throw new Error("Selected external gateway does not have a payment link configured.");
        const params = new URLSearchParams({
          colid: String(colid),
          regno,
          student: session.payment.student || "",
          amount: String(session.payment.totalamount || totalPayable),
          onlinepaymentid: session.payment._id,
          returnurl: window.location.href
        });
        const joiner = selectedGateway.externallink.includes("?") ? "&" : "?";
        window.location.assign(`${selectedGateway.externallink}${joiner}${params.toString()}`);
        return;
      }

      let endpoint = "";
      if (gatewayName.includes("icici")) endpoint = "/api/v2/icicipayment/initiate";
      if (gatewayName.includes("easebuzz")) endpoint = "/api/v2/easebuzzpayment/initiate";
      if (!endpoint) throw new Error("Selected internal gateway must be configured as ICICI or Easebuzz in master gateway.");
      const payRes = await ep1.post(endpoint, {
        ...session.gatewayPayload,
        name: global1.name || session.payment.student || regno,
        user: global1.user || "",
        gateway: selectedGateway.gatewayname,
        frontendcallbackurl: `${window.location.origin}/studentonlinefeepayment`
      });
      const paymentUrl = payRes.data?.data?.paymenturl || payRes.data?.paymenturl || payRes.data?.data?.paymentUrl || payRes.data?.paymentUrl;
      if (!paymentUrl) throw new Error("Gateway did not return a payment URL.");
      window.location.assign(paymentUrl);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to initiate online payment");
    } finally {
      setPaying(false);
    }
  };

  return (
    <MenuPageShell title="Fees payment" menuType="student">
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Online Fees Payment</Typography>
            <Typography variant="body2" color="text.secondary">Select pending fee items and continue through the configured payment gateway.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadData} disabled={loading || paying}>Refresh</Button>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/studentdashboard")}>Dashboard</Button>
          </Stack>
        </Stack>

        {message && <Alert severity={messageSeverity} sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!loading && gateways.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No active payment gateway is configured in master gateway. Please add ICICI or Easebuzz in master gateway first.
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <AccountBalanceWallet color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>Selected Amount</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={800}>Rs. {currency(totalPayable)}</Typography>
                <Chip size="small" label={`${selectedRows.length} fee item(s) selected`} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={7}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Gateway</InputLabel>
                    <Select label="Payment Gateway" value={selectedGatewayId} onChange={(event) => setSelectedGatewayId(event.target.value)}>
                      {gateways.map((gateway) => (
                        <MenuItem key={gateway._id} value={gateway._id}>
                          {gateway.gatewayname} {gateway.default === "Yes" ? "(Default)" : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Button fullWidth variant="contained" startIcon={<Payment />} onClick={startPayment} disabled={paying || totalPayable <= 0 || !selectedGatewayId}>
                    {paying ? "Starting payment..." : "Pay selected fees"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ height: 560, borderRadius: 2, overflow: "hidden" }}>
          <DataGrid
            rows={fees}
            columns={columns}
            getRowId={(row) => row._id}
            checkboxSelection
            disableRowSelectionOnClick
            loading={loading}
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={(model) => setSelectedRows(selectionToArray(model))}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            slots={{ toolbar: GridToolbar }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
