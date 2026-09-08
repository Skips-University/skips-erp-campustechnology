import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  Paper,
  Stack,
  IconButton
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import ep1 from '../api/ep1';
import global1 from './global1';

const StudentMasterListds = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openSemesterDialog, setOpenSemesterDialog] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: 'P@123',
    regno: '',
    programcode: '',
    admissionyear: '',
    semester: '',
    section: '',
    gender: '',
    department: ''
  });

  const [semesterFilters, setSemesterFilters] = useState({
    year: '',
    programcode: '',
    currentSemester: '',
    newSemester: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/studentMasterListds', {
        params: { colid: global1.colid }
      });
      if (response.data.success) {
        setStudents(response.data.data);
        alert(`Loaded ${response.data.count} students`);
      }
    } catch (error) {
      alert('Error fetching students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE EDIT - When cell is edited
  const processRowUpdate = async (newRow, oldRow) => {
    try {
      const response = await ep1.post('/api/v2/updateStudentds', 
        newRow,
        { params: { id: newRow._id } }
      );

      if (response.data.success) {
        alert('Student updated successfully');
        return newRow;
      } else {
        alert('Update failed');
        return oldRow;
      }
    } catch (error) {
      alert('Error updating student');
      console.error(error);
      return oldRow;
    }
  };

  // HANDLE DELETE
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await ep1.get('/api/v2/deleteStudentds', {
          params: { id }
        });

        if (response.data.success) {
          alert('Student deleted successfully');
          fetchStudents();
        } else {
          alert('Delete failed');
        }
      } catch (error) {
        alert('Error deleting student');
        console.error(error);
      }
    }
  };

  const handleCreateStudent = async () => {
    try {
      const response = await ep1.post('/api/v2/createStudentds', {
        ...formData,
        colid: global1.colid,
        addedby: global1.user,
        user: global1.user,
        status: 1
      });

      if (response.data.success) {
        alert('Student created successfully');
        setOpenAddDialog(false);
        setFormData({
          email: '',
          name: '',
          phone: '',
          password: 'P@123',
          regno: '',
          programcode: '',
          admissionyear: '',
          semester: '',
          section: '',
          gender: '',
          department: ''
        });
        fetchStudents();
      } else {
        alert(response.data.message || 'Creation failed');
      }
    } catch (error) {
      alert('Error creating student');
      console.error(error);
    }
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          processExcelData(jsonData);
        } catch (error) {
          alert('Error reading Excel file');
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const processExcelData = async (data) => {
    setOpenBulkDialog(false);
    alert(`Processing ${data.length} students...`);
    let successCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const studentData = {
        email: row.email || row.Email,
        name: row.name || row.Name,
        phone: row.phone || row.Phone || '',
        password: 'P@123',
        regno: row.regno || row.RegNo || '',
        programcode: row.programcode || row.ProgramCode || '',
        admissionyear: row.admissionyear || row.AdmissionYear || '',
        semester: row.semester || row.Semester || '',
        section: row.section || row.Section || '',
        gender: row.gender || row.Gender || '',
        department: row.department || row.Department || '',
        colid: global1.colid,
        addedby: global1.user,
        user: global1.user,
        status: 1
      };

      try {
        const response = await ep1.post('/api/v2/createStudentds', studentData);
        if (response.data.success) successCount++;
      } catch (error) {
        console.error(`Error creating student ${i + 1}`);
      }
    }

    alert(`Upload complete: ${successCount} students added`);
    fetchStudents();
  };

  const handleBulkSemesterUpdate = async () => {
    try {
      const response = await ep1.post('/api/v2/bulkSemesterUpdateds', {
        ...semesterFilters,
        colid: global1.colid
      });

      if (response.data.success) {
        alert(response.data.message);
        setOpenSemesterDialog(false);
        setSemesterFilters({
          year: '',
          programcode: '',
          currentSemester: '',
          newSemester: ''
        });
        fetchStudents();
      } else {
        alert(response.data.message || 'Update failed');
      }
    } catch (error) {
      alert('Error updating semesters');
    }
  };

  // COLUMNS WITH EDITABLE AND DELETE
  const columns = [
    { field: 'regno', headerName: 'Reg No', width: 130, editable: true },
    { field: 'name', headerName: 'Name', width: 200, editable: true },
    { field: 'email', headerName: 'Email', width: 220, editable: true },
    { field: 'phone', headerName: 'Phone', width: 130, editable: true },
    { field: 'programcode', headerName: 'Program', width: 120, editable: true },
    { field: 'semester', headerName: 'Semester', width: 100, editable: true },
    { field: 'section', headerName: 'Section', width: 100, editable: true },
    { field: 'admissionyear', headerName: 'Year', width: 120, editable: true },
    { field: 'department', headerName: 'Department', width: 150, editable: true },
    { field: 'gender', headerName: 'Gender', width: 100, editable: true },
    {
      field: 'actions',
      headerName: 'Delete',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="error"
          size="small"
          onClick={() => handleDeleteStudent(params.row._id)}
        >
          <Delete />
        </IconButton>
      )
    }
  ];

  const filteredStudents = students.filter((student) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.regno?.toLowerCase().includes(searchLower) ||
      student.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Master List
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        College ID: {global1.colid} | Logged in as: {global1.name}
      </Typography>

      {/* BUTTONS AND SEARCH */}
      <Box sx={{ mb: 2, mt: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAddDialog(true)}
          >
            Add Student
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenBulkDialog(true)}
          >
            Bulk Upload Excel
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => setOpenSemesterDialog(true)}
          >
            Change Semester
          </Button>
        </Stack>

        <TextField
          fullWidth
          label="Search Students"
          placeholder="Search by name, email, regno, or phone"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* DATA GRID WITH EDIT & DELETE */}
      <Paper elevation={3}>
        <DataGrid
          rows={filteredStudents}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => {
            console.error('Row update error:', error);
            alert('Error updating row');
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{ height: 600 }}
        />
      </Paper>

      {/* ADD STUDENT DIALOG */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration No"
                value={formData.regno}
                onChange={(e) => setFormData({ ...formData, regno: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Program Code"
                value={formData.programcode}
                onChange={(e) => setFormData({ ...formData, programcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admission Year (e.g., 2025-26)"
                value={formData.admissionyear}
                onChange={(e) => setFormData({ ...formData, admissionyear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateStudent} variant="contained">
            Create Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* BULK UPLOAD DIALOG */}
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)}>
        <DialogTitle>Bulk Upload Students from Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Required columns: email, name, phone, regno, programcode, admissionyear, semester, section, gender, department
            </Typography>
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Choose Excel File
              <input type="file" accept=".xlsx, .xls" onChange={handleBulkUpload} hidden />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* SEMESTER UPDATE DIALOG */}
      <Dialog open={openSemesterDialog} onClose={() => setOpenSemesterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Semester Update</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Admission Year (e.g., 2025-26)"
                value={semesterFilters.year}
                onChange={(e) => setSemesterFilters({ ...semesterFilters, year: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Program Code"
                value={semesterFilters.programcode}
                onChange={(e) => setSemesterFilters({ ...semesterFilters, programcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Semester"
                value={semesterFilters.currentSemester}
                onChange={(e) => setSemesterFilters({ ...semesterFilters, currentSemester: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Semester"
                value={semesterFilters.newSemester}
                onChange={(e) => setSemesterFilters({ ...semesterFilters, newSemester: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSemesterDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkSemesterUpdate} variant="contained">
            Update Semester
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentMasterListds;
