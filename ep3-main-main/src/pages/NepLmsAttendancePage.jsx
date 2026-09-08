import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Delete, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const assignmentFilterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course Code" },
  { field: "subject", label: "Major" },
  { field: "semester", label: "Semester" },
  { field: "facultydepartment", label: "Department" },
  { field: "status", label: "Status" }
];

const studentFilterFields = [
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "regno", label: "Reg No" },
  { field: "programcode", label: "Program Code" },
  { field: "academicyear", label: "Academic Year" },
  { field: "Major", label: "Major" },
  { field: "semester", label: "Semester" },
  { field: "section", label: "Section" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" }
];

const makeFilter = (field = "academicyear") => ({ id: `${Date.now()}-${Math.random()}`, field, value: "" });
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));
const cleanText = (value) => String(value || "").trim().toLowerCase();
const fieldsMatch = (left, right) => cleanText(left) === cleanText(right);
const optionalFieldsMatch = (left, right) => !cleanText(left) || !cleanText(right) || fieldsMatch(left, right);
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const toDateInput = (date) => {
  const value = date instanceof Date ? date : new Date();
  if (Number.isNaN(value.getTime())) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const monthTitle = (year, month) => new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
const dateTitle = (date) => date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const weekTitle = (start, end) => `${start.toLocaleDateString(undefined, { day: "numeric", month: "short" })} - ${end.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NepLmsAttendancePage({ sectionMode = false, pageTitle = "Attendance", raiseActivityEvent = false }) {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classFilters, setClassFilters] = useState([makeFilter()]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentFilters, setStudentFilters] = useState([makeFilter("name")]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [attendanceMap, setAttendanceMap] = useState({});
  const [attendanceType, setAttendanceType] = useState("Regular");
  const [selectedSection, setSelectedSection] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [calendarView, setCalendarView] = useState("month");
  const [calendarDate, setCalendarDate] = useState(toDateInput(new Date()));

  useEffect(() => {
    loadContext();
  }, []);

  useEffect(() => {
    if (selectedClass) loadStudents(selectedClass);
  }, [selectedClass, attendanceType]);

  const loadContext = async () => {
    try {
      setLoading(true);
      setError("");
      const [workloadRes, timetableRes] = await Promise.all([
        ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid } })
      ]);
      const currentUser = cleanText(global1.user);
      const requestedClassId = new URLSearchParams(window.location.search).get("classid");
      const assignedRows = (workloadRes.data?.data || []).filter((row) => (
        currentUser && cleanText(row.facultyemail) === currentUser
      ));
      const classRows = timetableRes.data?.data || [];
      setAssignments(assignedRows);
      setClasses(classRows);
      if (requestedClassId) {
        const requestedClass = classRows.find((classRow) => classRow._id === requestedClassId && assignedRows.some((assignment) => {
          const classFacultyEmail = cleanText(classRow.facultyemail);
          if (classFacultyEmail && classFacultyEmail !== currentUser) return false;
          return fieldsMatch(assignment.academicyear, classRow.academicyear)
            && fieldsMatch(assignment.programcode, classRow.programcode)
            && optionalFieldsMatch(assignment.regulation, classRow.regulation)
            && optionalFieldsMatch(assignment.program, classRow.program)
            && fieldsMatch(assignment.subject, classRow.major)
            && fieldsMatch(assignment.semester, classRow.semester)
            && fieldsMatch(assignment.coursecode, classRow.coursecode)
            && (!classFacultyEmail || fieldsMatch(assignment.facultyemail, classRow.facultyemail));
        }));
        if (requestedClass) {
          setSelectedClass(requestedClass);
          setCalendarDate(requestedClass.classdate || calendarDate);
        }
      }
      if (!assignedRows.length) {
        setError(`No assigned courses found for faculty email ${global1.user || "-"}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load attendance context");
    } finally {
      setLoading(false);
    }
  };

  const valueOptions = (rows, field) => uniqueSorted(rows.map((row) => row[field]));

  const applyFilters = (rows, filters) => rows.filter((row) => filters.every((filter) => {
    if (!filter.field || !filter.value) return true;
    return String(row[filter.field] || "").toLowerCase() === String(filter.value).toLowerCase();
  }));

  const filteredAssignments = useMemo(() => applyFilters(assignments, classFilters), [assignments, classFilters]);

  const matchedClasses = useMemo(() => {
    if (!filteredAssignments.length) return [];
    const currentUser = cleanText(global1.user);
    return classes.filter((classRow) => {
      const classFacultyEmail = cleanText(classRow.facultyemail);
      if (classFacultyEmail && classFacultyEmail !== currentUser) return false;

      return filteredAssignments.some((assignment) => (
        fieldsMatch(assignment.academicyear, classRow.academicyear)
        && fieldsMatch(assignment.programcode, classRow.programcode)
        && optionalFieldsMatch(assignment.regulation, classRow.regulation)
        && optionalFieldsMatch(assignment.program, classRow.program)
        && fieldsMatch(assignment.subject, classRow.major)
        && fieldsMatch(assignment.semester, classRow.semester)
        && fieldsMatch(assignment.coursecode, classRow.coursecode)
        && (!classFacultyEmail || fieldsMatch(assignment.facultyemail, classRow.facultyemail))
      ));
    });
  }, [classes, filteredAssignments]);

  const sectionOptions = useMemo(() => uniqueSorted(matchedClasses.map((row) => row.section)), [matchedClasses]);

  const filteredClasses = useMemo(() => (
    sectionMode && selectedSection
      ? matchedClasses.filter((row) => fieldsMatch(row.section, selectedSection))
      : matchedClasses
  ), [matchedClasses, sectionMode, selectedSection]);

  const filteredStudents = useMemo(() => applyFilters(students, studentFilters), [students, studentFilters]);

  const assignmentSummary = useMemo(() => ({
    courses: uniqueSorted(filteredAssignments.map((row) => row.coursecode)).length,
    years: uniqueSorted(filteredAssignments.map((row) => row.academicyear)).join(", "),
    majors: uniqueSorted(filteredAssignments.map((row) => row.subject)).length
  }), [filteredAssignments]);

  const calendarData = useMemo(() => {
    const selectedDate = parseDate(calendarDate) || new Date();
    const classMap = new Map();
    filteredClasses.forEach((row) => {
      const parsed = parseDate(row.classdate);
      if (!parsed) return;
      const key = toDateInput(parsed);
      if (!classMap.has(key)) classMap.set(key, []);
      classMap.get(key).push(row);
    });

    const makeCell = (date, blank = false) => {
      const key = toDateInput(date);
      return {
        key: blank ? `blank-${key}` : key,
        blank,
        date: key,
        day: date.getDate(),
        label: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        weekday: weekdayLabels[date.getDay()],
        isToday: key === toDateInput(new Date()),
        selected: key === calendarDate,
        items: (classMap.get(key) || []).sort((a, b) => String(a.classtime).localeCompare(String(b.classtime)))
      };
    };

    if (calendarView === "day") {
      return {
        title: dateTitle(selectedDate),
        columns: 1,
        labels: [selectedDate.toLocaleDateString(undefined, { weekday: "long" })],
        cells: [makeCell(selectedDate)]
      };
    }

    if (calendarView === "week") {
      const start = new Date(selectedDate);
      start.setDate(selectedDate.getDate() - selectedDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const cells = [];
      for (let index = 0; index < 7; index += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        cells.push(makeCell(date));
      }
      return {
        title: weekTitle(start, end),
        columns: 7,
        labels: weekdayLabels,
        cells
      };
    }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let index = 0; index < firstDay; index += 1) {
      const date = new Date(year, month, index - firstDay + 1);
      cells.push(makeCell(date, true));
    }
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(makeCell(new Date(year, month, day)));
    }
    while (cells.length % 7 !== 0) {
      const date = new Date(year, month, totalDays + (cells.length % 7));
      cells.push(makeCell(date, true));
    }
    return {
      title: monthTitle(year, month),
      columns: 7,
      labels: weekdayLabels,
      cells
    };
  }, [filteredClasses, calendarDate, calendarView]);

  const shiftCalendar = (direction) => {
    const current = parseDate(calendarDate) || new Date();
    const next = new Date(current);
    if (calendarView === "day") next.setDate(current.getDate() + direction);
    if (calendarView === "week") next.setDate(current.getDate() + (direction * 7));
    if (calendarView === "month") next.setMonth(current.getMonth() + direction);
    setCalendarDate(toDateInput(next));
  };

  const updateFilter = (setter) => (id, key, value) => {
    setter((prev) => prev.map((filter) => filter.id === id ? { ...filter, [key]: value, ...(key === "field" ? { value: "" } : {}) } : filter));
  };

  const removeFilter = (setter, defaultField) => (id) => {
    setter((prev) => prev.length === 1 ? [makeFilter(defaultField)] : prev.filter((filter) => filter.id !== id));
  };

  const loadStudents = async (row) => {
    try {
      setStudentLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/attendance/students", {
        params: {
          colid: global1.colid,
          classid: row._id,
          type: attendanceType,
          academicyear: row.academicyear,
          semester: row.semester,
          major: row.major,
          programcode: row.programcode,
          section: sectionMode ? row.section : ""
        }
      });
      const list = res.data?.data || [];
      setStudents(list);
      const nextSelected = {};
      const nextAttendance = {};
      list.forEach((student) => {
        nextSelected[student._id] = true;
        nextAttendance[student._id] = student.existingAttendance === 0 ? 0 : 1;
      });
      setSelectedStudents(nextSelected);
      setAttendanceMap(nextAttendance);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setStudentLoading(false);
    }
  };

  const setAllSelected = (value) => {
    const next = {};
    filteredStudents.forEach((student) => { next[student._id] = value; });
    setSelectedStudents((prev) => ({ ...prev, ...next }));
  };

  const setAllAttendance = (value) => {
    const next = {};
    filteredStudents.forEach((student) => { next[student._id] = value; });
    setAttendanceMap((prev) => ({ ...prev, ...next }));
  };

  const saveAttendance = async () => {
    if (!selectedClass) {
      setError("Select a class first");
      return;
    }
    const selected = students
      .filter((student) => selectedStudents[student._id])
      .map((student) => ({ ...student, studentid: student._id, attendance: attendanceMap[student._id] === 0 ? 0 : 1 }));
    if (!selected.length) {
      setError("Select at least one student");
      return;
    }
    try {
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/attendance", {
        colid: global1.colid,
        user: global1.user,
        classInfo: selectedClass,
        type: attendanceType,
        comments,
        raiseActivityEvent,
        students: selected
      });
      setMessage(`${res.data?.saved || 0} attendance records saved`);
      loadStudents(selectedClass);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save attendance");
    }
  };

  const selectedCount = filteredStudents.filter((student) => selectedStudents[student._id]).length;
  const presentCount = filteredStudents.filter((student) => selectedStudents[student._id] && attendanceMap[student._id] !== 0).length;
  const absentCount = selectedCount - presentCount;
  const studentSelectionModel = filteredStudents.filter((student) => selectedStudents[student._id]).map((student) => student._id);
  const studentGridRows = filteredStudents.map((student) => ({
    ...student,
    id: student._id,
    attendancestatus: attendanceMap[student._id] === 0 ? "Absent" : "Present"
  }));
  const studentColumns = [
    { field: "name", headerName: "Name", minWidth: 190, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "rollno", headerName: "Roll No", minWidth: 120 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 140 },
    { field: "program", headerName: "Program", minWidth: 180 },
    { field: "programcode", headerName: "Program Code", minWidth: 140 },
    { field: "academicyear", headerName: "Academic Year", minWidth: 140 },
    { field: "semester", headerName: "Semester", minWidth: 110 },
    { field: "section", headerName: "Section", minWidth: 110 },
    { field: "Major", headerName: "Major", minWidth: 180 },
    { field: "category", headerName: "Category", minWidth: 130 },
    { field: "gender", headerName: "Gender", minWidth: 130 },
    { field: "attendancestatus", headerName: "Attendance", minWidth: 130 },
    {
      field: "markattendance",
      headerName: "Present / Absent",
      minWidth: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const present = attendanceMap[params.row._id] !== 0;
        return (
          <Stack direction="row" alignItems="center" spacing={1} onClick={(event) => event.stopPropagation()}>
            <Typography variant="caption" fontWeight={700} color={present ? "success.main" : "error.main"}>
              {present ? "Present" : "Absent"}
            </Typography>
            <Switch
              size="small"
              checked={present}
              color="success"
              onChange={(event) => setAttendanceMap((prev) => ({ ...prev, [params.row._id]: event.target.checked ? 1 : 0 }))}
            />
          </Stack>
        );
      }
    }
  ];

  const renderFilterPanel = ({ title, filters, fields, rows, onAdd, onUpdate, onRemove }) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={onAdd}>Add Filter</Button>
      </Stack>
      <Grid container spacing={2}>
        {filters.map((filter) => {
          const fieldMeta = fields.find((item) => item.field === filter.field);
          return (
            <React.Fragment key={filter.id}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select label="Field" value={filter.field} onChange={(event) => onUpdate(filter.id, "field", event.target.value)}>
                    {fields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                {fieldMeta?.type === "date" ? (
                  <TextField
                    fullWidth
                    type="date"
                    label="Value"
                    value={filter.value}
                    onChange={(event) => onUpdate(filter.id, "value", event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                ) : (
                  <FormControl fullWidth>
                    <InputLabel>Value</InputLabel>
                    <Select label="Value" value={filter.value} onChange={(event) => onUpdate(filter.id, "value", event.target.value)}>
                      <MenuItem value="">All</MenuItem>
                      {valueOptions(rows, filter.field).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => onRemove(filter.id)} sx={{ height: 56 }}>Remove</Button>
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
    </Paper>
  );

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{pageTitle}</Typography>
          <Typography variant="body2" color="text.secondary">Select assigned classes, load students and mark present or absent.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Back</Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadContext}>Reload</Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Assigned Courses: ${assignmentSummary.courses}`} />
          <Chip label={`Majors: ${assignmentSummary.majors}`} />
          <Chip label={`Years: ${assignmentSummary.years || "-"}`} />
          <Chip label={`Classes: ${filteredClasses.length}`} />
          {loading && <Chip color="warning" label="Loading..." />}
        </Stack>
      </Paper>

      {renderFilterPanel({
        title: "Assigned Course Filters",
        filters: classFilters,
        fields: assignmentFilterFields,
        rows: assignments,
        onAdd: () => setClassFilters((prev) => [...prev, makeFilter()]),
        onUpdate: updateFilter(setClassFilters),
        onRemove: removeFilter(setClassFilters, "academicyear")
      })}

      {sectionMode && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select label="Section" value={selectedSection} onChange={(event) => {
                  setSelectedSection(event.target.value);
                  setSelectedClass(null);
                  setStudents([]);
                }}>
                  <MenuItem value="">All</MenuItem>
                  {sectionOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography color="text.secondary">Classes and students will be filtered by the selected section.</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Assigned Courses</Typography>
          <Chip label={`${filteredAssignments.length} courses`} />
        </Stack>
        {filteredAssignments.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center", border: "1px dashed #cbd5e1" }}>
            <Typography variant="body2">No assigned courses found for the selected filters.</Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {filteredAssignments.map((assignment) => (
              <Grid item xs={12} md={6} lg={4} key={assignment._id}>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f8fafc" }}>
                  <Typography fontWeight={800}>{assignment.coursecode} - {assignment.course}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {assignment.academicyear} | {assignment.programcode || assignment.program} | Sem {assignment.semester}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Major: {assignment.subject || "-"} | Faculty: {assignment.facultyname || "-"}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">Class Calendar</Typography>
            <Typography variant="body2" color="text.secondary">Monthly view is selected by default. Switch the view or choose a date to navigate.</Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
            <Button variant="outlined" onClick={() => shiftCalendar(-1)}>Previous</Button>
            <TextField
              type="date"
              label="Select date"
              value={calendarDate}
              onChange={(event) => setCalendarDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>View</InputLabel>
              <Select label="View" value={calendarView} onChange={(event) => setCalendarView(event.target.value)}>
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={() => shiftCalendar(1)}>Next</Button>
          </Stack>
        </Stack>
        {filteredClasses.length === 0 && (
          <Box sx={{ p: 2, textAlign: "center", border: "1px dashed #cbd5e1" }}>
            <Typography variant="body2">No timetable classes found for the selected filters.</Typography>
          </Box>
        )}
        {filteredClasses.length > 0 && (
          <Box sx={{ border: "1px solid #cbd5e1", overflowX: "auto" }}>
            <Box sx={{ bgcolor: "#102a43", color: "#fff", textAlign: "center", py: 1 }}>
              <Typography fontWeight={800}>{calendarData.title}</Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${calendarData.columns}, minmax(${calendarView === "day" ? 280 : 145}px, 1fr))`, minWidth: calendarView === "day" ? 360 : 1015 }}>
              {calendarData.labels.map((label) => (
                <Box key={label} sx={{ bgcolor: "#e5edf5", p: 0.75, textAlign: "center", borderRight: "1px solid #cbd5e1" }}>
                  <Typography variant="caption" fontWeight={800}>{label}</Typography>
                </Box>
              ))}
              {calendarData.cells.map((cell) => (
                <Box
                  key={cell.key}
                  onClick={() => !cell.blank && setCalendarDate(cell.date)}
                  sx={{
                    minHeight: calendarView === "day" ? 420 : calendarView === "week" ? 250 : 135,
                    p: 0.75,
                    borderRight: "1px solid #e2e8f0",
                    borderBottom: "1px solid #e2e8f0",
                    bgcolor: cell.blank ? "#f8fafc" : cell.selected ? "#eff6ff" : "#fff",
                    outline: cell.selected ? "2px solid #2563eb" : "none",
                    outlineOffset: "-2px",
                    cursor: cell.blank ? "default" : "pointer"
                  }}
                >
                  {!cell.blank && (
                    <>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={900}>{calendarView === "month" ? cell.day : cell.label}</Typography>
                        {cell.isToday && <Chip size="small" color="primary" label="Today" sx={{ height: 20 }} />}
                      </Stack>
                      <Stack spacing={0.5}>
                        {cell.items.length === 0 && (
                          <Typography variant="caption" color="text.secondary">No class</Typography>
                        )}
                        {cell.items.map((item) => {
                          const active = selectedClass?._id === item._id;
                          return (
                            <Box
                              key={item._id}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedClass(item);
                              }}
                              sx={{
                                cursor: "pointer",
                                bgcolor: active ? "#dcfce7" : "#eef2ff",
                                border: active ? "1px solid #16a34a" : "1px solid #c7d2fe",
                                borderLeft: active ? "4px solid #16a34a" : "4px solid #4f46e5",
                                borderRadius: 1,
                                px: 0.8,
                                py: 0.6
                              }}
                            >
                              <Typography variant="caption" fontWeight={900} display="block">{item.classtime || "-"} | {item.coursecode}</Typography>
                              <Typography variant="caption" display="block">{item.course || item.topic || "-"}</Typography>
                              <Typography variant="caption" display="block" color="text.secondary">Sem {item.semester} | {item.major}</Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {selectedClass && (
        <>
          <Paper sx={{ p: 2, mb: 2, borderLeft: "5px solid #2563eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h6">{selectedClass.coursecode} - {selectedClass.course}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedClass.classdate} {selectedClass.classtime} | {selectedClass.programcode || selectedClass.program} | Sem {selectedClass.semester} | {selectedClass.major}
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Type</InputLabel>
                  <Select label="Type" value={attendanceType} onChange={(event) => setAttendanceType(event.target.value)}>
                    <MenuItem value="Regular">Regular</MenuItem>
                    <MenuItem value="Supplementary">Supplementary</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Comments" value={comments} onChange={(event) => setComments(event.target.value)} sx={{ minWidth: 260 }} />
              </Stack>
            </Stack>
          </Paper>

          {renderFilterPanel({
            title: "Student Filters",
            filters: studentFilters,
            fields: studentFilterFields,
            rows: students,
            onAdd: () => setStudentFilters((prev) => [...prev, makeFilter("name")]),
            onUpdate: updateFilter(setStudentFilters),
            onRemove: removeFilter(setStudentFilters, "name")
          })}

          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Students: ${filteredStudents.length}`} />
                <Chip color="primary" label={`Selected: ${selectedCount}`} />
                <Chip color="success" label={`Present: ${presentCount}`} />
                <Chip color="error" label={`Absent: ${absentCount}`} />
                {studentLoading && <Chip color="warning" label="Loading students..." />}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="outlined" onClick={() => setAllSelected(true)}>Select All</Button>
                <Button variant="outlined" onClick={() => setAllSelected(false)}>Deselect All</Button>
                <Button variant="outlined" color="success" onClick={() => setAllAttendance(1)}>All Present</Button>
                <Button variant="outlined" color="error" onClick={() => setAllAttendance(0)}>All Absent</Button>
                <Button variant="contained" startIcon={<Save />} onClick={saveAttendance}>Save Attendance</Button>
              </Stack>
            </Stack>

            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={studentGridRows}
                columns={studentColumns}
                loading={studentLoading}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={studentSelectionModel}
                onRowSelectionModelChange={(model) => {
                  const selectedIds = new Set(model.map((id) => String(id)));
                  setSelectedStudents((prev) => {
                    const next = { ...prev };
                    filteredStudents.forEach((student) => {
                      next[student._id] = selectedIds.has(String(student._id));
                    });
                    return next;
                  });
                }}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    csvOptions: { fileName: "nep_lms_attendance_students" },
                    printOptions: { disableToolbarButton: false }
                  }
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                sx={{
                  minWidth: 1500,
                  "& .MuiDataGrid-row": { bgcolor: "#fff" },
                  "& .MuiDataGrid-row.Mui-selected": { bgcolor: "#eff6ff" },
                  "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc", fontWeight: 800 }
                }}
              />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}

export function NepLmsSectionwiseAttendancePage() {
  return <NepLmsAttendancePage sectionMode pageTitle="Sectionwise Attendance" />;
}
