import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import InputField from "../components/InputField";

const ReleaseAdmitCard = () => {
  const [formData, setFormData] = useState({
    templateId: "",
    examCenter: "",
  });

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v2/admitcard/templates");
      const options = res.data.map((tpl) => ({
        label: tpl.templatename,
        value: tpl._id,
      }));
      setTemplates(options);
    } catch (err) {
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { templateId, examCenter } = formData;

    if (!templateId || !examCenter) {
      return setFeedback({ type: "error", message: "All fields are required." });
    }

    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await axios.post("http://localhost:8080/api/v2/admitcard/release", {
        templateId,
        examCenter,
      });

      setFeedback({ type: "success", message: res.data.message });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to release admit cards",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Release Admit Cards
        </Typography>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Select Admit Card Template"
            type="select"
            name="templateId"
            value={formData.templateId}
            onChange={handleChange}
            options={templates}
          />

          <InputField
            label="Exam Center"
            type="text"
            name="examCenter"
            value={formData.examCenter}
            onChange={handleChange}
          />

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={18} />}
            >
              {loading ? "Releasing..." : "Release Admit Cards"}
            </Button>
          </Box>

          {feedback.message && (
            <Box mt={2}>
              <Alert severity={feedback.type}>{feedback.message}</Alert>
            </Box>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default ReleaseAdmitCard;

