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
const programref=useRef();
const programcoderef=useRef();
const courseref=useRef();
const coursecoderef=useRef();
const studentref=useRef();
const regnoref=useRef();
const learningref=useRef();
const genderref=useRef();
const classgroupref=useRef();
const coursetyperef=useRef();
const semesterref=useRef();
const activeref=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

    const regno=global1.regno;
    const student=global1.student;

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
const setclassgroup=(id)=> {
if(transcript) {
classgroupref.current.value=transcript;
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
const program=programref.current.value;
const programcode=programcoderef.current.value;
const course=courseref.current.value;
const coursecode=coursecoderef.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const learning=learningref.current.value;
const gender=genderref.current.value;
const classgroup=classgroupref.current.value;
const coursetype=coursetyperef.current.value;
const semester=semesterref.current.value;
const active=activeref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createclassenr1byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
program:program,
programcode:programcode,
course:course,
coursecode:coursecode,
student:student,
regno:regno,
learning:learning,
gender:gender,
classgroup:classgroup,
coursetype:coursetype,
semester:semester,
active:active,

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
 <button onClick={setprogram}>Set Program</button>
 <button onClick={setprogramcode}>Set Program code</button>
 <button onClick={setcourse}>Set Course</button>
 <button onClick={setcoursecode}>Set Course code</button>
 <button onClick={setstudent}>Set Student</button>
 <button onClick={setregno}>Set Reg no</button>
 <button onClick={setclassgroup}>Set Class group</button>


      <br /><br />

    <p>Academic year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Program</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Program code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />

<p>Course</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={courseref} /><br /><br />

<p>Course code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br />

<p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Reg no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<InputLabel id="learning">Learning level</InputLabel><Select labelId="learning"
id="learning"
inputRef={learningref}
sx={{ width: '100%'}}
>
<MenuItem value="Advanced">Advanced</MenuItem>
<MenuItem value="Progressing">Progressing</MenuItem>
<MenuItem value="Slow">Slow</MenuItem>
</Select>
<br /><br />

<InputLabel id="gender">Gender</InputLabel><Select labelId="gender"
id="gender"
inputRef={genderref}
sx={{ width: '100%'}}
>
<MenuItem value="Male">Male</MenuItem>
<MenuItem value="Female">Female</MenuItem>
<MenuItem value="Others">Others</MenuItem>
</Select>
<br /><br />

<p>Class group</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={classgroupref} /><br /><br />

<InputLabel id="coursetype">Course type</InputLabel><Select labelId="coursetype"
id="coursetype"
inputRef={coursetyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Theory">Theory</MenuItem>
<MenuItem value="Practical">Practical</MenuItem>
<MenuItem value="Others">Others</MenuItem>
</Select>
<br /><br />

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

<InputLabel id="active">Is active</InputLabel><Select labelId="active"
id="active"
inputRef={activeref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
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
