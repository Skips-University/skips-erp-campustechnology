import React, { useState } from 'react';
import {
  Container, Select, MenuItem, Button, Typography
} from '@mui/material';
import axios from 'axios';
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

export default function App() {

  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const years = [
    "2026-27","2025-26","2024-25","2023-24","2022-23","2021-22"
  ];

  const handleSubmit = async () => {
    // await axios.post('http://localhost:5000/calculate-tds', {
    await ep1.post('/calculate-tds', {
      month,
      year,
      colid: global1.colid  // 🔥 change dynamically if needed
    });

    alert("TDS calculated successfully");
  };

  return (
    <MenuPageShell title="Salary Deduction TDS">
    <Container style={{ marginTop: 50 }}>

      <Typography variant="h5">TDS Calculation</Typography>

      {/* Month Dropdown */}
      <Select
        fullWidth
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        style={{ marginTop: 20 }}
      >
        {months.map(m => (
          <MenuItem key={m} value={m}>{m}</MenuItem>
        ))}
      </Select>

      {/* Year Dropdown */}
      <Select
        fullWidth
        value={year}
        onChange={(e) => setYear(e.target.value)}
        style={{ marginTop: 20 }}
      >
        {years.map(y => (
          <MenuItem key={y} value={y}>{y}</MenuItem>
        ))}
      </Select>

      <Button
        variant="contained"
        onClick={handleSubmit}
        style={{ marginTop: 20 }}
      >
        Calculate TDS
      </Button>

    </Container>
    </MenuPageShell>
  );
}
