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
import ep1 from "../api/ep1";
import global1 from "./global1";
import { amountInWords } from "./feesReceiptUtils";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "programcode", label: "Program" },
  { field: "regulation", label: "Regulation" },
  { field: "student", label: "Student" },
  { field: "regno", label: "Reg No" },
  { field: "major", label: "Major" },
  { field: "minor", label: "Minor" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" },
  { field: "feebook", label: "Fee Book" },
  { field: "cashbook", label: "Cash Book" },
  { field: "semester", label: "Semester" },
  { field: "feecategory", label: "Fee Category" },
  { field: "status", label: "Status" }
];

const emptyFilter = { field: "", value: "" };

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function money(value) {
  return toNumber(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function uniqueValues(rows, field, options) {
  const values = options?.[field]?.length
    ? options[field]
    : Array.from(new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean)));
  return values.sort((a, b) => a.localeCompare(b));
}

export default function StudentFeesReceiptPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [selectedRegno, setSelectedRegno] = useState("");
  const [selection, setSelection] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [receiptNote, setReceiptNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildParams = () => {
    const params = { colid: global1.colid };
    filters.forEach((filter) => {
      if (filter.field && filter.value) params[filter.field] = filter.value;
    });
    if (selectedRegno) params.regno = selectedRegno;
    return params;
  };

  const loadInstitution = async () => {
    try {
      const [insRes, noteRes] = await Promise.all([
        ep1.get("/vins", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/fees-receipt-note/active", { params: { colid: global1.colid } })
      ]);
      setInstitution(insRes.data || null);
      setReceiptNote(noteRes.data.data || null);
    } catch (err) {
      setInstitution(null);
      setReceiptNote(null);
    }
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/studentfeesreceipt", { params: buildParams() });
      const data = (res.data.data || []).map((row) => ({ ...row, id: row._id }));
      setRows(data);
      setStudents(res.data.students || []);
      setOptions(res.data.options || {});
      setSelection([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load receipt fee items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadRows();
  }, []);

  const visibleRows = useMemo(() => {
    if (!selectedRegno) return rows;
    return rows.filter((row) => row.regno === selectedRegno);
  }, [rows, selectedRegno]);

  const selectedRows = useMemo(() => visibleRows.filter((row) => selection.includes(row._id)), [visibleRows, selection]);

  const selectedStudent = useMemo(() => {
    const firstRow = selectedRows[0] || visibleRows[0] || {};
    const user = firstRow.userdetails || {};
    const fromList = selectedRegno ? students.find((student) => student.regno === selectedRegno) : null;
    return {
      name: user.name || fromList?.student || firstRow.student || "",
      regno: user.regno || fromList?.regno || firstRow.regno || "",
      programcode: user.programcode || fromList?.programcode || firstRow.programcode || "",
      academicyear: firstRow.academicyear || user.admissionyear || fromList?.academicyear || "",
      regulation: user.regulation || firstRow.regulation || fromList?.regulation || "",
      major: user.Major || firstRow.major || fromList?.major || "",
      minor: user.Minor || firstRow.minor || fromList?.minor || "",
      email: user.email || fromList?.email || "",
      phone: user.phone || fromList?.phone || "",
      address: user.address || fromList?.address || "",
      semester: user.semester || firstRow.semester || "",
      section: user.section || ""
    };
  }, [selectedRows, visibleRows, selectedRegno, students]);

  const totals = selectedRows.reduce((sum, row) => ({
    amount: sum.amount + toNumber(row.amount),
    paid: sum.paid + toNumber(row.paid),
    concession: sum.concession + toNumber(row.concession),
    balance: sum.balance + toNumber(row.balance)
  }), { amount: 0, paid: 0, concession: 0, balance: 0 });

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

  const printReceipt = () => window.print();

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "programcode", headerName: "Program", width: 130 },
    { field: "regulation", headerName: "Regulation", width: 150 },
    { field: "major", headerName: "Major", width: 150 },
    { field: "minor", headerName: "Minor", width: 150 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 190 },
    { field: "feebook", headerName: "Fee Book", width: 140 },
    { field: "cashbook", headerName: "Cash Book", width: 140 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "paid", headerName: "Paid", width: 110, type: "number" },
    { field: "concession", headerName: "Concession", width: 130, type: "number" },
    { field: "balance", headerName: "Balance", width: 120, type: "number" },
    {
      field: "paiddate",
      headerName: "Paid Date",
      width: 130,
      valueGetter: (params) => params.row.paiddate ? String(params.row.paiddate).slice(0, 10) : ""
    },
    { field: "status", headerName: "Status", width: 130 }
  ];

  return (
    <Box p={3}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            html, body { width: 210mm; background: white; }
            body * { visibility: hidden; }
            #fees-receipt-print, #fees-receipt-print * { visibility: visible; }
            #fees-receipt-print { position: absolute; left: 0; top: 0; width: 190mm; min-height: 277mm; background: white; border: 0 !important; box-shadow: none !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Fees Receipt</Typography>
          <Typography variant="body2" color="text.secondary">Select student and fee items to generate printable receipt</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={printReceipt} disabled={!selectedRows.length}>Print Receipt</Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        </Stack>
      </Stack>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper className="no-print" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterListIcon color="primary" />
            <Typography variant="h6">Dynamic Filters</Typography>
            <Chip size="small" label={`${visibleRows.length} items`} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadRows}>Load</Button>
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
              <FormControl size="small" sx={{ minWidth: 280 }} disabled={!filter.field}>
                <InputLabel>Value</InputLabel>
                <Select label="Value" value={filter.value} onChange={(event) => updateFilter(index, "value", event.target.value)}>
                  {uniqueValues(rows, filter.field, options).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
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
        <FormControl fullWidth>
          <InputLabel>Student</InputLabel>
          <Select label="Student" value={selectedRegno} onChange={(event) => { setSelectedRegno(event.target.value); setSelection([]); }}>
            <MenuItem value="">All Students</MenuItem>
            {students.map((student) => (
              <MenuItem key={student.regno || student.student} value={student.regno}>
                {student.student} - {student.regno} - {student.programcode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Stack className="no-print" direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Chip label={`Selected Items: ${selection.length}`} />
        <Chip label={`Amount: ${money(totals.amount)}`} />
        <Chip label={`Paid: ${money(totals.paid)}`} color="success" />
        <Chip label={`Concession: ${money(totals.concession)}`} color={totals.concession > 0 ? "warning" : "default"} />
        <Chip label={`Balance: ${money(totals.balance)}`} color="primary" />
      </Stack>

      <Paper className="no-print" sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={visibleRows}
          columns={columns}
          loading={loading}
          checkboxSelection
          rowSelectionModel={selection}
          onRowSelectionModelChange={(ids) => setSelection(ids)}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "fees_receipt_items" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          sx={{ minWidth: 2100 }}
        />
      </Paper>

      <Box id="fees-receipt-print" sx={{ bgcolor: "white", p: 3, border: "1px solid #ddd", maxWidth: "210mm", mx: "auto", color: "#111827", "@media print": { p: 0 } }}>
        <Stack alignItems="center" spacing={0.5} sx={{ mb: 1.5, textAlign: "center" }}>
          {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 70, height: 70, objectFit: "contain" }} />}
          <Typography variant="h6" fontWeight={800}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
          <Typography variant="body2" sx={{ maxWidth: 680 }}>{institution?.address || ""}</Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.75 }}>Fees Receipt</Typography>
        </Stack>

        <Grid container spacing={1} sx={{ mb: 1.5, borderTop: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", py: 1 }}>
          <Grid item xs={12} sm={5}><Typography variant="body2"><b>Student:</b> {selectedStudent.name}</Typography></Grid>
          <Grid item xs={6} sm={3}><Typography variant="body2"><b>Reg No:</b> {selectedStudent.regno}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant="body2"><b>Program:</b> {selectedStudent.programcode}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant="body2"><b>Academic Year:</b> {selectedStudent.academicyear}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant="body2"><b>Regulation:</b> {selectedStudent.regulation}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant="body2"><b>Major:</b> {selectedStudent.major}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant="body2"><b>Minor:</b> {selectedStudent.minor}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant="body2"><b>Email:</b> {selectedStudent.email}</Typography></Grid>
          <Grid item xs={6} sm={4}><Typography variant="body2"><b>Phone:</b> {selectedStudent.phone}</Typography></Grid>
          <Grid item xs={12}><Typography variant="body2"><b>Address:</b> {selectedStudent.address}</Typography></Grid>
        </Grid>

        <Grid container sx={{ border: "1px solid #cbd5e1", borderBottom: 0, fontSize: 12 }}>
          {["Fee Group", "Fee Item", "Paid", "Pay Mode", "Pay Details", "Pay Date"].map((head, index) => (
            <Grid item xs={index === 0 ? 2.2 : index === 1 ? 2.6 : index === 4 ? 2.2 : 1.666} key={head} sx={{ bgcolor: "#eef3f7", borderRight: index === 5 ? 0 : "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, fontWeight: 800, textAlign: index === 2 ? "right" : "left" }}>
              {head}
            </Grid>
          ))}
          {selectedRows.map((row) => (
            <React.Fragment key={row._id}>
              <Grid item xs={2.2} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{row.feegroup}</Grid>
              <Grid item xs={2.6} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{row.feeitem}</Grid>
              <Grid item xs={1.666} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right" }}>{money(row.paid)}</Grid>
              <Grid item xs={1.666} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{row.paymode || ""}</Grid>
              <Grid item xs={2.2} sx={{ borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{row.paydetails || ""}</Grid>
              <Grid item xs={1.666} sx={{ borderBottom: "1px solid #cbd5e1", p: 0.75 }}>{row.paiddate ? String(row.paiddate).slice(0, 10) : ""}</Grid>
            </React.Fragment>
          ))}
          <Grid item xs={4.8} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, fontWeight: 800 }}>Total</Grid>
          <Grid item xs={1.666} sx={{ bgcolor: "#eef3f7", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", p: 0.75, textAlign: "right", fontWeight: 800 }}>{money(totals.paid)}</Grid>
          <Grid item xs={5.534} sx={{ bgcolor: "#eef3f7", borderBottom: "1px solid #cbd5e1", p: 0.75 }} />
        </Grid>
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 800 }}>Amount in Words: {amountInWords(totals.paid)}</Typography>
        {receiptNote?.note && (
          <Box sx={{ mt: 1.5, border: "1px solid #cbd5e1", p: 1, borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={800}>Note</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{receiptNote.note}</Typography>
          </Box>
        )}

        <Grid container spacing={6} sx={{ mt: 7 }}>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 700 }}>Checked by</Box></Grid>
          <Grid item xs={6}><Box sx={{ borderTop: "1px solid #111827", pt: 1, textAlign: "center", fontWeight: 700 }}>Approved by</Box></Grid>
        </Grid>
      </Box>
    </Box>
  );
}
