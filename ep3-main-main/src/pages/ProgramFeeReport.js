import React,{useState,useEffect} from 'react';
import axios from 'axios';
import {
Container,TextField,Button,MenuItem,Grid,
Paper,Typography,Table,TableHead,TableRow,
TableCell,TableBody, Box
} from '@mui/material';
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function ProgramFeeReport(){

    const navigate = useNavigate();

const colid=global1.colid;

const [years,setYears]=useState([])
const [programs,setPrograms]=useState([])

const [year,setYear]=useState("")
const [program,setProgram]=useState("")
const [from,setFrom]=useState("")
const [to,setTo]=useState("")

const [summary,setSummary]=useState([])
const [details,setDetails]=useState([])



useEffect(()=>{

ep1.get(`/api/years?colid=${colid}`)
.then(res=>setYears(res.data))

},[])



useEffect(()=>{

if(year){

ep1.get(`/api/programs?colid=${colid}&academicyear=${year}`)
.then(res=>setPrograms(res.data))

}

},[year])



const loadReport=async()=>{

const s=await ep1.get(`/api/programFeeSummary`,
{params:{
fromdate:from,
todate:to,
programcode:program,
academicyear:year,
colid
}})

const d=await ep1.get(`/api/programFeeDetails`,
{params:{
fromdate:from,
todate:to,
programcode:program,
academicyear:year,
colid
}})

setSummary(s.data)
setDetails(d.data)

}


return(

<Container>

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

<Typography variant="h5" sx={{mb:3}}>
Program Fee Summary
</Typography>


<Grid container spacing={2}>

<Grid item xs={2}>
<TextField
type="date"
fullWidth
label="From"
InputLabelProps={{shrink:true}}
value={from}
onChange={e=>setFrom(e.target.value)}
/>
</Grid>


<Grid item xs={2}>
<TextField
type="date"
fullWidth
label="To"
InputLabelProps={{shrink:true}}
value={to}
onChange={e=>setTo(e.target.value)}
/>
</Grid>


<Grid item xs={3}>
<TextField
select
fullWidth
label="Academic Year"
value={year}
onChange={e=>setYear(e.target.value)}
>

{years.map(y=>(
<MenuItem key={y} value={y}>{y}</MenuItem>
))}

</TextField>
</Grid>


<Grid item xs={3}>
<TextField
select
fullWidth
label="Program"
value={program}
onChange={e=>setProgram(e.target.value)}
>

{programs.map(p=>(
<MenuItem key={p} value={p}>{p}</MenuItem>
))}

</TextField>
</Grid>


<Grid item xs={2}>
<Button variant="contained" onClick={loadReport}>
Load
</Button>
</Grid>

</Grid>



<Paper sx={{mt:4,p:2}}>

<Typography variant="h6">Summary</Typography>

<Table>

<TableHead>
<TableRow>
<TableCell>Fee Item</TableCell>
<TableCell>Total</TableCell>
</TableRow>
</TableHead>

<TableBody>

{summary.map((row,i)=>(
<TableRow key={i}>
<TableCell>{row._id}</TableCell>
<TableCell>{row.total}</TableCell>
</TableRow>
))}

</TableBody>

</Table>

</Paper>



<Paper sx={{mt:4,p:2}}>

<Typography variant="h6">Details</Typography>

<Table>

<TableHead>
<TableRow>
<TableCell>Date</TableCell>
<TableCell>Student</TableCell>
<TableCell>Fee Item</TableCell>
<TableCell>Amount</TableCell>
</TableRow>
</TableHead>

<TableBody>

{details.map((row,i)=>(
<TableRow key={i}>
<TableCell>{new Date(row.classdate).toLocaleDateString()}</TableCell>
<TableCell>{row.student}</TableCell>
<TableCell>{row.feeitem}</TableCell>
<TableCell>{row.amount}</TableCell>
</TableRow>
))}

</TableBody>

</Table>

</Paper>

</Container>

)

}

export default ProgramFeeReport