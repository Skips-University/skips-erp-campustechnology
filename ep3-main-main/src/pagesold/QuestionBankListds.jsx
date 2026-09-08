import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  CheckCircle as FinalizeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

const QuestionBankListds = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create, Edit, Finalize Dialog States
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createData, setCreateData] = useState({
    course: '',
    coursecode: '',
    faculty: '',
    moderator: '',
    questionbankcode: '',
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
  const [finalizeData, setFinalizeData] = useState({
    questionbankcode: '',
    year: '',
    semester: '',
    examcode: '',
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    coursecode: '',
    year: '',
    examcode: '',
    semester: '',
  });

  // Dynamic filter options
  const courseCodeOptions = [...new Set(questionBanks.map(qb => qb.coursecode).filter(Boolean))];
  const yearOptions = [...new Set(questionBanks.map(qb => qb.year).filter(Boolean))];
  const examCodeOptions = [...new Set(questionBanks.map(qb => qb.examcode).filter(Boolean))];
  const semesterOptions = [...new Set(questionBanks.map(qb => qb.semester).filter(Boolean))];

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    setLoading(true);
    try {
      const res = await ep1.get('/api/v2/getquestionbankdsbycolid', {
        params: {
          colid: global1.colid,
          user: global1.user,
        },
      });
      setQuestionBanks(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch question banks');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      await ep1.post('/api/v2/createquestionbankds', {
        name: global1.name,
        user: global1.user,
        colid: global1.colid,
        ...createData,
      });
      setSuccess('Question bank created successfully');
      setOpenCreateDialog(false);
      setCreateData({
        course: '',
        coursecode: '',
        faculty: '',
        moderator: '',
        questionbankcode: '',
      });
      fetchQuestionBanks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question bank');
    }
  };

  const handleEdit = async () => {
    try {
      await ep1.post('/api/v2/updatequestionbankds', {
        user: global1.user,
        colid: global1.colid,
        ...editData,
      });
      setSuccess('Question bank updated successfully');
      setOpenEditDialog(false);
      fetchQuestionBanks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question bank');
    }
  };

  const handleDelete = async () => {
    //alert(deleteCode + ' ' + global1.colid + ' ' + global1.user);
    try {
      await ep1.post('/api/v2/deletequestionbankds', {
        params: {
          questionbankcode: deleteCode,
          colid: global1.colid,
          user: global1.user,
        },
      });
      setSuccess('Question bank deleted successfully');
      setOpenDeleteDialog(false);
      fetchQuestionBanks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question bank');
    }
  };

  const handleFinalize = async () => {
    try {
      await ep1.post('/api/v2/finalizequestionbankds', {
        user: global1.user,
        colid: global1.colid,
        ...finalizeData,
      });
      setSuccess('Question bank finalized successfully');
      setOpenFinalizeDialog(false);
      fetchQuestionBanks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to finalize question bank');
    }
  };

  const getUserRole = (qb) => {
    if (qb.user === global1.user) return 'Admin';
    if (qb.faculty === global1.user) return 'Faculty';
    if (qb.moderator === global1.user) return 'Moderator';
    return '';
  };

  // Filters logic
  const filteredBanks = questionBanks.filter(qb => {
    return (!filters.coursecode || qb.coursecode === filters.coursecode) &&
           (!filters.year || qb.year === filters.year) &&
           (!filters.examcode || qb.examcode === filters.examcode) &&
           (!filters.semester || qb.semester === filters.semester);
  });

  // Format date utility
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Question Bank Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Question Bank
        </Button>
      </Box>

      {/* Filter Section */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Course Code"
          value={filters.coursecode}
          onChange={e => setFilters(f => ({ ...f, coursecode: e.target.value }))}
          select
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {courseCodeOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Year"
          value={filters.year}
          onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
          select
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          {yearOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Exam Code"
          value={filters.examcode}
          onChange={e => setFilters(f => ({ ...f, examcode: e.target.value }))}
          select
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {examCodeOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Semester"
          value={filters.semester}
          onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))}
          select
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          {semesterOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Question Bank Code</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Course Code</TableCell>
                <TableCell>Faculty</TableCell>
                <TableCell>Moderator</TableCell>
                <TableCell>Exam Code</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Finalized Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Your Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBanks.map((qb) => (
                <TableRow key={qb._id}>
                  <TableCell>{qb.questionbankcode}</TableCell>
                  <TableCell>{qb.course}</TableCell>
                  <TableCell>{qb.coursecode}</TableCell>
                  <TableCell>{qb.faculty}</TableCell>
                  <TableCell>{qb.moderator}</TableCell>
                  <TableCell>{qb.examcode || '-'}</TableCell>
                  <TableCell>{qb.year || '-'}</TableCell>
                  <TableCell>{qb.semester || '-'}</TableCell>
                  <TableCell>{qb.finalizedat ? formatDate(qb.finalizedat) : '-'}</TableCell>
                  <TableCell>
                    {qb.isfinalized ? (
                      <Chip label="Finalized" color="success" size="small" />
                    ) : (
                      <Chip label="Draft" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={getUserRole(qb)} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Admin Actions */}
                      {qb.user === global1.user && (
                        <>
                          {!qb.isfinalized && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setEditData(qb);
                                  setOpenEditDialog(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setDeleteCode(qb.questionbankcode);
                                  setOpenDeleteDialog(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setFinalizeData({
                                    questionbankcode: qb.questionbankcode,
                                    year: '',
                                    semester: '',
                                    examcode: '',
                                  });
                                  setOpenFinalizeDialog(true);
                                }}
                              >
                                <FinalizeIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() =>
                              navigate(`/vieweditlogsds/${qb.questionbankcode}`)
                            }
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}

                      {/* View Questions Button for All Roles */}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() =>
                          navigate(`/managequestionsds/${qb.questionbankcode}`)
                        }
                      >
                        Questions
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Question Bank</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Course Name"
              value={createData.course}
              onChange={(e) => setCreateData({ ...createData, course: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Course Code"
              value={createData.coursecode}
              onChange={(e) => setCreateData({ ...createData, coursecode: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Faculty Email"
              value={createData.faculty}
              onChange={(e) => setCreateData({ ...createData, faculty: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Moderator Email"
              value={createData.moderator}
              onChange={(e) => setCreateData({ ...createData, moderator: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Question Bank Code"
              value={createData.questionbankcode}
              onChange={(e) => setCreateData({ ...createData, questionbankcode: e.target.value })}
              fullWidth
              required
              helperText="Must be unique for your college"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Question Bank</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Course Name"
              value={editData.course || ''}
              onChange={(e) => setEditData({ ...editData, course: e.target.value })}
              fullWidth
            />
            <TextField
              label="Course Code"
              value={editData.coursecode || ''}
              onChange={(e) => setEditData({ ...editData, coursecode: e.target.value })}
              fullWidth
            />
            <TextField
              label="Faculty Email"
              value={editData.faculty || ''}
              onChange={(e) => setEditData({ ...editData, faculty: e.target.value })}
              fullWidth
            />
            <TextField
              label="Moderator Email"
              value={editData.moderator || ''}
              onChange={(e) => setEditData({ ...editData, moderator: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Finalize Dialog */}
      <Dialog open={openFinalizeDialog} onClose={() => setOpenFinalizeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Finalize Question Bank</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="warning">
              Once finalized, the question bank cannot be edited or deleted!
            </Alert>
            <TextField
              label="Year"
              value={finalizeData.year}
              onChange={(e) => setFinalizeData({ ...finalizeData, year: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Semester"
              value={finalizeData.semester}
              onChange={(e) => setFinalizeData({ ...finalizeData, semester: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Exam Code"
              value={finalizeData.examcode}
              onChange={(e) => setFinalizeData({ ...finalizeData, examcode: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinalizeDialog(false)}>Cancel</Button>
          <Button onClick={handleFinalize} variant="contained" color="success">
            Finalize
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this question bank? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionBankListds;
