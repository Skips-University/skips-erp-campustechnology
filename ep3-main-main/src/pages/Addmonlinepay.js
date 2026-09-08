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
    const transactionidref=useRef();
const orderidref=useRef();
const bankrefref=useRef();
const paymoderef=useRef();
const bankref=useRef();
const amountref=useRef();
const usernameref=useRef();
const regnoref=useRef();
const clientcolidref=useRef();
const sessionslotref=useRef();
const testcref=useRef();
const typeref=useRef();
const paydateref=useRef();


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

      const settransactionid=(id)=> {
if(transcript) {
transactionidref.current.value=transcript;
 }
 }
const setorderid=(id)=> {
if(transcript) {
orderidref.current.value=transcript;
 }
 }
const setbankref=(id)=> {
if(transcript) {
bankrefref.current.value=transcript;
 }
 }
const setpaymode=(id)=> {
if(transcript) {
paymoderef.current.value=transcript;
 }
 }
const setbank=(id)=> {
if(transcript) {
bankref.current.value=transcript;
 }
 }
const setusername=(id)=> {
if(transcript) {
usernameref.current.value=transcript;
 }
 }
const setregno=(id)=> {
if(transcript) {
regnoref.current.value=transcript;
 }
 }
const setclientcolid=(id)=> {
if(transcript) {
clientcolidref.current.value=transcript;
 }
 }
const setsessionslot=(id)=> {
if(transcript) {
sessionslotref.current.value=transcript;
 }
 }
const settestc=(id)=> {
if(transcript) {
testcref.current.value=transcript;
 }
 }
const settype=(id)=> {
if(transcript) {
typeref.current.value=transcript;
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

const transactionid=transactionidref.current.value;
const orderid=orderidref.current.value;
const bankref=bankrefref.current.value;
const paymode=paymoderef.current.value;
const bank=bankref.current.value;
const amount=amountref.current.value;
const username=usernameref.current.value;
const regno=regnoref.current.value;
const clientcolid=clientcolidref.current.value;
const sessionslot=sessionslotref.current.value;
const testc=testcref.current.value;
const type=typeref.current.value;
const paydate=paydateref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createonlinepaybyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           transactionid:transactionid,
orderid:orderid,
bankref:bankref,
paymode:paymode,
bank:bank,
amount:amount,
username:username,
regno:regno,
clientcolid:clientcolid,
sessionslot:sessionslot,
testc:testc,
type:type,
paydate:paydate,

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

       <button onClick={settransactionid}>Set Transaction id</button>
 <button onClick={setorderid}>Set Order id</button>
 <button onClick={setbankref}>Set Bank ref</button>
 <button onClick={setpaymode}>Set Pay mode</button>
 <button onClick={setbank}>Set Bank</button>
 <button onClick={setusername}>Set Username</button>
 <button onClick={setregno}>Set Reg no</button>
 <button onClick={setclientcolid}>Set Client colid</button>
 <button onClick={setsessionslot}>Set Session slot</button>
 <button onClick={settestc}>Set Test</button>
 <button onClick={settype}>Set Type</button>


      <br /><br />

    <p>Transaction id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={transactionidref} /><br /><br />

<p>Order id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={orderidref} /><br /><br />

<p>Bank ref</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bankrefref} /><br /><br />

<p>Pay mode</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={paymoderef} /><br /><br />

<p>Bank</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bankref} /><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<p>Username</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={usernameref} /><br /><br />

<p>Reg no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<p>Client colid</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={clientcolidref} /><br /><br />

<p>Session slot</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sessionslotref} /><br /><br />

<p>Test</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={testcref} /><br /><br />

<p>Type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={typeref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Pay date" inputRef={paydateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />


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
