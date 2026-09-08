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
    const coursenameref=useRef();
const coursecoderef=useRef();
const coref=useRef();
const levelref=useRef();
const minvalueref=useRef();
const maxvalueref=useRef();


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

//const coursename=coursenameref.current.value;
//const coursecode=coursecoderef.current.value;
const co=coref.current.value;
const level=levelref.current.value;
const minvalue=minvalueref.current.value;
const maxvalue=maxvalueref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const coursename=global1.faccoursename;
      const coursecode=global1.faccoursecode;
    const response = await ep1.get('/api/v2/createmcolevelsbyfac', {
      
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           coursename:coursename,
coursecode:coursecode,
co:co,
level:level,
minvalue:minvalue,
maxvalue:maxvalue,

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

    {/* <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Course name"  variant="outlined" inputRef={coursenameref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Course code"  variant="outlined" inputRef={coursecoderef} /><br /><br /> */}

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="CO"  variant="outlined" inputRef={coref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Level"  variant="outlined" inputRef={levelref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Minimum value"  variant="outlined" inputRef={minvalueref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Maximum value"  variant="outlined" inputRef={maxvalueref} /><br /><br />


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
