import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const colorMap = {
  Pending: { bg: "linear-gradient(135deg, #ffa726, #ffcc02)", text: "#000" },
  Completed: { bg: "linear-gradient(135deg, #29b6f6, #0288d1)", text: "#fff" },
  Approved: { bg: "linear-gradient(135deg, #66bb6a, #388e3c)", text: "#fff" },
};

const TaskCard = ({
  task,
  onMarkComplete,
  onApprove,
  isCreator,
  isAssignee,
  isFollower,
  onOpenComments,
}) => {
  const {
    _id,
    title,
    description,
    status,
    creatorname,
    assigneename,
    followername,
    createdAt,
    completedat,
    approvedat,
  } = task;
  const palette = colorMap[status];

  const shortDesc =
    description && description.length > 45
      ? description.slice(0, 45) + "…"
      : description;

  const fmt = (d) => d && new Date(d).toLocaleDateString();

  return (
    <Card
      sx={{
        width: 300,
        height: 290,
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
            my: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {shortDesc}
        </Typography>

        <Chip
          label={status}
          size="small"
          sx={{
            backgroundColor: "rgba(255,255,255,.2)",
            color: palette.text,
            mt: 0.5,
          }}
        />

        {/* Names */}
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

        {/* Dates */}
        <Typography variant="caption" display="block" mt={0.5}>
          Created: {fmt(createdAt)}
        </Typography>
        {completedat && (
          <Typography variant="caption" display="block">
            Completed: {fmt(completedat)}
          </Typography>
        )}
        {approvedat && (
          <Typography variant="caption" display="block">
            Approved: {fmt(approvedat)}
          </Typography>
        )}
      </CardContent>

      {/* Bottom bar */}
      <Box
        display="flex"
        alignItems="center"
        px={1}
        pb={1}
        sx={{ borderTop: "1px solid rgba(255,255,255,.2)" }}
      >
        <Box display="flex" gap={0.5}>
          {status === "Pending" && isAssignee && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<CheckIcon />}
              sx={{ color: palette.text, borderColor: palette.text, fontSize: 11 }}
              onClick={() => onMarkComplete(_id)}
            >
              Done
            </Button>
          )}
          {status === "Completed" && (isCreator || isFollower) && (
            <Button
              size="small"
              variant="contained"
              startIcon={<DoneAllIcon />}
              sx={{
                bgcolor: "rgba(255,255,255,.2)",
                color: palette.text,
                fontSize: 11,
              }}
              onClick={() => onApprove(_id)}
            >
              Approve
            </Button>
          )}
        </Box>

        <IconButton
          sx={{ color: palette.text, ml: "auto", p: 0.5 }}
          onClick={() => onOpenComments(_id)}
        >
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default TaskCard;