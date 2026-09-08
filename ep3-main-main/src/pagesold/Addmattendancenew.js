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
const classidref=useRef();
const programcoderef=useRef();
const programref=useRef();
const courseref=useRef();
const coursecoderef=useRef();
const studentref=useRef();
const regnoref=useRef();
const attref=useRef();
const classdateref=useRef();
const semesterref=useRef();
const sectionref=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

    const regno=global1.regno;

    const classid=global1.classid;
    const classdate=new Date(global1.facclassdate);
    const year=global1.lmsyear;
    const course=global1.faccoursename;
    const coursecode=global1.faccoursecode;
    const program=global1.facprogram;
    const programcode=global1.facprogramcode;
    const semester=global1.facsemester;
    const section=global1.facsection;

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

      const setclassid=(id)=> {
if(transcript) {
classidref.current.value=transcript;
 }
 }
const setprogramcode=(id)=> {
if(transcript) {
programcoderef.current.value=transcript;
 }
 }
const setprogram=(id)=> {
if(transcript) {
programref.current.value=transcript;
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
const setsection=(id)=> {
if(transcript) {
sectionref.current.value=transcript;
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

// const year=yearref.current.value;
// const classid=classidref.current.value;
// const programcode=programcoderef.current.value;
// const program=programref.current.value;
// const course=courseref.current.value;
// const coursecode=coursecoderef.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const att=attref.current.value;
// const classdate=classdateref.current.value;
// const semester=semesterref.current.value;
// const section=sectionref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createattendancenewbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
classid:classid,
programcode:programcode,
program:program,
course:course,
coursecode:coursecode,
student:student,
regno:regno,
att:att,
classdate:classdate,
semester:semester,
section:section,

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

       <button onClick={setclassid}>Set Class id</button>
 <button onClick={setprogramcode}>Set Program code</button>
 <button onClick={setprogram}>Set Program</button>
 <button onClick={setcourse}>Set Course</button>
 <button onClick={setcoursecode}>Set Course code</button>
 <button onClick={setstudent}>Set Student</button>
 <button onClick={setregno}>Set Reg no</button>
 <button onClick={setsection}>Set Section</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
</Select>
<br /><br />

{/* <p>Class id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={classidref} /><br /><br />

<p>Program code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />

<p>Program</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Course</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={courseref} /><br /><br />

<p>Course code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br /> */}

<p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Reg no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<InputLabel id="att">Attendance</InputLabel><Select labelId="att"
id="att"
inputRef={attref}
sx={{ width: '100%'}}
>
<MenuItem value="1">1</MenuItem>
<MenuItem value="0">0</MenuItem>
</Select>
<br /><br />
{/* 
<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Class date" inputRef={classdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="semester">Semester</InputLabel><Select labelId="semester"
id="semester"
inputRef={semesterref}
sx={{ width: '100%'}}
>
<MenuItem value="One">One</MenuItem>
<MenuItem value="Two">Two</MenuItem>
<MenuItem value="Three">Three</MenuItem>
<MenuItem value="Four">Four</MenuItem>
<MenuItem value="Five">Five</MenuItem>
<MenuItem value="Six">Six</MenuItem>
<MenuItem value="Seven">Seven</MenuItem>
<MenuItem value="Eight">Eight</MenuItem>
<MenuItem value="Nine">Nine</MenuItem>
<MenuItem value="Ten">Ten</MenuItem>
</Select>
<br /><br />

<p>Section</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sectionref} /><br /><br /> */}


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
