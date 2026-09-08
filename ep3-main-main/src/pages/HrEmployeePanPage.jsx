import React, { useEffect, useState } from "react";
import { Alert, Autocomplete, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { Save } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

export default function HrEmployeePanPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pan, setPan] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const searchEmployees = async (value = "") => {
    setLoading(true);
    setError("");
    try {
      const field = String(value || "").includes("@") ? "email" : "name";
      const res = await ep1.post("/api/v2/hrsalary-slip/employees", {
        colid: global1.colid,
        filters: value ? [{ field, value }] : []
      });
      setEmployees(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { searchEmployees(""); }, []);

  const savePan = async () => {
    if (!selectedEmployee) return setError("Please select an employee.");
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await ep1.post("/api/v2/hrsalary-slip/employee-pan", {
        colid: global1.colid,
        id: selectedEmployee._id || selectedEmployee.id,
        pan
      });
      setMessage("Employee PAN updated");
      setSelectedEmployee(null);
      setPan("");
      searchEmployees("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update employee PAN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuPageShell title="Employee PAN">
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mb: 2, border: "1px solid #e5e7eb", background: "linear-gradient(135deg,#fff7ed,#ffffff)" }}>
          <Typography variant="h4" fontWeight={900}>Employee PAN Update</Typography>
          <Typography color="text.secondary">Search any employee and update PAN number for Form 16.</Typography>
        </Paper>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Autocomplete
              options={employees}
              loading={loading}
              value={selectedEmployee}
              getOptionLabel={(option) => option ? `${option.name || ""} (${option.displayemail || option.email || ""})` : ""}
              onInputChange={(_, value) => { if (value?.length >= 2) searchEmployees(value); }}
              onChange={(_, value) => {
                setSelectedEmployee(value);
                setPan(value?.pan || "");
              }}
              renderInput={(params) => <TextField {...params} label="Search and select employee" />}
            />
            <TextField label="PAN Number" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} inputProps={{ style: { textTransform: "uppercase" } }} />
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" startIcon={<Save />} onClick={savePan} disabled={loading || !selectedEmployee}>Save PAN</Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
