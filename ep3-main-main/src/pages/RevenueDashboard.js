import React,{useEffect,useState} from "react";
import axios from "axios";

import {
Container,
Grid,
Card,
CardContent,
Typography,
Table,
TableHead,
TableRow,
TableCell,
TableBody, Box
} from "@mui/material";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const RevenueDashboard = ()=>{

const [data,setData] = useState(null);

const colid = global1.colid;

useEffect(()=>{

ep1.get(`/api/dashboard/revenue?colid=${colid}`)
.then(res=>{
setData(res.data)
})

},[])

if(!data) return <div>Loading...</div>

const programData = data.programRevenue.map(p=>({
program:p._id,
amount:p.total
}))

return(

<Container maxWidth="xl" sx={{mt:4}}>

<Typography variant="h4" gutterBottom>
Revenue Analytics Dashboard
</Typography>

<Grid container spacing={3}>

<Grid item xs={12} md={4}>
<Card>
<CardContent>
<Typography variant="h6">Total Revenue</Typography>
<Typography variant="h4">
₹ {data.totalRevenue[0]?.total || 0}
</Typography>
</CardContent>
</Card>
</Grid>

<Grid item xs={12} md={4}>
<Card>
<CardContent>
<Typography variant="h6">Today Revenue</Typography>
<Typography variant="h4">
₹ {data.todayRevenue[0]?.total || 0}
</Typography>
</CardContent>
</Card>
</Grid>

<Grid item xs={12} md={4}>
<Card>
<CardContent>
<Typography variant="h6">Transactions</Typography>
<Typography variant="h4">
{data.recentTransactions.length}
</Typography>
</CardContent>
</Card>
</Grid>

</Grid>

<Grid container spacing={3} sx={{mt:3}}>

<Grid item xs={12} md={6}>
<Card>
<CardContent>

<Typography variant="h6" gutterBottom>
Revenue by Program
</Typography>

<ResponsiveContainer width="100%" height={300}>
<BarChart data={programData}>
<XAxis dataKey="program"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="amount"/>
</BarChart>
</ResponsiveContainer>

</CardContent>
</Card>
</Grid>

<Grid item xs={12} md={6}>
<Card>
<CardContent>

<Typography variant="h6" gutterBottom>
Recent Transactions
</Typography>

<Table size="small">

<TableHead>
<TableRow>
<TableCell>Date</TableCell>
<TableCell>Student</TableCell>
<TableCell>Program</TableCell>
<TableCell>Amount</TableCell>
</TableRow>
</TableHead>

<TableBody>

{data.recentTransactions.map((row,index)=>(
<TableRow key={index}>
<TableCell>
{new Date(row.classdate).toLocaleDateString()}
</TableCell>
<TableCell>{row.student}</TableCell>
<TableCell>{row.programcode}</TableCell>
<TableCell>₹ {row.amount}</TableCell>
</TableRow>
))}

</TableBody>

</Table>

</CardContent>
</Card>
</Grid>

</Grid>

</Container>

)

}

export default RevenueDashboard