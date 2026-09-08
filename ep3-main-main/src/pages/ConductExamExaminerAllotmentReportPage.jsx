import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#db2777"];
const fieldOptions = [
  "academicyear", "regulation", "exam", "examcode", "program", "programcode", "type", "subject", "semester",
  "course", "coursecode", "examinername", "examineremail", "startdate", "enddate", "status", "evaluationstatus", "evaluationdate"
];
const labels = {
  academicyear: "Academic Year",
  regulation: "Regulation",
  exam: "Exam",
  examcode: "Exam Code",
  program: "Program",
  programcode: "Program Code",
  type: "Type",
  subject: "Subject",
  semester: "Semester",
  course: "Course",
  coursecode: "Course Code",
  examinername: "Examiner",
  examineremail: "Examiner Email",
  startdate: "Start Date",
  enddate: "End Date",
  status: "Status",
  evaluationstatus: "Evaluation Status",
  evaluationdate: "Evaluation Date"
};

const valueText = (value) => String(value || "Not specified").trim() || "Not specified";

export default function ConductExamExaminerAllotmentReportPage() {
  const [rows, setRows] = useState([]);
  const [pivotFields, setPivotFields] = useState(["academicyear", "examcode", "examinername"]);
  const [ins, setIns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    loadInstitution();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setIns(res.data || null);
    } catch {
      setIns(null);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/conductexam/examiner-allotments", { params: { colid: global1.colid } });
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load examiner allotment report.");
    } finally {
      setLoading(false);
    }
  };

  const pivotRows = useMemo(() => {
    const fields = pivotFields.length ? pivotFields : ["examinername"];
    const map = new Map();
    rows.forEach((row) => {
      const key = fields.map((field) => valueText(row[field])).join(" | ");
      if (!map.has(key)) {
        const item = { id: key, count: 0 };
        fields.forEach((field) => { item[field] = valueText(row[field]); });
        map.set(key, item);
      }
      map.get(key).count += 1;
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [rows, pivotFields]);

  const chartRows = pivotRows.slice(0, 12).map((row) => ({ name: pivotFields.map((field) => row[field]).filter(Boolean).join(" / "), count: row.count }));
  const totalPapers = rows.length;
  const examinerCount = new Set(rows.map((row) => valueText(row.examineremail))).size;
  const courseCount = new Set(rows.map((row) => valueText(row.coursecode))).size;

  const columns = [
    ...pivotFields.map((field) => ({ field, headerName: labels[field] || field, minWidth: 150, flex: 1 })),
    { field: "count", headerName: "Allocated Papers", width: 170, type: "number" }
  ];

  return (
    <MenuPageShell title="Examiner Allotment Report">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #examiner-allotment-report-print, #examiner-allotment-report-print * { visibility: visible; }
            #examiner-allotment-report-print { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 16px; }
            .screen-only { display: none !important; }
          }
        `}</style>

        <Paper className="screen-only" elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>Examiner Allotment Report</Typography>
              <Typography color="text.secondary">Select one or more fields to generate pivot counts.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={loadData} disabled={loading}>Refresh</Button>
              <Button variant="contained" onClick={() => window.print()}>Print Preview</Button>
            </Stack>
          </Stack>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper className="screen-only" elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={fieldOptions}
            value={pivotFields}
            onChange={(event, value) => setPivotFields(value || [])}
            getOptionLabel={(option) => labels[option] || option}
            renderOption={(props, option, { selected }) => (
              <li {...props}><Checkbox checked={selected} sx={{ mr: 1 }} />{labels[option] || option}</li>
            )}
            renderInput={(params) => <TextField {...params} label="Pivot Fields" placeholder="Select fields" />}
          />
        </Paper>

        <Box id="examiner-allotment-report-print">
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #d1d5db", borderRadius: 2 }}>
            <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
              {ins?.logo && <Box component="img" src={ins.logo} alt="Logo" sx={{ height: 64, objectFit: "contain" }} />}
              <Typography variant="h6" fontWeight={900}>{ins?.insname || ins?.name || "Institution"}</Typography>
              <Typography variant="body2">{ins?.address || ins?.insaddress || ""}</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Examiner Allotment Report</Typography>
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {[{ label: "Allocated Papers", value: totalPapers }, { label: "Examiners", value: examinerCount }, { label: "Courses", value: courseCount }].map((card) => (
                <Grid item xs={12} md={4} key={card.label}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", borderColor: "#cbd5e1" }}>
                    <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                    <Typography variant="h5" fontWeight={900}>{card.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 1, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartRows}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Allocated Papers" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 1, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartRows} dataKey="count" nameKey="name" outerRadius={90} label>
                        {chartRows.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ height: 520, width: "100%" }}>
              <DataGrid
                rows={pivotRows}
                columns={columns}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "examiner_allotment_report" } } }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
