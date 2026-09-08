import React, { useEffect, useState } from "react";
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
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = { id: "", panelid: "", panelname: "", description: "", status: "Active" };

export default function RecruitmentInterviewPanelPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const colid = global1.colid;

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/recruitment/interview-panels", { params: { colid } });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load panels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const savePanel = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/recruitment/interview-panels", {
        ...form,
        colid,
        user: global1.user,
        createdByName: global1.name
      });
      setForm(blankForm);
      setMessage("Panel saved");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save panel");
    } finally {
      setSaving(false);
    }
  };

  const deletePanel = async (row) => {
    if (!window.confirm(`Delete ${row.panelname}? Panel members and job mappings will also be removed.`)) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/recruitment/interview-panels-delete", { colid, id: row._id });
      setMessage("Panel deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete panel");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "panelid", headerName: "Panel ID", minWidth: 150, flex: 0.8 },
    { field: "panelname", headerName: "Panel Name", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 280, flex: 1.4 },
    { field: "status", headerName: "Status", minWidth: 130, flex: 0.6 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ id: row._id, panelid: row.panelid || "", panelname: row.panelname || "", description: row.description || "", status: row.status || "Active" })} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deletePanel(row)} showInMenu />
      ]
    }
  ];

  return (
    <MenuPageShell title="Interview Panels">
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Interview Panel Master</Typography>
            <Typography variant="body2" color="text.secondary">Create interview panels for recruitment job postings.</Typography>
          </Box>
          <Button variant="outlined" onClick={loadRows} disabled={loading}>Refresh</Button>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Panel ID" value={form.panelid} onChange={(e) => setForm({ ...form, panelid: e.target.value })} helperText="Leave blank for auto ID" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="Panel Name" value={form.panelname} onChange={(e) => setForm({ ...form, panelname: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button fullWidth variant="contained" startIcon={form.id ? <SaveIcon /> : <AddIcon />} onClick={savePanel} disabled={saving}>{form.id ? "Update" : "Create"}</Button>
                {form.id && <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => setForm(blankForm)}>Cancel</Button>}
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ height: 520 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              slots={{ toolbar: GridToolbar }}
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
