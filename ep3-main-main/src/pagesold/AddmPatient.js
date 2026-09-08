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
    const mrnumberref=useRef();
const patientref=useRef();
const ageref=useRef();
const genderref=useRef();
const phoneref=useRef();
const emailref=useRef();
const addressref=useRef();
const bloodGroupref=useRef();
const usernameref=useRef();
const passwordref=useRef();
const dobref=useRef();


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

      const setmrnumber=(id)=> {
if(transcript) {
mrnumberref.current.value=transcript;
 }
 }
const setpatient=(id)=> {
if(transcript) {
patientref.current.value=transcript;
 }
 }
const setgender=(id)=> {
if(transcript) {
genderref.current.value=transcript;
 }
 }
const setphone=(id)=> {
if(transcript) {
phoneref.current.value=transcript;
 }
 }
const setemail=(id)=> {
if(transcript) {
emailref.current.value=transcript;
 }
 }
const setaddress=(id)=> {
if(transcript) {
addressref.current.value=transcript;
 }
 }
const setbloodGroup=(id)=> {
if(transcript) {
bloodGroupref.current.value=transcript;
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

const mrnumber=mrnumberref.current.value;
const patient=patientref.current.value;
const age=ageref.current.value;
const gender=genderref.current.value;
const phone=phoneref.current.value;
const email=emailref.current.value;
const address=addressref.current.value;
const bloodGroup=bloodGroupref.current.value;
const username=usernameref.current.value;
const password=passwordref.current.value;
const dob=dobref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createPatientbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           mrnumber:mrnumber,
patient:patient,
age:age,
gender:gender,
phone:phone,
email:email,
address:address,
bloodGroup:bloodGroup,
username:username,
password:password,
dob:dob,

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

       <button onClick={setmrnumber}>Set mrnumber</button>
 <button onClick={setpatient}>Set Patient</button>
 <button onClick={setgender}>Set Gender</button>
 <button onClick={setphone}>Set Phone</button>
 <button onClick={setemail}>Set Email</button>
 <button onClick={setaddress}>Set Address</button>
 <button onClick={setbloodGroup}>Set Blood group</button>
 <button onClick={setusername}>Set Username</button>
 <button onClick={setpassword}>Set Password</button>


      <br /><br />

    <p>mrnumber</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={mrnumberref} /><br /><br />

<p>Patient</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={patientref} /><br /><br />

<p>Age</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={ageref} /><br /><br />

<p>Gender</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={genderref} /><br /><br />

<p>Phone</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={phoneref} /><br /><br />

<p>Email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={emailref} /><br /><br />

<p>Address</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={addressref} /><br /><br />

<p>Blood group</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bloodGroupref} /><br /><br />

<p>Username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={usernameref} /><br /><br />

<p>Password</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={passwordref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="date of birth" inputRef={dobref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />


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
