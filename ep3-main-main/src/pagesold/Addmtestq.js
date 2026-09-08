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

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import S3 from 'react-aws-s3';
window.Buffer = window.Buffer || require("buffer").Buffer;





function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser, fetchViewPage }) {
    const testidref=useRef();
const questionref=useRef();
const typeref=useRef();
const imagelinkref=useRef();
const videolinkref=useRef();
const doclinkref=useRef();
const coref=useRef();
const poref=useRef();
const moduleref=useRef();

const [open1, setOpen1] = React.useState(false);

const [selectedImage, setSelectedImage] = useState(null);
const [selectedFile, setSelectedFile] = useState();

const username=global1.username;
const password=global1.password;
const region=global1.region;
const bucket=global1.bucket;

const config = {
  bucketName: bucket,
  // dirName: 'media', /* optional */
  // region: 'us-east-2',
  region: region,
  accessKeyId: username,
  secretAccessKey: password,
  // s3Url: 'https:/your-custom-s3-url.com/', /* optional */
}

const ReactS3Client = new S3(config);


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

    const testid=global1.testid;
    const year=global1.lmsyear;
    const coursecode=global1.faccoursecode;

    const regno=global1.regno;

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

      const settestid=(id)=> {
if(transcript) {
testidref.current.value=transcript;
 }
 }
const setquestion=(id)=> {
if(transcript) {
questionref.current.value=transcript;
 }
 }
const setimagelink=(id)=> {
if(transcript) {
imagelinkref.current.value=transcript;
 }
 }
const setvideolink=(id)=> {
if(transcript) {
videolinkref.current.value=transcript;
 }
 }
const setdoclink=(id)=> {
if(transcript) {
doclinkref.current.value=transcript;
 }
 }
const setco=(id)=> {
if(transcript) {
coref.current.value=transcript;
 }
 }
const setpo=(id)=> {
if(transcript) {
poref.current.value=transcript;
 }
 }
const setmodule=(id)=> {
if(transcript) {
moduleref.current.value=transcript;
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

//const testid=testidref.current.value;
const question=questionref.current.value;
const type=typeref.current.value;
const imagelink=imagelinkref.current.value;
const videolink=videolinkref.current.value;
const doclink=doclinkref.current.value;
const co=coref.current.value;
const po=poref.current.value;
const module=moduleref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createtestqbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           testid:testid,
question:question,
type:type,
imagelink:imagelink,
videolink:videolink,
doclink:doclink,
co:co,
po:po,
module:module,

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

const handleImageUpload = (event) => {
  const image = event.target.files[0];
  setSelectedImage(URL.createObjectURL(image));
  setSelectedFile(event.target.files[0]);
};

const submit1 =  () => {

  if(!selectedImage) {
    alert('Please select image');
    return;
  }

  if(!username) {
    alert('Please select AWS config under Settings - AWS config');
    return;
  }

  setOpen1(true);
  

  var dt1=new Date();
  var month=dt1.getMonth() + 1;
  //var dt2=dt1.getMonth().toString() + dt1.getFullYear().toString() + dt1.getDay().toString() + dt1.getMinutes().toString() + dt1.getSeconds();
  var dt2=month + '-' + dt1.getFullYear().toString() + '-' + dt1.getDate().toString() + '-' + dt1.getMinutes().toString() + dt1.getSeconds();
  const newFileName = dt2.toString() + '-' + selectedFile.name;
  ReactS3Client
.uploadFile(selectedFile, newFileName)
.then(data => {

imagelinkref.current.value=data.location;
  
  alert('File uploaded to ' + data.location);
  setOpen1(false);

})
.catch(err => {
alert(err);
setOpen1(false);
})
//alert('ok');
}




  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
  

      <DialogTitle>Add data</DialogTitle>
      <DialogContent>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>

       {/* <button onClick={settestid}>Set Test id</button> */}
 <button onClick={setquestion}>Set Question</button>
 <button onClick={setimagelink}>Set Image link</button>
 <button onClick={setvideolink}>Set Video link</button>
 <button onClick={setdoclink}>Set Document link</button>
 <button onClick={setco}>Set CO</button>
 <button onClick={setpo}>Set PO</button>
 <button onClick={setmodule}>Set Module</button>


      <br /><br />


<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open1}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>

    {/* <p>Test id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={testidref} /><br /><br /> */}

<p>Question</p>
<TextField id="outlined-basic" multiline  type="text" sx={{ width: "100%"}} label="" rows={4}  variant="outlined" inputRef={questionref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="MCQ">MCQ</MenuItem>
<MenuItem value="Descriptive">Descriptive</MenuItem>
</Select>
<br /><br />

<p>Image link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={imagelinkref} /><br /><br />

<div style={{ width: 600}}>
<table width="400">
   
      <tr>
      <td>Select image</td>
      <td width="20px"></td>
      <td>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      </td>
      <td width="20px"></td>
      <td>
      <Button onClick={submit1}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px' }}
           >
             Upload image
           </Button>
      </td>
    </tr>
  </table>
  </div>
 <br />
 <div style={{ width: 330}}></div>
 <br /><br />

<p>Video link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={videolinkref} /><br /><br />

<p>Document link</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={doclinkref} /><br /><br />

<p>CO</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coref} /><br /><br />

<p>PO</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={poref} /><br /><br />

<p>Module</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={moduleref} /><br /><br />


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
