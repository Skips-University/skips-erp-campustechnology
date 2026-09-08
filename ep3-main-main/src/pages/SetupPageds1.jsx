import { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Settings,
  AccountBalance,
  SupervisorAccount,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack
} from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";

export default function SetupPage() {
  const navigate = useNavigate();
  const colid = global1.colid;
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  // Leave Types State
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypeDialog, setLeaveTypeDialog] = useState(false);
  const [leaveTypeForm, setLeaveTypeForm] = useState({ 
    name: "", 
    code: "", 
    description: "",
    colid: colid 
  });
  const [leaveTypeErrors, setLeaveTypeErrors] = useState({});
  const [editingLeaveType, setEditingLeaveType] = useState(null);

  // Leave Balances State
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [balanceDialog, setBalanceDialog] = useState(false);
  const [balanceForm, setBalanceForm] = useState({ 
    email: "", 
    name: "",
    leaveType: "", 
    year: new Date().getFullYear().toString(), 
    total: "",
    colid: colid 
  });
  const [balanceErrors, setBalanceErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [editingBalance, setEditingBalance] = useState(null);

  // Approvers State
  const [approvers, setApprovers] = useState([]);
  const [approverDialog, setApproverDialog] = useState(false);
  const [approverForm, setApproverForm] = useState({
    employee: null,
    approver: null,
    level: 1,
    colid: colid,
  });
  const [approverErrors, setApproverErrors] = useState({});
  const [editingApprover, setEditingApprover] = useState(null);

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Enhanced Autocomplete Styles
  const autocompleteStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      minHeight: '65px',
      width: '100%',
      '& fieldset': {
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderWidth: '2px',
      },
      '&.Mui-focused fieldset': {
        borderWidth: '2px',
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '16px',
      padding: '20px 14px !important',
      height: 'auto',
    },
    '& .MuiAutocomplete-input': {
      padding: '20px 14px !important',
    },
    '& .MuiInputLabel-root': {
      fontSize: '16px',
      top: '-2px',
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
    minWidth: '100%',
    width: '100%',
    flex: 1,
  };

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

  // FIXED: Enhanced Reset Functions
  const resetLeaveTypeForm = () => {
    setLeaveTypeForm({ 
      name: "", 
      code: "", 
      description: "", 
      colid: colid 
    });
    setLeaveTypeErrors({});
    setEditingLeaveType(null); // Clear editing state
  };

  const resetBalanceForm = () => {
    setBalanceForm({ 
      email: "", 
      name: "",
      leaveType: "", 
      year: new Date().getFullYear().toString(), 
      total: "",
      colid: colid,
      employee: null // Clear selected employee
    });
    setBalanceErrors({});
    setEditingBalance(null); // Clear editing state
  };

  const resetApproverForm = () => {
    setApproverForm({
      employee: null,
      approver: null,
      level: 1,
      colid: colid,
    });
    setApproverErrors({});
    setEditingApprover(null); // Clear editing state
  };

  // Fetch data functions
  const fetchLeaveTypes = async () => {
    try {
      const res = await ep1.get(`/api/v2/getleavetypes1?colid=${colid}`);
      setLeaveTypes(res.data);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      openSnack("Failed to fetch leave types", "error");
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const res = await ep1.get(`/api/v2/getleavebalances1?colid=${colid}`);
      setLeaveBalances(res.data);
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      openSnack("Failed to fetch leave balances", "error");
    }
  };

  const fetchApprovers = async () => {
    try {
      const res = await ep1.get(`/api/v2/getallapprovers1?colid=${colid}`);
      setApprovers(res.data);
    } catch (error) {
      console.error("Error fetching approvers:", error);
      openSnack("Failed to fetch approvers", "error");
    }
  };

  const searchUsers = async (query) => {
    if (!query || query.length < 2) return [];
    try {
      const res = await ep1.get(`/api/v2/searchuserbyemailorname1?q=${query}&colid=${colid}`);
      return res.data;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaveBalances();
    fetchApprovers();
  }, []);

  // Leave Type Functions
  const validateLeaveTypeForm = () => {
    const errors = {};
    if (!leaveTypeForm.name.trim()) errors.name = "Name is required";
    if (!leaveTypeForm.code.trim()) errors.code = "Code is required";
    setLeaveTypeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrUpdateLeaveType = async () => {
    if (!validateLeaveTypeForm()) return;

    setLoading(true);
    try {
      if (editingLeaveType) {
        await ep1.post(`/api/v2/updateleavetype?id=${editingLeaveType._id}`, leaveTypeForm);
        openSnack("Leave type updated successfully");
      } else {
        await ep1.post(`/api/v2/createleavetype1`, leaveTypeForm);
        openSnack("Leave type created successfully");
      }
      // FIXED: Reset form after successful operation
      resetLeaveTypeForm();
      setLeaveTypeDialog(false);
      fetchLeaveTypes();
    } catch (error) {
      const message = error.response?.data?.error || `Failed to ${editingLeaveType ? 'update' : 'create'} leave type`;
      openSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditLeaveType = (item) => {
    setEditingLeaveType(item);
    setLeaveTypeForm({
      name: item.name,
      code: item.code,
      description: item.description || "",
      colid: colid
    });
    setLeaveTypeDialog(true);
  };

  const handleDeleteLeaveType = async (id) => {
    setLoading(true);
    try {
      await ep1.get(`/api/v2/deleteleavetype?id=${id}`);
      openSnack("Leave type deleted successfully");
      fetchLeaveTypes();
      setDeleteDialog(false);
      setDeleteItem(null); // FIXED: Clear delete state
    } catch (error) {
      const message = error.response?.data?.error || "Failed to delete leave type";
      openSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Balance Functions
  const validateBalanceForm = () => {
    const errors = {};
    if (!balanceForm.email) errors.email = "Employee is required";
    if (!balanceForm.name.trim()) errors.name = "Name is required";
    if (!balanceForm.leaveType) errors.leaveType = "Leave type is required";
    if (!balanceForm.year) errors.year = "Year is required";
    if (!balanceForm.total || isNaN(balanceForm.total) || balanceForm.total <= 0) {
      errors.total = "Valid total days required";
    }
    setBalanceErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrUpdateBalance = async () => {
    if (!validateBalanceForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...balanceForm,
        total: parseFloat(balanceForm.total),
        name: balanceForm.employee?.name || balanceForm.name,
        email: balanceForm.employee?.email || balanceForm.email,
      };
      
      if (editingBalance) {
        await ep1.post(`/api/v2/updateleavebalance?id=${editingBalance._id}`, payload);
        openSnack("Leave balance updated successfully");
      } else {
        await ep1.post(`/api/v2/createleavebalance1`, payload);
        openSnack("Leave balance created successfully");
      }
      // FIXED: Reset form after successful operation
      resetBalanceForm();
      setBalanceDialog(false);
      fetchLeaveBalances();
    } catch (error) {
      const message = error.response?.data?.error || `Failed to ${editingBalance ? 'update' : 'create'} leave balance`;
      openSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBalance = (item) => {
    setEditingBalance(item);
    setBalanceForm({
      email: item.email,
      name: item.name,
      leaveType: item.leaveType,
      year: item.year,
      total: item.total.toString(),
      colid: colid,
      employee: { name: item.name, email: item.email }
    });
    setBalanceDialog(true);
  };

  const handleDeleteBalance = async (id) => {
    setLoading(true);
    try {
      await ep1.get(`/api/v2/deleteleavebalance?id=${id}`);
      openSnack("Leave balance deleted successfully");
      fetchLeaveBalances();
      setDeleteDialog(false);
      setDeleteItem(null); // FIXED: Clear delete state
    } catch (error) {
      const message = error.response?.data?.error || "Failed to delete leave balance";
      openSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Approver Functions
  const validateApproverForm = () => {
    const errors = {};
    if (!approverForm.employee) errors.employee = "Employee is required";
    if (!approverForm.approver) errors.approver = "Approver is required";
    if (!approverForm.level) errors.level = "Level is required";
    setApproverErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrUpdateApprover = async () => {
    if (!validateApproverForm()) return;

    setLoading(true);
    try {
      const payload = {
        employeename: approverForm.employee.name,
        employeeemail: approverForm.employee.email,
        approvername: approverForm.approver.name,
        approveremail: approverForm.approver.email,
        level: approverForm.level,
        colid: colid,
      };
      
      if (editingApprover) {
        await ep1.post(`/api/v2/updateapprover?id=${editingApprover._id}`, payload);
        openSnack("Approver updated successfully");
      } else {
        await ep1.post(`/api/v2/assignapprover1`, payload);
        openSnack("Approver assigned successfully");
      }
      // FIXED: Reset form after successful operation
      resetApproverForm();
      setApproverDialog(false);
      fetchApprovers();
    } catch (error) {
      const message = error.response?.data?.error || `Failed to ${editingApprover ? 'update' : 'assign'} approver`;
      openSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditApprover = (item) => {
    setEditingApprover(item);
    setApproverForm({
      employee: { name: item.employeename, email: item.employeeemail },
      approver: { name: item.approvername, email: item.approveremail },
      level: item.level,
      colid: colid,
    });
    setApproverDialog(true);
  };

  const handleDeleteApprover = async (id) => {
    setLoading(true);
    try {
      await ep1.get(`/api/v2/deleteapprover?id=${id}`);
      openSnack("Approver deleted successfully");
      fetchApprovers();
      setDeleteDialog(false);
      setDeleteItem(null); // FIXED: Clear delete state
    } catch (error) {
      const message = error.response?.data?.error || "Failed to delete approver";
      openSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete confirmation
  const confirmDelete = (item, type) => {
    setDeleteItem({ ...item, type });
    setDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteItem.type === 'leavetype') {
      handleDeleteLeaveType(deleteItem._id);
    } else if (deleteItem.type === 'balance') {
      handleDeleteBalance(deleteItem._id);
    } else if (deleteItem.type === 'approver') {
      handleDeleteApprover(deleteItem._id);
    }
  };

  // Data Grid Columns with Actions
  const leaveTypeColumns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "code", headerName: "Code", width: 120 },
    { field: "description", headerName: "Description", flex: 1 },
    { 
      field: "isactive", 
      headerName: "Status", 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? "Active" : "Inactive"} 
          color={params.value ? "success" : "error"}
          size="small"
        />
      )
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditLeaveType(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => confirmDelete(params.row, 'leavetype')}
        />,
      ],
    },
  ];

  const balanceColumns = [
    { field: "name", headerName: "Employee", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "leaveType", headerName: "Leave Type", width: 150 },
    { field: "year", headerName: "Year", width: 100 },
    { field: "total", headerName: "Total", width: 80 },
    { field: "used", headerName: "Used", width: 80 },
    { field: "remaining", headerName: "Remaining", width: 100 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditBalance(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => confirmDelete(params.row, 'balance')}
        />,
      ],
    },
  ];

  const approverColumns = [
    { field: "employeename", headerName: "Employee", flex: 1 },
    { field: "employeeemail", headerName: "Employee Email", flex: 1 },
    { field: "approvername", headerName: "Approver", flex: 1 },
    { field: "approveremail", headerName: "Approver Email", flex: 1 },
    { field: "level", headerName: "Level", width: 80 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditApprover(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => confirmDelete(params.row, 'approver')}
        />,
      ],
    },
  ];

  // FIXED: Tab configuration with proper create handlers
  const tabConfig = [
    {
      label: "Leave Types",
      icon: <Settings />,
      data: leaveTypes,
      columns: leaveTypeColumns,
      onAdd: () => {
        // FIXED: Reset everything before opening create dialog
        resetLeaveTypeForm();
        setLeaveTypeDialog(true);
      },
    },
    {
      label: "Leave Balances", 
      icon: <AccountBalance />,
      data: leaveBalances,
      columns: balanceColumns,
      onAdd: () => {
        // FIXED: Reset everything before opening create dialog
        resetBalanceForm();
        setBalanceDialog(true);
      },
    },
    {
      label: "Approvers",
      icon: <SupervisorAccount />,
      data: approvers,
      columns: approverColumns,
      onAdd: () => {
        // FIXED: Reset everything before opening create dialog
        resetApproverForm();
        setApproverDialog(true);
      },
    },
  ];

  // Styling
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

  const dialogStyles = {
    '& .MuiDialog-paper': {
      borderRadius: '16px',
      minWidth: '600px',
      maxWidth: '90vw',
    },
    '& .MuiDialogContent-root': {
      paddingTop: '24px !important',
      paddingBottom: '24px !important',
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
    <Box sx={pageStyles}>
      <Container maxWidth="xl">
        {/* Header */}
        <Card sx={headerCardStyles}>
          <CardContent sx={{ color: 'white' }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2, color: 'white' }}>
              Back
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Leave Management Setup
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Configure leave types, balances, and approval workflows
            </Typography>
          </CardContent>
        </Card>

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
            {tabConfig.map((config, index) => (
              <Tab
                key={index}
                label={config.label}
                icon={config.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>

          {/* Tab Content */}
          {tabConfig.map((config, index) => (
            <Box key={index} hidden={tab !== index} sx={{ p: 3 }}>
              {tab === index && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {config.label} ({config.data.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={config.onAdd}
                      sx={buttonStyles}
                    >
                      Add {config.label.slice(0, -1)}
                    </Button>
                  </Box>
                  
                  <DataGrid
                    rows={config.data.map((item, idx) => ({ id: item._id || idx, ...item }))}
                    columns={config.columns}
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
                </Box>
              )}
            </Box>
          ))}
        </Card>

        {/* FIXED: Leave Type Dialog with proper close handling */}
        <Dialog 
          open={leaveTypeDialog} 
          onClose={() => {
            // FIXED: Reset form and close dialog
            resetLeaveTypeForm();
            setLeaveTypeDialog(false);
          }}
          maxWidth="sm" 
          fullWidth
          sx={dialogStyles}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingLeaveType ? 'Edit Leave Type' : 'Add Leave Type'}
            <IconButton onClick={() => {
              // FIXED: Reset form when clicking close button
              resetLeaveTypeForm();
              setLeaveTypeDialog(false);
            }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Leave Type Name"
                  value={leaveTypeForm.name}
                  onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })}
                  error={!!leaveTypeErrors.name}
                  helperText={leaveTypeErrors.name}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Leave Code"
                  value={leaveTypeForm.code}
                  onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, code: e.target.value.toUpperCase() })}
                  error={!!leaveTypeErrors.code}
                  helperText={leaveTypeErrors.code}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={leaveTypeForm.description}
                  onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, description: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => {
              // FIXED: Reset form when clicking cancel
              resetLeaveTypeForm();
              setLeaveTypeDialog(false);
            }} sx={buttonStyles}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCreateOrUpdateLeaveType}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              sx={buttonStyles}
            >
              {loading ? (editingLeaveType ? "Updating..." : "Creating...") : (editingLeaveType ? "Update Leave Type" : "Create Leave Type")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* FIXED: Balance Dialog with proper close handling */}
        <Dialog 
          open={balanceDialog} 
          onClose={() => {
            // FIXED: Reset form and close dialog
            resetBalanceForm();
            setBalanceDialog(false);
          }}
          maxWidth="md" 
          fullWidth
          sx={dialogStyles}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingBalance ? 'Edit Leave Balance' : 'Add Leave Balance'}
            <IconButton onClick={() => {
              // FIXED: Reset form when clicking close button
              resetBalanceForm();
              setBalanceDialog(false);
            }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  onInputChange={async (event, newInputValue) => {
                    if (newInputValue && newInputValue.length >= 2) {
                      const results = await searchUsers(newInputValue);
                      setUsers(results);
                    }
                  }}
                  onChange={(event, newValue) => {
                    setBalanceForm({ 
                      ...balanceForm, 
                      employee: newValue,
                      email: newValue?.email || "",
                      name: newValue?.name || ""
                    });
                  }}
                  value={balanceForm.employee}
                  fullWidth
                  size="medium"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Employee"
                      error={!!balanceErrors.email}
                      helperText={balanceErrors.email || "Type at least 2 characters to search"}
                      required
                      fullWidth
                      sx={autocompleteStyles}
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
                          {option.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={leaveTypes}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setBalanceForm({ ...balanceForm, leaveType: newValue?.name || "" });
                  }}
                  value={leaveTypes.find(type => type.name === balanceForm.leaveType) || null}
                  fullWidth
                  size="medium"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Leave Type"
                      error={!!balanceErrors.leaveType}
                      helperText={balanceErrors.leaveType}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year"
                  value={balanceForm.year}
                  onChange={(e) => setBalanceForm({ ...balanceForm, year: e.target.value })}
                  error={!!balanceErrors.year}
                  helperText={balanceErrors.year}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total Days"
                  type="number"
                  value={balanceForm.total}
                  onChange={(e) => setBalanceForm({ ...balanceForm, total: e.target.value })}
                  error={!!balanceErrors.total}
                  helperText={balanceErrors.total}
                  required
                  inputProps={{ min: 0, step: 0.5 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => {
              // FIXED: Reset form when clicking cancel
              resetBalanceForm();
              setBalanceDialog(false);
            }} sx={buttonStyles}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCreateOrUpdateBalance}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              sx={buttonStyles}
            >
              {loading ? (editingBalance ? "Updating..." : "Creating...") : (editingBalance ? "Update Balance" : "Create Balance")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* FIXED: Approver Dialog with proper close handling */}
        <Dialog 
          open={approverDialog} 
          onClose={() => {
            // FIXED: Reset form and close dialog
            resetApproverForm();
            setApproverDialog(false);
          }}
          maxWidth="md" 
          fullWidth
          sx={dialogStyles}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingApprover ? 'Edit Approver' : 'Assign Approver'}
            <IconButton onClick={() => {
              // FIXED: Reset form when clicking close button
              resetApproverForm();
              setApproverDialog(false);
            }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  onInputChange={async (event, newInputValue) => {
                    if (newInputValue && newInputValue.length >= 2) {
                      const results = await searchUsers(newInputValue);
                      setUsers(results);
                    }
                  }}
                  onChange={(event, newValue) => {
                    setApproverForm({ ...approverForm, employee: newValue });
                  }}
                  value={approverForm.employee}
                  fullWidth
                  size="medium"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Employee"
                      error={!!approverErrors.employee}
                      helperText={approverErrors.employee || "Type at least 2 characters to search"}
                      required
                      fullWidth
                      sx={autocompleteStyles}
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
                          {option.email} - {option.role}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  onInputChange={async (event, newInputValue) => {
                    if (newInputValue && newInputValue.length >= 2) {
                      const results = await searchUsers(newInputValue);
                      setUsers(results);
                    }
                  }}
                  onChange={(event, newValue) => {
                    setApproverForm({ ...approverForm, approver: newValue });
                  }}
                  value={approverForm.approver}
                  fullWidth
                  size="medium"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Approver"
                      error={!!approverErrors.approver}
                      helperText={approverErrors.approver || "Type at least 2 characters to search"}
                      required
                      fullWidth
                      sx={autocompleteStyles}
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
                          {option.email} - {option.role}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={[1, 2]}
                  getOptionLabel={(option) => `Level ${option}`}
                  onChange={(event, newValue) => {
                    setApproverForm({ ...approverForm, level: newValue });
                  }}
                  value={approverForm.level}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Approval Level"
                      error={!!approverErrors.level}
                      helperText={approverErrors.level || "Level 1: First approver, Level 2: Final approver"}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => {
              // FIXED: Reset form when clicking cancel
              resetApproverForm();
              setApproverDialog(false);
            }} sx={buttonStyles}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCreateOrUpdateApprover}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              sx={buttonStyles}
            >
              {loading ? (editingApprover ? "Updating..." : "Assigning...") : (editingApprover ? "Update Approver" : "Assign Approver")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* FIXED: Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => {
          // FIXED: Clear delete state when closing
          setDeleteDialog(false);
          setDeleteItem(null);
        }} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this {deleteItem?.type}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => {
              // FIXED: Clear delete state when canceling
              setDeleteDialog(false);
              setDeleteItem(null);
            }} sx={buttonStyles}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleConfirmDelete}
              disabled={loading}
              sx={buttonStyles}
            >
              {loading ? "Deleting..." : "Delete"}
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
  );
}
