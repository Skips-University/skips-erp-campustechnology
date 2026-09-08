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
    const category1ref=useRef();
const category2ref=useRef();
const keywordsref=useRef();
const subjectref=useRef();
const moduleref=useRef();
const topicref=useRef();
const linkref=useRef();


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

      const setcategory1=(id)=> {
if(transcript) {
category1ref.current.value=transcript;
 }
 }
const setcategory2=(id)=> {
if(transcript) {
category2ref.current.value=transcript;
 }
 }
const setkeywords=(id)=> {
if(transcript) {
keywordsref.current.value=transcript;
 }
 }
const setsubject=(id)=> {
if(transcript) {
subjectref.current.value=transcript;
 }
 }
const setmodule=(id)=> {
if(transcript) {
moduleref.current.value=transcript;
 }
 }
const settopic=(id)=> {
if(transcript) {
topicref.current.value=transcript;
 }
 }
const setlink=(id)=> {
if(transcript) {
linkref.current.value=transcript;
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

const category1=category1ref.current.value;
const category2=category2ref.current.value;
const keywords=keywordsref.current.value;
const subject=subjectref.current.value;
const module=moduleref.current.value;
const topic=topicref.current.value;
const link=linkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmguidesbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           category1:category1,
category2:category2,
keywords:keywords,
subject:subject,
module:module,
topic:topic,
link:link,

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

       <button onClick={setcategory1}>Set Category 1</button>
 <button onClick={setcategory2}>Set Category 2</button>
 <button onClick={setkeywords}>Set Keywords</button>
 <button onClick={setsubject}>Set Subject</button>
 <button onClick={setmodule}>Set Module</button>
 <button onClick={settopic}>Set Topic</button>
 <button onClick={setlink}>Set Link</button>


      <br /><br />

    <p>Category 1</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={category1ref} /><br /><br />

<p>Category 2</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={category2ref} /><br /><br />

<p>Keywords</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={keywordsref} /><br /><br />

<p>Subject</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={subjectref} /><br /><br />

<p>Module</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={moduleref} /><br /><br />

<p>Topic</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={topicref} /><br /><br />

<p>Link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={linkref} /><br /><br />


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
