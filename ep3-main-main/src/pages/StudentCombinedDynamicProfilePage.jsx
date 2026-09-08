import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const hiddenUserFields = new Set(["_id", "__v", "colid", "customFields", "photo", "createdAt", "updatedAt"]);
const hiddenAdmissionFields = new Set(["_id", "__v", "colid", "documents", "extraFields", "createdAt", "updatedAt"]);

const fixedAdmissionFields = [
  ["Application ID", "applicationid"],
  ["Application Number", "applicationnumber"],
  ["Form ID", "formid"],
  ["Academic Year", "academicyear"],
  ["Name", "name"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["Gender", "gender"],
  ["Category", "category"],
  ["Date of Birth", "dateofbirth"],
  ["Level", "level"],
  ["Program Type", "programtype"],
  ["Program Applied", "programapplied"],
  ["Program Code", "programcode"],
  ["Reg No", "regno"],
  ["Application Status", "applicationstatus"],
  ["Enrollment Status", "enrollmentstatus"],
  ["Payment Status", "paymentstatus"],
  ["Payment Ref No", "paymentrefno"],
  ["Provisional Payment Status", "provisionalpaymentstatus"],
  ["Provisional Payment Ref No", "provisionalpaymentrefno"]
];

const educationPanels = {
  educationpanel10th: [["Result Status", "result_status_10th"], ["Board", "board_10th"], ["Marks Type", "marks_type_10th"], ["Marks / Percentage", "marks_10"], ["CGPA / Grade", "cgpa_10"]],
  educationpanel12th: [["Result Status", "result_status_12th"], ["Board", "board_12th"], ["Marks Type", "marks_type_12th"], ["Marks / Percentage", "marks_12"], ["CGPA / Grade", "cgpa_12"]],
  educationpanelug: [["Result Status", "result_status_UG"], ["University", "University_UG"], ["Marks Type", "marks_type_UG"], ["Marks / Percentage", "marks_UG"], ["CGPA / Grade", "cgpa_UG"]],
  educationpanelpg: [["Result Status", "result_status_PG"], ["University", "University_PG"], ["Marks Type", "marks_type_PG"], ["Marks / Percentage", "marks_PG"], ["CGPA / Grade", "cgpa_PG"]]
};

const titleCase = (value = "") => String(value)
  .replace(/^customFields\./, "")
  .replace(/([A-Z])/g, " $1")
  .replace(/_/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .replace(/^./, (char) => char.toUpperCase());

const clean = (value) => String(value ?? "").trim();

const displayValue = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  if (Array.isArray(value)) {
    if (!value.length) return "-";
    return value.map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item))).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const hasValue = (value) => {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  const text = String(value).trim();
  return text !== "" && text !== "-" && text.toUpperCase() !== "NA";
};

const admissionFieldValue = (application, field) => {
  const key = field.fieldname;
  if (!key) return "";
  if (application?.[key] !== undefined && application?.[key] !== null) return application[key];
  return application?.extraFields?.[key] ?? "";
};

const addSectionRow = (map, section, rows) => {
  const key = section || "Additional Details";
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(...rows);
};

function buildAdmissionSections(fields = [], application = {}) {
  const map = new Map();
  addSectionRow(map, "Application Summary", fixedAdmissionFields.map(([label, key]) => ({ label, value: application[key], key })));

  fields.forEach((field) => {
    if (field.type === "addresspanel") {
      addSectionRow(map, field.section || field.page || "Address Details", [
        { label: "Country", value: application.country_form, key: `${field._id}-country` },
        { label: "State", value: application.state_form, key: `${field._id}-state` },
        { label: "District", value: application.district_form, key: `${field._id}-district` }
      ]);
      return;
    }
    if (educationPanels[field.type]) {
      addSectionRow(map, field.section || field.page || field.label || "Education Details", educationPanels[field.type].map(([label, key]) => ({ label, value: application[key], key: `${field._id}-${key}` })));
      return;
    }
    addSectionRow(map, field.section || field.page || "Additional Details", [{
      label: field.label || field.fieldname,
      value: admissionFieldValue(application, field),
      key: field.fieldname || field._id
    }]);
  });

  const tenth = application.tenthsubjectmarks || [];
  const twelve = application.twelvesubjectmarks || [];
  if (tenth.length || twelve.length) {
    addSectionRow(map, "Subject Marks", [
      ...tenth.flatMap((row, index) => ([
        { label: `10th Subject ${index + 1}`, value: row.subject, key: `tenth-subject-${index}` },
        { label: `10th Marks ${index + 1}`, value: row.marks, key: `tenth-marks-${index}` }
      ])),
      ...twelve.flatMap((row, index) => ([
        { label: `12th Subject ${index + 1}`, value: row.subject, key: `twelve-subject-${index}` },
        { label: `12th Marks ${index + 1}`, value: row.marks, key: `twelve-marks-${index}` }
      ]))
    ]);
  }

  const configured = new Set(fields.map((field) => field.fieldname).filter(Boolean));
  const extraRows = Object.entries(application.extraFields || {})
    .filter(([key]) => !configured.has(key))
    .map(([key, value]) => ({ label: titleCase(key), value, key: `extra-${key}` }));
  if (extraRows.length) addSectionRow(map, "Other Admission Details", extraRows);

  return Array.from(map.entries()).map(([section, rows]) => ({ section, rows }));
}

function buildProfileSections(profile = {}) {
  const layout = profile.layout || [];
  const user = profile.user || {};
  const values = profile.values || {};
  if (layout.length) {
    const map = new Map();
    layout
      .filter((item) => String(item.visible || "Yes") !== "No")
      .sort((a, b) => Number(a.taborder || 0) - Number(b.taborder || 0)
        || String(a.tab || "Profile").localeCompare(String(b.tab || "Profile"))
        || Number(a.order || 0) - Number(b.order || 0)
        || String(a.label || a.field).localeCompare(String(b.label || b.field)))
      .forEach((item) => {
        const section = item.tab || "Profile";
        if (!map.has(section)) map.set(section, []);
        map.get(section).push({
          key: item.field,
          label: item.label || titleCase(item.field),
          value: values[item.field]
        });
      });
    return Array.from(map.entries()).map(([section, rows]) => ({ section, rows }));
  }

  const rows = [
    ...Object.entries(user)
      .filter(([key]) => !hiddenUserFields.has(key))
      .filter(([, value]) => hasValue(value))
      .map(([key, value]) => ({ key, label: titleCase(key), value })),
    ...Object.entries(user.customFields || {})
      .filter(([, value]) => hasValue(value))
      .map(([key, value]) => ({ key: `custom-${key}`, label: titleCase(key), value }))
  ];
  return [{ section: "Profile", rows }];
}

function FieldGrid({ sections }) {
  return (
    <Stack spacing={1.2}>
      {sections.map((section) => (
        <Box key={section.section}>
          <Typography className="combined-profile-subtitle">{section.section}</Typography>
          <Grid container spacing={0.7} sx={{ mt: 0.1 }}>
            {section.rows.map((row) => (
              <Grid item xs={12} sm={6} md={4} key={`${section.section}-${row.key || row.label}`}>
                <Box className="combined-profile-field">
                  <Typography className="combined-profile-label">{row.label}</Typography>
                  <Typography className="combined-profile-value">{displayValue(row.value)}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Stack>
  );
}

function DocumentTable({ documents, requiredDocuments }) {
  const uploadedDocs = documents || [];
  const configured = [...(requiredDocuments || [])].sort((a, b) => Number(a.displayorder || 0) - Number(b.displayorder || 0) || String(a.documentname || "").localeCompare(String(b.documentname || "")));
  const rows = configured.map((doc) => {
    const uploaded = uploadedDocs.find((item) => String(item.documenttype || "").toLowerCase() === String(doc.documentname || "").toLowerCase());
    return {
      documenttype: doc.documentname,
      required: doc.required,
      filename: uploaded?.originalname || uploaded?.filename || "",
      url: uploaded?.url || "",
      status: uploaded?.url ? "Uploaded" : "Not uploaded"
    };
  });
  uploadedDocs.forEach((doc) => {
    const exists = rows.some((row) => String(row.documenttype || "").toLowerCase() === String(doc.documenttype || "").toLowerCase());
    if (!exists) rows.push({ documenttype: doc.documenttype || "Document", required: "No", filename: doc.originalname || doc.filename || "", url: doc.url || "", status: doc.url ? "Uploaded" : "Not uploaded" });
  });

  return (
    <Box sx={{ border: "1px solid #cbd5e1", overflow: "hidden" }}>
      <Grid container sx={{ bgcolor: "#f8fafc" }}>
        {["Document", "Required", "Status", "Link"].map((heading) => (
          <Grid item xs={heading === "Link" ? 5 : heading === "Document" ? 3 : 2} key={heading} sx={{ px: 0.8, py: 0.5, borderRight: "1px solid #e5e7eb" }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 950 }}>{heading}</Typography>
          </Grid>
        ))}
      </Grid>
      {(rows.length ? rows : [{ documenttype: "No document uploaded", required: "-", status: "-", url: "" }]).map((doc, index) => (
        <Grid container key={`${doc.documenttype}-${index}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
          <Grid item xs={3} sx={{ px: 0.8, py: 0.5 }}><Typography sx={{ fontSize: 10.5, fontWeight: 800 }}>{doc.documenttype || "-"}</Typography></Grid>
          <Grid item xs={2} sx={{ px: 0.8, py: 0.5 }}><Typography sx={{ fontSize: 10.5 }}>{doc.required || "-"}</Typography></Grid>
          <Grid item xs={2} sx={{ px: 0.8, py: 0.5 }}><Typography sx={{ fontSize: 10.5 }}>{doc.status || "-"}</Typography></Grid>
          <Grid item xs={5} sx={{ px: 0.8, py: 0.5 }}>
            {doc.url ? (
              <Link href={doc.url} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 10.5, wordBreak: "break-all", display: "inline-flex", gap: 0.4 }}>
                <OpenInNewIcon sx={{ fontSize: 12 }} /> {doc.filename || doc.url}
              </Link>
            ) : <Typography sx={{ fontSize: 10.5 }}>-</Typography>}
          </Grid>
        </Grid>
      ))}
    </Box>
  );
}

export default function StudentCombinedDynamicProfilePage() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [application, setApplication] = useState(null);
  const [admissionFields, setAdmissionFields] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (application?.formid) {
      loadAdmissionMeta(application.formid);
    } else {
      setAdmissionFields([]);
      setRequiredDocuments([]);
    }
  }, [application?.formid]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadProfile(), loadApplications(), loadInstitution()]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await ep1.get("/api/v2/user-profile", {
        params: {
          colid: global1.colid,
          email: global1.email || global1.user,
          user: global1.user,
          regno: global1.regno,
          role: "Student"
        }
      });
      setProfile(res.data || null);
    } catch (err) {
      setProfile(null);
      setError((prev) => prev || err.response?.data?.msg || "Unable to load student profile");
    }
  };

  const loadApplications = async () => {
    try {
      const res = await ep1.get("/admission-dynamic/student-applications", {
        params: {
          colid: global1.colid,
          email: global1.email || global1.user,
          user: global1.user,
          username: global1.user,
          regno: global1.regno,
          phone: global1.phone
        }
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      setApplications(rows);
      setApplication(rows[0] || null);
    } catch (err) {
      setApplications([]);
      setApplication(null);
      setError((prev) => prev || err.response?.data?.msg || "Unable to load dynamic admission profile");
    }
  };

  const loadAdmissionMeta = async (formid) => {
    try {
      const [fieldsRes, docsRes] = await Promise.all([
        ep1.get("/admission-dynamic/fields", { params: { colid: global1.colid, formid } }),
        ep1.get("/admission-form-documents", { params: { colid: global1.colid, formid } })
      ]);
      setAdmissionFields(fieldsRes.data || []);
      setRequiredDocuments(docsRes.data?.data || []);
    } catch {
      setAdmissionFields([]);
      setRequiredDocuments([]);
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
      setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
    } catch {
      try {
        const res = await ep1.get("/vins", { params: { colid: global1.colid } });
        setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
      } catch {
        setInstitution(null);
      }
    }
  };

  const user = profile?.user || {};
  const photo = user.photo || (application?.documents || []).find((doc) => String(doc.documenttype || "").toLowerCase() === "photo")?.url || "";
  const profileSections = useMemo(() => buildProfileSections(profile || {}), [profile]);
  const admissionSections = useMemo(() => application ? buildAdmissionSections(admissionFields, application) : [], [admissionFields, application]);
  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";

  return (
    <MenuPageShell title="Dynamic profile" menuType="student">
      <Box sx={{ p: { xs: 1.5, md: 2.5 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 8mm; }
            body * { visibility: hidden; }
            #combined-dynamic-profile-print, #combined-dynamic-profile-print * { visibility: visible; color: #000 !important; }
            #combined-dynamic-profile-print { position: absolute; left: 0; top: 0; width: 194mm !important; max-width: 194mm !important; box-shadow: none !important; border: 0 !important; padding: 0 !important; }
            .combined-profile-no-print { display: none !important; }
            .combined-profile-block { break-inside: avoid; }
            .combined-profile-field { min-height: 34px !important; padding: 4px !important; }
          }
          .combined-profile-title {
            background: #111827;
            color: #fff;
            padding: 5px 8px;
            font-size: 13px;
            font-weight: 950;
            margin: 10px 0 6px;
          }
          .combined-profile-subtitle {
            background: #e5e7eb;
            border: 1px solid #cbd5e1;
            padding: 3px 8px;
            font-size: 11.5px !important;
            font-weight: 950 !important;
          }
          .combined-profile-field {
            border: 1px solid #d9e2ec;
            padding: 6px 7px;
            min-height: 45px;
            background: #fff;
            break-inside: avoid;
          }
          .combined-profile-label {
            font-size: 10px !important;
            color: #475569;
            font-weight: 900 !important;
            text-transform: uppercase;
          }
          .combined-profile-value {
            font-size: 11.5px !important;
            color: #111827;
            font-weight: 700 !important;
            white-space: pre-wrap;
            word-break: break-word;
          }
        `}</style>

        <Stack className="combined-profile-no-print" direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.5 }} alignItems={{ sm: "center" }}>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!profile && !application}>Print A4</Button>
          {applications.length > 1 && (
            <Autocomplete
              size="small"
              sx={{ minWidth: 420, maxWidth: 620 }}
              options={applications}
              value={application}
              onChange={(_, value) => setApplication(value || applications[0] || null)}
              getOptionLabel={(option) => [
                option.formid || "default",
                option.applicationid || option.applicationnumber || option._id,
                option.programapplied || option.programcode
              ].filter(Boolean).join(" | ")}
              renderInput={(params) => <TextField {...params} label="Select admission application" />}
            />
          )}
        </Stack>

        {loading && <Alert severity="info" className="combined-profile-no-print" icon={<CircularProgress size={18} />}>Loading profile...</Alert>}
        {error && <Alert severity="warning" className="combined-profile-no-print" sx={{ mb: 1 }}>{error}</Alert>}

        <Paper id="combined-dynamic-profile-print" sx={{ maxWidth: "210mm", mx: "auto", p: 1.5, bgcolor: "#fff", color: "#111827", border: "1px solid #cbd5e1" }}>
          <Grid container spacing={1} alignItems="flex-start">
            <Grid item xs={9}>
              <Stack alignItems="center" spacing={0.2} sx={{ textAlign: "center", pb: 0.75, borderBottom: "2px solid #111827" }}>
                {logo && <Box component="img" src={logo} alt="Institution logo" sx={{ maxHeight: 54, maxWidth: 130, objectFit: "contain" }} />}
                <Typography sx={{ fontSize: 16, fontWeight: 950 }}>{institutionName}</Typography>
                <Typography sx={{ fontSize: 11 }}>{address}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 950 }}>Combined Dynamic Profile</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{user.name || application?.name || global1.name || ""} | {user.regno || application?.regno || global1.regno || ""}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ height: 118, border: "1.5px solid #111827", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", p: 0.5 }}>
                {photo ? <Box component="img" src={photo} alt="Student" sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <Typography sx={{ fontSize: 10, fontWeight: 800 }}>Photo not available</Typography>}
              </Box>
            </Grid>
          </Grid>

          <Box className="combined-profile-block">
            <Typography className="combined-profile-title">Student Profile</Typography>
            {profile ? <FieldGrid sections={profileSections} /> : <Alert severity="warning">Student profile data was not found.</Alert>}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box className="combined-profile-block">
            <Typography className="combined-profile-title">Dynamic Admission Profile</Typography>
            {application ? (
              <Stack spacing={1.2}>
                <FieldGrid sections={admissionSections} />
                <Box>
                  <Typography className="combined-profile-subtitle">Admission Documents</Typography>
                  <Box sx={{ mt: 0.2 }}>
                    <DocumentTable documents={application.documents || []} requiredDocuments={requiredDocuments} />
                  </Box>
                </Box>
              </Stack>
            ) : <Alert severity="warning">Dynamic admission application data was not found.</Alert>}
          </Box>

          <Grid container spacing={1} sx={{ mt: 1.5 }}>
            {["Student Signature", "Verified By", "Remarks"].map((label) => (
              <Grid item xs={4} key={label}>
                <Box sx={{ height: 34, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end" }}>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 800 }}>{label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
