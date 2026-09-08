import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Pagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { ArrowBack, Visibility, Search, Assessment } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const ProfileEditLogsds = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Statistics
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  
  // Detail view
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, category, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        page,
        limit: 20
      };
      
      if (search) params.regno = search;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await ep1.get("/api/v2/ds1getalleditlogs", { params });
      setLogs(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      setError("Error fetching logs");
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await ep1.get("/api/v2/ds1geteditlogstats", {
        params: { colid: global1.colid }
      });
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setOpenDetail(true);
  };

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const getCategoryColor = (category) => {
    const colors = {
      Personal: "primary",
      Family: "secondary",
      Academic: "info",
      Merit: "success"
    };
    return colors[category] || "default";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/usermanagementdsoct18")}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" fontWeight="bold">
              Profile Edit Logs
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? "Hide" : "Show"} Statistics
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Statistics Section */}
        {showStats && stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Edits
                  </Typography>
                  <Typography variant="h4">{stats.totalEdits}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Unique Students
                  </Typography>
                  <Typography variant="h4">{stats.uniqueStudents}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Top Field Edited
                  </Typography>
                  <Typography variant="h6">
                    {stats.mostEditedFields[0]?._id || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Most Active Editor
                  </Typography>
                  <Typography variant="body1" noWrap>
                    {stats.topEditors[0]?._id.name || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by Regno or Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Personal">Personal</MenuItem>
              <MenuItem value="Family">Family</MenuItem>
              <MenuItem value="Academic">Academic</MenuItem>
              <MenuItem value="Merit">Merit</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {/* Logs Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date & Time</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Student Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Regno</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fields Changed</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Categories</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No edit logs found</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id} hover>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>{log.name}</TableCell>
                    <TableCell>{log.regno}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${log.totalFieldsChanged} field${log.totalFieldsChanged > 1 ? 's' : ''}`} 
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {[...new Set(log.changes.map(c => c.category))].map((cat, idx) => (
                          <Chip 
                            key={idx}
                            label={cat} 
                            size="small" 
                            color={getCategoryColor(cat)}
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(log)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Total: {total} logs
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Log Details
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Student Name:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedLog.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Regno:</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedLog.regno}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date & Time:</Typography>
                  <Typography variant="body1">{formatDate(selectedLog.createdAt)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Change Type:</Typography>
                  <Chip label={selectedLog.changeType} size="small" color="info" />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Changes Made:</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Field</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Old Value</TableCell>
                      <TableCell>New Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedLog.changes.map((change, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{change.fieldLabel}</TableCell>
                        <TableCell>
                          <Chip label={change.category} size="small" color={getCategoryColor(change.category)} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {change.oldValue || "(empty)"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {change.newValue || "(empty)"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedLog.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Notes:</Typography>
                  <Typography variant="body1">{selectedLog.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileEditLogsds;
