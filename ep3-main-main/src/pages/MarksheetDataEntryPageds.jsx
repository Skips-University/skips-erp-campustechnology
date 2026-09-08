import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import GetAppIcon from "@mui/icons-material/GetApp";
import * as XLSX from 'xlsx';
import global1 from "./global1";
import ep1 from "../api/ep1";

function MarksheetDataEntryPageds() {
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMarksheet, setCurrentMarksheet] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadDialog, setUploadDialog] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const [formData, setFormData] = useState({
    regno: "",
    academicyear: "",
    semester: "",
    programcode: "",
    classtype: "IX-X",
    subjects: [],
    coScholastic: [
      { area: "Work Education (on Pre-vocational Education)", term1Grade: "A", term2Grade: "A" },
      { area: "Art Education", term1Grade: "A", term2Grade: "A" },
      { area: "Health & Physical Education", term1Grade: "A", term2Grade: "A" },
      { area: "Discipline", term1Grade: "A", term2Grade: "A" }
    ],
    remarks: "",
    promotedToClass: "",
    newSessionDate: "",
    status: "draft"
  });

  const [subjectForm, setSubjectForm] = useState({
    subjectname: "",
    subjectcode: "",
    term1PeriodicTest: 0,
    term1Notebook: 0,
    term1Enrichment: 0,
    term1MidExam: 0,
    term2PeriodicTest: 0,
    term2Notebook: 0,
    term2Enrichment: 0,
    term2AnnualExam: 0,
  });

  useEffect(() => {
    fetchMarksheetData();
  }, []);

  const fetchMarksheetData = async () => {
    try {
      const response = await ep1.get('/api/v2/listmarksheetdatads', {
        params: {
          colid: global1.colid,
          user: global1.user
        }
      });
      
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching marksheet data:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to fetch marksheet data" 
      });
    }
  };

  const handleOpenDialog = (marksheet = null) => {
    if (marksheet) {
      setEditMode(true);
      setCurrentMarksheet(marksheet);
      setFormData({
        ...marksheet,
        subjects: marksheet.subjects || [],
        coScholastic: marksheet.coScholastic || formData.coScholastic
      });
    } else {
      setEditMode(false);
      setCurrentMarksheet(null);
      setFormData({
        regno: "",
        academicyear: "",
        semester: "",
        programcode: "",
        classtype: "IX-X",
        subjects: [],
        coScholastic: [
          { area: "Work Education (on Pre-vocational Education)", term1Grade: "A", term2Grade: "A" },
          { area: "Art Education", term1Grade: "A", term2Grade: "A" },
          { area: "Health & Physical Education", term1Grade: "A", term2Grade: "A" },
          { area: "Discipline", term1Grade: "A", term2Grade: "A" }
        ],
        remarks: "",
        promotedToClass: "",
        newSessionDate: "",
        status: "draft"
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSubjectForm({
      subjectname: "",
      subjectcode: "",
      term1PeriodicTest: 0,
      term1Notebook: 0,
      term1Enrichment: 0,
      term1MidExam: 0,
      term2PeriodicTest: 0,
      term2Notebook: 0,
      term2Enrichment: 0,
      term2AnnualExam: 0,
    });
  };

  const handleAddSubject = () => {
    if (!subjectForm.subjectname) {
      setMessage({ type: "error", text: "Subject name is required" });
      return;
    }

    setFormData({
      ...formData,
      subjects: [...formData.subjects, { ...subjectForm }]
    });

    setSubjectForm({
      subjectname: "",
      subjectcode: "",
      term1PeriodicTest: 0,
      term1Notebook: 0,
      term1Enrichment: 0,
      term1MidExam: 0,
      term2PeriodicTest: 0,
      term2Notebook: 0,
      term2Enrichment: 0,
      term2AnnualExam: 0,
    });

    setMessage({ type: "success", text: "Subject added" });
  };

  const handleRemoveSubject = (index) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSaveMarksheet = async () => {
    if (!formData.regno || !formData.academicyear || !formData.semester) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      return;
    }

    if (formData.subjects.length === 0) {
      setMessage({ type: "error", text: "Please add at least one subject" });
      return;
    }

    try {
      let response;
      
      if (editMode) {
        response = await ep1.post('/api/v2/editmarksheetdatads', 
          {
            name: `Marksheet_${formData.regno}`,
            ...formData
          },
          {
            params: { id: currentMarksheet._id }
          }
        );
      } else {
        response = await ep1.post('/api/v2/createmarksheetdatads',
          {
            name: `Marksheet_${formData.regno}`,
            ...formData
          },
          {
            params: {
              colid: global1.colid,
              user: global1.user
            }
          }
        );
      }

      if (response.data.success) {
        setMessage({
          type: "success",
          text: editMode ? "Marksheet updated successfully" : "Marksheet created successfully"
        });
        fetchMarksheetData();
        handleCloseDialog();
      } else {
        setMessage({ type: "error", text: response.data.message });
      }
    } catch (error) {
      console.error("Error saving marksheet:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to save marksheet" 
      });
    }
  };

  const handleDeleteMarksheet = async (id) => {
    if (!window.confirm("Are you sure you want to delete this marksheet?")) return;

    try {
      const response = await ep1.get('/api/v2/deletemarksheetdatads', {
        params: { id }
      });

      if (response.data.success) {
        setMessage({ type: "success", text: "Marksheet deleted successfully" });
        fetchMarksheetData();
      } else {
        setMessage({ type: "error", text: response.data.message });
      }
    } catch (error) {
      console.error("Error deleting marksheet:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to delete marksheet" 
      });
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        regno: "REG001",
        academicyear: "2023-24",
        semester: "IX",
        programcode: "PROG001",
        classtype: "IX-X",
        subjectname: "Mathematics",
        subjectcode: "MATH001",
        term1PeriodicTest: 8,
        term1Notebook: 4,
        term1Enrichment: 4,
        term1MidExam: 70,
        term2PeriodicTest: 9,
        term2Notebook: 5,
        term2Enrichment: 5,
        term2AnnualExam: 75,
        remarks: "Good performance",
        promotedToClass: "X",
        newSessionDate: "01-04-2024",
        status: "draft"
      },
      {
        regno: "REG001",
        academicyear: "2023-24",
        semester: "IX",
        programcode: "PROG001",
        classtype: "IX-X",
        subjectname: "Science",
        subjectcode: "SCI001",
        term1PeriodicTest: 7,
        term1Notebook: 5,
        term1Enrichment: 4,
        term1MidExam: 65,
        term2PeriodicTest: 8,
        term2Notebook: 5,
        term2Enrichment: 5,
        term2AnnualExam: 70,
        remarks: "Good performance",
        promotedToClass: "X",
        newSessionDate: "01-04-2024",
        status: "draft"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marksheet Template");

    ws['!cols'] = [
      { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
      { wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 18 },
      { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 15 },
      { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 10 }
    ];

    XLSX.writeFile(wb, "Marksheet_Data_Template.xlsx");
    setMessage({ type: "success", text: "Template downloaded successfully" });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setMessage({ type: "error", text: "Excel file is empty" });
          return;
        }

        const requiredColumns = [
          "regno", "academicyear", "semester", "programcode", "classtype", "subjectname"
        ];

        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
          setMessage({
            type: "error",
            text: `Missing required columns: ${missingColumns.join(", ")}`
          });
          return;
        }

        setExcelData(data);
        setUploadDialog(true);
        setMessage({
          type: "success",
          text: `${data.length} rows loaded from Excel. Review and upload.`
        });
      } catch (error) {
        console.error("Error reading Excel file:", error);
        setMessage({ type: "error", text: "Error reading Excel file" });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (excelData.length === 0) {
      setMessage({ type: "error", text: "No data to upload" });
      return;
    }

    setUploadProgress({ current: 0, total: excelData.length });

    const groupedData = {};
    excelData.forEach((row) => {
      const regno = row.regno;
      if (!groupedData[regno]) {
        groupedData[regno] = {
          regno: row.regno,
          academicyear: row.academicyear,
          semester: row.semester,
          programcode: row.programcode,
          classtype: row.classtype,
          subjects: [],
          coScholastic: [
            { area: "Work Education (on Pre-vocational Education)", term1Grade: "A", term2Grade: "A" },
            { area: "Art Education", term1Grade: "A", term2Grade: "A" },
            { area: "Health & Physical Education", term1Grade: "A", term2Grade: "A" },
            { area: "Discipline", term1Grade: "A", term2Grade: "A" }
          ],
          remarks: row.remarks || "",
          promotedToClass: row.promotedToClass || "",
          newSessionDate: row.newSessionDate || "",
          status: row.status || "draft"
        };
      }

      groupedData[regno].subjects.push({
        subjectname: row.subjectname,
        subjectcode: row.subjectcode || "",
        term1PeriodicTest: Number(row.term1PeriodicTest) || 0,
        term1Notebook: Number(row.term1Notebook) || 0,
        term1Enrichment: Number(row.term1Enrichment) || 0,
        term1MidExam: Number(row.term1MidExam) || 0,
        term2PeriodicTest: Number(row.term2PeriodicTest) || 0,
        term2Notebook: Number(row.term2Notebook) || 0,
        term2Enrichment: Number(row.term2Enrichment) || 0,
        term2AnnualExam: Number(row.term2AnnualExam) || 0,
      });
    });

    let successCount = 0;
    let failCount = 0;
    const studentList = Object.values(groupedData);

    for (let i = 0; i < studentList.length; i++) {
      const studentData = studentList[i];

      try {
        const checkResponse = await ep1.get('/api/v2/listmarksheetdatads', {
          params: {
            colid: global1.colid,
            user: global1.user,
            regno: studentData.regno
          }
        });

        let response;
        if (checkResponse.data.success && checkResponse.data.data.length > 0) {
          const existingId = checkResponse.data.data[0]._id;
          response = await ep1.post('/api/v2/editmarksheetdatads',
            {
              name: `Marksheet_${studentData.regno}`,
              ...studentData
            },
            {
              params: { id: existingId }
            }
          );
        } else {
          response = await ep1.post('/api/v2/createmarksheetdatads',
            {
              name: `Marksheet_${studentData.regno}`,
              ...studentData
            },
            {
              params: {
                colid: global1.colid,
                user: global1.user
              }
            }
          );
        }

        if (response.data.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed for ${studentData.regno}:`, response.data.message);
        }
      } catch (error) {
        failCount++;
        console.error(`Error uploading ${studentData.regno}:`, error);
      }

      setUploadProgress({ current: i + 1, total: studentList.length });
    }

    setMessage({
      type: "success",
      text: `Bulk upload complete! Success: ${successCount}, Failed: ${failCount}`
    });

    setUploadDialog(false);
    setExcelData([]);
    setUploadProgress({ current: 0, total: 0 });
    fetchMarksheetData();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Marksheet Data Entry
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<GetAppIcon />}
              onClick={handleDownloadTemplate}
              sx={{ mr: 2 }}
            >
              Download Template
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<UploadFileIcon />}
              component="label"
              sx={{ mr: 2 }}
            >
              Upload Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add New Marksheet
            </Button>
          </Box>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: "", text: "" })}>
            {message.text}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>S.No</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Reg No</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Academic Year</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Semester</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Class Type</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Subjects</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student._id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Chip label={student.regno} color="primary" size="small" />
                  </TableCell>
                  <TableCell>{student.academicyear}</TableCell>
                  <TableCell>{student.semester}</TableCell>
                  <TableCell>{student.classtype}</TableCell>
                  <TableCell>
                    <Chip label={student.subjects?.length || 0} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.status}
                      color={student.status === "finalized" ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenDialog(student)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteMarksheet(student._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {students.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No marksheet data found. Click "Add New Marksheet" to create one.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Marksheet Data" : "Add New Marksheet Data"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Registration Number"
                value={formData.regno}
                onChange={(e) => setFormData({ ...formData, regno: e.target.value })}
                required
                disabled={editMode}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Academic Year"
                placeholder="e.g., 2023-24"
                value={formData.academicyear}
                onChange={(e) => setFormData({ ...formData, academicyear: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
              >
                <MenuItem value="IX">IX</MenuItem>
                <MenuItem value="X">X</MenuItem>
                <MenuItem value="XI">XI</MenuItem>
                <MenuItem value="XII">XII</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Class Type"
                value={formData.classtype}
                onChange={(e) => setFormData({ ...formData, classtype: e.target.value })}
                required
              >
                <MenuItem value="IX-X">IX-X</MenuItem>
                <MenuItem value="XI-XII">XI-XII</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Program Code"
                value={formData.programcode}
                onChange={(e) => setFormData({ ...formData, programcode: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="finalized">Finalized</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Add Subject</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Subject Name"
                        value={subjectForm.subjectname}
                        onChange={(e) => setSubjectForm({ ...subjectForm, subjectname: e.target.value })}
                        placeholder="e.g., Mathematics"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Subject Code"
                        value={subjectForm.subjectcode}
                        onChange={(e) => setSubjectForm({ ...subjectForm, subjectcode: e.target.value })}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="primary">Term I</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Periodic Test (Max 10)"
                        value={subjectForm.term1PeriodicTest}
                        onChange={(e) => setSubjectForm({ ...subjectForm, term1PeriodicTest: Number(e.target.value) })}
                        inputProps={{ min: 0, max: 10 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Notebook (Max 5)"
                        value={subjectForm.term1Notebook}
                        onChange={(e) => setSubjectForm({ ...subjectForm, term1Notebook: Number(e.target.value) })}
                        inputProps={{ min: 0, max: 5 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Enrichment (Max 5)"
                        value={subjectForm.term1Enrichment}
                        onChange={(e) => setSubjectForm({ ...subjectForm, term1Enrichment: Number(e.target.value) })}
                        inputProps={{ min: 0, max: 5 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Mid Exam (Max 80)"
                        value={subjectForm.term1MidExam}
                        onChange={(e) => setSubjectForm({ ...subjectForm, term1MidExam: Number(e.target.value) })}
                        inputProps={{ min: 0, max: 80 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="secondary">Term II</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Periodic Test (Max 10)"
                        value={subjectForm.term2PeriodicTest}
                        onChange={(e) => setSubjectForm({ ...subjectForm, term2PeriodicTest: Number(e.target.value) })}
                        inputProps={{ min: 0, max: 10 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Notebook (Max 5)"
                        value={subjectForm.term2Notebook}
                        onChange={(e) => setSubjectForm({ ...subjectForm, term2Notebook: Number(e.target.value) })}
                        inputProps={{ min: 0, max: 5 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Enrichment (Max 5)"
                        value={subjectForm.term2Enrichment}
                        onChange={(e) => setSubjectForm({ ...subjectForm, term2Enrichment: Number(e.target.value) })}
                        inputProps={{ min: 0, max: 5 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Annual Exam (Max 80)"
                        value={subjectForm.term2AnnualExam}
                        onChange={(e) => setSubjectForm({ ...subjectForm, term2AnnualExam: Number(e.target.value) })}
                        inputProps={{ min: 0, max: 80 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddSubject}
                      >
                        Add Subject
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {formData.subjects.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Subjects ({formData.subjects.length})</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Term I Total</TableCell>
                        <TableCell>Term II Total</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.subjects.map((subject, index) => {
                        const term1Total = subject.term1PeriodicTest + subject.term1Notebook + subject.term1Enrichment + subject.term1MidExam;
                        const term2Total = subject.term2PeriodicTest + subject.term2Notebook + subject.term2Enrichment + subject.term2AnnualExam;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>{subject.subjectname}</TableCell>
                            <TableCell>{term1Total}/100</TableCell>
                            <TableCell>{term2Total}/100</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveSubject(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Additional Information</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Promoted to Class"
                value={formData.promotedToClass}
                onChange={(e) => setFormData({ ...formData, promotedToClass: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Session Date"
                value={formData.newSessionDate}
                onChange={(e) => setFormData({ ...formData, newSessionDate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Class Teacher's Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveMarksheet}
          >
            {editMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Bulk Upload Preview - {excelData.length} rows
        </DialogTitle>
        <DialogContent>
          {uploadProgress.total > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Uploading: {uploadProgress.current} / {uploadProgress.total}
              </Typography>
              <Box sx={{ width: '100%', mt: 1 }}>
                <Box
                  sx={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                    height: 8,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    transition: 'width 0.3s'
                  }}
                />
              </Box>
            </Box>
          )}

          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Reg No</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Term I Total</TableCell>
                  <TableCell>Term II Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {excelData.map((row, index) => {
                  const term1Total = 
                    (Number(row.term1PeriodicTest) || 0) +
                    (Number(row.term1Notebook) || 0) +
                    (Number(row.term1Enrichment) || 0) +
                    (Number(row.term1MidExam) || 0);
                  
                  const term2Total = 
                    (Number(row.term2PeriodicTest) || 0) +
                    (Number(row.term2Notebook) || 0) +
                    (Number(row.term2Enrichment) || 0) +
                    (Number(row.term2AnnualExam) || 0);

                  return (
                    <TableRow key={index}>
                      <TableCell>{row.regno}</TableCell>
                      <TableCell>{row.academicyear}</TableCell>
                      <TableCell>{row.semester}</TableCell>
                      <TableCell>{row.subjectname}</TableCell>
                      <TableCell>{term1Total}/100</TableCell>
                      <TableCell>{term2Total}/100</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status || 'draft'} 
                          size="small"
                          color={row.status === 'finalized' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBulkUpload}
            disabled={uploadProgress.total > 0}
            startIcon={<UploadFileIcon />}
          >
            Upload All ({excelData.length} rows)
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MarksheetDataEntryPageds;
