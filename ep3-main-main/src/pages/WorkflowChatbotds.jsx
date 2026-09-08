import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Typography,
  Backdrop, CircularProgress, Grid, MenuItem
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function WorkflowChatbotds() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executionResults, setExecutionResults] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Welcome message
    addBotMessage("Hello! 👋 I'm your AI Workflow Assistant. Type a workflow name to search and execute workflows.");
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text, data = null) => {
    setMessages(prev => [...prev, {
      type: 'bot',
      text,
      data,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      type: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  const searchWorkflows = async (query) => {
    try {
      setLoading(true);
      const response = await ep1.get('/api/v2/getworkflowsds', {
        params: {
          user: global1.user,
          colid: global1.colid
        }
      });

      if (response.data.success) {
        const workflows = response.data.data;
        
        // Filter by name (case-insensitive search)
        const filtered = workflows.filter(w => 
          w.name.toLowerCase().includes(query.toLowerCase()) ||
          w.description.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length > 0) {
          setSearchResults(filtered);
          addBotMessage(
            `I found ${filtered.length} workflow(s) matching "${query}". Please select one to execute:`,
            { type: 'workflow-list', workflows: filtered }
          );
        } else {
          addBotMessage(`Sorry, I couldn't find any workflows matching "${query}". Try a different search term.`);
        }
      }
    } catch (error) {
      addBotMessage('Error searching workflows: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkflow = async (workflow) => {
    setSelectedWorkflow(workflow);
    setCurrentStepIndex(0);
    setExecutionResults([]);
    setFormData({});

    addBotMessage(
      `Great! You selected "${workflow.name}". This workflow has ${workflow.steps.length} steps.`,
    );

    // Show first step form
    if (workflow.steps.length > 0) {
      showStepForm(workflow.steps[0], 0);
    }
  };

  const showStepForm = (step, stepIndex) => {
    const fieldsToShow = step.requiredFields.filter(f => !f.useFromPreviousStep);
    
    if (fieldsToShow.length > 0) {
      addBotMessage(
        `Step ${step.serialNo}: ${step.stepName}`,
        {
          type: 'step-form',
          step,
          stepIndex,
          fields: fieldsToShow
        }
      );
    } else {
      // No fields to show, auto-execute this step
      addBotMessage(`Step ${step.serialNo}: ${step.stepName} (Auto-executing...)`);
      executeStep(step, stepIndex, {});
    }
  };

  const handleFormSubmit = async (step, stepIndex, fieldValues) => {
    // Store form data
    setFormData(prev => ({
      ...prev,
      [stepIndex]: fieldValues
    }));

    addUserMessage(`Submitted data for Step ${step.serialNo}`);
    addBotMessage(`Executing Step ${step.serialNo}: ${step.stepName}...`);

    // Execute the step
    await executeStep(step, stepIndex, fieldValues);
  };

  const executeStep = async (step, stepIndex, fieldValues) => {
    try {
      setLoading(true);

      // Build payload
      const payload = {};
      
      for (const field of step.requiredFields) {
        if (field.useFromPreviousStep && field.previousStepSerialNo) {
          // Get data from previous step result
          const prevStep = executionResults.find(r => r.serialNo === field.previousStepSerialNo);
          if (prevStep && prevStep.response) {
            // Navigate the path (e.g., "data._id")
                const pathParts = field.previousStepFieldPath.split('.');
            let value = prevStep.response;
            for (const part of pathParts) {
              value = value?.[part];
            }
            payload[field.fieldName] = value;
          }
        } else {
          // Use provided field value or default
          payload[field.fieldName] = fieldValues[field.fieldName] || field.defaultValue || '';
        }
      }

      // Add global fields if internal API
      if (step.isInternalApi) {
        payload.user = global1.user;
        payload.colid = global1.colid;
      }

      // Make API call
      let response;
      const url = step.isInternalApi 
        ? step.endpoint 
        : `${step.domain}${step.endpoint}`;

      console.log('🚀 Executing:', step.method, url, payload);

      if (step.isInternalApi) {
        // Use ep1 for internal APIs
        if (step.paramLocation === 'query') {
          response = await ep1[step.method.toLowerCase()](step.endpoint, {
            params: payload
          });
        } else if (step.paramLocation === 'body') {
          response = await ep1[step.method.toLowerCase()](step.endpoint, payload);
        } else { // both
          const { user, colid, ...bodyData } = payload;
          response = await ep1[step.method.toLowerCase()](step.endpoint, bodyData, {
            params: { user, colid }
          });
        }
      } else {
        // External API
        const axios = require('axios');
        const config = {
          method: step.method,
          url,
          headers: {}
        };

        if (step.authType === 'bearer' && step.authToken) {
          config.headers['Authorization'] = `Bearer ${step.authToken}`;
        } else if (step.authType === 'apikey' && step.authToken) {
          config.headers['X-API-Key'] = step.authToken;
        }

        if (step.paramLocation === 'query') {
          config.params = payload;
        } else {
          config.data = payload;
        }

        response = await axios(config);
      }

      // Store result
      const result = {
        serialNo: step.serialNo,
        stepName: step.stepName,
        response: response.data,
        success: true
      };
      
      setExecutionResults(prev => [...prev, result]);

      addBotMessage(
        `✅ Step ${step.serialNo} completed successfully!`,
        { type: 'step-result', result: response.data }
      );

      // Check if there are more steps
      const nextIndex = stepIndex + 1;
      if (nextIndex < selectedWorkflow.steps.length) {
        setCurrentStepIndex(nextIndex);
        setTimeout(() => {
          showStepForm(selectedWorkflow.steps[nextIndex], nextIndex);
        }, 1000);
      } else {
        // Workflow complete
        addBotMessage(
          `🎉 Workflow "${selectedWorkflow.name}" completed successfully! All ${selectedWorkflow.steps.length} steps executed.`,
          { type: 'workflow-complete', results: executionResults }
        );
        
        // Reset
        setSelectedWorkflow(null);
        setCurrentStepIndex(0);
        setFormData({});
      }

    } catch (error) {
      console.error('Error executing step:', error);
      addBotMessage(
        `❌ Error in Step ${step.serialNo}: ${error.response?.data?.message || error.message}`,
        { type: 'error', error: error.response?.data || error.message }
      );
      
      // Ask if user wants to retry
      addBotMessage('Would you like to retry this step or cancel the workflow?');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    addUserMessage(userInput);
    setInput('');

    // Search for workflows
    searchWorkflows(userInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#f5f5f5'
    }}>
      {/* Header */}
      <Paper sx={{ 
        p: 2, 
        borderRadius: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
          🤖 AI Workflow Bot
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
          Search and execute workflows seamlessly
        </Typography>
      </Paper>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        p: 2,
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-thumb': { 
          backgroundColor: '#888', 
          borderRadius: '4px' 
        }
      }}>
        {messages.map((msg, index) => (
          <MessageBubble 
            key={index} 
            message={msg} 
            onSelectWorkflow={selectWorkflow}
            onFormSubmit={handleFormSubmit}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                selectedWorkflow 
                  ? "Workflow in progress..." 
                  : "Type workflow name to search..."
              }
              disabled={loading || selectedWorkflow !== null}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={loading || !input.trim() || selectedWorkflow !== null}
              sx={{ 
                minWidth: '50px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <SendIcon />
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}

// Message Bubble Component
function MessageBubble({ message, onSelectWorkflow, onFormSubmit }) {
  const isBot = message.type === 'bot';

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      mb: 2
    }}>
      <Paper sx={{ 
        p: 2, 
        maxWidth: '70%',
        bgcolor: isBot ? 'white' : '#667eea',
        color: isBot ? 'text.primary' : 'white',
        borderRadius: 2
      }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.text}
        </Typography>

        {/* Workflow List */}
        {message.data?.type === 'workflow-list' && (
          <Box sx={{ mt: 2 }}>
            {message.data.workflows.map((workflow) => (
              <Button
                key={workflow._id}
                fullWidth
                variant="outlined"
                sx={{ 
                  mb: 1, 
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  textTransform: 'none'
                }}
                onClick={() => onSelectWorkflow(workflow)}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {workflow.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {workflow.description} • {workflow.steps.length} steps
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
        )}

        {/* Step Form */}
        {message.data?.type === 'step-form' && (
          <StepForm
            step={message.data.step}
            stepIndex={message.data.stepIndex}
            fields={message.data.fields}
            onSubmit={onFormSubmit}
          />
        )}

        {/* Step Result */}
        {message.data?.type === 'step-result' && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#e8f5e9', 
            borderRadius: 1,
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {JSON.stringify(message.data.result, null, 2)}
            </Typography>
          </Box>
        )}

        {/* Workflow Complete */}
        {message.data?.type === 'workflow-complete' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              All steps completed successfully! 🎊
            </Typography>
          </Box>
        )}

        {/* Error */}
        {message.data?.type === 'error' && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#ffebee', 
            borderRadius: 1 
          }}>
            <Typography variant="caption" color="error">
              {JSON.stringify(message.data.error, null, 2)}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" sx={{ 
          display: 'block', 
          mt: 1, 
          opacity: 0.7 
        }}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
      </Paper>
    </Box>
  );
}

// Step Form Component
function StepForm({ step, stepIndex, fields, onSubmit }) {
  const [formValues, setFormValues] = useState({});

  const handleChange = (fieldName, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(step, stepIndex, formValues);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {fields.map((field, index) => (
          <Grid item xs={12} key={index}>
            {field.fieldType === 'select' ? (
              <TextField
                fullWidth
                select
                size="small"
                label={field.fieldLabel}
                value={formValues[field.fieldName] || field.defaultValue || ''}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
              >
                {field.options?.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            ) : field.fieldType === 'boolean' ? (
              <TextField
                fullWidth
                select
                size="small"
                label={field.fieldLabel}
                value={formValues[field.fieldName] || field.defaultValue || 'false'}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            ) : (
              <TextField
                fullWidth
                size="small"
                type={field.fieldType}
                label={field.fieldLabel}
                value={formValues[field.fieldName] || field.defaultValue || ''}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
                placeholder={`Enter ${field.fieldLabel}`}
              />
            )}
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleSubmit}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Execute Step {step.serialNo}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
