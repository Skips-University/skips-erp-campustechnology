import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "programcode", label: "Program" },
  { field: "regno", label: "Reg No" },
  { field: "student", label: "Student" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" },
  { field: "feebook", label: "Fee Book" },
  { field: "cashbook", label: "Cash Book" },
  { field: "status", label: "Status" },
  { field: "regulation", label: "Regulation" },
  { field: "major", label: "Major" },
  { field: "minor", label: "Minor" },
  { field: "semester", label: "Semester" }
];

const emptyFilter = { field: "", value: "" };

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function uniqueValues(rows, field) {
  return Array.from(new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
}

function groupSummary(rows, field) {
  const map = new Map();
  rows.forEach((row) => {
    const key = row[field] || "Not specified";
    const item = map.get(key) || { id: key, label: key, count: 0, amount: 0, concession: 0, paid: 0, balance: 0 };
    item.count += 1;
    item.amount += toNumber(row.amount);
    item.concession += toNumber(row.concession);
    item.paid += toNumber(row.paid);
    item.balance += toNumber(row.balance);
    map.set(key, item);
  });
  return Array.from(map.values());
}

export default function StudentLedgerAdjustmentPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedRegno, setSelectedRegno] = useState("");
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [drafts, setDrafts] = useState({});
  const [remarks, setRemarks] = useState("");
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const buildParams = () => {
    const params = { colid: global1.colid };
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    return params;
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/studentledgeradjust", { params: buildParams() });
      const data = (res.data?.data || []).map((row) => ({ ...row, id: row._id }));
      setRows(data);
      setStudents(res.data?.students || []);
      setDrafts(Object.fromEntries(data.map((row) => [row._id, toNumber(row.concession)])));
      if (selectedRegno && !data.some((row) => row.regno === selectedRegno)) setSelectedRegno("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadRows();
  }, []);

  const selectedRows = useMemo(() => {
    if (!selectedRegno) return rows;
    return rows.filter((row) => row.regno === selectedRegno);
  }, [rows, selectedRegno]);

  const selectedStudent = useMemo(() => {
    const firstRow = selectedRows[0] || {};
    const studentFromList = selectedRegno ? students.find((student) => student.regno === selectedRegno) : null;
    return {
      student: studentFromList?.student || firstRow.student || "",
      regno: studentFromList?.regno || firstRow.regno || "",
      programcode: studentFromList?.programcode || firstRow.programcode || firstRow.program || "",
      academicyear: studentFromList?.academicyear || firstRow.academicyear || firstRow.admissionyear || ""
    };
  }, [students, selectedRegno, selectedRows]);

  const printAcademicYear = useMemo(() => {
    const years = Array.from(new Set(selectedRows.map((row) => row.academicyear || row.admissionyear).filter(Boolean)));
    return years.length === 1 ? years[0] : years.join(", ");
  }, [selectedRows]);

  const totals = useMemo(() => selectedRows.reduce((sum, row) => ({
    amount: sum.amount + toNumber(row.amount),
    concession: sum.concession + toNumber(row.concession),
    paid: sum.paid + toNumber(row.paid),
    balance: sum.balance + toNumber(row.balance)
  }), { amount: 0, concession: 0, paid: 0, balance: 0 }), [selectedRows]);

  const feeItemSummary = useMemo(() => groupSummary(selectedRows, "feeitem"), [selectedRows]);
  const feeGroupSummary = useMemo(() => groupSummary(selectedRows, "feegroup"), [selectedRows]);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) } : item
    )));
  };

  const addFilter = () => setFilters((prev) => [...prev, { ...emptyFilter }]);

  const removeFilter = (index) => {
    setFilters((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [{ ...emptyFilter }];
    });
  };

  const clearFilters = () => {
    setFilters([{ ...emptyFilter }]);
    setSelectedRegno("");
    setTimeout(loadRows, 0);
  };

  const updateDraft = (id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: Math.max(0, toNumber(value)) }));
  };

  const saveConcession = async (row) => {
    try {
      const concession = Math.max(0, toNumber(drafts[row._id]));
      const res = await ep1.post("/api/v2/studentledgeradjust/concession", {
        id: row._id,
        colid: global1.colid,
        concession,
        user: global1.user,
        remarks
      });
      const updated = { ...res.data.data, id: res.data.data._id };
      setRows((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setDrafts((prev) => ({ ...prev, [updated._id]: toNumber(updated.concession) }));
      setMessage("Concession updated and sent for approval");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update concession");
    }
  };

  const printLedger = () => window.print();

  const summaryColumns = [
    { field: "label", headerName: "Particular", flex: 1, minWidth: 220 },
    { field: "count", headerName: "Count", width: 100, type: "number" },
    { field: "amount", headerName: "Amount", width: 130, type: "number" },
    { field: "concession", headerName: "Concession", width: 130, type: "number" },
    { field: "paid", headerName: "Paid", width: 120, type: "number" },
    { field: "balance", headerName: "Balance", width: 130, type: "number" }
  ];

  const ledgerColumns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "programcode", headerName: "Program", width: 130 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 190 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "paid", headerName: "Paid", width: 110, type: "number" },
    {
      field: "concessionedit",
      headerName: "Concession",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={drafts[params.row._id] ?? 0}
          onChange={(event) => updateDraft(params.row._id, event.target.value)}
          inputProps={{ min: 0 }}
        />
      )
    },
    {
      field: "draftbalance",
      headerName: "New Balance",
      width: 130,
      type: "number",
      valueGetter: (params) => Math.max(0, toNumber(params.row.amount) - toNumber(params.row.paid) - toNumber(drafts[params.row._id]))
    },
    { field: "status", headerName: "Status", width: 150 },
    {
      field: "actions",
      headerName: "Save",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={() => saveConcession(params.row)}>
          Save
        </Button>
      )
    }
  ];

  return (
    <Box p={3}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            html, body { width: 210mm; background: white; }
            body * { visibility: hidden; }
            #student-ledger-print, #student-ledger-print * { visibility: visible; }
            #student-ledger-print { position: absolute; left: 0; top: 0; width: 190mm; min-height: 277mm; padding: 0; background: white; border: 0 !important; box-shadow: none !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Student Ledger Adjustment</Typography>
          <Typography variant="body2" color="text.secondary">Adjust concession and send changed ledger entries for approval</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={printLedger} disabled={!selectedRows.length}>Print Ledger</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Stack>

      {message && <Alert className="no-print" severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterListIcon color="primary" />
            <Typography variant="h6">Dynamic Filters</Typography>
            <Chip size="small" label={`${rows.length} loaded`} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadRows}>Load</Button>
            <Button variant="text" onClick={clearFilters}>Clear</Button>
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          {filters.map((filter, index) => (
            <Stack key={`${index}-${filter.field}`} direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Filter By</InputLabel>
                <Select label="Filter By" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                  {filterFields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 260 }} disabled={!filter.field}>
                <InputLabel>Value</InputLabel>
                <Select label="Value" value={filter.value} onChange={(event) => updateFilter(index, "value", event.target.value)}>
                  {uniqueValues(rows, filter.field).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </Select>
              </FormControl>
              <Tooltip title="Remove filter">
                <span>
                  <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1 && !filter.field && !filter.value}>
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Student</InputLabel>
            <Select label="Student" value={selectedRegno} onChange={(event) => setSelectedRegno(event.target.value)}>
              <MenuItem value="">All Students</MenuItem>
              {students.map((student) => (
                <MenuItem key={student.regno || student.student} value={student.regno}>
                  {student.student} - {student.regno} - {student.programcode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Remarks for approval" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
        </Stack>
      </Paper>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Chip label={`Amount: ${totals.amount}`} />
        <Chip label={`Concession: ${totals.concession}`} color={totals.concession > 0 ? "warning" : "default"} />
        <Chip label={`Paid: ${totals.paid}`} color="success" />
        <Chip label={`Balance: ${totals.balance}`} color="primary" />
      </Stack>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={selectedRows}
          columns={ledgerColumns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_ledger_adjustment" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          sx={{ minWidth: 1650 }}
        />
      </Paper>

      <Stack className="no-print" direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Paper sx={{ p: 1, flex: 1 }}>
          <Typography variant="h6" sx={{ p: 1 }}>Fee Item Summary</Typography>
          <DataGrid rows={feeItemSummary} columns={summaryColumns} autoHeight hideFooter slots={{ toolbar: GridToolbar }} />
        </Paper>
        <Paper sx={{ p: 1, flex: 1 }}>
          <Typography variant="h6" sx={{ p: 1 }}>Fee Group Summary</Typography>
          <DataGrid rows={feeGroupSummary} columns={summaryColumns} autoHeight hideFooter slots={{ toolbar: GridToolbar }} />
        </Paper>
      </Stack>

      <Box
        id="student-ledger-print"
        sx={{
          bgcolor: "white",
          p: 3,
          border: "1px solid #ddd",
          maxWidth: "210mm",
          mx: "auto",
          color: "#111827",
          "@media print": { p: 0 }
        }}
      >
        <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={800}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2" sx={{ maxWidth: 680 }}>{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1 }}>Student Ledger</Typography>
          <Typography variant="body2"><b>Academic Year:</b> {printAcademicYear}</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 1.5, borderTop: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", py: 1 }}>
          <Grid item xs={12} sm={5}><Typography variant="body2"><b>Student:</b> {selectedStudent.student || "All Students"}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2"><b>Reg No:</b> {selectedStudent.regno}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant="body2"><b>Program:</b> {selectedStudent.programcode}</Typography></Grid>
        </Grid>

        <Grid container sx={{ border: "1px solid #cbd5e1", borderBottom: 0, fontSize: 12 }}>
          {["Fee Group", "Fee Item", "Amount", "Paid", "Concession", "Balance"].map((head, index) => (
            <Grid
              item
              xs={index === 1 ? 3 : index === 0 ? 2.5 : 1.625}
              key={head}
              sx={{ bgcolor: "#eef3f7", borderRight: index === 5 ? 0 : "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, fontWeight: 800, textAlign: index < 2 ? "left" : "right" }}
            >
              {head}
            </Grid>
          ))}
          {selectedRows.map((row) => (
            <React.Fragment key={row._id}>
              <Grid item xs={2.5} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{row.feegroup}</Grid>
              <Grid item xs={3} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{row.feeitem}</Grid>
              <Grid item xs={1.625} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{toNumber(row.amount)}</Grid>
              <Grid item xs={1.625} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{toNumber(row.paid)}</Grid>
              <Grid item xs={1.625} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{toNumber(row.concession)}</Grid>
              <Grid item xs={1.625} sx={{ borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{toNumber(row.balance)}</Grid>
            </React.Fragment>
          ))}
          <Grid item xs={5.5} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, fontWeight: 800 }}>Total</Grid>
          <Grid item xs={1.625} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{totals.amount}</Grid>
          <Grid item xs={1.625} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{totals.paid}</Grid>
          <Grid item xs={1.625} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{totals.concession}</Grid>
          <Grid item xs={1.625} sx={{ bgcolor: "#eef3f7", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{totals.balance}</Grid>
        </Grid>

        <Grid container spacing={6} sx={{ mt: 7 }}>
          <Grid item xs={6}>
            <Box sx={{ borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 700 }}>Checked by</Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 700 }}>Approved by</Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
