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
import axios from "axios";
import ep1 from "../api/ep1";

import global1 from "./global1";

const colid = global1.colid;
const api = axios.create({ baseURL: "http://localhost:8080/api/v2" });

export default function SetupPage() {
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const openSnack = (msg, sev = "success") =>
    setSnack({ open: true, msg, severity: sev });
  const closeSnack = () => setSnack({ ...snack, open: false });

  return (
    <Container sx={{ mt: 4 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Leave Types" />
        <Tab label="Leave Balance" />
        <Tab label="Assign Approver" />
      </Tabs>
      <Box mt={2}>
        {tab === 0 && <LeaveTypes openSnack={openSnack} />}
        {tab === 1 && <LeaveBalance openSnack={openSnack} />}
        {tab === 2 && <AssignApprover openSnack={openSnack} />}
      </Box>
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

/* LEAVE TYPES */
function LeaveTypes({ openSnack }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const fetch = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getleavetypes", { params: { colid } });
      setRows(data);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };
  useEffect(() => {
    fetch();
  }, []);

  const create = async () => {
    if (!form.name || !form.code)
      return openSnack("Name & code required", "error");
    try {
      await ep1.post("/api/v2/createleavetype", { ...form, colid });
      setForm({ name: "", code: "", description: "" });
      await fetch();
      openSnack("Added");
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Button onClick={create} variant="contained">
          Add
        </Button>
      </Box>
      <div style={{ height: 300 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: "name", flex: 1 },
            { field: "code", width: 100 },
            { field: "description", flex: 1 },
          ]}
          getRowId={(r) => r._id}
        />
      </div>
    </Box>
  );
}

/* LEAVE BALANCE */
function LeaveBalance({ openSnack }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    email: "",
    leaveType: "",
    year: "",
    total: 0,
  });
  const [types, setTypes] = useState([]);

  const fetchTypes = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getleavetypes", { params: { colid } });
      setTypes(data);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const fetchBalances = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getleavebalances", {
        params: { colid },
      });
      setRows(data);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  useEffect(() => {
    fetchTypes();
    fetchBalances();
  }, []);

  const create = async () => {
    try {
      await ep1.post("/api/v2/createleavebalance", {
        ...form,
        total: Number(form.total),
        colid,
      });
      setForm({ email: "", leaveType: "", year: "", total: 0 });
      await fetchBalances();
      openSnack("Balance saved");
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  return (
    <Box>
      <Box display="flex" gap={2} mb={2} alignItems="center">
        <TextField
          label="Employee Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Autocomplete
          options={types}
          getOptionLabel={(t) => t.name}
          sx={{ width: 200 }}
          onChange={(_, v) => setForm({ ...form, leaveType: v?.name || "" })}
          renderInput={(params) => <TextField {...params} label="Leave Type" />}
        />
        <TextField
          label="Year"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        />
        <TextField
          label="Total"
          type="number"
          value={form.total}
          onChange={(e) => setForm({ ...form, total: e.target.value })}
        />
        <Button onClick={create} variant="contained">
          Save
        </Button>
      </Box>
      <div style={{ height: 300 }}>
        <DataGrid
          rows={rows}
          columns={[
            { field: "email", flex: 1 },
            { field: "leaveType", width: 120 },
            { field: "year", width: 90 },
            { field: "total", width: 90 },
            { field: "used", width: 90 },
            { field: "remaining", width: 100 },
          ]}
          getRowId={(r) => r._id}
        />
      </div>
    </Box>
  );
}

/* ASSIGN APPROVER */
function AssignApprover({ openSnack }) {
  const [emp, setEmp] = useState(null);
  const [approver, setApprover] = useState({
    approvername: "",
    approveremail: "",
    level: 1,
  });
  const [options, setOptions] = useState([]);
  const [rows, setRows] = useState([]);

  const searchUsers = async (_, value) => {
    console.log('Starting' + colid);
    if (!value?.trim()) return setOptions([]);
    try {
      console.log('Calling now' + colid);
      const { data } = await ep1.get("/api/v2/searchuserbyemailorname", {
        params: { q: value, colid },
      });
      setOptions(data);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const createApprover = async () => {
    if (!emp || !approver.approvername || !approver.approveremail)
      return openSnack("All fields required", "error");
    try {
      await ep1.post("/api/v2/assignapprover", {
        ...approver,
        employeeemail: emp.email,
        employeename: emp.name,
        colid,
      });
      setEmp(null);
      setApprover({ approvername: "", approveremail: "", level: 1 });
      await fetchApprovers();
      openSnack("Assigned");
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  const fetchApprovers = async () => {
    try {
      const { data } = await ep1.get("/api/v2/getallapprovers", { params: { colid } });
      setRows(data);
    } catch (e) {
      openSnack(e?.response?.data?.error || e.message, "error");
    }
  };

  useEffect(() => {
    fetchApprovers();
  }, []);

  const columns = [
    { field: "employeename", headerName: "Employee", flex: 1 },
    { field: "employeeemail", headerName: "Emp Email", flex: 1 },
    { field: "approvername", headerName: "Approver", flex: 1 },
    { field: "approveremail", headerName: "Approver Email", flex: 1 },
    { field: "level", headerName: "Level", width: 80 },
  ];

  return (
    <React.Fragment>
    <Box>
      <h4>1. Select Employee</h4>
      <Autocomplete
        options={options}
        getOptionLabel={(o) => `${o.name} (${o.email})`}
        onInputChange={searchUsers}
        onChange={(_, v) => setEmp(v)}
        renderInput={(params) => (
          <TextField {...params} label="Search email or name" />
        )}
        filterOptions={(x) => x}
      />
      {emp && (
        <>
          <h4>
            2. Assign Approver for <b>{emp.name}</b>
          </h4>
          <Box display="flex" gap={2} mt={1}>
            <TextField
              label="Approver Name"
              value={approver.approvername}
              onChange={(e) =>
                setApprover({ ...approver, approvername: e.target.value })
              }
            />
            <TextField
              label="Approver Email"
              value={approver.approveremail}
              onChange={(e) =>
                setApprover({ ...approver, approveremail: e.target.value })
              }
            />
            <TextField
              select
              SelectProps={{ native: true }}
              value={approver.level}
              onChange={(e) =>
                setApprover({ ...approver, level: Number(e.target.value) })
              }
            >
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
            </TextField>
            <Button onClick={createApprover} variant="contained">
              Save
            </Button>
          </Box>
        </>
      )}
      <Box mt={4}>
        <h4>Current Assignments</h4>
        <div style={{ height: 300 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r._id}
            pageSize={5}
          />
        </div>
      </Box>
    </Box>
    </React.Fragment>
  );
}
