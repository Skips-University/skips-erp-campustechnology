import React, { useEffect, useState } from "react";
import ep1 from "../ep1";
import { Box, Typography, Paper, Grid } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#3f51b5", "#f50057", "#4caf50", "#ff9800", "#9c27b0"];

const ChartBox = ({ title, children, summary }) => (
  <Paper sx={{ p: 2, m: 1, flex: 1, minWidth: 300 }} elevation={3}>
    <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
    <ResponsiveContainer width="100%" height={250}>{children}</ResponsiveContainer>
    {summary && <Typography variant="body2" align="center" mt={2}>{summary}</Typography>}
  </Paper>
);

const getTotalCount = (data) => data.reduce((sum, item) => sum + item.count, 0);

const DashboardReports = () => {
  const [programData, setProgramData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [genderData, setGenderData] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [prog, sem, dept, gender] = await Promise.all([
          ep1.get("/api/v2/reports/program"),
          ep1.get("/api/v2/reports/semester"),
          ep1.get("/api/v2/reports/department"),
          ep1.get("/api/v2/reports/gender"),
        ]);

        setProgramData(Array.isArray(prog.data) ? prog.data : []);
        setSemesterData(Array.isArray(sem.data) ? sem.data : []);
        setDepartmentData(Array.isArray(dept.data) ? dept.data : []);
        setGenderData(Array.isArray(gender.data) ? gender.data : []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3} align="center">User Reports Dashboard</Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <ChartBox title="Users by Program" summary={`Total: ${getTotalCount(programData)}`}> 
            <PieChart>
              <Pie data={programData} dataKey="count" nameKey="_id" outerRadius={80}>
                {programData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartBox>
        </Grid>

        <Grid item>
          <ChartBox title="Users by Semester" summary={`Total: ${getTotalCount(semesterData)}`}>
            <BarChart data={semesterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartBox>
        </Grid>

        <Grid item>
          <ChartBox title="Users by Department" summary={`Total: ${getTotalCount(departmentData)}`}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartBox>
        </Grid>

        <Grid item>
          <ChartBox title="Students by Gender" summary={`Total: ${getTotalCount(genderData)}`}>
            <PieChart>
              <Pie data={genderData} dataKey="count" nameKey="_id" outerRadius={80}>
                {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartBox>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardReports;
