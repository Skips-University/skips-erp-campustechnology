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
import { FileDrop } from 'react-file-drop';
import readXlsxFile from 'read-excel-file';

import classes2 from './fileupload.module.css';

function AddUserModal({ open, handleClose, handleInputChange, handleAddUser, newUser }) {
    const yearref=useRef();
const examref=useRef();
const examcoderef=useRef();
const fromdateref=useRef();
const todateref=useRef();
const semesterref=useRef();

const styles = { border: '1px solid black', width: '90%', height: 300,  color: 'black', padding: 20 };

const [selectedFile, setSelectedFile] = useState();
const [isFilePicked, setIsFilePicked] = useState(false);
const [errorlist, setErrorlist] = useState();

const [link, setLink] = useState();


    const colid=global1.colid;
    const user=global1.user;
    const name=global1.name;
    const token=global1.token;


    var f1='';

    const changeHandler1 = async (files,event) => {
        alert(files[0]);
        // const topic=topicref.current.value;
        // if(topic=="kumropatash") {
        // } else {
        //     alert('Please enter valid password');
        //     return;
        // }
        
      
        setSelectedFile(files[0]);
        setIsFilePicked(true);
        var status1='';
        var rownumber=1;
        const res=await readXlsxFile(files[0]).then((rows) => {
            rows.shift();
            rows.forEach((row) => {
                rownumber=rownumber + 1;
                rownumber=rownumber + 1;
                if(!row[0]){
f1=f1 + 'row ' + rownumber + '-' + 'Exam' + ',';
return;
}
if(!row[1]){
f1=f1 + 'row ' + rownumber + '-' + 'Question' + ',';
return;
}
if(!row[2]){
f1=f1 + 'row ' + rownumber + '-' + 'Option' + ',';
return;
}
if(!row[3] || isNaN(row[3])){
f1=f1 + 'row ' + rownumber + '-' + 'Score' + ',';
return;
}
if(!row[4]){
f1=f1 + 'row ' + rownumber + '-' + 'Student' + ',';
return;
}
if(!row[5]){
f1=f1 + 'row ' + rownumber + '-' + 'Reg no' + ',';
return;
}
if(!row[6]){
f1=f1 + 'row ' + rownumber + '-' + 'Student col id' + ',';
return;
}

                searchapi(rownumber,row[0],row[1],row[2],row[3],row[4],row[5],status1);
               
            });

        })
        alert('Task will be completed in thirty minutes');
        setLink(f1);

    };


  const searchapi = async (rownumber,hcode,bedno,bedtype,amount,patient,puser,admid,type,status1) => {
       

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

// const year=yearref.current.value;
// const exam=examref.current.value;
// const examcode=examcoderef.current.value;
// const fromdate=fromdateref.current.value;
// const todate=todateref.current.value;
// const semester=semesterref.current.value;


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createhdubedbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
            hcode:hcode,
bedno:bedno,
bedtype:bedtype,
amount:amount,
patient:patient,
puser:puser,
admid:admid,
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

    //handleClose();
   
};

const onfilechange=async (event)=> {
    setSelectedFile(event.target.files[0]);
    //alert('ok');

   
    

}

const processfile=async()=> {

    var status1='';
    var rownumber=1;
    const res=await readXlsxFile(selectedFile).then((rows) => {
        rows.shift();
        rows.forEach((row) => {
            rownumber=rownumber + 1;
            //rownumber=rownumber + 1;
            if(!row[0]){
f1=f1 + 'row ' + rownumber + '-' + 'Hospital code' + ',';
return;
}
if(!row[1]){
f1=f1 + 'row ' + rownumber + '-' + 'Bed no' + ',';
return;
}
if(!row[2]){
f1=f1 + 'row ' + rownumber + '-' + 'Bed type' + ',';
return;
}
if(!row[3] || isNaN(row[3])){
f1=f1 + 'row ' + rownumber + '-' + 'Amount' + ',';
return;
}
if(!row[4]){
f1=f1 + 'row ' + rownumber + '-' + 'Patient' + ',';
return;
}
if(!row[5]){
f1=f1 + 'row ' + rownumber + '-' + 'Patient username' + ',';
return;
}
if(!row[6]){
f1=f1 + 'row ' + rownumber + '-' + 'Admission id' + ',';
return;
}
if(!row[7]){
f1=f1 + 'row ' + rownumber + '-' + 'Type' + ',';
return;
}


            searchapi(rownumber,row[0],row[1],row[2],row[3],row[4],row[5],row[6],row[7],status1);
           
        });

    })

    setLink(f1);

    //handleClose();
    alert('Thank you. Valid rows will be updated in thirty minutes. Please click on Refresh to view data.');
    //handleClose();

}

const getfiledata=()=> {
    return (
    <div>
        {selectedFile.filename}
        
    </div>
    );

}




  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
  

      <DialogTitle>Add data</DialogTitle>
      <DialogContent>


      Please upload excel file with data in proper format with following columns in order.<br /><br />
      hcode,bedno,bedtype,amount,patient,puser,admid,type,status <br /><br />
                        Do not add any extra column or rows. Date must be in mm/dd/yyyy format. Value of status must always be Submitted.
            <br />

            <input
                        type="file"
                        onChange={onfilechange}
                    />
<br /><br />
{getfiledata}
<br /><br />

{/* <div style={styles}>
        <FileDrop className={classes2.FileDrop}
          onFrameDragEnter={(event) => console.log('onFrameDragEnter', event)}
          onFrameDragLeave={(event) => console.log('onFrameDragLeave', event)}
          onFrameDrop={(event) => console.log('onFrameDrop', event)}
          onDragOver={(event) => console.log('onDragOver', event)}
          onDragLeave={(event) => console.log('onDragLeave', event)}
          onDrop={(files, event) => changeHandler1(files, event)}
        >
          Drop some files here!
        </FileDrop>
      </div>
      <br /><br /> */}

      <p>Error list</p>
{link}





    {/* <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Academic year"  variant="outlined" inputRef={yearref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Examination"  variant="outlined" inputRef={examref} /><br /><br />

<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Exam code"  variant="outlined" inputRef={examcoderef} /><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="From date" inputRef={fromdateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label="To date" inputRef={todateref} sx={{ width: "100%"}} /></LocalizationProvider><br /><br />

<InputLabel id="semester">Semester</InputLabel><Select labelId="semester"
id="semester"
inputRef={semesterref}
sx={{ width: '100%'}}
>
<MenuItem value="Even">Even</MenuItem>
<MenuItem value="Odd">Odd</MenuItem>
</Select>
<br /><br /> */}


      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        <Button onClick={processfile} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddUserModal;
