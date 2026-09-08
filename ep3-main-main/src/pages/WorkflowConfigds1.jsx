import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Typography, MenuItem,
  Grid, Switch, FormControlLabel, Divider, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function WorkflowConfigds1() {
  const [workflows, setWorkflows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);

  // Form state
  const [workflowData, setWorkflowData] = useState({
    name: '',
    description: '',
    status: 'Active',
    steps: []
  });

  // Single step form
  const [stepForm, setStepForm] = useState({
    serialNo: 1,
    stepName: '',
    isInternalApi: true,
    domain: '',
    endpoint: '',
    method: 'POST',
    paramLocation: 'body',
    dataPath: 'data',
    excludeFields: '__v,password,token',
    executionType: 'manual',
    isConditional: false,
    dependsOnStep: null,
    requiredFields: [],
    authType: 'none',
    authToken: '',
    isSelectionOnly: false,
  });

  // Field form
  const [fieldForm, setFieldForm] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    defaultValue: '',
    options: [],
    isDynamicDropdown: false,
    dropdownSourceStep: null,
    dropdownDataPath: 'data',
    dropdownLabelField: '',
    dropdownValueField: '',
    useFromPreviousStep: false,
    previousStepSerialNo: null,
    previousStepFieldPath: '',
    multipleSourceSteps: []
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await ep1.get('/api/v2/getworkflowsds1', {
        params: {
          user: global1.user,
          colid: global1.colid
        }
      });
      if (response.data.success) {
        setWorkflows(response.data.data);
      }
    } catch (error) {
      // console.error('Error loading workflows:', error);
    }
  };

  const openDialog = (workflow = null) => {
    if (workflow) {
      setEditMode(true);
      setCurrentWorkflow(workflow);
      setWorkflowData({
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        steps: workflow.steps || []
      });
    } else {
      setEditMode(false);
      setCurrentWorkflow(null);
      setWorkflowData({
        name: '',
        description: '',
        status: 'Active',
        steps: []
      });
    }
    setDialogOpen(true);
  };

  const saveWorkflow = async () => {
    try {
      // console.log('💾 Saving workflow:', workflowData);
      // console.log('📋 Total steps:', workflowData.steps.length);

      // Validate workflow has required data
      if (!workflowData.name) {
        alert('Please enter workflow name');
        return;
      }

      if (workflowData.steps.length === 0) {
        alert('Please add at least one step');
        return;
      }

      // Validate each step has required fields
      for (let i = 0; i < workflowData.steps.length; i++) {
        const step = workflowData.steps[i];
        // console.log(`Step ${i + 1} - ${step.stepName}:`, step);
        // console.log(`  Required fields count:`, step.requiredFields?.length || 0);
        if (step.requiredFields && step.requiredFields.length > 0) {
          // console.log(`  Fields:`, step.requiredFields.map(f => f.fieldName));
        }
      }

      if (editMode && currentWorkflow) {
        // FIXED: Update - Send complete data in body
        // console.log('🔄 Updating workflow ID:', currentWorkflow._id);
        const updatePayload = {
          name: workflowData.name,
          description: workflowData.description,
          status: workflowData.status,
          // Create copy before sorting
          steps: [...workflowData.steps].sort((a, b) => a.serialNo - b.serialNo)
        };
        console.log('📤 SENDING UPDATE PAYLOAD:', JSON.stringify(updatePayload, null, 2));

        const response = await ep1.post(
          '/api/v2/updateworkflowds1',
          updatePayload,
          {
            params: {
              id: currentWorkflow._id,
              user: global1.user,
              colid: global1.colid
            }
          }
        );

        console.log('✅ Update response:', response.data);

        if (response.data.success) {
          alert('Workflow updated successfully!');
          setDialogOpen(false);
          loadWorkflows();
        } else {
          console.error('❌ Update failed:', response.data);
          alert('Error: ' + response.data.message);
        }
      } else {
        // FIXED: Create - Send steps in body, metadata in params
        const createPayload = {
          steps: [...workflowData.steps].sort((a, b) => a.serialNo - b.serialNo)
        };
        // console.log('➕ Creating new workflow', createPayload);

        const response = await ep1.post(
          '/api/v2/createworkflowds1',
          createPayload,
          {
            params: {
              name: workflowData.name,
              description: workflowData.description,
              status: workflowData.status,
              user: global1.user,
              colid: global1.colid
            }
          }
        );

        // console.log('✅ Create response:', response.data);

        if (response.data.success) {
          alert('Workflow created successfully!');
          setDialogOpen(false);
          loadWorkflows();
        } else {
          alert('Error: ' + response.data.message);
        }
      }
    } catch (error) {
      // console.error('❌ Save error:', error);
      // console.error('Error response:', error.response?.data);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteWorkflow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await ep1.get('/api/v2/deleteworkflowds1', {
        params: {
          id,
          user: global1.user,
          colid: global1.colid
        }
      });
      alert('Workflow deleted successfully!');
      loadWorkflows();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const openStepDialog = (stepIndex = null) => {
    if (stepIndex !== null) {
      const step = workflowData.steps[stepIndex];
      setEditingStepIndex(stepIndex);
      setStepForm({
        ...step,
        excludeFields: step.excludeFields || '__v,password,token',
        requiredFields: step.requiredFields || [],
        isSelectionOnly: step.isSelectionOnly || false
      });
    } else {
      setEditingStepIndex(null);
      const nextSerial = workflowData.steps.length > 0
        ? Math.max(...workflowData.steps.map(s => s.serialNo)) + 1
        : 1;
      setStepForm({
        serialNo: nextSerial,
        stepName: '',
        isInternalApi: true,
        domain: '',
        endpoint: '',
        method: 'POST',
        paramLocation: 'body',
        dataPath: 'data',
        excludeFields: '__v,password,token',
        executionType: 'manual',
        isConditional: false,
        dependsOnStep: null,
        requiredFields: [],
        authType: 'none',
        authToken: '',
        isSelectionOnly: false,
      });
    }
    setStepDialogOpen(true);
  };

  // FIXED: This function adds field to stepForm
  const addFieldToStep = () => {
    if (!fieldForm.fieldName || !fieldForm.fieldLabel) {
      alert('Please fill field name and label');
      return;
    }

    // Validate dynamic dropdown configuration
    if (fieldForm.isDynamicDropdown || fieldForm.fieldType === 'dynamicDropdown') {
      if (!fieldForm.dropdownSourceStep || !fieldForm.dropdownLabelField || !fieldForm.dropdownValueField) {
        alert('Please configure all dropdown settings: Source Step, Label Field, and Value Field');
        return;
      }
    }

    // console.log('➕ Adding field:', fieldForm);

    // FIXED: Create clean field object
    const newField = {
      fieldName: fieldForm.fieldName,
      fieldLabel: fieldForm.fieldLabel,
      fieldType: fieldForm.fieldType,
      defaultValue: fieldForm.defaultValue || '',
      options: fieldForm.options || [],
      isDynamicDropdown: fieldForm.isDynamicDropdown || fieldForm.fieldType === 'dynamicDropdown',
      dropdownSourceStep: fieldForm.dropdownSourceStep || null,
      dropdownDataPath: fieldForm.dropdownDataPath || 'data',
      dropdownLabelField: fieldForm.dropdownLabelField || '',
      dropdownValueField: fieldForm.dropdownValueField || '',
      useFromPreviousStep: fieldForm.useFromPreviousStep || false,
      previousStepSerialNo: fieldForm.previousStepSerialNo || null,
      previousStepFieldPath: fieldForm.previousStepFieldPath || '',
      multipleSourceSteps: fieldForm.multipleSourceSteps || []
    };

    // FIXED: Add to stepForm.requiredFields
    setStepForm(prev => ({
      ...prev,
      requiredFields: [...prev.requiredFields, newField]
    }));

    // console.log('✅ Field added. Total fields:', stepForm.requiredFields.length + 1);

    // Reset field form
    setFieldForm({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      defaultValue: '',
      options: [],
      isDynamicDropdown: false,
      dropdownSourceStep: null,
      dropdownDataPath: 'data',
      dropdownLabelField: '',
      dropdownValueField: '',
      useFromPreviousStep: false,
      previousStepSerialNo: null,
      previousStepFieldPath: '',
      multipleSourceSteps: []
    });
  };

  const removeFieldFromStep = (index) => {
    setStepForm(prev => ({
      ...prev,
      requiredFields: prev.requiredFields.filter((_, i) => i !== index)
    }));
  };

  // FIXED: This saves the step with all fields
  const saveStep = () => {
    if (!stepForm.stepName) {
      alert('Please fill step name');
      return;
    }

    if (!stepForm.isSelectionOnly && !stepForm.endpoint) {
      alert('Please fill endpoint');
      return;
    }

    // Prepare step data
    const stepData = {
      ...stepForm,
      endpoint: stepForm.isSelectionOnly ? 'LOCAL_MEMORY' : stepForm.endpoint,
      method: stepForm.isSelectionOnly ? 'LOCAL' : stepForm.method,
      isInternalApi: stepForm.isSelectionOnly ? false : stepForm.isInternalApi
    };

    // console.log('💾 Saving step:', stepForm);
    // console.log('📋 Required fields in step:', stepForm.requiredFields);

    if (editingStepIndex !== null) {
      // Update existing step
      const updatedSteps = [...workflowData.steps];
      updatedSteps[editingStepIndex] = { ...stepData };
      setWorkflowData(prev => ({
        ...prev,
        steps: updatedSteps
      }));
      // console.log('✅ Step updated at index', editingStepIndex);
    } else {
      // Add new step
      setWorkflowData(prev => ({
        ...prev,
        steps: [...prev.steps, { ...stepData }]
      }));
      // console.log('✅ New step added. Total steps:', workflowData.steps.length + 1);
    }

    setStepDialogOpen(false);
  };

  const removeStepFromWorkflow = (index) => {
    if (!window.confirm('Are you sure you want to delete this step?')) return;

    setWorkflowData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            🤖 AI Workflow Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage dynamic multi-step workflows with data dependencies
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          Create Workflow
        </Button>
      </Box>

      {/* Workflows Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Steps</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workflows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No workflows found. Create one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {workflows.map((workflow) => (
              <TableRow key={workflow._id} hover>
                <TableCell>{workflow.name}</TableCell>
                <TableCell>{workflow.description}</TableCell>
                <TableCell>
                  <Chip
                    label={`${workflow.steps?.length || 0} APIs`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={workflow.status}
                    color={workflow.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => openDialog(workflow)} size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteWorkflow(workflow._id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Workflow Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          {editMode ? '✏️ Edit Workflow' : '➕ Create New Workflow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Workflow Name"
                value={workflowData.name}
                onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
                placeholder="e.g., Student Admission Flow"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={workflowData.status}
                onChange={(e) => setWorkflowData({ ...workflowData, status: e.target.value })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={workflowData.description}
                onChange={(e) => setWorkflowData({ ...workflowData, description: e.target.value })}
                placeholder="Describe what this workflow does..."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Configure API Steps" />
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => openStepDialog()}
                startIcon={<AddIcon />}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                Add New API Step
              </Button>
            </Grid>

            {workflowData.steps && workflowData.steps.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  📋 Configured Steps ({workflowData.steps.length})
                </Typography>
                {workflowData.steps.map((step, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {step.serialNo}. {step.stepName}
                          {step.executionType === 'auto' && (
                            <Chip label="Auto" size="small" color="info" sx={{ ml: 1 }} />
                          )}
                          {step.isConditional && (
                            <Chip label={`Depends on Step ${step.dependsOnStep}`} size="small" color="warning" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          🌐 {step.method} {step.isInternalApi ? step.endpoint : `${step.domain}${step.endpoint}`}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          📊 Data Path: <strong>{step.dataPath || '(root)'}</strong>
                        </Typography>
                        <Typography variant="caption" display="block">
                          📋 Fields: {step.requiredFields && step.requiredFields.length > 0
                            ? step.requiredFields.map(f =>
                              f.isDynamicDropdown || f.fieldType === 'dynamicDropdown'
                                ? `${f.fieldLabel} (🔗 Dynamic from Step ${f.dropdownSourceStep})`
                                : f.useFromPreviousStep
                                  ? `${f.fieldLabel} (🔒 Hidden from Step ${f.previousStepSerialNo})`
                                  : f.fieldLabel
                            ).join(', ')
                            : 'None'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={() => openStepDialog(index)} size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => removeStepFromWorkflow(index)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveWorkflow}
            startIcon={<SaveIcon />}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {editMode ? 'Update' : 'Create'} Workflow
          </Button>
        </DialogActions>
      </Dialog>

      {/* Step Configuration Dialog */}
      <Dialog open={stepDialogOpen} onClose={() => setStepDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          {editingStepIndex !== null ? '✏️ Edit API Step' : '➕ Add New API Step'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Step Basic Info */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Serial No"
                value={stepForm.serialNo}
                onChange={(e) => setStepForm({ ...stepForm, serialNo: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                label="Step Name"
                value={stepForm.stepName}
                onChange={(e) => setStepForm({ ...stepForm, stepName: e.target.value })}
                placeholder="e.g., Get All Programs"
              />
            </Grid>

            {/* Execution Behavior */}
            <Grid item xs={12}>
              <Alert severity="info" icon={<InfoIcon />}>
                <strong>Execution Type:</strong> Auto = Executes immediately without user input | Manual = Waits for user to fill form
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Execution Type"
                value={stepForm.executionType}
                onChange={(e) => setStepForm({ ...stepForm, executionType: e.target.value })}
              >
                <MenuItem value="auto">Auto Execute</MenuItem>
                <MenuItem value="manual">Manual (Wait for Input)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={stepForm.isConditional}
                    onChange={(e) => setStepForm({ ...stepForm, isConditional: e.target.checked })}
                  />
                }
                label="Conditional Execution"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={stepForm.isSelectionOnly}
                    onChange={(e) => setStepForm({ ...stepForm, isSelectionOnly: e.target.checked })}
                  />
                }
                label="Data Collection Only (No API)"
              />
            </Grid>

            {stepForm.isConditional && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Depends on Step"
                  value={stepForm.dependsOnStep || ''}
                  onChange={(e) => setStepForm({ ...stepForm, dependsOnStep: parseInt(e.target.value) || null })}
                  helperText="Step must complete first"
                />
              </Grid>
            )}



            {/* API Configuration */}
            {!stepForm.isSelectionOnly && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="API Configuration" size="small" />
                  </Divider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={stepForm.isInternalApi}
                        onChange={(e) => setStepForm({ ...stepForm, isInternalApi: e.target.checked })}
                      />
                    }
                    label="Internal API (use ep1 with token)"
                  />
                </Grid>

                {!stepForm.isInternalApi && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Domain"
                      placeholder="https://api.example.com"
                      value={stepForm.domain}
                      onChange={(e) => setStepForm({ ...stepForm, domain: e.target.value })}
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Endpoint"
                    placeholder="/api/v2/getstudents"
                    value={stepForm.endpoint}
                    onChange={(e) => setStepForm({ ...stepForm, endpoint: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Method"
                    value={stepForm.method}
                    onChange={(e) => setStepForm({ ...stepForm, method: e.target.value })}
                  >
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Param Location"
                    value={stepForm.paramLocation}
                    onChange={(e) => setStepForm({ ...stepForm, paramLocation: e.target.value })}
                  >
                    <MenuItem value="query">Query String</MenuItem>
                    <MenuItem value="body">Body</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}

            {/* Excel Export Configuration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Excel Export Configuration" size="small" />
              </Divider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Response Data Path"
                placeholder="data or leave empty for root array"
                value={stepForm.dataPath}
                onChange={(e) => setStepForm({ ...stepForm, dataPath: e.target.value })}
                helperText="Path to array in API response"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Exclude Fields"
                placeholder="__v,password,token"
                value={stepForm.excludeFields}
                onChange={(e) => setStepForm({ ...stepForm, excludeFields: e.target.value })}
                helperText="Comma-separated fields to exclude"
              />
            </Grid>

            {/* Field Configuration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Add Required Fields" size="small" />
              </Divider>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Dynamic Dropdown:</strong> Shows options from a previous step's API response
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Field Name (API param)"
                placeholder="jobid"
                value={fieldForm.fieldName}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Field Label (Display)"
                placeholder="Select Job"
                value={fieldForm.fieldLabel}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldLabel: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Field Type"
                value={fieldForm.fieldType}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldType: e.target.value })}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="select">Select (Static)</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
                <MenuItem value="dynamicDropdown">Dynamic Dropdown</MenuItem>
              </TextField>
            </Grid>

            {/* Dynamic Dropdown Configuration */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.isDynamicDropdown || fieldForm.fieldType === 'dynamicDropdown'}
                    onChange={(e) => setFieldForm({
                      ...fieldForm,
                      isDynamicDropdown: e.target.checked,
                      fieldType: e.target.checked ? 'dynamicDropdown' : 'text'
                    })}
                  />
                }
                label="This is a Dynamic Dropdown (populated from previous step)"
              />
            </Grid>

            {(fieldForm.isDynamicDropdown || fieldForm.fieldType === 'dynamicDropdown') && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Source Step Number"
                    value={fieldForm.dropdownSourceStep || ''}
                    onChange={(e) => setFieldForm({ ...fieldForm, dropdownSourceStep: parseInt(e.target.value) || null })}
                    helperText="Which step's response?"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Data Path"
                    placeholder="data or empty"
                    value={fieldForm.dropdownDataPath}
                    onChange={(e) => setFieldForm({ ...fieldForm, dropdownDataPath: e.target.value })}
                    helperText="Path to array"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Field"
                    placeholder="title"
                    value={fieldForm.dropdownLabelField}
                    onChange={(e) => setFieldForm({ ...fieldForm, dropdownLabelField: e.target.value })}
                    helperText="Display field"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Value Field"
                    placeholder="_id"
                    value={fieldForm.dropdownValueField}
                    onChange={(e) => setFieldForm({ ...fieldForm, dropdownValueField: e.target.value })}
                    helperText="Value field"
                  />
                </Grid>
              </>
            )}

            {/* Use from Previous Step (Hidden Auto-fill) */}
            {!fieldForm.isDynamicDropdown && fieldForm.fieldType !== 'dynamicDropdown' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={fieldForm.useFromPreviousStep}
                        onChange={(e) => setFieldForm({ ...fieldForm, useFromPreviousStep: e.target.checked })}
                      />
                    }
                    label="Auto-fill from previous step (hidden)"
                  />
                </Grid>

                {fieldForm.useFromPreviousStep && (
                  <>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Previous Step Serial"
                        value={fieldForm.previousStepSerialNo || ''}
                        onChange={(e) => setFieldForm({ ...fieldForm, previousStepSerialNo: parseInt(e.target.value) || null })}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Field Path"
                        placeholder="data._id"
                        value={fieldForm.previousStepFieldPath}
                        onChange={(e) => setFieldForm({ ...fieldForm, previousStepFieldPath: e.target.value })}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                size="small"
                onClick={addFieldToStep}
                startIcon={<AddIcon />}
              >
                Add Field
              </Button>
            </Grid>

            {/* Display added fields */}
            {stepForm.requiredFields && stepForm.requiredFields.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    📋 Fields in this step ({stepForm.requiredFields.length}):
                  </Typography>
                  {stepForm.requiredFields.map((field, index) => (
                    <Chip
                      key={index}
                      label={
                        field.isDynamicDropdown || field.fieldType === 'dynamicDropdown'
                          ? `${field.fieldLabel} (🔗 Dynamic from Step ${field.dropdownSourceStep})`
                          : field.useFromPreviousStep
                            ? `${field.fieldLabel} (🔒 Hidden - from Step ${field.previousStepSerialNo})`
                            : `${field.fieldLabel} (${field.fieldName})`
                      }
                      onDelete={() => removeFieldFromStep(index)}
                      sx={{ m: 0.5 }}
                      color={
                        field.isDynamicDropdown || field.fieldType === 'dynamicDropdown'
                          ? 'secondary'
                          : field.useFromPreviousStep
                            ? 'primary'
                            : 'default'
                      }
                    />
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStepDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveStep}
            startIcon={<SaveIcon />}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {editingStepIndex !== null ? 'Update' : 'Add'} Step
          </Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
}
