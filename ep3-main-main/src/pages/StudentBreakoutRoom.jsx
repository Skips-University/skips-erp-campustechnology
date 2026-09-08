import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Button,
  Grid,
  Avatar,
  ListItemAvatar,
  Paper,
  IconButton,
  Stack,
  Badge,
  Alert,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  Assignment,
  Description,
  Group,
  ExitToApp,
  Person,
  OpenInNew,
  Refresh,
  Home,
  Schedule,
  School,
  Info,
  CheckCircle,
  Download,
  Share,
  Videocam,
  VideocamOff,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function StudentBreakoutRoom() {
  const { roomid } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = React.useRef(null);

  useEffect(() => {
    fetchRoomData();
    
    // Auto-refresh every 30 seconds to get updates
    const interval = setInterval(() => {
      fetchRoomData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [roomid]);

  useEffect(() => () => {
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  }, [cameraStream]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const toggleCamera = async () => {
    setCameraError("");
    if (cameraOn) {
      if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraOn(false);
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera is not supported in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setCameraOn(true);
    } catch (err) {
      setCameraError("Unable to start camera. Please allow camera permission.");
    }
  };

  const fetchRoomData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const res = await ep1.get(
        `/api/v2/getstudentbreakoutroom?roomid=${roomid}&studentUser=${global1.user}&colid=${global1.colid}`
      );
      setRoomData(res.data.room);
      setClassmates(res.data.classmates);
    } catch (error) {
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRoomData(true);
  };

  const handleGoHome = () => {
    navigate('/studentclassview');
  };

  const currentStudent = classmates.find(mate => mate.studentregno === global1.regno);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        flexDirection="column"
        gap={2}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        />
        <Typography variant="h6" color="primary">Loading your breakout room...</Typography>
      </Box>
    );
  }

  if (!roomData) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={4}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
          }}
        >
          <Typography variant="h4" color="text.secondary" gutterBottom>
            🔍 Room Not Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You're not assigned to any breakout room or the room doesn't exist.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
            sx={{ borderRadius: 3 }}
          >
            Back to Classes
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Paper
        elevation={6}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <Box position="relative" zIndex={1}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                🏠 {roomData.name}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  icon={<School />}
                  label={`${roomData.coursecode} - ${roomData.year}`}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<Person />}
                  label={`${classmates.length} Members`}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<Assignment />}
                  label={`${(roomData.assignmentlinks?.length || 0) + (roomData.documentLinks?.length || 0)} Resources`}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: "center", md: "flex-end" }}>
                <Button
                  startIcon={cameraOn ? <VideocamOff /> : <Videocam />}
                  onClick={toggleCamera}
                  variant="contained"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    borderRadius: 3,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
                  }}
                >
                  {cameraOn ? "Camera Off" : "Camera On"}
                </Button>
                <Tooltip title="Refresh Room Data">
                  <IconButton
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
                    }}
                  >
                    <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                  </IconButton>
                </Tooltip>
                <Button
                  startIcon={<Home />}
                  onClick={handleGoHome}
                  variant="contained"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    borderRadius: 3,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" }
                  }}
                >
                  Back to Classes
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Welcome Alert */}
      {currentStudent && (
        <Alert
          icon={<CheckCircle />}
          severity="success"
          sx={{ mb: 3, borderRadius: 3 }}
        >
          Welcome to your breakout room, {currentStudent.studentname}! 
          Collaborate with your teammates and access shared resources below.
        </Alert>
      )}
      {cameraError && <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>{cameraError}</Alert>}

      <Grid container spacing={4}>
        {/* Enhanced Room Members */}
        <Grid item xs={12} lg={4}>
          <Card 
            elevation={6} 
            sx={{ 
              borderRadius: 4, 
              height: 'fit-content',
              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{
                  p: 3,
                  background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                  color: "white",
                  borderRadius: "16px 16px 0 0"
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Badge badgeContent={classmates.length} color="error" max={99}>
                    <Group sx={{ fontSize: 32 }} />
                  </Badge>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Team Members
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Your collaborative partners
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <List sx={{ pt: 0 }}>
                  {classmates.map((classmate, index) => {
                    const isCurrentUser = classmate.studentregno === global1.regno;
                    
                    return (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          borderRadius: 3,
                          mb: 1,
                          backgroundColor: isCurrentUser ? 'rgba(33, 150, 243, 0.1)' : 'white',
                          border: isCurrentUser ? '2px solid #2196f3' : '1px solid #e0e0e0',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                          },
                          alignItems: "flex-start"
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 80, pt: 0.5 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              isCurrentUser ? (
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: '#4caf50',
                                    border: '2px solid white'
                                  }}
                                />
                              ) : null
                            }
                          >
                            <Stack alignItems="center" spacing={0.75}>
                              {isCurrentUser && cameraOn && cameraStream && (
                                <Box
                                  component="video"
                                  ref={videoRef}
                                  autoPlay
                                  muted
                                  playsInline
                                  sx={{
                                    width: 96,
                                    height: 64,
                                    objectFit: "cover",
                                    borderRadius: 2,
                                    border: "2px solid #2196f3",
                                    boxShadow: "0 8px 18px rgba(15,23,42,0.18)",
                                    backgroundColor: "#0f172a"
                                  }}
                                />
                              )}
                              <Avatar
                                src={
                                  classmate.studentphoto
                                    ? `${process.env.REACT_APP_API_URL}/uploads/${classmate.studentphoto}`
                                    : ""
                                }
                                alt={classmate.studentname}
                                sx={{ 
                                  width: 64, 
                                  height: 64,
                                  fontSize: 26,
                                  border: isCurrentUser ? '3px solid #2196f3' : '2px solid #e0e0e0'
                                }}
                              >
                                {classmate.studentname?.charAt(0)?.toUpperCase()}
                              </Avatar>
                            </Stack>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={isCurrentUser ? 700 : 500}>
                              {classmate.studentname}
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                📋 {classmate.studentregno}
                              </Typography>
                              {classmate.studentemail && (
                                <Typography variant="caption" color="text.secondary">
                                  📧 {classmate.studentemail}
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                        {isCurrentUser && (
                          <Chip 
                            label="You" 
                            size="small" 
                            color="primary" 
                            sx={{ 
                              fontWeight: 600,
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { opacity: 1 },
                                '50%': { opacity: 0.7 },
                                '100%': { opacity: 1 }
                              }
                            }} 
                          />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Resources Section */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* Enhanced Assignments */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={6} 
                sx={{ 
                  borderRadius: 4, 
                  height: '100%',
                  background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)"
                }}
              >
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      p: 3,
                      background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                      color: "white",
                      borderRadius: "16px 16px 0 0"
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Badge 
                        badgeContent={roomData.assignmentlinks?.length || 0} 
                        color="secondary" 
                        max={99}
                      >
                        <Assignment sx={{ fontSize: 32 }} />
                      </Badge>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>
                          Assignments
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Tasks and submissions
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ p: 2, flexGrow: 1 }}>
                    {roomData.assignmentlinks?.length > 0 ? (
                      <List sx={{ pt: 0 }}>
                        {roomData.assignmentlinks.map((assignment, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              borderRadius: 3,
                              mb: 1,
                              backgroundColor: 'white',
                              border: '1px solid #ffcdd2',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4,
                                borderColor: '#f44336'
                              }
                            }}
                          >
                            <ListItemIcon>
                              <Assignment color="error" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={600} color="error.main">
                                  {assignment.title}
                                </Typography>
                              }
                              secondary={
                                <Stack spacing={1} sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {assignment.description || "No description available"}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    📅 Added: {new Date(assignment.addedAt).toLocaleDateString()}
                                  </Typography>
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      href={assignment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      size="small"
                                      variant="contained"
                                      color="error"
                                      startIcon={<OpenInNew />}
                                      sx={{ borderRadius: 2 }}
                                    >
                                      Open
                                    </Button>
                                    {/* <IconButton
                                      size="small"
                                      onClick={() => navigator.share && navigator.share({
                                        title: assignment.title,
                                        url: assignment.url
                                      })}
                                      sx={{ color: 'error.main' }}
                                    >
                                      <Share fontSize="small" />
                                    </IconButton> */}
                                  </Stack>
                                </Stack>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Paper
                        sx={{
                          p: 4,
                          textAlign: "center",
                          backgroundColor: 'rgba(244, 67, 54, 0.05)',
                          border: '2px dashed #f44336',
                          borderRadius: 3
                        }}
                      >
                        <Assignment sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                        <Typography variant="h6" color="error.main" gutterBottom>
                          No Assignments Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your instructor hasn't added any assignments to this room yet.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Enhanced Documents */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={6} 
                sx={{ 
                  borderRadius: 4, 
                  height: '100%',
                  background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
                }}
              >
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      p: 3,
                      background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                      color: "white",
                      borderRadius: "16px 16px 0 0"
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Badge 
                        badgeContent={roomData.documentLinks?.length || 0} 
                        color="secondary" 
                        max={99}
                      >
                        <Description sx={{ fontSize: 32 }} />
                      </Badge>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>
                          Documents
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Resources and materials
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ p: 2, flexGrow: 1 }}>
                    {roomData.documentLinks?.length > 0 ? (
                      <List sx={{ pt: 0 }}>
                        {roomData.documentLinks.map((document, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              borderRadius: 3,
                              mb: 1,
                              backgroundColor: 'white',
                              border: '1px solid #bbdefb',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4,
                                borderColor: '#2196f3'
                              }
                            }}
                          >
                            <ListItemIcon>
                              <Description color="info" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={600} color="info.main">
                                  {document.title}
                                </Typography>
                              }
                              secondary={
                                <Stack spacing={1} sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {document.description || "No description available"}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    📅 Added: {new Date(document.addedat).toLocaleDateString()}
                                  </Typography>
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      href={document.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      size="small"
                                      variant="contained"
                                      color="info"
                                      startIcon={<OpenInNew />}
                                      sx={{ borderRadius: 2 }}
                                    >
                                      View
                                    </Button>
                                    <IconButton
                                      size="small"
                                      onClick={() => navigator.share && navigator.share({
                                        title: document.title,
                                        url: document.url
                                      })}
                                      sx={{ color: 'info.main' }}
                                    >
                                      <Share fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </Stack>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Paper
                        sx={{
                          p: 4,
                          textAlign: "center",
                          backgroundColor: 'rgba(33, 150, 243, 0.05)',
                          border: '2px dashed #2196f3',
                          borderRadius: 3
                        }}
                      >
                        <Description sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                        <Typography variant="h6" color="info.main" gutterBottom>
                          No Documents Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your instructor hasn't shared any documents with this room yet.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Quick Stats Footer */}
      <Paper
        elevation={4}
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
        }}
      >
        <Grid container spacing={3} textAlign="center">
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {classmates.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team Members
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {roomData.assignmentlinks?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assignments
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {roomData.documentLinks?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Documents
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Floating Refresh Button */}
      <Tooltip title="Refresh Room Data">
        <Fab
          color="primary"
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            animation: refreshing ? 'pulse 1s infinite' : 'none'
          }}
        >
          <Refresh />
        </Fab>
      </Tooltip>
    </Container>
  );
}
