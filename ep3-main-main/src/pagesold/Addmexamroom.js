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

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser }) {
    const yearref=useRef();
const examcoderef=useRef();
const seatnoref=useRef();
const roomnoref=useRef();
const roomseatnoref=useRef();
const programcoderef=useRef();
const coursecoderef=useRef();
const examdateref=useRef();
const studentref=useRef();
const regnoref=useRef();
const photoref=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;


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
const examcode=examcoderef.current.value;
const seatno=seatnoref.current.value;
const roomno=roomnoref.current.value;
const roomseatno=roomseatnoref.current.value;
const programcode=programcoderef.current.value;
const coursecode=coursecoderef.current.value;
const examdate=examdateref.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const photo=photoref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createexamroombyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
examcode:examcode,
seatno:seatno,
roomno:roomno,
roomseatno:roomseatno,
programcode:programcode,
coursecode:coursecode,
examdate:examdate,
student:student,
regno:regno,
photo:photo,

status1:'Submitted',
            comments:''

        }
    });
    //setLoading(false);
    //setIsuploading(false);
    //console.log(response.data.data);
    //alert(response.data.status);
    //history.replace('/viewnaddonc');

    handleClose();
   
};




  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
  

      <DialogTitle>Add data</DialogTitle>
      <DialogContent>

    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Academic year"  variant="outlined" inputRef={yearref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Exam code"  variant="outlined" inputRef={examcoderef} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Seat Sl. No."  variant="outlined" inputRef={seatnoref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Room no"  variant="outlined" inputRef={roomnoref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Room seat no"  variant="outlined" inputRef={roomseatnoref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Program code"  variant="outlined" inputRef={programcoderef} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Course code"  variant="outlined" inputRef={coursecoderef} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Exam date" inputRef={examdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Student"  variant="outlined" inputRef={studentref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Registration no"  variant="outlined" inputRef={regnoref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Student photo"  variant="outlined" inputRef={photoref} /><br /><br />


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
