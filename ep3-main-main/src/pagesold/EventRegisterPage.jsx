import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  Box,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function EventRegisterPage() {
  const {id} = useParams();
  const navigate = useNavigate();
  const colid = global1.colid;

  const [role, setRole] = useState("attendee");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    institutionname: "",
    phone: "",
    colid,
  });

  // speaker-only fields
  const [speakerFields, setSpeakerFields] = useState({
    topic: "",
    speakerprofile: "",
    designation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("speaker_")) {
      setSpeakerFields((s) => ({
        ...s,
        [name.replace("speaker_", "")]: value,
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      role,
      ...(role === "speaker" ? speakerFields : {}),
    };
    try {
      await ep1.post(`/api/v2/eventregister?id=${id}`, payload);
      alert("Registered successfully");
      navigate(`/event/${id}`);
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 450, mx: "auto", mt: 6 }}>
      <Box mt={2} mb={2}>
            <Button
              variant="outlined"
              onClick={() => window.open(`/eventregistrationcolid/${id}/${colid}`, "_blank")}
            >
              Share Registration Link
            </Button>
          </Box>
      <Typography variant="h5" gutterBottom>
        Register for Event
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          label="Institution / College"
          name="institutionname"
          margin="normal"
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          margin="normal"
          onChange={handleChange}
          required
        />

        <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)}>
          <FormControlLabel
            value="attendee"
            control={<Radio />}
            label="Attendee"
          />
          <FormControlLabel
            value="speaker"
            control={<Radio />}
            label="Speaker"
          />
        </RadioGroup>

        {role === "speaker" && (
          <>
          <TextField
      fullWidth
      label="Designation"
      name="speaker_designation"
      margin="normal"
      onChange={handleChange}
      required
    />
            <TextField
              fullWidth
              label="Topic / Title"
              name="speaker_topic"
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Speaker Profile"
              name="speaker_speakerprofile"
              margin="normal"
              multiline
              rows={3}
              onChange={handleChange}
              required
            />
          </>
        )}

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
    </Paper>
  );
}
