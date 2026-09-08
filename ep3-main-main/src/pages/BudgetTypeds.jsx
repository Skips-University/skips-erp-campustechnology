import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, FormControlLabel, Checkbox } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const BudgetTypeds = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ budgettypename: '', isactive: true, remarks: '' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallbudgettypeds?colid=${global1.colid}`);
            setData(res.data.data.items.map(i => ({ ...i, id: i._id })));
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        const payload = { ...formData, colid: global1.colid, user: global1.user, name: global1.user };
        try {
            if (editId) await ep1.post(`/api/v2/updatebudgettypeds?id=${editId}`, payload);
            else await ep1.post('/api/v2/addbudgettypeds', payload);
            setOpen(false); fetchData(); setFormData({ budgettypename: '', isactive: true, remarks: '' }); setEditId(null);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this budget type?')) {
            await ep1.get(`/api/v2/deletebudgettypeds?id=${id}`);
            fetchData();
        }
    };

    const columns = [
        { field: 'budgettypename', headerName: 'Budget Type Name', width: 250 },
        { field: 'isactive', headerName: 'Active', width: 100, renderCell: (p) => p.value ? 'Yes' : 'No' },
        { field: 'remarks', headerName: 'Remarks', width: 300 },
        {
            field: 'actions', headerName: 'Actions', width: 200, renderCell: (p) => (
                <Box>
                    <Button size="small" onClick={() => { setEditId(p.row.id); setFormData({ budgettypename: p.row.budgettypename, isactive: p.row.isactive, remarks: p.row.remarks || '' }); setOpen(true); }}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(p.row.id)}>Delete</Button>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>Budget Type Configuration</Typography>
            <Button variant="contained" onClick={() => { setOpen(true); setEditId(null); setFormData({ budgettypename: '', isactive: true, remarks: '' }) }}>Add Budget Type</Button>
            <Paper sx={{ height: 500, mt: 2 }}><DataGrid rows={data} columns={columns} /></Paper>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit' : 'Add'} Budget Type</DialogTitle>
                <DialogContent>
                    <TextField label="Budget Type Name" fullWidth margin="normal" value={formData.budgettypename} onChange={e => setFormData({ ...formData, budgettypename: e.target.value })} />
                    <FormControlLabel control={<Checkbox checked={formData.isactive} onChange={e => setFormData({ ...formData, isactive: e.target.checked })} />} label="Active" />
                    <TextField label="Remarks" fullWidth margin="normal" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
export default BudgetTypeds;
