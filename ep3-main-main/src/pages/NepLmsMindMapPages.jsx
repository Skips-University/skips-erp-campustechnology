import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  TextField,
  Typography
} from "@mui/material";
import { Add, Delete, FileDownload, Publish, Refresh, Save } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const clean = (value) => String(value || "").trim();
const cleanLower = (value) => clean(value).toLowerCase();
const activeColid = () => global1.colid || global1.admincolid || "";
const uniqueSorted = (values = []) => [...new Set(values.map(clean).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const defaultNodes = [
  { id: "root", type: "default", position: { x: 320, y: 160 }, data: { label: "Central concept" }, style: { background: "#0f766e", color: "#fff", borderRadius: 8, border: "1px solid #0f766e", padding: 10, fontWeight: 800 } }
];
const nodeStyles = {
  Concept: { background: "#0f766e", color: "#fff" },
  Topic: { background: "#2563eb", color: "#fff" },
  Example: { background: "#f59e0b", color: "#111827" },
  Note: { background: "#f8fafc", color: "#111827" }
};

const classLabel = (row = {}) => [
  row.classdate,
  row.classtime,
  `${row.course || ""} (${row.coursecode || ""})`,
  row.programcode,
  row.semester ? `Sem ${row.semester}` : ""
].filter(Boolean).join(" | ");

function MindMapCanvas({ nodes, edges, setNodes, setEdges, readOnly }) {
  const [nodeText, setNodeText] = useState("");
  const [nodeType, setNodeType] = useState("Topic");

  const onNodesChange = useCallback((changes) => {
    if (!readOnly) setNodes((items) => applyNodeChanges(changes, items));
  }, [readOnly, setNodes]);
  const onEdgesChange = useCallback((changes) => {
    if (!readOnly) setEdges((items) => applyEdgeChanges(changes, items));
  }, [readOnly, setEdges]);
  const onConnect = useCallback((params) => {
    if (!readOnly) setEdges((items) => addEdge({ ...params, animated: true, style: { stroke: "#2563eb", strokeWidth: 2 } }, items));
  }, [readOnly, setEdges]);

  const addNode = (label = nodeText, type = nodeType, position = null) => {
    if (readOnly || !clean(label)) return;
    const id = `node-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const style = nodeStyles[type] || nodeStyles.Topic;
    setNodes((items) => [...items, {
      id,
      position: position || { x: 120 + (items.length % 5) * 170, y: 120 + Math.floor(items.length / 5) * 120 },
      data: { label: clean(label), kind: type },
      style: { ...style, borderRadius: 8, border: "1px solid #cbd5e1", padding: 10, fontWeight: 800, minWidth: 130 }
    }]);
    setNodeText("");
  };

  const onDrop = (event) => {
    event.preventDefault();
    if (readOnly) return;
    const type = event.dataTransfer.getData("application/neplms-node-type") || "Topic";
    const label = event.dataTransfer.getData("application/neplms-node-label") || `${type} node`;
    const bounds = event.currentTarget.getBoundingClientRect();
    addNode(label, type, { x: event.clientX - bounds.left - 70, y: event.clientY - bounds.top - 35 });
  };

  const updateSelectedNode = () => {
    if (readOnly || !clean(nodeText)) return;
    setNodes((items) => items.map((node) => node.selected ? { ...node, data: { ...node.data, label: clean(nodeText) } } : node));
    setNodeText("");
  };

  const deleteSelected = () => {
    if (readOnly) return;
    setNodes((items) => items.filter((node) => !node.selected));
    setEdges((items) => items.filter((edge) => !edge.selected));
  };

  return (
    <Paper sx={{ p: 2 }}>
      {!readOnly && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Node Type</InputLabel>
              <Select label="Node Type" value={nodeType} onChange={(event) => setNodeType(event.target.value)}>
                {Object.keys(nodeStyles).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}><TextField fullWidth label="Node text" value={nodeText} onChange={(event) => setNodeText(event.target.value)} /></Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="contained" startIcon={<Add />} onClick={() => addNode()}>Add Node</Button>
              <Button fullWidth variant="outlined" onClick={updateSelectedNode}>Update Selected</Button>
              <Button color="error" variant="outlined" onClick={deleteSelected}>Delete</Button>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {Object.keys(nodeStyles).map((item) => (
                <Chip
                  key={item}
                  label={`Drag ${item}`}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("application/neplms-node-type", item);
                    event.dataTransfer.setData("application/neplms-node-label", item);
                  }}
                  sx={{ ...nodeStyles[item], fontWeight: 800, cursor: "grab" }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      )}
      <Box onDrop={onDrop} onDragOver={(event) => event.preventDefault()} sx={{ height: 620, border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView nodesDraggable={!readOnly} nodesConnectable={!readOnly} elementsSelectable={!readOnly}>
          <MiniMap />
          <Controls />
          <Background gap={18} />
        </ReactFlow>
      </Box>
    </Paper>
  );
}

function MindMapEditor({ admin = false }) {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [maps, setMaps] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMapId, setSelectedMapId] = useState("");
  const [form, setForm] = useState({ title: "", description: "", published: "No" });
  const [nodes, setNodes] = useState(defaultNodes);
  const [edges, setEdges] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", facultyemail: "", coursecode: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadContext();
    loadMaps();
  }, []);

  const loadContext = async () => {
    const colid = activeColid();
    if (!colid) {
      setError("Institution id is not available. Please login again.");
      return;
    }
    setLoading(true);
    try {
      const [workloadRes, timetableRes] = await Promise.all([
        ep1.get("/api/v2/workloadassignment", { params: { colid } }),
        ep1.get("/api/v2/neplms/timetable", { params: { colid } })
      ]);
      const currentUser = cleanLower(global1.user || global1.email);
      const assigned = (workloadRes.data?.data || []).filter((row) => admin || cleanLower(row.facultyemail) === currentUser);
      const timetableRows = (timetableRes.data?.data || []).filter((row) => {
        if (!admin && cleanLower(row.facultyemail) && cleanLower(row.facultyemail) !== currentUser) return false;
        return assigned.some((assignment) => cleanLower(assignment.academicyear) === cleanLower(row.academicyear)
          && cleanLower(assignment.programcode) === cleanLower(row.programcode)
          && cleanLower(assignment.semester) === cleanLower(row.semester)
          && cleanLower(assignment.coursecode) === cleanLower(row.coursecode)
          && (!cleanLower(row.facultyemail) || cleanLower(assignment.facultyemail) === cleanLower(row.facultyemail)));
      });
      setAssignments(assigned);
      setClasses(timetableRows);
      setSelectedClassId((prev) => prev || timetableRows[0]?._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assigned classes");
    } finally {
      setLoading(false);
    }
  };

  const loadMaps = async () => {
    try {
      const colid = activeColid();
      if (!colid) {
        setError("Institution id is not available. Please login again.");
        setMaps([]);
        return;
      }
      const params = { colid };
      if (!admin) params.facultyemail = global1.user;
      const res = await ep1.get("/api/v2/neplms/mindmaps", { params });
      setMaps(res.data?.data || []);
    } catch (err) {
      setMaps([]);
      setError(err.response?.data?.message || err.message || "Unable to load mind maps");
    }
  };

  const filteredClasses = useMemo(() => classes.filter((row) => (
    (!filters.academicyear || row.academicyear === filters.academicyear)
    && (!filters.facultyemail || row.facultyemail === filters.facultyemail)
    && (!filters.coursecode || row.coursecode === filters.coursecode)
  )), [classes, filters]);
  const classOptions = useMemo(() => ({
    academicyear: uniqueSorted(classes.map((row) => row.academicyear)),
    facultyemail: uniqueSorted(classes.map((row) => row.facultyemail)),
    coursecode: uniqueSorted(classes.map((row) => row.coursecode))
  }), [classes]);
  const selectedClass = useMemo(() => classes.find((row) => row._id === selectedClassId) || filteredClasses[0] || null, [classes, filteredClasses, selectedClassId]);

  const selectedAssignment = useMemo(() => {
    if (!selectedClass) return null;
    return assignments.find((row) => cleanLower(row.academicyear) === cleanLower(selectedClass.academicyear)
      && cleanLower(row.programcode) === cleanLower(selectedClass.programcode)
      && cleanLower(row.semester) === cleanLower(selectedClass.semester)
      && cleanLower(row.coursecode) === cleanLower(selectedClass.coursecode)
      && (!cleanLower(selectedClass.facultyemail) || cleanLower(row.facultyemail) === cleanLower(selectedClass.facultyemail)));
  }, [assignments, selectedClass]);

  const saveMap = async (publish = false) => {
    if (!selectedClass) {
      setError("Select a class first");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const colid = activeColid();
      if (!colid) throw new Error("Institution id is not available. Please login again.");
      const payload = {
        id: selectedMapId,
        title: form.title || selectedClass.course || "Mind Map",
        description: form.description,
        published: publish ? "Yes" : form.published,
        status: publish ? "Published" : (form.published === "Yes" ? "Published" : "Draft"),
        nodes,
        edges,
        colid,
        user: global1.user,
        academicyear: selectedAssignment?.academicyear || selectedClass.academicyear,
        regulation: selectedAssignment?.regulation || selectedClass.regulation || "",
        program: selectedAssignment?.program || selectedClass.program || "",
        programcode: selectedAssignment?.programcode || selectedClass.programcode,
        type: selectedAssignment?.type || selectedClass.type || "",
        subject: selectedAssignment?.subject || selectedClass.major || "",
        semester: selectedAssignment?.semester || selectedClass.semester,
        course: selectedAssignment?.course || selectedClass.course,
        coursecode: selectedAssignment?.coursecode || selectedClass.coursecode,
        classid: selectedClass._id,
        classdate: selectedClass.classdate || "",
        classtime: selectedClass.classtime || "",
        faculty: selectedAssignment?.facultyname || selectedClass.faculty || global1.name,
        facultyemail: selectedAssignment?.facultyemail || selectedClass.facultyemail || global1.user
      };
      const res = await ep1.post("/api/v2/neplms/mindmaps", payload);
      setSelectedMapId(res.data?.data?._id || "");
      setForm((prev) => ({ ...prev, published: publish ? "Yes" : prev.published }));
      setMessage(publish ? "Mind map published" : "Mind map saved");
      loadMaps();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save mind map");
    } finally {
      setLoading(false);
    }
  };

  const editMap = (row) => {
    setSelectedMapId(row._id);
    setSelectedClassId(row.classid || "");
    setForm({ title: row.title || "", description: row.description || "", published: row.published || "No" });
    setNodes(row.nodes?.length ? row.nodes : defaultNodes);
    setEdges(row.edges || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const newMap = () => {
    setSelectedMapId("");
    setForm({ title: "", description: "", published: "No" });
    setNodes(defaultNodes);
    setEdges([]);
  };

  const deleteMap = async (row) => {
    if (!window.confirm("Delete this mind map?")) return;
    const colid = activeColid();
    if (!colid) {
      setError("Institution id is not available. Please login again.");
      return;
    }
    await ep1.post("/api/v2/neplms/mindmaps/delete", { id: row._id, colid });
    if (selectedMapId === row._id) newMap();
    loadMaps();
  };

  const columns = [
    { field: "title", headerName: "Title", width: 220 },
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "course", headerName: "Course", width: 220 },
    { field: "faculty", headerName: "Faculty", width: 180 },
    { field: "published", headerName: "Published", width: 110 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem icon={<Save />} label="Edit" onClick={() => editMap(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteMap(params.row)} />
      ]
    }
  ];

  return (
    <MenuPageShell title={admin ? "Admin Mind Maps" : "Faculty Mind Maps"}>
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>{admin ? "Admin Mind Maps" : "Faculty Mind Maps"}</Typography>
            <Typography variant="body2" color="text.secondary">Select an assigned class, drag nodes into the canvas, connect them, save, then publish for students.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => { loadContext(); loadMaps(); }}>Reload</Button>
            <Button variant="outlined" startIcon={<Add />} onClick={newMap}>New</Button>
          </Stack>
        </Stack>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {["academicyear", "facultyemail", "coursecode"].map((field) => (
              <Grid item xs={12} md={4} key={field}>
                <TextField select fullWidth label={field} value={filters[field]} onChange={(event) => setFilters((prev) => ({ ...prev, [field]: event.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {classOptions[field].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assigned Class</InputLabel>
                <Select label="Assigned Class" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
                  {filteredClasses.map((row) => <MenuItem key={row._id} value={row._id}>{classLabel(row)}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}><TextField fullWidth label="Mind map title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} /></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth label="Description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} /></Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Published</InputLabel>
                <Select label="Published" value={form.published} onChange={(event) => setForm((prev) => ({ ...prev, published: event.target.value }))}>
                  <MenuItem value="No">No</MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {selectedClass && (
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={selectedClass.academicyear} />
                  <Chip label={selectedClass.programcode} />
                  <Chip label={`Sem ${selectedClass.semester || "-"}`} />
                  <Chip label={`${selectedClass.course || ""} (${selectedClass.coursecode || ""})`} />
                  <Chip label={selectedClass.facultyemail || selectedAssignment?.facultyemail || ""} />
                </Stack>
              </Grid>
            )}
          </Grid>
        </Paper>
        <MindMapCanvas nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
        <Stack direction="row" spacing={1} sx={{ my: 2 }}>
          <Button variant="contained" startIcon={<Save />} disabled={loading} onClick={() => saveMap(false)}>Save Mind Map</Button>
          <Button variant="contained" color="success" startIcon={<Publish />} disabled={loading} onClick={() => saveMap(true)}>Publish</Button>
        </Stack>
        <Paper sx={{ p: 1, overflowX: "auto" }}>
          <DataGrid rows={maps.map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} sx={{ minWidth: 1300 }} />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}

function StudentMindMaps() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [maps, setMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const queryCourseCode = queryParams.get("coursecode") || "";
  const queryMindMapId = queryParams.get("mindmapid") || "";

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseId) loadMaps(courseId);
    else {
      setMaps([]);
      setSelectedMapId("");
    }
  }, [courseId]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const colid = activeColid();
      if (!colid) throw new Error("Institution id is not available. Please login again.");
      const res = await ep1.get("/api/v2/neplms/student-workspace/courses", { params: { colid, regno: global1.regno } });
      const data = res.data?.courses || [];
      setCourses(data);
      const queryCourse = data.find((row) => cleanLower(row.coursecode) === cleanLower(queryCourseCode));
      setCourseId((prev) => prev || queryCourse?._id || data[0]?._id || "");
    } catch (err) {
      setCourses([]);
      setMaps([]);
      setError(err.response?.data?.message || err.message || "Unable to load courses");
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((row) => row._id === courseId) || null;

  const loadMaps = async (nextCourseId = courseId) => {
    const course = courses.find((row) => row._id === nextCourseId) || selectedCourse;
    if (!course) {
      setMaps([]);
      setSelectedMapId("");
      return;
    }
    setLoading(true);
    try {
      const colid = activeColid();
      if (!colid) throw new Error("Institution id is not available. Please login again.");
      const res = await ep1.get("/api/v2/neplms/mindmaps/student", {
        params: {
          colid,
          regno: global1.regno,
          email: global1.user,
          coursecode: course.coursecode
        }
      });
      const data = res.data?.data || [];
      setMaps(data);
      setSelectedMapId((prev) => data.some((row) => row._id === prev) ? prev : data.find((row) => row._id === queryMindMapId)?._id || data[0]?._id || "");
    } catch (err) {
      setMaps([]);
      setError(err.response?.data?.message || err.message || "Unable to load mind maps");
    } finally {
      setLoading(false);
    }
  };

  const selectedMap = maps.find((row) => row._id === selectedMapId) || null;
  const exportMaps = (format = "csv") => {
    const rows = maps.map((row) => ({
      title: row.title || "",
      academicyear: row.academicyear || "",
      programcode: row.programcode || "",
      semester: row.semester || "",
      course: row.course || "",
      coursecode: row.coursecode || "",
      faculty: row.faculty || "",
      description: row.description || "",
      nodes: row.nodes?.length || 0,
      edges: row.edges?.length || 0
    }));
    const content = format === "json"
      ? JSON.stringify(maps, null, 2)
      : [
        Object.keys(rows[0] || { title: "", academicyear: "", programcode: "", semester: "", course: "", coursecode: "", faculty: "", description: "", nodes: "", edges: "" }).join(","),
        ...rows.map((row) => Object.values(row).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mindmaps_${selectedCourse?.coursecode || "course"}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MenuPageShell title="My Mind Maps" menuType="student">
      <Box p={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>My Mind Maps</Typography>
            <Typography variant="body2" color="text.secondary">Visualize published mind maps for your courses.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Refresh />} disabled={loading} onClick={loadCourses}>Reload</Button>
            <Button variant="outlined" startIcon={<FileDownload />} disabled={!maps.length} onClick={() => exportMaps("csv")}>Export CSV</Button>
            <Button variant="outlined" startIcon={<FileDownload />} disabled={!maps.length} onClick={() => exportMaps("json")}>Export JSON</Button>
          </Stack>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select label="Course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                  {courses.map((row) => <MenuItem key={row._id} value={row._id}>{row.course} ({row.coursecode}) | Sem {row.semester}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedCourse}>
                <InputLabel>Mind Map</InputLabel>
                <Select label="Mind Map" value={selectedMapId} onChange={(event) => setSelectedMapId(event.target.value)}>
                  {maps.map((row) => <MenuItem key={row._id} value={row._id}>{row.title} | {row.course} ({row.coursecode})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        {selectedMap ? (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip color="primary" label={selectedMap.title} />
                <Chip label={selectedMap.academicyear} />
                <Chip label={selectedMap.programcode} />
                <Chip label={`Sem ${selectedMap.semester}`} />
                <Chip label={`${selectedMap.course} (${selectedMap.coursecode})`} />
              </Stack>
              {selectedMap.description && <Typography sx={{ mt: 1 }}>{selectedMap.description}</Typography>}
            </Paper>
            <MindMapCanvas nodes={selectedMap.nodes || []} edges={selectedMap.edges || []} setNodes={() => {}} setEdges={() => {}} readOnly />
          </>
        ) : (
          <Alert severity="info">No published mind maps are available.</Alert>
        )}
      </Box>
    </MenuPageShell>
  );
}

export function NepLmsFacultyMindMapPage() {
  return <MindMapEditor />;
}

export function NepLmsAdminMindMapPage() {
  return <MindMapEditor admin />;
}

export function NepLmsStudentMindMapPage() {
  return <StudentMindMaps />;
}
