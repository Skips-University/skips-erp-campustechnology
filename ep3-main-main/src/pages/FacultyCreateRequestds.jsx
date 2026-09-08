import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    Card,
    CardContent,
    Grid,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const FacultyCreateRequestds = () => {
    const [stores, setStores] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState('');

    // Fetch initial data
    useEffect(() => {
        fetchStores();
        fetchItems();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallstoremasterds?colid=${global1.colid}`);
            setStores(response.data.data.stores || []);
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallitemmasterds?colid=${global1.colid}`);
            setItems(response.data.data.items || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const [cartItems, setCartItems] = useState([]);

    const handleRequestClick = (item) => {
        setSelectedItem(item);
        setOpenModal(true);
    };

    const handleAddToCart = () => {
        if (!selectedItem || !selectedStore || !quantity) {
            alert('Please fill all fields');
            return;
        }

        const storeObj = stores.find(s => s._id === selectedStore);
        const newItem = {
            id: Date.now(), // Local key for DataGrid
            faculty: global1.name,
            facultyid: global1.user,
            itemcode: selectedItem.itemcode,
            itemname: selectedItem.itemname,
            quantity: Number(quantity),
            reqdate: new Date(),
            storeid: selectedStore,
            storename: storeObj?.storename || 'Unknown',
            reqstatus: 'Pending',
            year: new Date().getFullYear().toString(),
            colid: global1.colid,
            user: global1.user,
            name: `REQ-${Date.now()}` // System required name
        };

        setCartItems([...cartItems, newItem]);
        setOpenModal(false);
        setQuantity('');
        setSelectedItem(null);
        // Do NOT clear selectedStore, so user can add more from same store seamlessly
    };

    const handleRemoveFromCart = (id) => {
        setCartItems(cartItems.filter(item => (item.id || item.tempId) !== id));
    };

    const handleSubmitAll = async () => {
        if (cartItems.length === 0) return;

        try {
            await Promise.all(cartItems.map(item => {
                const { id, tempId, ...apiPayload } = item; // Remove local ID keys before sending
                return ep1.post('/api/v2/addrequisationds1', apiPayload);
            }));
            alert('All requisitions submitted successfully!');
            setCartItems([]);
        } catch (error) {
            console.error('Error submitting requisitions:', error);
            alert('Failed to submit some requisitions.');
        }
    };

    const filteredItems = !selectedStore ? [] : items.filter(item =>
        (item.itemname && item.itemname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.itemcode && item.itemcode.toLowerCase().includes(searchQuery.toLowerCase()))
    ).map(item => ({ ...item, id: item._id }));

    // Define Columns
    const searchColumns = [
        { field: 'itemname', headerName: 'Item Name', width: 200 },
        { field: 'itemcode', headerName: 'Item Code', width: 150 },
        { field: 'itemtype', headerName: 'Type', width: 150 },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleRequestClick(params.row)}
                >
                    Add
                </Button>
            )
        }
    ];

    const cartColumns = [
        { field: 'storename', headerName: 'Store', width: 180 },
        { field: 'itemname', headerName: 'Item Name', width: 200 },
        { field: 'itemcode', headerName: 'Item Code', width: 150 },
        { field: 'quantity', headerName: 'Qty', width: 100 },
        {
            field: 'action',
            headerName: 'Remove',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveFromCart(params.row.id || params.row.tempId)}
                >
                    X
                </Button>
            )
        }
    ];

    return (
        <Box p={3} sx={{ height: '90vh', backgroundColor: '#f4f6f8' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                Create Material Requisition
            </Typography>

            <Grid container spacing={3} sx={{ height: 'calc(100% - 60px)' }}>
                {/* Left Panel: Selection */}
                <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom color="textSecondary">
                                1. Select Items
                            </Typography>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Select Store</InputLabel>
                                        <Select
                                            value={selectedStore}
                                            label="Select Store"
                                            onChange={(e) => setSelectedStore(e.target.value)}
                                        >
                                            {stores.map((store) => (
                                                <MenuItem key={store._id} value={store._id}>
                                                    {store.storename}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Search Items (Name or Code)"
                                        variant="outlined"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        disabled={!selectedStore}
                                        helperText={!selectedStore ? "Select a store first" : ""}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                                <DataGrid
                                    rows={filteredItems}
                                    columns={searchColumns}
                                    pageSize={10}
                                    rowsPerPageOptions={[10, 25]}
                                    disableSelectionOnClick
                                    hideFooterSelectedRowCount
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Panel: Cart */}
                <Grid item xs={12} md={6} sx={{ height: '100%' }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" color="textSecondary">
                                    2. Your Request Cart
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleSubmitAll}
                                    disabled={cartItems.length === 0}
                                    size="medium"
                                >
                                    Submit All ({cartItems.length})
                                </Button>
                            </Box>

                            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                                <DataGrid
                                    rows={cartItems}
                                    columns={cartColumns}
                                    pageSize={10}
                                    rowsPerPageOptions={[10]}
                                    disableSelectionOnClick
                                    hideFooterSelectedRowCount
                                    getRowId={(row) => row.id || row.tempId}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Quantity Dialog */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>Add {selectedItem?.itemname} to Cart</DialogTitle>
                <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                    <Typography variant="body2" gutterBottom color="textSecondary">
                        Store: {stores.find(s => s._id === selectedStore)?.storename}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Quantity Required"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button onClick={handleAddToCart} variant="contained" color="primary">
                        Add to Cart
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FacultyCreateRequestds;
