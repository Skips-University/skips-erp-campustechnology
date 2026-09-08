import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Alert,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useParams, useNavigate } from "react-router-dom";

const DiscussionPostsPage1ds = () => {
  const [posts, setPosts] = useState([]);
  const [topic, setTopic] = useState({});
  const [newPost, setNewPost] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const messagesEndRef = useRef(null);
  const { topicId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopic();
    fetchPosts();
  }, [topicId]);

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTopic = async () => {
    try {
      const res = await ep1.get("/api/v2/getdiscussiontopics1ds", {
        params: { colid: global1.colid }
      });
      const foundTopic = res.data.data.find(t => t._id === topicId);
      setTopic(foundTopic || {});
    } catch (err) {
      setError("Failed to fetch topic details");
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await ep1.get("/api/v2/getdiscussionposts1ds", {
        params: { 
          colid: global1.colid, 
          topicid: topicId 
        }
      });
      setPosts(res.data.data);
    } catch (err) {
      setError("Failed to fetch posts");
    }
  };

  const handleSendPost = async () => {
    if (!newPost.trim()) return;

    try {
      const payload = {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        topicid: topicId,
        postdescription: newPost,
      };

      await ep1.post("/api/v2/creatediscussionpost1ds", payload);
      setNewPost("");
      fetchPosts();
      setSuccess("Post sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to send post");
    }
  };

  const handleEditPost = async (postId) => {
    if (!editText.trim()) return;

    try {
      const payload = {
        name: global1.name,
        user: global1.user,
        postdescription: editText,
      };

      await ep1.post("/api/v2/updatediscussionpost1ds", payload, {
        params: { id: postId, colid: global1.colid }
      });
      
      setEditingPost(null);
      setEditText("");
      fetchPosts();
      setSuccess("Post updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update post");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await ep1.get("/api/v2/deletediscussionpost1ds", {
          params: { id: postId, colid: global1.colid }
        });
        fetchPosts();
        setSuccess("Post deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Failed to delete post");
      }
    }
  };

  const isMyPost = (post) => post.user === global1.user;

  return (
    <React.Fragment>
      <Container maxWidth="md" sx={{ py: 2, height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: "primary.main", color: "white" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
              <ArrowBackIcon />
            </IconButton>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold">
                {topic.topicname}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {topic.category}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Messages Area */}
        <Box 
          flex={1} 
          sx={{ 
            overflowY: "auto", 
            mb: 2, 
            bgcolor: "#f5f5f5", 
            borderRadius: 2, 
            p: 1 
          }}
        >
          {posts.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="body1" color="text.secondary">
                No posts yet. Start the discussion!
              </Typography>
            </Box>
          ) : (
            posts.map((post) => (
              <Box key={post._id} mb={2}>
                {isMyPost(post) ? (
                  // My posts (right side)
                  <Box display="flex" justifyContent="flex-end">
                    <Card 
                      sx={{ 
                        maxWidth: "70%", 
                        bgcolor: "primary.main", 
                        color: "white",
                        position: "relative"
                      }}
                    >
                      <CardContent sx={{ pb: "16px !important" }}>
                        {editingPost === post._id ? (
                          <Box>
                            <TextField
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              fullWidth
                              multiline
                              rows={2}
                              variant="outlined"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  color: "white",
                                  "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.7)" },
                                  "&.Mui-focused fieldset": { borderColor: "white" },
                                },
                              }}
                            />
                            <Box display="flex" gap={1} mt={1}>
                              <Button 
                                size="small" 
                                onClick={() => handleEditPost(post._id)}
                                sx={{ color: "white", borderColor: "white" }}
                                variant="outlined"
                              >
                                Save
                              </Button>
                              <Button 
                                size="small" 
                                onClick={() => setEditingPost(null)}
                                sx={{ color: "white" }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Typography variant="body1" mb={1}>
                              {post.postdescription}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {new Date(post.createdAt).toLocaleString()}
                              </Typography>
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingPost(post._id);
                                    setEditText(post.postdescription);
                                  }}
                                  sx={{ color: "white", p: 0.5 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeletePost(post._id)}
                                  sx={{ color: "white", p: 0.5, ml: 0.5 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ) : (
                  // Other posts (left side)
                  <Box display="flex" gap={1}>
                    <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Card sx={{ maxWidth: "70%", bgcolor: "white" }}>
                      <CardContent sx={{ pb: "16px !important" }}>
                        <Typography variant="subtitle2" color="primary" fontWeight="bold">
                          {post.name}
                        </Typography>
                        <Typography variant="body1" mb={1}>
                          {post.postdescription}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(post.createdAt).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box display="flex" gap={1} alignItems="flex-end">
            <TextField
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Type your message..."
              fullWidth
              multiline
              maxRows={3}
              variant="outlined"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPost();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendPost}
              disabled={!newPost.trim()}
              sx={{ minWidth: "auto", p: 1.5 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default DiscussionPostsPage1ds;
