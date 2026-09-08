import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyForm = {
  academicyear: "2026-27",
  role: "",
  department: ["All"],
  level: "",
  accesslevel: "Approve Only",
  isactive: "Yes",
  remarks: ""
};

const academicYearOptions = ["All", "2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
const defaultRoleOptions = ["HOD", "REGISTRAR", "ACCOUNTS", "MANAGEMENT", "Admin", "Faculty", "Purchase"];

export default function IndBudgetApprovalRolesPage() {
  const [rows, setRows] = useState([]);
  const [userDepartments, setUserDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    const res = await ep1.get(`/indbudgetapprovalroles?colid=${global1.colid}`);
    setRows((res.data?.data || []).map((item) => ({ ...item, id: item._id })));
  };

  const loadDepartments = async () => {
    try {
      const res = await ep1.get(`/mbusers?colid=${global1.colid}`);
      const departments = [...new Set((res.data || []).map((item) => item.department).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b)));
      setUserDepartments(departments);
    } catch (err) {
      setUserDepartments([]);
    }
  };

  useEffect(() => {
    loadData();
    loadDepartments();
  }, []);

  const roleOptions = useMemo(() => {
    return [...new Set([...defaultRoleOptions, ...rows.map((row) => row.role).filter(Boolean), global1.role].filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b)));
  }, [rows]);

  const departmentOptions = useMemo(() => {
    return [...new Set(["All", ...userDepartments, global1.department].filter(Boolean))]
      .sort((a, b) => (a === "All" ? -1 : b === "All" ? 1 : String(a).localeCompare(String(b))));
  }, [userDepartments]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const saveData = async () => {
    if (!form.role || !form.level) return;
    const selectedDepartments = Array.isArray(form.department) && form.department.length ? form.department : ["All"];
    const basePayload = {
      ...form,
      level: Number(form.level),
      colid: global1.colid,
      user: global1.user
    };

    if (editId) {
      await ep1.post("/indbudgetapprovalroles-update", { ...basePayload, department: selectedDepartments[0], id: editId });
    } else {
      await Promise.all(selectedDepartments.map((department) => (
        ep1.post("/indbudgetapprovalroles", { ...basePayload, department })
      )));
    }

    resetForm();
    loadData();
  };

  const editData = (row) => {
    setEditId(row._id);
    setForm({
      academicyear: row.academicyear || "All",
      role: row.role || "",
      department: [row.department || "All"],
      level: row.level || "",
      accesslevel: row.accesslevel || "Approve Only",
      isactive: row.isactive || "Yes",
      remarks: row.remarks || ""
    });
  };

  const deleteData = async (id) => {
    if (!window.confirm("Delete this approval role?")) return;
    await ep1.post("/indbudgetapprovalroles-delete", { id });
    if (editId === id) resetForm();
    loadData();
  };

  const columns = [
    { field: "academicyear", headerName: "Academic Year", width: 140 },
    { field: "level", headerName: "Level", width: 100 },
    { field: "role", headerName: "Role", width: 220 },
    { field: "department", headerName: "Department", width: 180 },
    { field: "accesslevel", headerName: "Access Level", width: 190 },
    { field: "isactive", headerName: "Active", width: 120 },
    { field: "remarks", headerName: "Remarks", flex: 1, minWidth: 220 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => editData(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => deleteData(params.row._id)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Budget Approval Roles</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashdashfacnew")}
        >
          Back
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Academic Year</InputLabel>
            <Select
              label="Academic Year"
              value={form.academicyear}
              onChange={(e) => setForm({ ...form, academicyear: e.target.value })}
            >
              {academicYearOptions.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
          <Autocomplete
            freeSolo
            options={roleOptions}
            value={form.role}
            onInputChange={(event, value) => setForm({ ...form, role: value || "" })}
            renderInput={(params) => (
              <TextField {...params} label="Role" fullWidth />
            )}
          />
          </Grid>
          <Grid item xs={12} md={3}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={departmentOptions}
            value={Array.isArray(form.department) ? form.department : [form.department || "All"]}
            onChange={(event, value) => setForm({ ...form, department: value.length ? value : ["All"] })}
            getOptionLabel={(option) => option}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox checked={selected} sx={{ mr: 1 }} />
                {option}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Department" helperText={editId ? "First selected department will be updated" : "Separate entry will be created for each selected department"} />
            )}
          />
          </Grid>
          <Grid item xs={12} md={3}>
          <TextField
            label="Level"
            type="number"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            fullWidth
          />
          </Grid>

          <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Access Level</InputLabel>
            <Select
              label="Access Level"
              value={form.accesslevel}
              onChange={(e) => setForm({ ...form, accesslevel: e.target.value })}
            >
              <MenuItem value="Approve Only">Approve Only</MenuItem>
              <MenuItem value="Approve and Add Items">Approve and Add Items</MenuItem>
            </Select>
          </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Active</InputLabel>
            <Select
              label="Active"
              value={form.isactive}
              onChange={(e) => setForm({ ...form, isactive: e.target.value })}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
          <TextField
            label="Remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            fullWidth
          />
          </Grid>
          <Grid item xs={12} md={3}>
          <Stack direction="row" spacing={1} sx={{ height: "100%" }} alignItems="center">
          <Button variant="contained" onClick={saveData} sx={{ minHeight: 54, px: 3 }}>
            {editId ? "Update" : "Add"}
          </Button>
          {editId && <Button variant="outlined" onClick={resetForm} sx={{ minHeight: 54 }}>Cancel</Button>}
          </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            sorting: {
              sortModel: [{ field: "level", sort: "asc" }]
            }
          }}
        />
      </Paper>
    </Box>
  );
}
