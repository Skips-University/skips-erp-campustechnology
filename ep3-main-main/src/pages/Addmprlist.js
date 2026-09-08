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
    const templateref=useRef();
const templateidref=useRef();
const categoryref=useRef();
const facultyref=useRef();
const facultyidref=useRef();
const approveremailref=useRef();
const levelref=useRef();
const finalstatusref=useRef();
const typeref=useRef();


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

      const settemplate=(id)=> {
if(transcript) {
templateref.current.value=transcript;
 }
 }
const settemplateid=(id)=> {
if(transcript) {
templateidref.current.value=transcript;
 }
 }
const setcategory=(id)=> {
if(transcript) {
categoryref.current.value=transcript;
 }
 }
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
const setapproveremail=(id)=> {
if(transcript) {
approveremailref.current.value=transcript;
 }
 }
const setfinalstatus=(id)=> {
if(transcript) {
finalstatusref.current.value=transcript;
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

// const template=templateref.current.value;
// const templateid=templateidref.current.value;
const category=categoryref.current.value;
// const faculty=facultyref.current.value;
// const facultyid=facultyidref.current.value;
// const approveremail=approveremailref.current.value;
// const level=levelref.current.value;
// const finalstatus=finalstatusref.current.value;
const type=typeref.current.value;

const template=global1.prtemplate;
const templateid=global1.prtemplateid;
const faculty=global1.name;
const facultyid=global1.user;
const level = 0;
const finalstatus='Pending';
const approveremail='';


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createprlistbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           template:template,
templateid:templateid,
category:category,
faculty:faculty,
facultyid:facultyid,
approveremail:approveremail,
level:level,
finalstatus:finalstatus,
type:type,

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

       <button onClick={settemplate}>Set Template</button>
 <button onClick={settemplateid}>Set Template id</button>
 <button onClick={setcategory}>Set Category</button>
 <button onClick={setfaculty}>Set Faculty</button>
 <button onClick={setfacultyid}>Set Faculty id</button>
 <button onClick={setapproveremail}>Set Approver email</button>
 <button onClick={setfinalstatus}>Set Final status</button>
 <button onClick={settype}>Set Type</button>


      <br /><br />

    {/* <p>Template</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={templateref} /><br /><br />

<p>Template id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={templateidref} /><br /><br /> */}

<p>Category</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={categoryref} /><br /><br />

{/* <p>Faculty</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyref} /><br /><br />

<p>Faculty id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={facultyidref} /><br /><br /> */}

{/* <p>Approver email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={approveremailref} /><br /><br />

<p>Level</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={levelref} /><br /><br />

<p>Final status</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={finalstatusref} /><br /><br /> */}

<p>Type</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={typeref} /><br /><br />


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
