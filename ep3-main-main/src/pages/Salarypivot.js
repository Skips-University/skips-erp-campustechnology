import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";
import config from "./config";

import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";


export default function HrSalaryReport() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const [filters, setFilters] = useState({
    colid: global1.colid,
    month: "",
    year: ""
  });

  const hrFetchData = async () => {
    console.log(filters);
    // const res = await axios.get("http://localhost:5000/hr/salary-pivot", {
    const res = await ep1.get("/hrsalarypivot", {
      params: filters
    });

    const rows = res.data;

    // Extract dynamic component columns
    let cols = new Set();
    rows.forEach(r => {
      Object.keys(r.componentObj || {}).forEach(c => cols.add(c));
    });

    setColumns(Array.from(cols));
    setData(rows);
  };

  return (
    <Container>
      <h2>HR Salary Pivot Report</h2>

      {/* Filters */}
      {/* <TextField
        label="ColID"
        onChange={e => setFilters({ ...filters, colid: e.target.value })}
      /> */}
      <TextField
        label="Month"
        onChange={e => setFilters({ ...filters, month: e.target.value })}
      />
      <TextField
        label="Year"
        onChange={e => setFilters({ ...filters, year: e.target.value })}
      />

      <Button variant="contained" onClick={hrFetchData}>
        Load
      </Button>

      {/* Pivot Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Emp ID</TableCell>
            <TableCell>Employee</TableCell>

            {columns.map(col => (
              <TableCell key={col}>{col}</TableCell>
            ))}

            <TableCell>Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.empid}</TableCell>
              <TableCell>{row.employee}</TableCell>

              {columns.map(col => (
                <TableCell key={col}>
                  {row.componentObj?.[col] || 0}
                </TableCell>
              ))}

              <TableCell>{row.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}