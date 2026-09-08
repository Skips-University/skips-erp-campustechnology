import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

function ExportUsersModal({ open, handleClose, handleExport }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Export Data</DialogTitle>
      <DialogContent>
        Are you sure you want to export all the data to an Excel sheet?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleExport} color="primary">
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExportUsersModal;
