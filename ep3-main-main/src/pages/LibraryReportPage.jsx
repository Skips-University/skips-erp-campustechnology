import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import ep1 from "../api/ep1";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3f51b5",
  "#f50057",
  "#4caf50",
  "#ff9800",
  "#9c27b0",
  "#00bcd4",
];

const generateColorPalette = (count) => {
  const colors = [];
  const hueStep = 360 / count;
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${i * hueStep}, 65%, 55%)`);
  }
  return colors;
};

const monthName = (m) =>
  [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][m - 1];

const LibraryReportPage = () => {
  const navigate = useNavigate();
  const { id: libraryid } = useParams();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [monthlyIssued, setMonthlyIssued] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [summaryRes, catRes, langRes, statusRes, issuedRes, topRes] =
          await Promise.all([
            ep1.get(`/api/v2/report/summary`, { params: { libraryid } }),
            ep1.get(`/api/v2/report/category-counts`, { params: { libraryid } }),
            ep1.get(`/api/v2/report/language-counts`, { params: { libraryid } }),
            ep1.get(`/api/v2/report/status-breakdown`, { params: { libraryid } }),
            ep1.get(`/api/v2/report/issued-monthly`, { params: { libraryid } }),
            ep1.get(`/api/v2/report/top-books`, { params: { libraryid } }),
          ]);

        setSummary(summaryRes.data);
        setCategoryData(catRes.data);
        setLanguageData(langRes.data);
        setStatusBreakdown(statusRes.data);
        setMonthlyIssued(issuedRes.data);
        setTopBooks(topRes.data);
        setSelectedMonth("All");
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setLoading(false);
      }
    };
    fetchReports();
  }, [libraryid]);

  const formatPieData = (data, labelField = "_id", topN = 10) => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const topItems = sorted.slice(0, topN);
    const others = sorted.slice(topN);
    const otherCount = others.reduce((sum, item) => sum + item.count, 0);
    if (otherCount > 0) {
      topItems.push({ [labelField]: "Others", count: otherCount });
    }
    return topItems;
  };

  const monthOptions = [
    "All",
    ...monthlyIssued.map((d) => `${monthName(d._id.month)} ${d._id.year}`),
  ];

  const filteredMonthlyIssued =
    selectedMonth === "All"
      ? monthlyIssued
      : monthlyIssued.filter(
          (d) => `${monthName(d._id.month)} ${d._id.year}` === selectedMonth
        );

  const paginatedCategories = categoryData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress size={50} thickness={5} color="primary" />
        <Typography mt={2} variant="h6">
          Loading Report...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth="1200px" mx="auto">
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, bgcolor: "#fefefe" }}>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={() => navigate(`/library/${libraryid}`)} color="primary">
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" ml={1}>Back</Typography>
        </Box>

        <Typography
          variant="h4"
          textAlign="center"
          sx={{ fontWeight: 700, color: "#1976d2", mb: 4 }}
        >
          📊 Library Report
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* Summary */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>📘 Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography>Total Books: {summary?.totalBooks}</Typography>
              <Typography>Total Issued: {summary?.totalIssued}</Typography>
              <Typography>Total Returned: {summary?.totalReturned}</Typography>
              <Typography>Total Lost: {summary?.totalLost}</Typography>
            </Paper>
          </Grid>

          {/* Reusable Pie Sections */}
          {[{
            title: "📦 Status Breakdown",
            data: formatPieData(statusBreakdown),
          }, {
            title: "📚 Book Categories",
            data: formatPieData(categoryData),
          }, {
            title: "🌐 Languages",
            data: formatPieData(languageData),
          }].map(({ title, data }, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="count"
                      nameKey="_id"
                      outerRadius={80}
                    >
                      {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          ))}

          {/* Monthly Issued */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">📅 Monthly Issued Books</Typography>
                <TextField
                  select
                  size="small"
                  label="Filter by Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  {monthOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </TextField>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredMonthlyIssued}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={(d) => `${monthName(d._id.month)} ${d._id.year}`} />
                  <YAxis />
                  <Tooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  <Bar dataKey="count" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Books */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>🔝 Top Issued Books</Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatPieData(topBooks, "_id")} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="_id" type="category" width={100} />
                  <Tooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Full Category List */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>📄 Full Category List</Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Book Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCategories.map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell>{row._id || "Unknown"}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={Math.ceil(categoryData.length / rowsPerPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LibraryReportPage;
