import React, { useState, useEffect } from "react";
import {
  Container, Typography, Card, CardContent, TextField, Button, Box,
  Grid, IconButton, Paper, FormControl, InputLabel, Select, MenuItem,
  Chip, Divider, Switch, FormControlLabel
} from "@mui/material";
import { Add, Delete, ArrowBack, Save } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const initialQuestion = {
  questiontext: "",
  questiontype: "text",
  isrequired: true
};

export default function CreateFeedback() {
  const navigate = useNavigate();
  const { feedbackId } = useParams();
  const isEdit = Boolean(feedbackId);

  const [formData, setFormData] = useState({
    name: global1.name,
    user: global1.user,
    title: "",
    description: "",
    questions: [{ ...initialQuestion }]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchFeedback();
    }
  }, [feedbackId]);

  const fetchFeedback = async () => {
    try {
      const res = await ep1.get("/api/v2/getsinglefeedbackds", {
        params: { feedbackId }
      });
      setFormData(res.data);
    } catch (error) {
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...initialQuestion }]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = isEdit 
        ? `/api/v2/updatefeedbackds?feedbackId=${feedbackId}`
        : "/api/v2/createfeedbackds";
      
      const params = isEdit ? {} : { colid: global1.colid };
      
      await ep1.post(endpoint, formData, { params });
      navigate('/feedbackmanagement');
    } catch (error) {
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box 
            sx={{ 
              p: 3, 
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <IconButton color="inherit" onClick={() => navigate('/feedbackmanagement')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight={600}>
              {isEdit ? "✏️ Edit Feedback" : "➕ Create New Feedback"}
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            {/* Basic Info */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12}>
                <TextField
                  label="Feedback Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* Questions Section */}
            <Typography variant="h6" fontWeight={600} mb={3} color="primary.main">
              📋 Questions
            </Typography>

            {formData.questions.map((question, questionIndex) => (
              <Paper 
                key={questionIndex} 
                elevation={2} 
                sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Question {questionIndex + 1}
                  </Typography>
                  {formData.questions.length > 1 && (
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Question Text"
                      value={question.questiontext}
                      onChange={(e) => handleQuestionChange(questionIndex, 'questiontext', e.target.value)}
                      fullWidth
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Question Type</InputLabel>
                      <Select
                        value={question.questiontype}
                        onChange={(e) => handleQuestionChange(questionIndex, 'questiontype', e.target.value)}
                        label="Question Type"
                      >
                        <MenuItem value="text">📝 Short Text</MenuItem>
                        <MenuItem value="textarea">📄 Long Text</MenuItem>
                        <MenuItem value="rating">⭐ Star Rating (1-5)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={question.isrequired}
                          onChange={(e) => handleQuestionChange(questionIndex, 'isrequired', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Required Question"
                    />
                  </Grid>

                  {/* Preview Section */}
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px dashed #ddd' }}>
                      <Typography variant="caption" color="text.secondary" mb={1} display="block">
                        Preview:
                      </Typography>
                      <Typography variant="body2" fontWeight={500} mb={1}>
                        {question.questiontext || "Question text will appear here..."}
                      </Typography>
                      
                      {question.questiontype === 'text' && (
                        <TextField
                          size="small"
                          placeholder="Short answer text"
                          disabled
                          sx={{ width: 300 }}
                        />
                      )}
                      
                      {question.questiontype === 'textarea' && (
                        <TextField
                          size="small"
                          placeholder="Long answer text"
                          multiline
                          rows={3}
                          disabled
                          sx={{ width: '100%' }}
                        />
                      )}
                      
                      {question.questiontype === 'rating' && (
                        <Box display="flex" alignItems="center" gap={1}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Box
                              key={star}
                              sx={{
                                fontSize: 24,
                                color: '#ddd',
                                cursor: 'pointer',
                                '&:hover': { color: '#ffc107' }
                              }}
                            >
                              ⭐
                            </Box>
                          ))}
                          <Typography variant="body2" color="text.secondary" ml={1}>
                            (Click to rate)
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              startIcon={<Add />}
              onClick={addQuestion}
              variant="outlined"
              sx={{ mb: 4, borderRadius: 2 }}
            >
              Add Question
            </Button>

            {/* Submit Buttons */}
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/feedbackmanagement')}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
              >
                {loading ? "Saving..." : (isEdit ? "Update Feedback" : "Create Feedback")}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
