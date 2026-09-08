import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, Delete, FilterAlt, Print, Refresh, Search } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const blankFilter = { field: "academicyear", value: "" };
const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "");

const columns = [
  { field: "student", headerName: "Student", minWidth: 190, flex: 1 },
  { field: "regno", headerName: "Reg No", minWidth: 140 },
  { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
  { field: "phone", headerName: "Phone", minWidth: 130 },
  { field: "academicyear", headerName: "Academic Year", minWidth: 130 },
  { field: "program", headerName: "Program", minWidth: 180, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 130 },
  { field: "semester", headerName: "Semester", minWidth: 110 },
  { field: "section", headerName: "Section", minWidth: 100 },
  { field: "refunddate", headerName: "Refund Date", minWidth: 130, valueGetter: (params) => shortDate(params.row.refunddate) },
  { field: "refunded", headerName: "Refunded", minWidth: 130, type: "number", valueFormatter: (params) => currency(params.value) },
  { field: "refundmode", headerName: "Mode", minWidth: 130 },
  { field: "refundrefno", headerName: "Ref No", minWidth: 160 }
];

export default function AdmissionRefundLetterPage() {
  const [fields, setFields] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...blankFilter }]);
  const [rows, setRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [selectedRegno, setSelectedRegno] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    loadRefunds();
  }, []);

  const fieldLabel = (field) => fields.find((item) => item.field === field)?.label || field;
  const cleanFilters = (sourceFilters = filters) => sourceFilters.map((filter) => ({ field: filter.field, value: String(filter.value || "").trim() })).filter((filter) => filter.field && filter.value);

  const selectedRows = useMemo(() => rows.filter((row) => row.regno === selectedRegno), [rows, selectedRegno]);
  const student = selectedRows[0] || null;
  const totalRefund = selectedRows.reduce((sum, row) => sum + Number(row.refunded || 0), 0);
  const totalPaid = selectedRows.reduce((sum, row) => sum + Number(row.paid || 0), 0);

  const studentRows = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.regno || row._id;
      const item = map.get(key) || { ...row, id: key, refunded: 0, paid: 0, itemcount: 0 };
      item.refunded += Number(row.refunded || 0);
      item.paid += Number(row.paid || 0);
      item.itemcount += 1;
      map.set(key, item);
    });
    return Array.from(map.values());
  }, [rows]);

  const loadOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/admission-cancellation/refund-options", { params: { colid: global1.colid } });
      setFields(res.data?.fields || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load refund filter options");
    }
  };

  const loadRefunds = async (sourceFilters = filters) => {
    setLoading(true);
    setError("");
    setSelectedRegno("");
    try {
      const res = await ep1.post("/api/v2/admission-cancellation/refunds", {
        colid: global1.colid,
        filters: cleanFilters(sourceFilters)
      });
      setRows(res.data?.data || []);
      setInstitution(res.data?.institution || null);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Unable to load refund students");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (index, patch) => setFilters((prev) => prev.map((item, itemIndex) => (
    itemIndex === index ? { ...item, ...patch, ...(patch.field ? { value: "" } : {}) } : item
  )));
  const addFilter = () => setFilters((prev) => [...prev, { ...blankFilter }]);
  const removeFilter = (index) => setFilters((prev) => (prev.length === 1 ? [{ ...blankFilter }] : prev.filter((_, itemIndex) => itemIndex !== index)));
  const resetFilters = () => {
    const next = [{ ...blankFilter }];
    setFilters(next);
    loadRefunds(next);
  };

  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";

  return (
    <MenuPageShell title="Generate Refund Letter">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #refund-letter-print, #refund-letter-print * { visibility: visible !important; }
          #refund-letter-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 10mm !important; background: #fff !important; color: #111 !important; }
          .MuiDrawer-root, .MuiAppBar-root, .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Box sx={{ "@media print": { display: "none" } }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={900}>Generate Refund Letter</Typography>
                <Typography color="text.secondary">Search refund records, select one student, and print cancellation letter.</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={resetFilters} disabled={loading}>Reset</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!selectedRows.length}>Print</Button>
                <Button variant="contained" startIcon={<Search />} onClick={() => loadRefunds()} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
              </Stack>
            </Stack>
          </Paper>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterAlt color="primary" />
                <Typography variant="h6" fontWeight={800}>Dynamic Filters</Typography>
              </Stack>
              <Button startIcon={<Add />} onClick={addFilter}>Add Filter</Button>
            </Stack>
            <Grid container spacing={2}>
              {filters.map((filter, index) => (
                <React.Fragment key={`${filter.field}-${index}`}>
                  <Grid item xs={12} md={4}>
                    <TextField select fullWidth label="Field" value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value })}>
                      {fields.map((item) => <MenuItem key={item.field} value={item.field}>{item.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Autocomplete
                      freeSolo
                      options={options[filter.field]?.values || []}
                      value={filter.value || ""}
                      onInputChange={(_, value) => updateFilter(index, { value })}
                      onChange={(_, value) => updateFilter(index, { value: value || "" })}
                      renderInput={(params) => <TextField {...params} label={fieldLabel(filter.field)} />}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Tooltip title="Remove filter">
                      <span>
                        <IconButton color="error" onClick={() => removeFilter(index)} disabled={filters.length === 1} sx={{ height: 56, width: 56 }}>
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Paper>
          <Paper elevation={0} sx={{ p: 1, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2, overflowX: "auto" }}>
            <Stack direction="row" spacing={1} sx={{ p: 1 }}>
              <Chip label={`Students: ${studentRows.length}`} />
              <Chip color="primary" label={student ? `Selected: ${student.student}` : "Selected: 0"} />
            </Stack>
            <DataGrid
              rows={studentRows}
              columns={columns}
              getRowId={(row) => row.id}
              loading={loading}
              rowSelectionModel={selectedRegno ? [selectedRegno] : []}
              onRowSelectionModelChange={(ids) => setSelectedRegno(ids.slice(-1)[0] || "")}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "refund_letter_students" } } }}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              sx={{ minWidth: 1700 }}
            />
          </Paper>
        </Box>

        {student && (
          <Paper id="refund-letter-print" elevation={0} sx={{ p: 4, bgcolor: "#fff", color: "#111827", border: "1px solid #e5e7eb" }}>
            <Stack alignItems="center" spacing={0.5} sx={{ mb: 3, textAlign: "center" }}>
              {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 78, height: 78, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
              {address && <Typography variant="body2">{address}</Typography>}
              <Typography variant="h6" fontWeight={900} sx={{ mt: 2, textDecoration: "underline" }}>Admission Cancellation and Refund Letter</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography>Date: {new Date().toLocaleDateString("en-IN")}</Typography>
              <Typography>Reg No: {student.regno}</Typography>
            </Stack>

            <Typography sx={{ mb: 2 }}>To,</Typography>
            <Typography fontWeight={700}>{student.student}</Typography>
            <Typography sx={{ mb: 2 }}>{student.email} {student.phone ? `| ${student.phone}` : ""}</Typography>

            <Typography sx={{ mb: 2 }}>Subject: Confirmation of admission cancellation and refund details</Typography>
            <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
              This is to confirm that the admission of {student.student} for {student.program} ({student.programcode}) under academic year {student.academicyear} has been cancelled as per institutional process. The refund details recorded against the paid fee items are provided below for reference.
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {[
                ["Academic Year", student.academicyear],
                ["Regulation", student.regulation],
                ["Program", student.program],
                ["Program Code", student.programcode],
                ["Semester", student.semester],
                ["Section", student.section],
                ["Major", student.major],
                ["Minor", student.minor]
              ].map(([label, value]) => (
                <Grid item xs={6} key={label}>
                  <Typography variant="body2"><b>{label}:</b> {value || "NA"}</Typography>
                </Grid>
              ))}
            </Grid>

            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", mb: 3, "& th, & td": { border: "1px solid #d1d5db", p: 1, fontSize: 13 }, "& th": { bgcolor: "#f3f4f6" } }}>
              <thead>
                <tr>
                  <th>Fee Group</th>
                  <th>Fee Item</th>
                  <th>Paid</th>
                  <th>Refunded</th>
                  <th>Mode</th>
                  <th>Ref No</th>
                  <th>Refund Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedRows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.feegroup}</td>
                    <td>{row.feeitem}</td>
                    <td>{currency(row.paid)}</td>
                    <td>{currency(row.refunded)}</td>
                    <td>{row.refundmode}</td>
                    <td>{row.refundrefno}</td>
                    <td>{shortDate(row.refunddate)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}><b>Total</b></td>
                  <td><b>{currency(totalPaid)}</b></td>
                  <td><b>{currency(totalRefund)}</b></td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </Box>

            <Typography sx={{ mb: 4, lineHeight: 1.8 }}>
              The above refund amount is subject to realization, bank processing time, and the terms and conditions of the institution. This letter is generated from the admission cancellation records maintained by the institution.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 5 }}>
              <Grid item xs={4}><Typography fontWeight={700}>Prepared by: ____________________</Typography></Grid>
              <Grid item xs={4}><Typography fontWeight={700}>Checked by: ____________________</Typography></Grid>
              <Grid item xs={4}><Typography fontWeight={700}>Approved by: ____________________</Typography></Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </MenuPageShell>
  );
}
