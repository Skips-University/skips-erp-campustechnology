import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const PurchaseCellInventoryds = () => {
    const [inventory, setInventory] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('All');

    useEffect(() => {
        fetchStores();
        fetchInventory();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoremasterds?colid=${global1.colid}`);
            setStores(res.data.data.stores || []);
        } catch (error) { console.error("Error fetching stores", error); }
    };

    const fetchInventory = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallstoreitemds?colid=${global1.colid}`);
            const items = res.data.data.storeItems || [];
            setInventory(items.map(i => ({ ...i, id: i._id })));
        } catch (error) { console.error("Error fetching inventory", error); }
    };

    const filteredInventory = selectedStore === 'All'
        ? inventory
        : inventory.filter(i => i.storeid === selectedStore);

    const columns = [
        { field: 'storename', headerName: 'Store', width: 200 },
        { field: 'itemname', headerName: 'Item Name', width: 200 },
        { field: 'itemcode', headerName: 'Code', width: 120 },
        { field: 'quantity', headerName: 'Available Qty', width: 150 },
        { field: 'type', headerName: 'Type', width: 150 },
        {
            field: 'status', headerName: 'Status', width: 120, renderCell: (params) => (
                <Chip
                    label={params.value || 'N/A'}
                    color={params.value === 'Available' ? 'success' : 'default'}
                    size="small"
                />
            )
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Purchase Cell - Store Inventory Overview</Typography>

            <Box sx={{ mb: 3, maxWidth: 300 }}>
                <FormControl fullWidth>
                    <InputLabel>Filter by Store</InputLabel>
                    <Select
                        value={selectedStore}
                        label="Filter by Store"
                        onChange={(e) => setSelectedStore(e.target.value)}
                    >
                        <MenuItem value="All">All Stores</MenuItem>
                        {stores.map(s => <MenuItem key={s._id} value={s._id}>{s.storename}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={filteredInventory}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25]}
                    disableSelectionOnClick
                />
            </Paper>
        </Box>
    );
};

export default PurchaseCellInventoryds;
