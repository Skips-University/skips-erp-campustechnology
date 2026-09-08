import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Typography
} from "@mui/material";
import { PersonAdd, Search } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const requiredFields = [
  "name",
  "email",
  "phone",
  "password",
  "role",
  "regno",
  "programcode",
  "admissionyear",
  "semester",
  "section",
  "department",
  "colid",
  "status"
];

const baseFormData = {
  colid: global1.colid || "",
  user: global1.user || "",
  name: "",
  email: "",
  phone: "",
  password: "Password@123",
  role: "Student",
  regno: "",
  programcode: "",
  admissionyear: "2026-27",
  semester: "1",
  section: "",
  gender: "Not specified",
  department: "",
  category: "",
  address: "",
  status: 1,
  fathername: "",
  mothername: "",
  dob: "",
  institution: global1.insname || ""
};

const searchFields = [
  { name: "search", label: "Search" },
  { name: "name", label: "Name" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "category", label: "Category" },
  { name: "program", label: "Program" },
  { name: "course_interested", label: "Course Interested" },
  { name: "pipeline_stage", label: "Pipeline Stage" },
  { name: "leadstatus", label: "Lead Status" }
];

const formFields = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "password", label: "Password" },
  { name: "role", label: "Role" },
  { name: "regno", label: "Registration No" },
  { name: "programcode", label: "Program Code" },
  { name: "admissionyear", label: "Admission Year" },
  { name: "semester", label: "Semester" },
  { name: "section", label: "Section" },
  { name: "gender", label: "Gender" },
  { name: "department", label: "Department" },
  { name: "category", label: "Category" },
  { name: "address", label: "Address" },
  { name: "fathername", label: "Father Name" },
  { name: "mothername", label: "Mother Name" },
  { name: "dob", label: "DOB", type: "date" },
  { name: "institution", label: "Institution" }
];

const getMissingFields = (data) =>
  requiredFields.filter((field) => !data[field] && data[field] !== 0);

const LeadToUserds = () => {
  const [filters, setFilters] = useState({ search: "" });
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState(baseFormData);
  const [missingFields, setMissingFields] = useState(getMissingFields(baseFormData));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    setMissingFields(getMissingFields(nextData));
  };

  const searchLeads = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")
      );
      params.colid = global1.colid;
      const response = await ep1.get("/api/v2/searchcrmleadsforuserds", { params });
      setLeads(response.data.data || []);
      setSelectedLead(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error searching leads");
    }

    setLoading(false);
  };

  const selectLead = async (lead) => {
    setSelectedLead(lead);
    setMessage("");
    setError("");

    try {
      const response = await ep1.get("/api/v2/getleaduserprefillds", {
        params: { lead_id: lead._id }
      });
      const nextData = {
        ...baseFormData,
        ...response.data.data.userData,
        colid: global1.colid || response.data.data.userData.colid || "",
        user: global1.user || "",
        admissionyear: response.data.data.userData.admissionyear || "2026-27",
        semester: response.data.data.userData.semester || "1",
        gender: response.data.data.userData.gender || "Not specified",
        institution: global1.insname || ""
      };
      setFormData(nextData);
      setMissingFields(response.data.data.missingRequiredFields || getMissingFields(nextData));
    } catch (err) {
      setError(err.response?.data?.message || "Error loading lead data");
    }
  };

  const createUser = async (event) => {
    event.preventDefault();

    const currentMissing = getMissingFields(formData);
    setMissingFields(currentMissing);

    if (!selectedLead) {
      setError("Select a CRM lead first");
      return;
    }

    if (currentMissing.length > 0) {
      setError(`Please fill required fields: ${currentMissing.join(", ")}`);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await ep1.post("/api/v2/createuserfromleadds", {
        lead_id: selectedLead._id,
        userData: {
          ...formData,
          colid: global1.colid,
          user: global1.user || "",
          admissionyear: formData.admissionyear || "2026-27",
          semester: formData.semester || "1",
          gender: formData.gender || "Not specified",
          institution: global1.insname || ""
        }
      });
      setMessage("User created from selected lead successfully");
      window.alert("User is created");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user from lead");
    }

    setSaving(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            CRM Lead To User
          </Typography>
          <Typography color="text.secondary">
            Search CRM leads by college and admission details, then insert the selected lead into the user model.
          </Typography>
        </Box>

        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={searchLeads}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label="Colid" value={global1.colid || ""} InputProps={{ readOnly: true }} />
              </Grid>
              {searchFields.map((field) => (
                <Grid item xs={12} md={field.name === "search" ? 4 : 2} key={field.name}>
                  <TextField
                    fullWidth
                    label={field.label}
                    name={field.name}
                    value={filters[field.name] || ""}
                    onChange={handleFilterChange}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" startIcon={<Search />} disabled={loading}>
                  {loading ? "Searching..." : "Search Leads"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Program</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow selected={selectedLead?._id === lead._id} key={lead._id}>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.category}</TableCell>
                  <TableCell>{lead.program || lead.course_interested}</TableCell>
                  <TableCell>{lead.pipeline_stage}</TableCell>
                  <TableCell>{lead.leadstatus}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => selectLead(lead)}>
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No leads loaded
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={createUser}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="h6">User Data</Typography>
                {selectedLead && <Chip label={`Selected: ${selectedLead.name}`} color="primary" variant="outlined" />}
              </Box>

              {missingFields.length > 0 && (
                <Alert severity="warning">Required fields missing: {missingFields.join(", ")}</Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth required label="Colid" value={global1.colid || formData.colid || ""} InputProps={{ readOnly: true }} />
                </Grid>
                {formFields.map((field) => {
                  if (field.name === "gender") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth select label={field.label} name={field.name} value={formData.gender || "Not specified"} onChange={handleFormChange}>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Not specified">Not specified</MenuItem>
                        </TextField>
                      </Grid>
                    );
                  }

                  if (field.name === "semester") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth required select label={field.label} name={field.name} value={formData.semester || "1"} onChange={handleFormChange}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((semester) => (
                            <MenuItem key={semester} value={String(semester)}>
                              {semester}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    );
                  }

                  if (field.name === "admissionyear") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth required select label={field.label} name={field.name} value={formData.admissionyear || "2026-27"} onChange={handleFormChange}>
                          <MenuItem value="2026-27">2026-27</MenuItem>
                          <MenuItem value="2025-26">2025-26</MenuItem>
                        </TextField>
                      </Grid>
                    );
                  }

                  if (field.name === "institution") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth label={field.label} value={global1.insname || formData.institution || ""} InputProps={{ readOnly: true }} />
                      </Grid>
                    );
                  }

                  return (
                    <Grid item xs={12} md={4} key={field.name}>
                      <TextField
                        fullWidth
                        required={requiredFields.includes(field.name)}
                        label={field.label}
                        name={field.name}
                        type={field.type || "text"}
                        value={formData[field.name] || ""}
                        onChange={handleFormChange}
                        InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                      />
                    </Grid>
                  );
                })}
              </Grid>

              <Box>
                <Button type="submit" variant="contained" startIcon={<PersonAdd />} disabled={saving || !selectedLead}>
                  {saving ? "Creating..." : "Create User From Lead"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
};

export default LeadToUserds;
