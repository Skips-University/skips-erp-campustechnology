import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Typography, MenuItem,
  Grid, Switch, FormControlLabel, Divider, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function WorkflowConfigds() {
  const [workflows, setWorkflows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);

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
    requiredFields: [],
    authType: 'none',
    authToken: ''
  });

  // Field form
  const [fieldForm, setFieldForm] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    defaultValue: '',
    options: [],
    useFromPreviousStep: false,
    previousStepSerialNo: null,
    previousStepFieldPath: ''
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await ep1.get('/api/v2/getworkflowsds', {
        params: {
          user: global1.user,
          colid: global1.colid
        }
      });
      if (response.data.success) {
        setWorkflows(response.data.data);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
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
        steps: workflow.steps
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
      if (editMode && currentWorkflow) {
        // Update
        await ep1.post('/api/v2/updateworkflowds', workflowData, {
          params: {
            id: currentWorkflow._id,
            user: global1.user,
            colid: global1.colid
          }
        });
        alert('Workflow updated successfully!');
      } else {
        // Create
        await ep1.post('/api/v2/createworkflowds', workflowData, {
          params: {
            name: workflowData.name,
            description: workflowData.description,
            status: workflowData.status,
            user: global1.user,
            colid: global1.colid
          }
        });
        alert('Workflow created successfully!');
      }
      setDialogOpen(false);
      loadWorkflows();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const deleteWorkflow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await ep1.get('/api/v2/deleteworkflowds', {
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

  const addFieldToStep = () => {
    if (!fieldForm.fieldName || !fieldForm.fieldLabel) {
      alert('Please fill field name and label');
      return;
    }

    setStepForm({
      ...stepForm,
      requiredFields: [...stepForm.requiredFields, { ...fieldForm }]
    });

    // Reset field form
    setFieldForm({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      defaultValue: '',
      options: [],
      useFromPreviousStep: false,
      previousStepSerialNo: null,
      previousStepFieldPath: ''
    });
  };

  const removeFieldFromStep = (index) => {
    const updatedFields = stepForm.requiredFields.filter((_, i) => i !== index);
    setStepForm({
      ...stepForm,
      requiredFields: updatedFields
    });
  };

  const addStepToWorkflow = () => {
    if (!stepForm.stepName || !stepForm.endpoint) {
      alert('Please fill step name and endpoint');
      return;
    }

    setWorkflowData({
      ...workflowData,
      steps: [...workflowData.steps, { ...stepForm }]
    });

    // Reset step form with incremented serial
    setStepForm({
      serialNo: stepForm.serialNo + 1,
      stepName: '',
      isInternalApi: true,
      domain: '',
      endpoint: '',
      method: 'POST',
      paramLocation: 'body',
      requiredFields: [],
      authType: 'none',
      authToken: ''
    });
  };

  const removeStepFromWorkflow = (index) => {
    const updatedSteps = workflowData.steps.filter((_, i) => i !== index);
    setWorkflowData({
      ...workflowData,
      steps: updatedSteps
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">AI Workflow Configuration</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
        >
          Create Workflow
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Steps</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow._id}>
                <TableCell>{workflow.name}</TableCell>
                <TableCell>{workflow.description}</TableCell>
                <TableCell>
                  <Chip label={`${workflow.steps.length} APIs`} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={workflow.status} 
                    color={workflow.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => openDialog(workflow)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteWorkflow(workflow._id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Workflow Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Workflow' : 'Create New Workflow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Info */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Workflow Name"
                value={workflowData.name}
                onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
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
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="h6">Add API Step</Typography>
              </Divider>
            </Grid>

            {/* Step Configuration */}
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
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={stepForm.isInternalApi}
                    onChange={(e) => setStepForm({ ...stepForm, isInternalApi: e.target.checked })}
                  />
                }
                label="Internal API (use ep1)"
              />
            </Grid>

            {!stepForm.isInternalApi && (
              <Grid item xs={12} md={8}>
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
                placeholder="/api/v2/createfees"
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

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="subtitle2">Add Required Fields</Typography>
              </Divider>
            </Grid>

            {/* Field Configuration */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Field Name (API param)"
                placeholder="name"
                value={fieldForm.fieldName}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Field Label (Display)"
                placeholder="Fee Name"
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
                <MenuItem value="select">Select</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.useFromPreviousStep}
                    onChange={(e) => setFieldForm({ ...fieldForm, useFromPreviousStep: e.target.checked })}
                  />
                }
                label="Use data from previous step"
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
                    onChange={(e) => setFieldForm({ ...fieldForm, previousStepSerialNo: parseInt(e.target.value) })}
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

            <Grid item xs={12}>
              <Button
                variant="outlined"
                size="small"
                onClick={addFieldToStep}
              >
                Add Field
              </Button>
            </Grid>

            {/* Display added fields */}
            {stepForm.requiredFields.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fields in this step:
                  </Typography>
                  {stepForm.requiredFields.map((field, index) => (
                    <Chip
                      key={index}
                      label={`${field.fieldLabel} (${field.fieldName})`}
                      onDelete={() => removeFieldFromStep(index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={addStepToWorkflow}
                startIcon={<AddIcon />}
              >
                Add This Step to Workflow
              </Button>
            </Grid>

            {/* Display added steps */}
            {workflowData.steps.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="h6">Configured Steps ({workflowData.steps.length})</Typography>
                </Divider>
                {workflowData.steps.map((step, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          {step.serialNo}. {step.stepName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.method} {step.isInternalApi ? step.endpoint : `${step.domain}${step.endpoint}`}
                        </Typography>
                        <Typography variant="caption">
                          Fields: {step.requiredFields.map(f => f.fieldLabel).join(', ')}
                        </Typography>
                      </Box>
                      <IconButton onClick={() => removeStepFromWorkflow(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveWorkflow}>
            {editMode ? 'Update' : 'Create'} Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
