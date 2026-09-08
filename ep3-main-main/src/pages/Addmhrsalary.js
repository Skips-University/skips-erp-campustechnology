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
const monthref=useRef();
const duedateref=useRef();
const structureref=useRef();
const structureidref=useRef();
const employeeref=useRef();
const empidref=useRef();
const componentref=useRef();
const amountref=useRef();
const typeref=useRef();
const levelref=useRef();


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

      const setyear=(id)=> {
if(transcript) {
yearref.current.value=transcript;
 }
 }
const setmonth=(id)=> {
if(transcript) {
monthref.current.value=transcript;
 }
 }
const setstructure=(id)=> {
if(transcript) {
structureref.current.value=transcript;
 }
 }
const setstructureid=(id)=> {
if(transcript) {
structureidref.current.value=transcript;
 }
 }
const setemployee=(id)=> {
if(transcript) {
employeeref.current.value=transcript;
 }
 }
const setempid=(id)=> {
if(transcript) {
empidref.current.value=transcript;
 }
 }
const setcomponent=(id)=> {
if(transcript) {
componentref.current.value=transcript;
 }
 }
const settype=(id)=> {
if(transcript) {
typeref.current.value=transcript;
 }
 }
const setlevel=(id)=> {
if(transcript) {
levelref.current.value=transcript;
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
const month=monthref.current.value;
const duedate=duedateref.current.value;
const structure=structureref.current.value;
const structureid=structureidref.current.value;
const employee=employeeref.current.value;
const empid=empidref.current.value;
const component=componentref.current.value;
const amount=amountref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createhrsalarybyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
month:month,
duedate:duedate,
structure:structure,
structureid:structureid,
employee:employee,
empid:empid,
component:component,
amount:amount,
type:type,
level:level,

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

       <button onClick={setyear}>Set Year</button>
 <button onClick={setmonth}>Set Month</button>
 <button onClick={setstructure}>Set Structure</button>
 <button onClick={setstructureid}>Set Structure id</button>
 <button onClick={setemployee}>Set Employee</button>
 <button onClick={setempid}>Set Employee id</button>
 <button onClick={setcomponent}>Set Component</button>
 <button onClick={settype}>Set Type</button>
 <button onClick={setlevel}>Set Level</button>


      <br /><br />

    <p>Year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Month</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={monthref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Due date" inputRef={duedateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Structure</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={structureref} /><br /><br />

<p>Structure id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={structureidref} /><br /><br />

<p>Employee</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={employeeref} /><br /><br />

<p>Employee id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={empidref} /><br /><br />

<p>Component</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={componentref} /><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<p>Type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={typeref} /><br /><br />

<p>Level</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={levelref} /><br /><br />


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
