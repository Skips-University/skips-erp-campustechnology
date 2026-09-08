import React, { useEffect, useState } from "react";
import axios from "axios";
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
Container,
Typography,
Paper,
Table,
TableHead,
TableRow,
TableCell,
TableBody, Box, 
Grid, Button
} from "@mui/material";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer,
PieChart,
Pie,
Cell,
Legend
} from "recharts";


const COLORS = [
"#0088FE",
"#00C49F",
"#FFBB28",
"#FF8042",
"#A28EFF",
"#FF6699"
];


const KeiPrincipalDashboard = () => {

    const navigate = useNavigate();

const [ranking,setRanking] = useState([]);
const [category,setCategory] = useState([]);

const colid = global1.colid;



useEffect(()=>{

loadDashboard();

},[]);



const loadDashboard = async()=>{

const res = await ep1.get(
`/kei/principaldashboard?colid=${colid}`
);

setRanking(res.data.teacherRanking);
setCategory(res.data.categoryPerformance);

};



return(

<Container maxWidth="lg">


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

<Typography variant="h4" sx={{mt:3,mb:3}}>
Teacher Performance Dashboard
</Typography>





<Grid container spacing={3}>


{/* TEACHER RANKING TABLE */}

<Grid item xs={12} md={6}>

<Paper sx={{p:2}}>

<Typography variant="h6" sx={{mb:2}}>
Teacher Ranking
</Typography>

<Table>

<TableHead>

<TableRow>

<TableCell>Rank</TableCell>
<TableCell>Teacher</TableCell>
<TableCell>Average Score %</TableCell>

</TableRow>

</TableHead>

<TableBody>

{ranking.map((t,i)=>(
<TableRow key={i}>

<TableCell>
{i+1}
</TableCell>

<TableCell>
{t.teacherName}
</TableCell>

<TableCell>
{t.averageScore.toFixed(2)}
</TableCell>

</TableRow>
))}

</TableBody>

</Table>

</Paper>

</Grid>



{/* BAR CHART */}

<Grid item xs={12} md={6}>

<Paper sx={{p:2}}>

<Typography variant="h6" sx={{mb:2}}>
Teacher Score Comparison
</Typography>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={ranking}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="teacherName"/>

<YAxis/>

<Tooltip/>

<Bar
dataKey="averageScore"
fill="#1976d2"
/>

</BarChart>

</ResponsiveContainer>

</Paper>

</Grid>



{/* CATEGORY PERFORMANCE PIE */}

<Grid item xs={12}>

<Paper sx={{p:2}}>

<Typography variant="h6" sx={{mb:2}}>
Category Performance
</Typography>

<ResponsiveContainer width="100%" height={350}>

<PieChart>

<Pie
data={category}
dataKey="average"
nameKey="_id"
cx="50%"
cy="50%"
outerRadius={120}
label
>

{category.map((entry,index)=>(
<Cell
key={index}
fill={COLORS[index % COLORS.length]}
/>
))}

</Pie>

<Tooltip/>

<Legend/>

</PieChart>

</ResponsiveContainer>

</Paper>

</Grid>


</Grid>

</Container>

);

};

export default KeiPrincipalDashboard;