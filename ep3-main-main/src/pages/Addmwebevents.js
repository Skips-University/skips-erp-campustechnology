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
    const titleref=useRef();
const descriptionref=useRef();
const eventdateref=useRef();
const eventtimeref=useRef();
const locationref=useRef();
const eventdayref=useRef();
const eventmonthref=useRef();
const linkref=useRef();


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
const seteventdate=(id)=> {
if(transcript) {
eventdateref.current.value=transcript;
 }
 }
const seteventtime=(id)=> {
if(transcript) {
eventtimeref.current.value=transcript;
 }
 }
const setlocation=(id)=> {
if(transcript) {
locationref.current.value=transcript;
 }
 }
const seteventday=(id)=> {
if(transcript) {
eventdayref.current.value=transcript;
 }
 }
const seteventmonth=(id)=> {
if(transcript) {
eventmonthref.current.value=transcript;
 }
 }
const setlink=(id)=> {
if(transcript) {
linkref.current.value=transcript;
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

const title=titleref.current.value;
const description=descriptionref.current.value;
const eventdate=eventdateref.current.value;
const eventtime=eventtimeref.current.value;
const location=locationref.current.value;
const eventday=eventdayref.current.value;
const eventmonth=eventmonthref.current.value;
const link=linkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createwebeventsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           title:title,
description:description,
eventdate:eventdate,
eventtime:eventtime,
location:location,
eventday:eventday,
eventmonth:eventmonth,
link:link,

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

       <button onClick={settitle}>Set Title</button>
 <button onClick={setdescription}>Set Desription</button>
 <button onClick={seteventdate}>Set Event date</button>
 <button onClick={seteventtime}>Set Event time</button>
 <button onClick={setlocation}>Set Location</button>
 <button onClick={seteventday}>Set Event day</button>
 <button onClick={seteventmonth}>Set Event month</button>
 <button onClick={setlink}>Set Link</button>


      <br /><br />

    <p>Title</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={titleref} /><br /><br />

<p>Desription</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Event date</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={eventdateref} /><br /><br />

<p>Event time</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={eventtimeref} /><br /><br />

<p>Location</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={locationref} /><br /><br />

<p>Event day</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={eventdayref} /><br /><br />

<p>Event month</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={eventmonthref} /><br /><br />

<p>Link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={linkref} /><br /><br />


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
