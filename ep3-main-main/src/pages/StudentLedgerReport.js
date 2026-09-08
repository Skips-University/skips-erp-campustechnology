import React,{useState,useEffect} from 'react';
import axios from 'axios';
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
Container,
TextField,
Button,
MenuItem,
Grid,
Paper,
Typography,
Table,
TableHead,
TableRow,
TableCell,
TableBody, Box
} from '@mui/material'


function StudentLedgerReport(){
    
    const navigate = useNavigate();

const [years,setYears]=useState([])
const [year,setYear]=useState("")
const [regno,setRegno]=useState("")
const [summary,setSummary]=useState([])
const [details,setDetails]=useState([])

const colid=global1.colid;


useEffect(()=>{

// axios.get(`http://localhost:5000/api/years?colid=${colid}`)
ep1.get(`/api/years?colid=${colid}`)
.then(res=>setYears(res.data))

},[])


const loadReport=async()=>{

// const s=await axios.get(`http://localhost:5000/api/studentLedgerSummary`,
const s=await ep1.get(`/api/studentLedgerSummary`,
{params:{academicyear:year,regno,colid}})

// const d=await axios.get(`http://localhost:5000/api/studentLedgerDetails`,
const d=await ep1.get(`/api/studentLedgerDetails`,
{params:{academicyear:year,regno,colid}})

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
Student Ledger Report
</Typography>


<Grid container spacing={2}>

<Grid item xs={3}>
<TextField
select
fullWidth
label="Academic Year"
value={year}
onChange={(e)=>setYear(e.target.value)}
>

{years.map(y=>(
<MenuItem key={y} value={y}>{y}</MenuItem>
))}

</TextField>
</Grid>


<Grid item xs={3}>
<TextField
fullWidth
label="Student RegNo"
value={regno}
onChange={(e)=>setRegno(e.target.value)}
/>
</Grid>

<Grid item xs={2}>
<Button
variant="contained"
onClick={loadReport}
>
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
<TableCell>Fee Item</TableCell>
<TableCell>Amount</TableCell>
<TableCell>Pay Mode</TableCell>
</TableRow>
</TableHead>

<TableBody>

{details.map((row,i)=>(
<TableRow key={i}>
<TableCell>{new Date(row.classdate).toLocaleDateString()}</TableCell>
<TableCell>{row.feeitem}</TableCell>
<TableCell>{row.amount}</TableCell>
<TableCell>{row.paymode}</TableCell>
</TableRow>
))}

</TableBody>

</Table>

</Paper>

</Container>

)

}

export default StudentLedgerReport