import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/Save";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
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
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colors = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed", "#0891b2", "#eab308", "#db2777"];
const emptyDashboard = {
  id: "",
  dashboardname: "",
  role: global1.role || "All",
  description: "",
  status: "Active",
  widgets: []
};
const roleOptions = ["All", "Admin", "Faculty", "Student"];

const apiRows = (response) => response?.data?.data || [];
const defaultAcademicYears = ["2029-30", "2028-29", "2027-28", "2026-27", "2025-26", "2024-25", "2023-24"];

const chartHeight = 270;

function DashboardPageFrame({ title, children, showNav = true }) {
  return (
    <MenuPageShell title={title}>
      <Box sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} gap={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">Create reusable dashboard widgets and assemble rolewise dashboards.</Typography>
          </Box>
          {showNav && (
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button component={RouterLink} to="/dashboard-widgets" variant="outlined">Widgets</Button>
              <Button component={RouterLink} to="/dashboard-widget-builder" variant="outlined">Builder</Button>
              <Button component={RouterLink} to="/dashboard-widget-view" variant="contained">View</Button>
            </Stack>
          )}
        </Stack>
        {children}
      </Box>
    </MenuPageShell>
  );
}

function WidgetChart({ widget, data = [] }) {
  const valueKey = widget?.valuekey || "count";
  const valueName = widget?.valuename || "Count";

  if (!data.length) {
    return (
      <Box sx={{ height: chartHeight, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
        No data available
      </Box>
    );
  }

  if (widget?.charttype === "pie") {
    return (
      <Box sx={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey="name" outerRadius={90} label>
              {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => Number(value || 0).toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={65} />
          <YAxis allowDecimals={false} tickFormatter={(value) => Number(value || 0).toLocaleString()} />
          <Tooltip formatter={(value) => Number(value || 0).toLocaleString()} />
          <Bar dataKey={valueKey} name={valueName} radius={[6, 6, 0, 0]}>
            {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function WidgetGrid({ rows = [] }) {
  if (!rows.length) return null;
  const first = rows[0] || {};
  const preferred = [
    "academicyear", "year", "month", "department", "role", "employeename", "employeeemail", "employee", "empid",
    "facultyname", "facultyemail", "program", "programcode", "semester", "type", "subject", "course", "coursecode",
    "category", "categorytype", "item", "feegroup", "feeitem", "feecategory", "student", "regno", "name", "email",
    "classdate", "classtime", "total", "present", "average", "amount", "paid", "balance", "concession", "days",
    "status", "stage", "applicationstatus", "paymentstatus", "enrollmentstatus", "validationstatus", "paystatus",
    "assetid", "store", "assignedto", "assignedtoemail", "condition", "createdAt"
  ];
  const fields = preferred.filter((field) => Object.prototype.hasOwnProperty.call(first, field));
  const columns = fields.map((field) => ({
    field,
    headerName: field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase()),
    minWidth: ["facultyemail", "course", "subject"].includes(field) ? 190 : 120,
    flex: ["facultyemail", "course", "subject"].includes(field) ? 1 : undefined
  }));
  return (
    <Box sx={{ height: 320, mt: 2 }}>
      <DataGrid
        rows={rows.map((row, index) => ({ id: row._id || row.classid || index + 1, ...row }))}
        columns={columns}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        slots={{ toolbar: GridToolbar }}
        disableRowSelectionOnClick
      />
    </Box>
  );
}

function WidgetCard({
  widget,
  data,
  gridRows,
  action,
  academicYears = [],
  faculties = [],
  selectedAcademicYear = "",
  selectedFacultyEmail = "",
  secondaryOptions = [],
  selectedSecondaryValue = "",
  secondaryFilterLabel = "",
  onAcademicYearChange,
  onFacultyChange,
  onSecondaryFilterChange
}) {
  const years = academicYears.length ? academicYears : defaultAcademicYears;
  return (
    <Card sx={{ height: "100%", borderRadius: 2, boxShadow: "0 14px 35px rgba(15,23,42,0.08)" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>{widget.title}</Typography>
            <Typography variant="body2" color="text.secondary">{widget.description}</Typography>
          </Box>
          <Chip size="small" label={widget.charttype} color={widget.charttype === "pie" ? "success" : "primary"} />
        </Stack>
        {widget.requiresAcademicYear && (
          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ mb: 2 }}>
            <TextField
              select
              size="small"
              label="Academic year"
              value={selectedAcademicYear || years[0] || ""}
              onChange={(event) => onAcademicYearChange?.(widget.widgetid, event.target.value)}
              sx={{ minWidth: 190 }}
            >
              {years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
            </TextField>
            {widget.requiresFaculty && (
              <Autocomplete
                size="small"
                options={faculties}
                value={faculties.find((faculty) => faculty.facultyemail === selectedFacultyEmail) || null}
                getOptionLabel={(option) => option.label || option.facultyname || option.facultyemail || ""}
                onChange={(_, value) => onFacultyChange?.(widget.widgetid, value?.facultyemail || "")}
                renderInput={(params) => <TextField {...params} label="Faculty" />}
                sx={{ minWidth: 270, flex: 1 }}
              />
            )}
            {!!secondaryFilterLabel && (
              <TextField
                select
                size="small"
                label={secondaryFilterLabel}
                value={selectedSecondaryValue || ""}
                onChange={(event) => onSecondaryFilterChange?.(widget.widgetid, event.target.value)}
                sx={{ minWidth: 190 }}
              >
                <MenuItem value="">All</MenuItem>
                {(secondaryOptions || []).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </TextField>
            )}
          </Stack>
        )}
        <WidgetChart widget={widget} data={data} />
        {widget.showGrid && <WidgetGrid rows={gridRows} />}
        {action}
      </CardContent>
    </Card>
  );
}

function useWidgetCatalog() {
  const [widgets, setWidgets] = useState([]);
  const [widgetData, setWidgetData] = useState({});
  const [widgetGrid, setWidgetGrid] = useState({});
  const [widgetMeta, setWidgetMeta] = useState({});
  const [widgetYears, setWidgetYears] = useState({});
  const [widgetFaculty, setWidgetFaculty] = useState({});
  const [widgetSecondary, setWidgetSecondary] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchWidgetData = useCallback(async (widget, academicYear = "", facultyemail = "", secondaryValue = "") => {
    const dataRes = await ep1.get("/api/v2/dashboard-widget-data", {
      params: {
        colid: global1.colid,
        widgetid: widget.widgetid,
        ...(academicYear ? { academicyear: academicYear } : {}),
        ...(facultyemail ? { facultyemail } : {}),
        ...(secondaryValue ? { secondaryValue } : {})
      }
    });
    return dataRes;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const widgetRes = await ep1.get("/api/v2/dashboard-widgets");
      const catalog = apiRows(widgetRes);
      setWidgets(catalog);
      const pairs = await Promise.all(catalog.map(async (widget) => {
        const dataRes = await fetchWidgetData(widget, widgetYears[widget.widgetid], widgetFaculty[widget.widgetid], widgetSecondary[widget.widgetid]);
        return [widget.widgetid, dataRes];
      }));
      const nextData = {};
      const nextGrid = {};
      const nextMeta = {};
      const nextYears = {};
      const nextFaculty = {};
      const nextSecondary = {};
      pairs.forEach(([widgetid, dataRes]) => {
        nextData[widgetid] = apiRows(dataRes);
        nextGrid[widgetid] = dataRes.data?.grid || [];
        nextMeta[widgetid] = {
          academicYears: dataRes.data?.academicYears || [],
          selectedAcademicYear: dataRes.data?.selectedAcademicYear || "",
          faculties: dataRes.data?.faculties || [],
          selectedFacultyEmail: dataRes.data?.selectedFacultyEmail || "",
          secondaryOptions: dataRes.data?.secondaryOptions || [],
          selectedSecondaryValue: dataRes.data?.selectedSecondaryValue || "",
          secondaryFilterLabel: dataRes.data?.secondaryFilterLabel || ""
        };
        if (dataRes.data?.selectedAcademicYear) {
          nextYears[widgetid] = dataRes.data.selectedAcademicYear;
        }
        if (dataRes.data?.selectedFacultyEmail) {
          nextFaculty[widgetid] = dataRes.data.selectedFacultyEmail;
        }
        if (dataRes.data?.selectedSecondaryValue) {
          nextSecondary[widgetid] = dataRes.data.selectedSecondaryValue;
        }
      });
      setWidgetData(nextData);
      setWidgetGrid(nextGrid);
      setWidgetMeta(nextMeta);
      setWidgetYears((current) => ({ ...nextYears, ...current }));
      setWidgetFaculty((current) => ({ ...nextFaculty, ...current }));
      setWidgetSecondary((current) => ({ ...nextSecondary, ...current }));
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Unable to load widgets");
    } finally {
      setLoading(false);
    }
  }, [fetchWidgetData, widgetYears, widgetFaculty, widgetSecondary]);

  const changeAcademicYear = useCallback(async (widgetid, academicYear) => {
    const widget = widgets.find((item) => item.widgetid === widgetid);
    if (!widget) return;
    setWidgetYears((current) => ({ ...current, [widgetid]: academicYear }));
    try {
      const dataRes = await fetchWidgetData(widget, academicYear, widgetFaculty[widgetid], widgetSecondary[widgetid]);
      setWidgetData((current) => ({ ...current, [widgetid]: apiRows(dataRes) }));
      setWidgetGrid((current) => ({ ...current, [widgetid]: dataRes.data?.grid || [] }));
      setWidgetMeta((current) => ({
        ...current,
        [widgetid]: {
          academicYears: dataRes.data?.academicYears || current[widgetid]?.academicYears || [],
          selectedAcademicYear: dataRes.data?.selectedAcademicYear || academicYear,
          faculties: dataRes.data?.faculties || current[widgetid]?.faculties || [],
          selectedFacultyEmail: dataRes.data?.selectedFacultyEmail || widgetFaculty[widgetid] || "",
          secondaryOptions: dataRes.data?.secondaryOptions || current[widgetid]?.secondaryOptions || [],
          selectedSecondaryValue: dataRes.data?.selectedSecondaryValue || widgetSecondary[widgetid] || "",
          secondaryFilterLabel: dataRes.data?.secondaryFilterLabel || current[widgetid]?.secondaryFilterLabel || ""
        }
      }));
      if (dataRes.data?.selectedFacultyEmail) {
        setWidgetFaculty((current) => ({ ...current, [widgetid]: dataRes.data.selectedFacultyEmail }));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Unable to load widget data");
    }
  }, [fetchWidgetData, widgetFaculty, widgetSecondary, widgets]);

  const changeFaculty = useCallback(async (widgetid, facultyemail) => {
    const widget = widgets.find((item) => item.widgetid === widgetid);
    if (!widget) return;
    setWidgetFaculty((current) => ({ ...current, [widgetid]: facultyemail }));
    try {
      const dataRes = await fetchWidgetData(widget, widgetYears[widgetid], facultyemail, widgetSecondary[widgetid]);
      setWidgetData((current) => ({ ...current, [widgetid]: apiRows(dataRes) }));
      setWidgetGrid((current) => ({ ...current, [widgetid]: dataRes.data?.grid || [] }));
      setWidgetMeta((current) => ({
        ...current,
        [widgetid]: {
          academicYears: dataRes.data?.academicYears || current[widgetid]?.academicYears || [],
          selectedAcademicYear: dataRes.data?.selectedAcademicYear || widgetYears[widgetid] || "",
          faculties: dataRes.data?.faculties || current[widgetid]?.faculties || [],
          selectedFacultyEmail: dataRes.data?.selectedFacultyEmail || facultyemail,
          secondaryOptions: dataRes.data?.secondaryOptions || current[widgetid]?.secondaryOptions || [],
          selectedSecondaryValue: dataRes.data?.selectedSecondaryValue || widgetSecondary[widgetid] || "",
          secondaryFilterLabel: dataRes.data?.secondaryFilterLabel || current[widgetid]?.secondaryFilterLabel || ""
        }
      }));
      if (dataRes.data?.selectedAcademicYear) {
        setWidgetYears((current) => ({ ...current, [widgetid]: dataRes.data.selectedAcademicYear }));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Unable to load widget data");
    }
  }, [fetchWidgetData, widgetYears, widgetSecondary, widgets]);

  const changeSecondaryFilter = useCallback(async (widgetid, secondaryValue) => {
    const widget = widgets.find((item) => item.widgetid === widgetid);
    if (!widget) return;
    setWidgetSecondary((current) => ({ ...current, [widgetid]: secondaryValue }));
    try {
      const dataRes = await fetchWidgetData(widget, widgetYears[widgetid], widgetFaculty[widgetid], secondaryValue);
      setWidgetData((current) => ({ ...current, [widgetid]: apiRows(dataRes) }));
      setWidgetGrid((current) => ({ ...current, [widgetid]: dataRes.data?.grid || [] }));
      setWidgetMeta((current) => ({
        ...current,
        [widgetid]: {
          academicYears: dataRes.data?.academicYears || current[widgetid]?.academicYears || [],
          selectedAcademicYear: dataRes.data?.selectedAcademicYear || widgetYears[widgetid] || "",
          faculties: dataRes.data?.faculties || current[widgetid]?.faculties || [],
          selectedFacultyEmail: dataRes.data?.selectedFacultyEmail || widgetFaculty[widgetid] || "",
          secondaryOptions: dataRes.data?.secondaryOptions || current[widgetid]?.secondaryOptions || [],
          selectedSecondaryValue: dataRes.data?.selectedSecondaryValue || secondaryValue,
          secondaryFilterLabel: dataRes.data?.secondaryFilterLabel || current[widgetid]?.secondaryFilterLabel || ""
        }
      }));
      if (dataRes.data?.selectedAcademicYear) {
        setWidgetYears((current) => ({ ...current, [widgetid]: dataRes.data.selectedAcademicYear }));
      }
      if (dataRes.data?.selectedFacultyEmail) {
        setWidgetFaculty((current) => ({ ...current, [widgetid]: dataRes.data.selectedFacultyEmail }));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "Unable to load widget data");
    }
  }, [fetchWidgetData, widgetFaculty, widgetYears, widgets]);

  useEffect(() => {
    load();
    // Load once on mount; individual academic year changes refresh their own widget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    widgets,
    widgetData,
    widgetGrid,
    widgetMeta,
    widgetYears,
    widgetFaculty,
    widgetSecondary,
    loading,
    message,
    reload: load,
    changeAcademicYear,
    changeFaculty,
    changeSecondaryFilter
  };
}

export function DashboardWidgetCatalogPage() {
  const { widgets, widgetData, widgetGrid, widgetMeta, widgetYears, widgetFaculty, widgetSecondary, loading, message, changeAcademicYear, changeFaculty, changeSecondaryFilter } = useWidgetCatalog();
  const rows = widgets.map((widget, index) => ({ id: widget.widgetid, sr: index + 1, ...widget }));
  const columns = [
    { field: "sr", headerName: "#", width: 70 },
    { field: "title", headerName: "Widget", flex: 1, minWidth: 220 },
    { field: "category", headerName: "Category", width: 140 },
    { field: "charttype", headerName: "Chart", width: 130 },
    { field: "datasource", headerName: "Source", width: 140 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 260 }
  ];

  return (
    <DashboardPageFrame title="Dashboard widgets">
      {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
      {loading ? <CircularProgress /> : (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {widgets.map((widget) => (
              <Grid item xs={12} lg={6} key={widget.widgetid}>
                <WidgetCard
                  widget={widget}
                  data={widgetData[widget.widgetid]}
                  gridRows={widgetGrid[widget.widgetid]}
                  academicYears={widgetMeta[widget.widgetid]?.academicYears}
                  faculties={widgetMeta[widget.widgetid]?.faculties}
                  selectedAcademicYear={widgetYears[widget.widgetid] || widgetMeta[widget.widgetid]?.selectedAcademicYear}
                  selectedFacultyEmail={widgetFaculty[widget.widgetid] || widgetMeta[widget.widgetid]?.selectedFacultyEmail}
                  secondaryOptions={widgetMeta[widget.widgetid]?.secondaryOptions}
                  selectedSecondaryValue={widgetSecondary[widget.widgetid] || widgetMeta[widget.widgetid]?.selectedSecondaryValue}
                  secondaryFilterLabel={widgetMeta[widget.widgetid]?.secondaryFilterLabel}
                  onAcademicYearChange={changeAcademicYear}
                  onFacultyChange={changeFaculty}
                  onSecondaryFilterChange={changeSecondaryFilter}
                />
              </Grid>
            ))}
          </Grid>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Widget list</Typography>
            <Box sx={{ height: 360 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                slots={{ toolbar: GridToolbar }}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </>
      )}
    </DashboardPageFrame>
  );
}

export function DashboardWidgetBuilderPage() {
  const navigate = useNavigate();
  const { widgets, widgetData, widgetGrid, widgetMeta, widgetYears, widgetFaculty, widgetSecondary, loading, message, changeAcademicYear, changeFaculty, changeSecondaryFilter } = useWidgetCatalog();
  const [dashboards, setDashboards] = useState([]);
  const [form, setForm] = useState(emptyDashboard);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [dragItem, setDragItem] = useState(null);
  const [availableCategory, setAvailableCategory] = useState("All");

  const widgetMap = useMemo(() => new Map(widgets.map((widget) => [widget.widgetid, widget])), [widgets]);
  const selectedIds = useMemo(() => new Set(form.widgets.map((item) => item.widgetid)), [form.widgets]);
  const availableCategories = useMemo(() => {
    const categories = widgets.map((widget) => widget.category || "Uncategorized").filter(Boolean);
    return ["All", ...Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b))];
  }, [widgets]);
  const availableWidgets = widgets.filter((widget) => {
    const categoryMatch = availableCategory === "All" || (widget.category || "Uncategorized") === availableCategory;
    return categoryMatch && !selectedIds.has(widget.widgetid);
  });

  const loadDashboards = useCallback(async () => {
    try {
      const res = await ep1.get("/api/v2/dashboard-widget-dashboards", { params: { colid: global1.colid } });
      setDashboards(apiRows(res));
    } catch (err) {
      setNotice(err.response?.data?.message || err.message || "Unable to load dashboards");
    }
  }, []);

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  const resetForm = () => setForm({ ...emptyDashboard, role: global1.role || "All" });

  const addWidget = (widget) => {
    if (selectedIds.has(widget.widgetid)) return;
    setForm((current) => ({
      ...current,
      widgets: [...current.widgets, { widgetid: widget.widgetid, title: widget.title, order: current.widgets.length }]
    }));
  };

  const removeWidget = (widgetid) => {
    setForm((current) => ({
      ...current,
      widgets: current.widgets.filter((item) => item.widgetid !== widgetid).map((item, index) => ({ ...item, order: index }))
    }));
  };

  const handleDropToSelected = (targetIndex = form.widgets.length) => {
    if (!dragItem) return;
    if (dragItem.source === "available") {
      const widget = widgetMap.get(dragItem.widgetid);
      if (!widget || selectedIds.has(widget.widgetid)) return;
      setForm((current) => {
        const next = [...current.widgets];
        next.splice(targetIndex, 0, { widgetid: widget.widgetid, title: widget.title, order: targetIndex });
        return { ...current, widgets: next.map((item, index) => ({ ...item, order: index })) };
      });
    }
    if (dragItem.source === "selected") {
      setForm((current) => {
        const next = Array.from(current.widgets);
        const [moved] = next.splice(dragItem.index, 1);
        const adjustedIndex = dragItem.index < targetIndex ? targetIndex - 1 : targetIndex;
        next.splice(adjustedIndex, 0, moved);
        return { ...current, widgets: next.map((item, index) => ({ ...item, order: index })) };
      });
    }
    setDragItem(null);
  };

  const saveDashboard = async () => {
    setSaving(true);
    setNotice("");
    try {
      const payload = { ...form, colid: global1.colid, user: global1.user };
      const res = await ep1.post("/api/v2/dashboard-widget-dashboards", payload);
      setNotice("Dashboard saved");
      setForm((current) => ({ ...current, id: res.data?.data?._id || current.id }));
      await loadDashboards();
    } catch (err) {
      setNotice(err.response?.data?.message || err.message || "Unable to save dashboard");
    } finally {
      setSaving(false);
    }
  };

  const editDashboard = (row) => {
    setForm({
      id: row._id,
      dashboardname: row.dashboardname || "",
      role: row.role || "All",
      description: row.description || "",
      status: row.status || "Active",
      widgets: (row.widgets || []).sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteDashboard = async (row) => {
    if (!window.confirm("Delete this dashboard?")) return;
    setSaving(true);
    try {
      await ep1.post("/api/v2/dashboard-widget-dashboards-delete", { id: row._id, colid: global1.colid });
      await loadDashboards();
      if (form.id === row._id) resetForm();
    } catch (err) {
      setNotice(err.response?.data?.message || err.message || "Unable to delete dashboard");
    } finally {
      setSaving(false);
    }
  };

  const dashboardRows = dashboards.map((item, index) => ({
    id: item._id,
    sr: index + 1,
    widgetcount: item.widgets?.length || 0,
    ...item
  }));

  const dashboardColumns = [
    { field: "sr", headerName: "#", width: 70 },
    { field: "dashboardname", headerName: "Dashboard", flex: 1, minWidth: 210 },
    { field: "role", headerName: "Role", width: 140 },
    { field: "status", headerName: "Status", width: 130 },
    { field: "widgetcount", headerName: "Widgets", width: 110 },
    {
      field: "actions",
      headerName: "Actions",
      width: 190,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" gap={0.5}>
          <IconButton size="small" onClick={() => editDashboard(params.row)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => navigate(`/dashboard-widget-view?id=${params.row._id}`)}><VisibilityIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => deleteDashboard(params.row)}><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      )
    }
  ];

  return (
    <DashboardPageFrame title="Dashboard builder">
      {(message || notice) && <Alert severity={(message || notice).includes("Unable") ? "error" : "info"} sx={{ mb: 2 }}>{message || notice}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Dashboard name" value={form.dashboardname} onChange={(e) => setForm({ ...form, dashboardname: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Autocomplete
              freeSolo
              options={roleOptions}
              value={form.role}
              onInputChange={(_, value) => setForm({ ...form, role: value })}
              onChange={(_, value) => setForm({ ...form, role: value || "" })}
              renderInput={(params) => <TextField {...params} label="Role" />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack direction="row" gap={1}>
              <Button fullWidth variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={saveDashboard} disabled={saving}>
                Save
              </Button>
              <Button variant="outlined" onClick={resetForm}>New</Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, minHeight: 420 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={1.5} sx={{ mb: 1.5 }}>
                <Typography variant="h6" fontWeight={800}>Available widgets</Typography>
                <TextField
                  select
                  size="small"
                  label="Category"
                  value={availableCategory}
                  onChange={(event) => setAvailableCategory(event.target.value)}
                  sx={{ minWidth: 190 }}
                >
                  {availableCategories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack gap={1}>
                {availableWidgets.map((widget, index) => (
                  <Paper
                    key={widget.widgetid}
                    draggable
                    onDragStart={() => setDragItem({ source: "available", widgetid: widget.widgetid, index })}
                    sx={{ p: 1.5, border: "1px solid #e2e8f0", cursor: "grab" }}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      <DragIndicatorIcon color="action" />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700}>{widget.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{widget.description}</Typography>
                      </Box>
                      <IconButton color="primary" onClick={() => addWidget(widget)}><AddIcon /></IconButton>
                    </Stack>
                  </Paper>
                ))}
                {!availableWidgets.length && (
                  <Box sx={{ p: 3, border: "1px dashed #cbd5e1", borderRadius: 2, textAlign: "center", color: "text.secondary" }}>
                    No available widgets in this category.
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper
              sx={{ p: 2, minHeight: 420 }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDropToSelected(form.widgets.length)}
            >
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Selected dashboard widgets</Typography>
              <Stack gap={1}>
                {form.widgets.map((item, index) => {
                  const widget = widgetMap.get(item.widgetid) || item;
                  return (
                    <Paper
                      key={item.widgetid}
                      draggable
                      onDragStart={() => setDragItem({ source: "selected", widgetid: item.widgetid, index })}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.stopPropagation();
                        handleDropToSelected(index);
                      }}
                      sx={{ p: 1.5, border: "1px solid #bfdbfe", background: "#eff6ff", cursor: "grab" }}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <DragIndicatorIcon color="primary" />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={800}>{index + 1}. {widget.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{widget.description}</Typography>
                        </Box>
                        <IconButton color="error" onClick={() => removeWidget(item.widgetid)}><DeleteIcon /></IconButton>
                      </Stack>
                    </Paper>
                  );
                })}
                {!form.widgets.length && (
                  <Box sx={{ p: 4, border: "1px dashed #94a3b8", borderRadius: 2, textAlign: "center", color: "text.secondary" }}>
                    Drag widgets here or click the plus button.
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {!!form.widgets.length && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {form.widgets.map((item) => {
            const widget = widgetMap.get(item.widgetid) || item;
            return (
              <Grid item xs={12} lg={6} key={item.widgetid}>
                <WidgetCard
                  widget={widget}
                  data={widgetData[item.widgetid]}
                  gridRows={widgetGrid[item.widgetid]}
                  academicYears={widgetMeta[item.widgetid]?.academicYears}
                  faculties={widgetMeta[item.widgetid]?.faculties}
                  selectedAcademicYear={widgetYears[item.widgetid] || widgetMeta[item.widgetid]?.selectedAcademicYear}
                  selectedFacultyEmail={widgetFaculty[item.widgetid] || widgetMeta[item.widgetid]?.selectedFacultyEmail}
                  secondaryOptions={widgetMeta[item.widgetid]?.secondaryOptions}
                  selectedSecondaryValue={widgetSecondary[item.widgetid] || widgetMeta[item.widgetid]?.selectedSecondaryValue}
                  secondaryFilterLabel={widgetMeta[item.widgetid]?.secondaryFilterLabel}
                  onAcademicYearChange={changeAcademicYear}
                  onFacultyChange={changeFaculty}
                  onSecondaryFilterChange={changeSecondaryFilter}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Saved dashboards</Typography>
        <Box sx={{ height: 380 }}>
          <DataGrid
            rows={dashboardRows}
            columns={dashboardColumns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </DashboardPageFrame>
  );
}

export function DashboardWidgetViewPage() {
  const [params] = useSearchParams();
  const { widgets, widgetData, widgetGrid, widgetMeta, widgetYears, widgetFaculty, widgetSecondary, loading, message, changeAcademicYear, changeFaculty, changeSecondaryFilter } = useWidgetCatalog();
  const [dashboards, setDashboards] = useState([]);
  const [selectedId, setSelectedId] = useState(params.get("id") || "");
  const widgetMap = useMemo(() => new Map(widgets.map((widget) => [widget.widgetid, widget])), [widgets]);

  useEffect(() => {
    const loadDashboards = async () => {
      const res = await ep1.get("/api/v2/dashboard-widget-dashboards", { params: { colid: global1.colid, status: "Active" } });
      const rows = apiRows(res);
      setDashboards(rows);
      if (!selectedId && rows.length) {
        const currentRole = String(global1.role || "").toLowerCase();
        const preferred = rows.find((row) => String(row.role || "").toLowerCase() === currentRole) || rows[0];
        setSelectedId(preferred._id);
      }
    };
    loadDashboards().catch(() => setDashboards([]));
  }, [selectedId]);

  const selectedDashboard = dashboards.find((item) => item._id === selectedId);
  const selectedWidgets = (selectedDashboard?.widgets || []).slice().sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  return (
    <DashboardPageFrame title="Dashboard view" showNav={false}>
      {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField select fullWidth label="Select dashboard" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {dashboards.map((dashboard) => (
                <MenuItem key={dashboard._id} value={dashboard._id}>{dashboard.dashboardname} ({dashboard.role})</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            {selectedDashboard && (
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Chip label={`Role: ${selectedDashboard.role}`} color="primary" />
                <Chip label={`${selectedWidgets.length} widgets`} color="success" />
                {selectedDashboard.description && <Chip label={selectedDashboard.description} />}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Paper>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {selectedWidgets.map((item) => {
            const widget = widgetMap.get(item.widgetid) || item;
            return (
              <Grid item xs={12} lg={6} key={item.widgetid}>
                <WidgetCard
                  widget={widget}
                  data={widgetData[item.widgetid]}
                  gridRows={widgetGrid[item.widgetid]}
                  academicYears={widgetMeta[item.widgetid]?.academicYears}
                  faculties={widgetMeta[item.widgetid]?.faculties}
                  selectedAcademicYear={widgetYears[item.widgetid] || widgetMeta[item.widgetid]?.selectedAcademicYear}
                  selectedFacultyEmail={widgetFaculty[item.widgetid] || widgetMeta[item.widgetid]?.selectedFacultyEmail}
                  secondaryOptions={widgetMeta[item.widgetid]?.secondaryOptions}
                  selectedSecondaryValue={widgetSecondary[item.widgetid] || widgetMeta[item.widgetid]?.selectedSecondaryValue}
                  secondaryFilterLabel={widgetMeta[item.widgetid]?.secondaryFilterLabel}
                  onAcademicYearChange={changeAcademicYear}
                  onFacultyChange={changeFaculty}
                  onSecondaryFilterChange={changeSecondaryFilter}
                />
              </Grid>
            );
          })}
          {!selectedWidgets.length && (
            <Grid item xs={12}>
              <Alert severity="info">No dashboard selected or no widgets added yet.</Alert>
            </Grid>
          )}
        </Grid>
      )}
    </DashboardPageFrame>
  );
}
