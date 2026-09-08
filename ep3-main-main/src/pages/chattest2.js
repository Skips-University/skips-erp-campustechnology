import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

// Simulated server API call
const fetchBotResponse = async (userText) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay

  if (userText.toLowerCase().includes('options')) {
    return {
      text: 'Here are some options from the server:',
      buttons: [
        { id: 'opt1', label: 'Dynamic Option 1' },
        { id: 'opt2', label: 'Dynamic Option 2' },
        { id: 'opt3', label: 'Dynamic Option 3' }
      ]
    };
  }

  return {
    text: `You said: "${userText}". Try typing 'options' for choices.`,
    buttons: [
      { id: 'help', label: 'Help' },
      { id: 'start', label: 'Start Over' }
    ]
  };
};

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Scroll to bottom on every message change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send user message + fetch server response
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Fetch bot response (text + buttons)
    const botResponse = await fetchBotResponse(userMessage.text);

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
