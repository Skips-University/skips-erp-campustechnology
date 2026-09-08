import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  MenuItem,
  Alert,
  Chip,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function ReevaluationApplicationPageds() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    regno: global1.regno || "",
    program: "",
    branch: "",
    regulation: "",
    semester: "",
    year: "",
  });

  const [failedPapers, setFailedPapers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearchFailedPapers = async () => {
    if (!searchParams.regno || !searchParams.program || !searchParams.branch) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const res = await ep1.get("/api/v2/reevaluation/failed-papersds", {
        params: searchParams,
      });
      setFailedPapers(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching failed papers");
    }
  };

  const handleApplyReevaluation = async (paper) => {
    try {
      // Send application with colid as Number
      const applicationData = {
        name: global1.name,
        user: global1.user,
        colid: Number(global1.colid), // Ensure colid is Number
        student: paper.student,
        regno: paper.regno,
        program: paper.program,
        examcode: paper.examcode,
        month: paper.month,
        year: paper.year,
        regulation: paper.regulation,
        semester: paper.semester,
        branch: paper.branch,
        papercode: paper.papercode,
        papername: paper.papername,
      };

      const res = await ep1.post("/api/v2/reevaluation/applyds", applicationData);
      setSuccess("Reevaluation application submitted successfully!");
      setError("");
      fetchMyApplications();
    } catch (err) {
      setError(err.response?.data?.error || "Error applying for reevaluation");
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await ep1.get("/api/v2/reevaluation/listds", {
        params: { regno: global1.regno },
      });
      setMyApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "stage1":
        return "info";
      case "stage2":
        return "secondary";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                          <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate("/dashboardreevalds")}
                          >
                            Back
                          </Button>
                          <Typography variant="h4" gutterBottom>
        Reevaluation Application (Theory Papers Only)
      </Typography>
                        </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Failed Theory Papers (Below 35%)
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <TextField
              label="Registration No"
              name="regno"
              value={searchParams.regno}
              onChange={handleChange}
              required
            />
            <TextField
              label="Program"
              name="program"
              value={searchParams.program}
              onChange={handleChange}
              required
            />
            <TextField
              label="Branch"
              name="branch"
              value={searchParams.branch}
              onChange={handleChange}
            />
            <TextField
              label="Regulation"
              name="regulation"
              value={searchParams.regulation}
              onChange={handleChange}
            />
            <TextField
              select
              label="Semester"
              name="semester"
              value={searchParams.semester}
              onChange={handleChange}
              sx={{ minWidth: 120 }}
            >
              {semesters.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Year"
              name="year"
              value={searchParams.year}
              onChange={handleChange}
              sx={{ minWidth: 120 }}
            >
              {years.map((yr) => (
                <MenuItem key={yr} value={yr}>
                  {yr}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={handleSearchFailedPapers}>
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {failedPapers.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              Failed Theory Papers (Below 35%)
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Paper Code</strong></TableCell>
                  <TableCell><strong>Paper Name</strong></TableCell>
                  <TableCell><strong>Theory Marks (Obtained/Max)</strong></TableCell>
                  <TableCell><strong>Theory %</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedPapers.map((paper, index) => {
                  const theoryPercentage = paper.theoryPercentage 
                    ? paper.theoryPercentage.toFixed(2) 
                    : ((paper.thobtained / paper.thmax) * 100).toFixed(2);
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{paper.papercode}</TableCell>
                      <TableCell>{paper.papername}</TableCell>
                      <TableCell>
                        {paper.thobtained} / {paper.thmax}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${theoryPercentage}%`} 
                          color="error" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleApplyReevaluation(paper)}
                        >
                          Apply
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Reevaluation Applications
          </Typography>
          {myApplications.length === 0 ? (
            <Typography>No applications found</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Paper Code</strong></TableCell>
                  <TableCell><strong>Paper Name</strong></TableCell>
                  <TableCell><strong>Original Theory Marks</strong></TableCell>
                  <TableCell><strong>Max Marks</strong></TableCell>
                  <TableCell><strong>Examiner 1</strong></TableCell>
                  <TableCell><strong>Examiner 2</strong></TableCell>
                  <TableCell><strong>Examiner 3</strong></TableCell>
                  <TableCell><strong>Final Marks</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Applied Date</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myApplications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>{app.papercode}</TableCell>
                    <TableCell>{app.papername}</TableCell>
                    <TableCell>{app.originalmarks}</TableCell>
                    <TableCell>{app.maxmarks}</TableCell>
                    <TableCell>{app.examiner1marks || "-"}</TableCell>
                    <TableCell>{app.examiner2marks || "-"}</TableCell>
                    <TableCell>{app.examiner3marks || "-"}</TableCell>
                    <TableCell>
                      {app.finalmarks ? app.finalmarks : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={app.status} 
                        color={getStatusColor(app.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(app.applieddate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ReevaluationApplicationPageds;
