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
const ponumberref=useRef();
const podateref=useRef();
const descriptionref=useRef();
const vendoridref=useRef();
const vendorref=useRef();
const amountref=useRef();
const gstref=useRef();
const termsref=useRef();
const potyperef=useRef();
const approvalref=useRef();
const approvaluserref=useRef();
const doclinkref=useRef();


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

      const setponumber=(id)=> {
if(transcript) {
ponumberref.current.value=transcript;
 }
 }
const setdescription=(id)=> {
if(transcript) {
descriptionref.current.value=transcript;
 }
 }
const setvendorid=(id)=> {
if(transcript) {
vendoridref.current.value=transcript;
 }
 }
const setvendor=(id)=> {
if(transcript) {
vendorref.current.value=transcript;
 }
 }
const setterms=(id)=> {
if(transcript) {
termsref.current.value=transcript;
 }
 }
const setapprovaluser=(id)=> {
if(transcript) {
approvaluserref.current.value=transcript;
 }
 }
const setdoclink=(id)=> {
if(transcript) {
doclinkref.current.value=transcript;
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
const ponumber=ponumberref.current.value;
const podate=podateref.current.value;
const description=descriptionref.current.value;
const vendorid=vendoridref.current.value;
const vendor=vendorref.current.value;
const amount=amountref.current.value;
const gst=gstref.current.value;
const terms=termsref.current.value;
const potype=potyperef.current.value;
const approval=approvalref.current.value;
const approvaluser=approvaluserref.current.value;
const doclink=doclinkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/creatempurchasebyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
ponumber:ponumber,
podate:podate,
description:description,
vendorid:vendorid,
vendor:vendor,
amount:amount,
gst:gst,
terms:terms,
potype:potype,
approval:approval,
approvaluser:approvaluser,
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
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>

       <button onClick={setponumber}>Set PO number</button>
 <button onClick={setdescription}>Set Description</button>
 <button onClick={setvendorid}>Set Vendor id</button>
 <button onClick={setvendor}>Set Vendor</button>
 <button onClick={setterms}>Set Terms</button>
 <button onClick={setapprovaluser}>Set Approved by username</button>
 <button onClick={setdoclink}>Set Document link</button>


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

<p>PO number</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={ponumberref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="PO date" inputRef={podateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Vendor id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={vendoridref} /><br /><br />

<p>Vendor</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={vendorref} /><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<p>GST</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={gstref} /><br /><br />

<p>Terms</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={termsref} /><br /><br />

<InputLabel id="potype">PO type</InputLabel><Select labelId="potype"
id="potype"
inputRef={potyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Standard">Standard</MenuItem>
<MenuItem value="Subcontracting">Subcontracting</MenuItem>
<MenuItem value="Consignment">Consignment</MenuItem>
<MenuItem value="Stock transfer">Stock transfer</MenuItem>
<MenuItem value="External service">External service</MenuItem>
</Select>
<br /><br />

<InputLabel id="approval">Approval</InputLabel><Select labelId="approval"
id="approval"
inputRef={approvalref}
sx={{ width: '100%'}}
>
<MenuItem value="Approved">Approved</MenuItem>
<MenuItem value="Submitted">Submitted</MenuItem>
</Select>
<br /><br />

<p>Approved by username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={approvaluserref} /><br /><br />

<p>Document link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doclinkref} /><br /><br />


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
