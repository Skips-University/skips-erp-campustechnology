import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Box,
  Stack,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const STATUS_LIST = [
  "Applied",
  "Shortlisted",
  "Interviewed",
  "Selected",
  "Rejected",
];

const InternalApplicationStatusPage = () => {
  const { jobid } = useParams();
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const res = await ep1.get("/api/v2/getapplicationsgrouped", {
        params: {
          colid: global1.colid,
          jobid: jobid,
        },
      });
      setApplications(res.data);
    } catch (err) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message || "Fetch failed",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getChipColor = (status) => {
    switch (status) {
      case "Selected":
        return "success";
      case "Rejected":
        return "error";
      case "Interviewed":
        return "info";
      case "Shortlisted":
        return "warning";
      default:
        return "default";
    }
  };

  const filtered = applications.filter(
    (app) => app.status === STATUS_LIST[tab]
  );

  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Applications for {global1.name}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {/* ---------- Tabs ---------- */}
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3 }}
      >
        {STATUS_LIST.map((label) => (
          <Tab
            key={label}
            label={`${label} (${applications.filter((a) => a.status === label).length})`}
          />
        ))}
      </Tabs>

      {/* ---------- Cards ---------- */}
      {!filtered.length && (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mt={5}
        >
          No applications with status: <strong>{STATUS_LIST[tab]}</strong>.
        </Typography>
      )}

      <Grid container spacing={3}>
        {filtered.map((app) => (
          <Grid item xs={12} md={6} lg={4} key={app._id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {app.applicantname?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{app.jobtitle}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {app.applicantname}
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2">
                  Email: {app.applicantemail}
                </Typography>
                <Typography variant="body2" mt={1}>
                  Phone: {app.applicantphone}
                </Typography>
                <Typography variant="body2" mt={1}>
                  Status:{" "}
                  <Chip
                    label={app.status}
                    color={getChipColor(app.status)}
                    size="small"
                  />
                </Typography>

                <Box mt={2} textAlign="right">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/internal/applicationdetail/${app._id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default InternalApplicationStatusPage;
