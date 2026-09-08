import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Pagination,
  Alert
} from "@mui/material";
import { Edit, Delete, Add, Upload, Search } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [filterOptions, setFilterOptions] = useState({});
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Selected users for bulk actions
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchFilterOptions();
  }, [page, search, roleFilter, departmentFilter, semesterFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        page,
        limit: 20
      };
      
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (departmentFilter) params.department = departmentFilter;
      if (semesterFilter) params.semester = semesterFilter;

      const res = await ep1.get("/api/v2/ds1getalluser", { params });
      setUsers(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      setError("Error fetching users");
      console.error(err);
    }
    setLoading(false);
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/ds1getfilteroptions", {
        params: { colid: global1.colid }
      });
      setFilterOptions(res.data);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await ep1.get("/api/v2/ds1deleteuser", { params: { id: userId } });
      setMessage("User deleted successfully");
      fetchUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Error deleting user");
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      setError("No users selected");
      return;
    }

    if (!window.confirm(`Delete ${selectedUsers.length} selected users?`)) return;
    
    try {
      await ep1.get("/api/v2/ds1bulkdeleteuser", {
        params: { ids: selectedUsers.join(",") }
      });
      setMessage(`${selectedUsers.length} users deleted successfully`);
      setSelectedUsers([]);
      fetchUsers();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Error deleting users");
      console.error(err);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            User Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/admin/create-user")}
            >
              Add User
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => navigate("/admin/bulk-upload-users")}
            >
              Bulk Upload
            </Button>
            {selectedUsers.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
              >
                Delete ({selectedUsers.length})
              </Button>
            )}
          </Stack>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, regno, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="Role"
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.roles?.map(role => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.departments?.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              label="Semester"
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.semesters?.map(sem => (
                <MenuItem key={sem} value={sem}>{sem}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Users Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Regno</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Department</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Semester</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Loading...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No users found</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                      />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.regno}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.semester}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 1 ? "Active" : "Inactive"}
                        color={user.status === 1 ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/edit-user/${user._id}`)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Total: {total} users
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default UserManagement;
