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
const coursecoderef=useRef();
const coref=useRef();
const attainedref=useRef();
const totalref=useRef();
const pattainedref=useRef();
const level1ref=useRef();
const level2ref=useRef();
const level3ref=useRef();
const targetref=useRef();
const flevelnref=useRef();
const flevelref=useRef();
const doclinkref=useRef();


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

      const setcoursecode=(id)=> {
if(transcript) {
coursecoderef.current.value=transcript;
 }
 }
const setco=(id)=> {
if(transcript) {
coref.current.value=transcript;
 }
 }
const setflevel=(id)=> {
if(transcript) {
flevelref.current.value=transcript;
 }
 }
const setdoclink=(id)=> {
if(transcript) {
doclinkref.current.value=transcript;
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
const coursecode=coursecoderef.current.value;
const co=coref.current.value;
const attained=attainedref.current.value;
const total=totalref.current.value;
const pattained=pattainedref.current.value;
const level1=level1ref.current.value;
const level2=level2ref.current.value;
const level3=level3ref.current.value;
const target=targetref.current.value;
const fleveln=flevelnref.current.value;
const flevel=flevelref.current.value;
const doclink=doclinkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createattyearbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
coursecode:coursecode,
co:co,
attained:attained,
total:total,
pattained:pattained,
level1:level1,
level2:level2,
level3:level3,
target:target,
fleveln:fleveln,
flevel:flevel,
doclink:doclink,

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

       <button onClick={setcoursecode}>Set Course code</button>
 <button onClick={setco}>Set CO</button>
 <button onClick={setflevel}>Set Level</button>
 <button onClick={setdoclink}>Set Document link</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2025-26">2025-26</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
</Select>
<br /><br />

<p>Course code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br />

<p>CO</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coref} /><br /><br />

<p>Attained no</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={attainedref} /><br /><br />

<p>Total students</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={totalref} /><br /><br />

<p>Percentage attained</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={pattainedref} /><br /><br />

<p>Level 1</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={level1ref} /><br /><br />

<p>Level 2</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={level2ref} /><br /><br />

<p>Level 3</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={level3ref} /><br /><br />

<p>Threshold Target</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={targetref} /><br /><br />

<p>Level Number</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={flevelnref} /><br /><br />

<p>Level</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={flevelref} /><br /><br />

<p>Document link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doclinkref} /><br /><br />


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
