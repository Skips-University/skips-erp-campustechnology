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
const examcoderef=useRef();
const studentref=useRef();
const regnoref=useRef();
const programref=useRef();
const programcoderef=useRef();
const courseref=useRef();
const coursecoderef=useRef();
const semesterref=useRef();
const creditsref=useRef();
const intmarksref=useRef();
const extmarksref=useRef();
const resultref=useRef();
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
const setsemester=(id)=> {
if(transcript) {
semesterref.current.value=transcript;
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
const examcode=examcoderef.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const program=programref.current.value;
const programcode=programcoderef.current.value;
const course=courseref.current.value;
const coursecode=coursecoderef.current.value;
const semester=semesterref.current.value;
const credits=creditsref.current.value;
const intmarks=intmarksref.current.value;
const extmarks=extmarksref.current.value;
const result=resultref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createexamtotal1byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
examcode:examcode,
student:student,
regno:regno,
program:program,
programcode:programcode,
course:course,
coursecode:coursecode,
semester:semester,
credits:credits,
intmarks:intmarks,
extmarks:extmarks,
result:result,
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

       <button onClick={setexamcode}>Set Exam code</button>
 <button onClick={setstudent}>Set Student</button>
 <button onClick={setregno}>Set Reg no</button>
 <button onClick={setprogram}>Set Program</button>
 <button onClick={setprogramcode}>Set Programcode</button>
 <button onClick={setcourse}>Set Course</button>
 <button onClick={setcoursecode}>Set Coursecode</button>
 <button onClick={setsemester}>Set Semester</button>
 <button onClick={settype}>Set type</button>
 <button onClick={setlevel}>Set Level</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2025-26">2025-26</MenuItem>
<MenuItem value="2026-27">2026-27</MenuItem>
</Select>
<br /><br />

<p>Exam code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={examcoderef} /><br /><br />

<p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Reg no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<p>Program</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Programcode</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />

<p>Course</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={courseref} /><br /><br />

<p>Coursecode</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br />

<p>Semester</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={semesterref} /><br /><br />

<p>Credits</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={creditsref} /><br /><br />

<p>Internal marks</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={intmarksref} /><br /><br />

<p>External marks</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={extmarksref} /><br /><br />

<InputLabel id="result">Result</InputLabel><Select labelId="result"
id="result"
inputRef={resultref}
sx={{ width: '100%'}}
>
<MenuItem value="Pass">Pass</MenuItem>
<MenuItem value="Fail">Fail</MenuItem>
</Select>
<br /><br />

<p>type</p>
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
