import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Add, Link as LinkIcon, Refresh, Send, UploadFile } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MentoringLayout from "./MentoringLayout";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "regulation", label: "Regulation" },
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "semester", label: "Semester" },
  { field: "section", label: "Section" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "category", label: "Category" },
  { field: "gender", label: "Gender" }
];
const textFilters = ["name", "email", "phone", "regno"];
const blankMessage = { itemtype: "Message", message: "", url: "" };

const firstValue = (rows, field) => rows.find((row) => row[field])?.[field] || "";

const bubbleSx = (mine) => ({
  alignSelf: mine ? "flex-end" : "flex-start",
  bgcolor: mine ? "#d9fdd3" : "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 2,
  px: 2,
  py: 1,
  maxWidth: "78%",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)"
});
const isImageUrl = (url = "") => /\.(png|jpe?g|gif|webp|bmp)$/i.test(url.split("?")[0]);
const isPdfUrl = (url = "") => /\.pdf$/i.test(url.split("?")[0]);
const renderPreview = (url) => {
  if (!url) return null;
  if (isImageUrl(url)) return <Box component="img" src={url} alt="preview" sx={{ display: "block", maxWidth: "100%", maxHeight: 220, borderRadius: 1, mt: 1 }} />;
  if (isPdfUrl(url)) return <Box component="iframe" title="Document preview" src={url} sx={{ width: "100%", height: 220, border: 0, borderRadius: 1, mt: 1 }} />;
  return null;
};

export default function MentoringWorkspacePage() {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({});
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [messages, setMessages] = useState([]);
  const [groupForm, setGroupForm] = useState({ groupname: "", description: "" });
  const [messageForm, setMessageForm] = useState(blankMessage);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedStudents = useMemo(() => students.filter((row) => selectedIds.includes(row._id)), [students, selectedIds]);
  const selectedWorkspace = useMemo(() => workspaces.find((row) => row._id === selectedWorkspaceId) || null, [workspaces, selectedWorkspaceId]);

  useEffect(() => {
    loadOptions();
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) loadMessages(selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/mentoring/options", { params: { colid: global1.colid } });
    setOptions(res.data.data?.options || {});
  };

  const searchStudents = async () => {
    setError("");
    const res = await ep1.post("/api/v2/mentoring/students/search", { colid: global1.colid, filters });
    setStudents(res.data.data || []);
    setSelectedIds([]);
  };

  const loadWorkspaces = async () => {
    const res = await ep1.get("/api/v2/mentoring/faculty-workspaces", {
      params: { colid: global1.colid, facultyemail: global1.user }
    });
    setWorkspaces(res.data.data || []);
  };

  const loadMessages = async (workspaceid) => {
    const res = await ep1.get("/api/v2/mentoring/messages", { params: { colid: global1.colid, workspaceid } });
    setMessages(res.data.data || []);
  };

  const createWorkspace = async () => {
    if (!groupForm.groupname || selectedStudents.length === 0) {
      setError("Enter group name and select at least one student");
      return;
    }
    const payload = {
      colid: global1.colid,
      groupname: groupForm.groupname,
      description: groupForm.description,
      facultyname: global1.name,
      facultyemail: global1.user,
      academicyear: filters.academicyear || firstValue(selectedStudents, "academicyear"),
      regulation: filters.regulation || firstValue(selectedStudents, "regulation"),
      program: filters.program || firstValue(selectedStudents, "program"),
      programcode: filters.programcode || firstValue(selectedStudents, "programcode"),
      semester: filters.semester || firstValue(selectedStudents, "semester"),
      section: filters.section || firstValue(selectedStudents, "section"),
      major: filters.Major || firstValue(selectedStudents, "Major"),
      minor: filters.Minor || firstValue(selectedStudents, "Minor"),
      createdby: global1.user,
      students: selectedStudents.map((row) => ({ ...row, student: row.name, major: row.Major, minor: row.Minor }))
    };
    const res = await ep1.post("/api/v2/mentoring/workspaces", payload);
    setMessage("Mentoring workspace created");
    setGroupForm({ groupname: "", description: "" });
    setSelectedWorkspaceId(res.data.data?._id || "");
    await loadWorkspaces();
  };

  const sendMessage = async () => {
    if (!selectedWorkspaceId) return;
    if (!messageForm.message && !messageForm.url) {
      setError("Enter message or link");
      return;
    }
    await ep1.post("/api/v2/mentoring/messages", {
      ...messageForm,
      colid: global1.colid,
      workspaceid: selectedWorkspaceId,
      senderrole: "Faculty",
      sendername: global1.name,
      senderemail: global1.user
    });
    setMessageForm(blankMessage);
    await loadMessages(selectedWorkspaceId);
    await loadWorkspaces();
  };

  const uploadAndShareFile = async () => {
    if (!selectedWorkspaceId || !selectedFile) {
      setError("Select a group and choose a file");
      return;
    }
    const payload = new FormData();
    payload.append("colid", global1.colid);
    payload.append("file", selectedFile);
    const uploadRes = await ep1.post("/api/v2/mentoring/upload", payload, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    const fileData = uploadRes.data.data || {};
    await ep1.post("/api/v2/mentoring/messages", {
      colid: global1.colid,
      workspaceid: selectedWorkspaceId,
      senderrole: "Faculty",
      sendername: global1.name,
      senderemail: global1.user,
      itemtype: "Document",
      message: `Shared file: ${fileData.filename || selectedFile.name}`,
      title: fileData.filename || selectedFile.name,
      url: fileData.url
    });
    setSelectedFile(null);
    await loadMessages(selectedWorkspaceId);
    await loadWorkspaces();
  };

  const studentColumns = [
    { field: "name", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
    { field: "program", headerName: "Program", minWidth: 160 },
    { field: "programcode", headerName: "Program Code", minWidth: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "Major", headerName: "Major", minWidth: 150 },
    { field: "Minor", headerName: "Minor", minWidth: 150 }
  ];

  return (
    <MentoringLayout title="Mentoring">
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Mentoring workspace</Typography>
          <Typography color="text.secondary">Create custom student groups and continue conversations with documents and links.</Typography>
        </Box>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: "calc(100vh - 150px)", overflow: "auto" }}>
              <Typography variant="h6">Groups</Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {workspaces.map((workspace) => (
                  <Paper
                    key={workspace._id}
                    onClick={() => setSelectedWorkspaceId(workspace._id)}
                    sx={{
                      p: 1.5,
                      cursor: "pointer",
                      bgcolor: selectedWorkspaceId === workspace._id ? "#e3f2fd" : "#fff",
                      border: "1px solid #e5e7eb"
                    }}
                  >
                    <Typography fontWeight={700}>{workspace.groupname}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {workspace.students?.length || 0} students | {workspace.programcode || workspace.program || "-"}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Create group</Typography>
                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  {filterFields.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.field}>
                      <TextField select fullWidth size="small" label={item.label} value={filters[item.field] || ""} onChange={(e) => setFilters((prev) => ({ ...prev, [item.field]: e.target.value }))}>
                        <MenuItem value="">All</MenuItem>
                        {(options[item.field] || []).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                      </TextField>
                    </Grid>
                  ))}
                  {textFilters.map((field) => (
                    <Grid item xs={12} sm={6} md={3} key={field}>
                      <TextField fullWidth size="small" label={field.toUpperCase()} value={filters[field] || ""} onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))} />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button startIcon={<Refresh />} variant="outlined" onClick={searchStudents}>Load Students</Button>
                  </Grid>
                  <Grid item xs={12}>
                    <DataGrid
                      autoHeight
                      checkboxSelection
                      rows={students}
                      columns={studentColumns}
                      getRowId={(row) => row._id}
                      rowSelectionModel={selectedIds}
                      onRowSelectionModelChange={(ids) => setSelectedIds(ids)}
                      slots={{ toolbar: GridToolbar }}
                      pageSizeOptions={[10, 25, 50, 100]}
                      initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Group name" value={groupForm.groupname} onChange={(e) => setGroupForm((prev) => ({ ...prev, groupname: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Description" value={groupForm.description} onChange={(e) => setGroupForm((prev) => ({ ...prev, description: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={2}><Button fullWidth sx={{ height: 40 }} startIcon={<Add />} variant="contained" onClick={createWorkspace}>Create</Button></Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2, minHeight: 420, bgcolor: "#f0f2f5" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography variant="h6">{selectedWorkspace?.groupname || "Select a group"}</Typography>
                    {selectedWorkspace && <Chip size="small" label={`${selectedWorkspace.students?.length || 0} students`} />}
                  </Box>
                  <Button startIcon={<Refresh />} size="small" variant="outlined" disabled={!selectedWorkspaceId} onClick={() => loadMessages(selectedWorkspaceId)}>
                    Refresh
                  </Button>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={1.2} sx={{ height: 300, overflow: "auto", pr: 1 }}>
                  {messages.map((row) => {
                    const mine = row.senderemail === global1.user;
                    return (
                      <Box key={row._id} sx={bubbleSx(mine)}>
                        <Typography variant="caption" color="text.secondary">{row.sendername} | {new Date(row.createdAt).toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{row.message}</Typography>
                        {renderPreview(row.url)}
                        {row.url && <Button size="small" href={row.url} target="_blank" startIcon={<LinkIcon />}>{row.title || row.itemtype}</Button>}
                      </Box>
                    );
                  })}
                </Stack>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={2}>
                    <TextField select fullWidth size="small" label="Type" value={messageForm.itemtype} onChange={(e) => setMessageForm((prev) => ({ ...prev, itemtype: e.target.value }))}>
                      {["Message", "Document", "Link"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Message" value={messageForm.message} onChange={(e) => setMessageForm((prev) => ({ ...prev, message: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Document/Link URL" value={messageForm.url} onChange={(e) => setMessageForm((prev) => ({ ...prev, url: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={1}><Button fullWidth variant="contained" onClick={sendMessage} disabled={!selectedWorkspaceId}><Send /></Button></Grid>
                  <Grid item xs={12} md={2}>
                    <Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />}>
                      File
                      <input hidden type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button fullWidth variant="contained" color="secondary" onClick={uploadAndShareFile} disabled={!selectedWorkspaceId || !selectedFile}>
                      Upload
                    </Button>
                  </Grid>
                  {selectedFile && <Grid item xs={12}><Typography variant="caption">Selected file: {selectedFile.name}</Typography></Grid>}
                </Grid>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </MentoringLayout>
  );
}
