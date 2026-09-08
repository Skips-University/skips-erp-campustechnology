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
const titleref=useRef();
const eventdateref=useRef();
const typeref=useRef();
const locationref=useRef();
const durationref=useRef();
const monthofyearef=useRef();


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
const setlocation=(id)=> {
if(transcript) {
locationref.current.value=transcript;
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
const title=titleref.current.value;
const eventdate=eventdateref.current.value;
const type=typeref.current.value;
const location=locationref.current.value;
const duration=durationref.current.value;
const monthofyea=monthofyearef.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmcalendarbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:lmsyear,
course:coursename,
coursecode:coursecode,
title:title,
eventdate:eventdate,
type:type,
location:location,
duration:duration,
monthofyear:monthofyea,

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
 <button onClick={setcoursecode}>Set Coursecode</button>
 <button onClick={settitle}>Set Title</button>
 <button onClick={setlocation}>Set undefined</button>


      <br /><br />

    {/* <p>Academic year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Course</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={courseref} /><br /><br />

<p>Coursecode</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br /> */}

<p>Title</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={titleref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Activity date" inputRef={eventdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Field trip">Field trip</MenuItem>
<MenuItem value="Classes">Classes</MenuItem>
<MenuItem value="Holiday">Holiday</MenuItem>
<MenuItem value="Internship">Internship</MenuItem>
<MenuItem value="Internal exam">Internal exam</MenuItem>
<MenuItem value="Exam">Exam</MenuItem>
</Select>
<br /><br />

<p>Location</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={locationref} /><br /><br />

<p>Duration in days</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={durationref} /><br /><br />

<InputLabel id="monthofyea">Month of year</InputLabel><Select labelId="monthofyea"
id="monthofyea"
inputRef={monthofyearef}
sx={{ width: '100%'}}
>
<MenuItem value="Jan">Jan</MenuItem>
<MenuItem value="Feb">Feb</MenuItem>
<MenuItem value="Mar">Mar</MenuItem>
<MenuItem value="Apr">Apr</MenuItem>
<MenuItem value="May">May</MenuItem>
<MenuItem value="Jun">Jun</MenuItem>
<MenuItem value="Jul">Jul</MenuItem>
<MenuItem value="Aug">Aug</MenuItem>
<MenuItem value="Sep">Sep</MenuItem>
<MenuItem value="Oct">Oct</MenuItem>
<MenuItem value="Nov">Nov</MenuItem>
<MenuItem value="Dec">Dec</MenuItem>
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
