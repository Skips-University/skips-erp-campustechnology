import React, { useState } from 'react';
import {
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
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const initialFormState = {
  year: '',
  department: '',
  faculty: '',
  project: '',
  amountsnc: '',
  amountgiven: '',
  doclink: '',
  type: '',
  level: '',
};

const SeedMoneyCRUD = () => {
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editIndex, setEditIndex] = useState(null);

  const handleOpen = () => {
    setForm(initialFormState);
    setEditIndex(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (editIndex !== null) {
      const updated = [...records];
      updated[editIndex] = form;
      setRecords(updated);
    } else {
      setRecords((prev) => [...prev, form]);
    }
    handleClose();
  };

  const handleEdit = (index) => {
    setForm(records[index]);
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = (index) => {
    const updated = [...records];
    updated.splice(index, 1);
    setRecords(updated);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Seed Money Projects
      </Typography>
      <Button variant="contained" onClick={handleOpen}>
        Add New Entry
      </Button>

      {/* Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Amount SNC</TableCell>
              <TableCell>Amount Given</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Doc Link</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.year}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.faculty}</TableCell>
                <TableCell>{row.project}</TableCell>
                <TableCell>{row.amountsnc}</TableCell>
                <TableCell>{row.amountgiven}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.level}</TableCell>
                <TableCell>
                  <a href={row.doclink} target="_blank" rel="noreferrer">
                    Link
                  </a>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(index)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(index)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Create/Edit */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editIndex !== null ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr', mt: 1 }}>
            {Object.keys(initialFormState).map((field) => (
              <TextField
                key={field}
                label={field === 'year' ? 'SeedMoneyN1^Year' : field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                type={['amountsnc', 'amountgiven'].includes(field) ? 'number' : 'text'}
                value={form[field]}
                onChange={handleChange}
                fullWidth
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editIndex !== null ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeedMoneyCRUD;
