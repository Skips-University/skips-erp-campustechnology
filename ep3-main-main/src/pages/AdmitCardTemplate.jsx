import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Container, Typography, Button, Paper, TextField, IconButton, List, ListItem, ListItemText } from "@mui/material";
import InputField from "../components/InputField";
import AddIcon from "@mui/icons-material/Add";
import global1 from './global1';
import ep1 from '../api/ep1';

const initialForm = {
  templatename: "",
  institutionname: "",
  programname: "",
  title: "ADMIT CARD",
  instructions: [],
  controllersignaturelabel: "Controller of Examinations",
  footertext: "",
};

const AdmitCardTemplate = () => {
  const [formData, setFormData] = useState(initialForm);
  const [templates, setTemplates] = useState([]);
  const [instructionInput, setInstructionInput] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await ep1.get('/api/v2/admitcard/templates', { });
      // const res = await axios.get("http://localhost:8080/api/v2/admitcard/templates");
      setTemplates(response.data);
    } catch (err) {
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddInstruction = () => {
    if (instructionInput.trim()) {
      setFormData({
        ...formData,
        instructions: [...formData.instructions, instructionInput.trim()],
      });
      setInstructionInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      const response = await ep1.post('/api/v2/admitcard/create', { 
        ...payload
      });

      // await axios.post("http://localhost:8080/api/v2/admitcard/create", payload);
      fetchTemplates();
      setFormData(initialForm);
      alert("Template created successfully");
    } catch (err) {
      alert("Failed to create template");
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create Admit Card Template
        </Typography>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Template Name"
            name="templatename"
            value={formData.templatename}
            onChange={handleChange}
            type="text"
          />
          <InputField
            label="Institution Name"
            name="institutionname"
            value={formData.institutionname}
            onChange={handleChange}
            type="text"
          />
          <InputField
            label="Program Name"
            name="programname"
            value={formData.programname}
            onChange={handleChange}
            type="text"
          />
          <InputField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            type="text"
          />

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TextField
              fullWidth
              label="Add Instruction"
              value={instructionInput}
              onChange={(e) => setInstructionInput(e.target.value)}
              variant="outlined"
              size="small"
            />
            <IconButton color="primary" onClick={handleAddInstruction}>
              <AddIcon />
            </IconButton>
          </Box>

          <List dense>
            {formData.instructions.map((inst, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={`• ${inst}`} />
              </ListItem>
            ))}
          </List>

          <InputField
            label="Controller Signature Label"
            name="controllersignaturelabel"
            value={formData.controllersignaturelabel}
            onChange={handleChange}
            type="text"
          />
          <InputField
            label="Footer Text"
            name="footertext"
            value={formData.footertext}
            onChange={handleChange}
            type="text"
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" type="submit">
              Create Template
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AdmitCardTemplate;