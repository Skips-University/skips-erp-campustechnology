// import React from 'react';
// import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Input, Select, MenuItem, InputLabel} from '@mui/material';
import ep1 from '../api/ep1';
import epai1 from '../api/epai';
import global1 from '../pages/global1';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Tesseract from 'tesseract.js';

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser, fetchViewPage }) {
    const videoidref=useRef();
const coursecoderef=useRef();
const videoref=useRef();
const titleref=useRef();
const imageref=useRef();
const voicetextref=useRef();
const durationref=useRef();
const typeref=useRef();
const languageref=useRef();
const keywordsref=useRef();

const [open1, setOpen1] = React.useState(false);

const [selectedImage, setSelectedImage] = useState(null);


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;

    const videoid=global1.videoid;
    const coursecode=global1.faccoursecode;

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

// const videoid=videoidref.current.value;
// const coursecode=coursecoderef.current.value;
const video=videoref.current.value;
const title=titleref.current.value;
const image=imageref.current.value;
const voicetext=voicetextref.current.value;
const duration=durationref.current.value;
const type=typeref.current.value;
const language=languageref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createlmsvideoscbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           videoid:videoid,
coursecode:coursecode,
video:video,
title:title,
image:image,
voicetext:voicetext,
duration:duration,
type:type,
language:language,

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


const onButtonClickm = async(e, row) => {
    e.stopPropagation();


    const keywords=keywordsref.current.value;
    if(!keywords) {
      alert('Please enter keywords');
      return;
    }
    setOpen1(true);
    
    //alert('Please wait while document is generated');
   

    //do whatever you want with the row
    //alert(row._id);
    const response = await epai1.get('/api/v1/getresponse2', {
        params: {
           
            user: user,
            colid: colid,
            prompt:'Create a detailed tutorial on ' + keywords
        }

    });
    var backend= '<html><head><title>Sample content</title></head><body>'; 
    backend=backend + '<br /><br />';
    backend=backend + '<h5>Sample course content</h5><hr />';
    //alert(response.data.data.classes);
    //const a=response.data.data.classes;
    const aiarray=response.data.data.classes.split('\n');
    //console.log('Count ' + aiarray.length);


    voicetextref.current.value=response.data.data.classes;


  for(var i=0;i<aiarray.length; i++) {
      backend=backend + aiarray[i].toString() + '<br />';
  }

  backend=backend + '<br />';

  backend=backend + '<div id="google_translate_element"></div>\n';

  backend=backend + '<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>\n';

  backend=backend + '<script type="text/javascript">\n';
  backend=backend + 'function googleTranslateElementInit() {\n';
  backend=backend + "new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');\n";
  backend=backend + '}\n';
  backend = backend + '</script>\n';



               backend=backend + '</body></html>';

               setOpen1(false);

  const element = document.createElement("a");
  const file = new Blob([backend], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = "AI Video content sample" + ".html";
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
    //const a = await fetchViewPage();
};

const setcourse=(id)=> {
    if(transcript) {
    voicetextref.current.value=transcript;
     }
    }

    const handleImageUpload = (event) => {
      const image = event.target.files[0];
      setSelectedImage(URL.createObjectURL(image));
    };

    const processimage=async()=> {
    
      if(!selectedImage) {
        alert('Please select image');
        return;
      }
      if (selectedImage) {
        setOpen1(true);
        const result = await Tesseract.recognize(selectedImage);
        keywordsref.current.value=result.data.text;
        setOpen1(false);
      //  //alert(result.data.text);
      //  checktext1(result.data.text,itemstocheck);
      }
  
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


      <br /><br />

      <button onClick={setcourse}>Set Voiceiover</button>

      

      <br /><br />


<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open1}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>



     

{/* 
    <p>Video id</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={videoidref} /><br /><br />

<p>Course code</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={coursecoderef} /><br /><br /> */}

<p>Video link</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={videoref} /><br /><br />

<p>Title</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={titleref} /><br /><br />

<p>Image link</p>
<TextField id="outlined-basic"  type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={imageref} /><br /><br />


<p>Generate keywords from image</p>
<div style={{ width: 400}}>
<table width="400">
    {/* <tr>
      <td>
        Select pdf
      </td>
      <td width="20px"></td>
      <td>
      <input type="file" accept="application/pdf" onChange={extractText1} />
      </td>
      </tr> */}
      <tr>
      <td>Select image</td>
      <td width="20px"></td>
      <td>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      </td>
    </tr>
  </table>
  </div>
 <br />
  <Button onClick={processimage}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px' }}
           >
             Generate keywords
           </Button>

           <br /><br />

<p>Keywords to generate sample voiceover text</p>
<TextField id="outlined-basic" multiline  type="String" sx={{ width: "100%"}} label="" rows={6}  variant="outlined" inputRef={keywordsref} /><br /><br />

<Button onClick={onButtonClickm}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px' }}
           >
             Generate voiceover
           </Button>

           <br /><br />
<p>Voiceover text (For best result, keep it less than 30 words per slide)</p>
<TextField id="outlined-basic"  multiline rows={12} type="String" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={voicetextref} /><br /><br />

<p>Duration in seconds</p>
<TextField id="outlined-basic"  type="Number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={durationref} /><br /><br />

<InputLabel id="type">Type</InputLabel><Select labelId="type"
id="type"
inputRef={typeref}
sx={{ width: '100%'}}
>
<MenuItem value="text">text</MenuItem>
<MenuItem value="video">video</MenuItem>
<MenuItem value="image">image</MenuItem>
<MenuItem value="text-image">text-image</MenuItem>
</Select>
<br /><br />

<InputLabel id="language">Language</InputLabel><Select labelId="language"
id="language"
inputRef={languageref}
sx={{ width: '100%'}}
>
<MenuItem value="English">English</MenuItem>
<MenuItem value="Hindi">Hindi</MenuItem>
<MenuItem value="Regional">Regional</MenuItem>
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
