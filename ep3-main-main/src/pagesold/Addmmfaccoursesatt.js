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
const coursenameref=useRef();
const coursecoderef=useRef();
const coref=useRef();
const componentref=useRef();
const studentref=useRef();
const regnoref=useRef();
const marksref=useRef();
const weightageref=useRef();
const totalmarksref=useRef();
const percentageref=useRef();
const thresholdref=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;


  const searchapi = async () => {

    const threshold=thresholdref.current.value;
    if(!threshold || isNaN(threshold)){
      alert('Threshold value is required');
      return;
      }

     
   
       

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
const coursecode=global1.faccoursecode;
const coursename=global1.faccoursename;
// const coursename=coursenameref.current.value;
// const coursecode=coursecoderef.current.value;
const co=coref.current.value;
const component=componentref.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const marks=marksref.current.value;
const weightage=0.1;//eightageref.current.value;
const totalmarks=totalmarksref.current.value;
//const percentage=percentageref.current.value;
const percentage=(parseFloat(marks))/parseFloat(totalmarks)*100;

if(parseFloat(threshold)>parseFloat(marks)) {
alert('Please selct marks greater than the threshold marks');
return;
} 


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmfaccoursesattbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
coursename:coursename,
coursecode:coursecode,
co:co,
component:component,
student:student,
regno:regno,
marks:marks,
weightage:weightage,
totalmarks:totalmarks,
percentage:percentage,

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
  <MenuItem value="2025-26">2025-26</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
</Select>
<br /><br />

{/* <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Coursename"  variant="outlined" inputRef={coursenameref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Coursecode"  variant="outlined" inputRef={coursecoderef} /><br /><br /> */}

<InputLabel id="co">CO</InputLabel><Select labelId="co"
id="co"
inputRef={coref}
sx={{ width: '100%'}}
>
<MenuItem value="CO1">CO1</MenuItem>
<MenuItem value="CO2">CO2</MenuItem>
<MenuItem value="CO3">CO3</MenuItem>
<MenuItem value="CO4">CO4</MenuItem>
<MenuItem value="CO5">CO5</MenuItem>
<MenuItem value="CO6">CO6</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Threshold marks"  variant="outlined" inputRef={thresholdref} /><br /><br />


<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Assessment component"  variant="outlined" inputRef={componentref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Student"  variant="outlined" inputRef={studentref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Reg no"  variant="outlined" inputRef={regnoref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Marks obtained"  variant="outlined" inputRef={marksref} /><br /><br />

{/* <TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Assessment weightage"  variant="outlined" inputRef={weightageref} /><br /><br /> */}

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Total marks"  variant="outlined" inputRef={totalmarksref} /><br /><br />

{/* <TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Percentage"  variant="outlined" inputRef={percentageref} /><br /><br /> */}


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
