import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankForm = {
  academicyear: "",
  regulation: "",
  exam: "",
  examcode: "",
  invigilatorname: "",
  invigilatoremail: "",
  invigilatorcourse: "",
  invigilatorcoursecode: "",
  amountpersession: ""
};

const filterLabels = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  examcode: "Exam Code",
  invigilatoremail: "Invigilator Email"
};

const uniq = (items) => [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const htmlEscape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
}[char]));
const formatDisplayDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN");
};
const headerMap = {
  academicyear: "academicyear",
  academicyears: "academicyear",
  academicyear1: "academicyear",
  regulation: "regulation",
  exam: "exam",
  examcode: "examcode",
  invigilatorname: "invigilatorname",
  invigilatoremail: "invigilatoremail",
  invigilatorcourse: "invigilatorcourse",
  invigilatorcoursecode: "invigilatorcoursecode",
  amountpersession: "amountpersession",
  amountpersessions: "amountpersession",
  amountpersessionrs: "amountpersession",
  amountpersessioninr: "amountpersession",
  amountpersessionnumber: "amountpersession",
  amountpersessionamount: "amountpersession",
  amountpersession1: "amountpersession",
  amountperday: "amountpersession",
  amount: "amountpersession"
};

export default function ConductExamInvigilationPage() {
  const [rows, setRows] = useState([]);
  const [courseRows, setCourseRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [selectedInvigilators, setSelectedInvigilators] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", regulation: "", examcode: "", invigilatoremail: "" });
  const [editId, setEditId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [printingOrders, setPrintingOrders] = useState(false);

  useEffect(() => {
    loadOptions();
    loadRows();
  }, []);

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/conductexam/invigilation-options", { params: { colid: global1.colid } });
    setCourseRows(res.data?.courses || []);
    setUsers(res.data?.users || []);
  };

  const loadRows = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      Object.entries(nextFilters).forEach(([key, value]) => { if (value) params[key] = value; });
      const res = await ep1.get("/api/v2/conductexam/invigilation", { params });
      setRows(res.data?.data || []);
      setSelectedRowIds([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load invigilation details.");
    } finally {
      setLoading(false);
    }
  };

  const dropdownOptions = useMemo(() => ({
    academicyear: uniq([...courseRows.map((row) => row.academicyear), ...rows.map((row) => row.academicyear)]),
    regulation: uniq([...courseRows.map((row) => row.regulation), ...rows.map((row) => row.regulation)]),
    exam: uniq([...courseRows.map((row) => row.exam), ...rows.map((row) => row.exam)]),
    examcode: uniq([...courseRows.map((row) => row.examcode), ...rows.map((row) => row.examcode)]),
    invigilatoremail: uniq(rows.map((row) => row.invigilatoremail))
  }), [courseRows, rows]);

  const selectInvigilator = (user) => {
    setForm((prev) => ({
      ...prev,
      invigilatorname: user?.name || "",
      invigilatoremail: user?.email || ""
    }));
  };

  const selectMultipleInvigilators = (value) => {
    setSelectedInvigilators(value || []);
    if (value?.length === 1) {
      setForm((prev) => ({
        ...prev,
        invigilatorname: value[0]?.name || "",
        invigilatoremail: value[0]?.email || ""
      }));
    } else {
      setForm((prev) => ({ ...prev, invigilatorname: "", invigilatoremail: "" }));
    }
  };

  const saveRow = async () => {
    try {
      setError("");
      if (editId) {
        const payload = { ...form, id: editId, colid: global1.colid, user: global1.user };
        await ep1.post("/api/v2/conductexam/invigilation", payload);
        setMessage("Invigilation details updated.");
      } else {
        const invigilators = selectedInvigilators.length
          ? selectedInvigilators
          : (form.invigilatorname || form.invigilatoremail ? [{ name: form.invigilatorname, email: form.invigilatoremail }] : []);
        if (!invigilators.length) {
          setError("Select at least one invigilator.");
          return;
        }
        const items = invigilators.map((item) => ({
          ...form,
          invigilatorname: item.name || "",
          invigilatoremail: item.email || ""
        }));
        const res = await ep1.post("/api/v2/conductexam/invigilation-bulk", { colid: global1.colid, user: global1.user, items });
        const errors = res.data?.errors || [];
        setMessage(`${res.data?.saved || 0} invigilation row${res.data?.saved === 1 ? "" : "s"} added${errors.length ? `, ${errors.length} errors` : ""}.`);
        if (errors.length) setError(errors.map((item) => `Row ${item.rowNumber}: ${item.message}`).join(" | "));
      }
      setForm(blankForm);
      setSelectedInvigilators([]);
      setEditId("");
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save invigilation details.");
    }
  };

  const editRow = (row) => {
    setEditId(row._id);
    setForm({
      academicyear: row.academicyear || "",
      regulation: row.regulation || "",
      exam: row.exam || "",
      examcode: row.examcode || "",
      invigilatorname: row.invigilatorname || "",
      invigilatoremail: row.invigilatoremail || "",
      invigilatorcourse: row.invigilatorcourse || "",
      invigilatorcoursecode: row.invigilatorcoursecode || "",
      amountpersession: row.amountpersession ?? ""
    });
    setSelectedInvigilators([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this invigilation entry?")) return;
    await ep1.post("/api/v2/conductexam/invigilation-delete", { id, colid: global1.colid });
    setMessage("Invigilation details deleted.");
    await loadRows();
    await loadOptions();
  };

  const downloadTemplate = () => {
    const first = courseRows[0] || {};
    const worksheet = XLSX.utils.json_to_sheet([{
      academicyear: first.academicyear || "2026-27",
      regulation: first.regulation || "NEP 2026",
      exam: first.exam || "Semester End Examination",
      examcode: first.examcode || "SEE-2026",
      invigilatorname: "Faculty Name",
      invigilatoremail: "faculty@example.com",
      invigilatorcourse: "Assigned Course",
      invigilatorcoursecode: "ASSIGNED101",
      amountpersession: 500
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invigilation");
    XLSX.writeFile(workbook, "conduct_exam_invigilation_template.xlsx");
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => {
        const item = { rowNumber: index + 2 };
        Object.entries(row).forEach(([header, value]) => {
          const mapped = headerMap[normalizeHeader(header)];
          if (mapped) item[mapped] = value;
        });
        return item;
      });
      const res = await ep1.post("/api/v2/conductexam/invigilation-bulk", { colid: global1.colid, user: global1.user, items });
      const errors = res.data?.errors || [];
      setMessage(`${res.data?.saved || 0} rows uploaded${errors.length ? `, ${errors.length} errors` : ""}.`);
      await loadRows();
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to bulk upload invigilation details.");
    }
  };

  const buildAllocationOrderHtml = (allocations, institution = {}) => {
    const groups = new Map();
    allocations.forEach((row) => {
      const key = String(row.invigilatoremail || row.invigilator || "unknown").toLowerCase();
      if (!groups.has(key)) groups.set(key, { invigilator: row.invigilator || "", invigilatoremail: row.invigilatoremail || "", rows: [] });
      groups.get(key).rows.push(row);
    });
    const logo = institution?.logolink || global1.logo || "";
    const institutionName = institution?.institutionname || global1.insname || "Institution";
    const address = institution?.address || "";
    const today = new Date().toLocaleDateString("en-IN");
    const sections = [...groups.values()].map((group, index) => `
      <section class="order ${index ? "page-break" : ""}">
        <div class="header">
          ${logo ? `<img class="logo" src="${htmlEscape(logo)}" alt="Logo" />` : ""}
          <h2>${htmlEscape(institutionName)}</h2>
          <div>${htmlEscape(address)}</div>
        </div>
        <h3>Invigilation Allocation Order</h3>
        <div class="meta">
          <div><strong>Date:</strong> ${htmlEscape(today)}</div>
          <div><strong>Invigilator:</strong> ${htmlEscape(group.invigilator)}</div>
          <div><strong>Email:</strong> ${htmlEscape(group.invigilatoremail)}</div>
        </div>
        <p class="salutation">Dear ${htmlEscape(group.invigilator || "Invigilator")},</p>
        <p class="note">You are assigned for invigilation duty as per the schedule below. Please report to the examination control room before the scheduled time and follow the examination instructions issued by the institution.</p>
        <table>
          <thead>
            <tr>
              <th>Academic Year</th>
              <th>Exam</th>
              <th>Exam Code</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Campus</th>
              <th>Building</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            ${group.rows.map((row) => `
              <tr>
                <td>${htmlEscape(row.academicyear)}</td>
                <td>${htmlEscape(row.exam)}</td>
                <td>${htmlEscape(row.examcode)}</td>
                <td>${htmlEscape(formatDisplayDate(row.examdate))}</td>
                <td>${htmlEscape(row.slot)}</td>
                <td>${htmlEscape(row.campus)}</td>
                <td>${htmlEscape(row.building)}</td>
                <td>${htmlEscape(row.room)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="signature">
          <div>Controller of Examinations</div>
          <div>Principal / Authorized Signatory</div>
        </div>
      </section>
    `).join("");

    return `<html><head><title>Invigilation Allocation Order</title><style>
      html,body{font-family:Arial,sans-serif;color:#111827;margin:0;background:#f3f4f6}
      .order{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:12mm;box-sizing:border-box;overflow:hidden}
      .header{text-align:center;border-bottom:2px solid #111827;padding-bottom:10px;margin-bottom:14px}
      .logo{max-height:72px;object-fit:contain;margin-bottom:6px}
      h2{font-size:18px;margin:2px 0 4px}
      h3{text-align:center;font-size:16px;text-transform:uppercase;letter-spacing:.4px;margin:14px 0}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;font-size:12px;margin-bottom:10px}
      .salutation{font-size:12px;font-weight:700;margin:12px 0 6px}
      .note{font-size:12px;line-height:1.45;margin:10px 0 12px}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th,td{border:1px solid #d1d5db;padding:6px;text-align:left;vertical-align:top}
      th{background:#eef2ff;color:#111827}
      .signature{display:grid;grid-template-columns:repeat(2,1fr);gap:48px;margin-top:44px;font-size:12px;text-align:center}
      .signature div{border-top:1px solid #111827;padding-top:6px}
      .page-break{page-break-before:always}
      @media print{html,body{background:#fff}.order{margin:0;page-break-after:always}.order:last-child{page-break-after:auto}}
      @page{size:A4;margin:0}
    </style></head><body>${sections}</body></html>`;
  };

  const createAllocationOrder = async (scope) => {
    try {
      setPrintingOrders(true);
      setError("");
      const sourceRows = scope === "selected" ? rows.filter((row) => selectedRowIds.includes(row._id)) : rows;
      if (!sourceRows.length) {
        setError(scope === "selected" ? "Select at least one invigilator row." : "No invigilators available in the loaded list.");
        return;
      }
      const payload = {
        colid: global1.colid,
        invigilatoremails: uniq(sourceRows.map((row) => row.invigilatoremail))
      };
      if (filters.academicyear) payload.academicyear = filters.academicyear;
      if (filters.regulation) payload.regulation = filters.regulation;
      if (filters.examcode) payload.examcode = filters.examcode;
      const res = await ep1.post("/api/v2/conductexam/invigilator-allocation-order", payload);
      const allocations = res.data?.data || [];
      if (!allocations.length) {
        setError("No allocation records found for the selected invigilators. Please run invigilator allocation first.");
        return;
      }
      const win = window.open("", "_blank", "width=1000,height=800");
      if (!win) {
        setError("Popup blocked. Please allow popups to open the allocation order.");
        return;
      }
      win.document.write(buildAllocationOrderHtml(allocations, res.data?.institution || {}));
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create allocation order.");
    } finally {
      setPrintingOrders(false);
    }
  };

  const handleRowSelection = (model) => {
    if (Array.isArray(model)) {
      setSelectedRowIds(model);
      return;
    }
    if (model?.ids) {
      setSelectedRowIds(Array.from(model.ids));
      return;
    }
    setSelectedRowIds([]);
  };

  const selectedInvigilator = useMemo(() => users.find((user) => user.email === form.invigilatoremail) || null, [users, form.invigilatoremail]);

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "exam", headerName: "Exam", minWidth: 180, flex: 1 },
    { field: "examcode", headerName: "Exam Code", width: 140 },
    { field: "invigilatorname", headerName: "Invigilator", width: 180 },
    { field: "invigilatoremail", headerName: "Invigilator Email", width: 220 },
    { field: "invigilatorcourse", headerName: "Invigilator Course", width: 180 },
    { field: "invigilatorcoursecode", headerName: "Invigilator Course Code", width: 180 },
    { field: "amountpersession", headerName: "Amount Per Session", width: 170, type: "number" },
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editRow(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <MenuPageShell title="Invigilation Details">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Invigilation Details</Typography>
              <Typography color="text.secondary">Assign invigilators for an examination.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => createAllocationOrder("all")} disabled={!rows.length || printingOrders}>
                Order All Loaded
              </Button>
              <Button variant="outlined" onClick={() => createAllocationOrder("selected")} disabled={!selectedRowIds.length || printingOrders}>
                Order Selected
              </Button>
              <Button variant="outlined" onClick={downloadTemplate}>Template</Button>
              <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
                Bulk Upload
                <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} />
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Academic Year" value={form.academicyear} onChange={(e) => setForm({ ...form, academicyear: e.target.value, regulation: "", exam: "", examcode: "" })}>{dropdownOptions.academicyear.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Regulation" value={form.regulation} onChange={(e) => setForm({ ...form, regulation: e.target.value, exam: "", examcode: "" })}>{dropdownOptions.regulation.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Exam Code" value={form.examcode} onChange={(e) => {
              const row = courseRows.find((item) => item.examcode === e.target.value);
              setForm({ ...form, examcode: e.target.value, exam: row?.exam || "" });
            }}>{dropdownOptions.examcode.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Exam" value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}>
              {editId ? (
                <Autocomplete
                  options={users}
                  value={selectedInvigilator}
                  isOptionEqualToValue={(option, value) => option.email === value.email}
                  getOptionLabel={(option) => `${option.name || ""}${option.email ? ` (${option.email})` : ""}`}
                  onChange={(event, value) => selectInvigilator(value)}
                  renderInput={(params) => <TextField {...params} label="Invigilator" />}
                />
              ) : (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={users}
                  value={selectedInvigilators}
                  isOptionEqualToValue={(option, value) => option.email === value.email}
                  getOptionLabel={(option) => `${option.name || ""}${option.email ? ` (${option.email})` : ""}`}
                  onChange={(event, value) => selectMultipleInvigilators(value)}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox checked={selected} sx={{ mr: 1 }} />
                      {option.name || ""}{option.email ? ` (${option.email})` : ""}
                    </li>
                  )}
                  renderInput={(params) => <TextField {...params} label="Invigilators" placeholder="Select one or more" />}
                />
              )}
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Invigilator Name" value={form.invigilatorname} onChange={(e) => setForm({ ...form, invigilatorname: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Invigilator Email" value={form.invigilatoremail} onChange={(e) => setForm({ ...form, invigilatoremail: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Invigilator Course" value={form.invigilatorcourse} onChange={(e) => setForm({ ...form, invigilatorcourse: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Invigilator Course Code" value={form.invigilatorcoursecode} onChange={(e) => setForm({ ...form, invigilatorcoursecode: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Amount Per Session" value={form.amountpersession} onChange={(e) => setForm({ ...form, amountpersession: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={saveRow} sx={{ height: 56 }}>{editId ? "Update" : selectedInvigilators.length > 1 ? `Save ${selectedInvigilators.length}` : "Save"}</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => { setForm(blankForm); setSelectedInvigilators([]); setEditId(""); }} sx={{ height: 56 }}>Clear</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            {Object.keys(filters).map((key) => (
              <Grid item xs={12} md={2} key={key}>
                <TextField select fullWidth label={filterLabels[key]} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {(dropdownOptions[key] || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={() => loadRows()} sx={{ height: 56 }}>Apply</Button></Grid>
            <Grid item xs={12} md={2}><Button fullWidth variant="outlined" onClick={() => { const next = { academicyear: "", regulation: "", examcode: "", invigilatoremail: "" }; setFilters(next); loadRows(next); }} sx={{ height: 56 }}>Clear</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedRowIds.length ? `${selectedRowIds.length} row${selectedRowIds.length === 1 ? "" : "s"} selected for allocation order.` : "Select rows to create allocation order for specific invigilators."}
            </Typography>
            {selectedRowIds.length > 0 && <Button size="small" onClick={() => setSelectedRowIds([])}>Clear Selection</Button>}
          </Stack>
          <Box sx={{ height: 580 }}>
            <DataGrid
              rows={rows}
              getRowId={(row) => row._id}
              columns={columns}
              loading={loading}
              checkboxSelection
              rowSelectionModel={selectedRowIds}
              onRowSelectionModelChange={handleRowSelection}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "conduct_exam_invigilation" } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
