import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Print, Search, Description } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const prettyDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");
const currentFinancialYearStart = () => {
  const today = new Date();
  const year = today.getMonth() + 1 >= 4 ? today.getFullYear() : today.getFullYear() - 1;
  return `${year}-04-01`;
};
const currentFinancialYearEnd = () => {
  const today = new Date();
  const year = today.getMonth() + 1 >= 4 ? today.getFullYear() + 1 : today.getFullYear();
  return `${year}-03-31`;
};

export default function HrForm16Page() {
  const [searchText, setSearchText] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fromdate, setFromdate] = useState(currentFinancialYearStart());
  const [todate, setTodate] = useState(currentFinancialYearEnd());
  const [form16, setForm16] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const searchEmployees = async (value = searchText) => {
    setLoading(true);
    setError("");
    try {
      const field = String(value || "").includes("@") ? "email" : "name";
      const res = await ep1.post("/api/v2/hrsalary-slip/employees", {
        colid: global1.colid,
        filters: value ? [{ field, value }] : []
      });
      setEmployees(res.data?.data || []);
    } catch (err) {
      setEmployees([]);
      setError(err.response?.data?.message || "Unable to search employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { searchEmployees(""); }, []);

  const generateForm16 = async () => {
    if (!selectedEmployee) return setError("Please select an employee.");
    if (!fromdate || !todate) return setError("Please select from date and to date.");
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/hrsalary-slip/form16", {
        colid: global1.colid,
        employeeid: selectedEmployee._id || selectedEmployee.id,
        employeeemail: selectedEmployee.displayemail,
        fromdate,
        todate
      });
      setForm16(res.data?.data || null);
      setMessage("Form 16 generated");
    } catch (err) {
      setForm16(null);
      setError(err.response?.data?.message || "Unable to generate Form 16");
    } finally {
      setLoading(false);
    }
  };

  const printForm = () => window.print();
  const rowsWithId = (rows = []) => rows.map((row, index) => ({ ...row, id: row.id || row._id || index + 1 }));

  const amountColumns = [
    { field: "component", headerName: "Component", minWidth: 180, flex: 1 },
    { field: "period", headerName: "Period", minWidth: 120, flex: 0.6, valueGetter: ({ row }) => row.period || `${row.month || ""} ${row.year || ""}`.trim() },
    { field: "amount", headerName: "Amount", width: 140, align: "right", headerAlign: "right", valueFormatter: (params) => currency(Math.abs(Number(params.value || 0))) }
  ];

  const challanColumns = [
    { field: "period", headerName: "Tax Period", minWidth: 150, flex: 1 },
    { field: "amount", headerName: "TDS Amount", width: 140, align: "right", headerAlign: "right", valueFormatter: (params) => currency(params.value) },
    { field: "bsrCode", headerName: "BSR Code", minWidth: 130, flex: 0.8 },
    { field: "challanSerialNo", headerName: "Challan Serial No.", minWidth: 160, flex: 1 },
    { field: "depositedDate", headerName: "Date Deposited", minWidth: 150, flex: 0.8 }
  ];

  const summaryRows = form16 ? [
    { id: 1, label: "Gross Salary", amount: form16.partB.grossSalary },
    { id: 2, label: "Deductions other than TDS", amount: form16.partB.deductionsOtherThanTds },
    { id: 3, label: "Income chargeable under salaries", amount: form16.partB.taxableIncome },
    { id: 4, label: "Tax deducted at source", amount: form16.partB.tdsDeducted },
    { id: 5, label: "Balance tax payable/refundable", amount: form16.partB.balanceTax }
  ] : [];

  const summaryColumns = [
    { field: "label", headerName: "Particulars", minWidth: 260, flex: 1 },
    { field: "amount", headerName: "Amount", width: 160, align: "right", headerAlign: "right", valueFormatter: (params) => currency(params.value) }
  ];

  const gridSx = {
    border: "1px solid #d1d5db",
    color: "#000",
    "& .MuiDataGrid-columnHeaders": { bgcolor: "#f3f4f6", color: "#000", fontWeight: 800 },
    "& .MuiDataGrid-cell": { color: "#000" },
    "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 800 }
  };

  const printStyle = useMemo(() => `
    @media print {
      body * { visibility: hidden; }
      #form16-print, #form16-print * { visibility: visible; }
      #form16-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
      .no-print { display: none !important; }
      @page { size: A4; margin: 9mm; }
    }
  `, []);

  const institution = form16?.institution || {};
  const employee = form16?.employee || {};
  const employer = form16?.employer || {};
  const period = form16?.period || {};

  return (
    <MenuPageShell title="Form 16">
      <style>{printStyle}</style>
      <Box sx={{ p: 3 }}>
        <Paper className="no-print" sx={{ p: 3, mb: 2, border: "1px solid #e5e7eb", background: "linear-gradient(135deg,#eef6ff,#ffffff)" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={900}>Form 16 Generator</Typography>
              <Typography color="text.secondary">Select employee and date range to generate a printable salary TDS certificate format.</Typography>
            </Box>
            <Button variant="outlined" startIcon={<Search />} onClick={() => searchEmployees(searchText)} disabled={loading}>Search</Button>
          </Stack>
        </Paper>

        {message && <Alert className="no-print" severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={employees}
                loading={loading}
                value={selectedEmployee}
                getOptionLabel={(option) => option ? `${option.name || ""} (${option.displayemail || option.email || ""})` : ""}
                onInputChange={(_, value) => {
                  setSearchText(value);
                  if (value?.length >= 2) searchEmployees(value);
                }}
                onChange={(_, value) => setSelectedEmployee(value)}
                renderInput={(params) => <TextField {...params} label="Search and select employee" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="From Date" InputLabelProps={{ shrink: true }} value={fromdate} onChange={(e) => setFromdate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="To Date" InputLabelProps={{ shrink: true }} value={todate} onChange={(e) => setTodate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" startIcon={<Description />} onClick={generateForm16} disabled={loading || !selectedEmployee} sx={{ minHeight: 54 }}>
                Generate Form 16
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {form16 && (
          <>
            <Stack className="no-print" direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
              <Button variant="contained" startIcon={<Print />} onClick={printForm}>Print Form 16</Button>
            </Stack>

            <Paper id="form16-print" sx={{ p: 2.5, maxWidth: "210mm", mx: "auto", color: "#000", bgcolor: "#fff", border: "1px solid #d1d5db", "& *": { color: "#000" } }}>
              <Stack spacing={1.6}>
                <Stack alignItems="center" textAlign="center" spacing={0.5}>
                  {institution.logolink && <Box component="img" src={institution.logolink} alt="logo" sx={{ width: 58, height: 58, objectFit: "contain" }} />}
                  <Typography variant="h6" fontWeight={900}>{employer.name || global1.insname || "Institution"}</Typography>
                  <Typography variant="caption">{employer.address}</Typography>
                  <Typography variant="subtitle1" fontWeight={900}>FORM NO. 16</Typography>
                  <Typography variant="body2" fontWeight={700}>Certificate under section 203 of the Income-tax Act, 1961</Typography>
                  <Typography variant="caption">For tax deducted at source from income chargeable under the head Salaries</Typography>
                </Stack>

                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      <Typography fontWeight={900} sx={{ mb: 0.5 }}>PART A: Employer Details</Typography>
                      <Typography variant="body2">Name: {employer.name || "-"}</Typography>
                      <Typography variant="body2">Address: {employer.address || "-"}</Typography>
                      <Typography variant="body2">PAN: {employer.pan}</Typography>
                      <Typography variant="body2">TAN: {employer.tan}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      <Typography fontWeight={900} sx={{ mb: 0.5 }}>Employee Details</Typography>
                      <Typography variant="body2">Name: {employee.name || "-"}</Typography>
                      <Typography variant="body2">Employee ID: {employee.employeeid || "-"}</Typography>
                      <Typography variant="body2">PAN: {employee.pan}</Typography>
                      <Typography variant="body2">Period: {prettyDate(period.fromdate)} to {prettyDate(period.todate)}</Typography>
                      <Typography variant="body2">Assessment Year: {period.assessmentyear || "-"}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box>
                  <Typography fontWeight={900} sx={{ mb: 0.5 }}>Summary of TDS Deducted and Deposited</Typography>
                  <DataGrid autoHeight rows={rowsWithId(form16.partA.challanDetails)} columns={challanColumns} hideFooter disableRowSelectionOnClick density="compact" rowHeight={30} columnHeaderHeight={34} sx={gridSx} />
                </Box>

                <Box>
                  <Typography fontWeight={900} sx={{ mb: 0.5 }}>PART B: Details of Salary Paid and Income Tax Deducted</Typography>
                  <DataGrid autoHeight rows={summaryRows} columns={summaryColumns} hideFooter disableRowSelectionOnClick density="compact" rowHeight={30} columnHeaderHeight={34} sx={gridSx} />
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight={900} sx={{ mb: 0.5 }}>Salary Components</Typography>
                    <DataGrid autoHeight rows={rowsWithId(form16.earningRows)} columns={amountColumns} hideFooter disableRowSelectionOnClick density="compact" rowHeight={30} columnHeaderHeight={34} sx={gridSx} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight={900} sx={{ mb: 0.5 }}>Deductions Including TDS</Typography>
                    <DataGrid autoHeight rows={rowsWithId(form16.deductionRows)} columns={amountColumns} hideFooter disableRowSelectionOnClick density="compact" rowHeight={30} columnHeaderHeight={34} sx={gridSx} />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ pt: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Place: ____________________</Typography>
                    <Typography variant="body2">Date: {prettyDate(form16.generatedon)}</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2">Signature of person responsible for deduction of tax</Typography>
                    <Typography variant="body2" sx={{ mt: 4 }}>Name and designation: ____________________</Typography>
                  </Grid>
                </Grid>

                <Typography variant="caption" sx={{ display: "block", borderTop: "1px solid #d1d5db", pt: 1 }}>
                  Note: This printable Form 16 is generated from salary and TDS records available in the ERP. Challan/BSR/TRACES details should be verified and completed by the employer before statutory filing or issue.
                </Typography>
              </Stack>
            </Paper>
          </>
        )}
      </Box>
    </MenuPageShell>
  );
}
