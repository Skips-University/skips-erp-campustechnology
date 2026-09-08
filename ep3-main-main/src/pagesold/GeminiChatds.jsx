import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import ep1 from '../api/ep1';
import global1 from './global1';

const GeminiChatds = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const response = await ep1.get('/api/v2/getactiveapikeyds', {
        params: { colid: global1.colid, user: global1.user},
      });
      if (response.data.success) {
        setApiKey(response.data.data.geminiApiKey);
        setApiKeyLoaded(true);
      }
    } catch (err) {
      setError('Failed to load API key. Please check with IT administrator.');
      setApiKeyLoaded(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      return;
    }

    if (!apiKey) {
      setError('API key not configured. Please contact IT administrator.');
      return;
    }

    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      // Add user message to display
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'user',
          text: userMessage,
          timestamp: new Date(),
        },
      ]);

      // Import Gemini SDK dynamically
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Create chat session with conversation history
      const chat = model.startChat({
        history: conversationHistory,
      });

      // Send message
      const response = await chat.sendMessage(userMessage);
      const aiResponse = response.response.text();

      // Add AI response to display
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponse,
          timestamp: new Date(),
        },
      ]);

      // Update conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
        {
          role: 'model',
          parts: [{ text: aiResponse }],
        },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to get response from Gemini');
      console.error('Gemini API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationHistory([]);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!apiKeyLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Gemini AI Chat for IT Team
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ClearIcon />}
          onClick={handleClearChat}
        >
          Clear Chat
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!apiKey && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          API Key not configured. Please ask IT administrator to set it up in API Key Management.
        </Alert>
      )}

      {/* Messages Container */}
      <Paper
        sx={{
          flex: 1,
          overflow: 'auto',
          mb: 2,
          p: 2,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Card sx={{ p: 3, textAlign: 'center', maxWidth: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Welcome to Gemini AI Chat
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ask questions about technology, systems, and IT matters. Your conversation history will be maintained during this session.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: msg.sender === 'user' ? '#2196F3' : '#E3F2FD',
                  color: msg.sender === 'user' ? 'white' : 'black',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </Typography>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                  {msg.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>

      {/* Input Container */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your question here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading || !apiKey}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={loading || !inputMessage.trim() || !apiKey}
          sx={{ alignSelf: 'flex-end' }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default GeminiChatds;
