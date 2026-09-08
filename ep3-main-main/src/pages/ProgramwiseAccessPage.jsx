import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { createFilterOptions } from "@mui/material/Autocomplete";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = {
  id: "",
  username: "",
  useremail: "",
  userid: "",
  program: "",
  programcode: "",
  department: ""
};

const SELECT_ALL_USERS = { _id: "__all_users__", name: "Select all users", email: "" };
const SELECT_ALL_PROGRAMS = { _id: "__all_programs__", program: "Select all programs", programcode: "" };
const autocompleteFilter = createFilterOptions();

function userLabel(user) {
  if (!user) return "";
  return `${user.name || "No name"} - ${user.email || "No email"}${user.role ? ` (${user.role})` : ""}`;
}

function programLabel(program) {
  if (!program) return "";
  return `${program.program || "Program"} (${program.programcode || "Code"})${program.department ? ` - ${program.department}` : ""}`;
}

export default function ProgramwiseAccessPage() {
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [optionRes, listRes] = await Promise.all([
        ep1.get("/api/v2/programwiseaccess/options", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/programwiseaccess", { params: { colid: global1.colid } })
      ]);
      setUsers(optionRes.data?.users || []);
      setPrograms(optionRes.data?.programs || []);
      setRows(listRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load programwise access");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const selectUsers = (value) => {
    if (value.some((item) => item._id === SELECT_ALL_USERS._id)) {
      const allSelected = selectedUsers.length === users.length;
      const next = allSelected ? [] : users;
      setSelectedUsers(next);
      if (next.length === 1) {
        const user = next[0];
        setForm((prev) => ({
          ...prev,
          username: user?.name || "",
          useremail: user?.email || "",
          userid: user?._id || ""
        }));
      }
      return;
    }
    setSelectedUsers(value);
    const user = value.length === 1 ? value[0] : null;
    setForm((prev) => ({
      ...prev,
      username: user?.name || "",
      useremail: user?.email || "",
      userid: user?._id || ""
    }));
  };

  const selectPrograms = (value) => {
    if (value.some((item) => item._id === SELECT_ALL_PROGRAMS._id)) {
      const allSelected = selectedPrograms.length === programs.length;
      const next = allSelected ? [] : programs;
      setSelectedPrograms(next);
      if (next.length === 1) {
        const program = next[0];
        setForm((prev) => ({
          ...prev,
          program: program?.program || "",
          programcode: program?.programcode || "",
          department: program?.department || ""
        }));
      }
      return;
    }
    setSelectedPrograms(value);
    const program = value.length === 1 ? value[0] : null;
    setForm((prev) => ({
      ...prev,
      program: program?.program || "",
      programcode: program?.programcode || "",
      department: program?.department || ""
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedUsers([]);
    setSelectedPrograms([]);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (form.id && selectedUsers.length === 1 && selectedPrograms.length === 1) {
        await ep1.post("/api/v2/programwiseaccess", {
          ...form,
          colid: global1.colid,
          user: global1.user,
          createdby: global1.user
        });
        setMessage("Program access saved.");
      } else {
        const entries = selectedUsers.flatMap((user) =>
          selectedPrograms.map((program) => ({
            username: user?.name || "",
            useremail: user?.email || "",
            userid: user?._id || "",
            program: program?.program || "",
            programcode: program?.programcode || "",
            department: program?.department || ""
          }))
        );
        const res = await ep1.post("/api/v2/programwiseaccess", {
          colid: global1.colid,
          user: global1.user,
          createdby: global1.user,
          entries
        });
        setMessage(res.data?.message || "Program access saved.");
      }
      resetForm();
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save program access");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    const user = users.find((item) => item.email === row.useremail) || null;
    const program = programs.find((item) => item.programcode === row.programcode) || null;
    setSelectedUsers(user ? [user] : []);
    setSelectedPrograms(program ? [program] : []);
    setForm({
      id: row._id,
      username: row.username || "",
      useremail: row.useremail || "",
      userid: row.userid || "",
      program: row.program || "",
      programcode: row.programcode || "",
      department: row.department || ""
    });
  };

  const deleteRow = async (row) => {
    if (!window.confirm("Delete this program access?")) return;
    setLoading(true);
    setError("");
    try {
      await ep1.post("/api/v2/programwiseaccess/delete", { id: row._id, colid: global1.colid });
      setMessage("Program access deleted.");
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to delete program access");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { field: "username", headerName: "User", minWidth: 180, flex: 1 },
      { field: "useremail", headerName: "Email", minWidth: 220, flex: 1 },
      { field: "department", headerName: "Department", minWidth: 170, flex: 1 },
      { field: "program", headerName: "Program", minWidth: 220, flex: 1 },
      { field: "programcode", headerName: "Program Code", minWidth: 150 },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 110,
        getActions: (params) => [
          <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editRow(params.row)} />,
          <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => deleteRow(params.row)} />
        ]
      }
    ],
    [users, programs]
  );

  return (
    <MenuPageShell title="Programwise access">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {message && <Alert severity="success">{message}</Alert>}

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Assign program access
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={[SELECT_ALL_USERS, ...users]}
                  filterOptions={(options, params) => [
                    SELECT_ALL_USERS,
                    ...autocompleteFilter(options.filter((option) => option._id !== SELECT_ALL_USERS._id), params)
                  ]}
                  value={selectedUsers}
                  onChange={(_, value) => selectUsers(value)}
                  getOptionLabel={userLabel}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderOption={(props, option, { selected }) => {
                    const isSelectAll = option._id === SELECT_ALL_USERS._id;
                    const checked = isSelectAll ? selectedUsers.length === users.length && users.length > 0 : selected;
                    return (
                      <li {...props}>
                        <Checkbox checked={checked} sx={{ mr: 1 }} />
                        {userLabel(option)}
                      </li>
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.slice(0, 3).map((option, index) => (
                      <Chip size="small" label={userLabel(option)} {...getTagProps({ index })} />
                    )).concat(value.length > 3 ? [<Chip key="more-users" size="small" label={`+${value.length - 3} more`} />] : [])
                  }
                  renderInput={(params) => <TextField {...params} label="Search and select users" />}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={[SELECT_ALL_PROGRAMS, ...programs]}
                  filterOptions={(options, params) => [
                    SELECT_ALL_PROGRAMS,
                    ...autocompleteFilter(options.filter((option) => option._id !== SELECT_ALL_PROGRAMS._id), params)
                  ]}
                  value={selectedPrograms}
                  onChange={(_, value) => selectPrograms(value)}
                  getOptionLabel={programLabel}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderOption={(props, option, { selected }) => {
                    const isSelectAll = option._id === SELECT_ALL_PROGRAMS._id;
                    const checked = isSelectAll ? selectedPrograms.length === programs.length && programs.length > 0 : selected;
                    return (
                      <li {...props}>
                        <Checkbox checked={checked} sx={{ mr: 1 }} />
                        {programLabel(option)}
                      </li>
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.slice(0, 3).map((option, index) => (
                      <Chip size="small" label={programLabel(option)} {...getTagProps({ index })} />
                    )).concat(value.length > 3 ? [<Chip key="more-programs" size="small" label={`+${value.length - 3} more`} />] : [])
                  }
                  renderInput={(params) => <TextField {...params} label="Search and select programs" />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving || selectedUsers.length === 0 || selectedPrograms.length === 0}
                    onClick={save}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outlined" onClick={resetForm}>
                    Clear
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={800}>
                Access list
              </Typography>
              <Button startIcon={<RefreshIcon />} onClick={loadAll} disabled={loading}>
                Refresh
              </Button>
            </Stack>
            <Box sx={{ height: 540, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                loading={loading}
                pageSizeOptions={[25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                slots={{ toolbar: GridToolbar }}
                disableRowSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </MenuPageShell>
  );
}
