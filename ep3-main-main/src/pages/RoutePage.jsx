import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1'; // axios instance pointing to /api/v2
import global1 from './global1';

// Helper to open update dialog
const emptyRoute = { routename: '', routecode: '', pickuppoints: [], droppoint: '' };

export default function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState(emptyRoute);

  const navigate = useNavigate();
  const colid = Number(global1.colid); // TODO: replace with real logged-in user colid

  const fetchRoutes = () =>
    ep1.get(`/api/v2/getallroutes?colid=${colid}`).then(res => setRoutes(res.data.data));

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreate = () => {
    setIsEdit(false);
    setForm(emptyRoute);
    setOpen(true);
  };

  const handleEdit = route => {
    setIsEdit(true);
    setForm(route);
    setOpen(true);
  };

  const handleDelete = async id => {
    await ep1.delete('/api/v2/deleteroute', { params: { id } });
    fetchRoutes();
  };

  const handleSave = async () => {
    if (isEdit) {
      await ep1.post('/api/v2/updateroute', { id: form._id, ...form });
    } else {
      await ep1.post('/api/v2/createroute', { ...form, colid });
    }
    setOpen(false);
    fetchRoutes();
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePickupChange = e => {
    setForm(prev => ({ ...prev, pickuppoints: e.target.value.split(',').map(p => p.trim()) }));
  };

  // Navigate to Bus page
  const goToBuses = route => {
    navigate(`/busesbyroute/${route._id}`);
  };

  return (
    <Box p={3}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h4" mb={2}>
        Manage Routes
      </Typography>

      <Button startIcon={<AddIcon />} variant="contained" onClick={handleCreate} sx={{ mb: 2 }}>
        Create Route
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Pickup Points</TableCell>
              <TableCell>Drop Point</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map(r => (
              <TableRow
                key={r._id}
                hover
                onClick={() => goToBuses(r)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{r.routename}</TableCell>
                <TableCell>{r.routecode}</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {r.pickuppoints?.map(p => (
                      <Chip label={p} size="small" key={p} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{r.droppoint}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={e => { e.stopPropagation(); handleEdit(r); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={e => { e.stopPropagation(); handleDelete(r._id); }}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Update Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Route' : 'Create Route'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Route Name"
            name="routename"
            value={form.routename}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Route Code"
            name="routecode"
            value={form.routecode}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Pickup Points (comma separated)"
            value={form.pickuppoints.join(', ')}
            onChange={handlePickupChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Drop Point"
            name="droppoint"
            value={form.droppoint}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEdit ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}