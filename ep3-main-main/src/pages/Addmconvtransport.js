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
const guestref=useRef();
const cloginref=useRef();
const fromref=useRef();
const toref=useRef();
const traveldateref=useRef();
const typeref=useRef();


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
const setguest=(id)=> {
if(transcript) {
guestref.current.value=transcript;
 }
 }
const setclogin=(id)=> {
if(transcript) {
cloginref.current.value=transcript;
 }
 }
const setfrom=(id)=> {
if(transcript) {
fromref.current.value=transcript;
 }
 }
const setto=(id)=> {
if(transcript) {
toref.current.value=transcript;
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
const guest=guestref.current.value;
const clogin=cloginref.current.value;
const from=fromref.current.value;
const to=toref.current.value;
const traveldate=traveldateref.current.value;
const type=typeref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createconvtransportbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
convid:convid,
convocation:convocation,
guest:guest,
clogin:clogin,
from:from,
to:to,
traveldate:traveldate,
type:type,

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

       <button onClick={setyear}>Set Academic year</button>
 <button onClick={setconvid}>Set Convoation id</button>
 <button onClick={setconvocation}>Set Convocation</button>
 <button onClick={setguest}>Set Guest</button>
 <button onClick={setclogin}>Set Guest login</button>
 <button onClick={setfrom}>Set From location</button>
 <button onClick={setto}>Set To location</button>


      <br /><br />

    <p>Academic year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Convoation id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={convidref} /><br /><br />

<p>Convocation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={convocationref} /><br /><br />

<p>Guest</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={guestref} /><br /><br />

<p>Guest login</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={cloginref} /><br /><br />

<p>From location</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={fromref} /><br /><br />

<p>To location</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={toref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Travel date" inputRef={traveldateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Individual">Individual</MenuItem>
<MenuItem value="Group">Group</MenuItem>
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
