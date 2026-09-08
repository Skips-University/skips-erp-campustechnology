import React, { useEffect, useMemo, useState } from "react";
import { Alert, Autocomplete, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const filterFields = ["name", "department", "paymode", "panno"];
const blankForm = { faculty: null, classdate: "", numberofclasses: "" };

export default function VisitingFacultyClassPage() {
  const [facultyRows, setFacultyRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState("");
  const [dynamicFilters, setDynamicFilters] = useState([{ field: "department", value: "" }]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadFaculty();
    loadRows();
  }, []);

  const buildFacultyParams = () => {
    const params = { colid: global1.colid };
    dynamicFilters.forEach((item) => {
      if (item.field && item.value) params[item.field] = item.value;
    });
    return params;
  };

  const loadFaculty = async () => {
    const res = await ep1.get("/api/v2/visitingfaculty/faculty", { params: buildFacultyParams() });
    setFacultyRows(res.data?.data || []);
  };

  const loadRows = async () => {
    const res = await ep1.get("/api/v2/visitingfaculty/classes", { params: { colid: global1.colid } });
    setRows(res.data?.data || []);
  };

  const saveRow = async () => {
    if (!form.faculty?._id || !form.classdate || form.numberofclasses === "") {
      setError("Faculty, date and number of classes are required.");
      return;
    }
    try {
      setError("");
      await ep1.post("/api/v2/visitingfaculty/classes", {
        id: editId,
        colid: global1.colid,
        user: global1.user,
        facultyid: form.faculty._id,
        facultyname: form.faculty.name,
        department: form.faculty.department,
        classdate: form.classdate,
        numberofclasses: Number(form.numberofclasses)
      });
      setMessage(editId ? "Class assignment updated." : "Class assignment saved.");
      setEditId("");
      setForm(blankForm);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save class assignment.");
    }
  };

  const editRow = (row) => {
    const faculty = facultyRows.find((item) => item._id === row.facultyid) || { _id: row.facultyid, name: row.facultyname, department: row.department };
    setEditId(row._id);
    setForm({ faculty, classdate: row.classdate || "", numberofclasses: row.numberofclasses ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Delete this class assignment?")) return;
    await ep1.post("/api/v2/visitingfaculty/classes-delete", { id, colid: global1.colid });
    setMessage("Class assignment deleted.");
    loadRows();
  };

  const columns = useMemo(() => [
    { field: "facultyname", headerName: "Faculty", minWidth: 180, flex: 1 },
    { field: "department", headerName: "Department", minWidth: 160, flex: 1 },
    { field: "classdate", headerName: "Date", width: 140 },
    { field: "numberofclasses", headerName: "Classes", width: 120, type: "number" },
    { field: "actions", headerName: "Actions", width: 170, sortable: false, renderCell: (params) => <Stack direction="row" spacing={1}><Button size="small" onClick={() => editRow(params.row)}>Edit</Button><Button size="small" color="error" onClick={() => deleteRow(params.row._id)}>Delete</Button></Stack> }
  ], [facultyRows]);

  return (
    <MenuPageShell title="Visiting Faculty Register">
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={900}>Visiting Faculty Register</Typography>
          <Typography color="text.secondary">Select visiting faculty with dynamic filters and assign class count for each day.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Faculty Filters</Typography>
            <Button variant="outlined" onClick={() => setDynamicFilters([...dynamicFilters, { field: "name", value: "" }])}>Add Filter</Button>
          </Stack>
          <Grid container spacing={2}>
            {dynamicFilters.map((item, index) => (
              <React.Fragment key={`${item.field}-${index}`}>
                <Grid item xs={12} md={2}>
                  <TextField select fullWidth label="Field" value={item.field} onChange={(e) => {
                    const next = [...dynamicFilters];
                    next[index] = { ...next[index], field: e.target.value };
                    setDynamicFilters(next);
                  }}>
                    {filterFields.map((field) => <MenuItem key={field} value={field}>{field}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Value" value={item.value} onChange={(e) => {
                    const next = [...dynamicFilters];
                    next[index] = { ...next[index], value: e.target.value };
                    setDynamicFilters(next);
                  }} />
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12} md={2}><Button fullWidth variant="contained" onClick={loadFaculty} sx={{ height: 56 }}>Load Faculty</Button></Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={facultyRows}
                value={form.faculty}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                getOptionLabel={(option) => option?.name ? `${option.name} - ${option.department || ""}` : ""}
                onChange={(event, value) => setForm({ ...form, faculty: value })}
                renderInput={(params) => <TextField {...params} label="Faculty" />}
              />
            </Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.classdate} onChange={(e) => setForm({ ...form, classdate: e.target.value })} /></Grid>
            <Grid item xs={12} md={2}><TextField fullWidth type="number" label="No. of Classes" value={form.numberofclasses} onChange={(e) => setForm({ ...form, numberofclasses: e.target.value })} /></Grid>
            <Grid item xs={12} md={1.5}><Button fullWidth variant="contained" onClick={saveRow} sx={{ height: 56 }}>{editId ? "Update" : "Save"}</Button></Grid>
            {editId && <Grid item xs={12} md={1.5}><Button fullWidth variant="outlined" onClick={() => { setEditId(""); setForm(blankForm); }} sx={{ height: 56 }}>Cancel</Button></Grid>}
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Box sx={{ height: 560 }}><DataGrid rows={rows} getRowId={(row) => row._id} columns={columns} slots={{ toolbar: GridToolbar }} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick /></Box>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
