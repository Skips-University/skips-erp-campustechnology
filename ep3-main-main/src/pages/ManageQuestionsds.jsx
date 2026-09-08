import React, { useState, useEffect } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmartToy as AIIcon,
  PictureAsPdf as PDFIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';
import MathKeyboardds from '../components/MathKeyboardds';

const ManageQuestionsds = () => {
  const { questionbankcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionBank, setQuestionBank] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Manual Question Dialog
  const [openManualDialog, setOpenManualDialog] = useState(false);
  const [manualData, setManualData] = useState({
    question: '',
    questiontype: 'MCQ',
    marks: '',
    options: ['', '', '', ''],
    answer: '',
  });

  // Edit Question Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({});

  // AI Generation Dialog
  const [openAIDialog, setOpenAIDialog] = useState(false);

  useEffect(() => {
    fetchQuestionBank();
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchQuestions(selectedSection._id);
    }
  }, [selectedSection]);

  const fetchQuestionBank = async () => {
    try {
      const res = await ep1.get('/api/v2/getquestionbankdsbycode', {
        params: {
          questionbankcode: questionbankcode,
          colid: global1.colid,
        },
      });
      const qb = res.data.data;
      setQuestionBank(qb);

      // Determine user role
      if (qb.user === global1.user) setUserRole('Admin');
      else if (qb.faculty === global1.user) setUserRole('Faculty');
      else if (qb.moderator === global1.user) setUserRole('Moderator');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch question bank');
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await ep1.get('/api/v2/getsectiondsbyqbcode', {
        params: {
          questionbankcode: questionbankcode,
          colid: global1.colid,
        },
      });
      setSections(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedSection(res.data.data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sections');
    }
    setLoading(false);
  };

  const fetchQuestions = async (sectionid) => {
    try {
      const res = await ep1.get('/api/v2/getquestionsbysectionid', {
        params: {
          sectionid: sectionid,
          colid: global1.colid,
        },
      });
      setQuestions(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
    }
  };

  const handleCreateManual = async () => {
    try {
      await ep1.post('/api/v2/createquestionds', {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        questionbankcode: questionbankcode,
        sectionid: selectedSection._id,
        section: selectedSection.section,
        ...manualData,
      });
      setSuccess('Question created successfully');
      setOpenManualDialog(false);
      setManualData({
        question: '',
        questiontype: selectedSection?.questiontype || 'MCQ',
        marks: selectedSection?.markspersquestion || '',
        options: ['', '', '', ''],
        answer: '',
      });
      fetchQuestions(selectedSection._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question');
    }
  };

  const handleEdit = async () => {
    try {
      await ep1.post('/api/v2/updatequestionds', {
        ...editData,
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        questionbankcode: questionbankcode,
        moderator: questionBank?.moderator,
      });
      setSuccess('Question updated successfully');
      setOpenEditDialog(false);
      fetchQuestions(selectedSection._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await ep1.get(`/api/v2/deletequestionds?_id=${id}&colid=${global1.colid}&user=${global1.user}`);
        setSuccess('Question deleted successfully');
        fetchQuestions(selectedSection._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete question');
      }
    }
  };

  const openManualCreate = () => {
    setManualData({
      question: '',
      questiontype: selectedSection?.questiontype || 'MCQ',
      marks: selectedSection?.markspersquestion || '',
      options: selectedSection?.questiontype === 'MCQ' ? ['', '', '', ''] : [],
      answer: '',
    });
    setOpenManualDialog(true);
  };

  const canCreateQuestions = userRole === 'Faculty' || userRole === 'Admin';
  const canEditQuestions = userRole === 'Faculty' || userRole === 'Moderator' || userRole === 'Admin';
  const canDeleteQuestions = userRole === 'Faculty' || userRole === 'Admin';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Manage Questions</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PDFIcon />}
            onClick={() => navigate(`/generatepdfds/${questionbankcode}`)}
          >
            Generate PDF
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(`/managesectionsds/${questionbankcode}`)}
          >
            Manage Sections
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Sections List */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sections
                </Typography>
                <List>
                  {sections.map((section) => (
                    <ListItemButton
                      key={section._id}
                      selected={selectedSection?._id === section._id}
                      onClick={() => setSelectedSection(section)}
                    >
                      <ListItemText
                        primary={`Section ${section.section}`}
                        secondary={section.sectiontitle}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Questions List */}
          <Grid item xs={12} md={9}>
            {selectedSection && (
              <>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h5">
                          Section {selectedSection.section}: {selectedSection.sectiontitle}
                        </Typography>
                        <Chip
                          label={selectedSection.questiontype}
                          color="primary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      {canCreateQuestions && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={openManualCreate}
                          >
                            Add Manual
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AIIcon />}
                            onClick={() => setOpenAIDialog(true)}
                          >
                            Generate AI
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {questions.length === 0 ? (
                  <Alert severity="info">No questions added yet for this section.</Alert>
                ) : (
                  questions.map((q, index) => (
                    <Card key={q._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6">Q{index + 1}. {q.question}</Typography>
                          <Box>
                            {canEditQuestions && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setEditData(q);
                                  setOpenEditDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            )}
                            {canDeleteQuestions && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(q._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <strong>Type:</strong> {q.questiontype} | <strong>Marks:</strong> {q.marks}
                        </Typography>
                        {q.options && q.options.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            {q.options.map((opt, i) => (
                              <Typography key={i} variant="body2">
                                {String.fromCharCode(65 + i)}. {opt}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                          <strong>Answer:</strong> {q.answer}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}
          </Grid>
        </Grid>
      )}

      {/* Manual Question Dialog */}
      <Dialog open={openManualDialog} onClose={() => setOpenManualDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Question Manually</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Question"
              value={manualData.question}
              onChange={(e) => setManualData({ ...manualData, question: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <MathKeyboardds
              onSymbolClick={(symbol) => {
                setManualData({ ...manualData, question: manualData.question + symbol });
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={manualData.questiontype}
                onChange={(e) => setManualData({ ...manualData, questiontype: e.target.value })}
                label="Question Type"
                disabled
              >
                <MenuItem value="MCQ">MCQ</MenuItem>
                <MenuItem value="Short Answer">Short Answer</MenuItem>
                <MenuItem value="Descriptive">Descriptive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Marks"
              type="number"
              value={manualData.marks}
              onChange={(e) => setManualData({ ...manualData, marks: e.target.value })}
              fullWidth
              required
            />
            {manualData.questiontype === 'MCQ' && (
              <>
                {manualData.options.map((opt, i) => (
                  <TextField
                    key={i}
                    label={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...manualData.options];
                      newOptions[i] = e.target.value;
                      setManualData({ ...manualData, options: newOptions });
                    }}
                    fullWidth
                    required
                  />
                ))}
              </>
            )}
            <TextField
              label="Answer"
              value={manualData.answer}
              onChange={(e) => setManualData({ ...manualData, answer: e.target.value })}
              fullWidth
              multiline
              rows={2}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManualDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateManual} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Question"
              value={editData.question || ''}
              onChange={(e) => setEditData({ ...editData, question: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <MathKeyboardds
              onSymbolClick={(symbol) => {
                setEditData({ ...editData, question: (editData.question || '') + symbol });
              }}
            />
            <TextField
              label="Marks"
              type="number"
              value={editData.marks || ''}
              onChange={(e) => setEditData({ ...editData, marks: e.target.value })}
              fullWidth
            />
            {editData.questiontype === 'MCQ' && (
              <>
                {(editData.options || []).map((opt, i) => (
                  <TextField
                    key={i}
                    label={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...(editData.options || [])];
                      newOptions[i] = e.target.value;
                      setEditData({ ...editData, options: newOptions });
                    }}
                    fullWidth
                  />
                ))}
              </>
            )}
            <TextField
              label="Answer"
              value={editData.answer || ''}
              onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* AI Generation Dialog - will create separate component */}
      {openAIDialog && (
        <GenerateQuestionsAIDialog
          open={openAIDialog}
          onClose={() => setOpenAIDialog(false)}
          section={selectedSection}
          questionbankcode={questionbankcode}
          onSuccess={() => {
            setOpenAIDialog(false);
            fetchQuestions(selectedSection._id);
          }}
        />
      )}
    </Box>
  );
};

// Separate AI Dialog Component
const GenerateQuestionsAIDialog = ({ open, onClose, section, questionbankcode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [contextData, setContextData] = useState(null);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    if (open) {
      fetchAPIKey();
      fetchContext();
    }
  }, [open]);

  const fetchAPIKey = async () => {
    try {
      const res = await ep1.get('/api/v2/getapikeydsbycoldids', {
        params: {
          colid: global1.colid,
          user: global1.user,
        },
      });
      const keyData = res.data.data;
      const activeKey = keyData.usepersonalkey ? keyData.personalapikey : keyData.defaultapikey;
      setApiKey(activeKey);
    } catch (err) {
      setError('Failed to fetch API key. Please configure API key first.');
    }
  };

  const fetchContext = async () => {
    try {
      const res = await ep1.get('/api/v2/getcontextforai', {
        params: {
          sectionid: section._id,
          questionbankcode: questionbankcode,
          colid: global1.colid,
        },
      });
      setContextData(res.data.data);
    } catch (err) {
      setError('Failed to fetch context for AI generation');
    }
  };

  // Sleep function
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Clean JSON response
  const cleanJSONResponse = (text) => {
    // Remove markdown code blocks
    text = text.replace(/``````\s*/g, '');
    
    // Remove any text before the first [ or {
    const jsonStart = Math.min(
      text.indexOf('[') !== -1 ? text.indexOf('[') : Infinity,
      text.indexOf('{') !== -1 ? text.indexOf('{') : Infinity
    );
    
    if (jsonStart !== Infinity) {
      text = text.substring(jsonStart);
    }
    
    // Remove any text after the last ] or }
    const jsonEnd = Math.max(
      text.lastIndexOf(']'),
      text.lastIndexOf('}')
    );
    
    if (jsonEnd !== -1) {
      text = text.substring(0, jsonEnd + 1);
    }
    
    return text.trim();
  };

  const generateQuestions = async () => {
    if (!apiKey) {
      setError('API key not found. Please configure API key first.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('Initializing AI generation...');

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });

      // Build options string for MCQ
      const optionsFormat = section.questiontype === 'MCQ' 
        ? ',\n    "options": ["option1", "option2", "option3", "option4"]' 
        : '';

      // STRICT PROMPT - Forces pure JSON output
      const prompt = `You are a JSON generator. Generate exactly ${section.totalquestions} ${section.questiontype} questions.

COURSE DETAILS:
- Course: ${contextData.questionbank.course}
- Code: ${contextData.questionbank.coursecode}
- Section: ${section.section} - ${section.sectiontitle}
- Description: ${section.description || 'General questions'}
- Marks per question: ${section.markspersquestion}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

QUESTION TYPE RULES:
${section.questiontype === 'MCQ' ? '- Generate EXACTLY 4 options for each question\n- Mark the correct answer clearly' : ''}
${section.questiontype === 'Short Answer' ? '- Questions should require 2-3 sentence answers' : ''}
${section.questiontype === 'Descriptive' ? '- Questions should require detailed explanations' : ''}

CRITICAL INSTRUCTIONS:
1. Output ONLY valid JSON - no markdown, no explanations, no extra text
2. Start with [ and end with ]
3. Follow the exact format below
4. No code blocks, no backticks, no formatting

OUTPUT FORMAT (copy exactly):
[
  {
    "question": "Your question text here",
    "questiontype": "${section.questiontype}",
    "marks": ${section.markspersquestion}${optionsFormat},
    "answer": "Correct answer here"
  }
]

Generate ${section.totalquestions} questions now:`;

      setProgress('Sending request to AI (this may take 90 seconds)...');
      
      // Add 90 second delay before API call
      await sleep(90000);

      setProgress('Processing AI response...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      setProgress('Cleaning and parsing JSON...');
      
      // Clean the response
      text = cleanJSONResponse(text);
      
      console.log('Cleaned Response:', text); // Debug log

      // Try to parse JSON with error handling
      let questions;
      try {
        questions = JSON.parse(text);
      } catch (parseError) {
        // If initial parse fails, try more aggressive cleaning
        console.error('Initial parse failed, trying aggressive cleaning...');
        
        // Remove any remaining special characters
        text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        
        // Try parsing again
        questions = JSON.parse(text);
      }

      // Validate the structure
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      if (questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Validate each question has required fields
      questions.forEach((q, index) => {
        if (!q.question || !q.questiontype || !q.marks || !q.answer) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        
        // Validate MCQ has options
        if (section.questiontype === 'MCQ' && (!q.options || q.options.length !== 4)) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
      });

      setGeneratedQuestions(questions);
      setProgress('');
      setError('');
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('Failed to generate questions: ' + err.message);
      setProgress('');
    }
    setLoading(false);
  };

  const saveQuestions = async () => {
    try {
      await ep1.post('/api/v2/bulkcreatequestionsds', {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        questionbankcode: questionbankcode,
        sectionid: section._id,
        section: section.section,
        questions: generatedQuestions,
      });
      onSuccess();
    } catch (err) {
      setError('Failed to save questions: ' + err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Generate Questions with AI</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {progress && <Alert severity="info">{progress}</Alert>}

          <Alert severity="warning">
            <strong>Important:</strong> Generation takes 90 seconds minimum to ensure quality.
            <br />
            Generating {section.totalquestions} {section.questiontype} questions for Section {section.section}
          </Alert>

          <TextField
            label="Additional Context (Optional)"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="E.g., Focus on programming concepts, Include practical examples, Cover topics from Chapter 1-3"
            disabled={loading}
          />

          <Button
            variant="contained"
            onClick={generateQuestions}
            disabled={loading || !apiKey || !contextData}
            startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
            size="large"
          >
            {loading ? 'Generating (Please wait 90+ seconds)...' : 'Generate Questions'}
          </Button>

          {generatedQuestions.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Preview Generated Questions</Typography>
                <Chip 
                  label={`${generatedQuestions.length} questions generated`} 
                  color="success" 
                  size="small"
                />
              </Box>
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {generatedQuestions.map((q, index) => (
                  <Card key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body1" fontWeight="bold">
                      Q{index + 1}. {q.question}
                    </Typography>
                    {q.options && q.options.length > 0 && (
                      <Box sx={{ mt: 1, ml: 2 }}>
                        {q.options.map((opt, i) => (
                          <Typography key={i} variant="body2">
                            {String.fromCharCode(65 + i)}. {opt}
                          </Typography>
                        ))}
                      </Box>
                    )}
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      <strong>Answer:</strong> {q.answer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Type:</strong> {q.questiontype} | <strong>Marks:</strong> {q.marks}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        {generatedQuestions.length > 0 && (
          <Button onClick={saveQuestions} variant="contained" color="success" size="large">
            Save All {generatedQuestions.length} Questions
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};


export default ManageQuestionsds;
