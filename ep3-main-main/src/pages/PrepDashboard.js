import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, MenuItem, Paper, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function PrepDashboard() {
  const academicYearOptions = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [status, setStatus] = useState("");
  const [statusOptions, setStatusOptions] = useState([]);
  const [institution, setInstitution] = useState(null);
  const navigate = useNavigate();

  const filterQuery = (department = selectedDepartment, year = academicYear, statusValue = status) => {
    const params = new URLSearchParams();
    params.set("colid", global1.colid);
    if (year) params.set("academicyear", year);
    if (statusValue) params.set("status", statusValue);
    if (department) params.set("department", department);
    return params.toString();
  };

  const fetchData = (year = academicYear, statusValue = status) => {
    ep1
      .get(`/prep/dept-summary?${filterQuery("", year, statusValue)}`)
      .then((res) => setData(res.data));
  };

  const fetchDepartmentDetails = (department) => {
    setSelectedDepartment(department);

    ep1
      .get(`/prep/dept-items?${filterQuery(department)}`)
      .then((res) => setItems(res.data));

    ep1
      .get(`/prep/category-summary?${filterQuery(department)}`)
      .then((res) => setCategoryData(res.data));
  };

  useEffect(() => {
    fetchData();
    ep1
      .get(`/prep/status-options?colid=${global1.colid}&academicyear=${encodeURIComponent(academicYear)}`)
      .then((res) => setStatusOptions(Array.isArray(res.data) ? res.data : []));
    ep1
      .get(`/api/institution?colid=${global1.colid}`)
      .then((res) => setInstitution(Array.isArray(res.data) ? res.data[0] : res.data))
      .catch(() => setInstitution(null));
  }, [academicYear, status]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentDetails(selectedDepartment);
    } else {
      setItems([]);
      setCategoryData([]);
    }
  }, [academicYear, status]);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { field: "_id", headerName: "Department", flex: 1 },
    { field: "totalBudget", headerName: "Budget", flex: 1 },
    { field: "totalQty", headerName: "Qty", flex: 1 }
  ];

  const detailColumns = [
    { field: "academicyear", headerName: "Academic Year", flex: 1, minWidth: 140 },
    { field: "itemname", headerName: "Item", flex: 1, minWidth: 160 },
    { field: "quantity", headerName: "Qty", flex: 1, minWidth: 100 },
    { field: "price", headerName: "Price", flex: 1, minWidth: 120 },
    { field: "status", headerName: "Status", flex: 1, minWidth: 160 }
  ];

  const filteredRows = data
    .filter((d) => d._id?.toLowerCase().includes(search.toLowerCase()))
    .map((d, i) => ({ id: i, ...d }));

  return (
    <Grid container spacing={2} p={2} sx={{
      "@media print": {
        "& .no-print": { display: "none !important" },
        "& .print-preview": {
          display: "block !important",
          boxShadow: "none",
          border: "none",
          p: 0
        }
      }
    }}>
      <Grid item xs={12}>
        <Box className="no-print" display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Budget analysis</Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashdashfacnew")}
          >
            Back
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12} md={4} className="no-print">
        <TextField
          select
          fullWidth
          label="Academic Year"
          value={academicYear}
          onChange={(e) => {
            const nextYear = e.target.value;
            setAcademicYear(nextYear);
            setSelectedDepartment("");
            fetchData(nextYear, status);
          }}
        >
          {academicYearOptions.map((year) => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={4} className="no-print">
        <TextField
          select
          fullWidth
          label="Status"
          value={status}
          onChange={(e) => {
            const nextStatus = e.target.value;
            setStatus(nextStatus);
            setSelectedDepartment("");
            fetchData(academicYear, nextStatus);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {statusOptions.map((item) => (
            <MenuItem key={item} value={item}>{item}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={4} className="no-print">
        <TextField
          fullWidth
          label="Search Department"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Grid>

      <Grid item xs={12} className="no-print">
        <Button variant="contained" onClick={handlePrint}>
          Print Preview
        </Button>
      </Grid>

      <Grid item xs={12} md={6} className="no-print">
        <Paper sx={{ height: 400 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            onRowClick={(params) => fetchDepartmentDetails(params.row._id)}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} className="no-print">
        <Paper sx={{ height: 400, p: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredRows}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalBudget" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {selectedDepartment && (
        <Grid item xs={12} className="no-print">
          <Typography variant="h6" sx={{ mt: 2 }}>
            {selectedDepartment}
          </Typography>
        </Grid>
      )}

      {selectedDepartment && (
        <Grid item xs={12} md={7} className="no-print">
          <Paper sx={{ height: 450 }}>
            <DataGrid
              rows={items.map((d) => ({ id: d._id, ...d }))}
              columns={detailColumns}
              slots={{ toolbar: GridToolbar }}
            />
          </Paper>
        </Grid>
      )}

      {selectedDepartment && (
        <Grid item xs={12} md={5} className="no-print">
          <Paper sx={{ height: 450, p: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="_id"
                  outerRadius={120}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper className="print-preview" sx={{ p: 3, mt: 2, border: "1px solid #ddd" }}>
          <Box textAlign="center" mb={2}>
            {institution?.logolink && (
              <Box
                component="img"
                src={institution.logolink}
                alt="Institution logo"
                sx={{ maxHeight: 72, maxWidth: 150, objectFit: "contain", mb: 1 }}
              />
            )}
            <Typography variant="h6" fontWeight={900}>
              {institution?.institutionname || global1.insname || "Institution"}
            </Typography>
            <Typography variant="body2">{institution?.address || ""}</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>
              Budget Analysis
            </Typography>
            <Typography variant="body2">
              Academic Year: {academicYear || "All"} | Status: {status || "All"}
              {selectedDepartment ? ` | Department: ${selectedDepartment}` : ""}
            </Typography>
          </Box>

          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
            Department Summary
          </Typography>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", mb: 3 }}>
            <Box component="thead">
              <Box component="tr">
                {["Department", "Budget", "Qty"].map((header) => (
                  <Box component="th" key={header} sx={{ border: "1px solid #ccc", p: 1, textAlign: "left", bgcolor: "#f5f5f5" }}>
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {filteredRows.map((row) => (
                <Box component="tr" key={row.id}>
                  <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{row._id || "-"}</Box>
                  <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{row.totalBudget || 0}</Box>
                  <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{row.totalQty || 0}</Box>
                </Box>
              ))}
            </Box>
          </Box>

          {selectedDepartment && (
            <>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                Department Details
              </Typography>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <Box component="thead">
                  <Box component="tr">
                    {["Academic Year", "Store", "Category", "Item", "Qty", "Price", "Status"].map((header) => (
                      <Box component="th" key={header} sx={{ border: "1px solid #ccc", p: 1, textAlign: "left", bgcolor: "#f5f5f5" }}>
                        {header}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {items.map((item) => (
                    <Box component="tr" key={item._id}>
                      <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{item.academicyear || "-"}</Box>
                      <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{item.storeid?.storename || "-"}</Box>
                      <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{item.categoryid?.categoryname || "-"}</Box>
                      <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{item.itemname || "-"}</Box>
                      <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{item.quantity || 0}</Box>
                      <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{item.price || 0}</Box>
                      <Box component="td" sx={{ border: "1px solid #ccc", p: 1 }}>{item.status || "-"}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
