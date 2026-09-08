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
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function ExaminerConfigPageds() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: global1.name,
    user: global1.user,
    colid: global1.colid,
    program: "",
    examcode: "",
    month: "",
    year: "",
    regulation: "",
    semester: "",
    branch: "",
    papercode: "",
    papername: "",
    examiner1: "",
    examiner2: "",
    examiner3: "",
  });

  const [configs, setConfigs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await ep1.get("/api/v2/examinerconfig/listds", {
        params: { colid: global1.colid },
      });
      setConfigs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await ep1.post("/api/v2/examinerconfig/editds", { _id: editId, ...formData });
        setEditMode(false);
        setEditId(null);
      } else {
        await ep1.post("/api/v2/examinerconfig/createds", formData);
      }
      
      setFormData({
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        program: "",
        examcode: "",
        month: "",
        year: "",
        regulation: "",
        semester: "",
        branch: "",
        papercode: "",
        papername: "",
        examiner1: "",
        examiner2: "",
        examiner3: "",
      });
      
      fetchConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (config) => {
    setFormData(config);
    setEditMode(true);
    setEditId(config._id);
  };

  const handleDelete = async (id) => {
    try {
      await ep1.get("/api/v2/examinerconfig/deleteds", { params: { _id: id } });
      fetchConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                                <Button
                                  startIcon={<ArrowBack />}
                                  onClick={() => navigate("/dashboardreevalds")}
                                >
                                  Back
                                </Button>
                                <Typography variant="h4" gutterBottom>
        Examiner Configuration
      </Typography>
                              </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {editMode ? "Edit Configuration" : "Add Configuration"}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Program"
                name="program"
                value={formData.program}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Exam Code"
                name="examcode"
                value={formData.examcode}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                size="small"
              >
                {months.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                size="small"
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y.toString()}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Regulation"
                name="regulation"
                value={formData.regulation}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                size="small"
              >
                {semesters.map((s) => (
                  <MenuItem key={s} value={s.toString()}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Paper Code"
                name="papercode"
                value={formData.papercode}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Paper Name"
                name="papername"
                value={formData.papername}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Examiner 1 Email"
                name="examiner1"
                value={formData.examiner1}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Examiner 2 Email"
                name="examiner2"
                value={formData.examiner2}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Examiner 3 Email"
                name="examiner3"
                value={formData.examiner3}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleSubmit}>
                {editMode ? "Update" : "Submit"}
              </Button>
              {editMode && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditMode(false);
                    setEditId(null);
                    setFormData({
                      name: global1.name,
                      user: global1.user,
                      colid: global1.colid,
                      program: "",
                      examcode: "",
                      month: "",
                      year: "",
                      regulation: "",
                      semester: "",
                      branch: "",
                      papercode: "",
                      papername: "",
                      examiner1: "",
                      examiner2: "",
                      examiner3: "",
                    });
                  }}
                  sx={{ ml: 2 }}
                >
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Program</TableCell>
              <TableCell>Paper Code</TableCell>
              <TableCell>Paper Name</TableCell>
              <TableCell>Examiner 1</TableCell>
              <TableCell>Examiner 2</TableCell>
              <TableCell>Examiner 3</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config._id}>
                <TableCell>{config.program}</TableCell>
                <TableCell>{config.papercode}</TableCell>
                <TableCell>{config.papername}</TableCell>
                <TableCell>{config.examiner1}</TableCell>
                <TableCell>{config.examiner2}</TableCell>
                <TableCell>{config.examiner3}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(config)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(config._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ExaminerConfigPageds;
