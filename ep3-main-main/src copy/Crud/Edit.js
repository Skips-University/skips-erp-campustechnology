import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Input, Select, MenuItem, InputLabel} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

function EditUserModal({ open, handleClose, handleInputChange, handleEditUser, selectedUser }) {
    // const nameRef = useRef();
    const coursecoderef = useRef();
    const coursetitleref = useRef();
    const coursetyperef = useRef();
    const yearref = useRef();
    const offeredtimesref = useRef();
    const durationref = useRef();
    const imagelinkref = useRef();
    const priceref = useRef();
    const categoryref = useRef();
    const departmentref = useRef();
    const coursehoursref = useRef();
    const totalstudentsref = useRef();
    const studentscompletedref = useRef();
    const dateaddedref = useRef();

    const [ctitle, setCtitle] = useState();
    
    //coursetitleref.current.value=global1.coursetitle;

    const fetchPract1 = async () => {
        const response = await ep1.get('/api/v1/addoncdocs', {
          params: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVtb0BjYW1wdXMudGVjaG5vbG9neSIsImNvbGlkIjoiMzAiLCJpYXQiOjE3MTY2MzA5NzQsImV4cCI6MTcxNzM1MDk3NH0.sfg5Ie0OCSc-hA6A4uv8AR8bfjuWiu1ILhHdqKIrxxc',
            colid: 30,
          }
        });
        // setRows(response.data.data.classes);
      };


    const searchapi = async () => {
        //const title=titleref.current.value;
        var coursetitle=coursetitleref.current.value;
        // if(!coursetitle) {
        //     coursetitle=global1.coursetitle;
        // }
        const coursecode=coursecoderef.current.value;
        const coursetype=coursetyperef.current.value;
        const year=yearref.current.value;
        const offeredtimes=offeredtimesref.current.value;
        const duration=durationref.current.value;
        const imagelink=imagelinkref.current.value;
        const price=priceref.current.value;
        const category=categoryref.current.value;
        const department=departmentref.current.value;
        const coursehours=coursehoursref.current.value;
        const totalstudents=totalstudentsref.current.value;
        const studentscompleted=studentscompletedref.current.value;
        const dateadded=dateaddedref.current.value;
         alert(coursetitle + ' - ' + dateadded);
         
    handleClose();
        
        //alert(department);
        //setLoading(true);
        // setIsuploading(true);
        // const response = await ep1.get('/api/v1/updateaddoncbyfac', {
        // params: {
        // id: selectedUser._id,
        // user: 'demo@campus.technology',
        // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVtb0BjYW1wdXMudGVjaG5vbG9neSIsImNvbGlkIjoiMzAiLCJpYXQiOjE3MTY3MDMyODEsImV4cCI6MTcxNzQyMzI4MX0.iYCySX06YHLadFFzslKMBiZCSUB3junXp9TQTngSVR8',
        // name: 'demo',
        // colid: 30,
        // coursetitle:coursetitle,
        // coursecode:coursecode,
        // coursetype:coursetype,
        // year:year,
        // offeredtimes:offeredtimes,
        // duration:duration,
        // imagelink:imagelink,
        // price:price,
        // category:category,
        // department:department,
        // coursehours:coursehours,
        // totalstudents:totalstudents,
        // studentscompleted:studentscompleted,
        // dateadded:dateadded,
        // status1:'Submitted',
        // comments:''
        
        // }
        // });

        

        // const a = await fetchPract1();
        //setLoading(false);
        // setIsuploading(false);
        //console.log(response.data.data);
        //alert(response.data.status);
        //history.replace('/viewnaddonc');
        // const pagenav=global1.pagenav;
        //history.goBack();
        // history.replace('/' + pagenav);
    };

    useEffect(() => {
        //logout();

        console.log(global1.coursetitle);
        
        // coursetitleref.current.value=global1.coursetitle;
        // coursecoderef.current.value=selectedUser.coursecode;
        // coursetyperef.current.value=selectedUser.coursetype;
        // yearref.current.value=selectedUser.year;
        // offeredtimesref.current.value=selectedUser.offeredtimes;
        // durationref.current.value=selectedUser.duration;
        // imagelinkref.current.value=selectedUser.imagelink;
        // priceref.current.value=selectedUser.price;
        // categoryref.current.value=selectedUser.category;
        // departmentref.current.value=selectedUser.department;
        // coursehoursref.current.value=selectedUser.coursehours;
        // totalstudentsref.current.value=selectedUser.totalstudents;
        // studentscompletedref.current.value=selectedUser.studentscompleted;
        // dateaddedref.current.value=selectedUser.dateadded;
        
        
        }, []);

        // const handleTextInputChange = event => {
        //     setCtitle(event.target.value);
        // };

    return (
        <Dialog  fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Edit</DialogTitle>
            <DialogContent>
            {/* Enter Course title<br /><br /> */}

{/* <input type="text" required style={{width: "100%"}} placeholder="Enter Course title" id="coursetitle" value={global1.coursetitle} ref={coursetitleref} />
<br /><br /> */}
<br />

<TextField sx={{ width: "100%"}} id="outlined-basic" label="Course title" defaultValue={global1.coursetitle} variant="outlined" inputRef={coursetitleref} />
<br /><br />

<TextField id="outlined-basic" label="Course code" defaultValue={global1.coursecode} variant="outlined" inputRef={coursecoderef} />
<br /><br />
{/* 
<TextField id="outlined-basic" label={global1.coursecode} variant="outlined" onChange={handleTextInputChange} />
<br /><br /> */}

{/* Enter Course code<br /><br />

<input type="text" required style={{width: "100%"}} placeholder="Enter Course code" id="coursecode" ref={coursecoderef} />
<br /><br /> */}

{/* <label htmlFor="coursetype">Course type</label>

<select id="coursetype" className="form-control" ref={coursetyperef}>
<option value="Offered by HEI">Offered by HEI</option>
<option value="Online">Online</option>
</select>
<br /><br /> */}
 <InputLabel id="demo-simple-select-label">Course type</InputLabel>
<Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    inputRef={coursetyperef}
    label={global1.coursetype}
    defaultValue={global1.coursetype}
  
  >
    <MenuItem value="Offered by HEI">Offered by HEI</MenuItem>
    <MenuItem value="Online">Online</MenuItem>
  </Select>

  <br /><br />

<label htmlFor="year">Academic year</label>

<select id="year" className="form-control" ref={yearref}>
<option value="2017-18">2017-18</option>
<option value="2018-19">2018-19</option>
<option value="2019-20">2019-20</option>
<option value="2020-21">2020-21</option>
<option value="2021-22">2021-22</option>
<option value="2022-23">2022-23</option>
<option value="2023-24">2023-24</option>
</select>
<br /><br />

Enter No of times offered<br /><br />

<input type="text" required style={{width: "100%"}} placeholder="Enter No of times offered" id="offeredtimes" ref={offeredtimesref} />
<br /><br />

{/* Enter Duration from to<br /><br />

<input type="text" required style={{width: "100%"}} placeholder="Enter Duration from to" id="duration" ref={durationref} />
<br /><br /> */}

<TextField id="outlined-basic" type="text" label="Duration" defaultValue={global1.duration} variant="outlined" inputRef={durationref} />
<br /><br />

Enter Image link<br /><br />

<input type="text" required style={{width: "100%"}} placeholder="Enter Image link" id="imagelink" ref={imagelinkref} />
<br /><br />

Enter Price<br /><br />

<input type="number" required style={{width: "100%"}} placeholder="Enter Price" id="price" ref={priceref} />
<br /><br />

<label htmlFor="category">Category</label>

<select id="category" className="form-control" ref={categoryref}>
<option value="Free">Free</option>
<option value="Paid">Paid</option>
</select>
<br /><br />

Enter Department<br /><br />

<input type="text" required style={{width: "100%"}} placeholder="Enter Department" id="department" ref={departmentref} />
<br /><br />

Enter Course hours<br /><br />

<input type="number" required style={{width: "100%"}} placeholder="Enter Course hours" id="coursehours" ref={coursehoursref} />
<br /><br />

Enter Total students<br /><br />

<input type="number" required style={{width: "100%"}} placeholder="Enter Total students" id="totalstudents" ref={totalstudentsref} />
<br /><br />

Enter Students completed<br /><br />

<input type="text" required style={{width: "100%"}} placeholder="Enter Students completed" id="studentscompleted" ref={studentscompletedref} />
<br /><br />

<LocalizationProvider dateAdapter={AdapterDayjs}>
<DatePicker defaultValue={dayjs(global1.dateadded)} label="Select date added" inputRef={dateaddedref} sx={{ width: "100%"}} />
</LocalizationProvider>

<br/>

{/* Enter Date added<br /><br />

<input type="date" required style={{width: "100%"}} placeholder="Enter Date added" id="dateadded" ref={dateaddedref} />
<br /><br /> */}
               
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={searchapi} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditUserModal;
