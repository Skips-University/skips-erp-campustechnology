
import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import AdminLayout from "../components/AdminLayout";

const VendorComparisonSheetds = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [vendorItems, setVendorItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemmasterds?colid=${global1.colid}`);
            setItems(res.data.data.items || []);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    const handleItemChange = async (event, newValue) => {
        setSelectedItem(newValue);
        if (newValue) {
            await fetchVendorItems(newValue._id);
        } else {
            setVendorItems([]);
        }
    };

    const fetchVendorItems = async (itemId) => {
        setLoading(true);
        try {
            // Fetch vendor items that match the selected item ID
            // Assuming we have an endpoint or can filter getallvendoritemds
            const res = await ep1.get(`/api/v2/getallvendoritemds?colid=${global1.colid}`);
            const allVendorItems = res.data.data.items || [];

            // Filter by item ID (assuming 'item' field in vendoritem matches item._id)
            // We might need to populate vendor details if not already present
            const filtered = allVendorItems.filter(vi => vi.item === itemId);

            // We might need to fetch vendor details for each if not populated
            // For now assuming vendor name is available or we fetch it.
            // Actually, standard practice: getallvendoritemds might not return vendor name directly if not populated.
            // Let's assume we need to enrich it or it's populated.
            // Checking previous knowledge: vendoritem usually links vendor (id) and item (id) and price.

            const enriched = await Promise.all(filtered.map(async (vi) => {
                if (vi.vendor) {
                    try {
                        // Optimization: In a real app we'd want an endpoint that does this join.
                        // For now, fetching vendor details individually or if we had a list of vendors.
                        // Let's try to just display what we have or fetch vendor name.
                        const vendorRes = await ep1.get(`/api/v2/getvendordsbyid?id=${vi.vendor}`);
                        return { ...vi, vendorName: vendorRes.data.data.vendorname };
                    } catch (e) { return vi; }
                }
                return vi;
            }));

            setVendorItems(enriched);
        } catch (error) {
            console.error("Error fetching vendor items:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Vendor Comparison Sheet">
            <Box p={3}>
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={items}
                                getOptionLabel={(option) => option.itemname + " (" + option.itemcode + ")"}
                                value={selectedItem}
                                onChange={handleItemChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Item to Compare" variant="outlined" />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {selectedItem && (
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Comparison for: {selectedItem.itemname}
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Vendor Name</TableCell>
                                        <TableCell>Price</TableCell>
                                        <TableCell>Last Updated</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vendorItems.length > 0 ? (
                                        vendorItems.map((vi) => (
                                            <TableRow key={vi._id}>
                                                <TableCell>{vi.vendorName || vi.vendor}</TableCell>
                                                <TableCell>{vi.price}</TableCell>
                                                <TableCell>{vi.updatedAt ? new Date(vi.updatedAt).toLocaleDateString() : '-'}</TableCell>
                                                <TableCell>
                                                    <Button variant="outlined" size="small">Select</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                {loading ? "Loading..." : "No vendors found for this item."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Box>
        </AdminLayout>
    );
};

export default VendorComparisonSheetds;
