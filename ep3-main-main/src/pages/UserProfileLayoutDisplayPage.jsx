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
import { Add, Delete, Print, Search } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyFilter = { field: "", value: "" };

const systemHiddenFields = new Set(["_id", "__v", "colid", "customFields", "createdAt", "updatedAt"]);

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

const hasUsefulValue = (value) => {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  const text = String(value).trim();
  return text !== "" && text.toUpperCase() !== "NA" && text !== "-";
};

const valueFromUser = (user, field) => {
  if (!user || !field) return "";
  if (String(field).startsWith("customFields.")) {
    return user.customFields?.[String(field).replace("customFields.", "")] ?? "";
  }
  return user[field] ?? "";
};

const mergePendingValues = (user, pendingValues = {}) => {
  const next = { ...(user || {}), customFields: { ...(user?.customFields || {}) } };
  Object.entries(pendingValues || {}).forEach(([field, meta]) => {
    if (field.startsWith("customFields.")) {
      next.customFields[field.replace("customFields.", "")] = meta?.newvalue ?? "";
    } else {
      next[field] = meta?.newvalue ?? "";
    }
  });
  return next;
};

function groupLayout(layout, user, fields) {
  const fieldLabels = new Map((fields || []).map((item) => [item.field, item.label || item.field]));
  const visibleLayout = (layout || [])
    .filter((item) => String(item.visible || "Yes") !== "No")
    .sort((a, b) => Number(a.sectionorder ?? a.taborder ?? 0) - Number(b.sectionorder ?? b.taborder ?? 0)
      || String(a.section || a.tab || "Profile").localeCompare(String(b.section || b.tab || "Profile"))
      || Number(a.order || 0) - Number(b.order || 0)
      || String(a.label || a.field).localeCompare(String(b.label || b.field)));

  if (!visibleLayout.length && user) {
    const baseFields = Object.keys(user)
      .filter((field) => !systemHiddenFields.has(field))
      .filter((field) => hasUsefulValue(user[field]))
      .map((field, index) => ({
        field,
        label: fieldLabels.get(field) || titleCase(field),
        section: "Profile",
        sectionorder: 1,
        order: index + 1
      }));
    const customFields = Object.keys(user.customFields || {})
      .filter((field) => hasUsefulValue(user.customFields[field]))
      .map((field, index) => ({
        field: `customFields.${field}`,
        label: fieldLabels.get(`customFields.${field}`) || titleCase(field),
        section: "Custom Fields",
        sectionorder: 2,
        order: index + 1
      }));
    visibleLayout.push(...baseFields, ...customFields);
  }

  const sectionMap = new Map();
  visibleLayout.forEach((item) => {
    const sectionName = item.section || item.tab || "Profile";
    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, {
        name: sectionName,
        order: Number(item.sectionorder ?? item.taborder ?? 0),
        fields: []
      });
    }
    sectionMap.get(sectionName).fields.push({
      ...item,
      label: item.label || fieldLabels.get(item.field) || titleCase(item.field),
      value: valueFromUser(user, item.field)
    });
  });

  return [...sectionMap.values()]
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || a.name.localeCompare(b.name))
    .map((section) => ({
      ...section,
      fields: section.fields.sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || String(a.label).localeCompare(String(b.label)))
    }));
}

function ProfileDocument({ profile, institution, fields }) {
  const displayUser = useMemo(() => mergePendingValues(profile?.user, profile?.pendingValues), [profile]);
  const sections = useMemo(() => groupLayout(profile?.layout || [], displayUser, fields), [profile, displayUser, fields]);
  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";

  if (!profile?.user) {
    return <Alert severity="info">Select a user to display the configured profile layout.</Alert>;
  }

  return (
    <Paper id="rolewise-profile-print-area" elevation={0} sx={{ p: 2.5, border: "1px solid #d6dee8", bgcolor: "#fff", maxWidth: 1120, mx: "auto" }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ borderBottom: "2px solid #111827", pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 66, height: 66, objectFit: "contain" }} />}
            <Box>
              <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
              <Typography variant="body2" sx={{ maxWidth: 780 }}>{address}</Typography>
              <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 0.5 }}>Rolewise Profile Document</Typography>
            </Box>
          </Stack>
          {displayUser.photo ? (
            <Box component="img" src={displayUser.photo} alt="Profile" sx={{ width: 92, height: 110, objectFit: "cover", border: "1px solid #cbd5e1", borderRadius: 1 }} />
          ) : (
            <Box sx={{ width: 92, height: 110, border: "1px solid #cbd5e1", borderRadius: 1, display: "grid", placeItems: "center", color: "text.secondary", fontSize: 12 }}>Photo</Box>
          )}
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip size="small" label={`Name: ${displayUser.name || "-"}`} />
          <Chip size="small" label={`Role: ${profile.role || displayUser.role || "-"}`} />
          <Chip size="small" label={`Email: ${displayUser.email || displayUser.user || "-"}`} />
          <Chip size="small" label={`Reg No / Emp ID: ${displayUser.regno || "-"}`} />
        </Stack>

        {sections.map((section) => (
          <Box key={section.name} className="rolewise-profile-section">
            <Typography fontWeight={900} sx={{ mb: 0.75, color: "#111827", borderBottom: "1px solid #e5e7eb", pb: 0.5 }}>
              {section.name}
            </Typography>
            <Grid container spacing={1}>
              {section.fields.map((field) => {
                const pending = profile.pendingValues?.[field.field];
                return (
                  <Grid item xs={12} sm={6} md={4} key={`${section.name}-${field.field}`}>
                    <Box className="rolewise-profile-field">
                      <Typography className="rolewise-profile-label">{field.label}</Typography>
                      <Typography className="rolewise-profile-value">{cleanValue(field.value)}</Typography>
                      {pending && <Typography className="rolewise-profile-pending">Pending approval value</Typography>}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}

        <Stack direction="row" justifyContent="space-between" sx={{ pt: 3, mt: 1 }}>
          <Typography variant="body2">Prepared by: __________________</Typography>
          <Typography variant="body2">Checked by: __________________</Typography>
          <Typography variant="body2">Date: __________________</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function UserProfileLayoutDisplayPage({ student = false }) {
  const [fields, setFields] = useState([]);
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [filterOptions, setFilterOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [profile, setProfile] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMeta();
    loadInstitution();
    if (student) loadStudentProfile();
  }, [student]);

  const loadMeta = async () => {
    try {
      const res = await ep1.get("/api/v2/user-data/meta", { params: { colid: global1.colid } });
      const allFields = (res.data?.filterFields || []).filter((field) => !String(field.field).includes("$"));
      setFields(allFields);
      setFilterOptions(Object.fromEntries(allFields.filter((field) => field.options?.length).map((field) => [field.field, field.options])));
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load profile fields");
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

  const loadProfile = async (userLike) => {
    const identifier = userLike?.email || userLike?.user || userLike?.regno || userLike;
    if (!identifier) {
      setError("User email or registration number was not found.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/user-profile-display-profile", {
        params: { colid: global1.colid, email: identifier, role: userLike?.role || "" }
      });
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load configured profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProfile = async () => {
    const candidates = [global1.user, global1.email, global1.regno].filter(Boolean);
    const primaryEmail = global1.user || global1.email || "";
    if (primaryEmail && global1.regno) {
      try {
        const res = await ep1.get("/api/v2/user-profile-display-profile", {
          params: { colid: global1.colid, email: primaryEmail, regno: global1.regno, role: "Student" }
        });
        setProfile(res.data);
        setError("");
        return;
      } catch {
        // Fall back to the individual identifiers below.
      }
    }
    for (const identifier of candidates) {
      try {
        const res = await ep1.get("/api/v2/user-profile-display-profile", {
          params: { colid: global1.colid, email: identifier, role: "Student" }
        });
        setProfile(res.data);
        setError("");
        return;
      } catch {
        // Try the next login identifier.
      }
    }
    setError("Student profile was not found for the logged-in email or registration number.");
  };

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

  const searchRows = async () => {
    setLoading(true);
    setError("");
    setProfile(null);
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
      headerName: "Display",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => <Button size="small" variant="contained" onClick={() => loadProfile(row)}>Display</Button>
    }
  ];

  return (
    <MenuPageShell title={student ? "My Profile Document" : "Rolewise Profile Display"} menuType={student ? "student" : undefined}>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #rolewise-profile-print-area, #rolewise-profile-print-area * { visibility: visible; }
            #rolewise-profile-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              min-height: 297mm;
              background: #fff;
              padding: 10mm;
              box-sizing: border-box;
            }
            .rolewise-profile-no-print { display: none !important; }
            .rolewise-profile-section, .rolewise-profile-field { break-inside: avoid; }
          }
          .rolewise-profile-field {
            border: 1px solid #dbe4ee;
            border-radius: 6px;
            padding: 8px 10px;
            min-height: 52px;
            background: #fff;
          }
          .rolewise-profile-label {
            font-size: 10px !important;
            color: #475569;
            font-weight: 800 !important;
            text-transform: uppercase;
            letter-spacing: .02em;
          }
          .rolewise-profile-value {
            font-size: 12px !important;
            color: #111827;
            font-weight: 600 !important;
            overflow-wrap: anywhere;
          }
          .rolewise-profile-pending {
            font-size: 9px !important;
            color: #b45309;
            font-weight: 800 !important;
            margin-top: 2px !important;
          }
        `}</style>

        <Box className="rolewise-profile-no-print">
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Breadcrumbs sx={{ mb: 0.5 }}>
                  <Link underline="hover" color="inherit" href={student ? "/dashmclassenr1stud" : "/dashdashfacnew"}>Dashboard</Link>
                  <Typography color="text.primary">{student ? "Profile" : "User management"}</Typography>
                </Breadcrumbs>
                <Typography variant="h5" fontWeight={900}>{student ? "My Profile Document" : "Rolewise Profile Display"}</Typography>
                <Typography color="text.secondary">
                  {student ? "Your profile is rendered from the Student display layout." : "Select a user and render the printable profile using that user's role-wise display layout."}
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<Print />} disabled={!profile?.user} onClick={() => window.print()}>Print Preview</Button>
            </Stack>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {!student && (
            <>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={800}>Dynamic filters</Typography>
                  <Button startIcon={<Add />} variant="outlined" onClick={() => setFilters((prev) => [...prev, { ...emptyFilter }])}>Add Filter</Button>
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
                          <IconButton color="error" onClick={() => setFilters((prev) => prev.length === 1 ? [{ ...emptyFilter }] : prev.filter((_, itemIndex) => itemIndex !== index))}>
                            <Delete />
                          </IconButton>
                        </Grid>
                      </React.Fragment>
                    );
                  })}
                  <Grid item xs={12}>
                    <Button variant="contained" startIcon={<Search />} disabled={loading} onClick={searchRows}>{loading ? "Loading..." : "Apply Filters"}</Button>
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
                  slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "rolewise_profile_users" } } }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </Paper>
            </>
          )}
        </Box>

        <ProfileDocument profile={profile} institution={institution} fields={fields} />
      </Box>
    </MenuPageShell>
  );
}

export function StudentProfileLayoutDisplayPage() {
  return <UserProfileLayoutDisplayPage student />;
}
