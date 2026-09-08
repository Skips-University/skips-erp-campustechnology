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

const actionBlank = { pipeline_stage: "", followupdate: "", next_followup_date: "", assignedto: "", fcomments: "" };

export default function CrmLeadActionPage() {
  const [options, setOptions] = useState({ sources: [], stages: [], users: [], leadOptions: {} });
  const [filters, setFilters] = useState({ search: "", source: "", pipeline_stage: "", assignedto: "" });
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [action, setAction] = useState(actionBlank);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    searchLeads();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/crm-management/options", { params: { colid: global1.colid } });
    setOptions({
      sources: res.data?.sources || [],
      stages: res.data?.stages || [],
      users: res.data?.users || [],
      leadOptions: res.data?.leadOptions || {}
    });
  };

  const searchLeads = async (nextFilters = filters, nextPagination = paginationModel) => {
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/crm-management/leads/search", {
        ...nextFilters,
        colid: global1.colid,
        page: nextPagination.page,
        limit: Math.min(100, nextPagination.pageSize)
      });
      setRows(res.data?.data || []);
      setRowCount(res.data?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const nextPagination = { ...paginationModel, page: 0, pageSize: Math.min(100, paginationModel.pageSize) };
    setPaginationModel(nextPagination);
    searchLeads(filters, nextPagination);
  };

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setAction({
      pipeline_stage: lead.pipeline_stage || "",
      followupdate: lead.followupdate ? String(lead.followupdate).slice(0, 10) : "",
      next_followup_date: lead.next_followup_date ? String(lead.next_followup_date).slice(0, 10) : "",
      assignedto: lead.assignedto || "",
      fcomments: lead.fcomments || ""
    });
  };

  const updateLead = async () => {
    if (!selectedLead?._id) return setError("Select a lead first.");
    await ep1.post("/api/v2/crm-management/leads-action", { ...action, id: selectedLead._id, colid: global1.colid });
    setMessage("Lead updated.");
    setSelectedLead(null);
    setAction(actionBlank);
    searchLeads(filters, paginationModel);
  };

  const columns = useMemo(() => [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 180 },
    { field: "source", headerName: "Source", minWidth: 140 },
    { field: "pipeline_stage", headerName: "Stage", minWidth: 170 },
    { field: "assignedto", headerName: "Assigned To", minWidth: 190 },
    { field: "followupdate", headerName: "Followup", minWidth: 130, valueGetter: ({ row }) => row.followupdate ? String(row.followupdate).slice(0, 10) : "" },
    {
      field: "select",
      headerName: "Select",
      width: 110,
      sortable: false,
      renderCell: (params) => <Button size="small" onClick={() => selectLead(params.row)}>Select</Button>
    }
  ], []);

  return (
    <MentoringLayout title="CRM Lead Updates">
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Lead Follow-up and Assignment</Typography>
            <Typography color="text.secondary">Search a lead, select it, then update stage, follow-up or counselor.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth label="Search lead" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Source" value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}><MenuItem value="">All</MenuItem>{options.sources.map((x) => <MenuItem key={x._id} value={x.source_name}>{x.source_name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><TextField select fullWidth label="Stage" value={filters.pipeline_stage} onChange={(e) => setFilters({ ...filters, pipeline_stage: e.target.value })}><MenuItem value="">All</MenuItem>{options.stages.map((x) => <MenuItem key={x._id} value={x.stagename}>{x.stagename}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Assigned to" value={filters.assignedto} onChange={(e) => setFilters({ ...filters, assignedto: e.target.value })}><MenuItem value="">All</MenuItem>{options.users.map((x) => <MenuItem key={x._id} value={x.email}>{x.name} ({x.email})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={applyFilters}>Search</Button></Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Typography fontWeight={800} sx={{ mb: 1 }}>{selectedLead ? `Selected: ${selectedLead.name}` : "No lead selected"}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.4}><TextField select fullWidth label="Pipeline stage" value={action.pipeline_stage} onChange={(e) => setAction({ ...action, pipeline_stage: e.target.value })}>{options.stages.map((x) => <MenuItem key={x._id} value={x.stagename}>{x.stagename}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2.4}><TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Follow-up date" value={action.followupdate} onChange={(e) => setAction({ ...action, followupdate: e.target.value })} /></Grid>
          <Grid item xs={12} md={2.4}><TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Next follow-up date" value={action.next_followup_date} onChange={(e) => setAction({ ...action, next_followup_date: e.target.value })} /></Grid>
          <Grid item xs={12} md={2.4}><TextField select fullWidth label="Assigned to" value={action.assignedto} onChange={(e) => setAction({ ...action, assignedto: e.target.value })}>{options.users.map((x) => <MenuItem key={x._id} value={x.email}>{x.name} ({x.email})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={2.4}><Button fullWidth variant="contained" sx={{ height: 56 }} disabled={!selectedLead} onClick={updateLead}>Update Lead</Button></Grid>
          <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Follow-up comments" value={action.fcomments} onChange={(e) => setAction({ ...action, fcomments: e.target.value })} /></Grid>
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
            pageSizeOptions={[25, 50, 100]}
            paginationMode="server"
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={(model) => {
              const nextPagination = { page: model.page, pageSize: Math.min(100, model.pageSize) };
              setPaginationModel(nextPagination);
              searchLeads(filters, nextPagination);
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </MentoringLayout>
  );
}
