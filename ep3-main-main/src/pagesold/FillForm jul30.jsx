// src/pages/FillForm.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tesseract from 'tesseract.js';
import pdfToText from 'react-pdftotext';
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

    const [file, setFile] = useState();
      
  
      const [selectedImage, setSelectedImage] = useState(null);

      const handleImageUpload = (event) => {
    const image = event.target.files[0];
    setSelectedImage(URL.createObjectURL(image));
  };

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

  const processpdf=async()=> {
    if(!file) {
      alert('Please select file');
      return;
    }
    
    //setOpen(true);
    pdfToText(file)
    .then((text) => checktext1(text))
    .catch((error) => alert("Failed to extract text from pdf"));
    //setOpen(false);

  }

  const checktext1=(stext)=> {
    alert(stext);
    //const ar1=itemstocheck.split('~');
    var found=0;
    var notthere='';
    alert(values.length);
    for(var i=0;i<values.length;i++) {
      
      console.log(values[i][0] + ',' + values[i][1]);
      if(stext.toLowerCase().indexOf(values[i][1])>-1) {
        found=found + 1;
      } else {
        notthere=notthere + values[i][1] + ' ';
      }

    }
    var percentage=Math.round(parseFloat(found)/parseFloat(values.length) * 100);
    alert('Percentage match ' + percentage + '. Missing items ' + notthere);
  }

  function extractText1(event) {
     
      const file1 = event.target.files[0];
      setFile(file1);
     
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
          <br />
           <table>
    <tr>
      <td>
        Select pdf
      </td>
      <td width="20px"></td>
      <td>
      <input type="file" accept="application/pdf" onChange={extractText1} />
      </td>
      </tr><tr>
      <td>Select image</td>
      <td width="20px"></td>
      <td>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      </td>
    </tr>
  </table>
  <br />
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={submit}>
            Submit
          </Button>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={processpdf}>
            Check pdf
          </Button>
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default FillForm;
