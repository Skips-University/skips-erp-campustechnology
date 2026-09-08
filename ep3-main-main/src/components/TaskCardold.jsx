import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";

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
}) => {
  const {
    _id,
    title,
    description,
    status,
    creatorname,
    assigneename,
    createdAt,
    completedat,
    approvedat,
  } = task;
  const palette = colorMap[status];

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 4,
        background: palette.bg,
        color: palette.text,
        boxShadow: "0 8px 24px rgba(0,0,0,.12)",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, my: 1 }}>
          {description}
        </Typography>

        <Chip
          label={status}
          size="small"
          sx={{ backgroundColor: "rgba(255,255,255,.2)", color: palette.text }}
        />
        <Typography variant="caption" display="block" mt={1}>
          Creator: {creatorname}
        </Typography>
        <Typography variant="caption" display="block" mb={1}>
          Assignee: {assigneename}
        </Typography>
        <Typography variant="caption" display="block">
          Created: {new Date(createdAt).toLocaleString()}
        </Typography>
        {completedat && (
          <Typography variant="caption" display="block">
            Completed: {new Date(completedat).toLocaleString()}
          </Typography>
        )}
        {approvedat && (
          <Typography variant="caption" display="block">
            Approved: {new Date(approvedat).toLocaleString()}
          </Typography>
        )}

        <Box display="flex" gap={1} mt={1}>
          {status === "Pending" && isAssignee && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<CheckIcon />}
              sx={{ color: palette.text, borderColor: palette.text }}
              onClick={() => onMarkComplete(_id)}
            >
              Mark Complete
            </Button>
          )}
          {status === "Completed" && (isCreator || isFollower) && (
            <Button
              size="small"
              variant="contained"
              startIcon={<DoneAllIcon />}
              sx={{ bgcolor: "rgba(255,255,255,.2)", color: palette.text }}
              onClick={() => onApprove(_id)}
            >
              Approve
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
