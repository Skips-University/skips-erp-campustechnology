import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowForward as NextIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const ManageSectionsds = () => {
  const { questionbankcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create Dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createData, setCreateData] = useState({
    section: "",
    sectiontitle: "",
    description: "",
    questiontype: "MCQ",
    totalquestions: "",
    noofquestionsneedtoattend: "",
    markspersquestion: "",
  });

  // Edit Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getsectiondsbyqbcode", {
        params: {
          questionbankcode: questionbankcode,
          colid: global1.colid,
        },
      });
      setSections(res.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sections");
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      await ep1.post("/api/v2/createsectionds", {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        questionbankcode: questionbankcode,
        ...createData,
      });
      setSuccess("Section created successfully");
      setOpenCreateDialog(false);
      setCreateData({
        section: "",
        sectiontitle: "",
        description: "",
        questiontype: "MCQ",
        totalquestions: "",
        noofquestionsneedtoattend: "",
        markspersquestion: "",
      });
      fetchSections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create section");
    }
  };

  const handleEdit = async () => {
    try {
      await ep1.post("/api/v2/updatesectionds", editData);
      setSuccess("Section updated successfully");
      setOpenEditDialog(false);
      fetchSections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update section");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        await ep1.post("/api/v2/deletesectionds", {
          params: { _id: id },
        });
        setSuccess("Section deleted successfully");
        fetchSections();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete section");
      }
    }
  };

  const calculateTotalMarks = (needToAttend, marks) => {
    return needToAttend && marks ? needToAttend * marks : 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Manage Sections</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Add Section
          </Button>
          <Button
            variant="contained"
            color="success"
            endIcon={<NextIcon />}
            onClick={() => navigate(`/managequestionsds/${questionbankcode}`)}
          >
            Manage Questions
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sections.map((section) => (
            <Grid item xs={12} md={6} key={section._id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      Section {section.section}: {section.sectiontitle}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setEditData(section);
                          setOpenEditDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(section._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {section.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Question Type:</strong> {section.questiontype}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Questions:</strong> {section.totalquestions}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Questions to Attend:</strong>{" "}
                      {section.noofquestionsneedtoattend}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Marks per Question:</strong>{" "}
                      {section.markspersquestion}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      <strong>Total Marks:</strong> {section.totalmarks}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Section</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Section (e.g., A, B, C)"
              value={createData.section}
              onChange={(e) =>
                setCreateData({ ...createData, section: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Section Title"
              value={createData.sectiontitle}
              onChange={(e) =>
                setCreateData({ ...createData, sectiontitle: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={createData.description}
              onChange={(e) =>
                setCreateData({ ...createData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth required>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={createData.questiontype}
                onChange={(e) =>
                  setCreateData({ ...createData, questiontype: e.target.value })
                }
                label="Question Type"
              >
                <MenuItem value="MCQ">MCQ</MenuItem>
                <MenuItem value="Short Answer">Short Answer</MenuItem>
                <MenuItem value="Descriptive">Descriptive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Total Questions"
              type="number"
              value={createData.totalquestions}
              onChange={(e) =>
                setCreateData({ ...createData, totalquestions: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Questions Need to Attend"
              type="number"
              value={createData.noofquestionsneedtoattend}
              onChange={(e) =>
                setCreateData({
                  ...createData,
                  noofquestionsneedtoattend: e.target.value,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="Marks per Question"
              type="number"
              value={createData.markspersquestion}
              onChange={(e) =>
                setCreateData({
                  ...createData,
                  markspersquestion: e.target.value,
                })
              }
              fullWidth
              required
            />
            <Alert severity="info">
              Total Marks:{" "}
              {calculateTotalMarks(
                createData.noofquestionsneedtoattend,
                createData.markspersquestion
              )}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Section</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Section Title"
              value={editData.sectiontitle || ""}
              onChange={(e) =>
                setEditData({ ...editData, sectiontitle: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={editData.description || ""}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={editData.questiontype || "MCQ"}
                onChange={(e) =>
                  setEditData({ ...editData, questiontype: e.target.value })
                }
                label="Question Type"
              >
                <MenuItem value="MCQ">MCQ</MenuItem>
                <MenuItem value="Short Answer">Short Answer</MenuItem>
                <MenuItem value="Descriptive">Descriptive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Total Questions"
              type="number"
              value={editData.totalquestions || ""}
              onChange={(e) =>
                setEditData({ ...editData, totalquestions: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Questions Need to Attend"
              type="number"
              value={editData.noofquestionsneedtoattend || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  noofquestionsneedtoattend: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Marks per Question"
              type="number"
              value={editData.markspersquestion || ""}
              onChange={(e) =>
                setEditData({ ...editData, markspersquestion: e.target.value })
              }
              fullWidth
            />
            <Alert severity="info">
              Total Marks:{" "}
              {calculateTotalMarks(
                editData.noofquestionsneedtoattend,
                editData.markspersquestion
              )}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageSectionsds;
