import React,{useEffect,useState} from "react";
import axios from "axios";
import config from "./config"
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";



import {
Container,
Typography,
Paper,
Accordion,
AccordionSummary,
AccordionDetails,
Table,
TableHead,
TableRow,
TableCell,
TableBody,
Select,
MenuItem,
Button,
LinearProgress,
Box
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


const KeiTeacherForm = ()=>{

  

    const navigate = useNavigate();
    const appraisalyear=global1.appraisalyear;

const [questions,setQuestions] = useState([]);
const [grouped,setGrouped] = useState({});
const [progress,setProgress] = useState(0);
const [score,setScore] = useState(0);

const name = global1.name;
const user = global1.user;
const colid = global1.colid;



useEffect(()=>{

loadQuestions();

},[]);



const loadQuestions = async()=>{

const res = await ep1.get(
`/kei/questions1?colid=${colid}&year=${appraisalyear}&role=${global1.role}`
);

const data = res.data.map(q=>({
...q,
response:""
}));

setQuestions(data);

groupByCategory(data);

};



const groupByCategory = (data)=>{

const g={};

data.forEach(q=>{

if(!g[q.category]) g[q.category]=[];

g[q.category].push(q);

});

setGrouped(g);

};



const handleChange=(id,value)=>{

const updated = questions.map(q=>{

if(q._id===id){

q.response=value;

}

return q;

});

setQuestions(updated);

groupByCategory(updated);

calculateStats(updated);

};



const calculateStats=(data)=>{

const answered = data.filter(q=>q.response!=="").length;

const yesCount = data.filter(q=>q.response==="Yes").length;

const total = data.length;

setProgress(Math.round((answered/total)*100));

setScore(Math.round((yesCount/total)*100));

};



const saveData=async()=>{

  //alert(global1.appraisalyear);
  
const payload = questions.map(q=>({

  

questionId:q._id,
question:q.expectation,
category:q.category,
response:q.response,
score:q.response==="Yes"?1:0,
name,
user,
colid,
year:global1.appraisalyear

}));

await ep1.post(
"/kei/save",
payload
);

alert("Saved Successfully");
navigate('/dashdashfacnew');

};



return(

<Container maxWidth="lg">

<Typography variant="h4" sx={{mt:3}}>
Teacher KEI Evaluation
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

<Box sx={{my:2}}>

<Typography>
Completion: {progress}%
</Typography>

<LinearProgress
variant="determinate"
value={progress}
/>

</Box>

<Paper sx={{p:2,mb:3}}>

<Typography variant="h6">
Score: {score} %
</Typography>

</Paper>


{Object.keys(grouped).map(cat=>(

<Accordion defaultExpanded>

<AccordionSummary expandIcon={<ExpandMoreIcon/>}>

<Typography variant="h6">
{cat}
</Typography>

</AccordionSummary>

<AccordionDetails>

<Table>

<TableHead>

<TableRow>

<TableCell>
Key Expectation
</TableCell>

<TableCell width="200">
Response
</TableCell>

</TableRow>

</TableHead>

<TableBody>

{grouped[cat].map(q=>(

<TableRow key={q._id}>

<TableCell>
{q.expectation}
</TableCell>

<TableCell>

<Select
fullWidth
value={q.response}
onChange={(e)=>
handleChange(q._id,e.target.value)
}
>

<MenuItem value="">
Select
</MenuItem>

<MenuItem value="Yes">
Yes
</MenuItem>

<MenuItem value="No">
No
</MenuItem>

</Select>

</TableCell>

</TableRow>

))}

</TableBody>

</Table>

</AccordionDetails>

</Accordion>

))}


<Button
variant="contained"
sx={{mt:3}}
onClick={saveData}
>

Submit

</Button>

</Container>

);

};

export default KeiTeacherForm;