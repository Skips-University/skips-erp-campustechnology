import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import global1 from '../pages/global1';

// Simulated server API call
const fetchBotResponse = async (userText) => {
    
  await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay

  if (userText.toLowerCase().includes('options')) {
    return {
      text: 'Here are some options',
      buttons: [
        { id: 'opt1', label: 'Projects' },
        { id: 'opt2', label: 'Publications' },
        { id: 'opt3', label: 'Consultancy' },
        { id: 'opt4', label: 'Classes' }
      ]
    };
  }

  return {
    text: `You said: "${userText}". Try typing 'options' for choices.`,
    // buttons: [
    //   { id: 'help', label: 'Help' },
    //   { id: 'start', label: 'Start Over' }
    // ]
  };
};

export default function Chatbot() {
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Scroll to bottom on every message change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addconsultany = async (usertext) => {
         
  var ar1=usertext.split('-');

  //Consultancy-Consultant-Title-Sponsor-Year-Amount as number-department-contact-link
  
  const consultant=ar1[1];
  const title=ar1[2];
  const agency=ar1[3];
  const year=ar1[4].replace("~", "-");
  const revenue=ar1[5];
  const trainees='NA';
  const advisor='NA';
  const department=ar1[6];
  const role='Faculty';
  const contact=ar1[7];
  const duration=ar1[8];
  const doclink=ar1[9];
  
      const response = await ep1.get('/api/v2/createconsultancybyfac', {
          params: {
              user: global1.user,
              token: global1.token,
              colid: global1.colid,
              name: global1.name,
             consultant:consultant,
  title:title,
  agency:agency,
  year:year,
  revenue:revenue,
  trainees:trainees,
  advisor:advisor,
  department:department,
  role:role,
  contact:contact,
  duration:duration,
  doclink:doclink,
  
  status1:'Submitted',
              comments:''
  
          }
      });
      if(response.data.status=='success') {
          return 'Consultancy added successfully.';  
      } else {
          return 'Error : ' + response.data.message;
      }
     
  };

  const fetchBotResponse1 = async (userText) => {

    //alert(userText);
    
  await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay

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

  if (userText.toLowerCase().includes('consultancy')) {

    const a1=addconsultany(userText);

    return {
      text: a1,
    //   buttons: [
    //     { id: 'opt1', label: 'Projects' },
    //     { id: 'opt2', label: 'Publications' },
    //     { id: 'opt3', label: 'Consultancy' },
    //     { id: 'opt4', label: 'Classes' }
    //   ]
    };
  }

//   const apikey='AIzaSyA0f6r8i3D9kR7X6U8z5H9J2L3M4N5O6P';
// const apikey='AIzaSyCn-8JB63WBjgp6TZfMgA-MCKY9hCsVVxA';
  //AIzaSyCn-8JB63WBjgp6TZfMgA-MCKY9hCsVVxA"
  const apikey=global1.geminikey;
  if(!apikey || apikey.length<10) {
    return {
        text: 'Please set a valid Gemini API Key to use this feature.',
      };
  }

        setOpen(true);

        const response123 = await ep1.get('/api/v2/getfeesbyfac', {
                params: {
                  token: global1.token,
                  colid: global1.colid,
                  user: global1.user
                }
              });

              //const parsedData1 = JSON.parse(response123.data.data.classes);
              const data1=response123.data.data.classes;
              console.log(data1);
              var data2='"\nFeecategory,Feeitem,Amount\n';
              data1.map((data12) => (
          data2=data2 + data12.feecategory + ',' + data12.feeeitem + ',' + data12.amount + '\n'
        ))
data2=data2 + '\n"';
              //alert(data2);

  const response = await ep1.get('/api/v2/testgemini1', {
            params: {
               
                // user: user,
                // colid: colid,
                apikey: apikey,
                 //question:'Create a smart and professional reply for ' + userText
                question: 'Check the data and provide a detailed summary on \n\n' + data2
            }
  
        });
        var backend= '';
        if(response.data.status!='Success') {
            setOpen(false);
            return {
                text: 'Error from server : ' + response.data.message,
              };
        }
        console.log(response.data.data.classes);

              setOpen(false);

        const parsedData = JSON.parse(response.data.data.classes); // Parse the JSON string
  var topic1='';
parsedData.forEach((module, index) => {
  //console.log(`\n=== Module ${index + 1} ===`);
  
  module.ingredients.forEach((topic, i) => {
    topic1=topic1+topic+' ';
    //console.log(`${i + 1}. ${topic}`);
  });
  //console.log(`\n=== Module ${index + 1} === ${topic1} in ${coursename}`);
  //console.log('Module ' + topic1);
});

    //     const aiarray=response.data.data.classes.split('\n');
    //     //console.log('Count ' + aiarray.length);
  
  
    //   for(var i=0;i<aiarray.length; i++) {
    //       backend=backend + aiarray[i].toString() + ' ';
    //   }

  return {
    // text: topic1 + `. You said: "${userText}". Try typing 'options' for choices.`,
    text: topic1 + `. However, let's come back to work. Try typing 'options' for choices.`,
    // buttons: [
    //   { id: 'help', label: 'Help' },
    //   { id: 'start', label: 'Start Over' }
    // ]
  };
};

  // Send user message + fetch server response
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    var botResponse = await fetchBotResponse1(userMessage.text);

    // Fetch bot response (text + buttons)
    // if(userMessage.text.includes('Consultancy')) {
    //     botResponse = await fetchBotResponse1(userMessage.text);
    // }
    

    // Attach handlers dynamically
    const formattedResponse = {
      sender: 'bot',
      text: botResponse.text,
      buttons: botResponse.buttons?.map(btn => ({
        ...btn,
        handler: () => handleDynamicButtonClick(btn)
      }))
    };

    setMessages(prev => [...prev, formattedResponse]);
  };

  // Handle button clicks
  const handleDynamicButtonClick = (button) => {
    if(button.label=='Projects') {
        navigate('/dashmprojects');
        return;
    }
    if(button.label=='Consultancy') {
        setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Clicked ${button.label}` },
      { sender: 'bot', text: `To add Consultancy, type data as Consultancy-Consultant-Title-Sponsor-Year-Amount as number-department-contact-duration-link!` },
      { sender: 'bot', text: `Include - as above. Do not inlude - in text. Type year as 2025~26.` }
    ]);
        return;
    }
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `Clicked ${button.label}` },
      { sender: 'bot', text: `You selected ${button.label}!` }
    ]);
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      height="100vh" 
      width= '100%'
      // maxWidth={900} 
      // maxWidth="80%"
      mx="auto" 
      border="1px solid #ccc"
    >
      
      {/* Chat messages */}
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

      {/* Input area */}
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
