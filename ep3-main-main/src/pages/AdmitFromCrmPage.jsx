import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  List,
  Paper,
  Stack,
  TextField,
  Toolbar,
  MenuItem,
  Radio,
  RadioGroup,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import { PersonAdd, Search } from "@mui/icons-material";
import { Link } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { mainListItems } from "./menucas1";

const sidebarWidth = 250;

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: sidebarWidth,
    width: `calc(100% - ${sidebarWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: sidebarWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9)
      }
    })
  }
}));

const mdTheme = createTheme();

const requiredFields = [
  "name",
  "email",
  "phone",
  "password",
  "role",
  "regno",
  "programcode",
  "category",
  "regulation",
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
  program: "",
  programcode: "",
  admissionyear: "2026-27",
  academicyear: "2026-27",
  regulation: "",
  Major: "",
  Minor: "",
  admissiontype: "Regular",
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
  { name: "category", label: "Category", optionsKey: "category" },
  { name: "program", label: "Program", optionsKey: "program" },
  { name: "course_interested", label: "Course Interested", optionsKey: "course_interested" },
  { name: "pipeline_stage", label: "Pipeline Stage", optionsKey: "pipeline_stage" },
  { name: "leadstatus", label: "Lead Status", optionsKey: "leadstatus" }
];

const formFields = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "password", label: "Password" },
  { name: "role", label: "Role" },
  { name: "regno", label: "Registration No" },
  { name: "academicyear", label: "Academic Year" },
  { name: "regulation", label: "Regulation" },
  { name: "program", label: "Program" },
  { name: "programcode", label: "Program Code" },
  { name: "Major", label: "Major" },
  { name: "Minor", label: "Minor" },
  { name: "admissiontype", label: "Admission Type" },
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

const generateUniquePassword = () => {
  const symbols = "!@#$%^&*";
  const bytes = new Uint32Array(4);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    bytes.set(bytes.map(() => Math.floor(Math.random() * 4294967295)));
  }
  const randomText = Array.from(bytes).map((value) => value.toString(36)).join("");
  const suffix = Date.now().toString(36);
  return `Crm${randomText.slice(0, 6)}${symbols[bytes[0] % symbols.length]}${suffix.slice(-4)}A1`;
};

const academicYearOptions = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];
const categoryOptions = ["General", "SC", "ST", "OBC", "Others"];
const admissionTypeOptions = ["Regular", "Lateral", "Transfer"];

const AdmitFromCrmPage = () => {
  const [open, setOpen] = useState(true);
  const [passwordMode, setPasswordMode] = useState("manual");
  const [filters, setFilters] = useState({ search: "" });
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState(baseFormData);
  const [regulations, setRegulations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState({ Major: [], Minor: [] });
  const [crmFilterOptions, setCrmFilterOptions] = useState({});
  const [missingFields, setMissingFields] = useState(getMissingFields(baseFormData));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toggleDrawer = () => {
    setOpen((current) => !current);
  };

  useEffect(() => {
    loadAdmissionOptions();
  }, [formData.academicyear, formData.regulation, formData.programcode]);

  const loadAdmissionOptions = async () => {
    try {
      const response = await ep1.get("/api/v2/crmadmitoptionsds", {
        params: {
          colid: global1.colid,
          academicyear: formData.academicyear,
          regulation: formData.regulation,
          programcode: formData.programcode
        }
      });
      setRegulations(response.data.data?.regulations || []);
      setPrograms(response.data.data?.programs || []);
      setSubjectOptions(response.data.data?.subjectOptions || { Major: [], Minor: [] });
      setCrmFilterOptions(response.data.data?.crmFilterOptions || {});
    } catch (err) {
      setRegulations([]);
      setPrograms([]);
      setSubjectOptions({ Major: [], Minor: [] });
      setCrmFilterOptions({});
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    let nextData = { ...formData, [name]: value };
    if (name === "academicyear") {
      nextData = { ...nextData, admissionyear: value, regulation: "", program: "", programcode: "", Major: "", Minor: "", department: "" };
    }
    if (name === "regulation") {
      nextData = { ...nextData, program: "", programcode: "", Major: "", Minor: "", department: "" };
    }
    if (name === "programcode") {
      const selectedProgram = programs.find((item) => item.programcode === value);
      nextData = {
        ...nextData,
        programcode: value,
        program: selectedProgram?.program || "",
        Major: "",
        Minor: "",
        department: selectedProgram?.program || nextData.department || ""
      };
    }
    if (name === "admissiontype") {
      if (value === "Regular") nextData = { ...nextData, semester: "1" };
      if (value === "Lateral") nextData = { ...nextData, semester: "3" };
      if (value === "Transfer") nextData = { ...nextData, semester: nextData.semester || "1" };
    }
    setFormData(nextData);
    setMissingFields(getMissingFields(nextData));
  };

  const handlePasswordModeChange = (event) => {
    const value = event.target.value;
    setPasswordMode(value);
    if (value === "auto") {
      const nextData = { ...formData, password: generateUniquePassword() };
      setFormData(nextData);
      setMissingFields(getMissingFields(nextData));
    }
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
        academicyear: formData.academicyear || response.data.data.userData.academicyear || response.data.data.userData.admissionyear || "2026-27",
        admissionyear: formData.academicyear || response.data.data.userData.academicyear || response.data.data.userData.admissionyear || "2026-27",
        regulation: formData.regulation || response.data.data.userData.regulation || "",
        program: formData.program || response.data.data.userData.program || "",
        programcode: formData.programcode || response.data.data.userData.programcode || "",
        Major: formData.Major || response.data.data.userData.Major || "",
        Minor: formData.Minor || response.data.data.userData.Minor || "",
        department: formData.department || response.data.data.userData.department || "",
        category: formData.category || response.data.data.userData.category || "",
        admissiontype: formData.admissiontype || response.data.data.userData.admissiontype || "Regular",
        semester: formData.admissiontype === "Lateral" ? "3" : formData.admissiontype === "Transfer" ? (formData.semester || response.data.data.userData.semester || "1") : "1",
        gender: response.data.data.userData.gender || "Not specified",
        institution: global1.insname || "",
        password: passwordMode === "auto" ? generateUniquePassword() : (response.data.data.userData.password || baseFormData.password)
      };
      setFormData(nextData);
      setMissingFields(response.data.data.missingRequiredFields || getMissingFields(nextData));
    } catch (err) {
      setError(err.response?.data?.message || "Error loading lead data");
    }
  };

  const createUser = async (event) => {
    event.preventDefault();

    const submissionData = {
      ...formData,
      password: passwordMode === "auto" ? generateUniquePassword() : formData.password
    };
    if (passwordMode === "auto") {
      setFormData(submissionData);
    }

    const currentMissing = getMissingFields(submissionData);
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
          ...submissionData,
          colid: global1.colid,
          user: global1.user || "",
          admissionyear: submissionData.academicyear || "2026-27",
          academicyear: submissionData.academicyear || "2026-27",
          regulation: submissionData.regulation || "",
          program: submissionData.program || "",
          Major: submissionData.Major || "",
          Minor: submissionData.Minor || "",
          admissiontype: submissionData.admissiontype || "Regular",
          semester: submissionData.semester || "1",
          gender: submissionData.gender || "Not specified",
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

  const leadColumns = [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 140, flex: 0.7 },
    { field: "category", headerName: "Category", minWidth: 130, flex: 0.6 },
    {
      field: "programDisplay",
      headerName: "Program",
      minWidth: 200,
      flex: 1,
      valueGetter: (params) => params.row.program || params.row.course_interested || ""
    },
    { field: "pipeline_stage", headerName: "Stage", minWidth: 170, flex: 0.8 },
    { field: "leadstatus", headerName: "Status", minWidth: 140, flex: 0.7 },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" onClick={() => selectLead(params.row)}>
          Select
        </Button>
      )
    }
  ];

  const pageContent = (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Admit from CRM
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
              {searchFields.map((field) => (
                <Grid item xs={12} md={field.name === "search" ? 4 : 2} key={field.name}>
                  <TextField
                    fullWidth
                    select={Boolean(field.optionsKey)}
                    label={field.label}
                    name={field.name}
                    value={filters[field.name] || ""}
                    onChange={handleFilterChange}
                  >
                    {field.optionsKey && <MenuItem value="">All</MenuItem>}
                    {field.optionsKey && (crmFilterOptions[field.optionsKey] || []).map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>
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

        <Paper sx={{ p: 2 }}>
          <DataGrid
            autoHeight
            rows={leads}
            columns={leadColumns}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            onRowClick={(params) => selectLead(params.row)}
            getRowClassName={(params) => selectedLead?._id === params.id ? "selected-lead-row" : ""}
            sx={{
              minHeight: 360,
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f7fb", fontWeight: 700 },
              "& .MuiDataGrid-cell": { outline: "none" },
              "& .selected-lead-row": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
              "& .selected-lead-row:hover": { backgroundColor: "rgba(25, 118, 210, 0.14)" }
            }}
          />
        </Paper>

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
                {formFields.map((field) => {
                  if (field.name === "academicyear") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth required select label={field.label} name={field.name} value={formData.academicyear || "2026-27"} onChange={handleFormChange}>
                          {academicYearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                        </TextField>
                      </Grid>
                    );
                  }

                  if (field.name === "password") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <Stack spacing={1}>
                          <FormControl>
                            <FormLabel>Password Option</FormLabel>
                            <RadioGroup row value={passwordMode} onChange={handlePasswordModeChange}>
                              <FormControlLabel value="manual" control={<Radio size="small" />} label="Enter password" />
                              <FormControlLabel value="auto" control={<Radio size="small" />} label="Generate automatically" />
                            </RadioGroup>
                          </FormControl>
                          <TextField
                            fullWidth
                            required
                            label={field.label}
                            name={field.name}
                            value={formData.password || ""}
                            onChange={handleFormChange}
                            InputProps={passwordMode === "auto" ? { readOnly: true } : undefined}
                            helperText={passwordMode === "auto" ? "A unique password will be generated automatically" : ""}
                          />
                        </Stack>
                      </Grid>
                    );
                  }

                  if (field.name === "regulation") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth required select label={field.label} name={field.name} value={formData.regulation || ""} onChange={handleFormChange}>
                          {regulations.map((item) => (
                            <MenuItem key={item._id || item.regulation} value={item.regulation}>{item.regulation}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    );
                  }

                  if (field.name === "program") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField
                          fullWidth
                          required
                          select
                          label={field.label}
                          name="programcode"
                          value={formData.programcode || ""}
                          onChange={handleFormChange}
                          helperText={!formData.academicyear || !formData.regulation ? "Select academic year and regulation first" : ""}
                        >
                          {programs.map((item) => (
                            <MenuItem key={item.programcode || item.program} value={item.programcode}>
                              {item.program} ({item.programcode})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    );
                  }

                  if (field.name === "programcode") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth required label={field.label} name={field.name} value={formData.programcode || ""} InputProps={{ readOnly: true }} />
                      </Grid>
                    );
                  }

                  if (field.name === "Major" || field.name === "Minor") {
                    const options = subjectOptions[field.name] || [];
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField
                          fullWidth
                          select
                          label={field.label}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleFormChange}
                          helperText={!formData.programcode ? "Select program first" : ""}
                        >
                          <MenuItem value="">Select {field.label}</MenuItem>
                          {options.map((subject) => (
                            <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    );
                  }

                  if (field.name === "category") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth required select label={field.label} name={field.name} value={formData.category || ""} onChange={handleFormChange}>
                          {categoryOptions.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                        </TextField>
                      </Grid>
                    );
                  }

                  if (field.name === "admissiontype") {
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField fullWidth required select label={field.label} name={field.name} value={formData.admissiontype || "Regular"} onChange={handleFormChange}>
                          {admissionTypeOptions.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                        </TextField>
                      </Grid>
                    );
                  }

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
                    const fixedSemester = formData.admissiontype === "Regular" || formData.admissiontype === "Lateral";
                    return (
                      <Grid item xs={12} md={4} key={field.name}>
                        <TextField
                          fullWidth
                          required
                          select
                          label={field.label}
                          name={field.name}
                          value={formData.semester || "1"}
                          onChange={handleFormChange}
                          InputProps={fixedSemester ? { readOnly: true } : undefined}
                          helperText={fixedSemester ? "Semester is fixed by admission type" : ""}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((semester) => (
                            <MenuItem key={semester} value={String(semester)}>
                              {semester}
                            </MenuItem>
                          ))}
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
                  {saving ? "Creating..." : "Admit From CRM"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBarStyled position="absolute" open={open}>
          <Toolbar sx={{ pr: "24px" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{ marginRight: "36px", ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              Admit from CRM
            </Typography>
            <Button color="inherit" component={Link} to="/dashdashfacnew">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/Login">
              Sign out
            </Button>
          </Toolbar>
        </AppBarStyled>
        <DrawerStyled variant="permanent" open={open}>
          <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: [1] }}>
            <Typography component="h1" variant="body1" color="inherit" noWrap sx={{ flexGrow: 1, ml: 1 }}>
              {global1.name}
            </Typography>
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List>{mainListItems({ open })}</List>
        </DrawerStyled>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) => theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto"
          }}
        >
          <Toolbar />
          {pageContent}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdmitFromCrmPage;
