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
const storenameref=useRef();
const storeidref=useRef();
const itemnameref=useRef();
const itemcoderef=useRef();
const quantityaddedref=useRef();
const quantityreturnref=useRef();
const netquantityref=useRef();
const tdateref=useRef();
const itemtyperef=useRef();
const statusref=useRef();


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
const storename=storenameref.current.value;
const storeid=storeidref.current.value;
const itemname=itemnameref.current.value;
const itemcode=itemcoderef.current.value;
const quantityadded=quantityaddedref.current.value;
const quantityreturn=quantityreturnref.current.value;
const netquantity=netquantityref.current.value;
const tdate=tdateref.current.value;
const itemtype=itemtyperef.current.value;
const status=statusref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createstockregisterdsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
storename:storename,
storeid:storeid,
itemname:itemname,
itemcode:itemcode,
quantityadded:quantityadded,
quantityreturn:quantityreturn,
netquantity:netquantity,
tdate:tdate,
itemtype:itemtype,
status:status,

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

      

      <br /><br />

    <p>Year</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={yearref} /><br /><br />

<p>Store</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={storenameref} /><br /><br />

<p>Store id</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={storeidref} /><br /><br />

<p>Item</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemnameref} /><br /><br />

<p>Item code</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemcoderef} /><br /><br />

<p>Quantity added</p>
<TextField id="outlined-basic"  type="Number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={quantityaddedref} /><br /><br />

<p>Quantity return</p>
<TextField id="outlined-basic"  type="Number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={quantityreturnref} /><br /><br />

<p>Net quantity</p>
<TextField id="outlined-basic"  type="Number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={netquantityref} /><br /><br />

<p>Transaction date</p>
<TextField id="outlined-basic"  type="Date" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={tdateref} /><br /><br />

<p>Item type</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={itemtyperef} /><br /><br />

<p>Status</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={statusref} /><br /><br />


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
