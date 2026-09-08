import React, { useEffect, useState } from 'react';
import {
    Container, Select, MenuItem, Button, Typography
} from '@mui/material';
import axios from 'axios';

import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SalAssign() {

    const [employees, setEmployees] = useState([]);
    const [structures, setStructures] = useState([]);

    const [employeeid, setEmployee] = useState('');
    const [structureid, setStructure] = useState('');

    const colid = global1.colid;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // const emp = await axios.get(`/sal/employees?colid=${colid}`);
        // const str = await axios.get(`/sal/structures?colid=${colid}`);

        const emp = await ep1.get(`/sal/employees?colid=${colid}`);
        const str = await ep1.get(`/sal/structures?colid=${colid}`);

        console.log(emp.data);
        console.log(str.data);

        setEmployees(emp.data);
        setStructures(str.data);
    };

    const assignSalary = async () => {
        // await axios.post('/sal/assign', {
        await ep1.post('/sal/assign', {
            employeeid,
            structureid,
            colid
        });

        alert('Salary Assigned');
    };

    return (
        <Container>
            <Typography variant="h5">Assign Salary Structure</Typography>

            <Select
                fullWidth
                value={employeeid}
                onChange={(e) => setEmployee(e.target.value)}
                displayEmpty
            >
                <MenuItem value="">Select Employee</MenuItem>
                {employees.map(e => (
                    <MenuItem key={e._id} value={e._id}>
                        {e.name}
                    </MenuItem>
                ))}
            </Select>

            <br /><br />

            <Select
                fullWidth
                value={structureid}
                onChange={(e) => setStructure(e.target.value)}
                displayEmpty
            >
                <MenuItem value="">Select Structure</MenuItem>
                {structures.map(s => (
                    <MenuItem key={s._id} value={s._id}>
                        {s.struture}
                    </MenuItem>
                ))}
            </Select>

            <br /><br />

            <Button variant="contained" onClick={assignSalary}>
                Assign
            </Button>
        </Container>
    );
}