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
    const studentref=useRef();
const regnoref=useRef();
const rollnoref=useRef();
const programref=useRef();
const programcoderef=useRef();
const batchref=useRef();
const yearref=useRef();
const genderref=useRef();
const categoryref=useRef();
const pwdref=useRef();
const minorityref=useRef();
const currentyearref=useRef();
const currentsemref=useRef();
const usernameref=useRef();
const passwordref=useRef();
const enabledref=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

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
const setrollno=(id)=> {
if(transcript) {
rollnoref.current.value=transcript;
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
const setcurrentyear=(id)=> {
if(transcript) {
currentyearref.current.value=transcript;
 }
 }
const setcurrentsem=(id)=> {
if(transcript) {
currentsemref.current.value=transcript;
 }
 }
const setusername=(id)=> {
if(transcript) {
usernameref.current.value=transcript;
 }
 }
const setpassword=(id)=> {
if(transcript) {
passwordref.current.value=transcript;
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

const student=studentref.current.value;
const regno=regnoref.current.value;
const rollno=rollnoref.current.value;
const program=programref.current.value;
const programcode=programcoderef.current.value;
const batch=batchref.current.value;
const year=yearref.current.value;
const gender=genderref.current.value;
const category=categoryref.current.value;
const pwd=pwdref.current.value;
const minority=minorityref.current.value;
const currentyear=currentyearref.current.value;
const currentsem=currentsemref.current.value;
const username=usernameref.current.value;
const password=passwordref.current.value;
const enabled=enabledref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmstudents1byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           student:student,
regno:regno,
rollno:rollno,
program:program,
programcode:programcode,
batch:batch,
year:year,
gender:gender,
category:category,
pwd:pwd,
minority:minority,
currentyear:currentyear,
currentsem:currentsem,
username:username,
password:password,
enabled:enabled,

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

       <button onClick={setstudent}>Set Student</button>
 <button onClick={setregno}>Set Registration no</button>
 <button onClick={setrollno}>Set Roll no</button>
 <button onClick={setprogram}>Set Program</button>
 <button onClick={setprogramcode}>Set Program code</button>
 <button onClick={setcurrentyear}>Set Current academic year</button>
 <button onClick={setcurrentsem}>Set Current semester</button>
 <button onClick={setusername}>Set Username</button>
 <button onClick={setpassword}>Set Password</button>


      <br /><br />

    <p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Registration no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<p>Roll no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={rollnoref} /><br /><br />

<p>Program</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Program code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />

<InputLabel id="batch">Batch</InputLabel><Select labelId="batch"
id="batch"
inputRef={batchref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
</Select>
<br /><br />

<InputLabel id="year">Admission year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
</Select>
<br /><br />

<InputLabel id="gender">Gender</InputLabel><Select labelId="gender"
id="gender"
inputRef={genderref}
sx={{ width: '100%'}}
>
<MenuItem value="Male">Male</MenuItem>
<MenuItem value="Female">Female</MenuItem>
<MenuItem value="Not specified">Not specified</MenuItem>
</Select>
<br /><br />

<InputLabel id="category">Category</InputLabel><Select labelId="category"
id="category"
inputRef={categoryref}
sx={{ width: '100%'}}
>
<MenuItem value="SC">SC</MenuItem>
<MenuItem value="ST">ST</MenuItem>
<MenuItem value="OBC">OBC</MenuItem>
<MenuItem value="General">General</MenuItem>
<MenuItem value="Others">Others</MenuItem>
</Select>
<br /><br />

<InputLabel id="pwd">Is PWD</InputLabel><Select labelId="pwd"
id="pwd"
inputRef={pwdref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<InputLabel id="minority">Is minority</InputLabel><Select labelId="minority"
id="minority"
inputRef={minorityref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<p>Current academic year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={currentyearref} /><br /><br />

<p>Current semester</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={currentsemref} /><br /><br />

<p>Username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={usernameref} /><br /><br />

<p>Password</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={passwordref} /><br /><br />

<InputLabel id="enabled">Is enabled</InputLabel><Select labelId="enabled"
id="enabled"
inputRef={enabledref}
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
