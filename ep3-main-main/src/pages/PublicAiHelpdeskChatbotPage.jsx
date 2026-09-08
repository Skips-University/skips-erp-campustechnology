import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import ep1 from "../api/ep1";

const bubbleSx = (role) => ({
  p: 1.5,
  borderRadius: 2,
  maxWidth: "82%",
  bgcolor: role === "user" ? "#0f766e" : "#f1f5f9",
  color: role === "user" ? "#fff" : "#0f172a",
  alignSelf: role === "user" ? "flex-end" : "flex-start",
  whiteSpace: "pre-line",
  boxShadow: "0 8px 22px rgba(15,23,42,0.08)"
});

export default function PublicAiHelpdeskChatbotPage() {
  const [params] = useSearchParams();
  const colid = params.get("colid") || "";
  const type = params.get("type") || "";
  const level = params.get("level") || "";
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello. I am the AI Helpdesk. Ask me anything about this programme or service. If you want a counselor to contact you, share your name, email, phone and course interest."
    }
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatBodyRef = useRef(null);

  const contextLabel = useMemo(() => [type, level].filter(Boolean).join(" / "), [type, level]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!question.trim()) return;
    const userMessage = { role: "user", content: question.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuestion("");
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/knowledgebase-chat", {
        colid,
        type,
        level,
        question: userMessage.content,
        history: nextMessages
      });
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: res.data?.answer || "I could not find an answer."
        }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to get helpdesk answer");
      setMessages(nextMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef6f3", py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 24px 70px rgba(15,23,42,0.16)" }}>
          <Box sx={{ p: 3, bgcolor: "#0f766e", color: "#fff" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "#fff", color: "#0f766e" }}><SmartToyIcon /></Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={900}>AI Helpdesk</Typography>
                <Typography variant="body2" sx={{ opacity: 0.88 }}>Ask questions and get help instantly.</Typography>
              </Box>
              {contextLabel && <Chip label={contextLabel} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }} />}
            </Stack>
          </Box>

          {!colid && <Alert severity="error">This chatbot link is missing colid.</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          <Stack ref={chatBodyRef} sx={{ p: 2.5, height: { xs: 520, md: 600 }, overflowY: "auto", bgcolor: "#f8fafc" }} spacing={1.5}>
            {messages.map((msg, index) => (
              <Box key={`${msg.role}-${index}`} sx={bubbleSx(msg.role)}>
                <Typography variant="body2">{msg.content}</Typography>
              </Box>
            ))}
            {loading && (
              <Box sx={bubbleSx("assistant")}>
                <Typography variant="body2">Thinking...</Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ p: 2, borderTop: "1px solid #dbe4ef", bgcolor: "#fff" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button variant="contained" endIcon={<SendIcon />} sx={{ px: 4, bgcolor: "#0f766e" }} disabled={loading || !question.trim() || !colid} onClick={sendMessage}>
                Send
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
