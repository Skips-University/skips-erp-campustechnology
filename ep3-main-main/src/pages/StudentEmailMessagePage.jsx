import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import SearchIcon from "@mui/icons-material/Search";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "program", label: "Program" },
  { field: "programcode", label: "Program Code" },
  { field: "academicyear", label: "Academic Year" },
  { field: "admissionyear", label: "Admission Year" },
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "phone", label: "Phone" },
  { field: "regno", label: "Reg No" },
  { field: "semester", label: "Semester" },
  { field: "section", label: "Section" },
  { field: "regulation", label: "Regulation" },
  { field: "Major", label: "Major" },
  { field: "Minor", label: "Minor" },
  { field: "AEC", label: "AEC" },
  { field: "SEC", label: "SEC" },
  { field: "VAC", label: "VAC" },
  { field: "IDC", label: "IDC" },
  { field: "gender", label: "Gender" },
  { field: "category", label: "Category" }
];

const blankFilter = { field: "program", value: "" };

export default function StudentEmailMessagePage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [filterOptions, setFilterOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [selection, setSelection] = useState([]);
  const [subject, setSubject] = useState(`Message from ${global1.insname || "Institution"}`);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const selectedStudents = useMemo(
    () => rows.filter((row) => selection.includes(row._id)),
    [rows, selection]
  );

  useEffect(() => {
    loadFilterOptions();
    searchStudents([{ ...blankFilter, value: "" }]);
  }, []);

  const columns = [
    { field: "name", headerName: "Name", width: 190 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "programcode", headerName: "Program Code", width: 150 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "section", headerName: "Section", width: 110 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "Major", headerName: "Major", width: 170 },
    { field: "Minor", headerName: "Minor", width: 170 },
    { field: "gender", headerName: "Gender", width: 130 },
    { field: "category", headerName: "Category", width: 120 }
  ];

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      return {
        ...item,
        [key]: value,
        ...(key === "field" ? { value: "" } : {})
      };
    }));
  };

  const addFilter = () => {
    setFilters((prev) => [...prev, { ...blankFilter }]);
  };

  const removeFilter = (index) => {
    setFilters((prev) => prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const loadFilterOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/student-email-message/options", {
        params: { colid: global1.colid }
      });
      setFilterOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load dynamic filter options");
    }
  };

  const searchStudents = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);
      setSelection([]);
      const activeFilters = filters.filter((filter) => filter.field && String(filter.value || "").trim());
      const res = await ep1.post("/api/v2/student-email-message/search", {
        colid: global1.colid,
        filters: activeFilters
      });
      setRows(res.data || []);
      if (!(res.data || []).length) setSuccess("No students found for the selected filters");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    try {
      if (!selection.length) {
        setError("Select at least one student");
        return;
      }
      if (!messageText.trim()) {
        setError("Message text is required");
        return;
      }
      setError("");
      setSuccess("");
      setSending(true);
      const res = await ep1.post("/api/v2/student-email-message/send", {
        colid: global1.colid,
        user: global1.user,
        institution: global1.insname,
        studentIds: selection,
        subject,
        message: messageText
      });
      const failed = res.data?.failed ? ` Failed: ${res.data.failed}.` : "";
      setSuccess(`${res.data?.msg || "Email sent."}${failed}`);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to send email");
    } finally {
      setSending(false);
    }
  };

  const renderFilterValue = (filter, index) => {
    return (
      <Autocomplete
        freeSolo
        options={filterOptions[filter.field] || []}
        value={filter.value || ""}
        onChange={(_, value) => updateFilter(index, "value", value || "")}
        onInputChange={(_, value) => updateFilter(index, "value", value || "")}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            label="Value"
            helperText={(filterOptions[filter.field] || []).length ? "Values loaded from student data" : "Type a value"}
          />
        )}
        fullWidth
      />
    );
  };

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Student Email Message</Typography>
          <Typography variant="body2" color="text.secondary">Filter students, select recipients and send an email using the default email configuration.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Dynamic Filters</Typography>
        <Grid container spacing={2}>
          {filters.map((filter, index) => (
            <React.Fragment key={`${filter.field}-${index}`}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter"
                  value={filter.field}
                  onChange={(event) => updateFilter(index, "field", event.target.value)}
                >
                  {filterFields.map((item) => (
                    <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={5}>
                {renderFilterValue(filter, index)}
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter} sx={{ height: 56 }}>Add</Button>
                  <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => removeFilter(index)} sx={{ height: 56 }}>Remove</Button>
                </Stack>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={searchStudents} disabled={loading}>
              Load Students
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ p: 1 }}>
          <Chip label={`Students loaded: ${rows.length}`} />
          <Chip color="primary" label={`Selected: ${selection.length}`} />
          <Chip color="success" label={`With email: ${selectedStudents.filter((student) => student.email).length}`} />
        </Stack>
        <DataGrid
          rows={rows}
          getRowId={(row) => row._id}
          columns={columns}
          loading={loading}
          checkboxSelection
          rowSelectionModel={selection}
          onRowSelectionModelChange={(ids) => setSelection(ids)}
          disableRowSelectionOnClick
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_email_recipients" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          sx={{ minWidth: 2100 }}
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Message</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Message Text"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<EmailIcon />} onClick={sendEmail} disabled={sending || !selection.length}>
              Send Email
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
