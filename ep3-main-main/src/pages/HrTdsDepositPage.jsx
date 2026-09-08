import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blank = {
  id: "",
  taxperiod: "",
  tdsamount: "",
  bsrcode: "",
  challanserialno: "",
  datedeposited: "",
  remarks: ""
};

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function HrTdsDepositPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ledgerOptions, setLedgerOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedLedger = useMemo(() => ledgerOptions.find((item) => item.taxperiod === form.taxperiod && String(item.tdsamount) === String(form.tdsamount)), [ledgerOptions, form.taxperiod, form.tdsamount]);

  const searchEmployees = async (value = "") => {
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
      setError(err.response?.data?.message || "Unable to search employees");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeTds = async (employee = selectedEmployee) => {
    if (!employee) return;
    setLoading(true);
    setError("");
    try {
      const [ledgerRes, depositRes] = await Promise.all([
        ep1.get("/api/v2/hrsalary-slip/tds-ledger-options", {
          params: { colid: global1.colid, employeeid: employee._id || employee.id, employeeemail: employee.displayemail }
        }),
        ep1.get("/api/v2/hrsalary-slip/tds-deposits", {
          params: { colid: global1.colid, employeeemail: employee.displayemail }
        })
      ]);
      setLedgerOptions(ledgerRes.data?.options || []);
      setRows(depositRes.data?.data || []);
    } catch (err) {
      setLedgerOptions([]);
      setRows([]);
      setError(err.response?.data?.message || "Unable to load TDS ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { searchEmployees(""); }, []);

  const saveDeposit = async () => {
    if (!selectedEmployee) return setError("Please select an employee.");
    if (!form.taxperiod || !form.tdsamount) return setError("Please select tax period and TDS amount.");
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/hrsalary-slip/tds-deposits", {
        ...form,
        colid: global1.colid,
        employeeid: selectedEmployee._id || selectedEmployee.id,
        employee: selectedEmployee.name,
        employeeemail: selectedEmployee.displayemail,
        empid: selectedEmployee.displayemail,
        user: global1.user
      });
      setMessage("TDS deposit details saved");
      setForm(blank);
      loadEmployeeTds(selectedEmployee);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save TDS deposit details");
    } finally {
      setLoading(false);
    }
  };

  const deleteDeposit = async (row) => {
    if (!window.confirm(`Delete TDS deposit for ${row.taxperiod}?`)) return;
    setLoading(true);
    try {
      await ep1.post("/api/v2/hrsalary-slip/tds-deposits-delete", { colid: global1.colid, id: row._id });
      setMessage("TDS deposit deleted");
      loadEmployeeTds(selectedEmployee);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete TDS deposit");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "employee", headerName: "Employee", minWidth: 180, flex: 1 },
    { field: "employeeemail", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "taxperiod", headerName: "Tax Period", minWidth: 140, flex: 0.7 },
    { field: "tdsamount", headerName: "TDS Amount", minWidth: 130, flex: 0.6, align: "right", headerAlign: "right", valueFormatter: (params) => currency(params.value) },
    { field: "bsrcode", headerName: "BSR Code", minWidth: 130, flex: 0.7 },
    { field: "challanserialno", headerName: "Challan Serial No", minWidth: 170, flex: 0.9 },
    { field: "datedeposited", headerName: "Date Deposited", minWidth: 150, flex: 0.8, valueGetter: ({ row }) => row.datedeposited ? String(row.datedeposited).slice(0, 10) : "" },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => setForm({ ...blank, ...row, id: row._id, datedeposited: row.datedeposited ? String(row.datedeposited).slice(0, 10) : "" })} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteDeposit(row)} showInMenu />
      ]
    }
  ];

  return (
    <MenuPageShell title="TDS Deposited">
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mb: 2, border: "1px solid #e5e7eb", background: "linear-gradient(135deg,#f0fdf4,#ffffff)" }}>
          <Typography variant="h4" fontWeight={900}>TDS Deposited</Typography>
          <Typography color="text.secondary">Map salary-ledger TDS rows to BSR/challan deposit details for Form 16.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={employees}
                loading={loading}
                value={selectedEmployee}
                getOptionLabel={(option) => option ? `${option.name || ""} (${option.displayemail || option.email || ""})` : ""}
                onInputChange={(_, value) => { if (value?.length >= 2) searchEmployees(value); }}
                onChange={(_, value) => {
                  setSelectedEmployee(value);
                  setForm(blank);
                  if (value) loadEmployeeTds(value);
                }}
                renderInput={(params) => <TextField {...params} label="Search and select employee" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Tax Period" value={form.taxperiod} onChange={(e) => {
                const item = ledgerOptions.find((option) => option.taxperiod === e.target.value);
                setForm((old) => ({ ...old, taxperiod: e.target.value, tdsamount: item?.tdsamount || old.tdsamount }));
              }}>
                {ledgerOptions.map((item) => <MenuItem key={`${item.taxperiod}-${item.tdsamount}`} value={item.taxperiod}>{item.taxperiod}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="TDS Amount" value={String(form.tdsamount)} onChange={(e) => setForm({ ...form, tdsamount: e.target.value })}>
                {ledgerOptions.filter((item) => !form.taxperiod || item.taxperiod === form.taxperiod).map((item) => (
                  <MenuItem key={`${item.id}-${item.tdsamount}`} value={String(item.tdsamount)}>{currency(item.tdsamount)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth type="date" label="Date Deposited" InputLabelProps={{ shrink: true }} value={form.datedeposited || ""} onChange={(e) => setForm({ ...form, datedeposited: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="BSR Code" value={form.bsrcode || ""} onChange={(e) => setForm({ ...form, bsrcode: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Challan Serial No" value={form.challanserialno || ""} onChange={(e) => setForm({ ...form, challanserialno: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Remarks" value={form.remarks || ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth sx={{ minHeight: 54 }} variant="contained" startIcon={<Save />} onClick={saveDeposit} disabled={loading || !selectedEmployee}>
                {form.id ? "Update" : "Save"}
              </Button>
            </Grid>
            {selectedLedger && (
              <Grid item xs={12}>
                <Alert severity="info">Selected ledger row: {selectedLedger.component} | {selectedLedger.taxperiod} | TDS {currency(selectedLedger.tdsamount)}</Alert>
              </Grid>
            )}
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ height: 520 }}>
            <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
