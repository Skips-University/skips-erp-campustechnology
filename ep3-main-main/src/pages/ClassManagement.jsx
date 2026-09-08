import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add,
  Edit,
  Delete,
  Group,
  People,
  CalendarToday,
  Schedule,
  ArrowBack,
} from "@mui/icons-material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";

const filterFields = [
  { label: "Program Code", name: "programcode" },
  { label: "Course Code", name: "coursecode" },
  { label: "Year", name: "year" },
  { label: "Semester", name: "semester" },
  { label: "Section", name: "section" },
];

export default function ClassManagement() {
  const initialForm = {
    name: global1.name || "",
    user: global1.user || "",
    colid: global1.colid || "",
    year: "",
    program: "",
    programcode: "",
    course: "",
    coursecode: "",
    semester: "",
    section: "",
    classdate: null,
    classtime: "",
    topic: "",
    module: "",
    link: "",
    classtype: "Online",
    status1: "Active",
    comments: "",
  };
  const navigate = useNavigate();
  const [allClasses, setAllClasses] = useState([]);
  const [displayClasses, setDisplayClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    programcode: "",
    coursecode: "",
    year: "",
    semester: "",
    section: "",
  });
  const [filterApplied, setFilterApplied] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);

  // Fetch ALL classes based on filters
  const fetchAllClasses = async () => {
    setLoading(true);
    const params = { ...filters, colid: global1.colid };

    try {
      const res = await ep1.get("/api/v2/getallclasses", { params });
      setAllClasses(res.data);
      setDisplayClasses(res.data);
    } catch (error) {
      setAllClasses([]);
      setDisplayClasses([]);
    }
    setLoading(false);
  };

  const filterClassesByDate = (date) => {
    if (!date || !allClasses.length) {
      setDisplayClasses(allClasses);
      return;
    }

    const selectedDateStr = dayjs(date).format("YYYY-MM-DD");
    const filteredClasses = allClasses.filter((classItem) => {
      const classDateStr = dayjs(classItem.classdate).format("YYYY-MM-DD");
      return classDateStr === selectedDateStr;
    });

    setDisplayClasses(filteredClasses);
  };

  const handleApplyFilter = () => {
    setFilterApplied(true);
    setSelectedDate(null);
    fetchAllClasses();
  };

  const handleCalendarDateChange = (newDate) => {
    setSelectedDate(newDate);
    filterClassesByDate(newDate);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormDateChange = (date) => {
    setForm({ ...form, classdate: date });
  };

  const handleSubmit = async () => {
    const endpoint = editId
      ? `/api/v2/updateclass?id=${editId}`
      : "/api/v2/createclassds";
    const formData = {
      ...form,
      classdate: form.classdate ? form.classdate.toDate() : null,
      colid: parseInt(global1.colid),
    };

    await ep1.post(endpoint, formData);
    setOpen(false);
    fetchAllClasses();
    setForm(initialForm);
    setEditId(null);
  };

  const handleEdit = (row) => {
    setForm({
      ...row,
      classdate: row.classdate ? dayjs(row.classdate) : null,
    });
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await ep1.get(`/api/v2/deleteclassds?id=${id}`);
    fetchAllClasses();
  };

  const handleAdd = () => {
    const preFilledForm = {
      ...initialForm,
      ...filters,
      course: filters.coursecode || "",
      program: filters.programcode || "",
      classdate: selectedDate || null,
    };
    setForm(preFilledForm);
    setEditId(null);
    setOpen(true);
  };

  const handleNavigateToEnrollment = (classData) => {
    navigate("/enrollment", {
      state: {
        programcode: classData.programcode,
        coursecode: classData.coursecode,
        year: classData.year,
        semester: classData.semester,
      },
    });
  };

  const handleNavigateToAttendance = (classData) => {
    navigate("/attendance", {
      state: {
        classId: classData._id,
        programcode: classData.programcode,
        coursecode: classData.coursecode,
        year: classData.year,
        semester: classData.semester,
        classdate: classData.classdate,
        topic: classData.topic,
        classtime: classData.classtime,
      },
    });
  };

  const handleNavigateToSupplementary = (classData) => {
    navigate("/supplementaryattendanceds", {
      state: {
        classId: classData._id,
        programcode: classData.programcode,
        coursecode: classData.coursecode,
        year: classData.year,
        semester: classData.semester,
        classdate: classData.classdate,
        topic: classData.topic,
        classtime: classData.classtime,
      },
    });
  };

  const handleNavigateToRequested = (classData) => {
    navigate("/requestedattendanceds", {
      state: {
        classId: classData._id,
        programcode: classData.programcode,
        coursecode: classData.coursecode,
        year: classData.year,
        semester: classData.semester,
        classdate: classData.classdate,
        topic: classData.topic,
        classtime: classData.classtime,
      },
    });
  };

  const columns = [
    {
      field: "classdate",
      headerName: "Date",
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          icon={<CalendarToday />}
          label={dayjs(value).format("DD/MM/YY")}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: "classtime",
      headerName: "Time",
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          icon={<Schedule />}
          label={value}
          size="small"
          color="secondary"
          variant="outlined"
        />
      ),
    },
    {
      field: "topic",
      headerName: "Topic",
      width: 250,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      ),
    },
    { field: "module", headerName: "Module", width: 120 },
    {
      field: "coursecode",
      headerName: "Course",
      width: 100,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color="info" />
      ),
    },
    {
      field: "classtype",
      headerName: "Type",
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          color={
            value === "Online"
              ? "success"
              : value === "Offline"
              ? "warning"
              : "info"
          }
        />
      ),
    },
    // In ClassManagement.jsx, update the actions column:

    {
      field: "actions",
      headerName: "Actions",
      width: 450, // Increase width
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            onClick={() => handleEdit(row)}
            size="small"
            sx={{
              backgroundColor: "primary.light",
              color: "white",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
          >
            <Edit fontSize="small" />
          </Button>

          <Button
            onClick={() => handleDelete(row._id)}
            size="small"
            sx={{
              backgroundColor: "error.light",
              color: "white",
              "&:hover": { backgroundColor: "error.dark" },
            }}
          >
            <Delete fontSize="small" />
          </Button>

          <Button
            onClick={() => handleNavigateToEnrollment(row)}
            sx={{
              fontSize: "0.75rem",
              px: 1,
              py: 0.5,
              minWidth: "auto",
            }}
          >
            Enroll
          </Button>

          <Button
            onClick={() => handleNavigateToAttendance(row)}
            sx={{
              fontSize: "0.75rem",
              px: 1,
              py: 0.5,
              minWidth: "auto",
            }}
          >
            Attend
          </Button>

          {/* NEW BUTTONS */}
          <Button
            onClick={() => handleNavigateToSupplementary(row)}
            sx={{
              fontSize: "0.75rem",
              px: 1,
              py: 0.5,
              minWidth: "auto",
              bgcolor: "success.light",
              color: "white",
              "&:hover": { bgcolor: "success.dark" },
            }}
          >
            Supplementary
          </Button>

          <Button
            onClick={() => handleNavigateToRequested(row)}
            sx={{
              fontSize: "0.75rem",
              px: 1,
              py: 0.5,
              minWidth: "auto",
              bgcolor: "warning.light",
              color: "white",
              "&:hover": { bgcolor: "warning.dark" },
            }}
          >
            Requested
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>
                      Back
                    </Button>
          <Typography
            variant="h3"
            fontWeight={700}
            color="primary.main"
            gutterBottom
          >
            Class Management System
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your classes, schedules and attendance efficiently
          </Typography>
        </Box>

        {/* Filter Section */}
        <Card elevation={4} sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <CalendarToday color="primary" />
              <Typography variant="h6" fontWeight={600} color="primary.main">
                Filter Classes
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {filterFields.map((field) => (
                <Grid item xs={12} sm={6} md={2} key={field.name}>
                  <TextField
                    label={field.label}
                    name={field.name}
                    value={filters[field.name]}
                    onChange={handleFilterChange}
                    size="small"
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              ))}
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  onClick={handleApplyFilter}
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>

            {!filterApplied && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: "info.light",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "info.main",
                }}
              >
                <Typography
                  variant="body2"
                  color="info.dark"
                  textAlign="center"
                >
                  📋 Please apply filters first to load classes and enable
                  calendar features.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Calendar and Classes Section */}
        {filterApplied && (
          <Grid
            container
            spacing={4}
            justifyContent={"center"}
            alignItems={"flex-start"}
          >
            {/* Calendar Section */}
            <Grid item xs={12} lg={4}>
              <Card
                elevation={4}
                sx={{ borderRadius: 3, height: "fit-content" }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Calendar Header */}
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: "primary.main",
                      color: "white",
                      borderRadius: "12px 12px 0 0",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      textAlign="center"
                    >
                      📅 Select Date
                    </Typography>
                  </Box>

                  {/* Calendar Body - CENTERED & LARGER WIDTH */}
                  <Box
                    sx={{
                      p: 4,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <DateCalendar
                      value={selectedDate}
                      onChange={handleCalendarDateChange}
                      sx={{
                        width: "100%",
                        maxWidth: "380px", // Increased width
                        minWidth: "350px", // Minimum width for consistency
                        height: "280px", // Reduced height
                        "& .MuiPickersCalendarHeader-root": {
                          paddingLeft: 1,
                          paddingRight: 1,
                          marginBottom: 1,
                        },
                        "& .MuiDayCalendar-header": {
                          paddingLeft: 0,
                          paddingRight: 0,
                        },
                        "& .MuiDayCalendar-monthContainer": {
                          height: "200px", // Reduced month container height
                        },
                        "& .MuiPickersDay-root": {
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          width: "36px",
                          height: "36px",
                          margin: "2px",
                          "&:hover": {
                            backgroundColor: "primary.light",
                            color: "white",
                          },
                        },
                        "& .MuiPickersDay-today": {
                          backgroundColor: "secondary.main",
                          color: "white",
                          fontWeight: 600,
                          "&:hover": {
                            backgroundColor: "secondary.dark",
                          },
                        },
                        "& .Mui-selected": {
                          backgroundColor: "primary.main",
                          color: "white",
                          fontWeight: 600,
                          "&:hover": {
                            backgroundColor: "primary.dark",
                          },
                        },
                        "& .MuiPickersArrowSwitcher-root": {
                          "& .MuiIconButton-root": {
                            backgroundColor: "primary.light",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "primary.main",
                            },
                          },
                        },
                        "& .MuiPickersCalendarHeader-label": {
                          fontSize: "1.1rem",
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Box>

                  {/* Selected Date Display */}
                  {selectedDate && (
                    <Box sx={{ px: 3, pb: 2 }}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor: "success.light",
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="success.dark"
                        >
                          Selected: {dayjs(selectedDate).format("DD MMMM YYYY")}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Class Count Info */}
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            textAlign: "center",
                            backgroundColor: "info.light",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="info.dark"
                          >
                            {allClasses.length}
                          </Typography>
                          <Typography variant="caption" color="info.dark">
                            Total Classes
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            textAlign: "center",
                            backgroundColor: "warning.light",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="warning.dark"
                          >
                            {displayClasses.length}
                          </Typography>
                          <Typography variant="caption" color="warning.dark">
                            {selectedDate ? "On Date" : "Showing"}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Classes Table Section */}
            <Grid item xs={12} lg={8}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  {/* Table Header */}
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: "secondary.main",
                      color: "white",
                      borderRadius: "12px 12px 0 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        📚 Classes Schedule
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {selectedDate
                          ? `Showing classes for ${dayjs(selectedDate).format(
                              "DD MMMM YYYY"
                            )}`
                          : "Showing all classes"}
                      </Typography>
                    </Box>
                    <Button
                      startIcon={<Add />}
                      onClick={handleAdd}
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        fontWeight: 600,
                      }}
                    >
                      Add Class
                    </Button>
                  </Box>

                  {/* DataGrid */}
                  <Box sx={{ p: 3 }}>
                    <DataGrid
                      rows={displayClasses}
                      columns={columns}
                      getRowId={(row) => row._id}
                      loading={loading}
                      autoHeight
                      pageSizeOptions={[5, 10, 20]}
                      initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                      }}
                      sx={{
                        border: "none",
                        "& .MuiDataGrid-root": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell": {
                          borderBottom: "1px solid #f0f0f0",
                          fontSize: "0.9rem",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          backgroundColor: "#f8f9fa",
                          borderBottom: "2px solid #e9ecef",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "#495057",
                        },
                        "& .MuiDataGrid-row": {
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                          },
                          "&:nth-of-type(even)": {
                            backgroundColor: "#fafbfc",
                          },
                        },
                        "& .MuiDataGrid-footerContainer": {
                          borderTop: "2px solid #e9ecef",
                          backgroundColor: "#f8f9fa",
                        },
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                      slots={{
                        noRowsOverlay: () => (
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="300px"
                            flexDirection="column"
                            gap={2}
                          >
                            <Typography variant="h6" color="text.secondary">
                              📅 No Classes Found
                            </Typography>
                            <Typography
                              color="text.secondary"
                              textAlign="center"
                            >
                              {selectedDate
                                ? `No classes scheduled for ${dayjs(
                                    selectedDate
                                  ).format("DD MMMM YYYY")}`
                                : "No classes match your current filters"}
                            </Typography>
                            {loading && (
                              <Typography variant="body2" color="primary">
                                Loading classes...
                              </Typography>
                            )}
                          </Box>
                        ),
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Add/Edit Class Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: 700,
              fontSize: "1.25rem",
            }}
          >
            {editId ? "✏️ Update Class" : "➕ Create New Class"}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  label="Program Code"
                  name="programcode"
                  value={form.programcode}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Course Code"
                  name="coursecode"
                  value={form.coursecode}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Semester"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Section"
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Class Date"
                  value={form.classdate}
                  onChange={handleFormDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Class Time"
                  name="classtime"
                  value={form.classtime}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., 10:00 AM - 11:00 AM"
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Topic"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Module"
                  name="module"
                  value={form.module}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Class Type"
                  name="classtype"
                  value={form.classtype}
                  onChange={handleChange}
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                >
                  <option value="Online">🌐 Online</option>
                  <option value="Offline">🏫 Offline</option>
                  <option value="Hybrid">🔄 Hybrid</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Meeting Link"
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  fullWidth
                  placeholder="https://meet.google.com/..."
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setOpen(false)}
              variant="outlined"
              size="large"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="large"
              sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
            >
              {editId ? "Update Class" : "Create Class"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
