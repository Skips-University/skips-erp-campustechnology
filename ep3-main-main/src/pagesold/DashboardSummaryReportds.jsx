import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function DashboardSummaryReportds() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await ep1.get("/api/v2/dashboardsummaryds", {
        params: { colid: global1.colid },
      });
      setSummary(response.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching dashboard summary");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (global1.colid) {
      fetchSummary();
    }
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Faculty Allocation Dashboard
      </Typography>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Records
              </Typography>
              <Typography variant="h4">
                {summary?.totalRecords || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Assigned Records
              </Typography>
              <Typography variant="h4" color="primary">
                {summary?.assignedRecords || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {summary?.assignmentRate?.toFixed(1) || 0}% Assignment Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Records
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary?.completedRecords || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {summary?.completionRate?.toFixed(1) || 0}% Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unassigned Records
              </Typography>
              <Typography variant="h4" color="error">
                {summary?.unassignedRecords || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unique Faculties
              </Typography>
              <Typography variant="h4">{summary?.uniqueFaculties || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unique Courses
              </Typography>
              <Typography variant="h4">{summary?.uniqueCourses || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained" onClick={fetchSummary}>
          Refresh Data
        </Button>
      </Box>
    </Box>
  );
}
