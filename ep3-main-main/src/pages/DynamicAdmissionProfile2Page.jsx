import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  TextField,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const defaultSection = "Applicant Details";
const educationPanelMap = {
  educationpanel10th: { title: "10th Details", institutionLabel: "Board", fields: [["Result Status", "result_status_10th"], ["Board", "board_10th"], ["Marks Type", "marks_type_10th"], ["Marks / Percentage", "marks_10"], ["CGPA / Grade", "cgpa_10"]] },
  educationpanel12th: { title: "12th Details", institutionLabel: "Board", fields: [["Result Status", "result_status_12th"], ["Board", "board_12th"], ["Marks Type", "marks_type_12th"], ["Marks / Percentage", "marks_12"], ["CGPA / Grade", "cgpa_12"]] },
  educationpanelug: { title: "UG Details", institutionLabel: "University", fields: [["Result Status", "result_status_UG"], ["University", "University_UG"], ["Marks Type", "marks_type_UG"], ["Marks / Percentage", "marks_UG"], ["CGPA / Grade", "cgpa_UG"]] },
  educationpanelpg: { title: "PG Details", institutionLabel: "University", fields: [["Result Status", "result_status_PG"], ["University", "University_PG"], ["Marks Type", "marks_type_PG"], ["Marks / Percentage", "marks_PG"], ["CGPA / Grade", "cgpa_PG"]] }
};

const fixedFields = [
  ["Application ID", "applicationid"],
  ["Application Number", "applicationnumber"],
  ["Form ID", "formid"],
  ["Academic Year", "academicyear"],
  ["Name", "name"],
  ["Username", "username"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["Address", "address"],
  ["Pin", "pin"],
  ["Country", "country_form"],
  ["State", "state_form"],
  ["District", "district_form"],
  ["Gender", "gender"],
  ["Category", "category"],
  ["EWS", "ews"],
  ["Physically Handicapped", "ph"],
  ["Minority", "minority"],
  ["Level", "level"],
  ["Program Type", "programtype"],
  ["Program Applied", "programapplied"],
  ["Program Code", "programcode"],
  ["Date of Birth", "dateofbirth"],
  ["Date of Application", "dateofapplication"],
  ["Age", "age"],
  ["Reg No", "regno"],
  ["Validation Status", "validationstatus"],
  ["Validation Comments", "validationcomments"],
  ["Application Status", "applicationstatus"],
  ["Application Fee Amount", "applicationfeeamount"],
  ["Application Fee Status", "paymentstatus"],
  ["Application Fee Ref No", "paymentrefno"],
  ["Provisional Fee Amount", "provisionalfeeamount"],
  ["Provisional Fee Status", "provisionalpaymentstatus"],
  ["Provisional Fee Ref No", "provisionalpaymentrefno"]
];

const subjectRows = (title, rows = []) => ({
  key: title,
  title,
  fields: (rows.length ? rows : [{ subject: "", marks: "" }]).flatMap((row, index) => ([
    [`${title} ${index + 1} Subject`, row.subject || ""],
    [`${title} ${index + 1} Marks`, row.marks ?? ""]
  ]))
});

const clean = (value) => String(value ?? "").trim();
const displayValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return clean(value) || "-";
};

const fieldValue = (application, field) => {
  const name = field.fieldname;
  if (!name) return "";
  if (application?.[name] !== undefined && application?.[name] !== null) return application[name];
  return application?.extraFields?.[name] ?? "";
};

const groupFields = (fields = [], application = {}) => {
  const pageMap = new Map();
  const ensurePage = (pageName) => {
    const page = pageName || "Page 1";
    if (!pageMap.has(page)) pageMap.set(page, new Map());
    return pageMap.get(page);
  };
  const addSection = (pageName, sectionName, items) => {
    const sectionMap = ensurePage(pageName);
    const section = sectionName || "Additional Details";
    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section).push(...items);
  };

  addSection("Page 1", defaultSection, fixedFields.map(([label, field]) => ({ label, value: application?.[field], key: field })));

  fields.forEach((field) => {
    if (field.type === "addresspanel") {
      addSection(field.page, field.section || field.label || "Address Details", [
        { label: "Country", value: application.country_form, key: `${field._id}-country` },
        { label: "State", value: application.state_form, key: `${field._id}-state` },
        { label: "District", value: application.district_form, key: `${field._id}-district` }
      ]);
      return;
    }
    if (educationPanelMap[field.type]) {
      const panel = educationPanelMap[field.type];
      addSection(field.page, field.section || panel.title, panel.fields.map(([label, key]) => ({ label, value: application[key], key: `${field._id}-${key}` })));
      return;
    }
    addSection(field.page, field.section, [{ label: field.label || field.fieldname, value: fieldValue(application, field), key: field.fieldname || field._id }]);
  });

  addSection("Academic Marks", "Subject Marks", [
    ...subjectRows("10th", application.tenthsubjectmarks).fields.map(([label, value], index) => ({ label, value, key: `tenth-${index}` })),
    ...subjectRows("12th", application.twelvesubjectmarks).fields.map(([label, value], index) => ({ label, value, key: `twelve-${index}` }))
  ]);

  return Array.from(pageMap.entries()).map(([page, sectionMap]) => ({
    page,
    sections: Array.from(sectionMap.entries()).map(([section, rows]) => ({ section, rows }))
  }));
};

export default function DynamicAdmissionProfile2Page({ student = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [application, setApplication] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [fields, setFields] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [activePage, setActivePage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (student) loadStudentProfiles();
    else loadProfile();
    loadInstitution();
  }, [id, student]);

  useEffect(() => {
    if (application?.formid) {
      loadFields(application.formid);
      loadRequiredDocuments(application.formid);
    }
  }, [application?.formid]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/admission-dynamic/application", { params: { colid: global1.colid, id } });
      setApplication(res.data || null);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load admission profile");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProfiles = async () => {
    try {
      setLoading(true);
      setError("");
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
      if (!rows.length) setError("No dynamic admission application was found for your login.");
    } catch (err) {
      setApplications([]);
      setApplication(null);
      setError(err.response?.data?.msg || "Unable to load your admission profile");
    } finally {
      setLoading(false);
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadFields = async (formid) => {
    try {
      const res = await ep1.get("/admission-dynamic/fields", { params: { colid: global1.colid, formid } });
      setFields(res.data || []);
    } catch (err) {
      setFields([]);
    }
  };

  const loadRequiredDocuments = async (formid) => {
    try {
      const res = await ep1.get("/admission-form-documents", { params: { colid: global1.colid, formid } });
      setRequiredDocuments(res.data?.data || []);
    } catch (err) {
      setRequiredDocuments([]);
    }
  };

  const pageGroups = useMemo(() => groupFields(fields, application || {}), [fields, application]);
  const uploadedDocs = application?.documents || [];
  const photoDocument = uploadedDocs.find((doc) => String(doc.documenttype || "").toLowerCase() === "photo" && doc.url);
  const documentRows = useMemo(() => {
    const configured = [...requiredDocuments].sort((a, b) => Number(a.displayorder || 0) - Number(b.displayorder || 0) || String(a.documentname || "").localeCompare(String(b.documentname || "")));
    const rows = configured.map((doc) => {
      const uploaded = uploadedDocs.find((item) => String(item.documenttype || "").toLowerCase() === String(doc.documentname || "").toLowerCase());
      return {
        documenttype: doc.documentname,
        required: doc.required,
        description: uploaded?.description || doc.description || "",
        filename: uploaded?.originalname || uploaded?.filename || "",
        url: uploaded?.url || "",
        status: uploaded?.url ? "Uploaded" : "Not uploaded"
      };
    });
    uploadedDocs.forEach((doc) => {
      const exists = rows.some((row) => String(row.documenttype || "").toLowerCase() === String(doc.documenttype || "").toLowerCase());
      if (!exists) {
        rows.push({
          documenttype: doc.documenttype || "Document",
          required: "No",
          description: doc.description || "",
          filename: doc.originalname || doc.filename || "",
          url: doc.url || "",
          status: doc.url ? "Uploaded" : "Not uploaded"
        });
      }
    });
    return rows;
  }, [requiredDocuments, uploadedDocs]);

  const visiblePage = pageGroups[activePage] || pageGroups[0];

  const renderValueCell = (item) => (
    <Grid item xs={12} sm={6} md={4} key={item.key || item.label}>
      <Box className="profile2-field" sx={{ border: "1px solid #cbd5e1", minHeight: 42, p: 0.75, bgcolor: "#fff" }}>
        <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: "#334155" }}>{item.label}</Typography>
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{displayValue(item.value)}</Typography>
      </Box>
    </Grid>
  );

  return (
    <MenuPageShell title={student ? "Admission Profile" : "Admission Profile 2"} menuType={student ? "student" : undefined}>
      <Box sx={{ p: { xs: 1.5, md: 2.5 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 8mm; }
            body * { visibility: hidden; }
            #dynamic-admission-profile2-print, #dynamic-admission-profile2-print * { visibility: visible; color: #000 !important; }
            #dynamic-admission-profile2-print { position: absolute; left: 0; top: 0; width: 194mm !important; max-width: 194mm !important; box-shadow: none !important; border: 0 !important; padding: 0 !important; }
            .no-print { display: none !important; }
            .profile2-print-page { display: block !important; }
            .profile2-field { min-height: 34px !important; padding: 4px !important; }
          }
        `}</style>
        <Stack className="no-print" direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
          {!student && <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dynamic-admission-applications")}>Back</Button>}
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!application}>Print A4</Button>
        </Stack>
        {loading && <Alert severity="info" className="no-print" icon={<CircularProgress size={18} />}>Loading profile...</Alert>}
        {error && <Alert severity="error" className="no-print" onClose={() => setError("")}>{error}</Alert>}

        {application && (
          <>
            {student && applications.length > 1 && (
              <Paper className="no-print" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
                <Autocomplete
                  size="small"
                  options={applications}
                  value={application}
                  onChange={(_, value) => {
                    setApplication(value || applications[0] || null);
                    setActivePage(0);
                  }}
                  getOptionLabel={(option) => [
                    option.formid || "default",
                    option.applicationid || option.applicationnumber || option._id,
                    option.programapplied || option.programcode
                  ].filter(Boolean).join(" | ")}
                  renderInput={(params) => <TextField {...params} label="Select admission application" />}
                />
              </Paper>
            )}
            <Paper className="no-print" sx={{ mb: 1.5, borderRadius: 2, overflow: "hidden" }}>
              <Tabs value={activePage} onChange={(_, value) => setActivePage(value)} variant="scrollable" scrollButtons="auto">
                {pageGroups.map((group, index) => <Tab key={group.page} label={group.page} value={index} />)}
                <Tab label="Documents" value={pageGroups.length} />
              </Tabs>
            </Paper>

            <Paper id="dynamic-admission-profile2-print" sx={{ maxWidth: "210mm", mx: "auto", p: 1.5, bgcolor: "#fff", color: "#111827", border: "1px solid #cbd5e1" }}>
              <Grid container spacing={1} alignItems="flex-start">
                <Grid item xs={9}>
                  <Stack alignItems="center" spacing={0.2} sx={{ textAlign: "center", pb: 0.75, borderBottom: "2px solid #111827" }}>
                    {institution?.logolink && <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 54, maxWidth: 130, objectFit: "contain" }} />}
                    <Typography sx={{ fontSize: 16, fontWeight: 950 }}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
                    <Typography sx={{ fontSize: 11 }}>{institution?.address || ""}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 950 }}>Admission Application Profile</Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 800 }}>{application.formid || "default"} | {application.applicationid || application._id}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ height: 118, border: "1.5px solid #111827", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", p: 0.5 }}>
                    {photoDocument?.url ? <Box component="img" src={photoDocument.url} alt="Applicant" sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <Typography sx={{ fontSize: 10, fontWeight: 800 }}>Photo not uploaded</Typography>}
                  </Box>
                </Grid>
              </Grid>

              <Box className="no-print" sx={{ mt: 1 }}>
                {activePage < pageGroups.length && visiblePage?.sections.map((section) => (
                  <Box key={`${visiblePage.page}-${section.section}`} sx={{ mb: 1.25 }}>
                    <Typography sx={{ bgcolor: "#e2e8f0", border: "1px solid #cbd5e1", px: 1, py: 0.4, fontSize: 12, fontWeight: 950 }}>{section.section}</Typography>
                    <Grid container spacing={0.6} sx={{ mt: 0.2 }}>{section.rows.map(renderValueCell)}</Grid>
                  </Box>
                ))}
                {activePage === pageGroups.length && (
                  <Box>
                    <Typography sx={{ bgcolor: "#e2e8f0", border: "1px solid #cbd5e1", px: 1, py: 0.4, fontSize: 12, fontWeight: 950 }}>Documents</Typography>
                    <DocumentTable rows={documentRows} />
                  </Box>
                )}
              </Box>

              <Box className="profile2-print-page" sx={{ display: { xs: "none", print: "block" }, mt: 1 }}>
                {pageGroups.map((page) => (
                  <Box key={page.page} sx={{ mb: 1 }}>
                    <Typography sx={{ bgcolor: "#111827", color: "#fff !important", px: 1, py: 0.35, fontSize: 12, fontWeight: 950 }}>{page.page}</Typography>
                    {page.sections.map((section) => (
                      <Box key={`${page.page}-${section.section}`} sx={{ mb: 0.75 }}>
                        <Typography sx={{ bgcolor: "#e5e7eb", border: "1px solid #cbd5e1", px: 1, py: 0.25, fontSize: 11.5, fontWeight: 950 }}>{section.section}</Typography>
                        <Grid container spacing={0.45} sx={{ mt: 0.15 }}>{section.rows.map(renderValueCell)}</Grid>
                      </Box>
                    ))}
                  </Box>
                ))}
                <Typography sx={{ bgcolor: "#111827", color: "#fff !important", px: 1, py: 0.35, fontSize: 12, fontWeight: 950 }}>Documents</Typography>
                <DocumentTable rows={documentRows} />
              </Box>

              <Divider sx={{ mt: 1, mb: 0.75 }} />
              <Grid container spacing={1}>
                {["Applicant Signature", "Checked By", "Approved By", "Remarks"].map((label) => (
                  <Grid item xs={6} md={3} key={label}>
                    <Box sx={{ height: 34, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end" }}>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 800 }}>{label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </>
        )}
      </Box>
    </MenuPageShell>
  );
}

function DocumentTable({ rows }) {
  return (
    <Box sx={{ border: "1px solid #cbd5e1", borderTop: 0, overflow: "hidden" }}>
      <Grid container sx={{ bgcolor: "#f8fafc", borderTop: "1px solid #cbd5e1" }}>
        {["Document", "Required", "Status", "Link"].map((heading) => (
          <Grid item xs={heading === "Link" ? 5 : heading === "Document" ? 3 : 2} key={heading} sx={{ px: 0.75, py: 0.45, borderRight: "1px solid #e5e7eb" }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 950 }}>{heading}</Typography>
          </Grid>
        ))}
      </Grid>
      {(rows.length ? rows : [{ documenttype: "No document configured", required: "-", status: "Not uploaded", url: "" }]).map((doc, index) => (
        <Grid container key={`${doc.documenttype}-${index}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
          <Grid item xs={3} sx={{ px: 0.75, py: 0.45 }}><Typography sx={{ fontSize: 10.5, fontWeight: 800 }}>{doc.documenttype || "-"}</Typography></Grid>
          <Grid item xs={2} sx={{ px: 0.75, py: 0.45 }}><Typography sx={{ fontSize: 10.5 }}>{doc.required || "-"}</Typography></Grid>
          <Grid item xs={2} sx={{ px: 0.75, py: 0.45 }}><Typography sx={{ fontSize: 10.5 }}>{doc.status || "Not uploaded"}</Typography></Grid>
          <Grid item xs={5} sx={{ px: 0.75, py: 0.45 }}>
            {doc.url ? (
              <Link href={doc.url} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 10.5, wordBreak: "break-all", display: "inline-flex", alignItems: "center", gap: 0.4 }}>
                <OpenInNewIcon sx={{ fontSize: 12 }} /> {doc.filename || doc.url}
              </Link>
            ) : (
              <Typography sx={{ fontSize: 10.5 }}>-</Typography>
            )}
          </Grid>
        </Grid>
      ))}
    </Box>
  );
}
