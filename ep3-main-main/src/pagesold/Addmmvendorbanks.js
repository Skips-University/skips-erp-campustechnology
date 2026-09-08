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
    const vendoridref=useRef();
const vendorref=useRef();
const bankref=useRef();
const accountref=useRef();
const accnoref=useRef();
const ifscref=useRef();
const branchref=useRef();
const acctyperef=useRef();
const banktyperef=useRef();


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
const setbank=(id)=> {
if(transcript) {
bankref.current.value=transcript;
 }
 }
const setaccount=(id)=> {
if(transcript) {
accountref.current.value=transcript;
 }
 }
const setaccno=(id)=> {
if(transcript) {
accnoref.current.value=transcript;
 }
 }
const setifsc=(id)=> {
if(transcript) {
ifscref.current.value=transcript;
 }
 }
const setbranch=(id)=> {
if(transcript) {
branchref.current.value=transcript;
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

const vendorid=vendoridref.current.value;
const vendor=vendorref.current.value;
const bank=bankref.current.value;
const account=accountref.current.value;
const accno=accnoref.current.value;
const ifsc=ifscref.current.value;
const branch=branchref.current.value;
const acctype=acctyperef.current.value;
const banktype=banktyperef.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmvendorbanksbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           vendorid:vendorid,
vendor:vendor,
bank:bank,
account:account,
accno:accno,
ifsc:ifsc,
branch:branch,
acctype:acctype,
banktype:banktype,

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

       <button onClick={setvendorid}>Set Vendor id</button>
 <button onClick={setvendor}>Set Vendor</button>
 <button onClick={setbank}>Set Bank</button>
 <button onClick={setaccount}>Set Account name</button>
 <button onClick={setaccno}>Set Account no</button>
 <button onClick={setifsc}>Set IFSC code</button>
 <button onClick={setbranch}>Set Branch</button>


      <br /><br />

    <p>Vendor id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={vendoridref} /><br /><br />

<p>Vendor</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={vendorref} /><br /><br />

<p>Bank</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bankref} /><br /><br />

<p>Account name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={accountref} /><br /><br />

<p>Account no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={accnoref} /><br /><br />

<p>IFSC code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={ifscref} /><br /><br />

<p>Branch</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={branchref} /><br /><br />

<InputLabel id="acctype">Account type</InputLabel><Select labelId="acctype"
id="acctype"
inputRef={acctyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Savings">Savings</MenuItem>
<MenuItem value="Current">Current</MenuItem>
</Select>
<br /><br />

<InputLabel id="banktype">Bank type</InputLabel><Select labelId="banktype"
id="banktype"
inputRef={banktyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Public">Public</MenuItem>
<MenuItem value="Private">Private</MenuItem>
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
