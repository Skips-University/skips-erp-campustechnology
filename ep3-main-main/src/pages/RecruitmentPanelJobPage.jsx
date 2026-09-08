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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = { id: "", panelid: "", panelname: "", jobid: "", jobtitle: "", department: "", status: "Active", remarks: "" };

export default function RecruitmentPanelJobPage() {
  const [panels, setPanels] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const colid = global1.colid;

  const panelOptions = useMemo(() => panels.map((panel) => ({ ...panel, label: `${panel.panelid} - ${panel.panelname}` })), [panels]);
  const jobOptions = useMemo(() => jobs.map((job) => ({ ...job, label: `${job.jobid} - ${job.title}` })), [jobs]);

  const loadMasters = async () => {
    const [panelRes, jobRes] = await Promise.all([
      ep1.get("/api/v2/recruitment/interview-panels", { params: { colid, status: "Active" } }),
      ep1.get("/api/v2/recruitment/jobs", { params: { colid } })
    ]);
    setPanels(panelRes.data || []);
    setJobs(jobRes.data || []);
  };

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/recruitment/panel-jobs", { params: { colid } });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load panel job assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMasters(); loadRows(); }, []);

  const saveAssignment = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/recruitment/panel-jobs", { ...form, colid, user: global1.user });
      setForm(blankForm);
      setMessage("Panel assigned to job");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const deleteAssignment = async (row) => {
    if (!window.confirm(`Remove panel ${row.panelname} from ${row.jobtitle}?`)) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/recruitment/panel-jobs-delete", { colid, id: row._id });
      setMessage("Assignment deleted");
      loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete assignment");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "panelid", headerName: "Panel ID", minWidth: 140, flex: 0.7 },
    { field: "panelname", headerName: "Panel", minWidth: 200, flex: 1 },
    { field: "jobid", headerName: "Job ID", minWidth: 140, flex: 0.7 },
    { field: "jobtitle", headerName: "Job Title", minWidth: 220, flex: 1.2 },
    { field: "department", headerName: "Department", minWidth: 160, flex: 0.8 },
    { field: "status", headerName: "Status", minWidth: 120, flex: 0.6 },
    { field: "remarks", headerName: "Remarks", minWidth: 220, flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ ...blankForm, ...row, id: row._id })} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteAssignment(row)} showInMenu />
      ]
    }
  ];

  return (
    <MenuPageShell title="Assign Panel To Job">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Assign Interview Panel To Job Posting</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select a panel and map it to any recruitment job posting.</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={panelOptions}
                value={panelOptions.find((panel) => panel.panelid === form.panelid) || null}
                getOptionLabel={(option) => option.label || ""}
                onChange={(_, value) => setForm({ ...form, panelid: value?.panelid || "", panelname: value?.panelname || "" })}
                renderInput={(params) => <TextField {...params} label="Search/select panel" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={jobOptions}
                value={jobOptions.find((job) => job.jobid === form.jobid) || null}
                getOptionLabel={(option) => option.label || ""}
                onChange={(_, value) => setForm({ ...form, jobid: value?.jobid || "", jobtitle: value?.title || "", department: value?.department || "" })}
                renderInput={(params) => <TextField {...params} label="Search/select job posting" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["Active", "Inactive"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={saveAssignment} disabled={saving}>{form.id ? "Update" : "Assign"}</Button>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ height: 540 }}>
            <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} slots={{ toolbar: GridToolbar }} />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
