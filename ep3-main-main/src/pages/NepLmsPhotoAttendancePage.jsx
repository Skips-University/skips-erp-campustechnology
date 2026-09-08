import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { AutoAwesome, Refresh, Save, UploadFile } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const cleanText = (value) => String(value || "").trim().toLowerCase();
const fieldsMatch = (left, right) => cleanText(left) === cleanText(right);
const optionalFieldsMatch = (left, right) => !cleanText(left) || !cleanText(right) || fieldsMatch(left, right);
const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const toDateInput = (date) => {
  const value = date instanceof Date ? date : new Date();
  if (Number.isNaN(value.getTime())) return "";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};
const monthTitle = (year, month) => new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
const dateTitle = (date) => date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const weekTitle = (start, end) => `${start.toLocaleDateString(undefined, { day: "numeric", month: "short" })} - ${end.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const filterFields = [
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "regno", label: "Reg No" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" },
  { field: "section", label: "Section" }
];

const makeFilter = (field = "name") => ({ id: `${Date.now()}-${Math.random()}`, field, value: "" });

export default function NepLmsPhotoAttendancePage() {
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", programcode: "", coursecode: "", semester: "" });
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [studentFilters, setStudentFilters] = useState([makeFilter()]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupPhotos, setGroupPhotos] = useState([]);
  const [analysisRows, setAnalysisRows] = useState([]);
  const [attendanceType, setAttendanceType] = useState("Regular");
  const [comments, setComments] = useState("Photo attendance");
  const [groupPhotoUrl, setGroupPhotoUrl] = useState("");
  const [groupPhotoUrls, setGroupPhotoUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [calendarView, setCalendarView] = useState("month");
  const [calendarDate, setCalendarDate] = useState(toDateInput(new Date()));

  const selectedClass = useMemo(() => classes.find((row) => row._id === selectedClassId) || null, [classes, selectedClassId]);

  useEffect(() => {
    loadContext();
  }, []);

  useEffect(() => {
    if (selectedClass) loadStudents(selectedClass);
  }, [selectedClassId, attendanceType]);

  const loadContext = async () => {
    setLoading(true);
    setError("");
    try {
      const [workloadRes, timetableRes] = await Promise.all([
        ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid } })
      ]);
      const currentUser = cleanText(global1.user);
      const requestedClassId = new URLSearchParams(window.location.search).get("classid");
      const assignedRows = (workloadRes.data?.data || []).filter((row) => currentUser && cleanText(row.facultyemail) === currentUser);
      const classRows = timetableRes.data?.data || [];
      const facultyClasses = classRows.filter((classRow) => {
        const classFacultyEmail = cleanText(classRow.facultyemail);
        if (classFacultyEmail && classFacultyEmail !== currentUser) return false;
        return assignedRows.some((assignment) => (
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
      setClasses(facultyClasses);
      if (requestedClassId) {
        const requestedClass = facultyClasses.find((row) => row._id === requestedClassId);
        if (requestedClass) {
          setSelectedClassId(requestedClass._id);
          setCalendarDate(requestedClass.classdate || calendarDate);
        }
      }
      if (!assignedRows.length) setError(`No assigned courses found for ${global1.user || "-"}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load classes.");
    } finally {
      setLoading(false);
    }
  };

  const optionValues = useMemo(() => ({
    academicyear: uniqueSorted(classes.map((row) => row.academicyear)),
    programcode: uniqueSorted(classes.map((row) => row.programcode)),
    coursecode: uniqueSorted(classes.map((row) => row.coursecode)),
    semester: uniqueSorted(classes.map((row) => row.semester))
  }), [classes]);

  const filteredClasses = useMemo(() => classes.filter((row) => (
    (!filters.academicyear || row.academicyear === filters.academicyear)
    && (!filters.programcode || row.programcode === filters.programcode)
    && (!filters.coursecode || row.coursecode === filters.coursecode)
    && (!filters.semester || row.semester === filters.semester)
  )), [classes, filters]);

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
      return { title: weekTitle(start, end), columns: 7, labels: weekdayLabels, cells };
    }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let index = 0; index < firstDay; index += 1) {
      cells.push(makeCell(new Date(year, month, index - firstDay + 1), true));
    }
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(makeCell(new Date(year, month, day)));
    }
    while (cells.length % 7 !== 0) {
      cells.push(makeCell(new Date(year, month, totalDays + (cells.length % 7)), true));
    }
    return { title: monthTitle(year, month), columns: 7, labels: weekdayLabels, cells };
  }, [calendarDate, calendarView, filteredClasses]);

  const shiftCalendar = (direction) => {
    const current = parseDate(calendarDate) || new Date();
    const next = new Date(current);
    if (calendarView === "day") next.setDate(current.getDate() + direction);
    if (calendarView === "week") next.setDate(current.getDate() + (direction * 7));
    if (calendarView === "month") next.setMonth(current.getMonth() + direction);
    setCalendarDate(toDateInput(next));
  };

  const filteredStudents = useMemo(() => students.filter((row) => studentFilters.every((filter) => {
    if (!filter.field || !filter.value) return true;
    return String(row[filter.field] || "").toLowerCase().includes(String(filter.value).toLowerCase());
  })), [students, studentFilters]);

  const loadStudents = async (row) => {
    setStudentLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/neplms/attendance/students", {
        params: {
          colid: global1.colid,
          classid: row._id,
          type: attendanceType,
          academicyear: row.academicyear,
          semester: row.semester,
          major: row.major,
          programcode: row.programcode
        }
      });
      const data = res.data?.data || [];
      setStudents(data);
      setSelectedIds(data.map((student) => student._id));
      setAnalysisRows([]);
    } catch (err) {
      setStudents([]);
      setSelectedIds([]);
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setStudentLoading(false);
    }
  };

  const updateStudentFilter = (id, key, value) => {
    setStudentFilters((prev) => prev.map((item) => item.id === id ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item));
  };

  const analyzePhoto = async () => {
    if (!selectedClass) {
      setError("Please select a class.");
      return;
    }
    if (!groupPhotos.length) {
      setError("Please upload at least one group photo.");
      return;
    }
    const selectedStudents = students.filter((student) => selectedIds.includes(student._id));
    if (!selectedStudents.length) {
      setError("Please select students.");
      return;
    }
    setAnalyzing(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      groupPhotos.forEach((photo) => form.append("files", photo));
      form.append("colid", global1.colid);
      form.append("user", global1.user || "");
      form.append("classInfo", JSON.stringify(selectedClass));
      form.append("type", attendanceType);
      form.append("students", JSON.stringify(selectedStudents.map((student) => ({ ...student, studentid: student._id }))));
      const res = await ep1.post("/api/v2/neplms/photo-attendance/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const data = res.data?.data || [];
      setAnalysisRows(data);
      setGroupPhotoUrl(res.data?.groupPhotoUrl || "");
      setGroupPhotoUrls(res.data?.groupPhotoUrls || (res.data?.groupPhotoUrl ? [res.data.groupPhotoUrl] : []));
      setMessage(`Analysis completed for ${data.length} students. Please review and confirm.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to analyze group photo.");
    } finally {
      setAnalyzing(false);
    }
  };

  const updateResult = (id, value) => {
    setAnalysisRows((prev) => prev.map((row) => row.studentid === id ? { ...row, attendance: Number(value), attendanceText: Number(value) === 1 ? "Present" : "Absent" } : row));
  };

  const confirmAttendance = async () => {
    if (!selectedClass) {
      setError("Please select a class.");
      return;
    }
    if (!analysisRows.length) {
      setError("Please analyze the group photo first.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/neplms/attendance", {
        colid: global1.colid,
        user: global1.user,
        classInfo: selectedClass,
        type: attendanceType,
        comments: `${comments}${groupPhotoUrls.length ? ` | Group photos: ${groupPhotoUrls.join(", ")}` : groupPhotoUrl ? ` | Group photo: ${groupPhotoUrl}` : ""}`,
        students: analysisRows.map((row) => ({
          ...row,
          studentid: row.studentid,
          name: row.student || row.name,
          email: row.email,
          phone: row.phone,
          attendance: Number(row.attendance) === 1 ? 1 : 0
        }))
      });
      setMessage(`${res.data?.saved || 0} attendance records saved.`);
      await loadStudents(selectedClass);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const classLabel = (row) => `${row.classdate || ""} ${row.classtime || ""} | ${row.coursecode} - ${row.course} | ${row.programcode} | Sem ${row.semester}`;

  const studentColumns = [
    { field: "name", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 210 },
    { field: "section", headerName: "Section", minWidth: 100 },
    {
      field: "photo",
      headerName: "Photo",
      minWidth: 140,
      renderCell: (params) => params.value ? <a href={params.value} target="_blank" rel="noreferrer">View</a> : "Missing"
    }
  ];

  const resultColumns = [
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    {
      field: "attendance",
      headerName: "Attendance",
      minWidth: 170,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          fullWidth
          value={Number(params.row.attendance) === 1 ? 1 : 0}
          onChange={(event) => updateResult(params.row.studentid, event.target.value)}
        >
          <MenuItem value={1}>Present</MenuItem>
          <MenuItem value={0}>Absent</MenuItem>
        </TextField>
      )
    },
    { field: "confidence", headerName: "Confidence", minWidth: 120 },
    { field: "reason", headerName: "Reason", minWidth: 320, flex: 1.2 }
  ];

  return (
    <MenuPageShell title="Photo Attendance">
      <Stack spacing={2}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Select Class</Typography>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadContext} disabled={loading}>Refresh</Button>
          </Stack>
          <Grid container spacing={2}>
            {["academicyear", "programcode", "coursecode", "semester"].map((field) => (
              <Grid item xs={12} md={3} key={field}>
                <TextField
                  select
                  fullWidth
                  label={field}
                  value={filters[field]}
                  onChange={(event) => setFilters((prev) => ({ ...prev, [field]: event.target.value }))}
                >
                  <MenuItem value="">All</MenuItem>
                  {optionValues[field].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Attendance type" value={attendanceType} onChange={(event) => setAttendanceType(event.target.value)}>
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Supplementary">Supplementary</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          {loading && <LinearProgress sx={{ mt: 2 }} />}

          <Box sx={{ mt: 2 }}>
            <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }} spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography fontWeight={800}>Class Calendar</Typography>
                <Typography variant="body2" color="text.secondary">Click a class in the calendar to load students.</Typography>
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

            {filteredClasses.length === 0 ? (
              <Box sx={{ p: 2, textAlign: "center", border: "1px dashed #cbd5e1" }}>
                <Typography variant="body2">No timetable classes found for the selected filters.</Typography>
              </Box>
            ) : (
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
                        minHeight: calendarView === "day" ? 360 : calendarView === "week" ? 230 : 135,
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
                            {cell.items.length === 0 && <Typography variant="caption" color="text.secondary">No class</Typography>}
                            {cell.items.map((item) => {
                              const active = selectedClassId === item._id;
                              return (
                                <Box
                                  key={item._id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedClassId(item._id);
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
          </Box>
          {selectedClass && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Selected class: {classLabel(selectedClass)}
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Students for Attendance</Typography>
              <Typography variant="body2" color="text.secondary">Select students, optionally add filters, then upload the group photo.</Typography>
            </Box>
            <Button variant="outlined" onClick={() => setStudentFilters((prev) => [...prev, makeFilter("name")])}>Add Student Filter</Button>
          </Stack>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {studentFilters.map((filter) => (
              <React.Fragment key={filter.id}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Field</InputLabel>
                    <Select label="Field" value={filter.field} onChange={(event) => updateStudentFilter(filter.id, "field", event.target.value)}>
                      {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField fullWidth label="Value" value={filter.value} onChange={(event) => updateStudentFilter(filter.id, "value", event.target.value)} />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
              <Chip label={`${selectedIds.length} selected`} color="primary" variant="outlined" />
              <Button component="label" variant="outlined" startIcon={<UploadFile />} sx={{ minHeight: 44 }}>
                {groupPhotos.length ? `${groupPhotos.length} group photos selected` : "Upload group photos"}
                <input hidden multiple type="file" accept="image/*" onChange={(event) => setGroupPhotos(Array.from(event.target.files || []))} />
              </Button>
            </Stack>
            {groupPhotos.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {groupPhotos.map((photo) => photo.name).join(", ")}
              </Typography>
            )}
            <TextField fullWidth multiline minRows={2} label="Comments" value={comments} onChange={(event) => setComments(event.target.value)} />
            <Box>
              <Button variant="contained" startIcon={<AutoAwesome />} onClick={analyzePhoto} disabled={analyzing || !selectedClass || !groupPhotos.length || !selectedIds.length}>
                {analyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </Box>
          </Stack>
          {(studentLoading || analyzing) && <LinearProgress sx={{ mb: 2 }} />}
          <Box sx={{ height: 430 }}>
            <DataGrid
              rows={filteredStudents}
              columns={studentColumns}
              getRowId={(row) => row._id}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={(model) => setSelectedIds(Array.from(model))}
              loading={studentLoading}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>AI Analysis Result</Typography>
              <Typography variant="body2" color="text.secondary">Review and change any result before confirming attendance.</Typography>
            </Box>
            <Button variant="contained" startIcon={<Save />} disabled={saving || !analysisRows.length} onClick={confirmAttendance}>
              {saving ? "Saving..." : "Confirm and Save Attendance"}
            </Button>
          </Stack>
          {saving && <LinearProgress sx={{ mb: 2 }} />}
          {(groupPhotoUrls.length > 0 || groupPhotoUrl) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Group photos uploaded: {(groupPhotoUrls.length ? groupPhotoUrls : [groupPhotoUrl]).map((url, index) => (
                <React.Fragment key={url}>
                  {index > 0 ? ", " : ""}
                  <a href={url} target="_blank" rel="noreferrer">Photo {index + 1}</a>
                </React.Fragment>
              ))}
            </Alert>
          )}
          <Box sx={{ height: 430 }}>
            <DataGrid
              rows={analysisRows}
              columns={resultColumns}
              getRowId={(row) => row.studentid}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
            />
          </Box>
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}
