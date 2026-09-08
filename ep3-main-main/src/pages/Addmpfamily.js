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
    const ppatientref=useRef();
const puserref=useRef();
const admidref=useRef();
const familyref=useRef();
const illnessref=useRef();
const durationref=useRef();
const relationref=useRef();


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

      const setppatient=(id)=> {
if(transcript) {
ppatientref.current.value=transcript;
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
const setfamily=(id)=> {
if(transcript) {
familyref.current.value=transcript;
 }
 }
const setillness=(id)=> {
if(transcript) {
illnessref.current.value=transcript;
 }
 }
const setduration=(id)=> {
if(transcript) {
durationref.current.value=transcript;
 }
 }
const setrelation=(id)=> {
if(transcript) {
relationref.current.value=transcript;
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

const ppatient=ppatientref.current.value;
const puser=puserref.current.value;
const admid=admidref.current.value;
const family=familyref.current.value;
const illness=illnessref.current.value;
const duration=durationref.current.value;
const relation=relationref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createpfamilybyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           ppatient:ppatient,
puser:puser,
admid:admid,
family:family,
illness:illness,
duration:duration,
relation:relation,

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

       <button onClick={setppatient}>Set Patient</button>
 <button onClick={setpuser}>Set Patient username</button>
 <button onClick={setadmid}>Set Admission id</button>
 <button onClick={setfamily}>Set Family</button>
 <button onClick={setillness}>Set Illness</button>
 <button onClick={setduration}>Set Duration</button>
 <button onClick={setrelation}>Set Relation</button>


      <br /><br />

    <p>Patient</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={ppatientref} /><br /><br />

<p>Patient username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={puserref} /><br /><br />

<p>Admission id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={admidref} /><br /><br />

<p>Family</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={familyref} /><br /><br />

<p>Illness</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={illnessref} /><br /><br />

<p>Duration</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={durationref} /><br /><br />

<p>Relation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={relationref} /><br /><br />


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
