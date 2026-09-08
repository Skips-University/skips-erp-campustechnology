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
const phoneref=useRef();
const contactref=useRef();
const illnessref=useRef();
const treatmentref=useRef();
const surgeryref=useRef();
const amountref=useRef();
const mdateref=useRef();
const followupdateref=useRef();
const doctorrefref=useRef();
const doctorref=useRef();
const assignedtoref=useRef();
const leadstatusref=useRef();


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
const setphone=(id)=> {
if(transcript) {
phoneref.current.value=transcript;
 }
 }
const setcontact=(id)=> {
if(transcript) {
contactref.current.value=transcript;
 }
 }
const settreatment=(id)=> {
if(transcript) {
treatmentref.current.value=transcript;
 }
 }
const setsurgery=(id)=> {
if(transcript) {
surgeryref.current.value=transcript;
 }
 }
const setdoctorref=(id)=> {
if(transcript) {
doctorrefref.current.value=transcript;
 }
 }
const setdoctor=(id)=> {
if(transcript) {
doctorref.current.value=transcript;
 }
 }
const setassignedto=(id)=> {
if(transcript) {
assignedtoref.current.value=transcript;
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

const patient=patientref.current.value;
const phone=phoneref.current.value;
const contact=contactref.current.value;
const illness=illnessref.current.value;
const treatment=treatmentref.current.value;
const surgery=surgeryref.current.value;
const amount=amountref.current.value;
const mdate=mdateref.current.value;
const followupdate=followupdateref.current.value;
const doctorref=doctorrefref.current.value;
const doctor=doctorref.current.value;
const assignedto=assignedtoref.current.value;
const leadstatus=leadstatusref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createpcounselnewbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           patient:patient,
phone:phone,
contact:contact,
illness:illness,
treatment:treatment,
surgery:surgery,
amount:amount,
mdate:mdate,
followupdate:followupdate,
doctorref:doctorref,
doctor:doctor,
assignedto:assignedto,
leadstatus:leadstatus,

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

       <button onClick={setpatient}>Set Patient</button>
 <button onClick={setphone}>Set Phone</button>
 <button onClick={setcontact}>Set Contact</button>
 <button onClick={settreatment}>Set Treatment</button>
 <button onClick={setsurgery}>Set Surgery</button>
 <button onClick={setdoctorref}>Set Doctor reference</button>
 <button onClick={setdoctor}>Set Doctor</button>
 <button onClick={setassignedto}>Set Assigned to</button>


      <br /><br />

    <p>Patient</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={patientref} /><br /><br />

<p>Phone</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={phoneref} /><br /><br />

<p>Contact</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={contactref} /><br /><br />

<p>undefined</p>
<TextField id="outlined-basic"  type="Illness" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={illnessref} /><br /><br />

<p>Treatment</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={treatmentref} /><br /><br />

<p>Surgery</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={surgeryref} /><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Meeting date" inputRef={mdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Follow up date" inputRef={followupdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Doctor reference</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doctorrefref} /><br /><br />

<p>Doctor</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doctorref} /><br /><br />

<p>Assigned to</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={assignedtoref} /><br /><br />

<InputLabel id="leadstatus">Lead status</InputLabel><Select labelId="leadstatus"
id="leadstatus"
inputRef={leadstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Meeting">Meeting</MenuItem>
<MenuItem value="In proess">In proess</MenuItem>
<MenuItem value="Registered">Registered</MenuItem>
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
