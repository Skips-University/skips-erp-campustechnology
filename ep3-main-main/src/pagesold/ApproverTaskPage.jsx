import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  TextField,
  Box,
  Skeleton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  Button,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import TaskCard from "../components/TaskCard";
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

export default function ApproverTasksPage() {
  const [statusIdx, setStatusIdx] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  /* ----- comment state ----- */
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentTask, setCommentTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  /* ---------- search helpers ---------- */
  const fetchFollowerTasks = async (status, q) =>
    ep1.get("/api/v2/getfollowertasks", {
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
        role: "follower",
      },
    });
  /* ------------------------------------ */

  const fetchTasks = async () => {
    setLoading(true);
    const status = STATUSES[statusIdx];
    const q = search.trim();
    try {
      const { data } = q || date
        ? await searchTasks(status, q, date)
        : await fetchFollowerTasks(status, q);
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
        Approver Tasks
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

      {/* Comment dialog */}
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
                  secondary={`${c.authorname} – ${new Date(
                    c.createdAt
                  ).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
