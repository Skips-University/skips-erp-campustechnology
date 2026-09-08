import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import global1 from './global1';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI, Type, createUserContent, createPartFromUri, } from '@google/genai';
import * as XLSX from 'xlsx';

export default function Chatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const [collection, setCollection] = useState('');
  const [filterText, setFilterText] = useState('{}');
  const [projText, setProjText] = useState('{}');
  const [sortText, setSortText] = useState('{}');
  const [limit, setLimit] = useState(50);
  const [filter1, setFilter1] = useState('"colid":' + global1.colid);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastReportData, setLastReportData] = useState(null);

  const fileInputRef = useRef(null);

  
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    fetchGeminiApiKey();
  }, []);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addconsultany = async (usertext) => {
    var ar1 = usertext.split('-');

    const consultant = ar1[1];
    const title = ar1[2];
    const agency = ar1[3];
    const year = ar1[4].replace("~", "-");
    const revenue = ar1[5];
    const trainees = 'NA';
    const advisor = 'NA';
    const department = ar1[6];
    const role = 'Faculty';
    const contact = ar1[7];
    const duration = ar1[8];
    const doclink = ar1[9];

    const response = await ep1.get('/api/v2/createconsultancybyfac', {
      params: {
        user: global1.user,
        token: global1.token,
        colid: global1.colid,
        name: global1.name,
        consultant,
        title,
        agency,
        year,
        revenue,
        trainees,
        advisor,
        department,
        role,
        contact,
        duration,
        doclink,
        status1: 'Submitted',
        comments: ''
      }
    });

    if (response.data.status === 'success') {
      return 'Consultancy added successfully.';
    } else {
      return 'Error: ' + response.data.message;
    }
  };

  const checkimage = async (prompt) => {
    if (!geminiApiKey || geminiApiKey.length < 10) {
      throw new Error('Valid Gemini API key not found. Please configure it in settings.');
    }

    

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
     
      const myfile = await ai.files.upload({
  // file: path.join(media, "Cajun_instruments.jpg"),
  file: selectedFile,
  config: { mimeType: "image/jpeg" },
});
console.log("Uploaded file:", myfile);

const result = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: createUserContent([
    createPartFromUri(myfile.uri, myfile.mimeType),
    "\n\n",
    // "Can you tell me about the instruments in this photo?",
    prompt,
    
  ]),
});
console.log("result.text=", result.text);
var topic1=result.text;
      return topic1;

    } catch (err) {
      return 'Error ' + err;
    }
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview({ type: 'image', url: e.target.result, name: file.name });
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, just show the file name
        setFilePreview({ type: 'file', name: file.name, size: file.size });
      }
    }
  };

  const callGeminiAI = async (prompt, data) => {
    if (!geminiApiKey || geminiApiKey.length < 10) {
      throw new Error('Valid Gemini API key not found. Please configure it in settings.');
    }

    var response1 = '';
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

      response1 = response.text;
      const parsedData = JSON.parse(response1);
      var topic1 = '';
      parsedData.forEach((module, index) => {
        module.ingredients.forEach((topic, i) => {
          topic1 = topic1 + topic + ' ';
        });
      });
      return topic1;

    } catch (err) {
      return 'Error ' + err;
    }
  };

  const fetchBotResponse1 = async (userText) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (userText.toLowerCase().includes('options')) {
      return {
        text: 'Find below some options',
        buttons: [
          { id: 'opt1', label: 'Projects' },
          { id: 'opt2', label: 'Publications' },
          { id: 'opt3', label: 'Consultancy' }
        ]
      };
    }

    if (userText.toLowerCase().includes('search')) {
      var ar1 = userText.split('-');
      const searchstring = ar1[1];
      const responses = await ep1.get('/api/v2/gettblsearch', {
        params: {
          searchstring: searchstring
        }
      });

      const buttons1 = responses.data.data.classes.map(item => ({
        id: item.tbl,
        label: item.title
      }));

      return {
        text: 'Find below some options',
        buttons: buttons1
      };
    }

    if (userText.toLowerCase().includes('field')) {
      if (!collection) {
        return {
          text: 'Please select model first. Type search - <topic> to find list of models.',
        };
      }

      const responsef = await ep1.get('/api/v2/gettblfieldsearch', {
        params: {
          tbl: collection
        }
      });

      var ftext = '';
      responsef.data.data.classes.forEach((item, index) => {
        ftext = ftext + 'Field ' + item.tfield + ' type ' + item.type + '. Example ' + item.example + ' ';
      });

      return {
        text: 'Add one or more options as per example - ' + ftext,
      };
    }

    if (userText.toLowerCase().includes('help')) {
      return {
        text: 'First set model and filter for search, then write your query in english to get report. To set model, type Model-<model name>. To set filter, type Filter-<filter>. Then write your query in english.'
      };
    }

    if (userText.toLowerCase().includes('collection')) {
      return { text: collection };
    }

    if (userText.toLowerCase().includes('model')) {
      var ar1 = userText.split('-');
      setCollection(ar1[1]);
      return { text: 'Model added ' + ar1[1] + '. Please add filters.' };
    }

    if (userText.toLowerCase().includes('filter')) {
      var ar1 = userText.split('-');
      setFilterText(ar1[1]);
      return { text: 'Filter added ' + ar1[1] };
    }

    if (userText.toLowerCase().includes('condition')) {
      var ar1 = userText.split('-');
      setFilter1(filter1 + ',' + ar1[1]);
      return { text: 'Filter added ' + filter1 + ',' + ar1[1] };
    }

    if (userText.toLowerCase().includes('allcond')) {
      return { text: 'Current filter: ' + filter1 };
    }

    if (userText.toLowerCase().includes('consultancy')) {
      const result = await addconsultany(userText);
      return { text: result };
    }

    if (userText.toLowerCase().includes('query')) {
      var ar1 = userText.split('-');
      var qtext = ar1[1];

      setOpen(true);

      try {
        const filter2 = '{' + filter1 + '}';
        const filter = JSON.parse(filter2);
        const projection = projText.trim() ? JSON.parse(projText) : null;
        const sort = sortText.trim() ? JSON.parse(sortText) : null;

        const body = { collection, filter, projection, sort, limit };

        const response = await fetch('http://localhost:3000/api/v2/getdynamicresult', {
        //const response = await fetch('https://epmain.azurewebsites.net/api/v2/getdynamicresult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const data = await response.json();
        const data1 = data.results;

        setLastReportData(data1);
        const aiResponse = await callGeminiAI(qtext, data1);
        setOpen(false);

        return {
          text: aiResponse,
          buttons: [
            {
              id: 'export_report',
              label: 'Export Report to Excel',
              handler: () => exportReportData()
            }
          ]
        };

      } catch (error) {
        setOpen(false);
        return {
          text: 'Error: ' + error.message
        };
      }
    }

    // DEFAULT RETURN - ADDED THIS
    return {
      text: `Let's come back to work. Try typing 'options' for choices.`
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (selectedFile) {
      const userMessage = {
        sender: 'user',
        text: input || 'Analyze this file',
        file: filePreview
      };
      setOpen(true);
      try {
        const aiResponse = await checkimage(input);
         const botResponse = {
          sender: 'bot',
          text: aiResponse
        };
        setMessages(prev => [...prev, botResponse]);
        clearFile();

      } catch(err) {
        const errorResponse = {
          sender: 'bot',
          text: 'Error analyzing file: ' + err.message
        };
        setMessages(prev => [...prev, errorResponse]);
        clearFile();

      }
      setOpen(false);
    }

    const botResponse = await fetchBotResponse1(userMessage.text);

    const formattedResponse = {
      sender: 'bot',
      text: botResponse.text,
      buttons: botResponse.buttons?.map(btn => ({
        ...btn,
        handler: btn.handler || (() => handleDynamicButtonClick1(btn))
      }))
    };

    setMessages(prev => [...prev, formattedResponse]);
  };

  const handleDynamicButtonClick = (button) => {
    if (button.label === 'Projects') {
      navigate('/dashmprojects');
      return;
    }
    if (button.label === 'Consultancy') {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: `Clicked ${button.label}` },
        { sender: 'bot', text: `To add Consultancy, type data as Consultancy-Consultant-Title-Sponsor-Year-Amount as number-department-contact-duration-link!` },
        { sender: 'bot', text: `Include - as above. Do not include - in text. Type year as 2025~26.` }
      ]);
      return;
    }
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Clicked ${button.label}` },
      { sender: 'bot', text: `You selected ${button.label}!` }
    ]);
  };

  const handleOperationClick = (button) => {
    if (button.id === 'bulk_upload') {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: `Clicked ${button.label}` },
        {
          sender: 'bot',
          text: 'Choose bulk upload operation:',
          buttons: [
            { id: 'bulk_create', label: 'Create Records' },
            { id: 'bulk_update', label: 'Update Records' }
          ].map(btn => ({
            ...btn,
            handler: () => triggerFileUpload(btn.id === 'bulk_create' ? 'create' : 'update')
          }))
        }
      ]);
    } else if (button.id === 'export_data') {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: `Clicked ${button.label}` }
      ]);
      exportModelData();
    } else if (button.id === 'format') {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: `Clicked ${button.label}` }
      ]);
      getformat();  
    } else if (button.id === 'report') {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: `Clicked ${button.label}` },
        { sender: 'bot', text: 'Please type your query as: query-<your question>' }
      ]);
    }
  };

  const triggerFileUpload = (operation) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => handleFileUpload(e, operation);
    input.click();
  };

  const handleDynamicButtonClick1 = (button) => {
    setCollection(button.id);
    global1.collection=button.id;

    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Clicked ${button.label}` },
      {
        sender: 'bot',
        text: `Model set for ${button.label}! Choose an operation:`,
        buttons: [
          { id: 'bulk_upload', label: 'Bulk Upload' },
          { id: 'report', label: 'Generate Report' },
          { id: 'export_data', label: 'Export Data' },
          { id: 'format', label: 'Upload format' }
        ].map(btn => ({
          ...btn,
          handler: () => handleOperationClick(btn)
        }))
      }
    ]);
  };

  const exportReportData = () => {
    if (!lastReportData || lastReportData.length === 0) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'No report data available to export.' }
      ]);
      return;
    }

    exportToExcel(lastReportData, `${collection}_report_${Date.now()}`);
  };

  const exportToExcel = (data, filename) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${filename}.xlsx`);

      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `Excel file "${filename}.xlsx" downloaded successfully!` }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `Error exporting to Excel: ${error.message}` }
      ]);
    }
  };

  const parseLine = (line) => {
// simple split on comma and trim whitespace
// NOTE: This does not support quoted commas. If you need full CSV parsing,
// replace with a proper CSV parser.
return line.split(',').map((c) => c.trim())
}

  const getformat = async () => {
    //alert(collection);
    var collection1=global1.collection;
    if (!collection1) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Please select a model first before exporting.' }
      ]);
      return;
    }

    setOpen(true);
    try {
      // const filter2 = '{' + filter1 + '}';
      // const filter = JSON.parse(filter2);
      // const projection = projText.trim() ? JSON.parse(projText) : null;
      // const sort = sortText.trim() ? JSON.parse(sortText) : null;

      // const body = { collection, filter, projection, sort, limit: 10000 };

      const responses1 = await ep1.get('/api/v2/gettbcolumns', {
        params: {
          tbl: collection1
        }
      });

      var format='';

      responses1.data.data.classes.forEach((item, index) => {
        format=item.fields;
      });

      const headers = parseLine(format);

      // Create a 2D array with header first, then data rows
const aoa = [headers]

// Create worksheet and workbook using SheetJS (xlsx)
const ws = XLSX.utils.aoa_to_sheet(aoa);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

// Write file and trigger download
XLSX.writeFile(wb, 'format.xlsx');



      setOpen(false);
    } catch (error) {
      setOpen(false);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `Error exporting data: ${error.message}` }
      ]);
    }
     setOpen(false);
  };


  const exportModelData = async () => {
    //alert(collection);
    if (!collection) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Please select a model first before exporting.' }
      ]);
      return;
    }

    setOpen(true);
    try {
      const filter2 = '{' + filter1 + '}';
      const filter = JSON.parse(filter2);
      const projection = projText.trim() ? JSON.parse(projText) : null;
      const sort = sortText.trim() ? JSON.parse(sortText) : null;

      const body = { collection, filter, projection, sort, limit: 10000 };

    //   const response = await fetch('http://localhost:3000/api/v2/getdynamicresult', {
    const response = await fetch('https://epmain.azurewebsites.net/api/v2/getdynamicresult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      exportToExcel(data.results, `${collection}_export`);
      setOpen(false);
    } catch (error) {
      setOpen(false);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: `Error exporting data: ${error.message}` }
      ]);
    }
  };

  const handleFileUpload = (event, operation) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: `File uploaded successfully! Found ${jsonData.length} records. Processing ${operation}...` }
        ]);

        await bulkUploadData(jsonData, operation);
      } catch (error) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: `Error reading file: ${error.message}` }
        ]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const bulkUploadData = async (data, operation) => {
    const collection1=global1.collection;
    alert(global1.colid);
  if (!collection1) {
    setMessages(prev => [
      ...prev,
      { sender: 'bot', text: 'Please select a model first.' }
    ]);
    return;
  }
  

  setOpen(true);
  try {
    
    // Add mandatory fields (name, user, colid) to each record
    const enrichedData = data.map(record => ({
      ...record,
      name: record.name || global1.name || 'Unknown', // Use existing name or fallback
      user: global1.user, // Add user from global context
      colid: global1.colid // Add colid from global context
    }));
    console.log(enrichedData);

    const response = await ep1.post('/api/v2/bulkuploadtblds', {
      collection: collection1,
      data: enrichedData
    });

    setOpen(false);

    if (response.data.status === 'Success') {
      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: `Bulk upload completed successfully! ${response.data.message || response.data.insertedCount + ' records inserted'}` 
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: `Bulk upload failed: ${response.data.message}` 
        }
      ]);
    }
  } catch (error) {
    setOpen(false);
    
    let errorMessage = 'Error during bulk upload: ';
    if (error.response?.data?.message) {
      errorMessage += error.response.data.message;
      if (error.response.data.errors) {
        errorMessage += '\n' + error.response.data.errors.join('\n');
      }
    } else {
      errorMessage += error.message;
    }

    setMessages(prev => [
      ...prev,
      { sender: 'bot', text: errorMessage }
    ]);
  }
};


  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      width='100%'
      mx="auto"
      border="1px solid #ccc"
    >
      <Box flexGrow={1} overflow="auto" p={2}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
            mb={1}
          >
            <Paper
              sx={{
                p: 1.5,
                backgroundColor: msg.sender === 'user' ? '#1976d2' : '#e0e0e0',
                color: msg.sender === 'user' ? 'white' : 'black',
                maxWidth: '80%'
              }}
            >
            {msg.file && (
                <Box mb={1}>
                  {msg.file.type === 'image' ? (
                    <img 
                      src={msg.file.url} 
                      alt="uploaded" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        p: 1, 
                        bgcolor: 'rgba(0,0,0,0.1)', 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <AttachFileIcon fontSize="small" />
                      <Typography variant="caption">{msg.file.name}</Typography>
                    </Box>
                  )}
                </Box>
              )}
              <Typography>{msg.text}</Typography>
              {msg.buttons && (
                <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                  {msg.buttons.map((btn, i) => (
                    <Button
                      key={btn.id || i}
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={btn.handler}
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

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

       {filePreview && (
        <Box 
          p={1} 
          borderTop="1px solid #ccc" 
          bgcolor="#f5f5f5"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={1}>
            {filePreview.type === 'image' ? (
              <img 
                src={filePreview.url} 
                alt="preview" 
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
              />
            ) : (
              <AttachFileIcon />
            )}
            <Typography variant="body2">{filePreview.name}</Typography>
          </Box>
          <IconButton size="small" onClick={clearFile}>
            <CloseIcon />
          </IconButton>
        </Box>
      )}



      <Box display="flex" p={1} borderTop="1px solid #ccc">
       <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <IconButton 
          color="primary" 
          onClick={() => fileInputRef.current?.click()}
          sx={{ mr: 1 }}
        >
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <Button variant="contained" sx={{ ml: 1 }} onClick={sendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
}
