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
    const articleidref=useRef();
const peerref=useRef();
const designationref=useRef();
const rcommentsref=useRef();
const submitdateref=useRef();
const peertyeref=useRef();
const commenttyperef=useRef();


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

      const setarticleid=(id)=> {
if(transcript) {
articleidref.current.value=transcript;
 }
 }
const setpeer=(id)=> {
if(transcript) {
peerref.current.value=transcript;
 }
 }
const setdesignation=(id)=> {
if(transcript) {
designationref.current.value=transcript;
 }
 }
const setrcomments=(id)=> {
if(transcript) {
rcommentsref.current.value=transcript;
 }
 }
const setsubmitdate=(id)=> {
if(transcript) {
submitdateref.current.value=transcript;
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

const articleid=articleidref.current.value;
const peer=peerref.current.value;
const designation=designationref.current.value;
const rcomments=rcommentsref.current.value;
const submitdate=submitdateref.current.value;
const peertye=peertyeref.current.value;
const commenttype=commenttyperef.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createlpubreviewsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           articleid:articleid,
peer:peer,
designation:designation,
rcomments:rcomments,
submitdate:submitdate,
peertye:peertye,
commenttype:commenttype,

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

       <button onClick={setarticleid}>Set Article id</button>
 <button onClick={setpeer}>Set Peer name</button>
 <button onClick={setdesignation}>Set Peer designation</button>
 <button onClick={setrcomments}>Set Review comments</button>
 <button onClick={setsubmitdate}>Set Submit date</button>


      <br /><br />

    <p>Article id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={articleidref} /><br /><br />

<p>Peer name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={peerref} /><br /><br />

<p>Peer designation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={designationref} /><br /><br />

<p>Review comments</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={rcommentsref} /><br /><br />

<p>Submit date</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={submitdateref} /><br /><br />

<InputLabel id="peertye">Peer type</InputLabel><Select labelId="peertye"
id="peertye"
inputRef={peertyeref}
sx={{ width: '100%'}}
>
<MenuItem value="Academician">Academician</MenuItem>
<MenuItem value="Industry">Industry</MenuItem>
</Select>
<br /><br />

<InputLabel id="commenttype">Comment type</InputLabel><Select labelId="commenttype"
id="commenttype"
inputRef={commenttyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Accepted">Accepted</MenuItem>
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
