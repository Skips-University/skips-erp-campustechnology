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
    const examref=useRef();
const examcoderef=useRef();
const academicyearref=useRef();
const studentref=useRef();
const regnoref=useRef();
const programref=useRef();
const programcoderef=useRef();
const courseref=useRef();
const coursecoderef=useRef();
const iafullref=useRef();
const iamarksref=useRef();
const eafullref=useRef();
const eamarksref=useRef();
const totalfullref=useRef();
const totalmarksref=useRef();
const totalpref=useRef();
const egraderef=useRef();
const semesterref=useRef();


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

      const setexam=(id)=> {
if(transcript) {
examref.current.value=transcript;
 }
 }
const setexamcode=(id)=> {
if(transcript) {
examcoderef.current.value=transcript;
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
const setprogram=(id)=> {
if(transcript) {
programref.current.value=transcript;
 }
 }
const setprogramcode=(id)=> {
if(transcript) {
programcoderef.current.value=transcript;
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
const setegrade=(id)=> {
if(transcript) {
egraderef.current.value=transcript;
 }
 }
const setsemester=(id)=> {
if(transcript) {
semesterref.current.value=transcript;
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

const exam=examref.current.value;
const examcode=examcoderef.current.value;
const academicyear=academicyearref.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const program=programref.current.value;
const programcode=programcoderef.current.value;
const course=courseref.current.value;
const coursecode=coursecoderef.current.value;
const iafull=iafullref.current.value;
const iamarks=iamarksref.current.value;
const eafull=eafullref.current.value;
const eamarks=eamarksref.current.value;
const totalfull=totalfullref.current.value;
const totalmarks=totalmarksref.current.value;
const totalp=totalpref.current.value;
const egrade=egraderef.current.value;
const semester=semesterref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createexammarksallbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           exam:exam,
examcode:examcode,
academicyear:academicyear,
student:student,
regno:regno,
program:program,
programcode:programcode,
course:course,
coursecode:coursecode,
iafull:iafull,
iamarks:iamarks,
eafull:eafull,
eamarks:eamarks,
totalfull:totalfull,
totalmarks:totalmarks,
totalp:totalp,
egrade:egrade,
semester:semester,

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

       <button onClick={setexam}>Set Exam</button>
 <button onClick={setexamcode}>Set Exam code</button>
 <button onClick={setstudent}>Set Student</button>
 <button onClick={setregno}>Set Reg no</button>
 <button onClick={setprogram}>Set Program</button>
 <button onClick={setprogramcode}>Set Program code</button>
 <button onClick={setcourse}>Set Course</button>
 <button onClick={setcoursecode}>Set Couse code</button>
 <button onClick={setegrade}>Set Grade</button>
 <button onClick={setsemester}>Set Semester</button>


      <br /><br />

    <p>Exam</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={examref} /><br /><br />

<p>Exam code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={examcoderef} /><br /><br />

<InputLabel id="academicyear">Academic year</InputLabel><Select labelId="academicyear"
id="academicyear"
inputRef={academicyearref}
sx={{ width: '100%'}}
>
<MenuItem value="2025-26">2025-26</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
</Select>
<br /><br />

<p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Reg no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<p>Program</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Program code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />

<p>Course</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={courseref} /><br /><br />

<p>Couse code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br />

<p>IA1 Full Marks</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={iafullref} /><br /><br />

<p>IA1 Marks obtained</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={iamarksref} /><br /><br />

<p>External full marks</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={eafullref} /><br /><br />

<p>External marks obtained</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={eamarksref} /><br /><br />

<p>Total full marks</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={totalfullref} /><br /><br />

<p>Total marks obtained</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={totalmarksref} /><br /><br />

<p>Percentage</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={totalpref} /><br /><br />

<p>Grade</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={egraderef} /><br /><br />

<p>Semester</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={semesterref} /><br /><br />


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
