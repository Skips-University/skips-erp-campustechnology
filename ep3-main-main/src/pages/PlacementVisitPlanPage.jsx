import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ep1 from "../api/ep1";
import global1 from "./global1";
import PlacementCoordinatorShell from "./PlacementCoordinatorShell";

const today = () => new Date().toISOString().slice(0, 10);

export default function PlacementVisitPlanPage() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ planneddate: today(), comments: "", description: "" });
  const [workForm, setWorkForm] = useState({ id: "", workdone: "", nextfollowupdate: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const colid = global1.colid;

  const loadAll = async () => {
    const [leadRes, userRes, planRes] = await Promise.all([
      ep1.get("/api/v2/placement-leads", { params: { colid } }),
      ep1.get("/api/v2/placement-users", { params: { colid } }),
      ep1.get("/api/v2/placement-visit-plans", { params: { colid } })
    ]);
    setLeads(leadRes.data || []);
    setUsers(userRes.data || []);
    setPlans(planRes.data || []);
    const current = (userRes.data || []).find((u) => u.email === global1.user);
    if (current) setSelectedUser(current);
  };

  useEffect(() => {
    loadAll().catch((err) => setError(err.response?.data?.msg || err.message));
  }, []);

  const createPlan = async () => {
    try {
      setError("");
      if (!selectedLead?._id) return setError("Select a placement lead");
      if (!form.planneddate) return setError("Select planned date");
      await ep1.post("/api/v2/placement-visit-plans", {
        colid,
        leadid: selectedLead._id,
        assigneduser: selectedUser?.email || global1.user,
        assignedname: selectedUser?.name || global1.name,
        planneddate: form.planneddate,
        comments: form.comments,
        description: form.description,
        user: global1.user
      });
      setMessage("Visit plan added");
      setSelectedLead(null);
      setForm({ planneddate: today(), comments: "", description: "" });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to add visit plan");
    }
  };

  const startWorkEdit = (row) => {
    setWorkForm({
      id: row._id,
      workdone: row.workdone || "",
      nextfollowupdate: row.nextfollowupdate ? String(row.nextfollowupdate).slice(0, 10) : ""
    });
  };

  const updateWork = async () => {
    try {
      setError("");
      if (!workForm.id) return setError("Select a visit plan to update");
      await ep1.post("/api/v2/placement-visit-plans-update-work", {
        colid,
        id: workForm.id,
        workdone: workForm.workdone,
        nextfollowupdate: workForm.nextfollowupdate
      });
      setMessage("Work update saved");
      setWorkForm({ id: "", workdone: "", nextfollowupdate: "" });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update visit plan");
    }
  };

  const gridRows = useMemo(() => plans.map((row) => ({
    ...row,
    planneddate_display: row.planneddate ? String(row.planneddate).slice(0, 10) : "",
    nextfollowupdate_display: row.nextfollowupdate ? String(row.nextfollowupdate).slice(0, 10) : ""
  })), [plans]);

  const columns = [
    { field: "planneddate_display", headerName: "Planned Date", width: 130 },
    { field: "companyname", headerName: "Company", width: 210 },
    { field: "leadname", headerName: "Lead", width: 160 },
    { field: "leademail", headerName: "Email", width: 210 },
    { field: "leadphone", headerName: "Phone", width: 140 },
    { field: "assignedname", headerName: "User", width: 170 },
    { field: "comments", headerName: "Comments", width: 220 },
    { field: "description", headerName: "Description", width: 260 },
    { field: "workdone", headerName: "Work Done", width: 240 },
    { field: "nextfollowupdate_display", headerName: "Next Follow Up", width: 140 },
    {
      field: "actions",
      headerName: "Update",
      width: 100,
      renderCell: ({ row }) => (
        <IconButton color="primary" size="small" onClick={() => startWorkEdit(row)}>
          <EditIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <PlacementCoordinatorShell title="Placement Visit Plan">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Placement Visit Plan</Typography>
            <Typography variant="body2" color="text.secondary">Select a placement lead, assign a user, and schedule planned visits.</Typography>
          </Box>
          <Chip label={`Plans ${plans.length}`} color="primary" variant="outlined" />
        </Stack>
        {message && <Alert severity="success" sx={{ mt: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>{error}</Alert>}
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        <Typography variant="h6" fontWeight={800}>Create visit plan</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={leads}
              value={selectedLead}
              onChange={(e, value) => setSelectedLead(value)}
              getOptionLabel={(option) => option ? `${option.companyname || ""} - ${option.leadname || ""}` : ""}
              renderInput={(params) => <TextField {...params} size="small" label="Placement lead" />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={users}
              value={selectedUser}
              onChange={(e, value) => setSelectedUser(value)}
              getOptionLabel={(option) => option ? `${option.name || ""} (${option.email || ""})` : ""}
              renderInput={(params) => <TextField {...params} size="small" label="User" />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" type="date" label="Planned date" value={form.planneddate} onChange={(e) => setForm({ ...form, planneddate: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Comments" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={3} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={createPlan}>Add Visit Plan</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        <Typography variant="h6" fontWeight={800}>Update work done</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth multiline minRows={3} label="Work done" value={workForm.workdone} onChange={(e) => setWorkForm({ ...workForm, workdone: e.target.value })} disabled={!workForm.id} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth type="date" label="Next follow up date" value={workForm.nextfollowupdate} onChange={(e) => setWorkForm({ ...workForm, nextfollowupdate: e.target.value })} InputLabelProps={{ shrink: true }} disabled={!workForm.id} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={updateWork} disabled={!workForm.id}>Save Work</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
        <Box sx={{ height: 560, width: "100%" }}>
          <DataGrid rows={gridRows} columns={columns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick />
        </Box>
      </Paper>
    </PlacementCoordinatorShell>
  );
}
