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
import ep1 from "../api/ep1";
import global1 from "./global1";
import MentoringLayout from "./MentoringLayout";

const blankForm = {
  academicyear: "",
  regulation: "",
  program: "",
  programcode: "",
  counselorname: "",
  counseloremail: "",
  status: "Active"
};

export default function CrmCounselorMappingPage() {
  const [rows, setRows] = useState([]);
  const [years, setYears] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions({});
    loadRows();
  }, []);

  useEffect(() => {
    loadOptions({ academicyear: form.academicyear, regulation: form.regulation });
  }, [form.academicyear, form.regulation]);

  const loadOptions = async (extra = {}) => {
    try {
      const res = await ep1.get("/api/v2/crm-counselor-mapping/options", {
        params: { colid: global1.colid, ...extra }
      });
      setYears(res.data?.academicyears || []);
      setRegulations(res.data?.regulations || []);
      setPrograms(res.data?.programs || []);
      setCounselors(res.data?.counselors || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load counselor mapping options.");
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/crm-counselor-mapping", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load counselor mappings.");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    let next = { ...form, [field]: value };
    if (field === "academicyear") next = { ...next, regulation: "", program: "", programcode: "" };
    if (field === "regulation") next = { ...next, program: "", programcode: "" };
    setForm(next);
  };

  const selectProgram = (value) => {
    const selected = programs.find((item) => `${item.programcode}||${item.program}` === value);
    setForm({
      ...form,
      program: selected?.program || "",
      programcode: selected?.programcode || ""
    });
  };

  const selectCounselor = (email) => {
    const selected = counselors.find((item) => item.email === email);
    setForm({
      ...form,
      counseloremail: selected?.email || "",
      counselorname: selected?.name || selected?.email || ""
    });
  };

  const saveMapping = async () => {
    try {
      setError("");
      if (!form.academicyear || !form.regulation || !form.program || !form.programcode || !form.counseloremail) {
        setError("Academic year, regulation, program and counselor are required.");
        return;
      }
      await ep1.post("/api/v2/crm-counselor-mapping", {
        ...form,
        id: editingId,
        colid: global1.colid,
        user: global1.user || global1.email || ""
      });
      setMessage(editingId ? "Counselor mapping updated." : "Counselor mapping saved.");
      setForm(blankForm);
      setEditingId("");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save counselor mapping.");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      academicyear: row.academicyear || "",
      regulation: row.regulation || "",
      program: row.program || "",
      programcode: row.programcode || "",
      counselorname: row.counselorname || "",
      counseloremail: row.counseloremail || "",
      status: row.status || "Active"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete mapping for ${row.program || row.programcode}?`)) return;
    try {
      await ep1.post("/api/v2/crm-counselor-mapping-delete", { id: row._id, colid: global1.colid });
      setMessage("Counselor mapping deleted.");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete counselor mapping.");
    }
  };

  const columns = useMemo(() => [
    { field: "academicyear", headerName: "Academic Year", minWidth: 150 },
    { field: "regulation", headerName: "Regulation", minWidth: 170 },
    { field: "program", headerName: "Program", minWidth: 220, flex: 1 },
    { field: "programcode", headerName: "Program Code", minWidth: 150 },
    { field: "counselorname", headerName: "Counselor Name", minWidth: 190 },
    { field: "counseloremail", headerName: "Counselor Email", minWidth: 230 },
    { field: "status", headerName: "Status", minWidth: 120 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row)}>Delete</Button>
        </Stack>
      )
    }
  ], []);

  return (
    <MentoringLayout title="Counselor Mapping">
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Counselor Mapping</Typography>
            <Typography color="text.secondary">Assign academic year, regulation and program combinations to counselors.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => updateForm("academicyear", e.target.value)} required>
              {years.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => updateForm("regulation", e.target.value)} required>
              {regulations.map((item) => <MenuItem key={item._id || item.regulation} value={item.regulation}>{item.regulation}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Program"
              value={form.programcode ? `${form.programcode}||${form.program}` : ""}
              onChange={(e) => selectProgram(e.target.value)}
              required
              disabled={!form.academicyear || !form.regulation}
            >
              {programs.map((item) => (
                <MenuItem key={`${item.programcode}||${item.program}`} value={`${item.programcode}||${item.program}`}>
                  {item.program} {item.programcode ? `(${item.programcode})` : ""}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Counselor" value={form.counseloremail} onChange={(e) => selectCounselor(e.target.value)} required>
              {counselors.map((item) => (
                <MenuItem key={item._id || item.email} value={item.email}>
                  {item.name || item.email} {item.email ? `(${item.email})` : ""}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={1}>
            <TextField select fullWidth label="Status" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={saveMapping}>
              {editingId ? "Update" : "Save"}
            </Button>
          </Grid>
          {editingId && (
            <Grid item xs={12} md={1}>
              <Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => { setEditingId(""); setForm(blankForm); }}>Cancel</Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Box sx={{ height: 610, width: "100%" }}>
          <DataGrid
            rows={rows}
            getRowId={(row) => row._id}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "counselor_mapping" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </MentoringLayout>
  );
}
