import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import global1 from "./global1";
import ep1 from "../api/ep1";

const CreateScholarshipDS = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    scholarshipname: "",
    amount: "",
    category: "",
    program: "",
    programcode: "",
    startdate: "",
    enddate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");

  const fetchScholarships = async () => {
    try {
      const res = await ep1.get("/api/v2/getallscholarshipds", {
        params: {
          colid: global1.colid,
        },
      });
      setScholarships(res.data.scholarships || []);
    } catch {
      setMsgType("error");
      setMsg("Failed to fetch scholarships");
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleOpen = () => {
    setEditingId(null);
    setForm({
      scholarshipname: "",
      amount: "",
      category: "",
      program: "",
      programcode: "",
      startdate: "",
      enddate: "",
    });
    setOpen(true);
    setMsg("");
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const payload = { ...form, name: global1.name, user: global1.user, colid: global1.colid };
      let res;
      if (editingId) {
        res = await ep1.post("/api/v2/editscholarshipds", payload, { params: { id: editingId } });
      } else {
        res = await ep1.post("/api/v2/createscholarshipds", payload);
      }
      setMsg(res.data.success ? (editingId ? "Scholarship updated!" : "Scholarship created!") : res.data.message);
      setMsgType(res.data.success ? "success" : "error");
      handleClose();
      fetchScholarships();
    } catch (err) {
      setMsgType("error");
      setMsg("Error creating scholarship");
    }
  };

  const handleEdit = (scholarship) => {
    setEditingId(scholarship._id);
    setForm({
      scholarshipname: scholarship.scholarshipname,
      amount: scholarship.amount,
      category: scholarship.category || "",
      program: scholarship.program || "",
      programcode: scholarship.programcode || "",
      startdate: scholarship.startdate || "",
      enddate: scholarship.enddate || "",
    });
    setOpen(true);
    setMsg("");
  };

  const handleDelete = async (id) => {
    try {
      const res = await ep1.get("/api/v2/deletescholarshipds", { params: { id } });
      setMsg(res.data.success ? "Scholarship deleted!" : res.data.message);
      setMsgType(res.data.success ? "success" : "error");
      fetchScholarships();
    } catch {
      setMsgType("error");
      setMsg("Error deleting scholarship");
    }
  };

  return (
    <Container maxWidth="100%" sx={{ pt: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" color="primary">Scholarship List</Typography>
          <Button variant="contained" color="primary" size="large" onClick={handleOpen}>
            Create Scholarship
          </Button>
        </Stack>
        {msg && <Alert severity={msgType} sx={{ mb: 2 }}>{msg}</Alert>}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Program Code</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scholarships.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{s.scholarshipname}</TableCell>
                <TableCell>{s.amount}</TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell>{s.program}</TableCell>
                <TableCell>{s.programcode}</TableCell>
                <TableCell>{s.startdate}</TableCell>
                <TableCell>{s.enddate}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(s)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(s._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingId ? "Edit Scholarship" : "Create Scholarship"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1, pb: 2 }}>
            <TextField label="Scholarship Name" name="scholarshipname" value={form.scholarshipname} onChange={handleChange} fullWidth required />
            <TextField label="Amount" name="amount" type="number" value={form.amount} onChange={handleChange} fullWidth required />
            <TextField label="Category" name="category" value={form.category} onChange={handleChange} fullWidth />
            <TextField label="Program" name="program" value={form.program} onChange={handleChange} fullWidth />
            <TextField label="Program Code" name="programcode" value={form.programcode} onChange={handleChange} fullWidth />
            <TextField label="Start Date" name="startdate" type="date" value={form.startdate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="End Date" name="enddate" type="date" value={form.enddate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} color="primary">
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateScholarshipDS;
