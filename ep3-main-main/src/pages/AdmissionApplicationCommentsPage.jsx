import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SaveIcon from "@mui/icons-material/Save";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const emptyFilter = { field: "", value: "" };
const statusOptions = ["Enrolled", "Partially Enrolled", "Hold"];

const getFieldValue = (row, field) => {
  if (field.startsWith("extraFields.")) return row.extraFields?.[field.replace("extraFields.", "")] || "";
  const value = row[field];
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
};

export default function AdmissionApplicationCommentsPage() {
  const [fieldList, setFieldList] = useState([]);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState([{ ...emptyFilter }]);
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetStatus, setTargetStatus] = useState("Enrolled");
  const [commonComment, setCommonComment] = useState("");
  const [commentsById, setCommentsById] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOptions();
    searchApplications();
  }, []);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const res = await ep1.get("/api/v2/admission-application-management/options", {
        params: { colid: global1.colid }
      });
      setFieldList(res.data?.fields || []);
      setOptions(res.data?.options || {});
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load application fields");
    } finally {
      setLoadingOptions(false);
    }
  };

  const activeFilters = (sourceFilters = filters) => (Array.isArray(sourceFilters) ? sourceFilters : filters)
    .filter((filter) => filter.field && String(filter.value || "").trim())
    .map((filter) => ({ field: filter.field, value: filter.value }));

  const searchApplications = async (sourceFilters = filters) => {
    try {
      setLoadingRows(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/admission-application-management/search", {
        colid: global1.colid,
        filters: activeFilters(sourceFilters)
      });
      setRows(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load applications");
    } finally {
      setLoadingRows(false);
    }
  };

  const updateFilter = (index, patch) => {
    setFilters((prev) => prev.map((filter, itemIndex) => (
      itemIndex === index ? { ...filter, ...patch, ...(patch.field ? { value: "" } : {}) } : filter
    )));
  };

  const removeFilter = (index) => {
    setFilters((prev) => prev.length === 1 ? [{ ...emptyFilter }] : prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const clearFilters = () => {
    const nextFilters = [{ ...emptyFilter }];
    setFilters(nextFilters);
    searchApplications(nextFilters);
  };

  const selectedRows = useMemo(() => rows.filter((row) => selectedIds.includes(row._id)), [rows, selectedIds]);

  useEffect(() => {
    setCommentsById((prev) => {
      const next = {};
      selectedRows.forEach((row) => {
        next[row._id] = prev[row._id] ?? row.applicationcomments ?? "";
      });
      return next;
    });
  }, [selectedRows]);

  const applyCommonComment = () => {
    setCommentsById((prev) => {
      const next = { ...prev };
      selectedRows.forEach((row) => {
        next[row._id] = commonComment;
      });
      return next;
    });
  };

  const saveComments = async () => {
    if (!selectedRows.length) {
      setError("Select at least one application");
      return;
    }
    if (!targetStatus) {
      setError("Select application status");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const items = selectedRows.map((row) => ({
        id: row._id,
        enrollmentstatus: targetStatus,
        applicationcomments: commentsById[row._id] || ""
      }));
      const res = await ep1.post("/api/v2/admission-application-management/bulk-comments-status", {
        colid: global1.colid,
        user: global1.user,
        items
      });
      setMessage(res.data?.msg || "Application comments updated");
      const updatedById = new Map(items.map((item) => [item.id, item]));
      setRows((prevRows) => prevRows.map((row) => {
        const updated = updatedById.get(row._id);
        if (!updated) return row;
        return {
          ...row,
          enrollmentstatus: updated.enrollmentstatus,
          applicationcomments: updated.applicationcomments
        };
      }));
      await loadOptions();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update application comments");
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(() => {
    const preferred = [
      "applicationid",
      "applicationnumber",
      "formid",
      "academicyear",
      "name",
      "email",
      "phone",
      "programapplied",
      "programcode",
      "applicationstatus",
      "enrollmentstatus",
      "applicationcomments",
      "validationstatus"
    ];
    const labels = new Map(fieldList.map((field) => [field.field, field.label]));
    return preferred.map((field) => ({
      field,
      headerName: labels.get(field) || field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      minWidth: field === "applicationcomments" ? 260 : 150,
      flex: field === "applicationcomments" ? 1.4 : 1,
      valueGetter: (params) => getFieldValue(params.row, field)
    }));
  }, [fieldList]);

  return (
    <MenuPageShell title="Application Comments">
      <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f2937" }}>
              Application Comments
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Filter applicants, select one or more rows, then update enrollment status and applicant-wise comments.
            </Typography>
          </Box>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {(loadingOptions || loadingRows || saving) && <LinearProgress />}

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FilterAltIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Dynamic Filters
                </Typography>
              </Stack>
              {filters.map((filter, index) => (
                <Grid container spacing={1.5} key={`filter-${index}`} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={fieldList}
                      getOptionLabel={(option) => option?.label || ""}
                      value={fieldList.find((field) => field.field === filter.field) || null}
                      onChange={(_, value) => updateFilter(index, { field: value?.field || "" })}
                      renderInput={(params) => <TextField {...params} label="Field" size="small" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      freeSolo
                      options={options[filter.field] || []}
                      value={filter.value || ""}
                      onInputChange={(_, value) => updateFilter(index, { value })}
                      onChange={(_, value) => updateFilter(index, { value: value || "" })}
                      renderInput={(params) => <TextField {...params} label="Value" size="small" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button fullWidth variant="outlined" color="error" onClick={() => removeFilter(index)}>
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setFilters((prev) => [...prev, { ...emptyFilter }])}
                >
                  Add Filter
                </Button>
                <Button variant="contained" onClick={() => searchApplications()} disabled={loadingRows}>
                  Apply
                </Button>
                <Button variant="text" onClick={clearFilters}>
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ height: 520, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={selectedIds}
                onRowSelectionModelChange={(model) => setSelectedIds(model)}
                loading={loadingRows}
                slots={{ toolbar: GridToolbar }}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                pageSizeOptions={[25, 50, 100]}
                sx={{
                  "& .MuiDataGrid-columnHeaders": { backgroundColor: "#eef2ff", fontWeight: 700 },
                  "& .MuiDataGrid-cell": { whiteSpace: "normal", lineHeight: 1.35 }
                }}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Enrollment Status"
                  value={targetStatus}
                  onChange={(event) => setTargetStatus(event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Common comment"
                  value={commonComment}
                  onChange={(event) => setCommonComment(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="outlined" onClick={applyCommonComment} disabled={!selectedRows.length}>
                  Apply Comment
                </Button>
              </Grid>
            </Grid>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Selected Applicants ({selectedRows.length})
              </Typography>
              {!selectedRows.length && (
                <Alert severity="info">Select applicants from the grid to add comments.</Alert>
              )}
              {selectedRows.map((row) => (
                <Paper key={row._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography sx={{ fontWeight: 700 }}>{row.name || "Unnamed applicant"}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[row.applicationid || row.applicationnumber, row.email, row.phone].filter(Boolean).join(" | ")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Application Comments"
                        value={commentsById[row._id] || ""}
                        onChange={(event) => setCommentsById((prev) => ({ ...prev, [row._id]: event.target.value }))}
                        onKeyDown={(event) => event.stopPropagation()}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveComments}
                disabled={saving || !selectedRows.length}
              >
                {saving ? "Saving..." : "Save Enrollment Status and Comments"}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </MenuPageShell>
  );
}
