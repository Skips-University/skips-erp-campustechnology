import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, ArrowBack, Refresh, Search } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const categories = ["General", "SC", "ST", "OBC", "EWS", "EBC", "PH", "Supernumerary", "Sports"];
const genders = ["Male", "Female", "Not specified"];
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const subjectTypes = ["Major", "Minor", "AEC", "SEC", "VAC", "IDC"];

const blankSearch = {
  academicyear: "",
  name: "",
  email: "",
  phone: "",
  programcode: "",
  category: ""
};

const blankUser = {
  name: "",
  email: "",
  phone: "",
  password: "Password@123",
  regno: "",
  programcode: "",
  admissionyear: "",
  semester: "1",
  section: "",
  gender: "Not specified",
  department: "",
  category: "General",
  address: "",
  regulation: "",
  samestate: "Yes",
  Major: "",
  Minor: "",
  AEC: "",
  SEC: "",
  VAC: "",
  IDC: ""
};

export default function DynamicAdmissionToUserPage() {
  const colid = useMemo(() => global1.colid, []);
  const [search, setSearch] = useState(blankSearch);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState({});
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [userForm, setUserForm] = useState(blankUser);
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [registrationRule, setRegistrationRule] = useState("");
  const [generatingRegno, setGeneratingRegno] = useState(false);
  const [generatePassword, setGeneratePassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (userForm.admissionyear) loadRegulations(userForm.admissionyear);
  }, [userForm.admissionyear]);

  useEffect(() => {
    subjectTypes.forEach((type) => loadSubjects(type));
  }, [userForm.admissionyear, userForm.regulation, userForm.programcode]);

  useEffect(() => {
    checkCapacity();
  }, [userForm.admissionyear, userForm.regulation, userForm.programcode, userForm.category, userForm.samestate, userForm.Major, userForm.Minor]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/dynamic-admission-to-user/options", { params: { colid } });
      setPrograms(res.data.programs || []);
      setAcademicYears(res.data.academicyears || []);
      setDynamicFields(res.data.dynamicFields || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load options");
    }
  };

  const loadRegulations = async (academicyear) => {
    try {
      const res = await ep1.get("/api/v2/dynamic-admission-to-user/regulations", { params: { colid, academicyear } });
      setRegulations(res.data.data || []);
    } catch (err) {
      setRegulations([]);
    }
  };

  const loadSubjects = async (type) => {
    if (!userForm.admissionyear || !userForm.regulation || !userForm.programcode) {
      setSubjectOptions((prev) => ({ ...prev, [type]: [] }));
      return;
    }
    try {
      const res = await ep1.get("/api/v2/dynamic-admission-to-user/subjects", {
        params: {
          colid,
          academicyear: userForm.admissionyear,
          regulation: userForm.regulation,
          programcode: userForm.programcode,
          type
        }
      });
      setSubjectOptions((prev) => ({ ...prev, [type]: res.data.data || [] }));
    } catch (err) {
      setSubjectOptions((prev) => ({ ...prev, [type]: [] }));
    }
  };

  const searchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/dynamic-admission-to-user/search", {
        colid,
        ...search,
        dynamicFilters: dynamicFilters.filter((item) => item.fieldname && item.value)
      });
      setApplications(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search applications");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (field, value) => {
    if (field === "Major" && value && value === userForm.Minor) {
      setError("Major and Minor cannot be the same subject");
      return;
    }
    if (field === "Minor" && value && value === userForm.Major) {
      setError("Major and Minor cannot be the same subject");
      return;
    }
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const createComplicatedPassword = () => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%^&*?";
    const all = upper + lower + digits + symbols;
    const randomChar = (chars) => {
      const values = new Uint32Array(1);
      if (window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(values);
        return chars[values[0] % chars.length];
      }
      return chars[Math.floor(Math.random() * chars.length)];
    };
    const required = [upper, lower, digits, symbols].map(randomChar);
    const rest = Array.from({ length: 10 }, () => randomChar(all));
    return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
  };

  const handleGeneratePasswordChange = (event) => {
    const checked = event.target.checked;
    setGeneratePassword(checked);
    if (checked) updateUser("password", createComplicatedPassword());
  };

  const selectApplication = (application) => {
    setSelectedApplication(application);
    setMessage("");
    setError("");
    const programName = application.programapplied || application.programcode || "";
    setUserForm({
      ...blankUser,
      name: application.name || "",
      email: application.email || "",
      phone: application.phone || "",
      programcode: application.programcode || "",
      admissionyear: application.academicyear || "",
      gender: application.gender || "Not specified",
      department: programName,
      category: categories.includes(application.category) ? application.category : "General",
      address: application.address || ""
    });
  };

  const checkCapacity = async () => {
    if (!userForm.admissionyear || !userForm.regulation || !userForm.programcode || !userForm.category || !userForm.samestate || !userForm.Major) {
      setCapacity(null);
      return;
    }
    try {
      const res = await ep1.post("/api/v2/dynamic-admission-to-user/capacity", {
        colid,
        academicyear: userForm.admissionyear,
        regulation: userForm.regulation,
        programcode: userForm.programcode,
        category: userForm.category,
        samestate: userForm.samestate,
        major: userForm.Major,
        minor: userForm.Minor
      });
      setCapacity(res.data.data);
    } catch (err) {
      setCapacity(null);
    }
  };

  const admitStudent = async () => {
    if (!selectedApplication?._id) {
      setError("Select a student first");
      return;
    }
    if (userForm.Major && userForm.Minor && userForm.Major === userForm.Minor) {
      setError("Major and Minor cannot be the same subject");
      return;
    }
    if (!capacity?.major || capacity.major.availableSeats <= 0) {
      window.alert("Admission not available");
      setError("Admission not available. No Major seats left.");
      return;
    }
    if (userForm.Minor && (!capacity?.minor || capacity.minor.availableSeats <= 0)) {
      window.alert("Admission not available");
      setError("Admission not available. No Minor seats left.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/dynamic-admission-to-user/admit", {
        colid,
        applicationId: selectedApplication._id,
        userData: {
          ...userForm,
          user: global1.user,
          addedby: global1.user,
          institution: global1.insname
        }
      });
      setMessage(res.data.message || "Student admitted");
      window.alert(res.data.message || "Student admitted and user created");
      setSelectedApplication(null);
      setUserForm(blankUser);
      setGeneratePassword(false);
      setCapacity(null);
      await searchApplications();
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to admit student";
      if (msg.toLowerCase().includes("no seats")) window.alert("Admission not available");
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const generateRegistrationNumber = async () => {
    if (!selectedApplication?._id) {
      setError("Select a student first");
      return;
    }
    if (!registrationRule.trim()) {
      setError("Enter a registration rule first");
      return;
    }
    setGeneratingRegno(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/api/v2/dynamic-admission-to-user/generate-regno", {
        colid,
        rule: registrationRule,
        programcode: userForm.programcode,
        application: selectedApplication,
        userData: userForm
      });
      updateUser("regno", res.data?.registrationNumber || "");
      setMessage(res.data?.reason ? `Registration number generated. ${res.data.reason}` : "Registration number generated");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate registration number");
    } finally {
      setGeneratingRegno(false);
    }
  };

  const addDynamicFilter = () => setDynamicFilters((prev) => [...prev, { fieldname: "", value: "" }]);

  const updateDynamicFilter = (index, field, value) => {
    setDynamicFilters((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const columns = [
    { field: "name", headerName: "Name", width: 180 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "programapplied", headerName: "Program", width: 220 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "gender", headerName: "Gender", width: 120 },
    {
      field: "extraFields",
      headerName: "Dynamic Fields",
      width: 260,
      valueGetter: (params) => Object.entries(params.row.extraFields || {}).map(([key, value]) => `${key}: ${value}`).join(", ")
    },
    {
      field: "action",
      headerName: "Action",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" onClick={() => selectApplication(params.row)}>
          Select
        </Button>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Admit Dynamic Application</Typography>
          <Typography variant="body2" color="text.secondary">Search applied students, check Major seat availability, and create student user</Typography>
        </Box>
        <Button component={RouterLink} to="/dashdashfacnew" variant="outlined" startIcon={<ArrowBack />}>Dashboard</Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth size="small" label="Academic Year" value={search.academicyear} onChange={(e) => setSearch((prev) => ({ ...prev, academicyear: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Name" value={search.name} onChange={(e) => setSearch((prev) => ({ ...prev, name: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Email" value={search.email} onChange={(e) => setSearch((prev) => ({ ...prev, email: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth size="small" label="Phone" value={search.phone} onChange={(e) => setSearch((prev) => ({ ...prev, phone: e.target.value }))} /></Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth size="small" label="Program" value={search.programcode} onChange={(e) => setSearch((prev) => ({ ...prev, programcode: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {programs.map((program) => <MenuItem key={program.programcode} value={program.programcode}>{program.program} ({program.programcode})</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth size="small" label="Category" value={search.category} onChange={(e) => setSearch((prev) => ({ ...prev, category: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
            </TextField>
          </Grid>
          {dynamicFilters.map((filter, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth size="small" label="Dynamic Field" value={filter.fieldname} onChange={(e) => updateDynamicFilter(index, "fieldname", e.target.value)}>
                  {dynamicFields.map((field) => <MenuItem key={field.fieldname} value={field.fieldname}>{field.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth size="small" label="Value" value={filter.value} onChange={(e) => updateDynamicFilter(index, "value", e.target.value)} />
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Add />} onClick={addDynamicFilter}>Dynamic Filter</Button>
              <Button variant="contained" startIcon={<Search />} onClick={searchApplications}>Search Applied</Button>
              <Tooltip title="Reload options"><IconButton color="primary" onClick={loadOptions}><Refresh /></IconButton></Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 1 }}>
            <Box sx={{ height: 560, width: "100%", overflowX: "auto" }}>
              <DataGrid
                rows={applications}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "applied_dynamic_admissions" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                disableRowSelectionOnClick
                sx={{ minWidth: 1650 }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">Create User</Typography>
              {selectedApplication && <Chip label={`Selected: ${selectedApplication.name}`} />}
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Name" value={userForm.name} onChange={(e) => updateUser("name", e.target.value)} required /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Email" value={userForm.email} onChange={(e) => updateUser("email", e.target.value)} required /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Phone" value={userForm.phone} onChange={(e) => updateUser("phone", e.target.value)} required /></Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={0.5}>
                    <TextField fullWidth size="small" label="Password" value={userForm.password} onChange={(e) => updateUser("password", e.target.value)} required />
                    <FormControlLabel
                      control={<Checkbox size="small" checked={generatePassword} onChange={handleGeneratePasswordChange} />}
                      label="Generate complicated password"
                      sx={{ m: 0 }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "flex-start" }}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      label="Registration Rule"
                      value={registrationRule}
                      onChange={(e) => setRegistrationRule(e.target.value)}
                      placeholder="Example: AY last two digits + program code + 4 digit running number based on existing students"
                    />
                    <Button
                      variant="outlined"
                      onClick={generateRegistrationNumber}
                      disabled={generatingRegno || !selectedApplication}
                      sx={{ minWidth: 210, minHeight: 40 }}
                    >
                      {generatingRegno ? "Generating..." : "Create Automatic Reg No"}
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Reg No" value={userForm.regno} onChange={(e) => updateUser("regno", e.target.value)} required /></Grid>
                <Grid item xs={12} md={6}>
                  <TextField select fullWidth size="small" label="Semester" value={userForm.semester} onChange={(e) => updateUser("semester", e.target.value)} required>
                    {semesters.map((semester) => <MenuItem key={semester} value={semester}>{semester}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Section" value={userForm.section} onChange={(e) => updateUser("section", e.target.value)} required /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Program Code" value={userForm.programcode} onChange={(e) => updateUser("programcode", e.target.value)} required /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Academic Year" value={userForm.admissionyear} onChange={(e) => updateUser("admissionyear", e.target.value)} required /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Program/Department" value={userForm.department} onChange={(e) => updateUser("department", e.target.value)} required /></Grid>
                <Grid item xs={12} md={6}>
                  <TextField select fullWidth size="small" label="Category" value={userForm.category} onChange={(e) => updateUser("category", e.target.value)}>
                    {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select fullWidth size="small" label="Gender" value={userForm.gender} onChange={(e) => updateUser("gender", e.target.value)}>
                    {genders.map((gender) => <MenuItem key={gender} value={gender}>{gender}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Address" value={userForm.address} onChange={(e) => updateUser("address", e.target.value)} /></Grid>
                <Grid item xs={12} md={6}>
                  <TextField select fullWidth size="small" label="Regulation" value={userForm.regulation} onChange={(e) => updateUser("regulation", e.target.value)} required>
                    {regulations.map((regulation) => <MenuItem key={regulation._id} value={regulation.regulation}>{regulation.regulation}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select fullWidth size="small" label="Same State" value={userForm.samestate} onChange={(e) => updateUser("samestate", e.target.value)}>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>
                {subjectTypes.map((type) => (
                  <Grid item xs={12} md={6} key={type}>
                    <TextField select fullWidth size="small" label={type} value={userForm[type]} onChange={(e) => updateUser(type, e.target.value)} required={type === "Major"}>
                      <MenuItem value="">None</MenuItem>
                      {(subjectOptions[type] || []).map((subject) => <MenuItem key={`${type}-${subject}`} value={subject}>{subject}</MenuItem>)}
                    </TextField>
                  </Grid>
                ))}
              </Grid>

              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Seat availability</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`Major Total: ${capacity?.major?.totalSeats ?? "-"}`} />
                    <Chip label={`Major Admitted: ${capacity?.major?.admitted ?? "-"}`} />
                    <Chip color={(capacity?.major?.availableSeats || 0) > 0 ? "success" : "error"} label={`Major Available: ${capacity?.major?.availableSeats ?? "-"}`} />
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`Minor Total: ${capacity?.minor?.totalSeats ?? "-"}`} />
                    <Chip label={`Minor Admitted: ${capacity?.minor?.admitted ?? "-"}`} />
                    <Chip color={!userForm.Minor || (capacity?.minor?.availableSeats || 0) > 0 ? "success" : "error"} label={`Minor Available: ${capacity?.minor?.availableSeats ?? "-"}`} />
                  </Stack>
                </Stack>
              </Paper>

              <Button variant="contained" color="success" onClick={admitStudent} disabled={saving || !selectedApplication}>
                {saving ? "Admitting..." : "Add Student to User"}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
