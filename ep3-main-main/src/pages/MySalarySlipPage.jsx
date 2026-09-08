import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { ArrowBack, Print, ReceiptLong } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const prettyDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "");
const rowsWithId = (rows = []) => rows.map((row, index) => ({ ...row, id: row.id || row._id || index + 1 }));

export default function MySalarySlipPage() {
  const [options, setOptions] = useState({ months: [], years: [], leaveCycles: [] });
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [leaveCycle, setLeaveCycle] = useState("");
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await ep1.get("/api/v2/hrsalary-slip/options", { params: { colid: global1.colid } });
        const next = res.data || {};
        setOptions(next);
        if (next.months?.length) setMonth(next.months[0]);
        if (next.years?.length) setYear(next.years[0]);
        if (next.leaveCycles?.length) setLeaveCycle(next.leaveCycles[0]);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load salary slip options");
      }
    };
    loadOptions();
  }, []);

  const amountColumns = [
    { field: "component", headerName: "Component", minWidth: 120, flex: 1 },
    { field: "amount", headerName: "Amount", width: 92, align: "right", headerAlign: "right", valueFormatter: (params) => currency(params.value) }
  ];

  const leaveColumns = [
    { field: "leavetype", headerName: "Leave Type", width: 82 },
    { field: "openingbalance", headerName: "Opening", width: 76, type: "number" },
    { field: "carryforward", headerName: "Carry", width: 70, type: "number" },
    { field: "earned", headerName: "Earned", width: 70, type: "number" },
    { field: "used", headerName: "Used", width: 64, type: "number" },
    { field: "balance", headerName: "Bal.", width: 64, type: "number" }
  ];

  const institution = slip?.institution || {};
  const totals = slip?.totals || {};
  const attendance = slip?.attendance || {};
  const employee = slip?.employee || {};
  const detailRows = slip ? [
    ["Employee", employee.name, "Email", employee.email],
    ["Phone", employee.phone, "Department", employee.department],
    ["Employee ID", employee.employeeid, "Role", employee.role],
    ["Month", `${slip.period.month} ${slip.period.year}`, "Leave Cycle", slip.period.cyclename],
    ["Period", `${prettyDate(slip.period.fromdate)} to ${prettyDate(slip.period.todate)}`, "Generated On", prettyDate(slip.generatedon)]
  ] : [];
  const summaryRows = slip ? [
    ["Total Days", attendance.totaldays, "Present", attendance.presentdays],
    ["Absent", attendance.absentdays, "Unmarked", attendance.unmarkeddays],
    ["Total Earnings", currency(totals.totalearning), "Total Deductions", currency(totals.totaldeduction)],
    ["Net Pay", currency(totals.netpay), "", ""]
  ] : [];

  const printGridSx = {
    border: 0,
    borderRadius: 1,
    color: "#000",
    fontSize: 12,
    "& .MuiDataGrid-columnHeaders": { color: "#000", backgroundColor: "#f3f4f6", borderBottom: 0, minHeight: "30px !important", maxHeight: "30px !important" },
    "& .MuiDataGrid-columnHeader": { minHeight: "30px !important", maxHeight: "30px !important" },
    "& .MuiDataGrid-columnHeaderTitle": { color: "#000", fontWeight: 800, fontSize: 12 },
    "& .MuiDataGrid-cell": { color: "#000", borderBottom: 0, minHeight: "28px !important", maxHeight: "28px !important", py: 0 },
    "& .MuiDataGrid-row": { color: "#000" },
    "& .MuiDataGrid-row:nth-of-type(even)": { backgroundColor: "#fafafa" },
    "& .MuiDataGrid-withBorderColor": { borderColor: "transparent" },
    "& .MuiDataGrid-footerContainer": { borderTop: 0 },
    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": {
      outline: "none"
    }
  };

  const infoColumns = [
    { field: "label1", headerName: "", flex: 0.7, minWidth: 84, cellClassName: "info-label" },
    { field: "value1", headerName: "", flex: 1.3, minWidth: 130, cellClassName: "info-value" },
    { field: "label2", headerName: "", flex: 0.7, minWidth: 84, cellClassName: "info-label" },
    { field: "value2", headerName: "", flex: 1.3, minWidth: 130, cellClassName: "info-value" }
  ];

  const infoGridSx = {
    ...printGridSx,
    "& .info-label": { fontWeight: 800, backgroundColor: "#fbfbfb" },
    "& .info-value": { fontWeight: 600 }
  };

  const InfoGrid = ({ rows }) => (
    <DataGrid
      autoHeight
      rows={rows.map((row, index) => ({
        id: index + 1,
        label1: row[0],
        value1: row[1] || "-",
        label2: row[2] || "",
        value2: row[2] ? (row[3] || "-") : ""
      }))}
      columns={infoColumns}
      hideFooter
      disableColumnMenu
      disableRowSelectionOnClick
      density="compact"
      rowHeight={26}
      columnHeaderHeight={0}
      sx={infoGridSx}
    />
  );

  const generateSlip = async () => {
    if (!month || !year || !leaveCycle) {
      setError("Please select month, year and leave cycle.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/hrsalary-slip/generate", {
        colid: global1.colid,
        employeeemail: global1.user,
        empid: global1.user,
        month,
        year,
        cyclename: leaveCycle
      });
      setSlip(res.data?.data || null);
      setMessage("Salary slip generated");
    } catch (err) {
      setSlip(null);
      setError(err.response?.data?.message || "Unable to generate salary slip");
    } finally {
      setLoading(false);
    }
  };

  const printStyle = useMemo(() => `
    @media print {
      body * { visibility: hidden; }
      #my-salary-slip-print, #my-salary-slip-print * { visibility: visible; }
      #my-salary-slip-print { position: absolute; left: 0; top: 0; width: 100%; max-width: 100% !important; box-shadow: none !important; box-sizing: border-box; }
      .no-print { display: none !important; }
      @page { size: A4; margin: 8mm; }
    }
  `, []);

  return (
    <MenuPageShell title="My Salary Slip">
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>{printStyle}</style>
      <Stack spacing={3}>
        <Paper className="no-print" elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: 3, background: "linear-gradient(180deg,#f8fafc,#fff)" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={900}>My Salary Slip</Typography>
              <Typography color="text.secondary">Generate and print your salary slip for the selected period.</Typography>
            </Box>
            <Button component={RouterLink} to="/dashdashfacnew" startIcon={<ArrowBack />} variant="outlined">Back</Button>
          </Stack>
        </Paper>

        {error && <Alert className="no-print" severity="error">{error}</Alert>}
        {message && <Alert className="no-print" severity="success">{message}</Alert>}

        <Paper className="no-print" variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Select fullWidth value={month} onChange={(e) => setMonth(e.target.value)} displayEmpty>
                <MenuItem value="">Select Month</MenuItem>
                {(options.months || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Select fullWidth value={year} onChange={(e) => setYear(e.target.value)} displayEmpty>
                <MenuItem value="">Select Year</MenuItem>
                {(options.years || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Select fullWidth value={leaveCycle} onChange={(e) => setLeaveCycle(e.target.value)} displayEmpty>
                <MenuItem value="">Select Leave Cycle</MenuItem>
                {(options.leaveCycles || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth sx={{ minHeight: 54 }} startIcon={<ReceiptLong />} variant="contained" color="success" onClick={generateSlip} disabled={loading}>
                Generate Salary Slip
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {slip && (
          <>
            <Stack className="no-print" direction="row" justifyContent="flex-end">
              <Button startIcon={<Print />} variant="contained" onClick={() => window.print()}>Print Salary Slip</Button>
            </Stack>

            <Paper id="my-salary-slip-print" elevation={3} sx={{ p: { xs: 1.25, md: 2 }, borderRadius: 1, width: "100%", maxWidth: 760, mx: "auto", bgcolor: "#fff", color: "#000", boxSizing: "border-box", "& *": { color: "#000" } }}>
              <Stack spacing={1}>
                <Stack spacing={0.25} alignItems="center" justifyContent="center" textAlign="center">
                  {institution.logolink && <Box component="img" src={institution.logolink} alt="logo" sx={{ width: 54, height: 54, objectFit: "contain" }} />}
                  <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1 }}>{institution.institutionname || global1.insname || "Institution"}</Typography>
                  <Typography variant="caption" sx={{ lineHeight: 1.2 }}>{institution.address || ""}</Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1 }}>Salary Slip</Typography>
                </Stack>

                <Divider />

                <Box>
                  <Typography fontWeight={800} sx={{ fontSize: 13, mb: 0.25 }}>Employee and Period Details</Typography>
                  <InfoGrid rows={detailRows} />
                </Box>

                <Box>
                  <Typography fontWeight={800} sx={{ fontSize: 13, mb: 0.25 }}>Attendance and Salary Summary</Typography>
                  <InfoGrid rows={summaryRows} />
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight={800} sx={{ fontSize: 13, mb: 0.25 }}>Earnings</Typography>
                    <DataGrid autoHeight rows={rowsWithId(slip.earnings)} columns={amountColumns} hideFooter disableRowSelectionOnClick density="compact" rowHeight={28} columnHeaderHeight={30} sx={printGridSx} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography fontWeight={800} sx={{ fontSize: 13, mb: 0.25 }}>Deductions</Typography>
                    <DataGrid autoHeight rows={rowsWithId(slip.deductions)} columns={amountColumns} hideFooter disableRowSelectionOnClick density="compact" rowHeight={28} columnHeaderHeight={30} sx={printGridSx} />
                  </Grid>
                </Grid>

                <Box>
                  <Typography fontWeight={800} sx={{ fontSize: 13, mb: 0.25 }}>Leave Balance</Typography>
                  <DataGrid autoHeight rows={rowsWithId(slip.leaveBalances)} columns={leaveColumns} hideFooter disableRowSelectionOnClick density="compact" rowHeight={28} columnHeaderHeight={30} sx={printGridSx} />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                  This is a computer-generated salary slip. Any discrepancy should be reported to HR within seven working days.
                </Typography>
              </Stack>
            </Paper>
          </>
        )}
      </Stack>
      </Container>
    </MenuPageShell>
  );
}
