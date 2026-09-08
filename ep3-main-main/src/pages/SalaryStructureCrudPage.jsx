import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blank = {
  id: "",
  struture: "",
  description: "",
  businessrole: "",
  paycommission: "",
  designation: "",
  type: "",
  level: "",
  status1: "Active",
  comments: ""
};

const fields = [
  "struture",
  "description",
  "businessrole",
  "paycommission",
  "designation",
  "type",
  "level",
  "status1",
  "comments"
];

const labels = {
  struture: "Structure",
  description: "Description",
  businessrole: "Business role",
  paycommission: "Pay commission",
  designation: "Designation",
  type: "Type",
  level: "Level",
  status1: "Status",
  comments: "Comments"
};

function uniqueValues(rows, field) {
  return Array.from(new Set(rows.map((row) => row[field]).filter(Boolean))).sort();
}

export default function SalaryStructureCrudPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/hr-salary-structures", { params: { colid: global1.colid } });
      setRows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load salary structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const filteredRows = useMemo(() => rows.filter((row) => (
    Object.entries(filters).every(([field, value]) => !value || String(row[field] || "") === String(value))
  )), [rows, filters]);

  const updateForm = (field, value) => setForm((old) => ({ ...old, [field]: value }));

  const save = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await ep1.post("/api/v2/hr-salary-structures", {
        ...form,
        colid: global1.colid,
        user: global1.user,
        name: global1.name || global1.user || "NA"
      });
      setMessage("Salary structure saved");
      setForm(blank);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save salary structure");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.struture || row.designation || "this salary structure"}?`)) return;
    setLoading(true);
    try {
      await ep1.post("/api/v2/hr-salary-structures-delete", { id: row._id, colid: global1.colid });
      setMessage("Salary structure deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete salary structure");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const sample = [{
      Structure: "Assistant Professor Level 10",
      Description: "Permanent faculty salary structure",
      "Business Role": "Faculty",
      "Pay Commission": "7th Pay",
      Designation: "Assistant Professor",
      Type: "Permanent",
      Level: "Level 10",
      Status: "Active",
      Comments: ""
    }];
    const worksheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalaryStructure");
    XLSX.writeFile(workbook, "salary_structure_template.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const items = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ ...row, rowNumber: index + 2 }));
      const res = await ep1.post("/api/v2/hr-salary-structures-bulk", { colid: global1.colid, user: global1.user, items });
      setMessage(`${res.data.saved || 0} salary structure row(s) uploaded${res.data.errors?.length ? `, ${res.data.errors.length} skipped` : ""}`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload salary structures");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "struture", headerName: "Structure", minWidth: 220, flex: 1 },
    { field: "designation", headerName: "Designation", minWidth: 190 },
    { field: "businessrole", headerName: "Business role", minWidth: 170 },
    { field: "paycommission", headerName: "Pay commission", minWidth: 160 },
    { field: "type", headerName: "Type", minWidth: 130 },
    { field: "level", headerName: "Level", minWidth: 130 },
    { field: "status1", headerName: "Status", minWidth: 120 },
    { field: "description", headerName: "Description", minWidth: 240 },
    { field: "comments", headerName: "Comments", minWidth: 220 },
    {
      field: "actions",
      type: "actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => setForm({ ...blank, ...row, id: row._id })} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => remove(row)} showInMenu />
      ]
    }
  ];

  return (
    <MenuPageShell title="Salary Structure">
      <Box sx={{ p: 3 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Create / Edit Salary Structure</Typography>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} md={field === "description" || field === "comments" ? 6 : 3} key={field}>
                <TextField
                  fullWidth
                  select={field === "status1"}
                  label={labels[field]}
                  value={form[field]}
                  onChange={(e) => updateForm(field, e.target.value)}
                  multiline={field === "description" || field === "comments"}
                  minRows={field === "description" || field === "comments" ? 2 : undefined}
                >
                  {field === "status1" && ["Active", "Inactive"].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={loading}>Save</Button>
            <Button variant="outlined" onClick={() => setForm(blank)}>Clear</Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadTemplate}>Download template</Button>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
              Bulk upload
              <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} />
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Dynamic filters</Typography>
          <Grid container spacing={2}>
            {["struture", "designation", "businessrole", "paycommission", "type", "level", "status1"].map((field) => (
              <Grid item xs={12} sm={6} md={3} key={field}>
                <TextField
                  select
                  fullWidth
                  label={labels[field]}
                  value={filters[field] || ""}
                  onChange={(e) => setFilters((old) => ({ ...old, [field]: e.target.value }))}
                >
                  <MenuItem value="">All</MenuItem>
                  {uniqueValues(rows, field).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: 1, height: 620 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
