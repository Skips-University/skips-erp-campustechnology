import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "./config"
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  Container,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  TextField,
  Button
} from "@mui/material";


function PipelineReport() {

  const [colid, setColid] = useState(global1.colid);
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState([]);
  const [stage, setStage] = useState("");


  const getSummary = async () => {

    const res = await ep1.get(
      `/pipeline-summary?colid=${colid}`
    );

    setSummary(res.data);
    setDetails([]);

  };


  const getDetails = async (stageName) => {

    setStage(stageName);

    const res = await ep1.get(
      `/institution-details?colid=${colid}&stage=${stageName}`
    );

    setDetails(res.data);

  };


  return (

    <Container sx={{ mt: 5 }}>

      <Typography variant="h4" gutterBottom>
        Pipeline Stage Report
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>

        {/* <TextField
          label="College ID"
          value={colid}
          onChange={(e) => setColid(e.target.value)}
          sx={{ mr: 2 }}
        /> */}

        <Button
          variant="contained"
          onClick={getSummary}
        >
          Load Report
        </Button>

      </Paper>



      {/* PIPELINE SUMMARY */}

      <Typography variant="h6" gutterBottom>
        Stage Wise Leads
      </Typography>

      <Table component={Paper}>

        <TableHead>

          <TableRow>

            <TableCell>Pipeline Stage</TableCell>
            <TableCell>Total Leads</TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

          {summary.map((row, index) => (

            <TableRow
              key={index}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => getDetails(row.pipeline_stage)}
            >

              <TableCell>{row.pipeline_stage}</TableCell>

              <TableCell>

                <b>{row.total_leads}</b>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>



      {/* INSTITUTION DETAILS */}

      {details.length > 0 && (

        <>

          <Typography variant="h6" sx={{ mt: 4 }}>

            Institution Wise Leads for Stage: {stage}

          </Typography>

          <Table component={Paper} sx={{ mt: 2 }}>

            <TableHead>

              <TableRow>

                <TableCell>Institution</TableCell>
                <TableCell>Total Leads</TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {details.map((row, index) => (

                <TableRow key={index}>

                  <TableCell>{row.institution}</TableCell>
                  <TableCell>{row.total_leads}</TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </>

      )}

    </Container>

  );

}

export default PipelineReport;