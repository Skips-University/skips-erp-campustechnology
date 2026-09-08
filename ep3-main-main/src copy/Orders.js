import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

// user Data
function createData(id, firstName, lastName, age, role) {
    return { id, firstName, lastName, age, role };
}

// Initial data 
const initialRows = [
    createData(1, 'John', 'Doe', 28, 'Developer'),
    createData(2, 'Jane', 'Smith', 34, 'Designer'),
    createData(3, 'Sam', 'Johnson', 45, 'Manager'),
];


// Initalizing the values using State hook
export default function Users() {
    const [rows, setRows] = React.useState(initialRows);
    const [openAdd, setOpenAdd] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [newUser, setNewUser] = React.useState({Id:' ', firstName: '', lastName: '', age: '', role: '' });

    const handleOpenAdd = () => {
        setOpenAdd(true);
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
        setNewUser({id:'', firstName: '', lastName: '', age: '', role: '' });
    };

    const handleOpenEdit = (user) => {
        setSelectedUser(user);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setSelectedUser(null);
    };

    const handleOpenDelete = (user) => {
        setSelectedUser(user);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
        setSelectedUser(null);
    };

    const handleAddUser = () => {
        const newUserId = rows.length ? rows[rows.length - 1].id + 1 : 1;
        const newRow = createData(newUserId, newUser.firstName, newUser.lastName, parseInt(newUser.age, 10), newUser.role);
        setRows([...rows, newRow]);
        handleCloseAdd();
    };

    const handleEditUser = () => {
        const updatedRows = rows.map((row) =>
            row.id === selectedUser.id ? { ...selectedUser } : row
        );
        setRows(updatedRows);
        handleCloseEdit();
    };

    const handleDeleteUser = () => {
        const updatedRows = rows.filter((row) => row.id !== selectedUser.id);
        setRows(updatedRows);
        handleCloseDelete();
    };

    const handleInputChange = (event, field) => {
        const { value } = event.target;
        if (openAdd) {
            setNewUser({ ...newUser, [field]: value });
        } else if (openEdit) {
            setSelectedUser({ ...selectedUser, [field]: value });
        }
    };

    return (
        <React.Fragment>
            <Title>Users</Title>
            <Box display="flex" marginBottom={4} marginTop={2}>
                <Button
                    variant="contained"
                    color="success"
                    style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }}
                    onClick={handleOpenAdd}
                >
                    Add User
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}
                >
                    Export
                </Button>
            </Box>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>FIRST NAME</TableCell>
                        <TableCell>LAST NAME</TableCell>
                        <TableCell>AGE</TableCell>
                        <TableCell>ROLE</TableCell>
                        <TableCell>ACTIONS</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.firstName}</TableCell>
                            <TableCell>{row.lastName}</TableCell>
                            <TableCell>{row.age}</TableCell>
                            <TableCell>{row.role}</TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ marginRight: '5px' }}
                                    onClick={() => handleOpenEdit(row)}>Edit</Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleOpenDelete(row)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>


            {/* Add User */}
            <Dialog open={openAdd} onClose={handleCloseAdd}>
                <DialogTitle>Add User</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="First Name"
                        fullWidth
                        value={newUser.firstName}
                        onChange={(event) => handleInputChange(event, 'firstName')}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        fullWidth
                        value={newUser.lastName}
                        onChange={(event) => handleInputChange(event, 'lastName')}
                    />
                    <TextField
                        margin="dense"
                        label="Age"
                        fullWidth
                        value={newUser.age}
                        onChange={(event) => handleInputChange(event, 'age')}
                    />
                    <TextField
                        margin="dense"
                        label="Role"
                        fullWidth
                        value={newUser.role}
                        onChange={(event) => handleInputChange(event, 'role')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdd} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddUser} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Edit User*/}
            <Dialog open={openEdit} onClose={handleCloseEdit}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        label="First Name"
                        fullWidth
                        value={selectedUser?.firstName || ''} // first name or empty
                        onChange={(event) => handleInputChange(event, 'firstName')}
                    />
                    <TextField
                        margin="normal"
                        label="Last Name"
                        fullWidth
                        value={selectedUser?.lastName || ''}
                        onChange={(event) => handleInputChange(event, 'lastName')}
                    />
                    <TextField
                        margin="normal"
                        label="Age"
                        fullWidth
                        value={selectedUser?.age || ''}
                        onChange={(event) => handleInputChange(event, 'age')}
                    />
                    <TextField
                        margin="normal"
                        label="Role"
                        fullWidth
                        value={selectedUser?.role || ''}
                        onChange={(event) => handleInputChange(event, 'role')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditUser} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Delete User */}
            <Dialog open={openDelete} onClose={handleCloseDelete}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete?
                    {/* {selectedUser?.firstName} {selectedUser?.lastName}? */}
                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteUser} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
