import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, FormControlLabel, Checkbox, Autocomplete } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const BudgetApproverds = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ approvername: '', approveremail: '', levelofapproval: '', iseditaccess: false, isdeleteaccess: false, status: 'Active', remarks: '' });

    // User search
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => { fetchData(); fetchUsers(); }, []);

    const fetchData = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallbudgetapproverds?colid=${global1.colid}`);
            setData(res.data.data.items.map(i => ({ ...i, id: i._id })));
        } catch (e) { console.error(e); }
    };

    const fetchUsers = async () => {
        try {
            const res = await ep1.post('/api/v2/getallusers', { colid: global1.colid });
            setUsers(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        const payload = { ...formData, colid: global1.colid, user: global1.user, name: global1.user };
        try {
            if (editId) await ep1.post(`/api/v2/updatebudgetapproverds?id=${editId}`, payload);
            else await ep1.post('/api/v2/addbudgetapproverds', payload);
            setOpen(false); fetchData();
            setFormData({ approvername: '', approveremail: '', levelofapproval: '', iseditaccess: false, isdeleteaccess: false, status: 'Active', remarks: '' });
            setEditId(null); setSelectedUser(null);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this approver?')) {
            await ep1.get(`/api/v2/deletebudgetapproverds?id=${id}`);
            fetchData();
        }
    };

    const handleUserSelect = (event, value) => {
        setSelectedUser(value);
        if (value) {
            setFormData({ ...formData, approvername: value.name, approveremail: value.email });
        }
    };

    const columns = [
        { field: 'approvername', headerName: 'Approver Name', width: 180 },
        { field: 'approveremail', headerName: 'Approver Email', width: 220 },
        { field: 'levelofapproval', headerName: 'Level', width: 80 },
        { field: 'iseditaccess', headerName: 'Edit Access', width: 100, renderCell: (p) => p.value ? 'Yes' : 'No' },
        { field: 'isdeleteaccess', headerName: 'Delete Access', width: 110, renderCell: (p) => p.value ? 'Yes' : 'No' },
        { field: 'status', headerName: 'Status', width: 80 },
        { field: 'remarks', headerName: 'Remarks', width: 200 },
        {
            field: 'actions', headerName: 'Actions', width: 200, renderCell: (p) => (
                <Box>
                    <Button size="small" onClick={() => {
                        setEditId(p.row.id);
                        setFormData({
                            approvername: p.row.approvername || '', approveremail: p.row.approveremail || '',
                            levelofapproval: p.row.levelofapproval || '', iseditaccess: p.row.iseditaccess || false,
                            isdeleteaccess: p.row.isdeleteaccess || false, status: p.row.status || 'Active', remarks: p.row.remarks || ''
                        });
                        // Find and set matching user for Autocomplete
                        const matchingUser = users.find(u => u.email === p.row.approveremail);
                        setSelectedUser(matchingUser || null);
                        setOpen(true);
                    }}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(p.row.id)}>Delete</Button>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>Budget Approver Configuration</Typography>
            <Button variant="contained" onClick={() => {
                setOpen(true); setEditId(null); setSelectedUser(null);
                setFormData({ approvername: '', approveremail: '', levelofapproval: '', iseditaccess: false, isdeleteaccess: false, status: 'Active', remarks: '' });
            }}>Add Approver</Button>
            <Paper sx={{ height: 500, mt: 2 }}><DataGrid rows={data} columns={columns} /></Paper>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit' : 'Add'} Budget Approver</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        value={selectedUser}
                        onChange={handleUserSelect}
                        filterOptions={(options, { inputValue }) => {
                            const lower = inputValue.toLowerCase();
                            return options.filter(o =>
                                (o.name && o.name.toLowerCase().includes(lower)) ||
                                (o.email && o.email.toLowerCase().includes(lower))
                            );
                        }}
                        renderInput={(params) => <TextField {...params} label="Search User (by name or email)" margin="normal" fullWidth />}
                        isOptionEqualToValue={(option, value) => option.email === value.email}
                        sx={{ mt: 1 }}
                    />
                    <TextField label="Approver Name" fullWidth margin="normal" value={formData.approvername} InputProps={{ readOnly: true }} />
                    <TextField label="Approver Email" fullWidth margin="normal" value={formData.approveremail} InputProps={{ readOnly: true }} />
                    <TextField label="Level of Approval (1, 2, 3...)" fullWidth margin="normal" value={formData.levelofapproval} onChange={e => setFormData({ ...formData, levelofapproval: e.target.value })} />
                    <FormControlLabel control={<Checkbox checked={formData.iseditaccess} onChange={e => setFormData({ ...formData, iseditaccess: e.target.checked })} />} label="Edit Access (can edit budget categories during approval)" />
                    <FormControlLabel control={<Checkbox checked={formData.isdeleteaccess} onChange={e => setFormData({ ...formData, isdeleteaccess: e.target.checked })} />} label="Delete Access (can delete budget categories during approval)" />
                    <TextField label="Status" fullWidth margin="normal" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} />
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
export default BudgetApproverds;
