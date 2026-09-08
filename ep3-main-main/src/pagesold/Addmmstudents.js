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
    const studentref=useRef();
const regnoref=useRef();
const rollnoref=useRef();
const programref=useRef();
const programcoderef=useRef();
const batchref=useRef();
const yearref=useRef();
const genderref=useRef();
const categoryref=useRef();
const pwdref=useRef();
const minorityref=useRef();
const usernameref=useRef();
const passwordref=useRef();
const enabledref=useRef();


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

const student=studentref.current.value;
const regno=regnoref.current.value;
const rollno=rollnoref.current.value;
const program=programref.current.value;
const programcode=programcoderef.current.value;
const batch=batchref.current.value;
const year=yearref.current.value;
const gender=genderref.current.value;
const category=categoryref.current.value;
const pwd=pwdref.current.value;
const minority=minorityref.current.value;
const username=usernameref.current.value;
const password=passwordref.current.value;
const enabled=enabledref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmstudentsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           student:student,
regno:regno,
rollno:rollno,
program:program,
programcode:programcode,
batch:batch,
year:year,
gender:gender,
category:category,
pwd:pwd,
minority:minority,
username:username,
password:password,
enabled:enabled,

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

    <TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Student"  variant="outlined" inputRef={studentref} /><br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Registration no"  variant="outlined" inputRef={regnoref} /><br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Roll no"  variant="outlined" inputRef={rollnoref} /><br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Program"  variant="outlined" inputRef={programref} /><br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Program code"  variant="outlined" inputRef={programcoderef} /><br /><br />

<InputLabel id="batch">Batch</InputLabel><Select labelId="batch"
id="batch"
inputRef={batchref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
</Select>
<br /><br />

<InputLabel id="year">Admission year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
</Select>
<br /><br />

<InputLabel id="gender">Gender</InputLabel><Select labelId="gender"
id="gender"
inputRef={genderref}
sx={{ width: '100%'}}
>
<MenuItem value="Male">Male</MenuItem>
<MenuItem value="Female">Female</MenuItem>
<MenuItem value="Not specified">Not specified</MenuItem>
</Select>
<br /><br />

<InputLabel id="category">Category</InputLabel><Select labelId="category"
id="category"
inputRef={categoryref}
sx={{ width: '100%'}}
>
<MenuItem value="SC">SC</MenuItem>
<MenuItem value="ST">ST</MenuItem>
<MenuItem value="OBC">OBC</MenuItem>
<MenuItem value="General">General</MenuItem>
<MenuItem value="Others">Others</MenuItem>
</Select>
<br /><br />

<InputLabel id="pwd">Is PWD</InputLabel><Select labelId="pwd"
id="pwd"
inputRef={pwdref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<InputLabel id="minority">Is minority</InputLabel><Select labelId="minority"
id="minority"
inputRef={minorityref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Username"  variant="outlined" inputRef={usernameref} /><br /><br />

<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label="Password"  variant="outlined" inputRef={passwordref} /><br /><br />

<InputLabel id="enabled">Is enabled</InputLabel><Select labelId="enabled"
id="enabled"
inputRef={enabledref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
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
