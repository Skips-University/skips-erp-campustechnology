// import React from 'react';
// import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Input, Select, MenuItem, InputLabel} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser, fetchViewPage }) {
    const yearref=useRef();
const sectorref=useRef();
const companynameref=useRef();
const companyemailref=useRef();
const titleref=useRef();
const descriptionref=useRef();
const skillsref=useRef();
const salaryref=useRef();
const lastapplieddateref=useRef();
const joiningdateref=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

    const regno=global1.regno;

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

      const setsector=(id)=> {
if(transcript) {
sectorref.current.value=transcript;
 }
 }
const setcompanyname=(id)=> {
if(transcript) {
companynameref.current.value=transcript;
 }
 }
const setcompanyemail=(id)=> {
if(transcript) {
companyemailref.current.value=transcript;
 }
 }
const settitle=(id)=> {
if(transcript) {
titleref.current.value=transcript;
 }
 }
const setdescription=(id)=> {
if(transcript) {
descriptionref.current.value=transcript;
 }
 }
const setsalary=(id)=> {
if(transcript) {
salaryref.current.value=transcript;
 }
 }
const setjoiningdate=(id)=> {
if(transcript) {
joiningdateref.current.value=transcript;
 }
 }



  const searchapi = async () => {
       

//     const coursetitle=coursetitleref.current.value;
// const coursecode=coursecoderef.current.value;
// const coursetype=coursetyperef.current.value;
// const year=yearref.current.value;
// const offeredtimes=offeredtimesref.current.value;
// const duration=durationref.current.value;
// const imagelink=imagelinkref.current.value;
// const price=priceref.current.value;
// const category=categoryref.current.value;
// const department=departmentref.current.value;
// const coursehours=coursehoursref.current.value;
// const totalstudents=totalstudentsref.current.value;
// const studentscompleted=studentscompletedref.current.value;
// const dateadded=dateaddedref.current.value;

const year=yearref.current.value;
const sector=sectorref.current.value;
const companyname=companynameref.current.value;
const companyemail=companyemailref.current.value;
const title=titleref.current.value;
const description=descriptionref.current.value;
const skills=skillsref.current.value;
const salary=salaryref.current.value;
const lastapplieddate=lastapplieddateref.current.value;
const joiningdate=joiningdateref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createjobdsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
sector:sector,
companyname:companyname,
companyemail:companyemail,
title:title,
description:description,
skills:skills,
salary:salary,
lastapplieddate:lastapplieddate,
joiningdate:joiningdate,

status1:'Submitted',
            comments:''

        }
    });
    //setLoading(false);
    //setIsuploading(false);
    //console.log(response.data.data);
    //alert(response.data.status);
    //history.replace('/viewnaddonc');

    fetchViewPage();

    handleClose();
   
};




  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
  

      <DialogTitle>Add data</DialogTitle>
      <DialogContent>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>

       <button onClick={setsector}>Set Sector</button>
 <button onClick={setcompanyname}>Set Company</button>
 <button onClick={setcompanyemail}>Set Email</button>
 <button onClick={settitle}>Set Job title</button>
 <button onClick={setdescription}>Set Description</button>
 <button onClick={setsalary}>Set Salary CTC</button>
 <button onClick={setjoiningdate}>Set Tentative joining date</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2025-26">2025-26</MenuItem>
<MenuItem value="2026-27">2026-27</MenuItem>
</Select>
<br /><br />

<p>Sector</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sectorref} /><br /><br />

<p>Company</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={companynameref} /><br /><br />

<p>Email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={companyemailref} /><br /><br />

<p>Job title</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={titleref} /><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Skills</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={skillsref} /><br /><br />

<p>Salary CTC</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={salaryref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Last application date" inputRef={lastapplieddateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Tentative joining date" inputRef={joiningdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

{/* <p>Tentative joining date</p>
<TextField id="outlined-basic"  type="date" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={joiningdateref} /><br /><br /> */}


      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={searchapi} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddUserModal;
