// src/pages/FormsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const FormPage = () => {
  const [forms, setForms] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([{ label: "", type: "text" }]);
  const [editId, setEditId] = useState(null);
  const colid = global1.colid;
  const nav = useNavigate();

  const loadForms = async () => {
    const { data } = await ep1.get(`/api/v2/getallforms?colid=${colid}`);
    setForms(data);
  };

  useEffect(() => {
    loadForms();
  }, []);

  const saveForm = async () => {
    const payload = { title, fields };
    if (editId) {
      await ep1.post(
        `/api/v2/updateform?colid=${colid}&formId=${editId}`,
        payload
      );
    } else {
      await ep1.post(`/api/v2/createform?colid=${colid}`, payload);
    }
    setOpen(false);
    loadForms();
  };

  const delForm = async (id) => {
    await ep1.get(`/api/v2/deleteform?colid=${colid}&formId=${id}`);
    loadForms();
  };

  const openCreate = () => {
    setEditId(null);
    setTitle("");
    setFields([{ label: "", type: "text" }]);
    setOpen(true);
  };
  const openEdit = (f) => {
    setEditId(f._id);
    setTitle(f.title);
    setFields(f.fields);
    setOpen(true);
  };

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h4" mb={2}>
            Forms
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Create
          </Button>
          <List>
            {forms.map((f) => (
              <ListItem
                key={f._id}
                secondaryAction={
                  <>
                    <IconButton onClick={() => openEdit(f)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => delForm(f._id)}>
                      <Delete />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={f.title}
                  onClick={() => nav(`/responses/${f._id}`)}
                  sx={{ cursor: "pointer" }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
          <DialogTitle>{editId ? "Edit Form" : "Create Form"}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            {fields.map((f, i) => (
              <Box key={i} display="flex" gap={1} mb={1}>
                <TextField
                  label="Label"
                  value={f.label}
                  onChange={(e) => {
                    const copy = [...fields];
                    copy[i].label = e.target.value;
                    setFields(copy);
                  }}
                />
                <TextField
                  select
                  SelectProps={{ native: true }}
                  value={f.type}
                  onChange={(e) => {
                    const copy = [...fields];
                    copy[i].type = e.target.value;
                    setFields(copy);
                  }}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                </TextField>
              </Box>
            ))}
            <Button
              onClick={() =>
                setFields([...fields, { label: "", type: "text" }])
              }
            >
              Add Field
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveForm} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </React.Fragment>
  );
};

export default FormPage;
