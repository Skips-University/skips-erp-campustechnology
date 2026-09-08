import { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Box,
  TextField,
  Autocomplete,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Fab,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ep1 from "../api/ep1";
import global1 from "./global1";



export default function LeavesPage() {

  const colid = global1.colid;
  const userEmail = global1.user;

  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isApprover, setIsApprover] = useState(false);
  const [rows, setRows] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    email: userEmail,
    leavetype: "",
    from: "",
    to: "",
    reason: "",
    handover: "",
  });

  const openSnack = (msg, sev = "success") => setSnack({ open: true, msg, severity: sev });
  const closeSnack = () => setSnack({ ...snack, open: false });

  const fetchLeaveTypes = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getleavetypes", { params: { colid } });
      setTypes(data);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const fetchMyLeaves = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getleaves", {
        params: { email: userEmail, colid },
      });
      setRows(data);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const fetchApprovals = async () => {
    try {
      const [leaves, approvers] = await Promise.all([
        ep1.get("/api/v2/getleaves", { params: { colid } }),
        ep1.get("/api/v2/getallapprovers", { params: { colid } }),
      ]);
      const myApprovals = approvers.data.filter(a => a.approveremail === userEmail);
      const pending = leaves.data.filter(
        l => l.leavestatus === "Pending" &&
        myApprovals.some(a => a.employeeemail === l.email && a.level === l.currentLevel)
      );
      setRows(pending);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const checkIfApprover = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getallapprovers", { params: { colid } });
      const match = data.find(a => a.approveremail === userEmail);
      setIsApprover(!!match);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  useEffect(() => {
    checkIfApprover();
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    if (tab === 0) fetchMyLeaves();
    else fetchApprovals();
  }, [tab, dialogOpen]);

  const handleApplyLeave = async () => {
    if (!form.leavetype || !form.from || !form.to) {
      openSnack("Fill required fields", "error");
      return;
    }
    try {
      await ep1.post("/api/v2/createleave", { ...form, colid });
      setForm({
        email: userEmail,
        leavetype: "",
        from: "",
        to: "",
        reason: "",
        handover: "",
      });
      setDialogOpen(false);
      openSnack("Leave applied");
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const handleAction = async (id, action) => {
    try {
      await ep1.post(`/api/v2/approverejectleave?id=${id}`, {
        approveremail: userEmail,
        action,
      });
      openSnack("Action saved");
      fetchApprovals();
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const columns = tab === 0
    ? [
        { field: "leavetype", headerName: "Type", width: 110 },
        { field: "from", headerName: "From", width: 120 },
        { field: "to", headerName: "To", width: 120 },
        { field: "leavestatus", headerName: "Status", width: 100 },
        { field: "reason", headerName: "Reason", flex: 1 },
      ]
    : [
        { field: "email", headerName: "Employee", flex: 1 },
        { field: "leavetype", headerName: "Type", width: 100 },
        { field: "from", headerName: "From", width: 120 },
        { field: "to", headerName: "To", width: 120 },
        { field: "reason", headerName: "Reason", flex: 1 },
        { field: "currentLevel", headerName: "Level", width: 80 },
        {
          type: "actions",
          headerName: "Actions",
          width: 120,
          getActions: (params) => [
            <GridActionsCellItem
              icon={<CheckCircleIcon />}
              label="Approve"
              onClick={() => handleAction(params.id, "Approved")}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Reject"
              onClick={() => handleAction(params.id, "Rejected")}
            />,
          ],
        },
      ];

  return (
    <Container sx={{ mt: 4 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="My Leaves" />
        {isApprover && <Tab label="Approve / Reject" />}
      </Tabs>

      <Box mt={2} style={{ height: 400 }}>
        <DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} />
      </Box>

      {tab === 0 && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => setDialogOpen(true)}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Leave</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Your Email" value={form.email} disabled />
            <Autocomplete
              options={types}
              getOptionLabel={(t) => t.name}
              value={types.find(t => t.name === form.leavetype) || null}
              onChange={(_, v) => setForm({ ...form, leavetype: v?.name || "" })}
              renderInput={(params) => <TextField {...params} label="Leave Type" />}
            />
            <TextField
              type="date"
              label="From"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="To"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
            <TextField
              label="Handover (optional)"
              value={form.handover}
              onChange={(e) => setForm({ ...form, handover: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApplyLeave} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
