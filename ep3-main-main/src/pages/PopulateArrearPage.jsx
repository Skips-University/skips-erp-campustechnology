import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Calculate } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const months = [
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

const years = [
  "2026-27",
  "2025-26",
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22"
];

const PopulateArrearPage = () => {
  const colid = global1.colid;
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    try {
      const res = await ep1.get("/sal/employees", {
        params: { colid }
      });
      setEmployees(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading employees");
    }
  };

  const loadArrears = async (selectedEmployee = employee) => {
    if (!selectedEmployee?._id) {
      setRows([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/hr/employee-arrears", {
        params: {
          colid,
          employeeid: selectedEmployee._id
        }
      });
      setRows(res.data || []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || err.response?.data?.error || "Error loading arrears");
    } finally {
      setLoading(false);
    }
  };

  const populateArrear = async () => {
    if (!employee?._id || !month || !year) {
      setError("Please select employee, month and year.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/hr/populate-arrear", {
        colid,
        employeeid: employee._id,
        month,
        year,
        user: global1.user,
        name: global1.name
      });
      setRows(res.data.arrears || []);
      setMessage(`${res.data.message} (${res.data.count} entries)`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error populating arrear");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const moneyFormatter = (params) => Number(params.value || 0).toLocaleString("en-IN");

  const columns = [
    { field: "employee", headerName: "Employee", minWidth: 220, flex: 1 },
    { field: "empid", headerName: "Employee userid", minWidth: 180, flex: 1 },
    { field: "year", headerName: "Year", width: 120 },
    { field: "month", headerName: "Month", width: 130 },
    { field: "component", headerName: "Component", minWidth: 170, flex: 1 },
    {
      field: "amount",
      headerName: "Arrear Amount",
      width: 160,
      type: "number",
      valueFormatter: moneyFormatter
    },
    { field: "type", headerName: "Type", width: 130 },
    { field: "level", headerName: "Level", width: 120 },
    { field: "structure", headerName: "Structure", minWidth: 220, flex: 1 },
    { field: "paystatus", headerName: "Pay status", width: 130 },
    { field: "comments", headerName: "Comments", minWidth: 260, flex: 1 }
  ];

  return (
    <MenuPageShell title="Populate Arrear">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Populate Arrear
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calculate prorata arrear from active salary structure effective and applied dates.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/dashdashfacnew"
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              Back
            </Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Autocomplete
              fullWidth
              options={employees}
              value={employee}
              getOptionLabel={(option) => option.name || ""}
              onChange={(event, nextValue) => {
                setEmployee(nextValue);
                setMessage("");
                loadArrears(nextValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Employee" />
              )}
            />

            <FormControl fullWidth>
              <InputLabel id="arrear-month-label">Month</InputLabel>
              <Select
                labelId="arrear-month-label"
                label="Month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              >
                {months.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="arrear-year-label">Year</InputLabel>
              <Select
                labelId="arrear-year-label"
                label="Year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              >
                {years.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Calculate />}
              onClick={populateArrear}
              disabled={saving}
              sx={{ minWidth: 180 }}
            >
              {saving ? "Populating..." : "Populate Arrear"}
            </Button>
          </Stack>

          <Box sx={{ height: 540, width: "100%" }}>
            <DataGrid
              getRowId={(row) => row._id}
              rows={rows}
              columns={columns}
              loading={loading || saving}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } }
              }}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>
      </Paper>
      </Container>
    </MenuPageShell>
  );
};

export default PopulateArrearPage;
