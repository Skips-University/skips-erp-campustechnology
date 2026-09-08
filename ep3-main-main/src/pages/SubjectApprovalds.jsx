// src/pages/SubjectApprovalds.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  Stack,
  MenuItem,
  Select,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Pagination,
  CircularProgress,
  Chip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ep1 from "../api/ep1";
import global1 from "./global1";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];

export default function SubjectApprovalds() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState([]);
  const [selection, setSelection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  const fetchRows = async () => {
    if (!global1?.colid) {
      setToast({
        open: true,
        msg: "College ID not found. Please login again.",
        sev: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await ep1.get("/api/v2/searchApplications", {
        params: {
          colid: global1.colid,
          searchTerm: searchTerm, // ✅ Fixed: Changed from 'search' to 'searchTerm'
        },
      });

      // ✅ Fixed: Changed from data.items to data.data
      const items = (data.data || []).map((r) => ({
        id: r._id,
        ...r,
        dispType: r.groupname === "Language" ? r.type || "-" : "-",
        context: `${r.programcode || ""}/${r.semester || ""}/${r.year || ""}`,
      }));

      setRows(items);
      setPage(1);
    } catch (e) {
      console.error("Fetch error:", e);
      setToast({
        open: true,
        msg: e?.response?.data?.message || "Load error",
        sev: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line
  }, []);

  const handleStatusChange = async (rowId, newStatus) => {
    try {
      // ✅ Fixed: Send correct payload matching backend expectations
      await ep1.post("/api/v2/updateApplicationStatus", {
        id: rowId, // ✅ Changed from _id to id
        status: newStatus,
      });

      setToast({
        open: true,
        msg: `Status updated to ${newStatus}`,
        sev: "success",
      });
      fetchRows();
    } catch (e) {
      console.error("Status update error:", e);
      setToast({
        open: true,
        msg: e?.response?.data?.message || "Update error",
        sev: "error",
      });
    }
  };

  const bulkAction = async (action) => {
    try {
      if (selection.length === 0) {
        setToast({ open: true, msg: "No rows selected", sev: "info" });
        return;
      }

      // ✅ Fixed: Send correct payload matching backend expectations
      await ep1.post("/api/v2/bulkDecision", {
        ids: selection, // ✅ Changed from updates array to ids array
        status: action, // ✅ Changed from action to status
      });

      setToast({
        open: true,
        msg: `Bulk ${action} successful`,
        sev: "success",
      });
      await fetchRows();
      setSelection([]);
    } catch (e) {
      console.error("Bulk action error:", e);
      setToast({
        open: true,
        msg: e?.response?.data?.message || "Action error",
        sev: "error",
      });
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelection = paginatedRows.map((row) => row.id);
      setSelection(newSelection);
    } else {
      setSelection([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selection.indexOf(id);
    let newSelection = [];

    if (selectedIndex === -1) {
      newSelection = [...selection, id];
    } else {
      newSelection = selection.filter((selectedId) => selectedId !== id);
    }

    setSelection(newSelection);
  };

  const isSelected = (id) => selection.indexOf(id) !== -1;

  // Pagination
  const paginatedRows = rows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Faculty: Approval Queue
        </Typography>

        {/* Search Bar */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by student name, regno, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") fetchRows();
            }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={fetchRows}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </Stack>

        {/* Stats and Bulk Actions */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            {selection.length} row(s) selected | Total: {rows.length}{" "}
            applications
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              startIcon={<ThumbUpIcon />}
              onClick={() => bulkAction("Approved")}
              disabled={selection.length === 0}
            >
              Bulk Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<ThumbDownIcon />}
              onClick={() => bulkAction("Rejected")}
              disabled={selection.length === 0}
            >
              Bulk Reject
            </Button>
          </Stack>
        </Stack>

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      paginatedRows.length > 0 &&
                      selection.length > 0 &&
                      selection.length < paginatedRows.length
                    }
                    checked={
                      paginatedRows.length > 0 &&
                      selection.length === paginatedRows.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <strong>Student</strong>
                </TableCell>
                <TableCell>
                  <strong>Reg No</strong>
                </TableCell>
                <TableCell>
                  <strong>Group</strong>
                </TableCell>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Subject</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Program/Sem/Year</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No applications found. Use the search bar to find
                      applications.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => {
                  const isItemSelected = isSelected(row.id);
                  return (
                    <TableRow key={row.id} selected={isItemSelected} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectOne(row.id)}
                        />
                      </TableCell>
                      <TableCell>{row.student}</TableCell>
                      <TableCell>{row.regno}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.groupname}
                          size="small"
                          color={
                            row.groupname === "Major"
                              ? "primary"
                              : row.groupname === "Minor"
                              ? "secondary"
                              : row.groupname === "Language"
                              ? "warning"
                              : "info"
                          }
                        />
                      </TableCell>
                      <TableCell>{row.dispType}</TableCell>
                      <TableCell>{row.subject}</TableCell>
                      <TableCell>
                        <Select
                          value={row.status}
                          onChange={(e) =>
                            handleStatusChange(row.id, e.target.value)
                          }
                          size="small"
                          sx={{
                            minWidth: 120,
                            fontSize: "0.875rem",
                            backgroundColor:
                              row.status === "Approved"
                                ? "#e8f5e9"
                                : row.status === "Rejected"
                                ? "#ffebee"
                                : "#fff3e0",
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>{row.context}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleStatusChange(row.id, "Approved")}
                          title="Approve"
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleStatusChange(row.id, "Rejected")}
                          title="Reject"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {rows.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Paper>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          severity={toast.sev}
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
