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
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>{value || "-"}</Typography>
  </Box>
);

const TermsBlock = ({ title, value }) => (
  <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
      {title}
    </Typography>
    <Typography sx={{ whiteSpace: "pre-wrap" }}>{value || "-"}</Typography>
  </Paper>
);

export default function RfpPrintViewPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("OPEN");
  const [rfps, setRfps] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSummary = useMemo(
    () => rfps.find((item) => item._id === selectedId),
    [rfps, selectedId]
  );

  useEffect(() => {
    loadRfps(status);
  }, []);

  const loadRfps = async (nextStatus = status) => {
    setLoading(true);
    setError("");
    setRfp(null);
    setSelectedId("");

    try {
      const res = await ep1.get("/rfp/print/list", {
        params: {
          colid: global1.colid,
          status: nextStatus
        }
      });
      setRfps(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading RFPs");
    }

    setLoading(false);
  };

  const loadRfp = async (id) => {
    setSelectedId(id);
    setError("");

    try {
      const res = await ep1.get("/rfp/print/byid", {
        params: {
          colid: global1.colid,
          id
        }
      });
      setRfp(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading RFP details");
    }
  };

  const rfpColumns = [
    { field: "_id", headerName: "RFP ID", flex: 1.4 },
    { field: "title", headerName: "Title", flex: 1.2 },
    { field: "creatorname", headerName: "Creator Name", flex: 1 },
    { field: "status", headerName: "Status", flex: 0.7 },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 0.8,
      valueGetter: (params) => formatDate(params.row.createdAt)
    },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" onClick={() => loadRfp(params.row._id)}>
          Select
        </Button>
      )
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
            #rfp-print-area, #rfp-print-area * {
              visibility: visible;
            }
            #rfp-print-area {
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
                RFP Print View
              </Typography>
              <Typography color="text.secondary">
                Filter RFPs by status, select one, and print a clean RFP document.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="RFP Status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    loadRfps(event.target.value);
                  }}
                >
                  <MenuItem value="OPEN">OPEN</MenuItem>
                  <MenuItem value="CLOSED">CLOSED</MenuItem>
                  <MenuItem value="ALL">ALL</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant="outlined" startIcon={<Search />} onClick={() => loadRfps()} disabled={loading}>
                  {loading ? "Loading..." : "Load RFPs"}
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        <Paper className="no-print" sx={{ height: 480 }}>
          <DataGrid
            rows={rfps}
            columns={rfpColumns}
            getRowId={(row) => row._id}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            rowSelectionModel={selectedId ? [selectedId] : []}
          />
        </Paper>

        {rfp && (
          <>
            <Box className="no-print" sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>
                Print RFP
              </Button>
            </Box>

            <Paper id="rfp-print-area" sx={{ p: 4, borderRadius: 1 }}>
              <Box sx={{ borderBottom: "2px solid #111827", pb: 2, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      Request for Proposal
                    </Typography>
                    <Typography color="text.secondary">{global1.insname || "Institution"}</Typography>
                  </Box>
                  <Chip label={rfp.status || selectedSummary?.status || status} color={rfp.status === "OPEN" ? "success" : "default"} />
                </Stack>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <DetailLine label="RFP ID" value={rfp._id} />
                  <DetailLine label="Title" value={rfp.title} />
                  <DetailLine label="Creator Name" value={rfp.creatorname} />
                  <DetailLine label="Creator Email" value={rfp.creatoremail} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DetailLine label="Store" value={rfp.storeid?.storename} />
                  <DetailLine label="Category" value={rfp.categoryid?.categoryname} />
                  <DetailLine label="Created Date" value={formatDate(rfp.createdAt)} />
                  <DetailLine label="Expiry Date" value={formatDate(rfp.expirydate)} />
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Prequalification
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{rfp.prequalification || "-"}</Typography>
              </Box>

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Items
              </Typography>
              <Box sx={{ mb: 3, border: "1px solid #d1d5db", borderRadius: 1, overflow: "hidden" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "56px 1.3fr 100px 1.6fr 1.4fr",
                    bgcolor: "#f3f4f6",
                    borderBottom: "1px solid #d1d5db",
                    fontWeight: 700
                  }}
                >
                  {["#", "Item Name", "Quantity", "Description", "Indent ID"].map((heading) => (
                    <Box key={heading} sx={{ p: 1, borderRight: "1px solid #d1d5db" }}>
                      {heading}
                    </Box>
                  ))}
                </Box>
                {(rfp.items || []).map((item, index) => (
                  <Box
                    key={item._id || index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "56px 1.3fr 100px 1.6fr 1.4fr",
                      borderBottom: index === (rfp.items || []).length - 1 ? "none" : "1px solid #e5e7eb"
                    }}
                  >
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>{index + 1}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb", fontWeight: 600 }}>{item.itemname || "-"}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb", textAlign: "right" }}>{item.quantity || "-"}</Box>
                    <Box sx={{ p: 1, borderRight: "1px solid #e5e7eb" }}>{item.description || "-"}</Box>
                    <Box sx={{ p: 1, wordBreak: "break-word" }}>{item.indentid || "-"}</Box>
                  </Box>
                ))}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TermsBlock title="General Terms" value={rfp.terms} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TermsBlock title="Cost Terms" value={rfp.costterms} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TermsBlock title="Delivery Terms" value={rfp.deliveryterms} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TermsBlock title="Payment Terms" value={rfp.paymentterms} />
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Stack>
    </Container>
  );
}
