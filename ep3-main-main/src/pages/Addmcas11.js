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

const noofclass=parseInt(noofclassref.current.value);
const totalclass=parseInt(totalclassref.current.value);
//const percentage=percentageref.current.value;
var grade;
var score;

if(noofclass>totalclass) {
  alert('No of classes taken ' + noofclass + ' cannot be more than total no of classes ' + totalclass);
  //handleClose();
  return;
}

const percentage=(parseFloat(noofclass)/parseFloat(totalclass))*100;
if(percentage>80) {
  grade='Good';
  score=3;
} else if (percentage>70) {
  grade='Satisfactory';
  score=2;
} else {
  grade='Not Satisfactory';
  score=1;
}




//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v1/createcas11byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
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

    <TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Number of classes taught"  variant="outlined" inputRef={noofclassref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Total classes assigned"  variant="outlined" inputRef={totalclassref} /><br /><br />



{/* <TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Percentage of classes taught"  variant="outlined" inputRef={percentageref} /><br /><br /> */}

{/* <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Grade obtained"  variant="outlined" inputRef={graderef} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Score obtained"  variant="outlined" inputRef={scoreref} /><br /><br /> */}


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
