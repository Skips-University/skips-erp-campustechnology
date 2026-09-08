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
const durationref=useRef();
const yopref=useRef();
const membershipref=useRef();
const amountref=useRef();
const roleref=useRef();
const paperref=useRef();
const levelref=useRef();
const typeref=useRef();
const doclinkref=useRef();

const usernameref=useRef();
const nameref=useRef();


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
const duration=durationref.current.value;
const yop=yopref.current.value;
const membership=membershipref.current.value;
const amount=amountref.current.value;
const role=roleref.current.value;
const paper=paperref.current.value;
const level=levelref.current.value;
const type=typeref.current.value;
const doclink=doclinkref.current.value;

const username=usernameref.current.value;
const facultyname=nameref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createseminarbyfac', {
        params: {
            user: username,
            token: token,
            colid: colid,
            name: facultyname,
           title:title,
duration:duration,
yop:yop,
membership:membership,
amount:amount,
role:role,
paper:paper,
level:level,
type:type,
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

              <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="User"  variant="outlined" inputRef={usernameref} /><br /><br />
        
              <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Name"  variant="outlined" inputRef={nameref} /><br /><br />
        

    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Seminar title"  variant="outlined" inputRef={titleref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Duration from to"  variant="outlined" inputRef={durationref} /><br /><br />

<InputLabel id="yop">Academic year</InputLabel><Select labelId="yop"
id="yop"
inputRef={yopref}
sx={{ width: '100%'}}
>
<MenuItem value="2017-18">2017-18</MenuItem>
<MenuItem value="2018-19">2018-19</MenuItem>
<MenuItem value="2019-20">2019-20</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Membership to any organization"  variant="outlined" inputRef={membershipref} /><br /><br />

<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Amount reimbursed"  variant="outlined" inputRef={amountref} /><br /><br />

<InputLabel id="role">Role</InputLabel><Select labelId="role"
id="role"
inputRef={roleref}
sx={{ width: '100%'}}
>
<MenuItem value="Participated">Participated</MenuItem>
<MenuItem value="Presented">Presented</MenuItem>
<MenuItem value="Resource person">Resource person</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Name of paper presented if any"  variant="outlined" inputRef={paperref} /><br /><br />

<InputLabel id="level">Level</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="State">State</MenuItem>
<MenuItem value="National">National</MenuItem>
<MenuItem value="International">International</MenuItem>
</Select>
<br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Seminar">Seminar</MenuItem>
<MenuItem value="Workshop">Workshop</MenuItem>
<MenuItem value="Conference">Conference</MenuItem>
<MenuItem value="FDP">FDP</MenuItem>
<MenuItem value="Refresher course">Refresher course</MenuItem>
</Select>
<br /><br />

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
