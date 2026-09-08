import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button,
  Alert, List, ListItem, ListItemText,
  Switch, IconButton, Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ep1 from "../api/ep1"; // Axios instance
import global1 from "./global1";

function IpManagementPage() {
  const [ip, setIp] = useState("");
  const [email, setEmail] = useState("");
  const colid = global1.colid || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ipList, setIpList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchIpList();
  }, []);

  const fetchIpList = async () => {
    try {
      const res = await ep1.get("/api/v2/getallipsj");
      const ipsArray = Array.isArray(res.data.ips)
        ? res.data.ips
        : Array.isArray(res.data)
        ? res.data
        : [];
      setIpList(ipsArray);
    } catch (err) {
      console.error(err);
      setError("Failed to load IP list");
    }
  };

  const saveIpToDb = async () => {
    setMessage("");
    setError("");
    if (!ip || !email) {
      setError("IP and Email are required");
      return;
    }
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/addipj", { ip, email, colid });
      setMessage(res.data.message || "Saved successfully");
      setIp("");
      setEmail("");
      fetchIpList();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (ip, isActive) => {
    try {
      await ep1.post("/api/v2/updatestatusj", { ip, isActive });
      fetchIpList();
    } catch {
      setError("Failed to update status");
    }
  };

  const handleDelete = async (ip) => {
    try {
      await ep1.get(`/api/v2/deleteipj?ip=${encodeURIComponent(ip)}`);
      fetchIpList();
    } catch {
      setError("Failed to delete IP");
    }
  };

  // Filter IPs if searchTerm exists
  const filteredIpList = ipList.filter(item => {
    if (!searchTerm.trim()) return true; // show all if no search
    const term = searchTerm.toLowerCase();
    return (
      String(item.ip || "").toLowerCase().includes(term) ||
      String(item.email || "").toLowerCase().includes(term) ||
      String(item.colid || "").toLowerCase().includes(term)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredIpList.length / itemsPerPage);
  const paginatedIpList = filteredIpList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Box p={4} sx={{ maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        IP Address Management
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Add IP Form */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <TextField
          label="IP Address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 150 }}
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 150 }}
        />
        <Button variant="contained" onClick={saveIpToDb} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </Box>

      <TextField
        label="Search by IP, Email or ColID"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <List>
        {paginatedIpList.length === 0 ? (
          <Typography align="center" sx={{ mt: 3 }}>
            No IP records found
          </Typography>
        ) : (
          paginatedIpList.map(({ _id, ip, email, colid, isActive }) => (
            <React.Fragment key={_id}>
              <ListItem
                secondaryAction={
                  <>
                    <Switch
                      checked={isActive}
                      onChange={() => handleToggleStatus(ip, !isActive)}
                      edge="end"
                      sx={{ mr: 2 }}
                    />
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(ip)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`IP: ${ip}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Email: {email}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.primary">
                        Colid: {colid || "N/A"}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={1}>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Typography>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default IpManagementPage;
