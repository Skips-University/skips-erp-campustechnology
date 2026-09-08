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
    const studentref=useRef();
const phoneref=useRef();
const emailref=useRef();
const guardianref=useRef();
const gphoneref=useRef();
const payrefref=useRef();
const paynameref=useRef();
const paydateref=useRef();
const sourceref=useRef();
const typeref=useRef();


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

      const setstudent=(id)=> {
if(transcript) {
studentref.current.value=transcript;
 }
 }
const setphone=(id)=> {
if(transcript) {
phoneref.current.value=transcript;
 }
 }
const setemail=(id)=> {
if(transcript) {
emailref.current.value=transcript;
 }
 }
const setguardian=(id)=> {
if(transcript) {
guardianref.current.value=transcript;
 }
 }
const setgphone=(id)=> {
if(transcript) {
gphoneref.current.value=transcript;
 }
 }
const setpayref=(id)=> {
if(transcript) {
payrefref.current.value=transcript;
 }
 }
const setpayname=(id)=> {
if(transcript) {
paynameref.current.value=transcript;
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

const student=studentref.current.value;
const phone=phoneref.current.value;
const email=emailref.current.value;
const guardian=guardianref.current.value;
const gphone=gphoneref.current.value;
const payref=payrefref.current.value;
const payname=paynameref.current.value;
const paydate=paydateref.current.value;
const source=sourceref.current.value;
const type=typeref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmctalentregbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           student:student,
phone:phone,
email:email,
guardian:guardian,
gphone:gphone,
payref:payref,
payname:payname,
paydate:paydate,
source:source,
type:type,

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

       <button onClick={setstudent}>Set Student</button>
 <button onClick={setphone}>Set Phone</button>
 <button onClick={setemail}>Set Email</button>
 <button onClick={setguardian}>Set Guardian</button>
 <button onClick={setgphone}>Set Guardian phone</button>
 <button onClick={setpayref}>Set Payment ref</button>
 <button onClick={setpayname}>Set Payment name</button>


      <br /><br />

    <p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Phone</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={phoneref} /><br /><br />

<p>Email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={emailref} /><br /><br />

<p>Guardian</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={guardianref} /><br /><br />

<p>Guardian phone</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={gphoneref} /><br /><br />

<p>Payment ref</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={payrefref} /><br /><br />

<p>Payment name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={paynameref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Pay date" inputRef={paydateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="source">Source</InputLabel><Select labelId="source"
id="source"
inputRef={sourceref}
sx={{ width: '100%'}}
>
<MenuItem value="Self">Self</MenuItem>
<MenuItem value="Agent">Agent</MenuItem>
</Select>
<br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="School">School</MenuItem>
<MenuItem value="College">College</MenuItem>
</Select>
<br /><br />


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
