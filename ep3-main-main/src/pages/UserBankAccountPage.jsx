import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  Link,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LaunchIcon from "@mui/icons-material/Launch";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const accountTypes = ["Savings", "Current", "Salary", "NRE", "NRO", "Other"];
const blankForm = {
  bankname: "",
  branchname: "",
  accountholdername: "",
  accountnumber: "",
  ifsccode: "",
  accounttype: "Savings",
  upiid: "",
  isdefault: "No",
  status: "Active",
  remarks: "",
  attachmenturl: ""
};

const getMessage = (err, fallback) => err.response?.data?.msg || err.response?.data?.message || fallback;

export default function UserBankAccountPage({ student = false }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentOwner = useMemo(() => selectedUser || {
    name: global1.name || "",
    email: global1.user || "",
    regno: global1.regno || "",
    role: global1.role || "",
    department: global1.department || ""
  }, [selectedUser]);

  useEffect(() => {
    if (student) {
      setSelectedUser({
        name: global1.name || "",
        email: global1.user || "",
        regno: global1.regno || "",
        role: global1.role || "Student",
        department: global1.department || ""
      });
    }
  }, [student]);

  useEffect(() => {
    if (!student) searchUsers("");
  }, [student]);

  useEffect(() => {
    if (currentOwner?.email) loadAccounts(currentOwner.email);
  }, [currentOwner?.email]);

  const searchUsers = async (q) => {
    try {
      const res = await ep1.get("/api/v2/user-bank-account-users", {
        params: { colid: global1.colid, q }
      });
      setUsers(res.data || []);
    } catch (err) {
      setError(getMessage(err, "Unable to load users"));
    }
  };

  const loadAccounts = async (owneruser = currentOwner?.email) => {
    if (!owneruser) return;
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/user-bank-accounts", {
        params: { colid: global1.colid, owneruser }
      });
      setRows(res.data || []);
    } catch (err) {
      setError(getMessage(err, "Unable to load bank accounts"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(blankForm);
    setFile(null);
    setEditingId("");
  };

  const editRow = (row) => {
    setEditingId(row._id);
    setForm({
      bankname: row.bankname || "",
      branchname: row.branchname || "",
      accountholdername: row.accountholdername || "",
      accountnumber: row.accountnumber || "",
      ifsccode: row.ifsccode || "",
      accounttype: row.accounttype || "Savings",
      upiid: row.upiid || "",
      isdefault: row.isdefault || "No",
      status: row.status || "Active",
      remarks: row.remarks || "",
      attachmenturl: row.attachment?.sourcetype === "Link" ? row.attachment?.url || "" : ""
    });
    setFile(null);
  };

  const saveAccount = async () => {
    if (!currentOwner?.email) return setError("Please select a user.");
    if (!form.bankname.trim() || !form.accountnumber.trim()) {
      return setError("Bank name and account number are required.");
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = new FormData();
      if (editingId) payload.append("id", editingId);
      payload.append("colid", global1.colid);
      payload.append("user", global1.user || "");
      payload.append("name", global1.name || "");
      payload.append("owneruser", currentOwner.email || "");
      payload.append("ownername", currentOwner.name || "");
      payload.append("ownerrole", currentOwner.role || "");
      payload.append("regno", currentOwner.regno || "");
      payload.append("department", currentOwner.department || "");
      Object.entries(form).forEach(([key, value]) => payload.append(key, value || ""));
      if (file) payload.append("file", file);
      await ep1.post("/api/v2/user-bank-accounts", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage(editingId ? "Bank account updated." : "Bank account added.");
      resetForm();
      loadAccounts(currentOwner.email);
    } catch (err) {
      setError(getMessage(err, "Unable to save bank account"));
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (row) => {
    if (!window.confirm("Delete this bank account?")) return;
    try {
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-bank-accounts-delete", { id: row._id, colid: global1.colid });
      setMessage("Bank account deleted.");
      if (editingId === row._id) resetForm();
      loadAccounts(currentOwner.email);
    } catch (err) {
      setError(getMessage(err, "Unable to delete bank account"));
    }
  };

  const columns = [
    { field: "ownername", headerName: "Name", minWidth: 170, flex: 1 },
    { field: "owneruser", headerName: "Email", minWidth: 220, flex: 1 },
    { field: "ownerrole", headerName: "Role", width: 120 },
    { field: "bankname", headerName: "Bank", minWidth: 180, flex: 1 },
    { field: "branchname", headerName: "Branch", minWidth: 150, flex: 1 },
    { field: "accountholdername", headerName: "Account holder", minWidth: 180, flex: 1 },
    { field: "accountnumber", headerName: "Account no", minWidth: 170 },
    { field: "ifsccode", headerName: "IFSC", width: 130 },
    { field: "accounttype", headerName: "Type", width: 120 },
    {
      field: "isdefault",
      headerName: "Default",
      width: 110,
      renderCell: (params) => <Chip size="small" color={params.value === "Yes" ? "success" : "default"} label={params.value || "No"} />
    },
    { field: "status", headerName: "Status", width: 110 },
    {
      field: "attachment",
      headerName: "Attachment",
      minWidth: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.row.attachment?.url
        ? <Link href={params.row.attachment.url} target="_blank" rel="noreferrer">{params.row.attachment.originalname || "Open"}</Link>
        : ""
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem key="edit" icon={<EditIcon />} label="Edit" onClick={() => editRow(params.row)} />,
        <GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Delete" onClick={() => deleteAccount(params.row)} />
      ]
    }
  ];

  const title = student ? "My Bank Accounts" : "Bank Account";

  return (
    <MenuPageShell title={title} menuType={student ? "student" : undefined}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to={student ? "/studentdashboard" : "/dashboard"}>
                  Dashboard
                </Link>
                <Typography color="text.primary">{student ? "Profile" : "User Management"}</Typography>
                <Typography color="text.primary">Bank Account</Typography>
              </Breadcrumbs>
              <Typography variant="h4" fontWeight={800}>{title}</Typography>
              <Typography color="text.secondary">
                Maintain multiple accounts, mark the default account, and attach supporting proof.
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadAccounts()}>
              Refresh
            </Button>
          </Stack>

          {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
          {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
          {(loading || saving) && <LinearProgress />}

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Grid container spacing={2}>
              {!student && (
                <Grid item xs={12}>
                  <Autocomplete
                    options={users}
                    value={selectedUser}
                    inputValue={search}
                    onInputChange={(_, value) => {
                      setSearch(value);
                      searchUsers(value);
                    }}
                    onChange={(_, value) => {
                      setSelectedUser(value);
                      resetForm();
                    }}
                    getOptionLabel={(option) => option ? `${option.name || ""} - ${option.email || ""}${option.regno ? ` - ${option.regno}` : ""}` : ""}
                    renderInput={(params) => <TextField {...params} label="Search and select user/student" />}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc", height: "100%" }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AccountBalanceIcon color="primary" />
                    <Box>
                      <Typography fontWeight={700}>{currentOwner?.name || "Select a user"}</Typography>
                      <Typography variant="body2" color="text.secondary">{currentOwner?.email || ""}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[currentOwner?.role, currentOwner?.regno, currentOwner?.department].filter(Boolean).join(" | ")}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Bank name" value={form.bankname} onChange={(e) => setForm({ ...form, bankname: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Branch name" value={form.branchname} onChange={(e) => setForm({ ...form, branchname: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Account holder name" value={form.accountholdername} onChange={(e) => setForm({ ...form, accountholdername: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Account number" value={form.accountnumber} onChange={(e) => setForm({ ...form, accountnumber: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="IFSC code" value={form.ifsccode} onChange={(e) => setForm({ ...form, ifsccode: e.target.value.toUpperCase() })} /></Grid>
                  <Grid item xs={12} md={4}>
                    <TextField select fullWidth label="Account type" value={form.accounttype} onChange={(e) => setForm({ ...form, accounttype: e.target.value })}>
                      {accountTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="UPI ID" value={form.upiid} onChange={(e) => setForm({ ...form, upiid: e.target.value })} /></Grid>
                  <Grid item xs={12} md={4}>
                    <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      sx={{ height: "100%", alignItems: "center" }}
                      control={<Switch checked={form.isdefault === "Yes"} onChange={(e) => setForm({ ...form, isdefault: e.target.checked ? "Yes" : "No" })} />}
                      label="Default account"
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Button fullWidth component="label" variant="outlined" startIcon={<UploadFileIcon />} sx={{ height: 56 }}>
                      {file?.name || "Upload attachment through AWS"}
                      <input hidden type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <TextField fullWidth label="Or paste attachment link" value={form.attachmenturl} onChange={(e) => setForm({ ...form, attachmenturl: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                      <Button variant="outlined" onClick={resetForm}>Clear</Button>
                      <Button variant="contained" startIcon={<SaveIcon />} disabled={saving || !currentOwner?.email} onClick={saveAccount}>
                        {saving ? "Saving..." : editingId ? "Update" : "Save"}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Saved bank accounts</Typography>
                <Typography variant="body2" color="text.secondary">Multiple accounts can be stored; only one can be marked default.</Typography>
              </Box>
              {rows.find((row) => row.attachment?.url) && (
                <Button
                  variant="text"
                  endIcon={<LaunchIcon />}
                  onClick={() => window.open(rows.find((row) => row.attachment?.url)?.attachment?.url, "_blank")}
                >
                  Open latest attachment
                </Button>
              )}
            </Stack>
            <Box sx={{ height: 520, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                slots={{ toolbar: GridToolbar }}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
