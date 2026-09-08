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
    const departmentref=useRef();
const researchguideref=useRef();
const yogref=useRef();
const scholarref=useRef();
const titleref=useRef();
const yorref=useRef();
const yopref=useRef();
const doclinkref=useRef();


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

const department=departmentref.current.value;
const researchguide=researchguideref.current.value;
const yog=yogref.current.value;
const scholar=scholarref.current.value;
const title=titleref.current.value;
const yor=yorref.current.value;
const yop=yopref.current.value;
const doclink=doclinkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createphdguidebyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           department:department,
researchguide:researchguide,
yog:yog,
scholar:scholar,
title:title,
yor:yor,
yop:yop,
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

    handleClose();
   
};




  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
  

      <DialogTitle>Add data</DialogTitle>
      <DialogContent>

    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Department"  variant="outlined" inputRef={departmentref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Research guide"  variant="outlined" inputRef={researchguideref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Year of guideship"  variant="outlined" inputRef={yogref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Scholar name"  variant="outlined" inputRef={scholarref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Title of thesis"  variant="outlined" inputRef={titleref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Year of registration"  variant="outlined" inputRef={yorref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Year of scholar award"  variant="outlined" inputRef={yopref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Document link"  variant="outlined" inputRef={doclinkref} /><br /><br />


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
