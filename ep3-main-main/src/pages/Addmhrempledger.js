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
const employeeref=useRef();
const empidref=useRef();
const roleref=useRef();
const designationref=useRef();
const categoryref=useRef();
const itemref=useRef();
const dueref=useRef();
const concessionref=useRef();
const paidref=useRef();
const balanceref=useRef();
const paydateref=useRef();
const payrefref=useRef();
const cashbookref=useRef();
const typeref=useRef();
const levelref=useRef();


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

      const setyear=(id)=> {
if(transcript) {
yearref.current.value=transcript;
 }
 }
const setemployee=(id)=> {
if(transcript) {
employeeref.current.value=transcript;
 }
 }
const setempid=(id)=> {
if(transcript) {
empidref.current.value=transcript;
 }
 }
const setrole=(id)=> {
if(transcript) {
roleref.current.value=transcript;
 }
 }
const setdesignation=(id)=> {
if(transcript) {
designationref.current.value=transcript;
 }
 }
const setcategory=(id)=> {
if(transcript) {
categoryref.current.value=transcript;
 }
 }
const setitem=(id)=> {
if(transcript) {
itemref.current.value=transcript;
 }
 }
const setpayref=(id)=> {
if(transcript) {
payrefref.current.value=transcript;
 }
 }
const setcashbook=(id)=> {
if(transcript) {
cashbookref.current.value=transcript;
 }
 }
const settype=(id)=> {
if(transcript) {
typeref.current.value=transcript;
 }
 }
const setlevel=(id)=> {
if(transcript) {
levelref.current.value=transcript;
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
const employee=employeeref.current.value;
const empid=empidref.current.value;
const role=roleref.current.value;
const designation=designationref.current.value;
const category=categoryref.current.value;
const item=itemref.current.value;
const due=dueref.current.value;
const concession=concessionref.current.value;
const paid=paidref.current.value;
const balance=balanceref.current.value;
const paydate=paydateref.current.value;
const payref=payrefref.current.value;
const cashbook=cashbookref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createhrempledgerbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
employee:employee,
empid:empid,
role:role,
designation:designation,
category:category,
item:item,
due:due,
concession:concession,
paid:paid,
balance:balance,
paydate:paydate,
payref:payref,
cashbook:cashbook,
type:type,
level:level,

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

       <button onClick={setyear}>Set Year</button>
 <button onClick={setemployee}>Set Employee</button>
 <button onClick={setempid}>Set Employee id</button>
 <button onClick={setrole}>Set Role</button>
 <button onClick={setdesignation}>Set Designation</button>
 <button onClick={setcategory}>Set Category</button>
 <button onClick={setitem}>Set Item</button>
 <button onClick={setpayref}>Set Payref</button>
 <button onClick={setcashbook}>Set Cashbook</button>
 <button onClick={settype}>Set Type</button>
 <button onClick={setlevel}>Set Level</button>


      <br /><br />

    <p>Year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Employee</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={employeeref} /><br /><br />

<p>Employee id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={empidref} /><br /><br />

<p>Role</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={roleref} /><br /><br />

<p>Designation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={designationref} /><br /><br />

<p>Category</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={categoryref} /><br /><br />

<p>Item</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemref} /><br /><br />

<p>Due</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={dueref} /><br /><br />

<p>Concession</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={concessionref} /><br /><br />

<p>Paid</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={paidref} /><br /><br />

<p>Balance</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={balanceref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Pay date" inputRef={paydateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Payref</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={payrefref} /><br /><br />

<p>Cashbook</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={cashbookref} /><br /><br />

<p>Type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={typeref} /><br /><br />

<p>Level</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={levelref} /><br /><br />


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
