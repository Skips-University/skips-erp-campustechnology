import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

function ExamMarksStructurePageds() {
  const [formData, setFormData] = useState({
    name: global1.name,
    user: global1.user,
    colid: Number(global1.colid),
    program: "",
    examcode: "",
    month: "",
    year: "",
    status: "",
    regulation: "",
    semester: "",
    branch: "",
    papercode: "",
    papername: "",
    thmax: "",
    prmax: "",
    iatmax: "",
    iapmax: "",
  });
  const [structures, setStructures] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    if (formData.year && formData.program) fetchStructures();
  }, [formData.year, formData.program]);

  const fetchStructures = async () => {
    try {
      const res = await ep1.get("/api/v2/listexammarks1ds", {
        params: { colid: global1.colid, year: formData.year, program: formData.program },
      });
      setStructures(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await ep1.post("/api/v2/editexammarks1ds", { _id: editId, ...formData });
        alert("Structure updated successfully");
        setEditMode(false);
        setEditId(null);
      } else {
        await ep1.post("/api/v2/createexammarks1ds", formData);
        alert("Structure created successfully");
      }

      resetForm();
      fetchStructures();
    } catch (error) {
      console.error(error);
      alert("Operation failed");
    }
  };

  const resetForm = () => {
    setFormData({
      name: global1.name,
      user: global1.user,
      colid: global1.colid,
      program: formData.program,
      examcode: "",
      month: "",
      year: formData.year,
      status: "",
      regulation: "",
      semester: "",
      branch: "",
      papercode: "",
      papername: "",
      thmax: "",
      prmax: "",
      iatmax: "",
      iapmax: "",
    });
  };

  const handleEdit = (structure) => {
    setFormData(structure);
    setEditMode(true);
    setEditId(structure._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await ep1.get("/api/v2/deleteexammarks1ds", { params: { _id: id } });
      alert("Deleted successfully");
      fetchStructures();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* Header */}
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/dashboardreevalds")}
              >
                Back
              </Button>
               <Typography variant="h4" gutterBottom>
        Exam Marks Structure
      </Typography>
            </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {editMode ? "Edit Structure" : "Create Paper Structure"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Program" name="program" value={formData.program} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Exam Code" name="examcode" value={formData.examcode} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Month" name="month" value={formData.month} onChange={handleChange}>
                {months.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Year" name="year" value={formData.year} onChange={handleChange}>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Status" name="status" value={formData.status} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Regulation" name="regulation" value={formData.regulation} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Semester" name="semester" value={formData.semester} onChange={handleChange}>
                {semesters.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Branch" name="branch" value={formData.branch} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Paper Code" name="papercode" value={formData.papercode} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Paper Name" name="papername" value={formData.papername} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth type="number" label="TH Max" name="thmax" value={formData.thmax} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth type="number" label="PR Max" name="prmax" value={formData.prmax} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth type="number" label="IAT Max" name="iatmax" value={formData.iatmax} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth type="number" label="IAP Max" name="iapmax" value={formData.iapmax} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mr: 2 }}>
                {editMode ? "Update" : "Create"}
              </Button>
              {editMode && (
                <Button variant="outlined" onClick={() => { setEditMode(false); resetForm(); }}>
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {structures.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Paper Structures
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Paper Code</strong></TableCell>
                  <TableCell><strong>Paper Name</strong></TableCell>
                  <TableCell><strong>TH Max</strong></TableCell>
                  <TableCell><strong>PR Max</strong></TableCell>
                  <TableCell><strong>IAT Max</strong></TableCell>
                  <TableCell><strong>IAP Max</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {structures.map((structure) => (
                  <TableRow key={structure._id}>
                    <TableCell>{structure.papercode}</TableCell>
                    <TableCell>{structure.papername}</TableCell>
                    <TableCell>{structure.thmax}</TableCell>
                    <TableCell>{structure.prmax}</TableCell>
                    <TableCell>{structure.iatmax}</TableCell>
                    <TableCell>{structure.iapmax}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(structure)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(structure._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default ExamMarksStructurePageds;
