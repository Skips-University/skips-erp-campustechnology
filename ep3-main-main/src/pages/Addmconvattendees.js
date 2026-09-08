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
const convidref=useRef();
const convocationref=useRef();
const studentref=useRef();
const regnoref=useRef();
const programref=useRef();
const passingyearref=useRef();
const loginref=useRef();
const passwordref=useRef();
const rankref=useRef();
const graderef=useRef();
const cgparef=useRef();
const awardref=useRef();
const feesref=useRef();
const feedateref=useRef();
const refnoref=useRef();
const feemoderef=useRef();
const ghrequiredref=useRef();
const apprstatusref=useRef();


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
const setconvid=(id)=> {
if(transcript) {
convidref.current.value=transcript;
 }
 }
const setconvocation=(id)=> {
if(transcript) {
convocationref.current.value=transcript;
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
const setpassingyear=(id)=> {
if(transcript) {
passingyearref.current.value=transcript;
 }
 }
const setlogin=(id)=> {
if(transcript) {
loginref.current.value=transcript;
 }
 }
const setpassword=(id)=> {
if(transcript) {
passwordref.current.value=transcript;
 }
 }
const setrank=(id)=> {
if(transcript) {
rankref.current.value=transcript;
 }
 }
const setgrade=(id)=> {
if(transcript) {
graderef.current.value=transcript;
 }
 }
const setaward=(id)=> {
if(transcript) {
awardref.current.value=transcript;
 }
 }
const setrefno=(id)=> {
if(transcript) {
refnoref.current.value=transcript;
 }
 }
const setfeemode=(id)=> {
if(transcript) {
feemoderef.current.value=transcript;
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
const convid=convidref.current.value;
const convocation=convocationref.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const program=programref.current.value;
const passingyear=passingyearref.current.value;
const login=loginref.current.value;
const password=passwordref.current.value;
const rank=rankref.current.value;
const grade=graderef.current.value;
const cgpa=cgparef.current.value;
const award=awardref.current.value;
const fees=feesref.current.value;
const feedate=feedateref.current.value;
const refno=refnoref.current.value;
const feemode=feemoderef.current.value;
const ghrequired=ghrequiredref.current.value;
const apprstatus=apprstatusref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createconvattendeesbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
convid:convid,
convocation:convocation,
student:student,
regno:regno,
program:program,
passingyear:passingyear,
login:login,
password:password,
rank:rank,
grade:grade,
cgpa:cgpa,
award:award,
fees:fees,
feedate:feedate,
refno:refno,
feemode:feemode,
ghrequired:ghrequired,
apprstatus:apprstatus,

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

       <button onClick={setyear}>Set Academi year</button>
 <button onClick={setconvid}>Set convocation id</button>
 <button onClick={setconvocation}>Set Convoation</button>
 <button onClick={setstudent}>Set Student</button>
 <button onClick={setregno}>Set Regno</button>
 <button onClick={setprogram}>Set Program</button>
 <button onClick={setpassingyear}>Set Passing year</button>
 <button onClick={setlogin}>Set Login</button>
 <button onClick={setpassword}>Set Password</button>
 <button onClick={setrank}>Set Rank</button>
 <button onClick={setgrade}>Set Grade</button>
 <button onClick={setaward}>Set Award</button>
 <button onClick={setrefno}>Set Payment Ref no</button>
 <button onClick={setfeemode}>Set Fee mode</button>


      <br /><br />

    <p>Academi year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>convocation id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={convidref} /><br /><br />

<p>Convoation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={convocationref} /><br /><br />

<p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Regno</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<p>Program</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Passing year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={passingyearref} /><br /><br />

<p>Login</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={loginref} /><br /><br />

<p>Password</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={passwordref} /><br /><br />

<p>Rank</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={rankref} /><br /><br />

<p>Grade</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={graderef} /><br /><br />

<p>CGPA</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={cgparef} /><br /><br />

<p>Award</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={awardref} /><br /><br />

<p>Fees</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={feesref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Fees paid date" inputRef={feedateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Payment Ref no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={refnoref} /><br /><br />

<p>Fee mode</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={feemoderef} /><br /><br />

<InputLabel id="ghrequired">Guest house required</InputLabel><Select labelId="ghrequired"
id="ghrequired"
inputRef={ghrequiredref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<InputLabel id="apprstatus">Approval status</InputLabel><Select labelId="apprstatus"
id="apprstatus"
inputRef={apprstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Applied">Applied</MenuItem>
<MenuItem value="Approved">Approved</MenuItem>
<MenuItem value="Rejected">Rejected</MenuItem>
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
