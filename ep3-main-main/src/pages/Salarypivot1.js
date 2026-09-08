import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link as RouterLink } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const sortMonths = (months) => (
  [...months].sort((a, b) => {
    const aIndex = monthOrder.indexOf(a);
    const bIndex = monthOrder.indexOf(b);
    if (aIndex === -1 || bIndex === -1) {
      return String(a).localeCompare(String(b));
    }
    return aIndex - bIndex;
  })
);

export default function HrSalaryReport() {
  const colid = useMemo(() => global1.colid, []);
  const [rows, setRows] = useState([]);
  const [componentColumns, setComponentColumns] = useState([]);
  const [breakup, setBreakup] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [open, setOpen] = useState(false);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const moneyFormatter = (params) => Number(params.value || 0).toLocaleString("en-IN");

  const loadOptions = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    setOptionsLoading(true);
    setError("");
    try {
      const res = await ep1.get("/hr/salary-component-options", {
        params: { colid }
      });
      const nextMonths = sortMonths(res.data.months || []);
      const nextYears = (res.data.years || []).filter(Boolean).sort().reverse();

      setMonths(nextMonths);
      setYears(nextYears);
      setMonth((prev) => prev || nextMonths[0] || "");
      setYear((prev) => prev || nextYears[0] || "");
    } catch (err) {
      setError(err.response?.data?.error || "Error loading salary month and year options");
    } finally {
      setOptionsLoading(false);
    }
  };

  const hrFetchData = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }
    if (!month || !year) {
      setError("Please select month and year.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/hrsalarypivot", {
        params: { colid, month, year }
      });

      const pivotRows = res.data || [];
      const cols = new Set();
      pivotRows.forEach((row) => {
        Object.keys(row.componentObj || {}).forEach((component) => cols.add(component));
      });

      setComponentColumns(Array.from(cols).sort());
      setRows(pivotRows.map((row, index) => ({
        id: row.empid || `${row.employee}-${index}`,
        ...row,
        total: Number(row.total || 0)
      })));
    } catch (err) {
      setRows([]);
      setComponentColumns([]);
      setError(err.response?.data?.error || "Error loading salary report");
    } finally {
      setLoading(false);
    }
  };

  const hrHandleRowClick = async (row) => {
    setSelectedEmployee(row.employee || row.empid || "");
    try {
      const res = await ep1.get("/hr/salary-breakup", {
        params: { colid, month, year, empid: row.empid }
      });
      setBreakup((res.data || []).map((item, index) => ({
        id: `${item.component}-${index}`,
        ...item
      })));
      setOpen(true);
    } catch (err) {
      setError(err.response?.data?.error || "Error loading salary breakup");
    }
  };

  const submitForApproval = async () => {
    if (!month || !year) {
      setError("Please select month and year before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/salary-payment/submit-sheet", {
        colid,
        month,
        year,
        user: global1.user,
        name: global1.name,
        comments: `Submitted salary sheet for ${month} ${year}`
      });
      setMessage(`Salary sheet submitted. Status: ${res.data?.data?.status || "Submitted"}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit salary sheet for approval");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, [colid]);

  useEffect(() => {
    if (month && year) {
      hrFetchData();
    }
  }, [month, year]);

  const columns = useMemo(() => [
    { field: "empid", headerName: "Emp ID", minWidth: 170, flex: 1 },
    { field: "employee", headerName: "Employee", minWidth: 220, flex: 1 },
    ...componentColumns.map((component) => ({
      field: component,
      headerName: component,
      width: 150,
      type: "number",
      valueGetter: (params) => Number(params.row.componentObj?.[component] || 0),
      valueFormatter: moneyFormatter
    })),
    {
      field: "total",
      headerName: "Total",
      width: 150,
      type: "number",
      valueFormatter: moneyFormatter
    }
  ], [componentColumns]);

  const breakupColumns = [
    { field: "component", headerName: "Component", minWidth: 220, flex: 1 },
    {
      field: "amount",
      headerName: "Amount",
      width: 160,
      type: "number",
      valueFormatter: moneyFormatter
    }
  ];

  return (
    <MenuPageShell title="Monthwise Salary Sheet Drill Down">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                HR Salary Pivot Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select month and year from generated salary data.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/dashdashfacnew"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              Back
            </Button>
          </Stack>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="salary-month-label">Month</InputLabel>
              <Select
                labelId="salary-month-label"
                label="Month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                disabled={optionsLoading}
              >
                {months.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="salary-year-label">Year</InputLabel>
              <Select
                labelId="salary-year-label"
                label="Year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                disabled={optionsLoading}
              >
                {years.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={hrFetchData}
              disabled={loading || optionsLoading}
              sx={{ minWidth: 140 }}
            >
              Load
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={submitForApproval}
              disabled={submitting || loading || optionsLoading || !rows.length}
              sx={{ minWidth: 240 }}
            >
              {submitting ? "Submitting..." : "Submit monthly salary sheet"}
            </Button>
          </Stack>

          <Box sx={{ height: 560, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading || optionsLoading}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } }
              }}
              slots={{ toolbar: GridToolbar }}
              onRowClick={(params) => hrHandleRowClick(params.row)}
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Salary Breakup {selectedEmployee ? `- ${selectedEmployee}` : ""}</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 360, width: "100%", mt: 1 }}>
            <DataGrid
              rows={breakup}
              columns={breakupColumns}
              pageSizeOptions={[10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } }
              }}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
            />
          </Box>
        </DialogContent>
      </Dialog>
      </Container>
    </MenuPageShell>
  );
}
