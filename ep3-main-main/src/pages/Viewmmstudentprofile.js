import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmmiseenrol1';
import AddUserModalBulk from './Addmmiseenrol1bulk';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
import ExportUserModal1 from './Export';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

import pdfToText from 'react-pdftotext';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Tesseract from 'tesseract.js';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


function ViewPage() {
    const [rows, setRows] = useState([]);
    const [results, setResults] = useState([]);
    const [second, setSecond] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openAddBulk, setOpenAddBulk] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openExport, setOpenExport] = useState(false);
    const [openExport1, setOpenExport1] = useState(false);
    const [selectedUser, setSelectedUser] = useState();
    const [rows1, setRows1] = useState([]);
    const [newUser, setNewUser] = useState({
      coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtimes: '', imagelink: '',studentsenrolled:'',
      price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '', dateadded: ''
    });

     const [file, setFile] = useState();
    const [dialogopen, setDialogopen] = React.useState(false);
    const [itemstocheck, setItemstocheck] = useState();

     const keywordsref=useRef();
        const policyref=useRef();

    const [regno, setRegno] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [lastlogin, setLastlogin] = useState('');
    const [status1, setStatus1] = useState('');

    const [selectedImage, setSelectedImage] = useState(null);
  const handleImageUpload = (event) => {
    const image = event.target.files[0];
    setSelectedImage(URL.createObjectURL(image));
  };

    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;

    const [open, setOpen] = React.useState(false);

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
        const response = await ep1.get('/api/v2/deletemiseenrol1byfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

     const onButtonexamtype = async(e, row, type) => {
        e.stopPropagation();
        //do whatever you want with the row
        //alert(row._id);
        const response = await ep1.get('/api/v2/updateexamtype', {
            params: {
                id: row._id,
                token: token,
                user: user,
                type: type
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage1();
    };

     const onButtoninterntype = async(e, row, type) => {
        e.stopPropagation();
        //do whatever you want with the row
        //alert(row._id);
        const response = await ep1.get('/api/v2/updateinterntype', {
            params: {
                id: row._id,
                token: token,
                user: user,
                type: type
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

     const onButtondeleteintern = async(e, row, type) => {
        e.stopPropagation();
        //do whatever you want with the row
        //alert(row._id);
        const response = await ep1.get('/api/v2/deletemiseenrol1byfac', {
            params: {
                id: row._id,
                token: token
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const columns = [
        // { field: '_id', headerName: 'ID' },
    
     {
field:'testid',
headerName:'test id',
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
field:'sessionid',
headerName:'Session id',
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
field:'test',
headerName:'Test',
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
field:'sessionslot',
headerName:'Session slot',
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
field:'level',
headerName:'Levels',
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

  
          { field: 'actions', headerName: 'Actions', width: 400, renderCell: (params) => {
            return (
             <table>
                <tr>
                  <td>
                  <Button
                onClick={(e) => onButtondeleteintern(e, params.row)}
                variant="contained"
              >
                Delete
              </Button>
              </td>
              <td width="10px"></td>
              <td>
               <Button
                    onClick={(e) => onButtoninterntype(e, params.row,'Upcoming')}
                    variant="contained"
                  >
                    Upcoming
                  </Button>
                  </td>
                  <td width="10px"></td>
                  <td>
                     <Button
                    onClick={(e) => onButtoninterntype(e, params.row,'Completed')}
                    variant="contained"
                  >
                    Completed
                  </Button>
                  </td>
                   <td width="10px"></td>
                  <td>
                     <Button
                    onClick={(e) => onButtoninterntype(e, params.row,'Pending')}
                    variant="contained"
                  >
                    Pending
                  </Button>
                  </td>
               
                 
                </tr>
              </table>
            );
          } }
      ];

      const columns1 = [
            // { field: '_id', headerName: 'ID' },
        
         {
    field:'testid',
    headerName:'test id',
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
    field:'sessionid',
    headerName:'Session id',
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
    field:'test',
    headerName:'Test',
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
    field:'sessionslot',
    headerName:'Session slot',
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
    field:'level',
    headerName:'Levels',
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
    
      
              { field: 'actions', headerName: 'Actions', width: 300, renderCell: (params) => {
                return (
                 <table>
                    <tr>
                      <td>
                      {/* <Button
                    onClick={(e) => onButtonClick(e, params.row)}
                    variant="contained"
                  >
                    Delete
                  </Button> */}
                  <Button
                    onClick={(e) => onButtonexamtype(e, params.row,'Completed')}
                    variant="contained"
                  >
                    Completed
                  </Button>
                      </td>
                      <td width="10px"></td>
                      <td>
                      <Button
                    onClick={(e) => onButtonexamtype(e, params.row,'Upcoming')}
                    variant="contained"
                  >
                    Upcoming
                  </Button>
                      </td>
                       <td width="10px"></td>
                      <td>
                        <Button
                    onClick={(e) => onButtonexamtype(e, params.row,'Pending')}
                    variant="contained"
                  >
                    Pending
                  </Button>
                      </td>
                     
                    </tr>
                  </table>
                );
              } }
          ];
    
    
     const fetchViewPage1 = async () => {
        if(regno =='') {
            alert('Please get student details first');
            return;
        }
        setOpen(true);
          const response = await ep1.get('/api/v2/getmtestseenrol1byreg', {
            params: {
              token: token,
              colid: colid,
              regno: regno
            }
          });
          setRows1(response.data.data.classes);
          setOpen(false);
        };

    const coursetitleref = useRef();

    const testid=global1.internshipid;
    const sessionid=global1.isessionid;

    const useractivate = async () => {
        const policy=policyref.current.value;
        if(!policy) {
            alert('Please enter username');
            return;
        }
        setOpen(true);
      const response = await ep1.get('/api/v2/useractivate', {
        params: {
          token: token,
          colid: colid,
          email: policy
        }
      });
      setRows(response.data.data.classes);
      getdetails();
      setOpen(false);

    };

    const getdetails = async () => {
        const policy=policyref.current.value;
        if(!policy) {
            alert('Please enter username');
            return;
        }
        setOpen(true);
      const response = await ep1.get('/api/v1/loginapif', {
        params: {
          token: token,
          colid: colid,
          email: policy
        }
      });
      //setRows(response.data.data.classes);
      setUsername(response.data.name);
      setPassword(response.data.password);
      setRegno(response.data.regno);
      setLastlogin(response.data.lastlogin);
      setStatus1(response.data.status1);
      setRole(response.data.role);
      setOpen(false);

    };
  
    const fetchViewPage = async () => {
        if(regno =='') {
            alert('Please get student details first');
            return;
        }
        setOpen(true);
      const response = await ep1.get('/api/v2/getmiseenrol1byreg', {
        params: {
          token: token,
          colid: colid,
          regno: regno
        }
      });
      setRows(response.data.data.classes);
      setOpen(false);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getmiseenrol1countbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getmiseenrol1secondbyfac', {
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
      //fetchViewPage();
      
    }, []);
  
    const handleExport = () => {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ViewPage');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'Internship_data.xlsx');
      setOpenExport(false);
    };

    const handleExport1 = () => {
      const ws = XLSX.utils.json_to_sheet(rows1);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ViewPage');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'Exam_data.xlsx');
      setOpenExport1(false);
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
            const testid=user.testid;
const sessionid=user.sessionid;
const test=user.test;
const sessionslot=user.sessionslot;
const student=user.student;
//const regno=user.regno;
const type=user.type;
const level=user.level;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatemiseenrol1byfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            testid:testid,
sessionid:sessionid,
test:test,
sessionslot:sessionslot,
student:student,
regno:regno,
type:type,
level:level,

            status1:'Submitted',
            comments:''
            
            }
            });
    
            
    
            const a = await fetchViewPage();
           
            //alert(response.data.status);
  
  
        //alert(user.coursetitle);
       
      };


       const handleOpenEdit2 =async (user) => {
    
            //const title=titleref.current.value;
            const testid=user.testid;
const sessionid=user.sessionid;
const test=user.test;
const sessionslot=user.sessionslot;
const student=user.student;
const regno=user.regno;
const type=user.type;
const level=user.level;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatemtestseenrol1byfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            testid:testid,
sessionid:sessionid,
test:test,
sessionslot:sessionslot,
student:student,
regno:regno,
type:type,
level:level,

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

     function extractText1(event) {
     
      const file1 = event.target.files[0];
      setFile(file1);
     
    }

    const onButtonClickgo = async(e, row) => {
      e.stopPropagation();
      var itemstocheck=row.name + '~' + row.title + '~' + row.journal;
      setItemstocheck(itemstocheck);
      global1.itemstocheck=itemstocheck;
      setDialogopen(true);
      
     
    
  };

  const processpdf=async()=> {
    if(!file) {
      alert('Please select file');
      return;
    }
    
    setOpen(true);
    pdfToText(file)
    .then((text) => checktext1(text,itemstocheck))
    .catch((error) => alert("Failed to extract text from pdf"));
    setOpen(false);

  }

  const recognizeText = async (e, row) => {
    e.stopPropagation();
    var itemstocheck=row.name + '~' + row.title + '~' + row.journal;
    setItemstocheck(itemstocheck);
    
  };

  const processimage=async()=> {
    
    if(!selectedImage) {
      alert('Please select image');
      return;
    }
    if (selectedImage) {
      const result = await Tesseract.recognize(selectedImage);
     //alert(result.data.text);
     checktext1(result.data.text,itemstocheck);
    }

  }

  const checktext1=(stext,itemstocheck)=> {
    const ar1=itemstocheck.split('~');
    var found=0;
    var notthere='';
    for(var i=0;i<ar1.length;i++) {
      if(stext.toLowerCase().indexOf(ar1[i])>-1) {
        found=found + 1;
      } else {
        notthere=notthere + ar1[i] + ' ';
      }

    }
    var percentage=Math.round(parseFloat(found)/parseFloat(ar1.length) * 100);
    alert('Percentage match ' + percentage + '. Missing items ' + notthere);
  }

    const handleDialogclose = () => {
      setDialogopen(false);
    };
  
    return (
      <React.Fragment>
        <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>


            <Box>
                 <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Student user name"  variant="outlined" inputRef={policyref} />
                 <br /><br />
                 <Box>
                     <Button onClick={getdetails}
                              variant="contained"
                              color="secondary"
                              style={{  fontSize: '12px', height: '40px', width: '160px' }}
                            >
                              Get User details
                            </Button>
                             <Button onClick={useractivate}
                              variant="contained"
                              color="secondary"
                              style={{  fontSize: '12px', height: '40px', width: '160px', marginLeft: 20 }}
                            >
                              Activate user
                            </Button>

                 </Box>
                
                            <br /><br />

                            Student {username} Reg no {regno}  Password {password} Status {status1}
                            <br /><br />
                            Validity {lastlogin}
                            <br /><br />

<Box>
      <Button onClick={fetchViewPage}
                              variant="contained"
                              color="secondary"
                              style={{  fontSize: '12px', height: '40px', width: '160px' }}
                            >
                              Internship details
                            </Button>

                              <Button onClick={fetchViewPage1}
                              variant="contained"
                              color="secondary"
                              style={{  fontSize: '12px', height: '40px', width: '160px', marginLeft: 20 }}
                            >
                              Exam details
                            </Button>

</Box>
                           
                            <br /><br />

            Internships enrolled <br /><br />
                
            </Box>
        <Box display="flex" marginBottom={4} marginTop={2}>

           
           
          
           <Button
             variant="contained"
             color="primary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
             onClick={() => setOpenExport(true)}
           >
             Export
           </Button>

           <Button onClick={fetchViewPage}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}
           >
             Refresh
           </Button>
         </Box>
          <Grid container spacing={3}>

        


<br />

<Dialog
        open={dialogopen}
        onClose={handleDialogclose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Document Validator"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">


<Grid item xs={12}>
<Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
<Box>

  Select pdf or image file document proof
 
  {/* Checking for {itemstocheck} */}
  <br /><br />
 
  <table>
    <tr>
      <td>
        Select pdf
      </td>
      <td width="20px"></td>
      <td>
      <input type="file" accept="application/pdf" onChange={extractText1} />
      </td>
      </tr><tr>
      <td>Select image</td>
      <td width="20px"></td>
      <td>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      </td>
    </tr>
  </table>
  <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>

</Box>
</Paper>
</Grid>

</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogclose} autoFocus>Close</Button>
          <Button onClick={processpdf}>
            Check pdf
          </Button>
          <Button onClick={processimage}>
            Check image
          </Button>
        </DialogActions>
      </Dialog>




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
               
  
  
                <ExportUserModal
                  open={openExport}
                  handleClose={() => setOpenExport(false)}
                  handleExport={handleExport}
                />

            <br /><br />

            <h5>tests enrolled</h5>
            <br />

              <Box display="flex" marginBottom={4} marginTop={2}>

           
           
          
           <Button
             variant="contained"
             color="primary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
             onClick={() => setOpenExport1(true)}
           >
             Export
           </Button>

           <Button onClick={fetchViewPage1}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}
           >
             Refresh
           </Button>
         </Box>

         <br /><br />

              <DataGrid getRowId={(row) => row._id} 
                
        rows={rows1}
        columns={columns1}
       
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        processRowUpdate={(updatedRow, originalRow) =>
            handleOpenEdit2(updatedRow)
          }
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
      />
                {/* add button handler */}
              

  
  
             

                  <ExportUserModal1
                  open={openExport1}
                  handleClose={() => setOpenExport1(false)}
                  handleExport={handleExport1}
                />


              </Paper>
            </Grid>
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
