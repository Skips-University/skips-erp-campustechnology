import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  MenuItem,
  Stack,
} from "@mui/material";
import global1 from "./global1";
import ep1 from "../api/ep1";

const ApplyScholarshipDS = () => {
  const [form, setForm] = useState({
    program: "",
    programcode: "",
    scholarshipname: "",
    applicantname: "",
    applicantemail: "",
    applicantphone: "",
    address: "",
  });
  const [scholarships, setScholarships] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");

  const programcode=global1.programcode;
  //const category=global1.category;
  const name=global1.name;

    useEffect(() => {
       form.programcode=programcode;
        form.applicantname=name;
        form.applicantemail=global1.user;
      }, []);


  useEffect(() => {
    if (form.programcode) {
      ep1
        .get("/api/v2/filterscholarshipds", {
          params: {
            category: global1.category,
            programcode: form.programcode,
            colid: global1.colid,
          },
        })
        .then((res) => setScholarships(res.data.scholarships || []));
    }
  }, [form.program, form.programcode]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleScholarship = (e) =>
    setForm({ ...form, scholarshipname: e.target.value });

  const handleSubmit = async () => {
    const selected = scholarships.find(
      (s) => s.scholarshipname === form.scholarshipname
    );
    if (!selected) return setMsg("Select a scholarship");
    const payload = {
      ...form,
      name: selected.name,
      user: selected.user,
      colid: selected.colid,
      regno: global1.regno,
      category: global1.category,
      programcode: selected.programode,
      program: selected.program,
    };
    try {
      const res = await ep1.post(
        "/api/v2/createscholarshipapplicationds",
        payload
      );
      setMsg(res.data.success ? "Applied successfully!" : res.data.message);
      setMsgType(res.data.success ? "success" : "error");
    } catch (err) {
      setMsgType("error");
      setMsg("Error applying for scholarship");
    }
  };

  return (
    <Container maxWidth="100%" sx={{ pt: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Apply for Scholarship
        </Typography>
        {msg && (
          <Alert severity={msgType} sx={{ mb: 2 }}>
            {msg}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField label="Program Code" name="programcode" value={form.programcode} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Select Scholarship"
              name="scholarshipname"
              value={form.scholarshipname}
              onChange={handleScholarship}
              fullWidth
              required
              disabled={scholarships.length === 0}
            >
              {scholarships.map((s) => (
                <MenuItem key={s._id} value={s.scholarshipname}>
                  {s.scholarshipname} ({s.amount})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Name"
              name="applicantname"
              value={form.applicantname}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="applicantemail"
              value={form.applicantemail}
              onChange={handleChange}
              required
              type="email"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone"
              name="applicantphone"
              value={form.applicantphone}
              onChange={handleChange}
              required
              type="tel"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              multiline
              rows={4}
              value={form.address}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            onClick={handleSubmit}
            size="large"
            variant="contained"
            color="primary"
            sx={{ width: "200px" }}
          >
            Apply
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ApplyScholarshipDS;
