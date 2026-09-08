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
const poidref=useRef();
const vendorref=useRef();
const vendoridref=useRef();
const quantityref=useRef();
const priceref=useRef();
const descriptionref=useRef();
const reqdateref=useRef();
const postatusref=useRef();
const itemidref=useRef();
const itemnameref=useRef();


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

      const setpoid=(id)=> {
if(transcript) {
poidref.current.value=transcript;
 }
 }
const setvendor=(id)=> {
if(transcript) {
vendorref.current.value=transcript;
 }
 }
const setvendorid=(id)=> {
if(transcript) {
vendoridref.current.value=transcript;
 }
 }
const setdescription=(id)=> {
if(transcript) {
descriptionref.current.value=transcript;
 }
 }
const setpostatus=(id)=> {
if(transcript) {
postatusref.current.value=transcript;
 }
 }
const setitemid=(id)=> {
if(transcript) {
itemidref.current.value=transcript;
 }
 }
const setitemname=(id)=> {
if(transcript) {
itemnameref.current.value=transcript;
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
const poid=poidref.current.value;
const vendor=vendorref.current.value;
const vendorid=vendoridref.current.value;
const quantity=quantityref.current.value;
const price=priceref.current.value;
const description=descriptionref.current.value;
const reqdate=reqdateref.current.value;
const postatus=postatusref.current.value;
const itemid=itemidref.current.value;
const itemname=itemnameref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createstorepoitemsdsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
poid:poid,
vendor:vendor,
vendorid:vendorid,
quantity:quantity,
price:price,
description:description,
reqdate:reqdate,
postatus:postatus,
itemid:itemid,
itemname:itemname,

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

       <button onClick={setpoid}>Set PO ID</button>
 <button onClick={setvendor}>Set Vendor</button>
 <button onClick={setvendorid}>Set Vendor id</button>
 <button onClick={setdescription}>Set Description</button>
 <button onClick={setpostatus}>Set PO status</button>
 <button onClick={setitemid}>Set Item id</button>
 <button onClick={setitemname}>Set Item name</button>


      <br /><br />

    <p>Year</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>PO ID</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={poidref} /><br /><br />

<p>Vendor</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={vendorref} /><br /><br />

<p>Vendor id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={vendoridref} /><br /><br />

<p>Quantity</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={quantityref} /><br /><br />

<p>Price</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={priceref} /><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Requisition date" inputRef={reqdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>PO status</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={postatusref} /><br /><br />

<p>Item id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemidref} /><br /><br />

<p>Item name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemnameref} /><br /><br />


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
