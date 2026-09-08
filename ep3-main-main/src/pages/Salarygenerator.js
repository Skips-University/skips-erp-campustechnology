import React, { useEffect, useState } from "react";
import {
    Container, TextField, MenuItem, Button, Typography
} from '@mui/material';

import axios from 'axios';

import config from "./config";

import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const SalaryGenerator = () => {

    const [users, setUsers] = useState([]);
    const [structures, setStructures] = useState([]);

    const [empid, setEmpid] = useState('');
    const [structureid, setStructureid] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    const colid = global1.colid;

    useEffect(() => {
        loadUsers();
        loadStructures();
    }, []);

    const loadUsers = async () => {
        // const res = await axios.get(`http://localhost:5000/hr/users?colid=${colid}`);
        const res = await ep1.get(`/hr/users?colid=${colid}`);
        setUsers(res.data);
    };

    const loadStructures = async () => {
        // const res = await axios.get(`http://localhost:5000/hr/structures?colid=${colid}`);
        const res = await ep1.get(`/hr/structures?colid=${colid}`);
        setStructures(res.data);
    };

    const generateSalary = async () => {
        // await axios.post('http://localhost:5000/hr/generate-salary', {
        await ep1.post('/hr/generate-salary', {
            colid,
            empid,
            structureid,
            month,
            year,
            user: 'admin'
        });

        alert('Salary Generated');
    };

    return (
        <Container>
            <Typography variant="h5" gutterBottom>
                Salary Generator
            </Typography>

            {/* Employee */}
            <TextField
                select
                fullWidth
                label="Select Employee"
                margin="normal"
                value={empid}
                onChange={(e) => setEmpid(e.target.value)}
            >
                {users.map(u => (
                    <MenuItem key={u.empid} value={u.empid}>
                        {u.name}
                    </MenuItem>
                ))}
            </TextField>

            {/* Structure */}
            <TextField
                select
                fullWidth
                label="Select Structure"
                margin="normal"
                value={structureid}
                onChange={(e) => setStructureid(e.target.value)}
            >
                {structures.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
            </TextField>

            {/* Month */}
            <TextField
                select
                fullWidth
                label="Month"
                margin="normal"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
            >
                {[
                    "1","2","3","4","5","6",
                    "7","8","9","10","11","12"
                ].map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
            </TextField>

            {/* Year */}
            <TextField
                fullWidth
                label="Year"
                margin="normal"
                value={year}
                onChange={(e) => setYear(e.target.value)}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={generateSalary}
                sx={{ mt: 2 }}
            >
                Generate Salary
            </Button>
        </Container>
    );
};

export default SalaryGenerator;