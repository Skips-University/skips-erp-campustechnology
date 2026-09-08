import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from "@mui/material";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Add,
  Delete,
  Assignment,
  People,
  School,
  Visibility,
  Link as LinkIcon,
  Description,
  OpenInNew,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

// Draggable Student Component
function DraggableStudent({ student }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      elevation={isDragging ? 8 : 3}
      sx={{
        p: 2,
        m: 1,
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: "white",
        borderRadius: 3,
        minWidth: "280px",
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "grey.50",
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <Avatar
        src={
          student.photo
            ? `${process.env.REACT_APP_API_URL}/uploads/${student.photo}`
            : ""
        }
        alt={student.student}
        sx={{
          width: 45,
          height: 45,
          border: "2px solid",
          borderColor: "primary.light",
        }}
      >
        {student.student?.charAt(0)?.toUpperCase()}
      </Avatar>
      <Box flex={1}>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {student.student}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {student.regno}
        </Typography>
      </Box>
    </Paper>
  );
}

// Droppable Zone for Rooms
function DroppableRoom({ id, children, isEmpty }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: "200px",
        p: 2,
        backgroundColor: isOver
          ? "rgba(76, 175, 80, 0.1)"
          : isEmpty
          ? "rgba(0, 0, 0, 0.02)"
          : "transparent",
        border: isOver
          ? "3px dashed #4caf50"
          : isEmpty
          ? "2px dashed #e0e0e0"
          : "none",
        borderRadius: 3,
        transition: "all 0.3s ease",
        display: "flex",
        flexWrap: "wrap",
        alignContent: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      {isEmpty ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="150px"
          sx={{
            borderRadius: 2,
            backgroundColor: "grey.50",
          }}
        >
          <Typography color="text.secondary" variant="h6">
            🎯 Drop students here
          </Typography>
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}

// Droppable Zone for Enrolled Students
function DroppableEnrolled({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: "200px",
        p: 3,
        backgroundColor: isOver
          ? "rgba(33, 150, 243, 0.1)"
          : "rgba(0, 0, 0, 0.02)",
        border: isOver ? "3px dashed #2196f3" : "2px solid #e3f2fd",
        borderRadius: 3,
        transition: "all 0.3s ease",
        display: "flex",
        flexWrap: "wrap",
        alignContent: "flex-start",
        justifyContent: "flex-start",
        gap: 1,
      }}
    >
      {children.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="150px"
        >
          <Typography color="text.secondary" variant="h6">
            ✅ All students are assigned to rooms
          </Typography>
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}

export default function BreakoutRoomManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const classData = location.state;

  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [breakoutRooms, setBreakoutRooms] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [roomAssignments, setRoomAssignments] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [roomDialog, setRoomDialog] = useState(false);
  const [linkDialog, setLinkDialog] = useState(false);
  const [viewLinksDialog, setViewLinksDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Form states
  const [roomForm, setRoomForm] = useState({
    name: "",
    maxparticipants: 6,
  });
  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    description: "",
    type: "assignment",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  useEffect(() => {
    if (enrolledStudents.length > 0) {
      fetchBreakoutRooms();
    }
  }, [enrolledStudents]);

  const fetchEnrolledStudents = async () => {
    setLoading(true);
    try {
      const params = {
        coursecode: classData.coursecode,
        year: classData.year,
        semester: classData.semester,
        colid: global1.colid,
      };
      const res = await ep1.get("/api/v2/getenrolledstudents", { params });
      setEnrolledStudents(res.data || []);
    } catch (error) {
      setEnrolledStudents([]);
    }
    setLoading(false);
  };

  const fetchBreakoutRooms = async () => {
    try {
      const res = await ep1.get(
        `/api/v2/getallbreakoutrooms?classid=${classData.classId}&colid=${global1.colid}`
      );
      const rooms = res.data || [];

      setBreakoutRooms(rooms);

      const assignments = {};
      rooms.forEach((room) => {
        if (room.assignments && Array.isArray(room.assignments)) {
          assignments[room._id] = room.assignments
            .map((assignment) => {
              const studentData = enrolledStudents.find(
                (s) => s._id === assignment.studentid
              );
              return studentData
                ? {
                    ...studentData,
                    assignmentData: assignment,
                  }
                : null;
            })
            .filter(Boolean);
        } else {
          assignments[room._id] = [];
        }
      });

      setRoomAssignments(assignments);
      updateUnassignedStudents(assignments);
    } catch (error) {
      setBreakoutRooms([]);
      setRoomAssignments({});
    }
  };

  const updateUnassignedStudents = (assignments) => {
    if (!enrolledStudents.length) return;

    const assignedStudentIds = Object.values(assignments)
      .flat()
      .map((student) => student._id);
    const unassigned = enrolledStudents.filter(
      (student) => !assignedStudentIds.includes(student._id)
    );

    setUnassignedStudents(unassigned);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const activeStudent = enrolledStudents.find((s) => s._id === active.id);
    if (!activeStudent) {
      return;
    }

    try {
      if (over.id.startsWith("room-")) {
        const targetRoomId = over.id.replace("room-", "");

        const assignmentData = {
          roomid: targetRoomId,
          studentid: activeStudent._id,
          studentregno: activeStudent.regno,
          studentname: activeStudent.student,
          assignedby: global1.user,
          colid: global1.colid,
        };

        const response = await ep1.post(
          "/api/v2/assignstudenttoroom",
          assignmentData
        );

        if (response.data.success) {
          await fetchBreakoutRooms();
        } else {
          alert("Failed to assign student: " + response.data.message);
        }
      } else if (over.id === "enrolled") {
        const currentRoomId = Object.keys(roomAssignments).find((roomId) =>
          roomAssignments[roomId].some(
            (student) => student._id === activeStudent._id
          )
        );

        if (currentRoomId) {
          const response = await ep1.get(
            `/api/v2/removestudentfromroom?roomid=${currentRoomId}&studentid=${activeStudent._id}&colid=${global1.colid}`
          );

          if (response.data.success) {
            await fetchBreakoutRooms();
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      alert(`Failed to update student assignment: ${errorMessage}`);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const roomData = {
        name: roomForm.name,
        maxparticipants: parseInt(roomForm.maxparticipants) || 6,
        classid: classData.classId,
        user: global1.user,
        colid: parseInt(global1.colid),
        coursecode: classData.coursecode,
        year: classData.year,
        semester: classData.semester,
      };

      await ep1.post("/api/v2/createbreakoutroom", roomData);
      setRoomDialog(false);
      setRoomForm({ name: "", maxparticipants: 6 });
      await fetchBreakoutRooms();
    } catch (error) {
      alert("Error creating breakout room");
    }
  };

  const handleDeleteRoom = async (roomid) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await ep1.get(`/api/v2/deletebreakoutroom?roomid=${roomid}&colid=${global1.colid}`);
        await fetchBreakoutRooms();
      } catch (error) {
        alert("Error deleting room");
      }
    }
  };

  const handleAddLinks = async () => {
    try {
      await ep1.post("/api/v2/addlinktoroom", {
        roomid: selectedRoom._id,
        linkData: linkForm,
        colid: global1.colid,
      });
      setLinkDialog(false);
      setLinkForm({ title: "", url: "", description: "", type: "assignment" });
      await fetchBreakoutRooms();
    } catch (error) {
      alert("Error adding link");
    }
  };

  const handleViewLinks = (room) => {
    setSelectedRoom(room);
    setViewLinksDialog(true);
  };

  const getTotalLinkCount = (room) => {
    const assignmentCount = room.assignmentlinks?.length || 0;
    const documentCount = room.documentLinks?.length || 0;
    return assignmentCount + documentCount;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={4}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box textAlign="center">
          <Typography variant="h3" fontWeight={800} gutterBottom>
            🏫 Breakout Room Management
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            {classData.coursecode} - {classData.topic}
          </Typography>
          <Stack
            direction="row"
            spacing={3}
            justifyContent="center"
            flexWrap="wrap"
          >
            <Chip
              icon={<School />}
              label={`${enrolledStudents.length} Total Students`}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<People />}
              label={`${unassignedStudents.length} Unassigned`}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<Assignment />}
              label={`${breakoutRooms.length} Rooms`}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
          </Stack>
        </Box>
      </Paper>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <Typography variant="h5" color="primary">
            Loading students and rooms...
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Stack spacing={4}>
            {/* ENROLLED STUDENTS SECTION */}
            <Paper elevation={4} sx={{ borderRadius: 4, overflow: "hidden" }}>
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <School sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Enrolled Students Pool
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Drag students from here to assign them to breakout rooms
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={800}>
                  {unassignedStudents.length}
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <DroppableEnrolled id="enrolled">
                  <SortableContext
                    items={unassignedStudents.map((s) => s._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {unassignedStudents.map((student) => (
                      <DraggableStudent key={student._id} student={student} />
                    ))}
                  </SortableContext>
                </DroppableEnrolled>
              </Box>
            </Paper>

            {/* BREAKOUT ROOMS SECTION */}
            <Paper elevation={4} sx={{ borderRadius: 4, overflow: "hidden" }}>
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Assignment sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Breakout Rooms
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Organize students into collaborative groups
                    </Typography>
                  </Box>
                </Box>
                <Button
                  startIcon={<Add />}
                  onClick={() => setRoomDialog(true)}
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 700,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Create Room
                </Button>
              </Box>
              <Box sx={{ p: 2 }}>
                {breakoutRooms.length === 0 ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="200px"
                    sx={{
                      border: "3px dashed #e0e0e0",
                      borderRadius: 3,
                      backgroundColor: "grey.50",
                    }}
                  >
                    <Typography variant="h5" color="text.secondary">
                      🏠 No breakout rooms created yet. Click "Create Room" to
                      get started.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {breakoutRooms.map((room) => {
                      const roomStudents = roomAssignments[room._id] || [];
                      const isEmpty = roomStudents.length === 0;
                      const totalLinks = getTotalLinkCount(room);

                      return (
                        <Paper
                          key={room._id}
                          elevation={3}
                          sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: "success.main",
                              color: "white",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="h6" fontWeight={700}>
                                🏠 {room.name}
                              </Typography>
                              <Chip
                                label={`${roomStudents.length}/${room.maxparticipants} students`}
                                sx={{
                                  backgroundColor: "rgba(255,255,255,0.2)",
                                  color: "white",
                                  fontWeight: 600,
                                }}
                              />
                              {totalLinks > 0 && (
                                <Badge
                                  badgeContent={totalLinks}
                                  color="info"
                                  sx={{
                                    "& .MuiBadge-badge": {
                                      backgroundColor: "info.main",
                                      color: "white",
                                    },
                                  }}
                                >
                                  <LinkIcon sx={{ color: "white" }} />
                                </Badge>
                              )}
                            </Box>
                            <Box display="flex" gap={1}>
                              <IconButton
                                onClick={() => handleViewLinks(room)}
                                sx={{
                                  color: "white",
                                  backgroundColor:
                                    totalLinks > 0
                                      ? "rgba(255,255,255,0.2)"
                                      : "rgba(255,255,255,0.1)",
                                }}
                                title="View Assignment & Document Links"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setLinkDialog(true);
                                }}
                                sx={{ color: "white" }}
                                title="Add Links"
                              >
                                <Assignment />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteRoom(room._id)}
                                sx={{ color: "white" }}
                                title="Delete Room"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>

                          <DroppableRoom
                            id={`room-${room._id}`}
                            isEmpty={isEmpty}
                          >
                            <SortableContext
                              items={roomStudents.map((s) => s._id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {roomStudents.map((student) => (
                                <DraggableStudent
                                  key={student._id}
                                  student={student}
                                />
                              ))}
                            </SortableContext>
                          </DroppableRoom>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Stack>

          <DragOverlay>
            {activeId ? (
              <Paper
                elevation={8}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  backgroundColor: "primary.light",
                  color: "white",
                  borderRadius: 3,
                  minWidth: "280px",
                  transform: "rotate(5deg)",
                }}
              >
                <Avatar
                  src={
                    enrolledStudents.find((s) => s._id === activeId)?.photo
                      ? `${process.env.REACT_APP_API_URL}/uploads/${
                          enrolledStudents.find((s) => s._id === activeId)
                            ?.photo
                        }`
                      : ""
                  }
                  sx={{ width: 45, height: 45 }}
                >
                  {enrolledStudents
                    .find((s) => s._id === activeId)
                    ?.student?.charAt(0)
                    ?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {enrolledStudents.find((s) => s._id === activeId)?.student}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {enrolledStudents.find((s) => s._id === activeId)?.regno}
                  </Typography>
                </Box>
              </Paper>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create Room Dialog */}
      <Dialog
        open={roomDialog}
        onClose={() => setRoomDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            fontWeight: 700,
          }}
        >
          🏠 Create New Breakout Room
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Room Name"
            value={roomForm.name || ""}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Max Participants"
            type="number"
            value={roomForm.maxparticipants || 6}
            onChange={(e) =>
              setRoomForm({
                ...roomForm,
                maxparticipants: parseInt(e.target.value) || 6,
              })
            }
            fullWidth
            margin="normal"
            variant="outlined"
            inputProps={{ min: 1, max: 50 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRoomDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleCreateRoom} variant="contained" size="large">
            Create Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Links Dialog */}
      <Dialog
        open={linkDialog}
        onClose={() => setLinkDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: "secondary.main",
            color: "white",
            fontWeight: 700,
          }}
        >
          📎 Add Assignment/Document Link
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            select
            label="Link Type"
            value={linkForm.type || "assignment"}
            onChange={(e) => setLinkForm({ ...linkForm, type: e.target.value })}
            fullWidth
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="assignment">📝 Assignment</option>
            <option value="document">📄 Document</option>
          </TextField>
          <TextField
            label="Title"
            value={linkForm.title || ""}
            onChange={(e) =>
              setLinkForm({ ...linkForm, title: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="URL"
            value={linkForm.url || ""}
            onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={linkForm.description || ""}
            onChange={(e) =>
              setLinkForm({ ...linkForm, description: e.target.value })
            }
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setLinkDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleAddLinks} variant="contained" size="large">
            Add Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Links Dialog */}
      <Dialog
        open={viewLinksDialog}
        onClose={() => setViewLinksDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: "80vh" },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "info.main",
            color: "white",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Visibility />
          📋 Links for {selectedRoom?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {selectedRoom && (
            <Stack spacing={3}>
              {/* Assignment Links Section */}
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="error.main"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  📝 Assignment Links (
                  {selectedRoom.assignmentlinks?.length || 0})
                </Typography>
                {selectedRoom.assignmentlinks?.length > 0 ? (
                  <List
                    sx={{
                      backgroundColor: "error.lighter",
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    {selectedRoom.assignmentlinks.map((link, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          backgroundColor: "white",
                          borderRadius: 2,
                          mb: 1,
                          border: "1px solid #ffebee",
                        }}
                      >
                        <ListItemIcon>
                          <Assignment color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight={600}>
                                {link.title}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => window.open(link.url, "_blank")}
                                sx={{ color: "error.main" }}
                              >
                                <OpenInNew fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                          secondary={
                            <Stack spacing={1}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {link.description || "No description provided"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                🔗 {link.url}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                📅 Added:{" "}
                                {new Date(link.addedAt).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "grey.50",
                      border: "2px dashed #e0e0e0",
                    }}
                  >
                    <Typography color="text.secondary">
                      📝 No assignment links added yet
                    </Typography>
                  </Paper>
                )}
              </Box>

              <Divider />

              {/* Document Links Section */}
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="info.main"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  📄 Document Links ({selectedRoom.documentLinks?.length || 0})
                </Typography>
                {selectedRoom.documentLinks?.length > 0 ? (
                  <List
                    sx={{
                      backgroundColor: "info.lighter",
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    {selectedRoom.documentLinks.map((link, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          backgroundColor: "white",
                          borderRadius: 2,
                          mb: 1,
                          border: "1px solid #e3f2fd",
                        }}
                      >
                        <ListItemIcon>
                          <Description color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" fontWeight={600}>
                                {link.title}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => window.open(link.url, "_blank")}
                                sx={{ color: "info.main" }}
                              >
                                <OpenInNew fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                          secondary={
                            <Stack spacing={1}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {link.description || "No description provided"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                🔗 {link.url}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                📅 Added:{" "}
                                {new Date(link.addedat).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "grey.50",
                      border: "2px dashed #e0e0e0",
                    }}
                  >
                    <Typography color="text.secondary">
                      📄 No document links added yet
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setViewLinksDialog(false)}
            size="large"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

