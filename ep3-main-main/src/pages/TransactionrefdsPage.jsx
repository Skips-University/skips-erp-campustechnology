// TransactionrefdsPage.jsx

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const TransactionrefdsPage = () => {
  const navigate = useNavigate();
  const [transactionref, setTransactionref] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await ep1.get(
        `/api/v2/dstransactionrefds?colid=${global1.colid}&transactionref=${transactionref}`
      );
      if (response.data.success) {
        setEntries(
          response.data.data.map((item, index) => ({
            ...item,
            id: item._id || index,
          }))
        );
        if (response.data.data.length === 0) {
          setError("No entries found for this reference.");
        }
      } else {
        setError(response.data.message || "Failed to fetch entries.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "year", headerName: "Year", width: 100 },
    { field: "accgroup", headerName: "Group", width: 120 },
    { field: "account", headerName: "Account", width: 150 },
    { field: "transaction", headerName: "Transaction", width: 120 },
    { field: "activitydate", headerName: "Date", width: 100 },
    { field: "amount", headerName: "Amount", width: 90 },
    { field: "debit", headerName: "Debit", width: 90 },
    { field: "credit", headerName: "Credit", width: 90 },
    { field: "type", headerName: "Type", width: 80 },
    { field: "student", headerName: "Student", width: 100 },
    { field: "regno", headerName: "Reg No", width: 100 },
    { field: "empid", headerName: "Emp ID", width: 100 },
    { field: "comments", headerName: "Comments", width: 140 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      startIcon={<ArrowBack />}
                      onClick={() => navigate("/dashdashfacnew")}
                    >
                      Back
                    </Button>
                    <Typography variant="h4" gutterBottom>
        Transaction Debit/Credit Report
      </Typography>
                  </Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Search by Transaction Reference</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 2 }}>
          <TextField
            label="Transaction Reference"
            value={transactionref}
            onChange={(e) => setTransactionref(e.target.value)}
            variant="outlined"
            sx={{ minWidth: 300 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !transactionref}
          >
            {loading ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Debit and Credit Entries
        </Typography>
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={entries}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TransactionrefdsPage;
