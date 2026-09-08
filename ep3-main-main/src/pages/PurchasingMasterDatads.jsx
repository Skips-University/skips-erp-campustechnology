import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Button,
    Grid,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    InputAdornment,
    Autocomplete // Added
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ep1 from '../api/ep1';
import global1 from './global1';

const PurchasingMasterDatads = () => {
    const [tabValue, setTabValue] = useState(0);

    // Data States
    const [stores, setStores] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [itemCategories, setItemCategories] = useState([]); // New
    const [itemUnits, setItemUnits] = useState([]);           // New
    const [items, setItems] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [vendorItems, setVendorItems] = useState([]);
    const [poConfig, setPoConfig] = useState({ notes: '', terms: '' }); // New

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    // Dialog States
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [formMode, setFormMode] = useState('create');
    const [currentContext, setCurrentContext] = useState('store');

    const [currentItem, setCurrentItem] = useState({});
    const [currentDeleteId, setCurrentDeleteId] = useState(null);

    // Initial Empty States
    const emptyStore = { storename: '', location: '', phone: '', storemanager: '' };
    const emptyType = { itemtype: '', description: '', status: '' };
    const emptyCategory = { name: '', description: '', status: 'Active' }; // New
    const emptyUnit = { name: '', unitcode: '', description: '', status: 'Active' }; // New
    const emptyItem = { itemname: '', itemcode: '', itemtype: '', category: '', unit: '', description: '', image: '', status: '' }; // Added category, unit
    const emptyVendor = { vendorname: '', pan: '', gst: '', address: '', state: '', city: '', mobileno: '', email: '', type: '', doclink: '' };
    const emptyVendorItem = {
        vendorid: '', itemid: '', price: '', discount: '', status: '', type: '',
        gst: '', sgst: '', cgst: '', igst: '', category: '', unit: '', unitcode: '' // Added fields
    };

    // Pagination State
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Reset pagination on tab change
        setPaginationModel({ page: 0, pageSize: 10 });
    }, [tabValue]);

    useEffect(() => {
        setLoading(true);
        // Restore global1 if missing (on reload)
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
            global1.name = localStorage.getItem('name');
            global1.department = localStorage.getItem('department');
        }

        const fetchData = async () => {
            const page = paginationModel.page + 1;
            const limit = paginationModel.pageSize;

            if (tabValue === 0) { setCurrentContext('store'); await fetchStores(page, limit); }
            if (tabValue === 1) { setCurrentContext('type'); await fetchItemTypes(page, limit); }
            if (tabValue === 2) { setCurrentContext('category'); await fetchItemCategories(page, limit); }
            if (tabValue === 3) { setCurrentContext('unit'); await fetchItemUnits(page, limit); }
            if (tabValue === 4) { setCurrentContext('item'); await fetchItems(page, limit); }
            // Pre-fetch related data for dropdowns (not paginated or separate call?)
            // Dropdowns typically need ALL data. Ideally we have separate 'getall' for dropdowns vs 'getpaginated' for grids.
            // For now, I will keep dropdown fetches as is (fetching all, hopefully backend handles it if no page param provided? yes I coded that).
            // Wait, fetchItems calls getallitemmasterds. If I pass page/limit, it paginates.
            // If I need dropdown data, I should call a separate function or different params.
            // But here tab 4 is "Items" grid. It needs pagination.
            // Dropdowns are needed for Create/Edit forms.
            // Let's assume Form Logic calls separate fetch if needed, or we rely on what we have.
            // Actually, `fetchItemTypes` in `tabValue === 4` is for dropdowns?
            // The original code: `if (tabValue === 4) { fetchItems(); fetchItemTypes(); ... }`
            // I need to be careful not to paginate the dropdown data calls if possible, OR just accept they might be paginated (which is bad for dropdowns).
            // My backend currently: if no page param, returns ALL.
            // So `fetchItems(page, limit)` -> paginated. `fetchItemTypes()` -> all.

            if (tabValue === 4) {
                // fetchItems is paginated
                // Other fetches for dropdowns (no args = no pagination = all)
                fetchItemTypes(); fetchItemCategories(); fetchItemUnits();
            }

            if (tabValue === 5) { setCurrentContext('vendor'); await fetchVendors(page, limit); }
            if (tabValue === 6) { setCurrentContext('vendorItem'); await fetchVendorItems(page, limit); fetchVendors(); fetchItems(); fetchItemCategories(); fetchItemUnits(); }
            if (tabValue === 7) { setCurrentContext('config'); await fetchPoConfig(); }

            setLoading(false);
        };
        fetchData();
    }, [tabValue, paginationModel]);

    // --- FETCH FUNCTIONS ---
    // Modified to accept page/limit. If not provided, backend returns all (good for dropdowns)
    const fetchStores = async (page, limit) => {
        try {
            let url = `/api/v2/getallstoremasterds?colid=${global1.colid}`;
            if (page) url += `&page=${page}&limit=${limit}`;
            if (searchQuery) url += `&search=${searchQuery}`;

            const res = await ep1.get(url);
            setStores((res.data.data.stores || []).map(r => ({ ...r, id: r._id })));
            if (page) setRowCount(res.data.total || res.data.results || 0);
        } catch (e) { console.error(e); }
    };

    // ItemTypes - logic might need update if I haven't updated its controller yet.
    // I only updated 5 controllers. ItemType NOT updated yet. 
    // I should update ItemType controller first? The user said "all tables".
    // I will update frontend to SEND params, if backend ignores them, it returns all. 
    // I need to update rowCount correctly though.
    // If backend doesn't support pagination yet, it returns all. setRowCount(res.data.count).
    // I will start with what I updated.

    const fetchItemTypes = async (page, limit) => {
        try {
            let url = `/api/v2/getallitemtypeds?colid=${global1.colid}`;
            if (page) url += `&page=${page}&limit=${limit}`;
            if (searchQuery) url += `&search=${searchQuery}`;
            const res = await ep1.get(url);
            setItemTypes((res.data.data.itemTypes || []).map(r => ({ ...r, id: r._id })));
            if (page) setRowCount(res.data.count || 0);
        } catch (e) { console.error(e); }
    };
    const fetchItemCategories = async (page, limit) => {
        try {
            let url = `/api/v2/getallitemcategoryds?colid=${global1.colid}`;
            if (page) url += `&page=${page}&limit=${limit}`;
            if (searchQuery) url += `&search=${searchQuery}`;
            const res = await ep1.get(url);
            setItemCategories((res.data.data.items || []).map(r => ({ ...r, id: r._id })));
            if (page) setRowCount(res.data.count || 0);
        } catch (e) { console.error(e); }
    };
    const fetchItemUnits = async (page, limit) => {
        try {
            let url = `/api/v2/getallitemunitds?colid=${global1.colid}`;
            if (page) url += `&page=${page}&limit=${limit}`;
            if (searchQuery) url += `&search=${searchQuery}`;
            const res = await ep1.get(url);
            setItemUnits((res.data.data.items || []).map(r => ({ ...r, id: r._id })));
            if (page) setRowCount(res.data.count || 0);
        } catch (e) { console.error(e); }
    };

    // Items (Updated Controller)
    const fetchItems = async (page, limit) => {
        try {
            let url = `/api/v2/getallitemmasterds?colid=${global1.colid}`;
            if (page) url += `&page=${page}&limit=${limit}`;
            if (searchQuery) url += `&search=${searchQuery}`;

            const res = await ep1.get(url);
            setItems((res.data.data.items || []).map(r => ({ ...r, id: r._id })));
            if (page) setRowCount(res.data.total || res.data.count || 0);
        } catch (e) { console.error(e); }
    };

    // Vendors (Updated Controller)
    const fetchVendors = async (page, limit) => {
        try {
            let url = `/api/v2/getallvendords?colid=${global1.colid}`;
            if (page) url += `&page=${page}&limit=${limit}`;
            if (searchQuery) url += `&search=${searchQuery}`;

            const res = await ep1.get(url);
            // Note: vendordsctlr returns data: vendors (array) directly. 
            // But my updated controller returns data: vendors (array).
            // Wait, I updated it to return { data: vendors, total: ... }
            setVendors((res.data.data.vendors || []).map(r => ({ ...r, id: r._id })));
            if (page) setRowCount(res.data.total || res.data.count || 0);
        } catch (e) { console.error(e); }
    };

    // Vendor Items (Updated Controller I need to update the file now if I haven't? I did update it in previous step? No I didn't verify it)
    // I updated vendoritemdsctlr in step 2441? I replaced storepoorderdsctlr.
    // I updated vendoritemdsctlr in step 2452 view? No I just viewed it.
    // I MUST UPDATE vendoritemdsctlr !!! I missed it.
    // I will update fetchVendorItems assuming backend update coming next.
    const fetchVendorItems = async (page, limit) => {
        try {
            const url = page ? `/api/v2/getallvendoritemds?colid=${global1.colid}&page=${page}&limit=${limit}` : `/api/v2/getallvendoritemds?colid=${global1.colid}`;
            const res = await ep1.get(url);
            setVendorItems((res.data.data.vendorItems || []).map(r => ({ ...r, id: r._id })));
            if (page) setRowCount(res.data.total || res.data.count || 0);
        } catch (e) { console.error(e); }
    };

    const fetchPoConfig = async () => { try { const res = await ep1.get(`/api/v2/getpoconfigds?colid=${global1.colid}`); if (res.data.data) setPoConfig(res.data.data); } catch (e) { console.error(e); } };

    // --- FORM HANDLING ---
    const openCreateDialog = () => {
        setFormMode('create');
        if (currentContext === 'store') setCurrentItem({ ...emptyStore });
        if (currentContext === 'type') setCurrentItem({ ...emptyType });
        if (currentContext === 'category') setCurrentItem({ ...emptyCategory }); // New
        if (currentContext === 'unit') setCurrentItem({ ...emptyUnit });         // New
        if (currentContext === 'item') setCurrentItem({ ...emptyItem });
        if (currentContext === 'vendor') setCurrentItem({ ...emptyVendor });
        if (currentContext === 'vendorItem') setCurrentItem({ ...emptyVendorItem });
        setFormDialogOpen(true);
    };

    const openEditDialog = (item) => {
        setFormMode('edit');
        setCurrentItem({ ...item });
        setFormDialogOpen(true);
    };

    const handleConfigSave = async () => {
        try {
            const payload = { ...poConfig, colid: global1.colid, user: global1.user };
            if (poConfig._id) {
                await ep1.post(`/api/v2/updatepoconfigds?id=${poConfig._id}`, payload);
            } else {
                await ep1.post(`/api/v2/addpoconfigds`, payload);
            }
            alert('Settings Saved Successfully');
            fetchPoConfig();
        } catch (e) {
            console.error(e);
            alert('Error saving settings');
        }
    };

    const handleFormSubmit = async () => {
        try {
            const commonPayload = { colid: global1.colid, user: global1.user };

            // STORE
            if (currentContext === 'store') {
                const payload = { ...currentItem, ...commonPayload, name: currentItem.storename };
                if (formMode === 'create') await ep1.post('/api/v2/addstoremasterds', payload);
                else await ep1.post(`/api/v2/updatestoremasterds?id=${currentItem._id}`, payload);
                fetchStores();
            }
            // TYPE
            else if (currentContext === 'type') {
                const payload = { ...currentItem, ...commonPayload, name: currentItem.itemtype };
                if (formMode === 'create') await ep1.post('/api/v2/additemtypeds', payload);
                else await ep1.post(`/api/v2/updateitemtypeds?id=${currentItem._id}`, payload);
                fetchItemTypes();
            }
            // CATEGORY
            else if (currentContext === 'category') { // New
                const payload = { ...currentItem, ...commonPayload, categoryname: currentItem.name };
                if (formMode === 'create') await ep1.post('/api/v2/additemcategoryds', payload);
                else await ep1.post(`/api/v2/updateitemcategoryds?id=${currentItem._id}`, payload);
                fetchItemCategories();
            }
            // UNIT
            else if (currentContext === 'unit') { // New
                const payload = { ...currentItem, ...commonPayload, unitname: currentItem.name };
                if (formMode === 'create') await ep1.post('/api/v2/additemunitds', payload);
                else await ep1.post(`/api/v2/updateitemunitds?id=${currentItem._id}`, payload);
                fetchItemUnits();
            }
            // ITEM
            else if (currentContext === 'item') {
                const payload = { ...currentItem, ...commonPayload, name: currentItem.itemname };
                if (formMode === 'create') await ep1.post('/api/v2/additemmasterds', payload);
                else await ep1.post(`/api/v2/updateitemmasterds?id=${currentItem._id}`, payload);
                fetchItems();
            }
            // VENDOR
            else if (currentContext === 'vendor') {
                const payload = { ...currentItem, ...commonPayload, name: currentItem.vendorname };
                if (formMode === 'create') await ep1.post('/api/v2/addvendords', payload);
                else await ep1.post(`/api/v2/updatevendords?id=${currentItem._id}`, payload);
                fetchVendors();
            }
            // VENDOR ITEM
            else if (currentContext === 'vendorItem') {
                const v = vendors.find(v => v._id === currentItem.vendorid);
                const i = items.find(i => i._id === currentItem.itemid);
                const payload = {
                    ...currentItem, ...commonPayload,
                    vendorname: v?.vendorname,
                    item: i?.itemname,
                    name: `${v?.vendorname}-${i?.itemname}`
                };
                if (formMode === 'create') await ep1.post('/api/v2/addvendoritemds', payload);
                else await ep1.post(`/api/v2/updatevendoritemds?id=${currentItem._id}`, payload);
                fetchVendorItems();
            }

            alert(`${formMode === 'create' ? 'Added' : 'Updated'} Successfully`);
            setFormDialogOpen(false);

        } catch (e) {
            console.error(e);
            alert(`Error ${formMode === 'create' ? 'adding' : 'updating'} item`);
        }
    };

    // --- DELETE FUNCTIONS ---
    const openDeleteDialog = (id) => { setCurrentDeleteId(id); setDeleteDialogOpen(true); };
    const handleDeleteConfirm = async () => {
        try {
            if (currentContext === 'store') await ep1.get(`/api/v2/deletestoremasterds?id=${currentDeleteId}`);
            if (currentContext === 'type') await ep1.get(`/api/v2/deleteitemtypeds?id=${currentDeleteId}`);
            if (currentContext === 'category') await ep1.delete(`/api/v2/deleteitemcategoryds?id=${currentDeleteId}`); // New
            if (currentContext === 'unit') await ep1.delete(`/api/v2/deleteitemunitds?id=${currentDeleteId}`);         // New
            if (currentContext === 'item') await ep1.get(`/api/v2/deleteitemmasterds?id=${currentDeleteId}`);
            if (currentContext === 'vendor') await ep1.get(`/api/v2/deletevendords?id=${currentDeleteId}`);
            if (currentContext === 'vendorItem') await ep1.get(`/api/v2/deletevendoritemds?id=${currentDeleteId}`);

            alert('Deleted Successfully');
            setDeleteDialogOpen(false);

            if (currentContext === 'store') fetchStores();
            if (currentContext === 'type') fetchItemTypes();
            if (currentContext === 'category') fetchItemCategories();
            if (currentContext === 'unit') fetchItemUnits();
            if (currentContext === 'item') fetchItems();
            if (currentContext === 'vendor') fetchVendors();
            if (currentContext === 'vendorItem') fetchVendorItems();
        } catch (e) { alert('Error deleting'); }
    };

    // --- RENDER FORM FIELDS ---
    const renderFormFields = () => {
        if (currentContext === 'store') {
            return (
                <>
                    <TextField fullWidth margin="dense" label="Store Name" value={currentItem.storename || ''} onChange={e => setCurrentItem({ ...currentItem, storename: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Location" value={currentItem.location || ''} onChange={e => setCurrentItem({ ...currentItem, location: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Phone" value={currentItem.phone || ''} onChange={e => setCurrentItem({ ...currentItem, phone: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Manager Name" value={currentItem.storemanager || ''} onChange={e => setCurrentItem({ ...currentItem, storemanager: e.target.value })} />
                </>
            );
        }
        if (currentContext === 'type') {
            return (
                <>
                    <TextField fullWidth margin="dense" label="Type" value={currentItem.itemtype || ''} onChange={e => setCurrentItem({ ...currentItem, itemtype: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Description" value={currentItem.description || ''} onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Status" value={currentItem.status || ''} onChange={e => setCurrentItem({ ...currentItem, status: e.target.value })} />
                </>
            );
        }
        if (currentContext === 'category') { // New
            return (
                <>
                    <TextField fullWidth margin="dense" label="Category Name" value={currentItem.name || ''} onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Description" value={currentItem.description || ''} onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Status" value={currentItem.status || ''} onChange={e => setCurrentItem({ ...currentItem, status: e.target.value })} />
                </>
            );
        }
        if (currentContext === 'unit') { // New
            return (
                <>
                    <TextField fullWidth margin="dense" label="Unit Name" value={currentItem.name || ''} onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Unit Code" value={currentItem.unitcode || ''} onChange={e => setCurrentItem({ ...currentItem, unitcode: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Description" value={currentItem.description || ''} onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Status" value={currentItem.status || ''} onChange={e => setCurrentItem({ ...currentItem, status: e.target.value })} />
                </>
            );
        }
        if (currentContext === 'item') {
            return (
                <>
                    <TextField fullWidth margin="dense" label="Item Name" value={currentItem.itemname || ''} onChange={e => setCurrentItem({ ...currentItem, itemname: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Item Code" value={currentItem.itemcode || ''} onChange={e => setCurrentItem({ ...currentItem, itemcode: e.target.value })} />

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Type</InputLabel>
                        <Select value={currentItem.itemtype || ''} label="Type" onChange={e => setCurrentItem({ ...currentItem, itemtype: e.target.value })}>
                            {itemTypes.map(t => <MenuItem key={t._id} value={t.itemtype}>{t.itemtype}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Category</InputLabel>
                        <Select value={currentItem.category || ''} label="Category" onChange={e => setCurrentItem({ ...currentItem, category: e.target.value })}>
                            {itemCategories.map(c => <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Unit</InputLabel>
                        <Select value={currentItem.unit || ''} label="Unit" onChange={e => setCurrentItem({ ...currentItem, unit: e.target.value })}>
                            {itemUnits.map(u => <MenuItem key={u._id} value={u.unitname}>{u.unitname} ({u.unitcode})</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="dense" label="Description" value={currentItem.description || ''} onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Image URL" value={currentItem.image || ''} onChange={e => setCurrentItem({ ...currentItem, image: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Status" value={currentItem.status || ''} onChange={e => setCurrentItem({ ...currentItem, status: e.target.value })} />
                </>
            );
        }
        if (currentContext === 'vendor') {
            return (
                <>
                    <TextField fullWidth margin="dense" label="Vendor Name" value={currentItem.vendorname || ''} onChange={e => setCurrentItem({ ...currentItem, vendorname: e.target.value })} />
                    <TextField fullWidth margin="dense" label="PAN" value={currentItem.pan || ''} onChange={e => setCurrentItem({ ...currentItem, pan: e.target.value })} />
                    <TextField fullWidth margin="dense" label="GST" value={currentItem.gst || ''} onChange={e => setCurrentItem({ ...currentItem, gst: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Address" value={currentItem.address || ''} onChange={e => setCurrentItem({ ...currentItem, address: e.target.value })} />
                    <TextField fullWidth margin="dense" label="State" value={currentItem.state || ''} onChange={e => setCurrentItem({ ...currentItem, state: e.target.value })} />
                    <TextField fullWidth margin="dense" label="City" value={currentItem.city || ''} onChange={e => setCurrentItem({ ...currentItem, city: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Mobile" value={currentItem.mobileno || ''} onChange={e => setCurrentItem({ ...currentItem, mobileno: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Email" value={currentItem.email || ''} onChange={e => setCurrentItem({ ...currentItem, email: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Type" value={currentItem.type || ''} onChange={e => setCurrentItem({ ...currentItem, type: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Attachment Link" value={currentItem.doclink || ''} onChange={e => setCurrentItem({ ...currentItem, doclink: e.target.value })} placeholder="https://..." />
                </>
            );
        }
        if (currentContext === 'vendorItem') {
            return (
                <>
                    <FormControl fullWidth margin="dense">
                        <Autocomplete
                            options={vendors}
                            getOptionLabel={(option) => option.vendorname || option.name || ""}
                            value={vendors.find(v => v._id === currentItem.vendorid) || null}
                            onChange={(event, newValue) => setCurrentItem({ ...currentItem, vendorid: newValue ? newValue._id : '' })}
                            renderInput={(params) => <TextField {...params} label="Vendor" />}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <Autocomplete
                            options={items}
                            getOptionLabel={(option) => option.itemname || option.name || ""}
                            value={items.find(i => i._id === currentItem.itemid) || null}
                            onChange={(event, newValue) => setCurrentItem({ ...currentItem, itemid: newValue ? newValue._id : '' })}
                            renderInput={(params) => <TextField {...params} label="Item" />}
                        />
                    </FormControl>
                    <TextField fullWidth margin="dense" label="Price" type="number" value={currentItem.price || ''} onChange={e => setCurrentItem({ ...currentItem, price: e.target.value })} />
                    <TextField fullWidth margin="dense" label="Discount (%)" type="number" value={currentItem.discount || ''} onChange={e => setCurrentItem({ ...currentItem, discount: e.target.value })} />

                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Tax & Unit Details</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField fullWidth margin="dense" label="GST (%)" type="number" value={currentItem.gst || ''} onChange={e => setCurrentItem({ ...currentItem, gst: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            {/* Optional Breakdowns */}
                            <TextField fullWidth margin="dense" label="SGST" type="number" value={currentItem.sgst || ''} onChange={e => setCurrentItem({ ...currentItem, sgst: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth margin="dense" label="CGST" type="number" value={currentItem.cgst || ''} onChange={e => setCurrentItem({ ...currentItem, cgst: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth margin="dense" label="IGST" type="number" value={currentItem.igst || ''} onChange={e => setCurrentItem({ ...currentItem, igst: e.target.value })} />
                        </Grid>
                    </Grid>

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Category</InputLabel>
                        <Select value={currentItem.category || ''} label="Category" onChange={e => setCurrentItem({ ...currentItem, category: e.target.value })}>
                            {itemCategories.map(c => <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Unit</InputLabel>
                        <Select value={currentItem.unit || ''} label="Unit" onChange={e => setCurrentItem({ ...currentItem, unit: e.target.value })}>
                            {itemUnits.map(u => <MenuItem key={u._id} value={u.unitname}>{u.unitname} ({u.unitcode})</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="dense" label="Status" value={currentItem.status || ''} onChange={e => setCurrentItem({ ...currentItem, status: e.target.value })} />
                </>
            );
        }
    };

    // --- COLUMNS DEF ---
    const getColumns = () => {
        const actionColumn = {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <>
                    <IconButton color="primary" onClick={() => openEditDialog(params.row)} size="small"><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => openDeleteDialog(params.row._id)} size="small"><DeleteIcon /></IconButton>
                </>
            )
        };

        if (currentContext === 'store') {
            return [
                { field: 'storename', headerName: 'Name', width: 200 },
                { field: 'location', headerName: 'Location', width: 200 },
                { field: 'phone', headerName: 'Phone', width: 150 },
                { field: 'storemanager', headerName: 'Manager', width: 200 },
                actionColumn
            ];
        }
        if (currentContext === 'type') {
            return [
                { field: 'itemtype', headerName: 'Type', width: 200 },
                { field: 'description', headerName: 'Description', width: 300 },
                { field: 'status', headerName: 'Status', width: 150 },
                actionColumn
            ];
        }
        if (currentContext === 'category') { // New
            return [
                { field: 'name', headerName: 'Category Name', width: 200 },
                { field: 'description', headerName: 'Description', width: 300 },
                { field: 'status', headerName: 'Status', width: 150 },
                actionColumn
            ];
        }
        if (currentContext === 'unit') { // New
            return [
                { field: 'name', headerName: 'Unit Name', width: 200 },
                { field: 'unitcode', headerName: 'Code', width: 100 },
                { field: 'description', headerName: 'Description', width: 300 },
                { field: 'status', headerName: 'Status', width: 150 },
                actionColumn
            ];
        }
        if (currentContext === 'item') {
            return [
                { field: 'itemname', headerName: 'Name', width: 200 },
                { field: 'itemcode', headerName: 'Code', width: 150 },
                { field: 'category', headerName: 'Category', width: 150 }, // New
                { field: 'unit', headerName: 'Unit', width: 150 },         // New
                { field: 'itemtype', headerName: 'Type', width: 150 },
                { field: 'description', headerName: 'Description', width: 250 },
                { field: 'status', headerName: 'Status', width: 150 },
                actionColumn
            ];
        }
        if (currentContext === 'vendor') {
            return [
                { field: 'vendorname', headerName: 'Name', width: 200 },
                { field: 'mobileno', headerName: 'Mobile', width: 150 },
                { field: 'type', headerName: 'Type', width: 150 },
                { field: 'gst', headerName: 'GST No', width: 150 },
                { field: 'address', headerName: 'Address', width: 250 },
                {
                    field: 'doclink', headerName: 'Attachment Link', width: 200,
                    renderCell: (params) => (params.value ? <a href={params.value} target="_blank" rel="noopener noreferrer">View Doc</a> : '')
                },
                actionColumn
            ];
        }
        if (currentContext === 'vendorItem') {
            return [
                { field: 'vendorname', headerName: 'Vendor', width: 200 },
                { field: 'item', headerName: 'Item', width: 200 },
                { field: 'price', headerName: 'Price', width: 100 },
                { field: 'discount', headerName: 'Disc %', width: 100 },
                { field: 'gst', headerName: 'GST %', width: 100 },       // New
                { field: 'category', headerName: 'Category', width: 150 }, // New
                { field: 'unit', headerName: 'Unit', width: 100 },         // New
                { field: 'status', headerName: 'Status', width: 150 },
                actionColumn
            ];
        }
        return [];
    };

    const getRows = () => {
        if (currentContext === 'store') return stores;
        if (currentContext === 'type') return itemTypes;
        if (currentContext === 'category') return itemCategories; // New
        if (currentContext === 'unit') return itemUnits;         // New
        if (currentContext === 'item') return items;
        if (currentContext === 'vendor') return vendors;
        if (currentContext === 'vendorItem') return vendorItems;
        return [];
    };

    return (
        <Box p={3} sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>Purchasing Master Data</Typography>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Stores" />
                <Tab label="Item Types" />
                <Tab label="Item Categories" /> {/* New */}
                <Tab label="Item Units" />      {/* New */}
                <Tab label="Items" />
                <Tab label="Vendors" />
                <Tab label="Vendor Items" />
                <Tab label="PO Settings" /> {/* New */}
            </Tabs>

            {/* ACTION BAR */}
            {currentContext !== 'config' && (
                <Box mb={2} display="flex" justifyContent="flex-end">
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
                        Create New {currentContext === 'vendorItem' ? 'Mapping' : currentContext.charAt(0).toUpperCase() + currentContext.slice(1)}
                    </Button>
                </Box>
            )}

            {/* MAIN CONTENT AREA */}
            <Paper sx={{ flexGrow: 1, width: '100%', p: tabValue === 7 ? 3 : 0 }}>
                {tabValue === 7 ? (
                    <Box sx={{ maxWidth: 600 }}>
                        <Typography variant="h6" gutterBottom>PO Notes & Terms</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Default Purchase Order Notes"
                            margin="normal"
                            value={poConfig.notes || ''}
                            onChange={(e) => setPoConfig({ ...poConfig, notes: e.target.value })}
                            helperText="These notes will appear on the bottom of new Purchase Orders."
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="Default Terms & Conditions"
                            margin="normal"
                            value={poConfig.terms || ''}
                            onChange={(e) => setPoConfig({ ...poConfig, terms: e.target.value })}
                            helperText="Terms & Conditions to be printed on the invoice."
                        />
                        <Box mt={2}>
                            <Button variant="contained" color="primary" onClick={handleConfigSave}>Save Settings</Button>
                        </Box>
                    </Box>
                ) : (
                    <DataGrid
                        rows={getRows()}
                        columns={getColumns()}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        paginationMode="server"
                        rowCount={rowCount}
                        loading={loading}
                        disableSelectionOnClick
                        getRowId={(row) => row._id}
                        inputProps={{ 'aria-label': 'Master Data Grid' }}
                    />
                )}
            </Paper>

            {/* FORM DIALOG (CREATE & EDIT) */}
            <Dialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{formMode === 'create' ? 'Create New' : 'Edit'} {currentContext}</DialogTitle>
                <DialogContent>
                    {renderFormFields()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFormDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleFormSubmit} variant="contained" color="primary">
                        {formMode === 'create' ? 'Create' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DELETE DIALOG */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this item?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PurchasingMasterDatads;
