import React,{useState} from "react";
import axios from "axios";

import {
Container,
TextField,
Button,
Typography,
Paper, Box
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";




const KeiAddQuestion = ()=>{

    const navigate = useNavigate();

const [category,setCategory] = useState("");
const [expectation,setExpectation] = useState("");

const colid = global1.colid;



const saveQuestion = async()=>{

await ep1.post(
"/kei/addquestion",
{
category,
expectation,
colid
}
);

alert("Question Added");

setCategory("");
setExpectation("");

};



return(

<Container maxWidth="sm">

<Paper sx={{p:3,mt:3}}>

<Typography variant="h5">
Add KEI Question
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

<TextField
label="Category"
fullWidth
sx={{mt:2}}
value={category}
onChange={(e)=>setCategory(e.target.value)}
/>

<TextField
label="Expectation"
fullWidth
sx={{mt:2}}
value={expectation}
onChange={(e)=>setExpectation(e.target.value)}
/>

<Button
variant="contained"
sx={{mt:3}}
onClick={saveQuestion}
>

Add Question

</Button>

</Paper>

</Container>

);

};

export default KeiAddQuestion;