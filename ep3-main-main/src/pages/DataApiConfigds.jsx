import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function DataApiConfigds() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showForm, setShowForm] = useState(false);
  const [apiList, setApiList] = useState([]);
  const [filteredApiList, setFilteredApiList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingApi, setViewingApi] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    apiname: "",
    api: "",
    domain: "",
    method: "POST",
    paramLocation: "body", // ✅ ADDED
    example: "",
    status1: "Active",
    comments: "",
    isInternalApi: true,
    authType: "none",
    authToken: "",
    authHeader: "",
    username: "",
    password: "",
    useColid: true,
    useUser: true,
    useToken: false,
    collectionName: "",
    headers: "{}",
    timeout: 30000,
    responseType: "json",
    retryAttempts: 3,
    retryDelay: 1000,
    errorHandling: "stop",
    requiredFields: "",
    optionalFields: "",
    fieldTypes: "{}",
    fieldValidations: "{}",
    supportsBulkUpload: true,
    supportsManualEntry: true,
    bulkUploadEndpoint: "",
    singleEntryEndpoint: "",
    // ✅ REMOVED: updateEndpoint and deleteEndpoint
    exampleData: "{}",
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
      const response = await ep1.get("/api/v2/getdataapis", {
        params: {
          user: global1.user,
          colid: global1.colid,
        },
      });
      if (response.data.status === "success") {
        setApiList(response.data.data);
        setFilteredApiList(response.data.data);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to load APIs: " + error.message,
      });
    }
    setLoading(false);
  };

  const filterApis = () => {
    if (!searchTerm) {
      setFilteredApiList(apiList);
      return;
    }
    const filtered = apiList.filter(
      (api) =>
        api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.apiname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.collectionName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApiList(filtered);
    setPage(0);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      apiname: "",
      api: "",
      domain: "",
      method: "POST",
      paramLocation: "body", // ✅ ADDED
      example: "",
      status1: "Active",
      comments: "",
      isInternalApi: true,
      authType: "none",
      authToken: "",
      authHeader: "",
      username: "",
      password: "",
      useColid: true,
      useUser: true,
      useToken: false,
      collectionName: "",
      headers: "{}",
      timeout: 30000,
      responseType: "json",
      retryAttempts: 3,
      retryDelay: 1000,
      errorHandling: "stop",
      requiredFields: "",
      optionalFields: "",
      fieldTypes: "{}",
      fieldValidations: "{}",
      supportsBulkUpload: true,
      supportsManualEntry: true,
      bulkUploadEndpoint: "",
      singleEntryEndpoint: "",
      // ✅ REMOVED: updateEndpoint and deleteEndpoint
      exampleData: "{}",
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
      setMessage({
        type: "error",
        text: `Invalid JSON in ${field}: ${e.message}`,
      });
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.collectionName) {
      setMessage({
        type: "error",
        text: "Name and Collection Name are required!",
      });
      return;
    }
    if (!formData.requiredFields) {
      setMessage({ type: "error", text: "Required Fields are mandatory!" });
      return;
    }

    const jsonFields = [
      "headers",
      "fieldTypes",
      "fieldValidations",
      "exampleData",
    ];
    for (const field of jsonFields) {
      if (formData[field] && !validateJSON(field, formData[field])) {
        return;
      }
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const endpoint = editMode
        ? "/api/v2/updatedataapi"
        : "/api/v2/createdataapi";
      const params = {
        ...formData,
        user: global1.user,
        colid: global1.colid,
      };
      if (editMode) {
        params.id = editId;
      }

      const response = await ep1.get(endpoint, { params });
      if (response.data.status === "success") {
        setMessage({
          type: "success",
          text: editMode
            ? "API updated successfully!"
            : "API created successfully!",
        });
        resetForm();
        setShowForm(false);
        await fetchAllApis();
      } else {
        setMessage({ type: "error", text: response.data.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message,
      });
    }
    setLoading(false);
  };

  const handleEdit = (api) => {
    setFormData({
      name: api.name,
      apiname: api.apiname || "",
      api: api.api || "",
      domain: api.domain || "",
      method: api.method,
      paramLocation: api.paramLocation || "body", // ✅ ADDED
      example: api.example || "",
      status1: api.status1,
      comments: api.comments || "",
      isInternalApi: api.isInternalApi !== false,
      authType: api.authType,
      authToken: api.authToken || "",
      authHeader: api.authHeader || "",
      username: api.username || "",
      password: api.password || "",
      useColid: api.useColid !== false,
      useUser: api.useUser !== false,
      useToken: api.useToken || false,
      collectionName: api.collectionName || "",
      headers: api.headers || "{}",
      timeout: api.timeout || 30000,
      responseType: api.responseType || "json",
      retryAttempts: api.retryAttempts || 3,
      retryDelay: api.retryDelay || 1000,
      errorHandling: api.errorHandling || "stop",
      requiredFields: api.requiredFields || "",
      optionalFields: api.optionalFields || "",
      fieldTypes: api.fieldTypes || "{}",
      fieldValidations: api.fieldValidations || "{}",
      supportsBulkUpload: api.supportsBulkUpload !== false,
      supportsManualEntry: api.supportsManualEntry !== false,
      bulkUploadEndpoint: api.bulkUploadEndpoint || "",
      singleEntryEndpoint: api.singleEntryEndpoint || "",
      // ✅ REMOVED: updateEndpoint and deleteEndpoint
      exampleData: api.exampleData || "{}",
    });
    setEditMode(true);
    setEditId(api._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this API configuration?")
    ) {
      return;
    }
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/deletedataapi", {
        params: { id },
      });
      if (response.data.status === "success") {
        setMessage({ type: "success", text: "API deleted successfully!" });
        await fetchAllApis();
      } else {
        setMessage({ type: "error", text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
    setLoading(false);
  };

  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/duplicatedataapi", {
        params: { id },
      });
      if (response.data.status === "success") {
        setMessage({ type: "success", text: "API duplicated successfully!" });
        await fetchAllApis();
      } else {
        setMessage({ type: "error", text: response.data.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
    setLoading(false);
  };

  const handleView = (api) => {
    setViewingApi(api);
    setViewDialogOpen(true);
  };

  if (showForm) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">
              {editMode
                ? "Edit Data API Configuration"
                : "Configure New Data API"}
            </Typography>
          </Box>

          {message.text && (
            <Alert
              severity={message.type}
              onClose={() => setMessage({ type: "", text: "" })}
              sx={{ mb: 2 }}
            >
              {message.text}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Configuration Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                helperText="Display name for this data API"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Short Name"
                value={formData.apiname}
                onChange={(e) => handleChange("apiname", e.target.value)}
                placeholder="e.g., students, projects, leads"
                helperText="Short name used for searching"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Collection/Table Name"
                value={formData.collectionName}
                onChange={(e) => handleChange("collectionName", e.target.value)}
                required
                placeholder="e.g., studentds, projectds"
                helperText="MongoDB collection or database table name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="HTTP Method"
                value={formData.method}
                onChange={(e) => handleChange("method", e.target.value)}
              >
                <MenuItem value="POST">POST (Create)</MenuItem>
                <MenuItem value="GET">GET (Read)</MenuItem>
                <MenuItem value="PUT">PUT (Update)</MenuItem>
                <MenuItem value="PATCH">PATCH (Partial Update)</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
              </TextField>
            </Grid>

            {/* ✅ NEW: Parameter Location Field */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Send Parameters In"
                value={formData.paramLocation}
                onChange={(e) => handleChange("paramLocation", e.target.value)}
                helperText="Where to send the data payload"
              >
                <MenuItem value="body">
                  Body (req.body) - Standard POST/PUT
                </MenuItem>
                <MenuItem value="query">
                  Query String (req.query) - GET style
                </MenuItem>
                <MenuItem value="both">Both Body + Query String</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isInternalApi}
                    onChange={(e) =>
                      handleChange("isInternalApi", e.target.checked)
                    }
                  />
                }
                label="Use Internal API (ep1 instance)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Domain"
                value={formData.domain}
                onChange={(e) => handleChange("domain", e.target.value)}
                placeholder="http://localhost:3000"
                helperText={
                  formData.isInternalApi
                    ? "Optional if ep1 has baseURL"
                    : "Required for external APIs"
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status1}
                onChange={(e) => handleChange("status1", e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Testing">Testing</MenuItem>
              </TextField>
            </Grid>

            {/* Field Configuration */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Field Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Required Fields"
                value={formData.requiredFields}
                onChange={(e) => handleChange("requiredFields", e.target.value)}
                required
                placeholder="name,email,phone,category"
                helperText="Fields that must be provided"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Optional Fields"
                value={formData.optionalFields}
                onChange={(e) => handleChange("optionalFields", e.target.value)}
                placeholder="address,notes,tags"
                helperText="Fields that are optional"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Types (JSON)"
                value={formData.fieldTypes}
                onChange={(e) => handleChange("fieldTypes", e.target.value)}
                multiline
                rows={4}
                placeholder={`{
  "name": "text",
  "email": "email",
  "phone": "tel",
  "age": "number",
  "dob": "date",
  "category": "select"
}`}
                helperText="Define input types for each field"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Validations (JSON)"
                value={formData.fieldValidations}
                onChange={(e) =>
                  handleChange("fieldValidations", e.target.value)
                }
                multiline
                rows={4}
                placeholder={`{
  "email": "email",
  "phone": "^[0-9]{10}$",
  "age": {"min": 18, "max": 100}
}`}
                helperText="Validation rules for fields"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Example Data (JSON)"
                value={formData.exampleData}
                onChange={(e) => handleChange("exampleData", e.target.value)}
                multiline
                rows={4}
                placeholder={`{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "category": "MBA"
}`}
                helperText="Sample data for reference"
              />
            </Grid>

            {/* API Endpoints */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                API Endpoints
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.supportsBulkUpload}
                    onChange={(e) =>
                      handleChange("supportsBulkUpload", e.target.checked)
                    }
                  />
                }
                label="Supports Bulk Upload (Excel/CSV)"
              />
            </Grid>

            {formData.supportsBulkUpload && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bulk Upload Endpoint"
                  value={formData.bulkUploadEndpoint}
                  onChange={(e) =>
                    handleChange("bulkUploadEndpoint", e.target.value)
                  }
                  placeholder="/api/v2/bulkuploadstudents"
                  helperText="Endpoint for bulk data upload"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.supportsManualEntry}
                    onChange={(e) =>
                      handleChange("supportsManualEntry", e.target.checked)
                    }
                  />
                }
                label="Supports Manual Entry (One-by-One)"
              />
            </Grid>

            {formData.supportsManualEntry && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Single Entry Endpoint"
                  value={formData.singleEntryEndpoint}
                  onChange={(e) =>
                    handleChange("singleEntryEndpoint", e.target.value)
                  }
                  placeholder="/api/v2/createstudent"
                  helperText="Endpoint for creating single record"
                />
              </Grid>
            )}
            {/* ✅ REMOVED: Update and Delete Endpoint Fields */}

            {/* Internal Parameters */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Internal Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.useColid}
                    onChange={(e) => handleChange("useColid", e.target.checked)}
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
                    onChange={(e) => handleChange("useUser", e.target.checked)}
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
                    onChange={(e) => handleChange("useToken", e.target.checked)}
                  />
                }
                label="Auto-inject Token"
              />
            </Grid>

            {/* Documentation */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Documentation
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Example Usage"
                value={formData.example}
                onChange={(e) => handleChange("example", e.target.value)}
                multiline
                rows={3}
                placeholder="Describe how to use this API..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Comments"
                value={formData.comments}
                onChange={(e) => handleChange("comments", e.target.value)}
                multiline
                rows={3}
                placeholder="Additional notes..."
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
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
                  disabled={loading}
                  size="large"
                  startIcon={<AddIcon />}
                >
                  {loading
                    ? "Saving..."
                    : editMode
                    ? "Update API"
                    : "Create API"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  // Main List View
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">Data API Configurations</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            Configure New Data API
          </Button>
        </Box>

        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{ mb: 2 }}
          >
            {message.text}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Search by name, API name, or collection..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Collection</strong>
                </TableCell>
                <TableCell>
                  <strong>Method</strong>
                </TableCell>
                <TableCell>
                  <strong>Required Fields</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApiList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((api) => (
                  <TableRow key={api._id}>
                    <TableCell>{api.name}</TableCell>
                    <TableCell>{api.collectionName}</TableCell>
                    <TableCell>
                      <Chip label={api.method} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      {api.requiredFields?.split(",").slice(0, 3).join(", ")}
                      {api.requiredFields?.split(",").length > 3 && "..."}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={api.status1}
                        size="small"
                        color={api.status1 === "Active" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleView(api)} title="View">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(api)} title="Edit">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDuplicate(api._id)}
                        title="Duplicate"
                      >
                        <ContentCopyIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(api._id)}
                        title="Delete"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredApiList.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>API Configuration Details</DialogTitle>
          <DialogContent>
            {viewingApi && (
              <Box>
                <Typography>
                  <strong>Name:</strong> {viewingApi.name}
                </Typography>
                <Typography>
                  <strong>Collection:</strong> {viewingApi.collectionName}
                </Typography>
                <Typography>
                  <strong>Required Fields:</strong> {viewingApi.requiredFields}
                </Typography>
                <Typography>
                  <strong>Optional Fields:</strong>{" "}
                  {viewingApi.optionalFields || "None"}
                </Typography>
                <Typography>
                  <strong>Example Data:</strong>
                </Typography>
                <pre>
                  {JSON.stringify(
                    JSON.parse(viewingApi.exampleData || "{}"),
                    null,
                    2
                  )}
                </pre>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
