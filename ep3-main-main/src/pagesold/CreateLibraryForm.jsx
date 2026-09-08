import React, { useEffect, useState } from "react";
import ep1 from "../api/ep1";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import global1 from "./global1"; // Import global1 to access colid
import { useNavigate } from "react-router-dom";
const CreateLibraryForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    libraryid: "",
    libraryname: "",
    libraryincharge: "",
    contactno: "",
    colid: 0, // colid should be a number
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Set colid from global1 when component mounts
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      colid: Number(global1.colid) || 0,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "colid" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.libraryid || !formData.libraryname) {
      setError("Library ID and Name are required.");
      return;
    }

    try {
      await ep1.post("/api/v2/createlibrary", {
        ...formData,
        colid: Number(formData.colid),
      });

      setSuccess(true);
      setFormData({
        libraryid: "",
        libraryname: "",
        libraryincharge: "",
        contactno: "",
        colid: Number(global1.colid) || 0,
      });
      navigate("/admin/libraries")
    } catch (err) {
      setError(err.response?.data?.message || "Error creating library");
    }
  };

  return (
    <Box maxWidth="sm" mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Library
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Library ID"
              name="libraryid"
              value={formData.libraryid}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Library Name"
              name="libraryname"
              value={formData.libraryname}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Library Incharge"
              name="libraryincharge"
              value={formData.libraryincharge}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Contact No"
              name="contactno"
              value={formData.contactno}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="College ID (colid)"
              name="colid"
              type="number"
              value={formData.colid}
              onChange={handleChange}
              disabled
              fullWidth
            />

            <Button variant="contained" type="submit">
              Create Library
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Success Message */}
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Library created successfully!
        </Alert>
      </Snackbar>

      {/* Error Message */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateLibraryForm;


