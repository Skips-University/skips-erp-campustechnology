import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Add, Delete, Edit, Refresh, Save, UploadFile } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  contenttype: "Course Material",
  title: "",
  description: "",
  topics: "",
  sequence: "1",
  filelink: "",
  videolink: "",
  mindmapid: "",
  mindmaptitle: "",
  status: "Active",
  flashcards: [{ question: "", questionimage: "", answer: "" }]
};
const contentTypes = ["Course Material", "Assignment", "Text", "Flash Card", "Infographics", "Video Link", "Mindmap"];
const clean = (value) => String(value || "").trim();
const uniqueSorted = (values = []) => [...new Set(values.map(clean).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

function courseLabel(row = {}) {
  return [row.academicyear, `Sem ${row.semester || ""}`, row.programcode, `${row.coursecode || ""} - ${row.course || ""}`].filter(Boolean).join(" | ");
}

function coursePayload(course = {}) {
  return {
    academicyear: course.academicyear || "",
    regulation: course.regulation || "",
    program: course.program || "",
    programcode: course.programcode || "",
    type: course.type || "",
    major: course.subject || course.major || "",
    semester: course.semester || "",
    course: course.course || "",
    coursecode: course.coursecode || "",
    faculty: course.facultyname || course.faculty || global1.name || "",
    facultyemail: course.facultyemail || global1.user || ""
  };
}

function PreReadingManager({ admin = false }) {
  const [courses, setCourses] = useState([]);
  const [selectedFacultyEmail, setSelectedFacultyEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [rows, setRows] = useState([]);
  const [mindmaps, setMindmaps] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const facultyOptions = useMemo(() => {
    const map = new Map();
    courses.forEach((row) => {
      const email = clean(row.facultyemail).toLowerCase();
      if (!email || map.has(email)) return;
      map.set(email, {
        email,
        name: row.facultyname || row.faculty || email,
        department: row.facultydepartment || ""
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [courses]);
  const filteredCourses = useMemo(() => (
    admin && selectedFacultyEmail
      ? courses.filter((row) => clean(row.facultyemail).toLowerCase() === clean(selectedFacultyEmail).toLowerCase())
      : admin ? [] : courses
  ), [admin, courses, selectedFacultyEmail]);
  const selectedCourse = useMemo(() => filteredCourses.find((row) => row._id === courseId) || null, [filteredCourses, courseId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params = { colid: global1.colid, status: "Active" };
      if (!admin) params.facultyemail = global1.user;
      const res = await ep1.get("/api/v2/workloadassignment", { params });
      const data = res.data?.data || [];
      const filtered = admin ? data : data.filter((row) => clean(row.facultyemail).toLowerCase() === clean(global1.user).toLowerCase());
      setCourses(filtered);
      if (!admin) setCourseId(filtered[0]?._id || "");
      else {
        setSelectedFacultyEmail("");
        setCourseId("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load courses");
    } finally {
      setLoading(false);
    }
  };

  const loadRows = async (course = selectedCourse) => {
    if (!course) {
      setRows([]);
      return;
    }
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/neplms/pre-reading", { params: { colid: global1.colid, ...coursePayload(course) } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pre-reading material");
    } finally {
      setLoading(false);
    }
  };

  const loadMindmaps = async (course = selectedCourse) => {
    if (!course) {
      setMindmaps([]);
      return;
    }
    try {
      const res = await ep1.get("/api/v2/neplms/mindmaps", { params: { colid: global1.colid, ...coursePayload(course), published: "Yes" } });
      setMindmaps(res.data?.data || []);
    } catch (err) {
      setMindmaps([]);
    }
  };

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (!admin) return;
    setCourseId(filteredCourses[0]?._id || "");
  }, [admin, selectedFacultyEmail, filteredCourses]);
  useEffect(() => { loadRows(selectedCourse); loadMindmaps(selectedCourse); }, [courseId]);

  const save = async () => {
    if (!selectedCourse) return setError("Select a course first");
    if (!form.title) return setError("Title is required");
    try {
      setLoading(true);
      setError("");
      const data = new FormData();
      Object.entries({ colid: global1.colid, user: global1.user, ...coursePayload(selectedCourse), ...form, id: editingId }).forEach(([key, value]) => {
        if (key === "flashcards") data.append(key, JSON.stringify(value || []));
        else data.append(key, value || "");
      });
      if (file) data.append("file", file);
      await ep1.post("/api/v2/neplms/pre-reading", data, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(editingId ? "Pre-reading item updated" : "Pre-reading item saved");
      setForm(blankForm);
      setEditingId("");
      setFile(null);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save pre-reading item");
    } finally {
      setLoading(false);
    }
  };

  const edit = (row) => {
    setEditingId(row._id);
    setForm({
      contenttype: row.contenttype || "Course Material",
      title: row.title || "",
      description: row.description || "",
      topics: row.topics || "",
      sequence: String(row.sequence || 1),
      filelink: row.filelink || "",
      videolink: row.videolink || "",
      mindmapid: row.mindmapid || "",
      mindmaptitle: row.mindmaptitle || "",
      status: row.status || "Active",
      flashcards: row.flashcards?.length ? row.flashcards : [{ question: "", questionimage: "", answer: "" }]
    });
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this pre-reading item?")) return;
    await ep1.post("/api/v2/neplms/pre-reading/delete", { id: row._id, colid: global1.colid });
    loadRows();
  };

  const updateFlashcard = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      flashcards: (prev.flashcards || []).map((card, cardIndex) => (cardIndex === index ? { ...card, [field]: value } : card))
    }));
  };

  const selectMindmap = (id) => {
    const map = mindmaps.find((item) => item._id === id);
    setForm((prev) => ({ ...prev, mindmapid: id, mindmaptitle: map?.title || "" }));
  };

  const columns = [
    { field: "sequence", headerName: "Seq", width: 80 },
    { field: "contenttype", headerName: "Type", minWidth: 150 },
    { field: "title", headerName: "Title", minWidth: 220, flex: 1 },
    { field: "topics", headerName: "Topics", minWidth: 180 },
    { field: "filelink", headerName: "File", minWidth: 120, renderCell: (p) => p.row.filelink ? <Button size="small" href={p.row.filelink} target="_blank" rel="noreferrer">Open</Button> : "" },
    { field: "videolink", headerName: "Video", minWidth: 120, renderCell: (p) => p.row.videolink ? <Button size="small" href={p.row.videolink} target="_blank" rel="noreferrer">Open</Button> : "" },
    { field: "status", headerName: "Status", minWidth: 110 },
    { field: "actions", type: "actions", width: 110, getActions: (p) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => edit(p.row)} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => remove(p.row)} />
    ] }
  ];

  return (
    <MenuPageShell title={admin ? "Admin Pre Reading Material" : "Pre Reading Material"}>
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>{admin ? "Admin Pre Reading Material" : "Pre Reading Material"}</Typography>
            <Typography variant="body2" color="text.secondary">Add preparatory content before class: files, videos, assignments, flash cards, infographics and mind maps.</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => { loadRows(); loadMindmaps(); }}>Reload</Button>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {admin && (
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={facultyOptions}
                  value={facultyOptions.find((item) => item.email === selectedFacultyEmail) || null}
                  onChange={(_, item) => {
                    setSelectedFacultyEmail(item?.email || "");
                    setRows([]);
                    setMindmaps([]);
                    setForm(blankForm);
                    setEditingId("");
                  }}
                  getOptionLabel={(option) => `${option.name || ""}${option.email ? ` - ${option.email}` : ""}${option.department ? ` (${option.department})` : ""}`}
                  isOptionEqualToValue={(option, value) => option.email === value.email}
                  renderInput={(params) => <TextField {...params} label="Select Faculty" />}
                />
              </Grid>
            )}
            <Grid item xs={12} md={admin ? 7 : 12}>
              <Autocomplete
                options={filteredCourses}
                value={filteredCourses.find((course) => course._id === courseId) || null}
                onChange={(_, item) => setCourseId(item?._id || "")}
                getOptionLabel={(option) => courseLabel(option)}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                disabled={admin && !selectedFacultyEmail}
                renderInput={(params) => <TextField {...params} label={admin && !selectedFacultyEmail ? "Select faculty first" : "Select Course"} />}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Content Type" value={form.contenttype} onChange={(e) => setForm((prev) => ({ ...prev, contenttype: e.target.value }))}>{contentTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Sequence" value={form.sequence} onChange={(e) => setForm((prev) => ({ ...prev, sequence: e.target.value }))} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<Save />} sx={{ height: 56 }} disabled={loading} onClick={save}>{loading ? "Saving..." : editingId ? "Update" : "Save"}</Button></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Topics" value={form.topics} onChange={(e) => setForm((prev) => ({ ...prev, topics: e.target.value }))} /></Grid>
            <Grid item xs={12} md={8}><TextField fullWidth multiline minRows={2} label="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} /></Grid>
            {["Course Material", "Assignment", "Text", "Infographics"].includes(form.contenttype) && (
              <>
                <Grid item xs={12} md={8}><TextField fullWidth label="File / Content Link" value={form.filelink} onChange={(e) => setForm((prev) => ({ ...prev, filelink: e.target.value }))} /></Grid>
                <Grid item xs={12} md={4}><Button component="label" fullWidth variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>{file?.name || "Upload file"}<input hidden type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Button></Grid>
              </>
            )}
            {form.contenttype === "Video Link" && <Grid item xs={12}><TextField fullWidth label="Video Link" value={form.videolink} onChange={(e) => setForm((prev) => ({ ...prev, videolink: e.target.value }))} /></Grid>}
            {form.contenttype === "Mindmap" && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Mindmap</InputLabel>
                  <Select label="Mindmap" value={form.mindmapid} onChange={(e) => selectMindmap(e.target.value)}>
                    {mindmaps.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {form.contenttype === "Flash Card" && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  {(form.flashcards || []).map((card, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Question" value={card.question || ""} onChange={(e) => updateFlashcard(index, "question", e.target.value)} /></Grid>
                        <Grid item xs={12} md={3}><TextField fullWidth label="Question Image Link" value={card.questionimage || ""} onChange={(e) => updateFlashcard(index, "questionimage", e.target.value)} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Answer" value={card.answer || ""} onChange={(e) => updateFlashcard(index, "answer", e.target.value)} /></Grid>
                        <Grid item xs={12} md={1}><Button fullWidth color="error" variant="outlined" sx={{ height: 56 }} onClick={() => setForm((prev) => ({ ...prev, flashcards: prev.flashcards.filter((_, i) => i !== index) }))}>X</Button></Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button startIcon={<Add />} variant="outlined" onClick={() => setForm((prev) => ({ ...prev, flashcards: [...(prev.flashcards || []), { question: "", questionimage: "", answer: "" }] }))}>Add flash card</Button>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 1000 }} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

function FlashCards({ cards = [] }) {
  const [flipped, setFlipped] = useState({});
  return (
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Box
            onClick={() => setFlipped((prev) => ({ ...prev, [index]: !prev[index] }))}
            sx={{ perspective: "1000px", minHeight: 190, cursor: "pointer" }}
          >
            <Box sx={{ position: "relative", width: "100%", minHeight: 190, transition: "transform .5s", transformStyle: "preserve-3d", transform: flipped[index] ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              {[false, true].map((back) => (
                <Paper key={String(back)} sx={{ position: "absolute", inset: 0, p: 2, display: "flex", flexDirection: "column", justifyContent: "center", backfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : "none", bgcolor: back ? "#ecfdf5" : "#eff6ff" }}>
                  <Typography fontWeight={900}>{back ? "Answer" : "Question"}</Typography>
                  {!back && card.questionimage && <Box component="img" src={card.questionimage} alt="" sx={{ maxHeight: 80, objectFit: "contain", my: 1 }} />}
                  <Typography>{back ? card.answer : card.question}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export function StudentPreReadingPage() {
  const [coursecode, setCoursecode] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const courseOptions = useMemo(() => uniqueSorted(rows.map((row) => row.coursecode)).map((code) => rows.find((row) => row.coursecode === code)).filter(Boolean), [rows]);
  const filteredRows = useMemo(() => rows.filter((row) => !coursecode || row.coursecode === coursecode), [rows, coursecode]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/student-workspace/pre-reading", { params: { colid: global1.colid, regno: global1.regno } });
      const data = res.data?.data || [];
      setRows(data);
      setCoursecode(data[0]?.coursecode || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pre-reading material");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <MenuPageShell title="Pre Reading Material" menuType="student">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Pre Reading Material</Typography>
            <Typography variant="body2" color="text.secondary">Review preparation material shared before class.</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>Reload</Button>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Course</InputLabel>
            <Select label="Course" value={coursecode} onChange={(e) => setCoursecode(e.target.value)}>
              <MenuItem value="">All courses</MenuItem>
              {courseOptions.map((course) => <MenuItem key={course.coursecode} value={course.coursecode}>{course.coursecode} - {course.course}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>
        {loading && <Alert severity="info">Loading pre-reading material...</Alert>}
        <Grid container spacing={2}>
          {filteredRows.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item._id}>
              <Card sx={{ height: "100%", borderTop: "5px solid #2563eb" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                    <Chip label={item.contenttype} size="small" color="primary" />
                    <Chip label={`Seq ${item.sequence || 1}`} size="small" />
                  </Stack>
                  <Typography variant="h6" fontWeight={900}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{item.coursecode} - {item.course}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{item.description}</Typography>
                  {item.topics && <Typography variant="caption">Topics: {item.topics}</Typography>}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    {item.filelink && <Button size="small" variant="outlined" href={item.filelink} target="_blank" rel="noreferrer">Open file</Button>}
                    {item.videolink && <Button size="small" variant="outlined" href={item.videolink} target="_blank" rel="noreferrer">Open video</Button>}
                    {item.mindmapid && <Button size="small" variant="outlined" href={`/studentneplmsmindmaps?coursecode=${encodeURIComponent(item.coursecode || "")}`} target="_blank" rel="noreferrer">Open mindmap</Button>}
                  </Stack>
                  {item.contenttype === "Flash Card" && <Box sx={{ mt: 2 }}><FlashCards cards={item.flashcards || []} /></Box>}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {!loading && !filteredRows.length && <Alert severity="info">No pre-reading material is available for the selected course.</Alert>}
      </Box>
    </MenuPageShell>
  );
}

export default function NepLmsPreReadingPage() {
  return <PreReadingManager />;
}

export function NepLmsPreReadingAdminPage() {
  return <PreReadingManager admin />;
}
