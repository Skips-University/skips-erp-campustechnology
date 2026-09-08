import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const JournalsByGroupdsPage = () => {
  const navigate = useNavigate();
  const [accountGroups, setAccountGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [entries, setEntries] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await ep1.get(`/api/v2/dsgetaccountgroupswithtypes?colid=${global1.colid}`);
        if (response.data.success) {
          setAccountGroups(response.data.data);
        }
      } catch {
        setError("Could not fetch account groups.");
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupChange = async (e) => {
    const value = e.target.value;
    setSelectedGroup(value);
    setEntries([]);
    setLoadingEntries(true);
    setError("");
    try {
      const response = await ep1.get(`/api/v2/dsjournalsbygroupds?colid=${global1.colid}&accgroup=${encodeURIComponent(value)}`);
      if (response.data.success) {
        setEntries(
          response.data.data.map((item, index) => ({
            ...item,
            id: item._id || index
          }))
        );
      } else {
        setError(response.data.message);
      }
    } catch {
      setError("Error fetching entries.");
    } finally {
      setLoadingEntries(false);
    }
  };

  const columns = [
    { field: "year", headerName: "Year", width: 100 },
    { field: "accgroup", headerName: "Group", width: 140 },
    { field: "account", headerName: "Account", width: 160 },
    { field: "transactionref", headerName: "Transaction Ref", width: 170 },
    { field: "transaction", headerName: "Transaction", width: 120 },
    { field: "activitydate", headerName: "Date", width: 120 },
    { field: "debit", headerName: "Debit", width: 90 },
    { field: "credit", headerName: "Credit", width: 90 },
    { field: "type", headerName: "Type", width: 90 },
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
        Journal Entries by Account Group
      </Typography>
            </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <Select
            value={selectedGroup}
            onChange={handleGroupChange}
            displayEmpty
            disabled={loadingGroups}
          >
            <MenuItem value="">Select Account Group</MenuItem>
            {accountGroups.map((group) => (
              <MenuItem key={group._id} value={group.groupname}>
                {group.groupname} ({group.grouptype})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Journal Entries
        </Typography>
        {loadingEntries ? (
          <CircularProgress />
        ) : (
          <Box sx={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={entries}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default JournalsByGroupdsPage;
