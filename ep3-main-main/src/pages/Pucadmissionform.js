import React,{useState} from "react"
import {Grid,TextField,Paper,Typography,Button} from "@mui/material"
import axios from "axios"
import ep1 from '../api/ep1';
import global1 from '../pages/global1';


export default function AdmissionForm(){

    const params = new URLSearchParams(window.location.search)

const cid = params.get("colid")

const [form,setForm]=useState({
colid:cid
})

const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value})
}

const submit=async()=>{

await axios.post("http://localhost:5000/puc/admission",form)

alert("Saved")

}

return(

<Paper sx={{p:4}}>

<Typography variant="h5">PUC Admission Form</Typography>

<Grid container spacing={2} mt={1}>

<Grid item xs={6}>
<TextField fullWidth label="Student Name" name="studentName" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="SATS No" name="satsNo" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Admission No" name="admissionNo" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Language Combination" name="languageCombination" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth type="date" name="dob" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Gender" name="gender" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Place Of Birth" name="placeOfBirth" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Nationality" name="nationality" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Religion" name="religion" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Caste" name="caste" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Mobile" name="mobile" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Aadhaar" name="aadhaar" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Father Name" name="fatherName" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Mother Name" name="motherName" onChange={handleChange}/>
</Grid>

<Grid item xs={12}>
<TextField fullWidth label="Permanent Address" name="permanentAddress" onChange={handleChange}/>
</Grid>

<Grid item xs={12}>
<TextField fullWidth label="Correspondence Address" name="correspondenceAddress" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="SSLC Register No" name="sslcRegisterNo" onChange={handleChange}/>
</Grid>

<Grid item xs={3}>
<TextField fullWidth label="SSLC Year" name="sslcYear" onChange={handleChange}/>
</Grid>

<Grid item xs={3}>
<TextField fullWidth label="SSLC Month" name="sslcMonth" onChange={handleChange}/>
</Grid>

{/* SUBJECT MARKS */}

<Grid item xs={12}>
<Typography variant="h6">SSLC Marks</Typography>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="1st Language Marks" name="lang1" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="2nd Language Marks" name="lang2" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="3rd Language Marks" name="lang3" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Science Marks" name="science" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Maths Marks" name="maths" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Social Science Marks" name="social" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Total Marks" name="totalMarks" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Percentage" name="percentage" onChange={handleChange}/>
</Grid>

{/* PU SUBJECTS */}

<Grid item xs={12}>
<Typography variant="h6">PU Subjects</Typography>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Part 1 Language 1" name="part1Lang1" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Part 1 Language 2" name="part1Lang2" onChange={handleChange}/>
</Grid>

<Grid item xs={3}>
<TextField fullWidth label="Optional Subject 1" name="optSubject1" onChange={handleChange}/>
</Grid>

<Grid item xs={3}>
<TextField fullWidth label="Optional Subject 2" name="optSubject2" onChange={handleChange}/>
</Grid>

<Grid item xs={3}>
<TextField fullWidth label="Optional Subject 3" name="optSubject3" onChange={handleChange}/>
</Grid>

<Grid item xs={3}>
<TextField fullWidth label="Optional Subject 4" name="optSubject4" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="Sports Activities" name="sportsActivities" onChange={handleChange}/>
</Grid>

<Grid item xs={6}>
<TextField fullWidth label="PU Medium (Kannada/English)" name="puMedium" onChange={handleChange}/>
</Grid>

<Grid item xs={12}>
<Button variant="contained" onClick={submit}>
Save Admission
</Button>
</Grid>

</Grid>

</Paper>

)

}