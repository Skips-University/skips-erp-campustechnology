import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import ep1 from '../api/ep1';
import global1 from './global1';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { mainListItems } from './menucas1';

const sidebarWidth = 250;
const mdTheme = createTheme();

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: sidebarWidth,
    width: `calc(100% - ${sidebarWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: sidebarWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9)
      }
    })
  }
}));

const emptyForm = {
  institutionname: '',
  logolink: '',
  address: '',
  presidentname: '',
  vcname: '',
  registrarname: '',
  tandclink: '',
  contactusdetails: '',
  privacypolicylink: '',
  refundpolicylink: ''
};

const fields = [
  { field: 'institutionname', label: 'Institution name', md: 4 },
  { field: 'logolink', label: 'Logo link', md: 4 },
  { field: 'address', label: 'Address', md: 4 },
  { field: 'presidentname', label: 'President name', md: 4 },
  { field: 'vcname', label: 'VC name', md: 4 },
  { field: 'registrarname', label: 'Registrar name', md: 4 },
  { field: 'tandclink', label: 'Terms and conditions link', md: 4 },
  { field: 'privacypolicylink', label: 'Privacy policy link', md: 4 },
  { field: 'refundpolicylink', label: 'Refund policy link', md: 4 },
  { field: 'contactusdetails', label: 'Contact us details', md: 12, multiline: true }
];

export default function InstitutionPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(true);

  const fetchData = async () => {
    const res = await ep1.get(`/api/institution?colid=${global1.colid}`);
    setRows(res.data.map(r => ({ ...r, id: r._id })));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    const payload = { ...form, colid: global1.colid };

    if (editId) {
      await ep1.post(`/api/institutionup/${editId}`, payload);
    } else {
      await ep1.post('/api/institution', payload);
    }

    setForm(emptyForm);
    setEditId(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    await ep1.post(`/api/institutiondel/${id}`);
    fetchData();
  };

  const handleEdit = (row) => {
    setForm({ ...emptyForm, ...row });
    setEditId(row.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns = [
    { field: 'institutionname', headerName: 'Institution', minWidth: 220, flex: 1 },
    { field: 'address', headerName: 'Address', minWidth: 220, flex: 1 },
    { field: 'presidentname', headerName: 'President', width: 150 },
    { field: 'vcname', headerName: 'VC', width: 150 },
    { field: 'registrarname', headerName: 'Registrar', width: 150 },
    { field: 'tandclink', headerName: 'T&C link', minWidth: 180, flex: 1 },
    { field: 'contactusdetails', headerName: 'Contact details', minWidth: 220, flex: 1 },
    { field: 'privacypolicylink', headerName: 'Privacy policy', minWidth: 180, flex: 1 },
    { field: 'refundpolicylink', headerName: 'Refund policy', minWidth: 180, flex: 1 },
    {
      field: 'edit', headerName: 'Edit', width: 100, sortable: false, renderCell: (params) => (
        <Button onClick={() => handleEdit(params.row)}>Edit</Button>
      )
    },
    {
      field: 'delete', headerName: 'Delete', width: 110, sortable: false, renderCell: (params) => (
        <Button color="error" onClick={() => handleDelete(params.row.id)}>Delete</Button>
      )
    }
  ];

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBarStyled position="absolute" open={open}>
          <Toolbar sx={{ pr: '24px' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              sx={{ marginRight: '36px', ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              Institution Details
            </Typography>
          </Toolbar>
        </AppBarStyled>

        <DrawerStyled variant="permanent" open={open}>
          <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1] }}>
            <Typography component="h1" variant="body1" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              {global1.name}
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List>{mainListItems({ open })}</List>
        </DrawerStyled>

        <Box
          component="main"
          sx={{
            backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto'
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={900}>Institution Details</Typography>
              <Typography color="text.secondary">Manage logo, address, institutional office bearers and policy links.</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>{editId ? 'Update Institution' : 'Add Institution'}</Typography>
                <Stack direction="row" spacing={1}>
                  {editId && <Button variant="outlined" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</Button>}
                  <Button variant="contained" onClick={handleSubmit}>{editId ? 'Update' : 'Save'}</Button>
                </Stack>
              </Stack>
              <Grid container spacing={2}>
                {fields.map((item) => (
                  <Grid item xs={12} md={item.md} key={item.field}>
                    <TextField
                      fullWidth
                      label={item.label}
                      value={form[item.field] || ''}
                      multiline={item.multiline}
                      minRows={item.multiline ? 3 : undefined}
                      onChange={e => setForm({ ...form, [item.field]: e.target.value })}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <Box sx={{ height: 560, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  slots={{ toolbar: GridToolbar }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                />
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
