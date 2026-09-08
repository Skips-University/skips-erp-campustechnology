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
    const facultyref=useRef();
const facultyidref=useRef();
const itemcoderef=useRef();
const itemnameref=useRef();
const quantityref=useRef();
const reqdateref=useRef();
const allottedref=useRef();
const allotdateref=useRef();
const poidref=useRef();
const storeidref=useRef();
const storenameref=useRef();
const reqstatusref=useRef();
const yearref=useRef();


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

      const setfaculty=(id)=> {
if(transcript) {
facultyref.current.value=transcript;
 }
 }
const setfacultyid=(id)=> {
if(transcript) {
facultyidref.current.value=transcript;
 }
 }
const setitemcode=(id)=> {
if(transcript) {
itemcoderef.current.value=transcript;
 }
 }
const setitemname=(id)=> {
if(transcript) {
itemnameref.current.value=transcript;
 }
 }
const setpoid=(id)=> {
if(transcript) {
poidref.current.value=transcript;
 }
 }
const setstoreid=(id)=> {
if(transcript) {
storeidref.current.value=transcript;
 }
 }
const setstorename=(id)=> {
if(transcript) {
storenameref.current.value=transcript;
 }
 }
const setreqstatus=(id)=> {
if(transcript) {
reqstatusref.current.value=transcript;
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

const faculty=facultyref.current.value;
const facultyid=facultyidref.current.value;
const itemcode=itemcoderef.current.value;
const itemname=itemnameref.current.value;
const quantity=quantityref.current.value;
const reqdate=reqdateref.current.value;
const allotted=allottedref.current.value;
const allotdate=allotdateref.current.value;
const poid=poidref.current.value;
const storeid=storeidref.current.value;
const storename=storenameref.current.value;
const reqstatus=reqstatusref.current.value;
const year=yearref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createrequisationdsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           faculty:faculty,
facultyid:facultyid,
itemcode:itemcode,
itemname:itemname,
quantity:quantity,
reqdate:reqdate,
allotted:allotted,
allotdate:allotdate,
poid:poid,
storeid:storeid,
storename:storename,
reqstatus:reqstatus,
year:year,

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

       <button onClick={setfaculty}>Set Faculty</button>
 <button onClick={setfacultyid}>Set Faculty id</button>
 <button onClick={setitemcode}>Set Item code</button>
 <button onClick={setitemname}>Set Item</button>
 <button onClick={setpoid}>Set POID</button>
 <button onClick={setstoreid}>Set Store id</button>
 <button onClick={setstorename}>Set Store</button>
 <button onClick={setreqstatus}>Set Requisition status</button>


      <br /><br />

    <p>Faculty</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyref} /><br /><br />

<p>Faculty id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyidref} /><br /><br />

<p>Item code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemcoderef} /><br /><br />

<p>Item</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemnameref} /><br /><br />

<p>Quantity</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={quantityref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Requisition date" inputRef={reqdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Allotted</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={allottedref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Allotment date" inputRef={allotdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>POID</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={poidref} /><br /><br />

<p>Store id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={storeidref} /><br /><br />

<p>Store</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={storenameref} /><br /><br />

<p>Requisition status</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={reqstatusref} /><br /><br />

<p>Year</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />


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
