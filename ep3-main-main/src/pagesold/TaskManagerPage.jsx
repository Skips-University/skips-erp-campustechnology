// TaskManagerPage.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Tabs,
  Tab,
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Snackbar,
  Alert,
  Chip,
  Skeleton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import TaskCard from "../components/TaskCard";
import UserSearch from "../components/UserSearch";
import ep1 from "../api/ep1";
import global1 from "./global1";

const STATUSES = ["Pending", "Completed", "Approved"];

export default function TaskManagerPage() {
  const [tab, setTab] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

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

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentTask, setCommentTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  /* ---------- API helpers ---------- */
  const fetchCreatorTasks = (status, q) =>
    ep1.get("/api/v2/getcreatortasks", {
      params: { status, q, colid: global1.colid, email: global1.email },
    });

  const fetchAssigneeTasks = (status, q) =>
    ep1.get("/api/v2/getassigneetasks", {
      params: { status, q, colid: global1.colid, email: global1.email },
    });

  const fetchFollowerTasks = (status, q) =>
    ep1.get("/api/v2/getfollowertasks", {
      params: { status, q, colid: global1.colid, email: global1.email },
    });

  const fetchSearchTasks = (status, q) => {
    const role = tab === 0 ? "creator" : tab === 1 ? "assignee" : "follower";
    return ep1.get("/api/v2/searchtasks", {
      params: { status, q, colid: global1.colid, email: global1.email, role },
    });
  };
  /* ---------------------------------- */

  const fetchTasks = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const status = STATUSES[statusIdx];
      const q = search.trim();
      try {
        const { data } = q
          ? await fetchSearchTasks(status, q)
          : tab === 0
          ? await fetchCreatorTasks(status, q)
          : tab === 1
          ? await fetchAssigneeTasks(status, q)
          : await fetchFollowerTasks(status, q);
        setTasks(data || []);
      } catch {
        showSnack("Load failed");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  useEffect(fetchTasks, [tab, statusIdx, search]);

  const createTask = async () => {
    try {
      await ep1.post("/api/v2/createtask", {
        title,
        description: desc,
        tasktype: taskType,
        creatoremail: global1.email,
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
      showSnack("Could not load comments");
      setComments([]);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      await ep1.post("/api/v2/createtaskcomment", {
        taskid: commentTask._id,
        comment: commentText,
        authoremail: global1.email,
        authorname: global1.name,
        colid: Number(global1.colid),
      });
      setCommentText("");
      openComments(commentTask._id);
    } catch {
      showSnack("Comment failed");
    }
  };

  const SkeletonCard = () => (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Skeleton
        variant="rectangular"
        height={180}
        sx={{ borderRadius: 4, mb: 2 }}
      />
    </Grid>
  );

  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Task Module
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Created by Me" />
        <Tab label="Assigned to Me" />
        <Tab label="Approver Tasks" />
      </Tabs>

      <Tabs
        value={statusIdx}
        onChange={(_, v) => setStatusIdx(v)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        {STATUSES.map((s) => (
          <Tab key={s} label={<Chip label={s} variant="outlined" />} />
        ))}
      </Tabs>

      <TextField
        fullWidth
        placeholder="Search tasks…"
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

      {loading && !tasks.length ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </Grid>
      ) : tasks.length ? (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "0.4fr",
            sm: "repeat(1, 0.4fr)",
            md: "repeat(2, 0.4fr)",
            lg: "repeat(3, 0.4fr)",
          }}
          gap={3}
          justifyItems="center"
        >
          {tasks.map((t) => (
            <TaskCard
              key={t._id}
              task={t}
              fetchTasks={fetchTasks}
              isCreator={t.creatoremail === global1.email}
              isAssignee={t.assigneeemail === global1.email}
              isFollower={t.followeremail === global1.email}
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

      {/* Comment dialog */}
      <Dialog
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Comments – {commentTask?.title}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
            {commentTask?.description}
          </Typography>
          <TextField
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
            {comments.map((c) => (
              <ListItem key={c._id} divider>
                <ListItemText primary={c.comment} secondary={c.authorname} />
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