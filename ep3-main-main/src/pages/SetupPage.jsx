import React, { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";

const colid = global1.colid;

export default function SetupPage() {
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypeForm, setLeaveTypeForm] = useState({ name: "", code: "", description: "" });

  const [leaveBalances, setLeaveBalances] = useState([]);
  const [balanceForm, setBalanceForm] = useState({ email: "", leaveType: "", year: "", total: 0 });

  const [users, setUsers] = useState([]);
  const [approverForm, setApproverForm] = useState({
    employee: null,
    approver: null,
    level: 1,
  });
  const [approvers, setApprovers] = useState([]);

  const openSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });
  const closeSnack = () => setSnack({ ...snack, open: false });

  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaveBalances();
    fetchApprovers();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getleavetypes", { params: { colid } });
      setLeaveTypes(data);
    } catch (e) {
      openSnack("Error fetching leave types", "error");
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getleavebalances", { params: { colid } });
      setLeaveBalances(data);
    } catch (e) {
      openSnack("Error fetching balances", "error");
    }
  };

  const fetchApprovers = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getallapprovers", { params: { colid } });
      setApprovers(data);
    } catch (e) {
      openSnack("Error fetching approvers", "error");
    }
  };

  const createLeaveType = async () => {
    const { name, code } = leaveTypeForm;
    if (!name || !code) return openSnack("Name and Code required", "error");
    try {
      await ep1.post("/api/v2/createleavetype", { ...leaveTypeForm, colid });
      setLeaveTypeForm({ name: "", code: "", description: "" });
      fetchLeaveTypes();
      openSnack("Leave type added");
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const createLeaveBalance = async () => {
    try {
      await ep1.post("/api/v2/createleavebalance", {
        ...balanceForm,
        total: Number(balanceForm.total),
        colid,
      });
      setBalanceForm({ email: "", leaveType: "", year: "", total: 0 });
      fetchLeaveBalances();
      openSnack("Balance added");
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const searchUsers = async (_, value) => {
    if (!value?.trim()) return;
    try {
      const { data } = await ep1.get("/api/v2/searchuserbyemailorname", {
        params: { q: value, colid },
      });
      setUsers(data);
    } catch (e) {
      openSnack("User search failed", "error");
    }
  };

  const assignApprover = async () => {
    const { employee, approver, level } = approverForm;
    if (!employee || !approver) return openSnack("Both employee and approver required", "error");
    try {
      await ep1.post("/api/v2/assignapprover", {
        employeeemail: employee.email,
        employeename: employee.name,
        approveremail: approver.email,
        approvername: approver.name,
        level,
        colid,
      });
      setApproverForm({ employee: null, approver: null, level: 1 });
      fetchApprovers();
      openSnack("Approver assigned");
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  return (
     <React.Fragment>
    <Container sx={{ mt: 4 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Leave Types" />
        <Tab label="Leave Balance" />
        <Tab label="Assign Approver" />
      </Tabs>

      <Box mt={2}>
        {tab === 0 && (
          <>
            <Box display="flex" gap={2} mb={2}>
              <TextField label="Name" value={leaveTypeForm.name} onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })} />
              <TextField label="Code" value={leaveTypeForm.code} onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, code: e.target.value })} />
              <TextField label="Description" value={leaveTypeForm.description} onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, description: e.target.value })} />
              <Button onClick={createLeaveType} variant="contained">Add</Button>
            </Box>
            <div style={{ height: 300 }}>
              <DataGrid rows={leaveTypes} columns={[
                { field: "name", flex: 1 },
                { field: "code", width: 100 },
                { field: "description", flex: 1 },
              ]} getRowId={(r) => r._id} />
            </div>
          </>
        )}

        {tab === 1 && (
          <>
            <Box display="flex" gap={2} mb={2} alignItems="center">
              <TextField label="Employee Email" value={balanceForm.email} onChange={(e) => setBalanceForm({ ...balanceForm, email: e.target.value })} />
              <Autocomplete
                options={leaveTypes}
                getOptionLabel={(t) => t.name}
                sx={{ width: 200 }}
                onChange={(_, v) => setBalanceForm({ ...balanceForm, leaveType: v?.name || "" })}
                renderInput={(params) => <TextField {...params} label="Leave Type" />}
              />
              <TextField label="Year" value={balanceForm.year} onChange={(e) => setBalanceForm({ ...balanceForm, year: e.target.value })} />
              <TextField label="Total" type="number" value={balanceForm.total} onChange={(e) => setBalanceForm({ ...balanceForm, total: e.target.value })} />
              <Button onClick={createLeaveBalance} variant="contained">Save</Button>
            </Box>
            <div style={{ height: 300 }}>
              <DataGrid rows={leaveBalances} columns={[
                { field: "email", flex: 1 },
                { field: "leaveType", width: 120 },
                { field: "year", width: 90 },
                { field: "total", width: 90 },
                { field: "used", width: 90 },
                { field: "remaining", width: 100 },
              ]} getRowId={(r) => r._id} />
            </div>
          </>
        )}

        {tab === 2 && (
          <>
            <h4>1. Select Employee</h4>
            <Autocomplete
              options={users}
              getOptionLabel={(o) => `${o.name} (${o.email})`}
              onInputChange={searchUsers}
              onChange={(_, v) => setApproverForm({ ...approverForm, employee: v })}
              renderInput={(params) => <TextField {...params} label="Search email or name" />}
              filterOptions={(x) => x}
            />

            {approverForm.employee && (
              <>
                <h4>2. Select Approver for <b>{approverForm.employee.name}</b></h4>
                <Box display="flex" flexWrap="wrap" gap={2} mt={1} alignItems="center">
                  <Autocomplete
                    options={users}
                    getOptionLabel={(o) => `${o.name} (${o.email})`}
                    onInputChange={searchUsers}
                    onChange={(_, v) => setApproverForm({ ...approverForm, approver: v })}
                    renderInput={(params) => <TextField {...params} label="Search Approver" />}
                    filterOptions={(x) => x}
                    sx={{ minWidth: 300 }}
                  />
                  <TextField
                    label="Level"
                    select
                    SelectProps={{ native: true }}
                    value={approverForm.level}
                    onChange={(e) => setApproverForm({ ...approverForm, level: Number(e.target.value) })}
                    sx={{ width: 120 }}
                  >
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                  </TextField>
                  <Button onClick={assignApprover} variant="contained" sx={{ minWidth: 100 }}>
                    Save
                  </Button>
                  {approverForm.approver && (
                    <Box ml={2}>
                      <strong>Selected Approver:</strong> {approverForm.approver.name}
                    </Box>
                  )}
                </Box>
              </>
            )}

            <Box mt={4}>
              <h4>Current Assignments</h4>
              <div style={{ height: 300 }}>
                <DataGrid
                  rows={approvers}
                  columns={[
                    { field: "employeename", headerName: "Employee", flex: 1 },
                    { field: "employeeemail", headerName: "Emp Email", flex: 1 },
                    { field: "approvername", headerName: "Approver", flex: 1 },
                    { field: "approveremail", headerName: "Approver Email", flex: 1 },
                    { field: "level", headerName: "Level", width: 80 },
                  ]}
                  getRowId={(r) => r._id}
                />
              </div>
            </Box>
          </>
        )}
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
    </React.Fragment>
  );
}


