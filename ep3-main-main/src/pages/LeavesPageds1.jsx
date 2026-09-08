import { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Box,
  TextField,
  Autocomplete,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  CircularProgress,
  IconButton,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle,
  Cancel,
  Close as CloseIcon,
  CalendarToday,
  Pending,
  ArrowBack
} from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";

export default function LeavesPageds1() {
  const navigate = useNavigate();
  const colid = global1.colid;
  const userEmail = global1.user;
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isApprover, setIsApprover] = useState(false);
  const [rows, setRows] = useState([]);
  const [pendingRows, setPendingRows] = useState([]);
  const [types, setTypes] = useState([]);
  const [balances, setBalances] = useState([]);

  // Leave Form State
  const [form, setForm] = useState({
    email: userEmail,
    name: global1.name || "",
    reason: "",
    leavetype: "",
    from: null,
    to: null,
    isHalfDay: false,
    halfDayPeriod: "morning",
    colid: colid,
  });
  const [formErrors, setFormErrors] = useState({});

  // Enhanced Autocomplete Styles
  const leaveTypeAutocompleteStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      minHeight: '60px',
      width: '100%',
    },
    '& .MuiInputBase-input': {
      fontSize: '16px',
      padding: '18px 14px !important',
    },
    '& .MuiAutocomplete-input': {
      padding: '18px 14px !important',
    },
    width: '100%',
    flex: 1,
  };

  const openSnack = (msg, severity = "success") => {
    setSnack({ open: true, msg, severity });
  };

  const closeSnack = () => {
    setSnack({ ...snack, open: false });
  };

  // FIXED: Safe date formatter with null checks
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    try {
      return dayjs(dateValue).format("DD/MM/YYYY");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "-";
    }
  };

  // Check if user is approver by querying approver assignments
  const checkIfUserIsApprover = async () => {
    try {
      const res = await ep1.get(`/api/v2/getallapprovers1?colid=${colid}`);
      const approverList = res.data || [];
      
      // Check if current user email exists as an approver
      const userIsApprover = approverList.some(approver => 
        approver.approveremail === userEmail
      );
      
      setIsApprover(userIsApprover);
      return userIsApprover;
    } catch (error) {
      console.error("Error checking approver status:", error);
      // Fallback: check role from global1
      const roleBasedApprover = global1.role === "Faculty" || global1.role === "Admin" || global1.role === "HR";
      setIsApprover(roleBasedApprover);
      return roleBasedApprover;
    }
  };

  // Fetch Functions
  const fetchLeaves = async () => {
    try {
      const res = await ep1.get(`/api/v2/getleaves1?email=${userEmail}&colid=${colid}`);
      setRows(res.data || []);
      console.log(res.data);
      
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setRows([]);
      openSnack("Failed to fetch leave applications", "error");
    }
  };

  // Fetch pending leaves only if user is approver
  const fetchPendingLeaves = async () => {
    try {
      const res = await ep1.get(`/api/v2/getpendingleaves1?approveremail=${userEmail}&colid=${colid}`);
      setPendingRows(res.data || []);
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
      setPendingRows([]);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await ep1.get(`/api/v2/getleavetypes1?colid=${colid}`);
      setTypes(res.data || []);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      setTypes([]);
      openSnack("Failed to fetch leave types", "error");
    }
  };

  const fetchBalances = async () => {
    try {
      const res = await ep1.get(`/api/v2/getleavebalances1?email=${userEmail}&colid=${colid}`);
      setBalances(res.data || []);
    } catch (error) {
      console.error("Error fetching balances:", error);
      setBalances([]);
    }
  };

  // Improved useEffect with proper approver checking
  useEffect(() => {
    const initializePage = async () => {
      try {
        // First check if user is an approver
        const userIsApprover = await checkIfUserIsApprover();
        
        // Fetch all required data
        await Promise.all([
          fetchLeaves(),
          fetchLeaveTypes(),
          fetchBalances(),
        ]);

        // Only fetch pending leaves if user is an approver
        if (userIsApprover) {
          await fetchPendingLeaves();
        }
      } catch (error) {
        console.error("Error initializing page:", error);
        openSnack("Error loading page data", "error");
      }
    };

    initializePage();
  }, [userEmail, colid]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    
    if (!form.reason.trim()) errors.reason = "Reason is required";
    if (!form.leavetype) errors.leavetype = "Leave type is required";
    if (!form.from) errors.from = "From date is required";
    if (!form.to) errors.to = "To date is required";
    
    if (form.from && form.to) {
      if (dayjs(form.from).isAfter(dayjs(form.to))) {
        errors.to = "To date cannot be before from date";
      }
      
      if (form.isHalfDay && !dayjs(form.from).isSame(dayjs(form.to), 'day')) {
        errors.isHalfDay = "Half day can only be applied for single day";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate days
  const calculateDays = () => {
    if (!form.from || !form.to) return 0;
    
    if (form.isHalfDay && dayjs(form.from).isSame(dayjs(form.to), 'day')) {
      return 0.5;
    }
    
    return dayjs(form.to).diff(dayjs(form.from), 'day') + 1;
  };

  // Get available balance
  const getAvailableBalance = () => {
    const balance = balances.find(b => b.leaveType === form.leavetype);
    return balance ? balance.remaining : 0;
  };

  // Handle form submission
  const handleApplyLeave = async () => {
    if (!validateForm()) return;

    const days = calculateDays();
    const available = getAvailableBalance();
    
    if (days > available) {
      openSnack(`Insufficient balance. Required: ${days} days, Available: ${available} days`, "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        from: form.from.toISOString(),
        to: form.to.toISOString(),
        days: days,
      };
      
      await ep1.post(`/api/v2/createleave1`, payload);
      openSnack("Leave application submitted successfully");
      setDialogOpen(false);
      resetForm();
      fetchLeaves();
      fetchBalances();
    } catch (error) {
      const message = error.response?.data?.error || "Failed to submit leave application";
      openSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      email: userEmail,
      name: global1.name || "",
      reason: "",
      leavetype: "",
      from: null,
      to: null,
      isHalfDay: false,
      halfDayPeriod: "morning",
      colid: colid,
    });
    setFormErrors({});
  };

  // Handle approval/rejection
  const handleApproveReject = async (id, action, comment = "") => {
    setLoading(true);
    try {
      await ep1.post(`/api/v2/approverejectleave1?id=${id}`, {
        approveremail: userEmail,
        action,
        comment,
      });
      openSnack(`Leave ${action.toLowerCase()} successfully`);
      if (isApprover) {
        fetchPendingLeaves();
      }
      fetchLeaves();
    } catch (error) {
      const message = error.response?.data?.error || `Failed to ${action.toLowerCase()} leave`;
      openSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Correct valueFormatter for MUI X DataGrid
const leaveColumns = [
  { 
    field: "leavetype", 
    headerName: "Leave Type", 
    width: 150,
    renderCell: (params) => (
      <Chip label={params.value || "-"} color="primary" size="small" />
    )
  },
  { field: "reason", headerName: "Reason", flex: 1 },
  { 
    field: "from", 
    headerName: "From", 
    width: 120,
    // FIXED: Correct parameter access for MUI X DataGrid
    valueFormatter: (value) => {
      if (!value) return "-";
      try {
        return dayjs(value).format("DD/MM/YYYY");
      } catch (error) {
        console.error("Date formatting error:", error);
        return "-";
      }
    }
  },
  { 
    field: "to", 
    headerName: "To", 
    width: 120,
    // FIXED: Same correction for 'to' field
    valueFormatter: (value) => {
      if (!value) return "-";
      try {
        return dayjs(value).format("DD/MM/YYYY");
      } catch (error) {
        console.error("Date formatting error:", error);
        return "-";
      }
    }
  },
  { 
    field: "days", 
    headerName: "Days", 
    width: 80,
    renderCell: (params) => (
      <Chip 
        label={params.value || "0"} 
        color={params.row?.isHalfDay ? "secondary" : "default"} 
        size="small"
      />
    )
  },
  { 
    field: "isHalfDay",
    headerName: "Half Day",
    width: 100,
    renderCell: (params) => params.value ? (
      <Chip label={params.row?.halfDayPeriod || "Half Day"} color="secondary" size="small" />
    ) : "-"
  },
  { 
    field: "leavestatus", 
    headerName: "Status", 
    width: 120,
    renderCell: (params) => (
      <Chip 
        label={params.value || "Unknown"}
        color={
          params.value === "Approved" ? "success" :
          params.value === "Rejected" ? "error" : "warning"
        }
        size="small"
      />
    )
  },
  { 
    field: "createdAt", 
    headerName: "Applied On", 
    width: 120,
    // FIXED: Same correction for createdAt
    valueFormatter: (value) => {
      if (!value) return "-";
      try {
        return dayjs(value).format("DD/MM/YYYY");
      } catch (error) {
        console.error("Date formatting error:", error);
        return "-";
      }
    }
  },
];

// FIXED: Same corrections for pending columns
const pendingColumns = [
  { field: "name", headerName: "Employee", width: 150 },
  { field: "email", headerName: "Email", flex: 1 },
  { 
    field: "leavetype", 
    headerName: "Leave Type", 
    width: 120,
    renderCell: (params) => (
      <Chip label={params.value || "-"} color="primary" size="small" />
    )
  },
  { field: "reason", headerName: "Reason", flex: 1 },
  { 
    field: "from", 
    headerName: "From", 
    width: 120,
    valueFormatter: (value) => {
      if (!value) return "-";
      try {
        return dayjs(value).format("DD/MM/YYYY");
      } catch (error) {
        return "-";
      }
    }
  },
  { 
    field: "to", 
    headerName: "To", 
    width: 120,
    valueFormatter: (value) => {
      if (!value) return "-";
      try {
        return dayjs(value).format("DD/MM/YYYY");
      } catch (error) {
        return "-";
      }
    }
  },
  { 
    field: "days", 
    headerName: "Days", 
    width: 80,
    renderCell: (params) => (
      <Chip 
        label={params.value || "0"} 
        color={params.row?.isHalfDay ? "secondary" : "default"} 
        size="small"
      />
    )
  },
  {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 120,
    getActions: (params) => [
      <GridActionsCellItem
        key="approve"
        icon={<CheckCircle color="success" />}
        label="Approve"
        onClick={() => handleApproveReject(params.id, "Approved")}
        disabled={loading}
      />,
      <GridActionsCellItem
        key="reject"
        icon={<Cancel color="error" />}
        label="Reject"
        onClick={() => handleApproveReject(params.id, "Rejected")}
        disabled={loading}
      />,
    ],
  },
];

  const pageStyles = {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh',
    py: 3,
  };

  const headerCardStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    mb: 3,
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  };

  const mainCardStyles = {
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  };

  const balanceCardStyles = {
    textAlign: 'center',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  };

  const dialogStyles = {
    '& .MuiDialog-paper': {
      borderRadius: '16px',
      minWidth: '600px',
      maxWidth: '90vw',
    }
  };

  const buttonStyles = {
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    px: 3,
    py: 1.5,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={pageStyles}>
        <Container maxWidth="xl">
          {/* Header */}
          <Card sx={headerCardStyles}>
            <CardContent sx={{ color: 'white' }}>
              <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
                Back
              </Button>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Leave Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Apply for leaves and manage approval requests
              </Typography>
            </CardContent>
          </Card>

          {/* Balance Cards */}
          {balances.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {balances.map((balance, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={balanceCardStyles}>
                    <CardContent>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        {balance.leaveType}
                      </Typography>
                      <Typography variant="h4" sx={{ my: 1, fontWeight: 700 }}>
                        {balance.remaining}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        of {balance.total} days remaining
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tabs */}
          <Card sx={mainCardStyles}>
            <Tabs
              value={tab}
              onChange={(e, newValue) => setTab(newValue)}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontWeight: 500,
                  textTransform: 'none',
                }
              }}
            >
              <Tab
                label="My Leaves"
                icon={<CalendarToday />}
                iconPosition="start"
              />
              {isApprover && (
                <Tab
                  label={
                    <Badge badgeContent={pendingRows.length} color="error">
                      Pending Approvals
                    </Badge>
                  }
                  icon={<Pending />}
                  iconPosition="start"
                />
              )}
            </Tabs>

            {/* My Leaves Tab */}
            <Box hidden={tab !== 0} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  My Leave Applications ({rows.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogOpen(true)}
                  sx={buttonStyles}
                >
                  Apply for Leave
                </Button>
              </Box>
              
              {/* FIXED: Only render DataGrid if rows exist */}
              {rows.length > 0 ? (
                <DataGrid
                  rows={rows.map((item, idx) => ({ id: item._id || idx, ...item }))}
                  columns={leaveColumns}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10 },
                    },
                  }}
                  autoHeight
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-cell': {
                      borderBottom: 'none',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '& .MuiDataGrid-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No leave applications found. Click "Apply for Leave" to create your first application.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Pending Approvals Tab - Only show if user is approver */}
            {isApprover && (
              <Box hidden={tab !== 1} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Pending Approval Requests ({pendingRows.length})
                </Typography>
                
                {pendingRows.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No pending approval requests at this time.
                    </Typography>
                  </Box>
                ) : (
                  <DataGrid
                    rows={pendingRows.map((item, idx) => ({ id: item._id || idx, ...item }))}
                    columns={pendingColumns}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 10 },
                      },
                    }}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={{
                      '& .MuiDataGrid-cell': {
                        borderBottom: 'none',
                      },
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '& .MuiDataGrid-root': {
                        borderRadius: '8px',
                      },
                    }}
                  />
                )}
              </Box>
            )}
          </Card>

          {/* Apply Leave Dialog - Same as before with enhanced autocomplete */}
          <Dialog 
            open={dialogOpen} 
            onClose={() => {
              setDialogOpen(false);
              resetForm();
            }}
            maxWidth="md" 
            fullWidth
            sx={dialogStyles}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Apply for Leave
              <IconButton onClick={() => setDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={types}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setForm({ ...form, leavetype: newValue?.name || "" });
                    }}
                    value={types.find(type => type.name === form.leavetype) || null}
                    fullWidth
                    size="medium"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Leave Type"
                        error={!!formErrors.leavetype}
                        helperText={formErrors.leavetype}
                        required
                        fullWidth
                        sx={leaveTypeAutocompleteStyles}
                        InputProps={{
                          ...params.InputProps,
                          style: { fontSize: '16px' }
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ fontSize: '16px', padding: '12px 16px' }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {option.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.code} - {option.description}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Leave"
                    multiline
                    rows={3}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    error={!!formErrors.reason}
                    helperText={formErrors.reason}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="From Date"
                    value={form.from}
                    onChange={(newValue) => {
                      setForm({ ...form, from: newValue });
                      if (form.isHalfDay) {
                        setForm({ ...form, from: newValue, to: newValue });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!formErrors.from}
                        helperText={formErrors.from}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    )}
                    minDate={dayjs()}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="To Date"
                    value={form.to}
                    onChange={(newValue) => setForm({ ...form, to: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!formErrors.to}
                        helperText={formErrors.to}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    )}
                    minDate={form.from || dayjs()}
                    disabled={form.isHalfDay}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isHalfDay}
                        onChange={(e) => {
                          const isHalfDay = e.target.checked;
                          setForm({
                            ...form,
                            isHalfDay,
                            to: isHalfDay ? form.from : form.to,
                          });
                        }}
                      />
                    }
                    label="Half Day Leave"
                  />
                  {formErrors.isHalfDay && (
                    <Typography variant="caption" color="error" display="block">
                      {formErrors.isHalfDay}
                    </Typography>
                  )}
                </Grid>

                {form.isHalfDay && (
                  <Grid item xs={12}>
                    <FormControl>
                      <FormLabel>Half Day Period</FormLabel>
                      <RadioGroup
                        row
                        value={form.halfDayPeriod}
                        onChange={(e) => setForm({ ...form, halfDayPeriod: e.target.value })}
                      >
                        <FormControlLabel value="morning" control={<Radio />} label="Morning" />
                        <FormControlLabel value="afternoon" control={<Radio />} label="Afternoon" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                )}

                {form.from && form.to && form.leavetype && (
                  <Grid item xs={12}>
                    <Card sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: '8px' }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Leave Summary
                        </Typography>
                        <Typography variant="body2">
                          <strong>Days Requested:</strong> {calculateDays()} days
                          {form.isHalfDay && ` (${form.halfDayPeriod} half day)`}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Available Balance:</strong> {getAvailableBalance()} days
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={calculateDays() <= getAvailableBalance() ? "success.main" : "error.main"}
                        >
                          <strong>Status:</strong> {
                            calculateDays() <= getAvailableBalance() 
                              ? "✓ Sufficient balance" 
                              : "✗ Insufficient balance"
                          }
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDialogOpen(false)} sx={buttonStyles}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleApplyLeave}
                disabled={loading || calculateDays() > getAvailableBalance()}
                startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                sx={buttonStyles}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snack.open}
            autoHideDuration={4000}
            onClose={closeSnack}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={closeSnack} severity={snack.severity} sx={{ width: '100%', borderRadius: '8px' }}>
              {snack.msg}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
