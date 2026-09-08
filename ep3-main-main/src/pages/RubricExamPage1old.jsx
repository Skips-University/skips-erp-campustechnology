import React, { useState } from "react";
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
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";

const filterFields = [
  { label: "Program Code", name: "programcode" },
  { label: "Course Code", name: "coursecode" },
  { label: "Exam Code", name: "examcode" },
  { label: "Year", name: "year" },
  { label: "Semester", name: "semester" },
];

const initialForm = {
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
  externalfull: 0,
  externalmarks: 0,
};

const RubricExamPage1 = () => {
  const colid = Number(global1.colid);
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState({
    programcode: "",
    coursecode: "",
    examcode: "",
    year: "",
    semester: "",
  });
  const [filterApplied, setFilterApplied] = useState(false);

  // Data state
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog and form states
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...initialForm });

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Fetch data only when filters are applied
  const fetchRubrics = async () => {
    setLoading(true);
    const res = await ep1.get("/api/v2/getallrubrics1", {
      params: { ...filters, colid },
    });
    setRubrics(res.data);
    setLoading(false);
  };

  // Apply filter
  const handleApplyFilter = async () => {
    setFilterApplied(true);
    fetchRubrics();
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

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

  const handleAddArrayItem = (field, structure) => {
    setForm({
      ...form,
      [field]: [...form[field], { ...structure }],
    });
  };

  const handleRemoveArrayItem = (index, field) => {
    const updatedArray = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: updatedArray });
  };

  const handleSubmit = async () => {
    const endpoint = editId
      ? "/api/v2/updaterubrics1?id=" + editId
      : "/api/v2/createrubrics1";
    await ep1.post(endpoint, { ...form, colid });
    setOpen(false);
    if (filterApplied) fetchRubrics();
    setForm({ ...initialForm });
    setEditId(null);
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await ep1.get("/api/v2/deleterubrics1?id=" + id);
    fetchRubrics();
  };

  // Handle Add button - pre-fill form with filter data
  const handleAdd = () => {
    const preFilledForm = {
      ...initialForm,
      programcode: filters.programcode || "",
      coursecode: filters.coursecode || "",
      examcode: filters.examcode || "",
      year: filters.year || "",
      semester: filters.semester || "",
      // Set course and exam names same as codes initially (user can modify)
      course: filters.coursecode || "",
      exam: filters.examcode || "",
    };
    setForm(preFilledForm);
    setEditId(null);
    setOpen(true);
  };

  // Columns for DataGrid
  const columns = [
    { field: "studentname", headerName: "Name", width: 150 },
    { field: "regno", headerName: "Reg No", width: 120 },
    { field: "programcode", headerName: "Program", width: 100 },
    { field: "coursecode", headerName: "Course", width: 100 },
    { field: "examcode", headerName: "Exam", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton
            color="primary"
            onClick={() => handleEdit(row)}
            size="small"
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(row._id)}
            size="small"
          >
            <Delete />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/detailedview1/${row._id}`)}
          >
            View
          </Button>
        </Stack>
      ),
    },
  ];

  // Array input template - only for internal marks
  const arrayStructures = {
    internalmarks: {
      internalexamname: "",
      internalfull: 0,
      internalobtainmark: 0,
    },
  };

  return (
    <Container maxWidth="lg">
      {/* Filter Section */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Filter Rubric Data
        </Typography>
        <Grid container spacing={2}>
          {filterFields.map((field) => (
            <Grid item xs={12} sm={6} md={2} key={field.name}>
              <TextField
                label={field.label}
                name={field.name}
                value={filters[field.name]}
                onChange={handleFilterChange}
                size="small"
                fullWidth
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              onClick={handleApplyFilter}
              variant="contained"
              color="primary"
              fullWidth
              sx={{ height: "100%" }}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* DataGrid Section with Add Button */}
      <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Rubric Exam Data
          </Typography>
          <Button
            startIcon={<Add />}
            onClick={handleAdd}
            variant="contained"
            disabled={!filterApplied} // Disabled until filters are applied
            sx={{
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            Add
          </Button>
        </Box>
        
        <DataGrid
          rows={filterApplied ? rubrics : []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pagination
          pageSizeOptions={[10, 20, 50]}
          autoHeight
          sx={{
            "& .MuiDataGrid-row": { fontSize: "1rem" },
            "& .MuiDataGrid-columnHeader": {
              fontWeight: 700,
              fontSize: "1rem",
            },
          }}
        />
      </Paper>

      {/* Dialog for Add/Edit */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setForm({ ...initialForm });
          setEditId(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? "Update" : "Create"} Rubric
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Reg No"
                name="regno"
                value={form.regno}
                onChange={handleChange}
              />
              <Button
                onClick={handleSearchStudent}
                size="small"
                sx={{ mt: 1 }}
                variant="outlined"
              >
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
                label="Program Code"
                name="programcode"
                value={form.programcode}
                onChange={handleChange} // Allow editing for manual entry
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

            {/* Internal Marks - Only section remaining */}
            <Grid item xs={12} mt={2}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Internal Marks
              </Typography>
              {form.internalmarks.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 1,
                    border: "1px solid #eee",
                    p: 2,
                    borderRadius: 1,
                    background: "#f4f6fb",
                  }}
                >
                  <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                    <TextField
                      label="Internal Exam Name"
                      name="internalexamname"
                      value={item.internalexamname}
                      onChange={(e) =>
                        handleArrayChange(e, index, "internalmarks")
                      }
                    />
                    <TextField
                      label="Internal Full"
                      name="internalfull"
                      value={item.internalfull}
                      onChange={(e) =>
                        handleArrayChange(e, index, "internalmarks")
                      }
                    />
                    <TextField
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
                      color="error"
                      variant="outlined"
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))}
              <Button
                onClick={() =>
                  handleAddArrayItem(
                    "internalmarks",
                    arrayStructures.internalmarks
                  )
                }
                sx={{ my: 1 }}
              >
                Add Internal Marks
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setForm({ ...initialForm });
              setEditId(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RubricExamPage1;
