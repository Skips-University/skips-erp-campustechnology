import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { CloudUpload, Preview } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import ep1 from '../api/ep1';
import global1 from './global1';

const BulkUploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadStats, setUploadStats] = useState({ successful: 0, failed: 0, total: 0 });

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      setError('');
      previewExcelData(selectedFile);
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const previewExcelData = async (selectedFile) => {
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const preview = jsonData.slice(0, 6).map((row, index) => ({
        row: index + 1,
        data: row
      }));
      setPreviewData(preview);
    } catch (error) {
      console.error('Error previewing Excel data:', error);
    }
  };

  const parseExcelData = async () => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const entries = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const amount = parseFloat(row[3]);
        const type = row[14] || (amount > 0 ? 'Credit' : 'Debit');

        const entry = {
          year: row[0],
          student: row[1]?.toString().trim(),
          regno: row[2]?.toString().trim(),
          amount: amount,
          scholarship: row[4],
          subledger: row[5],
          transaction: row[6] || 'JV',
          activitydate: row[7] || new Date().toISOString().split('T')[0],
          account: row[8],
          acctype: row[9],
          accountgroup: row[10],
          cogs: row[11] || '',
          empid: row[12] || '',
          comments: row[13] || '',
          type: type,
          debit: type === 'Debit' ? amount : 0,
          credit: type === 'Credit' ? amount : 0
        };

        if (entry.year && entry.student && entry.regno && !isNaN(entry.amount)) {
          entries.push(entry);
        }
      }

      return entries;
    } catch (error) {
      throw new Error('Failed to parse Excel file: ' + error.message);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);
    setUploadStats({ successful: 0, failed: 0, total: 0 });

    try {
      const entries = await parseExcelData();
      if (entries.length === 0) {
        setError('No valid data found in the Excel file');
        setUploading(false);
        return;
      }

      setUploadStats(prev => ({ ...prev, total: entries.length }));
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < entries.length; i++) {
        try {
          const entry = entries[i];
          await ep1.post('/api/v2/dscreatemjournal2', {
            name: global1.name,
            user: global1.user,
            colid: global1.colid,
            year: entry.year,
            accgroup: entry.accountgroup,
            account: entry.account,
            acctype: entry.acctype,
            transaction: entry.transaction,
            transactionref: `${entry.transaction}_${entry.year}_${Date.now()}`,
            subledger: entry.subledger,
            cogs: entry.cogs,
            activitydate: entry.activitydate,
            amount: entry.amount,
            debit: entry.debit,
            credit: entry.credit,
            type: entry.type,
            student: entry.student,
            regno: entry.regno,
            empid: entry.empid,
            status1: 'Active',
            comments: entry.comments
          });
          successful++;
        } catch (error) {
          failed++;
          console.error(`Failed to insert entry ${i + 1}:`, error);
        }

        const currentProgress = ((i + 1) / entries.length) * 100;
        setProgress(currentProgress);
        setUploadStats({ successful, failed, total: entries.length });
      }

      if (failed === 0) {
        setSuccess(`Successfully uploaded all ${successful} entries!`);
      } else {
        setSuccess(`Upload completed: ${successful} successful, ${failed} failed out of ${entries.length} total entries.`);
      }

      setFile(null);
      setPreviewData([]);
      document.getElementById('excel-file-input').value = '';
    } catch (error) {
      setError('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bulk Upload Journal Transactions (MJournal2)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Excel File Upload (Individual Insert Method)
        </Typography>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="excel-file-input"
        />
        <label htmlFor="excel-file-input">
          <Button
            component="span"
            variant="outlined"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
            Choose Excel File
          </Button>
        </label>

        {file && (
          <Typography sx={{ mt: 2 }}>
            Selected: {file.name}
          </Typography>
        )}

        {previewData.length > 0 && (
          <Button
            startIcon={<Preview />}
            onClick={() => setShowPreview(true)}
            sx={{ mr: 2, mt: 2 }}
          >
            Preview Data
          </Button>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? 'Processing...' : 'Upload & Process'}
        </Button>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Progress: {Math.round(progress)}%
              {uploadStats.total > 0 && ` (${uploadStats.successful + uploadStats.failed}/${uploadStats.total})`}
            </Typography>
            {uploadStats.total > 0 && (
              <Typography variant="body2">
                ✅ Successful: {uploadStats.successful} | ❌ Failed: {uploadStats.failed}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Expected Excel Format
        </Typography>
        <Typography component="div">
          Your Excel file should have the following columns in order:
          <ol>
            <li>Year (e.g., 2025-26)</li>
            <li>Student Name</li>
            <li>Registration Number</li>
            <li>Amount</li>
            <li>Scholarship/Account Description</li>
            <li>Sub Ledger</li>
            <li>Transaction Type (optional, defaults to JV)</li>
            <li>Activity Date (YYYY-MM-DD format)</li>
            <li>Account</li>
            <li>Account Type</li>
            <li>Account Group</li>
            <li>COGS (optional)</li>
            <li>Employee ID (optional)</li>
            <li>Comments (optional)</li>
            <li>Type (Debit/Credit - optional, auto-determined from amount)</li>
          </ol>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          This method inserts each record individually using your mjournal2 create API.
          Debit and Credit fields will be automatically calculated based on Type and Amount.
        </Typography>
      </Paper>

      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Excel Data Preview</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Reg No</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Activity Date</TableCell>
                  <TableCell>...</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData.map((row) => (
                  <TableRow key={row.row}>
                    <TableCell>{row.row}</TableCell>
                    {row.data.slice(0, 7).map((cell, index) => (
                      <TableCell key={index}>{cell || ''}</TableCell>
                    ))}
                    <TableCell>...</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkUploadPage;
