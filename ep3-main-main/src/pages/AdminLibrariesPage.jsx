import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";

const AdminLibrariesPage = () => {
  const [libraries, setLibraries] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const navigate = useNavigate();

  const fetchLibraries = async () => {
    try {
      const res = await ep1.get(`/api/v2/getalllibrary/${global1.colid}`);
      setLibraries(res.data.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  const handleDelete = async (id) => {
    try {
      await ep1.get(`/api/v2/deletelibrary/${id}`);
      fetchLibraries();
    } catch (error) {}
  };

  const handleEdit = (library) => {
    setSelectedLibrary(library);
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    setSelectedLibrary({ ...selectedLibrary, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      await ep1.post(
        `/api/v2/updatelibrary?id=${selectedLibrary._id}`,
        selectedLibrary
      );
      setEditDialogOpen(false);
      fetchLibraries();
    } catch (error) {}
  };

  const handleRowClick = (id) => {
    navigate(`/library/${id}`);
  };

  return (
    <Box sx={{ backgroundColor: "#f0f4f8", minHeight: "100vh", py: 4, px: 2 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/dashdashfacnew")}
      >
        Back
      </Button>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", fontWeight: "bold", color: "#1976d2" }}
      >
        Admin Library Management
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff" }}>Library ID</TableCell>
              <TableCell sx={{ color: "#fff" }}>Name</TableCell>
              <TableCell sx={{ color: "#fff" }}>Incharge</TableCell>
              <TableCell sx={{ color: "#fff" }}>Contact</TableCell>
              <TableCell sx={{ color: "#fff" }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {libraries.map((lib, index) => (
              <TableRow
                key={lib._id}
                hover
                onClick={() => handleRowClick(lib._id)}
                sx={{
                  cursor: "pointer",
                  backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  "&:hover": { backgroundColor: "#e0f7fa" },
                }}
              >
                <TableCell>{lib.libraryid}</TableCell>
                <TableCell>{lib.libraryname}</TableCell>
                <TableCell>{lib.libraryincharge}</TableCell>
                <TableCell>{lib.contactno}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton color="primary" onClick={() => handleEdit(lib)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(lib._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Library</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Library ID"
            name="libraryid"
            fullWidth
            margin="normal"
            value={selectedLibrary?.libraryid || ""}
            onChange={handleEditChange}
          />
          <TextField
            label="Library Name"
            name="libraryname"
            fullWidth
            margin="normal"
            value={selectedLibrary?.libraryname || ""}
            onChange={handleEditChange}
          />
          <TextField
            label="Incharge"
            name="libraryincharge"
            fullWidth
            margin="normal"
            value={selectedLibrary?.libraryincharge || ""}
            onChange={handleEditChange}
          />
          <TextField
            label="Contact"
            name="contactno"
            fullWidth
            margin="normal"
            value={selectedLibrary?.contactno || ""}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLibrariesPage;
