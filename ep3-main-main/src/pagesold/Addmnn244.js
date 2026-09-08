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
    const facultyref=useRef();
const designationref=useRef();
const yearref=useRef();
const moocref=useRef();
const mplatformref=useRef();
const certdateref=useRef();
const mroleref=useRef();
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
const setmooc=(id)=> {
if(transcript) {
moocref.current.value=transcript;
 }
 }
const setmplatform=(id)=> {
if(transcript) {
mplatformref.current.value=transcript;
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

const faculty=facultyref.current.value;
const designation=designationref.current.value;
const year=yearref.current.value;
const mooc=moocref.current.value;
const mplatform=mplatformref.current.value;
const certdate=certdateref.current.value;
const mrole=mroleref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createnn244byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           faculty:faculty,
designation:designation,
year:year,
mooc:mooc,
mplatform:mplatform,
certdate:certdate,
mrole:mrole,
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

       <button onClick={setfaculty}>Set Faculty name</button>
 <button onClick={setdesignation}>Set Designation</button>
 <button onClick={setmooc}>Set MOOC course name</button>
 <button onClick={setmplatform}>Set MOOC platform</button>


      <br /><br />

    <p>Faculty name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyref} /><br /><br />

<p>Designation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={designationref} /><br /><br />

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

<p>MOOC course name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={moocref} /><br /><br />

<p>MOOC platform</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={mplatformref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Certification date" inputRef={certdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="mrole">Role</InputLabel><Select labelId="mrole"
id="mrole"
inputRef={mroleref}
sx={{ width: '100%'}}
>
<MenuItem value="Participated">Participated</MenuItem>
<MenuItem value="Developed">Developed</MenuItem>
</Select>
<br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Internal">Internal</MenuItem>
<MenuItem value="External">External</MenuItem>
</Select>
<br /><br />

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
