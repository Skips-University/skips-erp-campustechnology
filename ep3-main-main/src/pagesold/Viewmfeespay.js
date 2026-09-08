import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmfees';
import AddUserModalBulk from './Addmfeesbulk';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
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
    const [selectedUser, setSelectedUser] = useState();
    const [newUser, setNewUser] = useState({
      coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtimes: '', imagelink: '',studentsenrolled:'',
      price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '', dateadded: ''
    });

      const keywordsref=useRef();
            const policyref=useRef();
    
        const [regno, setRegno] = useState('');
        const [password, setPassword] = useState('');
        const [username, setUsername] = useState('');
        const [role, setRole] = useState('');
        const [lastlogin, setLastlogin] = useState('');
        const [status1, setStatus1] = useState('');
        const [programcode, setProgramcode] = useState('');
        const [admissionyear, setAdmissionyear] = useState('');
        const [category, setCategory] = useState('');

     const [file, setFile] = useState();
    const [dialogopen, setDialogopen] = React.useState(false);
    const [itemstocheck, setItemstocheck] = useState();

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
        const response = await ep1.get('/api/v2/deletefeesbyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const onButtonClicken = async(e, row) => {
        e.stopPropagation();
        //do whatever you want with the row
        //alert(row._id);
        // const response = await ep1.get('/api/v2/deletefeesbyfac', {
        //     params: {
        //         id: row._id,
        //         token: token,
        //         user: user
        //     }

        // });

        const response = await ep1.get('/api/v2/createmfeescolbyfac', {
                params: {
                    user: user,
                    token: token,
                    colid: colid,
                    name: name,
                   year:admissionyear,
        programcode:programcode,
        student:username,
        regno:regno,
        feegroup:row.feegroup,
        feeitem:row.feeeitem,
        semester:row.semester,
        feecategory:row.feecategory,
        paydate:new Date(),
        amount:row.amount,
        paymode:'Cash',
        payref:'NA',
        paystatus:'Paid',
        
        status1:'Submitted',
                    comments:''
        
                }
            });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const columns = [
        // { field: '_id', headerName: 'ID' },
    
     {
field:'academicyear',
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
field:'programcode',
headerName:'Program code',
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
field:'feegroup',
headerName:'Fee group',
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
field:'semester',
headerName:'Semester',
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
field:'feeeitem',
headerName:'Fee item',
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
field:'feecategory',
headerName:'Fee category',
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
field:'classdate',
headerName:'Due date',
type:'date',
width:200,
editable:true,
valueGetter: (params) => {
if (!params.value) {
return new Date();
}
return new Date(params.value);
 },
valueFormatter: params => dayjs(params?.value).format('DD/MM/YYYY'),
 },
{
field:'amount',
headerName:'Amount',
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
field:'status',
headerName:'Status',
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

  
          { field: 'actions', headerName: 'Actions', width: 300, renderCell: (params) => {
            return (
             <table>
                <tr>
                  <td>
                  <Button
                onClick={(e) => onButtonClick(e, params.row)}
                variant="contained"
              >
                Delete
              </Button>
                  </td>
                  <td width="10px"></td>
                  <td>
                  {/* <Button
                onClick={(e) => onButtonClickgo(e, params.row)}
                variant="contained"
              >
                Check document
                
              </Button> */}
               <Button
                onClick={(e) => onButtonClicken(e, params.row)}
                variant="contained"
              >
                Pay fees
                
              </Button>
                  </td>
                 
                </tr>
              </table>
            );
          } }
      ];


    const coursetitleref = useRef();
  
    const fetchViewPage = async () => {
        if(!programcode) {
            alert('Please enter student user name and get details');
            return;
        }
      const response = await ep1.get('/api/v2/getfeesbycatyrp', {
        params: {
          token: token,
          colid: colid,
          user: user,
          programcode: programcode,
          feecategory: category,
          year: admissionyear
        }
      });
      setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getfeescountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getfeessecondbyfac', {
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
      // getgraphdata();
      // getgraphdatasecond();
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
            const academicyear=user.academicyear;
const programcode=user.programcode;
const feegroup=user.feegroup;
const semester=user.semester;
const feeeitem=user.feeeitem;
const feecategory=user.feecategory;
const classdate=new Date(user.classdate);
const amount=user.amount;
const status=user.status;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatefeesbyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            academicyear:academicyear,
programcode:programcode,
feegroup:feegroup,
semester:semester,
feeeitem:feeeitem,
feecategory:feecategory,
classdate:classdate,
amount:amount,
status:status,

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

    const getdetails = async () => {
            const policy=policyref.current.value;
            if(!policy) {
                alert('Please enter username');
                return;
            }
            setOpen(true);
          const response = await ep1.get('/api/v2/logindetails', {
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
          setProgramcode(response.data.programcode);
          setCategory(response.data.category);
          setAdmissionyear(response.data.admissionyear);

          setOpen(false);

    
        };
  
    return (
      <React.Fragment>
        <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>

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
                                        <Button onClick={fetchViewPage}
                                          variant="contained"
                                          color="secondary"
                                          style={{  fontSize: '12px', height: '40px', marginLeft: '10px', width: '160px' }}
                                        >
                                          Load fees
                                        </Button>
                                        
            
                             </Box>
                            
                                        <br /><br />
                                        Program code : {programcode} &nbsp; &nbsp; Admission year : {admissionyear} &nbsp; &nbsp; Category : {category}
                                        <br />
                                        Name : {username} &nbsp; &nbsp; Reg no : {regno} &nbsp; &nbsp; Role : {role} &nbsp; &nbsp; Last login : {lastlogin} &nbsp; &nbsp; Status : {status1}
                                        <br />
        <Box display="flex" marginBottom={4} marginTop={2}>
           
           <Button
             variant="contained"
             color="success"
             style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }}
             onClick={handleOpenAdd}
           >
             Add 
           </Button>
           <Button
             variant="contained"
             color="success"
             style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }}
             onClick={handleOpenAddBulk}
           >
             Bulk
           </Button>
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
         </Box>
          <Grid container spacing={3}>

        

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
                <AddUserModal
                  open={openAdd}
                  handleClose={handleCloseAdd}
                  handleInputChange={handleInputChange}
                  handleAddUser={handleAddUser}
                  newUser={newUser}
                  fetchViewPage={fetchViewPage}
                />

                <AddUserModalBulk
                  open={openAddBulk}
                  handleClose={handleCloseAddBulk}
                  handleInputChange={handleInputChange}
                  handleAddUser={handleAddUser}
                  newUser={newUser}
                  fetchViewPage={fetchViewPage}
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
