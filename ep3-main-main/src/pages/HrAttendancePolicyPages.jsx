import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Delete, Edit, FileDownload, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const statusOptions = ["Active", "Inactive"];
const lateBlank = { role: "", fromdays: 1, todays: 1, dailysalarypercentage: 0, status: "Active" };
const overtimeBlank = { role: "", hourlyrate: 0, status: "Active" };
const msg = (err, fallback) => err.response?.data?.message || fallback;

const downloadXlsx = (rows, filename, sheet) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), sheet);
  XLSX.writeFile(workbook, filename);
};

function useRoles() {
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    ep1.get("/api/v2/hrattendance/shift/options", { params: { colid: global1.colid } })
      .then((res) => {
        const values = Array.from(new Set((res.data?.users || []).map((user) => user.role).filter(Boolean))).sort();
        setRoles(["All", ...values.filter((role) => role !== "All")]);
      })
      .catch(() => setRoles(["All", "Admin", "Faculty", "Staff"]));
  }, []);
  return roles;
}

function PolicyShell({ title, subtitle, blank, endpoint, templateRows, columnsDef, children }) {
  const roles = useRoles();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get(endpoint, { params: { colid: global1.colid, ...filters } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(msg(err, `Unable to load ${title.toLowerCase()}`));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = async () => {
    try {
      setWorking(true);
      setError("");
      setMessage("");
      const url = editingId ? `${endpoint}/update` : endpoint;
      await ep1.post(url, { ...form, id: editingId, colid: global1.colid, user: global1.user });
      setMessage(editingId ? `${title} updated.` : `${title} saved.`);
      setEditingId("");
      setForm(blank);
      await loadRows();
    } catch (err) {
      setError(msg(err, `Unable to save ${title.toLowerCase()}`));
    } finally {
      setWorking(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()}?`)) return;
    try {
      setWorking(true);
      await ep1.post(`${endpoint}/delete`, { id: row._id, colid: global1.colid });
      setMessage(`${title} deleted.`);
      await loadRows();
    } catch (err) {
      setError(msg(err, `Unable to delete ${title.toLowerCase()}`));
    } finally {
      setWorking(false);
    }
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setWorking(true);
      const data = new FormData();
      data.append("file", file);
      data.append("colid", global1.colid);
      data.append("user", global1.user);
      const res = await ep1.post(`${endpoint}/bulkupload`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(`Bulk upload completed. Inserted: ${res.data?.inserted || 0}`);
      await loadRows();
    } catch (err) {
      setError(msg(err, "Bulk upload failed"));
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    ...columnsDef,
    { field: "status", headerName: "Status", minWidth: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      minWidth: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setEditingId(row._id); setForm({ ...blank, ...row }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title={title}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={900}>{title}</Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Autocomplete
                freeSolo
                options={roles}
                value={form.role || ""}
                onChange={(event, value) => setField("role", value || "")}
                onInputChange={(event, value) => setField("role", value || "")}
                renderInput={(params) => <TextField {...params} label="Role" />}
              />
            </Grid>
            {children({ form, setField })}
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                {statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} disabled={working} onClick={save}>{working ? "Saving..." : editingId ? "Update" : "Save"}</Button>
                <Button variant="outlined" onClick={() => { setEditingId(""); setForm(blank); }}>Clear</Button>
                <Button variant="outlined" startIcon={<FileDownload />} onClick={() => downloadXlsx(templateRows, `${title.toLowerCase().replaceAll(" ", "_")}_template.xlsx`, title)}>Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={working}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls" onChange={uploadExcel} /></Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <Autocomplete freeSolo options={roles} onInputChange={(event, value) => setFilters((p) => ({ ...p, role: value || "" }))} renderInput={(params) => <TextField {...params} label="Filter Role" />} sx={{ minWidth: 260 }} />
            <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} sx={{ minWidth: 150 }}><MenuItem value="">All</MenuItem>{statusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
            <Button variant="contained" startIcon={<Refresh />} disabled={loading} onClick={loadRows}>{loading ? "Loading..." : "Apply"}</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ height: 620 }}>
            <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading || working} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: title.toLowerCase().replaceAll(" ", "_") } } }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick />
          </Box>
        </Paper>
      </Container>
    </MenuPageShell>
  );
}

export function HrLatePolicyPage() {
  const columns = useMemo(() => [
    { field: "role", headerName: "Role", minWidth: 180, flex: 1 },
    { field: "fromdays", headerName: "From Days", minWidth: 130, type: "number" },
    { field: "todays", headerName: "To Days", minWidth: 130, type: "number" },
    { field: "dailysalarypercentage", headerName: "Daily Salary %", minWidth: 160, type: "number" }
  ], []);
  return (
    <PolicyShell
      title="Late Policy"
      subtitle="Define role-wise salary deduction percentage based on monthly late or early-exit count."
      blank={lateBlank}
      endpoint="/api/v2/hrattendance/late-policy"
      templateRows={[{ role: "Faculty", fromdays: 1, todays: 3, dailysalarypercentage: 0, status: "Active" }, { role: "Faculty", fromdays: 4, todays: 99, dailysalarypercentage: 25, status: "Active" }]}
      columnsDef={columns}
    >
      {({ form, setField }) => (
        <>
          <Grid item xs={12} md={2}><TextField fullWidth type="number" label="From Days" value={form.fromdays} onChange={(e) => setField("fromdays", e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="number" label="To Days" value={form.todays} onChange={(e) => setField("todays", e.target.value)} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Daily Salary %" value={form.dailysalarypercentage} onChange={(e) => setField("dailysalarypercentage", e.target.value)} /></Grid>
        </>
      )}
    </PolicyShell>
  );
}

export function HrOvertimePolicyPage() {
  const columns = useMemo(() => [
    { field: "role", headerName: "Role", minWidth: 180, flex: 1 },
    { field: "hourlyrate", headerName: "Hourly Rate", minWidth: 150, type: "number" }
  ], []);
  return (
    <PolicyShell
      title="Overtime Policy"
      subtitle="Define role-wise hourly overtime rates for approved attendance beyond shift end time."
      blank={overtimeBlank}
      endpoint="/api/v2/hrattendance/overtime-policy"
      templateRows={[{ role: "Faculty", hourlyrate: 300, status: "Active" }, { role: "Staff", hourlyrate: 150, status: "Active" }]}
      columnsDef={columns}
    >
      {({ form, setField }) => (
        <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Hourly Rate" value={form.hourlyrate} onChange={(e) => setField("hourlyrate", e.target.value)} /></Grid>
      )}
    </PolicyShell>
  );
}
