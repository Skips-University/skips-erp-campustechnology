import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { AutoFixHigh, Dataset, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const years = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const moduleCards = [
  "Users and profile basics",
  "Academic management",
  "LMS workload, timetable and attendance",
  "Fees ledger and fee collection",
  "Exam and conduct examination",
  "Budget approval data",
  "Vendor and purchase",
  "HR leave, attendance and salary"
];
const generatorSections = [
  { key: "periods", label: "Periods", description: "Programwise period slots for weekdays" },
  { key: "timetable", label: "Timetable", description: "Class timetable based on workload and courses" },
  { key: "classes", label: "Classes", description: "Class groups linked to faculty, course and students" },
  { key: "studentMentoring", label: "Student mentoring", description: "Mentoring sessions mapped to faculty and students" },
  { key: "homeVisits", label: "Home visits", description: "Home visit details for mentored students" },
  { key: "salaryStructure", label: "Salary structure", description: "Dummy salary structures for employees" },
  { key: "salary", label: "Salary", description: "Monthly salary rows for employees" },
  { key: "shiftTimings", label: "Shift timings", description: "General, morning and evening shift masters" },
  { key: "shiftAllocation", label: "Shift allocation", description: "Employee shift mappings from generated users" },
  { key: "counterFeesPayment", label: "Counter fees payment", description: "Counter receipt transactions linked to ledger" },
  { key: "examFormBuilder", label: "Exam form builder", description: "Regular and supplementary exam forms" },
  { key: "supplementaryAttendanceWorkflow", label: "Supplementary attendance workflow", description: "Categorywise approval workflow" },
  { key: "feesApprovalWorkflow", label: "Fees approval workflow", description: "Program/institution style fee approval levels" },
  { key: "conductExam", label: "Conduct exam pages", description: "Rooms, dates, rate cards, setters, moderators and papers" }
];

const blank = {
  academicyear: "2026-27",
  count: 10,
  students: 10,
  employees: 8,
  programs: 3,
  recordsPerCourse: 5,
  periodProgramCodes: [],
  periodsPerDay: 6,
  periodStartTime: "09:00",
  periodDurationMinutes: 60,
  periodGapMinutes: 0,
  includeExistingUsers: true,
  sections: generatorSections.map((section) => section.key),
  password: ""
};

export default function DummyDataGeneratorPage() {
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState([]);
  const [roleUsers, setRoleUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [periodOptions, setPeriodOptions] = useState({ programs: [] });

  const payload = useMemo(() => ({
    ...form,
    count: Number(form.count || 1),
    students: Number(form.students || form.count || 1),
    employees: Number(form.employees || Math.ceil(Number(form.count || 1) / 2)),
    programs: Number(form.programs || 2),
    recordsPerCourse: Number(form.recordsPerCourse || 5),
    periodsPerDay: Number(form.periodsPerDay || 6),
    periodDurationMinutes: Number(form.periodDurationMinutes || 60),
    periodGapMinutes: Number(form.periodGapMinutes || 0),
    colid: global1.colid,
    user: global1.user,
    username: global1.name
  }), [form]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  useEffect(() => {
    ep1.get("/api/v2/program-period-slots/options", { params: { colid: global1.colid } })
      .then((res) => setPeriodOptions(res.data || { programs: [] }))
      .catch(() => setPeriodOptions({ programs: [] }));
  }, []);
  const toggleSection = (key) => {
    setForm((prev) => {
      const current = new Set(prev.sections || []);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      return { ...prev, sections: Array.from(current) };
    });
  };

  const generate = async (sectionsOnly = false) => {
    const confirmText = sectionsOnly
      ? "Generate dummy data only for the selected sections using existing master data? Existing matching section records may be updated."
      : "Create related dummy data for this institution? Existing matching dummy records may be updated.";
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError("");
    setMessage("");
    setSummary([]);
    setMeta(null);
    try {
      const res = await ep1.post("/api/v2/dummy-data/generate", { ...payload, sectionsOnly });
      setSummary((res.data?.summary || []).map((row, index) => ({ ...row, id: index + 1 })));
      setRoleUsers((res.data?.roleUsers || []).map((row, index) => ({ ...row, id: row._id || index + 1 })));
      setMeta(res.data?.meta || null);
      setMessage(res.data?.message || (sectionsOnly ? "Selected sections generated" : "Dummy data generated"));
    } catch (err) {
      setSummary((err.response?.data?.summary || []).map((row, index) => ({ ...row, id: index + 1 })));
      setRoleUsers([]);
      setError(err.response?.data?.message || "Unable to generate dummy data");
    } finally {
      setBusy(false);
    }
  };
  const generatePeriodsOnly = async () => {
    if (!window.confirm("Generate only missing weekday periods for the selected programs?")) return;
    setBusy(true);
    setError("");
    setMessage("");
    setSummary([]);
    setMeta(null);
    try {
      const res = await ep1.post("/api/v2/dummy-data/generate", { ...payload, sectionsOnly: true, sections: ["periods"] });
      setSummary((res.data?.summary || []).map((row, index) => ({ ...row, id: index + 1 })));
      setRoleUsers((res.data?.roleUsers || []).map((row, index) => ({ ...row, id: row._id || index + 1 })));
      setMeta(res.data?.meta || null);
      setMessage(res.data?.message || "Periods generated");
    } catch (err) {
      setSummary((err.response?.data?.summary || []).map((row, index) => ({ ...row, id: index + 1 })));
      setError(err.response?.data?.message || "Unable to generate periods");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "label", headerName: "Module", minWidth: 260, flex: 1 },
    { field: "count", headerName: "Records", width: 140, type: "number" },
    { field: "status", headerName: "Status", minWidth: 180 }
  ];
  const userColumns = [
    { field: "role", headerName: "Role", minWidth: 130 },
    { field: "name", headerName: "User", minWidth: 190, flex: 1 },
    { field: "email", headerName: "Login email", minWidth: 250, flex: 1 },
    { field: "password", headerName: "Password", minWidth: 170 },
    { field: "department", headerName: "Department", minWidth: 180 },
    { field: "designation", headerName: "Designation", minWidth: 180 },
    { field: "status", headerName: "Status", width: 100 }
  ];

  return (
    <MenuPageShell title="Dummy Data Generator">
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Dummy Data Generator</Typography>
            <Typography color="text.secondary">
              Create connected sample records for users, academics, LMS, fees, examinations, budget, purchase, vendors, HR leave, HR attendance and salary processing.
            </Typography>
          </Box>

          {busy && <LinearProgress />}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

          <Grid container spacing={2}>
            {moduleCards.map((label) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Card sx={{ height: "100%", borderLeft: "5px solid #2563eb" }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Dataset color="primary" />
                      <Typography fontWeight={800}>{label}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Generation Settings</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => update("academicyear", e.target.value)}>
                  {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Base Count" value={form.count} inputProps={{ min: 1, max: 100 }} onChange={(e) => update("count", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Students" value={form.students} inputProps={{ min: 1, max: 200 }} onChange={(e) => update("students", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Employees / Faculty" value={form.employees} inputProps={{ min: 1, max: 100 }} onChange={(e) => update("employees", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Programs" value={form.programs} inputProps={{ min: 1, max: 20 }} onChange={(e) => update("programs", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Records / Course" value={form.recordsPerCourse} inputProps={{ min: 1, max: 50 }} onChange={(e) => update("recordsPerCourse", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="password"
                  label="Override Password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  helperText="Required only if dummy data was already generated once."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={form.includeExistingUsers} onChange={(e) => update("includeExistingUsers", e.target.checked)} />}
                  label="Use existing users from User model where possible, and use non-student users for salary, leave, purchase and workload"
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button variant="contained" size="large" startIcon={<AutoFixHigh />} disabled={busy} onClick={() => generate(false)}>
                    {busy ? "Generating..." : "Generate Dummy Data"}
                  </Button>
                  <Button variant="outlined" startIcon={<Refresh />} disabled={busy} onClick={() => { setForm(blank); setSummary([]); setRoleUsers([]); setMeta(null); }}>
                    Reset
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Period Generation</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select programs and target periods per day. Existing weekday periods are counted first; only the missing extra periods are created after existing times.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={periodOptions.programs || []}
                  getOptionLabel={(option) => `${option.program || ""} (${option.programcode || ""})`}
                  value={(periodOptions.programs || []).filter((item) => (form.periodProgramCodes || []).includes(item.programcode))}
                  onChange={(_, values) => update("periodProgramCodes", values.map((item) => item.programcode))}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} />
                      {`${option.program || ""} (${option.programcode || ""})`}
                    </li>
                  )}
                  renderInput={(params) => <TextField {...params} label="Programs for period generation" helperText="Leave blank to use all generated/available programs" />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Periods per day" value={form.periodsPerDay} inputProps={{ min: 1, max: 12 }} onChange={(e) => update("periodsPerDay", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={1.7}>
                <TextField fullWidth type="time" label="Start time" InputLabelProps={{ shrink: true }} value={form.periodStartTime} onChange={(e) => update("periodStartTime", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={1.7}>
                <TextField fullWidth type="number" label="Duration min" value={form.periodDurationMinutes} inputProps={{ min: 30, max: 180 }} onChange={(e) => update("periodDurationMinutes", e.target.value)} />
              </Grid>
              <Grid item xs={12} md={1.6}>
                <TextField fullWidth type="number" label="Gap min" value={form.periodGapMinutes} inputProps={{ min: 0, max: 60 }} onChange={(e) => update("periodGapMinutes", e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" disabled={busy} startIcon={<AutoFixHigh />} onClick={generatePeriodsOnly}>
                  {busy ? "Generating..." : "Generate Periods Only"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>Selectable Data Sections</Typography>
                <Typography variant="body2" color="text.secondary">
                  These sections are generated from the master users, programs, courses and fee data. All are selected by default.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => update("sections", generatorSections.map((section) => section.key))}>Select All</Button>
                <Button size="small" variant="outlined" color="inherit" onClick={() => update("sections", [])}>Clear</Button>
                <Button size="small" variant="contained" disabled={busy || !(form.sections || []).length} onClick={() => generate(true)}>
                  Generate Sections Only
                </Button>
              </Stack>
            </Stack>
            <Grid container spacing={1.5}>
              {generatorSections.map((section) => {
                const checked = (form.sections || []).includes(section.key);
                return (
                  <Grid item xs={12} sm={6} md={4} key={section.key}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        height: "100%",
                        bgcolor: checked ? "rgba(37, 99, 235, 0.06)" : "background.paper",
                        borderColor: checked ? "primary.main" : "divider"
                      }}
                    >
                      <FormControlLabel
                        sx={{ alignItems: "flex-start", m: 0 }}
                        control={<Checkbox checked={checked} onChange={() => toggleSection(section.key)} />}
                        label={(
                          <Box>
                            <Typography fontWeight={800}>{section.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{section.description}</Typography>
                          </Box>
                        )}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>

          {meta && (
            <Alert severity="info">
              Generated for colid {meta.colid}, academic year {meta.academicyear}, base count {meta.count}. Time taken: {meta.seconds} seconds.
            </Alert>
          )}

          <Paper sx={{ p: 1 }}>
            <Typography fontWeight={900} sx={{ px: 1, py: 1 }}>Generation Summary</Typography>
            <DataGrid
              rows={summary}
              columns={columns}
              loading={busy}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "dummy_data_generation_summary" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            />
          </Paper>

          <Paper sx={{ p: 1 }}>
            <Typography fontWeight={900} sx={{ px: 1, py: 1 }}>Role wise users created / available</Typography>
            <DataGrid
              rows={roleUsers}
              columns={userColumns}
              loading={busy}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "dummy_role_wise_users" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            />
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
