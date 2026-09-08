// src/pages/SubjectGroupds.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import ep1 from "../api/ep1";
import global1 from "./global1";

const GROUPNAMES = ["Major", "Minor", "Language", "Skill Development"];
const LANG_TYPES = ["Compulsory", "Additional"];

export default function SubjectGroupds() {
  const [filters, setFilters] = useState({
    year: "",
    programcode: "",
    semester: "",
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  // Dialog state
  const [open, setOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    subject: "",
    groupname: "",
    type: "",
  });

  useEffect(() => {
    if (filters.year && filters.programcode && filters.semester) {
      fetchSubjects();
    }
  }, [filters]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/listSubjects", {
        params: {
          colid: global1.colid,
          ...filters,
        },
      });

      if (res.data.success) {
        setRows(res.data.data);
      }
    } catch (error) {
      setToast({ open: true, msg: "Error loading subjects", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.subject || !newSubject.groupname) {
      setToast({ open: true, msg: "Subject and Group are required", sev: "warning" });
      return;
    }

    if (newSubject.groupname === "Language" && !newSubject.type) {
      setToast({ open: true, msg: "Language type is required", sev: "warning" });
      return;
    }

    try {
      const res = await ep1.post("/api/v2/addSubjects", {
        name: global1.name,
        user: global1.email,
        colid: global1.colid,
        subject: newSubject.subject,
        groupname: newSubject.groupname,
        type: newSubject.type,
        ...filters,
      });

      if (res.data.success) {
        setToast({ open: true, msg: "Subject added successfully", sev: "success" });
        setOpen(false);
        setNewSubject({ subject: "", groupname: "", type: "" });
        fetchSubjects();
      }
    } catch (error) {
      setToast({
        open: true,
        msg: error.response?.data?.message || "Error adding subject",
        sev: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this subject?")) return;

    try {
      const res = await ep1.post("/api/v2/removeConfiguredSubject", { id });
      if (res.data.success) {
        setToast({ open: true, msg: "Subject removed", sev: "success" });
        fetchSubjects();
      }
    } catch (error) {
      setToast({ open: true, msg: "Error removing subject", sev: "error" });
    }
  };

  const columns = [
    { field: "subject", headerName: "Subject", flex: 1, minWidth: 200 },
    {
      field: "groupname",
      headerName: "Group",
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Major"
              ? "primary"
              : params.value === "Minor"
              ? "secondary"
              : params.value === "Language"
              ? "warning"
              : "info"
          }
          size="small"
        />
      ),
    },
    {
      field: "type",
      headerName: "Type",
      flex: 0.6,
      renderCell: (params) =>
        params.value ? <Chip label={params.value} size="small" variant="outlined" /> : "-",
    },
    { field: "year", headerName: "Year", flex: 0.5 },
    { field: "semester", headerName: "Semester", flex: 0.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      renderCell: (params) => (
        <IconButton color="error" size="small" onClick={() => handleDelete(params.row._id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Manage Subject Groups
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchSubjects}
              disabled={!filters.year || !filters.programcode || !filters.semester}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              disabled={!filters.year || !filters.programcode || !filters.semester}
            >
              Add Subject
            </Button>
          </Stack>
        </Stack>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Year"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Program Code"
                value={filters.programcode}
                onChange={(e) => setFilters({ ...filters, programcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Semester"
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>

        {/* DataGrid */}
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      {/* Add Subject Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Subject</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Subject Name"
              value={newSubject.subject}
              onChange={(e) => setNewSubject({ ...newSubject, subject: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Group Name"
              value={newSubject.groupname}
              onChange={(e) =>
                setNewSubject({ ...newSubject, groupname: e.target.value, type: "" })
              }
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              {GROUPNAMES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </TextField>

            {newSubject.groupname === "Language" && (
              <TextField
                fullWidth
                select
                label="Language Type"
                value={newSubject.type}
                onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                {LANG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubject}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.sev}>{toast.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
