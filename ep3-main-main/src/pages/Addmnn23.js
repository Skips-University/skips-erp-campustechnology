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
const genderref=useRef();
const state1ref=useRef();
const state2ref=useRef();
const countryref=useRef();
const foreignerref=useRef();
const category1ref=useRef();
const category2ref=useRef();
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
const setstate2=(id)=> {
if(transcript) {
state2ref.current.value=transcript;
 }
 }
const setcountry=(id)=> {
if(transcript) {
countryref.current.value=transcript;
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
const gender=genderref.current.value;
const state1=state1ref.current.value;
const state2=state2ref.current.value;
const country=countryref.current.value;
const foreigner=foreignerref.current.value;
const category1=category1ref.current.value;
const category2=category2ref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createnn23byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           faculty:faculty,
designation:designation,
year:year,
gender:gender,
state1:state1,
state2:state2,
country:country,
foreigner:foreigner,
category1:category1,
category2:category2,
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
 <button onClick={setstate2}>Set State</button>
 <button onClick={setcountry}>Set Country</button>


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

<InputLabel id="gender">Gender</InputLabel><Select labelId="gender"
id="gender"
inputRef={genderref}
sx={{ width: '100%'}}
>
<MenuItem value="Male">Male</MenuItem>
<MenuItem value="Female">Female</MenuItem>
<MenuItem value="Not known">Not known</MenuItem>
</Select>
<br /><br />

<InputLabel id="state1">Is Same State</InputLabel><Select labelId="state1"
id="state1"
inputRef={state1ref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<p>State</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={state2ref} /><br /><br />

<p>Country</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={countryref} /><br /><br />

<InputLabel id="foreigner">Is Foreigner</InputLabel><Select labelId="foreigner"
id="foreigner"
inputRef={foreignerref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<InputLabel id="category1">Category</InputLabel><Select labelId="category1"
id="category1"
inputRef={category1ref}
sx={{ width: '100%'}}
>
<MenuItem value="General">General</MenuItem>
<MenuItem value="SC">SC</MenuItem>
<MenuItem value="ST">ST</MenuItem>
<MenuItem value="OBC">OBC</MenuItem>
<MenuItem value="Other">Other</MenuItem>
</Select>
<br /><br />

<InputLabel id="category2">Other category</InputLabel><Select labelId="category2"
id="category2"
inputRef={category2ref}
sx={{ width: '100%'}}
>
<MenuItem value="General">General</MenuItem>
<MenuItem value="PWD">PWD</MenuItem>
<MenuItem value="Sports">Sports</MenuItem>
<MenuItem value="Other">Other</MenuItem>
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
