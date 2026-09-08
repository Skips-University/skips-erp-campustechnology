import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

function FacultyBankDetailsPage() {
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const response = await ep1.get(
        `/api/v2/getfacbankdsbycolid?colid=${global1.colid}`
      );
      setBankDetails(response.data.bankdetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bank details:", error);
      setMessage("Error fetching bank details");
      setMessageType("error");
      setLoading(false);
    }
  };

  const filteredBankDetails = bankDetails.filter(
    (detail) =>
      detail.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.pannumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.accountnumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "User",
      "Account Number",
      "Account Holder Name",
      "Bank Name",
      "IFSC Code",
      "Branch Name",
      "PAN Number",
    ];

    const rows = filteredBankDetails.map((detail) => [
      detail.name || "",
      detail.user || "",
      detail.accountnumber || "",
      detail.accountholdername || "",
      detail.bankname || "",
      detail.ifsccode || "",
      detail.branchname || "",
      detail.pannumber || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faculty_bank_details_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Faculty Bank Details
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Displaying bank details for {filteredBankDetails.length} approved
          faculty members
        </Typography>
      </Box>

      {message && (
        <Alert severity={messageType} sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Search and Export Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              placeholder="Search by name, PAN number, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              disabled={filteredBankDetails.length === 0}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bank Details Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Account Number</strong></TableCell>
              <TableCell><strong>Account Holder</strong></TableCell>
              <TableCell><strong>Bank Name</strong></TableCell>
              <TableCell><strong>IFSC Code</strong></TableCell>
              <TableCell><strong>Branch Name</strong></TableCell>
              <TableCell><strong>PAN Number</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBankDetails.length > 0 ? (
              filteredBankDetails.map((detail) => (
                <TableRow key={detail._id} hover>
                  <TableCell>{detail.name}</TableCell>
                  <TableCell>{detail.user}</TableCell>
                  <TableCell>{detail.accountnumber}</TableCell>
                  <TableCell>{detail.accountholdername}</TableCell>
                  <TableCell>{detail.bankname}</TableCell>
                  <TableCell>{detail.ifsccode}</TableCell>
                  <TableCell>{detail.branchname}</TableCell>
                  <TableCell>{detail.pannumber}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 3 }}>
                  <Typography color="textSecondary">
                    No approved faculty bank details found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default FacultyBankDetailsPage;
