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
    const coursecoderef=useRef();
const titleref=useRef();
const descriptionref=useRef();
const moduleref=useRef();
const typeref=useRef();
const targetref=useRef();


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

const coursecode=coursecoderef.current.value;
const title=titleref.current.value;
const description=descriptionref.current.value;
const module=moduleref.current.value;
const type=typeref.current.value;
const target=targetref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createlmsvideosbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           coursecode:coursecode,
title:title,
description:description,
module:module,
type:type,
target:target,

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

      

      <br /><br />

    <p>Course code</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br />

<p>Title</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={titleref} /><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Module</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={moduleref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Multimedia">Multimedia</MenuItem>
<MenuItem value="Text and Images">Text and Images</MenuItem>
</Select>
<br /><br />

<InputLabel id="target">Target</InputLabel><Select labelId="target"
id="target"
inputRef={targetref}
sx={{ width: '100%'}}
>
<MenuItem value="Beginner">Beginner</MenuItem>
<MenuItem value="Advanced">Advanced</MenuItem>
<MenuItem value="Regular">Regular</MenuItem>
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
