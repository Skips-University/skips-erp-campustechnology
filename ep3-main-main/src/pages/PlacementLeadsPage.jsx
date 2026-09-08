import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Toolbar,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MenuIcon from "@mui/icons-material/Menu";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { mainListItems } from "./menucas1";

const sidebarWidth = 250;

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: sidebarWidth,
    width: `calc(100% - ${sidebarWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: sidebarWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9)
      }
    })
  }
}));

const mdTheme = createTheme();

const blankLead = {
  companyname: "",
  leadname: "",
  leademail: "",
  leadphone: "",
  leadstatus: "",
  completed: "No",
  customfields: {}
};

const baseColumns = ["Company Name", "Lead Name", "Lead Email", "Lead Phone", "Lead Status", "Completed"];

const fieldLabel = (value) => String(value || "")
  .replace(/[_-]+/g, " ")
  .replace(/\b\w/g, (char) => char.toUpperCase());

export default function PlacementLeadsPage() {
  const [open, setOpen] = useState(true);
  const [rows, setRows] = useState([]);
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState(blankLead);
  const [customField, setCustomField] = useState({ name: "", value: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const colid = global1.colid;
  const toggleDrawer = () => setOpen((prev) => !prev);

  const loadRows = async () => {
    const res = await ep1.get("/api/v2/placement-leads", { params: { colid } });
    setRows(res.data || []);
  };

  const loadStages = async () => {
    const res = await ep1.get("/api/v2/placement-lead-stages", { params: { colid } });
    setStages((res.data || []).filter((item) => String(item.isactive || "Yes").toLowerCase() === "yes"));
  };

  useEffect(() => {
    Promise.all([loadRows(), loadStages()]).catch((err) => setError(err.response?.data?.msg || err.message));
  }, []);

  const customFieldNames = useMemo(() => {
    const names = new Set();
    rows.forEach((row) => {
      Object.keys(row.customfields || {}).forEach((key) => names.add(key));
    });
    Object.keys(form.customfields || {}).forEach((key) => names.add(key));
    return Array.from(names).sort();
  }, [rows, form.customfields]);

  const gridRows = useMemo(() => rows.map((row) => ({
    ...row,
    ...(row.customfields || {})
  })), [rows]);

  const resetForm = () => {
    setForm(blankLead);
    setCustomField({ name: "", value: "" });
  };

  const saveLead = async () => {
    try {
      setError("");
      const payload = { ...form, colid, user: global1.user };
      if (form.id) await ep1.post("/api/v2/placement-leads-update", payload);
      else await ep1.post("/api/v2/placement-leads", payload);
      setMessage(form.id ? "Placement lead updated" : "Placement lead added");
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to save placement lead");
    }
  };

  const editLead = (row) => {
    setForm({
      id: row._id,
      companyname: row.companyname || "",
      leadname: row.leadname || "",
      leademail: row.leademail || "",
      leadphone: row.leadphone || "",
      leadstatus: row.leadstatus || "",
      completed: row.completed || "No",
      customfields: { ...(row.customfields || {}) }
    });
    setMessage("");
    setError("");
  };

  const deleteLead = async (row) => {
    try {
      setError("");
      await ep1.post("/api/v2/placement-leads-delete", { colid, id: row._id });
      setMessage("Placement lead deleted");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete placement lead");
    }
  };

  const addCustomField = () => {
    const name = customField.name.trim();
    if (!name) return setError("Custom field name is required");
    setForm({
      ...form,
      customfields: {
        ...(form.customfields || {}),
        [name]: customField.value
      }
    });
    setCustomField({ name: "", value: "" });
    setError("");
  };

  const removeCustomField = (name) => {
    const next = { ...(form.customfields || {}) };
    delete next[name];
    setForm({ ...form, customfields: next });
  };

  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const headers = [...baseColumns, "Designation", "Source", "Follow Up Date", "Remarks"];
    const worksheet = XLSX.utils.json_to_sheet([
      {
        "Company Name": "ABC Technologies",
        "Lead Name": "Ravi Kumar",
        "Lead Email": "ravi@example.com",
        "Lead Phone": "9999999999",
        "Lead Status": "New",
        Completed: "No",
        Designation: "HR Manager",
        Source: "LinkedIn",
        "Follow Up Date": "2026-06-01",
        Remarks: "Interested in campus drive"
      }
    ], { header: headers });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Placement Leads");
    XLSX.writeFile(workbook, "placement_leads_template.xlsx");
  };

  const exportCurrentRows = () => {
    const worksheet = XLSX.utils.json_to_sheet(gridRows.map((row) => {
      const { _id, __v, customfields, ...rest } = row;
      return rest;
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Placement Leads");
    XLSX.writeFile(workbook, "placement_leads.xlsx");
  };

  const bulkUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setError("");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const parsedRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      const res = await ep1.post("/api/v2/placement-leads-bulk", {
        colid,
        user: global1.user,
        rows: parsedRows
      });
      setMessage(`Bulk upload completed. Inserted ${res.data?.inserted || 0} leads.`);
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to upload placement leads");
    } finally {
      event.target.value = "";
    }
  };

  const columns = [
    { field: "companyname", headerName: "Company Name", width: 220 },
    { field: "leadname", headerName: "Lead Name", width: 180 },
    { field: "leademail", headerName: "Lead Email", width: 220 },
    { field: "leadphone", headerName: "Lead Phone", width: 150 },
    { field: "leadstatus", headerName: "Lead Status", width: 160 },
    { field: "completed", headerName: "Completed", width: 120 },
    ...customFieldNames.map((name) => ({
      field: name,
      headerName: fieldLabel(name),
      width: 180
    })),
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary" onClick={() => editLead(row)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => deleteLead(row)}><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      )
    }
  ];

  const pageContent = (
    <>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Placement Leads</Typography>
            <Typography variant="body2" color="text.secondary">Add company leads, capture custom lead information, and bulk upload from Excel.</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`Leads ${rows.length}`} color="primary" variant="outlined" />
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadTemplate}>Template</Button>
            <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCurrentRows}>Export</Button>
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => fileRef.current?.click()}>Bulk Upload</Button>
            <input ref={fileRef} hidden type="file" accept=".xlsx,.xls,.csv" onChange={bulkUpload} />
          </Stack>
        </Stack>
        {message && <Alert severity="success" sx={{ mt: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>{error}</Alert>}
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2, mt: 2 }}>
        <Typography variant="h6" fontWeight={800}>{form.id ? "Edit lead" : "Add lead"}</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Company Name" value={form.companyname} onChange={(e) => setForm({ ...form, companyname: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Lead Name" value={form.leadname} onChange={(e) => setForm({ ...form, leadname: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Lead Email" value={form.leademail} onChange={(e) => setForm({ ...form, leademail: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Lead Phone" value={form.leadphone} onChange={(e) => setForm({ ...form, leadphone: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth size="small" label="Lead Status" value={form.leadstatus} onChange={(e) => setForm({ ...form, leadstatus: e.target.value })}>
              <MenuItem value="">Select status</MenuItem>
              {stages.map((stage) => <MenuItem key={stage._id} value={stage.stage}>{stage.stage}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth size="small" label="Completed" value={form.completed} onChange={(e) => setForm({ ...form, completed: e.target.value })}>
              {["No", "Yes"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label="Custom field name" value={customField.name} onChange={(e) => setCustomField({ ...customField, name: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth size="small" label="Custom field value" value={customField.value} onChange={(e) => setCustomField({ ...customField, value: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={addCustomField}>Add custom field</Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {Object.entries(form.customfields || {}).map(([name, value]) => (
                <Chip key={name} label={`${name}: ${value}`} onDelete={() => removeCustomField(name)} sx={{ mb: 1 }} />
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={saveLead}>{form.id ? "Update lead" : "Save lead"}</Button>
              <Button variant="outlined" onClick={resetForm}>Clear</Button>
            </Stack>
          </Grid>
        </Grid>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
        <Box sx={{ height: 560, width: "100%" }}>
          <DataGrid
            rows={gridRows}
            columns={columns}
            getRowId={(row) => row._id}
            slots={{ toolbar: GridToolbar }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
          />
        </Box>
        </Paper>
    </>
  );

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBarStyled position="absolute" open={open}>
          <Toolbar sx={{ pr: "24px" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{ marginRight: "36px", ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              Placement Leads
            </Typography>
            <Button color="inherit" component={Link} to="/dashdashfacnew">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/Login">
              Sign out
            </Button>
          </Toolbar>
        </AppBarStyled>
        <DrawerStyled variant="permanent" open={open}>
          <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: [1] }}>
            <Typography component="h1" variant="body1" color="inherit" noWrap sx={{ flexGrow: 1, ml: 1 }}>
              {global1.name}
            </Typography>
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List>{mainListItems({ open })}</List>
        </DrawerStyled>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) => theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto"
          }}
        >
          <Toolbar />
          <Box sx={{ p: 3, minWidth: 0 }}>
            {pageContent}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
