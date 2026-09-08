import React, { useEffect, useMemo, useState } from "react";
import { Alert, Autocomplete, Box, Breadcrumbs, Button, LinearProgress, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Check, Close, Logout, Refresh } from "@mui/icons-material";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function UserProfileApprovalPage() {
  const [profile, setProfile] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/user-profile-approval-pending", { params: { colid: global1.colid, approveremail: global1.user, approverrole: global1.role } });
      setProfile((res.data.profile || []).map((row, index) => ({ ...row, id: `${row.requestid}-${row.field}-${index}` })));
      setDocuments((res.data.documents || []).map((row) => ({ ...row, id: row._id })));
      setSelectedProfileIds([]);
      setSelectedDocumentIds([]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load approvals");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const studentOptions = useMemo(() => {
    const map = new Map();
    [...profile, ...documents]
      .filter((row) => /^student$/i.test(String(row.role || "")))
      .forEach((row) => {
        const key = row.owneruser || row.ownername;
        if (key && !map.has(key)) {
          map.set(key, {
            owneruser: row.owneruser || "",
            ownername: row.ownername || row.owneruser || "",
            role: row.role || "Student",
            label: `${row.ownername || row.owneruser || "Student"}${row.owneruser ? ` (${row.owneruser})` : ""}`
          });
        }
      });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [profile, documents]);

  const filteredProfile = useMemo(() => (
    selectedOwner ? profile.filter((row) => row.owneruser === selectedOwner.owneruser) : profile
  ), [profile, selectedOwner]);

  const filteredDocuments = useMemo(() => (
    selectedOwner ? documents.filter((row) => row.owneruser === selectedOwner.owneruser) : documents
  ), [documents, selectedOwner]);

  useEffect(() => {
    if (!selectedOwner) {
      setSelectedProfileIds([]);
      setSelectedDocumentIds([]);
      return;
    }
    setSelectedProfileIds(filteredProfile.map((row) => row.id));
    setSelectedDocumentIds(filteredDocuments.map((row) => row.id));
  }, [selectedOwner, filteredProfile, filteredDocuments]);

  const actProfile = async (row, action) => {
    setLoading(true);
    try {
      await ep1.post("/api/v2/user-profile-approval-field-action", { colid: global1.colid, requestid: row.requestid, field: row.field, action, comments: comments[row.id] || "", approvername: global1.name, approveremail: global1.user, approverrole: global1.role });
      setMessage(`Field ${action.toLowerCase()}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to process field");
    } finally {
      setLoading(false);
    }
  };

  const postProfileAction = async (row, action, bulkComments = "") => ep1.post("/api/v2/user-profile-approval-field-action", {
    colid: global1.colid,
    requestid: row.requestid,
    field: row.field,
    action,
    comments: bulkComments || comments[row.id] || "",
    approvername: global1.name,
    approveremail: global1.user,
    approverrole: global1.role
  });

  const actDocument = async (row, action) => {
    setLoading(true);
    try {
      await ep1.post("/api/v2/user-profile-approval-document-action", { colid: global1.colid, requestid: row._id, action, comments: comments[row._id] || "", approvername: global1.name, approveremail: global1.user, approverrole: global1.role });
      setMessage(`Document ${action.toLowerCase()}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to process document");
    } finally {
      setLoading(false);
    }
  };

  const postDocumentAction = async (row, action, bulkComments = "") => ep1.post("/api/v2/user-profile-approval-document-action", {
    colid: global1.colid,
    requestid: row._id,
    action,
    comments: bulkComments || comments[row._id] || "",
    approvername: global1.name,
    approveremail: global1.user,
    approverrole: global1.role
  });

  const bulkProfileAction = async (action) => {
    const selected = filteredProfile.filter((row) => selectedProfileIds.includes(row.id));
    if (!selected.length) {
      setError("Select profile data rows first");
      return;
    }
    const bulkComments = action === "Rejected" ? window.prompt("Reason for rejection") : "Bulk approved";
    if (bulkComments === null) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      for (const row of selected) await postProfileAction(row, action, bulkComments);
      setMessage(`${selected.length} profile data row(s) ${action.toLowerCase()}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to process selected profile data");
    } finally {
      setLoading(false);
    }
  };

  const bulkDocumentAction = async (action) => {
    const selected = filteredDocuments.filter((row) => selectedDocumentIds.includes(row.id));
    if (!selected.length) {
      setError("Select document rows first");
      return;
    }
    const bulkComments = action === "Rejected" ? window.prompt("Reason for rejection") : "Bulk approved";
    if (bulkComments === null) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      for (const row of selected) await postDocumentAction(row, action, bulkComments);
      setMessage(`${selected.length} document row(s) ${action.toLowerCase()}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to process selected documents");
    } finally {
      setLoading(false);
    }
  };

  const commentBox = (id) => <TextField size="small" label="Comments" value={comments[id] || ""} onKeyDown={(e) => e.stopPropagation()} onChange={(e) => setComments((old) => ({ ...old, [id]: e.target.value }))} />;
  const profileColumns = [
    { field: "ownername", headerName: "User", width: 180 },
    { field: "owneruser", headerName: "Email", width: 220 },
    { field: "role", headerName: "Role", width: 120 },
    { field: "field", headerName: "Field", width: 160 },
    { field: "oldvalue", headerName: "Old value", width: 220 },
    { field: "newvalue", headerName: "New value", width: 220 },
    { field: "level", headerName: "Level", width: 90 },
    { field: "comments", headerName: "Comments", width: 220, renderCell: ({ row }) => commentBox(row.id) },
    { field: "actions", headerName: "Actions", width: 210, sortable: false, filterable: false, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Button size="small" color="success" startIcon={<Check />} onClick={() => actProfile(row, "Approved")}>Approve</Button><Button size="small" color="error" startIcon={<Close />} onClick={() => actProfile(row, "Rejected")}>Reject</Button></Stack> }
  ];
  const documentColumns = [
    { field: "ownername", headerName: "User", width: 180 },
    { field: "owneruser", headerName: "Email", width: 220 },
    { field: "role", headerName: "Role", width: 120 },
    { field: "documentname", headerName: "Document", width: 220 },
    { field: "url", headerName: "Link", width: 240, renderCell: ({ value, row }) => value ? <Link href={value} target="_blank" rel="noreferrer">{row.originalname || "Open"}</Link> : "" },
    { field: "level", headerName: "Level", width: 90 },
    { field: "comments", headerName: "Comments", width: 220, renderCell: ({ row }) => commentBox(row._id) },
    { field: "actions", headerName: "Actions", width: 210, sortable: false, filterable: false, renderCell: ({ row }) => <Stack direction="row" spacing={1}><Button size="small" color="success" startIcon={<Check />} onClick={() => actDocument(row, "Approved")}>Approve</Button><Button size="small" color="error" startIcon={<Close />} onClick={() => actDocument(row, "Rejected")}>Reject</Button></Stack> }
  ];

  return (
    <MenuPageShell title="Profile approval">
      <Box p={3} sx={{ maxWidth: "100%", overflowX: "hidden" }}>
        <Paper sx={{ p: 2, mb: 2 }}><Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between"><Box><Breadcrumbs><Link href="/dashdashfacnew" color="inherit">Dashboard</Link><Typography>User management</Typography></Breadcrumbs><Typography variant="h5" fontWeight={900}>Profile edit approval</Typography></Box><Stack direction="row" spacing={1}><Button startIcon={<Refresh />} onClick={load}>Refresh</Button><Button color="error" variant="outlined" startIcon={<Logout />} onClick={() => { localStorage.clear(); window.location.href = "/"; }}>Logout</Button></Stack></Stack></Paper>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={800}>Select student for approval</Typography>
              <Typography color="text.secondary">Selecting a student automatically selects all pending profile data and documents for that student.</Typography>
            </Box>
            <Autocomplete
              sx={{ minWidth: { xs: "100%", md: 420 } }}
              options={studentOptions}
              value={selectedOwner}
              onChange={(_, value) => setSelectedOwner(value)}
              getOptionLabel={(option) => option?.label || ""}
              renderInput={(params) => <TextField {...params} label="Pending student" />}
            />
          </Stack>
        </Paper>
        <Paper sx={{ p: 1, mb: 2, maxWidth: "100%", overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ p: 1 }}>
            <Typography variant="h6" fontWeight={800}>Profile fields pending approval</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" color="success" variant="contained" startIcon={<Check />} disabled={!selectedProfileIds.length || loading} onClick={() => bulkProfileAction("Approved")}>Approve Selected ({selectedProfileIds.length})</Button>
              <Button size="small" color="error" variant="outlined" startIcon={<Close />} disabled={!selectedProfileIds.length || loading} onClick={() => bulkProfileAction("Rejected")}>Reject Selected</Button>
            </Stack>
          </Stack>
          <Box sx={{ minWidth: 1600 }}>
            <DataGrid
              autoHeight
              rows={filteredProfile}
              columns={profileColumns}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedProfileIds}
              onRowSelectionModelChange={(ids) => setSelectedProfileIds(Array.from(ids))}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Paper>
        <Paper sx={{ p: 1, maxWidth: "100%", overflowX: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ p: 1 }}>
            <Typography variant="h6" fontWeight={800}>Documents pending approval</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" color="success" variant="contained" startIcon={<Check />} disabled={!selectedDocumentIds.length || loading} onClick={() => bulkDocumentAction("Approved")}>Approve Selected ({selectedDocumentIds.length})</Button>
              <Button size="small" color="error" variant="outlined" startIcon={<Close />} disabled={!selectedDocumentIds.length || loading} onClick={() => bulkDocumentAction("Rejected")}>Reject Selected</Button>
            </Stack>
          </Stack>
          <Box sx={{ minWidth: 1500 }}>
            <DataGrid
              autoHeight
              rows={filteredDocuments}
              columns={documentColumns}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedDocumentIds}
              onRowSelectionModelChange={(ids) => setSelectedDocumentIds(Array.from(ids))}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
