import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
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
  role: "",
  level: "",
  isactive: "Yes",
  remarks: ""
};

export default function FeeApprovalRolesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    const res = await ep1.get(`/feeapprovalroles?colid=${global1.colid}`);
    setRows((res.data?.data || []).map((item) => ({ ...item, id: item._id })));
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const saveData = async () => {
    if (!form.role || !form.level) return;
    const payload = {
      ...form,
      level: Number(form.level),
      colid: global1.colid,
      user: global1.user
    };

    if (editId) await ep1.post("/feeapprovalroles-update", { ...payload, id: editId });
    else await ep1.post("/feeapprovalroles", payload);

    resetForm();
    loadData();
  };

  const editData = (row) => {
    setEditId(row._id);
    setForm({
      role: row.role || "",
      level: row.level || "",
      isactive: row.isactive || "Yes",
      remarks: row.remarks || ""
    });
  };

  const deleteData = async (id) => {
    if (!window.confirm("Delete this fee approval role?")) return;
    await ep1.post("/feeapprovalroles-delete", { id });
    if (editId === id) resetForm();
    loadData();
  };

  const columns = [
    { field: "level", headerName: "Level", width: 100 },
    { field: "role", headerName: "Role", width: 220 },
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
        <Typography variant="h5">Fee Approval Roles</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>
          Back
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth />
          <TextField label="Level" type="number" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} sx={{ minWidth: 140 }} />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Active</InputLabel>
            <Select label="Active" value={form.isactive} onChange={(e) => setForm({ ...form, isactive: e.target.value })}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} fullWidth />
          <Button variant="contained" onClick={saveData}>{editId ? "Update" : "Add"}</Button>
          {editId && <Button variant="outlined" onClick={resetForm}>Cancel</Button>}
        </Stack>
      </Paper>

      <Paper sx={{ height: 540 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          initialState={{ sorting: { sortModel: [{ field: "level", sort: "asc" }] } }}
        />
      </Paper>
    </Box>
  );
}
