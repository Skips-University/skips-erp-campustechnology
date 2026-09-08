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

const leadStatusList = ["Active", "Converted", "Lost"];
const userEmail = () => global1.email || global1.user || "";

const dateText = (date) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
};

const initialRange = () => {
  const today = new Date();
  const nextThree = new Date();
  nextThree.setDate(today.getDate() + 3);
  return { fromDate: dateText(today), toDate: dateText(nextThree) };
};

export default function CrmMyFollowupsPage() {
  const [rows, setRows] = useState([]);
  const [stages, setStages] = useState([]);
  const [sources, setSources] = useState([]);
  const [filters, setFilters] = useState({ ...initialRange(), search: "", source: "", pipeline_stage: "", leadstatus: "" });
  const [selectedLead, setSelectedLead] = useState(null);
  const [statusForm, setStatusForm] = useState({ pipeline_stage: "", leadstatus: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
    loadFollowups();
  }, []);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/crm-management/options", { params: { colid: global1.colid } });
      setStages(res.data?.stages || []);
      setSources(res.data?.sources || []);
    } catch (err) {
      setError("Unable to load CRM options.");
    }
  };

  const loadFollowups = async () => {
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/crm-management/my-followups", {
        ...filters,
        colid: global1.colid,
        assignedto: userEmail()
      });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your follow-ups.");
    } finally {
      setLoading(false);
    }
  };

  const selectLead = (row) => {
    setSelectedLead(row);
    setStatusForm({
      pipeline_stage: row.pipeline_stage || "",
      leadstatus: row.leadstatus || "Active"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateStatus = async () => {
    if (!selectedLead?._id) {
      setError("Select a follow-up first.");
      return;
    }
    await ep1.post("/api/v2/crm-management/my-leads-status", {
      ...statusForm,
      id: selectedLead._id,
      colid: global1.colid,
      assignedto: userEmail()
    });
    setMessage("Lead stage and status updated.");
    setSelectedLead(null);
    setStatusForm({ pipeline_stage: "", leadstatus: "" });
    loadFollowups();
  };

  const columns = useMemo(() => [
    { field: "next_followup_date", headerName: "Next Follow-up", minWidth: 150, valueGetter: ({ row }) => row.next_followup_date ? String(row.next_followup_date).slice(0, 10) : "" },
    { field: "name", headerName: "Lead", minWidth: 180, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 190 },
    { field: "course_interested", headerName: "Course Interested", minWidth: 190 },
    { field: "source", headerName: "Source", minWidth: 140 },
    { field: "pipeline_stage", headerName: "Pipeline Stage", minWidth: 180 },
    { field: "leadstatus", headerName: "Lead Status", minWidth: 140 },
    { field: "fcomments", headerName: "Follow-up Comments", minWidth: 220, flex: 1 },
    {
      field: "select",
      headerName: "Update",
      width: 120,
      sortable: false,
      renderCell: (params) => <Button size="small" onClick={() => selectLead(params.row)}>Select</Button>
    }
  ], []);

  return (
    <MentoringLayout title="My Followup">
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>My Followup</Typography>
            <Typography color="text.secondary">Follow-ups assigned to you within the selected next follow-up date range.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          {selectedLead ? `Update: ${selectedLead.name}` : "Update Selected Lead"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth label="Pipeline Stage" value={statusForm.pipeline_stage} onChange={(e) => setStatusForm({ ...statusForm, pipeline_stage: e.target.value })}>
              {stages.map((item) => <MenuItem key={item._id} value={item.stagename}>{item.stagename}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth label="Lead Status" value={statusForm.leadstatus} onChange={(e) => setStatusForm({ ...statusForm, leadstatus: e.target.value })}>
              {leadStatusList.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" sx={{ height: 56 }} disabled={!selectedLead} onClick={updateStatus}>Update</Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => { setSelectedLead(null); setStatusForm({ pipeline_stage: "", leadstatus: "" }); }}>Cancel</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="date" label="From Date" InputLabelProps={{ shrink: true }} value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="date" label="To Date" InputLabelProps={{ shrink: true }} value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Source" value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
              <MenuItem value="">All</MenuItem>
              {sources.map((item) => <MenuItem key={item._id} value={item.source_name}>{item.source_name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Pipeline Stage" value={filters.pipeline_stage} onChange={(e) => setFilters({ ...filters, pipeline_stage: e.target.value })}>
              <MenuItem value="">All</MenuItem>
              {stages.map((item) => <MenuItem key={item._id} value={item.stagename}>{item.stagename}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={1.2}>
            <TextField select fullWidth label="Lead Status" value={filters.leadstatus} onChange={(e) => setFilters({ ...filters, leadstatus: e.target.value })}>
              <MenuItem value="">All</MenuItem>
              {leadStatusList.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={0.8}>
            <Button fullWidth variant="contained" sx={{ height: 56 }} onClick={loadFollowups}>Load</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Box sx={{ height: 620, width: "100%" }}>
          <DataGrid
            rows={rows}
            getRowId={(row) => row._id}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_crm_followups" } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </MentoringLayout>
  );
}
