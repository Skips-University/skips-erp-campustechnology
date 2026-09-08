import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
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
import { Add, Delete, FileDownload, Print, Refresh } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#db2777", "#475569", "#0f766e"];
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateToInput = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfWeek = (date) => addDays(date, -date.getDay());
const monthTitle = (year, month) => new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
const shortDate = (date) => date.toLocaleDateString(undefined, { day: "2-digit", month: "short" });

const currentMonthRange = () => {
  const now = new Date();
  return {
    fromdate: dateToInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    todate: dateToInput(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  };
};

const classLabel = (row) => `${row.classtime || "-"} P${row.period || "-"} | ${row.coursecode || ""} ${row.course || ""}`;
const filterFields = [
  { field: "academicyear", label: "Academic year" },
  { field: "regulation", label: "Regulation" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program code" },
  { field: "semester", label: "Semester" },
  { field: "section", label: "Section" },
  { field: "course", label: "Course" },
  { field: "coursecode", label: "Course code" },
  { field: "faculty", label: "Faculty" },
  { field: "facultyemail", label: "Faculty email" },
  { field: "period", label: "Period" },
  { field: "classtime", label: "Class time" },
  { field: "building", label: "Building" },
  { field: "roomno", label: "Room no" },
  { field: "status", label: "Status" }
];
const emptyFilter = { field: "academicyear", value: "" };

export default function NepLmsMasterTimetableReportPage() {
  const initialRange = currentMonthRange();
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [viewMode, setViewMode] = useState("Monthly");
  const [fromdate, setFromdate] = useState(initialRange.fromdate);
  const [todate, setTodate] = useState(initialRange.todate);
  const [selectedFacultyEmail, setSelectedFacultyEmail] = useState("");
  const [dynamicFilters, setDynamicFilters] = useState([{ ...emptyFilter }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load master timetable");
    } finally {
      setLoading(false);
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch {
      setInstitution(null);
    }
  };

  useEffect(() => {
    loadRows();
    loadInstitution();
  }, []);

  const facultyColorMap = useMemo(() => {
    const map = new Map();
    uniqueSorted(rows.map((row) => row.facultyemail || row.faculty)).forEach((faculty, index) => {
      map.set(faculty, colors[index % colors.length]);
    });
    return map;
  }, [rows]);

  const dateFilteredRows = useMemo(() => rows.filter((row) => {
    if (!row.classdate) return false;
    if (fromdate && row.classdate < fromdate) return false;
    if (todate && row.classdate > todate) return false;
    return true;
  }), [rows, fromdate, todate]);

  const filterOptions = useMemo(() => Object.fromEntries(filterFields.map(({ field }) => [
    field,
    uniqueSorted(dateFilteredRows.map((row) => row[field]))
  ])), [dateFilteredRows]);

  const dynamicFilteredRows = useMemo(() => dateFilteredRows.filter((row) => dynamicFilters.every((filter) => {
    if (!filter.field || !filter.value) return true;
    return String(row[filter.field] || "").trim().toLowerCase() === String(filter.value || "").trim().toLowerCase();
  })), [dateFilteredRows, dynamicFilters]);

  const filteredRows = useMemo(() => (
    selectedFacultyEmail
      ? dynamicFilteredRows.filter((row) => String(row.facultyemail || row.faculty || "") === selectedFacultyEmail)
      : dynamicFilteredRows
  ), [dynamicFilteredRows, selectedFacultyEmail]);

  const facultySummary = useMemo(() => {
    const map = new Map();
    dynamicFilteredRows.forEach((row) => {
      const key = row.facultyemail || row.faculty || "Not assigned";
      const current = map.get(key) || {
        id: key,
        faculty: row.faculty || "Not assigned",
        facultyemail: row.facultyemail || "",
        classes: 0,
        courses: new Set(),
        programs: new Set(),
        semesters: new Set(),
        color: facultyColorMap.get(key) || colors[0]
      };
      current.classes += 1;
      if (row.coursecode || row.course) current.courses.add(`${row.coursecode || ""} ${row.course || ""}`.trim());
      if (row.programcode || row.program) current.programs.add(`${row.programcode || ""} ${row.program || ""}`.trim());
      if (row.semester) current.semesters.add(row.semester);
      map.set(key, current);
    });
    return [...map.values()].map((item) => ({
      ...item,
      courses: item.courses.size,
      programs: item.programs.size,
      semesters: uniqueSorted([...item.semesters]).join(", ")
    })).sort((a, b) => a.faculty.localeCompare(b.faculty));
  }, [dynamicFilteredRows, facultyColorMap]);

  const selectedFaculty = facultySummary.find((item) => item.id === selectedFacultyEmail);

  const weeklyCalendars = useMemo(() => {
    const start = parseDate(fromdate) || new Date();
    const end = parseDate(todate) || start;
    const firstWeekStart = startOfWeek(start);
    const weeks = [];
    for (let cursor = new Date(firstWeekStart); cursor <= end; cursor = addDays(cursor, 7)) {
      const days = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(cursor, index);
        const dateValue = dateToInput(date);
        const items = filteredRows
          .filter((row) => row.classdate === dateValue)
          .sort((a, b) => String(a.classtime || "").localeCompare(String(b.classtime || "")));
        return { date, dateValue, label: weekdayLabels[date.getDay()], items, outside: dateValue < fromdate || dateValue > todate };
      });
      weeks.push({ key: dateToInput(cursor), days, title: `${shortDate(days[0].date)} - ${shortDate(days[6].date)}, ${days[6].date.getFullYear()}` });
    }
    return weeks;
  }, [filteredRows, fromdate, todate]);

  const monthlyCalendars = useMemo(() => {
    const start = parseDate(fromdate) || new Date();
    const end = parseDate(todate) || start;
    const months = [];
    for (let cursor = new Date(start.getFullYear(), start.getMonth(), 1); cursor <= end; cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < firstDay; i += 1) cells.push({ key: `blank-${i}`, blank: true });
      for (let day = 1; day <= totalDays; day += 1) {
        const date = new Date(year, month, day);
        const dateValue = dateToInput(date);
        const items = filteredRows
          .filter((row) => row.classdate === dateValue)
          .sort((a, b) => String(a.classtime || "").localeCompare(String(b.classtime || "")));
        cells.push({ key: dateValue, day, dateValue, items, outside: dateValue < fromdate || dateValue > todate });
      }
      while (cells.length % 7 !== 0) cells.push({ key: `blank-end-${cells.length}`, blank: true });
      months.push({ key: `${year}-${month}`, title: monthTitle(year, month), cells });
    }
    return months;
  }, [filteredRows, fromdate, todate]);

  const exportReport = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(facultySummary.map((item) => ({
      Faculty: item.faculty,
      Email: item.facultyemail,
      Classes: item.classes,
      Courses: item.courses,
      Programs: item.programs,
      Semesters: item.semesters
    }))), "Faculty Summary");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filteredRows.map((row) => ({
      Date: row.classdate,
      Time: row.classtime,
      Period: row.period,
      Faculty: row.faculty,
      FacultyEmail: row.facultyemail,
      Program: row.program,
      ProgramCode: row.programcode,
      Semester: row.semester,
      Course: row.course,
      CourseCode: row.coursecode,
      Module: row.module,
      Topic: row.topic,
      Status: row.status
    }))), "Classes");
    XLSX.writeFile(workbook, "nep_lms_master_timetable_report.xlsx");
  };

  const addFilter = () => {
    const used = new Set(dynamicFilters.map((filter) => filter.field));
    const nextField = filterFields.find((item) => !used.has(item.field))?.field || filterFields[0].field;
    setDynamicFilters((prev) => [...prev, { field: nextField, value: "" }]);
  };

  const updateFilter = (index, patch) => {
    setDynamicFilters((prev) => prev.map((filter, itemIndex) => (
      itemIndex === index
        ? { ...filter, ...patch, ...(patch.field ? { value: "" } : {}) }
        : filter
    )));
    setSelectedFacultyEmail("");
  };

  const removeFilter = (index) => {
    setDynamicFilters((prev) => (prev.length === 1 ? [{ ...emptyFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
    setSelectedFacultyEmail("");
  };

  const clearFilters = () => {
    setDynamicFilters([{ ...emptyFilter }]);
    setSelectedFacultyEmail("");
  };

  const facultyColumns = [
    {
      field: "color",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: params.value, border: "1px solid #d1d5db" }} />
    },
    { field: "faculty", headerName: "Faculty", minWidth: 180, flex: 1 },
    { field: "facultyemail", headerName: "Email", minWidth: 220 },
    { field: "classes", headerName: "Classes", width: 110, type: "number" },
    { field: "courses", headerName: "Courses", width: 110, type: "number" },
    { field: "programs", headerName: "Programs", width: 120, type: "number" },
    { field: "semesters", headerName: "Semesters", minWidth: 140 }
  ];

  const classColumns = [
    { field: "classdate", headerName: "Date", minWidth: 120 },
    { field: "classtime", headerName: "Time", minWidth: 110 },
    { field: "period", headerName: "Period", width: 100 },
    { field: "faculty", headerName: "Faculty", minWidth: 180 },
    { field: "facultyemail", headerName: "Faculty email", minWidth: 220 },
    { field: "programcode", headerName: "Program code", minWidth: 130 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "coursecode", headerName: "Course code", minWidth: 130 },
    { field: "course", headerName: "Course", minWidth: 220, flex: 1 },
    { field: "topic", headerName: "Topic", minWidth: 220 }
  ];

  const CalendarItem = ({ row }) => {
    const key = row.facultyemail || row.faculty || "Not assigned";
    const color = facultyColorMap.get(key) || colors[0];
    return (
      <Box sx={{ bgcolor: `${color}18`, borderLeft: `4px solid ${color}`, borderRadius: 0.75, px: 0.75, py: 0.55 }}>
        <Typography variant="caption" fontWeight={900} display="block" sx={{ lineHeight: 1.15 }}>{classLabel(row)}</Typography>
        <Typography variant="caption" display="block" sx={{ lineHeight: 1.15 }}>{row.faculty || "Not assigned"}</Typography>
        <Typography variant="caption" display="block" sx={{ lineHeight: 1.15, color: "#334155" }}>
          {row.programcode || row.program} Sem {row.semester}
        </Typography>
      </Box>
    );
  };

  return (
    <MenuPageShell title="Master Timetable">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #master-timetable-print, #master-timetable-print * { visibility: visible; }
            #master-timetable-print { position: absolute; left: 0; top: 0; width: 100%; background: #fff; padding: 14px; }
            .screen-only { display: none !important; }
            .MuiDataGrid-footerContainer, .MuiDataGrid-toolbarContainer { display: none !important; }
          }
        `}</style>

        <Paper className="screen-only" elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Master timetable</Typography>
              <Typography color="text.secondary">Faculty summary grid with weekly or monthly color-coded class calendar.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows} disabled={loading}>Refresh</Button>
              <Button variant="outlined" startIcon={<FileDownload />} onClick={exportReport}>Export</Button>
              <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
            </Stack>
          </Stack>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {error && <Alert className="screen-only" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper className="screen-only" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="From date" value={fromdate} onChange={(e) => setFromdate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth type="date" label="To date" value={todate} onChange={(e) => setTodate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Calendar view</InputLabel>
                <Select label="Calendar view" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => setSelectedFacultyEmail("")} disabled={!selectedFacultyEmail}>Show all faculties</Button>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#f8fafc" }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={900}>Dynamic filters</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
                    <Button size="small" onClick={clearFilters}>Clear</Button>
                  </Stack>
                </Stack>
                <Grid container spacing={1.5}>
                  {dynamicFilters.map((filter, index) => (
                    <React.Fragment key={`${filter.field}-${index}`}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Field"
                          value={filter.field}
                          onChange={(event) => updateFilter(index, { field: event.target.value })}
                        >
                          {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={7}>
                        <Autocomplete
                          freeSolo
                          options={filterOptions[filter.field] || []}
                          value={filter.value || ""}
                          onInputChange={(_, value) => updateFilter(index, { value })}
                          onChange={(_, value) => updateFilter(index, { value: value || "" })}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label={filterFields.find((item) => item.field === filter.field)?.label || "Value"}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton color="error" onClick={() => removeFilter(index)} sx={{ height: 40, width: 40 }}>
                          <Delete />
                        </IconButton>
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Faculties: ${facultySummary.length}`} />
                <Chip label={`Classes: ${filteredRows.length}`} color="primary" />
                <Chip label={`Courses: ${uniqueSorted(filteredRows.map((row) => row.coursecode)).length}`} />
                {selectedFaculty && <Chip label={`Selected: ${selectedFaculty.faculty}`} sx={{ bgcolor: selectedFaculty.color, color: "#fff" }} />}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} className="screen-only" sx={{ mb: 2 }}>
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 1 }}>
              <Typography variant="subtitle1" fontWeight={900} sx={{ px: 1, pb: 1 }}>All faculties</Typography>
              <Box sx={{ height: 430 }}>
                <DataGrid
                  rows={facultySummary}
                  columns={facultyColumns}
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "master_timetable_faculties" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  onRowClick={(params) => setSelectedFacultyEmail(params.row.id)}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p: 1 }}>
              <Typography variant="subtitle1" fontWeight={900} sx={{ px: 1, pb: 1 }}>Class details</Typography>
              <Box sx={{ height: 430 }}>
                <DataGrid
                  rows={filteredRows.map((row) => ({ ...row, id: row._id }))}
                  columns={classColumns}
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "master_timetable_classes" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box id="master-timetable-print">
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #d1d5db", borderRadius: 2, bgcolor: "#fff" }}>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2, borderBottom: "2px solid #111827", pb: 1.5 }}>
              {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 68, maxWidth: 150, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
              <Typography variant="body2">{institution?.address || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>NEP LMS Master Timetable</Typography>
              <Typography variant="body2">{fromdate || "-"} to {todate || "-"} | {viewMode} view</Typography>
            </Stack>

            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={3}><Chip label={`Faculties: ${facultySummary.length}`} sx={{ width: "100%" }} /></Grid>
              <Grid item xs={3}><Chip label={`Classes: ${filteredRows.length}`} sx={{ width: "100%" }} color="primary" /></Grid>
              <Grid item xs={3}><Chip label={`Courses: ${uniqueSorted(filteredRows.map((row) => row.coursecode)).length}`} sx={{ width: "100%" }} /></Grid>
              <Grid item xs={3}><Chip label={`Printed: ${new Date().toLocaleDateString()}`} sx={{ width: "100%" }} /></Grid>
            </Grid>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              {facultySummary.map((faculty) => (
                <Chip key={faculty.id} size="small" label={`${faculty.faculty} (${faculty.classes})`} sx={{ bgcolor: faculty.color, color: "#fff" }} />
              ))}
            </Stack>

            {viewMode === "Weekly" && (
              <Stack spacing={2}>
                {weeklyCalendars.map((week) => (
                  <Box key={week.key} sx={{ breakInside: "avoid", border: "1px solid #94a3b8" }}>
                    <Box sx={{ bgcolor: "#0f172a", color: "#fff", textAlign: "center", py: 0.75 }}>
                      <Typography variant="subtitle1" fontWeight={900}>{week.title}</Typography>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(120px, 1fr))" }}>
                      {week.days.map((day) => (
                        <Box key={day.dateValue} sx={{ minHeight: 180, p: 0.75, bgcolor: day.outside ? "#f8fafc" : "#fff", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                          <Typography variant="caption" fontWeight={900} display="block" sx={{ mb: 0.7 }}>{day.label}, {shortDate(day.date)}</Typography>
                          <Stack spacing={0.5}>
                            {!day.outside && day.items.length === 0 && <Typography variant="caption" color="text.secondary">No class</Typography>}
                            {!day.outside && day.items.map((row) => <CalendarItem key={row._id} row={row} />)}
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            {viewMode === "Monthly" && (
              <Stack spacing={2}>
                {monthlyCalendars.map((month) => (
                  <Box key={month.key} sx={{ breakInside: "avoid", border: "1px solid #94a3b8" }}>
                    <Box sx={{ bgcolor: "#0f172a", color: "#fff", textAlign: "center", py: 0.75 }}>
                      <Typography variant="subtitle1" fontWeight={900}>{month.title}</Typography>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(120px, 1fr))" }}>
                      {weekdayLabels.map((label) => (
                        <Box key={label} sx={{ bgcolor: "#e2e8f0", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.6, textAlign: "center" }}>
                          <Typography variant="caption" fontWeight={900}>{label}</Typography>
                        </Box>
                      ))}
                      {month.cells.map((cell) => (
                        <Box key={cell.key} sx={{ minHeight: 116, p: 0.55, bgcolor: cell.blank || cell.outside ? "#f8fafc" : "#fff", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                          {!cell.blank && (
                            <>
                              <Typography variant="caption" fontWeight={900} sx={{ display: "block", mb: 0.4 }}>{cell.day}</Typography>
                              <Stack spacing={0.35}>
                                {!cell.outside && cell.items.map((row) => <CalendarItem key={row._id} row={row} />)}
                              </Stack>
                            </>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
