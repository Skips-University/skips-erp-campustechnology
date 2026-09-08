import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = {
  formname: "",
  formid: "",
  validationcriteria: "",
  mandatorycriteria: ""
};

export default function AdmissionValidationCriteriaPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [forms, setForms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRows();
    loadForms();
  }, []);

  const loadRows = async () => {
    const res = await ep1.get("/admission-validation-criteria", { params: { colid: global1.colid } });
    setRows(res.data || []);
  };

  const loadForms = async () => {
    const res = await ep1.get("/admission-dynamic/forms", { params: { colid: global1.colid } });
    setForms(res.data || []);
  };

  const formOptions = useMemo(() => forms.map((item) => ({
    label: `${item.title || item.formname || item.formid} (${item.formid})`,
    formname: item.title || item.formname || item.formid,
    formid: item.formid
  })), [forms]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectKnownForm = (formid) => {
    const selected = formOptions.find((item) => item.formid === formid);
    setForm((prev) => ({
      ...prev,
      formid,
      formname: selected?.formname || prev.formname
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const saveCriteria = async () => {
    if (!form.formname || !form.formid) {
      setMessage("Form name and form id are required.");
      return;
    }

    try {
      const payload = {
        ...form,
        colid: global1.colid,
        user: global1.user
      };
      if (editingId) {
        await ep1.post("/admission-validation-criteria-update", { ...payload, id: editingId });
        setMessage("Validation criteria updated.");
      } else {
        await ep1.post("/admission-validation-criteria", payload);
        setMessage("Validation criteria added.");
      }
      resetForm();
      loadRows();
    } catch (err) {
      setMessage(err.response?.data?.msg || "Unable to save validation criteria.");
    }
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      formname: row.formname || "",
      formid: row.formid || "",
      validationcriteria: row.validationcriteria || "",
      mandatorycriteria: row.mandatorycriteria || ""
    });
  };

  const deleteRow = async (row) => {
    const ok = window.confirm(`Delete validation criteria for ${row.formname || row.formid}?`);
    if (!ok) return;
    try {
      await ep1.post("/admission-validation-criteria-delete", { id: row._id, colid: global1.colid });
      setMessage("Validation criteria deleted.");
      loadRows();
    } catch (err) {
      setMessage(err.response?.data?.msg || "Unable to delete validation criteria.");
    }
  };

  const columns = [
    { field: "formname", headerName: "Form Name", flex: 1 },
    { field: "formid", headerName: "Form ID", flex: 0.8 },
    { field: "mandatorycriteria", headerName: "Mandatory Criteria", flex: 2 },
    { field: "validationcriteria", headerName: "Validation Criteria", flex: 2.2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.9,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<EditIcon />} onClick={() => editRow(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => deleteRow(params.row)}>
            Delete
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Grid container spacing={2} padding={2}>
      <Grid item xs={12}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={800}>Admission Validation Criteria</Typography>
        <Typography color="text.secondary">Define extra AI validation rules for each admission form.</Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          {message && <Typography color="primary" sx={{ mb: 2 }}>{message}</Typography>}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Select Form" value={form.formid} onChange={(e) => selectKnownForm(e.target.value)}>
                <MenuItem value="">Type manually</MenuItem>
                {formOptions.map((item) => (
                  <MenuItem key={item.formid} value={item.formid}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Form Name" value={form.formname} onChange={(e) => updateForm("formname", e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Form ID" value={form.formid} onChange={(e) => updateForm("formid", e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Mandatory Criteria"
                value={form.mandatorycriteria}
                onChange={(e) => updateForm("mandatorycriteria", e.target.value)}
                placeholder="Example: Caste certificate must be uploaded for reserved categories. Applicant name must match all mandatory documents."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Validation Criteria"
                value={form.validationcriteria}
                onChange={(e) => updateForm("validationcriteria", e.target.value)}
                placeholder="Example: Check that uploaded income certificate is present for EWS. Verify applicant name, parent name and category against uploaded documents."
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="contained" onClick={saveCriteria}>{editingId ? "Update" : "Add"}</Button>
                {editingId && <Button variant="outlined" onClick={resetForm}>Cancel</Button>}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} sx={{ mb: 2 }}>
            <Typography variant="h6">Configured Criteria</Typography>
            <Typography color="text.secondary">{rows.length} records</Typography>
          </Stack>
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
