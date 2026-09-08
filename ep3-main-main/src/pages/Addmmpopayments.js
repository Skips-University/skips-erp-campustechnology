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
const invoiceidref=useRef();
const frombankref=useRef();
const amountref=useRef();
const invoicedateref=useRef();
const paydateref=useRef();
const fromaccountref=useRef();
const fromifscref=useRef();
const refnoref=useRef();
const tobankref=useRef();
const toaccountref=useRef();
const toifscref=useRef();
const paytyperef=useRef();
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

      const setpoid=(id)=> {
if(transcript) {
poidref.current.value=transcript;
 }
 }
const setinvoiceid=(id)=> {
if(transcript) {
invoiceidref.current.value=transcript;
 }
 }
const setfrombank=(id)=> {
if(transcript) {
frombankref.current.value=transcript;
 }
 }
const setfromaccount=(id)=> {
if(transcript) {
fromaccountref.current.value=transcript;
 }
 }
const setfromifsc=(id)=> {
if(transcript) {
fromifscref.current.value=transcript;
 }
 }
const setrefno=(id)=> {
if(transcript) {
refnoref.current.value=transcript;
 }
 }
const settobank=(id)=> {
if(transcript) {
tobankref.current.value=transcript;
 }
 }
const settoaccount=(id)=> {
if(transcript) {
toaccountref.current.value=transcript;
 }
 }
const settoifsc=(id)=> {
if(transcript) {
toifscref.current.value=transcript;
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
const poid=poidref.current.value;
const invoiceid=invoiceidref.current.value;
const frombank=frombankref.current.value;
const amount=amountref.current.value;
const invoicedate=invoicedateref.current.value;
const paydate=paydateref.current.value;
const fromaccount=fromaccountref.current.value;
const fromifsc=fromifscref.current.value;
const refno=refnoref.current.value;
const tobank=tobankref.current.value;
const toaccount=toaccountref.current.value;
const toifsc=toifscref.current.value;
const paytype=paytyperef.current.value;
const doclink=doclinkref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/creatempopaymentsbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
poid:poid,
invoiceid:invoiceid,
frombank:frombank,
amount:amount,
invoicedate:invoicedate,
paydate:paydate,
fromaccount:fromaccount,
fromifsc:fromifsc,
refno:refno,
tobank:tobank,
toaccount:toaccount,
toifsc:toifsc,
paytype:paytype,
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

       <button onClick={setpoid}>Set PO ID</button>
 <button onClick={setinvoiceid}>Set Invoice ID</button>
 <button onClick={setfrombank}>Set From bank</button>
 <button onClick={setfromaccount}>Set From account</button>
 <button onClick={setfromifsc}>Set From IFSC</button>
 <button onClick={setrefno}>Set Ref no</button>
 <button onClick={settobank}>Set To bank</button>
 <button onClick={settoaccount}>Set To account</button>
 <button onClick={settoifsc}>Set To IFSC</button>
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

<p>PO ID</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={poidref} /><br /><br />

<p>Invoice ID</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={invoiceidref} /><br /><br />

<p>From bank</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={frombankref} /><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Invoice date" inputRef={invoicedateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Paydate" inputRef={paydateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>From account</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={fromaccountref} /><br /><br />

<p>From IFSC</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={fromifscref} /><br /><br />

<p>Ref no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={refnoref} /><br /><br />

<p>To bank</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={tobankref} /><br /><br />

<p>To account</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={toaccountref} /><br /><br />

<p>To IFSC</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={toifscref} /><br /><br />

<InputLabel id="paytype">Pay type</InputLabel><Select labelId="paytype"
id="paytype"
inputRef={paytyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Full">Full</MenuItem>
<MenuItem value="Partial">Partial</MenuItem>
</Select>
<br /><br />

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
