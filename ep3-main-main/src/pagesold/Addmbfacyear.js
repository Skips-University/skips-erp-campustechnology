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
const departmentref=useRef();
const programcoderef=useRef();
const facultyref=useRef();
const designationref=useRef();
const qualificationref=useRef();
const pgyearref=useRef();
const phdyearref=useRef();
const dojref=useRef();
const dolref=useRef();
const experienceref=useRef();
const panref=useRef();
const uniqueref=useRef();


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

      const setdepartment=(id)=> {
if(transcript) {
departmentref.current.value=transcript;
 }
 }
const setprogramcode=(id)=> {
if(transcript) {
programcoderef.current.value=transcript;
 }
 }
const setfaculty=(id)=> {
if(transcript) {
facultyref.current.value=transcript;
 }
 }
const setdesignation=(id)=> {
if(transcript) {
designationref.current.value=transcript;
 }
 }
const setpgyear=(id)=> {
if(transcript) {
pgyearref.current.value=transcript;
 }
 }
const setphdyear=(id)=> {
if(transcript) {
phdyearref.current.value=transcript;
 }
 }
const setpan=(id)=> {
if(transcript) {
panref.current.value=transcript;
 }
 }
const setunique=(id)=> {
if(transcript) {
uniqueref.current.value=transcript;
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
const department=departmentref.current.value;
const programcode=programcoderef.current.value;
const faculty=facultyref.current.value;
const designation=designationref.current.value;
const qualification=qualificationref.current.value;
const pgyear=pgyearref.current.value;
const phdyear=phdyearref.current.value;
const doj=dojref.current.value;
const dol=dolref.current.value;
const experience=experienceref.current.value;
const pan=panref.current.value;
const unique=uniqueref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createbfacyearbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
department:department,
programcode:programcode,
faculty:faculty,
designation:designation,
qualification:qualification,
pgyear:pgyear,
phdyear:phdyear,
doj:doj,
dol:dol,
experience:experience,
pan:pan,
unique:unique,

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

       <button onClick={setdepartment}>Set Department</button>
 <button onClick={setprogramcode}>Set Program code</button>
 <button onClick={setfaculty}>Set Faculty name</button>
 <button onClick={setdesignation}>Set Designation</button>
 <button onClick={setpgyear}>Set PG Year</button>
 <button onClick={setphdyear}>Set PhD Year</button>
 <button onClick={setpan}>Set PAN</button>
 <button onClick={setunique}>Set Unique id</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2017-18">2017-18</MenuItem>
<MenuItem value="2018-19">2018-19</MenuItem>
<MenuItem value="2019-20">2019-20</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2025-26">2025-26</MenuItem>
</Select>
<br /><br />

<p>Department</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={departmentref} /><br /><br />

<p>Program code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />

<p>Faculty name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyref} /><br /><br />

<p>Designation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={designationref} /><br /><br />

<InputLabel id="qualification">Qualification</InputLabel><Select labelId="qualification"
id="qualification"
inputRef={qualificationref}
sx={{ width: '100%'}}
>
<MenuItem value="PhD">PhD</MenuItem>
<MenuItem value="PG">PG</MenuItem>
<MenuItem value="MPhil">MPhil</MenuItem>
</Select>
<br /><br />

<p>PG Year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={pgyearref} /><br /><br />

<p>PhD Year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={phdyearref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Date of joining" inputRef={dojref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Date of leaving" inputRef={dolref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Years of experience</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={experienceref} /><br /><br />

<p>PAN</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={panref} /><br /><br />

<p>Unique id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={uniqueref} /><br /><br />


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
