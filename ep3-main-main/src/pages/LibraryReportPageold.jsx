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
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE = "http://localhost:8080";

const generateColorPalette = (count) => {
  const colors = [];
  const hueStep = 360 / count;
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${i * hueStep}, 65%, 55%)`);
  }
  return colors;
};

const monthName = (m) =>
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];

const LibraryReportPage = () => {
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
            axios.get(`${API_BASE}/api/v2/report/summary`, { params: { libraryid } }),
            axios.get(`${API_BASE}/api/v2/report/category-counts`, { params: { libraryid } }),
            axios.get(`${API_BASE}/api/v2/report/language-counts`, { params: { libraryid } }),
            axios.get(`${API_BASE}/api/v2/report/status-breakdown`, { params: { libraryid } }),
            axios.get(`${API_BASE}/api/v2/report/issued-monthly`, { params: { libraryid } }),
            axios.get(`${API_BASE}/api/v2/report/top-books`, { params: { libraryid } }),
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

  const formatChartData = (data, labelField = "_id", topN = 10) => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const topItems = sorted.slice(0, topN);
    const others = sorted.slice(topN);
    const otherCount = others.reduce((sum, item) => sum + item.count, 0);
    if (otherCount > 0) {
      topItems.push({ [labelField]: "Others", count: otherCount });
    }
    return {
      labels: topItems.map((d) => d[labelField] || "Unknown"),
      datasets: [
        {
          data: topItems.map((d) => d.count),
          backgroundColor: generateColorPalette(topItems.length),
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    };
  };

  const monthOptions = [
    "All",
    ...monthlyIssued.map(
      (d) => `${monthName(d._id.month)} ${d._id.year}`
    ),
  ];

  const filteredMonthlyIssued =
    selectedMonth === "All"
      ? monthlyIssued
      : monthlyIssued.filter(
          (d) => `${monthName(d._id.month)} ${d._id.year}` === selectedMonth
        );

  const barChartData = {
    labels: filteredMonthlyIssued.map(
      (d) => `${monthName(d._id.month)} ${d._id.year}`
    ),
    datasets: [
      {
        label: "Books Issued",
        data: filteredMonthlyIssued.map((d) => d.count),
        backgroundColor: "#1976d2",
        borderRadius: 5,
        barThickness: 40,
      },
    ],
  };

  const paginatedCategories = categoryData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box p={3} maxWidth="1200px" mx="auto">
      <Typography
        variant="h4"
        gutterBottom
        textAlign="center"
        sx={{ fontWeight: 700, color: "#1976d2", mb: 4 }}
      >
        📊 Library Report
      </Typography>

      <Grid container spacing={4}>
        {/* Summary */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              📘 Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Total Books: {summary?.totalBooks}</Typography>
            <Typography>Total Issued: {summary?.totalIssued}</Typography>
            <Typography>Total Returned: {summary?.totalReturned}</Typography>
            <Typography>Total Lost: {summary?.totalLost}</Typography>
          </Paper>
        </Grid>

        {/* Status Pie */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              📦 Status Breakdown
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Pie data={formatChartData(statusBreakdown)} />
          </Paper>
        </Grid>

        {/* Category Doughnut */}
        <Grid item xs={12} sm={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              📚 Book Categories
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Doughnut data={formatChartData(categoryData)} />
          </Paper>
        </Grid>

        {/* Languages */}
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              🌐 Languages
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Doughnut data={formatChartData(languageData)} />
          </Paper>
        </Grid>

        {/* Monthly Issued Chart + Filter */}
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
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
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Bar data={barChartData} />
          </Paper>
        </Grid>

        {/* Top Books Bar */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              🔝 Top Issued Books
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Bar
              data={formatChartData(topBooks, "_id")}
              options={{ indexAxis: "y" }}
            />
          </Paper>
        </Grid>

        {/* Full Category Table */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              📄 Full Category List
            </Typography>
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
    </Box>
  );
};

export default LibraryReportPage;
