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
const purposeref=useRef();
const bodynameref=useRef();
const bodytyperef=useRef();
const addressref=useRef();
const signdateref=useRef();
const durationref=useRef();
const activityref=useRef();
const linkref=useRef();
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

      const setpurpose=(id)=> {
if(transcript) {
purposeref.current.value=transcript;
 }
 }
const setbodyname=(id)=> {
if(transcript) {
bodynameref.current.value=transcript;
 }
 }
const setaddress=(id)=> {
if(transcript) {
addressref.current.value=transcript;
 }
 }
const setduration=(id)=> {
if(transcript) {
durationref.current.value=transcript;
 }
 }
const setactivity=(id)=> {
if(transcript) {
activityref.current.value=transcript;
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

const year=yearref.current.value;
const purpose=purposeref.current.value;
const bodyname=bodynameref.current.value;
const bodytype=bodytyperef.current.value;
const address=addressref.current.value;
const signdate=signdateref.current.value;
const duration=durationref.current.value;
const activity=activityref.current.value;
const link=linkref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;

//alert(year + ' ' + type + ' ' + level);


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createbmoubyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
purpose:purpose,
bodyname:bodyname,
bodytype:bodytype,
address:address,
signdate:signdate,
duration:duration,
activity:activity,
link:link,
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

       <button onClick={setpurpose}>Set Purpose</button>
 <button onClick={setbodyname}>Set Party name</button>
 <button onClick={setaddress}>Set Party address</button>
 <button onClick={setduration}>Set Duration</button>
 <button onClick={setactivity}>Set Activity</button>
 <button onClick={setlink}>Set Link</button>


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

<p>Purpose</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={purposeref} /><br /><br />

<p>Party name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bodynameref} /><br /><br />

<InputLabel id="bodytype">Internship type</InputLabel><Select labelId="bodytype"
id="bodytype"
inputRef={bodytyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Academic">Academic</MenuItem>
<MenuItem value="Exchange">Exchange</MenuItem>
<MenuItem value="Internship">Internship</MenuItem>
<MenuItem value="Placement">Placement</MenuItem>
<MenuItem value="Resource sharing">Resource sharing</MenuItem>
</Select>
<br /><br />

<p>Party address</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={addressref} /><br /><br />

<p>Date of signing</p>
<TextField id="outlined-basic"  type="Date" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={signdateref} /><br /><br />

<p>Duration</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={durationref} /><br /><br />

<p>Activity</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={activityref} /><br /><br />

<p>Link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={linkref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Academic">Academic</MenuItem>
<MenuItem value="Corporate">Corporate</MenuItem>
</Select>
<br /><br />

<InputLabel id="level">Level</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="National">National</MenuItem>
<MenuItem value="International">International</MenuItem>
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
