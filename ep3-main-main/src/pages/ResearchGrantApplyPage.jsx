import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, Delete, Print, Save, UploadFile } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const years = ["2025-26", "2026-27", "2027-28", "2028-29", "2029-30"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function ResearchGrantApplyPage() {
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [message, setMessage] = useState("");
  const [upload, setUpload] = useState({ documenttype: "Proposal", description: "", file: null });
  const [form, setForm] = useState({
    academicyear: "2026-27",
    projecttitle: "",
    description: "",
    fromdate: "",
    todate: "",
    copiinternal: "",
    copiinternalemail: "",
    copiexternal: "",
    requestedcomponents: []
  });

  const totalRequested = form.requestedcomponents.reduce((sum, item) => sum + Number(item.requestedamount || 0), 0);
  const previewGrant = selectedGrant || {
    ...form,
    department: global1.department,
    facultyname: global1.name,
    userid: global1.user,
    estimatedtotalamount: totalRequested,
    documents,
    status: "Draft"
  };
  const previewComponents = previewGrant.requestedcomponents || [];
  const previewDocuments = previewGrant.documents || [];
  const previewTotal = Number(previewGrant.estimatedtotalamount || 0) || previewComponents.reduce((sum, item) => sum + Number(item.requestedamount || 0), 0);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadComponents = async () => {
    const res = await ep1.get("/api/v2/research/components", { params: { colid: global1.colid, status: "Active" } });
    const list = res.data?.data || [];
    setComponents(list);
    setForm((prev) => ({
      ...prev,
      requestedcomponents: list.map((item) => {
        const old = prev.requestedcomponents.find((component) => component.component === item.component);
        return { component: item.component, requestedamount: old?.requestedamount || "" };
      })
    }));
  };

  const loadRows = async () => {
    const res = await ep1.get("/api/v2/research/grants", { params: { colid: global1.colid, userid: global1.user } });
    setRows(res.data?.data || []);
  };

  useEffect(() => { loadInstitution(); loadComponents(); loadRows(); }, []);

  const searchFaculty = async (query) => {
    const res = await ep1.get("/api/v2/research/faculty-search", { params: { colid: global1.colid, q: query } });
    setFacultyOptions(res.data?.data || []);
  };

  const updateComponent = (component, value) => {
    setForm((prev) => ({
      ...prev,
      requestedcomponents: prev.requestedcomponents.map((item) => item.component === component ? { ...item, requestedamount: value } : item)
    }));
  };

  const uploadDocument = async () => {
    if (!upload.file) {
      setMessage("Select document to upload.");
      return;
    }
    const body = new FormData();
    body.append("colid", global1.colid);
    body.append("documenttype", upload.documenttype);
    body.append("description", upload.description);
    body.append("file", upload.file);
    const res = await ep1.post("/api/v2/research/upload", body, { headers: { "Content-Type": "multipart/form-data" } });
    setDocuments((prev) => [...prev, res.data.document]);
    setUpload({ documenttype: "Proposal", description: "", file: null });
    setMessage("Document uploaded.");
  };

  const submit = async () => {
    if (!form.projecttitle) {
      setMessage("Project title is required.");
      return;
    }
    await ep1.post("/api/v2/research/grants", {
      ...form,
      colid: global1.colid,
      department: global1.department,
      facultyname: global1.name,
      userid: global1.user,
      estimatedtotalamount: totalRequested,
      requestedcomponents: form.requestedcomponents,
      documents,
      name: global1.name,
      user: global1.user
    });
    setMessage("Research grant application submitted.");
    setDocuments([]);
    setForm((prev) => ({ ...prev, projecttitle: "", description: "", requestedcomponents: prev.requestedcomponents.map((item) => ({ ...item, requestedamount: "" })) }));
    loadRows();
  };

  const downloadTemplate = () => {
    const sample = {
      academicyear: "2026-27",
      projecttitle: "Sample research project",
      description: "Project description",
      fromdate: "2026-07-01",
      todate: "2027-06-30",
      copiinternal: "",
      copiinternalemail: "",
      copiexternal: ""
    };
    components.forEach((component) => {
      sample[component.component] = 0;
    });
    const ws = XLSX.utils.json_to_sheet([sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Research Grants");
    XLSX.writeFile(wb, "research_grant_bulk_template.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const items = jsonRows.map((row) => {
      const requestedcomponents = components.map((component) => ({
        component: component.component,
        requestedamount: row[component.component] || 0
      })).filter((component) => Number(component.requestedamount || 0) > 0);
      return {
        academicyear: row.academicyear || row["Academic Year"],
        projecttitle: row.projecttitle || row["Project Title"],
        description: row.description || row.Description,
        fromdate: row.fromdate || row["From Date"],
        todate: row.todate || row["To Date"],
        copiinternal: row.copiinternal || row["Co PI Internal"],
        copiinternalemail: row.copiinternalemail || row["Co PI Internal Email"],
        copiexternal: row.copiexternal || row["Co PI External"],
        requestedcomponents
      };
    });
    const res = await ep1.post("/api/v2/research/grants/bulk", {
      colid: global1.colid,
      department: global1.department,
      facultyname: global1.name,
      userid: global1.user,
      name: global1.name,
      user: global1.user,
      items
    });
    alert(`${res.data?.inserted || 0} research grant applications uploaded.`);
    loadRows();
  };

  const deleteGrant = async (row) => {
    if (row.status !== "Applied") {
      alert("Delete is allowed only when the status is Applied. Approved applications cannot be deleted.");
      return;
    }
    await ep1.post("/api/v2/research/grants/delete", { id: row._id, colid: global1.colid });
    alert("Research grant application deleted.");
    if (selectedGrant?._id === row._id) setSelectedGrant(null);
    loadRows();
  };

  const columns = [
    { field: "createdAt", headerName: "Date", width: 130, valueGetter: (params) => params.row.createdAt ? String(params.row.createdAt).slice(0, 10) : "" },
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "projecttitle", headerName: "Project Title", minWidth: 240, flex: 1 },
    { field: "estimatedtotalamount", headerName: "Estimated", width: 130, type: "number" },
    { field: "status", headerName: "Status", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      renderCell: (params) => (
        <Button size="small" color="error" startIcon={<Delete />} onClick={() => deleteGrant(params.row)}>
          Delete
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <style>{`@media print { @page { size: A4 portrait; margin: 10mm; } body * { visibility: hidden; } #research-print, #research-print * { visibility: visible; } #research-print { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; border: 0 !important; } .no-print { display: none !important; } }`}</style>
      <Stack className="no-print" direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        <Typography variant="h5" fontWeight={900} sx={{ flex: 1 }}>Apply for research grant</Typography>
        <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
        <Button variant="outlined" component="label" startIcon={<UploadFile />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} /></Button>
        <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print Preview</Button>
      </Stack>
      {message && <Alert className="no-print" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight={900}>Research Grant Application Form</Typography>
        <Typography variant="body2">Faculty: {global1.name} | Department: {global1.department} | User: {global1.user}</Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value })}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={5}><TextField fullWidth label="Project Title" value={form.projecttitle} onChange={(e) => setForm({ ...form, projecttitle: e.target.value })} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="date" label="From Date" value={form.fromdate} onChange={(e) => setForm({ ...form, fromdate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={2}><TextField fullWidth type="date" label="To Date" value={form.todate} onChange={(e) => setForm({ ...form, todate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={facultyOptions}
              getOptionLabel={(option) => option?.name ? `${option.name} (${option.email || ""})` : ""}
              onInputChange={(_, value) => searchFaculty(value)}
              onChange={(_, value) => setForm({ ...form, copiinternal: value?.name || "", copiinternalemail: value?.email || "" })}
              renderInput={(params) => <TextField {...params} label="Co PI Internal" />}
            />
          </Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Co PI External" value={form.copiexternal} onChange={(e) => setForm({ ...form, copiexternal: e.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Estimated Total Amount" value={money(totalRequested)} InputProps={{ readOnly: true }} helperText="Auto calculated from component-wise requested amount" /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
          <Grid item xs={12}><Typography fontWeight={900}>Component-wise fund requested</Typography></Grid>
          {form.requestedcomponents.map((item) => (
            <Grid item xs={12} md={4} key={item.component}>
              <TextField fullWidth type="number" label={item.component} value={item.requestedamount} onChange={(e) => updateComponent(item.component, e.target.value)} />
            </Grid>
          ))}
          <Grid className="no-print" item xs={12}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Upload Documents</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Document Type" value={upload.documenttype} onChange={(e) => setUpload({ ...upload, documenttype: e.target.value })}>{["Proposal", "Budget", "Approval", "Other"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Description" value={upload.description} onChange={(e) => setUpload({ ...upload, description: e.target.value })} /></Grid>
                <Grid item xs={12} md={3}><Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />}>Select File<input hidden type="file" onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0] || null })} /></Button></Grid>
                <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={uploadDocument}>Upload</Button></Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Typography fontWeight={900}>Documents</Typography>
            {documents.length ? documents.map((doc, index) => (
              <Typography key={index} variant="body2" sx={{ wordBreak: "break-word" }}>
                {doc.documenttype}: <Link href={doc.url} target="_blank" rel="noreferrer">{doc.url}</Link>
              </Typography>
            )) : <Typography variant="body2">No documents uploaded</Typography>}
          </Grid>
          <Grid className="no-print" item xs={12}><Button variant="contained" startIcon={<Save />} onClick={submit}>Submit Application</Button></Grid>
        </Grid>
      </Paper>

      <Paper id="research-print" sx={{ p: 2.5, mb: 2, bgcolor: "#fff", border: "1px solid #d1d5db" }}>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #111827", mb: 2 }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 72, maxWidth: 150, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={900}>Research Grant Application Print Preview</Typography>
          {selectedGrant ? (
            <Typography variant="body2">Application ID: {selectedGrant._id}</Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">Draft preview. Select a row below to print a saved application.</Typography>
          )}
        </Stack>

        <Grid container spacing={1.5}>
          {[
            ["Academic Year", previewGrant.academicyear],
            ["Status", previewGrant.status],
            ["Current Approval Level", previewGrant.currentlevel || "-"],
            ["Department", previewGrant.department],
            ["Faculty Name", previewGrant.facultyname],
            ["User ID", previewGrant.userid],
            ["Project Title", previewGrant.projecttitle],
            ["From Date", previewGrant.fromdate],
            ["To Date", previewGrant.todate],
            ["Co PI Internal", previewGrant.copiinternal],
            ["Co PI Internal Email", previewGrant.copiinternalemail],
            ["Co PI External", previewGrant.copiexternal],
            ["Estimated Total Amount", money(previewTotal)]
          ].map(([label, value]) => (
            <Grid item xs={12} sm={6} md={4} key={label}>
              <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, p: 1, minHeight: 56 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
              </Box>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">Description</Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{previewGrant.description || "-"}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
              <Typography sx={{ bgcolor: "#e2e8f0", px: 1.25, py: 0.75, fontWeight: 900 }}>Component-wise fund requested</Typography>
              <Grid container sx={{ bgcolor: "#f8fafc", borderTop: "1px solid #cbd5e1" }}>
                <Grid item xs={8} sx={{ px: 1.25, py: 0.75, borderRight: "1px solid #e5e7eb" }}><Typography variant="caption" fontWeight={900}>Component</Typography></Grid>
                <Grid item xs={4} sx={{ px: 1.25, py: 0.75, textAlign: "right" }}><Typography variant="caption" fontWeight={900}>Requested Amount</Typography></Grid>
              </Grid>
              {(previewComponents.length ? previewComponents : [{ component: "-", requestedamount: 0 }]).map((item, index) => (
                <Grid container key={`${item.component}-${index}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
                  <Grid item xs={8} sx={{ px: 1.25, py: 0.75, borderRight: "1px solid #f1f5f9" }}><Typography variant="body2">{item.component || "-"}</Typography></Grid>
                  <Grid item xs={4} sx={{ px: 1.25, py: 0.75, textAlign: "right" }}><Typography variant="body2">{money(item.requestedamount)}</Typography></Grid>
                </Grid>
              ))}
              <Grid container sx={{ borderTop: "1px solid #cbd5e1", bgcolor: "#f8fafc" }}>
                <Grid item xs={8} sx={{ px: 1.25, py: 0.75, borderRight: "1px solid #e5e7eb" }}><Typography variant="body2" fontWeight={900}>Total</Typography></Grid>
                <Grid item xs={4} sx={{ px: 1.25, py: 0.75, textAlign: "right" }}><Typography variant="body2" fontWeight={900}>{money(previewTotal)}</Typography></Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
              <Typography sx={{ bgcolor: "#e2e8f0", px: 1.25, py: 0.75, fontWeight: 900 }}>Documents</Typography>
              {previewDocuments.length ? previewDocuments.map((doc, index) => (
                <Grid container key={`${doc.url || doc.filename}-${index}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
                  <Grid item xs={2} sx={{ px: 1.25, py: 0.75 }}><Typography variant="body2">{doc.documenttype || "-"}</Typography></Grid>
                  <Grid item xs={7} sx={{ px: 1.25, py: 0.75 }}>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      {doc.url ? <Link href={doc.url} target="_blank" rel="noreferrer">{doc.url}</Link> : "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ px: 1.25, py: 0.75 }}><Typography variant="body2">{doc.description || "-"}</Typography></Grid>
                </Grid>
              )) : <Typography variant="body2" sx={{ p: 1.25 }}>No documents uploaded</Typography>}
            </Box>
          </Grid>
          {previewGrant.approvalhistory?.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
                <Typography sx={{ bgcolor: "#e2e8f0", px: 1.25, py: 0.75, fontWeight: 900 }}>Approval History</Typography>
                {previewGrant.approvalhistory.map((item, index) => (
                  <Grid container key={index} sx={{ borderTop: "1px solid #e5e7eb" }}>
                    <Grid item xs={2} sx={{ px: 1.25, py: 0.75 }}><Typography variant="body2">Level {item.level}</Typography></Grid>
                    <Grid item xs={2} sx={{ px: 1.25, py: 0.75 }}><Typography variant="body2">{item.decision}</Typography></Grid>
                    <Grid item xs={3} sx={{ px: 1.25, py: 0.75 }}><Typography variant="body2">{item.approvedbyname || item.approvedby}</Typography></Grid>
                    <Grid item xs={5} sx={{ px: 1.25, py: 0.75 }}><Typography variant="body2">{item.comments || "-"}</Typography></Grid>
                  </Grid>
                ))}
              </Box>
            </Grid>
          )}
          <Grid item xs={4}><Box sx={{ height: 60, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}><Typography variant="body2">Applicant Signature</Typography></Box></Grid>
          <Grid item xs={4}><Box sx={{ height: 60, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}><Typography variant="body2">Checked By</Typography></Box></Grid>
          <Grid item xs={4}><Box sx={{ height: 60, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}><Typography variant="body2">Approved By</Typography></Box></Grid>
        </Grid>
      </Paper>

      <Paper className="no-print" sx={{ height: 440, p: 1 }}>
        <Typography variant="h6" sx={{ p: 1 }}>My research grant applications</Typography>
        <DataGrid
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => setSelectedGrant(params.row)}
        />
      </Paper>
    </Box>
  );
}
