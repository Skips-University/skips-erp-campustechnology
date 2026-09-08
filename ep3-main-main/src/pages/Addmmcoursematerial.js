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

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser }) {
    const yearref=useRef();
const courseref=useRef();
const coursecoderef=useRef();
const slidenoref=useRef();
const titleref=useRef();
const descriptionref=useRef();
const imagelinkref=useRef();
const voicetextref=useRef();
const doclinkref=useRef();
const typeref=useRef();
const moderef=useRef();


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
const setcourse=(id)=> {
if(transcript) {
courseref.current.value=transcript;
 }
 }
const setcoursecode=(id)=> {
if(transcript) {
coursecoderef.current.value=transcript;
 }
 }
const settitle=(id)=> {
if(transcript) {
titleref.current.value=transcript;
 }
 }
const setdescription=(id)=> {
if(transcript) {
descriptionref.current.value=transcript;
 }
 }
const setimagelink=(id)=> {
if(transcript) {
imagelinkref.current.value=transcript;
 }
 }
const setvoicetext=(id)=> {
if(transcript) {
voicetextref.current.value=transcript;
 }
 }
const setdoclink=(id)=> {
if(transcript) {
doclinkref.current.value=transcript;
 }
 }

 const coursename=global1.faccoursename;
 const coursecode=global1.faccoursecode;
 const lmsyear=global1.lmsyear;

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

// const year=yearref.current.value;
// const course=courseref.current.value;
// const coursecode=coursecoderef.current.value;
const slideno=slidenoref.current.value;
const title=titleref.current.value;
const description=descriptionref.current.value;
const imagelink=imagelinkref.current.value;
const voicetext=voicetextref.current.value;
const doclink=doclinkref.current.value;
const type=typeref.current.value;
const mode=moderef.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmcoursematerialbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:lmsyear,
course:coursename,
coursecode:coursecode,
slideno:slideno,
title:title,
description:description,
imagelink:imagelink,
voicetext:voicetext,
doclink:doclink,
type:type,
mode:mode,

status1:'Submitted',
            comments:''

        }
    });
    //setLoading(false);
    //setIsuploading(false);
    //console.log(response.data.data);
    //alert(response.data.status);
    //history.replace('/viewnaddonc');

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

       <button onClick={setyear}>Set Academic year</button>
 <button onClick={setcourse}>Set Course</button>
 <button onClick={setcoursecode}>Set Course code</button>
 <button onClick={settitle}>Set Title</button>
 <button onClick={setdescription}>Set Description</button>
 <button onClick={setimagelink}>Set Image link</button>
 <button onClick={setvoicetext}>Set Voice text</button>
 <button onClick={setdoclink}>Set Document link</button>


      <br /><br />

    {/* <p>Academic year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Course</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={courseref} /><br /><br />

<p>Course code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br /> */}

<p>Slide no</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={slidenoref} /><br /><br />

<p>Title</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={titleref} /><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Image link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={imagelinkref} /><br /><br />

<p>Voice text</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={voicetextref} /><br /><br />

<p>Document link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doclinkref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Theory">Theory</MenuItem>
<MenuItem value="Practical">Practical</MenuItem>
</Select>
<br /><br />

<InputLabel id="mode">Mode</InputLabel><Select labelId="mode"
id="mode"
inputRef={moderef}
sx={{ width: '100%'}}
>
<MenuItem value="Homework">Homework</MenuItem>
<MenuItem value="Labword">Labword</MenuItem>
<MenuItem value="Internship">Internship</MenuItem>
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
