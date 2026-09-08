import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const ParentDetailsPage = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [form, setForm] = useState({
    parentname: "",
    phone: "",
    email: "",
    address: "",
    studentname: "",
    regno: "",
    user: global1.email,
    username: global1.name,
    colid: global1.colid,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const { data } = await ep1.get(`/api/v2/getparentdetailsds?colid=${global1.colid}`);
      if (data.success) {
        setParents(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const searchStudents = async (query) => {
    if (!query) {
      setStudents([]);
      return;
    }
    setSearchLoading(true);
    try {
      const { data } = await ep1.get(
        `/api/v2/searchstudentsds?query=${query}&colid=${global1.colid}`
      );
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOpen = (parent = null) => {
    if (parent) {
      setEditId(parent._id);
      setForm(parent);
    } else {
      setEditId(null);
      setForm({
        parentname: "",
        phone: "",
        email: "",
        address: "",
        studentname: "",
        regno: "",
        user: global1.email,
        username: global1.name,
        colid: global1.colid,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setStudents([]);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await ep1.post("/api/v2/updateparentdetailsds", { ...form, id: editId });
        setSnackbar({
          open: true,
          message: "Parent details updated successfully",
          severity: "success",
        });
      } else {
        await ep1.post("/api/v2/addparentdetailsds", form);
        setSnackbar({
          open: true,
          message: "Parent details added successfully",
          severity: "success",
        });
      }
      fetchParents();
      handleClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error saving parent details",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this parent detail?")) {
      try {
        await ep1.get(`/api/v2/deleteparentdetailsds/${id}`);
        setSnackbar({
          open: true,
          message: "Parent details deleted successfully",
          severity: "success",
        });
        fetchParents();
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Error deleting parent details",
          severity: "error",
        });
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/dashboardpagehostel")}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Parent Details Management</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Parent Details
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parent Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Regno</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parents.map((parent) => (
              <TableRow key={parent._id}>
                <TableCell>{parent.parentname}</TableCell>
                <TableCell>{parent.phone}</TableCell>
                <TableCell>{parent.email}</TableCell>
                <TableCell>{parent.studentname}</TableCell>
                <TableCell>{parent.regno}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(parent)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(parent._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Parent Details" : "Add Parent Details"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Parent Name"
              value={form.parentname}
              onChange={(e) => setForm({ ...form, parentname: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <Autocomplete
              options={students}
              getOptionLabel={(option) => `${option.name} (${option.regno})`}
              loading={searchLoading}
              onInputChange={(e, value) => searchStudents(value)}
              onChange={(e, value) => {
                if (value) {
                  setForm({
                    ...form,
                    studentname: value.name,
                    regno: value.regno,
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Student"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <TextField
              label="Student Name"
              value={form.studentname}
              onChange={(e) => setForm({ ...form, studentname: e.target.value })}
              fullWidth
              disabled
            />
            <TextField
              label="Regno"
              value={form.regno}
              onChange={(e) => setForm({ ...form, regno: e.target.value })}
              fullWidth
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ParentDetailsPage;
