import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

function DeleteUserModal({ open, handleClose, handleDeleteUser, selectedUser }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        Are you sure you want to delete {selectedUser?.coursecode} - {selectedUser?.coursetitle}?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDeleteUser} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteUserModal;
