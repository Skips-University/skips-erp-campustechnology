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
    const titleref=useRef();
const patentnumberref=useRef();
const doaref=useRef();
const agencyref=useRef();
const yopref=useRef();
const doclinkref=useRef();
const patentstatusref=useRef();


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

const title=titleref.current.value;
const patentnumber=patentnumberref.current.value;
const doa=doaref.current.value;
const agency=agencyref.current.value;
const yop=yopref.current.value;
const doclink=doclinkref.current.value;
const patentstatus=patentstatusref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createpatentsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           title:title,
patentnumber:patentnumber,
doa:doa,
agency:agency,
yop:yop,
doclink:doclink,
patentstatus:patentstatus,

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

    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Title"  variant="outlined" inputRef={titleref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Patent number"  variant="outlined" inputRef={patentnumberref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Select date added" inputRef={doaref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Sponsoring agency"  variant="outlined" inputRef={agencyref} /><br /><br />

<InputLabel id="yop">Academic year</InputLabel><Select labelId="yop"
id="yop"
inputRef={yopref}
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

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Document link"  variant="outlined" inputRef={doclinkref} /><br /><br />

<InputLabel id="patentstatus">Patent status</InputLabel><Select labelId="patentstatus"
id="patentstatus"
inputRef={patentstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Applied">Applied</MenuItem>
<MenuItem value="Published">Published</MenuItem>
<MenuItem value="Awarded">Awarded</MenuItem>
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
