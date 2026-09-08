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

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser, fetchViewPage }) {
    const departmentref=useRef();
const titleref=useRef();
const journalref=useRef();
const yopref=useRef();
const issnref=useRef();
const articlelinkref=useRef();
const journallinkref=useRef();
const hindexref=useRef();
const citationref=useRef();
const levelref=useRef();
const citationindexref=useRef();
const ugclistedref=useRef();
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

const department=departmentref.current.value;
const title=titleref.current.value;
const journal=journalref.current.value;
const yop=yopref.current.value;
const issn=issnref.current.value;
const articlelink=articlelinkref.current.value;
const journallink=journallinkref.current.value;
const hindex=hindexref.current.value;
const citation=citationref.current.value;
const level=levelref.current.value;
const citationindex=citationindexref.current.value;
const ugclisted=ugclistedref.current.value;
const doclink=doclinkref.current.value;

const username=usernameref.current.value;
const facultyname=nameref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createpublicationsbyfac', {
        params: {
            user: username,
            token: token,
            colid: colid,
            name: facultyname,
           department:department,
title:title,
journal:journal,
yop:yop,
issn:issn,
articlelink:articlelink,
journallink:journallink,
hindex:hindex,
citation:citation,
level:level,
citationindex:citationindex,
ugclisted:ugclisted,
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
    fetchViewPage();

    handleClose();
   
};




  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
  

      <DialogTitle>Add data</DialogTitle>
      <DialogContent>

      <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="User"  variant="outlined" inputRef={usernameref} /><br /><br />

      <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Name"  variant="outlined" inputRef={nameref} /><br /><br />



    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Department"  variant="outlined" inputRef={departmentref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Title"  variant="outlined" inputRef={titleref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Journal"  variant="outlined" inputRef={journalref} /><br /><br />

<InputLabel id="yop">Calendar year</InputLabel><Select labelId="yop"
id="yop"
inputRef={yopref}
sx={{ width: '100%'}}
>
<MenuItem value="2024">2024</MenuItem>
<MenuItem value="2023">2023</MenuItem>
<MenuItem value="2022">2022</MenuItem>
<MenuItem value="2021">2021</MenuItem>
<MenuItem value="2020">2020</MenuItem>
<MenuItem value="2019">2019</MenuItem>
<MenuItem value="2018">2018</MenuItem>
<MenuItem value="2017">2017</MenuItem>
</Select>
<br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="ISSN"  variant="outlined" inputRef={issnref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Article link"  variant="outlined" inputRef={articlelinkref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Journal link"  variant="outlined" inputRef={journallinkref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="H index"  variant="outlined" inputRef={hindexref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Citation"  variant="outlined" inputRef={citationref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Level"  variant="outlined" inputRef={levelref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Citation index"  variant="outlined" inputRef={citationindexref} /><br /><br />

<InputLabel id="ugclisted">If listed in UGC care or scopus</InputLabel><Select labelId="ugclisted"
id="ugclisted"
inputRef={ugclistedref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
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
