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
const programref=useRef();
const programcoderef=useRef();
const courseref=useRef();
const coursecoderef=useRef();
const typeref=useRef();
const creditref=useRef();


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
const program=programref.current.value;
const programcode=programcoderef.current.value;
const course=courseref.current.value;
const coursecode=coursecoderef.current.value;
const type=typeref.current.value;
const credit=creditref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmcoursesbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
program:program,
programcode:programcode,
course:course,
coursecode:coursecode,
type:type,
credit:credit,

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

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Program"  variant="outlined" inputRef={programref} /><br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Program code"  variant="outlined" inputRef={programcoderef} /><br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Course"  variant="outlined" inputRef={courseref} /><br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Coursecode"  variant="outlined" inputRef={coursecoderef} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Mandatory">Mandatory</MenuItem>
<MenuItem value="Elective">Elective</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="Number" sx={{ width: "100%"}} label="Credit"  variant="outlined" inputRef={creditref} /><br /><br />


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
