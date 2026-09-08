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
    const editionidref=useRef();
const authorref=useRef();
const institutionref=useRef();
const articleref=useRef();
const descriptionref=useRef();
const abstractlinkref=useRef();
const articlelinkref=useRef();
const pubstatusref=useRef();
const authortyperef=useRef();
const submitdateref=useRef();

const editionid=global1.editionid;


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

      const seteditionid=(id)=> {
if(transcript) {
editionidref.current.value=transcript;
 }
 }
const setauthor=(id)=> {
if(transcript) {
authorref.current.value=transcript;
 }
 }
const setinstitution=(id)=> {
if(transcript) {
institutionref.current.value=transcript;
 }
 }
const setarticle=(id)=> {
if(transcript) {
articleref.current.value=transcript;
 }
 }
const setdescription=(id)=> {
if(transcript) {
descriptionref.current.value=transcript;
 }
 }
const setabstractlink=(id)=> {
if(transcript) {
abstractlinkref.current.value=transcript;
 }
 }
const setarticlelink=(id)=> {
if(transcript) {
articlelinkref.current.value=transcript;
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

// const editionid=editionidref.current.value;
const author=authorref.current.value;
const institution=institutionref.current.value;
const article=articleref.current.value;
const description=descriptionref.current.value;
const abstractlink=abstractlinkref.current.value;
const articlelink=articlelinkref.current.value;
// const pubstatus=pubstatusref.current.value;
const authortype=authortyperef.current.value;
// const submitdate=submitdateref.current.value;

const pubstatus='Submitted';
const submitdate=new Date();


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createlpubarticlesbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           editionid:editionid,
author:author,
institution:institution,
article:article,
description:description,
abstractlink:abstractlink,
articlelink:articlelink,
pubstatus:pubstatus,
authortype:authortype,
submitdate:submitdate,

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

       <button onClick={seteditionid}>Set Edition id</button>
 <button onClick={setauthor}>Set Author</button>
 <button onClick={setinstitution}>Set Institution</button>
 <button onClick={setarticle}>Set Article</button>
 <button onClick={setdescription}>Set Description</button>
 <button onClick={setabstractlink}>Set Abstract link</button>
 <button onClick={setarticlelink}>Set Article link</button>


      <br /><br />

    {/* <p>Edition id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={editionidref} /><br /><br /> */}

<p>Author</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={authorref} /><br /><br />

<p>Institution</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={institutionref} /><br /><br />

<p>Article</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={articleref} /><br /><br />

<p>Description</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={descriptionref} /><br /><br />

<p>Abstract link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={abstractlinkref} /><br /><br />

<p>Article link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={articlelinkref} /><br /><br />

{/* <InputLabel id="pubstatus">Publication status</InputLabel><Select labelId="pubstatus"
id="pubstatus"
inputRef={pubstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Accepted">Accepted</MenuItem>
<MenuItem value="Published">Published</MenuItem>
<MenuItem value="Not accepted">Not accepted</MenuItem>
</Select>
<br /><br /> */}

<InputLabel id="authortype">Author type</InputLabel><Select labelId="authortype"
id="authortype"
inputRef={authortyperef}
sx={{ width: '100%'}}
>
<MenuItem value="Same institution">Same institution</MenuItem>
<MenuItem value="External">External</MenuItem>
</Select>
<br /><br />

{/* <LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="Submit date" inputRef={submitdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br /> */}


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
