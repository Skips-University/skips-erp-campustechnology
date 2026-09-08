import React,{useEffect,useState} from "react";
import axios from "axios";
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
Container, Box, Button,
Grid, 
Select,
MenuItem,
FormControl,
InputLabel,
Table,
TableHead,
TableRow,
TableCell,
TableBody,
Paper, 
Typography
} from "@mui/material";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer
} from "recharts";


export default function KeyFacultyReport(){

    const navigate = useNavigate();

const [faculty,setFaculty]=useState("");
const [year,setYear]=useState("");

const [facultyList,setFacultyList]=useState([]);
const [yearList,setYearList]=useState([]);

const [categoryData,setCategoryData]=useState([]);
const [questionData,setQuestionData]=useState([]);

const colid=global1.colid;


useEffect(()=>{

ep1.get(`/keydropdown?colid=${colid}`)
.then(res=>{

setFacultyList(res.data.faculty);
setYearList(res.data.years);

})

},[]);



const loadReport=()=>{

ep1.get(`/keyreport?faculty=${faculty}&year=${year}&colid=${colid}`)
.then(res=>{

setCategoryData(res.data.categoryData);
setQuestionData(res.data.questionData);

})

};



return(

<Container sx={{mt:5}}>

<Typography variant="h5">
Faculty Performance Report
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


<Grid container spacing={3} sx={{mt:2}}>

<Grid item xs={4}>

<FormControl fullWidth>

<InputLabel>Faculty</InputLabel>

<Select
value={faculty}
label="Faculty"
onChange={(e)=>setFaculty(e.target.value)}
>

{facultyList.map(f=>(
<MenuItem key={f} value={f}>{f}</MenuItem>
))}

</Select>

</FormControl>

</Grid>



<Grid item xs={4}>

<FormControl fullWidth>

<InputLabel>Year</InputLabel>

<Select
value={year}
label="Year"
onChange={(e)=>setYear(e.target.value)}
>

{yearList.map(y=>(
<MenuItem key={y} value={y}>{y}</MenuItem>
))}

</Select>

</FormControl>

</Grid>



<Grid item xs={4}>

<button onClick={loadReport}>
Load Report
</button>

</Grid>

</Grid>


{/* CATEGORY GRAPH */}

<Typography sx={{mt:4}} variant="h6">
Category Wise Score
</Typography>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={categoryData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="_id"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="avgScore"/>

</BarChart>

</ResponsiveContainer>



{/* CATEGORY TABLE */}

<Paper sx={{mt:3}}>

<Table>

<TableHead>

<TableRow>

<TableCell>Category</TableCell>
<TableCell>Avg Score</TableCell>
<TableCell>Total</TableCell>
<TableCell>Count</TableCell>

</TableRow>

</TableHead>

<TableBody>

{categoryData.map((row,i)=>(

<TableRow key={i}>

<TableCell>{row._id}</TableCell>
<TableCell>{row.avgScore.toFixed(2)}</TableCell>
<TableCell>{row.totalScore}</TableCell>
<TableCell>{row.count}</TableCell>

</TableRow>

))}

</TableBody>

</Table>

</Paper>



{/* QUESTION GRAPH */}

<Typography sx={{mt:4}} variant="h6">
Question Wise Score
</Typography>

<ResponsiveContainer width="100%" height={350}>

<BarChart data={questionData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="_id"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="avgScore"/>

</BarChart>

</ResponsiveContainer>



</Container>

);

}