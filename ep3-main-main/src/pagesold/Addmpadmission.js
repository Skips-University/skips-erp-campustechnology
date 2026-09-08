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
    const patientref=useRef();
const puserref=useRef();
const admdateref=useRef();
const admtimeref=useRef();
const admstatusref=useRef();
const doctorref=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

   

    useEffect(() => {
       const patient1=global1.patient;
    const puser=global1.puser;
    //alert(' patient ' + patient1 + ' puser ' + puser);
    
          
        }, []);

    const regno=global1.regno;

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

      const setpatient=(id)=> {
if(transcript) {
patientref.current.value=transcript;
 }
 }
const setpuser=(id)=> {
if(transcript) {
puserref.current.value=transcript;
 }
 }
const setadmtime=(id)=> {
if(transcript) {
admtimeref.current.value=transcript;
 }
 }
const setdoctor=(id)=> {
if(transcript) {
doctorref.current.value=transcript;
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

// const patient=patientref.current.value;
// const puser=puserref.current.value;

const patient=global1.patient;
    const puser=global1.puser;

const admdate=admdateref.current.value;
const admtime=admtimeref.current.value;
const admstatus=admstatusref.current.value;
const doctor=doctorref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createpadmissionbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           patient:patient,
puser:puser,
admdate:admdate,
admtime:admtime,
admstatus:admstatus,
doctor:doctor,

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

       {/* <button onClick={setpatient}>Set Patient</button>
 <button onClick={setpuser}>Set Patient user id</button> */}
 <button onClick={setadmtime}>Set Admission time</button>
 <button onClick={setdoctor}>Set Doctor</button>


      <br /><br />

    {/* <p>Patient</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={patientref} /><br /><br />

<p>Patient user id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={puserref} /><br /><br /> */}

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Admission date" inputRef={admdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Admission time</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={admtimeref} /><br /><br />

<InputLabel id="admstatus">Admission status</InputLabel><Select labelId="admstatus"
id="admstatus"
inputRef={admstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Admitted">Admitted</MenuItem>
<MenuItem value="Released">Released</MenuItem>
<MenuItem value="Billing">Billing</MenuItem>
<MenuItem value="Operation">Operation</MenuItem>
<MenuItem value="Lab">Lab</MenuItem>
</Select>
<br /><br />

<p>Doctor</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doctorref} /><br /><br />


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
