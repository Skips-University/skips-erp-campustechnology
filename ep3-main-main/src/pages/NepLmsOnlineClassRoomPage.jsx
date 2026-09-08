import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import {
  CallEnd,
  Fullscreen,
  Logout,
  Mic,
  MicOff,
  ScreenShare,
  StopScreenShare,
  Videocam,
  VideocamOff
} from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const emptyPermissions = { audio: false, camera: false, screen: false };
const validColid = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : "";
};

const socketBaseUrl = () => {
  const base = ep1.defaults?.baseURL || window.location.origin;
  try {
    return new URL(base, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

function VideoTile({ label, stream, muted, active, emptyText = "No media shared", children }) {
  const videoRef = useRef(null);
  const tileRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);
  const openFullscreen = () => {
    const target = tileRef.current;
    if (!target) return;
    if (target.requestFullscreen) target.requestFullscreen();
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
    else if (target.msRequestFullscreen) target.msRequestFullscreen();
  };
  return (
    <Paper
      ref={tileRef}
      className="online-class-video-tile"
      sx={{
        p: 1.25,
        bgcolor: "#0f172a",
        color: "#fff",
        borderRadius: 2,
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&:fullscreen": {
          p: 2,
          bgcolor: "#020617",
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
          borderRadius: 0
        },
        "&:fullscreen .online-class-video-stage": {
          flex: 1,
          height: "calc(100vh - 56px)",
          maxHeight: "none",
          aspectRatio: "auto"
        }
      }}
    >
      <Box
        className="online-class-video-stage"
        sx={{
          position: "relative",
          bgcolor: "#020617",
          borderRadius: 1.5,
          overflow: "hidden",
          aspectRatio: "16/9",
          width: "100%",
          maxHeight: { xs: 300, md: 420 },
          border: "1px solid rgba(148,163,184,0.28)"
        }}
      >
        {stream ? (
          <Box component="video" ref={videoRef} autoPlay playsInline muted={muted} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", color: "grey.400" }}>
            <Typography fontWeight={900}>{active ? emptyText : "No media"}</Typography>
          </Stack>
        )}
        <Chip label={label} size="small" sx={{ position: "absolute", left: 8, bottom: 8, bgcolor: "rgba(15,23,42,0.82)", color: "#fff" }} />
        <Button
          size="small"
          variant="contained"
          startIcon={<Fullscreen />}
          onClick={openFullscreen}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            minWidth: 0,
            bgcolor: "rgba(15,23,42,0.82)",
            "&:hover": { bgcolor: "rgba(15,23,42,0.95)" }
          }}
        >
          Full
        </Button>
      </Box>
      {children && <Box sx={{ mt: 1 }}>{children}</Box>}
    </Paper>
  );
}

export default function NepLmsOnlineClassRoomPage() {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classid") || searchParams.get("id") || "";
  const roleParam = searchParams.get("role") || "";
  const pageRole = String(global1.role || roleParam || "").trim();
  if (!global1.role && roleParam) {
    global1.role = String(roleParam).toLowerCase() === "student" ? "Student" : "Faculty";
  }
  const isFaculty = String(roleParam || pageRole || "").toLowerCase().includes("faculty");
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const classroomRef = useRef(null);
  const peersRef = useRef({});
  const remoteStreamsRef = useRef({});
  const [classRow, setClassRow] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [permissions, setPermissions] = useState(isFaculty ? { audio: true, camera: true, screen: true } : emptyPermissions);
  const [permissionRequests, setPermissionRequests] = useState([]);
  const [socketId, setSocketId] = useState("");
  const [audioOn, setAudioOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [socketStatus, setSocketStatus] = useState("Connecting");
  const [joinRows, setJoinRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isRoomFullscreen, setIsRoomFullscreen] = useState(false);

  const roomTitle = useMemo(() => {
    if (!classRow) return "Online Class";
    return `${classRow.coursecode || ""} ${classRow.course || ""} | ${classRow.classdate || ""} ${classRow.classtime || ""}`;
  }, [classRow]);

  const loadClass = async () => {
    if (!classId) return;
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/neplms/timetable", { params: { classid: classId } });
      const row = (res.data?.data || []).find((item) => String(item._id) === String(classId));
      setClassRow(row || null);
      if (!row) setError("Class was not found in timetable");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load class");
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineJoins = async () => {
    const colid = validColid(global1.colid) || validColid(classRow?.colid);
    if (!classId || !colid) return;
    const res = await ep1.get("/api/v2/neplms/attendance/online-class-joins", { params: { colid, classid: classId } });
    setJoinRows(res.data?.data || []);
  };

  const setOnlineStatus = async (status) => {
    if (!classRow?._id) return;
    const colid = validColid(global1.colid) || validColid(classRow.colid);
    const patch = {
      ...classRow,
      id: classRow._id,
      user: global1.user,
      onlineenabled: "Yes",
      onlineclassstatus: status,
      onlineclasslink: `/neplmsonlineclass?classid=${classRow._id}`,
      ...(status === "Live" ? { onlineclassstartedat: new Date().toISOString() } : {}),
      ...(status === "Ended" ? { onlineclassendedat: new Date().toISOString() } : {})
    };
    if (colid) patch.colid = colid;
    await ep1.post("/api/v2/neplms/timetable/update", patch);
    setClassRow((prev) => ({ ...prev, ...patch }));
    setMessage(status === "Live" ? "Online class started" : "Online class ended");
  };

  const ensureLocalStream = async ({ audio = audioOn, video = cameraOn } = {}) => {
    if (!audio && !video) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    setAudioOn(stream.getAudioTracks().some((track) => track.enabled));
    setCameraOn(stream.getVideoTracks().some((track) => track.enabled));
    for (const track of stream.getTracks()) await publishTrackToPeers(track, stream);
    return stream;
  };

  const createPeer = (targetSocketId, initiator = false) => {
    if (peersRef.current[targetSocketId]) return peersRef.current[targetSocketId];
    const pc = new RTCPeerConnection(rtcConfig);
    peersRef.current[targetSocketId] = pc;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("online-class-signal", { to: targetSocketId, signal: { candidate: event.candidate } });
      }
    };
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamsRef.current[targetSocketId] = stream;
      setRemoteStreams({ ...remoteStreamsRef.current });
    };
    if (initiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer).then(() => offer))
        .then((offer) => socketRef.current?.emit("online-class-signal", { to: targetSocketId, signal: { description: offer } }))
        .catch((err) => setError(err.message));
    }
    return pc;
  };

  const waitForStableConnection = (pc) => new Promise((resolve) => {
    if (pc.signalingState === "stable") {
      resolve();
      return;
    }
    const handleChange = () => {
      if (pc.signalingState === "stable") {
        pc.removeEventListener("signalingstatechange", handleChange);
        resolve();
      }
    };
    pc.addEventListener("signalingstatechange", handleChange);
    setTimeout(() => {
      pc.removeEventListener("signalingstatechange", handleChange);
      resolve();
    }, 2500);
  });

  const renegotiatePeer = async (targetSocketId, pc) => {
    await waitForStableConnection(pc);
    if (pc.signalingState !== "stable") return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit("online-class-signal", { to: targetSocketId, signal: { description: offer } });
  };

  const publishTrackToPeers = async (track, stream) => {
    await Promise.all(Object.entries(peersRef.current).map(async ([targetSocketId, pc]) => {
      try {
        const sender = pc.getSenders().find((item) => item.track?.kind === track.kind);
        if (sender) await sender.replaceTrack(track);
        else pc.addTrack(track, stream);
        await renegotiatePeer(targetSocketId, pc);
      } catch (err) {
        setError(`Unable to publish media to participant: ${err.message}`);
      }
    }));
  };

  useEffect(() => {
    loadClass();
  }, [classId]);

  useEffect(() => {
    const syncFullscreen = () => {
      const activeFullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      setIsRoomFullscreen(activeFullscreenElement === classroomRef.current);
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  useEffect(() => {
    if (!classId) return undefined;
    const socket = io(socketBaseUrl(), { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      setSocketStatus("Connected");
      socket.emit("online-class-join", {
        roomId: classId,
        name: global1.name || global1.user,
        email: global1.user,
        regno: global1.regno,
        colid: global1.colid,
        role: isFaculty ? "faculty" : "student"
      }, (ack = {}) => {
        if (ack.success === false) {
          setError(ack.message || "Unable to join online class room");
          return;
        }
        setSocketId(ack.socketId || socket.id);
        setPermissions(ack.permissions || (isFaculty ? { audio: true, camera: true, screen: true } : emptyPermissions));
        if (!isFaculty && ack.attendanceMarked) setMessage("Attendance marked for this online class");
        loadOnlineJoins();
        (ack.participants || []).forEach((participant) => createPeer(participant.socketId, isFaculty));
      });
    });
    socket.on("connect_error", (err) => {
      setSocketStatus("Disconnected");
      setError(`Unable to connect online class server: ${err.message}`);
    });
    socket.on("disconnect", () => setSocketStatus("Disconnected"));
    socket.on("online-class-participants", (nextParticipants) => {
      setParticipants(nextParticipants);
      loadOnlineJoins();
    });
    socket.on("online-class-user-joined", ({ socketId: nextSocketId }) => createPeer(nextSocketId, isFaculty));
    socket.on("online-class-user-left", ({ socketId: leftSocketId }) => {
      peersRef.current[leftSocketId]?.close();
      delete peersRef.current[leftSocketId];
      delete remoteStreamsRef.current[leftSocketId];
      setRemoteStreams({ ...remoteStreamsRef.current });
    });
    socket.on("online-class-signal", async ({ from, signal }) => {
      try {
        const pc = createPeer(from, false);
        if (signal.description) {
          const description = new RTCSessionDescription(signal.description);
          if (description.type === "offer" && pc.signalingState !== "stable") {
            await Promise.all([
              pc.setLocalDescription({ type: "rollback" }),
              pc.setRemoteDescription(description)
            ]);
          } else {
            await pc.setRemoteDescription(description);
          }
          if (description.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("online-class-signal", { to: from, signal: { description: answer } });
          }
        }
        if (signal.candidate) await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      } catch (err) {
        setError(`Online class connection error: ${err.message}`);
      }
    });
    socket.on("online-class-permission-request", (request) => {
      setPermissionRequests((prev) => [...prev.filter((item) => item.from !== request.from), request]);
    });
    socket.on("online-class-permission-grant", ({ permissions: next }) => {
      setPermissions(next || emptyPermissions);
      setMessage("Faculty granted media permission");
    });
    socket.on("online-class-mute", ({ audio, camera, screen }) => {
      if (audio) {
        localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = false; });
        setAudioOn(false);
      }
      if (camera) {
        localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = false; });
        setCameraOn(false);
      }
      if (screen) stopScreenShare();
      setMessage("Faculty muted your media");
    });
    return () => {
      socket.disconnect();
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [classId, isFaculty]);

  useEffect(() => {
    loadOnlineJoins();
    const timer = setInterval(loadOnlineJoins, 15000);
    return () => clearInterval(timer);
  }, [classId, classRow?.colid]);

  const toggleAudio = async () => {
    if (!permissions.audio) return setError("Ask faculty for audio permission first");
    try {
      const stream = !localStreamRef.current?.getAudioTracks().length
        ? await ensureLocalStream({ audio: true, video: cameraOn })
        : localStreamRef.current;
      stream.getAudioTracks().forEach((track) => { track.enabled = !audioOn; });
      setAudioOn(!audioOn);
    } catch (err) {
      setError(`Unable to start audio: ${err.message}`);
    }
  };

  const toggleCamera = async () => {
    if (!permissions.camera) return setError("Ask faculty for camera permission first");
    try {
      const stream = !localStreamRef.current?.getVideoTracks().length
        ? await ensureLocalStream({ audio: audioOn, video: true })
        : localStreamRef.current;
      stream.getVideoTracks().forEach((track) => { track.enabled = !cameraOn; });
      setCameraOn(!cameraOn);
    } catch (err) {
      setError(`Unable to start camera: ${err.message}`);
    }
  };

  const startScreenShare = async () => {
    if (!permissions.screen) return setError("Ask faculty for screen-share permission first");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;
      const [screenTrack] = stream.getVideoTracks();
      await publishTrackToPeers(screenTrack, stream);
      setScreenOn(true);
      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      setError(`Unable to share screen: ${err.message}`);
    }
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    setScreenOn(false);
  };

  const requestPermission = (request) => {
    socketRef.current?.emit("online-class-permission-request", { roomId: classId, request });
    setMessage("Permission request sent to faculty");
  };

  const grantPermission = (request, granted) => {
    socketRef.current?.emit("online-class-permission-grant", {
      roomId: classId,
      to: request.from,
      permissions: granted
    });
    setPermissionRequests((prev) => prev.filter((item) => item.from !== request.from));
  };

  const muteParticipant = (participant, kind = "audio") => {
    socketRef.current?.emit("online-class-mute", {
      to: participant.socketId,
      audio: kind === "audio",
      camera: kind === "camera",
      screen: kind === "screen"
    });
  };

  const openClassroomFullscreen = () => {
    const target = classroomRef.current;
    if (!target) return;
    if (target.requestFullscreen) target.requestFullscreen();
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
    else if (target.msRequestFullscreen) target.msRequestFullscreen();
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef2f7" }}>
      <Paper
        elevation={0}
        square
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          px: { xs: 1.5, md: 3 },
          py: 1.25,
          borderBottom: "1px solid #d8dee9",
          bgcolor: "#0f172a",
          color: "#fff"
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={950} noWrap>Online Class</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }} noWrap>{roomTitle}</Typography>
          </Box>
          <Button color="inherit" variant="outlined" startIcon={<Logout />} onClick={logout} sx={{ borderColor: "rgba(255,255,255,0.42)", whiteSpace: "nowrap" }}>
            Logout
          </Button>
        </Stack>
      </Paper>
      <Box
        ref={classroomRef}
        sx={{
          p: { xs: 2, md: 3 },
          bgcolor: "#eef2f7",
          minHeight: "100vh",
          "&:fullscreen": {
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
            overflow: "auto",
            p: { xs: 1.5, md: 2 },
            boxSizing: "border-box"
          },
          "&:fullscreen .online-class-video-grid": {
            minHeight: { xs: "calc(100vh - 260px)", md: "calc(100vh - 210px)" }
          },
          "&:fullscreen .online-class-video-item": {
            flexBasis: "100%",
            maxWidth: "100%"
          },
          "&:fullscreen .online-class-video-tile": {
            height: "100%",
            minHeight: { xs: 360, md: "calc(100vh - 230px)" }
          },
          "&:fullscreen .online-class-video-stage": {
            flex: 1,
            height: { xs: 320, md: "calc(100vh - 290px)" },
            maxHeight: "none",
            aspectRatio: "auto"
          }
        }}
      >
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={950}>{roomTitle}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Chip label={isFaculty ? "Faculty host" : "Student"} color={isFaculty ? "primary" : "default"} />
                <Chip label={`Server: ${socketStatus}`} color={socketStatus === "Connected" ? "success" : "warning"} />
                <Chip label={`Status: ${classRow?.onlineclassstatus || "Scheduled"}`} />
                <Chip label={`Participants: ${participants.length || 1}`} />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {isFaculty && <Button variant="contained" onClick={() => setOnlineStatus("Live")}>Start Class</Button>}
              {isFaculty && <Button variant="outlined" color="error" startIcon={<CallEnd />} onClick={() => setOnlineStatus("Ended")}>End Class</Button>}
              <Button variant={audioOn ? "contained" : "outlined"} startIcon={audioOn ? <Mic /> : <MicOff />} onClick={toggleAudio}>{audioOn ? "Mute self" : "Audio"}</Button>
              <Button variant={cameraOn ? "contained" : "outlined"} startIcon={cameraOn ? <Videocam /> : <VideocamOff />} onClick={toggleCamera}>{cameraOn ? "Camera off" : "Camera"}</Button>
              <Button variant={screenOn ? "contained" : "outlined"} startIcon={screenOn ? <StopScreenShare /> : <ScreenShare />} onClick={screenOn ? stopScreenShare : startScreenShare}>{screenOn ? "Stop share" : "Share screen"}</Button>
              <Button variant="outlined" startIcon={<Fullscreen />} onClick={openClassroomFullscreen}>Full screen</Button>
            </Stack>
          </Stack>
        </Paper>

        {!isFaculty && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>Request permission from faculty</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button size="small" startIcon={<Mic />} onClick={() => requestPermission({ audio: true })} disabled={permissions.audio}>Request Audio</Button>
              <Button size="small" startIcon={<Videocam />} onClick={() => requestPermission({ camera: true })} disabled={permissions.camera}>Request Camera</Button>
              <Button size="small" startIcon={<ScreenShare />} onClick={() => requestPermission({ screen: true })} disabled={permissions.screen}>Request Screen</Button>
            </Stack>
          </Paper>
        )}

        {isFaculty && permissionRequests.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>Permission requests</Typography>
            <Stack spacing={1}>
              {permissionRequests.map((request) => (
                <Stack key={request.from} direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
                  <Typography sx={{ flex: 1 }}>{request.user?.name || request.user?.email || request.from}</Typography>
                  <Button size="small" onClick={() => grantPermission(request, { audio: true })}>Allow Audio</Button>
                  <Button size="small" onClick={() => grantPermission(request, { camera: true })}>Allow Camera</Button>
                  <Button size="small" onClick={() => grantPermission(request, { screen: true })}>Allow Screen</Button>
                </Stack>
              ))}
            </Stack>
          </Paper>
        )}

        {isFaculty && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
              <Typography fontWeight={900}>Students joined and marked present</Typography>
              <Button size="small" onClick={loadOnlineJoins}>Refresh</Button>
            </Stack>
            {joinRows.length ? (
              <Grid container spacing={1}>
                {joinRows.map((row) => (
                  <Grid item xs={12} md={6} lg={4} key={row._id}>
                    <Box sx={{ p: 1.25, border: "1px solid #d8dee9", borderRadius: 1.5, bgcolor: "#fff" }}>
                      <Typography fontWeight={900}>{row.student || row.studentemail || row.regno}</Typography>
                      <Typography variant="body2" color="text.secondary">{row.regno || "-"} | Roll {row.rollno || "-"}</Typography>
                      <Typography variant="caption" color="text.secondary">Joined: {row.joindate || "-"} {row.jointime || ""} | Count: {row.joincount || 1}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">No student has joined yet.</Typography>
            )}
          </Paper>
        )}

        <Grid container spacing={2} className="online-class-video-grid">
          <Grid item xs={12} lg={isRoomFullscreen ? 12 : 6} className="online-class-video-item">
            <VideoTile
              label={`${global1.name || "Me"} (Me)`}
              stream={localStream}
              muted
              active
              emptyText="Click Audio, Camera, or Share screen to start"
            >
              <Typography variant="caption">Audio {audioOn ? "on" : "off"} | Camera {cameraOn ? "on" : "off"} | Screen {screenOn ? "sharing" : "off"}</Typography>
            </VideoTile>
          </Grid>
          {participants.filter((item) => item.socketId !== socketId).map((participant) => (
            <Grid item xs={12} lg={isRoomFullscreen ? 12 : 6} key={participant.socketId} className="online-class-video-item">
              <VideoTile
                label={participant.name || participant.email || participant.socketId}
                stream={remoteStreams[participant.socketId]}
                active={socketStatus === "Connected"}
                emptyText="Waiting for participant media"
              >
                {isFaculty && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button size="small" startIcon={<MicOff />} onClick={() => muteParticipant(participant, "audio")}>Mute</Button>
                    <Button size="small" startIcon={<VideocamOff />} onClick={() => muteParticipant(participant, "camera")}>Camera off</Button>
                    <Button size="small" startIcon={<StopScreenShare />} onClick={() => muteParticipant(participant, "screen")}>Stop screen</Button>
                  </Stack>
                )}
              </VideoTile>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
