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
import { Refresh } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

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

export const classLabel = (row = {}) => `${row.classdate || ""} ${row.classtime || ""} | ${row.coursecode || ""} - ${row.course || ""} | ${row.programcode || ""} | Sem ${row.semester || ""}`;

export default function NepLmsFacultyClassSelector({ selectedClassId, onSelectClass, title = "Select Class", initialClassId = "" }) {
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", programcode: "", coursecode: "", semester: "" });
  const [calendarView, setCalendarView] = useState("month");
  const [calendarDate, setCalendarDate] = useState(toDateInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadContext();
  }, []);

  const loadContext = async () => {
    setLoading(true);
    setError("");
    try {
      const [workloadRes, timetableRes] = await Promise.all([
        ep1.get("/api/v2/workloadassignment", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/neplms/timetable", { params: { colid: global1.colid } })
      ]);
      const currentUser = cleanText(global1.user);
      const assignedRows = (workloadRes.data?.data || []).filter((row) => currentUser && cleanText(row.facultyemail) === currentUser);
      const classRows = (timetableRes.data?.data || []).filter((classRow) => {
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
      setClasses(classRows);
      if (initialClassId) {
        const requestedClass = classRows.find((row) => row._id === initialClassId);
        if (requestedClass) {
          onSelectClass(requestedClass);
          setCalendarDate(requestedClass.classdate || toDateInput(new Date()));
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

  const selectedClass = useMemo(() => classes.find((row) => row._id === selectedClassId) || null, [classes, selectedClassId]);

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
      return { title: dateTitle(selectedDate), columns: 1, labels: [selectedDate.toLocaleDateString(undefined, { weekday: "long" })], cells: [makeCell(selectedDate)] };
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
    for (let index = 0; index < firstDay; index += 1) cells.push(makeCell(new Date(year, month, index - firstDay + 1), true));
    for (let day = 1; day <= totalDays; day += 1) cells.push(makeCell(new Date(year, month, day)));
    while (cells.length % 7 !== 0) cells.push(makeCell(new Date(year, month, totalDays + (cells.length % 7)), true));
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

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>{title}</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadContext} disabled={loading}>Refresh</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Grid container spacing={2}>
        {["academicyear", "programcode", "coursecode", "semester"].map((field) => (
          <Grid item xs={12} md={3} key={field}>
            <TextField select fullWidth label={field} value={filters[field]} onChange={(event) => setFilters((prev) => ({ ...prev, [field]: event.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {optionValues[field].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
        ))}
      </Grid>
      {loading && <LinearProgress sx={{ mt: 2 }} />}
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }} spacing={2} sx={{ my: 2 }}>
        <Box>
          <Typography fontWeight={800}>Class Calendar</Typography>
          <Typography variant="body2" color="text.secondary">Click a class in the calendar.</Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
          <Button variant="outlined" onClick={() => shiftCalendar(-1)}>Previous</Button>
          <TextField type="date" label="Select date" value={calendarDate} onChange={(event) => setCalendarDate(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
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
          <Typography variant="body2">No timetable classes found.</Typography>
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
              <Box key={cell.key} onClick={() => !cell.blank && setCalendarDate(cell.date)} sx={{ minHeight: calendarView === "day" ? 360 : calendarView === "week" ? 230 : 135, p: 0.75, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", bgcolor: cell.blank ? "#f8fafc" : cell.selected ? "#eff6ff" : "#fff", outline: cell.selected ? "2px solid #2563eb" : "none", outlineOffset: "-2px", cursor: cell.blank ? "default" : "pointer" }}>
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
                          <Box key={item._id} onClick={(event) => { event.stopPropagation(); onSelectClass(item); }} sx={{ cursor: "pointer", bgcolor: active ? "#dcfce7" : "#eef2ff", border: active ? "1px solid #16a34a" : "1px solid #c7d2fe", borderLeft: active ? "4px solid #16a34a" : "4px solid #4f46e5", borderRadius: 1, px: 0.8, py: 0.6 }}>
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
      {selectedClass && <Alert severity="info" sx={{ mt: 2 }}>Selected class: {classLabel(selectedClass)}</Alert>}
    </Paper>
  );
}
