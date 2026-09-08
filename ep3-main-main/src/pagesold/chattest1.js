import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me anything.' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Predefined question-answer map
  const qaPairs = {
    hello: 'Hello there! How can I help you?',
    'what is your name': "I'm your friendly chatbot!",
    'how are you': "I'm just code, but I'm doing great!",
    bye: 'Goodbye! Have a great day!',
    well:'What do you want to know ?',
    'wellness':'Wellness is the state of being in good health, especially as an actively pursued goal. It encompasses physical, mental, and social well-being.',
    
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);

    // Simple answer lookup
    const lowerInput = input.toLowerCase();
    const reply = qaPairs[lowerInput] || "Sorry, I don't know that yet!";

    // Add bot response after short delay
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 500);

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <React.Fragment>
    <Box sx={{ width: '100%', margin: '50px auto' }}>
      <Paper sx={{ p: 2, height: 500, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>ChatBot</Typography>
        
        {/* Chat area */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 1 }}>
          <List>
            {messages.map((msg, idx) => (
              <ListItem key={idx} sx={{ justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <ListItemText
                  primary={msg.text}
                  sx={{
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.300',
                    color: msg.sender === 'user' ? 'white' : 'black',
                    borderRadius: 2,
                    p: 1,
                    maxWidth: '70%',
                  }}
                />
              </ListItem>
            ))}
          </List>
          <div ref={messagesEndRef} />
        </Box>

        {/* Input box */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <IconButton color="primary" onClick={handleSend}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
    </React.Fragment>
  );
};

export default ChatBot;
