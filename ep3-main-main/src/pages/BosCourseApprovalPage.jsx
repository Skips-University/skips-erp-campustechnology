import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function BosCourseApprovalPage() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/bos/course-approval-queue", { params: { colid: global1.colid, approveremail: global1.user } });
      setRows(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load approvals");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadRows(); }, []);

  const act = async (action) => {
    try {
      setLoading(true);
      await ep1.post("/api/v2/bos/course-review/approve", {
        id: selected._id,
        colid: global1.colid,
        action,
        comments,
        username: global1.name,
        useremail: global1.user
      });
      setMessage(`Course review ${action === "Approve" ? "approved" : "rejected"}`);
      setSelected(null);
      setComments("");
      await loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update approval");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "cycletitle", headerName: "Cycle", width: 170 },
    { field: "programcode", headerName: "Program Code", width: 140 },
    { field: "course", headerName: "Course", width: 240 },
    { field: "coursecode", headerName: "Course Code", width: 140 },
    { field: "semester", headerName: "Semester", width: 110 },
    { field: "facultyname", headerName: "Faculty", width: 180 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "actions", headerName: "Actions", width: 120, renderCell: (params) => <Button size="small" variant="outlined" onClick={() => setSelected(params.row)}>View</Button> }
  ];

  return (
    <MenuPageShell title="BoS Course Approval">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Paper sx={{ p: 1 }}>
          <DataGrid rows={rows.map((r) => ({ ...r, id: r._id }))} columns={columns} loading={loading} autoHeight slots={{ toolbar: GridToolbar }} />
        </Paper>
        <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="lg" fullWidth>
          <DialogTitle>Course Review Approval</DialogTitle>
          <DialogContent>
            {selected && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}><Typography fontWeight={900}>{selected.course} ({selected.coursecode}) | {selected.programcode} | Semester {selected.semester}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="subtitle2">Old Syllabus</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{selected.oldsyllabus}</Typography></Grid>
                <Grid item xs={12} md={6}><Typography variant="subtitle2">New Syllabus</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{selected.newsyllabus}</Typography></Grid>
                <Grid item xs={12}><Typography variant="subtitle2">Assessment Scheme</Typography><Typography sx={{ whiteSpace: "pre-wrap" }}>{selected.assessmentscheme}</Typography></Grid>
                <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Approval comments" value={comments} onChange={(e) => setComments(e.target.value)} /></Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Stack direction="row" spacing={1}>
              <Button onClick={() => setSelected(null)}>Close</Button>
              <Button color="error" variant="outlined" disabled={loading} onClick={() => act("Reject")}>Reject</Button>
              <Button variant="contained" disabled={loading} onClick={() => act("Approve")}>Approve</Button>
            </Stack>
          </DialogActions>
        </Dialog>
      </Container>
    </MenuPageShell>
  );
}
