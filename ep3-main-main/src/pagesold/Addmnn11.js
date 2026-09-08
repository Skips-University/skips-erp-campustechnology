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
    const programref=useRef();
const programcoderef=useRef();
const cbcsref=useRef();
const cbcsyearref=useRef();
const oberef=useRef();
const yearref=useRef();
const typeref=useRef();
const levelref=useRef();


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

      const setprogram=(id)=> {
if(transcript) {
programref.current.value=transcript;
 }
 }
const setprogramcode=(id)=> {
if(transcript) {
programcoderef.current.value=transcript;
 }
 }
const setcbcsyear=(id)=> {
if(transcript) {
cbcsyearref.current.value=transcript;
 }
 }
const setyear=(id)=> {
if(transcript) {
yearref.current.value=transcript;
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

const program=programref.current.value;
const programcode=programcoderef.current.value;
const cbcs=cbcsref.current.value;
const cbcsyear=cbcsyearref.current.value;
const obe=oberef.current.value;
const year=yearref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createnn11byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           program:program,
programcode:programcode,
cbcs:cbcs,
cbcsyear:cbcsyear,
obe:obe,
year:year,
type:type,
level:level,

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

       <button onClick={setprogram}>Set Program name</button>
 <button onClick={setprogramcode}>Set Program code</button>
 <button onClick={setcbcsyear}>Set Year of CBCS</button>
 <button onClick={setyear}>Set Academic year</button>
 <button onClick={settype}>Set Type</button>


      <br /><br />

    <p>Program name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Program code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />

<InputLabel id="cbcs">Is CBCS</InputLabel><Select labelId="cbcs"
id="cbcs"
inputRef={cbcsref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<p>Year of CBCS</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={cbcsyearref} /><br /><br />

<InputLabel id="obe">Is OBE</InputLabel><Select labelId="obe"
id="obe"
inputRef={oberef}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<p>Academic year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={typeref} /><br /><br />

<InputLabel id="level">Level</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="UG">UG</MenuItem>
<MenuItem value="PG">PG</MenuItem>
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
