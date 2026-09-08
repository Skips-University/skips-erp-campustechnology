import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmmfaccoursesatt';
import AddUserModalBulk from './Addmmfaccoursesattbulk';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useNavigate } from 'react-router-dom';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';


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
    const navigate = useNavigate();

    const [open, setOpen] = React.useState(false);

    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;

    const faccoursename=global1.faccoursename;
    const faccoursecode=global1.faccoursecode;

    const coref=useRef();
    const limitref=useRef();
    const coursecoderef=useRef();
    const yearref=useRef();

    const level1ref=useRef();
    const level2ref=useRef();
    const level3ref=useRef();

    const [p1, setP1] = useState(0);
    const [l1, setL1] = useState(0);
    const [l2, setL2] = useState(0);

    const [la, setLa] = useState('');
    const [lan, setLan] = useState(0);

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
        const response = await ep1.get('/api/v2/deletemfaccoursesattbyfac', {
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
field:'year',
headerName:'Academic year',
type:'dropdown',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'coursename',
headerName:'Coursename',
type:'text',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'coursecode',
headerName:'Coursecode',
type:'text',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'co',
headerName:'CO',
type:'dropdown',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'component',
headerName:'Assessment component',
type:'text',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'student',
headerName:'Student',
type:'text',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'regno',
headerName:'Reg no',
type:'text',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'marks',
headerName:'Marks obtained',
type:'number',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'weightage',
headerName:'Assessment weightage',
type:'number',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'totalmarks',
headerName:'Total marks',
type:'number',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'percentage',
headerName:'Percentage',
type:'number',
width:200,
editable:true,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },

  
          { field: 'actions', headerName: 'Actions', width: 100, renderCell: (params) => {
            return (
              <Button
                onClick={(e) => onButtonClick(e, params.row)}
                variant="contained"
              >
                Delete
              </Button>
            );
          } }
      ];


      const attainment = async () => {
        const coursename1=global1.faccoursename;
        const coursecode1=global1.faccoursecode;
       
        navigate('/dashmattyear');
      };

      const levels = async () => {
        const coursename1=global1.faccoursename;
        const coursecode1=global1.faccoursecode;
       
        navigate('/dashmmcolevels');
      };

      const levels1 = async () => {
        const coursename1=global1.faccoursename;
        const coursecode1=global1.faccoursecode;
       
        navigate('/dashmmcolevelscalc');
      };

    const coursetitleref = useRef();

 const searchapi = async () => {
       

const year=yearref.current.value;
const coursecoden1=coursecoderef.current.value;
const co=coref.current.value;
const attained=l1;
const total=l2;
const pattained=p1;
const level1=level1ref.current.value;
const level2=level2ref.current.value;
const level3=level3ref.current.value;
const target=limitref.current.value;
const fleveln=lan;
const flevel=la;
const doclink='NA';


//alert(coursetitle + '-' + dateadded);

    //alert(department);
    //setLoading(true);
    //setIsuploading(true);
    const response = await ep1.get('/api/v2/createattyearbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
coursecode:coursecoden1,
co:co,
attained:attained,
total:total,
pattained:pattained,
level1:level1,
level2:level2,
level3:level3,
target:target,
fleveln:fleveln,
flevel:flevel,
doclink:doclink,

status1:'Submitted',
            comments:''

        }
    });
  
    alert(response.data.status);
   

  
   
};

    const calculate = async () => {
      const coursename1=global1.faccoursename;
      const coursecode1=global1.faccoursecode;
      const response = await ep1.get('/api/v2/addcoattainmentv', {
        params: {
          token: token,
          colid: colid,
          user: user,
          name:name,
          coursecode:coursecode1,
          coursename:coursename1
        }
      });
      setRows(response.data.data.classes);
      navigate('/dashmmattcalc');
    };
  
    const fetchViewPage = async () => {

      const co=coref.current.value;
      const coursecodenew=coursecoderef.current.value;
      const year=yearref.current.value;
      const limit=parseInt(limitref.current.value);

      const level1=parseInt(level1ref.current.value);
      const level2=parseInt(level2ref.current.value);
      const level3=parseInt(level3ref.current.value);

      if(!limit || !co || !year || !coursecodenew || !level1 || !level2 || !level3) {
        alert('All fields are required');
        return;
      }

      if(level3 > level2 && level3 > level1 && level2 > level1) {

      } else {
        alert('Please correct level data. Level 3 > Level 2 > Level 1');
        return;
      }

      setOpen(true);
    
      const response = await ep1.get('/api/v2/getattmarksnew', {
        params: {
          token: token,
          colid: colid,
          co:co,
          coursecode:coursecodenew,
          limit1:limit,
          year:year
        }
      });
      setRows(response.data.data.classes);
      const l11=parseInt(response.data.l1);
      const l21=parseInt(response.data.l2);
      setL1(l11);
      setL2(l21);
      var p11=(l11/l21) * 100;
      setP1(p11);

      setOpen(false);

      if(p11>=level3) {
        setLa('Level 3');
        setLan(3);
      } else if(p11>=level2) {
        setLa('Level 2');
        setLan(2);
      } else if(p11>=level1) {
        setLa('Level 1');
        setLan(1);
      } else {
        setLa('Level 0');
        setLan(0);
      }

      

    };

    const getgraphdata = async () => {
      const coursename1=global1.faccoursename;
      const coursecode1=global1.faccoursecode;
      const response = await ep1.get('/api/v2/getmfaccoursesattcountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          coursecode:coursecode1,
          coursename:coursename1
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const coursename1=global1.faccoursename;
      const coursecode1=global1.faccoursecode;
      const response = await ep1.get('/api/v2/getmfaccoursesattsecondbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          coursecode:coursecode1,
          coursename:coursename1
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
      //fetchViewPage();
    //   getgraphdata();
    //   getgraphdatasecond();
    }, []);
  
    const handleExport = () => {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ViewPage');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'ViewPage_data.xlsx');
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
const coursename=user.coursename;
const coursecode=user.coursecode;
const co=user.co;
const component=user.component;
const student=user.student;
const regno=user.regno;
const marks=user.marks;
const weightage=user.weightage;
const totalmarks=user.totalmarks;
const percentage=user.percentage;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatemfaccoursesattbyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
coursename:coursename,
coursecode:coursecode,
co:co,
component:component,
student:student,
regno:regno,
marks:marks,
weightage:weightage,
totalmarks:totalmarks,
percentage:percentage,

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
  
    return (
      <React.Fragment>
        <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
          <Box>
            
            <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Coursecode"  variant="outlined" inputRef={coursecoderef} /><br /><br />
            <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Year"  variant="outlined" inputRef={yearref} /><br /><br />
            <TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="Threshold Target"  variant="outlined" inputRef={limitref} /><br /><br />
            <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="CO"  variant="outlined" inputRef={coref} /><br /><br />

            <TextField id="outlined-basic"  type="number" sx={{ width: "20%"}} label="Level 1"  variant="outlined" inputRef={level1ref} />
            <TextField id="outlined-basic"  type="number" sx={{ width: "20%", marginLeft: 2}} label="Level 2"  variant="outlined" inputRef={level2ref} />
            <TextField id="outlined-basic"  type="number" sx={{ width: "20%", marginLeft: 2}} label="Level 3"  variant="outlined" inputRef={level3ref} />
            
            
            <br /><br />
            
             <Button onClick={fetchViewPage}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '120px' }}
           >
             Calculate
           </Button>

           <br /><br />
           No of students attained {l1} Total students {l2} Percentage attained {p1} Level attained {la}
            <br /><br />

               <Button onClick={searchapi}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '120px' }}
           >
             Add data
           </Button>

      

            </Box>
            <br /><br />
        <Box display="flex" marginBottom={4} marginTop={2}>
           
           
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
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
           >
             Refresh
           </Button>

           <Button onClick={attainment}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '180px' }}
           >
             Attainment Sheet
           </Button>

           {/* <Button onClick={calculate}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px',  marginRight: '4px', width: '120px' }}
           >
             Calculate
           </Button>
           <Button onClick={levels}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '120px' }}
           >
             Levels
           </Button>
           <Button onClick={levels1}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '120px' }}
           >
             Levels Status
           </Button> */}
         </Box>


         <Backdrop
                 sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                 open={open}
                 
               >
                 <CircularProgress color="inherit" />
               </Backdrop>


          <Grid container spacing={3}>

        



            <Grid item xs={12}>
              <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
              {/* <h1>Table Component</h1> */}
             


                <DataGrid getRowId={(row) => row._id} 
                
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
      />
                {/* add button handler */}
                <AddUserModal
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
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
