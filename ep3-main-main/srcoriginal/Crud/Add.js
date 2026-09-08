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
  const coursecoderef = useRef();
  const coursetitleref = useRef();
  const coursetyperef = useRef();
  const yearref = useRef();
  const offeredtimesref = useRef();
  const durationref = useRef();
  const imagelinkref = useRef();
  const priceref = useRef();
  const categoryref = useRef();
  const departmentref = useRef();
  const coursehoursref = useRef();
  const totalstudentsref = useRef();
  const studentscompletedref = useRef();
  const dateaddedref = useRef();



  const searchapi = async () => {
       

    const coursetitle=coursetitleref.current.value;
const coursecode=coursecoderef.current.value;
const coursetype=coursetyperef.current.value;
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
const dateadded=dateaddedref.current.value;

alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
//     const response = await ep1.get('/api/v1/createaddoncbyfac', {
//         params: {
//             user: user,
//             token: token,
//             colid: colid,
//             name: name,
//             coursetitle:coursetitle,
// coursecode:coursecode,
// coursetype:coursetype,
// year:year,
// offeredtimes:offeredtimes,
// duration:duration,
// imagelink:imagelink,
// price:price,
// category:category,
// department:department,
// coursehours:coursehours,
// totalstudents:totalstudents,
// studentscompleted:studentscompleted,
// dateadded:dateadded,
// status1:'Submitted',
//             comments:''

//         }
//     });
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

      <TextField sx={{ width: "100%"}} id="outlined-basic"  label="Course title" variant="outlined" inputRef={coursetitleref} />
<br /><br />

<TextField id="outlined-basic"  sx={{ width: '100%'}} label="Course code"  variant="outlined" inputRef={coursecoderef} />
<br /><br />

<InputLabel id="demo-simple-select-label">Course type</InputLabel>
<Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    inputRef={coursetyperef}
    sx={{ width: '100%'}}
  
  >
    <MenuItem value="Offered by HEI">Offered by HEI</MenuItem>
    <MenuItem value="Online">Online</MenuItem>
  </Select>

  <br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}>
<DatePicker label="Select date added" inputRef={dateaddedref} sx={{ width: "100%"}} />
</LocalizationProvider>


        <TextField
          margin="dense"
          label="Course Code"
          fullWidth
          value={newUser.coursecode}
          onChange={(event) => handleInputChange(event, 'coursecode')}
        />
        <TextField
          margin="dense"
          label="Course Title"
          fullWidth
          value={newUser.coursetitle}
          onChange={(event) => handleInputChange(event, 'coursetitle')}
        />
        <TextField
          margin="dense"
          label="Year"
          fullWidth
          value={newUser.year}
          onChange={(event) => handleInputChange(event, 'year')}
        />
        <TextField
          margin="dense"
          label="Course Type"
          fullWidth
          value={newUser.coursetype}
          onChange={(event) => handleInputChange(event, 'coursetype')}
        />
        <TextField
          margin="dense"
          label="Duration"
          fullWidth
          value={newUser.duration}
          onChange={(event) => handleInputChange(event, 'duration')}
        />
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
