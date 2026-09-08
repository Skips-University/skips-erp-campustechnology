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
    const coursecoderef=useRef();
const testcref=useRef();
const descriptionref=useRef();
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

      const setcoursecode=(id)=> {
if(transcript) {
coursecoderef.current.value=transcript;
 }
 }
const settestc=(id)=> {
if(transcript) {
testcref.current.value=transcript;
 }
 }
const setdescription=(id)=> {
if(transcript) {
descriptionref.current.value=transcript;
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

const coursecode=coursecoderef.current.value;
const testc=testcref.current.value;
const description=descriptionref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createminewmbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           coursecode:coursecode,
testc:testc,
description:description,
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

       <button onClick={setcoursecode}>Set Course code</button>
 <button onClick={settestc}>Set Test</button>
 <button onClick={setdescription}>Set Description</button>


      <br /><br />

    <p>Course code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br />

<p>Test</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={testcref} /><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="MCQ">MCQ</MenuItem>
<MenuItem value="Descriptive">Descriptive</MenuItem>
<MenuItem value="Combined">Combined</MenuItem>
</Select>
<br /><br />

<InputLabel id="level">Level</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="Internal">Internal</MenuItem>
<MenuItem value="Quiz">Quiz</MenuItem>
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
