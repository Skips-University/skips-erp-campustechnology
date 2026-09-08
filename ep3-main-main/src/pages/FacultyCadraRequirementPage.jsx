import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Print, Refresh, Search } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const academicYears = ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const chartColors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be185d"];

const columns = [
  { field: "program", headerName: "Program", minWidth: 220, flex: 1 },
  { field: "programcode", headerName: "Program Code", minWidth: 140 },
  { field: "basecount", headerName: "Seats / Students", type: "number", minWidth: 150 },
  { field: "totalfaculty", headerName: "Total Faculty Required", type: "number", minWidth: 180 },
  { field: "professor", headerName: "Professor", type: "number", minWidth: 130 },
  { field: "associateprofessor", headerName: "Associate Professor", type: "number", minWidth: 180 },
  { field: "assistantprofessor", headerName: "Assistant Professor", type: "number", minWidth: 180 }
];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const distributeCadre = (totalFaculty, ratios) => {
  const ratioValues = [
    Math.max(0, toNumber(ratios.professor)),
    Math.max(0, toNumber(ratios.associateprofessor)),
    Math.max(0, toNumber(ratios.assistantprofessor))
  ];
  const ratioTotal = ratioValues.reduce((sum, value) => sum + value, 0) || 1;
  const raw = ratioValues.map((value) => (totalFaculty * value) / ratioTotal);
  const floorValues = raw.map(Math.floor);
  let remaining = totalFaculty - floorValues.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  order.forEach((item) => {
    if (remaining > 0) {
      floorValues[item.index] += 1;
      remaining -= 1;
    }
  });

  return {
    professor: floorValues[0] || 0,
    associateprofessor: floorValues[1] || 0,
    assistantprofessor: floorValues[2] || 0
  };
};

export default function FacultyCadraRequirementPage() {
  const [academicyear, setAcademicyear] = useState("2026-27");
  const [seatsPerFaculty, setSeatsPerFaculty] = useState("20");
  const [ratios, setRatios] = useState({ professor: "1", associateprofessor: "2", assistantprofessor: "6" });
  const [seatRows, setSeatRows] = useState([]);
  const [actualStudentRows, setActualStudentRows] = useState([]);
  const [facultySummary, setFacultySummary] = useState({ professor: 0, associateprofessor: 0, assistantprofessor: 0, other: 0, total: 0, totalactive: 0 });
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
      setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadSeats = async () => {
    setLoading(true);
    setError("");
    try {
      const [seatRes, userRes] = await Promise.all([
        ep1.get("/api/v2/regulationseat", { params: { colid: global1.colid, academicyear } }),
        ep1.post("/api/v2/faculty-cadra-requirement/user-summary", { colid: global1.colid, academicyear })
      ]);
      setSeatRows(seatRes.data?.data || []);
      setActualStudentRows(userRes.data?.students || []);
      setFacultySummary(userRes.data?.faculty || { professor: 0, associateprofessor: 0, assistantprofessor: 0, other: 0, total: 0, totalactive: 0 });
    } catch (err) {
      setSeatRows([]);
      setActualStudentRows([]);
      setError(err.response?.data?.message || "Unable to load faculty cadra requirement data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitution();
    loadSeats();
  }, []);

  const calculateRequirementRows = (sourceRows, countField, idPrefix) => {
    const facultyRatio = Math.max(1, toNumber(seatsPerFaculty, 20));
    return sourceRows
      .map((row) => {
        const basecount = toNumber(row[countField]);
        const totalfaculty = Math.ceil(basecount / facultyRatio);
        return {
          ...row,
          id: `${idPrefix}-${row.program || "Not specified"}-${row.programcode || ""}`,
          basecount,
          totalfaculty,
          ...distributeCadre(totalfaculty, ratios)
        };
      })
      .sort((a, b) => b.basecount - a.basecount || String(a.program || "").localeCompare(String(b.program || "")));
  };

  const rows = useMemo(() => {
    const byProgram = {};
    seatRows.forEach((seat) => {
      const key = `${seat.program || "Not specified"}__${seat.programcode || ""}`;
      if (!byProgram[key]) {
        byProgram[key] = {
          program: seat.program || "Not specified",
          programcode: seat.programcode || "",
          seatcount: 0
        };
      }
      byProgram[key].seatcount += toNumber(seat.noofseats);
    });

    return calculateRequirementRows(Object.values(byProgram), "seatcount", "seat");
  }, [seatRows, seatsPerFaculty, ratios]);

  const actualRows = useMemo(() => calculateRequirementRows(actualStudentRows, "studentcount", "actual"), [actualStudentRows, seatsPerFaculty, ratios]);

  const totalFor = (sourceRows) => sourceRows.reduce((acc, row) => ({
    count: acc.count + row.basecount,
    faculty: acc.faculty + row.totalfaculty,
    professor: acc.professor + row.professor,
    associateprofessor: acc.associateprofessor + row.associateprofessor,
    assistantprofessor: acc.assistantprofessor + row.assistantprofessor
  }), { count: 0, faculty: 0, professor: 0, associateprofessor: 0, assistantprofessor: 0 });

  const totals = useMemo(() => totalFor(rows), [rows]);
  const actualTotals = useMemo(() => totalFor(actualRows), [actualRows]);

  const deficitFor = (required) => ({
    professor: Math.max(0, required.professor - toNumber(facultySummary.professor)),
    associateprofessor: Math.max(0, required.associateprofessor - toNumber(facultySummary.associateprofessor)),
    assistantprofessor: Math.max(0, required.assistantprofessor - toNumber(facultySummary.assistantprofessor)),
    total: Math.max(0, required.faculty - toNumber(facultySummary.total))
  });

  const seatDeficit = useMemo(() => deficitFor(totals), [totals, facultySummary]);
  const actualDeficit = useMemo(() => deficitFor(actualTotals), [actualTotals, facultySummary]);

  const cadrePie = useMemo(() => [
    { name: "Professor", value: facultySummary.professor },
    { name: "Associate Professor", value: facultySummary.associateprofessor },
    { name: "Assistant Professor", value: facultySummary.assistantprofessor },
    { name: "Other Active", value: facultySummary.other }
  ].filter((item) => item.value > 0), [facultySummary]);

  const institutionName = institution?.institutionname || global1.insname || "Institution";
  const logo = institution?.logolink || global1.logo || "";
  const address = institution?.address || "";

  return (
    <MenuPageShell title="Faculty cadra requirement">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Box sx={{ "@media print": { display: "none" } }}>
          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems={{ xs: "stretch", lg: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="h5" fontWeight={900}>Faculty Cadra Requirement</Typography>
                <Typography color="text.secondary">Programwise faculty requirement from regulation seat matrix.</Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={() => { setSeatRows([]); loadSeats(); }} disabled={loading}>Refresh</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={!rows.length}>Print</Button>
                <Button variant="contained" startIcon={<Search />} onClick={loadSeats} disabled={loading}>{loading ? "Loading..." : "Calculate"}</Button>
              </Stack>
            </Stack>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

          <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Academic Year" value={academicyear} onChange={(e) => setAcademicyear(e.target.value)}>
                  {academicYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth type="number" label="Seats per Faculty" value={seatsPerFaculty} onChange={(e) => setSeatsPerFaculty(e.target.value)} inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Professor Ratio" value={ratios.professor} onChange={(e) => setRatios((prev) => ({ ...prev, professor: e.target.value }))} inputProps={{ min: 0 }} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Associate Ratio" value={ratios.associateprofessor} onChange={(e) => setRatios((prev) => ({ ...prev, associateprofessor: e.target.value }))} inputProps={{ min: 0 }} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth type="number" label="Assistant Ratio" value={ratios.assistantprofessor} onChange={(e) => setRatios((prev) => ({ ...prev, assistantprofessor: e.target.value }))} inputProps={{ min: 0 }} />
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Box id="faculty-cadra-print" sx={{ bgcolor: "#fff", color: "#111827", p: { xs: 1, md: 2 }, "@media print": { p: 0 } }}>
          <Stack alignItems="center" spacing={0.5} sx={{ mb: 2, textAlign: "center" }}>
            {logo && <Box component="img" src={logo} alt="Logo" sx={{ width: 76, height: 76, objectFit: "contain" }} />}
            <Typography variant="h6" fontWeight={900}>{institutionName}</Typography>
            {address && <Typography variant="body2" sx={{ maxWidth: 820 }}>{address}</Typography>}
            <Typography variant="subtitle1" fontWeight={900} sx={{ mt: 1 }}>Faculty Cadra Requirement</Typography>
            <Typography variant="body2">Academic Year: {academicyear}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip color="primary" label={`Seat Matrix Seats: ${totals.count}`} />
            <Chip color="success" label={`Seat Matrix Faculty Required: ${totals.faculty}`} />
            <Chip color="primary" variant="outlined" label={`Actual Students: ${actualTotals.count}`} />
            <Chip color="success" variant="outlined" label={`Actual Faculty Required: ${actualTotals.faculty}`} />
            <Chip color="warning" label={`Active Matching Faculty: ${facultySummary.total}`} />
            <Chip label={`Cadra Ratio: ${ratios.professor}:${ratios.associateprofessor}:${ratios.assistantprofessor}`} />
            <Chip label={`Seats per Faculty: ${seatsPerFaculty}`} />
          </Stack>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {[
              ["Available Professor", facultySummary.professor, "#eff6ff"],
              ["Available Associate", facultySummary.associateprofessor, "#f0fdf4"],
              ["Available Assistant", facultySummary.assistantprofessor, "#fff7ed"],
              ["Active Faculty Total", facultySummary.totalactive, "#f5f3ff"]
            ].map(([label, value, bg]) => (
              <Grid item xs={12} md={3} key={label}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", bgcolor: bg }}>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h4" fontWeight={900}>{value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2, "@media print": { pageBreakInside: "avoid" } }}>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 340 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Seat Matrix Based Requirement</Typography>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={rows.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="programcode" interval={0} angle={-20} textAnchor="end" height={70} />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="professor" name="Professor" stackId="a" fill="#2563eb" />
                    <Bar dataKey="associateprofessor" name="Associate" stackId="a" fill="#16a34a" />
                    <Bar dataKey="assistantprofessor" name="Assistant" stackId="a" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 340 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Actual Available Faculty</Typography>
                <ResponsiveContainer width="100%" height={270}>
                  <PieChart>
                    <Pie data={cadrePie} dataKey="value" nameKey="name" outerRadius={95} label>
                      {cadrePie.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2, "@media print": { pageBreakInside: "avoid" } }}>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 340 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Actual Student Based Requirement</Typography>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={actualRows.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="programcode" interval={0} angle={-20} textAnchor="end" height={70} />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="professor" name="Professor" stackId="a" fill="#7c3aed" />
                    <Bar dataKey="associateprofessor" name="Associate" stackId="a" fill="#0891b2" />
                    <Bar dataKey="assistantprofessor" name="Assistant" stackId="a" fill="#ca8a04" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", height: 340 }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Deficit Summary</Typography>
                <Grid container spacing={1}>
                  {[
                    ["Seat Matrix Deficit", seatDeficit.total, "#fee2e2"],
                    ["Actual Student Deficit", actualDeficit.total, "#ffedd5"],
                    ["Professor Deficit (Seat)", seatDeficit.professor, "#eff6ff"],
                    ["Associate Deficit (Seat)", seatDeficit.associateprofessor, "#f0fdf4"],
                    ["Assistant Deficit (Seat)", seatDeficit.assistantprofessor, "#fff7ed"],
                    ["Professor Deficit (Actual)", actualDeficit.professor, "#ede9fe"],
                    ["Associate Deficit (Actual)", actualDeficit.associateprofessor, "#ecfeff"],
                    ["Assistant Deficit (Actual)", actualDeficit.assistantprofessor, "#fef9c3"]
                  ].map(([label, value, bg]) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Paper elevation={0} sx={{ p: 1.25, border: "1px solid #e5e7eb", bgcolor: bg }}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                        <Typography variant="h5" fontWeight={900}>{value}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 1, border: "1px solid #e5e7eb", overflowX: "auto", "@media print": { display: "none" } }}>
            <Typography fontWeight={800} sx={{ px: 1, py: 1 }}>Seat Matrix Based Requirement</Typography>
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: `faculty_cadra_requirement_${academicyear}` } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              sx={{ minWidth: 1150 }}
            />
          </Paper>

          <Paper elevation={0} sx={{ p: 1, mt: 2, border: "1px solid #e5e7eb", overflowX: "auto", "@media print": { display: "none" } }}>
            <Typography fontWeight={800} sx={{ px: 1, py: 1 }}>Actual Student Based Requirement</Typography>
            <DataGrid
              rows={actualRows}
              columns={columns}
              autoHeight
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: `faculty_cadra_actual_students_${academicyear}` } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              sx={{ minWidth: 1150 }}
            />
          </Paper>

          <Box sx={{ display: "none", "@media print": { display: "block" } }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>Seat Matrix Based Requirement</Typography>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.field} style={{ border: "1px solid #d1d5db", padding: 6, textAlign: "left" }}>{column.headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td key={column.field} style={{ border: "1px solid #d1d5db", padding: 6 }}>{row[column.field]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <Typography fontWeight={800} sx={{ mt: 3, mb: 1 }}>Actual Student Based Requirement</Typography>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.field} style={{ border: "1px solid #d1d5db", padding: 6, textAlign: "left" }}>{column.headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {actualRows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td key={column.field} style={{ border: "1px solid #d1d5db", padding: 6 }}>{row[column.field]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <Grid container spacing={8} sx={{ mt: 4 }}>
              <Grid item xs={4}><Typography>Prepared by</Typography></Grid>
              <Grid item xs={4}><Typography>Checked by</Typography></Grid>
              <Grid item xs={4}><Typography>Approved by</Typography></Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
