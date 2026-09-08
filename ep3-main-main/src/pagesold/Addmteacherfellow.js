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
const tnameref=useRef();
const levelref=useRef();
const awardref=useRef();
const agencyref=useRef();
const advancedref=useRef();
const durationref=useRef();
const amountref=useRef();
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

const year=yearref.current.value;
const tname=tnameref.current.value;
const level=levelref.current.value;
const award=awardref.current.value;
const agency=agencyref.current.value;
const advanced=advancedref.current.value;
const duration=durationref.current.value;
const amount=amountref.current.value;
const doclink=doclinkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createteacherfellowbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
tname:tname,
level:level,
award:award,
agency:agency,
advanced:advanced,
duration:duration,
amount:amount,
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

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Teacher name"  variant="outlined" inputRef={tnameref} /><br /><br />

<InputLabel id="level">Level</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="National">National</MenuItem>
<MenuItem value="International">International</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Award"  variant="outlined" inputRef={awardref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Agency"  variant="outlined" inputRef={agencyref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Purpose of award"  variant="outlined" inputRef={advancedref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Duration of award"  variant="outlined" inputRef={durationref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Amount"  variant="outlined" inputRef={amountref} /><br /><br />

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
