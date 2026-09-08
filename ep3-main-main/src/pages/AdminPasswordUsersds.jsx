import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Key, Refresh, Search, Visibility, VisibilityOff } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const AdminPasswordUsersds = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const colid = useMemo(() => global1.colid, []);

  const fetchAdminUsers = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/api/v2/adminpasswordusersds", {
        params: { colid, search }
      });
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, [colid]);

  const openPasswordDialog = async (user) => {
    setSelectedUser(user);
    setPassword("");
    setShowPassword(false);
    setError("");

    try {
      const res = await ep1.get("/api/v2/adminpassworduserds", {
        params: { id: user._id, colid }
      });
      setPassword(res.data.data?.password || "");
    } catch (err) {
      setError(err.response?.data?.message || "Error loading password");
      setSelectedUser(null);
    }
  };

  const closePasswordDialog = () => {
    setSelectedUser(null);
    setPassword("");
    setShowPassword(false);
  };

  const updatePassword = async () => {
    if (!password.trim()) {
      setError("Password cannot be blank.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await ep1.post("/api/v2/adminpasswordupdateds", {
        id: selectedUser._id,
        colid,
        password
      });
      setMessage("Password updated successfully");
      closePasswordDialog();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating password");
    } finally {
      setSaving(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchAdminUsers();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Admin Passwords
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Users with role admin
            </Typography>
          </Box>
          <Chip label={`${users.length} admin users`} color="primary" variant="outlined" />
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Name, email, phone or regno"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <Button type="submit" variant="contained" startIcon={<Search />}>
              Search
            </Button>
            <Tooltip title="Reload admin users">
              <IconButton color="primary" onClick={fetchAdminUsers}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    No admin users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell>{user.institution || "-"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View or change password">
                        <IconButton color="primary" onClick={() => openPasswordDialog(user)}>
                          <Key />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(selectedUser)} onClose={closePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Admin Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="subtitle2">{selectedUser?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.email}
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                      <IconButton onClick={() => setShowPassword((value) => !value)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordDialog}>Cancel</Button>
          <Button variant="contained" onClick={updatePassword} disabled={saving}>
            {saving ? "Saving" : "Save Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPasswordUsersds;
