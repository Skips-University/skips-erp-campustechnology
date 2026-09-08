import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
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
import ep1 from "../api/ep1";
import global1 from "./global1";

const filterFields = [
  { field: "academicyear", label: "Year" },
  { field: "student", label: "Student" },
  { field: "regno", label: "Reg No" },
  { field: "programcode", label: "Program Code" },
  { field: "regulation", label: "Regulation" },
  { field: "major", label: "Major" },
  { field: "minor", label: "Minor" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" },
  { field: "feebook", label: "Fee Book" },
  { field: "cashbook", label: "Cash Book" },
  { field: "status", label: "Status" }
];

const emptyFilter = { field: "", value: "" };

function uniqueValues(rows, field) {
  return Array.from(new Set(rows.map((row) => String(row[field] || "").trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
}

export default function StudentLedgerApprovalPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const role = useMemo(() => String(global1.role || "").trim(), []);

  const loadRows = async () => {
    try {
      setError("");
      const res = await ep1.get("/api/v2/studentledgerapproval", {
        params: { colid: global1.colid, role }
      });
      setRows(res.data?.data || []);
      if (res.data?.message) setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student ledger approvals");
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const canApprove = (status) => status === "Added" || status === `${role}_PENDING`;

  const filteredRows = useMemo(() => {
    const activeFilters = filters.filter((item) => item.field && item.value);
    if (!activeFilters.length) return rows;

    return rows.filter((row) =>
      activeFilters.every((item) => String(row[item.field] || "") === String(item.value))
    );
  }, [rows, filters]);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, [key]: value, ...(key === "field" ? { value: "" } : {}) }
        : item
    )));
  };

  const addFilter = () => {
    setFilters((prev) => [...prev, { ...emptyFilter }]);
  };

  const removeFilter = (index) => {
    setFilters((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [{ ...emptyFilter }];
    });
  };

  const clearFilters = () => {
    setFilters([{ ...emptyFilter }]);
  };

  const approve = async (row) => {
    try {
      await ep1.post("/api/v2/studentledgerapproval/approve", {
        id: row._id,
        role,
        user: global1.user,
        remarks
      });
      setMessage("Student ledger entry approved");
      setRemarks("");
      setSelectedLedger(null);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to approve student ledger entry");
    }
  };

  const reject = async (row) => {
    if (!window.confirm("Reject this student ledger entry?")) return;
    try {
      await ep1.post("/api/v2/studentledgerapproval/reject", {
        id: row._id,
        role,
        user: global1.user,
        remarks
      });
      setMessage("Student ledger entry rejected");
      setRemarks("");
      setSelectedLedger(null);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reject student ledger entry");
    }
  };

  const statusColor = (status) => {
    if (status === "Active") return "success";
    if (status === "Rejected") return "error";
    if (String(status || "").includes("PENDING") || status === "Added") return "warning";
    return "default";
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "student", headerName: "Student", width: 220 },
    { field: "regno", headerName: "Reg No", width: 140 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "regulation", headerName: "Regulation", width: 160 },
    { field: "major", headerName: "Major", width: 170 },
    { field: "minor", headerName: "Minor", width: 170 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "feegroup", headerName: "Fee Group", width: 160 },
    { field: "feeitem", headerName: "Fee Item", width: 190 },
    { field: "feebook", headerName: "Fee Book", width: 150 },
    { field: "cashbook", headerName: "Cash Book", width: 150 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "concession", headerName: "Concession", width: 130, type: "number" },
    { field: "balance", headerName: "Balance", width: 120, type: "number" },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => <Chip size="small" label={params.value} color={statusColor(params.value)} />
    },
    {
      field: "action",
      headerName: "Action",
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" disabled={!canApprove(params.row.status)} onClick={() => approve(params.row)}>
            Approve
          </Button>
          <Button size="small" color="error" variant="outlined" disabled={!canApprove(params.row.status)} onClick={() => reject(params.row)}>
            Reject
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Box p={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5">Student Ledger Approval</Typography>
          <Typography variant="body2" color="text.secondary">Current role: {role || "Not set"}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>
          Back
        </Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Approval remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          multiline
          minRows={2}
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterListIcon color="primary" />
            <Typography variant="h6">Dynamic Filters</Typography>
            <Chip size="small" label={`${filteredRows.length} shown`} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addFilter}>Add Filter</Button>
            <Button variant="text" onClick={clearFilters}>Clear</Button>
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          {filters.map((filter, index) => (
            <Stack key={`${index}-${filter.field}`} direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Filter By</InputLabel>
                <Select
                  label="Filter By"
                  value={filter.field}
                  onChange={(event) => updateFilter(index, "field", event.target.value)}
                >
                  {filterFields.map((item) => (
                    <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 260 }} disabled={!filter.field}>
                <InputLabel>Value</InputLabel>
                <Select
                  label="Value"
                  value={filter.value}
                  onChange={(event) => updateFilter(index, "value", event.target.value)}
                >
                  {uniqueValues(rows, filter.field).map((value) => (
                    <MenuItem key={value} value={value}>{value}</MenuItem>
                  ))}
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

      <Paper sx={{ p: 1, mb: 2, overflowX: "auto" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row._id}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "student_ledger_approval" } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
            sorting: { sortModel: [{ field: "academicyear", sort: "desc" }] }
          }}
          onRowClick={(params) => setSelectedLedger(params.row)}
          sx={{ minWidth: 2500 }}
        />
      </Paper>

      {selectedLedger && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Ledger Details</Typography>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} flexWrap="wrap">
            <Typography><b>Student:</b> {selectedLedger.student}</Typography>
            <Typography><b>Reg No:</b> {selectedLedger.regno}</Typography>
            <Typography><b>Fee Category:</b> {selectedLedger.feecategory}</Typography>
            <Typography><b>Due Date:</b> {selectedLedger.duedate ? String(selectedLedger.duedate).slice(0, 10) : ""}</Typography>
            <Typography><b>Comments:</b> {selectedLedger.comments}</Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
