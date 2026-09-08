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
    const testidref=useRef();
const sessionidref=useRef();
const testref=useRef();
const sessionslotref=useRef();
const studentref=useRef();
const regnoref=useRef();
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

      const settestid=(id)=> {
if(transcript) {
testidref.current.value=transcript;
 }
 }
const setsessionid=(id)=> {
if(transcript) {
sessionidref.current.value=transcript;
 }
 }
const settest=(id)=> {
if(transcript) {
testref.current.value=transcript;
 }
 }
const setsessionslot=(id)=> {
if(transcript) {
sessionslotref.current.value=transcript;
 }
 }
const setstudent=(id)=> {
if(transcript) {
studentref.current.value=transcript;
 }
 }
const setregno=(id)=> {
if(transcript) {
regnoref.current.value=transcript;
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

// const testid=testidref.current.value;
// const sessionid=sessionidref.current.value;

const testid=global1.internshipid;
const sessionid=global1.isessionid;

const test=global1.internship;
const sessionslot=global1.isession;

// const test=testref.current.value;
// const sessionslot=sessionslotref.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmiseenrol1byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           testid:testid,
sessionid:sessionid,
test:test,
sessionslot:sessionslot,
student:student,
regno:regno,
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

       {/* <button onClick={settestid}>Set test id</button>
 <button onClick={setsessionid}>Set Session id</button> */}
 {/* <button onClick={settest}>Set Test</button>
 <button onClick={setsessionslot}>Set Session slot</button> */}
 <button onClick={setstudent}>Set Student</button>
 <button onClick={setregno}>Set Reg no</button>


      <br /><br />

    {/* <p>test id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={testidref} /><br /><br />

<p>Session id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sessionidref} /><br /><br /> */}

{/* <p>Test</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={testref} /><br /><br />

<p>Session slot</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sessionslotref} /><br /><br /> */}

<p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Reg no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Campus">Campus</MenuItem>
<MenuItem value="Outside">Outside</MenuItem>
</Select>
<br /><br />

<InputLabel id="level">Levels</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="Quiz">Quiz</MenuItem>
<MenuItem value="Internal">Internal</MenuItem>
<MenuItem value="External">External</MenuItem>
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
