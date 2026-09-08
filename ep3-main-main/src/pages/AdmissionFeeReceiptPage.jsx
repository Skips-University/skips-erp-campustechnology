import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, Delete, FilterAlt, Print, Refresh, Search } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankFilter = { field: "academicyear", value: "" };
const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const shortDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "");
const receiptDate = () => new Date().toLocaleDateString("en-IN");

const paymentColumns = [
  { field: "paiddate", headerName: "Paid Date", minWidth: 130, valueGetter: (params) => shortDate(params.row.paiddate) },
  { field: "student", headerName: "Student", minWidth: 190, flex: 1 },
  { field: "paymenttype", headerName: "Item", minWidth: 170 },
  { field: "paidamount", headerName: "Amount", type: "number", minWidth: 140, valueFormatter: (params) => money(params.value) },
  { field: "paymentrefno", headerName: "Reference Number", minWidth: 190 },
  { field: "paymentstatus", headerName: "Status", minWidth: 130 },
  { field: "applicationid", headerName: "Application ID", minWidth: 220 },
  { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
  { field: "program", headerName: "Program", minWidth: 200, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 140 },
  { field: "email", headerName: "Email", minWidth: 220 },
  { field: "phone", headerName: "Phone", minWidth: 130 }
];

export default function AdmissionFeeReceiptPage() {
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanFilters = (sourceFilters = filters) => sourceFilters
    .map((filter) => ({
      field: filter.field,
      value: String(filter.value || "").trim(),
      operator: ["name", "email", "phone", "paymentrefno"].includes(filter.field) ? "contains" : "equals"
    }))
    .filter((filter) => filter.field && filter.value);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/admission-dynamic/payment-options", { params: { colid: global1.colid } });
      setFields(res.data?.fields || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load receipt filter options");
    }
  };

  const loadPayments = async (sourceFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/admission-dynamic/payments-report", {
        colid: global1.colid,
        filters: cleanFilters(sourceFilters)
      });
      setRows(res.data?.data || []);
      setInstitution(res.data?.institution || null);
      setSelectedStudent(null);
      setSelectedPayment(null);
    } catch (err) {
      setRows([]);
      setSelectedStudent(null);
      setSelectedPayment(null);
      setError(err.response?.data?.message || "Unable to load admission fee payments");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item
    )));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFilters = () => {
    const next = [{ ...blankFilter }];
    setFilters(next);
    loadPayments(next);
  };

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;

  const studentOptions = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.applicationid || `${row.student}-${row.email}-${row.phone}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${row.student || "Unnamed"}${row.program ? ` - ${row.program}` : ""}${row.phone ? ` - ${row.phone}` : ""}`,
          student: row.student,
          email: row.email,
          phone: row.phone,
          applicationid: row.applicationid,
          program: row.program,
          programcode: row.programcode,
          academicyear: row.academicyear
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const paymentRows = useMemo(() => {
    if (!selectedStudent) return [];
    return rows.filter((row) => row.applicationid === selectedStudent.applicationid);
  }, [rows, selectedStudent]);

  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";
  const receiptNumber = selectedPayment ? `AFR-${String(selectedPayment.paymentrefno || selectedPayment.id || "").slice(-10).toUpperCase()}` : "";

  return (
    <MenuPageShell title="Admission Fee Receipt">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #admission-fee-receipt-print, #admission-fee-receipt-print * { visibility: visible !important; }
          #admission-fee-receipt-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 190mm !important;
            min-height: 270mm !important;
            padding: 8mm !important;
            background: #fff !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: 0 !important;
          }
          .MuiDrawer-root, .MuiAppBar-root { display: none !important; }
          @page { size: A4 portrait; margin: 8mm; }
        }
      `}</style>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f7fb", minHeight: "100vh" }}>
        <Box sx={{ "@media print": { display: "none" } }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="h5" fontWeight={900}>Admission Fee Receipt</Typography>
                <Typography color="text.secondary">Filter payments, select a student, then select the payment to generate a printable receipt.</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters} disabled={loading}>Reset</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!selectedPayment}>Print Receipt</Button>
                <Button variant="contained" startIcon={<Search />} onClick={() => loadPayments()} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
              </Stack>
            </Stack>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterAlt color="primary" />
                <Typography variant="h6" fontWeight={800}>Dynamic Filters</Typography>
              </Stack>
              <Button startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
            </Stack>
            <Grid container spacing={2}>
              {filters.map((filter, index) => (
                <React.Fragment key={`${filter.field}-${index}`}>
                  <Grid item xs={12} md={4}>
                    <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                      {fields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Autocomplete
                      freeSolo
                      options={options[filter.field]?.values || []}
                      value={filter.value || ""}
                      onInputChange={(_, value) => updateFilter(index, { value })}
                      onChange={(_, value) => updateFilter(index, { value: value || "" })}
                      renderInput={(params) => <TextField {...params} label={fieldLabel(filter.field)} />}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Tooltip title="Remove filter">
                      <span>
                        <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1} sx={{ height: 56, width: 56 }}>
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Paper>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2, height: "100%" }}>
                <Typography fontWeight={900} sx={{ mb: 1 }}>Select Student</Typography>
                <Autocomplete
                  options={studentOptions}
                  getOptionLabel={(option) => option?.label || ""}
                  value={selectedStudent}
                  onChange={(_, value) => {
                    setSelectedStudent(value);
                    setSelectedPayment(null);
                  }}
                  renderInput={(params) => <TextField {...params} label="Student" />}
                />
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip label={`Students: ${studentOptions.length}`} />
                  <Chip color="primary" label={`Payments: ${rows.length}`} />
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e5e7eb", borderRadius: 2, height: "100%" }}>
                <Typography fontWeight={900} sx={{ mb: 1 }}>Selected Payment</Typography>
                {selectedPayment ? (
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><b>Item:</b> {selectedPayment.paymenttype}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><b>Amount:</b> {money(selectedPayment.paidamount)}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><b>Reference:</b> {selectedPayment.paymentrefno || "NA"}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography variant="body2"><b>Paid Date:</b> {shortDate(selectedPayment.paiddate)}</Typography></Grid>
                  </Grid>
                ) : (
                  <Typography color="text.secondary">Select a student and click a payment row below.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 1, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <DataGrid
              rows={paymentRows}
              columns={paymentColumns}
              getRowId={(row) => row.id}
              loading={loading}
              autoHeight
              onRowClick={(params) => setSelectedPayment(params.row)}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "admission_fee_receipt_payments" } } }}
              pageSizeOptions={[5, 10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              sx={{ minWidth: 0, "& .MuiDataGrid-row": { cursor: "pointer" } }}
            />
          </Paper>
        </Box>

        <Box id="admission-fee-receipt-print" sx={{ bgcolor: "white", color: "#111827", maxWidth: "190mm", mx: "auto", p: 3, border: "1px solid #d1d5db", borderRadius: 1 }}>
          {selectedPayment ? (
            <>
              <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
                {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />}
                <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
                {address && <Typography variant="body2">{address}</Typography>}
                <Typography variant="h6" fontWeight={900} sx={{ mt: 1, textTransform: "uppercase", letterSpacing: 0 }}>Admission Fee Receipt</Typography>
              </Stack>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={6}><Typography variant="body2"><b>Receipt No:</b> {receiptNumber || "NA"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" textAlign="right"><b>Receipt Date:</b> {receiptDate()}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><b>Application ID:</b> {selectedPayment.applicationid || "NA"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" textAlign="right"><b>Academic Year:</b> {selectedPayment.academicyear || "NA"}</Typography></Grid>
              </Grid>

              <Paper elevation={0} sx={{ p: 1.5, mb: 2, border: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}><Typography variant="body2"><b>Student:</b> {selectedPayment.student || "NA"}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2"><b>Phone:</b> {selectedPayment.phone || "NA"}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2"><b>Email:</b> {selectedPayment.email || "NA"}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2"><b>Program:</b> {selectedPayment.program || "NA"} {selectedPayment.programcode ? `(${selectedPayment.programcode})` : ""}</Typography></Grid>
                </Grid>
              </Paper>

              <Box sx={{ border: "1px solid #111827", borderRadius: 0.5, overflow: "hidden", mb: 2 }}>
                <Grid container sx={{ bgcolor: "#111827", color: "#fff", fontWeight: 900 }}>
                  <Grid item xs={4} sx={{ p: 1, borderRight: "1px solid #374151" }}>Item</Grid>
                  <Grid item xs={2} sx={{ p: 1, borderRight: "1px solid #374151" }}>Amount</Grid>
                  <Grid item xs={3} sx={{ p: 1, borderRight: "1px solid #374151" }}>Reference Number</Grid>
                  <Grid item xs={2} sx={{ p: 1, borderRight: "1px solid #374151" }}>Pay Date</Grid>
                  <Grid item xs={1} sx={{ p: 1 }}>Status</Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={4} sx={{ p: 1, borderRight: "1px solid #d1d5db" }}>{selectedPayment.paymenttype || "Admission Fee"}</Grid>
                  <Grid item xs={2} sx={{ p: 1, borderRight: "1px solid #d1d5db" }}>{money(selectedPayment.paidamount)}</Grid>
                  <Grid item xs={3} sx={{ p: 1, borderRight: "1px solid #d1d5db", wordBreak: "break-word" }}>{selectedPayment.paymentrefno || "NA"}</Grid>
                  <Grid item xs={2} sx={{ p: 1, borderRight: "1px solid #d1d5db" }}>{shortDate(selectedPayment.paiddate) || "NA"}</Grid>
                  <Grid item xs={1} sx={{ p: 1 }}>{selectedPayment.paymentstatus || "Paid"}</Grid>
                </Grid>
              </Box>

              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
                <Box sx={{ width: 260, borderTop: "2px solid #111827", pt: 1 }}>
                  <Typography variant="body2" fontWeight={900}>Total Amount: {money(selectedPayment.paidamount)}</Typography>
                </Box>
              </Stack>

              <Typography variant="body2" sx={{ mb: 3 }}>
                Received the above amount towards {selectedPayment.paymenttype || "admission fee"} from {selectedPayment.student || "the applicant"}.
              </Typography>

              <Divider sx={{ mb: 4 }} />
              <Grid container spacing={3}>
                <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Prepared by</Typography></Grid>
                <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Checked by</Typography></Grid>
                <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Authorized Signatory</Typography></Grid>
              </Grid>
            </>
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 260 }}>
              <Typography variant="h6" color="text.secondary">Select a payment to generate receipt</Typography>
            </Stack>
          )}
        </Box>
      </Box>
    </MenuPageShell>
  );
}
