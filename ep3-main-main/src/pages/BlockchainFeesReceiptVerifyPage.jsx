import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedIcon from "@mui/icons-material/Verified";
import ep1 from "../api/ep1";

const money = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? "0" : parsed.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

export default function BlockchainFeesReceiptVerifyPage() {
  const [regno, setRegno] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [error, setError] = useState("");

  const verify = async (regnoValue = regno) => {
    if (!String(regnoValue || "").trim()) {
      setError("Reg no is required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setSelectedRecordId("");
      const res = await ep1.get("/api/v2/public/studentfeesreceipt/blockchain-verify", {
        params: { regno: regnoValue }
      });
      setResult(res.data || null);
      setSelectedRecordId(res.data?.data?.[0]?.recordid || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify fees receipt from blockchain.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryRegno = params.get("regno") || "";
    if (queryRegno) {
      setRegno(queryRegno);
      verify(queryRegno);
    }
  }, []);

  const records = result?.data || [];
  const active = records.find((item) => item.recordid === selectedRecordId) || records[0] || null;
  const receipt = active?.payload || {};
  const items = receipt.items || [];

  const receiptRows = useMemo(() => records.map((item) => ({
    id: item.recordid,
    receiptNo: item.payload?.receiptNo || "",
    student: item.payload?.student?.name || "",
    regno: item.payload?.student?.regno || "",
    paid: item.payload?.totals?.paid || 0,
    itemCount: item.payload?.items?.length || 0,
    timestamp: item.timestamp ? String(item.timestamp).slice(0, 19).replace("T", " ") : "",
    hash: item.hash,
    valid: item.valid ? "Verified" : "Invalid"
  })), [records]);

  const receiptColumns = [
    { field: "receiptNo", headerName: "Receipt No", width: 190 },
    { field: "student", headerName: "Student", minWidth: 220, flex: 1 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "paid", headerName: "Paid", width: 120, type: "number" },
    { field: "itemCount", headerName: "Items", width: 100, type: "number" },
    { field: "timestamp", headerName: "Stored On", width: 180 },
    { field: "valid", headerName: "Status", width: 120 },
    { field: "hash", headerName: "Hash", minWidth: 260, flex: 1 }
  ];

  const itemColumns = [
    { field: "feegroup", headerName: "Fee Group", width: 170 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "paid", headerName: "Paid", width: 120, type: "number" },
    { field: "paymode", headerName: "Pay Mode", width: 130 },
    { field: "paydetails", headerName: "Pay Details", width: 180 },
    {
      field: "paiddate",
      headerName: "Paid Date",
      width: 130,
      valueGetter: (params) => params.row.paiddate ? String(params.row.paiddate).slice(0, 10) : ""
    }
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7fb", py: { xs: 2, md: 5 } }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <VerifiedIcon color="success" sx={{ fontSize: 44 }} />
            <Typography variant="h4" fontWeight={900}>Blockchain Fees Receipt Verification</Typography>
            <Typography color="text.secondary">Enter student registration number to verify stored fees receipts from blockchain.</Typography>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField fullWidth label="Reg No" value={regno} onChange={(event) => setRegno(event.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" startIcon={<SearchIcon />} onClick={() => verify()} disabled={loading} sx={{ height: 56 }}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </Grid>
          </Grid>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {result && (
          <Stack spacing={2}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>{result.verified ? "Verified fees receipt found" : "No verified receipt found"}</Typography>
                  <Typography color="text.secondary">{records.length} blockchain receipt record(s) matched this reg no.</Typography>
                </Box>
                <Chip color={result.verified ? "success" : "error"} label={result.verified ? "Blockchain Verified" : "Not Verified"} />
              </Stack>
              <Box sx={{ height: 340, width: "100%" }}>
                <DataGrid
                  rows={receiptRows}
                  columns={receiptColumns}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "blockchain_fees_receipts" } } }}
                  pageSizeOptions={[5, 10, 25]}
                  onRowClick={(params) => setSelectedRecordId(params.row.id)}
                  disableRowSelectionOnClick
                />
              </Box>
            </Paper>

            {active && (
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {[
                    ["Receipt No", receipt.receiptNo],
                    ["Student", receipt.student?.name],
                    ["Reg No", receipt.student?.regno],
                    ["Program", receipt.student?.programcode],
                    ["Academic Year", receipt.student?.academicyear],
                    ["Total Paid", money(receipt.totals?.paid)],
                    ["Block Index", active.blockindex],
                    ["Hash", active.hash]
                  ].map(([label, value]) => (
                    <Grid item xs={12} md={label === "Hash" ? 12 : 3} key={label}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{value || "-"}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {active.errors?.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>{active.errors.join(" | ")}</Alert>
                )}

                <Box sx={{ height: 420, width: "100%" }}>
                  <DataGrid
                    rows={items}
                    getRowId={(row) => String(row.ledgerid || `${row.feegroup}-${row.feeitem}-${row.paiddate}`)}
                    columns={itemColumns}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "verified_blockchain_fees_receipt_items" } } }}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                  />
                </Box>
              </Paper>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
