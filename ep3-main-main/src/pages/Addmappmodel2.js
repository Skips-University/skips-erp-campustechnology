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
    const nameref=useRef();
const emailref=useRef();
const passwordref=useRef();
const phoneref=useRef();
const maritalStatusref=useRef();
const bloodGroupref=useRef();
const dateOfBirthref=useRef();
const addressref=useRef();
const cityref=useRef();
const stateref=useRef();
const countryref=useRef();
const pincoderef=useRef();
const parentNameref=useRef();
const parentPhoneNumberref=useRef();
const parentAnnualIncomeref=useRef();
const parentOccupationref=useRef();
const guardianNameref=useRef();
const guardianPhoneNumberref=useRef();
const categoryref=useRef();
const casteref=useRef();
const reservedCategoryref=useRef();
const religionref=useRef();
const previousQualifyingExamRegNoref=useRef();
const programOptingForref=useRef();
const hostelRequiredref=useRef();
const transportationRequiredref=useRef();
const assignedtoref=useRef();
const yearref=useRef();
const capIDref=useRef();
const referenceNumberref=useRef();
const appstatusref=useRef();
const language1ref=useRef();
const language2ref=useRef();
const aadhaarNumberref=useRef();
const tenthExamNameref=useRef();
const tenthBoardNameref=useRef();
const tenthMarksref=useRef();
const tenthSchoolNameref=useRef();
const tenthYearOfPassingref=useRef();
const tenthNoOfAttemptsref=useRef();
const twelfthExamNameref=useRef();
const twelfthBoardNameref=useRef();
const twelfthMarksref=useRef();
const twelfthSchoolNameref=useRef();
const twelfthYearOfPassingref=useRef();
const twelfthNoOfAttemptsref=useRef();
const institutionNameref=useRef();
const universityNameref=useRef();
const ugCGPAref=useRef();
const ugYearOfPassingref=useRef();
const ugNoOfChancesref=useRef();
const createdAtref=useRef();
const updatedAtref=useRef();


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

      const setname=(id)=> {
if(transcript) {
nameref.current.value=transcript;
 }
 }
const setemail=(id)=> {
if(transcript) {
emailref.current.value=transcript;
 }
 }
const setpassword=(id)=> {
if(transcript) {
passwordref.current.value=transcript;
 }
 }
const setmaritalStatus=(id)=> {
if(transcript) {
maritalStatusref.current.value=transcript;
 }
 }
const setbloodGroup=(id)=> {
if(transcript) {
bloodGroupref.current.value=transcript;
 }
 }
const setdateOfBirth=(id)=> {
if(transcript) {
dateOfBirthref.current.value=transcript;
 }
 }
const setaddress=(id)=> {
if(transcript) {
addressref.current.value=transcript;
 }
 }
const setcity=(id)=> {
if(transcript) {
cityref.current.value=transcript;
 }
 }
const setstate=(id)=> {
if(transcript) {
stateref.current.value=transcript;
 }
 }
const setcountry=(id)=> {
if(transcript) {
countryref.current.value=transcript;
 }
 }
const setpincode=(id)=> {
if(transcript) {
pincoderef.current.value=transcript;
 }
 }
const setparentName=(id)=> {
if(transcript) {
parentNameref.current.value=transcript;
 }
 }
const setparentAnnualIncome=(id)=> {
if(transcript) {
parentAnnualIncomeref.current.value=transcript;
 }
 }
const setparentOccupation=(id)=> {
if(transcript) {
parentOccupationref.current.value=transcript;
 }
 }
const setguardianName=(id)=> {
if(transcript) {
guardianNameref.current.value=transcript;
 }
 }
const setcaste=(id)=> {
if(transcript) {
casteref.current.value=transcript;
 }
 }
const setpreviousQualifyingExamRegNo=(id)=> {
if(transcript) {
previousQualifyingExamRegNoref.current.value=transcript;
 }
 }
const setprogramOptingFor=(id)=> {
if(transcript) {
programOptingForref.current.value=transcript;
 }
 }
const sethostelRequired=(id)=> {
if(transcript) {
hostelRequiredref.current.value=transcript;
 }
 }
const settransportationRequired=(id)=> {
if(transcript) {
transportationRequiredref.current.value=transcript;
 }
 }
const setassignedto=(id)=> {
if(transcript) {
assignedtoref.current.value=transcript;
 }
 }
const setcapID=(id)=> {
if(transcript) {
capIDref.current.value=transcript;
 }
 }
const setreferenceNumber=(id)=> {
if(transcript) {
referenceNumberref.current.value=transcript;
 }
 }
const settenthExamName=(id)=> {
if(transcript) {
tenthExamNameref.current.value=transcript;
 }
 }
const settenthBoardName=(id)=> {
if(transcript) {
tenthBoardNameref.current.value=transcript;
 }
 }
const settenthMarks=(id)=> {
if(transcript) {
tenthMarksref.current.value=transcript;
 }
 }
const settenthSchoolName=(id)=> {
if(transcript) {
tenthSchoolNameref.current.value=transcript;
 }
 }
const settwelfthExamName=(id)=> {
if(transcript) {
twelfthExamNameref.current.value=transcript;
 }
 }
const settwelfthBoardName=(id)=> {
if(transcript) {
twelfthBoardNameref.current.value=transcript;
 }
 }
const settwelfthMarks=(id)=> {
if(transcript) {
twelfthMarksref.current.value=transcript;
 }
 }
const settwelfthSchoolName=(id)=> {
if(transcript) {
twelfthSchoolNameref.current.value=transcript;
 }
 }
const setinstitutionName=(id)=> {
if(transcript) {
institutionNameref.current.value=transcript;
 }
 }
const setuniversityName=(id)=> {
if(transcript) {
universityNameref.current.value=transcript;
 }
 }
const setcreatedAt=(id)=> {
if(transcript) {
createdAtref.current.value=transcript;
 }
 }
const setupdatedAt=(id)=> {
if(transcript) {
updatedAtref.current.value=transcript;
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

const name=nameref.current.value;
const email=emailref.current.value;
const password=passwordref.current.value;
const phone=phoneref.current.value;
const maritalStatus=maritalStatusref.current.value;
const bloodGroup=bloodGroupref.current.value;
const dateOfBirth=dateOfBirthref.current.value;
const address=addressref.current.value;
const city=cityref.current.value;
const state=stateref.current.value;
const country=countryref.current.value;
const pincode=pincoderef.current.value;
const parentName=parentNameref.current.value;
const parentPhoneNumber=parentPhoneNumberref.current.value;
const parentAnnualIncome=parentAnnualIncomeref.current.value;
const parentOccupation=parentOccupationref.current.value;
const guardianName=guardianNameref.current.value;
const guardianPhoneNumber=guardianPhoneNumberref.current.value;
const category=categoryref.current.value;
const caste=casteref.current.value;
const reservedCategory=reservedCategoryref.current.value;
const religion=religionref.current.value;
const previousQualifyingExamRegNo=previousQualifyingExamRegNoref.current.value;
const programOptingFor=programOptingForref.current.value;
const hostelRequired=hostelRequiredref.current.value;
const transportationRequired=transportationRequiredref.current.value;
const assignedto=assignedtoref.current.value;
const year=yearref.current.value;
const capID=capIDref.current.value;
const referenceNumber=referenceNumberref.current.value;
const appstatus=appstatusref.current.value;
const language1=language1ref.current.value;
const language2=language2ref.current.value;
const aadhaarNumber=aadhaarNumberref.current.value;
const tenthExamName=tenthExamNameref.current.value;
const tenthBoardName=tenthBoardNameref.current.value;
const tenthMarks=tenthMarksref.current.value;
const tenthSchoolName=tenthSchoolNameref.current.value;
const tenthYearOfPassing=tenthYearOfPassingref.current.value;
const tenthNoOfAttempts=tenthNoOfAttemptsref.current.value;
const twelfthExamName=twelfthExamNameref.current.value;
const twelfthBoardName=twelfthBoardNameref.current.value;
const twelfthMarks=twelfthMarksref.current.value;
const twelfthSchoolName=twelfthSchoolNameref.current.value;
const twelfthYearOfPassing=twelfthYearOfPassingref.current.value;
const twelfthNoOfAttempts=twelfthNoOfAttemptsref.current.value;
const institutionName=institutionNameref.current.value;
const universityName=universityNameref.current.value;
const ugCGPA=ugCGPAref.current.value;
const ugYearOfPassing=ugYearOfPassingref.current.value;
const ugNoOfChances=ugNoOfChancesref.current.value;
const createdAt=createdAtref.current.value;
const updatedAt=updatedAtref.current.value;


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

       <button onClick={setname}>Set Name</button>
 <button onClick={setemail}>Set Email</button>
 <button onClick={setpassword}>Set Password</button>
 <button onClick={setmaritalStatus}>Set Maritalstatus</button>
 <button onClick={setbloodGroup}>Set Bloodgroup</button>
 <button onClick={setdateOfBirth}>Set Dateofbirth</button>
 <button onClick={setaddress}>Set Address</button>
 <button onClick={setcity}>Set City</button>
 <button onClick={setstate}>Set State</button>
 <button onClick={setcountry}>Set Country</button>
 <button onClick={setpincode}>Set Pin code</button>
 <button onClick={setparentName}>Set Parentname</button>
 <button onClick={setparentAnnualIncome}>Set Parentannualincome</button>
 <button onClick={setparentOccupation}>Set Parentoccupation</button>
 <button onClick={setguardianName}>Set Guardianname</button>
 <button onClick={setcaste}>Set Caste</button>
 <button onClick={setpreviousQualifyingExamRegNo}>Set Previousqualifyingexamregno</button>
 <button onClick={setprogramOptingFor}>Set Programoptingfor</button>
 <button onClick={sethostelRequired}>Set Hostelrequired</button>
 <button onClick={settransportationRequired}>Set Transportationrequired</button>
 <button onClick={setassignedto}>Set Assigned to</button>
 <button onClick={setcapID}>Set Consultant Id</button>
 <button onClick={setreferenceNumber}>Set Referencenumber</button>
 <button onClick={settenthExamName}>Set Tenthexamname</button>
 <button onClick={settenthBoardName}>Set Tenthboardname</button>
 <button onClick={settenthMarks}>Set Tenthmarks</button>
 <button onClick={settenthSchoolName}>Set Tenthschoolname</button>
 <button onClick={settwelfthExamName}>Set Twelfthexamname</button>
 <button onClick={settwelfthBoardName}>Set Twelfthboardname</button>
 <button onClick={settwelfthMarks}>Set Twelfthmarks</button>
 <button onClick={settwelfthSchoolName}>Set Twelfthschoolname</button>
 <button onClick={setinstitutionName}>Set Institutionname</button>
 <button onClick={setuniversityName}>Set Universityname</button>
 <button onClick={setcreatedAt}>Set Createdat</button>
 <button onClick={setupdatedAt}>Set Updatedat</button>


      <br /><br />

    <p>Name</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={nameref} /><br /><br />

<p>Email</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={emailref} /><br /><br />

<p>Password</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={passwordref} /><br /><br />

<p>Phone</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={phoneref} /><br /><br />

<p>Maritalstatus</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={maritalStatusref} /><br /><br />

<p>Bloodgroup</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={bloodGroupref} /><br /><br />

<p>Dateofbirth</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={dateOfBirthref} /><br /><br />

<p>Address</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={addressref} /><br /><br />

<p>City</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={cityref} /><br /><br />

<p>State</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={stateref} /><br /><br />

<p>Country</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={countryref} /><br /><br />

<p>Pin code</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={pincoderef} /><br /><br />

<p>Parentname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={parentNameref} /><br /><br />

<p>Parentphonenumber</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={parentPhoneNumberref} /><br /><br />

<p>Parentannualincome</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={parentAnnualIncomeref} /><br /><br />

<p>Parentoccupation</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={parentOccupationref} /><br /><br />

<p>Guardianname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={guardianNameref} /><br /><br />

<p>Guardianphonenumber</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={guardianPhoneNumberref} /><br /><br />

<InputLabel id="category">Category</InputLabel><Select labelId="category"
id="category"
inputRef={categoryref}
sx={{ width: '100%'}}
>
<MenuItem value="General">General</MenuItem>
<MenuItem value="SC">SC</MenuItem>
<MenuItem value="ST">ST</MenuItem>
<MenuItem value="OBC">OBC</MenuItem>
</Select>
<br /><br />

<p>Caste</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={casteref} /><br /><br />

<InputLabel id="reservedCategory">Reservedcategory</InputLabel><Select labelId="reservedCategory"
id="reservedCategory"
inputRef={reservedCategoryref}
sx={{ width: '100%'}}
>
<MenuItem value="Sports">Sports</MenuItem>
<MenuItem value="PH">PH</MenuItem>
<MenuItem value="Others">Others</MenuItem>
</Select>
<br /><br />

<InputLabel id="religion">Religion</InputLabel><Select labelId="religion"
id="religion"
inputRef={religionref}
sx={{ width: '100%'}}
>
<MenuItem value="Hindu">Hindu</MenuItem>
<MenuItem value="Muslim">Muslim</MenuItem>
<MenuItem value="Parsi">Parsi</MenuItem>
<MenuItem value="Christian">Christian</MenuItem>
<MenuItem value="Jain">Jain</MenuItem>
<MenuItem value="Others">Others</MenuItem>
</Select>
<br /><br />

<p>Previousqualifyingexamregno</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={previousQualifyingExamRegNoref} /><br /><br />

<p>Programoptingfor</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programOptingForref} /><br /><br />

<p>Hostelrequired</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={hostelRequiredref} /><br /><br />

<p>Transportationrequired</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={transportationRequiredref} /><br /><br />

<p>Assigned to</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={assignedtoref} /><br /><br />

<InputLabel id="year">Academic year</InputLabel><Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2025-26">2025-26</MenuItem>
<MenuItem value="2026-27">2026-27</MenuItem>
<MenuItem value="2027-28">2027-28</MenuItem>
</Select>
<br /><br />

<p>Consultant Id</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={capIDref} /><br /><br />

<p>Referencenumber</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={referenceNumberref} /><br /><br />

<InputLabel id="appstatus">Application status</InputLabel><Select labelId="appstatus"
id="appstatus"
inputRef={appstatusref}
sx={{ width: '100%'}}
>
<MenuItem value="Applied">Applied</MenuItem>
<MenuItem value="Selected">Selected</MenuItem>
</Select>
<br /><br />

<InputLabel id="language1">Language1</InputLabel><Select labelId="language1"
id="language1"
inputRef={language1ref}
sx={{ width: '100%'}}
>
<MenuItem value="English">English</MenuItem>
<MenuItem value="Hindi">Hindi</MenuItem>
<MenuItem value="Kannada">Kannada</MenuItem>
<MenuItem value="Tamil">Tamil</MenuItem>
<MenuItem value="Marathi">Marathi</MenuItem>
<MenuItem value="Bengali">Bengali</MenuItem>
<MenuItem value="Telugu">Telugu</MenuItem>
<MenuItem value="Malayalam">Malayalam</MenuItem>
<MenuItem value="Sindhi">Sindhi</MenuItem>
<MenuItem value="Gujrati">Gujrati</MenuItem>
<MenuItem value="Punjabi">Punjabi</MenuItem>
<MenuItem value="Hariyanvi">Hariyanvi</MenuItem>
<MenuItem value="Tulu">Tulu</MenuItem>
<MenuItem value="Nepali">Nepali</MenuItem>
</Select>
<br /><br />

<InputLabel id="language2">Language2</InputLabel><Select labelId="language2"
id="language2"
inputRef={language2ref}
sx={{ width: '100%'}}
>
<MenuItem value="English">English</MenuItem>
<MenuItem value="Hindi">Hindi</MenuItem>
<MenuItem value="Kannada">Kannada</MenuItem>
<MenuItem value="Tamil">Tamil</MenuItem>
<MenuItem value="Marathi">Marathi</MenuItem>
<MenuItem value="Bengali">Bengali</MenuItem>
<MenuItem value="Telugu">Telugu</MenuItem>
<MenuItem value="Malayalam">Malayalam</MenuItem>
<MenuItem value="Sindhi">Sindhi</MenuItem>
<MenuItem value="Gujrati">Gujrati</MenuItem>
<MenuItem value="Punjabi">Punjabi</MenuItem>
<MenuItem value="Hariyanvi">Hariyanvi</MenuItem>
<MenuItem value="Tulu">Tulu</MenuItem>
<MenuItem value="Nepali">Nepali</MenuItem>
</Select>
<br /><br />

<p>Aadhaarnumber</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={aadhaarNumberref} /><br /><br />

<p>Tenthexamname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={tenthExamNameref} /><br /><br />

<p>Tenthboardname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={tenthBoardNameref} /><br /><br />

<p>Tenthmarks</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={tenthMarksref} /><br /><br />

<p>Tenthschoolname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={tenthSchoolNameref} /><br /><br />

<p>Tenthyearofpassing</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={tenthYearOfPassingref} /><br /><br />

<p>Tenthnoofattempts</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={tenthNoOfAttemptsref} /><br /><br />

<p>Twelfthexamname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={twelfthExamNameref} /><br /><br />

<p>Twelfthboardname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={twelfthBoardNameref} /><br /><br />

<p>Twelfthmarks</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={twelfthMarksref} /><br /><br />

<p>Twelfthschoolname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={twelfthSchoolNameref} /><br /><br />

<p>Twelfthyearofpassing</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={twelfthYearOfPassingref} /><br /><br />

<p>Twelfthnoofattempts</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={twelfthNoOfAttemptsref} /><br /><br />

<p>Institutionname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={institutionNameref} /><br /><br />

<p>Universityname</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={universityNameref} /><br /><br />

<p>Ugcgpa</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={ugCGPAref} /><br /><br />

<p>Ugyearofpassing</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={ugYearOfPassingref} /><br /><br />

<p>Ugnoofchances</p>
<TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={ugNoOfChancesref} /><br /><br />

<p>Createdat</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={createdAtref} /><br /><br />

<p>Updatedat</p>
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={updatedAtref} /><br /><br />


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
