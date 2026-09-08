import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ep1 from "../api/ep1";
import global1 from "./global1";

const baseColumns = [
  { field: "name", headerName: "Name", width: 180 },
  { field: "email", headerName: "Email", width: 220 },
  { field: "phone", headerName: "Phone", width: 140 },
  { field: "employeeid", headerName: "Employee ID", width: 150 },
  { field: "login", headerName: "Login", width: 150 },
  { field: "institution", headerName: "Institution", width: 190 },
  { field: "department", headerName: "Department", width: 170 },
  { field: "status", headerName: "Status", width: 120 }
];

export default function EmployeeProfileEditPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [customValues, setCustomValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const [fieldRes, profileRes] = await Promise.all([
        ep1.get("/api/v2/employee-database-fields", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/employee-database-profile", {
          params: { colid: global1.colid, login: global1.user }
        })
      ]);
      const loadedFields = fieldRes.data || [];
      const loadedRows = profileRes.data || [];
      setFields(loadedFields);
      setRows(loadedRows);
      if (loadedRows.length) selectRow(loadedRows[0]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load employee profile");
    } finally {
      setLoading(false);
    }
  };

  const activeFields = useMemo(() => fields
    .filter((field) => String(field.isactive || "Yes").trim().toLowerCase() !== "no")
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || String(a.label || "").localeCompare(String(b.label || ""))), [fields]);

  const editableFields = useMemo(() => activeFields.filter((field) => field.iseditable === "Yes"), [activeFields]);

  const selectRow = (row) => {
    setSelected(row);
    setCustomValues(row?.customFields || {});
    setMessage("");
    setError("");
  };

  const updateCustom = (fieldname, value) => {
    setCustomValues((prev) => ({ ...prev, [fieldname]: value }));
  };

  const saveProfile = async () => {
    if (!selected) return;
    const missing = editableFields.filter((field) => field.isrequired === "Yes" && !String(customValues[field.fieldname] || "").trim());
    if (missing.length) {
      setError(`Required field missing: ${missing.map((item) => item.label).join(", ")}`);
      return;
    }

    try {
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/employee-database-profile-update", {
        id: selected._id,
        colid: global1.colid,
        login: global1.user,
        customFields: customValues
      });
      setMessage("Profile updated");
      setRows((prev) => prev.map((row) => (row._id === selected._id ? res.data : row)));
      setSelected(res.data);
      setCustomValues(res.data?.customFields || {});
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update profile");
    }
  };

  const columns = [
    ...baseColumns,
    ...activeFields.map((field) => ({
      field: `custom_${field.fieldname}`,
      headerName: field.label,
      width: 170,
      valueGetter: (params) => params.row.customFields?.[field.fieldname] || ""
    })),
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => selectRow(params.row)} />
      ]
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Edit Profile</Typography>
          <Typography variant="body2" color="text.secondary">Showing employee database records where login matches {global1.user}.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "my_employee_profile" } } }}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
          sx={{ minWidth: Math.max(1500, 1320 + activeFields.length * 170) }}
        />
      </Paper>

      {!rows.length && !loading && (
        <Alert severity="info">No employee database record is mapped with your login.</Alert>
      )}

      {selected && (
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Profile Details</Typography>
              <Typography variant="body2" color="text.secondary">Only fields marked editable by user can be changed here.</Typography>
            </Box>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={saveProfile}>Save Editable Fields</Button>
          </Stack>

          <Grid container spacing={2}>
            {baseColumns.map((column) => (
              <Grid item xs={12} md={3} key={column.field}>
                <TextField fullWidth label={column.headerName} value={selected[column.field] || ""} InputProps={{ readOnly: true }} />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip label={`Custom fields: ${activeFields.length}`} />
            <Chip color="success" label={`Editable: ${editableFields.length}`} />
            <Chip color="warning" label={`Read only: ${activeFields.length - editableFields.length}`} />
          </Stack>

          <Grid container spacing={2}>
            {activeFields.map((field) => {
              const editable = field.iseditable === "Yes";
              return (
                <Grid item xs={12} md={field.type === "textarea" ? 6 : 3} key={field._id || field.fieldname}>
                  <TextField
                    select={field.type === "dropdown"}
                    multiline={field.type === "textarea"}
                    minRows={field.type === "textarea" ? 3 : undefined}
                    fullWidth
                    required={editable && field.isrequired === "Yes"}
                    type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                    label={field.label}
                    value={customValues?.[field.fieldname] || ""}
                    onChange={(e) => editable && updateCustom(field.fieldname, e.target.value)}
                    InputProps={{ readOnly: !editable }}
                    InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                    helperText={editable ? "Editable" : "Read only"}
                  >
                    {(field.options || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
