import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";

const RubricExamPage = () => {
  const colid = Number(global1.colid);
  const navigate = useNavigate();
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    regno: "",
    studentname: "",
    program: "",
    programcode: "",
    name: "",
    user: "",
    course: "",
    coursecode: "",
    year: "",
    semester: "",
    exam: "",
    examcode: "",
    internalmarks: [],
    attendancemarks: [],
    internshipmarks: [],
    extracurriculummarks: [],
    externalfull: 0,
    externalmarks: 0,
  });

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const fetchRubrics = async () => {
    setLoading(true);
    const res = await ep1.get("/api/v2/getallrubrics", { params: { colid } });
    setRubrics(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRubrics();
  }, []);

  const handleSearchStudent = async () => {
    if (!form.regno) return;
    const res = await ep1.get("/api/v2/searchstudentbyregno", {
      params: { regno: form.regno, colid },
    });
    if (res.data.success) {
      const data = res.data.data;
      setForm({
        ...form,
        studentname: data.name,
        regno: data.regno,
        program: data.program,
        programcode: data.programcode,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleArrayChange = (e, index, field) => {
    const { value } = e.target;
    const updatedArray = form[field].map((item, i) =>
      i === index ? { ...item, [e.target.name]: value } : item
    );
    setForm({ ...form, [field]: updatedArray });
  };

  const handleAddArrayItem = (field) => {
    setForm({
      ...form,
      [field]: [
        ...form[field],
        { internalexamname: "", internalfull: 0, internalobtainmark: 0 },
      ],
    });
  };

  const handleRemoveArrayItem = (index, field) => {
    const updatedArray = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: updatedArray });
  };

  const handleSubmit = async () => {
    const endpoint = editId
      ? "/api/v2/updaterubrics?id=" + editId
      : "/api/v2/createrubrics";
    await ep1.post(endpoint, { ...form, colid });
    setOpen(false);
    fetchRubrics();
    setForm({
      regno: "",
      studentname: "",
      program: "",
      programcode: "",
      name: "",
      user: "",
      course: "",
      coursecode: "",
      year: "",
      semester: "",
      exam: "",
      examcode: "",
      internalmarks: [],
      attendancemarks: [],
      internshipmarks: [],
      extracurriculummarks: [],
      externalfull: 0,
      externalmarks: 0,
    });
    setEditId(null);
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await ep1.get("/api/v2/deleterubrics?id=" + id);
    fetchRubrics();
  };

  const columns = [
    { field: "studentname", headerName: "Name", width: 150 },
    { field: "regno", headerName: "Reg No", width: 120 },
    { field: "programcode", headerName: "Program", width: 100 },
    { field: "coursecode", headerName: "Course", width: 100 },
    { field: "examcode", headerName: "Exam", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: ({ row }) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(row)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row._id)}>
            <Delete />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/detail/${row._id}`)}
          >
            View
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container>
      <Box mt={4} mb={2} display="flex" justifyContent="space-between">
        <Typography variant="h5">Rubric Exam Data</Typography>
        <Button
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          variant="contained"
        >
          Add
        </Button>
      </Box>
      <DataGrid
        rows={rubrics}
        columns={columns}
        getRowId={(row) => row._id}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        pageSizeOptions={[10, 20, 50]}
        autoHeight
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editId ? "Update" : "Create"} Rubric</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Reg No"
                name="regno"
                value={form.regno}
                onChange={handleChange}
              />
              <Button onClick={handleSearchStudent} size="small">
                Search
              </Button>
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Name"
                name="studentname"
                value={form.studentname}
                disabled
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Program"
                name="program"
                value={form.program}
                disabled
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Program Code"
                name="programcode"
                value={form.programcode}
                disabled
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Course"
                name="course"
                value={form.course}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Course Code"
                name="coursecode"
                value={form.coursecode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Exam"
                name="exam"
                value={form.exam}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Exam Code"
                name="examcode"
                value={form.examcode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Year"
                name="year"
                value={form.year}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Semester"
                name="semester"
                value={form.semester}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="External Full"
                name="externalfull"
                value={form.externalfull}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="External Marks"
                name="externalmarks"
                value={form.externalmarks}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Internal Marks</Typography>
              {form.internalmarks.map((item, index) => (
                <div key={index}>
                  <TextField
                    fullWidth
                    label="Internal Exam Name"
                    name="internalexamname"
                    value={item.internalexamname}
                    onChange={(e) =>
                      handleArrayChange(e, index, "internalmarks")
                    }
                  />
                  <TextField
                    fullWidth
                    label="Internal Full"
                    name="internalfull"
                    value={item.internalfull}
                    onChange={(e) =>
                      handleArrayChange(e, index, "internalmarks")
                    }
                  />
                  <TextField
                    fullWidth
                    label="Internal Obtain Mark"
                    name="internalobtainmark"
                    value={item.internalobtainmark}
                    onChange={(e) =>
                      handleArrayChange(e, index, "internalmarks")
                    }
                  />
                  <Button
                    onClick={() =>
                      handleRemoveArrayItem(index, "internalmarks")
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => handleAddArrayItem("internalmarks")}>
                Add Internal Marks
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Attendance Marks</Typography>
              {form.attendancemarks.map((item, index) => (
                <div key={index}>
                  <TextField
                    fullWidth
                    label="Attendance Name"
                    name="attendancename"
                    value={item.attendancename}
                    onChange={(e) =>
                      handleArrayChange(e, index, "attendancemarks")
                    }
                  />
                  <TextField
                    fullWidth
                    label="Attendance Full"
                    name="attendancefull"
                    value={item.attendancefull}
                    onChange={(e) =>
                      handleArrayChange(e, index, "attendancemarks")
                    }
                  />
                  <TextField
                    fullWidth
                    label="Attendance Obtain Mark"
                    name="attendanceobtainmark"
                    value={item.attendanceobtainmark}
                    onChange={(e) =>
                      handleArrayChange(e, index, "attendancemarks")
                    }
                  />
                  <Button
                    onClick={() =>
                      handleRemoveArrayItem(index, "attendancemarks")
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => handleAddArrayItem("attendancemarks")}>
                Add Attendance Marks
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Internship Marks</Typography>
              {form.internshipmarks.map((item, index) => (
                <div key={index}>
                  <TextField
                    fullWidth
                    label="Internship Name"
                    name="internshipname"
                    value={item.internshipname}
                    onChange={(e) =>
                      handleArrayChange(e, index, "internshipmarks")
                    }
                  />
                  <TextField
                    fullWidth
                    label="Internship Full"
                    name="internshipfull"
                    value={item.internshipfull}
                    onChange={(e) =>
                      handleArrayChange(e, index, "internshipmarks")
                    }
                  />
                  <TextField
                    fullWidth
                    label="Internship Obtain Mark"
                    name="internshipobtainmark"
                    value={item.internshipobtainmark}
                    onChange={(e) =>
                      handleArrayChange(e, index, "internshipmarks")
                    }
                  />
                  <Button
                    onClick={() =>
                      handleRemoveArrayItem(index, "internshipmarks")
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => handleAddArrayItem("internshipmarks")}>
                Add Internship Marks
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Extracurriculum Marks</Typography>
              {form.extracurriculummarks.map((item, index) => (
                <div key={index}>
                  <TextField
                    fullWidth
                    label="Extracurriculum Name"
                    name="extracurriculumname"
                    value={item.extracurriculumname}
                    onChange={(e) =>
                      handleArrayChange(e, index, "extracurriculummarks")
                    }
                  />
                  <TextField
                    fullWidth
                    label="Extracurriculum Full"
                    name="extracurriculumfull"
                    value={item.extracurriculumfull}
                    onChange={(e) =>
                      handleArrayChange(e, index, "extracurriculummarks")
                    }
                  />
                  <TextField
                    fullWidth
                    label="Extracurriculum Obtain Mark"
                    name="extracurriculumobtainmark"
                    value={item.extracurriculumobtainmark}
                    onChange={(e) =>
                      handleArrayChange(e, index, "extracurriculummarks")
                    }
                  />
                  <Button
                    onClick={() =>
                      handleRemoveArrayItem(index, "extracurriculummarks")
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => handleAddArrayItem("extracurriculummarks")}
              >
                Add Extracurriculum Marks
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RubricExamPage;
