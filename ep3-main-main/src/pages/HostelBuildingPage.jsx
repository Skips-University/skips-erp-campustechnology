// 📁 src/pages/HostelBuildingPage.jsx
import React, { useEffect, useState } from "react";
import ep1 from "../api/ep1";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import { Add, Edit, Delete, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import global1 from "./global1";

const HostelBuildingPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    buldingname: "",
    totalrooms: "",
    colid: global1.colid,
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  const fetchBuildings = async () => {
    try {
      const res = await ep1.get(
        `/api/v2/gethostelbuldings?page=${page}&limit=${limit}&colid=${global1.colid}`
      );
      setBuildings(res.data.data || []);
      setTotalPages(Math.ceil((res.data.total || 0) / limit));
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error fetching buildings",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, [page]);

  const handleSubmit = async () => {
    try {
      const payload = { ...form, colid: global1.colid };
      if (editId) {
        await ep1.post(`/api/v2/updatehostelbulding?id=${editId}`, payload);
        setSnackbar({
          open: true,
          message: "Building updated successfully",
          severity: "success",
        });
      } else {
        await ep1.post("/api/v2/createhostelbulding", payload);
        setSnackbar({
          open: true,
          message: "Building created successfully",
          severity: "success",
        });
      }
      setOpen(false);
      setForm({ buldingname: "", totalrooms: "", colid: global1.colid });
      setEditId(null);
      fetchBuildings();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error submitting form",
        severity: "error",
      });
    }
  };

  const handleEdit = (building) => {
    setForm({
      buldingname: building.buldingname,
      totalrooms: building.totalrooms,
      colid: building.colid,
    });
    setEditId(building._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await ep1.get(`/api/v2/deletehostelbulding/${id}`);
      setSnackbar({
        open: true,
        message: "Building deleted successfully",
        severity: "info",
      });
      fetchBuildings();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error deleting building",
        severity: "error",
      });
    }
  };

  const handleNavigateToRooms = (building) => {
    navigate(`/rooms/${building.buldingname}`);
  };

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Box p={4} maxWidth="900px" mx="auto">
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashboardpagehostel")}>
            Back
          </Button>
          <Typography variant="h4" align="center" gutterBottom>
            Hostel Buildings
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
            >
              Create Building
            </Button>
          </Box>

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Building Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Total Rooms</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {buildings.map((b) => (
                  <TableRow
                    key={b._id}
                    hover
                    onClick={() => handleNavigateToRooms(b)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>{b.buldingname}</TableCell>
                    <TableCell>{b.totalrooms}</TableCell>
                    <TableCell
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton color="primary" onClick={() => handleEdit(b)}>
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(b._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </Box>

          {/* Dialog for Create/Edit */}
          <Dialog
            open={open}
            onClose={() => {
              setOpen(false);
              setEditId(null);
              setForm({
                buldingname: "",
                totalrooms: "",
                colid: global1.colid,
              });
            }}
          >
            <DialogTitle>{editId ? "Edit" : "Create"} Building</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Building Name"
                fullWidth
                value={form.buldingname}
                onChange={(e) =>
                  setForm({ ...form, buldingname: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Total Rooms"
                type="number"
                fullWidth
                value={form.totalrooms}
                onChange={(e) =>
                  setForm({ ...form, totalrooms: e.target.value })
                }
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpen(false);
                  setEditId(null);
                  setForm({
                    buldingname: "",
                    totalrooms: "",
                    colid: global1.colid,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                color="primary"
              >
                {editId ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default HostelBuildingPage;
