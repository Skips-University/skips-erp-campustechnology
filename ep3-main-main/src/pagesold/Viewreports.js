import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField, MenuItem, InputLabel, Select } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmattendancenew';
import AddUserModalBulk from './Addmattendancenewbulk';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Link } from 'react-router-dom';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// import { Link } from "react-router";


function ViewPage() {
    const [rows, setRows] = useState([]);
    const [results, setResults] = useState([]);
    const [second, setSecond] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openAddBulk, setOpenAddBulk] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openExport, setOpenExport] = useState(false);
    const [selectedUser, setSelectedUser] = useState();
    const [newUser, setNewUser] = useState({
      coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtimes: '', imagelink: '',studentsenrolled:'',
      price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '', dateadded: ''
    });

    const fromdateref=useRef();
    const todateref=useRef();
    const pcoderef=useRef();
    const semref=useRef();
    const yearref=useRef();

    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;

    const classid=global1.classid;
    const classdate=global1.facclassdate;
    const year=global1.lmsyear;
    const course=global1.faccoursename;
    const coursecode=global1.faccoursecode;
    const program=global1.facprogram;
    const programcode=global1.facprogramcode;
    const semester=global1.facsemester;
    const section=global1.facsection;

    const handleDeleteClick = async (id) => {
        alert(id);
        const response = await ep1.get('/api/v2/deleteaddoncbyfac', {
            params: {
                id: id,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVtb0BjYW1wdXMudGVjaG5vbG9neSIsImNvbGlkIjoiMzAiLCJpYXQiOjE3MTY3ODk5NTEsImV4cCI6MTcxNzUwOTk1MX0.eXO0DAHibVppz9hj2LkIEE3nMY8xPNxg1OmasdRus1s",
                user: "demo@campus.technology"
            }

        });
        alert(response.data.status);
        const a=await fetchViewPage();
      };

      const onButtonClick = async(e, row) => {
        e.stopPropagation();
        //do whatever you want with the row
        //alert(row._id);
        const response = await ep1.get('/api/v2/deleteattendancenewbyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const columns = [
        // { field: '_id', headerName: 'ID' },
    
   
{
field:'_id',
headerName:'Course code',
type:'text',
width:200,
editable:false,
valueGetter: (params) => {
    //console.log({ params });
    return params.id.coursecode;
    //params.row?.coursecode?.coursecode 
}
// valueFormatter: (params) => {
// if (params.value) {
// return params.value;
// } else {
// return '';
// }
// }
 },
{
field:'_id.student',
headerName:'Student',
type:'text',
width:200,
editable:false,
valueGetter: (params) => {
    //console.log({ params });
    return params.id.student;
    //params.row?.coursecode?.coursecode 
}
 },
{
field:'_id.regno',
headerName:'Reg no',
type:'text',
width:200,
editable:false,
valueGetter: (params) => {
   // console.log({ params });
    return params.id.regno;
    //params.row?.coursecode?.coursecode 
}
 },
{
field:'total_attendance',
headerName:'Attendance',
type:'text',
width:200,
editable:false,
valueGetter: (params) => {
    console.log({ params });
    return params.row.total_attendance;
    //params.row?.coursecode?.coursecode 
}
// valueFormatter: (params) => {
// if (params.value) {
// return params.value;
// } else {
// return '';
// }
// }
 }

      ];


    const coursetitleref = useRef();

 
  
    const fetchViewPage = async () => {
      //alert(classid);
   
      //alert(ayear + ',' + pcode + ',' + semester + ',' + date1 + ',' + date2);
      const response = await ep1.get('/api/v2/getsectorsummary', {
        params: {
          token: token,
          colid: colid,
          user: user
        
        }
      });
      //console.log(response.data.data.classes);
      setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getattendancenewcountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getattendancenewsecondbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setSecond(response.data.data.classes);
    };

    const refreshpage=async()=> {
      fetchViewPage();
      getgraphdata();
      getgraphdatasecond();
    }
  
    useEffect(() => {
    //   fetchViewPage();
    //   getgraphdata();
    //   getgraphdatasecond();
    }, []);
  
    const handleExport = () => {
      if(rows.length<1) {
        alert('Please generate data first');
        return;
      }
      const Comment = [];
      for (var i=0; i<rows.length; i++) {
        Comment.push({
            section: rows[i]._id.section,
          student: rows[i]._id.student,
          regno: rows[i]._id.regno,
          attendance:rows[i].total_attendance
      });

      }
      
      const ws = XLSX.utils.json_to_sheet(Comment);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Score');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'MCQ_marks_data.xlsx');
      setOpenExport(false);
    };
  
    const handleOpenAdd = () => {
      setOpenAdd(true);
    };

    const handleOpenAddBulk = () => {
        setOpenAddBulk(true);
      };
  
    const handleCloseAdd = () => {
      setOpenAdd(false);
      setNewUser({
        coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtimes: '', imagelink: '',
        price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '',studentsenrolled:'', dateadded: ''
      });
    };

    const handleCloseAddBulk = () => {
        setOpenAddBulk(false);
        setNewUser({
          coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtimes: '', imagelink: '',
          price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '',studentsenrolled:'', dateadded: ''
        });
      };
  
    const handleOpenEdit = (user) => {
      global1.coursetitle = user.coursetitle;
      global1.coursecode = user.coursecode;
      global1.duration=user.duration;
      global1.coursetype=user.coursetype;
      global1.dateadded=user.dateadded;
      setSelectedUser(user);
      setOpenEdit(true);

      //alert(user.coursetitle);
     
    };

   

    const handleOpenEdit1 =async (user) => {
    
            //const title=titleref.current.value;
            const year=user.year;
const classid=user.classid;
const programcode=user.programcode;
const program=user.program;
const course=user.course;
const coursecode=user.coursecode;
const student=user.student;
const regno=user.regno;
const att=user.att;
const classdate=new Date(user.classdate);
const semester=user.semester;
const section=user.section;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updateattendancenewbyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
classid:classid,
programcode:programcode,
program:program,
course:course,
coursecode:coursecode,
student:student,
regno:regno,
att:att,
classdate:classdate,
semester:semester,
section:section,

            status1:'Submitted',
            comments:''
            
            }
            });
    
            
    
            const a = await fetchViewPage();
           
            //alert(response.data.status);
  
  
        //alert(user.coursetitle);
       
      };
  
    const handleCloseEdit = () => {
      setOpenEdit(false);
      setSelectedUser(null);
    };
  
    const handleOpenDelete = (user) => {
      setSelectedUser(user);
      setOpenDelete(true);
    };
  
    const handleCloseDelete = () => {
      setOpenDelete(false);
      setSelectedUser(null);
    };
  
    const handleAddUser = () => {
      const newUserId = rows.length ? rows[rows.length - 1]._id + 1 : 1;
      const newRow = { ...newUser, _id: newUserId };
      setRows([...rows, newRow]);
      handleCloseAdd();
    };
  
    const handleEditUser = () => {
      const updatedRows = rows.map((row) =>
        row._id === selectedUser._id ? { ...selectedUser } : row
      );
      setRows(updatedRows);
      handleCloseEdit();
    };
  
    const handleDeleteUser = () => {
      const updatedRows = rows.filter((row) => row._id !== selectedUser._id);
      setRows(updatedRows);
      handleCloseDelete();
    };
  
    const handleInputChange = (event, field) => {
      const { value } = event.target;
      if (openAdd) {
        setNewUser({ ...newUser, [field]: value });
      } else if (openEdit) {
        setSelectedUser({ ...selectedUser, [field]: value });
      }
    };

    const formatdates = (date1) => {
      var dt1=new Date(date1);
      var month=dt1.getMonth() + 1;
      return dt1.getDate() + '/' + month + '/' + dt1.getFullYear();
  }
  
    return (
      <React.Fragment>
        <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>

          

{/* <InputLabel id="att">Semester</InputLabel><Select labelId="att"
id="att"
inputRef={semref}
sx={{ width: '100%'}}
>
<MenuItem value="One">One</MenuItem>
<MenuItem value="Two">Two</MenuItem>
<MenuItem value="Three">Three</MenuItem>
<MenuItem value="Four">Four</MenuItem>
<MenuItem value="Five">Five</MenuItem>
<MenuItem value="Six">Six</MenuItem>
<MenuItem value="Seven">Seven</MenuItem>
<MenuItem value="Eight">Eight</MenuItem>
<MenuItem value="Nine">Nine</MenuItem>
<MenuItem value="Ten">Ten</MenuItem>
</Select>
<br /><br /> */}

{/* <InputLabel id="att1">Year</InputLabel><Select labelId="att1"
id="att1"
inputRef={yearref}
sx={{ width: '100%'}}
>
<MenuItem value="2024-25">2024-25</MenuItem>
<MenuItem value="2023-24">2023-24</MenuItem>

</Select> */}


      <p>Fees reports</p>
            

        <Grid item sx={6}>

            <Link to="/dashmmfeescolbydate">
            <button sx={{marginRight: 10}}>
                Datewise collection
            </button>
            </Link>
            <Link to="/dashfeescolaggr">
            <button sx={{marginRight: 10}}>Datewise total
                </button></Link>
            </Grid>

              <br />

 <Grid item sx={6}>
            <Link to="/studentledgerreportds">
            <button sx={{marginRight: 10}}>Student wise pending</button></Link>
            <Link to="/collegerepledgerreportds">
            <button sx={{marginRight: 10}}>Program wise pending</button>
            </Link>
</Grid>
  <br />

 <Grid item sx={6}>
            <Link to="/ledgerstudpageds">
            <button sx={{marginRight: 10}}>Student ledger</button></Link>
            <Link to="/ledgerinstallmentpageds">
            <button sx={{marginRight: 10}}>
                Studentwise Ledger
                </button></Link>

</Grid>
<br />
 <p>Workload reports</p>
            

        <Grid item sx={6}>

            <Link to="/dashmwreport1">
            <button sx={{marginRight: 10}}>
                Programwise workload
            </button>
            </Link>
            <Link to="/dashmwreport2">
            <button sx={{marginRight: 10}}>Faculty wise workload
                </button></Link>
            </Grid>

              <br />
        {/* <Box display="flex" marginBottom={4} marginTop={2}>
           
         
           <Button
             variant="contained"
             color="primary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
             onClick={() => setOpenExport(true)}
           >
             Export
           </Button>

           <Button onClick={refreshpage}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}
           >
             Refresh
           </Button>
         </Box> */}
          <Grid container spacing={3}>

        




            {/* <Grid item xs={12}>
              <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}> */}
              {/* <h1>Table Component</h1> */}
             


                {/* <DataGrid getRowId={(row) => row._id} 
                
        rows={rows}
        columns={columns}
       
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        processRowUpdate={(updatedRow, originalRow) =>
            handleOpenEdit1(updatedRow)
          }
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
      /> */}
                
                {/* <AddUserModal
                  open={openAdd}
                  handleClose={handleCloseAdd}
                  handleInputChange={handleInputChange}
                  handleAddUser={handleAddUser}
                  newUser={newUser}
                />

                <AddUserModalBulk
                  open={openAddBulk}
                  handleClose={handleCloseAddBulk}
                  handleInputChange={handleInputChange}
                  handleAddUser={handleAddUser}
                  newUser={newUser}
                />
  
                <EditUserModal
                  open={openEdit}
                  handleClose={handleCloseEdit}
                  handleInputChange={handleInputChange}
                  handleEditUser={handleEditUser}
                  selectedUser={selectedUser}
                />
  
                <DeleteUserModal
                  open={openDelete}
                  handleClose={handleCloseDelete}
                  handleDeleteUser={handleDeleteUser}
                  selectedUser={selectedUser}
                />
  
                <ExportUserModal
                  open={openExport}
                  handleClose={() => setOpenExport(false)}
                  handleExport={handleExport}
                /> */}
              {/* </Paper>
            </Grid> */}
              <ExportUserModal
                  open={openExport}
                  handleClose={() => setOpenExport(false)}
                  handleExport={handleExport}
                /> 
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
