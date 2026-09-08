import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Stack,
  Box
} from "@mui/material";
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";

const ScholarshipAdminDS = () => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedScholarship, setSelectedScholarship] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");

  useEffect(() => {
    ep1
      .get(`/api/v2/getallscholarshipds?colid=${global1.colid}`)
      .then((res) => setScholarships(res.data.scholarships || []));
    ep1
      .get(`/api/v2/getscholarshipapplicationds?colid=${global1.colid}`)
      .then((res) => setApplications(res.data.applications || []));
  }, []);

  useEffect(() => {
    if (selectedScholarship) {
      ep1
        .get("/api/v2/getscholarshipapplicationds", {
          params: { scholarshipname: selectedScholarship, colid: global1.colid },
        })
        .then((res) => setApplications(res.data.applications || []));
    }
  }, [selectedScholarship]);

  const handleAction = async (id, status) => {
    try {
      const res = await ep1.post("/api/v2/updatescholarshipapplicationds", {
        applicationId: id,
        status,
      });
      setMsg(res.data.success ? "Status updated" : res.data.message);
      setMsgType(res.data.success ? "success" : "error");
      // Refresh list after update
      const refresh = await ep1.get("/api/v2/getscholarshipapplicationds", {
        params: selectedScholarship ? { scholarshipname: selectedScholarship, colid: global1.colid } : { colid: global1.colid },
      });
      setApplications(refresh.data.applications || []);
    } catch {
      setMsgType("error");
      setMsg("Error updating status");
    }
  };

  return (
    <Container maxWidth="100%" sx={{ pt: 6 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      startIcon={<ArrowBack />}
                      onClick={() => navigate("/dashdashfacnew")}
                    >
                      Back
                    </Button>
                  </Box>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Scholarship Applications – Admin
        </Typography>
        {msg && (
          <Alert severity={msgType} sx={{ mb: 2 }}>
            {msg}
          </Alert>
        )}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel></InputLabel>
          <Select
            value={selectedScholarship}
            onChange={(e) => setSelectedScholarship(e.target.value)}
            label=""
            displayEmpty
          >
            <MenuItem value="">All Scholarships</MenuItem>
            {scholarships.map((s) => (
              <MenuItem key={s._id} value={s.scholarshipname}>
                {s.scholarshipname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id}>
                <TableCell>{app.applicantname}</TableCell>
                <TableCell>{app.applicantemail}</TableCell>
                <TableCell>{app.program}</TableCell>
                <TableCell>{app.category}</TableCell>
                <TableCell>{app.status}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      disabled={app.status === "approved"}
                      onClick={() => handleAction(app._id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={app.status === "rejected"}
                      onClick={() => handleAction(app._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ScholarshipAdminDS;
