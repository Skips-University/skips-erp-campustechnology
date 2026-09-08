import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Add,
  Delete,
  ArrowBack,
  Close as CloseIcon,
  AddCircle,
  RemoveCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const MessPollsPage = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    buildingname: "",
    colid: global1.colid,
    polldate: "",
    mealtype: "Breakfast",
    options: [{ optionname: "", votes: 0, votedstudents: [] }],
    pollstatus: "Active",
    createdby: global1.email,
    createdbyname: global1.name,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (form.buildingname) {
      fetchPolls();
    }
  }, [form.buildingname]);

  const fetchBuildings = async () => {
    try {
      const { data } = await ep1.get(
        `/api/v2/getbuildingstaffds?colid=${global1.colid}`
      );
      if (data.success) {
        setBuildings(data.data.filter((b) => b.messstatus === "Open"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPolls = async () => {
    try {
      const { data } = await ep1.get(
        `/api/v2/getmealpollsds?buildingname=${form.buildingname}&colid=${global1.colid}`
      );
      if (data.success) {
        setPolls(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = () => {
    setForm({
      buildingname: form.buildingname,
      colid: global1.colid,
      polldate: "",
      mealtype: "Breakfast",
      options: [{ optionname: "", votes: 0, votedstudents: [] }],
      pollstatus: "Active",
      createdby: global1.email,
      createdbyname: global1.name,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddOption = () => {
    setForm({
      ...form,
      options: [...form.options, { optionname: "", votes: 0, votedstudents: [] }],
    });
  };

  const handleRemoveOption = (index) => {
    const newOptions = form.options.filter((_, i) => i !== index);
    setForm({ ...form, options: newOptions });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index].optionname = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async () => {
    try {
      await ep1.post("/api/v2/createmealpollsds", form);
      setSnackbar({
        open: true,
        message: "Poll created successfully",
        severity: "success",
      });
      fetchPolls();
      handleClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error creating poll",
        severity: "error",
      });
    }
  };

  const handleClosePoll = async (pollId) => {
    if (window.confirm("Are you sure you want to close this poll?")) {
      try {
        await ep1.post("/api/v2/closemealpollsds", { pollid: pollId });
        setSnackbar({
          open: true,
          message: "Poll closed successfully",
          severity: "success",
        });
        fetchPolls();
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Error closing poll",
          severity: "error",
        });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this poll?")) {
      try {
        await ep1.get(`/api/v2/deletemealpollsds/${id}`);
        setSnackbar({
          open: true,
          message: "Poll deleted successfully",
          severity: "success",
        });
        fetchPolls();
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Error deleting poll",
          severity: "error",
        });
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/dashboardpagehostel")}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Meal Polls Management</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Select Building"
          value={form.buildingname}
          onChange={(e) => setForm({ ...form, buildingname: e.target.value })}
          SelectProps={{ native: true }}
          sx={{ minWidth: 300, mr: 2 }}
        >
          <option value="">Select Building</option>
          {buildings.map((building) => (
            <option key={building._id} value={building.buildingname}>
              {building.buildingname}
            </option>
          ))}
        </TextField>
        {form.buildingname && (
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Create Poll
          </Button>
        )}
      </Box>

      {form.buildingname && (
        <Grid container spacing={3}>
          {polls.map((poll) => (
            <Grid item xs={12} md={6} lg={4} key={poll._id}>
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
                      label={poll.pollstatus}
                      color={poll.pollstatus === "Active" ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(poll.polldate).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Options & Votes:</Typography>
                    {poll.options.map((option, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Typography variant="body2">{option.optionname}</Typography>
                        <Chip label={option.votes} size="small" />
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    {poll.pollstatus === "Active" && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleClosePoll(poll._id)}
                      >
                        Close Poll
                      </Button>
                    )}
                    <IconButton
                      onClick={() => handleDelete(poll._id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Poll Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create Meal Poll</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Building Name"
              value={form.buildingname}
              disabled
              fullWidth
            />
            <TextField
              label="Poll Date"
              type="date"
              value={form.polldate}
              onChange={(e) => setForm({ ...form, polldate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              select
              label="Meal Type"
              value={form.mealtype}
              onChange={(e) => setForm({ ...form, mealtype: e.target.value })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
            </TextField>

            <Typography variant="subtitle1">Meal Options:</Typography>
            {form.options.map((option, index) => (
              <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  label={`Option ${index + 1}`}
                  value={option.optionname}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  fullWidth
                />
                {form.options.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveOption(index)}
                    color="error"
                  >
                    <RemoveCircle />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              startIcon={<AddCircle />}
              onClick={handleAddOption}
              variant="outlined"
            >
              Add Option
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create Poll
          </Button>
        </DialogActions>
      </Dialog>

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

export default MessPollsPage;
