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

const categoryList = ["General", "SC", "ST", "OBC", "Others"];
const leadStatusList = ["Active", "Converted", "Lost"];
const defaultYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const userEmail = () => global1.email || global1.user || "";

const blankLead = {
  year: "2026-27",
  name: "",
  phone: "",
  email: "",
  category: "",
  course_interested: "",
  source: "",
  pipeline_stage: "New Lead",
  leadstatus: "Active",
  city: "",
  state: "",
  comments: ""
};

export default function CrmMyLeadsPage() {
  const [rows, setRows] = useState([]);
  const [sources, setSources] = useState([]);
  const [stages, setStages] = useState([]);
  const [programYears, setProgramYears] = useState(defaultYears);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(blankLead);
  const [filters, setFilters] = useState({ search: "", year: "", source: "", pipeline_stage: "", leadstatus: "" });
  const [selectedLead, setSelectedLead] = useState(null);
  const [statusForm, setStatusForm] = useState({ pipeline_stage: "", leadstatus: "", next_followup_date: "", comments: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadLeads();
  }, []);

  useEffect(() => {
    loadPrograms(form.year);
  }, [form.year]);

  const loadOptions = async () => {
    try {
      const [crmRes, programRes] = await Promise.all([
        ep1.get("/api/v2/crm-management/options", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/mprograms-management/options", { params: { colid: global1.colid } })
      ]);
      setSources(crmRes.data?.sources || []);
      setStages(crmRes.data?.stages || []);
      const years = [...new Set([...(programRes.data?.years || []), ...defaultYears])].filter(Boolean).sort();
      setProgramYears(years);
    } catch (err) {
      setError("Unable to load CRM options.");
    }
  };

  const loadPrograms = async (year) => {
    if (!year) return setPrograms([]);
    const res = await ep1.get("/api/v2/mprograms-management", { params: { colid: global1.colid, year } });
    setPrograms(res.data?.data || []);
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const payload = { ...filters, colid: global1.colid, assignedto: userEmail() };
      const res = await ep1.post("/api/v2/crm-management/my-leads", payload);
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your leads.");
    } finally {
      setLoading(false);
    }
  };

  const addLead = async () => {
    if (!form.name || !form.category || !form.source) {
      setError("Name, category and source are required.");
      return;
    }
    await ep1.post("/api/v2/crm-management/my-leads-create", {
      ...form,
      colid: global1.colid,
      user: userEmail(),
      assignedto: userEmail()
    });
    setMessage("Lead added and assigned to you.");
    setForm(blankLead);
    loadLeads();
  };

  const selectLead = (row) => {
    setSelectedLead(row);
    setStatusForm({
      pipeline_stage: row.pipeline_stage || "",
      leadstatus: row.leadstatus || "Active",
      next_followup_date: row.next_followup_date ? String(row.next_followup_date).slice(0, 10) : "",
      comments: row.comments || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateStatus = async () => {
    if (!selectedLead?._id) {
      setError("Select a lead first.");
      return;
    }
    await ep1.post("/api/v2/crm-management/my-leads-status", {
      ...statusForm,
      id: selectedLead._id,
      colid: global1.colid,
      assignedto: userEmail()
    });
    setMessage("Lead status updated.");
    setSelectedLead(null);
    setStatusForm({ pipeline_stage: "", leadstatus: "", next_followup_date: "", comments: "" });
    loadLeads();
  };

  const columns = useMemo(() => [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 190 },
    { field: "year", headerName: "Year", minWidth: 120 },
    { field: "category", headerName: "Category", minWidth: 130 },
    { field: "course_interested", headerName: "Course Interested", minWidth: 190 },
    { field: "source", headerName: "Source", minWidth: 140 },
    { field: "pipeline_stage", headerName: "Pipeline Stage", minWidth: 180 },
    { field: "leadstatus", headerName: "Lead Status", minWidth: 140 },
    { field: "followupdate", headerName: "Follow-up", minWidth: 140, valueGetter: ({ row }) => row.followupdate ? String(row.followupdate).slice(0, 10) : "" },
    { field: "next_followup_date", headerName: "Next Follow-up", minWidth: 150, valueGetter: ({ row }) => row.next_followup_date ? String(row.next_followup_date).slice(0, 10) : "" },
    { field: "comments", headerName: "Comments", minWidth: 220, flex: 1 },
    { field: "updatedAt", headerName: "Updated", minWidth: 130, valueGetter: ({ row }) => row.updatedAt ? String(row.updatedAt).slice(0, 10) : "" },
    {
      field: "select",
      headerName: "Update",
      width: 120,
      sortable: false,
      renderCell: (params) => <Button size="small" onClick={() => selectLead(params.row)}>Select</Button>
    }
  ], []);

  return (
    <MentoringLayout title="My Leads">
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>My Leads</Typography>
            <Typography color="text.secondary">View leads assigned to you, add new leads, and update stage/status.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Add Lead</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value, course_interested: "" })}>{programYears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2.5}><TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
          <Grid item xs={12} md={2.5}><TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categoryList.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><TextField select fullWidth label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>{sources.map((item) => <MenuItem key={item._id} value={item.source_name}>{item.source_name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Course interested" value={form.course_interested} onChange={(e) => setForm({ ...form, course_interested: e.target.value })}>{programs.map((item) => <MenuItem key={item._id} value={item.program}>{item.program}{item.programcode ? ` (${item.programcode})` : ""}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Pipeline Stage" value={form.pipeline_stage} onChange={(e) => setForm({ ...form, pipeline_stage: e.target.value })}>{stages.map((item) => <MenuItem key={item._id} value={item.stagename}>{item.stagename}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Lead Status" value={form.leadstatus} onChange={(e) => setForm({ ...form, leadstatus: e.target.value })}>{leadStatusList.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={addLead}>Add Lead</Button></Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>{selectedLead ? `Update: ${selectedLead.name}` : "Update Selected Lead"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Pipeline Stage" value={statusForm.pipeline_stage} onChange={(e) => setStatusForm({ ...statusForm, pipeline_stage: e.target.value })}>{stages.map((item) => <MenuItem key={item._id} value={item.stagename}>{item.stagename}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2.5}><TextField select fullWidth label="Lead Status" value={statusForm.leadstatus} onChange={(e) => setStatusForm({ ...statusForm, leadstatus: e.target.value })}>{leadStatusList.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2.5}><TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Next follow-up date" value={statusForm.next_followup_date} onChange={(e) => setStatusForm({ ...statusForm, next_followup_date: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Comments" value={statusForm.comments} onChange={(e) => setStatusForm({ ...statusForm, comments: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} disabled={!selectedLead} onClick={updateStatus}>Update</Button></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => { setSelectedLead(null); setStatusForm({ pipeline_stage: "", leadstatus: "", next_followup_date: "", comments: "" }); }}>Cancel</Button></Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.5}><TextField fullWidth label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}><MenuItem value="">All</MenuItem>{programYears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Source" value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}><MenuItem value="">All</MenuItem>{sources.map((item) => <MenuItem key={item._id} value={item.source_name}>{item.source_name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Pipeline Stage" value={filters.pipeline_stage} onChange={(e) => setFilters({ ...filters, pipeline_stage: e.target.value })}><MenuItem value="">All</MenuItem>{stages.map((item) => <MenuItem key={item._id} value={item.stagename}>{item.stagename}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Lead Status" value={filters.leadstatus} onChange={(e) => setFilters({ ...filters, leadstatus: e.target.value })}><MenuItem value="">All</MenuItem>{leadStatusList.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={loadLeads}>Search</Button></Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Box sx={{ height: 590 }}>
          <DataGrid
            rows={rows}
            getRowId={(row) => row._id}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_crm_leads" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </MentoringLayout>
  );
}
