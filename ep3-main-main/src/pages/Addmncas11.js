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
const semesterref=useRef();
const noofclassref=useRef();
const totalclassref=useRef();
const percentageref=useRef();
const graderef=useRef();
const scoreref=useRef();


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
const semester=semesterref.current.value;
const noofclass=noofclassref.current.value;
const totalclass=totalclassref.current.value;
const percentage=percentageref.current.value;
const grade=graderef.current.value;
const score=scoreref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v1/createncas11byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
semester:semester,
noofclass:noofclass,
totalclass:totalclass,
percentage:percentage,
grade:grade,
score:score,

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

<InputLabel id="semester">Semester</InputLabel><Select labelId="semester"
id="semester"
inputRef={semesterref}
sx={{ width: '100%'}}
>
<MenuItem value="Even semester">Even semester</MenuItem>
<MenuItem value="Odd semester">Odd semester</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Number of classes taught"  variant="outlined" inputRef={noofclassref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Total classes assigned"  variant="outlined" inputRef={totalclassref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Percentage of classes taught"  variant="outlined" inputRef={percentageref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Grade obtained"  variant="outlined" inputRef={graderef} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Score obtained"  variant="outlined" inputRef={scoreref} /><br /><br />


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
