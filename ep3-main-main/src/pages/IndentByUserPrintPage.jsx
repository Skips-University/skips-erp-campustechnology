import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
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
import { ArrowBack, Print, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const DetailLine = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography fontWeight={600}>{value || "-"}</Typography>
  </Box>
);

export default function IndentByUserPrintPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [approvedIndents, setApprovedIndents] = useState([]);
  const [notApprovedIndents, setNotApprovedIndents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [institution, setInstitution] = useState(null);

  const activeApprovalState = tabValue === 0 ? "approved" : "notapproved";
  const activeTabLabel = tabValue === 0 ? "Approved Indents" : "Not Approved Indents";
  const indents = tabValue === 0 ? approvedIndents : notApprovedIndents;

  const selectedUserInfo = useMemo(
    () => users.find((item) => item.user === selectedUser),
    [users, selectedUser]
  );

  const totalQuantity = useMemo(
    () => indents.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [indents]
  );

  useEffect(() => {
    loadUsers();
    loadInstitution();
  }, []);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get(`/vins?colid=${global1.colid}`);
      setInstitution(res.data);
    } catch (err) {
      setInstitution(null);
    }
  };

  const loadUsers = async () => {
    setError("");
    try {
      const res = await ep1.get("/indent/print/users", {
        params: { colid: global1.colid }
      });
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading indent users");
    }
  };

  const loadIndents = async (approvalState = activeApprovalState) => {
    if (!selectedUser) {
      setError("Select a user first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await ep1.get("/indent/print/byuser", {
        params: {
          colid: global1.colid,
          user: selectedUser,
          approvalState
        }
      });
      if (approvalState === "approved") {
        setApprovedIndents(res.data || []);
      } else {
        setNotApprovedIndents(res.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error loading indents");
    }

    setLoading(false);
  };

  const clearLoadedIndents = () => {
    setApprovedIndents([]);
    setNotApprovedIndents([]);
  };

  const columns = [
    { field: "_id", headerName: "Indent ID", flex: 1.4 },
    { field: "itemname", headerName: "Item", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 0.7, type: "number" },
    {
      field: "store",
      headerName: "Store",
      flex: 1,
      valueGetter: (params) => params.row.storeid?.storename || "-"
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      valueGetter: (params) => params.row.categoryid?.categoryname || "-"
    },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 0.9,
      valueGetter: (params) => formatDate(params.row.createdAt)
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #indent-print-area, #indent-print-area * {
              visibility: visible;
            }
            #indent-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 24px;
            }
            .no-print {
              display: none !important;
            }
            @page {
              margin: 16mm;
            }
          }
        `}
      </style>

      <Stack spacing={3}>
        <Paper className="no-print" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/dashdashfacnew")}
                sx={{ mb: 2 }}
              >
                Back
              </Button>
              <Typography variant="h4" fontWeight="bold">
                Indent by User
              </Typography>
              <Typography color="text.secondary">
                Select a user, choose a tab, and print matching indents.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  select
                  fullWidth
                  label="User"
                  value={selectedUser}
                  onChange={(event) => {
                    setSelectedUser(event.target.value);
                    clearLoadedIndents();
                  }}
                >
                  {users.map((item) => (
                    <MenuItem key={item.user} value={item.user}>
                      {item.name} ({item.user})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant="contained" startIcon={<Search />} onClick={() => loadIndents()} disabled={loading}>
                  {loading ? "Loading..." : "Load Indents"}
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        <Paper className="no-print" sx={{ p: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(event, value) => {
              setTabValue(value);
              if (selectedUser) {
                loadIndents(value === 0 ? "approved" : "notapproved");
              }
            }}
            sx={{ mb: 2 }}
          >
            <Tab label="Approved indents" />
            <Tab label="Not approved indents" />
          </Tabs>

          <Box sx={{ height: 480 }}>
            <DataGrid
              rows={indents}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
            />
          </Box>
        </Paper>

        {indents.length > 0 && (
          <>
            <Box className="no-print" sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>
                Print Indents
              </Button>
            </Box>

            <Paper id="indent-print-area" sx={{ p: 4, borderRadius: 1 }}>
              <Box sx={{ borderBottom: "2px solid #111827", pb: 2, mb: 3 }}>
                <Stack direction="column" alignItems="center" spacing={1}>
                  <Box sx={{ textAlign: "center", width: "100%" }}>
                    {(institution?.logolink || institution?.logo) && (
                      <img
                        src={institution.logolink || institution.logo}
                        alt="logo"
                        style={{ height: 72, objectFit: "contain", marginBottom: 8 }}
                      />
                    )}
                    <Typography variant="h5" fontWeight="bold">
                      {institution?.institutionname || global1.insname || selectedUserInfo?.institution || "Institution"}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                      {institution?.address || ""}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {activeTabLabel}
                    </Typography>
                  </Box>
                  <Chip label={activeTabLabel} color={tabValue === 0 ? "success" : "primary"} />
                </Stack>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <DetailLine label="User" value={selectedUserInfo?.name || selectedUser} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DetailLine label="User Email" value={selectedUser} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DetailLine label="Department" value={selectedUserInfo?.department || indents[0]?.department} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DetailLine label="Total Quantity" value={totalQuantity} />
                </Grid>
              </Grid>

              <Box sx={{ mb: 3, border: "1px solid #d1d5db" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "50px 1.4fr 1.2fr 0.7fr 1fr 1fr 1fr 1fr 1fr",
                    bgcolor: "#f3f4f6",
                    fontWeight: 700,
                    borderBottom: "1px solid #d1d5db"
                  }}
                >
                  {["#", "Indent ID", "Item", "Quantity", "Store", "Category", "Budget Item", "Status", "Remarks"].map((heading) => (
                    <Box key={heading} sx={{ p: 1, borderRight: "1px solid #d1d5db" }}>{heading}</Box>
                  ))}
                </Box>
                {indents.map((indent, index) => (
                  <Box
                    key={indent._id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "50px 1.4fr 1.2fr 0.7fr 1fr 1fr 1fr 1fr 1fr",
                      borderBottom: "1px solid #e5e7eb"
                    }}
                  >
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>{index + 1}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>{indent._id}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>
                      <Typography fontWeight={600}>{indent.itemname || "-"}</Typography>
                      <Typography variant="caption" color="text.secondary">{indent.description || ""}</Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb", textAlign: "right" }}>{indent.quantity || "-"}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>{indent.storeid?.storename || "-"}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>{indent.categoryid?.categoryname || "-"}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>{indent.budgetid?.itemname || "-"}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>{indent.status || "-"}</Box>
                    <Box sx={{ p: 1 }}>{indent.remarks || "-"}</Box>
                  </Box>
                ))}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <DetailLine label="Prepared By" value={global1.user || selectedUser} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DetailLine label="Print Date" value={formatDate(new Date())} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <DetailLine label="Total Indents" value={indents.length} />
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Stack>
    </Container>
  );
}
