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
const guesthouseref=useRef();
const roomref=useRef();
const roomtyperef=useRef();
const guestref=useRef();
const cloginref=useRef();
const checkinref=useRef();
const checkoutref=useRef();
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
const setguesthouse=(id)=> {
if(transcript) {
guesthouseref.current.value=transcript;
 }
 }
const setroom=(id)=> {
if(transcript) {
roomref.current.value=transcript;
 }
 }
const setroomtype=(id)=> {
if(transcript) {
roomtyperef.current.value=transcript;
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
const guesthouse=guesthouseref.current.value;
const room=roomref.current.value;
const roomtype=roomtyperef.current.value;
const guest=guestref.current.value;
const clogin=cloginref.current.value;
const checkin=checkinref.current.value;
const checkout=checkoutref.current.value;
const type=typeref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createconvghbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
convid:convid,
convocation:convocation,
guesthouse:guesthouse,
room:room,
roomtype:roomtype,
guest:guest,
clogin:clogin,
checkin:checkin,
checkout:checkout,
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

       <button onClick={setyear}>Set Aademic year</button>
 <button onClick={setconvid}>Set Convocation id</button>
 <button onClick={setconvocation}>Set Convocation</button>
 <button onClick={setguesthouse}>Set Guest house</button>
 <button onClick={setroom}>Set Room</button>
 <button onClick={setroomtype}>Set Room type</button>
 <button onClick={setguest}>Set Guest name</button>
 <button onClick={setclogin}>Set Guest login</button>


      <br /><br />

    <p>Aademic year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Convocation id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={convidref} /><br /><br />

<p>Convocation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={convocationref} /><br /><br />

<p>Guest house</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={guesthouseref} /><br /><br />

<p>Room</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={roomref} /><br /><br />

<p>Room type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={roomtyperef} /><br /><br />

<p>Guest name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={guestref} /><br /><br />

<p>Guest login</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={cloginref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Checkin date" inputRef={checkinref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Checkout date" inputRef={checkoutref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Free">Free</MenuItem>
<MenuItem value="Paid">Paid</MenuItem>
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
