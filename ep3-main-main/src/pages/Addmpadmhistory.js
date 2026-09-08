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
const admidref=useRef();
const activityref=useRef();
const bednoref=useRef();
const bedtyperef=useRef();
const activitydateref=useRef();
const doccommentsref=useRef();


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
const setadmid=(id)=> {
if(transcript) {
admidref.current.value=transcript;
 }
 }
const setactivity=(id)=> {
if(transcript) {
activityref.current.value=transcript;
 }
 }
const setbedno=(id)=> {
if(transcript) {
bednoref.current.value=transcript;
 }
 }
const setbedtype=(id)=> {
if(transcript) {
bedtyperef.current.value=transcript;
 }
 }
const setdoccomments=(id)=> {
if(transcript) {
doccommentsref.current.value=transcript;
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

const patient=patientref.current.value;
const puser=puserref.current.value;
const admid=admidref.current.value;
const activity=activityref.current.value;
const bedno=bednoref.current.value;
const bedtype=bedtyperef.current.value;
const activitydate=activitydateref.current.value;
const doccomments=doccommentsref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createpadmhistorybyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           patient:patient,
puser:puser,
admid:admid,
activity:activity,
bedno:bedno,
bedtype:bedtype,
activitydate:activitydate,
doccomments:doccomments,

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

       <button onClick={setpatient}>Set Patient</button>
 <button onClick={setpuser}>Set Patient username</button>
 <button onClick={setadmid}>Set Admission id</button>
 <button onClick={setactivity}>Set Activity</button>
 <button onClick={setbedno}>Set Bed no</button>
 <button onClick={setbedtype}>Set Bed type</button>
 <button onClick={setdoccomments}>Set Doctor comments</button>


      <br /><br />

    <p>Patient</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={patientref} /><br /><br />

<p>Patient username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={puserref} /><br /><br />

<p>Admission id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={admidref} /><br /><br />

<p>Activity</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={activityref} /><br /><br />

<p>Bed no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bednoref} /><br /><br />

<p>Bed type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bedtyperef} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Activity date" inputRef={activitydateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Doctor comments</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doccommentsref} /><br /><br />


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
