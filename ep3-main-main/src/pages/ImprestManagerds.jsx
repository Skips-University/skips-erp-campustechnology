import React, { useState, useEffect } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';


const ImprestManagerds = () => {
    const [imprests, setImprests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        imprestcode: '',
        amount: '',
        impdate: '',
        officername: '',
        status: 'Pending'
    });

    useEffect(() => {
        fetchImprests();
    }, [page, pageSize]);

    const fetchImprests = async () => {
        setLoading(true);
        try {
            const res = await ep1.get('/api/v2/getallpimprestds', {
                params: {
                    colid: global1.colid,
                    page: page + 1,
                    limit: pageSize
                }
            });
            if (res.data.success) {
                setImprests(res.data.data.imprests);
                setTotal(res.data.pagination.total);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setFormData({
            imprestcode: `IMP-${Date.now()}`, // Auto-generate code
            amount: '',
            impdate: new Date().toISOString().split('T')[0],
            officername: global1.name, // Auto-fill current user name
            status: 'Pending'
        });
        setIsEdit(false);
        setOpenDialog(true);
    };

    const handleEdit = (row) => {
        setFormData({
            imprestcode: row.imprestcode,
            amount: row.amount,
            impdate: row.impdate ? new Date(row.impdate).toISOString().split('T')[0] : '',
            officername: row.officername,
            status: row.status
        });
        setCurrentId(row._id);
        setIsEdit(true);
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this Imprest record?")) return;
        try {
            await ep1.get(`/api/v2/deletepimprestds?id=${id}`);
            fetchImprests();
        } catch (error) {
            console.error(error);
            alert("Error deleting record");
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus} this request?`)) return;
        try {
            await ep1.post(`/api/v2/updatepimprestds?id=${id}`, {
                status: newStatus,
                colid: global1.colid
            });
            fetchImprests();
        } catch (error) {
            console.error(error);
            alert("Error updating status");
        }
    };

    const handleSubmit = async () => {
        const payload = {
            ...formData,
            colid: global1.colid,
            name: formData.imprestcode, // Use code as name
            user: global1.user // Strictly use global1.user
        };
        try {
            if (isEdit) {
                await ep1.post(`/api/v2/updatepimprestds?id=${currentId}`, payload);
            } else {
                await ep1.post(`/api/v2/addpimprestds`, payload);
            }
            setOpenDialog(false);
            fetchImprests();
        } catch (error) {
            console.error(error);
            alert("Error saving record");
        }
    };

    // Print State
    const [printOpen, setPrintOpen] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [uniDetails, setUniDetails] = useState({
        name: "PEOPLE'S UNIVERSITY",
        address: 'BHANPUR, KAROND BYPASS ROAD, BHOPAL (M.P.) – 462010'
    });

    const handlePrintOpen = (row) => {
        setPrintData(row);
        setPrintOpen(true);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-imprest-area');
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            printWindow.document.write('<html><head><title>Imprest Voucher</title>');
            printWindow.document.write('</head><body >');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        }
    };

    // Number to Words function (Simple version)
    const activeNumToWords = (n) => {
        if (n < 0) return false;
        const single = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const formatTenth = (n) => {
            let word = '';
            let t = Math.floor(n / 10);
            let u = n % 10;
            if (t > 1) { word += tens[t] + ' '; word += single[u]; }
            else if (t === 1) { word += double[u]; }
            else { word += single[u]; }
            return word;
        };
        return n + " Only"; // Placeholder
    };

    const columns = [
        { field: 'imprestcode', headerName: 'Imprest Code', width: 150 },
        { field: 'officername', headerName: 'Officer Name', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 120 },
        { field: 'impdate', headerName: 'Date', width: 150, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
        { field: 'status', headerName: 'Status', width: 120 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 250,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handlePrintOpen(params.row)} color="secondary" title="Print"><PrintIcon /></IconButton>

                    {/* Approve/Reject for Purchasepu */}
                    {global1.role === 'Purchasepu' && params.row.status === 'Pending' && (
                        <>
                            <IconButton onClick={() => handleStatusUpdate(params.row._id, 'Approved')} color="success" title="Approve">
                                <CheckCircleIcon />
                            </IconButton>
                            <IconButton onClick={() => handleStatusUpdate(params.row._id, 'Reject')} color="error" title="Reject">
                                <CancelIcon />
                            </IconButton>
                        </>
                    )}

                    {/* Edit/Delete for others */}
                    {global1.role !== 'Purchasepu' && (
                        <>
                            <IconButton onClick={() => handleEdit(params.row)} color="primary"><EditIcon /></IconButton>
                            <IconButton onClick={() => handleDelete(params.row._id)} color="error"><DeleteIcon /></IconButton>
                        </>
                    )}
                </Box>
            )
        }
    ];

    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Imprest Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    New Imprest
                </Button>
            </Box>

            <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={imprests}
                    columns={columns}
                    getRowId={(row) => row._id}
                    rowCount={total}
                    pagination
                    paginationMode="server"
                    onPaginationModelChange={(model) => {
                        setPage(model.page);
                        setPageSize(model.pageSize);
                    }}
                    pageSizeOptions={[5, 10, 20]}
                    loading={loading}
                />
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{isEdit ? 'Edit Imprest' : 'New Imprest'}</DialogTitle>
                <DialogContent sx={{ minWidth: 400, mt: 1 }}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Imprest Code" value={formData.imprestcode} disabled />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Officer Name" value={formData.officername} onChange={(e) => setFormData({ ...formData, officername: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={formData.impdate} onChange={(e) => setFormData({ ...formData, impdate: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Reject">Reject</option>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Print Dialog */}
            <Dialog open={printOpen} onClose={() => setPrintOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Generate Imprest Format</DialogTitle>
                <DialogContent>
                    <Box mt={2} mb={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField fullWidth label="University/Institute Name" value={uniDetails.name} onChange={(e) => setUniDetails({ ...uniDetails, name: e.target.value })} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Address" value={uniDetails.address} onChange={(e) => setUniDetails({ ...uniDetails, address: e.target.value })} />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Printable Area - Visible in Dialog for Preview */}
                    <Box id="printable-imprest-area" sx={{ p: 2, fontFamily: 'Times New Roman, serif', color: '#000' }}>
                        <div style={{ border: '2px solid #000' }}>
                            {/* Header */}
                            <div style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #000' }}>
                                <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>{uniDetails.name}</h2>
                                <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{uniDetails.address}</p>
                                {/* Phone is hardcoded in image but we can make it part of address or static for now */}
                                {/* <p style={{ margin: 0, fontSize: '14px' }}>Phone: (0755) 4005170</p> */}
                            </div>

                            {/* Sub-Header */}
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', padding: '5px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline' }}>IMPREST APPROVAL</h3>
                            </div>

                            {/* Ref No & Date */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px', fontSize: '14px', fontWeight: 'bold' }}>
                                <div>{printData?.imprestcode.replace('IMP-', 'PU/PUR/2025-26/IMPREST/')}</div>
                                <div>DATE : {printData?.impdate ? new Date(printData.impdate).toLocaleDateString() : ''}</div>
                            </div>

                            {/* Content Body */}
                            <div style={{ padding: '30px 20px', minHeight: '300px' }}>
                                <p style={{ fontSize: '16px', marginBottom: '30px' }}>Dear Sir/Ma'am,</p>

                                <p style={{ fontSize: '16px', lineHeight: '1.6', marginLeft: '40px' }}>
                                    Please approve the Imprest Amount Rs. {printData?.amount}/- ({activeNumToWords(printData?.amount)}) for Miscellaneous Expenses.
                                </p>
                            </div>

                            {/* Signatures */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', marginTop: '50px' }}>
                                <div style={{ alignSelf: 'flex-end', fontWeight: 'bold' }}>
                                    PURCHASE MANAGER
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>Thanks & Regards</p>
                                    <p style={{ margin: '30px 0 0 0', fontWeight: 'bold' }}>{printData?.officername}</p>
                                    <p style={{ margin: 0 }}>Purchase Executive</p>
                                </div>
                            </div>
                        </div>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPrintOpen(false)}>Close</Button>
                    <Button onClick={handlePrint} variant="contained" color="primary">Download / Print</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default ImprestManagerds;
