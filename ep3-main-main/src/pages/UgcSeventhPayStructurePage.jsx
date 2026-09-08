import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { AddCircleOutline, ArrowBack, Refresh } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const UgcSeventhPayStructurePage = () => {
  const colid = useMemo(() => global1.colid, []);
  const currentUser = useMemo(() => global1.user || global1.name || "", []);
  const [templates, setTemplates] = useState([]);
  const [gradeKey, setGradeKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.key === gradeKey),
    [templates, gradeKey]
  );

  const componentRows = useMemo(
    () => (selectedTemplate?.components || []).map((item, index) => ({
      id: item.id || index + 1,
      ...item
    })),
    [selectedTemplate]
  );

  const loadTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ep1.get("/hr/ugc-seventh-pay-templates");
      const nextTemplates = res.data?.data || [];
      setTemplates(nextTemplates);
      setGradeKey((prev) => prev || nextTemplates[0]?.key || "");
    } catch (err) {
      setError(err.response?.data?.error || "Error loading UGC seventh pay structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async () => {
    if (!colid) {
      setError("College id is not available.");
      return;
    }
    if (!gradeKey) {
      setError("Please select a pay structure grade.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await ep1.post("/hr/create-ugc-seventh-pay-structure", {
        colid,
        user: global1.user,
        name: global1.name,
        gradeKey
      });
      const createdStructure = res.data?.data?.structure;
      const componentCount = res.data?.data?.components?.length || 0;
      setMessage(`Salary structure created successfully. ${componentCount} components added for ${createdStructure?.struture || selectedTemplate?.label}.`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error creating salary structure");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "component", headerName: "Component", minWidth: 180, flex: 1 },
    {
      field: "amount",
      headerName: "Amount",
      width: 140,
      type: "number",
      valueFormatter: (params) => Number(params.value || 0).toLocaleString("en-IN")
    },
    { field: "type", headerName: "Type", width: 140 },
    { field: "level", headerName: "Level", minWidth: 180, flex: 1 }
  ];

  return (
    <MenuPageShell title="UGC Seventh Pay Structure">
      <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                UGC Seventh Commission Pay Structure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a grade to create an HR salary structure and its default components.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/dashdashfacnew"
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              Back
            </Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <FormControl fullWidth>
              <InputLabel id="ugc-pay-grade-label">Pay structure grade</InputLabel>
              <Select
                labelId="ugc-pay-grade-label"
                label="Pay structure grade"
                value={gradeKey}
                onChange={(event) => {
                  setGradeKey(event.target.value);
                  setMessage("");
                }}
              >
                {templates.map((template) => (
                  <MenuItem key={template.key} value={template.key}>
                    {template.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadTemplates}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              Refresh
            </Button>
          </Stack>

          {selectedTemplate && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={selectedTemplate.paycommission} color="primary" variant="outlined" />
              <Chip label={selectedTemplate.designation} />
              <Chip label={selectedTemplate.level} />
              <Chip label={`Basic ${Number(selectedTemplate.basic || 0).toLocaleString("en-IN")}`} />
            </Stack>
          )}

          <Box sx={{ height: 360, width: "100%" }}>
            <DataGrid
              rows={componentRows}
              columns={columns}
              loading={loading}
              pageSizeOptions={[5, 10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } }
              }}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
            />
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={handleCreate}
              disabled={saving || loading || !gradeKey}
            >
              {saving ? "Creating..." : "Create Salary Structure"}
            </Button>
            <Button component={RouterLink} to="/dashmhrstructure" variant="text">
              View Salary Structures
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            College ID: {colid || "Not available"} {currentUser ? `| User: ${currentUser}` : ""}
          </Typography>
        </Stack>
      </Paper>
      </Container>
    </MenuPageShell>
  );
};

export default UgcSeventhPayStructurePage;
