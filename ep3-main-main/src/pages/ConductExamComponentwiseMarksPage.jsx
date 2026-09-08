import React, { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const paperLabel = (row) => `${row.coursecode || ""} - ${row.course || ""} | ${row.examcode || ""} | ${row.programcode || ""}`;
const todayText = () => new Date().toISOString().slice(0, 10);
const isEntryOpen = (row) => {
  const today = todayText();
  if (row?.startdate && today < row.startdate) return false;
  if (row?.enddate && today > row.enddate) return false;
  return true;
};
const hasMark = (value) => value !== "" && value !== undefined && value !== null;
const isSubmitted = (row) => row?.submissionstatus === "Submitted";

export default function ConductExamComponentwiseMarksPage() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [rows, setRows] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedExamroll, setSelectedExamroll] = useState("");
  const [filters, setFilters] = useState({ componenttype: "", assessmentcomponent: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const examinerEmail = global1.user || global1.email || "";
  const filterOptions = useMemo(() => ({
    componenttype: [...new Set(rows.map((row) => row.componenttype).filter(Boolean))],
    assessmentcomponent: [...new Set(rows.map((row) => row.assessmentcomponent).filter(Boolean))]
  }), [rows]);
  const openRowCount = useMemo(() => rows.filter(isEntryOpen).length, [rows]);
  const selectedPaperOpen = selectedPaper ? isEntryOpen(selectedPaper) : false;
  const groupedRolls = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const examrollno = row.examrollno || row.displayid || "";
      if (!examrollno) return;
      if (!map.has(examrollno)) map.set(examrollno, { id: examrollno, examrollno, rows: [], completed: true, total: 0, entered: 0 });
      const item = map.get(examrollno);
      const entered = hasMark(marksMap[row._id]);
      item.rows.push(row);
      item.total += 1;
      if (entered) item.entered += 1;
      if (!isSubmitted(row)) item.completed = false;
    });
    return [...map.values()].sort((a, b) => String(a.examrollno).localeCompare(String(b.examrollno), undefined, { numeric: true }));
  }, [marksMap, rows]);
  const pendingRolls = useMemo(() => groupedRolls.filter((item) => !item.completed), [groupedRolls]);
  const completedRolls = useMemo(() => groupedRolls.filter((item) => item.completed), [groupedRolls]);
  const displayedRolls = activeTab === "completed" ? completedRolls : pendingRolls;
  const activeRows = useMemo(() => rows.filter((row) => (row.examrollno || row.displayid || "") === selectedExamroll), [rows, selectedExamroll]);
  const activeOpenRowCount = useMemo(() => activeRows.filter((row) => isEntryOpen(row) && !isSubmitted(row)).length, [activeRows]);
  const selectedRollSubmitted = useMemo(() => activeRows.length > 0 && activeRows.every(isSubmitted), [activeRows]);
  const selectedRollReady = useMemo(() => activeRows.length > 0 && activeRows.every((row) => hasMark(marksMap[row._id])), [activeRows, marksMap]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await ep1.get("/api/v2/examination-model2/component-marks-papers", {
        params: { colid: global1.colid, examineremail: examinerEmail }
      });
      const data = res.data?.data || [];
      setPapers(data);
      setSelectedPaper(data[0] || null);
      if (data[0]) await loadRows(data[0], filters);
      if (!data.length) setMessage("No componentwise papers are allocated to you.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load allocated papers.");
    } finally {
      setLoading(false);
    }
  };

  const loadRows = async (paper = selectedPaper, nextFilters = filters) => {
    if (!paper) return;
    try {
      setLoading(true);
      setError("");
      const params = {
        colid: global1.colid,
        examineremail: examinerEmail,
        academicyear: paper.academicyear,
        examcode: paper.examcode,
        regulation: paper.regulation,
        programcode: paper.programcode,
        coursecode: paper.coursecode
      };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/examination-model2/component-marks-rows", { params });
      const data = res.data?.data || [];
      setRows(data);
      setMarksMap(Object.fromEntries(data.map((row) => [row._id, row.marksobtained ?? ""])));
      const firstPending = data.find((row) => row.submissionstatus !== "Submitted");
      const firstRow = firstPending || data[0];
      setSelectedExamroll(firstRow ? (firstRow.examrollno || firstRow.displayid || "") : "");
      setActiveTab(firstPending ? "pending" : "completed");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load componentwise rows.");
    } finally {
      setLoading(false);
    }
  };

  const updateMarks = (row, value) => {
    if (isSubmitted(row)) {
      setError(`Marks for ${row.examrollno || row.displayid} have already been submitted and cannot be edited.`);
      return;
    }
    if (!isEntryOpen(row)) {
      setError(`Marks for ${row.examrollno || row.displayid} can be entered only from ${row.startdate || "start"} to ${row.enddate || "end"}.`);
      return;
    }
    const numeric = Number(value);
    if (value !== "" && (Number.isNaN(numeric) || numeric < 0)) return;
    if (value !== "" && numeric > Number(row.maxmarks || 0)) {
      setError(`Marks for ${row.displayid} cannot be more than ${row.maxmarks}.`);
      return;
    }
    setError("");
    setMarksMap((prev) => ({ ...prev, [row._id]: value }));
  };

  const saveMarks = async () => {
    const rowsToSave = activeRows.length ? activeRows : rows;
    const payloadRows = rowsToSave
      .filter((row) => isEntryOpen(row) && !isSubmitted(row))
      .filter((row) => hasMark(marksMap[row._id]))
      .map((row) => ({ ...row, marksobtained: marksMap[row._id], user: examinerEmail }));
    if (!payloadRows.length) {
      setError("Enter marks for at least one row.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const res = await ep1.post("/api/v2/examination-model2/component-marks-savebulk", {
        colid: global1.colid,
        user: examinerEmail,
        rows: payloadRows
      });
      const errors = res.data?.errors || [];
      setMessage(`Marks saved: ${res.data?.saved || 0}`);
      if (errors.length) setError(errors.slice(0, 5).map((item) => `${item.regno || item.row}: ${item.message}`).join(" | "));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save marks.");
    } finally {
      setSaving(false);
    }
  };

  const submitMarks = async () => {
    const payloadRows = activeRows
      .filter((row) => !isSubmitted(row))
      .map((row) => ({ ...row, marksobtained: marksMap[row._id], user: examinerEmail }));
    if (!activeRows.length) {
      setError("Select an examroll number first.");
      return;
    }
    if (selectedRollSubmitted) {
      setError("This examroll number has already been submitted.");
      return;
    }
    if (!activeRows.every(isEntryOpen)) {
      setError("Submit is allowed only within the marks entry start and end date.");
      return;
    }
    if (!payloadRows.length || payloadRows.some((row) => !hasMark(row.marksobtained))) {
      setError("Enter marks for every component before final submit.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const res = await ep1.post("/api/v2/examination-model2/component-marks-submit", {
        colid: global1.colid,
        user: examinerEmail,
        rows: payloadRows
      });
      const errors = res.data?.errors || [];
      setMessage(`Marks submitted: ${res.data?.submitted || 0}`);
      if (errors.length) setError(errors.slice(0, 5).map((item) => `${item.regno || item.row}: ${item.message}`).join(" | "));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit marks.");
    } finally {
      setSaving(false);
    }
  };

  const rollColumns = [
    { field: "examrollno", headerName: "Exam Roll No", flex: 1, minWidth: 220 },
    { field: "progress", headerName: "Progress", width: 120, renderCell: (params) => `${params.row.entered}/${params.row.total}` },
    { field: "submissionstatus", headerName: "Status", width: 130, renderCell: (params) => params.row.completed ? "Submitted" : "Pending" }
  ];

  const columns = [
    { field: "examrollno", headerName: "Exam Roll No", width: 230, renderCell: (params) => params.row.examrollno || params.row.displayid || "" },
    { field: "componenttype", headerName: "Component Type", width: 150 },
    { field: "scoretype", headerName: "Score Type", width: 130 },
    { field: "assessmentgroup", headerName: "Assessment Group", width: 170 },
    { field: "assessmentgrouptype", headerName: "Group Type", width: 140 },
    { field: "assessmentcomponent", headerName: "Assessment Component", minWidth: 190, flex: 1 },
    { field: "maxmarks", headerName: "Max Marks", width: 120 },
    { field: "credits", headerName: "Credits", width: 100 },
    { field: "startdate", headerName: "Start Date", width: 130 },
    { field: "enddate", headerName: "End Date", width: 130 },
    { field: "submissionstatus", headerName: "Submit Status", width: 140 },
    { field: "submitteddate", headerName: "Submitted Date", width: 140 },
    { field: "entrystatus", headerName: "Entry Status", width: 130, renderCell: (params) => isEntryOpen(params.row) ? "Open" : "Closed" },
    {
      field: "marksentry",
      headerName: "Marks Obtained",
      width: 180,
      renderCell: (params) => {
        const open = isEntryOpen(params.row) && !isSubmitted(params.row);
        return (
        <TextField
          size="small"
          type="number"
          disabled={!open}
          value={marksMap[params.row._id] ?? ""}
          onChange={(event) => updateMarks(params.row, event.target.value)}
          inputProps={{ min: 0, max: Number(params.row.maxmarks || 0) }}
          sx={{
            "& .MuiInputBase-root": {
              bgcolor: open ? "background.paper" : "#e5e7eb",
              color: open ? "text.primary" : "text.disabled"
            }
          }}
        />
        );
      }
    }
  ];

  return (
    <MenuPageShell title="Componentwise Marks">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Componentwise Marks</Typography>
              <Typography color="text.secondary">Enter marks for the components allocated to you. Student names are hidden on this screen.</Typography>
            </Box>
            <Button variant="contained" onClick={loadPapers} disabled={loading}>Load My Allocations</Button>
          </Stack>
          {(loading || saving) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={papers}
                value={selectedPaper}
                getOptionLabel={(option) => option ? `${paperLabel(option)} (${option.students || 0} students)` : ""}
                isOptionEqualToValue={(option, value) => paperLabel(option) === paperLabel(value)}
                onChange={(_, value) => { setSelectedPaper(value); if (value) loadRows(value, filters); }}
                renderInput={(params) => <TextField {...params} label="Allocated course" />}
              />
            </Grid>
            {Object.entries(filters).map(([key, value]) => (
              <Grid item xs={12} md={2} key={key}>
                <TextField select fullWidth label={key} value={value} onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {(filterOptions[key] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={1}><Button fullWidth variant="outlined" onClick={() => loadRows()} sx={{ height: 56 }}>Apply</Button></Grid>
            <Grid item xs={12} md={1}><Button fullWidth variant="contained" startIcon={<SaveIcon />} disabled={saving || !activeRows.length || !activeOpenRowCount} onClick={saveMarks} sx={{ height: 56 }}>{saving ? "Saving..." : "Save"}</Button></Grid>
            <Grid item xs={12} md={1}><Button fullWidth color="success" variant="contained" startIcon={<TaskAltIcon />} disabled={saving || !activeRows.length || selectedRollSubmitted || !selectedRollReady || !activeOpenRowCount} onClick={submitMarks} sx={{ height: 56 }}>{saving ? "Submitting..." : "Submit"}</Button></Grid>
          </Grid>
          {selectedPaper && (
            <>
              <Paper elevation={0} sx={{ mt: 2, p: 1.5, border: "1px solid", borderColor: selectedPaperOpen ? "#bbf7d0" : "#fecaca", bgcolor: selectedPaperOpen ? "#f0fdf4" : "#fef2f2", borderRadius: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                  <Box>
                    <Typography fontWeight={900}>Marks Entry Window</Typography>
                    <Typography variant="body2" color="text.secondary">Start Date: {selectedPaper.startdate || "-"} | End Date: {selectedPaper.enddate || "-"} | Today: {todayText()}</Typography>
                  </Box>
                  <Chip color={selectedPaperOpen ? "success" : "error"} label={selectedPaperOpen ? `Open (${openRowCount} rows)` : "Closed"} />
                </Stack>
              </Paper>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                <Chip label={`Exam: ${selectedPaper.examcode}`} />
                <Chip label={`Regulation: ${selectedPaper.regulation}`} />
                <Chip label={`Program: ${selectedPaper.programcode}`} />
                <Chip label={`Course: ${selectedPaper.coursecode}`} />
                <Chip label={`Start: ${selectedPaper.startdate || "-"}`} />
                <Chip label={`End: ${selectedPaper.enddate || "-"}`} />
              </Stack>
            </>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Tabs value={activeTab} onChange={(_, value) => {
            setActiveTab(value);
            const nextRows = value === "completed" ? completedRolls : pendingRolls;
            setSelectedExamroll(nextRows[0]?.examrollno || "");
          }} sx={{ mb: 2 }}>
            <Tab value="pending" label={`Pending (${pendingRolls.length})`} />
            <Tab value="completed" label={`Completed (${completedRolls.length})`} />
          </Tabs>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>{activeTab === "completed" ? "Completed Examroll No." : "Pending Examroll No."}</Typography>
              <Box sx={{ height: 360 }}>
                <DataGrid
                  rows={displayedRolls}
                  columns={rollColumns}
                  loading={loading}
                  pageSizeOptions={[10, 25, 50, 100]}
                  disableColumnMenu={false}
                  onRowClick={(params) => setSelectedExamroll(params.row.examrollno)}
                  rowSelectionModel={selectedExamroll ? [selectedExamroll] : []}
                  sx={{
                    "& .MuiDataGrid-row": { cursor: "pointer" },
                    "& .MuiDataGrid-row.Mui-selected": { bgcolor: "#e0f2fe !important" }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 1 }}>
                <Box>
                  <Typography fontWeight={900}>Marks Details</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedExamroll ? `Exam Roll No: ${selectedExamroll}` : "Select an examroll number to enter marks."}
                  </Typography>
                </Box>
                {selectedExamroll && (
                  <Chip
                    color={selectedRollSubmitted ? "success" : selectedRollReady ? "info" : "warning"}
                    label={selectedRollSubmitted ? "Submitted - locked" : `${activeRows.filter((row) => hasMark(marksMap[row._id])).length}/${activeRows.length} entered`}
                  />
                )}
              </Stack>
              <Box sx={{ height: 560 }}>
                <DataGrid
                  rows={activeRows}
                  getRowId={(row) => row._id}
                  columns={columns}
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "componentwise_marks_entry" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                  disableRowSelectionOnClick
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
