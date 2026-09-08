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
const accountingref=useRef();
const amountref=useRef();
const natureref=useRef();
const purposeref=useRef();
const departmentref=useRef();
const bankref=useRef();
const ledgerrefref=useRef();
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

      const setaccounting=(id)=> {
if(transcript) {
accountingref.current.value=transcript;
 }
 }
const setdepartment=(id)=> {
if(transcript) {
departmentref.current.value=transcript;
 }
 }
const setbank=(id)=> {
if(transcript) {
bankref.current.value=transcript;
 }
 }
const setledgerref=(id)=> {
if(transcript) {
ledgerrefref.current.value=transcript;
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
const accounting=accountingref.current.value;
const amount=amountref.current.value;
const nature=natureref.current.value;
const purpose=purposeref.current.value;
const department=departmentref.current.value;
const bank=bankref.current.value;
const ledgerref=ledgerrefref.current.value;
const type=typeref.current.value;
const level=levelref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createbtrialbbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
accounting:accounting,
amount:amount,
nature:nature,
purpose:purpose,
department:department,
bank:bank,
ledgerref:ledgerref,
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

       <button onClick={setaccounting}>Set Account</button>
 <button onClick={setdepartment}>Set Department</button>
 <button onClick={setbank}>Set Bank</button>
 <button onClick={setledgerref}>Set Ledger ref</button>


      <br /><br />

    <InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2017-18">2017-18</MenuItem>
<MenuItem value="2018-19">2018-19</MenuItem>
<MenuItem value="2019-20">2019-20</MenuItem>
<MenuItem value="2020-21">2020-21</MenuItem>
<MenuItem value="2021-22">2021-22</MenuItem>
<MenuItem value="2022-23">2022-23</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2025-26">2025-26</MenuItem>
</Select>
<br /><br />

<p>Account</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={accountingref} /><br /><br />

<p>Amount</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={amountref} /><br /><br />

<InputLabel id="nature">Nature</InputLabel><Select labelId="nature"
id="nature"
inputRef={natureref}
sx={{ width: '100%'}}
>
<MenuItem value="Own trust">Own trust</MenuItem>
<MenuItem value="Other">Other</MenuItem>
</Select>
<br /><br />

<InputLabel id="purpose">Purpose</InputLabel><Select labelId="purpose"
id="purpose"
inputRef={purposeref}
sx={{ width: '100%'}}
>
<MenuItem value="Scholarship">Scholarship</MenuItem>
<MenuItem value="Fees">Fees</MenuItem>
<MenuItem value="Seed money">Seed money</MenuItem>
<MenuItem value="Travel or Membership reimbursement">Travel or Membership reimbursement</MenuItem>
<MenuItem value="Infrastructure grant">Infrastructure grant</MenuItem>
<MenuItem value="Project grant">Project grant</MenuItem>
<MenuItem value="Consultancy fees">Consultancy fees</MenuItem>
<MenuItem value="Field trip">Field trip</MenuItem>
<MenuItem value="Project equipment from grant">Project equipment from grant</MenuItem>
<MenuItem value="Project equipment outside grant">Project equipment outside grant</MenuItem>
<MenuItem value="ICT">ICT</MenuItem>
<MenuItem value="Internet">Internet</MenuItem>
<MenuItem value="Books">Books</MenuItem>
<MenuItem value="Journal">Journal</MenuItem>
<MenuItem value="Alumni">Alumni</MenuItem>
<MenuItem value="Others">Others</MenuItem>
</Select>
<br /><br />

<p>Department</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={departmentref} /><br /><br />

<p>Bank</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bankref} /><br /><br />

<p>Ledger ref</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={ledgerrefref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="Income">Income</MenuItem>
<MenuItem value="Expense">Expense</MenuItem>
</Select>
<br /><br />

<InputLabel id="level">Level</InputLabel><Select labelId="level"
id="level"
inputRef={levelref}
sx={{ width: '100%'}}
>
<MenuItem value="Institution account">Institution account</MenuItem>
<MenuItem value="External account">External account</MenuItem>
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
