import React,{useState} from "react"
// import api from "../services/oicrmfApi"
import config from "./config"
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

function OICRMFLeadReports(){

    const navigate = useNavigate();

const [source,setSource]=useState("")
const [counsellor,setCounsellor]=useState("")
const [colid,setColid]=useState(global1.colid);

const [pipeline,setPipeline]=useState([])
const [temperature,setTemperature]=useState([])
const [details,setDetails]=useState([])

const loadReport = async()=>{

const res = await ep1.get(

`/api/oicrmf/reports?colid=${colid}&source=${source}&counsellor=${counsellor}`

)

setPipeline(res.data.pipelineSummary)
setTemperature(res.data.temperatureSummary)
setDetails(res.data.details)

}

const exportExcel = ()=>{

window.open(

`${config.SERVER_URL}/api/oicrmf/export/excel?colid=${colid}&source=${source}&counsellor=${counsellor}`

)

}

const exportPdf = ()=>{

window.open(

`${config.SERVER_URL}/api/oicrmf/export/pdf?colid=${colid}&source=${source}&counsellor=${counsellor}`

)

}

return(

<Container>

<Typography variant="h4" sx={{mb:2}}>

OICRMF Lead Reports

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

<input
placeholder="College ID"
value={colid}
onChange={(e)=>setColid(e.target.value)}
/>

</Grid>

<Grid item xs={3}>

<Select
fullWidth
value={source}
onChange={(e)=>setSource(e.target.value)}
>

<MenuItem value="">All Source</MenuItem>
{/* <MenuItem value="Facebook">Facebook</MenuItem>
<MenuItem value="Instagram">Instagram</MenuItem>
<MenuItem value="Google Ads">Google Ads</MenuItem> */}

</Select>

</Grid>

<Grid item xs={3}>

<Select
fullWidth
value={counsellor}
onChange={(e)=>setCounsellor(e.target.value)}
>

<MenuItem value="">All Counsellor</MenuItem>
{/* <MenuItem value="Rahul">Rahul</MenuItem>
<MenuItem value="Priya">Priya</MenuItem> */}

</Select>

</Grid>

<Grid item xs={3}>

<Button variant="contained" onClick={loadReport}>
Generate
</Button>

<Button sx={{ml:1}} onClick={exportExcel}>
Excel
</Button>

{/* <Button sx={{ml:1}} onClick={exportPdf}>
PDF
</Button> */}

</Grid>

</Grid>


{/* PIPELINE SUMMARY */}

<Typography variant="h6" sx={{mt:4}}>
Pipeline Stage Summary
</Typography>

<Table>

<TableHead>
<TableRow>
<TableCell>Stage</TableCell>
<TableCell>Total Leads</TableCell>
</TableRow>
</TableHead>

<TableBody>

{pipeline.map((p,i)=>(

<TableRow key={i}>
<TableCell>{p._id}</TableCell>
<TableCell>{p.total}</TableCell>
</TableRow>

))}

</TableBody>

</Table>


{/* TEMPERATURE SUMMARY */}

<Typography variant="h6" sx={{mt:4}}>
Temperature Summary
</Typography>

<Table>

<TableHead>
<TableRow>
<TableCell>Temperature</TableCell>
<TableCell>Total Leads</TableCell>
</TableRow>
</TableHead>

<TableBody>

{temperature.map((t,i)=>(

<TableRow key={i}>
<TableCell>{t._id}</TableCell>
<TableCell>{t.total}</TableCell>
</TableRow>

))}

</TableBody>

</Table>


{/* DETAIL REPORT */}

<Typography variant="h6" sx={{mt:4}}>
Detailed Report
</Typography>

<Table>

<TableHead>
<TableRow>
<TableCell>Name</TableCell>
<TableCell>Phone</TableCell>
<TableCell>Source</TableCell>
<TableCell>Counsellor</TableCell>
<TableCell>Pipeline</TableCell>
<TableCell>Temperature</TableCell>
</TableRow>
</TableHead>

<TableBody>

{details.map((d,i)=>(

<TableRow key={i}>
<TableCell>{d.name}</TableCell>
<TableCell>{d.phone}</TableCell>
<TableCell>{d.source}</TableCell>
<TableCell>{d.assignedto}</TableCell>
<TableCell>{d.pipeline_stage}</TableCell>
<TableCell>{d.lead_temperature}</TableCell>
</TableRow>

))}

</TableBody>

</Table>

</Container>

)

}

export default OICRMFLeadReports