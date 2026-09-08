
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Autocomplete // Added
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const StoreManagerDashboardds = () => {
    const [tabValue, setTabValue] = useState(0);
    const [requests, setRequests] = useState([]);
    const [inventory, setInventory] = useState([]);

    // Allotment State
    const [openAllotModal, setOpenAllotModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [allotQty, setAllotQty] = useState('');
    const [currentStock, setCurrentStock] = useState(null); // For availability check

    // Purchase Request State
    const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
    const [purchaseQty, setPurchaseQty] = useState('');

    // Add Stock State
    const [openAddStockModal, setOpenAddStockModal] = useState(false);
    const [stores, setStores] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [newStock, setNewStock] = useState({ storeid: '', itemid: '', quantity: '' });

    useEffect(() => {
        // Restore global1 if missing (on reload)
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
            global1.name = localStorage.getItem('name');
            global1.department = localStorage.getItem('department');
        }

        if (tabValue === 0) fetchRequests();
        else {
            fetchInventory();
            fetchStores();
            fetchAllItems();
        }
    }, [tabValue]);

    const fetchRequests = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallrequisationds?colid=${global1.colid}`);
            const all = response.data.data.requisitions || [];
            // Add unique ID for DataGrid if missing (using _id)
            setRequests(all.filter(r => r.reqstatus === 'Pending').map(r => ({ ...r, id: r._id })));
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallstoreitemds?colid=${global1.colid}`);
            const items = response.data.data.storeItems || [];
            setInventory(items.map(i => ({ ...i, id: i._id })));
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    const fetchStores = async () => { try { const res = await ep1.get(`/api/v2/getallstoremasterds?colid=${global1.colid}`); setStores(res.data.data.stores || []); } catch (e) { console.error(e); } };
    const fetchAllItems = async () => { try { const res = await ep1.get(`/api/v2/getallitemmasterds?colid=${global1.colid}`); setAllItems(res.data.data.items || []); } catch (e) { console.error(e); } };

    // --- Allotment Logic ---
    const handleOpenAllot = async (request) => {
        setSelectedRequest(request);
        setAllotQty(request.quantity); // Default to full amount
        setCurrentStock('Checking...');
        setOpenAllotModal(true);

        // Fetch Live Stock Availability
        try {
            const invRes = await ep1.get(`/api/v2/getallstoreitemds?colid=${global1.colid}`);
            const storeItems = invRes.data.data.storeItems || [];
            const matchingItem = storeItems.find(si => si.itemcode === request.itemcode && si.storeid === request.storeid);
            setCurrentStock(matchingItem ? matchingItem.quantity : 0);
        } catch (error) {
            console.error(error);
            setCurrentStock('Error');
        }
    };

    const submitAllotment = async () => {
        if (Number(allotQty) > Number(currentStock)) {
            alert(`Insufficient Stock! Available: ${currentStock}`);
            return;
        }

        try {
            // Re-fetch to get ID (or store it in state, but logic needs matchingItem ID)
            const invRes = await ep1.get(`/api/v2/getallstoreitemds?colid=${global1.colid}`);
            const storeItems = invRes.data.data.storeItems || [];
            const matchingItem = storeItems.find(si => si.itemcode === selectedRequest.itemcode && si.storeid === selectedRequest.storeid);

            if (!matchingItem) {
                alert('Item not found in inventory during processing.');
                return;
            }

            const response = await ep1.post('/api/v2/allotitem', {
                requestId: selectedRequest._id,
                storeItemId: matchingItem._id,
                quantity: Number(allotQty),
                storeId: selectedRequest.storeid,
                itemId: selectedRequest.itemcode,
                userId: global1.user || 'StoreManager',
                colid: global1.colid
            });
            alert(response.data.message);
            setOpenAllotModal(false);
            fetchRequests();
        } catch (error) {
            console.error('Error allotting item:', error);
            alert('Failed to allot item.');
        }
    };

    // --- Purchase Request Logic ---
    const handleRequestPurchase = (request) => {
        setSelectedRequest(request);
        setPurchaseQty(request.quantity);
        setOpenPurchaseModal(true);
    };

    const submitPurchaseRequest = async () => {
        try {
            const storeObj = stores.find(s => s._id === selectedRequest.storeid);
            const itemMaster = allItems.find(i => i.itemcode === selectedRequest.itemcode);

            await ep1.post('/api/v2/addstorerequisationds', {
                itemid: itemMaster?._id || selectedRequest.itemid,
                itemname: selectedRequest.itemname,
                name: `Purchase Request - ${selectedRequest.itemname}`,
                storeid: selectedRequest.storeid,
                store: selectedRequest.storename || storeObj?.storename || 'Unknown Store',
                quantity: Number(purchaseQty),
                reqdate: new Date(),
                reqstatus: 'Pending',
                colid: global1.colid,
                user: global1.user
            });
            alert('Purchase Request Sent to Purchase Cell');
            setOpenPurchaseModal(false);
            fetchRequests();
        } catch (error) {
            console.error('Error sending purchase request:', error);
            alert('Failed to send request');
        }
    };

    // --- Add Stock Logic ---
    const handleAddStockSubmit = async () => {
        try {
            const selectedStore = stores.find(s => s._id === newStock.storeid);
            const selectedItem = allItems.find(i => i._id === newStock.itemid);

            await ep1.post('/api/v2/addstoreitemds', {
                colid: global1.colid,
                user: global1.user,
                storeid: newStock.storeid,
                storename: selectedStore?.storename,
                itemid: newStock.itemid,
                itemcode: selectedItem?.itemcode,
                itemname: selectedItem?.itemname,
                quantity: Number(newStock.quantity),
                type: selectedItem?.itemtype,
                status: 'Available'
            });
            alert('Stock Added Successfully');
            setOpenAddStockModal(false);
            fetchInventory();
        } catch (error) {
            console.error('Error adding stock:', error);
            alert('Failed to add stock');
        }
    };

    // --- Columns ---
    // Dynamic Columns
    const generateColumns = (data, context) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        const cols = keys
            .filter(key => key !== '_id' && key !== 'colid' && key !== 'id' && key !== '__v')
            .map(key => {
                const colDef = {
                    field: key,
                    headerName: key.charAt(0).toUpperCase() + key.slice(1),
                    width: 150
                };

                if (key.toLowerCase().includes('date')) {
                    colDef.valueFormatter = (params) => {
                        if (!params.value) return 'N/A';
                        const date = new Date(params.value);
                        return isNaN(date.getTime()) ? params.value : date.toLocaleDateString();
                    };
                }

                if (key === 'reqstatus' || key === 'status') {
                    colDef.renderCell = (params) => (
                        <Box sx={{ color: params.value === 'Pending' ? 'orange' : 'green', border: '1px solid', borderRadius: 1, px: 1 }}>
                            {params.value}
                        </Box>
                    );
                }

                return colDef;
            });

        if (context === 'requests') {
            cols.push({
                field: 'actions',
                headerName: 'Actions',
                width: 250,
                renderCell: (params) => (
                    <Box>
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleOpenAllot(params.row)}
                            sx={{ mr: 1 }}
                        >
                            Allot
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleRequestPurchase(params.row)}
                        >
                            Request Purchase
                        </Button>
                    </Box>
                )
            });
        }

        return cols;
    };

    const requestColumns = generateColumns(requests, 'requests');
    const inventoryColumns = generateColumns(inventory, 'inventory');

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Store Manager Dashboard
            </Typography>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label="Faculty Requests" />
                <Tab label="Store Inventory" />
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={requests}
                        columns={requestColumns}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                    />
                </Paper>
            )}

            {tabValue === 1 && (
                <Box sx={{ height: 600, width: '100%' }}>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button variant="contained" onClick={() => setOpenAddStockModal(true)}>Add Opening Stock</Button>
                    </Box>
                    <Paper sx={{ height: '100%', width: '100%' }}>
                        <DataGrid
                            rows={inventory}
                            columns={inventoryColumns}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                        />
                    </Paper>
                </Box>
            )}

            {/* Allotment & Availability Dialog */}
            <Dialog open={openAllotModal} onClose={() => setOpenAllotModal(false)}>
                <DialogTitle>Allot Item: {selectedRequest?.itemname}</DialogTitle>
                <DialogContent sx={{ pt: 2, minWidth: 400 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Store:</strong> {selectedRequest?.storename}
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Typography color="textSecondary">Requested:</Typography>
                            <Typography variant="h6">{selectedRequest?.quantity}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography color="textSecondary">Available Stock:</Typography>
                            {/* Stock Check is implicit here */}
                            <Typography variant="h6" color={Number(currentStock) >= Number(selectedRequest?.quantity) ? 'green' : 'error'}>
                                {currentStock}
                            </Typography>
                        </Grid>
                    </Grid>

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Quantity to Allot"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={allotQty}
                        onChange={(e) => setAllotQty(e.target.value)}
                        helperText="You can allot less than requested (Partial Allotment)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAllotModal(false)}>Cancel</Button>
                    <Button
                        onClick={submitAllotment}
                        variant="contained"
                        color="success"
                        disabled={currentStock === 'Checking...' || Number(currentStock) < 1 || Number(allotQty) <= 0 || Number(allotQty) > Number(currentStock)}
                    >
                        Confirm Allotment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Purchase Request Dialog */}
            <Dialog open={openPurchaseModal} onClose={() => setOpenPurchaseModal(false)}>
                <DialogTitle>Request Purchase from Purchase Cell</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        label="Quantity Needed"
                        fullWidth
                        type="number"
                        value={purchaseQty}
                        onChange={(e) => setPurchaseQty(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPurchaseModal(false)}>Cancel</Button>
                    <Button onClick={submitPurchaseRequest} variant="contained">Send Request</Button>
                </DialogActions>
            </Dialog>

            {/* Add Stock Dialog */}
            <Dialog open={openAddStockModal} onClose={() => setOpenAddStockModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Opening Stock</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Autocomplete
                        options={stores}
                        getOptionLabel={(option) => option.storename || ""}
                        value={stores.find(s => s._id === newStock.storeid) || null}
                        onChange={(event, newValue) => setNewStock({ ...newStock, storeid: newValue ? newValue._id : '' })}
                        renderInput={(params) => <TextField {...params} label="Select Store" />}
                    />
                    <Autocomplete
                        options={allItems}
                        getOptionLabel={(option) => option.itemname || ""}
                        value={allItems.find(i => i._id === newStock.itemid) || null}
                        onChange={(event, newValue) => setNewStock({ ...newStock, itemid: newValue ? newValue._id : '' })}
                        renderInput={(params) => <TextField {...params} label="Select Item" />}
                    />
                    <TextField
                        label="Quantity"
                        type="number"
                        value={newStock.quantity}
                        onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddStockModal(false)}>Cancel</Button>
                    <Button onClick={handleAddStockSubmit} variant="contained">Add Stock</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StoreManagerDashboardds;
