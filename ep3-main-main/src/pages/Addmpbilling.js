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
    const patientref=useRef();
const puserref=useRef();
const admidref=useRef();
const billdateref=useRef();
const descriptionref=useRef();
const amountref=useRef();
const payrefref=useRef();
const paystatusref=useRef();


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

      const setpatient=(id)=> {
if(transcript) {
patientref.current.value=transcript;
 }
 }
const setpuser=(id)=> {
if(transcript) {
puserref.current.value=transcript;
 }
 }
const setadmid=(id)=> {
if(transcript) {
admidref.current.value=transcript;
 }
 }
const setdescription=(id)=> {
if(transcript) {
descriptionref.current.value=transcript;
 }
 }
const setamount=(id)=> {
if(transcript) {
amountref.current.value=transcript;
 }
 }
const setpayref=(id)=> {
if(transcript) {
payrefref.current.value=transcript;
 }
 }

 const patient1=global1.patient;
const puser1=global1.puser;
const admid1=global1.padmid;



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

// const patient=patientref.current.value;
// const puser=puserref.current.value;
// const admid=admidref.current.value;

const patient=global1.patient;
const puser=global1.puser;
const admid=global1.padmid;
const billdate=billdateref.current.value;
const description=descriptionref.current.value;
const amount=amountref.current.value;
const payref=payrefref.current.value;
const paystatus=paystatusref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createpbillingbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           patient:patient,
puser:puser,
admid:admid,
billdate:billdate,
description:description,
amount:amount,
payref:payref,
paystatus:paystatus,

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
        Selected Patient: {patient1} <br />
        Selected Patient user id: {puser1} <br />
        Selected Admission id: {admid1} <br /><br />
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>

       <button onClick={setpatient}>Set Patient</button>
 <button onClick={setpuser}>Set Patient username</button>
 <button onClick={setadmid}>Set Admission id</button>
 <button onClick={setdescription}>Set Description</button>
 <button onClick={setamount}>Set Amount</button>
 <button onClick={setpayref}>Set Pay ref</button>


      <br /><br />

    {/* <p>Patient</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={patientref} /><br /><br />

<p>Patient username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={puserref} /><br /><br />

<p>Admission id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={admidref} /><br /><br /> */}

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Bill date" inputRef={billdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<p>Pay ref</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={payrefref} /><br /><br />

<InputLabel id="paystatus">Pay status</InputLabel><Select labelId="paystatus"
id="paystatus"
inputRef={paystatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Paid">Paid</MenuItem>
<MenuItem value="Due">Due</MenuItem>
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
