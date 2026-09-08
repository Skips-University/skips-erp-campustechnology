import React,{useState} from "react";
import axios from "axios";
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import config from "./config";

import {
Container,
Grid,
Select,
MenuItem,
Button,
Table,
TableHead,
TableRow,
TableCell,
TableBody,
Typography, Box
} from "@mui/material"

function LeadReports(){

    const navigate = useNavigate();

const [type,setType]=useState("source");
const [colid,setColid]=useState(global1.colid);
const [summary,setSummary]=useState([]);
const [details,setDetails]=useState([]);

const loadReport=async()=>{

const res=await ep1.get(`/api/reports?type=${type}&colid=${colid}`)

setSummary(res.data.summary)

setDetails(res.data.details)

}

const exportExcel=()=>{

window.open(
`${config.SERVER_URL}/api/export/excel?colid=${colid}`
)

}

const exportPDF=()=>{

window.open(
`${config.SERVER_URL}/api/export/pdf?colid=${colid}`
)

}

return(

<Container>

<Typography variant="h4" gutterBottom>

CRM Lead Reports

</Typography>

{/* Back Button */}
    <Box display="flex" alignItems="center" mb={2}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashdashfacnew')}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600
        }}
      >
        Back to Dashboard
      </Button>
    </Box>

<Grid container spacing={2}>

<Grid item xs={3}>

<Select
fullWidth
value={type}
onChange={(e)=>setType(e.target.value)}
>

<MenuItem value="source">Source Wise</MenuItem>
<MenuItem value="temperature">Temperature Wise</MenuItem>
<MenuItem value="status">Status Wise</MenuItem>
<MenuItem value="counsellor">Counsellor Wise</MenuItem>

</Select>

</Grid>

{/* <Grid item xs={3}>

<input
type="number"
placeholder="Enter College ID"
value={colid}
onChange={(e)=>setColid(e.target.value)}
/>

</Grid> */}

<Grid item xs={6}>

<Button variant="contained" onClick={loadReport}>

Generate Report

</Button>

<Button
variant="outlined"
sx={{ml:2}}
onClick={exportExcel}
>

Export Excel

</Button>

<Button
variant="outlined"
sx={{ml:2}}
onClick={exportPDF}
>

Export PDF

</Button>

</Grid>

</Grid>

{/* SUMMARY TABLE */}

<Typography variant="h6" sx={{mt:4}}>

Summary

</Typography>

<Table>

<TableHead>

<TableRow>

<TableCell>Category</TableCell>
<TableCell>Total Leads</TableCell>

</TableRow>

</TableHead>

<TableBody>

{summary.map((s,i)=>(

<TableRow key={i}>

<TableCell>{s._id}</TableCell>
<TableCell>{s.totalLeads}</TableCell>

</TableRow>

))}

</TableBody>

</Table>

{/* DETAIL TABLE */}

<Typography variant="h6" sx={{mt:4}}>

Details

</Typography>

<Table>

<TableHead>

<TableRow>

<TableCell>Name</TableCell>
<TableCell>Phone</TableCell>
<TableCell>Source</TableCell>
<TableCell>Temperature</TableCell>
<TableCell>Status</TableCell>
<TableCell>Counsellor</TableCell>

</TableRow>

</TableHead>

<TableBody>

{details.map((d,i)=>(

<TableRow key={i}>

<TableCell>{d.name}</TableCell>
<TableCell>{d.phone}</TableCell>
<TableCell>{d.source}</TableCell>
<TableCell>{d.lead_temperature}</TableCell>
<TableCell>{d.leadstatus}</TableCell>
<TableCell>{d.assignedto}</TableCell>

</TableRow>

))}

</TableBody>

</Table>

</Container>

)

}

export default LeadReports