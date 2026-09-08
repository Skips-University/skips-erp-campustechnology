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
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser, fetchViewPage }) {
    const yearref=useRef();
const assettyperef=useRef();
const assetref=useRef();
const categoryref=useRef();
const purchasedateref=useRef();
const vendoridref=useRef();
const poidref=useRef();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

    const regno=global1.regno;

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

      const setasset=(id)=> {
if(transcript) {
assetref.current.value=transcript;
 }
 }
const setvendorid=(id)=> {
if(transcript) {
vendoridref.current.value=transcript;
 }
 }
const setpoid=(id)=> {
if(transcript) {
poidref.current.value=transcript;
 }
 }



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
const assettype=assettyperef.current.value;
const asset=assetref.current.value;
const category=categoryref.current.value;
const purchasedate=purchasedateref.current.value;
const vendorid=vendoridref.current.value;
const poid=poidref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmassetsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
assettype:assettype,
asset:asset,
category:category,
purchasedate:purchasedate,
vendorid:vendorid,
poid:poid,

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
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>

       <button onClick={setasset}>Set Asset</button>
 <button onClick={setvendorid}>Set Vendor ID</button>
 <button onClick={setpoid}>Set PO ID</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
</Select>
<br /><br />

<InputLabel id="assettype">Asset type</InputLabel><Select labelId="assettype"
id="assettype"
inputRef={assettyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Own">Own</MenuItem>
<MenuItem value="Rented">Rented</MenuItem>
</Select>
<br /><br />

<p>Asset</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={assetref} /><br /><br />

<InputLabel id="category">Category</InputLabel><Select labelId="category"
id="category"
inputRef={categoryref}
sx={{ width: '100%'}}
>
<MenuItem value="IT">IT</MenuItem>
<MenuItem value="Computer">Computer</MenuItem>
<MenuItem value="Physical facilities">Physical facilities</MenuItem>
<MenuItem value="Furniture">Furniture</MenuItem>
<MenuItem value="Vehicle">Vehicle</MenuItem>
<MenuItem value="Academic support">Academic support</MenuItem>
</Select>
<br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Purchase date" inputRef={purchasedateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Vendor ID</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={vendoridref} /><br /><br />

<p>PO ID</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={poidref} /><br /><br />


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
