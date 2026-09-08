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
const jobidref=useRef();
const jobtitleref=useRef();
const companynameref=useRef();
const companyemailref=useRef();
const studentnameref=useRef();
const studentemailref=useRef();
const studentregnoref=useRef();
const studentcvref=useRef();
const statusref=useRef();


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

      const setjobid=(id)=> {
if(transcript) {
jobidref.current.value=transcript;
 }
 }
const setjobtitle=(id)=> {
if(transcript) {
jobtitleref.current.value=transcript;
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
const setstudentname=(id)=> {
if(transcript) {
studentnameref.current.value=transcript;
 }
 }
const setstudentemail=(id)=> {
if(transcript) {
studentemailref.current.value=transcript;
 }
 }
const setstudentregno=(id)=> {
if(transcript) {
studentregnoref.current.value=transcript;
 }
 }
const setstudentcv=(id)=> {
if(transcript) {
studentcvref.current.value=transcript;
 }
 }
const setstatus=(id)=> {
if(transcript) {
statusref.current.value=transcript;
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
const jobid=jobidref.current.value;
const jobtitle=jobtitleref.current.value;
const companyname=companynameref.current.value;
const companyemail=companyemailref.current.value;
const studentname=studentnameref.current.value;
const studentemail=studentemailref.current.value;
const studentregno=studentregnoref.current.value;
const studentcv=studentcvref.current.value;
const status=statusref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createjobapplicationdsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
jobid:jobid,
jobtitle:jobtitle,
companyname:companyname,
companyemail:companyemail,
studentname:studentname,
studentemail:studentemail,
studentregno:studentregno,
studentcv:studentcv,
status:status,

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

       <button onClick={setjobid}>Set Job id</button>
 <button onClick={setjobtitle}>Set Job title</button>
 <button onClick={setcompanyname}>Set Company name</button>
 <button onClick={setcompanyemail}>Set Company email</button>
 <button onClick={setstudentname}>Set Student name</button>
 <button onClick={setstudentemail}>Set Student email</button>
 <button onClick={setstudentregno}>Set Student reg no</button>
 <button onClick={setstudentcv}>Set Student cv id</button>
 <button onClick={setstatus}>Set Status</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2025-26">2025-26</MenuItem>
<MenuItem value="2026-27">2026-27</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
</Select>
<br /><br />

<p>Job id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={jobidref} /><br /><br />

<p>Job title</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={jobtitleref} /><br /><br />

<p>Company name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={companynameref} /><br /><br />

<p>Company email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={companyemailref} /><br /><br />

<p>Student name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentnameref} /><br /><br />

<p>Student email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentemailref} /><br /><br />

<p>Student reg no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentregnoref} /><br /><br />

<p>Student cv id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentcvref} /><br /><br />

<p>Status</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={statusref} /><br /><br />


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
