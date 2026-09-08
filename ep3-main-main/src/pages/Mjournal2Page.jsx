import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete, Add, Assessment, RemoveCircle, AddCircle, Upload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';
import { ArrowBack } from "@mui/icons-material";

const Mjournal2Page = () => {
  const navigate = useNavigate();
  const [mjournal2, setMjournal2] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountGroups, setAccountGroups] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);

  // Form state for multiple entries
  const [formData, setFormData] = useState({
    year: '',
    transaction: '',
    activitydate: '',
    student: '',
    regno: '',
    empid: '',
    comments: '',
    entries: [
      {
        accountgroup: '',
        acctype: '',
        account: '',
        amount: '',
        type: 'Debit',
        subledger: '',
        cogs: 'No'
      }
    ]
  });

  const years = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];
  const cogsOptions = ['Yes', 'No'];

  useEffect(() => {
    fetchMjournal2();
    fetchAccountGroups();
    fetchAllAccounts();
  }, []);

  const fetchMjournal2 = async () => {
    setLoading(true);
    try {
      const response = await ep1.get(`/api/v2/dsgetmjournal2?colid=${global1.colid}`);
      if (response.data.success) {
        setMjournal2(response.data.data.map((item, index) => ({
          ...item,
          id: item._id,
          srNo: index + 1,
          activitydate: item.activitydate ? new Date(item.activitydate).toLocaleDateString() : ''
        })));
      }
    } catch (error) {
      setError('Error fetching journal entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountGroups = async () => {
    try {
      const response = await ep1.get(`/api/v2/dsgetaccountgroupswithtypes?colid=${global1.colid}`);
      if (response.data.success) {
        setAccountGroups(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching account groups:', error);
      setError('Error fetching account groups from backend');
    }
  };

  const fetchAllAccounts = async () => {
    try {
      const response = await ep1.get(`/api/v2/dsgetaccountsmeta?colid=${global1.colid}`);
      if (response.data.success) {
        setAllAccounts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching all accounts:', error);
    }
  };

  const addEntry = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, {
        accountgroup: '',
        acctype: '',
        account: '',
        amount: '',
        type: 'Credit',
        subledger: '',
        cogs: 'No'
      }]
    });
  };

  const removeEntry = (index) => {
    if (formData.entries.length > 1) {
      const newEntries = formData.entries.filter((_, i) => i !== index);
      setFormData({ ...formData, entries: newEntries });
    }
  };

  const updateEntry = (index, field, value) => {
    setFormData(prevFormData => {
      const newEntries = prevFormData.entries.map((entry, entryIndex) => {
        if (entryIndex === index) {
          const updatedEntry = { ...entry, [field]: value };

          if (field === 'accountgroup' && value) {
            const selectedGroup = accountGroups.find(group => group.groupname === value);
            if (selectedGroup) {
              updatedEntry.acctype = selectedGroup.grouptype;
              updatedEntry.account = '';
            }
          }

          if (field === 'account' && value) {
            const selectedAccount = allAccounts.find(acc => acc.account === value);
            if (selectedAccount) {
              updatedEntry.acctype = selectedAccount.acctype;
              updatedEntry.accountgroup = selectedAccount.accountgroup;
            }
          }

          return updatedEntry;
        }
        return entry;
      });

      return { ...prevFormData, entries: newEntries };
    });
  };

  const calculateBalance = () => {
    const debitTotal = formData.entries
      .filter(entry => entry.type === 'Debit')
      .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);
    const creditTotal = formData.entries
      .filter(entry => entry.type === 'Credit')
      .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);
    return { debitTotal, creditTotal, balance: debitTotal - creditTotal };
  };

  // Function to convert entries to proper debit/credit format
  const processEntriesForSave = (entries) => {
    return entries.map(entry => ({
      ...entry,
      amount: parseFloat(entry.amount),
      debit: entry.type === 'Debit' ? parseFloat(entry.amount) : 0,
      credit: entry.type === 'Credit' ? parseFloat(entry.amount) : 0
    }));
  };

  const handleSubmit = async () => {
    try {
      const { balance } = calculateBalance();
      if (Math.abs(balance) > 0.01) {
        setError('Debit and Credit amounts must be equal. Current difference: ' + balance.toFixed(2));
        return;
      }

      if (!formData.transaction || !formData.year) {
        setError('Transaction and Year are required');
        return;
      }

      const incompleteEntries = formData.entries.filter(entry => 
        !entry.accountgroup || !entry.account || !entry.amount || !entry.type
      );
      
      if (incompleteEntries.length > 0) {
        setError('Please fill in all required fields (Account Group, Account, Amount, Type) for all entries');
        return;
      }

      setError('');
      const processedEntries = processEntriesForSave(formData.entries);

      const uniqueTransactionRef = `TRN-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      
      const promises = processedEntries.map((entry, index) => {
        return ep1.post('/api/v2/dscreatemjournal2', {
          name: global1.name,
          user: global1.user,
          colid: global1.colid,
          year: formData.year,
          accgroup: entry.accountgroup,
          account: entry.account,
          acctype: entry.acctype,
          transaction: formData.transaction,
          transactionref: uniqueTransactionRef,
          subledger: entry.subledger,
          cogs: entry.cogs || 'No',
          activitydate: formData.activitydate,
          amount: entry.amount,
          debit: entry.debit,
          credit: entry.credit,
          type: entry.type,
          student: formData.student,
          regno: formData.regno,
          empid: formData.empid || '',
          status1: 'Active',
          comments: formData.comments || ''
        });
      });

      await Promise.all(promises);
      setSuccess('Transaction entries created successfully');
      fetchMjournal2();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving transaction entries');
    }
  };

  const handleDelete = async (params) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await ep1.get(`/api/v2/dsdeletemjournal2?id=${params.row._id}&colid=${global1.colid}`);
        if (response.data.success) {
          setSuccess('Entry deleted successfully');
          fetchMjournal2();
        }
      } catch (error) {
        setError('Error deleting entry');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      year: '',
      transaction: '',
      activitydate: '',
      student: '',
      regno: '',
      empid: '',
      comments: '',
      entries: [{
        accountgroup: '',
        acctype: '',
        account: '',
        amount: '',
        type: 'Debit',
        subledger: '',
        cogs: 'No'
      }]
    });
    setError('');
    setSuccess('');
  };

  const getAccountsForEntry = (accountgroup) => {
    return allAccounts.filter(account => account.accountgroup === accountgroup);
  };

  const { debitTotal, creditTotal, balance } = calculateBalance();

  const columns = [
    { field: 'srNo', headerName: 'Sr. No.', width: 80 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'accgroup', headerName: 'Group', width: 120 },
    { field: 'account', headerName: 'Account', width: 150 },
    { field: 'transaction', headerName: 'Transaction', width: 120 },
    { field: "transactionref", headerName: "Transaction Ref", width: 160 },
    { field: 'activitydate', headerName: 'Date', width: 100 },
    { field: 'amount', headerName: 'Amount', width: 90 },
    { field: 'debit', headerName: 'Debit', width: 90 },
    { field: 'credit', headerName: 'Credit', width: 90 },
    { field: 'cogs', headerName: 'COGS', width: 70 },
    {
      field: 'type',
      headerName: 'Type',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Credit' ? 'success' : 'primary'}
          size="small"
        />
      ),
    },
    { field: 'student', headerName: 'Student', width: 100 },
    { field: 'regno', headerName: 'Reg No', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      renderCell: (params) => (
        <IconButton onClick={() => handleDelete(params)} color="error">
          <Delete />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                                      <Button
                                        startIcon={<ArrowBack />}
                                        onClick={() => navigate("/dashdashfacnew")}
                                      >
                                        Back
                                      </Button>
                                      <Typography variant="h4" gutterBottom>
        Journal Entries Management (MJournal2)
      </Typography>
                                    </Box>
      

      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => navigate('/bulkuploadpageds')}
          sx={{ mr: 2 }}
        >
          Bulk Upload
        </Button>
        <Button
          variant="outlined"
          startIcon={<Assessment />}
          onClick={() => navigate('/mjournal2reportpage')}
          sx={{ mr: 2 }}
        >
          Generate Reports
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Transaction
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={mjournal2}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                label="Year"
                required
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Transaction"
              value={formData.transaction}
              onChange={(e) => setFormData({...formData, transaction: e.target.value})}
              required
              helperText="Used to generate reference"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Activity Date"
              type="date"
              value={formData.activitydate}
              onChange={(e) => setFormData({...formData, activitydate: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Student Name"
              value={formData.student}
              onChange={(e) => setFormData({...formData, student: e.target.value})}
            />
            <TextField
              fullWidth
              label="Registration No"
              value={formData.regno}
              onChange={(e) => setFormData({...formData, regno: e.target.value})}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Employee ID"
              value={formData.empid}
              onChange={(e) => setFormData({...formData, empid: e.target.value})}
            />
            <TextField
              fullWidth
              label="Comments"
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              multiline
              rows={2}
            />
          </Box>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Account Entries</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Group *</TableCell>
                  <TableCell>Account Type</TableCell>
                  <TableCell>Account *</TableCell>
                  <TableCell>Sub Ledger</TableCell>
                  <TableCell>COGS</TableCell>
                  <TableCell>Amount *</TableCell>
                  <TableCell>Type *</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.entries.map((entry, index) => (
                  <TableRow key={`entry-row-${index}`}>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={entry.accountgroup || ''}
                          onChange={(e) => updateEntry(index, 'accountgroup', e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">Select Account Group</MenuItem>
                          {accountGroups.map((group, groupIndex) => (
                            <MenuItem key={groupIndex} value={group.groupname}>
                              {group.groupname} ({group.grouptype})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={entry.acctype || ''}
                        disabled
                        placeholder="Auto-filled"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={entry.account || ''}
                          onChange={(e) => updateEntry(index, 'account', e.target.value)}
                          displayEmpty
                          disabled={!entry.accountgroup}
                        >
                          <MenuItem value="">Select Account</MenuItem>
                          {getAccountsForEntry(entry.accountgroup).map((account, accountIndex) => (
                            <MenuItem key={accountIndex} value={account.account}>
                              {account.account}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={entry.subledger || ''}
                        onChange={(e) => updateEntry(index, 'subledger', e.target.value)}
                        placeholder="Sub ledger"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={entry.cogs || 'No'}
                          onChange={(e) => updateEntry(index, 'cogs', e.target.value)}
                        >
                          {cogsOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={entry.amount || ''}
                        onChange={(e) => updateEntry(index, 'amount', e.target.value)}
                        fullWidth
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small">
                        <Select
                          value={entry.type || 'Debit'}
                          onChange={(e) => updateEntry(index, 'type', e.target.value)}
                        >
                          <MenuItem value="Debit">Debit</MenuItem>
                          <MenuItem value="Credit">Credit</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => removeEntry(index)}
                        disabled={formData.entries.length === 1}
                        color="error"
                      >
                        <RemoveCircle />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            onClick={addEntry}
            startIcon={<AddCircle />}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Add Entry
          </Button>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Debit Total: Rs. {debitTotal.toFixed(2)}</Typography>
            <Typography>Credit Total: Rs. {creditTotal.toFixed(2)}</Typography>
            <Typography color={Math.abs(balance) > 0.01 ? 'error' : 'success'}>
              Balance: Rs. {balance.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={Math.abs(balance) > 0.01 || !formData.transaction || !formData.year}
          >
            Save Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Mjournal2Page;
