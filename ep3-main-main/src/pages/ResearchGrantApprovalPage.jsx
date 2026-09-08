import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ArrowBack, CheckCircle, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const money = (value) => Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function ResearchGrantApprovalPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");

  const loadRows = async () => {
    const res = await ep1.get("/api/v2/research/approval-queue", { params: { colid: global1.colid, role: global1.role } });
    setRows(res.data?.data || []);
  };
  useEffect(() => { loadRows(); }, []);

  const decide = async (decision) => {
    await ep1.post("/api/v2/research/approval-decision", {
      id: selected._id,
      colid: global1.colid,
      role: global1.role,
      decision,
      comments,
      approvedby: global1.user,
      approvedbyname: global1.name
    });
    setMessage(`Application ${decision}.`);
    setSelected(null);
    setComments("");
    loadRows();
  };

  const columns = [
    { field: "academicyear", headerName: "Year", width: 120 },
    { field: "facultyname", headerName: "Faculty", width: 180 },
    { field: "department", headerName: "Department", width: 160 },
    { field: "projecttitle", headerName: "Project Title", minWidth: 240, flex: 1 },
    { field: "estimatedtotalamount", headerName: "Estimated", width: 130, type: "number" },
    { field: "currentlevel", headerName: "Level", width: 90, type: "number" },
    { field: "status", headerName: "Status", width: 130 },
    { field: "action", headerName: "Action", width: 130, renderCell: (params) => <Button size="small" onClick={() => setSelected(params.row)}>Review</Button> }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/dashdashfacnew")}>Back</Button>
        <Typography variant="h5" fontWeight={900}>Research grant approval</Typography>
      </Stack>
      {message && <Alert sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      <Paper sx={{ height: 560, p: 1 }}>
        <DataGrid rows={rows.map((row) => ({ ...row, id: row._id }))} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} />
      </Paper>
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>Review Research Grant</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Grid container spacing={1.5}>
              <Grid item xs={12}><Typography variant="h6">{selected.projecttitle}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><b>Faculty:</b> {selected.facultyname}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><b>Department:</b> {selected.department}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><b>Academic Year:</b> {selected.academicyear}</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><b>Estimated:</b> {money(selected.estimatedtotalamount)}</Typography></Grid>
              <Grid item xs={12}><Typography><b>Description:</b> {selected.description}</Typography></Grid>
              <Grid item xs={12}><Typography fontWeight={900}>Components</Typography></Grid>
              {(selected.requestedcomponents || []).map((item) => (
                <Grid item xs={12} md={6} key={item.component}><Typography>{item.component}: {money(item.requestedamount)}</Typography></Grid>
              ))}
              <Grid item xs={12}><Typography fontWeight={900}>Documents</Typography></Grid>
              {(selected.documents || []).map((doc, index) => (
                <Grid item xs={12} key={index}>
                  <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                    {doc.documenttype}: <Link href={doc.url} target="_blank" rel="noreferrer">{doc.url}</Link>
                  </Typography>
                </Grid>
              ))}
              <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} /></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
          <Button color="error" startIcon={<Cancel />} onClick={() => decide("Denied")}>Deny</Button>
          <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => decide("Approved")}>Approve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
