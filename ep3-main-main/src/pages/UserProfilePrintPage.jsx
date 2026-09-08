import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Add, Delete, Logout, Print, Search } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyFilter = { field: "", value: "" };
const hiddenPrintFields = new Set(["_id", "__v", "colid", "customFields", "photo"]);
const mandatoryFields = ["name", "email", "phone", "password", "role", "regno", "programcode", "admissionyear", "semester", "section", "department", "status"];
const nonStudentHiddenFields = new Set([
  "semester", "section", "major", "minor", "Major", "Minor", "mdc", "MDC", "mdcsub", "MDCSub",
  "sec", "SEC", "aec", "AEC", "vac", "VAC", "idc", "IDC", "program", "programcode",
  "regulation", "rollno", "admissionyear", "academicyear"
]);

const titleCase = (value = "") => String(value)
  .replace(/^customFields\./, "")
  .replace(/([A-Z])/g, " $1")
  .replace(/_/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .replace(/^./, (char) => char.toUpperCase());

const valueText = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const hasPrintValue = (value) => {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  const text = String(value).trim();
  return text !== "" && text.toUpperCase() !== "NA" && text !== "-";
};

export default function UserProfilePrintPage() {
  const isStudentLogin = String(global1.role || "").toLowerCase() === "student";
  const [fields, setFields] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [filterOptions, setFilterOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [printMode, setPrintMode] = useState("all");
  const [includeUnapproved, setIncludeUnapproved] = useState("Yes");
  const [approvedFields, setApprovedFields] = useState([]);
  const [unapprovedFieldValues, setUnapprovedFieldValues] = useState({});
  const [profileLayout, setProfileLayout] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMeta();
    loadInstitution();
    if (isStudentLogin) {
      loadStudentProfile();
    }
  }, []);

  const loadMeta = async () => {
    try {
      const res = await ep1.get("/api/v2/user-data/meta", { params: { colid: global1.colid } });
      const allFields = (res.data?.filterFields || []).filter((field) => !String(field.field).includes("$"));
      setFields(allFields);
      setCustomFields(res.data?.customFields || []);
      const defaults = {};
      for (const field of allFields.slice(0, 12)) {
        if (field.options?.length) defaults[field.field] = field.options;
      }
      setFilterOptions(defaults);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load user fields");
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
      setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
    } catch {
      setInstitution(null);
    }
  };

  const loadStudentProfile = async () => {
    const regno = String(global1.regno || "").trim();
    const email = String(global1.user || global1.email || "").trim();
    setLoading(true);
    setError("");
    if (!regno && !email) {
      setRows([]);
      setSelectedUser(null);
      setError("Student email or registration number was not found in the login session.");
      setLoading(false);
      return;
    }
    try {
      if (email && regno) {
        const profileRes = await ep1.get("/api/v2/user-profile", {
          params: { colid: global1.colid, email, regno, role: "Student" }
        });
        const exactProfileUser = profileRes.data?.user || null;
        setRows(exactProfileUser ? [exactProfileUser] : []);
        setSelectedUser(exactProfileUser);
        if (!exactProfileUser) setError("No student profile was found for the logged-in email and registration number.");
        return;
      }
      const res = await ep1.post("/api/v2/user-data/search", {
        colid: global1.colid,
        filters: [regno ? { field: "regno", value: regno } : { field: "email", value: email }],
        limit: 10
      });
      const users = res.data || [];
      const exactUser = users.find((user) => {
        const rowRegno = String(user.regno || "").trim();
        const rowEmail = String(user.email || user.user || "").trim();
        if (regno && email) return rowRegno === regno && rowEmail === email;
        if (regno) return rowRegno === regno;
        return rowEmail === email;
      }) || null;
      setRows(exactUser ? [exactUser] : []);
      setSelectedUser(exactUser);
      if (!exactUser) {
        setError("No student profile was found for the logged-in email/registration number.");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load student profile");
      setRows([]);
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const ownerKeysFor = (user) => [
    user?.email,
    user?.user,
    user?.regno,
    global1.user,
    global1.email,
    global1.regno
  ].map((item) => String(item || "").trim()).filter(Boolean);

  const loadApprovedFields = async (user) => {
    const ownerKeys = [...new Set(ownerKeysFor(user))];
    if (!ownerKeys.length) {
      setApprovedFields([]);
      setUnapprovedFieldValues({});
      return;
    }
    try {
      const responses = await Promise.all(ownerKeys.map((owneruser) => ep1.get("/api/v2/user-profile-approval-status", {
        params: { colid: global1.colid, owneruser }
      }).catch(() => ({ data: { profile: [] } }))));
      const approved = [];
      const unapproved = {};
      responses.flatMap((res) => res.data?.profile || []).forEach((request) => {
        (request.fields || []).forEach((field) => {
          const status = String(field.status || "").toLowerCase();
          if (status === "approved" && field.field) {
            approved.push(field.field);
          } else if (field.field && !unapproved[field.field] && hasPrintValue(field.newvalue)) {
            unapproved[field.field] = { value: field.newvalue, status: field.status || "Pending" };
          }
        });
      });
      setApprovedFields([...new Set(approved)]);
      setUnapprovedFieldValues(unapproved);
    } catch {
      setApprovedFields([]);
      setUnapprovedFieldValues({});
    }
  };

  const loadProfileLayout = async (user) => {
    if (!user?.role) {
      setProfileLayout([]);
      return;
    }
    try {
      const res = await ep1.get("/api/v2/user-profile-layouts", {
        params: { colid: global1.colid, role: user.role }
      });
      setProfileLayout((res.data || []).filter((item) => String(item.visible || "Yes") !== "No"));
    } catch {
      setProfileLayout([]);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      loadApprovedFields(selectedUser);
      loadProfileLayout(selectedUser);
    }
    else {
      setApprovedFields([]);
      setUnapprovedFieldValues({});
      setProfileLayout([]);
    }
  }, [selectedUser]);

  const updateFilter = async (index, key, value) => {
    const next = filters.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item
    ));
    setFilters(next);
    if (key === "field" && value && !filterOptions[value]) {
      try {
        const selectedField = fields.find((field) => field.field === value);
        if (selectedField?.options?.length) {
          setFilterOptions((prev) => ({ ...prev, [value]: selectedField.options }));
        } else {
          const res = await ep1.get("/api/v2/user-data/options", { params: { colid: global1.colid, field: value } });
          setFilterOptions((prev) => ({ ...prev, [value]: res.data || [] }));
        }
      } catch {
        setFilterOptions((prev) => ({ ...prev, [value]: [] }));
      }
    }
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...emptyFilter }]);
  const removeFilter = (index) => setFilters((prev) => {
    const next = prev.filter((_, itemIndex) => itemIndex !== index);
    return next.length ? next : [{ ...emptyFilter }];
  });

  const searchRows = async () => {
    setLoading(true);
    setError("");
    setSelectedUser(null);
    try {
      const res = await ep1.post("/api/v2/user-data/search", {
        colid: global1.colid,
        filters: filters.filter((filter) => filter.field && String(filter.value || "").trim() !== ""),
        limit: 1000
      });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || titleCase(field);

  const approvedFieldSet = useMemo(() => new Set(approvedFields), [approvedFields]);
  const includeUnapprovedValues = includeUnapproved === "Yes";
  const unapprovedFieldSet = useMemo(() => new Set(Object.keys(unapprovedFieldValues)), [unapprovedFieldValues]);
  const isApprovedField = (field) => {
    if (printMode !== "approved") return true;
    return approvedFieldSet.has(field)
      || approvedFieldSet.has(`customFields.${field}`)
      || (includeUnapprovedValues && (unapprovedFieldSet.has(field) || unapprovedFieldSet.has(`customFields.${field}`)));
  };
  const pendingMetaFor = (field) => unapprovedFieldValues[field] || unapprovedFieldValues[`customFields.${field}`] || null;

  const displayUser = useMemo(() => {
    if (!selectedUser || !includeUnapprovedValues) return selectedUser;
    const next = { ...selectedUser, customFields: { ...(selectedUser.customFields || {}) } };
    Object.entries(unapprovedFieldValues).forEach(([field, meta]) => {
      if (field.startsWith("customFields.")) {
        next.customFields[field.replace("customFields.", "")] = meta.value;
      } else {
        next[field] = meta.value;
      }
    });
    return next;
  }, [selectedUser, includeUnapprovedValues, unapprovedFieldValues]);

  const printSections = useMemo(() => {
    if (!displayUser) return { mandatory: [], standard: [], custom: [] };
    const isStudent = String(displayUser.role || "").toLowerCase() === "student";
    const standardEntries = Object.keys(displayUser)
      .filter((key) => !hiddenPrintFields.has(key) && !key.startsWith("customFields."))
      .filter((key) => isStudent || !nonStudentHiddenFields.has(key))
      .filter((key) => hasPrintValue(displayUser[key]))
      .filter((key) => isApprovedField(key))
      .sort((a, b) => {
        const aMandatory = mandatoryFields.includes(a) ? -1 : 0;
        const bMandatory = mandatoryFields.includes(b) ? -1 : 0;
        return aMandatory - bMandatory || fieldLabel(a).localeCompare(fieldLabel(b));
      })
      .map((key) => ({ field: key, label: fieldLabel(key), value: displayUser[key], mandatory: mandatoryFields.includes(key), pending: pendingMetaFor(key) }));

    const customValues = displayUser.customFields || {};
    const customEntries = Object.keys(customValues)
      .filter((key) => hasPrintValue(customValues[key]))
      .filter((key) => isApprovedField(key))
      .sort((a, b) => titleCase(a).localeCompare(titleCase(b)))
      .map((key) => {
        const def = customFields.find((field) => field.fieldname === key);
        return { field: key, label: def?.label || titleCase(key), value: customValues[key], mandatory: false, pending: pendingMetaFor(key) };
      });

    const customFieldLayout = profileLayout
      .filter((item) => String(item.field || "").startsWith("customFields."))
      .sort((a, b) => Number(a.taborder || 0) - Number(b.taborder || 0)
        || String(a.tab || "Custom Fields").localeCompare(String(b.tab || "Custom Fields"))
        || Number(a.order || 0) - Number(b.order || 0)
        || String(a.label || a.field).localeCompare(String(b.label || b.field)));
    const customFieldMap = new Map(customEntries.map((entry) => [entry.field, entry]));
    const usedCustomFields = new Set();
    const customTabsMap = new Map();
    customFieldLayout.forEach((layoutItem) => {
      const key = String(layoutItem.field || "").replace(/^customFields\./, "");
      const entry = customFieldMap.get(key);
      if (!entry) return;
      usedCustomFields.add(key);
      const tabName = layoutItem.tab || "Custom Fields";
      if (!customTabsMap.has(tabName)) {
        customTabsMap.set(tabName, {
          name: tabName,
          taborder: Number(layoutItem.taborder || 0),
          fields: []
        });
      }
      customTabsMap.get(tabName).fields.push({
        ...entry,
        label: layoutItem.label || entry.label
      });
    });
    const unconfiguredCustom = customEntries.filter((entry) => !usedCustomFields.has(entry.field));
    if (unconfiguredCustom.length) {
      customTabsMap.set("Custom Fields", {
        name: "Custom Fields",
        taborder: 9999,
        fields: unconfiguredCustom
      });
    }

    return {
      mandatory: standardEntries.filter((entry) => entry.mandatory),
      standard: standardEntries.filter((entry) => !entry.mandatory),
      custom: customEntries,
      customTabs: [...customTabsMap.values()].sort((a, b) => Number(a.taborder || 0) - Number(b.taborder || 0) || String(a.name).localeCompare(String(b.name)))
    };
  }, [displayUser, fields, customFields, profileLayout, printMode, approvedFieldSet, includeUnapprovedValues, unapprovedFieldSet]);

  const columns = [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "role", headerName: "Role", minWidth: 120 },
    { field: "regno", headerName: "Reg No / Emp ID", minWidth: 150 },
    { field: "program", headerName: "Program", minWidth: 180 },
    { field: "department", headerName: "Department", minWidth: 160 },
    {
      field: "select",
      headerName: "Select",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => <Button size="small" variant="contained" onClick={() => setSelectedUser(row)}>Select</Button>
    }
  ];

  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";

  const renderField = (item) => (
    <Grid item xs={12} sm={6} md={4} key={`${item.field}-${item.label}`}>
      <Box className="profile-print-field">
        <Typography className="profile-print-label">{item.label}{item.mandatory ? " *" : ""}</Typography>
        <Typography className="profile-print-value">{valueText(item.value)}</Typography>
        {item.pending && <Typography className="profile-print-pending">{item.pending.status || "Pending"} approval</Typography>}
      </Box>
    </Grid>
  );

  return (
    <MenuPageShell title="Profile Print">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #profile-print-area, #profile-print-area * { visibility: visible; }
            #profile-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              min-height: 297mm;
              background: #fff;
              padding: 10mm;
              box-sizing: border-box;
            }
            .profile-print-no-print { display: none !important; }
            .profile-print-field { break-inside: avoid; }
          }
          .profile-print-field {
            border: 1px solid #d9e2ec;
            border-radius: 6px;
            padding: 7px 9px;
            min-height: 48px;
            background: #fff;
          }
          .profile-print-label {
            font-size: 10px !important;
            color: #475569;
            font-weight: 800 !important;
            text-transform: uppercase;
            letter-spacing: .02em;
          }
          .profile-print-value {
            font-size: 12px !important;
            color: #111827;
            font-weight: 600 !important;
            overflow-wrap: anywhere;
          }
          .profile-print-pending {
            font-size: 9px !important;
            color: #b45309;
            font-weight: 800 !important;
            margin-top: 2px !important;
          }
        `}</style>

        <Box className="profile-print-no-print">
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Breadcrumbs sx={{ mb: 0.5 }}>
                  <Link underline="hover" color="inherit" href="/dashdashfacnew">Dashboard</Link>
                  <Typography color="text.primary">User management</Typography>
                </Breadcrumbs>
                <Typography variant="h5" fontWeight={900}>Profile Print</Typography>
                <Typography color="text.secondary">
                  {isStudentLogin
                    ? "Your profile is loaded automatically from your login details."
                    : "Apply dynamic filters, select a user, and print a compact complete profile."}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  select
                  size="small"
                  label="Print data"
                  value={printMode}
                  onChange={(event) => setPrintMode(event.target.value)}
                  sx={{ minWidth: 230 }}
                >
                  <MenuItem value="all">All non-empty fields</MenuItem>
                  <MenuItem value="approved">Approved data only</MenuItem>
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Unapproved submitted values"
                  value={includeUnapproved}
                  onChange={(event) => setIncludeUnapproved(event.target.value)}
                  sx={{ minWidth: 250 }}
                >
                  <MenuItem value="No">Do not show</MenuItem>
                  <MenuItem value="Yes">Show also</MenuItem>
                </TextField>
                <Button variant="outlined" startIcon={<Print />} disabled={!selectedUser} onClick={() => window.print()}>Print</Button>
                <Button color="error" variant="outlined" startIcon={<Logout />} onClick={() => { localStorage.clear(); window.location.href = "/"; }}>Logout</Button>
              </Stack>
            </Stack>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {isStudentLogin ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Profile loaded for registration number {global1.regno || "-"}.
            </Alert>
          ) : (
            <>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={800}>Dynamic Filters</Typography>
                  <Button startIcon={<Add />} variant="outlined" onClick={addFilter}>Add Filter</Button>
                </Stack>
                <Grid container spacing={1.5}>
                  {filters.map((filter, index) => {
                    const selectedField = fields.find((field) => field.field === filter.field);
                    const options = (filterOptions[filter.field] || selectedField?.options || []).map((item) => String(item));
                    return (
                      <React.Fragment key={index}>
                        <Grid item xs={12} md={4}>
                          <TextField select fullWidth size="small" label="Field" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                            {fields.map((field) => <MenuItem key={field.field} value={field.field}>{field.label}</MenuItem>)}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            freeSolo
                            options={options}
                            value={filter.value || ""}
                            onInputChange={(_, value) => updateFilter(index, "value", value)}
                            renderInput={(params) => <TextField {...params} size="small" label="Value" />}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1}>
                            <Delete />
                          </IconButton>
                        </Grid>
                      </React.Fragment>
                    );
                  })}
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" startIcon={<Search />} disabled={loading} onClick={searchRows}>{loading ? "Loading..." : "Apply Filters"}</Button>
                      <Button variant="outlined" onClick={() => { setFilters([{ ...emptyFilter }]); setRows([]); setSelectedUser(null); }}>Clear</Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
                <DataGrid
                  rows={rows}
                  getRowId={(row) => row._id}
                  columns={columns}
                  loading={loading}
                  autoHeight
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "profile_print_users" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </Paper>
            </>
          )}
        </Box>

        <Paper id="profile-print-area" elevation={0} sx={{ p: 2.5, border: "1px solid #d9e2ec", bgcolor: "#fff", maxWidth: 1100, mx: "auto" }}>
          {!selectedUser ? (
            <Alert severity="info">{isStudentLogin ? "Loading your profile..." : "Select a user to create the printable profile."}</Alert>
          ) : (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ borderBottom: "2px solid #1f2937", pb: 1.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 66, height: 66, objectFit: "contain" }} />}
                  <Box>
                    <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
                    <Typography variant="body2" sx={{ maxWidth: 720 }}>{address}</Typography>
                    <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 0.5 }}>User Profile</Typography>
                  </Box>
                </Stack>
                <Box sx={{ textAlign: "center" }}>
                  {selectedUser.photo ? (
                    <Box component="img" src={selectedUser.photo} alt="User" sx={{ width: 92, height: 110, objectFit: "cover", border: "1px solid #cbd5e1", borderRadius: 1 }} />
                  ) : (
                    <Box sx={{ width: 92, height: 110, border: "1px solid #cbd5e1", borderRadius: 1, display: "grid", placeItems: "center", color: "text.secondary", fontSize: 12 }}>Photo</Box>
                  )}
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip size="small" label={`Name: ${selectedUser.name || "-"}`} />
                <Chip size="small" label={`Role: ${selectedUser.role || "-"}`} />
                <Chip size="small" label={`Email: ${selectedUser.email || "-"}`} />
                <Chip size="small" label={`Reg No / Emp ID: ${selectedUser.regno || "-"}`} />
                <Chip size="small" color={printMode === "approved" ? "success" : "primary"} label={printMode === "approved" ? "Approved data only" : "All non-empty fields"} />
                {includeUnapprovedValues && <Chip size="small" color="warning" label="Includes unapproved submitted values" />}
              </Stack>

              <Box>
                <Typography fontWeight={900} sx={{ mb: 0.75, color: "#111827" }}>Mandatory Information</Typography>
                <Grid container spacing={1}>{printSections.mandatory.map(renderField)}</Grid>
              </Box>

              <Box>
                <Typography fontWeight={900} sx={{ mb: 0.75, color: "#111827" }}>Profile Details</Typography>
                {printSections.standard.length ? <Grid container spacing={1}>{printSections.standard.map(renderField)}</Grid> : <Typography variant="body2">No profile details available for the selected mode.</Typography>}
              </Box>

              <Box>
                <Typography fontWeight={900} sx={{ mb: 0.75, color: "#111827" }}>Custom Fields</Typography>
                {printSections.customTabs?.length ? (
                  <Stack spacing={1.25}>
                    {printSections.customTabs.map((section) => (
                      <Box key={section.name}>
                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 0.75, color: "#334155" }}>{section.name}</Typography>
                        <Grid container spacing={1}>{section.fields.map(renderField)}</Grid>
                      </Box>
                    ))}
                  </Stack>
                ) : <Typography variant="body2">No custom fields available.</Typography>}
              </Box>

              <Stack direction="row" justifyContent="space-between" sx={{ pt: 3, mt: 1 }}>
                <Typography variant="body2">Prepared by: __________________</Typography>
                <Typography variant="body2">Checked by: __________________</Typography>
                <Typography variant="body2">Date: __________________</Typography>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
