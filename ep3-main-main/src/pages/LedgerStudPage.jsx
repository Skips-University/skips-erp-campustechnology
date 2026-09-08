// pages/LedgerStudPage.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Button,
  Dialog,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  Clear as ClearIcon,
  ArrowBack
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import global1 from "./global1";
import ep1 from "../api/ep1";
// CORRECT:
import AddLedgerFormds from "./AddLedgerFormds";
import PaymentDialogds from "./PaymentDialogds";
import { useNavigate } from "react-router-dom";
// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
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
  marginBottom: theme.spacing(3),
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

function LedgerStudPage() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [ledgers, setLedgers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [filters, setFilters] = useState({
    feeitem: "",
    feecategory: "",
    type: "",
    status: "",
    academicyear: "",
    semester: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    feeItems: [],
    feeCategories: [],
    academicYears: [],
    semesters: [],
  });

  // Fetch ledgers on component mount and when filters change
  useEffect(() => {
    fetchLedgers();
    fetchFilterOptions();
  }, [filters]);

  const fetchLedgers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const queryParams = new URLSearchParams({
        colid: global1.colid,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== "")
        ),
      });

      const response = await ep1.get(`/api/v2/getledgersds?${queryParams}`);
      setLedgers(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching ledgers:", error);
      setErrorMessage("Failed to fetch ledger data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await ep1.get("/api/v2/getfilteroptionsds", {
        params: { colid: global1.colid },
      });
      setFilterOptions(response.data);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleFilterChange = (e) => {
    setPage(0);
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetFilters = () => {
    setPage(0);
    setFilters({
      feeitem: "",
      feecategory: "",
      type: "",
      status: "",
      academicyear: "",
      semester: "",
    });
  };

  const handleAddLedger = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleLedgerAdded = () => {
    setSuccessMessage("Ledger entry added successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
    setOpenDialog(false);
    fetchLedgers();
  };

  const handlePaymentClick = (ledger) => {
    setSelectedLedger(ledger);
    setPaymentDialogOpen(true);
  };

  const handleMarkAsPaid = async (paymode, paydetails) => {
    try {
      setPaymentLoading(true);
      await ep1.post("/api/v2/markaspaidds", {
        ledgerId: selectedLedger._id,
        paymode,
        paydetails,
        colid: global1.colid,
        name: global1.name,
        user: global1.user,
      });

      setSuccessMessage("Payment recorded successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      setPaymentDialogOpen(false);
      setSelectedLedger(null);
      fetchLedgers();
    } catch (error) {
      console.error("Error marking as paid:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to record payment"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLedgers = ledgers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusChip = (status, type) => {
    if (type === "negative") {
      return <Chip label="Paid" color="success" size="small" />;
    }
    return status === "paid" ? (
      <Chip label="Paid" color="success" size="small" />
    ) : (
      <Chip label="Due" color="warning" size="small" />
    );
  };

  const getTypeChip = (type) => {
    return type === "positive" ? (
      <Chip label="Payable" color="error" variant="outlined" size="small" />
    ) : (
      <Chip label="Paid" color="success" variant="outlined" size="small" />
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Math.abs(amount));
  };

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
      {/* Success Alert */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
          sx={{ mb: 2 }}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage("")}
          sx={{ mb: 2 }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Header */}
      <HeaderBox>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Student Ledger Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage student fee payments and track financial records
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: "white",
              color: "#667eea",
              fontWeight: 600,
              "&:hover": { bgcolor: "#f0f0f0" },
            }}
            startIcon={<AddIcon />}
            onClick={handleAddLedger}
          >
            Add Entry
          </Button>
        </Box>
      </HeaderBox>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <Typography
                  color="inherit"
                  sx={{ fontSize: "0.875rem", opacity: 0.9 }}
                >
                  Total Due
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                  {formatCurrency(summary.totalDue)}
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <CardContent>
                <Typography
                  color="inherit"
                  sx={{ fontSize: "0.875rem", opacity: 0.9 }}
                >
                  Total Paid
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                  {formatCurrency(summary.totalPaid)}
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <CardContent>
                <Typography
                  color="inherit"
                  sx={{ fontSize: "0.875rem", opacity: 0.9 }}
                >
                  Total Payable
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                  {formatCurrency(summary.totalPositive)}
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              }}
            >
              <CardContent>
                <Typography
                  color="inherit"
                  sx={{ fontSize: "0.875rem", opacity: 0.9 }}
                >
                  Total Entries
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                  {summary.count}
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <FilterBox>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Fee Item"
              name="feeitem"
              value={filters.feeitem}
              onChange={handleFilterChange}
              size="small"
              variant="outlined"
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.feeItems?.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Fee Category"
              name="feecategory"
              value={filters.feecategory}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.feeCategories?.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="positive">Payable</MenuItem>
              <MenuItem value="negative">Paid</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="due">Due</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Academic Year"
              name="academicyear"
              value={filters.academicyear}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.academicYears?.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Semester"
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.semesters?.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleResetFilters}
              sx={{ fontWeight: 600 }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </FilterBox>

      {/* Ledger Table */}
      <StyledCard>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reg. No.</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fee Item</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLedgers.length > 0 ? (
                    paginatedLedgers.map((ledger) => {
                      const { sign, formattedAmount } = formatAmountWithSign(
                        ledger.amount
                      );
                      const color = getAmountColor(ledger.amount);

                      return (
                        <TableRow
                          key={ledger._id}
                          sx={{
                            "&:hover": { backgroundColor: "#f8f9fa" },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <TableCell>{ledger.student}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {ledger.regno}
                          </TableCell>
                          <TableCell>{ledger.feeitem}</TableCell>
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
                                style={{
                                  fontSize: "1.2rem",
                                  fontWeight: 700,
                                }}
                              >
                                {sign}
                              </span>
                              <span>{formattedAmount}</span>
                            </Box>
                          </TableCell>
                          <TableCell>{getTypeChip(ledger.type)}</TableCell>
                          <TableCell>
                            {getStatusChip(ledger.status, ledger.type)}
                          </TableCell>
                          <TableCell>
                            {ledger.classdate
                              ? new Date(ledger.classdate).toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell align="center">
                            {ledger.type === "positive" &&
                            ledger.status === "due" ? (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PaymentIcon />}
                                onClick={() => handlePaymentClick(ledger)}
                                sx={{
                                  background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  fontWeight: 600,
                                }}
                              >
                                Paid
                              </Button>
                            ) : (
                              <Chip label="Completed" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Typography color="textSecondary">
                          No ledger entries found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {ledgers.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={ledgers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </>
        )}
      </StyledCard>

      {/* Add Ledger Dialog - Using AddLedgerFormds component */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <AddLedgerFormds
          onClose={handleCloseDialog}
          onSuccess={handleLedgerAdded}
        />
      </Dialog>

      {/* Payment Dialog - Using PaymentDialogds component */}
      <PaymentDialogds
        open={paymentDialogOpen}
        ledger={selectedLedger}
        onClose={() => setPaymentDialogOpen(false)}
        onPaid={handleMarkAsPaid}
        loading={paymentLoading}
      />
    </Container>
  );
}

export default LedgerStudPage;
