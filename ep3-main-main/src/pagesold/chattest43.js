import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import global1 from '../pages/global1';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { GoogleGenAI, Type } from '@google/genai';

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

  // Fetch API key on component mount
  useEffect(() => {
    fetchGeminiApiKey();
  }, []);

  // Fetch the active Gemini API key from backend
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

  // Scroll to bottom on every message change
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

  // Call Gemini AI from frontend using @google/generative-ai
  const callGeminiAI = async (prompt, data) => {
    if (!geminiApiKey || geminiApiKey.length < 10) {
      throw new Error('Valid Gemini API key not found. Please configure it in settings.');
    }

    var response1='';

    // Combine user prompt with data
      const fullPrompt = `${prompt}\n\nData to analyze:\n${JSON.stringify(data, null, 2)}`;

    try {
         const ai = new GoogleGenAI({apiKey: geminiApiKey});
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
            // recipeName: {
            //   type: Type.STRING,
            // },
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
  //console.log(response.text);

  response1=response.text;

  const parsedData = JSON.parse(response1); // Parse the JSON string
  var topic1='';
parsedData.forEach((module, index) => {
  
  module.ingredients.forEach((topic, i) => {
    topic1=topic1+topic+' ';
    
  });
  
});
return topic1;

    } catch(err) {
        return 'Error ' + err;

    }

    // try {
    //   // Initialize GoogleGenerativeAI with API key
    //   const genAI = new GoogleGenerativeAI(geminiApiKey);
      
    //   // Get the generative model (using gemini-1.5-flash or gemini-pro)
    //   const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    //   // Combine user prompt with data
    //   const fullPrompt = `${prompt}\n\nData to analyze:\n${JSON.stringify(data, null, 2)}`;

    //   // Generate content
    //   const result = await model.generateContent(fullPrompt);
    //   const response = await result.response;
    //   const text = response.text();

    //   return text;
    // } catch (error) {
    //   console.error('Gemini API Error:', error);
    //   throw new Error(`Failed to generate report: ${error.message}`);
    // }
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
      const searchstring=ar1[1];
      const responses = await ep1.get('/api/v2/gettblsearch', {
        params: {
          searchstring: searchstring   
        }
      });

      console.log(responses.data.data.classes);
      // Create button array
const buttons1 = responses.data.data.classes.map(item => ({
  id: item.tbl,
  label: item.title
}));
      


      return {
        text: 'Find below some options',
        buttons: buttons1
      };
      
      //console.log(response.data.data.classes);
      //setRows(responses.data.data.classes);
    //   setFilter1(filter1 + ',' + ar1[1]);
      //return { text: 'Filter added ' + filter1 + ',' + ar1[1] };
    }

      if (userText.toLowerCase().includes('field')) {
        if(!collection) {
             return {
        text: 'Please select model first. Type search - <topic> to find list of models.',
      };

        }
    //   var ar1 = userText.split('-');
    //   const searchstring=ar1[1];
      const responsef = await ep1.get('/api/v2/gettblfieldsearch', {
        params: {
          tbl: collection   
        }
      });

      console.log(responsef.data.data.classes);
      // Create button array
      var ftext='';


responsef.data.data.classes.forEach((item, index) => {
  ftext=ftext + 'Field ' + item.tfield + ' type ' + item.type + '. Example ' + item.example + ' ';
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

    // Main query processing with Gemini AI
    if (userText.toLowerCase().includes('query')) {
      var ar1 = userText.split('-');
      var qtext = ar1[1];

      setOpen(true);

      try {
        // Build filter object
        const filter2 = '{' + filter1 + '}';
        const filter = JSON.parse(filter2);
        const projection = projText.trim() ? JSON.parse(projText) : null;
        const sort = sortText.trim() ? JSON.parse(sortText) : null;

        const body = { collection, filter, projection, sort, limit };

        // Fetch data from your backend
        const response = await fetch('http://localhost:3000/api/v2/getdynamicresult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const data = await response.json();
        const data1 = data.results;

        // Call Gemini AI from frontend
        const aiResponse = await callGeminiAI(qtext, data1);

        setOpen(false);

        return {
          text: aiResponse
        };

      } catch (error) {
        setOpen(false);
        return {
          text: 'Error: ' + error.message
        };
      }
    }

    return {
      text: `Let's come back to work. Try typing 'options' for choices.`
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const botResponse = await fetchBotResponse1(userMessage.text);

    const formattedResponse = {
      sender: 'bot',
      text: botResponse.text,
      buttons: botResponse.buttons?.map(btn => ({
        ...btn,
        handler: () => handleDynamicButtonClick1(btn)
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

  const handleDynamicButtonClick1 = (button) => {
    setCollection(button.id);
    
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Clicked ${button.label}` },
      { sender: 'bot', text: `Model set for ${button.label}!` }
    ]);
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

      <Box display="flex" p={1} borderTop="1px solid #ccc">
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
