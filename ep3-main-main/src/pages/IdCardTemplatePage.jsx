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
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blank = {
  templatename: "",
  description: "",
  orientation: "Portrait",
  isdefault: "No",
  status: "Active",
  html: ""
};

const placeholderHelp = "{{name}}, {{email}}, {{phone}}, {{regno}}, {{program}}, {{institution}}, {{logo}}, {{photo}}, {{address}}, {{studentaddress}}";

export default function IdCardTemplatePage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/id-card/templates", { params: { colid: global1.colid, user: global1.user } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ID card templates");
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const saveTemplate = async () => {
    if (!form.templatename || !form.html) {
      setError("Template name and HTML are required.");
      return;
    }
    try {
      setError("");
      await ep1.post("/api/v2/id-card/templates", { ...form, id: editId, colid: global1.colid, user: global1.user });
      setMessage(editId ? "Template updated." : "Template saved.");
      setForm(blank);
      setEditId("");
      loadTemplates();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save template");
    }
  };

  const editTemplate = (row) => {
    setEditId(row._id);
    setForm({
      templatename: row.templatename || "",
      description: row.description || "",
      orientation: row.orientation || "Portrait",
      isdefault: row.isdefault || "No",
      status: row.status || "Active",
      html: row.html || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTemplate = async (row) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await ep1.post("/api/v2/id-card/templates-delete", { id: row._id, colid: global1.colid });
      setMessage("Template deleted.");
      loadTemplates();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete template");
    }
  };

  const uploadHtml = async (file) => {
    if (!file) return;
    const html = await file.text();
    setForm((prev) => ({
      ...prev,
      templatename: prev.templatename || file.name.replace(/\.[^.]+$/, ""),
      html
    }));
  };

  const columns = useMemo(() => [
    {
      field: "actions",
      type: "actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => editTemplate(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteTemplate(params.row)} />
      ]
    },
    { field: "templatename", headerName: "Template Name", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1 },
    { field: "orientation", headerName: "Orientation", minWidth: 130 },
    { field: "isdefault", headerName: "Default", minWidth: 110 },
    { field: "status", headerName: "Status", minWidth: 110 },
    { field: "updatedAt", headerName: "Updated", minWidth: 170, valueGetter: ({ row }) => row.updatedAt ? String(row.updatedAt).slice(0, 10) : "" }
  ], []);

  return (
    <MenuPageShell title="ID Card Templates">
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>ID Card HTML Templates</Typography>
              <Typography color="text.secondary">Upload or paste HTML. Ten default templates are created automatically.</Typography>
            </Box>
            <Button startIcon={<Refresh />} variant="outlined" onClick={loadTemplates}>Reload</Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Template Name" value={form.templatename} onChange={(e) => update("templatename", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Description" value={form.description} onChange={(e) => update("description", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Orientation" value={form.orientation} onChange={(e) => update("orientation", e.target.value)}>
                <MenuItem value="Portrait">Portrait</MenuItem>
                <MenuItem value="Landscape">Landscape</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField select fullWidth label="Default" value={form.isdefault} onChange={(e) => update("isdefault", e.target.value)}>
                <MenuItem value="No">No</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={12}
                label="HTML Template"
                value={form.html}
                onChange={(e) => update("html", e.target.value)}
                helperText={`Available placeholders: ${placeholderHelp}. Custom user fields can also be used as {{fieldname}}.`}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="contained" startIcon={<Save />} onClick={saveTemplate}>{editId ? "Update Template" : "Save Template"}</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                  Upload HTML
                  <input hidden type="file" accept=".html,.htm,.txt" onChange={(e) => uploadHtml(e.target.files?.[0])} />
                </Button>
                {editId && <Button onClick={() => { setEditId(""); setForm(blank); }}>Cancel Edit</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 560 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "id_card_templates" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
