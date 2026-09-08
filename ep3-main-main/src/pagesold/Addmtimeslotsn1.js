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
    const wdayref=useRef();
const periodref=useRef();
const starttimeref=useRef();
const endtimeref=useRef();
const programref=useRef();
const semesterref=useRef();
const sectionref=useRef();
const facultyref=useRef();
const facultyidref=useRef();
const courseref=useRef();
const slotstatusref=useRef();
const roomref=useRef();
const capacityref=useRef();
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

      const setwday=(id)=> {
if(transcript) {
wdayref.current.value=transcript;
 }
 }
const setperiod=(id)=> {
if(transcript) {
periodref.current.value=transcript;
 }
 }
const setprogram=(id)=> {
if(transcript) {
programref.current.value=transcript;
 }
 }
const setsemester=(id)=> {
if(transcript) {
semesterref.current.value=transcript;
 }
 }
const setsection=(id)=> {
if(transcript) {
sectionref.current.value=transcript;
 }
 }
const setfaculty=(id)=> {
if(transcript) {
facultyref.current.value=transcript;
 }
 }
const setfacultyid=(id)=> {
if(transcript) {
facultyidref.current.value=transcript;
 }
 }
const setcourse=(id)=> {
if(transcript) {
courseref.current.value=transcript;
 }
 }
const setroom=(id)=> {
if(transcript) {
roomref.current.value=transcript;
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

const wday=wdayref.current.value;
const period=periodref.current.value;
const starttime=starttimeref.current.value;
const endtime=endtimeref.current.value;
const program=programref.current.value;
const semester=semesterref.current.value;
const section=sectionref.current.value;
const faculty=facultyref.current.value;
const facultyid=facultyidref.current.value;
const course=courseref.current.value;
const slotstatus=slotstatusref.current.value;
const room=roomref.current.value;
const capacity=capacityref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createtimeslotsn1byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           wday:wday,
period:period,
starttime:starttime,
endtime:endtime,
program:program,
semester:semester,
section:section,
faculty:faculty,
facultyid:facultyid,
course:course,
slotstatus:slotstatus,
room:room,
capacity:capacity,
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

       <button onClick={setwday}>Set Day of week</button>
 <button onClick={setperiod}>Set Period</button>
 <button onClick={setprogram}>Set Program</button>
 <button onClick={setsemester}>Set Semester</button>
 <button onClick={setsection}>Set Section</button>
 <button onClick={setfaculty}>Set Faculty</button>
 <button onClick={setfacultyid}>Set Faculty id</button>
 <button onClick={setcourse}>Set Course</button>
 <button onClick={setroom}>Set Room</button>
 <button onClick={settype}>Set Type</button>
 <button onClick={setlevel}>Set Level</button>


      <br /><br />

    <p>Day of week</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={wdayref} /><br /><br />

<p>Period</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={periodref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Start time" inputRef={starttimeref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="End time" inputRef={endtimeref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Program</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Semester</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={semesterref} /><br /><br />

<p>Section</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sectionref} /><br /><br />

<p>Faculty</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyref} /><br /><br />

<p>Faculty id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyidref} /><br /><br />

<p>Course</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={courseref} /><br /><br />

<InputLabel id="slotstatus">Slot status</InputLabel><Select labelId="slotstatus"
id="slotstatus"
inputRef={slotstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Free">Free</MenuItem>
<MenuItem value="Allocated">Allocated</MenuItem>
</Select>
<br /><br />

<p>Room</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={roomref} /><br /><br />

<p>Capacity</p>
<TextField id="outlined-basic"  type="Number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={capacityref} /><br /><br />

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
