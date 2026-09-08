// src/pages/EventDetailPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useParams } from "react-router-dom";

const EventDetailPage = () => {
  let params = useParams();
  let colid;
  if(global1.colid){
    colid = global1.colid;
  }else{
    colid = params.colid;
  }
  const { id } = useParams();

  const [enterClicked, setEnterClicked] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");

  const [event, setEvent] = useState(null);
  const [docs, setDocs] = useState([]);
  const [newDoc, setNewDoc] = useState({ title: "", link: "" });
  const [approvedSpeakers, setApprovedSpeakers] = useState([]);

  /* login */
  const handleEnter = () => setLoginOpen(true);
  const handleLogin = async () => {
    try {
      const res = await ep1.post(`/api/v2/eventlogin?id=${id}`, credentials);
      setUser(res.data.user);
      setLoginOpen(false);
      setEnterClicked(true);
      setLoginError("");
    } catch (err) {
      setLoginError(err?.response?.data?.message || "Login failed");
    }
  };

  /* data fetchers */
  const fetchEvent = () =>
    ep1
      .get(`/api/v2/getsingleevent?id=${id}&colid=${colid}`)
      .then((r) => setEvent(r.data))
      .catch(console.error);
  const fetchDocs = () =>
    ep1
      .get(`/api/v2/getdocs?id=${id}&colid=${colid}`)
      .then((r) => setDocs(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  const fetchSpeakers = () =>
    ep1
      .get(`/api/v2/getapprovedspeakers?eventid=${id}&colid=${colid}`)
      .then((r) => setApprovedSpeakers(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);

  const handleAddDoc = () => {
    if (!newDoc.title || !newDoc.link) return;
    ep1
      .post(`/api/v2/addDoc?id=${id}&colid=${colid}`, {
        ...newDoc,
        regId: user._id,
      })
      .then(() => {
        setNewDoc({ title: "", link: "" });
        fetchDocs();
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!id || !colid) return;
    fetchEvent();
    fetchDocs();
    fetchSpeakers();
  }, [id, colid]);

  if (!event) return <Typography style={{ textAlign: "center", marginTop: 64 }}>Loading event…</Typography>;

  const upcoming = event.status1 === "Upcoming";

  return (
    <Container maxWidth="md" style={{ marginTop: 32, marginBottom: 32 }}>
      {!enterClicked ? (
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            Event Details – {event.event}
          </Typography>
          <Button variant="contained" size="large" onClick={handleEnter}>
            Login
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            {event.event}
          </Typography>

          {/* Event Details */}
          {[
            { title: "Event Info", data: [
              { label: "Type", value: event.type },
              { label: "Level", value: event.level },
              { label: "Collaboration", value: event.collab },
              { label: "Participants", value: event.participants },
              { label: "Duration (days)", value: event.duration },
              { label: "Start Date", value: new Date(event.startdate).toLocaleDateString() },
            ]},
            { title: "Coordinator & Dept", data: [
              { label: "Coordinator", value: event.coordinator },
              { label: "Department", value: event.department },
            ]},
            { title: "Links", data: [
              { label: "Brochure", value: event.brochurelink },
              { label: "Report", value: event.reportlink },
              { label: "MOU", value: event.moulink },
            ]},
            { title: "Misc", data: [
              { label: "Year", value: event.year },
              { label: "Description", value: event.description },
              { label: "Status", value: event.status1 },
              { label: "Comments", value: event.comments },
            ]},
          ].map((group) => (
            <Card key={group.title} style={{ marginBottom: 24 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {group.title}
                </Typography>
                <Divider style={{ marginBottom: 12 }} />
                <Grid container spacing={2}>
                  {group.data.map((item) => (
                    <Grid item xs={12} sm={6} key={item.label}>
                      <Typography>
                        <strong>{item.label}:</strong> {item.value || "-"}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ))}

          {/* Document Links */}
          <Typography variant="h5" gutterBottom style={{ marginTop: 40 }}>
            Documents
          </Typography>
          {docs.length ? (
            docs.map((doc) => (
              <Card key={doc._id} style={{ marginBottom: 8 }}>
                <CardContent>
                  <Typography variant="h6">{doc.title}</Typography>
                  <a href={doc.link} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all" }}>
                    {doc.link}
                  </a>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>No documents uploaded</Typography>
          )}

          {/* Speaker Upload */}
          {user?.role === "speaker" && (
            <Card style={{ marginTop: 40 }}>
              <CardContent>
                <Typography variant="h5">Add Document</Typography>
                <Grid container spacing={2} style={{ marginTop: 8 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Title" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Link" value={newDoc.link} onChange={(e) => setNewDoc({ ...newDoc, link: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={handleAddDoc}>Upload</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Approved Speakers */}
          {approvedSpeakers.length > 0 && (
            <Box style={{ marginTop: 40 }}>
              <Typography variant="h5" gutterBottom>
                Speakers
              </Typography>
              {approvedSpeakers.map((s) => (
                <Card key={s._id} style={{ marginBottom: 16 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar style={{ marginRight: 12 }}>{s.name[0]}</Avatar>
                      <Box>
                        <Typography variant="h6">{s.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {s.designation} – {s.institutionname}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" mb={1}>
                      <strong>Topic:</strong> {s.topic}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      {s.speakerprofile}
                    </Typography>
                    <Divider style={{ margin: "8px 0" }} />
                    <Typography variant="body2">
                      <strong>Day:</strong> {s.day} |{" "}
                      <strong>Date:</strong> {new Date(s.date).toLocaleDateString()} |{" "}
                      <strong>Time:</strong> {s.time}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Login Dialog */}
      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs">
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          {loginError && <Alert severity="error">{loginError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogin} variant="contained">
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetailPage;