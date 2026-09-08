// pages/LedgerInstallmentPageds.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowBack
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  marginBottom: theme.spacing(2),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  borderRadius: "12px",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const FilterBox = styled(Box)(({ theme }) => ({
  background: "#f8f9fa",
  borderRadius: "12px",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: "1px solid #e9ecef",
}));

// Helper function for currency formatting with sign
const formatAmountWithSign = (amount) => {
  const sign = amount > 0 ? "+" : "−";
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    signDisplay: "never",
  }).format(Math.abs(amount));
  return { sign, formattedAmount };
};

// Helper function for color based on amount
const getAmountColor = (amount) => {
  return amount > 0 ? "#e74c3c" : "#27ae60";
};

function LedgerInstallmentPageds() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [regno, setRegno] = useState("");
  const [semester, setSemester] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // Installment state
  const [installments, setInstallments] = useState([]);
  const [installmentMode, setInstallmentMode] = useState("amount");
  const [newInstallment, setNewInstallment] = useState({
    installmentNumber: 1,
    amount: "",
    duedate: "",
    percentage: "",
  });

  useEffect(() => {
    fetchAllEntries();
    fetchSemesters();
  }, []);

  const fetchAllEntries = async () => {
    try {
      setLoading(true);
      const response = await ep1.get("/api/v2/getallledgerentriesds", {
        params: { colid: global1.colid },
      });
      setEntries(response.data.data);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await ep1.get("/api/v2/getdistinctsemestersds", {
        params: { colid: global1.colid },
      });
      setSemesters(response.data.data);
    } catch (err) {
      console.error("Error fetching semesters:", err);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { colid: global1.colid };
      if (regno) params.regno = regno;
      if (semester) params.semester = semester;

      const response = await ep1.get("/api/v2/getallledgerentriesds", {
        params,
      });
      setEntries(response.data.data);
    } catch (err) {
      console.error("Error searching entries:", err);
      setError("Failed to search entries");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRegno("");
    setSemester("");
    setSelectedEntries([]);
    setInstallments([]);
    fetchAllEntries();
  };

  const handleSelectEntry = (entryId) => {
    setSelectedEntries((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedEntries(entries.map((entry) => entry._id));
    } else {
      setSelectedEntries([]);
    }
  };

  const getTotalSelectedAmount = () => {
    return entries
      .filter((entry) => selectedEntries.includes(entry._id))
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const handleOpenDialog = () => {
    if (selectedEntries.length === 0) {
      setError("Please select at least one entry");
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setInstallments([]);
    setNewInstallment({
      installmentNumber: 1,
      amount: "",
      duedate: "",
      percentage: "",
    });
    setError("");
  };

  const handleAddInstallment = () => {
    const totalAmount = getTotalSelectedAmount();

    if (!newInstallment.classdate) {
      // ✅ Changed from duedate to classdate
      setError("Please enter class date for installment");
      return;
    }

    let calculatedAmount = 0;

    if (installmentMode === "percentage") {
      if (!newInstallment.percentage) {
        setError("Please enter percentage");
        return;
      }
      calculatedAmount =
        (totalAmount * parseFloat(newInstallment.percentage)) / 100;
    } else {
      if (!newInstallment.amount) {
        setError("Please enter amount");
        return;
      }
      calculatedAmount = parseFloat(newInstallment.amount);
    }

    const newInst = {
      installmentNumber: installments.length + 1,
      amount: calculatedAmount,
      classdate: newInstallment.classdate,
      percentage: newInstallment.percentage,
    };

    setInstallments([...installments, newInst]);
    setNewInstallment({
      installmentNumber: installments.length + 2,
      amount: "",
      duedate: "",
      percentage: "",
    });
    setError("");
  };

  const handleDeleteInstallment = (index) => {
    const updated = installments.filter((_, i) => i !== index);
    setInstallments(updated);
  };

  const handleCreateInstallments = async () => {
    const totalAmount = getTotalSelectedAmount();
    const totalInstallmentAmount = installments.reduce(
      (sum, inst) => sum + inst.amount,
      0
    );

    if (Math.abs(totalInstallmentAmount - totalAmount) > 0.01) {
      setError(
        `Total installment amount (₹${totalInstallmentAmount.toFixed(
          2
        )}) doesn't match total selected amount (₹${totalAmount.toFixed(2)})`
      );
      return;
    }

    try {
      setLoading(true);
      await ep1.post("/api/v2/createinstallmentsfromentriesds", {
        colid: global1.colid,
        name: global1.name,
        user: global1.user,
        selectedEntries: selectedEntries,
        installments: installments,
      });

      setSuccess("Installments created successfully!");
      setTimeout(() => {
        setSuccess("");
        handleCloseDialog();
        setSelectedEntries([]);
        fetchAllEntries();
      }, 2000);
    } catch (err) {
      console.error("Error creating installments:", err);
      setError(err.response?.data?.message || "Failed to create installments");
    } finally {
      setLoading(false);
    }
  };

  const totalInstallmentAmount = installments.reduce(
    (sum, inst) => sum + inst.amount,
    0
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      startIcon={<ArrowBack />}
                      onClick={() => navigate("/dashdashfacnew")}
                    >
                      Back
                    </Button>
                  </Box>
      {/* Header */}
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Create Installments from Ledger Entries
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Select entries and create installments with automatic payment tracking
        </Typography>
      </HeaderBox>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Search Filters */}
      <FilterBox>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Search & Filter
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Registration Number"
              value={regno}
              onChange={(e) => setRegno(e.target.value)}
              size="small"
              placeholder="Enter regno"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              size="small"
            >
              <MenuItem value="">All Semesters</MenuItem>
              {semesters.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontWeight: 600,
                }}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </FilterBox>

      {/* Selected Summary */}
      {selectedEntries.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <strong>{selectedEntries.length}</strong> entries selected | Total
              Amount:{" "}
              <strong>
                {(() => {
                  const { sign, formattedAmount } = formatAmountWithSign(
                    getTotalSelectedAmount()
                  );
                  return `${sign} ${formattedAmount}`;
                })()}
              </strong>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                fontWeight: 600,
              }}
            >
              Create Installments
            </Button>
          </Box>
        </Alert>
      )}

      {/* Entries Table */}
      <StyledCard>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            Ledger Entries ({entries.length} records)
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          entries.length > 0 &&
                          selectedEntries.length === entries.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reg. No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fee Item</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.length > 0 ? (
                    entries.map((entry) => {
                      const { sign, formattedAmount } = formatAmountWithSign(
                        entry.amount
                      );
                      const color = getAmountColor(entry.amount);

                      return (
                        <TableRow
                          key={entry._id}
                          sx={{
                            "&:hover": { backgroundColor: "#f8f9fa" },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedEntries.includes(entry._id)}
                              onChange={() => handleSelectEntry(entry._id)}
                            />
                          </TableCell>
                          <TableCell>{entry.student}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {entry.regno}
                          </TableCell>
                          <TableCell>{entry.feeitem}</TableCell>
                          <TableCell>{entry.feecategory}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                              fontSize: "1rem",
                              color: color,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <span
                                style={{ fontSize: "1.2rem", fontWeight: 700 }}
                              >
                                {sign}
                              </span>
                              <span>{formattedAmount}</span>
                            </Box>
                          </TableCell>
                          <TableCell>{entry.semester}</TableCell>
                          <TableCell>
                            <Chip
                              label={entry.status}
                              color={
                                entry.status === "paid" ? "success" : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography color="textSecondary">
                          No entries found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </StyledCard>

      {/* Create Installments Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create Installments</DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Total Selected Amount:{" "}
            <strong>
              {(() => {
                const { sign, formattedAmount } = formatAmountWithSign(
                  getTotalSelectedAmount()
                );
                return `${sign} ${formattedAmount}`;
              })()}
            </strong>
          </Alert>

          {/* Installment Mode */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Installment Mode
            </Typography>
            <RadioGroup
              row
              value={installmentMode}
              onChange={(e) => setInstallmentMode(e.target.value)}
            >
              <FormControlLabel
                value="amount"
                control={<Radio />}
                label="By Amount"
              />
              <FormControlLabel
                value="percentage"
                control={<Radio />}
                label="By Percentage"
              />
            </RadioGroup>
          </Box>

          {/* Add Installment Form */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {installmentMode === "percentage" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Percentage (%)"
                  type="number"
                  value={newInstallment.percentage}
                  onChange={(e) =>
                    setNewInstallment({
                      ...newInstallment,
                      percentage: e.target.value,
                    })
                  }
                  size="small"
                  inputProps={{ step: "0.01", min: "0", max: "100" }}
                  helperText={
                    newInstallment.percentage
                      ? `+ ₹${(
                          (getTotalSelectedAmount() *
                            parseFloat(newInstallment.percentage)) /
                          100
                        ).toFixed(2)}`
                      : ""
                  }
                />
              </Grid>
            )}

            {installmentMode === "amount" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={newInstallment.amount}
                  onChange={(e) =>
                    setNewInstallment({
                      ...newInstallment,
                      amount: e.target.value,
                    })
                  }
                  size="small"
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={newInstallment.classdate}
                onChange={(e) =>
                  setNewInstallment({
                    ...newInstallment,
                    classdate: e.target.value,
                  })
                }
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleAddInstallment}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontWeight: 600,
                }}
              >
                Add Installment
              </Button>
            </Grid>
          </Grid>

          {/* Installments Table */}
          {installments.length > 0 && (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Installment #
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {installments.map((inst, index) => {
                      const { sign, formattedAmount } = formatAmountWithSign(
                        inst.amount
                      );
                      return (
                        <TableRow key={index}>
                          <TableCell>{inst.installmentNumber}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              color: "#e74c3c",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 0.3,
                              }}
                            >
                              <span style={{ fontSize: "1rem" }}>+</span>
                              <span>{formattedAmount}</span>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {new Date(inst.classdate).toLocaleDateString(
                              "en-IN"
                            )}{" "}
                            // ✅ Changed
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteInstallment(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert
                severity={
                  Math.abs(totalInstallmentAmount - getTotalSelectedAmount()) <
                  0.01
                    ? "success"
                    : "warning"
                }
                sx={{ mt: 2 }}
              >
                Total Installment Amount:{" "}
                <strong>
                  + ₹
                  {totalInstallmentAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>{" "}
                / Total Selected:{" "}
                <strong>
                  {(() => {
                    const { sign, formattedAmount } = formatAmountWithSign(
                      getTotalSelectedAmount()
                    );
                    return `${sign} ${formattedAmount}`;
                  })()}
                </strong>
              </Alert>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateInstallments}
            disabled={loading || installments.length === 0}
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Installments"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LedgerInstallmentPageds;
