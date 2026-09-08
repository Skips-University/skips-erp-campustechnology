import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blank = { id: "", role: "Student", title: "Data processing consent", content: "", status: "Active" };
const roles = ["All", "Student", "Faculty", "Admin", "All Staff", "Non Student"];

export default function UserConsentContentPage() {
  const [form, setForm] = useState(blank);
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/user-consent-contents", { params: { colid: global1.colid } });
      setRows(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load consent content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const save = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-consent-contents", {
        ...form,
        colid: global1.colid,
        user: global1.user
      });
      setMessage("Consent content saved");
      setForm(blank);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save consent content");
    } finally {
      setLoading(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete consent content for ${row.role}?`)) return;
    try {
      setLoading(true);
      await ep1.post("/api/v2/user-consent-contents-delete", { colid: global1.colid, id: row._id });
      setMessage("Consent content deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete consent content");
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) {
      setError("Select at least one row to delete");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} selected consent content row(s)?`)) return;
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/user-consent-contents-bulk-delete", { colid: global1.colid, ids: selectedIds });
      setMessage(`Deleted ${res.data?.deleted || 0} row(s)`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete selected content");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    { field: "role", headerName: "Role", width: 150 },
    { field: "title", headerName: "Title", width: 240 },
    { field: "status", headerName: "Status", width: 130 },
    { field: "content", headerName: "Content", width: 520 },
    { field: "updatedAt", headerName: "Updated", width: 180, valueGetter: (params) => params.row.updatedAt ? new Date(params.row.updatedAt).toLocaleString() : "" },
    {
      field: "actions",
      headerName: "Actions",
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => setForm({ id: params.row._id, role: params.row.role || "", title: params.row.title || "", content: params.row.content || "", status: params.row.status || "Active" })}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ], []);

  return (
    <MenuPageShell title="Consent Form Setup">
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Consent Form Setup</Typography>
            <Typography color="text.secondary">Create role-wise consent content for data processing. If no active content exists, the consent page uses a standard compliance notice.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadRows}>Refresh</Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} disabled={!selectedIds.length} onClick={bulkDelete}>Delete Selected ({selectedIds.length})</Button>
          </Stack>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField select SelectProps={{ native: false }} fullWidth label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                {roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth sx={{ height: 56 }} variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={loading}>Save</Button>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={8} label="Consent content" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid
            rows={rows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            checkboxSelection
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={(selection) => setSelectedIds(Array.from(selection))}
            disableRowSelectionOnClick
            loading={loading}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "consent_content" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            sx={{ minWidth: 1450 }}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
