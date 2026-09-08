import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Delete, Edit, UploadFile } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MentoringLayout from "./MentoringLayout";

const sourceBlank = { source_name: "", source_type: "Other", description: "", is_active: "Yes" };
const stageBlank = { stagename: "", name: "", description: "", isactive: true, is_final_stage: false };
const leadBlank = {
  year: "2026-27",
  name: "",
  phone: "",
  email: "",
  category: "",
  course_interested: "",
  source: "",
  pipeline_stage: "New Lead",
  leadstatus: "Active",
  assignedto: "",
  followupdate: "",
  city: "",
  state: "",
  comments: ""
};

const sourceTypes = ["Organic", "Paid", "Referral", "Direct", "Social Media", "Other"];
const statusList = ["Active", "Converted", "Lost"];
const categoryList = ["General", "SC", "ST", "OBC", "Others"];
const defaultYears = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];

const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== "") || "";
const excelRows = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
};
const downloadTemplate = (name, row) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([row]), "Template");
  XLSX.writeFile(workbook, name);
};

export default function CrmManagementPage() {
  const [tab, setTab] = useState(0);
  const [sources, setSources] = useState([]);
  const [stages, setStages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [leadOptions, setLeadOptions] = useState({});
  const [programYears, setProgramYears] = useState(defaultYears);
  const [leadPrograms, setLeadPrograms] = useState([]);
  const [filterPrograms, setFilterPrograms] = useState([]);
  const [sourceForm, setSourceForm] = useState(sourceBlank);
  const [stageForm, setStageForm] = useState(stageBlank);
  const [leadForm, setLeadForm] = useState(leadBlank);
  const [sourceEditId, setSourceEditId] = useState("");
  const [stageEditId, setStageEditId] = useState("");
  const [leadEditId, setLeadEditId] = useState("");
  const [leadFilters, setLeadFilters] = useState({ search: "", year: "", source: "", pipeline_stage: "", assignedto: "", fromDate: "", toDate: "" });
  const [leadPagination, setLeadPagination] = useState({ page: 0, pageSize: 100 });
  const [leadTotal, setLeadTotal] = useState(0);
  const [leadLoading, setLeadLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadProgramsForYear(leadForm.year, "form");
  }, [leadForm.year]);

  useEffect(() => {
    if (leadFilters.year) loadProgramsForYear(leadFilters.year, "filter");
    else setFilterPrograms([]);
  }, [leadFilters.year]);

  const loadAll = async () => {
    await Promise.all([loadOptions(), loadSources(), loadStages(), searchLeads()]);
  };

  const loadOptions = async () => {
    const [res, programRes] = await Promise.all([
      ep1.get("/api/v2/crm-management/options", { params: { colid: global1.colid } }),
      ep1.get("/api/v2/mprograms-management/options", { params: { colid: global1.colid } })
    ]);
    setUsers(res.data?.users || []);
    setLeadOptions(res.data?.leadOptions || {});
    const years = [...new Set([...(programRes.data?.years || []), ...defaultYears])].filter(Boolean).sort();
    setProgramYears(years);
  };

  const loadProgramsForYear = async (year, target) => {
    if (!year) {
      if (target === "form") setLeadPrograms([]);
      else setFilterPrograms([]);
      return;
    }
    const res = await ep1.get("/api/v2/mprograms-management", { params: { colid: global1.colid, year } });
    const programs = res.data?.data || [];
    if (target === "form") setLeadPrograms(programs);
    else setFilterPrograms(programs);
  };

  const loadSources = async () => {
    const res = await ep1.get("/api/v2/crm-management/sources", { params: { colid: global1.colid } });
    setSources(res.data?.data || []);
  };

  const loadStages = async () => {
    const res = await ep1.get("/api/v2/crm-management/stages", { params: { colid: global1.colid } });
    setStages(res.data?.data || []);
  };

  const searchLeads = async (filters = leadFilters, pagination = leadPagination) => {
    try {
      setLeadLoading(true);
      const res = await ep1.post("/api/v2/crm-management/leads/search", {
        ...filters,
        colid: global1.colid,
        page: pagination.page,
        limit: pagination.pageSize
      });
      setLeads(res.data?.data || []);
      setLeadTotal(res.data?.total || 0);
    } finally {
      setLeadLoading(false);
    }
  };

  const queryLeads = () => {
    const nextPagination = { ...leadPagination, page: 0 };
    setLeadPagination(nextPagination);
    searchLeads(leadFilters, nextPagination);
  };

  const saveSource = async () => {
    if (!sourceForm.source_name) return setError("Source name is required.");
    await ep1.post("/api/v2/crm-management/sources", { ...sourceForm, id: sourceEditId, colid: global1.colid, created_by: global1.user });
    setMessage(sourceEditId ? "Source updated." : "Source added.");
    setSourceForm(sourceBlank);
    setSourceEditId("");
    loadSources();
  };

  const saveStage = async () => {
    if (!stageForm.stagename) return setError("Pipeline stage is required.");
    await ep1.post("/api/v2/crm-management/stages", { ...stageForm, id: stageEditId, colid: global1.colid, user: global1.user, name: stageForm.name || stageForm.stagename });
    setMessage(stageEditId ? "Pipeline stage updated." : "Pipeline stage added.");
    setStageForm(stageBlank);
    setStageEditId("");
    loadStages();
  };

  const saveLead = async () => {
    if (!leadForm.name || !leadForm.category || !leadForm.source || !leadForm.assignedto) {
      return setError("Name, category, source and assigned to are required.");
    }
    await ep1.post("/api/v2/crm-management/leads", { ...leadForm, id: leadEditId, colid: global1.colid, user: global1.user });
    setMessage(leadEditId ? "Lead updated." : "Lead added.");
    setLeadForm(leadBlank);
    setLeadEditId("");
    searchLeads();
    loadOptions();
  };

  const deleteRow = async (type, id) => {
    if (!window.confirm("Delete this record?")) return;
    await ep1.post(`/api/v2/crm-management/${type}-delete`, { id, colid: global1.colid });
    setMessage("Record deleted.");
    if (type === "sources") loadSources();
    if (type === "stages") loadStages();
    if (type === "leads") searchLeads();
  };

  const uploadSources = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const items = (await excelRows(file)).map((row) => ({
      source_name: first(row.source_name, row.Source, row.source),
      source_type: first(row.source_type, row.Type, "Other"),
      description: first(row.description, row.Description),
      is_active: first(row.is_active, row.Active, "Yes")
    }));
    const res = await ep1.post("/api/v2/crm-management/sources-bulk", { colid: global1.colid, user: global1.user, items });
    setMessage(`${res.data?.saved || 0} sources uploaded.`);
    loadSources();
  };

  const uploadStages = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const items = (await excelRows(file)).map((row) => ({
      stagename: first(row.stagename, row.Stage, row.stage),
      name: first(row.name, row.stagename, row.Stage),
      description: first(row.description, row.Description),
      isactive: first(row.isactive, row.Active, true),
      is_final_stage: first(row.is_final_stage, row.Final, false)
    }));
    const res = await ep1.post("/api/v2/crm-management/stages-bulk", { colid: global1.colid, user: global1.user, items });
    setMessage(`${res.data?.saved || 0} stages uploaded.`);
    loadStages();
  };

  const uploadLeads = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const items = (await excelRows(file)).map((row) => ({
      name: first(row.name, row.Name),
      phone: first(row.phone, row.Phone),
      email: first(row.email, row.Email),
      category: first(row.category, row.Category, "NA"),
      year: first(row.year, row.Year, "2026-27"),
      course_interested: first(row.course_interested, row.Course),
      source: first(row.source, row.Source, "NA"),
      pipeline_stage: first(row.pipeline_stage, row.Stage, "New Lead"),
      leadstatus: first(row.leadstatus, row.Status, "Active"),
      assignedto: first(row.assignedto, row.AssignedTo, global1.user),
      followupdate: first(row.followupdate, row.FollowupDate),
      city: first(row.city, row.City),
      state: first(row.state, row.State),
      comments: first(row.comments, row.Comments)
    }));
    const res = await ep1.post("/api/v2/crm-management/leads-bulk", { colid: global1.colid, user: global1.user, items });
    setMessage(`${res.data?.saved || 0} leads uploaded.`);
    searchLeads();
    loadOptions();
  };

  const sourceColumns = useMemo(() => [
    { field: "source_name", headerName: "Source", minWidth: 180, flex: 1 },
    { field: "source_type", headerName: "Type", minWidth: 150 },
    { field: "description", headerName: "Description", minWidth: 240, flex: 1 },
    { field: "is_active", headerName: "Active", width: 110 },
    {
      field: "actions",
      type: "actions",
      headerName: "Action",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setSourceEditId(row._id); setSourceForm({ source_name: row.source_name || "", source_type: row.source_type || "Other", description: row.description || "", is_active: row.is_active || "Yes" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow("sources", row._id)} />
      ]
    }
  ], []);

  const stageColumns = useMemo(() => [
    { field: "stagename", headerName: "Stage", minWidth: 180, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 240, flex: 1 },
    { field: "isactive", headerName: "Active", width: 110, valueGetter: ({ row }) => row.isactive ? "Yes" : "No" },
    { field: "is_final_stage", headerName: "Final", width: 110, valueGetter: ({ row }) => row.is_final_stage ? "Yes" : "No" },
    {
      field: "actions",
      type: "actions",
      headerName: "Action",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setStageEditId(row._id); setStageForm({ stagename: row.stagename || "", name: row.name || "", description: row.description || "", isactive: !!row.isactive, is_final_stage: !!row.is_final_stage }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow("stages", row._id)} />
      ]
    }
  ], []);

  const leadColumns = useMemo(() => [
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 180 },
    { field: "year", headerName: "Year", minWidth: 120 },
    { field: "category", headerName: "Category", minWidth: 140 },
    { field: "course_interested", headerName: "Course", minWidth: 160 },
    { field: "source", headerName: "Source", minWidth: 140 },
    { field: "pipeline_stage", headerName: "Stage", minWidth: 170 },
    { field: "assignedto", headerName: "Assigned To", minWidth: 180 },
    { field: "followupdate", headerName: "Followup", minWidth: 130, valueGetter: ({ row }) => row.followupdate ? String(row.followupdate).slice(0, 10) : "" },
    {
      field: "actions",
      type: "actions",
      headerName: "Action",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => { setLeadEditId(row._id); setLeadForm({ ...leadBlank, ...row, year: row.year || "2026-27", category: row.category || "", course_interested: row.course_interested || "", followupdate: row.followupdate ? String(row.followupdate).slice(0, 10) : "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow("leads", row._id)} />
      ]
    }
  ], []);

  const renderGrid = (rows, columns) => (
    <Box sx={{ height: 520 }}>
      <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50, 100]} disableRowSelectionOnClick />
    </Box>
  );

  const renderLeadGrid = () => (
    <Box sx={{ height: 560 }}>
      <DataGrid
        rows={leads}
        columns={leadColumns}
        getRowId={(row) => row._id}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={leadTotal}
        loading={leadLoading}
        paginationModel={leadPagination}
        onPaginationModelChange={(model) => {
          setLeadPagination(model);
          searchLeads(leadFilters, model);
        }}
      />
    </Box>
  );

  return (
    <MentoringLayout title="CRM">
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={900}>CRM Masters and Leads</Typography>
            <Typography color="text.secondary">Manage sources, pipeline stages and lead records with upload support.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => window.location.assign("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Paper>
      <Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Tabs value={tab} onChange={(e, value) => setTab(value)} variant="scrollable">
          <Tab label="Sources" />
          <Tab label="Pipeline stages" />
          <Tab label="Leads" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <>
          <Paper elevation={0} sx={{ p: 2, my: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><TextField fullWidth label="Source" value={sourceForm.source_name} onChange={(e) => setSourceForm({ ...sourceForm, source_name: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Type" value={sourceForm.source_type} onChange={(e) => setSourceForm({ ...sourceForm, source_type: e.target.value })}>{sourceTypes.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Description" value={sourceForm.description} onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Active" value={sourceForm.is_active} onChange={(e) => setSourceForm({ ...sourceForm, is_active: e.target.value })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={saveSource}>{sourceEditId ? "Update" : "Add"}</Button></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => downloadTemplate("crm_sources_template.xlsx", { source_name: "Website", source_type: "Direct", description: "Website enquiry", is_active: "Yes" })}>Template</Button></Grid>
              <Grid item xs={12} md={2}><Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadSources} /></Button></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>{renderGrid(sources, sourceColumns)}</Paper>
        </>
      )}

      {tab === 1 && (
        <>
          <Paper elevation={0} sx={{ p: 2, my: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><TextField fullWidth label="Stage" value={stageForm.stagename} onChange={(e) => setStageForm({ ...stageForm, stagename: e.target.value, name: e.target.value })} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Description" value={stageForm.description} onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Active" value={stageForm.isactive ? "Yes" : "No"} onChange={(e) => setStageForm({ ...stageForm, isactive: e.target.value === "Yes" })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Final Stage" value={stageForm.is_final_stage ? "Yes" : "No"} onChange={(e) => setStageForm({ ...stageForm, is_final_stage: e.target.value === "Yes" })}><MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem></TextField></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={saveStage}>{stageEditId ? "Update" : "Add"}</Button></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => downloadTemplate("crm_pipeline_stages_template.xlsx", { stagename: "New Lead", description: "New enquiry", isactive: "true", is_final_stage: "false" })}>Template</Button></Grid>
              <Grid item xs={12} md={2}><Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadStages} /></Button></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>{renderGrid(stages, stageColumns)}</Paper>
        </>
      )}

      {tab === 2 && (
        <>
          <Paper elevation={0} sx={{ p: 2, my: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><TextField fullWidth label="Name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth label="Phone" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Year" value={leadForm.year} onChange={(e) => setLeadForm({ ...leadForm, year: e.target.value, course_interested: "" })}>{programYears.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Category" value={leadForm.category} onChange={(e) => setLeadForm({ ...leadForm, category: e.target.value })}>{categoryList.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Course interested" value={leadForm.course_interested} onChange={(e) => setLeadForm({ ...leadForm, course_interested: e.target.value })}>{leadPrograms.map((x) => <MenuItem key={x._id} value={x.program}>{x.program}{x.programcode ? ` (${x.programcode})` : ""}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Source" value={leadForm.source} onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}>{sources.map((x) => <MenuItem key={x._id} value={x.source_name}>{x.source_name}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Stage" value={leadForm.pipeline_stage} onChange={(e) => setLeadForm({ ...leadForm, pipeline_stage: e.target.value })}>{stages.map((x) => <MenuItem key={x._id} value={x.stagename}>{x.stagename}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={3}><TextField select fullWidth label="Assigned to" value={leadForm.assignedto} onChange={(e) => setLeadForm({ ...leadForm, assignedto: e.target.value })}>{users.map((x) => <MenuItem key={x._id} value={x.email}>{x.name} ({x.email})</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="Followup date" value={leadForm.followupdate} onChange={(e) => setLeadForm({ ...leadForm, followupdate: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Lead status" value={leadForm.leadstatus} onChange={(e) => setLeadForm({ ...leadForm, leadstatus: e.target.value })}>{statusList.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={saveLead}>{leadEditId ? "Update" : "Add"}</Button></Grid>
              {leadEditId && <Grid item xs={12} md={1}><Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => { setLeadEditId(""); setLeadForm(leadBlank); }}>Cancel</Button></Grid>}
              <Grid item xs={12} md={2}><Button fullWidth variant="outlined" sx={{ height: 56 }} onClick={() => downloadTemplate("crm_leads_template.xlsx", { year: "2026-27", name: "Student Name", phone: "9999999999", email: "student@example.com", category: "General", course_interested: "B.Com", source: "Website", pipeline_stage: "New Lead", leadstatus: "Active", assignedto: global1.user, followupdate: "2026-06-01" })}>Template</Button></Grid>
              <Grid item xs={12} md={2}><Button fullWidth component="label" variant="outlined" startIcon={<UploadFile />} sx={{ height: 56 }}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={uploadLeads} /></Button></Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}><TextField fullWidth label="Search" value={leadFilters.search} onChange={(e) => setLeadFilters({ ...leadFilters, search: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField select fullWidth label="Year" value={leadFilters.year} onChange={(e) => setLeadFilters({ ...leadFilters, year: e.target.value, course_interested: "" })}><MenuItem value="">All</MenuItem>{programYears.map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Course interested" value={leadFilters.course_interested || ""} onChange={(e) => setLeadFilters({ ...leadFilters, course_interested: e.target.value })}><MenuItem value="">All</MenuItem>{filterPrograms.map((x) => <MenuItem key={x._id} value={x.program}>{x.program}{x.programcode ? ` (${x.programcode})` : ""}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Source" value={leadFilters.source} onChange={(e) => setLeadFilters({ ...leadFilters, source: e.target.value })}><MenuItem value="">All</MenuItem>{sources.map((x) => <MenuItem key={x._id} value={x.source_name}>{x.source_name}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Stage" value={leadFilters.pipeline_stage} onChange={(e) => setLeadFilters({ ...leadFilters, pipeline_stage: e.target.value })}><MenuItem value="">All</MenuItem>{stages.map((x) => <MenuItem key={x._id} value={x.stagename}>{x.stagename}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={2}><TextField select fullWidth label="Assigned to" value={leadFilters.assignedto} onChange={(e) => setLeadFilters({ ...leadFilters, assignedto: e.target.value })}><MenuItem value="">All</MenuItem>{users.map((x) => <MenuItem key={x._id} value={x.email}>{x.name}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} md={1.5}><TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="From" value={leadFilters.fromDate} onChange={(e) => setLeadFilters({ ...leadFilters, fromDate: e.target.value })} /></Grid>
              <Grid item xs={12} md={1.5}><TextField type="date" InputLabelProps={{ shrink: true }} fullWidth label="To" value={leadFilters.toDate} onChange={(e) => setLeadFilters({ ...leadFilters, toDate: e.target.value })} /></Grid>
              <Grid item xs={12} md={1}><Button fullWidth variant="contained" sx={{ height: 56 }} onClick={queryLeads} disabled={leadLoading}>{leadLoading ? "Loading" : "Query"}</Button></Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Showing {leads.length} leads on this page out of {leadTotal}. Use the grid pagination controls to view remaining leads.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>{renderLeadGrid()}</Paper>
        </>
      )}
    </MentoringLayout>
  );
}
