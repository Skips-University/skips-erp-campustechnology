import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Typography,
  Backdrop, CircularProgress, Grid, MenuItem, Chip, Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';

export default function WorkflowChatbotds() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executionResults, setExecutionResults] = useState([]);
  const [userSelections, setUserSelections] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    addBotMessage("Hello! 👋 I'm your AI Workflow Assistant. Type a workflow name to search and execute workflows with dynamic data dependencies.");
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

  // FIXED: Helper function to get nested value from object using path
  const getNestedValue = (obj, path) => {
    // If no path or path is "." or empty, return the object itself
    if (!path || path === '.' || path.trim() === '' || path === 'data') {
      // Special handling: if obj has a 'data' property, return it
      if (obj && typeof obj === 'object' && 'data' in obj) {
        return obj.data;
      }
      return obj;
    }
    
    // If obj is not an object, return it
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (!part) continue; // Skip empty parts
      
      // Handle array notation like data.students[0]
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        value = value?.[arrayMatch[1]]?.[parseInt(arrayMatch[2])];
      } else {
        value = value?.[part];
      }
      
      if (value === undefined || value === null) {
        // console.warn(`Path "${path}" not found in object, returning original`, obj);
        return obj; // Return original object instead of null
      }
    }
    
    return value;
  };

  const searchWorkflows = async (query) => {
    try {
      setLoading(true);
      const response = await ep1.get('/api/v2/getworkflowsds1', {
        params: {
          user: global1.user,
          colid: global1.colid
        }
      });

      if (response.data.success) {
        const workflows = response.data.data.filter(w => w.status === 'Active');
        
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
          addBotMessage(`Sorry, I couldn't find any active workflows matching "${query}". Try a different search term.`);
        }
      }
    } catch (error) {
      addBotMessage('Error searching workflows: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkflow = async (workflow) => {
    // FIXED: Deep clone the workflow to prevent reference issues
    const workflowCopy = JSON.parse(JSON.stringify(workflow));
    
    setSelectedWorkflow(workflowCopy);
    setCurrentStepIndex(0);
    setExecutionResults([]);
    setFormData({});
    setUserSelections({});

    addBotMessage(
      `Great! You selected "${workflowCopy.name}". This workflow has ${workflowCopy.steps.length} steps.`,
    );

    // Start execution from first step
    if (workflowCopy.steps.length > 0) {
      await processStep(workflowCopy.steps[0], 0, workflowCopy, []);
    }
  };

  // FIXED: Added previousResults parameter to handle state timing issues
  const processStep = async (step, stepIndex, workflow = null, previousResults = null) => {
    // FIXED: Use provided workflow or state
    const currentWorkflow = workflow || selectedWorkflow;
    
    // FIXED: Use provided results or state for dependency checking
    const currentResults = previousResults !== null ? previousResults : executionResults;
    
    if (!currentWorkflow || !currentWorkflow.steps) {
      // console.error('❌ No workflow available');
      addBotMessage('⚠️ Workflow data is missing. Please start over.');
      return;
    }

    // console.log(`🔄 Processing Step ${step.serialNo}: ${step.stepName}`);
    // console.log('📦 Current execution results:', currentResults);
    
    // Check if step is conditional and dependency is met
    if (step.isConditional && step.dependsOnStep) {
      const dependencyMet = currentResults.some(r => r.serialNo === step.dependsOnStep);
      // console.log(`🔍 Step ${step.serialNo} is conditional. Depends on Step ${step.dependsOnStep}. Met: ${dependencyMet}`);
      
      if (!dependencyMet) {
        // console.log(`⏸️ Step ${step.serialNo} depends on Step ${step.dependsOnStep} - dependency NOT met`);
        // console.log('Available steps in results:', currentResults.map(r => r.serialNo));
        return;
      } else {
        // console.log(`✅ Step ${step.serialNo} dependency satisfied!`);
      }
    }

    // Check if step needs user input
    const fieldsNeedingInput = step.requiredFields.filter(f => 
      !f.useFromPreviousStep && (!f.isDynamicDropdown && f.fieldType !== 'dynamicDropdown')
    );
    
    const dynamicDropdowns = step.requiredFields.filter(f => 
      f.isDynamicDropdown || f.fieldType === 'dynamicDropdown'
    );

    // console.log('📝 Fields needing input:', fieldsNeedingInput.length);
    // console.log('📊 Dynamic dropdowns:', dynamicDropdowns.length);

    // If step has no required input OR is auto-execute, run it immediately
    if (step.executionType === 'auto' && fieldsNeedingInput.length === 0 && dynamicDropdowns.length === 0) {
      addBotMessage(`Step ${step.serialNo}: ${step.stepName} (Auto-executing...)`);
      await executeStep(step, stepIndex, {}, currentWorkflow, currentResults);
    } else {
      // Show form with dynamic dropdowns populated
      // console.log('👉 Showing form for step', step.serialNo);
      showStepForm(step, stepIndex, currentResults);
    }
  };

  // FIXED: Added previousResults parameter
  const showStepForm = (step, stepIndex, previousResults = null) => {
    // FIXED: Safety check
    if (!step || !step.requiredFields) {
      // console.error('Invalid step data:', step);
      addBotMessage('❌ Error: Step configuration is invalid');
      return;
    }

    // FIXED: Use provided results or state
    const currentResults = previousResults !== null ? previousResults : executionResults;

    // Prepare dynamic dropdowns with data from previous steps
    const dynamicDropdownData = {};
    
    step.requiredFields.forEach(field => {
      if (field.isDynamicDropdown || field.fieldType === 'dynamicDropdown') {
        const sourceStep = currentResults.find(r => r.serialNo === field.dropdownSourceStep);
        
        if (sourceStep) {
          let options = getNestedValue(sourceStep.response, field.dropdownDataPath || '');
          
          // FIXED: If getNestedValue returns the response itself (array)
          if (!options && Array.isArray(sourceStep.response)) {
            options = sourceStep.response;
          }
          
          // Ensure it's an array
          if (!Array.isArray(options)) {
            options = options ? [options] : [];
          }
          
          dynamicDropdownData[field.fieldName] = {
            options,
            labelField: field.dropdownLabelField,
            valueField: field.dropdownValueField
          };
          
          // console.log(`📊 Dynamic dropdown for ${field.fieldName}:`, options.length, 'options');
        } else {
          // console.warn(`⚠️ Source step ${field.dropdownSourceStep} not found for field ${field.fieldName}`);
        }
      }
    });

    const fieldsToShow = step.requiredFields.filter(f => !f.useFromPreviousStep);
    
    if (fieldsToShow.length > 0) {
      addBotMessage(
        `Step ${step.serialNo}: ${step.stepName}`,
        {
          type: 'step-form',
          step,
          stepIndex,
          fields: fieldsToShow,
          dynamicDropdownData
        }
      );
    } else {
      // No visible fields, auto-execute
      addBotMessage(`Step ${step.serialNo}: ${step.stepName} (Auto-executing...)`);
      executeStep(step, stepIndex, {}, null, currentResults);
    }
  };

  const handleFormSubmit = async (step, stepIndex, fieldValues) => {
    // Store user selections for this step
    setUserSelections(prev => ({
      ...prev,
      [step.serialNo]: fieldValues
    }));

    // Store form data
    setFormData(prev => ({
      ...prev,
      [stepIndex]: fieldValues
    }));

    // Show what user selected
    const selectionSummary = Object.entries(fieldValues)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    addUserMessage(`Submitted: ${selectionSummary}`);
    addBotMessage(`Executing Step ${step.serialNo}: ${step.stepName}...`);

    // Execute the step
    await executeStep(step, stepIndex, fieldValues);
  };

  // FIXED: Added previousResults parameter
  const executeStep = async (step, stepIndex, fieldValues, workflow = null, previousResults = null) => {
    try {
      setLoading(true);

      // FIXED: Use provided workflow or state
      const currentWorkflow = workflow || selectedWorkflow;

      // FIXED: Use provided results or state
      const currentResults = previousResults !== null ? previousResults : executionResults;

      // FIXED: Safety check
      if (!currentWorkflow || !currentWorkflow.steps) {
        throw new Error('Workflow data is not available');
      }

      // Build payload
      const payload = {};
      
      // Process all fields
      for (const field of step.requiredFields) {
        if (field.useFromPreviousStep && field.previousStepSerialNo) {
          // Auto-fill from previous step response
          const prevStep = currentResults.find(r => r.serialNo === field.previousStepSerialNo);
          if (prevStep && prevStep.response) {
            const value = getNestedValue(prevStep.response, field.previousStepFieldPath);
            payload[field.fieldName] = value;
            // console.log(`📝 Auto-filled ${field.fieldName} = ${value} from Step ${field.previousStepSerialNo}`);
          }
        } else if (field.isDynamicDropdown || field.fieldType === 'dynamicDropdown') {
          // Use value from dynamic dropdown selection
          payload[field.fieldName] = fieldValues[field.fieldName];
          // console.log(`📋 Dropdown ${field.fieldName} = ${fieldValues[field.fieldName]}`);
        } else {
          // Use provided field value or default
          payload[field.fieldName] = fieldValues[field.fieldName] || field.defaultValue || '';
        }
      }

      // Add global fields if internal API (user, colid, token, name)
      if (step.isInternalApi) {
        payload.user = global1.user;
        payload.colid = global1.colid;
        payload.token = global1.token;
        payload.name = global1.name;
      }

      // Make API call
      let response;
      const url = step.isInternalApi 
        ? step.endpoint 
        : `${step.domain}${step.endpoint}`;

      // console.log('🚀 Executing:', step.method, url, payload);

      if (step.isInternalApi) {
        // Use ep1 for internal APIs
        if (step.paramLocation === 'query') {
          response = await ep1[step.method.toLowerCase()](step.endpoint, {
            params: payload
          });
        } else if (step.paramLocation === 'body') {
          response = await ep1[step.method.toLowerCase()](step.endpoint, payload);
        } else { // both
          const { user, colid, token, name, ...bodyData } = payload;
          response = await ep1[step.method.toLowerCase()](step.endpoint, bodyData, {
            params: { user, colid, token, name, ...bodyData }
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

      // Store result with user selections
      const result = {
        serialNo: step.serialNo,
        stepName: step.stepName,
        response: response.data,
        userSelection: fieldValues,
        success: true,
        dataPath: step.dataPath,
        excludeFields: step.excludeFields,
        timestamp: new Date()
      };
      
      // FIXED: Create updated results immediately
      const updatedResults = [...currentResults, result];
      setExecutionResults(updatedResults);

      // console.log('✅ Step completed:', result);

      // FIXED: Show success with data preview
      let dataPreview = '';
      try {
        let extractedData = getNestedValue(response.data, step.dataPath);
        
        // Handle when response is directly an array
        if (!extractedData && Array.isArray(response.data)) {
          extractedData = response.data;
        }
        
        if (Array.isArray(extractedData)) {
          dataPreview = ` (${extractedData.length} records)`;
        } else if (extractedData) {
          dataPreview = ` (1 record)`;
        }
      } catch (e) {
        // console.warn('Could not extract data preview:', e);
      }

      addBotMessage(
        `✅ Step ${step.serialNo} completed successfully!${dataPreview}`,
        { type: 'step-result', result: response.data, stepSerial: step.serialNo }
      );

      // FIXED: Check if there are more steps with proper validation
      const nextIndex = stepIndex + 1;
      
      if (!currentWorkflow || !currentWorkflow.steps) {
        // console.error('❌ currentWorkflow is null or has no steps');
        addBotMessage('⚠️ Workflow data lost. Please start over.');
        setSelectedWorkflow(null);
        return;
      }
      
      if (nextIndex < currentWorkflow.steps.length) {
        setCurrentStepIndex(nextIndex);
        
        // FIXED: Pass updatedResults so dependency check works immediately
        setTimeout(() => {
          processStep(currentWorkflow.steps[nextIndex], nextIndex, currentWorkflow, updatedResults);
        }, 500);
      } else {
        // Workflow complete - show download options
        addBotMessage(
          `🎉 Workflow "${currentWorkflow.name}" completed successfully! All ${currentWorkflow.steps.length} steps executed.`,
          { type: 'workflow-complete', results: updatedResults }
        );
        
        // Reset for next workflow
        setTimeout(() => {
          setSelectedWorkflow(null);
          setCurrentStepIndex(0);
          setFormData({});
          setUserSelections({});
        }, 2000);
      }

    } catch (error) {
      // console.error('❌ Error executing step:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Unknown error occurred';
      
      addBotMessage(
        `❌ Error in Step ${step.serialNo}: ${errorMessage}`,
        { 
          type: 'error', 
          error: error.response?.data || error.message,
          step,
          stepIndex
        }
      );
      
      // Offer to retry
      addBotMessage(
        'Would you like to retry this step?',
        { type: 'retry-option', step, stepIndex, fieldValues }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (step, stepIndex, fieldValues) => {
    addUserMessage('Retrying step...');
    await executeStep(step, stepIndex, fieldValues);
  };

  const handleCancel = () => {
    addUserMessage('Cancelling workflow...');
    addBotMessage('Workflow cancelled. You can search for another workflow.');
    setSelectedWorkflow(null);
    setCurrentStepIndex(0);
    setFormData({});
    setExecutionResults([]);
    setUserSelections({});
  };

  // FIXED: Download Excel function
  const downloadExcel = (result) => {
    try {
      // console.log('📥 Downloading Excel for:', result);
      
      // Extract data using dataPath
      let dataToExport = getNestedValue(result.response, result.dataPath);

      // Handle when response is directly an array
      if (!dataToExport && Array.isArray(result.response)) {
        dataToExport = result.response;
      }

      if (!dataToExport) {
        addBotMessage('❌ No data found to export');
        return;
      }

      if (!Array.isArray(dataToExport)) {
        dataToExport = [dataToExport];
      }

      if (dataToExport.length === 0) {
        addBotMessage('❌ No data to export - the array is empty');
        return;
      }

      // Exclude fields
      const excludeList = result.excludeFields 
        ? result.excludeFields.split(',').map(f => f.trim()) 
        : [];
      
      const cleanedData = dataToExport.map(item => {
        const cleaned = { ...item };
        excludeList.forEach(field => {
          delete cleaned[field];
        });
        return cleaned;
      });

      // console.log('📊 Exporting', cleanedData.length, 'records');

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(cleanedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${result.stepName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
      
      // Download
      XLSX.writeFile(wb, filename);
      addBotMessage(`✅ Excel file "${filename}" downloaded successfully with ${cleanedData.length} records!`);
      
    } catch (error) {
      // console.error('Error downloading Excel:', error);
      addBotMessage('❌ Error downloading Excel: ' + error.message);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              🤖 AI Workflow Bot (Advanced)
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Dynamic dependent workflows with intelligent data passing
            </Typography>
          </Box>
          {selectedWorkflow && (
            <Chip 
              label={`Running: ${selectedWorkflow.name}`} 
              color="warning"
              sx={{ color: 'white' }}
            />
          )}
        </Box>
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
            onDownloadExcel={downloadExcel}
            onRetry={handleRetry}
            onCancel={handleCancel}
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
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
            Processing workflow...
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
}

// Message Bubble Component
function MessageBubble({ message, onSelectWorkflow, onFormSubmit, onDownloadExcel, onRetry, onCancel }) {
  const isBot = message.type === 'bot';

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      mb: 2
    }}>
      <Paper sx={{ 
        p: 2, 
        maxWidth: '80%',
        bgcolor: isBot ? 'white' : '#667eea',
        color: isBot ? 'text.primary' : 'white',
        borderRadius: 2,
        boxShadow: 3
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
                  textTransform: 'none',
                  borderColor: '#667eea',
                  '&:hover': {
                    borderColor: '#764ba2',
                    bgcolor: 'rgba(102, 126, 234, 0.1)'
                  }
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

        {/* Step Form with Dynamic Dropdowns */}
        {message.data?.type === 'step-form' && (
          <StepForm
            step={message.data.step}
            stepIndex={message.data.stepIndex}
            fields={message.data.fields}
            dynamicDropdownData={message.data.dynamicDropdownData}
            onSubmit={onFormSubmit}
          />
        )}

        {/* Step Result Preview */}
        {message.data?.type === 'step-result' && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#e8f5e9', 
            borderRadius: 1,
            maxHeight: '150px',
            overflow: 'auto'
          }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {JSON.stringify(message.data.result, null, 2).substring(0, 500)}...
            </Typography>
          </Box>
        )}

        {/* Workflow Complete - Download Options */}
        {message.data?.type === 'workflow-complete' && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              All steps completed successfully! 🎊
            </Alert>
            {message.data.results.map((result, index) => (
              <Button
                key={index}
                fullWidth
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                onClick={() => onDownloadExcel(result)}
                sx={{ mb: 1 }}
              >
                Download Step {result.serialNo}: {result.stepName}
              </Button>
            ))}
          </Box>
        )}

        {/* Error with Retry Option */}
        {message.data?.type === 'error' && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#ffebee', 
            borderRadius: 1,
            maxHeight: '150px',
            overflow: 'auto'
          }}>
            <Typography variant="caption" color="error" sx={{ fontFamily: 'monospace' }}>
              {JSON.stringify(message.data.error, null, 2)}
            </Typography>
          </Box>
        )}

        {/* Retry Option */}
        {message.data?.type === 'retry-option' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => onRetry(message.data.step, message.data.stepIndex, message.data.fieldValues)}
            >
              Retry Step
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onCancel}
            >
              Cancel Workflow
            </Button>
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

// Advanced Step Form Component with Dynamic Dropdowns
function StepForm({ step, stepIndex, fields, dynamicDropdownData, onSubmit }) {
  const [formValues, setFormValues] = useState({});

  const handleChange = (fieldName, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    const missingFields = fields.filter(f => 
      !formValues[f.fieldName] && !f.defaultValue
    );

    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.map(f => f.fieldLabel).join(', ')}`);
      return;
    }

    onSubmit(step, stepIndex, formValues);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {fields.map((field, index) => {
          // Render Dynamic Dropdown
          if ((field.isDynamicDropdown || field.fieldType === 'dynamicDropdown') && dynamicDropdownData[field.fieldName]) {
            const dropdownConfig = dynamicDropdownData[field.fieldName];
            const options = dropdownConfig.options || [];

            return (
              <Grid item xs={12} key={index}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label={field.fieldLabel}
                  value={formValues[field.fieldName] || field.defaultValue || ''}
                  onChange={(e) => handleChange(field.fieldName, e.target.value)}
                  helperText={`${options.length} options available`}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }
                  }}
                >
                  {options.length === 0 && (
                    <MenuItem disabled>No options available</MenuItem>
                  )}
                  {options.map((option, i) => (
                    <MenuItem 
                      key={i} 
                      value={option[dropdownConfig.valueField]}
                    >
                      {option[dropdownConfig.labelField]} 
                      {dropdownConfig.valueField !== dropdownConfig.labelField && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({option[dropdownConfig.valueField]})
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          }

          // Render Static Select
          if (field.fieldType === 'select') {
            return (
              <Grid item xs={12} key={index}>
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
              </Grid>
            );
          }

          // Render Boolean
          if (field.fieldType === 'boolean') {
            return (
              <Grid item xs={12} key={index}>
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
              </Grid>
            );
          }

          // Render Standard Input
          return (
            <Grid item xs={12} key={index}>
              <TextField
                fullWidth
                size="small"
                type={field.fieldType}
                label={field.fieldLabel}
                value={formValues[field.fieldName] || field.defaultValue || ''}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
                placeholder={`Enter ${field.fieldLabel}`}
              />
            </Grid>
          );
        })}
        
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
