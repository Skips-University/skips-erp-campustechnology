import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete, ArrowBack, MonetizationOn } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const BuildingStaffConfigPage = () => {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    buildingname: "",
    colid: global1.colid,
    wardenemail: "",
    wardenname: "",
    wardenphone: "",
    messmanageremail: "",
    messmanagername: "",
    messmanagerphone: "",
    messstatus: "Closed",
    messfeepermonth: 0,
    user: global1.email,
    username: global1.name,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [feeDialog, setFeeDialog] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    fetchConfigs();
    fetchBuildings();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data } = await ep1.get(`/api/v2/getbuildingstaffds?colid=${global1.colid}`);
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBuildings = async () => {
    try {
      const { data } = await ep1.get(`/api/v2/gethostelbuldings?colid=${global1.colid}`);
      if (data.success) {
        setBuildings(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (config = null) => {
    if (config) {
      setEditId(config._id);
      setForm(config);
    } else {
      setEditId(null);
      setForm({
        buildingname: "",
        colid: global1.colid,
        wardenemail: "",
        wardenname: "",
        wardenphone: "",
        messmanageremail: "",
        messmanagername: "",
        messmanagerphone: "",
        messstatus: "Closed",
        messfeepermonth: 0,
        user: global1.email,
        username: global1.name,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await ep1.post("/api/v2/updatebuildingstaffds", { ...form, id: editId });
        setSnackbar({
          open: true,
          message: "Configuration updated successfully",
          severity: "success",
        });
      } else {
        await ep1.post("/api/v2/addbuildingstaffds", form);
        setSnackbar({
          open: true,
          message: "Configuration added successfully",
          severity: "success",
        });
      }
      fetchConfigs();
      handleClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error saving configuration",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        await ep1.get(`/api/v2/deletebuildingstaffds/${id}`);
        setSnackbar({
          open: true,
          message: "Configuration deleted successfully",
          severity: "success",
        });
        fetchConfigs();
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Error deleting configuration",
          severity: "error",
        });
      }
    }
  };

  const handleOpenFeeDialog = (config) => {
    setSelectedBuilding(config);
    setFeeDialog(true);
  };

  const handleBulkAddFees = async () => {
    if (!selectedBuilding) return;

    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    try {
      const payload = {
        buildingname: selectedBuilding.buildingname,
        colid: global1.colid,
        messfeepermonth: selectedBuilding.messfeepermonth,
        feeitem: "Monthly Mess Fee",
        feecategory: "Mess",
        academicyear: academicYear,
        user: global1.email,
        username: global1.name,
      };

      const { data } = await ep1.post("/api/v2/addbulkmessfeeds", payload);

      if (data.success) {
        setSnackbar({
          open: true,
          message: data.message,
          severity: "success",
        });
        setFeeDialog(false);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error adding mess fees",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/dashboardpagehostel")}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Building Staff Configuration</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Configuration
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Building Name</TableCell>
              <TableCell>Warden Name</TableCell>
              <TableCell>Warden Email</TableCell>
              <TableCell>Mess Manager Name</TableCell>
              <TableCell>Mess Manager Email</TableCell>
              <TableCell>Mess Status</TableCell>
              <TableCell>Mess Fee/Month</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config._id}>
                <TableCell>{config.buildingname}</TableCell>
                <TableCell>{config.wardenname}</TableCell>
                <TableCell>{config.wardenemail}</TableCell>
                <TableCell>{config.messmanagername}</TableCell>
                <TableCell>{config.messmanageremail}</TableCell>
                <TableCell>
                  <Chip
                    label={config.messstatus}
                    color={config.messstatus === "Open" ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>₹{config.messfeepermonth}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(config)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(config._id)} color="error">
                    <Delete />
                  </IconButton>
                  {config.messstatus === "Open" && (
                    <IconButton
                      onClick={() => handleOpenFeeDialog(config)}
                      color="success"
                      title="Add Bulk Mess Fees"
                    >
                      <MonetizationOn />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Configuration Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editId ? "Edit Configuration" : "Add Configuration"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              select
              label="Building Name"
              value={form.buildingname}
              onChange={(e) => setForm({ ...form, buildingname: e.target.value })}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="">Select Building</option>
              {buildings.map((building) => (
                <option key={building._id} value={building.buldingname}>
                  {building.buldingname}
                </option>
              ))}
            </TextField>

            <Typography variant="h6">Warden Details</Typography>
            <TextField
              label="Warden Name"
              value={form.wardenname}
              onChange={(e) => setForm({ ...form, wardenname: e.target.value })}
              fullWidth
            />
            <TextField
              label="Warden Email"
              value={form.wardenemail}
              onChange={(e) => setForm({ ...form, wardenemail: e.target.value })}
              fullWidth
            />
            <TextField
              label="Warden Phone"
              value={form.wardenphone}
              onChange={(e) => setForm({ ...form, wardenphone: e.target.value })}
              fullWidth
            />

            <Typography variant="h6">Mess Manager Details</Typography>
            <TextField
              label="Mess Manager Name"
              value={form.messmanagername}
              onChange={(e) => setForm({ ...form, messmanagername: e.target.value })}
              fullWidth
            />
            <TextField
              label="Mess Manager Email"
              value={form.messmanageremail}
              onChange={(e) => setForm({ ...form, messmanageremail: e.target.value })}
              fullWidth
            />
            <TextField
              label="Mess Manager Phone"
              value={form.messmanagerphone}
              onChange={(e) => setForm({ ...form, messmanagerphone: e.target.value })}
              fullWidth
            />

            <Typography variant="h6">Mess Configuration</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={form.messstatus === "Open"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      messstatus: e.target.checked ? "Open" : "Closed",
                    })
                  }
                />
              }
              label="Mess Open"
            />
            <TextField
              label="Mess Fee Per Month"
              type="number"
              value={form.messfeepermonth}
              onChange={(e) =>
                setForm({ ...form, messfeepermonth: Number(e.target.value) })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Add Mess Fees Dialog */}
      <Dialog open={feeDialog} onClose={() => setFeeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Bulk Mess Fees</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography>
              This will add mess fee of ₹{selectedBuilding?.messfeepermonth} for all
              students in <strong>{selectedBuilding?.buildingname}</strong> building.
            </Typography>
            <Typography color="error" sx={{ mt: 2 }}>
              Are you sure you want to proceed?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeeDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkAddFees} variant="contained" color="success">
            Add Fees for All Students
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default BuildingStaffConfigPage;
