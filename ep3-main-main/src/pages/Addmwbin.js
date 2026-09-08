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
    const locationref=useRef();
const floorref=useRef();
const binref=useRef();
const bintyperef=useRef();


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

const location=locationref.current.value;
const floor=floorref.current.value;
const bin=binref.current.value;
const bintype=bintyperef.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createwbinbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           location:location,
floor:floor,
bin:bin,
bintype:bintype,

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

    <p>Location</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={locationref} /><br /><br />

<p>Floor</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={floorref} /><br /><br />

<p>Bin id</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={binref} /><br /><br />

<InputLabel id="bintype">Bin type</InputLabel><Select labelId="bintype"
id="bintype"
inputRef={bintyperef}
sx={{ width: '100%'}}
>
<MenuItem value="infectious">infectious</MenuItem>
<MenuItem value="pathological">pathological</MenuItem>
<MenuItem value="anatomical">anatomical</MenuItem>
<MenuItem value="sharps">sharps</MenuItem>
<MenuItem value="chemical">chemical</MenuItem>
<MenuItem value="pharmaceutical">pharmaceutical</MenuItem>
<MenuItem value="cytotoxic">cytotoxic</MenuItem>
<MenuItem value="radioactive">radioactive</MenuItem>
<MenuItem value="general">general</MenuItem>
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
