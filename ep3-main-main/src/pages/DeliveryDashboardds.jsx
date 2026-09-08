import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const DeliveryDashboardds = () => {
    const [approvedPOs, setApprovedPOs] = useState([]);
    const [openDeliveryModal, setOpenDeliveryModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [deliveryNote, setDeliveryNote] = useState('');
    const [docLink, setDocLink] = useState('');

    // For Quality Check
    const [deliveryItems, setDeliveryItems] = useState([]);

    useEffect(() => {
        fetchApprovedPOs();
    }, []);

    const fetchApprovedPOs = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallstorepoorderds?colid=${global1.colid}`);
            const allPOs = response.data.data.poOrders || [];
            const approved = allPOs.filter(po => po.postatus === 'Approved' || po.approvalStatus === 'Completed');
            setApprovedPOs(approved.map(p => ({ ...p, id: p._id })));
        } catch (error) {
            console.error('Error fetching POs:', error);
        }
    };

    const handleMarkDeliveredClick = async (po) => {
        setSelectedPO(po);
        setDeliveryNote('');
        setDocLink('');

        // Fetch PO Items for Quality Check
        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds?colid=${global1.colid}`);
            const allItems = res.data.data.poItems || [];
            // Filter items for this PO
            const poItems = allItems.filter(item => item.poid === po.poid);

            // Initialize delivery state for each item
            const itemsWithState = poItems.map(item => ({
                ...item,
                receivedQty: item.quantity, // Default to full acceptance
                returnedQty: 0
            }));

            setDeliveryItems(itemsWithState);
            setOpenDeliveryModal(true);
        } catch (error) {
            console.error('Error fetching PO items:', error);
            alert('Error loading PO items');
        }
    };

    const handleQtyChange = (index, field, value) => {
        const newItems = [...deliveryItems];
        const val = parseInt(value) || 0;
        const item = newItems[index];

        if (field === 'returnedQty') {
            if (val > item.quantity) {
                alert("Returned quantity cannot exceed total quantity");
                return;
            }
            item.returnedQty = val;
            item.receivedQty = item.quantity - val;
        } else if (field === 'receivedQty') {
            if (val > item.quantity) {
                alert("Received quantity cannot exceed total quantity");
                return;
            }
            item.receivedQty = val;
            item.returnedQty = item.quantity - val;
        }
        setDeliveryItems(newItems);
    };

    const submitDelivery = async () => {
        try {
            await ep1.post('/api/v2/markdelivered', {
                poid_str: selectedPO.poid,
                po_db_id: selectedPO._id,
                receivedby: deliveryNote,
                note: deliveryNote,
                doclink: docLink,
                user: global1.user,
                name: global1.name,
                colid: global1.colid,
                deliveryDetails: deliveryItems.map(item => ({
                    itemid: item.itemid, // This is the ITEM ID (Master ID or PO Item ID? - Backend expects PO Item ID mapping logic likely, but let's send full details)
                    // Backend uses item.itemcode if available in PO Item, usually stored as 'itemid' in PO item schema for master reference?
                    // Let's ensure backend gets what it needs.
                    // POItem schema: itemid (MasterItem ID), itemcode, itemname...
                    itemcode: item.itemcode || item.itemid, // Fallback
                    itemname: item.itemname,
                    itemtype: item.itemtype,
                    receivedQty: item.receivedQty,
                    returnedQty: item.returnedQty,
                    price: item.price,
                    discount: item.discount // If existing
                }))
            });
            alert('Delivery Recorded Successfully');
            setOpenDeliveryModal(false);
            fetchApprovedPOs();
        } catch (error) {
            console.error('Error recording delivery:', error);
            alert('Failed to record delivery');
        }
    };

    // Dynamic Columns
    const generateColumns = (data) => {
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
                    colDef.valueFormatter = (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A';
                }
                return colDef;
            });

        cols.push({
            field: 'doclink',
            headerName: 'Attachment Link',
            width: 200,
            renderCell: (params) => (
                params.value ? <a href={params.value} target="_blank" rel="noopener noreferrer">View Doc</a> : ''
            )
        });

        cols.push({
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <Button variant="contained" size="small" onClick={() => handleMarkDeliveredClick(params.row)}>
                    Quality Check & Deliver
                </Button>
            )
        });
        return cols;
    };

    const columns = generateColumns(approvedPOs);

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" gutterBottom>Delivery Quality Check Dashboard</Typography>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={approvedPOs}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                />
            </Paper>

            <Dialog open={openDeliveryModal} onClose={() => setOpenDeliveryModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Quality Check & Delivery: {selectedPO?.poid}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>Items Quality Check</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item</TableCell>
                                            <TableCell>Total Qty</TableCell>
                                            <TableCell>Accepted Qty</TableCell>
                                            <TableCell>Returned Qty</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {deliveryItems.map((item, index) => (
                                            <TableRow key={item._id || index}>
                                                <TableCell>{item.itemname}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={item.receivedQty}
                                                        onChange={(e) => handleQtyChange(index, 'receivedQty', e.target.value)}
                                                        inputProps={{ min: 0, max: item.quantity }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={item.returnedQty}
                                                        onChange={(e) => handleQtyChange(index, 'returnedQty', e.target.value)}
                                                        inputProps={{ min: 0, max: item.quantity }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Delivery Note / Received By"
                                fullWidth
                                multiline
                                rows={2}
                                value={deliveryNote}
                                onChange={(e) => setDeliveryNote(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Attachment Link"
                                fullWidth
                                placeholder="https://..."
                                value={docLink}
                                onChange={(e) => setDocLink(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeliveryModal(false)}>Cancel</Button>
                    <Button onClick={submitDelivery} variant="contained" color="success">Confirm Delivery</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeliveryDashboardds;
