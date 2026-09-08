import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Typography,
  Backdrop, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { GoogleGenAI, Type } from '@google/genai';

export default function ApiChatbot1() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I can help you extract data from configured APIs. Type the API name to search.' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const [selectedApi, setSelectedApi] = useState(null);
  
  // Parameter input dialog state
  const [paramDialogOpen, setParamDialogOpen] = useState(false);
  const [currentApiConfig, setCurrentApiConfig] = useState(null);
  const [paramValues, setParamValues] = useState({});

  // AI Report state
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [currentData, setCurrentData] = useState(null);
  const [aiReportText, setAiReportText] = useState('');
  const [waitingForAiQuery, setWaitingForAiQuery] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchGeminiApiKey();
  }, []);

  // Fetch Gemini API Key
  const fetchGeminiApiKey = async () => {
    try {
      const response = await ep1.get('/api/v2/getactiveapikeyds', {
        params: {
          colid: global1.colid,
          user: global1.user
        }
      });
      if (response.data.success) {
        setGeminiApiKey(response.data.data.geminiApiKey);
      } else {
        console.error('Failed to fetch API key:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  // Helper function to replace template variables
  const replaceVariables = (template, variables) => {
    let result = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key]);
    });
    return result;
  };

  // Call Gemini AI for processing data
  const callGeminiAI = async (prompt, data) => {
    if (!geminiApiKey || geminiApiKey.length < 10) {
      throw new Error('Valid Gemini API key not found. Please configure it in settings.');
    }

    const fullPrompt = `${prompt}\n\nData to analyze:\n${JSON.stringify(data, null, 2)}`;

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
              },
              propertyOrdering: ["ingredients"],
            },
          },
        },
      });

      const response1 = response.text;
      const parsedData = JSON.parse(response1);
      let topic1 = '';

      parsedData.forEach((module) => {
        module.ingredients.forEach((topic) => {
          topic1 = topic1 + topic + '\n';
        });
      });

      return topic1;
    } catch (err) {
      return 'Error: ' + err;
    }
  };

  // Handle AI Report Generation
  const handleGenerateAiReport = async (query) => {
    setOpen(true);

    setMessages(prev => [
      ...prev,
      { 
        sender: 'bot', 
        text: 'Processing your data with AI... Please wait.' 
      }
    ]);

    try {
      const aiResponse = await callGeminiAI(query, currentData);
      setAiReportText(aiResponse);
      
      setOpen(false);
      setWaitingForAiQuery(false);

      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: `✨ AI Report Generated:\n\n${aiResponse}`,
          buttons: [
            {
              id: 'export_ai_report',
              label: 'Export AI Report to Excel',
              handler: () => exportAiReport(aiResponse, currentApiConfig)
            },
            {
              id: 'download_original',
              label: 'Download Original Data',
              handler: () => downloadExcel(currentData, currentApiConfig)
            },
            {
              id: 'new_ai_query',
              label: 'New AI Query',
              handler: () => startAiReport()
            },
            {
              id: 'search_again',
              label: 'Search Another API',
              handler: () => handleSearchAgain()
            }
          ]
        }
      ]);
    } catch (error) {
      setOpen(false);
      setWaitingForAiQuery(false);
      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: `❌ Error generating AI report: ${error.message}` 
        }
      ]);
    }
  };

  // Start AI Report Mode
  const startAiReport = () => {
    setWaitingForAiQuery(true);
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: 'Generate AI Report' },
      { 
        sender: 'bot', 
        text: `✨ AI Report Mode Activated!\n\nType your query below. Examples:\n• "Summarize the attendance trends by program"\n• "Find students with less than 75% attendance"\n• "Calculate average attendance per semester"\n• "Group data by department and show counts"\n\nWhat would you like to know about the data?`
      }
    ]);
  };

  // Export AI Report to Excel
  const exportAiReport = (reportText, config) => {
    try {
      const reportData = [
        ['AI Generated Report'],
        [''],
        ['API:', config.name],
        ['Generated:', new Date().toLocaleString()],
        [''],
        ['Report Content:'],
        [''],
        [reportText]
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(reportData);
      worksheet['!cols'] = [{ wch: 100 }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AI Report");

      const filename = `${config.apiname}_AI_report_${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, filename);

      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `📥 AI report exported successfully as "${filename}"!` }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `❌ Error exporting AI report: ${error.message}` }
      ]);
    }
  };

  // Show parameter input dialog
  const showParameterDialog = (apiConfig) => {
    setCurrentApiConfig(apiConfig);
    
    // Parse dynamic parameters
    const dynamicParams = JSON.parse(apiConfig.dynamicParams || '[]');
    
    // Initialize param values with defaults
    const initialValues = {};
    dynamicParams.forEach(param => {
      initialValues[param.name] = param.default || '';
    });
    
    setParamValues(initialValues);
    setParamDialogOpen(true);
  };

  // Handle parameter value change
  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Submit parameters and execute API
  const handleParameterSubmit = async () => {
    const dynamicParams = JSON.parse(currentApiConfig.dynamicParams || '[]');
    
    // Validate required parameters
    const missingParams = dynamicParams
      .filter(param => param.required && !paramValues[param.name])
      .map(param => param.label);
    
    if (missingParams.length > 0) {
      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: `❌ Please provide: ${missingParams.join(', ')}` 
        }
      ]);
      return;
    }
    
    setParamDialogOpen(false);
    
    // Show executing message
    setMessages(prev => [
      ...prev,
      { 
        sender: 'bot', 
        text: `Executing API with parameters:\n${JSON.stringify(paramValues, null, 2)}` 
      }
    ]);
    
    // Execute API with parameters
    const result = await executeApi(currentApiConfig, paramValues);
    
    const formattedResponse = {
      sender: 'bot',
      text: result.text,
      buttons: result.buttons?.map(btn => ({
        ...btn,
        handler: btn.handler || (() => handleApiSelection(btn))
      }))
    };

    setMessages(prev => [...prev, formattedResponse]);
  };

  // Render parameter input fields
  const renderParameterInputs = () => {
    if (!currentApiConfig) return null;
    
    const dynamicParams = JSON.parse(currentApiConfig.dynamicParams || '[]');
    
    return dynamicParams.map((param, index) => {
      if (param.type === 'select') {
        return (
          <Grid item xs={12} md={6} key={index}>
            <TextField
              fullWidth
              select
              label={param.label}
              value={paramValues[param.name] || ''}
              onChange={(e) => handleParamChange(param.name, e.target.value)}
              required={param.required}
              helperText={param.placeholder}
            >
              {param.options?.map((option, idx) => (
                <MenuItem key={idx} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        );
      } else if (param.type === 'date') {
        return (
          <Grid item xs={12} md={6} key={index}>
            <TextField
              fullWidth
              type="date"
              label={param.label}
              value={paramValues[param.name] || ''}
              onChange={(e) => handleParamChange(param.name, e.target.value)}
              required={param.required}
              InputLabelProps={{ shrink: true }}
              helperText={param.placeholder}
            />
          </Grid>
        );
      } else if (param.type === 'number') {
        return (
          <Grid item xs={12} md={6} key={index}>
            <TextField
              fullWidth
              type="number"
              label={param.label}
              value={paramValues[param.name] || ''}
              onChange={(e) => handleParamChange(param.name, e.target.value)}
              required={param.required}
              placeholder={param.placeholder}
            />
          </Grid>
        );
      } else {
        // text type
        return (
          <Grid item xs={12} md={6} key={index}>
            <TextField
              fullWidth
              label={param.label}
              value={paramValues[param.name] || ''}
              onChange={(e) => handleParamChange(param.name, e.target.value)}
              required={param.required}
              placeholder={param.placeholder}
            />
          </Grid>
        );
      }
    });
  };

  // Execute API call with axios or ep1
  const executeApiCall = async (apiConfig, userParams = {}) => {
    try {
      // Build variable map
      const variables = {
        user: global1.user,
        colid: global1.colid,
        token: global1.token || '',
        date: new Date().toISOString().split('T')[0],
        ...userParams
      };

      // Prepare request
      let queryParams = JSON.parse(apiConfig.queryParams || '{}');
      let body = apiConfig.bodyTemplate ? JSON.parse(apiConfig.bodyTemplate) : null;

      // Merge user parameters into query params
      queryParams = { ...queryParams, ...userParams };

      // Add internal parameters
      if (apiConfig.useColid) {
        queryParams.colid = global1.colid;
      }
      if (apiConfig.useUser) {
        queryParams.user = global1.user;
      }
      if (apiConfig.useToken && global1.token) {
        queryParams.token = global1.token;
      }

      // Handle filter template for internal APIs
      if (apiConfig.filterTemplate && apiConfig.filterTemplate !== '{}') {
        const filterStr = replaceVariables(apiConfig.filterTemplate, variables);
        const filter = JSON.parse(filterStr);
        
        if (body) {
          body.filter = filter;
        } else {
          body = { filter };
        }
      }

      // Add projection and sort for internal APIs
      if (apiConfig.projectionTemplate && apiConfig.projectionTemplate !== '{}') {
        const projection = JSON.parse(apiConfig.projectionTemplate);
        if (body) body.projection = projection;
      }

      if (apiConfig.sortTemplate && apiConfig.sortTemplate !== '{}') {
        const sort = JSON.parse(apiConfig.sortTemplate);
        if (body) body.sort = sort;
      }

      // Add collection name for internal APIs
      if (apiConfig.collectionName) {
        if (body) {
          body.collection = apiConfig.collectionName;
        } else {
          body = { collection: apiConfig.collectionName };
        }
      }

      // Add limit
      if (body) {
        body.limit = apiConfig.dataLimit || 1000;
      }

      // Prepare authentication headers
      let headers = JSON.parse(apiConfig.headers || '{}');
      
      if (apiConfig.authType === 'bearer' && apiConfig.authToken) {
        headers['Authorization'] = `Bearer ${apiConfig.authToken}`;
      } else if (apiConfig.authType === 'apikey' && apiConfig.authHeader && apiConfig.authToken) {
        headers[apiConfig.authHeader] = apiConfig.authToken;
      } else if (apiConfig.authType === 'basic' && apiConfig.username && apiConfig.password) {
        const auth = btoa(`${apiConfig.username}:${apiConfig.password}`);
        headers['Authorization'] = `Basic ${auth}`;
      }

      let response = null;
      let attempts = 0;
      let lastError = null;

      // Make API call with retry logic
      while (attempts < (apiConfig.retryAttempts || 3)) {
        try {
          if (apiConfig.isInternalApi) {
            // Use ep1 instance for internal APIs
            const endpoint = apiConfig.api;
            
            if (apiConfig.method.toLowerCase() === 'get') {
              response = await ep1.get(endpoint, {
                params: queryParams,
                headers: headers,
                timeout: apiConfig.timeout || 30000
              });
            } else if (['post', 'put', 'patch'].includes(apiConfig.method.toLowerCase())) {
              response = await ep1[apiConfig.method.toLowerCase()](endpoint, body, {
                params: queryParams,
                headers: headers,
                timeout: apiConfig.timeout || 30000
              });
            } else if (apiConfig.method.toLowerCase() === 'delete') {
              response = await ep1.delete(endpoint, {
                params: queryParams,
                headers: headers,
                data: body,
                timeout: apiConfig.timeout || 30000
              });
            }
          } else {
            // Use direct axios for external APIs
            const fullUrl = apiConfig.domain 
              ? `${apiConfig.domain}${apiConfig.api}` 
              : apiConfig.api;

            const axiosConfig = {
              method: apiConfig.method.toLowerCase(),
              url: fullUrl,
              headers: {
                'Content-Type': 'application/json',
                ...headers
              },
              params: queryParams,
              timeout: apiConfig.timeout || 30000
            };

            if (body && ['post', 'put', 'patch'].includes(apiConfig.method.toLowerCase())) {
              axiosConfig.data = body;
            }

            response = await axios(axiosConfig);
          }
          
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error;
          attempts++;
          if (attempts < (apiConfig.retryAttempts || 3)) {
            await new Promise(resolve => setTimeout(resolve, apiConfig.retryDelay || 1000));
          }
        }
      }

      if (!response) {
        throw lastError;
      }

      // Extract data from response
      let data = response.data;
      
      console.log('🔍 Step 1 - Raw API response:', data);

      // Extract data from nested path if specified
      if (apiConfig.dataPath && apiConfig.dataPath.trim()) {
        const paths = apiConfig.dataPath.split('.');
        for (const path of paths) {
          if (data && typeof data === 'object') {
            data = data[path];
          }
        }
        console.log('🔍 Step 2 - After dataPath extraction:', data);
      }

      // AUTO-DETECT common response structures if not already an array
      if (!Array.isArray(data)) {
        if (data && typeof data === 'object') {
          // Check for common array properties
          if (data.data && Array.isArray(data.data)) {
            data = data.data;
            console.log('🔍 Auto-detected data.data array');
          } else if (data.results && Array.isArray(data.results)) {
            data = data.results;
            console.log('🔍 Auto-detected data.results array');
          } else if (data.records && Array.isArray(data.records)) {
            data = data.records;
            console.log('🔍 Auto-detected data.records array');
          } else {
            // Single object, wrap in array
            data = [data];
            console.log('🔍 Single object detected, wrapped in array');
          }
        } else {
          data = [];
          console.log('🔍 No valid data found');
        }
      }

      console.log('🔍 Step 3 - Data is now array:', data);
      console.log('🔍 Array length:', data.length);

      // Flatten nested _id fields (common in MongoDB aggregations)
      if (Array.isArray(data) && data.length > 0) {
        data = data.map(item => {
          const flattened = {};
          
          // Flatten _id object if exists
          if (item._id && typeof item._id === 'object') {
            Object.keys(item._id).forEach(key => {
              flattened[key] = item._id[key];
            });
          }
          
          // Add other fields
          Object.keys(item).forEach(key => {
            if (key !== '_id') {
              flattened[key] = item[key];
            }
          });
          
          return flattened;
        });

        console.log('🔍 Step 4 - After flattening _id:', data);
        console.log('🔍 Keys before filtering:', data.length > 0 ? Object.keys(data[0]) : 'No data');

        // Filter fields with better logic
        data = data.map(item => {
          let filtered = {};
          
          // If includeFields is specified and has values, ONLY include those fields
          if (apiConfig.includeFields && apiConfig.includeFields.length > 0 && apiConfig.includeFields[0] !== '') {
            console.log('🔍 Including only fields:', apiConfig.includeFields);
            apiConfig.includeFields.forEach(field => {
              if (item[field] !== undefined) {
                filtered[field] = item[field];
              }
            });
          } else {
            // Include all fields first
            filtered = { ...item };
            
            // Then remove excluded fields (if any and not empty)
            if (apiConfig.excludeFields && apiConfig.excludeFields.length > 0) {
              console.log('🔍 Excluding fields:', apiConfig.excludeFields);
              apiConfig.excludeFields.forEach(field => {
                if (field && field.trim()) {
                  delete filtered[field];
                }
              });
            }
          }
          
          return filtered;
        });

        console.log('🔍 Step 5 - Final filtered data:', data);
        console.log('🔍 First record keys:', data.length > 0 ? Object.keys(data[0]) : 'No records');
      }

      return {
        success: true,
        data: data,
        count: Array.isArray(data) ? data.length : 1
      };

    } catch (error) {
      console.error('❌ API call error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  };

  const searchApis = async (searchString) => {
    try {
      const response = await ep1.get('/api/v2/searchapis', {
        params: {
          searchstring: searchString
        }
      });

      if (response.data.status === 'success' && response.data.data.classes.length > 0) {
        const buttons = response.data.data.classes.map(api => ({
          id: api.id,
          label: `${api.title} (${api.method})`,
          apiname: api.apiname,
          config: api.config
        }));

        return {
          text: `Found ${buttons.length} API(s) matching "${searchString}":`,
          buttons: buttons
        };
      } else {
        return {
          text: `No APIs found matching "${searchString}". Try different keywords or configure a new API.`,
          buttons: [
            { id: 'config_new', label: 'Configure New API' }
          ]
        };
      }
    } catch (error) {
      return {
        text: `Error searching APIs: ${error.message}`
      };
    }
  };

  const executeApi = async (apiConfig, userParams = {}) => {
    setOpen(true);
    
    const result = await executeApiCall(apiConfig, userParams);
    
    setOpen(false);

    if (result.success) {
      const recordCount = result.count;
      const data = result.data;

      console.log('📊 Data passed to download handler:', data);

      setSelectedApi({
        data: data,
        config: apiConfig
      });
      
      // Store current data and config for AI report
      setCurrentData(data);
      setCurrentApiConfig(apiConfig);

      return {
        text: `✅ Successfully extracted ${recordCount} record(s) from ${apiConfig.name}!`,
        buttons: [
          {
            id: 'download_excel',
            label: `Download Excel (${recordCount} records)`,
            handler: () => downloadExcel(data, apiConfig)
          },
          {
            id: 'ai_report',
            label: '✨ Generate AI Report',
            handler: () => startAiReport()
          },
          {
            id: 'search_again',
            label: 'Search Another API',
            handler: () => handleSearchAgain()
          }
        ]
      };
    } else {
      return {
        text: `❌ Error: ${result.error}`
      };
    }
  };

  const handleSearchAgain = () => {
    setSelectedApi(null);
    setWaitingForAiQuery(false);
    setCurrentData(null);
    setCurrentApiConfig(null);
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: 'Search another API' },
      { sender: 'bot', text: 'Type the API name to search.' }
    ]);
  };

  const downloadExcel = (data, config) => {
    try {
      console.log('=== EXCEL EXPORT DEBUG ===');
      console.log('📥 Data received:', data);
      console.log('📥 Data type:', typeof data);
      console.log('📥 Is Array?', Array.isArray(data));
      console.log('📥 Data length:', Array.isArray(data) ? data.length : 'N/A');
      console.log('📥 First item:', Array.isArray(data) && data.length > 0 ? data[0] : data);
      console.log('📥 Keys in first item:', Array.isArray(data) && data.length > 0 && data[0] ? Object.keys(data[0]) : 'N/A');
      
      // Ensure data is an array
      let rows = Array.isArray(data) ? data : (data ? [data] : []);
      
      if (rows.length === 0) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: '❌ No data to export. The array is empty.' }
        ]);
        return;
      }

      // Check if rows have any keys
      if (rows[0] && Object.keys(rows[0]).length === 0) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: '❌ No data to export. All fields were filtered out. Check your includeFields/excludeFields configuration in API settings.' }
        ]);
        return;
      }

      console.log('📥 Final rows for Excel:', rows);
      
      const worksheet = XLSX.utils.json_to_sheet(rows);
      
      // Auto-size columns
      const cols = [];
      if (rows.length > 0) {
        Object.keys(rows[0]).forEach(key => {
          const maxLength = Math.max(
            key.length,
            ...rows.map(row => String(row[key] || '').length)
          );
          cols.push({ wch: Math.min(maxLength + 2, 50) });
        });
        worksheet['!cols'] = cols;
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, config.excelSheetName || 'Data');
      
      // Build filename with available variables
      let filename;
      if (config.excelFileName) {
        // Extract variables from data if available
        const variables = {
          apiname: config.apiname || 'export',
          date: new Date().toISOString().split('T')[0]
        };
        
        // Try to get programcode and semester from first data row
        if (rows.length > 0 && rows[0]) {
          if (rows[0].programcode) variables.programcode = rows[0].programcode;
          if (rows[0].semester) variables.semester = rows[0].semester;
          if (rows[0].year) variables.year = rows[0].year;
        }
        
        filename = replaceVariables(config.excelFileName, variables) + '.xlsx';
      } else {
        filename = `${config.apiname || 'report'}_export_${Date.now()}.xlsx`;
      }
      
      XLSX.writeFile(workbook, filename);

      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `📥 Excel file "${filename}" downloaded successfully with ${rows.length} record(s)!` }
      ]);
    } catch (error) {
      console.error('❌ Excel export error:', error);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `❌ Error downloading Excel: ${error.message}` }
      ]);
    }
  };

  const fetchBotResponse = async (userText) => {
    if (userText.toLowerCase().includes('help')) {
      return {
        text: 'You can:\n1. Type an API name to search for configured APIs\n2. Select an API from the results\n3. Provide required parameters\n4. Download the extracted data as Excel\n5. Generate AI reports on extracted data\n6. Configure new APIs using the + button'
      };
    }

    return await searchApis(userText);
  };

  const handleApiSelection = async (button) => {
    if (button.id === 'config_new') {
      navigate('/apiconfig');
      return;
    }

    if (button.id === 'search_again') {
      handleSearchAgain();
      return;
    }

    if (button.id === 'download_excel' || button.id === 'ai_report') {
      return;
    }

    // Execute selected API
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Selected: ${button.label}` }
    ]);

    // Check if API requires user input
    if (button.config.requiresUserInput) {
      showParameterDialog(button.config);
    } else {
      // Execute directly without parameters
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `Executing API "${button.label}"... Please wait.` }
      ]);

      const result = await executeApi(button.config);
      
      const formattedResponse = {
        sender: 'bot',
        text: result.text,
        buttons: result.buttons?.map(btn => ({
          ...btn,
          handler: btn.handler || (() => handleApiSelection(btn))
        }))
      };

      setMessages(prev => [...prev, formattedResponse]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    // Check if waiting for AI query
    if (waitingForAiQuery) {
      await handleGenerateAiReport(userInput);
      return;
    }

    const botResponse = await fetchBotResponse(userInput);
    
    const formattedResponse = {
      sender: 'bot',
      text: botResponse.text,
      buttons: botResponse.buttons?.map(btn => ({
        ...btn,
        handler: btn.handler || (() => handleApiSelection(btn))
      }))
    };

    setMessages(prev => [...prev, formattedResponse]);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">API Data Extractor with AI</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/apiconfig')}
        >
          Configure API
        </Button>
      </Paper>

      {/* Chat Messages */}
      <Paper elevation={3} sx={{ flex: 1, m: 2, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  bgcolor: msg.sender === 'user' ? '#1976d2' : '#e0e0e0',
                  color: msg.sender === 'user' ? 'white' : 'black'
                }}
              >
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                
                {msg.buttons && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {msg.buttons.map((btn, i) => (
                      <Button
                        key={i}
                        variant="contained"
                        size="small"
                        onClick={btn.handler}
                        sx={{
                          bgcolor: msg.sender === 'user' ? 'white' : '#1976d2',
                          color: msg.sender === 'user' ? '#1976d2' : 'white',
                          '&:hover': {
                            bgcolor: msg.sender === 'user' ? '#f0f0f0' : '#1565c0'
                          }
                        }}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              waitingForAiQuery 
                ? "Type your AI query here..." 
                : "Type API name to search..."
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: waitingForAiQuery ? '#fff3e0' : 'white'
              }
            }}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            sx={{
              bgcolor: waitingForAiQuery ? '#ff9800' : '#1976d2'
            }}
          >
            {waitingForAiQuery ? '✨ Ask AI' : 'Send'}
          </Button>
        </Box>
      </Paper>

      {/* Parameter Input Dialog */}
      <Dialog 
        open={paramDialogOpen} 
        onClose={() => setParamDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Enter Parameters for {currentApiConfig?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {renderParameterInputs()}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParamDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleParameterSubmit}
          >
            Execute API
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
