import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const blankForm = {
  academicyear: "",
  regulation: "",
  exam: "",
  examcode: "",
  program: "",
  programcode: "",
  type: "",
  subject: "",
  semester: "",
  course: "",
  coursecode: "",
  examinername: "",
  examineremail: "",
  student: "",
  regno: "",
  email: "",
  examrollno: "",
  seatno: "",
  examdate: "",
  examslot: "",
  startdate: "",
  enddate: "",
  componenttype: "",
  scoretype: "",
  assessmentgroup: "",
  assessmentgrouptype: "",
  assessmentcomponent: "",
  maxmarks: "",
  credits: "",
  status: "Allocated"
};

const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const courseLabel = (row) => `${row.course || ""}${row.coursecode ? ` (${row.coursecode})` : ""}`;
const componentLabel = (row) => `${row.assessmentcomponent || ""} | ${row.componenttype || ""} | ${row.scoretype || ""} | ${row.assessmentgroup || ""} | Marks: ${row.marks || row.maxmarks || 0}`;

export default function ConductExamComponentwiseAllocationPage() {
  const [courses, setCourses] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [components, setComponents] = useState([]);
  const [students, setStudents] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [selectedExaminers, setSelectedExaminers] = useState([]);
  const [papersPerExaminer, setPapersPerExaminer] = useState("");
  const [aiRules, setAiRules] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [filters, setFilters] = useState({ academicyear: "", examcode: "", regulation: "", programcode: "", coursecode: "", componenttype: "", assessmentcomponent: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/examination-model2/component-allocation-options", { params: { colid: global1.colid } });
    setCourses(res.data?.courses || []);
    setExaminers(res.data?.examiners || []);
    setComponents(res.data?.components || []);
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/examination-model2/component-allocations", { params });
      setRows(res.data?.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load component allocations.");
    } finally {
      setLoading(false);
    }
  };

  const dropdowns = useMemo(() => {
    const byYear = courses.filter((row) => !form.academicyear || row.academicyear === form.academicyear);
    const byExam = byYear.filter((row) => !form.examcode || row.examcode === form.examcode);
    const byReg = byExam.filter((row) => !form.regulation || row.regulation === form.regulation);
    const byProgram = byReg.filter((row) => !form.programcode || row.programcode === form.programcode);
    const programMap = new Map();
    byReg.forEach((row) => row.programcode && programMap.set(row.programcode, { programcode: row.programcode, program: row.program }));
    const courseMap = new Map();
    byProgram.forEach((row) => row.coursecode && courseMap.set(row.coursecode, row));
    return {
      academicyears: uniq(courses.map((row) => row.academicyear)),
      exams: uniq(byYear.map((row) => `${row.examcode}||${row.exam}`)).map((value) => {
        const [examcode, exam] = value.split("||");
        return { examcode, exam };
      }),
      regulations: uniq(byExam.map((row) => row.regulation)),
      programs: [...programMap.values()].sort((a, b) => String(a.program).localeCompare(String(b.program))),
      coursesList: [...courseMap.values()].sort((a, b) => String(a.course).localeCompare(String(b.course)))
    };
  }, [courses, form]);

  const courseExaminers = useMemo(() => examiners.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.examcode || row.examcode === form.examcode)
    && (!form.programcode || row.programcode === form.programcode)
    && (!form.coursecode || row.coursecode === form.coursecode)
  )), [examiners, form]);

  const courseComponents = useMemo(() => components.filter((row) => (
    (!form.academicyear || row.academicyear === form.academicyear)
    && (!form.regulation || row.regulation === form.regulation)
    && (!form.programcode || row.programcode === form.programcode)
    && (!form.coursecode || row.coursecode === form.coursecode)
    && (!form.componenttype || row.componenttype === form.componenttype)
  )), [components, form]);

  const filterOptions = useMemo(() => {
    const source = [...rows, ...courses, ...components];
    return Object.fromEntries(Object.keys(filters).map((field) => [field, uniq(source.map((row) => row[field]))]));
  }, [rows, courses, components, filters]);

  const setCourseDetails = (coursecode) => {
    const selected = dropdowns.coursesList.find((row) => row.coursecode === coursecode);
    setForm((prev) => ({
      ...prev,
      coursecode,
      course: selected?.course || "",
      type: selected?.type || "",
      subject: selected?.subject || "",
      semester: selected?.semester || ""
    }));
    setStudents([]);
    setSelectedComponents([]);
    setSelectedExaminers([]);
  };

  const applyComponent = (component) => {
    setForm((prev) => ({
      ...prev,
      componenttype: component?.componenttype || prev.componenttype,
      scoretype: component?.scoretype || "",
      assessmentgroup: component?.assessmentgroup || "",
      assessmentgrouptype: component?.grouptype || component?.assessmentgrouptype || "",
      assessmentcomponent: component?.assessmentcomponent || "",
      maxmarks: component?.marks ?? component?.maxmarks ?? "",
      credits: component?.credits ?? ""
    }));
  };

  const loadPresentStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/examination-model2/component-allocation-students", { params: { colid: global1.colid, ...form } });
      setStudents(res.data?.data || []);
      if (!(res.data?.data || []).length) setMessage("No present students found for this course.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  const saveManual = async () => {
    try {
      setSaving(true);
      setError("");
      await ep1.post("/api/v2/examination-model2/component-allocations", { ...form, id: editId, colid: global1.colid, user: global1.user });
      setMessage(editId ? "Component allocation updated." : "Component allocation saved.");
      setEditId("");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save component allocation.");
    } finally {
      setSaving(false);
    }
  };

  const randomAllocate = async (useLimit = false, useAi = false) => {
    if (!selectedExaminers.length) return setError("Select at least one examiner.");
    if (!selectedComponents.length) return setError("Select at least one assessment component.");
    if (useLimit && (!Number(papersPerExaminer) || Number(papersPerExaminer) <= 0)) return setError("Enter no. of papers per examiner.");
    try {
      setAllocating(true);
      setError("");
      setAiResponse("");
      const res = await ep1.post("/api/v2/examination-model2/component-allocations-random", {
        ...form,
        colid: global1.colid,
        user: global1.user,
        examineremails: selectedExaminers.map((row) => row.examineremail),
        componentids: selectedComponents.map((row) => row._id),
        papersperexaminer: useLimit ? Number(papersPerExaminer) : "",
        airules: useAi ? aiRules : ""
      });
      setRows(res.data?.data || []);
      setAiResponse(res.data?.airesponse || "");
      setMessage(`${res.data?.saved || 0} componentwise allocation rows saved.`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to allocate componentwise.");
    } finally {
      setAllocating(false);
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({ ...blankForm, ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRows = async (ids) => {
    if (!ids.length) return setError("Select rows to delete.");
    if (!window.confirm(`Delete ${ids.length} selected row(s)?`)) return;
    await ep1.post("/api/v2/examination-model2/component-allocations-bulk-delete", { colid: global1.colid, ids });
    setMessage("Selected rows deleted.");
    await loadRows();
  };

  const handleSelection = (model) => {
    if (Array.isArray(model)) return setSelectedIds(model);
    if (model?.ids instanceof Set) return setSelectedIds(model.type === "exclude" ? rows.map((row) => row._id).filter((id) => !model.ids.has(id)) : [...model.ids]);
    return setSelectedIds([]);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ ...blankForm, academicyear: "2026-27", regulation: "NEP", exam: "Semester Exam", examcode: "SEM1", program: "B.Com", programcode: "BCOM", course: "Accounting", coursecode: "ACC101", examinername: "Examiner", examineremail: "examiner@example.com", student: "Student", regno: "REG001", examrollno: "MongoDB examroll _id", componenttype: "Theory", scoretype: "External", assessmentgroup: "End Sem", assessmentgrouptype: "Average", assessmentcomponent: "Theory Paper", maxmarks: 100, credits: 4 }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Component Allocation");
    XLSX.writeFile(wb, "componentwise_allocation_template.xlsx");
  };

  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rowsFromFile = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      const res = await ep1.post("/api/v2/examination-model2/component-allocations-bulk", { colid: global1.colid, user: global1.user, rows: rowsFromFile });
      setMessage(`Bulk upload completed. Saved: ${res.data?.saved || 0}`);
      setError((res.data?.errors || []).slice(0, 5).map((item) => `Row ${item.row}: ${item.message}`).join(" | "));
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload.");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "examcode", headerName: "Exam Code", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 130 },
    { field: "program", headerName: "Program", width: 160 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "course", headerName: "Course", minWidth: 180, flex: 1 },
    { field: "coursecode", headerName: "Course Code", width: 130 },
    { field: "componenttype", headerName: "Component Type", width: 150 },
    { field: "scoretype", headerName: "Score Type", width: 130 },
    { field: "assessmentgroup", headerName: "Assessment Group", width: 170 },
    { field: "assessmentgrouptype", headerName: "Group Type", width: 130 },
    { field: "assessmentcomponent", headerName: "Component", width: 170 },
    { field: "maxmarks", headerName: "Max Marks", width: 120 },
    { field: "credits", headerName: "Credits", width: 100 },
    { field: "examinername", headerName: "Examiner", width: 170 },
    { field: "examineremail", headerName: "Examiner Email", width: 220 },
    { field: "examrollno", headerName: "Exam Roll No", width: 230 },
    { field: "student", headerName: "Student", width: 170 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "startdate", headerName: "Start Date", width: 130 },
    { field: "enddate", headerName: "End Date", width: 130 },
    { field: "actions", headerName: "Actions", width: 150, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRows([params.row._id])}>Delete</Button></Stack> }
  ];

  return (
    <MenuPageShell title="Componentwise Allocation">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Componentwise Allocation</Typography>
              <Typography color="text.secondary">Allocate examiners student-wise and assessment-component-wise.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={uploading}>
                {uploading ? "Uploading..." : "Bulk Upload"}
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} />
              </Button>
            </Stack>
          </Stack>
          {(loading || saving || allocating || uploading) && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...blankForm, academicyear: e.target.value })}>{dropdowns.academicyears.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2.5}><TextField select fullWidth label="Exam" value={form.examcode} onChange={(e) => { const exam = dropdowns.exams.find((item) => item.examcode === e.target.value); setForm((prev) => ({ ...blankForm, academicyear: prev.academicyear, examcode: e.target.value, exam: exam?.exam || "" })); }}>{dropdowns.exams.map((item) => <MenuItem key={item.examcode} value={item.examcode}>{item.exam} ({item.examcode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => setForm((prev) => ({ ...prev, regulation: e.target.value, program: "", programcode: "", course: "", coursecode: "" }))}>{dropdowns.regulations.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2.5}><TextField select fullWidth label="Program" value={form.programcode} onChange={(e) => { const program = dropdowns.programs.find((item) => item.programcode === e.target.value); setForm((prev) => ({ ...prev, programcode: e.target.value, program: program?.program || "", course: "", coursecode: "" })); }}>{dropdowns.programs.map((item) => <MenuItem key={item.programcode} value={item.programcode}>{item.program} ({item.programcode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><Autocomplete options={dropdowns.coursesList} getOptionLabel={courseLabel} value={dropdowns.coursesList.find((item) => item.coursecode === form.coursecode) || null} onChange={(_, value) => setCourseDetails(value?.coursecode || "")} renderInput={(params) => <TextField {...params} label="Course" />} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Component Type" value={form.componenttype} onChange={(e) => { setForm((prev) => ({ ...prev, componenttype: e.target.value, assessmentcomponent: "" })); setSelectedComponents([]); }}>{["Theory", "Practical", "Viva"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={5}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={courseComponents}
                value={selectedComponents}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                getOptionLabel={componentLabel}
                onChange={(_, value) => { setSelectedComponents(value || []); if (value?.[0]) applyComponent(value[0]); }}
                renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} sx={{ mr: 1 }} />{componentLabel(option)}</li>}
                renderInput={(params) => <TextField {...params} label="Assessment components" placeholder="Search/select components" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={loadPresentStudents} disabled={loading} sx={{ height: 56 }}>Load Students ({students.length})</Button></Grid>
            <Grid item xs={12} md={3}><Autocomplete options={courseExaminers} getOptionLabel={(option) => `${option.examinername || ""}${option.examineremail ? ` (${option.examineremail})` : ""}`} onChange={(_, value) => setForm((prev) => ({ ...prev, examinername: value?.examinername || "", examineremail: value?.examineremail || "" }))} renderInput={(params) => <TextField {...params} label="Examiner for manual entry" />} /></Grid>
            <Grid item xs={12} md={4}><Autocomplete options={students} getOptionLabel={(option) => `${option.student || ""}${option.regno ? ` (${option.regno})` : ""}${option.examrollno ? ` - ${option.examrollno}` : ""}`} onChange={(_, value) => setForm((prev) => ({ ...prev, student: value?.student || "", regno: value?.regno || "", email: value?.email || "", examrollno: value?.examrollno || value?._id || "", examdate: value?.examdate || "", examslot: value?.examslot || "" }))} renderInput={(params) => <TextField {...params} label="Student for manual entry" />} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Start Date" value={form.startdate} onChange={(e) => setForm((prev) => ({ ...prev, startdate: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="End Date" value={form.enddate} onChange={(e) => setForm((prev) => ({ ...prev, enddate: e.target.value }))} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={saveManual} disabled={saving} sx={{ height: 56 }}>{saving ? "Saving..." : editId ? "Update" : "Save Manual"}</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>Bulk/random component allocation</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <Autocomplete multiple disableCloseOnSelect options={courseExaminers} value={selectedExaminers} isOptionEqualToValue={(option, value) => option.examineremail === value.examineremail} getOptionLabel={(option) => `${option.examinername || ""}${option.examineremail ? ` (${option.examineremail})` : ""}`} onChange={(_, value) => setSelectedExaminers(value || [])} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} sx={{ mr: 1 }} />{option.examinername} ({option.examineremail})</li>} renderInput={(params) => <TextField {...params} label="Select examiners" />} />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Papers per examiner" value={papersPerExaminer} onChange={(e) => setPapersPerExaminer(e.target.value)} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={allocating} onClick={() => randomAllocate(false, false)} sx={{ height: 56, whiteSpace: "nowrap" }}>{allocating ? "Allocating..." : "Auto Allocate All"}</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={allocating} onClick={() => randomAllocate(true, false)} sx={{ height: 56, whiteSpace: "nowrap" }}>{allocating ? "Allocating..." : "Allocate Limited"}</Button></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="AI allocation rules" value={aiRules} onChange={(e) => setAiRules(e.target.value)} placeholder="Example: keep viva load balanced and allocate theory only to senior examiners." /></Grid>
            <Grid item xs={12} md={3}><Button fullWidth variant="outlined" disabled={allocating} onClick={() => randomAllocate(Boolean(papersPerExaminer), true)} sx={{ height: 48 }}>AI Based Generation</Button></Grid>
            {aiResponse && <Grid item xs={12}><Alert severity="info">{aiResponse}</Alert></Grid>}
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {Object.entries(filters).map(([key, value]) => (
              <Grid item xs={12} md={2} key={key}>
                <TextField select fullWidth label={key} value={value} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {(filterOptions[key] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={() => loadRows()} disabled={loading} sx={{ height: 56 }}>Apply</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => setSelectedIds(rows.map((row) => row._id))} sx={{ height: 56 }}>Select All Loaded</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth color="error" variant="contained" disabled={!selectedIds.length} onClick={() => deleteRows(selectedIds)} sx={{ height: 56 }}>Bulk Delete ({selectedIds.length})</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 650 }}>
            <DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} loading={loading} checkboxSelection rowSelectionModel={selectedIds} onRowSelectionModelChange={handleSelection} slots={{ toolbar: GridToolbar }} slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "componentwise_allocation" } } }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
