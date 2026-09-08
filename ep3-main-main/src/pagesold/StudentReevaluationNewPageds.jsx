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
  Checkbox,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

function StudentReevaluationNewPageds() {
  const [searchParams, setSearchParams] = useState({
    regno: global1.regno || "",
    program: "",
    branch: "",
    regulation: "",
    semester: "",
    year: "",
  });
  const [allPapers, setAllPapers] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    programs: [],
    branches: [],
    regulations: [],
    semesters: [],
    years: [],
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchMyApplications();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const res = await ep1.get("/api/v2/reevaluation/getfilteroptionsds");
      setFilterOptions({
        programs: res.data.programs || [],
        branches: res.data.branches || [],
        regulations: res.data.regulations || [],
        semesters: res.data.semesters || [],
        years: res.data.years || [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearchPapers = async () => {
    if (!searchParams.regno || !searchParams.program || !searchParams.year || !searchParams.semester) {
      setError("Please fill all required fields");
      return;
    }
    try {
      const res = await ep1.get("/api/v2/reevaluation/getallpapersforstudentds", {
        params: searchParams,
      });
      setAllPapers(res.data);
      setError("");
      setSelectedPapers([]);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching papers");
    }
  };

  const handleSelectPaper = (paper) => {
    const isSelected = selectedPapers.find(p => p.papercode === paper.papercode);
    if (isSelected) {
      setSelectedPapers(selectedPapers.filter(p => p.papercode !== paper.papercode));
    } else {
      if (selectedPapers.length >= 2) {
        setError("You can select maximum 2 papers only");
        return;
      }
      setSelectedPapers([...selectedPapers, paper]);
      setError("");
    }
  };

  const handleApplyReevaluation = async () => {
    if (selectedPapers.length === 0) {
      setError("Please select at least one paper");
      return;
    }
    try {
      const applicationData = {
        name: global1.name,
        user: global1.user,
        colid: Number(global1.colid),
        student: global1.student || global1.name,
        regno: searchParams.regno,
        papers: selectedPapers.map(paper => ({
          program: searchParams.program,
          examcode: paper.examcode,
          month: paper.month,
          year: searchParams.year,
          regulation: searchParams.regulation,
          semester: searchParams.semester,
          branch: searchParams.branch,
          papercode: paper.papercode,
          papername: paper.papername,
          originalmarks: paper.thobtained,
          maxmarks: paper.thmax,
        })),
      };
      await ep1.post("/api/v2/reevaluation/applyreevaluationds", applicationData);
      setSuccess("Reevaluation application submitted successfully!");
      setError("");
      setSelectedPapers([]);
      setAllPapers([]);
      fetchMyApplications();
    } catch (err) {
      setError(err.response?.data?.error || "Error applying for reevaluation");
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await ep1.get("/api/v2/reevaluation/getmyapplicationsds", {
        params: { regno: global1.regno },
      });
      setMyApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "allocated":
        return "info";
      case "evaluating":
        return "secondary";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Reevaluation Application (New Process)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Papers (Select up to 2 papers)
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
            <TextField
              label="Registration Number"
              name="regno"
              value={searchParams.regno}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Program"
              name="program"
              value={searchParams.program}
              onChange={handleChange}
              fullWidth
              required
            >
              {filterOptions.programs.map((prog) => (
                <MenuItem key={prog} value={prog}>
                  {prog}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Branch"
              name="branch"
              value={searchParams.branch}
              onChange={handleChange}
              fullWidth
              required
            >
              {filterOptions.branches.map((br) => (
                <MenuItem key={br} value={br}>
                  {br}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Regulation"
              name="regulation"
              value={searchParams.regulation}
              onChange={handleChange}
              fullWidth
              required
            >
              {filterOptions.regulations.map((reg) => (
                <MenuItem key={reg} value={reg}>
                  {reg}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Semester"
              name="semester"
              value={searchParams.semester}
              onChange={handleChange}
              fullWidth
              required
            >
              {filterOptions.semesters.map((sem) => (
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
              fullWidth
              required
            >
              {filterOptions.years.map((yr) => (
                <MenuItem key={yr} value={yr}>
                  {yr}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchPapers}
            sx={{ mt: 2 }}
          >
            Search Papers
          </Button>
        </CardContent>
      </Card>

      {allPapers.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Available Papers (Select Maximum 2)
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Selected: {selectedPapers.length} / 2
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Select</TableCell>
                    <TableCell>Paper Code</TableCell>
                    <TableCell>Paper Name</TableCell>
                    <TableCell>Theory Marks (Obtained/Max)</TableCell>
                    <TableCell>Theory %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allPapers.map((paper, index) => {
                    const isSelected = selectedPapers.find(p => p.papercode === paper.papercode);
                    const theoryPercentage = paper.thmax > 0
                      ? ((paper.thobtained / paper.thmax) * 100).toFixed(2)
                      : "N/A";
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox
                            checked={!!isSelected}
                            onChange={() => handleSelectPaper(paper)}
                            disabled={!isSelected && selectedPapers.length >= 2}
                          />
                        </TableCell>
                        <TableCell>{paper.papercode}</TableCell>
                        <TableCell>{paper.papername}</TableCell>
                        <TableCell>
                          {paper.thobtained} / {paper.thmax}
                        </TableCell>
                        <TableCell>{theoryPercentage}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              color="success"
              onClick={handleApplyReevaluation}
              disabled={selectedPapers.length === 0}
              sx={{ mt: 2 }}
            >
              Apply for Reevaluation
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Reevaluation Applications
          </Typography>
          {myApplications.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No applications found
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Paper Code</TableCell>
                    <TableCell>Paper Name</TableCell>
                    <TableCell>Original Marks</TableCell>
                    <TableCell>Max Marks</TableCell>
                    <TableCell>Examiner 1 Marks</TableCell>
                    <TableCell>Examiner 2 Marks</TableCell>
                    <TableCell>Examiner 3 Marks</TableCell>
                    <TableCell>Final Marks</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied Date</TableCell>
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
                      <TableCell>{app.finalmarks || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={app.examiner1status || "Pending"}
                          color={getStatusColor(app.examiner1status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {app.applieddate
                          ? new Date(app.applieddate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default StudentReevaluationNewPageds;
