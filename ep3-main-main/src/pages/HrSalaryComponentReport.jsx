import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Refresh, Search } from "@mui/icons-material";
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

const HrSalaryComponentReport = () => {
  const colid = useMemo(() => global1.colid, []);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [components, setComponents] = useState([]);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [component, setComponent] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOptions = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    setError("");
    try {
      const res = await ep1.get("/hr/salary-component-options", {
        params: { colid }
      });
      const nextYears = res.data.years || [];
      const nextMonths = sortMonths(res.data.months || []);
      const nextComponents = res.data.components || [];

      setYears(nextYears);
      setMonths(nextMonths);
      setComponents(nextComponents);
      setYear((prev) => prev || nextYears[0] || "");
      setMonth((prev) => prev || nextMonths[0] || "");
      setComponent((prev) => prev || nextComponents[0] || "");
    } catch (err) {
      setError(err.response?.data?.error || "Error loading salary dropdowns");
    }
  };

  const loadSalaryRows = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }
    if (!year || !month || !component) {
      setError("Please select year, month and component.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/hr/salary-by-component", {
        params: { colid, year, month, component }
      });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Error loading salary component report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, [colid]);

  const columns = [
    { field: "empid", headerName: "Emp ID", width: 130 },
    { field: "employee", headerName: "Employee", minWidth: 220, flex: 1 },
    { field: "year", headerName: "Year", width: 110 },
    { field: "month", headerName: "Month", width: 130 },
    { field: "component", headerName: "Component", minWidth: 180, flex: 1 },
    { field: "amount", headerName: "Amount", width: 130, type: "number" },
    { field: "structure", headerName: "Structure", minWidth: 160, flex: 1 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "level", headerName: "Level", width: 110 },
    { field: "paystatus", headerName: "Pay Status", width: 130 }
  ];

  return (
    <MenuPageShell title="Salary Component Report">
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            HR Salary Component Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Employee-wise salary entries for the selected component
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`Col ID: ${colid || "Not set"}`} color={colid ? "primary" : "warning"} variant="outlined" />
          <Chip label={`${rows.length} entries`} variant="outlined" />
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Year</InputLabel>
            <Select label="Year" value={year} onChange={(event) => setYear(event.target.value)}>
              {years.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Month</InputLabel>
            <Select label="Month" value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Component</InputLabel>
            <Select label="Component" value={component} onChange={(event) => setComponent(event.target.value)}>
              {components.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" startIcon={<Search />} onClick={loadSalaryRows}>
            Load
          </Button>
          <Tooltip title="Reload dropdown values">
            <IconButton color="primary" onClick={loadOptions}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ height: 650, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id || `${row.empid}-${row.year}-${row.month}-${row.component}`}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } }
            }}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                csvOptions: { fileName: `salary-${year}-${month}-${component}` },
                printOptions: { disableToolbarButton: false }
              }
            }}
          />
        </Box>
      </Paper>
      </Container>
    </MenuPageShell>
  );
};

export default HrSalaryComponentReport;
