import React, { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, TextField, Autocomplete, Checkbox, FormControlLabel
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
// import Papa from "papaparse";
import * as XLSX from "xlsx";
import ep1 from '../api/ep1';
import global1 from './global1';
import readXlsxFile from "read-excel-file";
import MenuPageShell from "./MenuPageShell";

const roles = ["Admin", "crm", "Faculty", "HOD", "REGISTRAR","ACCOUNTS","MANAGEMENT", "HOI"];
const generateRandomPassword = (length = 12) => {
  const size = Math.max(6, Math.min(Number(length) || 12, 64));
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";
  return Array.from({ length: size }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};
const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  institution: "",
  department: "",
  designation: "",
  joiningdate: "",
  admissionyear: ""
};

export default function MbUserPage({ embedded = false, onRowsChange }) {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [autoPassword, setAutoPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(12);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const colid = global1.colid; // global1.colid later

  const fetchData = async () => {
    const res = await ep1.get(`/mbusers?colid=${colid}`);
    const nextRows = res.data || [];
    setRows(nextRows);
    if (onRowsChange) onRowsChange(nextRows);
  };

  useEffect(() => {
    fetchData();
  }, []);

//   const handleSave = async () => {
//     await ep1.post("/mbusers", {
//       ...form,
//       colid
//     });
//     setOpen(false);
//     fetchData();
//   };

const openAddDialog = () => {
  setEditId("");
  setForm(emptyForm);
  setAutoPassword(false);
  setPasswordLength(12);
  setOpen(true);
};

const openEditDialog = (row) => {
  setEditId(row._id);
  setForm({
    name: row.name || "",
    email: row.email || "",
    phone: row.phone || "",
    password: row.password || "",
    role: row.role || "",
    institution: row.institution || "",
    department: row.department || "",
    designation: row.designation || "",
    joiningdate: row.joiningdate ? String(row.joiningdate).slice(0, 10) : "",
    admissionyear: row.admissionyear || ""
  });
  setAutoPassword(false);
  setPasswordLength(12);
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
  setEditId("");
  setForm(emptyForm);
  setAutoPassword(false);
  setPasswordLength(12);
};

const handleAutoPasswordChange = (checked) => {
  setAutoPassword(checked);
  if (checked) {
    setForm((prev) => ({ ...prev, password: generateRandomPassword(passwordLength) }));
  }
};

const handlePasswordLengthChange = (value) => {
  const nextLength = Math.max(6, Math.min(Number(value) || 6, 64));
  setPasswordLength(nextLength);
  if (autoPassword) {
    setForm((prev) => ({ ...prev, password: generateRandomPassword(nextLength) }));
  }
};

const handleSave = async () => {
  const finalPassword = autoPassword && !form.password ? generateRandomPassword(passwordLength) : form.password;
  const payload = {
    ...form,
    password: finalPassword,
    user: global1.user,
    colid: global1.colid
  };

  if (editId) {
    await ep1.post("/mbusers-update", { ...payload, id: editId });
  } else {
    await ep1.post("/mbusers", payload);
  }

  handleClose();
  fetchData();
};

const downloadTemplate = () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet([{
    name: "Employee Name",
    email: "employee@example.com",
    phone: "9999999999",
    password: "Password@123",
    role: "Faculty",
    institution: "Institution",
    department: "Department",
    designation: "Assistant Professor",
    dateofjoining: "2026-07-29",
    joiningyear: "2026-27"
  }]);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  XLSX.writeFile(workbook, "non_student_user_template.xlsx");
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await ep1.post("/mbusers-delete", { id });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  // ✅ Bulk upload
//   const handleFileUpload = (e) => {
//     Papa.parse(e.target.files[0], {
//       header: true,
//       complete: async (results) => {
//         await axios.post("http://localhost:5000/mbusers/bulk",
//           results.data.map(r => ({ ...r, colid }))
//         );
//         fetchData();
//       }
//     });
//   };

// const handleFileUpload = async (e) => {
//   const file = e.target.files[0];

//   const rows = await readXlsxFile(file);

//   // remove header row
//   const data = rows.slice(1);

//   const mapped = data.map((row) => ({
//     name: row[0],
//     email: row[1],
//     phone: row[2],
//     password: row[3],
//     role: row[4],
//     institution: row[5],
//     department: row[6],
//     joiningyear: row[7]
//   }));

//   await ep1.post(
//     "/mbusers/bulk",
//     mapped,
//     {
//       headers: {
//         "x-user": global1.user,
//         "x-colid": global1.colid
//       }
//     }
//   );

//   fetchData();
// };

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;

  const rows = await readXlsxFile(file);
  const data = rows.slice(1);

  const mapped = data.map((row) => ({
    name: row[0],
    email: row[1],
    phone: row[2],
    password: row[3],
    role: row[4],
    institution: row[5],
    department: row[6],
    designation: row[7],
    dateofjoining: row[8],
    joiningdate: row[8],
    joiningyear: row[9],

    // 🔑 inject here
    user: global1.user,
    colid: global1.colid
  }));

  await ep1.post("/mbusers/bulk", mapped);

  fetchData();
};

const handleBulkDelete = async () => {
  if (!selectedIds.length) {
    alert("Select at least one user to delete");
    return;
  }
  if (!window.confirm(`Delete ${selectedIds.length} selected user(s)?`)) return;
  try {
    await ep1.post("/mbusers-bulk-delete", { ids: selectedIds, colid: global1.colid });
    setSelectedIds([]);
    fetchData();
  } catch (err) {
    alert(err.response?.data?.error || "Bulk delete failed");
  }
};

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "password", headerName: "Password", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "designation", headerName: "Designation", flex: 1 },
    { field: "joiningdate", headerName: "Date of joining", flex: 1, valueFormatter: ({ value }) => value ? String(value).slice(0, 10) : "" },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "lastlogin", headerName: "Last login", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => openEditDialog(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row._id)}>
            Delete
          </Button>
        </Stack>
      )
    }
  ];

  const pageContent = (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>User Management</h2>
        {!embedded && <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashdashfacnew")}
        >
          Back
        </Button>}
      </Box>

      <Box mb={2} display="flex" gap={2}>
        <Button variant="contained" onClick={openAddDialog}>
          Add User
        </Button>

        <Button variant="outlined" component="label">
          Upload Excel
          <input type="file" hidden onChange={handleFileUpload} />
        </Button>

        <Button variant="outlined" onClick={downloadTemplate}>
          Download Template
        </Button>

        <Button variant="outlined" color="error" disabled={!selectedIds.length} onClick={handleBulkDelete}>
          Bulk Delete
        </Button>
      </Box>

      <Box mb={2} display="flex" gap={2}>
        <p>
            Format of excel file - name, email, phone, password, role, institution, department, designation, dateofjoining, joiningyear
        </p>
      </Box>


      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r._id}
        autoHeight
        checkboxSelection
        rowSelectionModel={selectedIds}
        onRowSelectionModelChange={(model) => setSelectedIds(Array.from(model))}
        slots={{ toolbar: GridToolbar }}
      />

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField label="Email" fullWidth margin="dense"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField label="Phone" fullWidth margin="dense"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <TextField label="Password" fullWidth margin="dense"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
            <FormControlLabel
              control={<Checkbox checked={autoPassword} onChange={(e) => handleAutoPasswordChange(e.target.checked)} />}
              label="Generate random password"
            />
            <TextField
              label="Password length"
              type="number"
              margin="dense"
              value={passwordLength}
              onChange={(e) => handlePasswordLengthChange(e.target.value)}
              inputProps={{ min: 6, max: 64 }}
              sx={{ width: { xs: "100%", sm: 180 } }}
              disabled={!autoPassword}
            />
          </Stack>

           <TextField label="Institution" fullWidth margin="dense"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
          />

           <TextField label="Department" fullWidth margin="dense"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />

          <TextField label="Designation" fullWidth margin="dense"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
          />

          <TextField label="Date of joining" type="date" fullWidth margin="dense"
            value={form.joiningdate}
            onChange={(e) => setForm({ ...form, joiningdate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField label="Joining year" fullWidth margin="dense"
            value={form.admissionyear}
            onChange={(e) => setForm({ ...form, admissionyear: e.target.value })}
          />

          <Autocomplete
            freeSolo
            options={roles}
            value={form.role || ""}
            onChange={(event, value) => setForm({ ...form, role: value || "" })}
            onInputChange={(event, value) => setForm({ ...form, role: value || "" })}
            renderInput={(params) => (
              <TextField {...params} label="Role" fullWidth margin="dense" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  if (embedded) return pageContent;
  return <MenuPageShell title="User Management">{pageContent}</MenuPageShell>;
}
