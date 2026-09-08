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

const blankForm = {
  id: "",
  panelid: "",
  panelname: "",
  membername: "",
  memberemail: "",
  memberphone: "",
  designation: "",
  department: "",
  qualification: "",
  remunerationtype: "Per interview",
  remunerationamount: 0,
  remarks: ""
};

export default function RecruitmentPanelMembersPage() {
  const [panels, setPanels] = useState([]);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const colid = global1.colid;

  const selectedPanel = useMemo(() => panels.find((item) => item.panelid === form.panelid), [panels, form.panelid]);

  const loadPanels = async () => {
    const res = await ep1.get("/api/v2/recruitment/interview-panels", { params: { colid, status: "Active" } });
    setPanels(res.data || []);
    if (!form.panelid && res.data?.[0]?.panelid) setForm((old) => ({ ...old, panelid: res.data[0].panelid, panelname: res.data[0].panelname }));
  };

  const loadMembers = async (panelid = form.panelid) => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/recruitment/panel-members", { params: { colid, panelid } });
      setMembers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load members");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (search = "") => {
    const res = await ep1.get("/api/v2/recruitment/users", { params: { colid, search } });
    setUsers(res.data || []);
  };

  useEffect(() => { loadPanels(); searchUsers(); }, []);
  useEffect(() => { if (form.panelid) loadMembers(form.panelid); }, [form.panelid]);

  const saveMember = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const panel = panels.find((item) => item.panelid === form.panelid);
      await ep1.post("/api/v2/recruitment/panel-members", {
        ...form,
        panelname: panel?.panelname || form.panelname,
        colid,
        user: global1.user
      });
      setForm({ ...blankForm, panelid: form.panelid, panelname: panel?.panelname || form.panelname });
      setMessage("Panel member saved");
      loadMembers(form.panelid);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save member");
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (row) => {
    if (!window.confirm(`Delete ${row.membername}?`)) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/recruitment/panel-members-delete", { colid, id: row._id });
      setMessage("Member deleted");
      loadMembers(form.panelid);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete member");
    } finally {
      setSaving(false);
    }
  };

  const selectUser = (_, user) => {
    if (!user) return;
    setForm({
      ...form,
      membername: user.name || "",
      memberemail: user.email || "",
      memberphone: user.phone || "",
      designation: user.designation || "",
      department: user.department || ""
    });
  };

  const columns = [
    { field: "panelname", headerName: "Panel", minWidth: 180, flex: 1 },
    { field: "membername", headerName: "Member", minWidth: 180, flex: 1 },
    { field: "memberemail", headerName: "Email", minWidth: 220, flex: 1.1 },
    { field: "department", headerName: "Department", minWidth: 160, flex: 0.8 },
    { field: "qualification", headerName: "Qualification", minWidth: 180, flex: 1 },
    { field: "remunerationtype", headerName: "Remuneration Type", minWidth: 170, flex: 0.8 },
    { field: "remunerationamount", headerName: "Amount", type: "number", minWidth: 120, flex: 0.5 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ ...blankForm, ...row, id: row._id })} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteMember(row)} showInMenu />
      ]
    }
  ];

  return (
    <MenuPageShell title="Panel Members">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Interview Panel Members</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Search users and add them to interview panels with qualification and remuneration details.</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Panel" value={form.panelid} onChange={(e) => {
                const panel = panels.find((item) => item.panelid === e.target.value);
                setForm({ ...blankForm, panelid: e.target.value, panelname: panel?.panelname || "" });
              }}>
                {panels.map((panel) => <MenuItem key={panel.panelid} value={panel.panelid}>{panel.panelid} - {panel.panelname}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.name || ""} (${option.email || ""})`}
                onInputChange={(_, value) => searchUsers(value)}
                onChange={selectUser}
                renderInput={(params) => <TextField {...params} label="Search member from users" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button fullWidth variant="outlined" onClick={() => loadMembers(form.panelid)} disabled={loading}>Load Members</Button>
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth required label="Member Name" value={form.membername} onChange={(e) => setForm({ ...form, membername: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth required label="Member Email" value={form.memberemail} onChange={(e) => setForm({ ...form, memberemail: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Phone" value={form.memberphone} onChange={(e) => setForm({ ...form, memberphone: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Remuneration Type" value={form.remunerationtype} onChange={(e) => setForm({ ...form, remunerationtype: e.target.value })}>
                {["Per interview", "Per day", "Fixed", "Honorarium"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Amount" value={form.remunerationamount} onChange={(e) => setForm({ ...form, remunerationamount: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={saveMember} disabled={saving || !selectedPanel}>{form.id ? "Update Member" : "Add Member"}</Button>
                {form.id && <Button variant="outlined" onClick={() => setForm({ ...blankForm, panelid: form.panelid, panelname: form.panelname })}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ height: 540 }}>
            <DataGrid rows={members} columns={columns} getRowId={(row) => row._id} loading={loading} pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} slots={{ toolbar: GridToolbar }} />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
