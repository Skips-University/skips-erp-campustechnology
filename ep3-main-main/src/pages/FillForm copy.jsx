// src/pages/FillForm.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import ep1 from "../api/ep1";

const FillForm = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    ep1.get(`/api/v2/getsingleform`, { params: { formId } }).then((res) => {
      setForm(res.data);
      const v = {};
      res.data.fields.forEach((f) => (v[f.label] = ""));
      setValues(v);
    });
  }, [formId]);

  const handleChange = (label, val) =>
    setValues((prev) => ({ ...prev, [label]: val }));

  const submit = async () => {
    await ep1.post(
      "/api/v2/createresponse",
      { formId, data: values }, // ← valid JS object
      { params: { colid: form.colid } } // ← query string
    );
    setSubmitted(true);
  };

  if (!form) return <Typography>Loading…</Typography>;

  if (submitted) {
    return (
      <React.Fragment>
        <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontSize: 60 }}>
              ✅
            </Typography>
            <Typography variant="h5">
              Your response has been recorded.
            </Typography>
          </Paper>
        </Container>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h5" mb={2}>
            {form.title}
          </Typography>
          {form.fields.map((f) => (
            <TextField
              key={f.label}
              label={f.label}
              type={f.type}
              fullWidth
              margin="dense"
              value={values[f.label] || ""}
              onChange={(e) => handleChange(f.label, e.target.value)}
            />
          ))}
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={submit}>
            Submit
          </Button>
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default FillForm;
