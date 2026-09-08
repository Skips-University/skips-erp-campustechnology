// pages/AddLedgerFormds.jsx

import React, { useState, useEffect } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Autocomplete,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import global1 from "./global1";
import ep1 from "../api/ep1";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  border: "1px solid #e9ecef",
  marginBottom: theme.spacing(2),
}));

function AddLedgerFormds({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    regno: "",
    studentname: "",
    feeitem: "",
    feecategory: "",
    amount: "",
    type: "positive",
    installmentType: "single",
    semester: "",
    academicyear: new Date().getFullYear().toString(),
    comments: "",
  });

  const [installments, setInstallments] = useState([]);
  const [newInstallment, setNewInstallment] = useState({
    installmentNumber: 1,
    amount: "",
    classdate: "",
    percentage: "",
  });

  const [students, setStudents] = useState([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [installmentMode, setInstallmentMode] = useState("amount");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchStudent.length > 2) {
      searchStudentsFunc();
    }
  }, [searchStudent]);

  const searchStudentsFunc = async () => {
    try {
      setLoadingStudents(true);
      const response = await ep1.get("/api/v2/searchstudentsds", {
        params: {
          search: searchStudent,
          colid: global1.colid,
          limit: 10,
        },
      });
      setStudents(response.data.data);
    } catch (err) {
      console.error("Error searching students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentSelect = (student) => {
    setFormData({
      ...formData,
      regno: student.regno,
      studentname: student.name,
    });
    setSearchStudent("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const handleAddInstallment = () => {
    if (!newInstallment.classdate) {
      setError("Please fill class date for installment");
      return;
    }

    let calculatedAmount = 0;

    if (installmentMode === "percentage") {
      if (!newInstallment.percentage) {
        setError("Please enter percentage");
        return;
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError("Please enter total amount first");
        return;
      }

      calculatedAmount =
        (parseFloat(formData.amount) * parseFloat(newInstallment.percentage)) /
        100;
    } else {
      if (!newInstallment.amount) {
        setError("Please enter amount");
        return;
      }
      calculatedAmount = parseFloat(newInstallment.amount);
    }

    const newInst = {
      installmentNumber: installments.length + 1,
      amount: calculatedAmount,
      classdate: newInstallment.classdate,
      percentage: newInstallment.percentage,
    };

    setInstallments([...installments, newInst]);
    setNewInstallment({
      installmentNumber: installments.length + 2,
      amount: "",
      classdate: "",
      percentage: "",
    });
    setError("");
  };

  const handleDeleteInstallment = (index) => {
    const updated = installments.filter((_, i) => i !== index);
    setInstallments(updated);
  };

  const validateForm = () => {
    if (!formData.regno) {
      setError("Please select a student");
      return false;
    }
    if (!formData.feeitem) {
      setError("Please enter fee item");
      return false;
    }
    if (!formData.feecategory) {
      setError("Please enter fee category");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter valid amount");
      return false;
    }

    if (formData.installmentType === "installment" && installments.length === 0) {
      setError("Please add at least one installment");
      return false;
    }

    if (formData.installmentType === "installment") {
      const totalInstallmentAmount = installments.reduce(
        (sum, inst) => sum + inst.amount,
        0
      );
      if (Math.abs(totalInstallmentAmount - parseFloat(formData.amount)) > 0.01) {
        setError(
          `Total installment amount (₹${totalInstallmentAmount.toFixed(2)}) doesn't match total amount (₹${parseFloat(formData.amount).toFixed(2)})`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        colid: global1.colid,
        name: global1.name,
        user: global1.user,
        regno: formData.regno,
        studentname: formData.studentname,
        feeitem: formData.feeitem,
        feecategory: formData.feecategory,
        amount: parseFloat(formData.amount),
        type: formData.type,
        semester: formData.semester,
        academicyear: formData.academicyear,
        comments: formData.comments,
        installments:
          formData.installmentType === "installment" ? installments : [],
      };

      await ep1.post("/api/v2/addledgerds", payload);

      setSuccessMessage("Ledger entry added successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error adding ledger:", err);
      setError(err.response?.data?.message || "Failed to add ledger entry");
    } finally {
      setLoading(false);
    }
  };

  const totalInstallmentAmount = installments.reduce(
    (sum, inst) => sum + inst.amount,
    0
  );

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
        Add Student Ledger Entry
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Student Selection */}
        <StyledCard>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Student Information
            </Typography>
            <Autocomplete
              options={students}
              getOptionLabel={(option) => `${option.name} (${option.regno})`}
              onInputChange={(e, value) => setSearchStudent(value)}
              onChange={(e, value) => value && handleStudentSelect(value)}
              loading={loadingStudents}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Student"
                  placeholder="Name or Registration Number"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingStudents ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {formData.regno && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Selected: <strong>{formData.studentname}</strong> (
                {formData.regno})
              </Alert>
            )}
          </CardContent>
        </StyledCard>

        {/* Fee Information */}
        <StyledCard>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Fee Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fee Item"
                  name="feeitem"
                  value={formData.feeitem}
                  onChange={handleInputChange}
                  size="small"
                  placeholder="e.g., Tuition Fee"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fee Category"
                  name="feecategory"
                  value={formData.feecategory}
                  onChange={handleInputChange}
                  size="small"
                  placeholder="e.g., Semester Fee"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  size="small"
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  size="small"
                >
                  <MenuItem value="positive">Payable (Due)</MenuItem>
                  <MenuItem value="negative">Payment (Paid)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  name="academicyear"
                  value={formData.academicyear}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Installment Options */}
        <StyledCard>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Payment Mode
            </Typography>
            <RadioGroup
              row
              value={formData.installmentType}
              onChange={(e) =>
                setFormData({ ...formData, installmentType: e.target.value })
              }
            >
              <FormControlLabel
                value="single"
                control={<Radio />}
                label="Single Payment"
              />
              <FormControlLabel
                value="installment"
                control={<Radio />}
                label="Installment"
              />
            </RadioGroup>
          </CardContent>
        </StyledCard>

        {/* Installments */}
        {formData.installmentType === "installment" && (
          <StyledCard>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Add Installments
              </Typography>

              {/* Installment Mode Selection */}
              <Box sx={{ mb: 2 }}>
                <RadioGroup
                  row
                  value={installmentMode}
                  onChange={(e) => setInstallmentMode(e.target.value)}
                >
                  <FormControlLabel
                    value="amount"
                    control={<Radio />}
                    label="Add by Amount"
                  />
                  <FormControlLabel
                    value="percentage"
                    control={<Radio />}
                    label="Add by Percentage"
                  />
                </RadioGroup>
              </Box>

              {/* Add Installment Form */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {installmentMode === "percentage" && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Percentage (%)"
                      type="number"
                      value={newInstallment.percentage}
                      onChange={(e) =>
                        setNewInstallment({
                          ...newInstallment,
                          percentage: e.target.value,
                        })
                      }
                      size="small"
                      inputProps={{ step: "0.01", min: "0", max: "100" }}
                      helperText={
                        formData.amount
                          ? `₹${(
                              (parseFloat(formData.amount) *
                                parseFloat(newInstallment.percentage || 0)) /
                              100
                            ).toFixed(2)} will be added`
                          : ""
                      }
                    />
                  </Grid>
                )}

                {installmentMode === "amount" && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={newInstallment.amount}
                      onChange={(e) =>
                        setNewInstallment({
                          ...newInstallment,
                          amount: e.target.value,
                        })
                      }
                      size="small"
                      inputProps={{ step: "0.01", min: "0" }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Class Date (Due Date)"
                    type="date"
                    value={newInstallment.classdate}
                    onChange={(e) =>
                      setNewInstallment({
                        ...newInstallment,
                        classdate: e.target.value,
                      })
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleAddInstallment}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontWeight: 600,
                    }}
                  >
                    Add Installment
                  </Button>
                </Grid>
              </Grid>

              {/* Installments Table */}
              {installments.length > 0 && (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Installment #
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Amount
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Class Date
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {installments.map((inst, index) => (
                          <TableRow key={index}>
                            <TableCell>{inst.installmentNumber}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              ₹{inst.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {new Date(inst.classdate).toLocaleDateString(
                                "en-IN"
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteInstallment(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Total Installment Amount:{" "}
                    <strong>₹{totalInstallmentAmount.toFixed(2)}</strong> / Total
                    Amount: <strong>₹{parseFloat(formData.amount || 0).toFixed(2)}</strong>
                  </Alert>
                </>
              )}
            </CardContent>
          </StyledCard>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            fontWeight: 600,
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Add Entry"}
        </Button>
      </DialogActions>
    </>
  );
}

export default AddLedgerFormds;
