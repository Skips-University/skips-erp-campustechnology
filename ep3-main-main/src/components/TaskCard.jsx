import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ep1 from "../api/ep1";
import global1 from "../pages/global1";

const colorMap = {
  Pending: { bg: "linear-gradient(135deg, #ffa726, #ffcc02)", text: "#000" },
  Completed: { bg: "linear-gradient(135deg, #29b6f6, #0288d1)", text: "#fff" },
  Approved: { bg: "linear-gradient(135deg, #66bb6a, #388e3c)", text: "#fff" },
};

const TaskCard = ({
  task,
  fetchTasks,
  isCreator,
  isAssignee,
  isFollower,
  onOpenComments,
}) => {
  const {
    _id,
    title,
    description,
    creatorname,
    assigneename,
    followername,
    createdAt,
    completedat,
    approvedat,
  } = task;
  const palette = colorMap[task.status];

  /* ---------- state ---------- */
  const [ts, setTs] = useState({
    tasktype: "—",
    taskduration: "—",
    submitedat: "_",
    expectedtime: "_",
  });
  const [completeDialog, setCompleteDialog] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [approveDialog, setApproveDialog] = useState(false);
  const [expectedHours, setExpectedHours] = useState("");
  const [expectedMinutes, setExpectedMinutes] = useState("");

  /* ---------- fetch type+duration ---------- */
  useEffect(() => {
    ep1
      .get("/api/v2/gettasktimesheetbyid", { params: { taskid: _id,
        colid: global1.colid
       } })
      .then(({ data }) => setTs(data || { tasktype: "—", taskduration: "—" }))
      .catch(() => setTs({ tasktype: "—", taskduration: "—",
    submitedat: "_",
    expectedtime: "_", }));
  }, [_id]);

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  /* ---------- assignee — mark complete ---------- */
  const openCompleteDialog = () => setCompleteDialog(true);
  const confirmComplete = async () => {
    if (!hours && !minutes) return;
    const duration = `${hours || 0}h ${minutes || 0}m`;
    const date = pickupDate || new Date().toISOString().split("T")[0];
    await ep1.post(`/api/v2/changetaskstatus?id=${_id}&status=Completed&colid=${global1.colid}`, {
      duration,
      submitedat: date,
    });
    setCompleteDialog(false);
    fetchTasks();
  };

  /* ---------- approver — approve ---------- */
  const approveOK = () =>
    ep1
      .post("/api/v2/approvetask", {
        id: _id,
        expectedtime: ts.taskduration,
        colid: parseInt(global1.colid)
      })
      .then(fetchTasks);
  const approveNotOK = () => setApproveDialog(true);
  const confirmApproval = async () => {
    const expected = `${expectedHours || 0}h ${expectedMinutes || 0}m`;
    await ep1.post("/api/v2/approvetask", { id: _id, expectedtime: expected, colid: global1.colid });
    setApproveDialog(false);
    fetchTasks();
  };

  return (
    <>
      <Card
        sx={{
          width: 340,
          height: 330,
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          background: palette.bg,
          color: palette.text,
          boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        }}
      >
        <CardContent sx={{ flexGrow: 1, overflow: "hidden", p: 1.5 }}>
          <Typography variant="body1" fontWeight="bold" noWrap>
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.85,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              WebkitLineClamp: 2, // Safari / Chrome
              lineClamp: 2, // modern browsers
            }}
          >
            {description}
          </Typography>

          <Chip
            label={task.status}
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,.2)",
              color: palette.text,
              mt: 0.5,
            }}
          />
          <Chip
            label={`${ts.tasktype} • ${ts.taskduration}`}
            size="small"
            sx={{ mt: 0.5 }}
          />
          <Chip label={`Expected:${ts.expectedtime}`} />

          <Typography variant="caption" display="block" mt={1}>
            Creator: {creatorname}
          </Typography>
          <Typography variant="caption" display="block">
            Assignee: {assigneename}
          </Typography>
          {followername && (
            <Typography variant="caption" display="block">
              Approver: {followername}
            </Typography>
          )}
          <Typography variant="caption" display="block" mt={0.5}>
            Created: {fmt(createdAt)}
          </Typography>
          {task.completedat && (
            <Typography variant="caption" display="block">
              Completed: {fmt(completedat)}
            </Typography>
          )}
          {ts.submitedat && (
            <Typography variant="caption" display="block">
              Submited: {fmt(ts.submitedat)}
            </Typography>
          )}
          {task.approvedat && (
            <Typography variant="caption" display="block">
              Approved: {fmt(approvedat)}
            </Typography>
          )}
        </CardContent>

        {/* Buttons */}
        <Box
          display="flex"
          alignItems="center"
          px={1}
          pb={1}
          sx={{ borderTop: "1px solid rgba(255,255,255,.2)" }}
        >
          {task.status === "Pending" && isAssignee && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={openCompleteDialog}
            >
              Mark Complete
            </Button>
          )}

          {task.status === "Completed" && isFollower && (
            <Box display="flex" gap={1} ml={1}>
              <Button variant="contained" color="success" onClick={approveOK}>
                OK
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={approveNotOK}
              >
                NOT OK
              </Button>
            </Box>
          )}

          <IconButton sx={{ ml: "auto" }} onClick={() => onOpenComments(_id)}>
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>

      {/* Assignee — Duration + Pick-up Date */}
      <Dialog
        open={completeDialog}
        onClose={() => setCompleteDialog(false)}
        maxWidth="xs"
      >
        <DialogTitle>Complete task</DialogTitle>
        <DialogContent>
          <TextField
            label="Hours"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            sx={{ width: 90 }}
          />
          <TextField
            label="Minutes"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            sx={{ width: 90, ml: 1 }}
          />
          <TextField
            label="Pick-up date"
            type="date"
            fullWidth
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmComplete}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Approver — Expected Time */}
      <Dialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        maxWidth="xs"
      >
        <DialogTitle>Approve task – {title}</DialogTitle>
        <DialogContent>
          <TextField
            label="Expected Hours"
            type="number"
            value={expectedHours}
            onChange={(e) => setExpectedHours(e.target.value)}
            sx={{ width: 90 }}
          />
          <TextField
            label="Expected Minutes"
            type="number"
            value={expectedMinutes}
            onChange={(e) => setExpectedMinutes(e.target.value)}
            sx={{ width: 90, ml: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button onClick={confirmApproval}>Approve</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskCard;
