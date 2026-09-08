import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete, Add, Upload, ArrowBack } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const UserManagementdsnov17 = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  // ✅ ADD THIS NEW STATE:
  const [filterOptions, setFilterOptions] = useState({
    roles: [],
    departments: [],
    semesters: [],
    sections: [],
  });
  // DataGrid pagination
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [rowCount, setRowCount] = useState(0);
  const [filterModel, setFilterModel] = useState({ items: [] });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ DEBUG: Check if colid exists
      console.log("🔍 Fetching users with colid:", global1.colid);

      if (!global1.colid) {
        setError("College ID (colid) is missing. Please log in again.");
        setLoading(false);
        return;
      }

      const params = {
        colid: global1.colid,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(departmentFilter && { department: departmentFilter }),
        ...(semesterFilter && { semester: semesterFilter }),
      };

      // ✅ ADD COLUMN FILTERS FROM DATAGRID
      if (filterModel.items && filterModel.items.length > 0) {
        filterModel.items.forEach((filter) => {
          if (filter.value) {
            params[filter.field] = filter.value;
          }
        });
      }

      const res = await ep1.get("/api/v2/ds1getalluser", { params });

      setUsers(res.data.data || []);
      setRowCount(res.data.pagination?.total || 0);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError(err.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD THIS NEW useEffect:
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (global1.colid) {
      fetchUsers();
    } else {
      setError("College ID is missing. Please log in.");
    }
  }, [
    paginationModel,
    search,
    roleFilter,
    departmentFilter,
    semesterFilter,
    filterModel,
  ]); // ✅ ADD filterModel

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await ep1.get(`/api/v2/ds1deleteuser?id=${id}`);
      setMessage("User deleted successfully");
      fetchUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting user");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      const idsString = selectedIds.join(",");
      await ep1.delete(`/api/v2/ds1bulkdeleteuser?ids=${idsString}`);
      setMessage(`${selectedIds.length} users deleted successfully`);
      setSelectedIds([]);
      setDeleteDialog(false);
      fetchUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting users");
    }
  };

  // ✅ ADD THIS NEW FUNCTION:
  const fetchFilterOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/ds1getfilteroptions", {
        params: { colid: global1.colid },
      });
      setFilterOptions(res.data);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  // DataGrid columns - ALL FIELDS with proper null handling
  const columns = [
    {
      field: "srno",
      headerName: "Sr No",
      width: 80,
      valueGetter: (value) => value || "N/A",
    },
    { field: "rollno", headerName: "Roll No", width: 150 }, // ✅ Increased width
    { field: "regno", headerName: "Reg No", width: 150 }, // ✅ Increased width
    { field: "name", headerName: "Name", width: 180 },
    { field: "email", headerName: "Email", width: 200 },
    {
      field: "phone",
      headerName: "Phone",
      width: 130,
      valueGetter: (value) => value || "N/A",
    },
    { field: "role", headerName: "Role", width: 100 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "semester", headerName: "Semester", width: 100 },
    { field: "section", headerName: "Section", width: 90 },
    { field: "programcode", headerName: "Program Code", width: 130 },
    { field: "admissionyear", headerName: "Admission Year", width: 130 },
    {
      field: "gender",
      headerName: "Gender",
      width: 90,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "dob",
      headerName: "DOB",
      width: 110,
      valueGetter: (value) => {
        if (!value) return "N/A";
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return "N/A";
        }
      },
    },
    {
      field: "category",
      headerName: "Category",
      width: 100,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "quota",
      headerName: "Quota",
      width: 100,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "fathername",
      headerName: "Father Name",
      width: 150,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "mothername",
      headerName: "Mother Name",
      width: 150,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "address",
      headerName: "Address",
      width: 200,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "eligibilityname",
      headerName: "Eligibility",
      width: 150,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "degree",
      headerName: "Degree",
      width: 120,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "minorsub",
      headerName: "Minor Sub",
      width: 120,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "vocationalsub",
      headerName: "Vocational Sub",
      width: 140,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "mdcsub",
      headerName: "MDC Sub",
      width: 120,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "othersub",
      headerName: "Other Sub",
      width: 120,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "merit",
      headerName: "Merit",
      width: 100,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "obtain",
      headerName: "Obtain",
      width: 100,
      valueGetter: (value) =>
        value !== null && value !== undefined ? value : "N/A",
    },
    {
      field: "bonus",
      headerName: "Bonus",
      width: 90,
      valueGetter: (value) =>
        value !== null && value !== undefined ? value : "N/A",
    },
    {
      field: "weightage",
      headerName: "Weightage",
      width: 110,
      valueGetter: (value) =>
        value !== null && value !== undefined ? value : "N/A",
    },
    {
      field: "ncctype",
      headerName: "NCC Type",
      width: 110,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "isdisabled",
      headerName: "Is Disabled",
      width: 110,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "scholarship",
      headerName: "Scholarship",
      width: 130,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "photo",
      headerName: "Photo URL",
      width: 150,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 90,
      valueGetter: (value) => (value === 1 ? "Active" : "Inactive"),
    },
    {
      field: "status1",
      headerName: "Status1",
      width: 100,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "addedby",
      headerName: "Added By",
      width: 150,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "comments",
      headerName: "Comments",
      width: 200,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "lastlogin",
      headerName: "Last Login",
      width: 180,
      valueGetter: (value) => {
        if (!value) return "N/A";
        try {
          return new Date(value).toLocaleString();
        } catch {
          return "Invalid Date";
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/edituserdsnov17/${params.row._id}`)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row._id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashdashfacnew")}
        >
          Back
        </Button>
        <Typography variant="h4">User Management</Typography>
      </Box>

      {/* Success/Error Messages */}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Actions Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/createuserdsnov17")}
          >
            Create User
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Upload />}
            onClick={() => navigate("/bulkuploadusersdsoct18")}
          >
            Bulk Upload
          </Button>
          {selectedIds.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialog(true)}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </Stack>

        {/* Filters */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            label="Search"
            placeholder="Name, Email, Regno, Phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.departments.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              value={semesterFilter}
              label="Semester"
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <MenuItem key={sem} value={sem.toString()}>
                  {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => {
              setSearch("");
              setRoleFilter("");
              setDepartmentFilter("");
              setSemesterFilter("");
            }}
          >
            Clear Filters
          </Button>
        </Stack>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pageSizeOptions={[10, 20, 50, 100]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          checkboxSelection
          disableRowSelectionOnClick
          filterMode="server" // ✅ ADD THIS
          filterModel={filterModel} // ✅ ADD THIS
          onFilterModelChange={(newModel) => {
            // ✅ ADD THIS
            setFilterModel(newModel);
            setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page
          }}
          onRowSelectionModelChange={(newSelection) => {
            setSelectedIds(newSelection);
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            "& .MuiDataGrid-cell": {
              borderRight: "1px solid #e0e0e0",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              borderBottom: "2px solid #1976d2",
            },
          }}
        />
      </Paper>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedIds.length} users? This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementdsnov17;
