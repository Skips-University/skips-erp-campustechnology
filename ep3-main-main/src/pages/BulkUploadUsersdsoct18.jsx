import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { ArrowBack, Upload, CloudUpload, Download } from "@mui/icons-material";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const BulkUploadUsersdsoct18 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Add colid to each row
        const usersData = data.map(row => ({
          ...row,
          colid: global1.colid,
          status: row.status || 1
        }));

        setParsedData(usersData);
        setError("");
      } catch (err) {
        setError("Error parsing Excel file. Please check the format.");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (parsedData.length === 0) {
      setError("No data to upload");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    setUploadResult(null);

    try {
      const res = await ep1.post("/api/v2/ds1bulkcreateuser", {
        users: parsedData
      });
      
      setMessage(res.data.message);
      setUploadResult({
        created: res.data.created,
        duplicates: res.data.duplicates
      });
      
      // Clear parsed data after successful upload
      setTimeout(() => {
        setParsedData([]);
        navigate("/usermanagementdsoct18");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading users");
      console.error(err);
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        email: "student1@example.com",
        name: "John Doe",
        phone: "1234567890",
        password: "password123",
        role: "Student",
        regno: "2024001",
        programcode: "BCA",
        admissionyear: "2024",
        semester: "1",
        section: "A",
        gender: "Male",
        department: "Computer Science",
        photo: "",
        category: "General",
        address: "123 Main St",
        quota: "Merit",
        fathername: "Father Name",
        mothername: "Mother Name",
        dob: "2000-01-01",
        eligibilityname: "12th",
        degree: "Bachelor",
        minorsub: "",
        vocationalsub: "",
        mdcsub: "",
        othersub: "",
        merit: "",
        obtain: "",
        bonus: "",
        weightage: "",
        ncctype: "",
        isdisabled: "No",
        scholarship: ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_upload_template.xlsx");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/usermanagementdsoct18")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Bulk Upload Users
          </Typography>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {uploadResult && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Created: {uploadResult.created} users | Duplicates skipped: {uploadResult.duplicates}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Step 1: Download Template
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadTemplate}
          >
            Download Excel Template
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Download the template, fill in user details, and upload the file.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Step 2: Upload Filled Excel File
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
          >
            Choose Excel File
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
          {parsedData.length > 0 && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              ✓ {parsedData.length} rows loaded from Excel file
            </Typography>
          )}
        </Box>

        {parsedData.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Preview Data ({parsedData.length} users)
            </Typography>
            <TableContainer sx={{ maxHeight: 400, mb: 3 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Regno</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Semester</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.slice(0, 10).map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.regno}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.semester}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {parsedData.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing first 10 rows. Total: {parsedData.length} users
              </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setParsedData([])}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={handleBulkUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : `Upload ${parsedData.length} Users`}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default BulkUploadUsersdsoct18;
