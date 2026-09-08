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


  const searchapi = async (rownumber,name,email,password,phone,maritalStatus,bloodGroup,dateOfBirth,address,city,state,country,pincode,parentName,parentPhoneNumber,parentAnnualIncome,parentOccupation,guardianName,guardianPhoneNumber,category,caste,reservedCategory,religion,previousQualifyingExamRegNo,programOptingFor,hostelRequired,transportationRequired,assignedto,year,capID,referenceNumber,appstatus,language1,language2,aadhaarNumber,tenthExamName,tenthBoardName,tenthMarks,tenthSchoolName,tenthYearOfPassing,tenthNoOfAttempts,twelfthExamName,twelfthBoardName,twelfthMarks,twelfthSchoolName,twelfthYearOfPassing,twelfthNoOfAttempts,institutionName,universityName,ugCGPA,ugYearOfPassing,ugNoOfChances,createdAt,updatedAt,status1) => {
       

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
    const response = await ep1.get('/api/v2/createappmodel2byfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
            name:name,
email:email,
password:password,
phone:phone,
maritalStatus:maritalStatus,
bloodGroup:bloodGroup,
dateOfBirth:dateOfBirth,
address:address,
city:city,
state:state,
country:country,
pincode:pincode,
parentName:parentName,
parentPhoneNumber:parentPhoneNumber,
parentAnnualIncome:parentAnnualIncome,
parentOccupation:parentOccupation,
guardianName:guardianName,
guardianPhoneNumber:guardianPhoneNumber,
category:category,
caste:caste,
reservedCategory:reservedCategory,
religion:religion,
previousQualifyingExamRegNo:previousQualifyingExamRegNo,
programOptingFor:programOptingFor,
hostelRequired:hostelRequired,
transportationRequired:transportationRequired,
assignedto:assignedto,
year:year,
capID:capID,
referenceNumber:referenceNumber,
appstatus:appstatus,
language1:language1,
language2:language2,
aadhaarNumber:aadhaarNumber,
tenthExamName:tenthExamName,
tenthBoardName:tenthBoardName,
tenthMarks:tenthMarks,
tenthSchoolName:tenthSchoolName,
tenthYearOfPassing:tenthYearOfPassing,
tenthNoOfAttempts:tenthNoOfAttempts,
twelfthExamName:twelfthExamName,
twelfthBoardName:twelfthBoardName,
twelfthMarks:twelfthMarks,
twelfthSchoolName:twelfthSchoolName,
twelfthYearOfPassing:twelfthYearOfPassing,
twelfthNoOfAttempts:twelfthNoOfAttempts,
institutionName:institutionName,
universityName:universityName,
ugCGPA:ugCGPA,
ugYearOfPassing:ugYearOfPassing,
ugNoOfChances:ugNoOfChances,
createdAt:createdAt,
updatedAt:updatedAt,
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
f1=f1 + 'row ' + rownumber + '-' + 'Name' + ',';
return;
}
if(!row[1]){
f1=f1 + 'row ' + rownumber + '-' + 'Email' + ',';
return;
}
if(!row[2]){
f1=f1 + 'row ' + rownumber + '-' + 'Password' + ',';
return;
}
if(!row[3] || isNaN(row[3])){
f1=f1 + 'row ' + rownumber + '-' + 'Phone' + ',';
return;
}
if(!row[4]){
f1=f1 + 'row ' + rownumber + '-' + 'Maritalstatus' + ',';
return;
}
if(!row[5]){
f1=f1 + 'row ' + rownumber + '-' + 'Bloodgroup' + ',';
return;
}
if(!row[6]){
f1=f1 + 'row ' + rownumber + '-' + 'Dateofbirth' + ',';
return;
}
if(!row[7]){
f1=f1 + 'row ' + rownumber + '-' + 'Address' + ',';
return;
}
if(!row[8]){
f1=f1 + 'row ' + rownumber + '-' + 'City' + ',';
return;
}
if(!row[9]){
f1=f1 + 'row ' + rownumber + '-' + 'State' + ',';
return;
}
if(!row[10]){
f1=f1 + 'row ' + rownumber + '-' + 'Country' + ',';
return;
}
if(!row[11]){
f1=f1 + 'row ' + rownumber + '-' + 'Pin code' + ',';
return;
}
if(!row[12]){
f1=f1 + 'row ' + rownumber + '-' + 'Parentname' + ',';
return;
}
if(!row[13] || isNaN(row[13])){
f1=f1 + 'row ' + rownumber + '-' + 'Parentphonenumber' + ',';
return;
}
if(!row[14]){
f1=f1 + 'row ' + rownumber + '-' + 'Parentannualincome' + ',';
return;
}
if(!row[15]){
f1=f1 + 'row ' + rownumber + '-' + 'Parentoccupation' + ',';
return;
}
if(!row[16]){
f1=f1 + 'row ' + rownumber + '-' + 'Guardianname' + ',';
return;
}
if(!row[17] || isNaN(row[17])){
f1=f1 + 'row ' + rownumber + '-' + 'Guardianphonenumber' + ',';
return;
}
if(!row[18]){
f1=f1 + 'row ' + rownumber + '-' + 'Category' + ',';
return;
}
if(!row[19]){
f1=f1 + 'row ' + rownumber + '-' + 'Caste' + ',';
return;
}
if(!row[20]){
f1=f1 + 'row ' + rownumber + '-' + 'Reservedcategory' + ',';
return;
}
if(!row[21]){
f1=f1 + 'row ' + rownumber + '-' + 'Religion' + ',';
return;
}
if(!row[22]){
f1=f1 + 'row ' + rownumber + '-' + 'Previousqualifyingexamregno' + ',';
return;
}
if(!row[23]){
f1=f1 + 'row ' + rownumber + '-' + 'Programoptingfor' + ',';
return;
}
if(!row[24]){
f1=f1 + 'row ' + rownumber + '-' + 'Hostelrequired' + ',';
return;
}
if(!row[25]){
f1=f1 + 'row ' + rownumber + '-' + 'Transportationrequired' + ',';
return;
}
if(!row[26]){
f1=f1 + 'row ' + rownumber + '-' + 'Assigned to' + ',';
return;
}
if(!row[27]){
f1=f1 + 'row ' + rownumber + '-' + 'Academic year' + ',';
return;
}
if(!row[28]){
f1=f1 + 'row ' + rownumber + '-' + 'Consultant Id' + ',';
return;
}
if(!row[29]){
f1=f1 + 'row ' + rownumber + '-' + 'Referencenumber' + ',';
return;
}
if(!row[30]){
f1=f1 + 'row ' + rownumber + '-' + 'Application status' + ',';
return;
}
if(!row[31]){
f1=f1 + 'row ' + rownumber + '-' + 'Language1' + ',';
return;
}
if(!row[32]){
f1=f1 + 'row ' + rownumber + '-' + 'Language2' + ',';
return;
}
if(!row[33] || isNaN(row[33])){
f1=f1 + 'row ' + rownumber + '-' + 'Aadhaarnumber' + ',';
return;
}
if(!row[34]){
f1=f1 + 'row ' + rownumber + '-' + 'Tenthexamname' + ',';
return;
}
if(!row[35]){
f1=f1 + 'row ' + rownumber + '-' + 'Tenthboardname' + ',';
return;
}
if(!row[36]){
f1=f1 + 'row ' + rownumber + '-' + 'Tenthmarks' + ',';
return;
}
if(!row[37]){
f1=f1 + 'row ' + rownumber + '-' + 'Tenthschoolname' + ',';
return;
}
if(!row[38] || isNaN(row[38])){
f1=f1 + 'row ' + rownumber + '-' + 'Tenthyearofpassing' + ',';
return;
}
if(!row[39] || isNaN(row[39])){
f1=f1 + 'row ' + rownumber + '-' + 'Tenthnoofattempts' + ',';
return;
}
if(!row[40]){
f1=f1 + 'row ' + rownumber + '-' + 'Twelfthexamname' + ',';
return;
}
if(!row[41]){
f1=f1 + 'row ' + rownumber + '-' + 'Twelfthboardname' + ',';
return;
}
if(!row[42]){
f1=f1 + 'row ' + rownumber + '-' + 'Twelfthmarks' + ',';
return;
}
if(!row[43]){
f1=f1 + 'row ' + rownumber + '-' + 'Twelfthschoolname' + ',';
return;
}
if(!row[44] || isNaN(row[44])){
f1=f1 + 'row ' + rownumber + '-' + 'Twelfthyearofpassing' + ',';
return;
}
if(!row[45] || isNaN(row[45])){
f1=f1 + 'row ' + rownumber + '-' + 'Twelfthnoofattempts' + ',';
return;
}
if(!row[46]){
f1=f1 + 'row ' + rownumber + '-' + 'Institutionname' + ',';
return;
}
if(!row[47]){
f1=f1 + 'row ' + rownumber + '-' + 'Universityname' + ',';
return;
}
if(!row[48] || isNaN(row[48])){
f1=f1 + 'row ' + rownumber + '-' + 'Ugcgpa' + ',';
return;
}
if(!row[49] || isNaN(row[49])){
f1=f1 + 'row ' + rownumber + '-' + 'Ugyearofpassing' + ',';
return;
}
if(!row[50] || isNaN(row[50])){
f1=f1 + 'row ' + rownumber + '-' + 'Ugnoofchances' + ',';
return;
}
if(!row[51]){
f1=f1 + 'row ' + rownumber + '-' + 'Createdat' + ',';
return;
}
if(!row[52]){
f1=f1 + 'row ' + rownumber + '-' + 'Updatedat' + ',';
return;
}


            searchapi(rownumber,row[0],row[1],row[2],row[3],row[4],row[5],row[6],row[7],row[8],row[9],row[10],row[11],row[12],row[13],row[14],row[15],row[16],row[17],row[18],row[19],row[20],row[21],row[22],row[23],row[24],row[25],row[26],row[27],row[28],row[29],row[30],row[31],row[32],row[33],row[34],row[35],row[36],row[37],row[38],row[39],row[40],row[41],row[42],row[43],row[44],row[45],row[46],row[47],row[48],row[49],row[50],row[51],row[52],status1);
           
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
      name,email,password,phone,maritalStatus,bloodGroup,dateOfBirth,address,city,state,country,pincode,parentName,parentPhoneNumber,parentAnnualIncome,parentOccupation,guardianName,guardianPhoneNumber,category,caste,reservedCategory,religion,previousQualifyingExamRegNo,programOptingFor,hostelRequired,transportationRequired,assignedto,year,capID,referenceNumber,appstatus,language1,language2,aadhaarNumber,tenthExamName,tenthBoardName,tenthMarks,tenthSchoolName,tenthYearOfPassing,tenthNoOfAttempts,twelfthExamName,twelfthBoardName,twelfthMarks,twelfthSchoolName,twelfthYearOfPassing,twelfthNoOfAttempts,institutionName,universityName,ugCGPA,ugYearOfPassing,ugNoOfChances,createdAt,updatedAt,status <br /><br />
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
