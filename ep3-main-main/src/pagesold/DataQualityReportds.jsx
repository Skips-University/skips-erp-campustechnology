import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab
} from "@mui/material";
import {
  ArrowBack,
  PhotoCamera,
  CheckCircle,
  Warning,
  CloudUpload
} from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const DataQualityReportds = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // Bulk photo update dialog
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [fileExtension, setFileExtension] = useState(".jpg");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [studentsWithoutPhotos, setStudentsWithoutPhotos] = useState([]);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/ds1getmissingfieldsreport", {
        params: { colid: global1.colid }
      });
      setReportData(res.data);
    } catch (err) {
      setError("Error fetching report");
      console.error(err);
    }
    setLoading(false);
  };

  const handleOpenPhotoDialog = async () => {
    try {
      const res = await ep1.get("/api/v2/ds1getstudentswithoutphotos", {
        params: { colid: global1.colid }
      });
      setStudentsWithoutPhotos(res.data.students);
      setOpenPhotoDialog(true);
    } catch (err) {
      setError("Error fetching students without photos");
    }
  };

  const handleBulkPhotoUpdate = async () => {
    if (!baseUrl) {
      setError("Please enter base URL");
      return;
    }

    setPhotoLoading(true);
    setError("");
    setMessage("");

    try {
      // Construct photo URLs for all students
      const students = studentsWithoutPhotos.map(student => ({
        regno: student.regno,
        photoUrl: `${baseUrl}${student.regno}${fileExtension}`
      }));

      const res = await ep1.post("/api/v2/ds1bulkupdatephotosfromurl", {
        students,
        colid: global1.colid
      });

      setMessage(`✅ Successfully updated ${res.data.updated} photos!`);
      setOpenPhotoDialog(false);
      fetchReport(); // Refresh report
      
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating photos");
    }
    setPhotoLoading(false);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography>Loading report...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Paper>
      </Container>
    );
  }

  if (!reportData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert severity="error">Failed to load report</Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/usermanagementdsoct18")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Student Data Quality Report
          </Typography>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Students
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {reportData.summary.totalStudents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "success.light" }}>
              <CardContent>
                <Typography color="white" gutterBottom>
                  Complete Data
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="white">
                  {reportData.summary.studentsWithCompleteData}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "error.light" }}>
              <CardContent>
                <Typography color="white" gutterBottom>
                  Missing Data
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="white">
                  {reportData.summary.studentsWithMissingData}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "primary.main" }}>
              <CardContent>
                <Typography color="white" gutterBottom>
                  Completion Rate
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="white">
                  {reportData.summary.completionPercentage}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="Field Statistics" />
          <Tab label="Students with Missing Fields" />
        </Tabs>

        {/* Tab 1: Field Statistics */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Field-wise Data Completion
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.main" }}>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Field Name</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Total</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Filled</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Empty</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">% Complete</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Progress</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.fieldStats.map((stat) => (
                    <TableRow key={stat.field} hover>
                      <TableCell>
                        <Typography fontWeight="bold">{stat.label}</Typography>
                      </TableCell>
                      <TableCell align="center">{stat.total}</TableCell>
                      <TableCell align="center">
                        <Chip label={stat.filled} color="success" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={stat.empty} color="error" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold" color={stat.percentage >= 80 ? "success.main" : "error.main"}>
                          {stat.percentage}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 200 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={stat.percentage}
                            sx={{ flex: 1, height: 8, borderRadius: 5 }}
                            color={stat.percentage >= 80 ? "success" : "error"}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {stat.field === "photo" && stat.empty > 0 && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PhotoCamera />}
                            onClick={handleOpenPhotoDialog}
                          >
                            Bulk Update
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 2: Students with Missing Fields */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Students with Missing Data ({reportData.studentsWithMissingFields.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.200" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.200" }}>Regno</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.200" }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.200" }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.200" }} align="center">Missing Count</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.200" }}>Missing Fields</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.studentsWithMissingFields.map((student) => (
                    <TableRow key={student._id} hover>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.regno}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.semester}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={student.missingCount}
                          color={student.missingCount > 5 ? "error" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {student.missingFields.map((field, idx) => (
                            <Chip
                              key={idx}
                              label={field.label}
                              size="small"
                              variant="outlined"
                              color="error"
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Bulk Photo Update Dialog */}
      <Dialog open={openPhotoDialog} onClose={() => setOpenPhotoDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PhotoCamera color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Bulk Update Student Photos
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>{studentsWithoutPhotos.length} students</strong> without photos found.
              Photos will be updated from the URL pattern: <strong>Base URL + Regno + Extension</strong>
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Base URL"
                placeholder="https://career.cag.in/"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                helperText="Enter the base URL where photos are hosted (include trailing slash)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>File Extension</InputLabel>
                <Select
                  value={fileExtension}
                  onChange={(e) => setFileExtension(e.target.value)}
                  label="File Extension"
                >
                  <MenuItem value=".jpg">.jpg</MenuItem>
                  <MenuItem value=".jpeg">.jpeg</MenuItem>
                  <MenuItem value=".png">.png</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {baseUrl && (
            <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview URL Pattern:
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="bold">
                {baseUrl}
                <span style={{ color: "#ed6c02" }}>REG007</span>
                {fileExtension}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Example: If regno is "REG007", photo URL will be: {baseUrl}REG007{fileExtension}
              </Typography>
            </Box>
          )}

          {studentsWithoutPhotos.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Students to be updated (showing first 5):
              </Typography>
              {studentsWithoutPhotos.slice(0, 5).map((student, idx) => (
                <Typography key={idx} variant="caption" display="block" color="text.secondary">
                  • {student.regno} - {student.name}
                </Typography>
              ))}
              {studentsWithoutPhotos.length > 5 && (
                <Typography variant="caption" color="text.secondary">
                  ...and {studentsWithoutPhotos.length - 5} more
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPhotoDialog(false)} disabled={photoLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkPhotoUpdate}
            disabled={!baseUrl || photoLoading}
            startIcon={<CloudUpload />}
          >
            {photoLoading ? "Updating..." : `Update ${studentsWithoutPhotos.length} Photos`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DataQualityReportds;