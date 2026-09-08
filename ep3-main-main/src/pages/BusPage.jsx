import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  Tooltip,
  Fab,
  IconButton,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack,
} from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const emptyBus = {
  busname: "",
  busnumber: "",
  noofseat: 40,
  priceperseat: 0,
  drivername: "",
  driveridno: "",
  routename: "",
  routecode: "",
};

export default function BusPage() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(emptyBus);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const colid = Number(global1.colid); // TODO: real colid

  const fetchBuses = () =>
    ep1
      .get(`/api/v2/getallbuses?colid=${colid}`)
      .then((res) =>
        setBuses(res.data.data.filter((b) => b.routeid?._id === routeId))
      );

  useEffect(() => {
    fetchBuses();
  }, [routeId]);

  const handleCreate = () => {
    setIsEdit(false);
    setForm(emptyBus);
    setOpen(true);
  };

  const handleEdit = (bus) => {
    setIsEdit(true);
    setForm(bus);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await ep1.get(`/api/v2/deletebus`, { params: { id } });
    fetchBuses();
  };

  const handleSave = async () => {
    const payload = { ...form, routeid: routeId, colid };
    if (isEdit) {
      await ep1.post("/api/v2/updatebus", { id: form._id, ...payload });
    } else {
      await ep1.post("/api/v2/createbus", payload);
    }
    setOpen(false);
    fetchBuses();
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box
      p={3}
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/route")}
      >
        Back
      </Button>
      <Typography variant="h4" mb={2}>
        Buses for Route
      </Typography>

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Bus Name</TableCell>
              <TableCell>Bus Number</TableCell>
              <TableCell>Seats</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Price per Seat</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buses.map((b) => (
              <TableRow key={b._id}>
                <TableCell>{b.busname}</TableCell>
                <TableCell>{b.busnumber}</TableCell>
                <TableCell>{b.noofseat}</TableCell>
                <TableCell>{b.drivername}</TableCell>
                <TableCell>{b.priceperseat}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => navigate(`/bus-detail/${b._id}`)}
                    variant="text"
                    color="primary"
                  >
                    View Seats
                  </Button>
                  <IconButton onClick={() => handleEdit(b)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(b._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Tooltip title="Add Bus">
        <Fab color="primary" sx={{ mt: 3 }} onClick={handleCreate}>
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Create / Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{isEdit ? "Edit Bus" : "Create Bus"}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Bus Name"
            name="busname"
            value={form.busname}
            onChange={handleChange}
          />
          <TextField
            label="Bus Number"
            name="busnumber"
            value={form.busnumber}
            onChange={handleChange}
          />
          <TextField
            label="No of Seats"
            name="noofseat"
            type="number"
            value={form.noofseat}
            onChange={handleChange}
          />
          <TextField
            label="Driver Name"
            name="drivername"
            value={form.drivername}
            onChange={handleChange}
          />
          <TextField
            label="Driver ID"
            name="driveridno"
            value={form.driveridno}
            onChange={handleChange}
          />
          <TextField
          label="Price Per Seat"
          name="priceperseat"
          value={form.priceperseat}
          onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
