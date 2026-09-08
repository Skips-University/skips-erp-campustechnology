// src/pages/ApproveSpeakersPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function ApproveSpeakersPage() {
  const { id } = useParams();
  const colid = global1.colid;

  const [eventname, setEventname] = useState("");
  const [speakers, setSpeakers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [timeSlot, setTimeSlot] = useState({ day: "", date: "", time: "" });

  /* fetch pending speakers */
  useEffect(() => {
    if (!id || !colid) return;
    ep1
      .get(`/api/v2/getspeakers?eventid=${id}&colid=${colid}`)
      .then((res) => setSpeakers(res.data))
      .catch(console.error);
      const fetchEvent = async () => {
    try {
      const res = await ep1.get(`/api/v2/getsingleevent?id=${id}&colid=${colid}`);
      setEventname(res.data.event + ' ' + new Date(res.data.startdate).toLocaleDateString())
    } catch (err) {
      console.error("Failed to fetch event:", err);
    }
  };
  fetchEvent();
  }, [id, colid]);

  /* approve handler */
  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await ep1.post(`/api/v2/approvespeaker?id=${selected._id}`, timeSlot);
      setOpen(false);
      setTimeSlot({ day: "", date: "", time: "" });
      // refresh
      const { data } = await ep1.get(
        `/api/v2/getspeakers?eventid=${id}&colid=${colid}`
      );
      setSpeakers(data);
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    }
  };

  return (
    <React.Fragment>
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Approve Speakers – Event {eventname}
      </Typography>

      {speakers.length === 0 && (
        <Typography color="text.secondary">No pending speakers.</Typography>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 3 }}>
        {speakers.map((s) => (
          <Card key={s._id} sx={{ minWidth: 320, maxWidth: 400 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                <Avatar>{s.name[0]}</Avatar>
                <Box>
                  <Typography variant="h6">{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.email}
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="body2" mb={1}>
                <strong>Institution:</strong> {s.institutionname}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Designation:</strong> {s.designation}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Phone:</strong> {s.phone}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Topic:</strong> {s.topic}
              </Typography>
              <Typography variant="body2" mb={1} sx={{ fontStyle: "italic" }}>
                {s.speakerprofile}
              </Typography>

              <Chip
                label={s.status1}
                color={s.status1 === "Pending" ? "warning" : "success"}
                size="small"
                sx={{ mt: 1 }}
              />

              {s.status1 === "Pending" && (
                <Button
                  size="small"
                  variant="contained"
                  sx={{ mt: 2, display: "block" }}
                  onClick={() => {
                    setSelected(s);
                    setOpen(true);
                  }}
                >
                  Approve & Schedule
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Approve Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Approve Speaker – {selected?.name}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleApprove} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Day"
              value={timeSlot.day}
              onChange={(e) =>
                setTimeSlot({ ...timeSlot, day: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={timeSlot.date}
              onChange={(e) =>
                setTimeSlot({ ...timeSlot, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              type="time"
              label="Time"
              value={timeSlot.time}
              onChange={(e) =>
                setTimeSlot({ ...timeSlot, time: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              Save & Approve
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
    </React.Fragment>
  );
}
