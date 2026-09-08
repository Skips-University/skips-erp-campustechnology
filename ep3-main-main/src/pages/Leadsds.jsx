import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Tooltip,
  InputAdornment,
  Card,
  CardContent,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Note as NoteIcon,
} from "@mui/icons-material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      {(global1.role === 'Admin' || global1.role === 'All' || global1.role === 'CRM') && <GridToolbarExport />}
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter debounceMs={500} />
    </GridToolbarContainer>
  );
};

const Leadsds = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCommDialog, setOpenCommDialog] = useState(false);
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    pipeline_stage: "All",
    lead_temperature: "All",
    source: "",
    search: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    course_interested: "",
    source: "",
    city: "",
    state: "",
    assignedto: "",
    custom_fields: [],
  });

  // State for manual counselor assignment
  const [counselorOptions, setCounselorOptions] = useState([]);
  const [counselorLoading, setCounselorLoading] = useState(false);

  // State for cascading dropdowns
  const [institutions, setInstitutions] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [loadingProgramTypes, setLoadingProgramTypes] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Dynamic Configuration State
  const [pipelineStages, setPipelineStages] = useState([]);
  const [outcomes, setOutcomes] = useState([]);

  const navetodashboard = () => {
    if (global1.role === "Admin" || global1.role === "All" || global1.role === "CRM") {
      navigate("/dashboardcrmds");
    } else {
      navigate("/dashdashfacnew");
    }
  }

  // Search Counselors
  const handleSearchCounselors = async (query) => {
    if (!query) {
      setCounselorOptions([]);
      return;
    }
    setCounselorLoading(true);
    try {
      const res = await ep1.get("/api/v2/searchusersds", {
        params: { colid: global1.colid, query },
      });
      if (res.data.success) {
        setCounselorOptions(res.data.data);
      }
    } catch (err) {
      console.error("Error searching counselors:", err);
    }
    setCounselorLoading(false);
  };

  const checkDuplicate = async (field, value) => {
    if (!value) return;
    try {
      const res = await ep1.get("/api/v2/checkduplicateds", {
        params: { colid: global1.colid, [field]: value },
      });
      if (res.data.exists) {
        const lead = res.data.lead;
        alert(`Lead already exists!\nName: ${lead.name}\nAssigned To: ${lead.assignedto || "Unassigned"}\nPhone: ${lead.phone}\nEmail: ${lead.email}`);

        setOpenDialog(false);
        setFilters(prev => ({ ...prev, search: value }));

        // Manually fetch with new search param
        setLoading(true);
        const params = {
          colid: global1.colid,
          user: global1.user,
          role: global1.role,
          ...filters,
          search: value
        };
        const resStats = await ep1.get("/api/v2/getallleadsds", { params });
        setLeads(resStats.data.data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error checking duplicate:", err);
    }
  };

  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    course_interested: "",
    source: "",
    city: "",
    state: "",
    pipeline_stage: "",
    next_followup_date: "",
    custom_fields: []
  });

  // Helper for Edit Dialog Custom Fields
  const handleEditCustomFieldChange = (index, key, value) => {
    const updatedFields = [...editFormData.custom_fields];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    setEditFormData({ ...editFormData, custom_fields: updatedFields });
  };

  const handleEditRemoveCustomField = (index) => {
    const updatedFields = editFormData.custom_fields.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, custom_fields: updatedFields });
  };

  const [notesData, setNotesData] = useState({
    comments: "",
  });

  const [commData, setCommData] = useState({
    channel: "email",
    subject: "",
    content: "",
  });

  useEffect(() => {
    fetchLeads();
    fetchSources();
    fetchCategories();
    fetchInstitutions();
    fetchInstitutions();
    fetchPipelineStages();
    fetchOutcomes();
  }, []);

  const fetchPipelineStages = async () => {
    try {
      const res = await ep1.get("/api/v2/getallpipelinestageag", {
        params: { colid: global1.colid }
      });
      if (res.data.status === "Success") {
        setPipelineStages(res.data.data.filter(item => item.isactive));
      }
    } catch (err) {
      console.error("Error fetching pipeline stages:", err);
    }
  };

  const fetchOutcomes = async () => {
    try {
      const res = await ep1.get("/api/v2/getalloutcomeag", {
        params: { colid: global1.colid }
      });
      if (res.data.status === "Success") {
        setOutcomes(res.data.data.filter(item => item.isactive));
      }
    } catch (err) {
      console.error("Error fetching outcomes:", err);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        user: global1.user,
        role: global1.role,
        ...filters,
      };
      const res = await ep1.get("/api/v2/getallleadsds", { params });
      let allLeads = res.data.data;

      // Logic: If searching, alert if lead is assigned to someone else.
      // Table shows: Assigned to Me OR Unassigned.
      if (filters.search) {
        const visibleLeads = [];
        const otherLeads = [];

        allLeads.forEach(lead => {
          // Visible if assigned to me OR unassigned
          if (lead.assignedto === global1.user || !lead.assignedto) {
            visibleLeads.push(lead);
          } else {
            otherLeads.push(lead);
          }
        });

        if (otherLeads.length > 0) {
          // Show popup for the first conflicting lead
          const lead = otherLeads[0];
          alert(`Lead exists but is assigned to another counselor!\nName: ${lead.name}\nAssigned To: ${lead.assignedto}\nPhone: ${lead.phone}`);
        }

        setLeads(visibleLeads);
      } else {
        // Not searching, or Admin: Show what backend returned
        // Note: Backend returns Unassigned + Assigned to User. 
        // If we want to hide "Assigned to Other" that might sneak in via backend loose check, we can filter, but backend usually filters.
        setLeads(allLeads);
      }

    } catch (err) {
      console.error("Error fetching leads:", err);
      showSnackbar("Failed to fetch leads", "error");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await ep1.get("/api/v2/getallcategoriesds", {
        params: { colid: global1.colid },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSources = async () => {
    try {
      const res = await ep1.get("/api/v2/getallsourcesds", {
        params: { colid: global1.colid },
      });
      setSources(res.data.data);
    } catch (err) {
      console.error("Error fetching sources:", err);
    }
  };

  const fetchInstitutions = async () => {
    setLoadingInstitutions(true);
    try {
      const res = await ep1.get("/api/v2/getinstitutionsds", {
        params: { colid: global1.colid }
      });
      if (res.data.success) {
        setInstitutions(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching institutions:", err);
    }
    setLoadingInstitutions(false);
  };

  const fetchProgramTypes = async (institution) => {
    if (!institution) {
      setProgramTypes([]);
      return;
    }
    setLoadingProgramTypes(true);
    try {
      const res = await ep1.get("/api/v2/getprogramtypesds", {
        params: { colid: global1.colid, institution }
      });
      if (res.data.success) {
        setProgramTypes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching program types:", err);
    }
    setLoadingProgramTypes(false);
  };

  const fetchPrograms = async (institution, programType) => {
    if (!institution || !programType) {
      setPrograms([]);
      return;
    }
    setLoadingPrograms(true);
    try {
      const res = await ep1.get("/api/v2/getprogramsbyfiltersds", {
        params: { colid: global1.colid, institution, program_type: programType }
      });
      if (res.data.success) {
        setPrograms(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
    setLoadingPrograms(false);
  };

  const handleOpenDialog = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      category: "",
      course_interested: "",
      source: "",
      city: "",
      state: "",
      assignedto: "",
      institution: "",
      program_type: "",
      program: "",
      custom_fields: [],
    });
    setCounselorOptions([]); // Reset options
    setProgramTypes([]);
    setPrograms([]);
    fetchInstitutions(); // Fetch institutions when dialog opens
    setOpenDialog(true);
  };

  const handleAddCustomField = () => {
    setFormData({
      ...formData,
      custom_fields: [...formData.custom_fields, { field_name: "", field_value: "" }]
    });
  };

  const handleRemoveCustomField = (index) => {
    const newCustomFields = formData.custom_fields.filter((_, i) => i !== index);
    setFormData({ ...formData, custom_fields: newCustomFields });
  };

  const handleCustomFieldChange = (index, field, value) => {
    const newCustomFields = [...formData.custom_fields];
    newCustomFields[index][field] = value;
    setFormData({ ...formData, custom_fields: newCustomFields });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        custom_fields: formData.custom_fields
          .filter(f => f.field_name && f.field_name.trim() !== "")
          .map(f => ({
            ...f,
            field_options: Array.isArray(f.field_options) ? f.field_options : []
          })),
        colid: global1.colid,
        user: global1.user,
      };
      await ep1.post("/api/v2/createleadds", payload);
      showSnackbar("Lead created successfully", "success");
      fetchLeads();
      setOpenDialog(false);
    } catch (err) {
      console.error("Error creating lead:", err);
      showSnackbar("Failed to create lead", "error");
    }
  };

  // Open Edit Dialog
  // Open Edit Dialog
  const handleOpenEditDialog = (lead) => {
    setSelectedLead(lead);
    setEditFormData({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      category: lead.category || "",
      course_interested: lead.course_interested || "",
      source: lead.source || "",
      city: lead.city || "",
      state: lead.state || "",
      pipeline_stage: lead.pipeline_stage || "",
      leadstatus: lead.leadstatus || "", // Outcome
      next_followup_date: lead.next_followup_date
        ? dayjs(lead.next_followup_date).format("YYYY-MM-DD")
        : "",
      custom_fields: lead.custom_fields ? lead.custom_fields.map(f => ({ ...f })) : [],
      institution: lead.institution || "",
      program_type: lead.program_type || "",
      program: lead.program || ""
    });

    // Pre-fetch keys to populate dropdowns if values exist
    fetchInstitutions();
    if (lead.institution) {
      fetchProgramTypes(lead.institution);
      if (lead.program_type) {
        fetchPrograms(lead.institution, lead.program_type);
      }
    }
    setOpenEditDialog(true);
  };

  // Update Lead
  const handleUpdateLead = async () => {
    try {
      const payload = {
        ...editFormData,
        updated_by: global1.user,
      };
      await ep1.post("/api/v2/updateleadds", payload, {
        params: { id: selectedLead._id },
      });
      showSnackbar("Lead updated successfully", "success");
      setOpenEditDialog(false);
      fetchLeads();
    } catch (err) {
      console.error("Error updating lead:", err);
      showSnackbar("Failed to update lead", "error");
    }
  };

  // Open Notes Dialog
  const handleOpenNotesDialog = (lead) => {
    setSelectedLead(lead);
    setNotesData({
      comments: lead.comments || "",
    });
    setOpenNotesDialog(true);
  };

  // Save Notes
  const handleSaveNotes = async () => {
    try {
      const payload = {
        comments: notesData.comments,
        updated_by: global1.user,
      };
      await ep1.post("/api/v2/updateleadds", payload, {
        params: { id: selectedLead._id },
      });
      showSnackbar("Notes saved successfully", "success");
      setOpenNotesDialog(false);
      fetchLeads();
    } catch (err) {
      console.error("Error saving notes:", err);
      showSnackbar("Failed to save notes", "error");
    }
  };

  // Delete Lead (Admin Only)
  const handleDeleteLead = async (lead) => {
    // Check if current user is the admin (owner)
    if (lead.user !== global1.user) {
      showSnackbar("Unauthorized. Only the admin can delete leads.", "error");
      return;
    }

    if (window.confirm(`Are you sure you want to delete lead: ${lead.name}?`)) {
      try {
        await ep1.get(`/api/v2/deleteleadds/${lead._id}`, {
          params: { user: global1.user },
        });
        showSnackbar("Lead deleted successfully", "success");
        fetchLeads();
      } catch (err) {
        console.error("Error deleting lead:", err);
        showSnackbar(
          err.response?.data?.message || "Failed to delete lead",
          "error"
        );
      }
    }
  };

  const handleOpenCommDialog = (lead, channel) => {
    setSelectedLead(lead);
    setCommData({
      channel,
      subject: "",
      content: "",
    });
    setOpenCommDialog(true);
  };

  const handleSendCommunication = async () => {
    try {
      const payload = {
        lead_id: selectedLead._id,
        colid: global1.colid,
        sent_by: global1.user,
        ...commData,
      };

      if (commData.channel === "email") {
        await ep1.post("/api/v2/sendemailds", payload);
      } else if (commData.channel === "sms") {
        await ep1.post("/api/v2/sendsmsds", payload);
      } else if (commData.channel === "whatsapp") {
        await ep1.post("/api/v2/sendwhatsappds", payload);
      }

      showSnackbar(`${commData.channel.toUpperCase()} sent successfully`, "success");
      setOpenCommDialog(false);
    } catch (err) {
      console.error("Error sending communication:", err);
      showSnackbar("Failed to send communication", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getTemperatureColor = (temp) => {
    switch (temp) {
      case "Hot":
        return "error";
      case "Warm":
        return "warning";
      case "Cold":
        return "info";
      default:
        return "default";
    }
  };

  const getPipelineColor = (stage) => {
    if (["Admitted", "Fee Paid"].includes(stage)) return "success";
    if (["Lost"].includes(stage)) return "error";
    return "primary";
  };

  const handleProcessRowUpdate = async (newRow, oldRow) => {
    try {
      if (!newRow || !newRow._id) {
        // console.error("Invalid row data in processRowUpdate:", newRow);
        return oldRow;
      }

      const payload = { ...newRow };
      const response = await ep1.post("/api/v2/updateleadds", payload, {
        params: { id: newRow._id }
      });

      if (response.data.success) {
        showSnackbar("Lead updated successfully", "success");
        return response.data.data || newRow;
      } else {
        showSnackbar("Failed to update lead", "error");
        return oldRow;
      }
    } catch (err) {
      console.error("Error updating lead:", err);
      showSnackbar(err.response?.data?.message || "Failed to update lead", "error");
      return oldRow;
    }
  };

  // Extract unique custom field definitions from all leads
  const getUniqueCustomFields = () => {
    const fieldDefinitions = new Map();
    leads.forEach(lead => {
      if (lead.custom_fields && Array.isArray(lead.custom_fields)) {
        lead.custom_fields.forEach(field => {
          if (field.field_name) {
            const existing = fieldDefinitions.get(field.field_name);
            const hasOptions = field.field_options && field.field_options.length > 0;

            // If it doesn't exist, or if the current one has options and the existing one doesn't, update it
            if (!existing || (hasOptions && (!existing.field_options || existing.field_options.length === 0))) {
              fieldDefinitions.set(field.field_name, {
                field_name: field.field_name,
                field_type: field.field_type || (existing?.field_type) || 'Text',
                field_options: hasOptions ? field.field_options : (existing?.field_options || [])
              });
            }
          }
        });
      }
    });
    return Array.from(fieldDefinitions.values());
  };

  // Generate dynamic columns for custom fields
  const customFieldColumns = getUniqueCustomFields().map(fieldDef => ({
    field: `custom_${fieldDef.field_name}`,
    headerName: fieldDef.field_name,
    width: 150,
    editable: false,
    type: fieldDef.field_type === 'Number' ? 'number' :
      fieldDef.field_type === 'Date' ? 'date' :
        fieldDef.field_type === 'Dropdown' ? 'singleSelect' : 'string',
    valueOptions: fieldDef.field_type === 'Dropdown' ? (Array.isArray(fieldDef.field_options) ? fieldDef.field_options.map(o => (typeof o === 'object' && o !== null) ? (o.value || o.type || String(o)) : String(o)) : []) : undefined,
    valueGetter: (value, row) => { // v5/v6 valueGetter signature might differ too, usually (params)
      // Check if 1st arg is params object or value
      const r = row || value?.row;
      if (!r || !r.custom_fields) return "";
      const field = r.custom_fields.find(f => f.field_name === fieldDef.field_name);
      const val = field ? field.field_value : "";
      if (fieldDef.field_type === 'Date' && val) {
        return new Date(val);
      }
      return val;
    },
    // Removing valueSetter logic as we disabled inline editing
  }));

  const baseColumns = [
    {
      field: "name",
      headerName: "Name",
      width: 180,
      editable: false,
      renderCell: (params) => (
        <Box
          onClick={() => navigate(`/leaddetailds/${params.row._id}`)}
          sx={{
            fontWeight: 600,
            color: "#1e293b",
            cursor: "pointer",
            "&:hover": { color: "#1565c0", textDecoration: "underline" },
          }}
        >
          {params.value}
        </Box>
      ),
    },
    { field: "user", headerName: "Created By", width: 150, editable: false },
    { field: "phone", headerName: "Phone", width: 130, editable: false },
    { field: "email", headerName: "Email", width: 200, editable: false },
    { field: "category", headerName: "Category", width: 130, editable: false },
    { field: "course_interested", headerName: "Course", width: 150, editable: false },
    {
      field: "lead_temperature",
      headerName: "Temperature",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getTemperatureColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    { field: "lead_score", headerName: "Score", width: 80, type: "number" },
    {
      field: "pipeline_stage",
      headerName: "Stage",
      width: 160,
      editable: false,
      type: 'singleSelect',
      valueOptions: pipelineStages.map(s => s.stagename),
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPipelineColor(params.value)}
          size="small"
          sx={{ borderRadius: 1, fontWeight: 500 }}
        />
      ),
    },
    {
      field: "leadstatus",
      headerName: "Outcome",
      width: 150,
      editable: false,
      type: 'singleSelect',
      valueOptions: outcomes.map(o => o.outcomename),
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Converted' ? 'success' : params.value === 'Lost' ? 'error' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: "assignedto", headerName: "Assigned To", width: 180 },
    { field: "source", headerName: "Source", width: 120, editable: false },
    { field: "city", headerName: "City", width: 120, editable: false },
    { field: "state", headerName: "State", width: 120, editable: false },
    { field: "institution", headerName: "Institution", width: 150, editable: false },
    { field: "program_type", headerName: "Program Type", width: 130, editable: false },
    { field: "program", headerName: "Program", width: 180, editable: false },
    {
      field: "next_followup_date",
      headerName: "Next Follow-up",
      width: 150,
      editable: false,
      type: 'date',
      valueGetter: (params) => {
        // Safe Universal Check
        // If 'params' has 'field' or 'row' prop, it's V6 object. Otherwise it's V8 value.
        const v6Params = (params && (params.field || params.row)) ? true : false;
        const val = v6Params ? params.value : params;
        return val && typeof val === 'string' ? new Date(val) : val;
      },
      valueFormatter: (params) => {
        const val = params?.value !== undefined ? params.value : params;
        return val ? dayjs(val).format("DD MMM YYYY") : "-";
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      editable: false,
      type: 'date',
      valueGetter: (params) => {
        const v6Params = (params && (params.field || params.row)) ? true : false;
        const val = v6Params ? params.value : params;
        return val && typeof val === 'string' ? new Date(val) : val;
      },
      valueFormatter: (params) => {
        const val = params?.value !== undefined ? params.value : params;
        return val ? dayjs(val).format("DD MMM YYYY") : "-";
      },
    },
    {
      field: "lead_age",
      headerName: "Lead Age",
      width: 120,
      editable: false,
      renderCell: (params) => {
        const created = params.row.createdAt;
        if (!created) return "-";
        const days = dayjs().diff(dayjs(created), 'day');
        return `${days} Day${days !== 1 ? 's' : ''}`;
      }
    },
    {
      field: "updatedAt",
      headerName: "Last Updated",
      width: 150,
      valueFormatter: (params) => {
        const val = params?.value !== undefined ? params.value : params;
        return val && dayjs(val).isValid() ? dayjs(val).format("DD MMM HH:mm") : "-";
      },
      valueGetter: (params) => {
        return params.row?.updatedAt || params.value;
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 280,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/leaddetailds/${params.row._id}`)}
              sx={{
                color: "#1565c0",
                bgcolor: "rgba(21, 101, 192, 0.1)",
                "&:hover": { bgcolor: "rgba(21, 101, 192, 0.2)" },
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Lead">
            <IconButton
              size="small"
              onClick={() => handleOpenEditDialog(params.row)}
              sx={{
                color: "#f59e0b",
                bgcolor: "rgba(245, 158, 11, 0.1)",
                "&:hover": { bgcolor: "rgba(245, 158, 11, 0.2)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Add/View Notes">
            <IconButton
              size="small"
              onClick={() => handleOpenNotesDialog(params.row)}
              sx={{
                color: "#8b5cf6",
                bgcolor: "rgba(139, 92, 246, 0.1)",
                "&:hover": { bgcolor: "rgba(139, 92, 246, 0.2)" },
              }}
            >
              <NoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Email">
            <IconButton
              size="small"
              onClick={() => handleOpenCommDialog(params.row, "email")}
              sx={{
                color: "#0288d1",
                bgcolor: "rgba(2, 136, 209, 0.1)",
                "&:hover": { bgcolor: "rgba(2, 136, 209, 0.2)" },
              }}
            >
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Call">
            <IconButton
              size="small"
              onClick={() => handleOpenCommDialog(params.row, "sms")}
              sx={{
                color: "#2e7d32",
                bgcolor: "rgba(46, 125, 50, 0.1)",
                "&:hover": { bgcolor: "rgba(46, 125, 50, 0.2)" },
              }}
            >
              <PhoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="WhatsApp">
            <IconButton
              size="small"
              onClick={() => handleOpenCommDialog(params.row, "whatsapp")}
              sx={{
                color: "#25D366",
                bgcolor: "#25D36620",
                "&:hover": { bgcolor: "#25D36630" },
              }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Delete button - only visible for admin */}
          {params.row.user === global1.user && (
            <Tooltip title="Delete Lead (Admin Only)">
              <IconButton
                size="small"
                onClick={() => handleDeleteLead(params.row)}
                sx={{
                  color: "#ef4444",
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  // Combine base columns with custom field columns
  const columns = [...baseColumns, ...customFieldColumns];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navetodashboard()}
            sx={{
              bgcolor: "white",
              border: "1px solid #e2e8f0",
              "&:hover": { bgcolor: "#f8fafc" },
            }}
          >
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Leads Management
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b" }}>
              Manage and track all your student leads in one place
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLeads}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#1565c0",
              boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
              "&:hover": { bgcolor: "#0d47a1" },
            }}
          >
            Add New Lead
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 3, overflow: "visible", borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              placeholder="Search leads..."
              size="small"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <TextField
              select
              label="Pipeline Stage"
              size="small"
              value={filters.pipeline_stage}
              onChange={(e) => setFilters({ ...filters, pipeline_stage: e.target.value })}
              sx={{ minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="All">All Stages</MenuItem>
              {pipelineStages.map((option) => (
                <MenuItem key={option._id} value={option.stagename || option.name}>
                  {option.stagename || option.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Temperature"
              size="small"
              value={filters.lead_temperature}
              onChange={(e) => setFilters({ ...filters, lead_temperature: e.target.value })}
              sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="All">All Temperatures</MenuItem>
              <MenuItem value="Hot">Hot</MenuItem>
              <MenuItem value="Warm">Warm</MenuItem>
              <MenuItem value="Cold">Cold</MenuItem>
            </TextField>

            <Button
              variant="contained"
              onClick={fetchLeads}
              sx={{
                height: 40,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#1565c0",
                "&:hover": { bgcolor: "#0d47a1" },
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Paper sx={{ height: 700, width: "100%", overflow: "hidden", borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <DataGrid
          rows={leads}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableVirtualization
          disableRowSelectionOnClick
          editMode="cell"
          processRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={(error) => {
            console.error("Row update error:", error);
            showSnackbar("Failed to update row", "error");
          }}
          slots={{ toolbar: CustomToolbar }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc",
              color: "#475569",
              fontWeight: 700,
              borderBottom: "1px solid #e2e8f0",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f8fafc", // Base hover color
            },
            // Sticky Name Column Workaround - Stronger
            "& .MuiDataGrid-columnHeader[data-field='name']": {
              position: "sticky !important",
              left: "0 !important",
              zIndex: "100 !important", // Increased Z Index
              backgroundColor: "#f8fafc !important",
              borderRight: "1px solid #e2e8f0",
              boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
            },
            "& .MuiDataGrid-cell[data-field='name']": {
              position: "sticky !important",
              left: "0 !important",
              zIndex: "99 !important", // Increased Z Index
              backgroundColor: "#ffffff !important",
              borderRight: "1px solid #f1f5f9",
              boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
              display: 'flex', // Ensure flex alignment
              alignItems: 'center',
            },
            "& .MuiDataGrid-row:hover .MuiDataGrid-cell[data-field='name']": {
              backgroundColor: "#f8fafc !important", // Match row hover
            },
          }}
        />
      </Paper>

      {/* Add Lead Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>Add New Lead</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={() => checkDuplicate('phone', formData.phone)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => checkDuplicate('email', formData.email)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.category_name}>
                    {cat.category_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                {sources.map((src) => (
                  <MenuItem key={src._id} value={src.source_name}>
                    {src.source_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Institution"
                value={formData.institution || ""}
                onChange={(e) => {
                  setFormData({ ...formData, institution: e.target.value, program_type: "", program: "" });
                  fetchProgramTypes(e.target.value);
                }}
                disabled={loadingInstitutions}
              >
                {institutions.map((inst, index) => (
                  <MenuItem key={index} value={inst}>
                    {inst}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Program Type"
                value={formData.program_type || ""}
                onChange={(e) => {
                  setFormData({ ...formData, program_type: e.target.value, program: "" });
                  fetchPrograms(formData.institution, e.target.value);
                }}
                disabled={!formData.institution || loadingProgramTypes}
              >
                {programTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Program"
                value={formData.program || ""}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                disabled={!formData.program_type || loadingPrograms}
              >
                {programs.map((prog) => (
                  <MenuItem key={prog._id} value={prog.course_name}>
                    {prog.course_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={counselorOptions}
                loading={counselorLoading}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                onInputChange={(event, newInputValue) => {
                  handleSearchCounselors(newInputValue);
                }}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, assignedto: newValue ? newValue.email : "" });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign Counselor (Optional)"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {counselorLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Custom Fields Section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Custom Fields
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      select
                      size="small"
                      label="Add Existing Field"
                      sx={{ width: 200 }}
                      onChange={(e) => {
                        const fieldDef = e.target.value;
                        if (fieldDef) {
                          setFormData({
                            ...formData,
                            custom_fields: [...formData.custom_fields, {
                              field_name: fieldDef.field_name,
                              field_value: "",
                              field_type: fieldDef.field_type,
                              field_options: fieldDef.field_options
                            }]
                          });
                        }
                      }}
                      value=""
                    >
                      <MenuItem value=""><em>Select...</em></MenuItem>
                      {getUniqueCustomFields().map((field) => (
                        <MenuItem key={field.field_name} value={field}>
                          {field.field_name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setFormData({
                        ...formData,
                        custom_fields: [...formData.custom_fields, { field_name: "", field_value: "", field_type: "Text", field_options: [] }]
                      })}
                      variant="outlined"
                    >
                      New Field
                    </Button>
                  </Box>
                </Box>

                {formData.custom_fields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No custom fields added. Click "New Field" or select an existing one.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {formData.custom_fields.map((field, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, position: 'relative' }}>
                          <IconButton
                            onClick={() => handleRemoveCustomField(index)}
                            color="error"
                            size="small"
                            sx={{ position: 'absolute', top: 5, right: 5 }}
                          >
                            <DeleteIcon />
                          </IconButton>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Field Name"
                                value={field.field_name}
                                onChange={(e) => handleCustomFieldChange(index, "field_name", e.target.value)}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                select
                                fullWidth
                                label="Type"
                                value={field.field_type || "Text"}
                                onChange={(e) => handleCustomFieldChange(index, "field_type", e.target.value)}
                                size="small"
                              >
                                <MenuItem value="Text">Text</MenuItem>
                                <MenuItem value="Number">Number</MenuItem>
                                <MenuItem value="Date">Date</MenuItem>
                                <MenuItem value="Dropdown">Dropdown</MenuItem>
                              </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              {field.field_type === 'Dropdown' ? (
                                <TextField
                                  select
                                  fullWidth
                                  label="Value"
                                  value={field.field_value}
                                  onChange={(e) => handleCustomFieldChange(index, "field_value", e.target.value)}
                                  size="small"
                                >
                                  {field.field_options && field.field_options.map((opt, i) => (
                                    <MenuItem key={i} value={opt}>{opt}</MenuItem>
                                  ))}
                                </TextField>
                              ) : (
                                <TextField
                                  fullWidth
                                  label="Value"
                                  type={field.field_type === 'Number' ? 'number' : field.field_type === 'Date' ? 'date' : 'text'}
                                  value={field.field_value}
                                  onChange={(e) => handleCustomFieldChange(index, "field_value", e.target.value)}
                                  size="small"
                                  InputLabelProps={field.field_type === 'Date' ? { shrink: true } : {}}
                                />
                              )}
                            </Grid>

                            {field.field_type === 'Dropdown' && (
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Options (comma separated)"
                                  value={field.field_options ? field.field_options.join(',') : ''}
                                  onChange={(e) => handleCustomFieldChange(index, "field_options", e.target.value.split(',').map(s => s.trim()))}
                                  size="small"
                                  placeholder="Option 1, Option 2, Option 3"
                                />
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" size="large">
            Create Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
          Update Lead: {selectedLead?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Pipeline Stage"
                fullWidth
                value={editFormData.pipeline_stage}
                onChange={(e) => setEditFormData({ ...editFormData, pipeline_stage: e.target.value })}
              >
                {pipelineStages.map((option) => (
                  <MenuItem key={option._id} value={option.stagename}>
                    {option.stagename}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Outcome"
                fullWidth
                value={editFormData.leadstatus}
                onChange={(e) => setEditFormData({ ...editFormData, leadstatus: e.target.value })}
              >
                {outcomes.map((option) => (
                  <MenuItem key={option._id} value={option.outcomename}>
                    {option.outcomename}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.category_name}>
                    {cat.category_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Institution"
                value={editFormData.institution || ""}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, institution: e.target.value, program_type: "", program: "" });
                  fetchProgramTypes(e.target.value);
                }}
              >
                {institutions.map((inst, index) => (
                  <MenuItem key={index} value={inst}>
                    {inst}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Program Type"
                value={editFormData.program_type || ""}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, program_type: e.target.value, program: "" });
                  fetchPrograms(editFormData.institution, e.target.value);
                }}
                disabled={!editFormData.institution}
              >
                {programTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Program"
                value={editFormData.program || ""}
                onChange={(e) => setEditFormData({ ...editFormData, program: e.target.value })}
                disabled={!editFormData.program_type}
              >
                {programs.map((prog) => (
                  <MenuItem key={prog._id} value={prog.course_name}>
                    {prog.course_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Source"
                value={editFormData.source}
                onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
              >
                {sources.map((src) => (
                  <MenuItem key={src._id} value={src.source_name}>
                    {src.source_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={editFormData.state}
                onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
              />
            </Grid>




            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Next Follow-up Date"
                type="date"
                value={editFormData.next_followup_date}
                onChange={(e) => setEditFormData({ ...editFormData, next_followup_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Edit Custom Fields Section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Custom Fields
                </Typography>

                {editFormData.custom_fields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No custom fields.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {editFormData.custom_fields.map((field, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, position: 'relative' }}>
                          <IconButton
                            onClick={() => handleEditRemoveCustomField(index)}
                            color="error"
                            size="small"
                            sx={{ position: 'absolute', top: 5, right: 5 }}
                          >
                            <DeleteIcon />
                          </IconButton>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Field Name"
                                value={field.field_name}
                                onChange={(e) => handleEditCustomFieldChange(index, "field_name", e.target.value)}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                select
                                fullWidth
                                label="Type"
                                value={field.field_type || "Text"}
                                onChange={(e) => handleEditCustomFieldChange(index, "field_type", e.target.value)}
                                size="small"
                              >
                                <MenuItem value="Text">Text</MenuItem>
                                <MenuItem value="Number">Number</MenuItem>
                                <MenuItem value="Date">Date</MenuItem>
                                <MenuItem value="Dropdown">Dropdown</MenuItem>
                              </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              {field.field_type === 'Dropdown' ? (
                                <TextField
                                  select
                                  fullWidth
                                  label="Value"
                                  value={field.field_value}
                                  onChange={(e) => handleEditCustomFieldChange(index, "field_value", e.target.value)}
                                  size="small"
                                >
                                  {field.field_options && field.field_options.map((opt, i) => (
                                    <MenuItem key={i} value={opt}>{opt}</MenuItem>
                                  ))}
                                </TextField>
                              ) : (
                                <TextField
                                  fullWidth
                                  label="Value"
                                  type={field.field_type === 'Number' ? 'number' : field.field_type === 'Date' ? 'date' : 'text'}
                                  value={field.field_value}
                                  onChange={(e) => handleEditCustomFieldChange(index, "field_value", e.target.value)}
                                  size="small"
                                  InputLabelProps={field.field_type === 'Date' ? { shrink: true } : {}}
                                />
                              )}
                            </Grid>

                            {field.field_type === 'Dropdown' && (
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Options (comma separated)"
                                  value={field.field_options ? field.field_options.join(',') : ''}
                                  onChange={(e) => handleEditCustomFieldChange(index, "field_options", e.target.value.split(',').map(s => s.trim()))}
                                  size="small"
                                  placeholder="Option 1, Option 2, Option 3"
                                />
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>
          </Grid>

        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenEditDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleUpdateLead} variant="contained" size="large">
            Update Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={openNotesDialog} onClose={() => setOpenNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
          Notes for: {selectedLead?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Comments/Notes"
            value={notesData.comments}
            onChange={(e) => setNotesData({ comments: e.target.value })}
            multiline
            rows={6}
            placeholder="Add your notes or comments about this lead..."
            helperText="These notes will be saved to the lead's record"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenNotesDialog(false)} size="large">
            Cancel
          </Button>
          <Button onClick={handleSaveNotes} variant="contained" size="large">
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Communication Dialog */}
      <Dialog open={openCommDialog} onClose={() => setOpenCommDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send {commData.channel.toUpperCase()}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              To: {selectedLead?.name} ({selectedLead?.email || selectedLead?.phone})
            </Typography>

            {commData.channel === "email" && (
              <TextField
                fullWidth
                label="Subject"
                value={commData.subject}
                onChange={(e) => setCommData({ ...commData, subject: e.target.value })}
              />
            )}

            <TextField
              fullWidth
              label="Message"
              value={commData.content}
              onChange={(e) => setCommData({ ...commData, content: e.target.value })}
              multiline
              rows={6}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCommDialog(false)}>Cancel</Button>
          <Button onClick={handleSendCommunication} variant="contained">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container >
  );
};

export default Leadsds;
