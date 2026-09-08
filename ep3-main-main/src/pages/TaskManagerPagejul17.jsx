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
const ROLE_MAP = ["creator", "assignee", "follower"];

export default function TaskManagerPage() {
  /* ---------- tab & status ---------- */
  const [tab, setTab] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  /* ---------- data ---------- */
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- search ---------- */
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  /* ---------- create dialog ---------- */
  const [openCreate, setOpenCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState(null);
  const [follower, setFollower] = useState(null);

  /* ---------- snack ---------- */
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "error",
  });
  const showSnack = (msg, sev = "error") =>
    setSnack({ open: true, msg, severity: sev });

  /* ---------- comments ---------- */
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentTask, setCommentTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  /* ---------- fetch ---------- */
  const fetchTasks = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const role = ROLE_MAP[tab];
      const status = STATUSES[statusIdx];
      try {
        const { data } = await ep1.get("/api/v2/searchtasks", {
          params: {
            role,
            status,
            q: search.trim(),
            colid: global1.colid,
            email: global1.email,
          },
        });
        setTasks(data || []);
      } catch {
        showSnack("Load failed");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  useEffect(fetchTasks, [tab, statusIdx, search]);

  /* ---------- actions ---------- */
  const createTask = async () => {
    try {
      await ep1.post("/api/v2/createtask", {
        title,
        description: desc,
        creatoremail: global1.email,
        creatorname: global1.name,
        assigneeemail: assignee.email,
        assigneename: assignee.name,
        followeremail: follower.email,   // mandatory now
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

  const markComplete = async (id) => {
    try {
      await ep1.post(`/api/v2/changetaskstatus?id=${id}&status=Completed`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showSnack("Marked completed", "success");
    } catch {
      showSnack("Complete failed");
    }
  };

  const approveTask = async (id) => {
    try {
      await ep1.post(`/api/v2/changetaskstatus?id=${id}&status=Approved`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showSnack("Task approved", "success");
    } catch {
      showSnack("Approve failed");
    }
  };

  /* ---------- comment handlers ---------- */
  const openComments = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    setCommentTask(task);
    setCommentOpen(true);
    setCommentText("");
    await loadComments(taskId);
  };

  const loadComments = async (taskId) => {
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
        authoremail: global1.user,
        authorname: global1.name,
        colid: parseInt(global1.colid),
      });
      setCommentText("");
      await loadComments(commentTask._id);
    } catch {
      showSnack("Comment failed");
    }
  };

  /* ---------- skeleton for loading ---------- */
  const SkeletonCard = () => (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Skeleton
        variant="rectangular"
        height={180}
        sx={{ borderRadius: 4, mb: 2 }}
      />
    </Grid>
  );

  /* ---------- render ---------- */
  return (
    <React.Fragment>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Task Module
        </Typography>

        {/* Role tabs */}
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

        {/* Status tabs */}
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

        {/* Universal search bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by title, description or name…"
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

        {/* Tasks list */}
        <Box>
          {loading && !tasks.length ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </Grid>
          ) : tasks.length ? (
            <Grid container spacing={3} justifyContent="center">
              {tasks.map((t) => (
                <TaskCard
                  key={t._id}
                  task={t}
                  onMarkComplete={markComplete}
                  onApprove={approveTask}
                  onOpenComments={openComments}
                  isCreator={t.creatoremail === global1.email}
                  isAssignee={t.assigneeemail === global1.email}
                  isFollower={t.followeremail === global1.email}
                />
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No {STATUSES[statusIdx].toLowerCase()} tasks
            </Typography>
          )}
        </Box>

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

        {/* ========== COMMENT DIALOG ========== */}
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
              placeholder="Write a comment..."
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

        {/* Sticky FAB */}
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => setOpenCreate(true)}
        >
          <AddIcon />
        </Fab>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ open: false })}
        >
          <Alert severity={snack.severity}>{snack.msg}</Alert>
        </Snackbar>
      </Container>
    </React.Fragment>
  );
}
