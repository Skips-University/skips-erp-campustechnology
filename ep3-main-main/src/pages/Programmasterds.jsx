import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Programmasterds = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [formData, setFormData] = useState({
    category: "",
    course_code: "",
    course_name: "",
    institution: "",
    program_type: "",
    duration: "",
    eligibility: "",
    eligibility: "",
    total_seats: "",
    total_fee: "",
    application_fee: "",
    first_installment: "",
    installments: "",
    brochure_url: "",
    syllabus_url: "",
    placement_highlights: "",
    faculty_info: "",
    accreditation: "",
  });

  useEffect(() => {
    fetchPrograms();
    fetchCategories();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await ep1.get("/api/v2/getallprogramsds", {
        params: { colid: global1.colid },
      });
      setPrograms(res.data.data);
    } catch (err) {
      console.error("Error fetching programs:", err);
      showSnackbar("Failed to fetch programs", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await ep1.get("/api/v2/getallcategoriesds", {
        params: { colid: global1.colid },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleOpenDialog = (program = null) => {
    if (program) {
      setEditMode(true);
      setCurrentProgram(program);
      setFormData({
        category: program.category,
        course_code: program.course_code,
        course_name: program.course_name,
        institution: program.institution || "",
        program_type: program.program_type || "",
        total_seats: program.total_seats || "",
        duration: program.duration || "",
        eligibility: program.eligibility || "",
        total_fee: program.fee_structure?.total_fee || "",
        application_fee: program.fee_structure?.application_fee || "",
        first_installment: program.fee_structure?.first_installment || "",
        installments: program.fee_structure?.installments || "",
        brochure_url: program.brochure_url || "",
        syllabus_url: program.syllabus_url || "",
        placement_highlights: program.placement_highlights || "",
        faculty_info: program.faculty_info || "",
        accreditation: program.accreditation || "",
      });
    } else {
      setEditMode(false);
      setCurrentProgram(null);
      setFormData({
        category: "",
        course_code: "",
        course_name: "",
        institution: "",
        program_type: "",
        total_seats: "",
        duration: "",
        eligibility: "",
        total_fee: "",
        application_fee: "",
        first_installment: "",
        installments: "",
        brochure_url: "",
        syllabus_url: "",
        placement_highlights: "",
        faculty_info: "",
        accreditation: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        category: formData.category,
        course_code: formData.course_code,
        course_name: formData.course_name,
        institution: formData.institution,
        program_type: formData.program_type,
        total_seats: Number(formData.total_seats),
        duration: formData.duration,
        eligibility: formData.eligibility,
        fee_structure: {
          total_fee: Number(formData.total_fee),
          application_fee: Number(formData.application_fee),
          first_installment: Number(formData.first_installment),
          installments: Number(formData.installments),
        },
        brochure_url: formData.brochure_url,
        syllabus_url: formData.syllabus_url,
        placement_highlights: formData.placement_highlights,
        faculty_info: formData.faculty_info,
        accreditation: formData.accreditation,
        colid: global1.colid,
        created_by: global1.user,
      };

      if (editMode) {
        await ep1.post("/api/v2/updateprogrammasterds", payload, {
          params: { id: currentProgram._id },
        });
        showSnackbar("Program updated successfully", "success");
      } else {
        await ep1.post("/api/v2/createprogrammasterds", payload);
        showSnackbar("Program created successfully", "success");
      }

      fetchPrograms();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving program:", err);
      showSnackbar("Failed to save program", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await ep1.get(`/api/v2/deleteprogrammasterds/${id}`);
        showSnackbar("Program deleted successfully", "success");
        fetchPrograms();
      } catch (err) {
        console.error("Error deleting program:", err);
        showSnackbar("Failed to delete program", "error");
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => navigate("/dashboardcrmds")}
            sx={{
              mr: 2,
              bgcolor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              "&:hover": { bgcolor: "#f8fafc" }
            }}
          >
            <BackIcon sx={{ color: "#1e293b" }} />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>Program Master</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: "#1565c0",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
            "&:hover": { bgcolor: "#0d47a1" }
          }}
        >
          Add Program
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Program Code</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Program Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Institution</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Program Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Total Seats</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Eligibility</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Total Fee</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program._id} sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "background-color 0.2s" }}>
                <TableCell sx={{ fontWeight: 500, color: "#1e293b" }}>{program.category}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{program.course_code}</TableCell>
                <TableCell sx={{ fontWeight: 500, color: "#1e293b" }}>{program.course_name}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{program.institution}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{program.program_type}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{program.total_seats}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{program.duration}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{program.eligibility}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#1565c0" }}>₹{program.fee_structure?.total_fee?.toLocaleString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpenDialog(program)}
                      sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(program._id)}
                      sx={{ color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Program Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Program" : "Add Program"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat.category_name}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Program Code"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Program Name"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
            <TextField
              fullWidth
              label="Program Type"
              value={formData.program_type}
              onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
            />
            <TextField
              fullWidth
              label="Total Sanctioned Seats"
              type="number"
              value={formData.total_seats}
              onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
            />
            <TextField
              fullWidth
              label="Duration (e.g., 3 Years)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
            <TextField
              fullWidth
              label="Eligibility (e.g., 12th Pass)"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            />
            <Typography variant="h6">Fee Structure</Typography>
            <TextField
              fullWidth
              label="Total Fee"
              type="number"
              value={formData.total_fee}
              onChange={(e) => setFormData({ ...formData, total_fee: e.target.value })}
            />
            <TextField
              fullWidth
              label="Application Fee"
              type="number"
              value={formData.application_fee}
              onChange={(e) => setFormData({ ...formData, application_fee: e.target.value })}
            />
            <TextField
              fullWidth
              label="First Installment"
              type="number"
              value={formData.first_installment}
              onChange={(e) => setFormData({ ...formData, first_installment: e.target.value })}
            />
            <TextField
              fullWidth
              label="Number of Installments"
              type="number"
              value={formData.installments}
              onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
            />
            <TextField
              fullWidth
              label="Brochure URL"
              value={formData.brochure_url}
              onChange={(e) => setFormData({ ...formData, brochure_url: e.target.value })}
            />
            <TextField
              fullWidth
              label="Syllabus URL"
              value={formData.syllabus_url}
              onChange={(e) => setFormData({ ...formData, syllabus_url: e.target.value })}
            />
            <TextField
              fullWidth
              label="Placement Highlights"
              value={formData.placement_highlights}
              onChange={(e) => setFormData({ ...formData, placement_highlights: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Faculty Info"
              value={formData.faculty_info}
              onChange={(e) => setFormData({ ...formData, faculty_info: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Accreditation"
              value={formData.accreditation}
              onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Programmasterds;
