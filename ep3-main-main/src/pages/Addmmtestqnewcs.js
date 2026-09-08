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
const sectionidref=useRef();
const questionref=useRef();
const questionimgref=useRef();
const questionlinkref=useRef();
const optionaref=useRef();
const optionbref=useRef();
const optioncref=useRef();
const optiondref=useRef();
const correctaref=useRef();
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
const setsectionid=(id)=> {
if(transcript) {
sectionidref.current.value=transcript;
 }
 }
const setquestion=(id)=> {
if(transcript) {
questionref.current.value=transcript;
 }
 }
const setquestionimg=(id)=> {
if(transcript) {
questionimgref.current.value=transcript;
 }
 }
const setquestionlink=(id)=> {
if(transcript) {
questionlinkref.current.value=transcript;
 }
 }
const setoptiona=(id)=> {
if(transcript) {
optionaref.current.value=transcript;
 }
 }
const setoptionb=(id)=> {
if(transcript) {
optionbref.current.value=transcript;
 }
 }
const setoptionc=(id)=> {
if(transcript) {
optioncref.current.value=transcript;
 }
 }
const setoptiond=(id)=> {
if(transcript) {
optiondref.current.value=transcript;
 }
 }
const setcorrecta=(id)=> {
if(transcript) {
correctaref.current.value=transcript;
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

const testid=testidref.current.value;
const sectionid=sectionidref.current.value;
const question=questionref.current.value;
const questionimg=questionimgref.current.value;
const questionlink=questionlinkref.current.value;
const optiona=optionaref.current.value;
const optionb=optionbref.current.value;
const optionc=optioncref.current.value;
const optiond=optiondref.current.value;
const correcta=correctaref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmtestqnewcsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           testid:testid,
sectionid:sectionid,
question:question,
questionimg:questionimg,
questionlink:questionlink,
optiona:optiona,
optionb:optionb,
optionc:optionc,
optiond:optiond,
correcta:correcta,
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

       <button onClick={settestid}>Set Test id</button>
 <button onClick={setsectionid}>Set Section id</button>
 <button onClick={setquestion}>Set Question</button>
 <button onClick={setquestionimg}>Set Image link</button>
 <button onClick={setquestionlink}>Set Document link</button>
 <button onClick={setoptiona}>Set Option A</button>
 <button onClick={setoptionb}>Set Option B</button>
 <button onClick={setoptionc}>Set Option C</button>
 <button onClick={setoptiond}>Set Option D</button>
 <button onClick={setcorrecta}>Set Correct Option</button>


      <br /><br />

    <p>Test id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={testidref} /><br /><br />

<p>Section id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sectionidref} /><br /><br />

<p>Question</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={questionref} /><br /><br />

<p>Image link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={questionimgref} /><br /><br />

<p>Document link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={questionlinkref} /><br /><br />

<p>Option A</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={optionaref} /><br /><br />

<p>Option B</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={optionbref} /><br /><br />

<p>Option C</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={optioncref} /><br /><br />

<p>Option D</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={optiondref} /><br /><br />

<p>Correct Option</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={correctaref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="MCQ">MCQ</MenuItem>
<MenuItem value="Descriptive">Descriptive</MenuItem>
</Select>
<br /><br />

<InputLabel id="level">Level</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="National">National</MenuItem>
<MenuItem value="State">State</MenuItem>
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
