import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Snackbar,
  Alert,
  Skeleton,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField as MuiTextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import TaskCard from "../components/TaskCard";
import UserSearch from "../components/UserSearch";
import ep1 from "../api/ep1";
import global1 from "./global1";

const STATUSES = ["Pending", "Completed", "Approved"];
const SkeletonCard = () => (
  <Skeleton
    variant="rectangular"
    height={180}
    sx={{ borderRadius: 4, mb: 2 }}
  />
);

export default function TaskCreatorPage() {
  const [statusIdx, setStatusIdx] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  /* create dialog */
  const [openCreate, setOpenCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [taskType, setTaskType] = useState("Feature");
  const [assignee, setAssignee] = useState(null);
  const [follower, setFollower] = useState(null);

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "error",
  });
  const showSnack = (msg, sev = "error") =>
    setSnack({ open: true, msg, severity: sev });

  /* -------- comment state -------- */
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentTask, setCommentTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  /* ---- separate search helpers ---- */
  const fetchMyTasks = async (status, q) =>
    ep1.get("/api/v2/getcreatortasks", {
      params: { status, q, colid: global1.colid, email: global1.user },
    });

  const searchTasks = async (status, q, selectedDate) =>
    ep1.get("/api/v2/searchtasks", {
      params: {
        status,
        q,
        date: selectedDate || "",
        colid: global1.colid,
        email: global1.user,
        role: "creator",
      },
    });

  /* ---------------------------------- */
  const fetchTasks = async () => {
    setLoading(true);
    const status = STATUSES[statusIdx];
    const q = search.trim();
    try {
      const { data } =
        q || date
          ? await searchTasks(status, q, date)
          : await fetchMyTasks(status, q);
      setTasks(data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusIdx, search, date]);

  const createTask = async () => {
    try {
      await ep1.post("/api/v2/createtask", {
        title,
        description: desc,
        tasktype: taskType,
        creatoremail: global1.user,
        creatorname: global1.name,
        assigneeemail: assignee.email,
        assigneename: assignee.name,
        followeremail: follower.email,
        followername: follower.name,
        colid: Number(global1.colid),
      });
      showSnack("Task created", "success");
      setOpenCreate(false);
      setTitle("");
      setDesc("");
      setAssignee(null);
      setFollower(null);
      fetchTasks();
    } catch {
      showSnack("Create failed");
    }
  };

  /* ---------- comment helpers ---------- */
  const openComments = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    setCommentTask(task);
    setCommentOpen(true);
    setCommentText("");
    try {
      const { data } = await ep1.get("/api/v2/gettaskcommentsbytaskid", {
        params: { taskid: taskId, colid: global1.colid },
      });
      setComments(data || []);
    } catch {
      setComments([]);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    await ep1.post("/api/v2/createtaskcomment", {
      taskid: commentTask._id,
      comment: commentText,
      authoremail: global1.user,
      authorname: global1.name,
      colid: Number(global1.colid),
    });
    setCommentText("");
    openComments(commentTask._id);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Created by Me
      </Typography>

      <Tabs
        value={statusIdx}
        onChange={(_, v) => setStatusIdx(v)}
        sx={{ mb: 2 }}
      >
        {STATUSES.map((s) => (
          <Tab key={s} label={s} />
        ))}
      </Tabs>

      <TextField
        fullWidth
        placeholder="Search…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      <TextField
        type="date"
        fullWidth
        label="Filter by date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />

      {loading && !tasks.length ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      ) : tasks.length ? (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          }}
          gap={3}
          justifyItems="center"
        >
          {tasks.map((t) => (
            <TaskCard
              key={t._id}
              task={t}
              fetchTasks={fetchTasks}
              isCreator={t.creatoremail === global1.user}
              isAssignee={t.assigneeemail === global1.user}
              isFollower={t.followeremail === global1.user}
              onOpenComments={openComments}
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No {STATUSES[statusIdx].toLowerCase()} tasks
        </Typography>
      )}

      {/* Create dialog */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Task Type"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
          >
            {["Bug", "Feature", "Research", "Meeting", "Other"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </TextField>
          <UserSearch
            label="Assignee"
            value={assignee}
            onChange={setAssignee}
          />
          <Box mt={2}>
            <UserSearch
              label="Approver"
              value={follower}
              onChange={setFollower}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            onClick={createTask}
            disabled={!title || !assignee || !follower}
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment modal */}
      <Dialog
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Comments – {commentTask?.title}</DialogTitle>
        <DialogContent dividers>
          <MuiTextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={addComment}
            disabled={!commentText.trim()}
          >
            Send
          </Button>
          <List sx={{ mt: 2 }}>
            {(comments || []).map((c) => (
              <ListItem key={c._id} divider>
                <ListItemText
                  primary={c.comment}
                  secondary={`${c.authorname}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => setOpenCreate(true)}
      >
        <AddIcon />
      </Fab>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ open: false })}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
