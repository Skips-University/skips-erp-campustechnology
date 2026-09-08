
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
  Grid,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Pagination,
  Container,
} from "@mui/material";
import { Add, ArrowBack, Delete, Edit } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const HostelRoomPage = () => {
  const navigate = useNavigate();
  const { buildingname } = useParams();
  const [rooms, setRooms] = useState([]);
  const [allocationsMap, setAllocationsMap] = useState({});
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [studentReg, setStudentReg] = useState("");
  const [studentName, setStudentName] = useState("");
  const [selectedBed, setSelectedBed] = useState(null);
  const [search, setSearch] = useState("");
  const [newRoomForm, setNewRoomForm] = useState({
    roomname: "",
    totalbeds: "",
  });
  const [editRoomForm, setEditRoomForm] = useState({
    id: "",
    roomname: "",
    totalbeds: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await ep1.get(
        `/api/v2/getrooms?buildingname=${buildingname}&page=${page}&limit=${limit}&colid=${global1.colid}`
      );
      setRooms(res.data.data);
      setTotalPages(Math.ceil((res.data.total || 0) / limit));
    } catch (err) {
      showSnackbar("Failed to fetch rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAllocations = async () => {
    try {
      const allRoomAllocations = {};
      for (const room of rooms) {
        const res = await ep1.get(
          `/api/v2/getbedallocations?buildingname=${buildingname}&roomname=${room.roomname}&colid=${global1.colid}`
        );
        allRoomAllocations[room.roomname] = res.data.data;
      }
      setAllocationsMap(allRoomAllocations);
    } catch (err) {
      showSnackbar("Error loading bed allocations", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const searchStudent = async () => {
    if (!studentReg) return;
    try {
      const res = await ep1.get(`/api/v2/searchstudent?regno=${studentReg}`);
      if (res.data && res.data.data) {
        setStudentName(res.data.data.name || studentReg);
      } else {
        setStudentName("");
        showSnackbar("Student not found", "warning");
      }
    } catch (err) {
      showSnackbar("Error searching student", "error");
      setStudentName("");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [buildingname, page]);

  useEffect(() => {
    if (rooms.length > 0) fetchAllAllocations();
  }, [rooms]);

  const handleAllocate = async () => {
    if (!studentReg || !studentName || !selectedRoom || selectedBed == null)
      return;
    try {
      await ep1.post("/api/v2/allocatebed", {
        buildingname,
        roomname: selectedRoom.roomname,
        bednumber: parseInt(selectedBed),
        regno: studentReg,
        student: studentName,
        colid: global1.colid,
      });
      setOpen(false);
      setStudentReg("");
      setStudentName("");
      setSelectedBed(null);
      fetchAllAllocations();
      showSnackbar("Bed allocated successfully");
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Error allocating bed",
        "error"
      );
    }
  };

  const handleDeallocate = async (allocId) => {
    if (!window.confirm("Are you sure you want to deallocate this bed?"))
      return;
    try {
      await ep1.get(`/api/v2/deletebed/${allocId}`);
      fetchAllAllocations();
      showSnackbar("Bed deallocated");
    } catch (err) {
      showSnackbar("Error deallocating bed", "error");
    }
  };

  const handleCreateRoom = async () => {
    try {
      await ep1.post("/api/v2/createroom", {
        buildingname,
        ...newRoomForm,
        totalbeds: parseInt(newRoomForm.totalbeds),
        colid: global1.colid,
      });
      setOpenCreate(false);
      setNewRoomForm({ roomname: "", totalbeds: "" });
      fetchRooms();
      showSnackbar("Room created successfully");
    } catch (err) {
      showSnackbar("Error creating room", "error");
    }
  };

  const handleUpdateRoom = async () => {
    try {
      await ep1.post(`/api/v2/updateroom?id=${editRoomForm.id}`, {
        roomname: editRoomForm.roomname,
        totalbeds: parseInt(editRoomForm.totalbeds),
      });
      setOpenEdit(false);
      fetchRooms();
      showSnackbar("Room updated");
    } catch (err) {
      showSnackbar("Error updating room", "error");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await ep1.get(`/api/v2/deleteroom/${roomId}`);
      fetchRooms();
      showSnackbar("Room deleted");
    } catch (err) {
      showSnackbar("Error deleting room", "error");
    }
  };

  const getAllocation = (roomname, bednumber) => {
    const roomAllocations = allocationsMap[roomname] || [];
    return roomAllocations.find((a) => a.bednumber === bednumber);
  };

  const filteredRooms = rooms.filter((r) =>
    r.roomname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Box p={3} maxWidth="1000px" mx="auto">
          <Box alignSelf="flex-start" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowBack
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/hostelbuldingmanager`)}
          />
          <Typography
            variant="body1"
            sx={{ cursor: "pointer", color: "primary.main" }}
            onClick={() => navigate(`/hostelbuldingmanager`)}
          >
            Back
          </Typography>
        </Box>
      </Box>
          <Typography variant="h4" align="center" gutterBottom>
            Hostel Room Allocation - {buildingname}
          </Typography>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              label="Search Room"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: "60%" }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenCreate(true)}
            >
              Create Room
            </Button>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            filteredRooms.map((room) => {
              const roomAllocations = allocationsMap[room.roomname] || [];
              return (
                <Card key={room._id} sx={{ mb: 4 }}>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography variant="h6">
                        Room: {room.roomname} ({roomAllocations.length}/
                        {room.totalbeds} beds filled)
                      </Typography>
                      <Box>
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setEditRoomForm({
                              id: room._id,
                              roomname: room.roomname,
                              totalbeds: room.totalbeds,
                            });
                            setOpenEdit(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteRoom(room._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    <Grid container spacing={1} justifyContent="center">
                      {[...Array(room.totalbeds)].map((_, i) => {
                        const bedNumber = i + 1;
                        const allocation = getAllocation(
                          room.roomname,
                          bedNumber
                        );
                        return (
                          <Grid item key={i}>
                            <Tooltip
                              title={
                                allocation
                                  ? `${allocation.student} (${allocation.regno})`
                                  : `Click to allocate`
                              }
                            >
                              <Box
                                width={100}
                                height={70}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                bgcolor={allocation ? "green" : "grey.300"}
                                color={allocation ? "white" : "black"}
                                onClick={() => {
                                  if (allocation) {
                                    handleDeallocate(allocation._id);
                                  } else {
                                    setSelectedRoom(room);
                                    setSelectedBed(bedNumber);
                                    setOpen(true);
                                  }
                                }}
                                sx={{
                                  borderRadius: 2,
                                  cursor: "pointer",
                                  p: 1,
                                }}
                              >
                                <Typography variant="body2">
                                  Bed {bedNumber}
                                </Typography>
                                {allocation && (
                                  <Typography
                                    variant="caption"
                                    textAlign="center"
                                  >
                                    {allocation.student}
                                  </Typography>
                                )}
                              </Box>
                            </Tooltip>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              );
            })
          )}

          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </Box>

          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Allocate Bed #{selectedBed}</DialogTitle>
            <DialogContent>
              <TextField
                label="Student Reg. No"
                fullWidth
                sx={{ mt: 2 }}
                value={studentReg}
                onChange={(e) => setStudentReg(e.target.value)}
                onBlur={searchStudent}
              />
              {studentName && (
                <Typography sx={{ mt: 1 }} color="green">
                  Student: {studentName}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAllocate}
                variant="contained"
                disabled={!studentReg || !studentName}
              >
                Allocate
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
            <DialogTitle>Create Room</DialogTitle>
            <DialogContent>
              <TextField
                label="Room Name"
                value={newRoomForm.roomname}
                onChange={(e) =>
                  setNewRoomForm({ ...newRoomForm, roomname: e.target.value })
                }
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Total Beds"
                type="number"
                value={newRoomForm.totalbeds}
                onChange={(e) =>
                  setNewRoomForm({ ...newRoomForm, totalbeds: e.target.value })
                }
                fullWidth
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
              <Button onClick={handleCreateRoom} variant="contained">
                Create
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogContent>
              <TextField
                label="Room Name"
                value={editRoomForm.roomname}
                onChange={(e) =>
                  setEditRoomForm({ ...editRoomForm, roomname: e.target.value })
                }
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Total Beds"
                type="number"
                value={editRoomForm.totalbeds}
                onChange={(e) =>
                  setEditRoomForm({
                    ...editRoomForm,
                    totalbeds: e.target.value,
                  })
                }
                fullWidth
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
              <Button onClick={handleUpdateRoom} variant="contained">
                Update
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default HostelRoomPage;
