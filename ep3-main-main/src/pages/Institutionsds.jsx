import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import global1 from './global1'; // Importing the global state object directly
import api from '../api/ep1';

const Institutionsds = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            // Assuming global1.colid holds the current Admin's colid
            const adminColId = global1.colid;

            if (!adminColId) {
                console.error("Admin ColID not found in global1");
                setLoading(false);
                return;
            }

            // Using the route defined by user in app.js (query param)
            const response = await api.get(`/api/v2/checkinstitutionsds?colid=${adminColId}`);

            if (response.data.status === 'success') {
                // Add unique id for DataGrid
                const rows = response.data.data.institutions.map((inst, index) => ({
                    ...inst,
                    id: inst._id || index
                }));
                setInstitutions(rows);
            }
        } catch (error) {
            console.error("Error fetching institutions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVisit = (institution) => {
        // 1. Set colid of that institution in global1.colid
        global1.colid = institution.colid;

        // 2. Set institution name in global1.name
        global1.name = institution.institutionname;

        // 3. Redirect to /dashmfeesadmin
        navigate('/dashmncas11admin');
    };

    const columns = [
        { field: 'institutioncode', headerName: 'Code', width: 120 },
        { field: 'institutionname', headerName: 'Institution Name', width: 250 },
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'district', headerName: 'District', width: 150 },
        { field: 'state', headerName: 'State', width: 150 },
        { field: 'status', headerName: 'Status', width: 120 },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleVisit(params.row)}
                >
                    Visit
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3, height: '100%', width: '100%' }}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Managed Institutions
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    Select an institution to manage its fees and data.
                </Typography>
            </Paper>

            <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={institutions}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    loading={loading}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold',
                        },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default Institutionsds;
