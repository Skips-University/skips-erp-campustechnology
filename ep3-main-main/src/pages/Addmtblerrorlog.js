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
    const domainref=useRef();
const usernameref=useRef();
const pagenameref=useRef();
const errorref=useRef();
const errordateref=useRef();
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

      const setdomain=(id)=> {
if(transcript) {
domainref.current.value=transcript;
 }
 }
const setusername=(id)=> {
if(transcript) {
usernameref.current.value=transcript;
 }
 }
const setpagename=(id)=> {
if(transcript) {
pagenameref.current.value=transcript;
 }
 }
const seterror=(id)=> {
if(transcript) {
errorref.current.value=transcript;
 }
 }
const settype=(id)=> {
if(transcript) {
typeref.current.value=transcript;
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

const domain=domainref.current.value;
const username=usernameref.current.value;
const pagename=pagenameref.current.value;
const error=errorref.current.value;
const errordate=errordateref.current.value;
const type=typeref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createtblerrorlogbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           domain:domain,
username:username,
pagename:pagename,
error:error,
errordate:errordate,
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

       <button onClick={setdomain}>Set Domain</button>
 <button onClick={setusername}>Set Username</button>
 <button onClick={setpagename}>Set Page name</button>
 <button onClick={seterror}>Set Error</button>
 <button onClick={settype}>Set Type</button>


      <br /><br />

    <p>Domain</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={domainref} /><br /><br />

<p>Username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={usernameref} /><br /><br />

<p>Page name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={pagenameref} /><br /><br />

<p>Error</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={errorref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Error date" inputRef={errordateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={typeref} /><br /><br />


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
