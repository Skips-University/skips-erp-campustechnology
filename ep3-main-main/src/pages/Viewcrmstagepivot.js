import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import ep1 from '../api/ep1';
import global1 from './global1';

export default function PipelinePivotReport() {

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {

        const colid=global1.colid;
      const res = await ep1.get("/api/v2/getcrmleadstagepivot?colid=" + colid);

      const rows = res.data.data.classes;

      setData(rows);

    //   if (rows.length > 0) {
    //     const dynamicColumns = Object.keys(rows[0]).filter(
    //       (key) => key !== "assignedto"
    //     );
    //     setColumns(dynamicColumns);
    //   }

    // collect ALL unique stages from all rows
      const stageSet = new Set();

      rows.forEach((row) => {
        Object.keys(row).forEach((key) => {
        //   if (key !== "assignedto" && key !== "total") {
        if (key !== "assignedto") {
            stageSet.add(key);
          }
        });
      });

      const stageColumns = Array.from(stageSet).sort();

      setColumns(stageColumns);

      setLoading(false);

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 1200, margin: "auto", mt: 4 }}>

      <Typography variant="h6" sx={{ p: 2 }}>
        Pipeline Stage Report
      </Typography>

      <Table>

        <TableHead>
          <TableRow>

            <TableCell><b>Counsellor</b></TableCell>

            {columns.map((col) => (
              <TableCell key={col}>
                <b>{col}</b>
              </TableCell>
            ))}

          </TableRow>
        </TableHead>

        <TableBody>

          {data.map((row, index) => (
            <TableRow key={index}>

              <TableCell>{row.assignedto}</TableCell>

              {columns.map((col) => (
                <TableCell key={col}>
                  {row[col] || 0}
                </TableCell>
              ))}

            </TableRow>
          ))}

        </TableBody>

      </Table>

    </TableContainer>
  );
}