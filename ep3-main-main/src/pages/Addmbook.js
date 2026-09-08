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
    const booktitleref=useRef();
const papertitleref=useRef();
const proceedingref=useRef();
const yopref=useRef();
const issnref=useRef();
const publisherref=useRef();
const conferencenameref=useRef();
const levelref=useRef();
const affiliatedref=useRef();
const typeref=useRef();
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

const booktitle=booktitleref.current.value;
const papertitle=papertitleref.current.value;
const proceeding=proceedingref.current.value;
const yop=yopref.current.value;
const issn=issnref.current.value;
const publisher=publisherref.current.value;
const conferencename=conferencenameref.current.value;
const level=levelref.current.value;
const affiliated=affiliatedref.current.value;
const type=typeref.current.value;
const doclink=doclinkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createbookbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           booktitle:booktitle,
papertitle:papertitle,
proceeding:proceeding,
yop:yop,
issn:issn,
publisher:publisher,
conferencename:conferencename,
level:level,
affiliated:affiliated,
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

    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Book title"  variant="outlined" inputRef={booktitleref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Paper title"  variant="outlined" inputRef={papertitleref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Proceeding"  variant="outlined" inputRef={proceedingref} /><br /><br />

<InputLabel id="yop">Academic year</InputLabel><Select labelId="yop"
id="yop"
inputRef={yopref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2025-26</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
<MenuItem value="2019-20">2019-20</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="ISBN / ISSN"  variant="outlined" inputRef={issnref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Publisher"  variant="outlined" inputRef={publisherref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Conference name"  variant="outlined" inputRef={conferencenameref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Level"  variant="outlined" inputRef={levelref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="If affiliated to same institution"  variant="outlined" inputRef={affiliatedref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Book">Book</MenuItem>
<MenuItem value="Chapter">Chapter</MenuItem>
<MenuItem value="Proceeding">Proceeding</MenuItem>
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
