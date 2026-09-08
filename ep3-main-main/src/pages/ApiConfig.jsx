import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Typography, MenuItem,
  Grid, Switch, FormControlLabel, Divider, Alert, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip,
  TablePagination, InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function ApiConfig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [apiList, setApiList] = useState([]);
  const [filteredApiList, setFilteredApiList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingApi, setViewingApi] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    apiname: '',
    api: '',
    domain: '',
    method: 'GET',
    example: '',
    status1: 'Active',
    comments: '',
    isInternalApi: false,
    authType: 'none',
    authToken: '',
    authHeader: '',
    username: '',
    password: '',
    internalParams: '{}',
    useColid: true,
    useUser: true,
    useToken: false,
    filterTemplate: '{}',
    projectionTemplate: '{}',
    sortTemplate: '{}',
    dataLimit: 1000,
    collectionName: '',
    headers: '{}',
    queryParams: '{}',
    bodyTemplate: '',
    timeout: 30000,
    responseType: 'json',
    dataPath: '',
    pagination: '{"enabled":false}',
    includeFields: '',
    excludeFields: 'password,__v,token',
    excelSheetName: 'Data',
    excelFileName: '',
    autoFormatColumns: true,
    retryAttempts: 3,
    retryDelay: 1000,
    errorHandling: 'stop',
    requiresUserInput: false,
    dynamicParams: '[]'
  });

  useEffect(() => {
    fetchAllApis();
  }, []);

  useEffect(() => {
    filterApis();
  }, [searchTerm, apiList]);

  const fetchAllApis = async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getapidsbyuser', {
        params: {
          user: global1.user,
          colid: global1.colid
        }
      });
      
      if (response.data.status === 'success') {
        setApiList(response.data.data);
        setFilteredApiList(response.data.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load APIs: ' + error.message });
    }
    setLoading(false);
  };

  const filterApis = () => {
    if (!searchTerm) {
      setFilteredApiList(apiList);
      return;
    }

    const filtered = apiList.filter(api => 
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.apiname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.method?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredApiList(filtered);
    setPage(0);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      apiname: '',
      api: '',
      domain: '',
      method: 'GET',
      example: '',
      status1: 'Active',
      comments: '',
      isInternalApi: false,
      authType: 'none',
      authToken: '',
      authHeader: '',
      username: '',
      password: '',
      internalParams: '{}',
      useColid: true,
      useUser: true,
      useToken: false,
      filterTemplate: '{}',
      projectionTemplate: '{}',
      sortTemplate: '{}',
      dataLimit: 1000,
      collectionName: '',
      headers: '{}',
      queryParams: '{}',
      bodyTemplate: '',
      timeout: 30000,
      responseType: 'json',
      dataPath: '',
      pagination: '{"enabled":false}',
      includeFields: '',
      excludeFields: 'password,__v,token',
      excelSheetName: 'Data',
      excelFileName: '',
      autoFormatColumns: true,
      retryAttempts: 3,
      retryDelay: 1000,
      errorHandling: 'stop',
      requiresUserInput: false,
      dynamicParams: '[]'
    });
    setEditMode(false);
    setEditId(null);
  };

  const validateJSON = (field, value) => {
    if (!value.trim()) return true;
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      setMessage({ type: 'error', text: `Invalid JSON in ${field}: ${e.message}` });
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.api) {
      setMessage({ type: 'error', text: 'Name and API endpoint are required!' });
      return;
    }

    const jsonFields = ['headers', 'queryParams', 'filterTemplate', 'projectionTemplate', 'sortTemplate', 'dynamicParams'];
    for (const field of jsonFields) {
      if (formData[field] && !validateJSON(field, formData[field])) {
        return;
      }
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const endpoint = editMode ? '/api/v2/updateapids' : '/api/v2/createapids';
      const params = {
        ...formData,
        user: global1.user,
        colid: global1.colid
      };

      if (editMode) {
        params.id = editId;
      }

      const response = await ep1.get(endpoint, { params });
      
      if (response.data.status === 'success') {
        setMessage({ 
          type: 'success', 
          text: editMode ? 'API updated successfully!' : 'API created successfully!' 
        });
        resetForm();
        setShowForm(false);
        await fetchAllApis();
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.message });
    }
    
    setLoading(false);
  };

  const handleEdit = (api) => {
    setFormData({
      name: api.name,
      apiname: api.apiname || '',
      api: api.api,
      domain: api.domain || '',
      method: api.method,
      example: api.example || '',
      status1: api.status1,
      comments: api.comments || '',
      isInternalApi: api.isInternalApi || false,
      authType: api.authType,
      authToken: api.authToken || '',
      authHeader: api.authHeader || '',
      username: api.username || '',
      password: api.password || '',
      internalParams: api.internalParams,
      useColid: api.useColid,
      useUser: api.useUser,
      useToken: api.useToken,
      filterTemplate: api.filterTemplate,
      projectionTemplate: api.projectionTemplate,
      sortTemplate: api.sortTemplate,
      dataLimit: api.dataLimit,
      collectionName: api.collectionName || '',
      headers: api.headers,
      queryParams: api.queryParams,
      bodyTemplate: api.bodyTemplate || '',
      timeout: api.timeout,
      responseType: api.responseType,
      dataPath: api.dataPath,
      pagination: api.pagination,
      includeFields: api.includeFields?.join(',') || '',
      excludeFields: api.excludeFields?.join(',') || '',
      excelSheetName: api.excelSheetName,
      excelFileName: api.excelFileName || '',
      autoFormatColumns: api.autoFormatColumns,
      retryAttempts: api.retryAttempts,
      retryDelay: api.retryDelay,
      errorHandling: api.errorHandling,
      requiresUserInput: api.requiresUserInput,
      dynamicParams: api.dynamicParams
    });
    setEditMode(true);
    setEditId(api._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API configuration?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/deleteapids', {
        params: { id }
      });
      
      if (response.data.status === 'success') {
        setMessage({ type: 'success', text: 'API deleted successfully!' });
        await fetchAllApis();
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/duplicateapi', {
        params: { id }
      });
      
      if (response.data.status === 'success') {
        setMessage({ type: 'success', text: 'API duplicated successfully!' });
        await fetchAllApis();
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const handleView = (api) => {
    setViewingApi(api);
    setViewDialogOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'error',
      PATCH: 'info'
    };
    return colors[method] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: 'success',
      Inactive: 'error',
      Testing: 'warning'
    };
    return colors[status] || 'default';
  };

  if (showForm) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => {
              resetForm();
              setShowForm(false);
            }} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">
              {editMode ? 'Edit API Configuration' : 'Configure New API'}
            </Typography>
          </Box>
          
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Configuration Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                helperText="Display name for this API configuration"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Name (for searching)"
                value={formData.apiname}
                onChange={(e) => handleChange('apiname', e.target.value)}
                placeholder="e.g., attendance, projects, students"
                helperText="Short name used for searching"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isInternalApi}
                    onChange={(e) => handleChange('isInternalApi', e.target.checked)}
                  />
                }
                label="Use Internal API (ep1 instance)"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                {formData.isInternalApi 
                  ? "Will use ep1 axios instance from /api/ep1.js" 
                  : "Will use direct axios call with full URL"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={formData.isInternalApi ? "Domain (Base URL)" : "Domain"}
                value={formData.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                placeholder={formData.isInternalApi ? "http://localhost:3000" : "https://campus.com"}
                helperText={formData.isInternalApi 
                  ? "Base URL for internal API (optional if ep1 has baseURL)" 
                  : "Domain for categorization"}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="HTTP Method"
                value={formData.method}
                onChange={(e) => handleChange('method', e.target.value)}
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={formData.isInternalApi ? "API Endpoint Path" : "Full API URL"}
                value={formData.api}
                onChange={(e) => handleChange('api', e.target.value)}
                required
                placeholder={formData.isInternalApi 
                  ? "/api/v2/getattbypcodesem" 
                  : "https://campus.com/api/v2/endpoint"}
                helperText={formData.isInternalApi 
                  ? "Endpoint path (will be combined with domain)" 
                  : "Full API endpoint URL"}
              />
              {formData.isInternalApi && formData.domain && formData.api && (
                <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                  Final URL: {formData.domain}{formData.api}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status1}
                onChange={(e) => handleChange('status1', e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Testing">Testing</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Authentication
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Auth Type"
                value={formData.authType}
                onChange={(e) => handleChange('authType', e.target.value)}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="bearer">Bearer Token</MenuItem>
                <MenuItem value="apikey">API Key</MenuItem>
                <MenuItem value="basic">Basic Auth</MenuItem>
                <MenuItem value="oauth">OAuth</MenuItem>
              </TextField>
            </Grid>
            
            {formData.authType === 'bearer' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bearer Token"
                  value={formData.authToken}
                  onChange={(e) => handleChange('authToken', e.target.value)}
                  type="password"
                  helperText="Authorization: Bearer <token>"
                />
              </Grid>
            )}
            
            {formData.authType === 'apikey' && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Header Name"
                    value={formData.authHeader}
                    onChange={(e) => handleChange('authHeader', e.target.value)}
                    placeholder="X-API-Key"
                    helperText="Custom header name"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="API Key"
                    value={formData.authToken}
                    onChange={(e) => handleChange('authToken', e.target.value)}
                    type="password"
                  />
                </Grid>
              </>
            )}

            {formData.authType === 'basic' && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    type="password"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Internal Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useColid}
                    onChange={(e) => handleChange('useColid', e.target.checked)}
                  />
                }
                label="Auto-inject College ID"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useUser}
                    onChange={(e) => handleChange('useUser', e.target.checked)}
                  />
                }
                label="Auto-inject User"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useToken}
                    onChange={(e) => handleChange('useToken', e.target.checked)}
                  />
                }
                label="Auto-inject Token"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Collection Name"
                value={formData.collectionName}
                onChange={(e) => handleChange('collectionName', e.target.value)}
                placeholder="consultancyds, projectds"
                helperText="For internal MongoDB APIs"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data Limit"
                type="number"
                value={formData.dataLimit}
                onChange={(e) => handleChange('dataLimit', parseInt(e.target.value))}
                helperText="Maximum records to fetch"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Response Handling
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data Path"
                value={formData.dataPath}
                onChange={(e) => handleChange('dataPath', e.target.value)}
                placeholder="data.results or results"
                helperText="Path to extract nested data"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Exclude Fields (comma-separated)"
                value={formData.excludeFields}
                onChange={(e) => handleChange('excludeFields', e.target.value)}
                placeholder="password,token,__v"
                helperText="Fields to remove from response"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Dynamic Parameters (User Input)
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requiresUserInput}
                    onChange={(e) => handleChange('requiresUserInput', e.target.checked)}
                  />
                }
                label="Requires User Input Parameters"
              />
            </Grid>

            {formData.requiresUserInput && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Parameter Configuration (JSON)"
                  value={formData.dynamicParams}
                  onChange={(e) => handleChange('dynamicParams', e.target.value)}
                  placeholder={`[
  {
    "name": "year",
    "type": "text",
    "label": "Academic Year",
    "required": true,
    "default": "2024"
  },
  {
    "name": "semester",
    "type": "select",
    "label": "Semester",
    "required": true,
    "options": ["1", "2", "3", "4", "5", "6"]
  }
]`}
                  helperText="Define parameters: text, number, date, select types"
                />
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Excel Export Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Excel Sheet Name"
                value={formData.excelSheetName}
                onChange={(e) => handleChange('excelSheetName', e.target.value)}
                helperText="Name of the sheet in Excel file"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Excel File Name Template"
                value={formData.excelFileName}
                onChange={(e) => handleChange('excelFileName', e.target.value)}
                placeholder="Report_{{apiname}}_{{date}}"
                helperText="Use {{apiname}}, {{date}} for dynamic names"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Documentation
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Example Usage"
                value={formData.example}
                onChange={(e) => handleChange('example', e.target.value)}
                placeholder="Describe how to use this API..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Comments"
                value={formData.comments}
                onChange={(e) => handleChange('comments', e.target.value)}
                placeholder="Additional notes..."
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={loading}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !formData.name || !formData.api}
                  size="large"
                >
                  {loading ? 'Saving...' : (editMode ? 'Update API' : 'Create API')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/apichatbot')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">
              API Configurations ({filteredApiList.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchAllApis} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
            >
              Add New API
            </Button>
          </Box>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search APIs by name, domain, or method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>API Name</strong></TableCell>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>User Input</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredApiList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>No APIs configured yet. Click "Add New API" to get started.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApiList
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((api) => (
                    <TableRow key={api._id} hover>
                      <TableCell>{api.name}</TableCell>
                      <TableCell>{api.apiname || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={api.method} 
                          color={getMethodColor(api.method)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={api.isInternalApi ? "Internal" : "External"} 
                          color={api.isInternalApi ? "primary" : "default"}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={api.status1} 
                          color={getStatusColor(api.status1)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {api.requiresUserInput ? (
                          <Chip label="Yes" color="primary" size="small" />
                        ) : (
                          <Chip label="No" variant="outlined" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleView(api)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(api)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton size="small" onClick={() => handleDuplicate(api._id)} color="info">
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(api._id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredApiList.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>API Configuration Details</DialogTitle>
        <DialogContent>
          {viewingApi && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{viewingApi.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">API Name</Typography>
                  <Typography variant="body1">{viewingApi.apiname || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Method</Typography>
                  <Chip label={viewingApi.method} color={getMethodColor(viewingApi.method)} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Chip 
                    label={viewingApi.isInternalApi ? "Internal API (ep1)" : "External API"} 
                    color={viewingApi.isInternalApi ? "primary" : "default"}
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Endpoint</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {viewingApi.isInternalApi 
                      ? `${viewingApi.domain || '[ep1 baseURL]'}${viewingApi.api}` 
                      : viewingApi.api}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={viewingApi.status1} color={getStatusColor(viewingApi.status1)} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Requires User Input</Typography>
                  <Chip 
                    label={viewingApi.requiresUserInput ? "Yes" : "No"} 
                    color={viewingApi.requiresUserInput ? "primary" : "default"} 
                    size="small" 
                  />
                </Grid>
                {viewingApi.dataPath && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Data Path</Typography>
                    <Typography variant="body2">{viewingApi.dataPath}</Typography>
                  </Grid>
                )}
                {viewingApi.example && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Example</Typography>
                    <Typography variant="body2">{viewingApi.example}</Typography>
                  </Grid>
                )}
                {viewingApi.comments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Comments</Typography>
                    <Typography variant="body2">{viewingApi.comments}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setViewDialogOpen(false);
            handleEdit(viewingApi);
          }}>
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
