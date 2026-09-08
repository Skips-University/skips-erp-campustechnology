import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DeleteOutline, Print, QrCode2, Refresh, Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#db2777"];
const today = () => new Date().toISOString().slice(0, 10);
const dt = (value) => value ? new Date(value).toLocaleString() : "";
const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
const selectionArray = (ids) => Array.from(ids?.ids || ids || []);

const loadInstitutionDetails = async () => {
  try {
    const res = await ep1.get("/api/institution", { params: { colid: global1.colid } });
    return Array.isArray(res.data) ? res.data[0] : res.data;
  } catch {
    return null;
  }
};

const printSection = (id, title = "Print") => {
  const node = document.getElementById(id);
  if (!node) return;
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    window.print();
    return;
  }
  const headStyles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((el) => el.outerHTML)
    .join("");
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        ${headStyles}
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial, sans-serif; color: #111827; margin: 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 7px; font-size: 12px; vertical-align: top; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>${node.outerHTML}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 250);
};

function Status({ error, message }) {
  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    </>
  );
}

function Header({ title, subtitle }) {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e5e7eb" }}>
      <Typography variant="h5" fontWeight={900}>{title}</Typography>
      {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
    </Paper>
  );
}

function useStatus() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const clear = () => { setError(""); setMessage(""); };
  return { error, message, setError, setMessage, clear };
}

function BarcodePreview({ asset }) {
  const [qr, setQr] = useState("");
  const svgRef = useRef(null);
  useEffect(() => {
    if (!asset?.assetid) return;
    QRCode.toDataURL(asset.assetid, { margin: 1, width: 180 }).then(setQr).catch(() => setQr(""));
    setTimeout(() => {
      if (svgRef.current) JsBarcode(svgRef.current, asset.assetid, { width: 1.4, height: 52, displayValue: true, fontSize: 12 });
    }, 0);
  }, [asset]);
  if (!asset) return null;
  return (
    <Paper id="asset-code-preview" sx={{ p: 2, mt: 2, maxWidth: 520, mx: "auto", textAlign: "center", "@media print": { boxShadow: "none" } }}>
      <style>{`@media print { body * { visibility: hidden; } #asset-code-preview, #asset-code-preview * { visibility: visible; } #asset-code-preview { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <Typography variant="h6" fontWeight={900}>{asset.assetid}</Typography>
      <Typography>{asset.item}</Typography>
      <Stack direction="row" justifyContent="center" spacing={4} sx={{ mt: 2 }}>
        {qr && <Box component="img" src={qr} alt="QR" sx={{ width: 180, height: 180 }} />}
        <Box sx={{ display: "flex", alignItems: "center" }}><svg ref={svgRef} /></Box>
      </Stack>
      <Button sx={{ mt: 2 }} variant="contained" startIcon={<Print />} onClick={() => window.print()}>Print QR / Barcode</Button>
    </Paper>
  );
}

function InstitutionHeader({ institution, title }) {
  return (
    <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
      {institution?.logolink && <Box component="img" src={institution.logolink} alt="Logo" sx={{ height: 64, maxWidth: 150, objectFit: "contain" }} />}
      <Typography variant="h6" fontWeight={900}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
      <Typography variant="body2">{institution?.address || ""}</Typography>
      <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>{title}</Typography>
    </Stack>
  );
}

function DetailGrid({ rows }) {
  return (
    <Grid container spacing={1}>
      {rows.map(([label, value]) => (
        <Grid item xs={12} sm={6} key={label}>
          <Box sx={{ border: "1px solid #d1d5db", p: 1, minHeight: 56 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>{value || "NA"}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

const groupAssetsByAssignee = (rows = []) => Object.values(rows.reduce((acc, asset) => {
  const key = asset.assignedtoemail || asset.assignedto || "Unassigned";
  if (!acc[key]) {
    acc[key] = {
      key,
      toname: asset.assignedto || "Unassigned",
      toemail: asset.assignedtoemail || "",
      department: asset.department || "",
      assets: []
    };
  }
  acc[key].assets.push(asset);
  return acc;
}, {}));

function GroupedAssetAssignmentDocuments({ id, institution, groups }) {
  if (!groups?.length) return null;
  return (
    <Box id={id} sx={{ bgcolor: "#fff", color: "#111827" }}>
      {groups.map((group, groupIndex) => (
        <Box key={group.key} sx={{ maxWidth: "190mm", mx: "auto", p: 3, border: "1px solid #d1d5db", mb: 2, pageBreakAfter: groupIndex < groups.length - 1 ? "always" : "auto" }}>
          <InstitutionHeader institution={institution} title="Asset Assignment Document" />
          <DetailGrid rows={[
            ["Document Date", new Date().toLocaleDateString()],
            ["Assigned To", group.toname],
            ["Assigned Email", group.toemail],
            ["Department", group.department],
            ["Total Assets", group.assets.length]
          ]} />
          <Typography sx={{ my: 2 }}>
            This document records the official assignment of the assets listed below. The assigned user is responsible for safe custody, proper usage, and timely return whenever requested by the institution.
          </Typography>
          <Box component="table">
            <thead>
              <tr><th>Asset ID</th><th>Store</th><th>Category</th><th>Item</th><th>Description</th><th>Value</th><th>Assigned Date</th></tr>
            </thead>
            <tbody>
              {group.assets.map((asset) => (
                <tr key={asset._id}>
                  <td>{asset.assetid}</td>
                  <td>{asset.store}</td>
                  <td>{asset.category}</td>
                  <td>{asset.item}</td>
                  <td>{asset.description}</td>
                  <td>{money(asset.approximateprice)}</td>
                  <td>{dt(asset.assigneddate)}</td>
                </tr>
              ))}
            </tbody>
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 6 }}>
            <Typography>Issued By</Typography>
            <Typography>Received By</Typography>
            <Typography>Store / Asset In-charge</Typography>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

function GroupedAssetAgreementDocuments({ id, institution, groups }) {
  if (!groups?.length) return null;
  const clauses = [
    "The assignee confirms receipt of the listed assets in working condition and agrees to use them only for authorized institutional work.",
    "The assignee shall keep the assets safe, shall not transfer them to any other person without written approval, and shall return them whenever requested.",
    "In case of loss, theft, misuse or damage caused by negligence, the institution may recover repair cost, penalty, depreciated value, or full replacement value as applicable.",
    "The assignee must immediately report loss, malfunction, damage or change of location to the asset/store in-charge."
  ];
  return (
    <Box id={id} sx={{ bgcolor: "#fff", color: "#111827" }}>
      {groups.map((group, groupIndex) => (
        <Box key={group.key} sx={{ maxWidth: "190mm", mx: "auto", p: 3, border: "1px solid #d1d5db", mb: 2, pageBreakAfter: groupIndex < groups.length - 1 ? "always" : "auto" }}>
          <InstitutionHeader institution={institution} title="Asset Assignment and Handover Agreement" />
          <DetailGrid rows={[
            ["Agreement Date", new Date().toLocaleDateString()],
            ["Assigned To", group.toname],
            ["Assigned Email", group.toemail],
            ["Department", group.department],
            ["Total Assets", group.assets.length]
          ]} />
          <Typography variant="h6" sx={{ mt: 2 }}>Assigned assets</Typography>
          <Box component="table">
            <thead>
              <tr><th>Asset ID</th><th>Item</th><th>Description</th><th>Value</th><th>Assigned Date</th></tr>
            </thead>
            <tbody>
              {group.assets.map((asset) => (
                <tr key={asset._id}>
                  <td>{asset.assetid}</td>
                  <td>{asset.item}</td>
                  <td>{asset.description}</td>
                  <td>{money(asset.approximateprice)}</td>
                  <td>{dt(asset.assigneddate)}</td>
                </tr>
              ))}
            </tbody>
          </Box>
          <Box component="ol" sx={{ mt: 2, pl: 3 }}>
            {clauses.map((clause) => <li key={clause}><Typography sx={{ mb: 1 }}>{clause}</Typography></li>)}
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}><Typography>Issued by</Typography><Typography>Received by</Typography><Typography>Authorized signatory</Typography></Stack>
        </Box>
      ))}
    </Box>
  );
}

function AssetAssignmentDocument({ id, institution, asset, form, mode = "Assignment" }) {
  if (!asset) return null;
  const rows = [
    ["Document Date", new Date().toLocaleDateString()],
    ["Assignment Type", mode],
    ["Asset ID", asset.assetid],
    ["Store", asset.store],
    ["Category", asset.category],
    ["Item", asset.item],
    ["Description", asset.description],
    ["Approximate Value", money(asset.approximateprice)],
    ["Assigned To", form.toname],
    ["Assigned Email", form.toemail],
    ["Department", form.department],
    ["Assignment Date", form.assignmentdate]
  ];
  return (
    <Box id={id} sx={{ mt: 2, bgcolor: "#fff", color: "#111827", maxWidth: "190mm", mx: "auto", p: 3, border: "1px solid #d1d5db" }}>
      <InstitutionHeader institution={institution} title="Asset Assignment Document" />
      <Typography sx={{ mb: 2 }}>
        This document records the official assignment of the asset listed below to the named user. The assigned user is responsible for safe custody, proper usage, and timely return of the asset whenever requested by the institution.
      </Typography>
      <DetailGrid rows={rows} />
      <Typography sx={{ mt: 2 }}><b>Remarks:</b> {form.remarks || "The asset has been issued in usable condition after institutional verification."}</Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 6 }}>
        <Typography>Issued By</Typography>
        <Typography>Received By</Typography>
        <Typography>Store / Asset In-charge</Typography>
      </Stack>
    </Box>
  );
}

const assetColumns = (onCode) => [
  { field: "assetid", headerName: "Asset ID", minWidth: 170 },
  { field: "store", headerName: "Store", minWidth: 140 },
  { field: "category", headerName: "Category", minWidth: 140 },
  { field: "item", headerName: "Item", minWidth: 180 },
  { field: "description", headerName: "Description", minWidth: 230, flex: 1 },
  { field: "status", headerName: "Status", minWidth: 120, renderCell: ({ value }) => <Chip size="small" color={value === "Available" ? "success" : value === "Assigned" ? "primary" : "default"} label={value || "NA"} /> },
  { field: "condition", headerName: "Condition", minWidth: 120 },
  { field: "assignedto", headerName: "Assigned to", minWidth: 170 },
  { field: "assignedtoemail", headerName: "Assigned email", minWidth: 190 },
  { field: "department", headerName: "Department", minWidth: 150 },
  { field: "assigneddate", headerName: "Assigned date", minWidth: 170, valueFormatter: (p) => dt(p.value) },
  { field: "code", headerName: "QR / Barcode", width: 135, sortable: false, filterable: false, renderCell: ({ row }) => <Button size="small" startIcon={<QrCode2 />} onClick={() => onCode(row)}>Code</Button> }
];

export function AssetNewInventoryPage() {
  const { error, message, setError, setMessage, clear } = useStatus();
  const [masters, setMasters] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ store: "", category: "", itemmasterid: "", count: 1, prefix: "" });
  const [assetFilters, setAssetFilters] = useState({ store: "", category: "", item: "", status: "", assignedtoemail: "" });
  const [institution, setInstitution] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [assignForm, setAssignForm] = useState({ toname: "", toemail: "", department: "", assignmentdate: today(), penaltytype: "Penalty or full payment for loss/damage", penaltyamount: 0, agreementtext: "", remarks: "" });
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const [m, a] = await Promise.all([
        ep1.get("/api/v2/assetsnew/item-masters", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/assetsnew/assets", { params: { colid: global1.colid } })
      ]);
      setMasters(m.data.data || []);
      setAssets((a.data.data || []).map((row) => ({ ...row, id: row._id })));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assets");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); loadInstitutionDetails().then(setInstitution); }, []);
  const loadUsers = async (_, value = "") => {
    const res = await ep1.get("/api/v2/assetsnew/users", { params: { colid: global1.colid, q: value } });
    setUsers(res.data.data || []);
  };
  useEffect(() => { loadUsers(); }, []);
  const selectedMaster = masters.find((item) => item._id === form.itemmasterid);
  const stores = useMemo(() => Array.from(new Set(masters.map((item) => item.store).filter(Boolean))).sort(), [masters]);
  const categories = useMemo(() => Array.from(new Set(masters.filter((item) => !form.store || item.store === form.store).map((item) => item.category).filter(Boolean))).sort(), [masters, form.store]);
  const itemOptions = useMemo(() => masters
    .filter((item) => (!form.store || item.store === form.store) && (!form.category || item.category === form.category))
    .map((item) => ({ ...item, label: `${item.item} - stock ${item.quantityavailable || 0}` })), [masters, form.store, form.category]);
  const filteredAssets = useMemo(() => assets.filter((asset) => (
    (!assetFilters.store || asset.store === assetFilters.store)
    && (!assetFilters.category || asset.category === assetFilters.category)
    && (!assetFilters.item || asset.item === assetFilters.item)
    && (!assetFilters.status || asset.status === assetFilters.status)
    && (!assetFilters.assignedtoemail || asset.assignedtoemail === assetFilters.assignedtoemail)
  )), [assets, assetFilters]);
  const selectedAssetRows = useMemo(() => {
    const selected = new Set(selectionArray(selectedAssetIds));
    return filteredAssets.filter((asset) => selected.has(asset.id || asset._id));
  }, [filteredAssets, selectedAssetIds]);
  const selectedAssignedRows = useMemo(() => selectedAssetRows.filter((asset) => asset.status === "Assigned"), [selectedAssetRows]);
  const selectedAssignmentGroups = useMemo(() => groupAssetsByAssignee(selectedAssignedRows), [selectedAssignedRows]);
  const assetFilterValues = (field) => Array.from(new Set(assets.map((asset) => asset[field]).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  const generate = async () => {
    clear();
    try {
      const res = await ep1.post("/api/v2/assetsnew/generate", { ...form, colid: global1.colid, user: global1.user });
      setMessage(`${res.data.inserted || 0} asset IDs generated.`);
      setForm({ store: "", category: "", itemmasterid: "", count: 1, prefix: "" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate asset IDs");
    }
  };
  const assignAsset = async () => {
    if (!selectedAsset) return setError("Select an asset from the register first");
    if (selectedAsset.status === "Assigned") return setError("This asset is already assigned. Use Asset reissue to reassign it.");
    clear();
    try {
      const res = await ep1.post("/api/v2/assetsnew/reassign", { ...assignForm, action: "Assignment", colid: global1.colid, assetid: selectedAsset._id, user: global1.user, username: global1.name });
      setMessage("Asset assigned and movement recorded.");
      if (res.data?.data?._id) setSelectedAssetIds([res.data.data._id]);
      setSelectedAsset(res.data?.data ? { ...res.data.data, id: res.data.data._id } : null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign asset");
    }
  };
  const releaseSelectedAssets = async () => {
    clear();
    if (!selectedAssignedRows.length) return setError("Select assigned asset rows to delete assignment and release asset IDs");
    if (!window.confirm(`Release ${selectedAssignedRows.length} assigned asset(s)? The asset IDs will become available for assignment again.`)) return;
    try {
      const res = await ep1.post("/api/v2/assetsnew/release-bulk", {
        colid: global1.colid,
        ids: selectedAssignedRows.map((asset) => asset._id),
        user: global1.user,
        username: global1.name,
        remarks: "Bulk assignment deleted from asset inventory grid"
      });
      setMessage(`${res.data.updated || selectedAssignedRows.length} asset assignment(s) deleted and released.`);
      setSelectedAssetIds([]);
      setSelectedAsset(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to release selected assets");
    }
  };
  return (
    <MenuPageShell title="Asset inventory">
      <Box p={3}>
        <Header title="Asset inventory" subtitle="Generate unique asset IDs from purchase-new item master stock and print QR or barcode labels." />
        <Status error={error} message={message} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><Autocomplete options={stores} value={form.store || null} onChange={(_, value) => setForm({ ...form, store: value || "", category: "", itemmasterid: "" })} renderInput={(params) => <TextField {...params} label="Store" />} /></Grid>
            <Grid item xs={12} md={3}><Autocomplete options={categories} value={form.category || null} onChange={(_, value) => setForm({ ...form, category: value || "", itemmasterid: "" })} renderInput={(params) => <TextField {...params} label="Category" />} /></Grid>
            <Grid item xs={12} md={3}><Autocomplete options={itemOptions} value={itemOptions.find((item) => item._id === form.itemmasterid) || null} onChange={(_, value) => setForm({ ...form, itemmasterid: value?._id || "" })} renderInput={(params) => <TextField {...params} label="Item" />} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth disabled label="Available qty" value={selectedMaster?.quantityavailable || 0} /></Grid>
            <Grid item xs={12} md={1}><TextField fullWidth type="number" label="No. IDs" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Prefix optional" value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} /></Grid>
            <Grid item xs={12}><Button variant="contained" startIcon={<Save />} onClick={generate}>Generate Asset IDs</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Dynamic asset filters</Typography>
          <Grid container spacing={2}>
            {["store", "category", "item", "status", "assignedtoemail"].map((field) => (
              <Grid item xs={12} md={2.4} key={field}>
                <Autocomplete
                  options={assetFilterValues(field)}
                  value={assetFilters[field] || null}
                  onChange={(_, value) => setAssetFilters({ ...assetFilters, [field]: value || "" })}
                  renderInput={(params) => <TextField {...params} label={field === "assignedtoemail" ? "Assigned email" : field.charAt(0).toUpperCase() + field.slice(1)} />}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
        <Paper sx={{ height: 520, mb: 2 }}>
          <DataGrid
            rows={filteredAssets}
            columns={assetColumns(setSelectedCode)}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedAssetIds}
            onRowSelectionModelChange={(model) => setSelectedAssetIds(selectionArray(model))}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[25, 50, 100]}
            onRowClick={(params) => setSelectedAsset(params.row)}
          />
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>Assign selected asset from register</Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>Selected asset: {selectedAsset?.assetid || "None"}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Autocomplete options={users} getOptionLabel={(u) => `${u.name || ""} - ${u.email || u.user || ""}`} onInputChange={loadUsers} onChange={(_, user) => setAssignForm({ ...assignForm, toname: user?.name || "", toemail: user?.email || user?.user || "", department: user?.department || "" })} renderInput={(params) => <TextField {...params} label="Assign to user" />} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Assignment date" InputLabelProps={{ shrink: true }} value={assignForm.assignmentdate} onChange={(e) => setAssignForm({ ...assignForm, assignmentdate: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Penalty / payment rule" value={assignForm.penaltytype} onChange={(e) => setAssignForm({ ...assignForm, penaltytype: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Penalty amount" value={assignForm.penaltyamount} onChange={(e) => setAssignForm({ ...assignForm, penaltyamount: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Remarks" value={assignForm.remarks} onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="contained" onClick={assignAsset}>Assign asset</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={900}>Selected assignment documents</Typography>
              <Typography color="text.secondary">
                {selectedAssignedRows.length} assigned asset(s) selected. Documents will be grouped userwise when multiple users are selected.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" startIcon={<Print />} disabled={!selectedAssignedRows.length} onClick={() => printSection("asset-selected-assignment-documents", "Asset Assignment Documents")}>Print assignment document</Button>
              <Button variant="outlined" startIcon={<Print />} disabled={!selectedAssignedRows.length} onClick={() => printSection("asset-selected-assignment-agreements", "Asset Assignment Agreements")}>Print agreement</Button>
              <Button color="error" variant="outlined" startIcon={<DeleteOutline />} disabled={!selectedAssignedRows.length} onClick={releaseSelectedAssets}>Bulk delete / release</Button>
            </Stack>
          </Stack>
          {selectedAssetRows.length > selectedAssignedRows.length && (
            <Alert severity="info" sx={{ mt: 2 }}>Only assigned rows are used for documents and release. Available or retired rows are ignored.</Alert>
          )}
        </Paper>
        {selectedAssignedRows.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight={900}>Assignment print previews</Typography>
            <GroupedAssetAssignmentDocuments id="asset-selected-assignment-documents" institution={institution} groups={selectedAssignmentGroups} />
            <GroupedAssetAgreementDocuments id="asset-selected-assignment-agreements" institution={institution} groups={selectedAssignmentGroups} />
          </Paper>
        )}
        <BarcodePreview asset={selectedCode} />
      </Box>
    </MenuPageShell>
  );
}

export function AssetNewTrackingPage() {
  const { error, message } = useStatus();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/assetsnew/tracking", { params: { colid: global1.colid } });
      setRows((res.data.data || []).map((row) => ({ ...row, id: row._id })));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const columns = [
    { field: "assignmentdate", headerName: "Date", minWidth: 170, valueFormatter: (p) => dt(p.value) },
    { field: "assetid", headerName: "Asset ID", minWidth: 170 },
    { field: "action", headerName: "Action", minWidth: 120 },
    { field: "store", headerName: "Store", minWidth: 130 },
    { field: "category", headerName: "Category", minWidth: 140 },
    { field: "item", headerName: "Item", minWidth: 180 },
    { field: "fromname", headerName: "From", minWidth: 160 },
    { field: "toname", headerName: "To", minWidth: 160 },
    { field: "toemail", headerName: "To email", minWidth: 190 },
    { field: "department", headerName: "Department", minWidth: 140 },
    { field: "penaltytype", headerName: "Penalty", minWidth: 160 },
    { field: "penaltyamount", headerName: "Penalty amount", minWidth: 140, valueFormatter: (p) => money(p.value) },
    { field: "remarks", headerName: "Remarks", minWidth: 240, flex: 1 }
  ];
  return (
    <MenuPageShell title="Asset tracking">
      <Box p={3}>
        <Header title="Asset tracking" subtitle="Complete asset issue, reissue, handover and retirement history." />
        <Status error={error} message={message} />
        <Paper sx={{ height: 660 }}><DataGrid rows={rows} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

function AgreementPrint({ id = "asset-agreement-print", institution, asset, form, history = [] }) {
  if (!asset) return null;
  const clauses = form.agreementtext || [
    "The assignee confirms receipt of the asset in working condition and agrees to use it only for authorized institutional work.",
    "The assignee shall keep the asset safe, shall not transfer it to any other person without written approval, and shall return it whenever requested.",
    "In case of loss, theft, misuse or damage caused by negligence, the institution may recover repair cost, penalty, depreciated value, or full replacement value as applicable.",
    "The assignee must immediately report loss, malfunction, damage or change of location to the asset/store in-charge."
  ].join("\n\n");
  return (
    <Box id={id} sx={{ mt: 2, bgcolor: "#fff", color: "#111827", maxWidth: "190mm", mx: "auto", p: 3, border: "1px solid #d1d5db" }}>
      <InstitutionHeader institution={institution} title="Asset Assignment and Handover Agreement" />
      <Grid container spacing={1}>
        {[["Asset ID", asset.assetid], ["Item", asset.item], ["Description", asset.description], ["Assigned To", form.toname], ["Email", form.toemail], ["Department", form.department], ["Assignment Date", form.assignmentdate], ["Penalty Type", form.penaltytype], ["Penalty Amount", money(form.penaltyamount)]].map(([label, value]) => (
          <Grid item xs={6} key={label}><Box sx={{ border: "1px solid #d1d5db", p: 1 }}><Typography variant="caption">{label}</Typography><Typography fontWeight={700}>{value || "NA"}</Typography></Box></Grid>
        ))}
      </Grid>
      <Typography sx={{ mt: 2, whiteSpace: "pre-wrap" }}>{clauses}</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>Assignment history</Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& th, & td": { border: "1px solid #d1d5db", p: 0.75, fontSize: 12 } }}>
        <thead><tr><th>Date</th><th>Action</th><th>From</th><th>To</th><th>Remarks</th></tr></thead>
        <tbody>
          {history.length ? history.map((row) => <tr key={row._id}><td>{dt(row.assignmentdate)}</td><td>{row.action}</td><td>{row.fromname}</td><td>{row.toname}</td><td>{row.remarks}</td></tr>) : <tr><td colSpan={5}>No previous assignment history available.</td></tr>}
        </tbody>
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 5 }}><Typography>Issued by</Typography><Typography>Received by</Typography><Typography>Authorized signatory</Typography></Stack>
    </Box>
  );
}

export function AssetNewReissuePage() {
  const { error, message, setError, setMessage, clear } = useStatus();
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lastReissue, setLastReissue] = useState(null);
  const [history, setHistory] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [form, setForm] = useState({ toname: "", toemail: "", department: "", assignmentdate: today(), penaltytype: "Penalty or full payment for loss/damage", penaltyamount: 0, agreementtext: "", remarks: "" });
  const load = async () => {
    const res = await ep1.get("/api/v2/assetsnew/assets", { params: { colid: global1.colid } });
    setAssets((res.data.data || []).map((row) => ({ ...row, id: row._id })));
  };
  const loadUsers = async (_, value = "") => {
    const res = await ep1.get("/api/v2/assetsnew/users", { params: { colid: global1.colid, q: value } });
    setUsers(res.data.data || []);
  };
  useEffect(() => { load(); loadUsers(); loadInstitutionDetails().then(setInstitution); }, []);
  const selectAsset = async (row, clearDocument = true) => {
    setSelected(row);
    if (clearDocument) setLastReissue(null);
    const res = await ep1.get("/api/v2/assetsnew/tracking", { params: { colid: global1.colid, asset: row._id } });
    setHistory(res.data.data || []);
  };
  const reassign = async () => {
    if (!selected) return setError("Select an asset");
    clear();
    try {
      const res = await ep1.post("/api/v2/assetsnew/reassign", { ...form, colid: global1.colid, assetid: selected._id, user: global1.user, username: global1.name });
      setMessage("Asset reassigned.");
      setLastReissue(res.data?.data ? { ...res.data.data, id: res.data.data._id } : selected);
      await load();
      await selectAsset(selected, false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reassign asset");
    }
  };
  const columns = assetColumns(selectAsset);
  return (
    <MenuPageShell title="Asset reissue">
      <Box p={3}>
        <Header title="Asset reissue" subtitle="Select an asset, view assignment history, and reassign it with handover agreement." />
        <Status error={error} message={message} />
        <Paper sx={{ height: 420, mb: 2 }}><DataGrid rows={assets} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} onRowClick={(p) => selectAsset(p.row)} /></Paper>
        {selected && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={900}>Reassign {selected.assetid}</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={4}><Autocomplete options={users} getOptionLabel={(u) => `${u.name || ""} - ${u.email || u.user || ""}`} onInputChange={loadUsers} onChange={(_, user) => setForm({ ...form, toname: user?.name || "", toemail: user?.email || user?.user || "", department: user?.department || "" })} renderInput={(params) => <TextField {...params} label="Assign to user" />} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Assignment date" InputLabelProps={{ shrink: true }} value={form.assignmentdate} onChange={(e) => setForm({ ...form, assignmentdate: e.target.value })} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Penalty / payment rule" value={form.penaltytype} onChange={(e) => setForm({ ...form, penaltytype: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Penalty amount" value={form.penaltyamount} onChange={(e) => setForm({ ...form, penaltyamount: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Agreement text" value={form.agreementtext} onChange={(e) => setForm({ ...form, agreementtext: e.target.value })} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" onClick={reassign}>Reassign asset</Button>
                </Stack>
              </Grid>
            </Grid>
            {lastReissue && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography fontWeight={900} sx={{ mb: 1 }}>Documents for latest saved reissue</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Button variant="outlined" startIcon={<Print />} onClick={() => printSection("asset-reissue-assignment-document", "Asset Assignment Document")}>Print assignment document</Button>
                  <Button variant="outlined" startIcon={<Print />} onClick={() => printSection("asset-reissue-assignment-agreement", "Asset Assignment Agreement")}>Print agreement</Button>
                </Stack>
                <AssetAssignmentDocument id="asset-reissue-assignment-document" institution={institution} asset={lastReissue} form={form} mode="Reissue" />
                <AgreementPrint id="asset-reissue-assignment-agreement" institution={institution} asset={lastReissue} form={form} history={history} />
              </Paper>
            )}
          </Paper>
        )}
      </Box>
    </MenuPageShell>
  );
}

export function AssetNewRetirementPage() {
  const { error, message, setError, setMessage, clear } = useStatus();
  const [assets, setAssets] = useState([]);
  const [retirements, setRetirements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: "Retired", retirementtype: "Retirement", retirementdate: today(), agency: "", location: "", recyclevalue: 0, details: "" });
  const load = async () => {
    const [a, r] = await Promise.all([
      ep1.get("/api/v2/assetsnew/assets", { params: { colid: global1.colid } }),
      ep1.get("/api/v2/assetsnew/retirements", { params: { colid: global1.colid } })
    ]);
    setAssets((a.data.data || []).map((row) => ({ ...row, id: row._id })));
    setRetirements((r.data.data || []).map((row) => ({ ...row, id: row._id })));
  };
  useEffect(() => { load(); }, []);
  const retire = async () => {
    if (!selected) return setError("Select an asset to retire");
    clear();
    try {
      await ep1.post("/api/v2/assetsnew/retire", { ...form, colid: global1.colid, assetid: selected._id, user: global1.user, username: global1.name });
      setMessage("Asset retirement recorded.");
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to retire asset");
    }
  };
  const retirementColumns = [
    { field: "retirementdate", headerName: "Date", minWidth: 160, valueFormatter: (p) => dt(p.value) },
    { field: "assetid", headerName: "Asset ID", minWidth: 170 },
    { field: "item", headerName: "Item", minWidth: 180 },
    { field: "status", headerName: "Status", minWidth: 120 },
    { field: "retirementtype", headerName: "Type", minWidth: 150 },
    { field: "agency", headerName: "Agency", minWidth: 160 },
    { field: "location", headerName: "Location", minWidth: 160 },
    { field: "recyclevalue", headerName: "Recycle value", minWidth: 140, valueFormatter: (p) => money(p.value) },
    { field: "details", headerName: "Details", minWidth: 240, flex: 1 }
  ];
  return (
    <MenuPageShell title="Asset retirement">
      <Box p={3}>
        <Header title="Asset retirement" subtitle="Retire, recycle or dispose assets and record agency, date and location details." />
        <Status error={error} message={message} />
        <Paper sx={{ height: 360, mb: 2 }}><DataGrid rows={assets} columns={assetColumns(setSelected)} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} onRowClick={(p) => setSelected(p.row)} /></Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>Selected asset: {selected?.assetid || "None"}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><FormControl fullWidth><InputLabel>Status</InputLabel><Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><MenuItem value="Retired">Retired</MenuItem><MenuItem value="Recycled">Recycled</MenuItem><MenuItem value="Disposed">Disposed</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Type" value={form.retirementtype} onChange={(e) => setForm({ ...form, retirementtype: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.retirementdate} onChange={(e) => setForm({ ...form, retirementdate: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Agency" value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="Recycle value" value={form.recyclevalue} onChange={(e) => setForm({ ...form, recyclevalue: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Details" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></Grid>
            <Grid item xs={12}><Button variant="contained" onClick={retire}>Save retirement</Button></Grid>
          </Grid>
        </Paper>
        <Paper sx={{ height: 430 }}><DataGrid rows={retirements} columns={retirementColumns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

export function AssetNewReportsPage() {
  const [data, setData] = useState({ totals: {}, departmentwise: [], categorywise: [], statuswise: [], retirementstatus: [], demand: [], assets: [] });
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/assetsnew/reports", { params: { colid: global1.colid } });
      setData(res.data || data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const cards = [
    ["Total assets", data.totals?.total || 0, "#2563eb"],
    ["Available", data.totals?.available || 0, "#16a34a"],
    ["Assigned", data.totals?.assigned || 0, "#f97316"],
    ["Retired / recycled", data.totals?.retired || 0, "#dc2626"]
  ];
  const columns = assetColumns(() => {}).filter((col) => col.field !== "code");
  return (
    <MenuPageShell title="Asset reports">
      <Box p={3}>
        <Header title="Asset reports" subtitle="Departmentwise status, categorywise availability, assignment status, retirement status and demand forecast." />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}><Button startIcon={<Refresh />} onClick={load}>Refresh</Button><Button startIcon={<Print />} variant="outlined" onClick={() => window.print()}>Print report</Button></Stack>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {cards.map(([label, value, color]) => <Grid item xs={12} md={3} key={label}><Card sx={{ borderTop: `4px solid ${color}` }}><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></CardContent></Card></Grid>)}
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><ChartBox title="Departmentwise asset status" data={data.departmentwise} /></Grid>
          <Grid item xs={12} md={6}><PieBox title="Categorywise asset availability" data={data.categorywise} /></Grid>
          <Grid item xs={12} md={6}><PieBox title="Assignment status" data={data.statuswise} /></Grid>
          <Grid item xs={12} md={6}><ChartBox title="Demand forecast by issue frequency" data={(data.demand || []).map((row) => ({ name: row.name, count: row.assignments }))} /></Grid>
        </Grid>
        <Paper sx={{ height: 520, mt: 2 }}><DataGrid rows={(data.assets || []).map((row) => ({ ...row, id: row._id }))} columns={columns} loading={loading} slots={{ toolbar: GridToolbar }} pageSizeOptions={[25, 50, 100]} /></Paper>
      </Box>
    </MenuPageShell>
  );
}

function ChartBox({ title, data }) {
  return (
    <Paper sx={{ p: 2, height: 340 }}>
      <Typography fontWeight={900}>{title}</Typography>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#2563eb" /></BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

function PieBox({ title, data }) {
  return (
    <Paper sx={{ p: 2, height: 340 }}>
      <Typography fontWeight={900}>{title}</Typography>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart><Pie data={data} dataKey="count" nameKey="name" outerRadius={95} label>{(data || []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}
