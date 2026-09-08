import React, { useEffect, useState } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import ep1 from '../api/ep1';
import global1 from './global1';

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ p: 3 }}>{children}</Box>;
}

const CenteredCard = ({ children, sx = {} }) => (
  <Card
    sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 400,   // enough space for pie + legend
      ...sx,
    }}
  >
    <CardContent
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 2,
      }}
    >
      {children}
    </CardContent>
  </Card>
);

const Report2 = () => {
  const [tab, setTab] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [projectsYear, setProjectsYear] = useState([]);
  const [projectsMonth, setProjectsMonth] = useState([]);
  const [placementYear, setPlacementYear] = useState([]);
  const [byProgram, setByProgram] = useState([]);
  const [bySector, setBySector] = useState([]);
  const [topEmps, setTopEmps] = useState([]);
  const [salaryDist, setSalaryDist] = useState([]);
  const [perDept, setPerDept] = useState([]);
  const [perType, setPerType] = useState([]);
  const [fundsDist, setFundsDist] = useState([]);

  const colid = global1.colid;

  const loadProjectsByMonth = async (y) => {
    const res = await ep1.get('/api/v2/projectspermonth', { params: { colid, year: y } });
    setProjectsMonth(res.data);
  };

  const loadAll = async () => {
    const [
      py, pl, bp, bs, te, sd, pd, pt, fd,
    ] = await Promise.all([
      ep1.get('/api/v2/projectsperyear', { params: { colid } }),
      ep1.get('/api/v2/placementperyear', { params: { colid } }),
      ep1.get('/api/v2/placementsbyprogram', { params: { colid } }),
      ep1.get('/api/v2/placementbysector', { params: { colid } }),
      ep1.get('/api/v2/topemployers', { params: { colid } }),
      ep1.get('/api/v2/salarydistribution', { params: { colid } }),
      ep1.get('/api/v2/projectsperdept', { params: { colid } }),
      ep1.get('/api/v2/projectspertype', { params: { colid } }),
      ep1.get('/api/v2/projectfundist', { params: { colid } }),
    ]);
    setProjectsYear(py.data);
    setPlacementYear(pl.data);
    setByProgram(bp.data);
    setBySector(bs.data);
    setTopEmps(te.data);
    setSalaryDist(sd.data);
    setPerDept(pd.data);
    setPerType(pt.data);
    setFundsDist(fd.data);
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadProjectsByMonth(year); }, [year]);

  const yearOptions = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const toRows = (arr) =>
    arr.map((d, i) => ({ id: i, label: d._id, value: d.count }));
  const columns = [
    { field: 'label', headerName: 'Category', flex: 1 },
    { field: 'value', headerName: 'Count', width: 100 },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Reports Dashboard
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Projects" />
        <Tab label="Placements" />
      </Tabs>

      {/* ----------  PROJECTS TAB  ---------- */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3} alignItems="stretch">
          {/* Year selector */}
          <Grid item xs={12}>
            <FormControl sx={{ minWidth: 160, mb: 2 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={(e) => setYear(e.target.value)}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y.toString()}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6} lg={4}>
            <CenteredCard>
              <BarChart title="Projects Published per Year" data={projectsYear} x="_id" y="count" />
            </CenteredCard>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <CenteredCard>
              <BarChart
                title={`Projects per Month (${year})`}
                data={projectsMonth}
                x="_id"
                y="count"
              />
            </CenteredCard>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <CenteredCard>
              <Typography variant="h6" mb={1}>
                Funds Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                <PieChart data={fundsDist} x="_id" y="count" />
              </Box>
            </CenteredCard>
          </Grid>

          {/* Tables */}
          <Grid item xs={12} md={6} lg={6}>
            <CenteredCard>
              <Typography variant="h6" mb={1}>
                Projects by Department
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                <DataGrid rows={toRows(perDept)} columns={columns} hideFooter />
              </Box>
            </CenteredCard>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <CenteredCard>
              <Typography variant="h6" mb={1}>
                Projects by Type
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                <DataGrid rows={toRows(perType)} columns={columns} hideFooter />
              </Box>
            </CenteredCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ----------  PLACEMENTS TAB  ---------- */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={6} lg={4}>
            <CenteredCard>
              <BarChart title="Placements per Year" data={placementYear} x="_id" y="count" />
            </CenteredCard>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <CenteredCard>
              <BarChart title="Placements by Program" data={byProgram} x="_id" y="count" />
            </CenteredCard>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <CenteredCard>
              <Typography variant="h6" mb={1}>
                Sector Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 260 }}>
                <PieChart data={bySector} x="_id" y="count" />
              </Box>
            </CenteredCard>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <CenteredCard>
              <BarChart title="Top 10 Employers" data={topEmps} x="_id" y="count" />
            </CenteredCard>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <CenteredCard>
              <BarChart title="Salary Bands (LPA)" data={salaryDist} x="_id" y="count" />
            </CenteredCard>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default Report2;