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
const studentref=useRef();
const regnoref=useRef();
const phoneref=useRef();
const emailref=useRef();
const programref=useRef();
const programcoderef=useRef();
const employerref=useRef();
const empaddressref=useRef();
const empcontactref=useRef();
const salaryref=useRef();
const typeref=useRef();
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
const student=studentref.current.value;
const regno=regnoref.current.value;
const phone=phoneref.current.value;
const email=emailref.current.value;
const program=programref.current.value;
const programcode=programcoderef.current.value;
const employer=employerref.current.value;
const empaddress=empaddressref.current.value;
const empcontact=empcontactref.current.value;
const salary=salaryref.current.value;
const type=typeref.current.value;
const doclink=doclinkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmplacementbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
student:student,
regno:regno,
phone:phone,
email:email,
program:program,
programcode:programcode,
employer:employer,
empaddress:empaddress,
empcontact:empcontact,
salary:salary,
type:type,
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

<p>Student</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Reg no</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<p>Phone</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={phoneref} /><br /><br />

<p>Email</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={emailref} /><br /><br />

<p>Program</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />

<p>Program code</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />

<p>Employer</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={employerref} /><br /><br />

<p>Employer address</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={empaddressref} /><br /><br />

<p>Employer contact</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={empcontactref} /><br /><br />

<p>Salary</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={salaryref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Placement">Placement</MenuItem>
<MenuItem value="Internship">Internship</MenuItem>
</Select>
<br /><br />

<p>Document link</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doclinkref} /><br /><br />


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
