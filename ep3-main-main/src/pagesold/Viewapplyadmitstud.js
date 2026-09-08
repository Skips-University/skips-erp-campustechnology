import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, InputLabel, Select, MenuItem } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmnallaccr';
import AddUserModalBulk from './Addmnallaccrbulk';
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

import { useNavigate } from 'react-router-dom';


function ViewPage() {
  const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [exams, setExams] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [results, setResults] = useState([]);
    const [second, setSecond] = useState([]);


    const [year, setYear] = useState(false);
    const [exam, setExam] = useState(false);
    const [program, setProgram] = useState(false);


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

     const [file, setFile] = useState();
    const [dialogopen, setDialogopen] = React.useState(false);
    const [itemstocheck, setItemstocheck] = useState();

    const [selectedImage, setSelectedImage] = useState(null);
  const handleImageUpload = (event) => {
    const image = event.target.files[0];
    setSelectedImage(URL.createObjectURL(image));
  };

    const accreditationref=useRef();
    const yearref=useRef();
    const examref=useRef();
    const programref=useRef();


    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;
    const regno=global1.regno;

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

      const onButtonClicken = async(e, row) => {
          e.stopPropagation();
          //do whatever you want with the row
          //alert(row._id);
          global1.accreditation=row.acreditation;
          global1.criteria=row.criteria;
          global1.qno=row.qno;
          global1.question=row.question;
          global1.keywords=row.keywords;
          global1.sequence=row.sequence;
          global1.year=row.year;
          navigate('/dashmqualall');
      };

      const onButtonClicken1 = async() => {
          const accreditation=accreditationref.current.value;
          const year=yearref.current.value;
          if(!accreditation || !year) {
            alert('Please select accreditation and year');
            return;
          }
          //do whatever you want with the row
          //alert(row._id);
          global1.accreditation=accreditation;
          global1.year=year;
         
          navigate('/dashmnallaccrans');
      };

      const onButtonClick = async(e, row) => {
        e.stopPropagation();

          const colid1=parseInt(colid);
        if(colid1==111362) {
             const response = await ep1.get('/api/v2/deletenallaccrbyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();

        } else {
            alert('Unauthorized access');
            return;
        }
        //do whatever you want with the row
        //alert(row._id);
       
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
field:'acreditation',
headerName:'Accreditation',
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
field:'criteria',
headerName:'Criteria',
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
field:'qno',
headerName:'Question no',
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
field:'question',
headerName:'Question',
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
field:'keywords',
headerName:'Keywords',
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
field:'sequence',
headerName:'Sequence',
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
field:'doclink',
headerName:'Document link',
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
headerName:'Level',
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

  
          { field: 'actions', headerName: 'Actions', width: 210, renderCell: (params) => {
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
                  <Button
                onClick={(e) => onButtonClicken(e, params.row)}
                variant="contained"
              >
                Response
                
              </Button>
                  </td>
                 
                </tr>
              </table>
            );
          } }
      ];


    const coursetitleref = useRef();
  
    const fetchViewPage = async () => {
        const accreditation=accreditationref.current.value;
        if(!accreditation) {
            alert('Please select accreditation');
            return;
        }
      const response = await ep1.get('/api/v2/getnallaccrall', {
        params: {
          token: token,
          colid: colid,
          user: user,
          acreditation: accreditation
        }
      });
      setRows(response.data.data.classes);
    };



    const handleyearchange = async (e) => {

      setYear(e.target.value);

        // const year=yearref.current.value;
        // if(!year) {
        //     alert('Please select year');
        //     return;
        // }
        const year1=e.target.value;
        //alert(year);

      const response = await ep1.get('/api/v2/getexamdcode', {
        params: {
          token: token,
          colid: colid,
          year:year1,
          user: user
        }
      });
      setExams(response.data.data.classes);
    };

     const handlexamchange = async (e) => {

      setExam(e.target.value);

      const exam1=e.target.value;

      
       // const year=e.target.value;
        //alert(year);

      const response = await ep1.get('/api/v2/getexamdcode', {
        params: {
          token: token,
          colid: colid,
          year:year,
          user: user,
          examcode: exam1
        }
      });
      setExams(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getnallaccrcountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getnallaccrsecondbyfac', {
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
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ViewPage');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'ViewPage_data.xlsx');
      setOpenExport(false);
    };
  
    const handleOpenAdd = () => {
         const colid1=parseInt(colid);
        if(colid1==111362) {
            setOpenAdd(true);

        } else {
            alert('Unauthorized access');
            return;
        }
        
      
    };

    const handleOpenAddBulk = () => {
        const colid1=parseInt(colid);
        if(colid1==111362) {
            setOpenAddBulk(true);

        } else {
            alert('Unauthorized access');
            return;
        }
        
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

         const colid1=parseInt(colid);
        if(colid1==111362) {
            
            //const title=titleref.current.value;
            const year=user.year;
const acreditation=user.acreditation;
const criteria=user.criteria;
const qno=user.qno;
const question=user.question;
const keywords=user.keywords;
const sequence=user.sequence;
const doclink=user.doclink;
const type=user.type;
const level=user.level;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatenallaccrbyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
acreditation:acreditation,
criteria:criteria,
qno:qno,
question:question,
keywords:keywords,
sequence:sequence,
doclink:doclink,
type:type,
level:level,

            status1:'Submitted',
            comments:''
            
            }
            });
    
            
    
            const a = await fetchViewPage();

        } else {
            alert('Unauthorized access');
            return;
        }

        
    
           
         
       
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
            <InputLabel id="year">Academic year</InputLabel>
            <Select labelId="year"
            onChange={handleyearchange}
     id="year"
     inputRef={yearref}
     sx={{ width: '200px', height: '40px'}}
     >
     <MenuItem value="2017-18">2017-18</MenuItem>
     <MenuItem value="2018-19">2018-19</MenuItem>
     <MenuItem value="2019-20">2019-20</MenuItem>
     <MenuItem value="2020-21">2020-21</MenuItem>
     <MenuItem value="2021-22">2021-22</MenuItem>
     <MenuItem value="2022-23">2022-23</MenuItem>
     <MenuItem value="2023-24">2023-24</MenuItem>
     <MenuItem value="2024-25">2024-25</MenuItem>
     <MenuItem value="2025-26">2025-26</MenuItem>
     </Select>


      <InputLabel id="exam">Exam</InputLabel>
       <Select labelId="exam"
       onChange={handlexamchange}
id="exam"
inputRef={examref}
sx={{ width: '200px', height: '40px'}}
>
{/* <MenuItem value="AMBA">AMBA</MenuItem> */}

{exams.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}

</Select>
     
     <Button onClick={onButtonClicken1}
                  variant="contained"
                  color="secondary"
                  style={{ padding: '5px 10px', marginLeft: '20px', fontSize: '12px', height: '30px', width: '180px' }}
                >
                 Check Answers
                </Button>
     
          </Box>
          <br />

           <Box>
       {/* <InputLabel id="exam">Exam</InputLabel>
       <Select labelId="exam"
id="exam"
inputRef={examref}
sx={{ width: '200px', height: '40px'}}
>


{exams.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}

</Select> */}

<Button onClick={fetchViewPage}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', marginLeft: '20px', fontSize: '12px', height: '30px', width: '180px' }}
           >
            Load metrics
           </Button>

     </Box>
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

        <br /><br />
        <h5>Please scroll to the right and click on Response against the metric to start recording responses.</h5>
        <br />

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
