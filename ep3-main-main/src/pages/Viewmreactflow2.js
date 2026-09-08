import ep1 from '../api/ep1';
import epai1 from '../api/epai';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmmcourseco';
import AddUserModalBulk from './Addmmcoursecobulk';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';


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

    const [open, setOpen] = React.useState(false);

    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;

    const keywordsref=useRef();
    const policyref=useRef();

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
        const response = await ep1.get('/api/v2/deletemcoursecobyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const onButtonClickm = async() => {
      //e.stopPropagation();


      
      const keywords=keywordsref.current.value;
      const policy=policyref.current.value;
      if(!keywords || !policy) {
        alert('Please enter Keywords and Policy name');
        return;
      }
      setOpen(true);
      
      //alert('Please wait while document is generated');
     

      //do whatever you want with the row
      //alert(row._id);
      const response = await epai1.get('/api/v1/getresponse2', {
          params: {
              user:user,
              colid:colid,
              prompt:'Create a detailed policy for ' + policy + ' with focus on ' + keywords
          }

      });
      var backend= '<html><head><title>' + policy + '</title></head><body>'; 
      backend=backend + '<br /><br />';
      backend=backend + '<h5>' + policy +  '</h5><hr />';
      //alert(response.data.data.classes);
      //const a=response.data.data.classes;
      const aiarray=response.data.data.classes.split('\n');
      //console.log('Count ' + aiarray.length);


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

                 setOpen(false);

    const element = document.createElement("a");
    const file = new Blob([backend], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download ='policy_' +  policy + ".html";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
      //const a = await fetchViewPage();
  };

    const columns = [
        // { field: '_id', headerName: 'ID' },
    
     {
field:'year',
headerName:'Academic year',
type:'text',
width:200,
editable:false,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'course',
headerName:'Course',
type:'text',
width:200,
editable:false,
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
headerName:'Course code',
type:'text',
width:200,
editable:false,
valueFormatter: (params) => {
if (params.value) {
return params.value;
} else {
return '';
}
}
 },
{
field:'cocode',
headerName:'CO code',
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
headerName:'Course outcome',
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
field:'type',
headerName:'Type',
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
field:'targetlevel',
headerName:'Target level',
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


    const coursetitleref = useRef();

    const coursename=global1.faccoursename;
    const coursecode=global1.faccoursecode;
    const lmsyear=global1.lmsyear;
  
    const fetchViewPage = async () => {
      const response = await ep1.get('/api/v2/getmcoursecobyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          coursecode: coursecode,
          year: lmsyear
        }
      });
      setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getmcoursecocountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          coursecode: coursecode,
          year: lmsyear
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getmcoursecosecondbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          coursecode: coursecode,
          year: lmsyear
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
      fetchViewPage();
      getgraphdata();
      getgraphdatasecond();
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
const course=user.course;
const coursecode=user.coursecode;
const cocode=user.cocode;
const co=user.co;
const type=user.type;
const targetlevel=user.targetlevel;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatemcoursecobyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
course:course,
coursecode:coursecode,
cocode:cocode,
co:co,
type:type,
targetlevel:targetlevel,

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

    const edges = [
        { id: '1-2', source: '1', target: '2', label: 'to the', type: 'step' },
      ];
       
      const nodes = [
        {
          id: '1',
          data: { label: 'Hello' },
          position: { x: 0, y: 0 },
          type: 'input',
        },
        {
          id: '2',
          data: { label: 'World' },
          position: { x: 100, y: 100 },
          type: ''
        },
      ];
  
    return (
      <React.Fragment>
        <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
      
          <Grid container spacing={3}>

        



<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>



            <Grid item xs={12}>
              <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
            
             <div style={{ height: '600px', width: '600px', padding: 40 }}>
                <ReactFlow nodes={nodes} edges={edges}>
                  <Background />
                  <Controls />
                </ReactFlow>
              </div>

              
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
