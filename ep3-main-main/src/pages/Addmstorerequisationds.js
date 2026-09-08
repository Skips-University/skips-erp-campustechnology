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
const itemcoderef=useRef();
const itemnameref=useRef();
const storeref=useRef();
const storeidref=useRef();
const reqdateref=useRef();
const quantityref=useRef();
const reqstatusref=useRef();
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

      const setyear=(id)=> {
if(transcript) {
yearref.current.value=transcript;
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
const setstore=(id)=> {
if(transcript) {
storeref.current.value=transcript;
 }
 }
const setstoreid=(id)=> {
if(transcript) {
storeidref.current.value=transcript;
 }
 }
const setreqstatus=(id)=> {
if(transcript) {
reqstatusref.current.value=transcript;
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
const itemcode=itemcoderef.current.value;
const itemname=itemnameref.current.value;
const store=storeref.current.value;
const storeid=storeidref.current.value;
const reqdate=reqdateref.current.value;
const quantity=quantityref.current.value;
const reqstatus=reqstatusref.current.value;
const poid=poidref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createstorerequisationdsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
itemcode:itemcode,
itemname:itemname,
store:store,
storeid:storeid,
reqdate:reqdate,
quantity:quantity,
reqstatus:reqstatus,
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

       <button onClick={setyear}>Set Year</button>
 <button onClick={setitemcode}>Set Item code</button>
 <button onClick={setitemname}>Set Item</button>
 <button onClick={setstore}>Set Store</button>
 <button onClick={setstoreid}>Set Store id</button>
 <button onClick={setreqstatus}>Set Requisition status</button>
 <button onClick={setpoid}>Set Poid</button>


      <br /><br />

    <p>Year</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Item code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemcoderef} /><br /><br />

<p>Item</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemnameref} /><br /><br />

<p>Store</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={storeref} /><br /><br />

<p>Store id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={storeidref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Requisition date" inputRef={reqdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Quantity</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={quantityref} /><br /><br />

<p>Requisition status</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={reqstatusref} /><br /><br />

<p>Poid</p>
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
