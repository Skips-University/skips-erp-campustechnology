import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Avatar,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { CheckCircle, Delete, Edit, Print, QrCode2, Refresh, Save, UploadFile } from "@mui/icons-material";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import * as XLSX from "xlsx";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#ea580c", "#4f46e5"];
const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const shortDate = (value) => (value ? String(value).slice(0, 10) : "");

const bookFields = [
  "libraryid", "libraryname", "accessionno", "title", "author", "classification", "publisher", "publisheraddress",
  "isbn", "category", "subject", "edition", "publicationyear", "language", "rackno", "shelfno", "location",
  "supplier", "invoiceno", "invoicedate", "keywords", "purchasedate",
  "price", "pages", "status", "remarks"
];
const bookLabels = {
  libraryid: "Library", libraryname: "Library",
  accessionno: "Accession No", title: "Title", author: "Author", classification: "Classification", publisher: "Publisher",
  publisheraddress: "Publisher Address", isbn: "ISBN",
  category: "Category", subject: "Subject", edition: "Edition", publicationyear: "Publication Year",
  language: "Language", rackno: "Rack No", shelfno: "Shelf No", location: "Location", supplier: "Supplier",
  invoiceno: "Invoice No", invoicedate: "Invoice Date", keywords: "Keywords",
  purchasedate: "Purchase Date", price: "Price", pages: "Pages", status: "Status", remarks: "Remarks"
};
const studentFields = ["academicyear", "programcode", "semester", "section", "name", "email", "phone", "regno"];
const issueTypes = ["Regular", "Reference", "Reading Room", "Faculty Issue", "Special"];

function useLibraryList(all = false) {
  const [libraries, setLibraries] = useState([]);
  const loadLibraries = async () => {
    const res = await ep1.get("/api/v2/librarynew/libraries/accessible", {
      params: { colid: global1.colid, user: global1.user, all: all ? "yes" : "no" }
    });
    setLibraries(res.data?.data || []);
  };
  useEffect(() => { loadLibraries(); }, []);
  return { libraries, loadLibraries };
}

function LibrarySelect({ libraries, value, onChange, label = "Library", allowAll = false }) {
  const options = allowAll ? [{ _id: "", libraryname: "All libraries" }, ...libraries] : libraries;
  return (
    <Autocomplete
      size="small"
      options={options}
      value={options.find((row) => String(row._id || "") === String(value || "")) || null}
      onChange={(_, item) => onChange(item?._id || "")}
      getOptionLabel={(option) => option?.libraryname ? `${option.libraryname}${option.type ? ` (${option.type})` : ""}` : ""}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}

function FieldFilters({ fields, options = {}, filters, setFilters }) {
  const update = (index, patch) => setFilters((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  return (
    <Stack spacing={1}>
      {filters.map((filter, index) => (
        <Grid container spacing={1} key={index}>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth size="small" label="Filter field" value={filter.field} onChange={(e) => update(index, { field: e.target.value, value: "" })}>
              {fields.map((field) => <MenuItem key={field} value={field}>{bookLabels[field] || field}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={7}>
            <Autocomplete
              freeSolo
              size="small"
              options={options[filter.field] || []}
              value={filter.value || ""}
              onInputChange={(_, value) => update(index, { value })}
              onChange={(_, value) => update(index, { value: value || "" })}
              renderInput={(params) => <TextField {...params} label="Value" />}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button color="error" onClick={() => setFilters((prev) => prev.filter((_, idx) => idx !== index))} disabled={filters.length === 1}>Remove</Button>
          </Grid>
        </Grid>
      ))}
      <Box><Button onClick={() => setFilters((prev) => [...prev, { field: fields[0] || "", value: "" }])}>Add filter</Button></Box>
    </Stack>
  );
}

async function readExcel(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
}

function downloadTemplate(filename, fields) {
  const ws = XLSX.utils.json_to_sheet([Object.fromEntries(fields.map((field) => [field, ""]))]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, filename);
}

function CodeDialog({ book, open, onClose }) {
  const [qr, setQr] = useState("");
  const barcodeRef = useRef(null);
  useEffect(() => {
    if (!book || !open) return;
    const url = `${window.location.origin}/library-book-scan?colid=${global1.colid}&libraryid=${encodeURIComponent(book.libraryid || "")}&accessionno=${encodeURIComponent(book.accessionno || "")}`;
    QRCode.toDataURL(url, { width: 180 }).then(setQr);
    setTimeout(() => {
      if (barcodeRef.current) JsBarcode(barcodeRef.current, book.accessionno || "NA", { height: 56, displayValue: true });
    }, 50);
  }, [book, open]);
  const print = () => {
    const html = document.getElementById("library-code-print")?.innerHTML || "";
    const win = window.open("", "_blank");
    win.document.write(`<html><body>${html}</body></html>`);
    win.document.close();
    win.print();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Barcode and QR Code</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" id="library-code-print" sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={900}>{book?.title}</Typography>
          <Typography>Accession No: {book?.accessionno}</Typography>
          <svg ref={barcodeRef} />
          {qr && <Box component="img" alt="QR" src={qr} sx={{ width: 180, height: 180 }} />}
        </Stack>
        <Button fullWidth variant="contained" startIcon={<Print />} onClick={print}>Print Codes</Button>
      </DialogContent>
    </Dialog>
  );
}

export function LibraryMasterPage() {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "libraryname", value: "" }]);
  const [form, setForm] = useState({ type: "University", status: "Active" });
  const [loading, setLoading] = useState(false);
  const fields = ["libraryname", "description", "type", "status"];
  const load = async () => {
    setLoading(true);
    const params = { colid: global1.colid };
    filters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get("/api/v2/librarynew/libraries", { params });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    setLoading(true);
    await ep1.post("/api/v2/librarynew/libraries", { ...form, colid: global1.colid, user: global1.user });
    setForm({ type: "University", status: "Active" });
    await load();
    setLoading(false);
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const rowsToSave = await readExcel(file);
    for (const row of rowsToSave) await ep1.post("/api/v2/librarynew/libraries", { ...row, colid: global1.colid, user: global1.user });
    await load();
    setLoading(false);
    event.target.value = "";
  };
  const columns = [
    { field: "libraryname", headerName: "Library", minWidth: 220, flex: 1 },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1 },
    { field: "type", headerName: "Type", minWidth: 150 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "actions", type: "actions", width: 100, getActions: (p) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => setForm({ ...p.row, id: p.row._id })} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={async () => { await ep1.post("/api/v2/librarynew/libraries/delete", { id: p.row._id, colid: global1.colid }); load(); }} />
    ] }
  ];
  return (
    <MenuPageShell title="Library Master">
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Library Name" value={form.libraryname || ""} onChange={(e) => setForm({ ...form, libraryname: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Type" value={form.type || "University"} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["University", "Departmental", "Special"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Status" value={form.status || "Active"} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Active", "Inactive"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={1}><Button fullWidth variant="contained" disabled={loading} onClick={save}>{loading ? "..." : "Save"}</Button></Grid>
            <Grid item xs={12}><Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => downloadTemplate("library_master_template.xlsx", fields)}>Download Template</Button><Button component="label" variant="outlined" startIcon={<UploadFile />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={upload} /></Button></Stack></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}><FieldFilters fields={fields} options={options} filters={filters} setFilters={setFilters} /><Button sx={{ mt: 1 }} variant="contained" onClick={load}>Apply</Button></Paper>
        <Box sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
      </Stack>
    </MenuPageShell>
  );
}

export function LibraryUserAccessPage() {
  const { libraries } = useLibraryList(true);
  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [userFilters, setUserFilters] = useState([{ field: "name", value: "" }]);
  const [filters, setFilters] = useState([{ field: "libraryname", value: "" }]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLibraries, setSelectedLibraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadUsers = async () => {
    const params = { colid: global1.colid };
    userFilters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get("/api/v2/librarynew/users", { params });
    setUsers(res.data?.data || []);
  };
  const load = async () => {
    const params = { colid: global1.colid };
    filters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get("/api/v2/librarynew/access", { params });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
  };
  useEffect(() => { loadUsers(); load(); }, []);
  const save = async () => {
    if (!selectedUser || !selectedLibraries.length) return;
    setLoading(true);
    await ep1.post("/api/v2/librarynew/access", { colid: global1.colid, userid: selectedUser._id, libraryids: selectedLibraries.map((row) => row._id), user: global1.user });
    setSelectedUser(null); setSelectedLibraries([]);
    await load();
    setLoading(false);
  };
  const columns = [
    { field: "libraryname", headerName: "Library", minWidth: 220 },
    { field: "name", headerName: "User", minWidth: 180, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "role", headerName: "Role", minWidth: 120 },
    { field: "department", headerName: "Department", minWidth: 150 },
    { field: "actions", type: "actions", width: 90, getActions: (p) => [<GridActionsCellItem icon={<Delete />} label="Delete" onClick={async () => { await ep1.post("/api/v2/librarynew/access/delete", { id: p.row._id, colid: global1.colid }); load(); }} />] }
  ];
  return (
    <MenuPageShell title="Library User Access">
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={900}>Find User</Typography>
          <FieldFilters fields={["name", "email", "user", "role", "department", "phone"]} options={{}} filters={userFilters} setFilters={setUserFilters} />
          <Button sx={{ mt: 1 }} variant="contained" onClick={loadUsers}>Apply User Filter</Button>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}><Autocomplete options={users} value={selectedUser} onChange={(_, v) => setSelectedUser(v)} getOptionLabel={(o) => `${o.name || ""} - ${o.email || o.user || ""} - ${o.role || ""}`} renderInput={(params) => <TextField {...params} label="Select user" />} /></Grid>
            <Grid item xs={12} md={6}><Autocomplete multiple disableCloseOnSelect options={libraries} value={selectedLibraries} onChange={(_, v) => setSelectedLibraries(v)} getOptionLabel={(o) => `${o.libraryname || ""} (${o.type || ""})`} renderOption={(props, option, { selected }) => <li {...props}><Checkbox checked={selected} />{option.libraryname}</li>} renderInput={(params) => <TextField {...params} label="Libraries" />} /></Grid>
            <Grid item xs={12}><Button variant="contained" disabled={loading || !selectedUser || !selectedLibraries.length} onClick={save}>{loading ? "Saving..." : "Assign Library Access"}</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}><FieldFilters fields={["libraryname", "name", "email", "role", "department", "status"]} options={options} filters={filters} setFilters={setFilters} /><Button sx={{ mt: 1 }} variant="contained" onClick={load}>Apply</Button></Paper>
        <Box sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
      </Stack>
    </MenuPageShell>
  );
}

export function LibraryBookMasterPage() {
  const { libraries } = useLibraryList(false);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "title", value: "" }]);
  const [form, setForm] = useState({ status: "Available" });
  const [selectedCodeBook, setSelectedCodeBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const params = () => {
    const p = { colid: global1.colid, user: global1.user };
    if (form.libraryid) p.libraryid = form.libraryid;
    filters.forEach((filter) => { if (filter.field && filter.value) p[filter.field] = filter.value; });
    return p;
  };
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/librarynew/books", { params: params() });
      setRows(res.data?.data || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load books");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    setLoading(true);
    try {
      await ep1.post("/api/v2/librarynew/books", { ...form, colid: global1.colid, user: global1.user });
      setMessage("Book saved.");
      setForm({ status: "Available" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save book");
    } finally {
      setLoading(false);
    }
  };
  const deleteRow = async (row) => {
    if (!window.confirm("Delete this book?")) return;
    await ep1.post("/api/v2/librarynew/books/delete", { id: row._id, colid: global1.colid });
    load();
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const rows = await readExcel(file);
      const res = await ep1.post("/api/v2/librarynew/books/bulk", { colid: global1.colid, user: global1.user, rows });
      setMessage(`${res.data?.saved || 0} books uploaded.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload books");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };
  const columns = [
    { field: "libraryname", headerName: "Library", minWidth: 180 },
    { field: "accessionno", headerName: "Accession No", minWidth: 140 },
    { field: "title", headerName: "Title", minWidth: 240, flex: 1 },
    { field: "author", headerName: "Author", minWidth: 180 },
    { field: "classification", headerName: "Classification", minWidth: 170 },
    { field: "publisher", headerName: "Publisher", minWidth: 170 },
    { field: "publisheraddress", headerName: "Publisher Address", minWidth: 230 },
    { field: "invoiceno", headerName: "Invoice No", minWidth: 140 },
    { field: "invoicedate", headerName: "Invoice Date", minWidth: 130, valueGetter: (p) => shortDate(p.row.invoicedate) },
    { field: "keywords", headerName: "Keywords", minWidth: 220 },
    { field: "category", headerName: "Category", minWidth: 140 },
    { field: "subject", headerName: "Subject", minWidth: 140 },
    { field: "rackno", headerName: "Rack", minWidth: 90 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "price", headerName: "Price", minWidth: 100, type: "number" },
    {
      field: "actions", type: "actions", width: 140, getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => setForm({ ...params.row, id: params.row._id, purchasedate: shortDate(params.row.purchasedate) })} />,
        <GridActionsCellItem icon={<QrCode2 />} label="Codes" onClick={() => setSelectedCodeBook(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => deleteRow(params.row)} />
      ]
    }
  ];
  return (
    <MenuPageShell title="Library Book Master">
      <Stack spacing={2}>
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={3}>
              <LibrarySelect libraries={libraries} value={form.libraryid} onChange={(libraryid) => setForm((prev) => ({ ...prev, libraryid }))} />
            </Grid>
            {bookFields.map((field) => (
              ["libraryid", "libraryname"].includes(field) ? null :
              <Grid item xs={12} sm={6} md={["remarks", "publisheraddress", "keywords"].includes(field) ? 6 : 3} key={field}>
                <TextField
                  fullWidth
                  size="small"
                  label={bookLabels[field] || field}
                  type={["price", "pages"].includes(field) ? "number" : ["purchasedate", "invoicedate"].includes(field) ? "date" : "text"}
                  InputLabelProps={["purchasedate", "invoicedate"].includes(field) ? { shrink: true } : undefined}
                  multiline={["remarks", "publisheraddress", "keywords"].includes(field)}
                  minRows={["remarks", "publisheraddress", "keywords"].includes(field) ? 2 : undefined}
                  value={form[field] || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<Save />} disabled={loading} onClick={save}>{loading ? "Saving..." : "Save"}</Button>
                <Button variant="outlined" onClick={() => setForm({ status: "Available" })}>Clear</Button>
                <Button variant="outlined" onClick={() => downloadTemplate("library_books_template.xlsx", ["libraryid", ...bookFields.filter((field) => field !== "libraryname")])}>Download Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={upload} /></Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <FieldFilters fields={bookFields} options={options} filters={filters} setFilters={setFilters} />
          <Button sx={{ mt: 1 }} variant="contained" startIcon={<Refresh />} onClick={load} disabled={loading}>Apply</Button>
        </Paper>
        <Box sx={{ height: 560 }}>
          <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Box>
        <CodeDialog book={selectedCodeBook} open={!!selectedCodeBook} onClose={() => setSelectedCodeBook(null)} />
      </Stack>
    </MenuPageShell>
  );
}

export function LibraryBookScanPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    ep1.get("/api/v2/librarynew/scan", { params: { colid: qs.get("colid"), libraryid: qs.get("libraryid"), accessionno: qs.get("accessionno") } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load book"));
  }, []);
  return (
    <Box sx={{ p: 3, bgcolor: "#eef2ff", minHeight: "100vh" }}>
      <Paper sx={{ maxWidth: 760, mx: "auto", p: 3, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={900} gutterBottom>Library Book Details</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {data?.book && (
          <Grid container spacing={2}>
            {bookFields.map((field) => <Grid item xs={12} sm={6} key={field}><Typography variant="caption">{bookLabels[field] || field}</Typography><Typography fontWeight={800}>{field.includes("date") ? shortDate(data.book[field]) : data.book[field] || "-"}</Typography></Grid>)}
            {data.issue && <Grid item xs={12}><Alert severity="warning">Currently issued to {data.issue.student} ({data.issue.regno}), due on {shortDate(data.issue.duedate)}</Alert></Grid>}
          </Grid>
        )}
      </Paper>
    </Box>
  );
}

export function LibraryFinePage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ status: "Active" });
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    const res = await ep1.get("/api/v2/librarynew/fines", { params: { colid: global1.colid } });
    setRows(res.data?.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    setLoading(true);
    await ep1.post("/api/v2/librarynew/fines", { ...form, colid: global1.colid, user: global1.user });
    setForm({ status: "Active" });
    await load();
  };
  const columns = [
    { field: "category", headerName: "Category", flex: 1, minWidth: 180 },
    { field: "fineperday", headerName: "Fine/Day", minWidth: 120 },
    { field: "graceperioddays", headerName: "Grace Days", minWidth: 120 },
    { field: "maxfine", headerName: "Max Fine", minWidth: 120 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "actions", type: "actions", width: 100, getActions: (p) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => setForm({ ...p.row, id: p.row._id })} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={async () => { await ep1.post("/api/v2/librarynew/fines/delete", { id: p.row._id, colid: global1.colid }); load(); }} />
    ] }
  ];
  return (
    <MenuPageShell title="Library Fine Details">
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {["category", "fineperday", "graceperioddays", "maxfine", "status", "remarks"].map((field) => (
              <Grid item xs={12} md={2} key={field}><TextField fullWidth size="small" label={field} type={["fineperday", "graceperioddays", "maxfine"].includes(field) ? "number" : "text"} value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></Grid>
            ))}
            <Grid item xs={12}><Button variant="contained" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</Button></Grid>
          </Grid>
        </Paper>
        <Box sx={{ height: 520 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} /></Box>
      </Stack>
    </MenuPageShell>
  );
}

function LibraryPolicyCrudPage({ title, endpoint, fields, initialForm, numericField }) {
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "role", value: "" }]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const load = async () => {
    setLoading(true);
    const params = { colid: global1.colid };
    filters.forEach((filter) => { if (filter.field && filter.value) params[filter.field] = filter.value; });
    const res = await ep1.get(`/api/v2/librarynew/${endpoint}`, { params });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    setLoading(true);
    await ep1.post(`/api/v2/librarynew/${endpoint}`, { ...form, colid: global1.colid, user: global1.user });
    setForm(initialForm);
    setMessage("Configuration saved.");
    await load();
    setLoading(false);
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const rowsToSave = await readExcel(file);
    await ep1.post(`/api/v2/librarynew/${endpoint}/bulk`, { colid: global1.colid, user: global1.user, rows: rowsToSave });
    await load();
    setLoading(false);
    event.target.value = "";
  };
  const columns = [
    { field: "role", headerName: "Role", minWidth: 160 },
    { field: "bookcategory", headerName: "Book Category", minWidth: 200, flex: 1 },
    { field: numericField, headerName: numericField === "noofbooks" ? "No. of Books" : "No. of Days", minWidth: 150 },
    ...(fields.includes("default") ? [{ field: "default", headerName: "Default", minWidth: 120 }] : []),
    { field: "actions", type: "actions", width: 110, getActions: (p) => [
      <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => setForm({ ...p.row, id: p.row._id })} />,
      <GridActionsCellItem icon={<Delete />} label="Delete" onClick={async () => { await ep1.post(`/api/v2/librarynew/${endpoint}/delete`, { id: p.row._id, colid: global1.colid }); load(); }} />
    ] }
  ];
  return (
    <MenuPageShell title={title}>
      <Stack spacing={2}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Autocomplete freeSolo size="small" options={options.role || []} value={form.role || ""} onInputChange={(_, value) => setForm({ ...form, role: value })} onChange={(_, value) => setForm({ ...form, role: value || "" })} renderInput={(params) => <TextField {...params} label="Role" />} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete freeSolo size="small" options={options.bookcategory || []} value={form.bookcategory || ""} onInputChange={(_, value) => setForm({ ...form, bookcategory: value })} onChange={(_, value) => setForm({ ...form, bookcategory: value || "" })} renderInput={(params) => <TextField {...params} label="Book Category" />} />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth size="small" type="number" label={numericField === "noofbooks" ? "No. of Books" : "No. of Days"} value={form[numericField] || ""} onChange={(e) => setForm({ ...form, [numericField]: e.target.value })} /></Grid>
            {fields.includes("default") && (
              <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="Default" value={form.default || "No"} onChange={(e) => setForm({ ...form, default: e.target.value })}>{["Yes", "No"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            )}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" disabled={loading} onClick={save}>{loading ? "Saving..." : "Save"}</Button></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="outlined" onClick={() => downloadTemplate(`${endpoint}_template.xlsx`, fields)}>Download Template</Button>
                <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={loading}>Bulk Upload<input hidden type="file" accept=".xlsx,.xls,.csv" onChange={upload} /></Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <FieldFilters fields={fields} options={options} filters={filters} setFilters={setFilters} />
          <Button sx={{ mt: 1 }} variant="contained" onClick={load} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
        </Paper>
        <Box sx={{ height: 560, width: "100%" }}>
          <DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} />
        </Box>
      </Stack>
    </MenuPageShell>
  );
}

export function LibraryRoleMaxBooksPage() {
  return <LibraryPolicyCrudPage title="Library Rolewise Max Books" endpoint="role-max-books" fields={["role", "bookcategory", "noofbooks", "default"]} initialForm={{ default: "No" }} numericField="noofbooks" />;
}

export function LibraryRoleMaxDaysPage() {
  return <LibraryPolicyCrudPage title="Library Rolewise Max Days" endpoint="role-max-days" fields={["role", "bookcategory", "noofdays"]} initialForm={{}} numericField="noofdays" />;
}

function overdueInfo(row) {
  if (!row?.duedate || /^Returned$/i.test(row.status || "")) return { days: 0, label: "On time" };
  const due = new Date(row.duedate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.ceil((today - due) / 86400000));
  return { days, label: days ? `${days} day(s) overdue` : "On time" };
}

export function LibraryCounterPage() {
  const [identifier, setIdentifier] = useState("");
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [bookCode, setBookCode] = useState("");
  const [bookData, setBookData] = useState(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUser = async () => {
    if (!identifier.trim()) return;
    setLoading(true); setError(""); setMessage(""); setBookData(null);
    try {
      const res = await ep1.get("/api/v2/librarynew/counter/user", { params: { colid: global1.colid, identifier } });
      setProfile(res.data?.profile || null);
      setActive(res.data?.active || []);
      setHistory(res.data?.history || []);
    } catch (err) {
      setProfile(null); setActive([]); setHistory([]);
      setError(err.response?.data?.message || "Unable to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const loadBook = async () => {
    if (!bookCode.trim()) return;
    setLoading(true); setError(""); setMessage("");
    try {
      const res = await ep1.get("/api/v2/librarynew/counter/book", { params: { colid: global1.colid, accessionno: bookCode, identifier } });
      setBookData(res.data || null);
    } catch (err) {
      setBookData(null);
      setError(err.response?.data?.message || "Unable to load book");
    } finally {
      setLoading(false);
    }
  };

  const issueBook = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      const res = await ep1.post("/api/v2/librarynew/counter/issue", { colid: global1.colid, identifier, accessionno: bookData?.book?.accessionno, user: global1.user });
      setMessage(`Book issued. Due date: ${shortDate(res.data?.data?.duedate)}`);
      setBookCode(""); setBookData(null);
      await loadUser();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to issue book");
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (row) => {
    setLoading(true); setError(""); setMessage("");
    try {
      const res = await ep1.post("/api/v2/librarynew/counter/return", { colid: global1.colid, id: row._id, returndate: shortDate(new Date()), user: global1.user });
      setMessage(`Book returned. Fine: Rs. ${money(res.data?.fineamount)}`);
      await loadUser();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to return book");
    } finally {
      setLoading(false);
    }
  };

  const issueColumns = [
    { field: "accessionno", headerName: "Accession", minWidth: 130 },
    { field: "title", headerName: "Title", minWidth: 260, flex: 1 },
    { field: "category", headerName: "Category", minWidth: 140 },
    { field: "issuedate", headerName: "Issue Date", minWidth: 120, valueGetter: (p) => shortDate(p.row.issuedate) },
    { field: "duedate", headerName: "Due Date", minWidth: 120, valueGetter: (p) => shortDate(p.row.duedate) },
    { field: "overdue", headerName: "Overdue", minWidth: 140, valueGetter: (p) => overdueInfo(p.row).label },
    { field: "actions", type: "actions", width: 100, getActions: (p) => [<GridActionsCellItem icon={<Save />} label="Return" disabled={loading} onClick={() => returnBook(p.row)} />] }
  ];
  const historyColumns = [
    { field: "issuedate", headerName: "Issue Date", minWidth: 120, valueGetter: (p) => shortDate(p.row.issuedate) },
    { field: "returndate", headerName: "Return Date", minWidth: 120, valueGetter: (p) => shortDate(p.row.returndate) },
    { field: "accessionno", headerName: "Accession", minWidth: 130 },
    { field: "title", headerName: "Title", minWidth: 260, flex: 1 },
    { field: "category", headerName: "Category", minWidth: 140 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "fineamount", headerName: "Fine", minWidth: 100, valueGetter: (p) => money(p.row.fineamount) }
  ];

  return (
    <MenuPageShell title="Library Circulation Desk">
      <Stack spacing={2}>
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Reg no or email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") loadUser(); }} helperText="Type manually or scan a user barcode, then press Enter or Next." />
            </Grid>
            <Grid item xs={12} md={4}><Button fullWidth variant="contained" sx={{ height: 56 }} disabled={loading || !identifier.trim()} onClick={loadUser}>{loading ? <CircularProgress size={24} color="inherit" /> : "Next"}</Button></Grid>
          </Grid>
        </Paper>
        {profile && (
          <>
            <Paper sx={{ p: 2, borderLeft: "6px solid #2563eb" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item><Avatar src={profile.photo || ""} alt={profile.name || ""} sx={{ width: 84, height: 84, bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 900 }}>{(profile.name || "?").slice(0, 1)}</Avatar></Grid>
                <Grid item xs>
                  <Typography variant="h5" fontWeight={900}>{profile.name || "Unnamed user"}</Typography>
                  <Typography color="text.secondary">{profile.role || "-"} | {profile.regno || profile.email || profile.user || "-"}</Typography>
                  <Typography color="text.secondary">{profile.program || profile.department || "-"} {profile.semester ? `| Semester ${profile.semester}` : ""} {profile.phone ? `| ${profile.phone}` : ""}</Typography>
                </Grid>
                <Grid item><Chip color="primary" label={`${active.length} active issue(s)`} /></Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
                <Tab label="Issue" />
                <Tab label="Return" />
                <Tab label="History" />
              </Tabs>
              {tab === 0 && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}><TextField fullWidth label="Accession no" value={bookCode} onChange={(e) => setBookCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") loadBook(); }} helperText="Type manually or scan the book barcode." /></Grid>
                    <Grid item xs={12} md={4}><Button fullWidth variant="contained" sx={{ height: 56 }} disabled={loading || !bookCode.trim()} onClick={loadBook}>{loading ? "Loading..." : "Load Book"}</Button></Grid>
                  </Grid>
                  {bookData?.book && (
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={8}>
                            <Typography variant="h6" fontWeight={900}>{bookData.book.title}</Typography>
                            <Typography color="text.secondary">{bookData.book.accessionno} | {bookData.book.author || "-"} | {bookData.book.category || "General"}</Typography>
                            <Typography color={bookData.issue ? "error" : "success.main"} fontWeight={800}>Status: {bookData.issue ? `Issued to ${bookData.issue.student}` : bookData.book.status}</Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            {bookData.eligibility && (
                              <Alert severity={bookData.eligibility.allowed && !bookData.issue ? "success" : "warning"}>
                                {bookData.issue ? "This book is already issued." : bookData.eligibility.message}<br />
                                Active/category: {bookData.eligibility.activeCount || 0} / {bookData.eligibility.maxBooks || "No cap"}<br />
                                Due after: {bookData.eligibility.noofdays || 14} day(s)
                              </Alert>
                            )}
                          </Grid>
                          <Grid item xs={12}><Button variant="contained" disabled={loading || !!bookData.issue || !bookData.eligibility?.allowed} onClick={issueBook}>{loading ? "Issuing..." : "Issue Book"}</Button></Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              )}
              {tab === 1 && <Box sx={{ height: 520, mt: 2 }}><DataGrid rows={active} columns={issueColumns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>}
              {tab === 2 && <Box sx={{ height: 520, mt: 2 }}><DataGrid rows={history} columns={historyColumns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>}
            </Paper>
          </>
        )}
      </Stack>
    </MenuPageShell>
  );
}

function useLibrarySearch() {
  const { libraries } = useLibraryList(false);
  const [libraryid, setLibraryid] = useState("");
  const [bookRows, setBookRows] = useState([]);
  const [bookOptions, setBookOptions] = useState({});
  const [studentRows, setStudentRows] = useState([]);
  const [studentOptions, setStudentOptions] = useState({});
  const [bookFilters, setBookFilters] = useState([{ field: "title", value: "" }]);
  const [studentFilters, setStudentFilters] = useState([{ field: "name", value: "" }]);
  const loadBooks = async () => {
    const params = { colid: global1.colid, user: global1.user };
    if (libraryid) params.libraryid = libraryid;
    bookFilters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get("/api/v2/librarynew/books", { params });
    setBookRows(res.data?.data || []);
    setBookOptions(res.data?.options || {});
  };
  const loadStudents = async () => {
    const params = { colid: global1.colid };
    studentFilters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get("/api/v2/librarynew/students", { params });
    setStudentRows(res.data?.data || []);
    setStudentOptions(res.data?.options || {});
  };
  useEffect(() => { loadBooks(); loadStudents(); }, []);
  return { libraries, libraryid, setLibraryid, bookRows, bookOptions, studentRows, studentOptions, bookFilters, setBookFilters, studentFilters, setStudentFilters, loadBooks, loadStudents };
}

export function LibraryIssuePage() {
  const s = useLibrarySearch();
  const [book, setBook] = useState(null);
  const [student, setStudent] = useState(null);
  const [issue, setIssue] = useState({ issuetype: "Regular", issuedate: shortDate(new Date()), duedate: "" });
  const [message, setMessage] = useState("");
  const issueBook = async () => {
    const res = await ep1.post("/api/v2/librarynew/issue", {
      colid: global1.colid,
      libraryid: book?.libraryid,
      accessionno: book?.accessionno,
      regno: student?.regno,
      student: student?.name,
      email: student?.email || student?.user,
      phone: student?.phone,
      ...issue,
      user: global1.user
    });
    setMessage(`Book issued: ${res.data?.data?.accessionno}`);
    setBook(null); setStudent(null);
    s.loadBooks();
  };
  return (
    <MenuPageShell title="Library Issue Book">
      <Stack spacing={2}>
        {message && <Alert severity="success">{message}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={900}>Search Book</Typography>
          <Box sx={{ mb: 2, maxWidth: 420 }}><LibrarySelect libraries={s.libraries} value={s.libraryid} onChange={s.setLibraryid} allowAll /></Box>
          <FieldFilters fields={bookFields} options={s.bookOptions} filters={s.bookFilters} setFilters={s.setBookFilters} />
          <Button onClick={s.loadBooks} variant="contained" sx={{ mt: 1 }}>Apply Book Filter</Button>
          <Autocomplete sx={{ mt: 2 }} options={s.bookRows.filter((row) => /^Available$/i.test(row.status || ""))} value={book} onChange={(_, v) => setBook(v)} getOptionLabel={(o) => `${o.accessionno || ""} - ${o.title || ""} - ${o.status || ""}`} renderInput={(params) => <TextField {...params} label="Select or scan accession no" />} />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={900}>Search Student</Typography>
          <FieldFilters fields={studentFields} options={s.studentOptions} filters={s.studentFilters} setFilters={s.setStudentFilters} />
          <Button onClick={s.loadStudents} variant="contained" sx={{ mt: 1 }}>Apply Student Filter</Button>
          <Autocomplete sx={{ mt: 2 }} options={s.studentRows} value={student} onChange={(_, v) => setStudent(v)} getOptionLabel={(o) => `${o.name || ""} - ${o.regno || ""} - ${o.email || o.user || ""}`} renderInput={(params) => <TextField {...params} label="Select student" />} />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Issue Type" value={issue.issuetype} onChange={(e) => setIssue({ ...issue, issuetype: e.target.value })}>{issueTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="Issue Date" InputLabelProps={{ shrink: true }} value={issue.issuedate} onChange={(e) => setIssue({ ...issue, issuedate: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth type="date" label="Return Due Date" InputLabelProps={{ shrink: true }} value={issue.duedate} onChange={(e) => setIssue({ ...issue, duedate: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><Button fullWidth variant="contained" sx={{ height: 56 }} disabled={!book || !student} onClick={issueBook}>Issue Book</Button></Grid>
          </Grid>
        </Paper>
      </Stack>
    </MenuPageShell>
  );
}

export function LibraryReturnPage() {
  const { libraries } = useLibraryList(false);
  const [libraryid, setLibraryid] = useState("");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const load = async () => {
    const params = { colid: global1.colid, user: global1.user, status: "Issued" };
    if (libraryid) params.libraryid = libraryid;
    const res = await ep1.get("/api/v2/librarynew/issues", { params });
    setRows(res.data?.data || []);
  };
  useEffect(() => { load(); }, []);
  const returnBook = async (row) => {
    const res = await ep1.post("/api/v2/librarynew/return", { id: row._id, colid: global1.colid, returndate: shortDate(new Date()), user: global1.user });
    setMessage(`Book returned. Fine added: Rs. ${money(res.data?.fineamount)}`);
    load();
  };
  const columns = [
    { field: "libraryname", headerName: "Library", minWidth: 170 },
    { field: "accessionno", headerName: "Accession No", minWidth: 130 },
    { field: "title", headerName: "Title", minWidth: 230, flex: 1 },
    { field: "classification", headerName: "Classification", minWidth: 150 },
    { field: "publisher", headerName: "Publisher", minWidth: 150 },
    { field: "keywords", headerName: "Keywords", minWidth: 200 },
    { field: "student", headerName: "Student", minWidth: 180 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "issuedate", headerName: "Issue Date", minWidth: 120, valueGetter: (p) => shortDate(p.row.issuedate) },
    { field: "duedate", headerName: "Due Date", minWidth: 120, valueGetter: (p) => shortDate(p.row.duedate) },
    { field: "actions", type: "actions", width: 100, getActions: (p) => [<GridActionsCellItem icon={<Save />} label="Return" onClick={() => returnBook(p.row)} />] }
  ];
  return <MenuPageShell title="Library Return Book"><Stack spacing={2}>{message && <Alert severity="success">{message}</Alert>}<Paper sx={{ p: 2 }}><Box sx={{ maxWidth: 420 }}><LibrarySelect libraries={libraries} value={libraryid} onChange={setLibraryid} allowAll /></Box><Button sx={{ mt: 1 }} variant="contained" onClick={load}>Apply</Button></Paper><Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box></Stack></MenuPageShell>;
}

export function LibraryReportsPage() {
  const { libraries } = useLibraryList(false);
  const [rows, setRows] = useState([]);
  const [cards, setCards] = useState({});
  const [summaries, setSummaries] = useState({});
  const [filters, setFilters] = useState({ fromdate: "", todate: "", libraryid: "" });
  const load = async () => {
    const res = await ep1.get("/api/v2/librarynew/reports", { params: { colid: global1.colid, user: global1.user, ...filters } });
    setRows(res.data?.data || []);
    setCards(res.data?.cards || {});
    setSummaries(res.data?.summaries || {});
  };
  useEffect(() => { load(); }, []);
  const print = () => {
    const html = document.getElementById("library-report-print")?.innerHTML || "";
    const win = window.open("", "_blank");
    win.document.write(`<html><body>${html}</body></html>`);
    win.document.close(); win.print();
  };
  const columns = [
    { field: "libraryname", headerName: "Library", width: 160 },
    { field: "issuedate", headerName: "Issue Date", width: 120, valueGetter: (p) => shortDate(p.row.issuedate) },
    { field: "accessionno", headerName: "Accession", width: 120 },
    { field: "title", headerName: "Title", minWidth: 220, flex: 1 },
    { field: "classification", headerName: "Classification", width: 150 },
    { field: "publisher", headerName: "Publisher", width: 150 },
    { field: "keywords", headerName: "Keywords", width: 200 },
    { field: "student", headerName: "Student", minWidth: 180 },
    { field: "programcode", headerName: "Program", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "fineamount", headerName: "Fine", width: 100 }
  ];
  return (
    <MenuPageShell title="Library Reports">
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}><Stack direction="row" spacing={2} flexWrap="wrap"><Box sx={{ minWidth: 280 }}><LibrarySelect libraries={libraries} value={filters.libraryid} onChange={(libraryid) => setFilters({ ...filters, libraryid })} allowAll /></Box><TextField type="date" label="From" InputLabelProps={{ shrink: true }} value={filters.fromdate} onChange={(e) => setFilters({ ...filters, fromdate: e.target.value })} /><TextField type="date" label="To" InputLabelProps={{ shrink: true }} value={filters.todate} onChange={(e) => setFilters({ ...filters, todate: e.target.value })} /><Button variant="contained" onClick={load}>Apply</Button><Button variant="outlined" startIcon={<Print />} onClick={print}>Print</Button></Stack></Paper>
        <Box id="library-report-print">
          <Grid container spacing={2}>{Object.entries(cards).map(([k, v]) => <Grid item xs={6} md={2} key={k}><Card><CardContent><Typography variant="caption">{k}</Typography><Typography variant="h6" fontWeight={900}>{money(v)}</Typography></CardContent></Card></Grid>)}</Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={900}>Categorywise Issues</Typography><ResponsiveContainer width="100%" height="90%"><BarChart data={summaries.category || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><ChartTooltip /><Bar dataKey="count" fill="#2563eb" /></BarChart></ResponsiveContainer></Paper></Grid>
            <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 320 }}><Typography fontWeight={900}>Status</Typography><ResponsiveContainer width="100%" height="90%"><PieChart><Pie data={summaries.status || []} dataKey="count" nameKey="label" label>{(summaries.status || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><ChartTooltip /><Legend /></PieChart></ResponsiveContainer></Paper></Grid>
          </Grid>
          <Box sx={{ height: 520, mt: 2 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box>
        </Box>
      </Stack>
    </MenuPageShell>
  );
}

export function StudentLibraryIssuedPage() {
  const { libraries } = useLibraryList(true);
  const [libraryid, setLibraryid] = useState("");
  const [rows, setRows] = useState([]);
  const load = async () => {
    const params = { colid: global1.colid, regno: global1.regno, email: global1.user };
    if (libraryid) params.libraryid = libraryid;
    const res = await ep1.get("/api/v2/librarynew/student-issues", { params });
    setRows(res.data?.data || []);
  };
  useEffect(() => { load(); }, []);
  const columns = [
    { field: "libraryname", headerName: "Library", width: 160 },
    { field: "accessionno", headerName: "Accession", width: 130 },
    { field: "title", headerName: "Title", minWidth: 240, flex: 1 },
    { field: "classification", headerName: "Classification", width: 150 },
    { field: "publisher", headerName: "Publisher", width: 150 },
    { field: "keywords", headerName: "Keywords", width: 200 },
    { field: "issuedate", headerName: "Issue Date", width: 120, valueGetter: (p) => shortDate(p.row.issuedate) },
    { field: "duedate", headerName: "Due Date", width: 120, valueGetter: (p) => shortDate(p.row.duedate) },
    { field: "returndate", headerName: "Return Date", width: 120, valueGetter: (p) => shortDate(p.row.returndate) },
    { field: "status", headerName: "Status", width: 120 },
    { field: "fineamount", headerName: "Fine", width: 100 }
  ];
  return <MenuPageShell title="My Library Books" menuType="student"><Stack spacing={2}><Paper sx={{ p: 2 }}><Box sx={{ maxWidth: 420 }}><LibrarySelect libraries={libraries} value={libraryid} onChange={setLibraryid} allowAll /></Box><Button sx={{ mt: 1 }} variant="contained" onClick={load}>Apply</Button></Paper><Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box></Stack></MenuPageShell>;
}

export function StudentLibraryOpacPage() {
  const { libraries } = useLibraryList(true);
  const [libraryid, setLibraryid] = useState("");
  const [rows, setRows] = useState([]);
  const [photocopyRows, setPhotocopyRows] = useState([]);
  const [options, setOptions] = useState({});
  const [aiOptions, setAiOptions] = useState({ geminiModels: [], ollama: [] });
  const [filters, setFilters] = useState([{ field: "title", value: "" }]);
  const [ai, setAi] = useState({ provider: "Gemini", geminiModel: "gemini-2.5-flash", ollamaId: "" });
  const [summaryDialog, setSummaryDialog] = useState({ open: false, book: null, summary: "", loading: false });
  const [copyDialog, setCopyDialog] = useState({ open: false, book: null, frompage: "", topage: "", remarks: "" });
  const [message, setMessage] = useState("");
  const load = async () => {
    const params = { colid: global1.colid };
    if (libraryid) params.libraryid = libraryid;
    filters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get("/api/v2/librarynew/opac", { params });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
    await loadPhotocopies();
  };
  const loadAiOptions = async () => {
    const res = await ep1.get("/api/v2/librarynew/ai-options", { params: { colid: global1.colid } });
    setAiOptions(res.data || {});
  };
  const loadPhotocopies = async () => {
    const params = { colid: global1.colid, regno: global1.regno, email: global1.user, user: global1.user };
    if (libraryid) params.libraryid = libraryid;
    const res = await ep1.get("/api/v2/librarynew/student-photocopy-requests", { params });
    setPhotocopyRows(res.data?.data || []);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { loadAiOptions(); }, []);
  const request = async (row) => {
    const res = await ep1.post("/api/v2/librarynew/request", { colid: global1.colid, bookid: row._id, regno: global1.regno, user: global1.user });
    setMessage(`Request created for ${res.data?.data?.title}`);
  };
  const summarize = async (row) => {
    setSummaryDialog({ open: true, book: row, summary: "", loading: true });
    try {
      const res = await ep1.post("/api/v2/librarynew/book-summary", { colid: global1.colid, bookid: row._id, ...ai });
      setSummaryDialog({ open: true, book: row, summary: res.data?.summary || "", loading: false });
    } catch (error) {
      setSummaryDialog({ open: true, book: row, summary: error.response?.data?.message || "Unable to summarize this book", loading: false });
    }
  };
  const submitPhotocopy = async () => {
    await ep1.post("/api/v2/librarynew/photocopy-request", {
      colid: global1.colid,
      bookid: copyDialog.book?._id,
      regno: global1.regno,
      user: global1.user,
      frompage: copyDialog.frompage,
      topage: copyDialog.topage,
      remarks: copyDialog.remarks
    });
    setMessage(`Photocopy request created for ${copyDialog.book?.title}`);
    setCopyDialog({ open: false, book: null, frompage: "", topage: "", remarks: "" });
    await loadPhotocopies();
  };
  const columns = [
    { field: "libraryname", headerName: "Library", width: 160 },
    { field: "accessionno", headerName: "Accession", width: 130 },
    { field: "title", headerName: "Title", minWidth: 250, flex: 1 },
    { field: "author", headerName: "Author", minWidth: 180 },
    { field: "classification", headerName: "Classification", minWidth: 160 },
    { field: "publisher", headerName: "Publisher", minWidth: 160 },
    { field: "publisheraddress", headerName: "Publisher Address", minWidth: 220 },
    { field: "invoiceno", headerName: "Invoice No", width: 130 },
    { field: "invoicedate", headerName: "Invoice Date", width: 125, valueGetter: (p) => shortDate(p.row.invoicedate) },
    { field: "keywords", headerName: "Keywords", minWidth: 220 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "actions", type: "actions", width: 180, getActions: (p) => [
      <GridActionsCellItem icon={<Save />} label="Request book" disabled={!/^Available$/i.test(p.row.status || "")} onClick={() => request(p.row)} />,
      <GridActionsCellItem icon={<Refresh />} label="Summary" onClick={() => summarize(p.row)} />,
      <GridActionsCellItem icon={<UploadFile />} label="Photocopy" onClick={() => setCopyDialog({ open: true, book: p.row, frompage: "", topage: "", remarks: "" })} />
    ] }
  ];
  const photocopyColumns = [
    { field: "libraryname", headerName: "Library", width: 150 },
    { field: "requestdate", headerName: "Request Date", width: 125, valueGetter: (p) => shortDate(p.row.requestdate) },
    { field: "title", headerName: "Book", minWidth: 220, flex: 1 },
    { field: "accessionno", headerName: "Accession", width: 120 },
    { field: "frompage", headerName: "From", width: 80 },
    { field: "topage", headerName: "To", width: 80 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "remarks", headerName: "Remarks", minWidth: 180 },
    { field: "documentlink", headerName: "Document", width: 150, renderCell: (p) => p.value ? <Button size="small" href={p.value} target="_blank">Open</Button> : "" }
  ];
  return (
    <MenuPageShell title="Library OPAC" menuType="student">
      <Stack spacing={2}>
        {message && <Alert severity="success">{message}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><LibrarySelect libraries={libraries} value={libraryid} onChange={setLibraryid} allowAll /></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth size="small" label="AI Provider" value={ai.provider} onChange={(e) => setAi({ ...ai, provider: e.target.value })}>{["Gemini", "Ollama"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            {ai.provider === "Gemini" ? (
              <Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Gemini Model" value={ai.geminiModel} onChange={(e) => setAi({ ...ai, geminiModel: e.target.value })}>{(aiOptions.geminiModels || ["gemini-2.5-flash"]).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField></Grid>
            ) : (
              <Grid item xs={12} md={3}><TextField select fullWidth size="small" label="Ollama" value={ai.ollamaId} onChange={(e) => setAi({ ...ai, ollamaId: e.target.value })}>{(aiOptions.ollama || []).map((v) => <MenuItem key={v._id} value={v._id}>{v.name || v.modelname}</MenuItem>)}</TextField></Grid>
            )}
          </Grid>
          <Box sx={{ mt: 2 }}><FieldFilters fields={bookFields} options={options} filters={filters} setFilters={setFilters} /></Box>
          <Button sx={{ mt: 1 }} variant="contained" onClick={load}>Search</Button>
        </Paper>
        <Box sx={{ height: 520 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={900}>My Photocopy Requests</Typography>
            <Button size="small" startIcon={<Refresh />} onClick={loadPhotocopies}>Refresh</Button>
          </Stack>
          <Box sx={{ height: 360 }}><DataGrid rows={photocopyRows} columns={photocopyColumns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box>
        </Paper>
        <Dialog open={summaryDialog.open} onClose={() => setSummaryDialog({ open: false, book: null, summary: "", loading: false })} maxWidth="md" fullWidth>
          <DialogTitle>Book Summary - {summaryDialog.book?.title}</DialogTitle>
          <DialogContent>
            {summaryDialog.loading ? <Stack alignItems="center" sx={{ p: 4 }}><CircularProgress /><Typography sx={{ mt: 1 }}>Generating summary...</Typography></Stack> : <Typography sx={{ whiteSpace: "pre-wrap" }}>{summaryDialog.summary}</Typography>}
          </DialogContent>
        </Dialog>
        <Dialog open={copyDialog.open} onClose={() => setCopyDialog({ open: false, book: null, frompage: "", topage: "", remarks: "" })} maxWidth="sm" fullWidth>
          <DialogTitle>Request Photocopy - {copyDialog.book?.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography color="text.secondary">Total pages: {copyDialog.book?.pages || "Not specified"}</Typography>
              <TextField type="number" label="From Page" value={copyDialog.frompage} onChange={(e) => setCopyDialog({ ...copyDialog, frompage: e.target.value })} />
              <TextField type="number" label="To Page" value={copyDialog.topage} onChange={(e) => setCopyDialog({ ...copyDialog, topage: e.target.value })} />
              <TextField multiline minRows={2} label="Remarks" value={copyDialog.remarks} onChange={(e) => setCopyDialog({ ...copyDialog, remarks: e.target.value })} />
              <Button variant="contained" onClick={submitPhotocopy}>Submit Request</Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Stack>
    </MenuPageShell>
  );
}

export function LibraryRequestsPage() {
  const { libraries } = useLibraryList(false);
  const [libraryid, setLibraryid] = useState("");
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([{ field: "student", value: "" }]);
  const [options, setOptions] = useState({});
  const load = async () => {
    const params = { colid: global1.colid, user: global1.user };
    if (libraryid) params.libraryid = libraryid;
    filters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get("/api/v2/librarynew/requests", { params });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
  };
  useEffect(() => { load(); }, []);
  const issue = async (row) => {
    await ep1.post("/api/v2/librarynew/issue", { colid: global1.colid, libraryid: row.libraryid, accessionno: row.accessionno, regno: row.regno, requestid: row._id, issuedate: shortDate(new Date()), user: global1.user });
    load();
  };
  const reject = async (row) => {
    await ep1.post("/api/v2/librarynew/request/reject", { colid: global1.colid, id: row._id, user: global1.user, remarks: "Rejected by librarian" });
    load();
  };
  const columns = [
    { field: "libraryname", headerName: "Library", width: 160 },
    { field: "requestdate", headerName: "Request Date", width: 130, valueGetter: (p) => shortDate(p.row.requestdate) },
    { field: "student", headerName: "Student", minWidth: 180 },
    { field: "regno", headerName: "Reg No", width: 130 },
    { field: "title", headerName: "Book", minWidth: 240, flex: 1 },
    { field: "accessionno", headerName: "Accession", width: 130 },
    { field: "classification", headerName: "Classification", minWidth: 160 },
    { field: "publisher", headerName: "Publisher", minWidth: 160 },
    { field: "publisheraddress", headerName: "Publisher Address", minWidth: 220 },
    { field: "invoiceno", headerName: "Invoice No", width: 130 },
    { field: "invoicedate", headerName: "Invoice Date", width: 125, valueGetter: (p) => shortDate(p.row.invoicedate) },
    { field: "keywords", headerName: "Keywords", minWidth: 220 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "actions", type: "actions", width: 120, getActions: (p) => [<GridActionsCellItem icon={<Save />} label="Issue" disabled={!/^Requested$/i.test(p.row.status || "")} onClick={() => issue(p.row)} />, <GridActionsCellItem icon={<Delete />} label="Reject" disabled={!/^Requested$/i.test(p.row.status || "")} onClick={() => reject(p.row)} />] }
  ];
  return <MenuPageShell title="Library Requests"><Stack spacing={2}><Paper sx={{ p: 2 }}><Box sx={{ mb: 2, maxWidth: 420 }}><LibrarySelect libraries={libraries} value={libraryid} onChange={setLibraryid} allowAll /></Box><FieldFilters fields={["student", "regno", "email", "programcode", "semester", "title", "accessionno", "classification", "publisher", "publisheraddress", "keywords", "invoiceno", "status"]} options={options} filters={filters} setFilters={setFilters} /><Button sx={{ mt: 1 }} variant="contained" onClick={load}>Apply</Button></Paper><Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} /></Box></Stack></MenuPageShell>;
}

export function LibraryPhotocopyRequestsPage() {
  const { libraries } = useLibraryList(/^All$/i.test(global1.role || ""));
  const [libraryid, setLibraryid] = useState("");
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([{ field: "status", value: "Requested" }]);
  const [options, setOptions] = useState({});
  const [uploadDialog, setUploadDialog] = useState({ open: false, row: null, file: null, remarks: "" });
  const [message, setMessage] = useState("");
  const load = async () => {
    const params = { colid: global1.colid, user: global1.user, role: global1.role };
    if (libraryid) params.libraryid = libraryid;
    filters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get("/api/v2/librarynew/photocopy-requests", { params });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
  };
  useEffect(() => { load(); }, []);
  const reject = async (row) => {
    await ep1.post("/api/v2/librarynew/photocopy-request/reject", { colid: global1.colid, id: row._id, user: global1.user, remarks: row.remarks || "Rejected by librarian" });
    setMessage("Request rejected");
    load();
  };
  const uploadCopy = async () => {
    if (!uploadDialog.file || !uploadDialog.row) return;
    const fd = new FormData();
    fd.append("file", uploadDialog.file);
    fd.append("colid", global1.colid);
    fd.append("id", uploadDialog.row._id);
    fd.append("user", global1.user);
    fd.append("remarks", uploadDialog.remarks || "");
    await ep1.post("/api/v2/librarynew/photocopy-request/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setMessage("Photocopy uploaded and visible to student");
    setUploadDialog({ open: false, row: null, file: null, remarks: "" });
    load();
  };
  const columns = [
    { field: "libraryname", headerName: "Library", width: 160 },
    { field: "requestdate", headerName: "Request Date", width: 130, valueGetter: (p) => shortDate(p.row.requestdate) },
    { field: "student", headerName: "Student", minWidth: 180 },
    { field: "regno", headerName: "Reg No", width: 120 },
    { field: "programcode", headerName: "Program", width: 120 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "title", headerName: "Book", minWidth: 240, flex: 1 },
    { field: "accessionno", headerName: "Accession", width: 120 },
    { field: "frompage", headerName: "From", width: 80 },
    { field: "topage", headerName: "To", width: 80 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "remarks", headerName: "Remarks", minWidth: 180 },
    { field: "documentlink", headerName: "Document", width: 130, renderCell: (p) => p.value ? <Button size="small" href={p.value} target="_blank">Open</Button> : "" },
    { field: "actions", type: "actions", width: 120, getActions: (p) => [
      <GridActionsCellItem icon={<UploadFile />} label="Upload" disabled={!/^Requested$/i.test(p.row.status || "")} onClick={() => setUploadDialog({ open: true, row: p.row, file: null, remarks: p.row.remarks || "" })} />,
      <GridActionsCellItem icon={<Delete />} label="Reject" disabled={!/^Requested$/i.test(p.row.status || "")} onClick={() => reject(p.row)} />
    ] }
  ];
  return (
    <MenuPageShell title="Photocopy Requests">
      <Stack spacing={2}>
        {message && <Alert severity="success">{message}</Alert>}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2, maxWidth: 420 }}><LibrarySelect libraries={libraries} value={libraryid} onChange={setLibraryid} allowAll /></Box>
          <FieldFilters fields={["student", "regno", "email", "programcode", "semester", "title", "accessionno", "status"]} options={options} filters={filters} setFilters={setFilters} />
          <Button sx={{ mt: 1 }} variant="contained" onClick={load}>Apply</Button>
        </Paper>
        <Box sx={{ height: 620 }}><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
        <Dialog open={uploadDialog.open} onClose={() => setUploadDialog({ open: false, row: null, file: null, remarks: "" })} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Photocopy - {uploadDialog.row?.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography color="text.secondary">Pages {uploadDialog.row?.frompage} to {uploadDialog.row?.topage}</Typography>
              <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                Select File
                <input hidden type="file" onChange={(e) => setUploadDialog({ ...uploadDialog, file: e.target.files?.[0] || null })} />
              </Button>
              {uploadDialog.file && <Alert severity="info">{uploadDialog.file.name}</Alert>}
              <TextField multiline minRows={2} label="Remarks" value={uploadDialog.remarks} onChange={(e) => setUploadDialog({ ...uploadDialog, remarks: e.target.value })} />
              <Button variant="contained" onClick={uploadCopy} disabled={!uploadDialog.file}>Upload and Close Request</Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Stack>
    </MenuPageShell>
  );
}

function LibraryMovementPage({ mode }) {
  const isLoan = mode === "loan";
  const title = isLoan ? "Inter Library Loan" : "Inter Library Transfer";
  const endpoint = isLoan ? "loans" : "transfers";
  const s = useLibrarySearch();
  const { libraries: allLibraries } = useLibraryList(true);
  const [book, setBook] = useState(null);
  const [toLibrary, setToLibrary] = useState("");
  const [form, setForm] = useState({ remarks: "", duedate: "" });
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ field: "status", value: "" }]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    const params = { colid: global1.colid };
    filters.forEach((f) => { if (f.field && f.value) params[f.field] = f.value; });
    const res = await ep1.get(`/api/v2/librarynew/${endpoint}`, { params });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!book || !toLibrary) return;
    setLoading(true);
    await ep1.post(`/api/v2/librarynew/${endpoint}`, { colid: global1.colid, bookid: book._id, tolibraryid: toLibrary, ...form, user: global1.user });
    setBook(null); setToLibrary(""); setForm({ remarks: "", duedate: "" });
    await load();
    setLoading(false);
  };
  const approve = async (row, status) => {
    setLoading(true);
    await ep1.post(`/api/v2/librarynew/${endpoint}/approve`, { colid: global1.colid, id: row._id, status, user: global1.user, remarks: row.remarks || "" });
    await load();
    setLoading(false);
  };
  const print = () => {
    const html = document.getElementById(`library-${endpoint}-print`)?.innerHTML || "";
    const win = window.open("", "_blank");
    win.document.write(`<html><body>${html}</body></html>`);
    win.document.close(); win.print();
  };
  const movementFields = ["accessionno", "title", "classification", "publisher", "publisheraddress", "keywords", "invoiceno", "fromlibraryname", "tolibraryname", "status"];
  const columns = [
    { field: "accessionno", headerName: "Accession", minWidth: 130 },
    { field: "title", headerName: "Title", minWidth: 230, flex: 1 },
    { field: "classification", headerName: "Classification", minWidth: 160 },
    { field: "publisher", headerName: "Publisher", minWidth: 160 },
    { field: "publisheraddress", headerName: "Publisher Address", minWidth: 220 },
    { field: "invoiceno", headerName: "Invoice No", minWidth: 130 },
    { field: "invoicedate", headerName: "Invoice Date", minWidth: 125, valueGetter: (p) => shortDate(p.row.invoicedate) },
    { field: "keywords", headerName: "Keywords", minWidth: 220 },
    { field: "fromlibraryname", headerName: "From Library", minWidth: 180 },
    { field: "tolibraryname", headerName: "To Library", minWidth: 180 },
    { field: isLoan ? "loandate" : "transferdate", headerName: "Date", minWidth: 120, valueGetter: (p) => shortDate(p.row[isLoan ? "loandate" : "transferdate"]) },
    ...(isLoan ? [{ field: "duedate", headerName: "Due Date", minWidth: 120, valueGetter: (p) => shortDate(p.row.duedate) }] : []),
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "actions", type: "actions", width: 150, getActions: (p) => [
      <GridActionsCellItem icon={<CheckCircle />} label="Approve" disabled={!/^Applied$/i.test(p.row.status || "")} onClick={() => approve(p.row, "Approved")} />,
      <GridActionsCellItem icon={<Delete />} label="Reject" disabled={!/^Applied$/i.test(p.row.status || "")} onClick={() => approve(p.row, "Rejected")} />
    ] }
  ];
  return (
    <MenuPageShell title={title}>
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={900}>Create {isLoan ? "Loan" : "Transfer"} Request</Typography>
          <Box sx={{ my: 2, maxWidth: 420 }}><LibrarySelect libraries={s.libraries} value={s.libraryid} onChange={s.setLibraryid} allowAll /></Box>
          <FieldFilters fields={bookFields} options={s.bookOptions} filters={s.bookFilters} setFilters={s.setBookFilters} />
          <Button onClick={s.loadBooks} variant="contained" sx={{ mt: 1 }}>Apply Book Filter</Button>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={5}><Autocomplete options={s.bookRows.filter((row) => /^Available$/i.test(row.status || ""))} value={book} onChange={(_, v) => setBook(v)} getOptionLabel={(o) => `${o.accessionno || ""} - ${o.title || ""} - ${o.libraryname || ""}`} renderInput={(params) => <TextField {...params} label="Select book" />} /></Grid>
            <Grid item xs={12} md={4}><LibrarySelect libraries={allLibraries.filter((row) => String(row._id) !== String(book?.libraryid || ""))} value={toLibrary} onChange={setToLibrary} label="To Library" /></Grid>
            {isLoan && <Grid item xs={12} md={3}><TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={form.duedate || ""} onChange={(e) => setForm({ ...form, duedate: e.target.value })} /></Grid>}
            <Grid item xs={12} md={9}><TextField fullWidth label="Remarks" value={form.remarks || ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><Button fullWidth variant="contained" sx={{ height: 56 }} disabled={loading || !book || !toLibrary} onClick={save}>{loading ? "Saving..." : "Create Request"}</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}><FieldFilters fields={movementFields} options={options} filters={filters} setFilters={setFilters} /><Stack direction="row" spacing={1} sx={{ mt: 1 }}><Button variant="contained" onClick={load}>Apply</Button><Button variant="outlined" startIcon={<Print />} onClick={print}>Print</Button></Stack></Paper>
        <Box id={`library-${endpoint}-print`} sx={{ height: 620 }}><Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>{title}</Typography><DataGrid rows={rows} columns={columns} getRowId={(r) => r._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
      </Stack>
    </MenuPageShell>
  );
}

export function LibraryTransferPage() {
  return <LibraryMovementPage mode="transfer" />;
}

export function LibraryLoanPage() {
  return <LibraryMovementPage mode="loan" />;
}
