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
const accgroupref=useRef();
const accountref=useRef();
const acctyperef=useRef();
const transactionref1=useRef();
const transactionrefref=useRef();
const subledgerref=useRef();
const cogsref=useRef();
const activitydateref=useRef();
const amountref=useRef();
const creditref=useRef();
const debitref=useRef();
const typeref=useRef();
const studentref=useRef();
const regnoref=useRef();
const empidref=useRef();


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

      const setaccgroup=(id)=> {
if(transcript) {
accgroupref.current.value=transcript;
 }
 }
const setaccount=(id)=> {
if(transcript) {
accountref.current.value=transcript;
 }
 }
const settransaction=(id)=> {
if(transcript) {
transactionref1.current.value=transcript;
 }
 }
const settransactionref=(id)=> {
if(transcript) {
transactionrefref.current.value=transcript;
 }
 }
const setsubledger=(id)=> {
if(transcript) {
subledgerref.current.value=transcript;
 }
 }
const settype=(id)=> {
if(transcript) {
typeref.current.value=transcript;
 }
 }
const setstudent=(id)=> {
if(transcript) {
studentref.current.value=transcript;
 }
 }
const setregno=(id)=> {
if(transcript) {
regnoref.current.value=transcript;
 }
 }
const setempid=(id)=> {
if(transcript) {
empidref.current.value=transcript;
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
const accgroup=accgroupref.current.value;
const account=accountref.current.value;
const acctype=acctyperef.current.value;
const transaction=transactionref1.current.value;
const transactionref=transactionrefref.current.value;
const subledger=subledgerref.current.value;
const cogs=cogsref.current.value;
const activitydate=activitydateref.current.value;
const amount=amountref.current.value;
const credit=creditref.current.value;
const debit=debitref.current.value;
const type=typeref.current.value;
const student=studentref.current.value;
const regno=regnoref.current.value;
const empid=empidref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createmjournal2byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
accgroup:accgroup,
account:account,
acctype:acctype,
transaction:transaction,
transactionref:transactionref,
subledger:subledger,
cogs:cogs,
activitydate:activitydate,
amount:amount,
credit:credit,
debit:debit,
type:type,
student:student,
regno:regno,
empid:empid,

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

       <button onClick={setaccgroup}>Set Account group</button>
 <button onClick={setaccount}>Set Account</button>
 <button onClick={settransaction}>Set Transaction</button>
 <button onClick={settransactionref}>Set Reference if any</button>
 <button onClick={setsubledger}>Set Sub ledger</button>
 <button onClick={settype}>Set Type</button>
 <button onClick={setstudent}>Set Student</button>
 <button onClick={setregno}>Set Reg no</button>
 <button onClick={setempid}>Set Employee id</button>


      <br /><br />

    <InputLabel id="year">Financial year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2025-26">2025-26</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
</Select>
<br /><br />

<p>Account group</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={accgroupref} /><br /><br />

<p>Account</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={accountref} /><br /><br />

<InputLabel id="acctype">Account type</InputLabel><Select labelId="acctype"
id="acctype"
inputRef={acctyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Asset">Asset</MenuItem>
<MenuItem value="Liability">Liability</MenuItem>
<MenuItem value="Income">Income</MenuItem>
<MenuItem value="Expense">Expense</MenuItem>
<MenuItem value="Capital">Capital</MenuItem>
</Select>
<br /><br />

<p>Transaction</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={transactionref1} /><br /><br />

<p>Reference if any</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={transactionrefref} /><br /><br />

<p>Sub ledger</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={subledgerref} /><br /><br />

<InputLabel id="cogs">Cost of goods sold</InputLabel><Select labelId="cogs"
id="cogs"
inputRef={cogsref}
sx={{ width: '100%'}}
>
<MenuItem value="Yes">Yes</MenuItem>
<MenuItem value="No">No</MenuItem>
</Select>
<br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Ativity date" inputRef={activitydateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<p>Credit</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={creditref} /><br /><br />

<p>Debit</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={debitref} /><br /><br />

<p>Type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={typeref} /><br /><br />

<p>Student</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={studentref} /><br /><br />

<p>Reg no</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={regnoref} /><br /><br />

<p>Employee id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={empidref} /><br /><br />


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
