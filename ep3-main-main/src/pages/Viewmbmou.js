import ep1 from '../api/ep1';
import epai1 from '../api/epai';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, Select, InputLabel, MenuItem } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmbmou';
import AddUserModalBulk from './Addmbmoubulk';
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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';


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

     const [file, setFile] = useState();
    const [dialogopen, setDialogopen] = React.useState(false);
    const [itemstocheck, setItemstocheck] = useState();

    const [suggestion, setSuggestion] = useState('');

    const yearref=useRef();

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
        const response = await ep1.get('/api/v2/deletebmoubyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

     const onButtonClickm = async(e, row) => {
          e.stopPropagation();

          var party=row.bodyname;
    
    
          
          // const keywords=keywordsref.current.value;
          // if(!keywords) {
          //   alert('Please enter Keywords');
          //   return;
          // }
          setOpen(true);

          var st1=new Date(row.signdate);
          var m1=st1.getMonth() + 1;
          var d1=st1.getDate();
          var y1=st1.getFullYear();

          var nd1=d1 + '/' + m1 + '/' + y1;
          
          //alert('Please wait while document is generated');
         
    
          //do whatever you want with the row
          //alert(row._id);
          const response = await epai1.get('/api/v1/getresponse2', {
              params: {
                  user:user,
                  colid:colid,
                  prompt:'Create collaboration agreement MoU with ' + row.bodyname + ' located in ' + row.address + ' for the purpose of ' + row.purpose + ' for a duration of  ' + row.duration + ' starting from ' + nd1
              }
    
          });
          var backend= '<html><head><title>' + party + '</title></head><body>'; 
          backend=backend + '<br /><br />';
          // backend=backend + '<h5>Memorandum of Understanding</h5><hr />';
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
        element.download = party + ".html";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
          //const a = await fetchViewPage();
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
field:'purpose',
headerName:'Purpose',
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
field:'bodyname',
headerName:'Party name',
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
field:'bodytype',
headerName:'Internship type',
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
field:'address',
headerName:'Party address',
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
field:'signdate',
headerName:'Date of signing',
type:'Date',
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
field:'duration',
headerName:'Duration',
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
field:'activity',
headerName:'Activity',
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
field:'link',
headerName:'Link',
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

  
          { field: 'actions', headerName: 'Actions', width: 400, renderCell: (params) => {
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
                onClick={(e) => onButtonClickgo(e, params.row)}
                variant="contained"
              >
                Check document
                
              </Button>
                  </td>
                  <td width="10px"></td>
                  <td>
                  <Button
                onClick={(e) => onButtonClickm(e, params.row)}
                variant="contained"
              >
                Draft MoU
                
              </Button>
                  </td>
                 
                </tr>
              </table>
            );
          } }
      ];


    const coursetitleref = useRef();

    const getmoucount = async () => {
      const year=yearref.current.value;
      if(!year) {
        alert('Please select year');
        return;
      }
      const response = await ep1.get('/api/v2/getbmoucount', {
        params: {
          token: token,
          colid: colid,
          year: year
        }
      });
      if(response.data.data.classes.length==0) {
        //alert('No record added. Add MoU data.');
        var message='No record added. Add MoU data. ';
        message=message + 'if you do not have any MoU, add data of any organiation or institution who visited campus and click on MoU button to create a draft MoU, and get it signed by both parties.'
        setSuggestion(message);
      } else {
        //alert(response.data.data.classes[0].total_attendance);
        var message='';
        var count1=response.data.data.classes[0].total_attendance;
        if(parseInt(count1)<10) {
          message='You do not have sufficient MoU. ';
          message=message + 'if you do not have any MoU, add data of any organiation or institution who visited campus and click on MoU button to create a draft MoU, and get it signed by both parties.'
        } else {
          message='You have sufficient number of MoUs for this year. ';
          message = message + 'In case MoU is not there, add data and click on MoU to create a dreaft MoU and get it signed by both the parties.';
        }
        
        
        setSuggestion(message);
      }
      //setRows(response.data.data.classes);
      // alert(response.data.data.classes[0].total_attendance);
    };
  
    const fetchViewPage = async () => {
      const response = await ep1.get('/api/v2/getbmoubyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getbmoucountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getbmousecondbyfac', {
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
const purpose=user.purpose;
const bodyname=user.bodyname;
const bodytype=user.bodytype;
const address=user.address;
const signdate=user.signdate;
const duration=user.duration;
const activity=user.activity;
const link=user.link;
const type=user.type;
const level=user.level;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatebmoubyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
purpose:purpose,
bodyname:bodyname,
bodytype:bodytype,
address:address,
signdate:signdate,
duration:duration,
activity:activity,
link:link,
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
      var itemstocheck=row.bodyname + '~' + row.duration + '~' + row.address;
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


      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>

     <Box>
       <InputLabel id="year">Academic year</InputLabel>
       <Select labelId="year"
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

<Button onClick={getmoucount}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', marginLeft: '20px', fontSize: '12px', height: '30px', width: '180px' }}
           >
            Check MoU
           </Button>

     </Box>
     <br />

     {suggestion}


   
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

          <Grid item xs={6}>
          
          <div style={{textAlign: 'center'}}>
          Levels
          </div>
          <br />
        <BarChart
    xAxis={[
      {
        id: 'barCategories',
        data: second.map((labels) => {
          return (
            labels._id ? labels._id : ''         
              );
          }),
        scaleType: 'band',
        colorMap: {
          type: 'piecewise',
          thresholds: [new Date(2021, 1, 1), new Date(2023, 1, 1)],
          colors: ['#F6C179', '#C27F1D', '#A6B0A3','#EDDBAC','#A6DAEE','#DEBFEB',,'#C85479','#F3646E','#AED3AD'],
        }
      },
    ]}
    series={[
      {
        data: second.map((labels1) => {
          return (
            parseInt(labels1.total_attendance)       
              );
          }),
      },
    ]}
    width={500}
    height={300}
  />
  
</Grid>
<Grid item xs={6}>

<div style={{textAlign: 'center'}}>
          Type
          </div>
 <br />
 <PieChart
 colors={['#D1A3B4','#BBD1A3', '#A3C4D1','#EDDBAC','#A6DAEE','#DEBFEB',,'#C85479','#F3646E','#AED3AD']} 
series={[
  {
    data: 
      results.map((labels1,i) => {
        return { id: i, value: parseInt(labels1.total_attendance)  , label: labels1._id? labels1._id : ''}
        }),
  },
  
]}
width={400}
height={250}
/>

</Grid>


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
