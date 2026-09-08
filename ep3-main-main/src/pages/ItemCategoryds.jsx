import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const ItemCategoryds = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemcategoryds?colid=${global1.colid}`);
            setData(res.data.data.items.map(i => ({ ...i, id: i._id })));
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        const payload = { ...formData, colid: global1.colid, user: global1.user, categoryname: formData.name }; // Mapping 'name' to 'categoryname' if needed by schema or just use name
        try {
            if (editId) await ep1.post(`/api/v2/updateitemcategoryds?id=${editId}`, payload);
            else await ep1.post('/api/v2/additemcategoryds', payload);
            setOpen(false); fetchData(); setFormData({ name: '', description: '', status: 'Active' }); setEditId(null);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete?')) {
            await ep1.delete(`/api/v2/deleteitemcategoryds?id=${id}`);
            fetchData();
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'status', headerName: 'Status', width: 100 },
        {
            field: 'actions', headerName: 'Actions', width: 200, renderCell: (p) => (
                <Box>
                    <Button onClick={() => { setEditId(p.row.id); setFormData(p.row); setOpen(true); }}>Edit</Button>
                    <Button color="error" onClick={() => handleDelete(p.row.id)}>Delete</Button>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Item Categories</Typography>
            <Button variant="contained" onClick={() => { setOpen(true); setEditId(null); setFormData({ name: '', description: '', status: 'Active' }) }}>Add Category</Button>
            <Paper sx={{ height: 500, mt: 2 }}><DataGrid rows={data} columns={columns} /></Paper>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{editId ? 'Edit' : 'Add'} Category</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="normal" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <TextField label="Description" fullWidth margin="normal" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
export default ItemCategoryds;
