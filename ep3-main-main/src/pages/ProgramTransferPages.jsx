import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Print, Refresh, Save, Visibility } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const shortDate = (value) => (value ? String(value).slice(0, 10) : "");
const optionLabel = (field) => ({
  academicyear: "Academic Year",
  regulation: "Regulation",
  program: "Program",
  programcode: "Program Code",
  major: "Major",
  minor: "Minor",
  IDC: "IDC",
  SEC: "SEC",
  VAC: "VAC",
  semester: "Semester",
  section: "Section",
  name: "Name",
  email: "Email",
  phone: "Phone",
  regno: "Reg No"
}[field] || field);

const studentFields = ["academicyear", "regulation", "program", "programcode", "semester", "section", "Major", "Minor", "IDC", "SEC", "VAC", "name", "email", "phone", "regno"];
const transferFields = ["academicyear", "regulation", "program", "programcode", "major", "minor", "IDC", "SEC", "VAC", "semester", "section"];

function makeFilter() {
  return { id: `${Date.now()}-${Math.random()}`, field: "academicyear", value: [] };
}

function selectionToArray(model) {
  return Array.isArray(model) ? model : model?.ids ? Array.from(model.ids) : [];
}

function FilterPanel({ fields, options, filters, setFilters, onApply }) {
  const add = () => setFilters((prev) => [...prev, makeFilter()]);
  const remove = (id) => setFilters((prev) => prev.length > 1 ? prev.filter((row) => row.id !== id) : [makeFilter()]);
  const update = (id, patch) => setFilters((prev) => prev.map((row) => row.id === id ? { ...row, ...patch, ...(patch.field ? { value: [] } : {}) } : row));
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography fontWeight={900}>Dynamic Filters</Typography>
        <Button onClick={add}>Add Filter</Button>
      </Stack>
      <Grid container spacing={1.5}>
        {filters.map((filter) => {
          const values = options[filter.field] || [];
          return (
            <React.Fragment key={filter.id}>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth size="small" label="Field" value={filter.field} onChange={(e) => update(filter.id, { field: e.target.value })}>
                  {fields.map((field) => <MenuItem key={field} value={field}>{optionLabel(field)}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                {values.length ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => selected.join(", ")
                    }}
                    label={optionLabel(filter.field)}
                    value={Array.isArray(filter.value) ? filter.value : []}
                    onChange={(e) => update(filter.id, { value: typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value })}
                  >
                    {values.map((value) => (
                      <MenuItem key={value} value={value}>
                        <Checkbox checked={(filter.value || []).includes(value)} />
                        <ListItemText primary={value} />
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField fullWidth size="small" label={optionLabel(filter.field)} value={Array.isArray(filter.value) ? filter.value.join(", ") : filter.value || ""} onChange={(e) => update(filter.id, { value: [e.target.value] })} />
                )}
              </Grid>
              <Grid item xs={12} md={1}><Button color="error" onClick={() => remove(filter.id)}>Remove</Button></Grid>
            </React.Fragment>
          );
        })}
      </Grid>
      <Button sx={{ mt: 2 }} variant="contained" startIcon={<Refresh />} onClick={onApply}>Apply</Button>
    </Paper>
  );
}

function cleanFilters(filters) {
  const list = [];
  filters.forEach((filter) => {
    (Array.isArray(filter.value) ? filter.value : [filter.value]).filter(Boolean).forEach((value) => list.push({ field: filter.field, value }));
  });
  return list;
}

export function ProgramTransferPage() {
  const [studentOptions, setStudentOptions] = useState({});
  const [transferOptions, setTransferOptions] = useState({});
  const [filters, setFilters] = useState([makeFilter()]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [target, setTarget] = useState({});
  const [fees, setFees] = useState([]);
  const [selectedFeeIds, setSelectedFeeIds] = useState([]);
  const [refund, setRefund] = useState({ administrativecharges: 0, refundamount: 0, refundmode: "", refundrefno: "", refunddate: shortDate(new Date()) });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const oldPaid = useMemo(() => ledger.reduce((sum, row) => sum + Number(row.paid || 0), 0), [ledger]);
  const selectedFees = useMemo(() => fees.filter((row) => selectedFeeIds.includes(row._id)), [fees, selectedFeeIds]);
  const newFeeTotal = useMemo(() => selectedFees.reduce((sum, row) => sum + Number(row.amount || 0), 0), [selectedFees]);
  const allocatedTotal = useMemo(() => selectedFees.reduce((sum, row) => sum + Number(row.allocatedpaid || 0), 0), [selectedFees]);
  const excess = Math.max(0, oldPaid - allocatedTotal);
  const refundable = Math.max(0, excess - Number(refund.administrativecharges || 0));

  const loadOptions = async () => {
    const res = await ep1.get("/api/v2/programtransfer/options", { params: { colid: global1.colid } });
    setStudentOptions(res.data?.studentOptions || {});
    setTransferOptions(res.data?.transferOptions || {});
  };
  useEffect(() => { loadOptions(); }, []);

  const searchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/programtransfer/students", { colid: global1.colid, filters: cleanFilters(filters) });
      setStudents(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setTarget({
      academicyear: student.academicyear || "",
      regulation: student.regulation || "",
      program: student.program || "",
      programcode: student.programcode || "",
      major: student.Major || "",
      minor: student.Minor || "",
      IDC: student.IDC || "",
      SEC: student.SEC || "",
      VAC: student.VAC || "",
      semester: student.semester || "",
      section: student.section || ""
    });
    const res = await ep1.get("/api/v2/programtransfer/student-ledger", { params: { colid: global1.colid, studentid: student._id } });
    setLedger(res.data?.data || []);
    setFees([]);
    setSelectedFeeIds([]);
  };

  const loadFees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.post("/api/v2/programtransfer/fee-template", { colid: global1.colid, ...target });
      setFees((res.data?.data || []).map((row) => ({ ...row, allocatedpaid: 0 })));
      setSelectedFeeIds([]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fees template");
    } finally {
      setLoading(false);
    }
  };

  const autoAllocate = () => {
    let credit = oldPaid;
    setFees((prev) => prev.map((row) => {
      if (!selectedFeeIds.includes(row._id)) return { ...row, allocatedpaid: 0 };
      const paid = Math.min(Number(row.amount || 0), credit);
      credit -= paid;
      return { ...row, allocatedpaid: paid };
    }));
  };

  const updateFee = (id, value) => {
    setFees((prev) => prev.map((row) => row._id === id ? { ...row, allocatedpaid: Math.max(0, Number(value || 0)) } : row));
  };

  const execute = async () => {
    setLoading(true);
    setError("");
    try {
      if (!selectedStudent) throw new Error("Select a student first");
      if (!selectedFeeIds.length) throw new Error("Select new fee template rows");
      if (allocatedTotal > oldPaid) throw new Error("Allocated credit cannot be more than old paid amount");
      if (Number(refund.refundamount || 0) > refundable) throw new Error("Refund cannot exceed excess credit after administrative charges");
      const payloadFees = selectedFees.map((row) => ({ feeid: row._id, allocatedpaid: Number(row.allocatedpaid || 0) }));
      const res = await ep1.post("/api/v2/programtransfer/execute", {
        colid: global1.colid,
        user: global1.user,
        studentid: selectedStudent._id,
        ...target,
        fees: payloadFees,
        ...refund
      });
      setMessage(res.data?.message || "Program transfer completed");
      await selectStudent(selectedStudent);
      await searchStudents();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to complete program transfer");
    } finally {
      setLoading(false);
    }
  };

  const studentColumns = [
    { field: "name", headerName: "Student", minWidth: 190, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
    { field: "regulation", headerName: "Regulation", minWidth: 130 },
    { field: "programcode", headerName: "Program", minWidth: 120 },
    { field: "Major", headerName: "Major", minWidth: 140 },
    { field: "semester", headerName: "Semester", minWidth: 100 },
    { field: "section", headerName: "Section", minWidth: 100 },
    { field: "select", headerName: "Select", width: 100, renderCell: (p) => <Button size="small" onClick={() => selectStudent(p.row)}>Select</Button> }
  ];
  const ledgerColumns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "programcode", headerName: "Program", width: 120 },
    { field: "feegroup", headerName: "Fee Group", width: 150 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "amount", headerName: "Amount", width: 110, valueFormatter: (p) => currency(p.value) },
    { field: "paid", headerName: "Paid", width: 110, valueFormatter: (p) => currency(p.value) },
    { field: "balance", headerName: "Balance", width: 110, valueFormatter: (p) => currency(p.value) },
    { field: "status", headerName: "Status", width: 150 }
  ];
  const feeColumns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "programcode", headerName: "Program", width: 120 },
    { field: "semester", headerName: "Sem", width: 90 },
    { field: "feegroup", headerName: "Fee Group", width: 150 },
    { field: "feeeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "amount", headerName: "Amount", width: 120, valueFormatter: (p) => currency(p.value) },
    {
      field: "allocatedpaid",
      headerName: "Allocate Credit",
      width: 160,
      renderCell: (p) => <TextField size="small" type="number" value={p.row.allocatedpaid || 0} onChange={(e) => updateFee(p.row._id, e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
    },
    { field: "balance", headerName: "New Balance", width: 130, valueGetter: (p) => Math.max(0, Number(p.row.amount || 0) - Number(p.row.allocatedpaid || 0)), valueFormatter: (p) => currency(p.value) }
  ];

  return (
    <MenuPageShell title="Program Transfer">
      <Stack spacing={2}>
        {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
        <FilterPanel fields={studentFields} options={studentOptions} filters={filters} setFilters={setFilters} onApply={searchStudents} />
        <Box sx={{ height: 420 }}><DataGrid rows={students} columns={studentColumns} getRowId={(row) => row._id} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>

        {selectedStudent && (
          <>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={900}>{selectedStudent.name} | {selectedStudent.regno}</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {transferFields.map((field) => (
                  <Grid item xs={12} md={3} key={field}>
                    <Autocomplete
                      freeSolo
                      size="small"
                      options={transferOptions[field] || []}
                      value={target[field] || ""}
                      onInputChange={(_, value) => setTarget((prev) => ({ ...prev, [field]: value || "" }))}
                      onChange={(_, value) => setTarget((prev) => ({ ...prev, [field]: value || "" }))}
                      renderInput={(params) => <TextField {...params} label={optionLabel(field)} />}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}><Button variant="contained" onClick={loadFees} disabled={loading}>Load New Fee Template</Button></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip label={`Old Paid Credit: ${currency(oldPaid)}`} color="primary" />
                <Chip label={`New Fees: ${currency(newFeeTotal)}`} />
                <Chip label={`Allocated: ${currency(allocatedTotal)}`} color={allocatedTotal <= oldPaid ? "success" : "error"} />
                <Chip label={`Excess Credit: ${currency(excess)}`} color="warning" />
              </Stack>
              <Typography fontWeight={900}>Old Ledger</Typography>
              <Box sx={{ height: 300, mb: 2 }}><DataGrid rows={ledger} columns={ledgerColumns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}><Typography fontWeight={900}>New Fee Template</Typography><Button size="small" onClick={autoAllocate} disabled={!selectedFeeIds.length}>Auto allocate credit</Button></Stack>
              <Box sx={{ height: 360 }}><DataGrid rows={fees} columns={feeColumns} getRowId={(row) => row._id} checkboxSelection disableRowSelectionOnClick rowSelectionModel={selectedFeeIds} onRowSelectionModelChange={(model) => setSelectedFeeIds(selectionToArray(model))} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 2 }}>Refund from excess credit</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Administrative Charges" value={refund.administrativecharges} onChange={(e) => setRefund({ ...refund, administrativecharges: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth type="number" label={`Refund max ${currency(refundable)}`} value={refund.refundamount} onChange={(e) => setRefund({ ...refund, refundamount: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField select fullWidth label="Refund Mode" value={refund.refundmode} onChange={(e) => setRefund({ ...refund, refundmode: e.target.value })}>{["", "Cash", "Cheque", "NEFT", "UPI", "Card"].map((v) => <MenuItem key={v} value={v}>{v || "None"}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} md={3}><TextField fullWidth label="Refund Ref No" value={refund.refundrefno} onChange={(e) => setRefund({ ...refund, refundrefno: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Refund Date" InputLabelProps={{ shrink: true }} value={refund.refunddate} onChange={(e) => setRefund({ ...refund, refunddate: e.target.value })} /></Grid>
                <Grid item xs={12} md={1}><Button fullWidth sx={{ height: 56 }} variant="contained" startIcon={<Save />} onClick={execute} disabled={loading || !selectedFeeIds.length}>{loading ? "Saving..." : "Save"}</Button></Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Stack>
    </MenuPageShell>
  );
}

function LogPage({ type }) {
  const fee = type === "fee";
  const endpoint = fee ? "/api/v2/programtransfer/fee-logs" : "/api/v2/programtransfer/logs";
  const [filters, setFilters] = useState([makeFilter()]);
  const [options, setOptions] = useState({});
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const fields = fee ? ["student", "regno", "email", "oldprogramcode", "newprogramcode", "oldacademicyear", "newacademicyear", "refundmode"] : ["student", "regno", "email"];
  const load = async () => {
    const res = await ep1.post(endpoint, { colid: global1.colid, filters: cleanFilters(filters) });
    setRows(res.data?.data || []);
    setOptions(res.data?.options || {});
  };
  useEffect(() => { load(); }, []);
  const print = () => {
    const html = document.getElementById("program-transfer-log-print")?.innerHTML || "";
    const win = window.open("", "_blank");
    win.document.write(`<html><body>${html}</body></html>`);
    win.document.close(); win.print();
  };
  const columns = [
    { field: "transferdate", headerName: "Date", minWidth: 130, valueGetter: (p) => shortDate(p.row.transferdate) },
    { field: "student", headerName: "Student", minWidth: 180, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 130 },
    { field: "oldprogramcode", headerName: "Old Program", minWidth: 130, valueGetter: (p) => p.row.oldprogramcode || p.row.olddetails?.programcode },
    { field: "newprogramcode", headerName: "New Program", minWidth: 130, valueGetter: (p) => p.row.newprogramcode || p.row.newdetails?.programcode },
    ...(fee ? [
      { field: "totaloldpaid", headerName: "Old Paid", minWidth: 120, valueFormatter: (p) => currency(p.value) },
      { field: "allocatedcredit", headerName: "Allocated", minWidth: 120, valueFormatter: (p) => currency(p.value) },
      { field: "refundamount", headerName: "Refund", minWidth: 120, valueFormatter: (p) => currency(p.value) }
    ] : []),
    { field: "actions", type: "actions", width: 90, getActions: (p) => [<GridActionsCellItem icon={<Visibility />} label="View" onClick={() => setSelected(p.row)} />] }
  ];
  return (
    <MenuPageShell title={fee ? "Fee Transfer Log" : "Program Transfer Log"}>
      <Stack spacing={2}>
        <FilterPanel fields={fields} options={options} filters={filters} setFilters={setFilters} onApply={load} />
        <Button variant="outlined" startIcon={<Print />} onClick={print}>Print</Button>
        <Box id="program-transfer-log-print" sx={{ height: 560 }}><DataGrid rows={rows} columns={columns} getRowId={(row) => row._id} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Box>
        {selected && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={900}>Details</Typography>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(selected, null, 2)}</pre>
          </Paper>
        )}
      </Stack>
    </MenuPageShell>
  );
}

export function ProgramTransferLogPage() {
  return <LogPage type="program" />;
}

export function FeeTransferLogPage() {
  return <LogPage type="fee" />;
}
