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
    const consultantref=useRef();
const titleref=useRef();
const agencyref=useRef();
const yearref=useRef();
const revenueref=useRef();
const traineesref=useRef();
const advisorref=useRef();
const departmentref=useRef();
const roleref=useRef();
const contactref=useRef();
const durationref=useRef();
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

const consultant=consultantref.current.value;
const title=titleref.current.value;
const agency=agencyref.current.value;
const year=yearref.current.value;
const revenue=revenueref.current.value;
const trainees=traineesref.current.value;
const advisor=advisorref.current.value;
const department=departmentref.current.value;
const role=roleref.current.value;
const contact=contactref.current.value;
const duration=durationref.current.value;
const doclink=doclinkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createconsultancybyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           consultant:consultant,
title:title,
agency:agency,
year:year,
revenue:revenue,
trainees:trainees,
advisor:advisor,
department:department,
role:role,
contact:contact,
duration:duration,
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

    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Consultant"  variant="outlined" inputRef={consultantref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Title of consultancy"  variant="outlined" inputRef={titleref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Sponsoring agency"  variant="outlined" inputRef={agencyref} /><br /><br />

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
<MenuItem value="2018-19">2018-19</MenuItem>
<MenuItem value="2017-18">2017-18</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Revenue generated"  variant="outlined" inputRef={revenueref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="No of trainees"  variant="outlined" inputRef={traineesref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Advisor"  variant="outlined" inputRef={advisorref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Department"  variant="outlined" inputRef={departmentref} /><br /><br />

<InputLabel id="role">Added by role</InputLabel><Select labelId="role"
id="role"
inputRef={roleref}
sx={{ width: '100%'}}
>
<MenuItem value="Faculty">Faculty</MenuItem>
<MenuItem value="Finance">Finance</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Contact details"  variant="outlined" inputRef={contactref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Duration"  variant="outlined" inputRef={durationref} /><br /><br />

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
