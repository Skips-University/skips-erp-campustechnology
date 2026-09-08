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
import { Link as LinkIcon, Refresh, Send, UploadFile } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MentoringLayout from "./MentoringLayout";

const blankMessage = { itemtype: "Message", message: "", url: "" };

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

export default function StudentMentoringWorkspacePage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState(blankMessage);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const selectedWorkspace = useMemo(() => workspaces.find((row) => row._id === selectedWorkspaceId) || null, [workspaces, selectedWorkspaceId]);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) loadMessages(selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  const loadWorkspaces = async () => {
    try {
      const res = await ep1.get("/api/v2/mentoring/student-workspaces", {
        params: { colid: global1.colid, regno: global1.regno }
      });
      const rows = res.data.data || [];
      setWorkspaces(rows);
      if (!selectedWorkspaceId && rows[0]?._id) setSelectedWorkspaceId(rows[0]._id);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load mentoring workspaces");
    }
  };

  const loadMessages = async (workspaceid) => {
    const res = await ep1.get("/api/v2/mentoring/messages", { params: { colid: global1.colid, workspaceid } });
    setMessages(res.data.data || []);
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
      senderrole: "Student",
      sendername: global1.name,
      senderemail: global1.user,
      regno: global1.regno
    });
    setMessageForm(blankMessage);
    await loadMessages(selectedWorkspaceId);
  };

  const uploadAndShareFile = async () => {
    if (!selectedWorkspaceId || !selectedFile) {
      setError("Select a workspace and choose a file");
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
      senderrole: "Student",
      sendername: global1.name,
      senderemail: global1.user,
      regno: global1.regno,
      itemtype: "Document",
      message: `Shared file: ${fileData.filename || selectedFile.name}`,
      title: fileData.filename || selectedFile.name,
      url: fileData.url
    });
    setSelectedFile(null);
    await loadMessages(selectedWorkspaceId);
  };

  return (
    <MentoringLayout title="My Mentoring" student>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>My mentoring workspaces</Typography>
          <Typography color="text.secondary">View mentor groups, messages, documents, and useful links.</Typography>
        </Box>
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
                      Mentor: {workspace.facultyname || workspace.facultyemail || "-"}
                    </Typography>
                  </Paper>
                ))}
                {workspaces.length === 0 && <Typography color="text.secondary">No mentoring workspace assigned.</Typography>}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, minHeight: "calc(100vh - 150px)", bgcolor: "#f0f2f5" }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="h6">{selectedWorkspace?.groupname || "Select a group"}</Typography>
                  {selectedWorkspace && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip size="small" label={selectedWorkspace.programcode || selectedWorkspace.program || "Program"} />
                      <Chip size="small" label={`Sem ${selectedWorkspace.semester || "-"}`} />
                      <Chip size="small" label={selectedWorkspace.major || "Major"} />
                    </Stack>
                  )}
                </Box>
                <Button startIcon={<Refresh />} size="small" variant="outlined" disabled={!selectedWorkspaceId} onClick={() => loadMessages(selectedWorkspaceId)}>
                  Refresh
                </Button>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1.2} sx={{ height: "calc(100vh - 330px)", overflow: "auto", pr: 1 }}>
                {messages.map((row) => {
                  const mine = row.senderrole === "Student" && row.regno === global1.regno;
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
          </Grid>
        </Grid>
      </Stack>
    </MentoringLayout>
  );
}
