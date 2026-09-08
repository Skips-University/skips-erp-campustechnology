import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  LinearProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StudentMealVotePage = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchActivePolls();
  }, []);

  const fetchActivePolls = async () => {
    try {
      const { data } = await ep1.get(
        `/api/v2/getactivepollsforstudent?regno=${global1.regno}&colid=${global1.colid}`
      );
      if (data.success) {
        setPolls(data.data);
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error fetching polls",
        severity: "error",
      });
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      const { data } = await ep1.post("/api/v2/votemealpollsds", {
        pollid: pollId,
        optionindex: optionIndex,
        regno: global1.regno,
      });

      if (data.success) {
        setSnackbar({
          open: true,
          message: "Vote recorded successfully",
          severity: "success",
        });
        fetchActivePolls();
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error voting",
        severity: "error",
      });
    }
  };

  const getVotePercentage = (option, poll) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    return totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
  };

  const hasVoted = (poll) => {
    return poll.options.some((opt) => opt.votedstudents.includes(global1.regno));
  };

  const getVotedOption = (poll) => {
    return poll.options.findIndex((opt) =>
      opt.votedstudents.includes(global1.regno)
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/dashboard")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Vote for Meal Preferences</Typography>
      </Box>

      {polls.length === 0 ? (
        <Alert severity="info">No active polls available at the moment.</Alert>
      ) : (
        <Grid container spacing={3}>
          {polls.map((poll) => {
            const voted = hasVoted(poll);
            const votedOptionIndex = getVotedOption(poll);

            return (
              <Grid item xs={12} md={6} key={poll._id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">{poll.mealtype}</Typography>
                      <Chip
                        label={new Date(poll.polldate).toLocaleDateString()}
                        color="primary"
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Select your preferred meal option:
                    </Typography>

                    <RadioGroup
                      value={voted ? votedOptionIndex : selectedOptions[poll._id] || ""}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          [poll._id]: Number(e.target.value),
                        })
                      }
                    >
                      {poll.options.map((option, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <FormControlLabel
                            value={index}
                            control={<Radio />}
                            label={option.optionname}
                            disabled={voted}
                          />
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 4 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Number(getVotePercentage(option, poll))}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption">
                              {option.votes} votes ({getVotePercentage(option, poll)}%)
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </RadioGroup>

                    {!voted ? (
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() =>
                          handleVote(poll._id, selectedOptions[poll._id])
                        }
                        disabled={selectedOptions[poll._id] === undefined}
                      >
                        Submit Vote
                      </Button>
                    ) : (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        You have already voted for this poll
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentMealVotePage;
