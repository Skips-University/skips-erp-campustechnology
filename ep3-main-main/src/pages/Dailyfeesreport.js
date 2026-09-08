import React,{useEffect,useState} from "react";
import axios from "axios";
import config from "./config";

import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
Container,
Grid,
TextField,
MenuItem,
Button,
Typography, Box
} from "@mui/material";

import {DataGrid} from "@mui/x-data-grid";

const DailyFeesReport=()=>{

      const navigate = useNavigate();

const [filters,setFilters]=useState({});
const [dropdowns,setDropdowns]=useState({});
const [rows,setRows]=useState([]);

const colid=1;

useEffect(()=>{

ep1.get(`/oicrmf/dropdowns?colid=${colid}`)
.then(res=>{
setDropdowns(res.data);
});

},[]);

const handleChange=(e)=>{
setFilters({...filters,[e.target.name]:e.target.value});
};

const loadSummary=()=>{

ep1.get(`/oicrmf/dailyfees/summary`,{
params:{...filters,colid}
}).then(res=>{
// setRows(res.data);
const formatted=res.data.map((row,index)=>({
id:index+1,
feeitem:row._id.feeitem,
paymode:row._id.paymode,
count:row.count,
totalAmount:row.totalAmount
}));

setRows(formatted);
setColumns(summaryColumns);
});

};

const loadDetails=()=>{

axios.get(`/oicrmf/dailyfees/details`,{
params:{...filters,colid}
}).then(res=>{
// setRows(res.data);
const formatted=res.data.map(row=>({
...row,
id:row._id
}));

setRows(formatted);
setColumns(detailColumns);
});

};

const columns=[
{field:"student",headerName:"Student",width:200},
{field:"feeitem",headerName:"Fee Item",width:150},
{field:"amount",headerName:"Amount",width:120},
{field:"paymode",headerName:"Pay Mode",width:120},
{field:"classdate",headerName:"Date",width:150}
];

const summaryColumns=[
{field:"feeitem",headerName:"Fee Item",width:200},
{field:"paymode",headerName:"Pay Mode",width:150},
{field:"count",headerName:"Transactions",width:150},
{field:"totalAmount",headerName:"Total Amount",width:180}
];

return(

<Container>

<Typography variant="h5" sx={{mb:3}}>
Daily Fees Collection Report
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

<Grid item xs={2}>
<TextField
select
label="Academic Year"
name="academicyear"
fullWidth
onChange={handleChange}
>
{dropdowns.academic?.map(v=>(
<MenuItem key={v} value={v}>{v}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={2}>
<TextField
select
label="Fee Category"
name="feecategory"
fullWidth
onChange={handleChange}
>
{dropdowns.feecategory?.map(v=>(
<MenuItem key={v} value={v}>{v}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={2}>
<TextField
select
label="Fee Book"
name="feebook"
fullWidth
onChange={handleChange}
>
{dropdowns.feebook?.map(v=>(
<MenuItem key={v} value={v}>{v}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={2}>
<TextField
select
label="Fee Item"
name="feeitem"
fullWidth
onChange={handleChange}
>
{dropdowns.feeitem?.map(v=>(
<MenuItem key={v} value={v}>{v}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={2}>
<TextField
select
label="Program"
name="programcode"
fullWidth
onChange={handleChange}
>
{dropdowns.programcode?.map(v=>(
<MenuItem key={v} value={v}>{v}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={2}>
<TextField
select
label="Fee Counter"
name="feecounter"
fullWidth
onChange={handleChange}
>
{dropdowns.feecounter?.map(v=>(
<MenuItem key={v} value={v}>{v}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={2}>
<TextField
select
label="Pay Mode"
name="paymode"
fullWidth
onChange={handleChange}
>
{dropdowns.paymode?.map(v=>(
<MenuItem key={v} value={v}>{v}</MenuItem>
))}
</TextField>
</Grid>

<Grid item xs={2}>
<TextField
type="date"
name="fromdate"
label="From Date"
InputLabelProps={{shrink:true}}
fullWidth
onChange={handleChange}
/>
</Grid>

<Grid item xs={2}>
<TextField
type="date"
name="todate"
label="To Date"
InputLabelProps={{shrink:true}}
fullWidth
onChange={handleChange}
/>
</Grid>

<Grid item xs={12}>

<Button
variant="contained"
onClick={loadSummary}
sx={{mr:2}}
>
Summary Report
</Button>

<Button
variant="contained"
color="secondary"
onClick={loadDetails}
>
Detailed Report
</Button>

</Grid>

</Grid>

<div style={{height:500,marginTop:20}}>

<DataGrid
rows={rows}
columns={columns}
getRowId={(row)=>row._id}
pageSize={10}
/>

</div>

</Container>

);

};

export default DailyFeesReport;