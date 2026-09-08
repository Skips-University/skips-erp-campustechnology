import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Grid,
  Link,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function UpdateFeeRefundPage() {
  const colid = useMemo(() => global1.colid, []);
  const [options, setOptions] = useState({ academicYears: [], programs: [] });
  const [feeRows, setFeeRows] = useState([]);
  const [form, setForm] = useState({ academicyear: "", programcode: "", refundable: "Yes", feeitems: [] });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedProgram = useMemo(
    () => (options.programs || []).find((item) => item.programcode === form.programcode) || null,
    [options.programs, form.programcode]
  );

  const feeItemOptions = useMemo(
    () => [...new Set(feeRows.map((row) => row.feeeitem || row.feeitem).filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b))),
    [feeRows]
  );

  const previewRows = useMemo(() => {
    if (!form.feeitems.length) return feeRows;
    return feeRows.filter((row) => form.feeitems.includes(row.feeeitem || row.feeitem));
  }, [feeRows, form.feeitems]);

  const totals = useMemo(() => previewRows.reduce((sum, row) => ({
    count: sum.count + 1,
    amount: sum.amount + Number(row.amount || 0),
    currentRefund: sum.currentRefund + Number(row.refundamount || 0)
  }), { count: 0, amount: 0, currentRefund: 0 }), [previewRows]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/mfeesconfig/options", { params: { colid } });
      setOptions({
        academicYears: res.data.feeFilterOptions?.academicYears?.length ? res.data.feeFilterOptions.academicYears : res.data.academicYears || [],
        programs: res.data.feeFilterOptions?.programs?.length ? res.data.feeFilterOptions.programs : res.data.programs || []
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dropdown options");
    }
  };

  const loadFees = async (nextForm = form) => {
    if (!nextForm.academicyear || !nextForm.programcode) {
      setFeeRows([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/mfeesconfig", {
        params: { colid, academicyear: nextForm.academicyear, programcode: nextForm.programcode }
      });
      setFeeRows(res.data.data || []);
      setForm((prev) => ({ ...prev, feeitems: [] }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fee items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const updateForm = (patch) => {
    const next = { ...form, ...patch };
    setForm(next);
    if (patch.academicyear !== undefined || patch.programcode !== undefined) loadFees(next);
  };

  const proceed = async () => {
    if (!form.academicyear || !form.programcode || !form.feeitems.length) {
      setError("Select academic year, program and at least one fee item.");
      return;
    }
    setProcessing(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/mfeesconfig/update-refund", {
        colid,
        academicyear: form.academicyear,
        programcode: form.programcode,
        feeitems: form.feeitems,
        refundable: form.refundable,
        user: global1.user,
        name: global1.name || global1.user
      });
      setMessage(res.data.message || "Refund setup updated.");
      await loadFees(form);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update refund setup");
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "program", headerName: "Program", minWidth: 200, flex: 1 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeeitem", headerName: "Fee Item", minWidth: 210, flex: 1 },
    { field: "feecategory", headerName: "Fee Category", width: 150 },
    { field: "amount", headerName: "Amount", width: 130, type: "number" },
    { field: "refundable", headerName: "Refundable", width: 120 },
    { field: "refundamount", headerName: "Refund Amount", width: 140, type: "number" },
    { field: "status", headerName: "Status", width: 120 }
  ];

  return (
    <MenuPageShell title="Update Refund">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Breadcrumbs sx={{ mb: 1 }}>
              <Link component={RouterLink} to="/dashdashfacnew" color="inherit" underline="hover">Dashboard</Link>
              <Typography color="text.primary">Fees</Typography>
              <Typography color="text.primary">Update refund</Typography>
            </Breadcrumbs>
            <Typography variant="h4" fontWeight={900}>Update Fee Refund</Typography>
            <Typography color="text.secondary">Bulk mark selected fee items as refundable or non-refundable for a program.</Typography>
          </Box>

          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {(loading || processing) && <LinearProgress />}

          <Grid container spacing={2}>
            {[
              ["Matching records", totals.count],
              ["Total amount", money(totals.amount)],
              ["Current refund amount", money(totals.currentRefund)]
            ].map(([label, value]) => (
              <Grid item xs={12} md={4} key={label}>
                <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
                  <CardContent>
                    <Typography color="text.secondary">{label}</Typography>
                    <Typography variant="h5" fontWeight={900}>{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => updateForm({ academicyear: e.target.value })}>
                  <MenuItem value="">Select</MenuItem>
                  {(options.academicYears || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => updateForm({ programcode: e.target.value })}>
                  <MenuItem value="">Select</MenuItem>
                  {(options.programs || []).map((item) => (
                    <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={feeItemOptions}
                  value={form.feeitems}
                  onChange={(_, value) => setForm((prev) => ({ ...prev, feeitems: value }))}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} sx={{ mr: 1 }} />
                      {option}
                    </li>
                  )}
                  renderInput={(params) => <TextField {...params} label="Fee Items" placeholder="Select fee items" />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="Refundable" value={form.refundable} onChange={(e) => setForm((prev) => ({ ...prev, refundable: e.target.value }))}>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
                  <Box>
                    {selectedProgram && <Chip label={`${selectedProgram.program || ""} ${selectedProgram.programcode ? `(${selectedProgram.programcode})` : ""}`} />}
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      If Refundable is Yes, each selected item gets refund amount equal to its amount. If No, refund amount becomes 0.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button startIcon={<RefreshIcon />} disabled={loading} onClick={() => loadFees(form)}>Reload</Button>
                    <Button variant="contained" startIcon={<SaveIcon />} disabled={processing || !form.feeitems.length} onClick={proceed}>Proceed</Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Fee items preview</Typography>
            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid
                rows={previewRows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "update_fee_refund" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
