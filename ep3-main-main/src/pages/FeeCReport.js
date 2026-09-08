import React, { useState } from "react";
import {
  Container,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography
} from "@mui/material";

import axios from "axios";

import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const cashbooks = [
"petty cash",
"sundry expenses",
"fees receipt",
"refund",
"caution deposit",
"adjustment",
"cancelled admission",
"admission",
"certificate courses",
"hostel",
"transport",
"travel"
];

const paymodes = [
"Cash",
"UPI",
"Bank",
"NEFT",
"IMPS",
"Card",
"Cheque"
];

export default function FeeReport() {

    const navigate = useNavigate();

const [filters,setFilters]=useState({
colid:global1.colid,
fromDate:"",
toDate:"",
academicyear:"",
programcode:"",
cashbook:"",
paymode:""
});

const [summary,setSummary]=useState([]);
const [details,setDetails]=useState([]);

const handleChange=(e)=>{
setFilters({...filters,[e.target.name]:e.target.value})
}

const loadSummary=async()=>{
const res=await ep1.post("/api/report/feesummary",filters);
setSummary(res.data);
}

const loadDetails=async()=>{
const res=await ep1.post("/api/report/feedetails",filters);
setDetails(res.data);
}

return (

<Container>

<Typography variant="h4" sx={{mb:3}}>
Fee Collection Report
</Typography>

<Paper sx={{p:3,mb:4}}>

<Grid container spacing={2}>

<Grid item xs={2}>
<TextField
label="From Date"
type="date"
name="fromDate"
onChange={handleChange}
fullWidth
InputLabelProps={{shrink:true}}
/>
</Grid>

<Grid item xs={2}>
<TextField
label="To Date"
type="date"
name="toDate"
onChange={handleChange}
fullWidth
InputLabelProps={{shrink:true}}
/>
</Grid>

<Grid item xs={2}>
<TextField
label="Academic Year"
name="academicyear"
onChange={handleChange}
fullWidth
/>
</Grid>

<Grid item xs={2}>
<TextField
label="Program"
name="programcode"
onChange={handleChange}
fullWidth
/>
</Grid>

<Grid item xs={2}>
<TextField
select
label="Cashbook"
name="cashbook"
onChange={handleChange}
fullWidth
>
{cashbooks.map((c)=>(
<MenuItem key={c} value={c}>{c}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={2}>
<TextField
select
label="Pay Mode"
name="paymode"
onChange={handleChange}
fullWidth
>
{paymodes.map((p)=>(
<MenuItem key={p} value={p}>{p}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={12}>
<Button variant="contained" onClick={loadSummary}>
Load Summary
</Button>

<Button
variant="outlined"
sx={{ml:2}}
onClick={loadDetails}
>
Load Details
</Button>
</Grid>

</Grid>

</Paper>


{/* SUMMARY */}

<Paper sx={{p:3,mb:4}}>

<Typography variant="h6">Summary</Typography>

<table width="100%">
<thead>
<tr>
<th>Program</th>
<th>Cashbook</th>
<th>Pay Mode</th>
<th>Total</th>
</tr>
</thead>

<tbody>

{summary.map((s,i)=>(
<tr key={i}>
<td>{s._id.program}</td>
<td>{s._id.cashbook}</td>
<td>{s._id.paymode}</td>
<td>{s.totalAmount}</td>
</tr>
))}

</tbody>
</table>

</Paper>


{/* DETAILS */}

<Paper sx={{p:3}}>

<Typography variant="h6">Detailed Report</Typography>

<table width="100%">
<thead>
<tr>
<th>Date</th>
<th>Student</th>
<th>RegNo</th>
<th>Program</th>
<th>Cashbook</th>
<th>PayMode</th>
<th>Amount</th>
</tr>
</thead>

<tbody>

{details.map((d,i)=>(
<tr key={i}>
<td>{new Date(d.classdate).toLocaleDateString()}</td>
<td>{d.student}</td>
<td>{d.regno}</td>
<td>{d.programcode}</td>
<td>{d.cashbook}</td>
<td>{d.paymode}</td>
<td>{d.amount}</td>
</tr>
))}

</tbody>
</table>

</Paper>

</Container>

);
}