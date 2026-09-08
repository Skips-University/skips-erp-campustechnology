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
const pubidref=useRef();
const publicationref=useRef();
const editionref=useRef();
const pubmonthref=useRef();
const pubstatusref=useRef();
const moderef=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

    const pubid=global1.pubid;
    const publication=global1.publication;

    const regno=global1.regno;

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

      const setpubid=(id)=> {
if(transcript) {
pubidref.current.value=transcript;
 }
 }
const setpublication=(id)=> {
if(transcript) {
publicationref.current.value=transcript;
 }
 }
const setedition=(id)=> {
if(transcript) {
editionref.current.value=transcript;
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
// const pubid=pubidref.current.value;
// const publication=publicationref.current.value;
const edition=editionref.current.value;
const pubmonth=pubmonthref.current.value;
const pubstatus=pubstatusref.current.value;
const mode=moderef.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createlpubeditionsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
pubid:pubid,
publication:publication,
edition:edition,
pubmonth:pubmonth,
pubstatus:pubstatus,
mode:mode,

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

       <button onClick={setpubid}>Set Publication id</button>
 <button onClick={setpublication}>Set Publication</button>
 <button onClick={setedition}>Set Edition</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2025-26">2025-26</MenuItem>
</Select>
<br /><br />

{/* <p>Publication id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={pubidref} /><br /><br /> */}

{/* <p>Publication</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={publicationref} /><br /><br /> */}

<p>Edition</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={editionref} /><br /><br />

<InputLabel id="pubmonth">Publication month</InputLabel><Select labelId="pubmonth"
id="pubmonth"
inputRef={pubmonthref}
sx={{ width: '100%'}}
>
<MenuItem value="Jan">Jan</MenuItem>
<MenuItem value="Feb">Feb</MenuItem>
<MenuItem value="Mar">Mar</MenuItem>
<MenuItem value="Apr">Apr</MenuItem>
<MenuItem value="May">May</MenuItem>
<MenuItem value="Jun">Jun</MenuItem>
<MenuItem value="Jul">Jul</MenuItem>
<MenuItem value="Aug">Aug</MenuItem>
<MenuItem value="Sep">Sep</MenuItem>
<MenuItem value="Oct">Oct</MenuItem>
<MenuItem value="Nov">Nov</MenuItem>
<MenuItem value="Dec">Dec</MenuItem>
</Select>
<br /><br />

<InputLabel id="pubstatus">Publication status</InputLabel><Select labelId="pubstatus"
id="pubstatus"
inputRef={pubstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Published">Published</MenuItem>
<MenuItem value="In process">In process</MenuItem>
</Select>
<br /><br />

<InputLabel id="mode">Mode</InputLabel><Select labelId="mode"
id="mode"
inputRef={moderef}
sx={{ width: '100%'}}
>
<MenuItem value="Online">Online</MenuItem>
<MenuItem value="Offline">Offline</MenuItem>
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
