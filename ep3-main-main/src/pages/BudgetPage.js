import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ep1 from "../api/ep1";
import global1 from "./global1";

const chartColors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2", "#ca8a04", "#be123c"];
const academicYearOptions = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];

const amount = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const rowId = (row) => row._id;
const storeName = (row) => row.storeid?.storename || "";
const categoryName = (row) => row.categoryid?.categoryname || "";
const compactDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "");

export default function BudgetPage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [approvalRows, setApprovalRows] = useState([]);
  const [submittedRows, setSubmittedRows] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [workForm, setWorkForm] = useState({
    storeid: "",
    categoryid: "",
    itemname: "",
    quantity: "",
    price: "",
    remarks: ""
  });

  const [form, setForm] = useState({
    academicyear: "2026-27",
    storeid: "",
    categoryid: "",
    itemname: "",
    quantity: "",
    price: ""
  });

  const colid = global1.colid;
  const role = global1.role;
  const navigate = useNavigate();

  const actorPayload = () => ({
    username: global1.name,
    useremail: global1.user,
    userdepartment: global1.department
  });

  useEffect(() => {
    loadMasters();
    loadApprovalBudgets();
    loadSubmittedBudgets(form.academicyear);
    loadInstitution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMasters = async () => {
    try {
      const [storeRes, categoryRes] = await Promise.all([
        ep1.get(`/indstore?colid=${colid}`),
        ep1.get(`/indcategory?colid=${colid}`)
      ]);
      setStores(storeRes.data || []);
      setCategories(categoryRes.data || []);
    } catch (err) {
      setError("Unable to load store or category master.");
    }
  };

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadApprovalBudgets = async () => {
    try {
      const res = await ep1.get(`/indbudget?colid=${colid}&role=${encodeURIComponent(role || "")}`);
      setApprovalRows(res.data || []);
    } catch (err) {
      setError("Unable to load pending budget entries.");
    }
  };

  const loadSubmittedBudgets = async (academicyear = form.academicyear) => {
    try {
      const res = await ep1.get(
        `/indbudget?colid=${colid}&academicyear=${encodeURIComponent(academicyear || "")}&useremail=${encodeURIComponent(global1.user || "")}`
      );
      setSubmittedRows(res.data || []);
    } catch (err) {
      setError("Unable to load submitted budget entries.");
    }
  };

  const saveBudget = async () => {
    if (!form.academicyear || !form.storeid || !form.categoryid || !form.itemname || !form.quantity || !form.price) {
      setError("Please fill academic year, store, category, item, quantity and price.");
      return;
    }

    setError("");
    await ep1.post("/indbudget", {
      ...form,
      colid,
      department: global1.department,
      institution: global1.insname,
      ...actorPayload(),
      quantityremaining: form.quantity,
      priceremaining: form.price
    });

    setMessage("Budget entry submitted.");
    setForm((current) => ({ ...current, categoryid: "", itemname: "", quantity: "", price: "" }));
    loadApprovalBudgets();
    loadSubmittedBudgets(form.academicyear);
    setTabValue(1);
  };

  const approve = async (id) => {
    await ep1.post(`/indbudget/approve/${id}`, { level: role, ...actorPayload() });
    loadApprovalBudgets();
    loadSubmittedBudgets(form.academicyear);
  };

  const reject = async (id) => {
    await ep1.post(`/indbudget/reject/${id}`, actorPayload());
    loadApprovalBudgets();
    loadSubmittedBudgets(form.academicyear);
  };

  const openEditBudget = (row) => {
    setSelectedBudget(row);
    setWorkForm({
      storeid: row.storeid?._id || row.storeid || "",
      categoryid: row.categoryid?._id || row.categoryid || "",
      itemname: row.itemname || "",
      quantity: row.quantity || "",
      price: row.price || "",
      remarks: row.remarks || ""
    });
    setEditOpen(true);
  };

  const openAddBudgetItem = (row) => {
    setSelectedBudget(row);
    setWorkForm({
      storeid: row.storeid?._id || row.storeid || "",
      categoryid: row.categoryid?._id || row.categoryid || "",
      itemname: "",
      quantity: "",
      price: "",
      remarks: ""
    });
    setAddOpen(true);
  };

  const saveEditBudget = async () => {
    if (!selectedBudget?._id) return;
    if (!workForm.storeid || !workForm.categoryid || !workForm.itemname || !workForm.quantity || !workForm.price) {
      setError("Please fill store, category, item, quantity and amount.");
      return;
    }

    await ep1.post(`/indbudget/update/${selectedBudget._id}`, {
      ...workForm,
      level: role,
      ...actorPayload(),
      quantityremaining: workForm.quantity,
      priceremaining: workForm.price
    });
    setEditOpen(false);
    setSelectedBudget(null);
    setMessage("Budget item updated.");
    loadApprovalBudgets();
    loadSubmittedBudgets(form.academicyear);
  };

  const saveAddedBudgetItem = async () => {
    if (!selectedBudget?._id) return;
    if (!workForm.storeid || !workForm.categoryid || !workForm.itemname || !workForm.quantity || !workForm.price) {
      setError("Please fill store, category, item, quantity and amount.");
      return;
    }

    await ep1.post("/indbudget/approval-add", {
      ...workForm,
      sourcebudgetid: selectedBudget._id,
      level: role,
      ...actorPayload(),
      quantityremaining: workForm.quantity,
      priceremaining: workForm.price
    });
    setAddOpen(false);
    setSelectedBudget(null);
    setMessage("Budget item added at current approval level.");
    loadApprovalBudgets();
    loadSubmittedBudgets(form.academicyear);
  };

  const canApprove = (status) => status === `${role}_PENDING`;

  const statusColor = (status = "") => {
    if (status === "APPROVED") return "success";
    if (status === "REJECTED") return "error";
    return "warning";
  };

  const chartData = useMemo(() => {
    const grouped = submittedRows.reduce((acc, row) => {
      const key = categoryName(row) || "Uncategorized";
      if (!acc[key]) acc[key] = { category: key, count: 0, amount: 0 };
      acc[key].count += 1;
      acc[key].amount += Number(row.price || 0);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => b.amount - a.amount);
  }, [submittedRows]);

  const summary = useMemo(() => {
    const totalAmount = submittedRows.reduce((sum, row) => sum + Number(row.price || 0), 0);
    const approved = submittedRows.filter((row) => row.status === "APPROVED").length;
    const rejected = submittedRows.filter((row) => row.status === "REJECTED").length;
    return {
      count: submittedRows.length,
      amount: totalAmount,
      approved,
      rejected,
      pending: submittedRows.length - approved - rejected
    };
  }, [submittedRows]);

  const baseColumns = [
    { field: "store", headerName: "Store", minWidth: 150, flex: 1, valueGetter: (p) => storeName(p.row) },
    { field: "category", headerName: "Category", minWidth: 150, flex: 1, valueGetter: (p) => categoryName(p.row) },
    { field: "academicyear", headerName: "Academic Year", width: 130 },
    { field: "department", headerName: "Department", minWidth: 150, flex: 1 },
    { field: "itemname", headerName: "Item", minWidth: 170, flex: 1 },
    { field: "quantity", headerName: "Qty", width: 90, type: "number" },
    { field: "price", headerName: "Amount", width: 120, type: "number", valueFormatter: (p) => amount(p.value) },
    {
      field: "status",
      headerName: "Status",
      width: 170,
      renderCell: (params) => <Chip size="small" label={params.value || ""} color={statusColor(params.value)} variant="outlined" />
    }
  ];

  const approvalColumns = [
    ...baseColumns,
    {
      field: "edit",
      headerName: "Edit",
      width: 95,
      sortable: false,
      renderCell: (params) => canApprove(params.row.status) ? (
        <Button size="small" onClick={() => openEditBudget(params.row)}>Edit</Button>
      ) : null
    },
    {
      field: "additem",
      headerName: "Add Item",
      width: 115,
      sortable: false,
      renderCell: (params) => canApprove(params.row.status) && params.row.approverConfig?.canadditems ? (
        <Button size="small" onClick={() => openAddBudgetItem(params.row)}>Add</Button>
      ) : null
    },
    {
      field: "approve",
      headerName: "Approve",
      width: 120,
      sortable: false,
      renderCell: (params) => canApprove(params.row.status) ? (
        <Button size="small" onClick={() => approve(params.row._id)}>Approve</Button>
      ) : null
    },
    {
      field: "reject",
      headerName: "Reject",
      width: 110,
      sortable: false,
      renderCell: (params) => canApprove(params.row.status) ? (
        <Button size="small" color="error" onClick={() => reject(params.row._id)}>Reject</Button>
      ) : null
    }
  ];

  const submittedColumns = [
    ...baseColumns,
    { field: "createdAt", headerName: "Submitted On", width: 135, valueGetter: (p) => compactDate(p.row.createdAt) }
  ];

  const printStyle = `
    @media print {
      body * { visibility: hidden; }
      #budget-print-preview, #budget-print-preview * { visibility: visible; }
      #budget-print-preview { position: absolute; left: 0; top: 0; width: 100%; max-width: 100% !important; box-shadow: none !important; }
      .no-print { display: none !important; }
      @page { size: A4; margin: 10mm; }
    }
  `;

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <style>{printStyle}</style>

      <Paper className="no-print" elevation={0} sx={{ p: 3, mb: 2.5, borderRadius: 3, border: "1px solid #e5e7eb", background: "linear-gradient(135deg, #ffffff 0%, #eef6ff 100%)" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={900}>Budget management</Typography>
            <Typography color="text.secondary">Create entries, track submitted budgets, and review category-wise submissions.</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print Preview</Button>
          </Stack>
        </Stack>
      </Paper>

      {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert className="no-print" severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

      <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #dbeafe" }}>
            <CardContent>
              <Typography color="text.secondary" fontSize={13}>Submitted</Typography>
              <Typography variant="h4" fontWeight={900}>{summary.count}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #dcfce7" }}>
            <CardContent>
              <Typography color="text.secondary" fontSize={13}>Total Amount</Typography>
              <Typography variant="h4" fontWeight={900}>Rs. {amount(summary.amount)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #fef3c7" }}>
            <CardContent>
              <Typography color="text.secondary" fontSize={13}>Pending</Typography>
              <Typography variant="h4" fontWeight={900}>{summary.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #fee2e2" }}>
            <CardContent>
              <Typography color="text.secondary" fontSize={13}>Approved / Rejected</Typography>
              <Typography variant="h4" fontWeight={900}>{summary.approved} / {summary.rejected}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper className="no-print" elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden", mb: 2 }}>
        <Tabs value={tabValue} onChange={(event, value) => setTabValue(value)} sx={{ px: 2, bgcolor: "#fff" }}>
          <Tab label="New Entry" />
          <Tab label="Submitted" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Paper className="no-print" elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb", mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>New Entry</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField select label="Academic Year" fullWidth value={form.academicyear} onChange={(e) => {
                const academicyear = e.target.value;
                setForm({ ...form, academicyear });
                loadSubmittedBudgets(academicyear);
              }}>
                {academicYearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select label="Store" fullWidth value={form.storeid} onChange={(e) => setForm({ ...form, storeid: e.target.value })}>
                {stores.map((store) => <MenuItem key={store._id} value={store._id}>{store.storename}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select label="Category" fullWidth value={form.categoryid} onChange={(e) => setForm({ ...form, categoryid: e.target.value })}>
                {categories.map((category) => <MenuItem key={category._id} value={category._id}>{category.categoryname}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Item" fullWidth value={form.itemname} onChange={(e) => setForm({ ...form, itemname: e.target.value })} sx={{ "& .MuiInputBase-root": { minHeight: 56 } }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Qty" type="number" fullWidth value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Amount" type="number" fullWidth value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="contained" fullWidth startIcon={<SaveIcon />} sx={{ minHeight: 54 }} onClick={saveBudget}>Submit</Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {tabValue === 1 && (
        <>
          <Paper className="no-print" elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb", mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField select label="Academic Year" fullWidth value={form.academicyear} onChange={(e) => {
                  const academicyear = e.target.value;
                  setForm({ ...form, academicyear });
                  loadSubmittedBudgets(academicyear);
                }}>
                  {academicYearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography color="text.secondary">Submitted entries are filtered for the logged-in user and selected academic year.</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Grid className="no-print" container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2, height: 330, borderRadius: 3, border: "1px solid #e5e7eb" }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Categorywise Submission Count</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <PieChart>
                    <Pie data={chartData} dataKey="count" nameKey="category" outerRadius={95} label>
                      {chartData.map((entry, index) => <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 2, height: 330, borderRadius: 3, border: "1px solid #e5e7eb" }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Categorywise Amount</Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rs. ${amount(value)}`} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      <Paper className="no-print" elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", mb: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{tabValue === 0 ? "Pending Approval Entries" : "Submitted Entries"}</Typography>
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={tabValue === 0 ? approvalRows : submittedRows}
            columns={tabValue === 0 ? approvalColumns : submittedColumns}
            getRowId={rowId}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      <Paper id="budget-print-preview" elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: "#fff", color: "#111827", maxWidth: 900, mx: "auto" }}>
        <Stack spacing={1.5}>
          <Stack alignItems="center" textAlign="center" spacing={0.5}>
            {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ width: 64, height: 64, objectFit: "contain" }} />}
            <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
            <Typography variant="body2">{institution?.address || ""}</Typography>
            <Typography variant="subtitle1" fontWeight={900}>Budget Submissions Report</Typography>
            <Typography variant="body2">Academic Year: {form.academicyear} | User: {global1.name || global1.user}</Typography>
          </Stack>

          <Divider />

          <Grid container spacing={1}>
            <Grid item xs={3}><Typography fontWeight={800}>Submitted</Typography><Typography>{summary.count}</Typography></Grid>
            <Grid item xs={3}><Typography fontWeight={800}>Total Amount</Typography><Typography>Rs. {amount(summary.amount)}</Typography></Grid>
            <Grid item xs={3}><Typography fontWeight={800}>Approved</Typography><Typography>{summary.approved}</Typography></Grid>
            <Grid item xs={3}><Typography fontWeight={800}>Pending</Typography><Typography>{summary.pending}</Typography></Grid>
          </Grid>

          <Box sx={{ height: 220 }} className="no-print">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `Rs. ${amount(value)}`} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.6fr 0.6fr 0.9fr 1.2fr", bgcolor: "#eef2ff", fontWeight: 900, fontSize: 12, p: 1, borderRadius: 1 }}>
            <Box>Store</Box>
            <Box>Category</Box>
            <Box>Item</Box>
            <Box>Qty</Box>
            <Box>Amount</Box>
            <Box>Status</Box>
          </Box>
          {submittedRows.map((row, index) => (
            <Box key={row._id} sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.6fr 0.6fr 0.9fr 1.2fr", fontSize: 12, p: 1, bgcolor: index % 2 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e5e7eb" }}>
              <Box>{storeName(row)}</Box>
              <Box>{categoryName(row)}</Box>
              <Box>{row.itemname}</Box>
              <Box>{row.quantity}</Box>
              <Box>Rs. {amount(row.price)}</Box>
              <Box>{row.status}</Box>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Pending Budget Item</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField select label="Store" fullWidth value={workForm.storeid} onChange={(e) => setWorkForm({ ...workForm, storeid: e.target.value })}>
                {stores.map((store) => <MenuItem key={store._id} value={store._id}>{store.storename}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select label="Category" fullWidth value={workForm.categoryid} onChange={(e) => setWorkForm({ ...workForm, categoryid: e.target.value })}>
                {categories.map((category) => <MenuItem key={category._id} value={category._id}>{category.categoryname}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Item" fullWidth value={workForm.itemname} onChange={(e) => setWorkForm({ ...workForm, itemname: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Qty" type="number" fullWidth value={workForm.quantity} onChange={(e) => setWorkForm({ ...workForm, quantity: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Amount" type="number" fullWidth value={workForm.price} onChange={(e) => setWorkForm({ ...workForm, price: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Remarks" fullWidth value={workForm.remarks} onChange={(e) => setWorkForm({ ...workForm, remarks: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEditBudget}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Budget Item at Current Approval Level</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            This item will move to the next approval level directly, or become approved if this is the final level.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select label="Store" fullWidth value={workForm.storeid} onChange={(e) => setWorkForm({ ...workForm, storeid: e.target.value })}>
                {stores.map((store) => <MenuItem key={store._id} value={store._id}>{store.storename}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select label="Category" fullWidth value={workForm.categoryid} onChange={(e) => setWorkForm({ ...workForm, categoryid: e.target.value })}>
                {categories.map((category) => <MenuItem key={category._id} value={category._id}>{category.categoryname}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Item" fullWidth value={workForm.itemname} onChange={(e) => setWorkForm({ ...workForm, itemname: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Qty" type="number" fullWidth value={workForm.quantity} onChange={(e) => setWorkForm({ ...workForm, quantity: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Amount" type="number" fullWidth value={workForm.price} onChange={(e) => setWorkForm({ ...workForm, price: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Remarks" fullWidth value={workForm.remarks} onChange={(e) => setWorkForm({ ...workForm, remarks: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveAddedBudgetItem}>Add Item</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
