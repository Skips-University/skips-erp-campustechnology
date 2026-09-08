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
const assetidref=useRef();
const assetref=useRef();
const usernameref=useRef();
const assigndateref=useRef();
const returndateref=useRef();
const assetstatusref=useRef();


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

      const setassetid=(id)=> {
if(transcript) {
assetidref.current.value=transcript;
 }
 }
const setasset=(id)=> {
if(transcript) {
assetref.current.value=transcript;
 }
 }
const setusername=(id)=> {
if(transcript) {
usernameref.current.value=transcript;
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
// const assetid=assetidref.current.value;
// const asset=assetref.current.value;

const assetid=global1.assetid;
const asset=global1.asset;

const username=usernameref.current.value;
const assigndate=assigndateref.current.value;
const returndate=returndateref.current.value;
const assetstatus=assetstatusref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmassetassignbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
assetid:assetid,
asset:asset,
username:username,
assigndate:assigndate,
returndate:returndate,
assetstatus:assetstatus,

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

       <button onClick={setassetid}>Set Asset id</button>
 <button onClick={setasset}>Set Asset</button>
 <button onClick={setusername}>Set Assigned to username</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
</Select>
<br /><br />

{/* <p>Asset id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={assetidref} /><br /><br />

<p>Asset</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={assetref} /><br /><br /> */}

<p>Assigned to username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={usernameref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Assigned date" inputRef={assigndateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Returndate" inputRef={returndateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="assetstatus">Asset status</InputLabel><Select labelId="assetstatus"
id="assetstatus"
inputRef={assetstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Active">Active</MenuItem>
<MenuItem value="Decommissioned">Decommissioned</MenuItem>
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
