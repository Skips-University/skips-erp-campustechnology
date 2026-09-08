// src/pages/FillForm.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tesseract from "tesseract.js";
import pdfToText from "react-pdftotext";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import ep1 from "../api/ep1";

const FillForm = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
      { formId, data: values },
      { params: { colid: form.colid } }
    );
    setSubmitted(true);
  };

  const extractText1 = (event) => {
    const file1 = event.target.files[0];
    setFile(file1);
  };

  const handleImageUpload = (event) => {
    const image = event.target.files[0];
    setSelectedImage(URL.createObjectURL(image));
  };

  const processpdf = async () => {
    if (!file) {
      alert("Please select a PDF file first.");
      return;
    }

    pdfToText(file)
      .then((text) => {
        if (!text.trim()) {
          alert(
            "⚠️ No text found in PDF. It may be a scanned image.\nTry uploading the image instead."
          );
          return;
        }
        checkTextAgainstForm(text);
      })
      .catch(() => alert("Failed to extract text from PDF"));
  };

  const extractImageText = async () => {
    if (!selectedImage) {
      alert("Please select an image");
      return;
    }

    const result = await Tesseract.recognize(selectedImage, "eng");

    const ocrText = result.data.text;
    checkTextAgainstForm(ocrText);
  };

  const checkTextAgainstForm = (text) => {
    let found = 0;
    let notFound = "";

    const entries = Object.entries(values).filter(
      ([_, val]) => val.trim() !== ""
    );

    entries.forEach(([label, val]) => {
      const valLower = val.trim().toLowerCase();
      const textLower = text.toLowerCase();

      if (valLower && textLower.includes(valLower)) {
        found++;
      } else {
        notFound += `${label}: "${val}"\n`;
      }
    });

    const total = entries.length;
    const percentage = total > 0 ? Math.round((found / total) * 100) : 0;

    alert(`✅ Match: ${percentage}%
❌ Missing fields:\n${notFound || "None"}`);
  };

  if (!form) return <Typography>Loading…</Typography>;

  if (submitted) {
    return (
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
    );
  }

  return (
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

        <br />
        <table>
          <tbody>
            <tr>
              <td>Select PDF</td>
              <td width="20px"></td>
              <td>
                <input type="file" accept="application/pdf" onChange={extractText1} />
              </td>
            </tr>
            <tr>
              <td>Select Image</td>
              <td width="20px"></td>
              <td>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </td>
            </tr>
          </tbody>
        </table>
        <br />

        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={submit}>
          Submit
        </Button>
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={processpdf}>
          Check PDF
        </Button>
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={extractImageText}>
          Check Image (OCR)
        </Button>
      </Paper>
    </Container>
  );
};

export default FillForm;

