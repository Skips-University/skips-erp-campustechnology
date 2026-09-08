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
const eventref=useRef();
const departmentref=useRef();
const startdateref=useRef();
const descriptionref=useRef();
const brochurelinkref=useRef();
const reportlinkref=useRef();
const coordinatorref=useRef();
const typeref=useRef();
const levelref=useRef();
const collabref=useRef();
const moulinkref=useRef();
const participantsref=useRef();
const durationref=useRef();


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

      const setevent=(id)=> {
if(transcript) {
eventref.current.value=transcript;
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
const setbrochurelink=(id)=> {
if(transcript) {
brochurelinkref.current.value=transcript;
 }
 }
const setreportlink=(id)=> {
if(transcript) {
reportlinkref.current.value=transcript;
 }
 }
const setcoordinator=(id)=> {
if(transcript) {
coordinatorref.current.value=transcript;
 }
 }
const setcollab=(id)=> {
if(transcript) {
collabref.current.value=transcript;
 }
 }
const setmoulink=(id)=> {
if(transcript) {
moulinkref.current.value=transcript;
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
const event=eventref.current.value;
const department=departmentref.current.value;
const startdate=startdateref.current.value;
const description=descriptionref.current.value;
const brochurelink=brochurelinkref.current.value;
const reportlink=reportlinkref.current.value;
const coordinator=coordinatorref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;
const collab=collabref.current.value;
const moulink=moulinkref.current.value;
const participants=participantsref.current.value;
const duration=durationref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createeventsnew1byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
event:event,
department:department,
startdate:startdate,
description:description,
brochurelink:brochurelink,
reportlink:reportlink,
coordinator:coordinator,
type:type,
level:level,
collab:collab,
moulink:moulink,
participants:participants,
duration:duration,

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

       <button onClick={setevent}>Set Event</button>
 <button onClick={setdepartment}>Set Department</button>
 <button onClick={setdescription}>Set Description</button>
 <button onClick={setbrochurelink}>Set Brochure link</button>
 <button onClick={setreportlink}>Set Report link</button>
 <button onClick={setcoordinator}>Set Coordinator</button>
 <button onClick={setcollab}>Set Collaborating agency</button>
 <button onClick={setmoulink}>Set MoU link</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
<MenuItem value="2019-20">2019-20</MenuItem>
</Select>
<br /><br />

<p>Event</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={eventref} /><br /><br />

<p>Department</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={departmentref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Start date" inputRef={startdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Brochure link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={brochurelinkref} /><br /><br />

<p>Report link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={reportlinkref} /><br /><br />

<p>Coordinator</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coordinatorref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="FDP">FDP</MenuItem>
<MenuItem value="Seminar">Seminar</MenuItem>
<MenuItem value="Conference">Conference</MenuItem>
<MenuItem value="Extension Activity">Extension Activity</MenuItem>
<MenuItem value="Skill development">Skill development</MenuItem>
</Select>
<br /><br />

<InputLabel id="level">Level</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="Institution">Institution</MenuItem>
<MenuItem value="Department">Department</MenuItem>
</Select>
<br /><br />

<p>Collaborating agency</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={collabref} /><br /><br />

<p>MoU link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={moulinkref} /><br /><br />

<p>No of participants</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={participantsref} /><br /><br />

<p>Duration in days</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={durationref} /><br /><br />


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
