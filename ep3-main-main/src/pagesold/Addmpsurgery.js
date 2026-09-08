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
const surgeryref=useRef();
const doctorref=useRef();
const doctoridref=useRef();
const sdateref=useRef();
const sstatusref=useRef();
const doccmmentsref=useRef();


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
const setsurgery=(id)=> {
if(transcript) {
surgeryref.current.value=transcript;
 }
 }
const setdoctor=(id)=> {
if(transcript) {
doctorref.current.value=transcript;
 }
 }
const setdoctorid=(id)=> {
if(transcript) {
doctoridref.current.value=transcript;
 }
 }
const setdoccmments=(id)=> {
if(transcript) {
doccmmentsref.current.value=transcript;
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
const surgery=surgeryref.current.value;
const doctor=doctorref.current.value;
const doctorid=doctoridref.current.value;
const sdate=sdateref.current.value;
const sstatus=sstatusref.current.value;
const doccmments=doccmmentsref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createpsurgerybyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           patient:patient,
puser:puser,
admid:admid,
surgery:surgery,
doctor:doctor,
doctorid:doctorid,
sdate:sdate,
sstatus:sstatus,
doccmments:doccmments,

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
 <button onClick={setsurgery}>Set Surgery</button>
 <button onClick={setdoctor}>Set Doctor</button>
 <button onClick={setdoctorid}>Set Doctor ID</button>
 <button onClick={setdoccmments}>Set Doctor comments</button>


      <br /><br />

    <p>Patient</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={patientref} /><br /><br />

<p>Patient username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={puserref} /><br /><br />

<p>Admission id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={admidref} /><br /><br />

<p>Surgery</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={surgeryref} /><br /><br />

<p>Doctor</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doctorref} /><br /><br />

<p>Doctor ID</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doctoridref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Surgery date" inputRef={sdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="sstatus">Surgery status</InputLabel><Select labelId="sstatus"
id="sstatus"
inputRef={sstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Completed">Completed</MenuItem>
<MenuItem value="Planned">Planned</MenuItem>
</Select>
<br /><br />

<p>Doctor comments</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doccmmentsref} /><br /><br />


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
