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
    const leadref=useRef();
const companyref=useRef();
const designationref=useRef();
const phoneref=useRef();
const emailref=useRef();
const addressref=useRef();
const cityref=useRef();
const stateref=useRef();
const countryref=useRef();
const pinref=useRef();
const sourceref=useRef();
const sourceempref=useRef();
const assignedtoref=useRef();
const assigneddateref=useRef();
const followupdateref=useRef();
const fcommentsref=useRef();
const leadstatusref=useRef();
const yearref=useRef();
const productref=useRef();
const amountref=useRef();
const leadtyperef=useRef();


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

      const setlead=(id)=> {
if(transcript) {
leadref.current.value=transcript;
 }
 }
const setcompany=(id)=> {
if(transcript) {
companyref.current.value=transcript;
 }
 }
const setdesignation=(id)=> {
if(transcript) {
designationref.current.value=transcript;
 }
 }
const setphone=(id)=> {
if(transcript) {
phoneref.current.value=transcript;
 }
 }
const setemail=(id)=> {
if(transcript) {
emailref.current.value=transcript;
 }
 }
const setaddress=(id)=> {
if(transcript) {
addressref.current.value=transcript;
 }
 }
const setcity=(id)=> {
if(transcript) {
cityref.current.value=transcript;
 }
 }
const setstate=(id)=> {
if(transcript) {
stateref.current.value=transcript;
 }
 }
const setcountry=(id)=> {
if(transcript) {
countryref.current.value=transcript;
 }
 }
const setpin=(id)=> {
if(transcript) {
pinref.current.value=transcript;
 }
 }
const setsource=(id)=> {
if(transcript) {
sourceref.current.value=transcript;
 }
 }
const setsourceemp=(id)=> {
if(transcript) {
sourceempref.current.value=transcript;
 }
 }
const setassignedto=(id)=> {
if(transcript) {
assignedtoref.current.value=transcript;
 }
 }
const setfcomments=(id)=> {
if(transcript) {
fcommentsref.current.value=transcript;
 }
 }
const setyear=(id)=> {
if(transcript) {
yearref.current.value=transcript;
 }
 }
const setproduct=(id)=> {
if(transcript) {
productref.current.value=transcript;
 }
 }
const setleadtype=(id)=> {
if(transcript) {
leadtyperef.current.value=transcript;
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

const lead=leadref.current.value;
const company=companyref.current.value;
const designation=designationref.current.value;
const phone=phoneref.current.value;
const email=emailref.current.value;
const address=addressref.current.value;
const city=cityref.current.value;
const state=stateref.current.value;
const country=countryref.current.value;
const pin=pinref.current.value;
const source=sourceref.current.value;
const sourceemp=sourceempref.current.value;
const assignedto=assignedtoref.current.value;
const assigneddate=assigneddateref.current.value;
const followupdate=followupdateref.current.value;
const fcomments=fcommentsref.current.value;
const leadstatus=leadstatusref.current.value;
const year=yearref.current.value;
const product=productref.current.value;
const amount=amountref.current.value;
const leadtype=leadtyperef.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createcrmh1byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           lead:lead,
company:company,
designation:designation,
phone:phone,
email:email,
address:address,
city:city,
state:state,
country:country,
pin:pin,
source:source,
sourceemp:sourceemp,
assignedto:assignedto,
assigneddate:assigneddate,
followupdate:followupdate,
fcomments:fcomments,
leadstatus:leadstatus,
year:year,
product:product,
amount:amount,
leadtype:leadtype,

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

       <button onClick={setlead}>Set Lead</button>
 <button onClick={setcompany}>Set Company</button>
 <button onClick={setdesignation}>Set Designation</button>
 <button onClick={setphone}>Set Phone</button>
 <button onClick={setemail}>Set Email</button>
 <button onClick={setaddress}>Set Address</button>
 <button onClick={setcity}>Set City</button>
 <button onClick={setstate}>Set State</button>
 <button onClick={setcountry}>Set Country</button>
 <button onClick={setpin}>Set Pin</button>
 <button onClick={setsource}>Set Source</button>
 <button onClick={setsourceemp}>Set Added by</button>
 <button onClick={setassignedto}>Set Assigned to</button>
 <button onClick={setfcomments}>Set Lead comments</button>
 <button onClick={setyear}>Set Year</button>
 <button onClick={setproduct}>Set Product</button>
 <button onClick={setleadtype}>Set Lead type</button>


      <br /><br />

    <p>Lead</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={leadref} /><br /><br />

<p>Company</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={companyref} /><br /><br />

<p>Designation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={designationref} /><br /><br />

<p>Phone</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={phoneref} /><br /><br />

<p>Email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={emailref} /><br /><br />

<p>Address</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={addressref} /><br /><br />

<p>City</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={cityref} /><br /><br />

<p>State</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={stateref} /><br /><br />

<p>Country</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={countryref} /><br /><br />

<p>Pin</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={pinref} /><br /><br />

<p>Source</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sourceref} /><br /><br />

<p>Added by</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={sourceempref} /><br /><br />

<p>Assigned to</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={assignedtoref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Assigned date" inputRef={assigneddateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Follow up date" inputRef={followupdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Lead comments</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={fcommentsref} /><br /><br />

<InputLabel id="leadstatus">Lead status</InputLabel><Select labelId="leadstatus"
id="leadstatus"
inputRef={leadstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Added">Added</MenuItem>
<MenuItem value="Contacted">Contacted</MenuItem>
<MenuItem value="Prospect">Prospect</MenuItem>
<MenuItem value="Converted">Converted</MenuItem>
<MenuItem value="Rejected">Rejected</MenuItem>
</Select>
<br /><br />

<p>Year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Product</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={productref} /><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<p>Lead type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={leadtyperef} /><br /><br />


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
