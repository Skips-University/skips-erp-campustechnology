import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = { country: "", state: "", district: "", isactive: "Yes" };

export default function AdmissionAddressConfigurationPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    try {
      const res = await ep1.get("/admission-address-configuration", { params: { colid: global1.colid } });
      setRows(res.data || []);
    } catch (err) {
      setError("Unable to load address configuration.");
    }
  };

  const saveRow = async () => {
    if (!form.country || !form.state || !form.district) {
      setError("Country, state and district are required.");
      return;
    }
    setError("");
    const payload = { ...form, id: editId, colid: global1.colid, user: global1.user };
    await ep1.post(editId ? "/admission-address-configuration-update" : "/admission-address-configuration", payload);
    setMessage(editId ? "Address configuration updated." : "Address configuration added.");
    setForm(emptyForm);
    setEditId("");
    loadRows();
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      country: row.country || "",
      state: row.state || "",
      district: row.district || "",
      isactive: row.isactive || "Yes"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this address configuration?")) return;
    await ep1.post("/admission-address-configuration-delete", { id, colid: global1.colid });
    setMessage("Address configuration deleted.");
    loadRows();
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { country: "India", state: "West Bengal", district: "Kolkata", isactive: "Yes" },
      { country: "India", state: "West Bengal", district: "Howrah", isactive: "Yes" }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Address Configuration");
    XLSX.writeFile(workbook, "admission_address_configuration_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({
        rowNumber: index + 2,
        country: row.country || row.Country || "",
        state: row.state || row.State || "",
        district: row.district || row.District || "",
        isactive: row.isactive || row.Active || "Yes"
      }));
      const res = await ep1.post("/admission-address-configuration-bulk", { colid: global1.colid, user: global1.user, items });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.saved || 0} rows uploaded${errors.length ? `, ${errors.length} skipped` : ""}.`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload address configuration.");
    }
  };

  const columns = useMemo(() => [
    { field: "country", headerName: "Country", minWidth: 180, flex: 1 },
    { field: "state", headerName: "State", minWidth: 180, flex: 1 },
    { field: "district", headerName: "District", minWidth: 180, flex: 1 },
    { field: "isactive", headerName: "Active", width: 110 },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button>
        </Stack>
      )
    }
  ], []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Address Configuration</Typography>
            <Typography color="text.secondary">Configure country, state and district values for admission forms.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
            <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
            <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
              Bulk Upload
              <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 2.5, mb: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></Grid>
          <Grid item xs={12} md={1.5}>
            <TextField select fullWidth label="Active" value={form.isactive} onChange={(e) => setForm({ ...form, isactive: e.target.value })}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Button fullWidth variant="contained" onClick={saveRow} sx={{ height: 56 }}>{editId ? "Update" : "Add"}</Button>
          </Grid>
          {editId && (
            <Grid item xs={12} md={1.5}>
              <Button fullWidth variant="outlined" onClick={() => { setEditId(""); setForm(emptyForm); }} sx={{ height: 56 }}>Cancel</Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e7eb" }}>
        <Box sx={{ height: 560 }}>
          <DataGrid
            rows={rows}
            getRowId={(row) => row._id}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </Box>
  );
}
