import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Check, Close, Print, Refresh, Save } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const titleCase = (value = "") => String(value)
  .replace(/^customFields\./, "")
  .replace(/([A-Z])/g, " $1")
  .replace(/_/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .replace(/^./, (char) => char.toUpperCase());

const cleanValue = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const valueFromUser = (user, field) => {
  if (!user || !field) return "";
  if (String(field).startsWith("customFields.")) return user.customFields?.[String(field).replace("customFields.", "")] ?? "";
  return user[field] ?? "";
};

const mergePendingValues = (user, pendingValues = {}) => {
  const next = { ...(user || {}), customFields: { ...(user?.customFields || {}) } };
  Object.entries(pendingValues || {}).forEach(([field, meta]) => {
    if (String(field).startsWith("customFields.")) next.customFields[String(field).replace("customFields.", "")] = meta?.newvalue ?? "";
    else next[field] = meta?.newvalue ?? "";
  });
  return next;
};

const groupLayout = (profile, fields) => {
  const user = mergePendingValues(profile?.user, profile?.pendingValues);
  const fieldLabels = new Map((fields || []).map((item) => [item.field, item.label || item.field]));
  const layout = [...(profile?.layout || [])]
    .filter((item) => String(item.visible || "Yes") !== "No")
    .sort((a, b) => Number(a.sectionorder || 0) - Number(b.sectionorder || 0)
      || String(a.section || "Profile").localeCompare(String(b.section || "Profile"))
      || Number(a.order || 0) - Number(b.order || 0)
      || String(a.label || a.field).localeCompare(String(b.label || b.field)));

  const fallbackFields = !layout.length && user ? Object.keys(user)
    .filter((field) => !["_id", "__v", "colid", "customFields", "createdAt", "updatedAt"].includes(field))
    .map((field, index) => ({ field, label: titleCase(field), section: "Profile", sectionorder: 1, order: index + 1 })) : [];

  const rows = layout.length ? layout : fallbackFields;
  const map = new Map();
  rows.forEach((item) => {
    const section = item.section || "Profile";
    if (!map.has(section)) map.set(section, { name: section, order: Number(item.sectionorder || 0), fields: [] });
    map.get(section).fields.push({
      ...item,
      label: item.label || fieldLabels.get(item.field) || titleCase(item.field),
      value: valueFromUser(user, item.field),
      pending: profile?.pendingValues?.[item.field]
    });
  });
  return [...map.values()].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
};

function PrintableProfile({ profile, fields, institution }) {
  const displayUser = useMemo(() => mergePendingValues(profile?.user, profile?.pendingValues), [profile]);
  const sections = useMemo(() => groupLayout(profile, fields), [profile, fields]);
  if (!profile?.user) return <Alert severity="info">Select a student to view the profile print layout.</Alert>;
  const logo = institution?.logolink || global1.logo || "";
  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const address = institution?.address || "";

  return (
    <Paper id="student-profile-approval-print" elevation={0} sx={{ p: 2.5, border: "1px solid #d6dee8", bgcolor: "#fff", maxWidth: 1120, mx: "auto" }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: "2px solid #111827", pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 68, height: 68, objectFit: "contain" }} />}
            <Box>
              <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
              <Typography variant="body2" sx={{ maxWidth: 780 }}>{address}</Typography>
              <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 0.5 }}>Student Profile Approval</Typography>
            </Box>
          </Stack>
          {displayUser.photo ? (
            <Box component="img" src={displayUser.photo} alt="Student" sx={{ width: 92, height: 112, objectFit: "cover", border: "1px solid #cbd5e1", borderRadius: 1 }} />
          ) : (
            <Box sx={{ width: 92, height: 112, border: "1px solid #cbd5e1", borderRadius: 1, display: "grid", placeItems: "center", color: "text.secondary", fontSize: 12 }}>Photo</Box>
          )}
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip size="small" label={`Name: ${displayUser.name || "-"}`} />
          <Chip size="small" label={`Reg No: ${displayUser.regno || "-"}`} />
          <Chip size="small" label={`Email: ${displayUser.email || displayUser.user || "-"}`} />
          <Chip size="small" label={`Program: ${displayUser.programcode || displayUser.program || "-"}`} />
          <Chip size="small" label={`Approval: ${displayUser.profileapprovalstatus || "Pending"}`} />
        </Stack>

        {sections.map((section) => (
          <Box key={section.name} className="student-profile-approval-section">
            <Typography fontWeight={900} sx={{ mb: 0.75, borderBottom: "1px solid #e5e7eb", pb: 0.5 }}>{section.name}</Typography>
            <Grid container spacing={1}>
              {section.fields.map((field) => (
                <Grid item xs={12} sm={6} md={4} key={`${section.name}-${field.field}`}>
                  <Box className="student-profile-approval-field">
                    <Typography className="student-profile-approval-label">{field.label}</Typography>
                    <Typography className="student-profile-approval-value">{cleanValue(field.value)}</Typography>
                    {field.pending && <Typography className="student-profile-approval-pending">Pending approval value</Typography>}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default function UserProfileStudentApprovalPage() {
  const [profileRows, setProfileRows] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fields, setFields] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [overallStatus, setOverallStatus] = useState("Pending");
  const [overallComment, setOverallComment] = useState("");
  const [actionComment, setActionComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadBase = async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingRes, fieldsRes, institutionRes] = await Promise.all([
        ep1.get("/api/v2/user-profile-approval-pending", { params: { colid: global1.colid, approveremail: global1.user, approverrole: global1.role } }),
        ep1.get("/api/v2/user-profile-display-layout-fields", { params: { colid: global1.colid } }),
        ep1.get("/api/institution", { params: { colid: global1.colid } }).catch(() => ({ data: null }))
      ]);
      setProfileRows((pendingRes.data?.profile || []).map((row, index) => ({ ...row, id: `${row.requestid}-${row.field}-${index}` })));
      setFields(fieldsRes.data?.fields || []);
      setInstitution(Array.isArray(institutionRes.data) ? institutionRes.data[0] : institutionRes.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load student profile approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBase(); }, []);

  const studentOptions = useMemo(() => {
    const map = new Map();
    profileRows.filter((row) => /^student$/i.test(String(row.role || ""))).forEach((row) => {
      const key = row.owneruser || row.ownername;
      if (key && !map.has(key)) {
        map.set(key, {
          owneruser: row.owneruser || "",
          ownername: row.ownername || row.owneruser || "Student",
          role: row.role || "Student",
          label: `${row.ownername || row.owneruser || "Student"}${row.owneruser ? ` (${row.owneruser})` : ""}`
        });
      }
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [profileRows]);

  const pendingFields = useMemo(() => (
    selectedStudent ? profileRows.filter((row) => row.owneruser === selectedStudent.owneruser) : []
  ), [profileRows, selectedStudent]);

  const loadStudentProfile = async (student) => {
    setSelectedStudent(student);
    setProfile(null);
    setMessage("");
    if (!student?.owneruser) return;
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/user-profile-display-profile", {
        params: { colid: global1.colid, email: student.owneruser, role: "Student" }
      });
      setProfile(res.data);
      setOverallStatus(res.data?.user?.profileapprovalstatus || "Pending");
      setOverallComment(res.data?.user?.profileapprovalcomments || "");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load selected student profile");
    } finally {
      setLoading(false);
    }
  };

  const processAllFields = async (action) => {
    if (!selectedStudent || !pendingFields.length) {
      setError("Select a student with pending fields first");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      for (const row of pendingFields) {
        await ep1.post("/api/v2/user-profile-approval-field-action", {
          colid: global1.colid,
          requestid: row.requestid,
          field: row.field,
          action,
          comments: actionComment,
          approvername: global1.name,
          approveremail: global1.user,
          approverrole: global1.role
        });
      }
      setMessage(`${pendingFields.length} pending field(s) ${action.toLowerCase()}.`);
      await loadBase();
      await loadStudentProfile(selectedStudent);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to process all pending fields");
    } finally {
      setLoading(false);
    }
  };

  const saveOverallStatus = async () => {
    if (!selectedStudent?.owneruser) {
      setError("Select a student first");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/user-profile-approval-status", {
        colid: global1.colid,
        owneruser: selectedStudent.owneruser,
        profileapprovalstatus: overallStatus,
        profileapprovalcomments: overallComment,
        approvername: global1.name,
        approveremail: global1.user,
        approverrole: global1.role
      });
      setMessage("Student approval status and comment saved.");
      await loadStudentProfile(selectedStudent);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save approval status");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "field", headerName: "Field", minWidth: 170, flex: 1 },
    { field: "label", headerName: "Label", minWidth: 170, flex: 1 },
    { field: "oldvalue", headerName: "Old value", minWidth: 220, flex: 1, valueGetter: ({ value }) => cleanValue(value) },
    { field: "newvalue", headerName: "New value", minWidth: 220, flex: 1, valueGetter: ({ value }) => cleanValue(value) },
    { field: "level", headerName: "Level", width: 90 }
  ];

  return (
    <MenuPageShell title="User profile approval">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #student-profile-approval-print, #student-profile-approval-print * { visibility: visible; }
            #student-profile-approval-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              min-height: 297mm;
              background: #fff;
              padding: 10mm;
              box-sizing: border-box;
            }
            .student-profile-approval-no-print { display: none !important; }
            .student-profile-approval-section, .student-profile-approval-field { break-inside: avoid; }
          }
          .student-profile-approval-field {
            border: 1px solid #dbe4ee;
            border-radius: 6px;
            padding: 8px 10px;
            min-height: 52px;
            background: #fff;
          }
          .student-profile-approval-label {
            font-size: 10px !important;
            color: #475569;
            font-weight: 800 !important;
            text-transform: uppercase;
          }
          .student-profile-approval-value {
            font-size: 12px !important;
            color: #111827;
            font-weight: 600 !important;
            overflow-wrap: anywhere;
          }
          .student-profile-approval-pending {
            font-size: 9px !important;
            color: #b45309;
            font-weight: 800 !important;
            margin-top: 2px !important;
          }
        `}</style>

        <Box className="student-profile-approval-no-print">
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Breadcrumbs sx={{ mb: 0.5 }}>
                  <Link underline="hover" color="inherit" href="/dashdashfacnew">Dashboard</Link>
                  <Typography color="text.primary">User management</Typography>
                </Breadcrumbs>
                <Typography variant="h5" fontWeight={900}>User profile approval</Typography>
                <Typography color="text.secondary">Select a student, review the full print-layout profile, and approve or reject all pending fields.</Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<Refresh />} disabled={loading} onClick={loadBase}>Refresh</Button>
                <Button variant="outlined" startIcon={<Print />} disabled={!profile?.user} onClick={() => window.print()}>Print</Button>
              </Stack>
            </Stack>
          </Paper>

          {loading && <LinearProgress sx={{ mb: 2 }} />}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={studentOptions}
                  value={selectedStudent}
                  onChange={(_, value) => loadStudentProfile(value)}
                  getOptionLabel={(option) => option?.label || ""}
                  renderInput={(params) => <TextField {...params} label="Select pending student" />}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <FormControl fullWidth>
                  <InputLabel>Approval status</InputLabel>
                  <Select label="Approval status" value={overallStatus} onChange={(event) => setOverallStatus(event.target.value)}>
                    {["Approved", "Pending", "Rejected"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4.5}>
                <TextField fullWidth label="Student approval comment" value={overallComment} onChange={(event) => setOverallComment(event.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" startIcon={<Save />} disabled={!selectedStudent || loading} onClick={saveOverallStatus}>Save Student Status</Button>
              </Grid>
            </Grid>
          </Paper>

          {selectedStudent && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Pending fields for selected student</Typography>
                  <Typography color="text.secondary">{pendingFields.length} field(s) available for your approval level.</Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button color="success" variant="contained" startIcon={<Check />} disabled={!pendingFields.length || loading} onClick={() => processAllFields("Approved")}>Approve All Pending Fields</Button>
                  <Button color="error" variant="outlined" startIcon={<Close />} disabled={!pendingFields.length || loading} onClick={() => processAllFields("Rejected")}>Reject All Pending Fields</Button>
                </Stack>
              </Stack>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Approval/rejection comment for pending fields"
                value={actionComment}
                onChange={(event) => setActionComment(event.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <DataGrid
                  autoHeight
                  rows={pendingFields}
                  columns={columns}
                  loading={loading}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_profile_pending_fields" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </Box>
            </Paper>
          )}
        </Box>

        <PrintableProfile profile={profile} fields={fields} institution={institution} />
      </Box>
    </MenuPageShell>
  );
}
