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
    const campusref=useRef();
const facultyref=useRef();
const departmentref=useRef();
const descriptionref=useRef();
const addressref=useRef();
const hodref=useRef();
const hodemailref=useRef();
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

      const setcampus=(id)=> {
if(transcript) {
campusref.current.value=transcript;
 }
 }
const setfaculty=(id)=> {
if(transcript) {
facultyref.current.value=transcript;
 }
 }
const setdepartment=(id)=> {
if(transcript) {
departmentref.current.value=transcript;
 }
 }
const setdescription=(id)=> {
if(transcript) {
descriptionref.current.value=transcript;
 }
 }
const setaddress=(id)=> {
if(transcript) {
addressref.current.value=transcript;
 }
 }
const sethod=(id)=> {
if(transcript) {
hodref.current.value=transcript;
 }
 }
const sethodemail=(id)=> {
if(transcript) {
hodemailref.current.value=transcript;
 }
 }
const setlevel=(id)=> {
if(transcript) {
levelref.current.value=transcript;
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

const campus=campusref.current.value;
const faculty=facultyref.current.value;
const department=departmentref.current.value;
const description=descriptionref.current.value;
const address=addressref.current.value;
const hod=hodref.current.value;
const hodemail=hodemailref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createunivdepbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           campus:campus,
faculty:faculty,
department:department,
description:description,
address:address,
hod:hod,
hodemail:hodemail,
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

       <button onClick={setcampus}>Set Campus</button>
 <button onClick={setfaculty}>Set Faculty</button>
 <button onClick={setdepartment}>Set Department</button>
 <button onClick={setdescription}>Set Description</button>
 <button onClick={setaddress}>Set Address</button>
 <button onClick={sethod}>Set Hod</button>
 <button onClick={sethodemail}>Set Hod email</button>
 <button onClick={setlevel}>Set Level</button>


      <br /><br />

    <p>Campus</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={campusref} /><br /><br />

<p>Faculty</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyref} /><br /><br />

<p>Department</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={departmentref} /><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Address</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={addressref} /><br /><br />

<p>Hod</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={hodref} /><br /><br />

<p>Hod email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={hodemailref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Degree offering">Degree offering</MenuItem>
<MenuItem value="Non degree offering">Non degree offering</MenuItem>
</Select>
<br /><br />

<p>Level</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={levelref} /><br /><br />


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
