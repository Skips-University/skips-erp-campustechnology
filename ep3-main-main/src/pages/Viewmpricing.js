import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField, Select, InputLabel, MenuItem } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmscholnew';
import AddUserModalBulk from './Addmscholnewbulk';
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

     
    const purposeref=useRef();
    const mgmthoursref=useRef();
    const mgmtsubref=useRef();
    const mgmtsalref=useRef();
    const leadhoursref=useRef();
    const leadnumberref=useRef();
    const leadsalref=useRef();
    const supporthoutsref=useRef();
    const supportsalref=useRef();
    const supportnumberref=useRef();

    const offlinenoref=useRef();
    const onlinenoref=useRef();
    const onlinesupportref=useRef();
    const offlinetrainingref=useRef();

    const profitabilityref=useRef();

    const accreditationref=useRef();
    const studentsref=useRef();
    const studentrevenueref=useRef();
    

     const [file, setFile] = useState();
    const [dialogopen, setDialogopen] = React.useState(false);
    const [itemstocheck, setItemstocheck] = useState();

    const [suggestion, setSuggestion] = useState('');
    const [expense, setExpense] = useState(0);
    const [buffer, setBuffer] = useState(0);

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
        const response = await ep1.get('/api/v2/deletescholnewbyfac', {
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
field:'scholarship',
headerName:'Scholarship',
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
                  <Button
                onClick={(e) => onButtonClickgo(e, params.row)}
                variant="contained"
              >
                Check document
                
              </Button>
                  </td>
                 
                </tr>
              </table>
            );
          } }
      ];


    const coursetitleref = useRef();

    const calculateprof = async () => {
        var message='';
        var amount=0;
        const year=yearref.current.value;
        const mgmthours=mgmthoursref.current.value;
        const mgmtsal=mgmtsalref.current.value;
        const mgmtsub=mgmtsubref.current.value;

        const leadhours=leadhoursref.current.value;
        const leadnumber=leadnumberref.current.value;
        const supporthours=supporthoutsref.current.value;
        const supportnumber=supportnumberref.current.value;



        const offlineno=offlinenoref.current.value;
        const onlineno=onlinenoref.current.value;
        const onlinesupport=onlinesupportref.current.value;
        const offlinetraining=offlinetrainingref.current.value;

        const leadsal=leadsalref.current.value / 160;
        const supportsal=supportsalref.current.value / 160;

        const workshopamount=offlineno * 5000 + onlineno * leadsal * year + onlinesupport * supportsal * year + offlinetraining * supportsal * 8 * year;

        const leadamount=leadsal * year * leadnumber * leadhours;
        const supportamount=supportsal * year * supportnumber * supporthours;

        const profitability=profitabilityref.current.value;
        var mgmtamount=year * mgmthours * mgmtsal / 160 + mgmtsub * mgmtsal / 160;
        amount=mgmtamount + workshopamount + leadamount + supportamount;
        setExpense(amount);
        var prof=100 - profitability;
        amount=amount/prof * 100;
        message='Suggested price ' + amount + '. Travelling expenses extra.';



        setSuggestion(message);
      };

      const calculaterev = async () => {
        var message='';
        var amount=0;
        const year=yearref.current.value;
        const mgmthours=mgmthoursref.current.value;
        const mgmtsal=mgmtsalref.current.value;
        const mgmtsub=mgmtsubref.current.value;

        const leadhours=leadhoursref.current.value;
        const leadnumber=leadnumberref.current.value;
        const supporthours=supporthoutsref.current.value;
        const supportnumber=supportnumberref.current.value;



        const offlineno=offlinenoref.current.value;
        const onlineno=onlinenoref.current.value;
        const onlinesupport=onlinesupportref.current.value;
        const offlinetraining=offlinetrainingref.current.value;

        const leadsal=leadsalref.current.value / 160;
        const supportsal=supportsalref.current.value / 160;

        const workshopamount=offlineno * 5000 + onlineno * leadsal * year + onlinesupport * supportsal * year + offlinetraining * supportsal * 8 * year;

        const leadamount=leadsal * year * leadnumber * leadhours;
        const supportamount=supportsal * year * supportnumber * supporthours;

        const profitability=profitabilityref.current.value;
        var mgmtamount=year * mgmthours * mgmtsal / 160 + mgmtsub * mgmtsal / 160;
        amount=mgmtamount + workshopamount + leadamount + supportamount;

        const accreditation=accreditationref.current.value;
        const students=studentsref.current.value;
        const studentrevenue=studentrevenueref.current.value;

        const studentrevtotal = students * studentrevenue;

        const revenuenew=parseInt(accreditation) + studentrevtotal;

        var newprof=(revenuenew - amount) / revenuenew * 100;
        var newmessage='Revenue ' + revenuenew + '. Profitability ' + newprof + ' percent.';

        setBuffer(newmessage);
      };

     const getscholyear = async () => {
          const year=yearref.current.value;
          if(!year) {
            alert('Please select year');
            return;
          }
          var trialamount=0;
          var scholarshipamount=0;
          const response = await ep1.get('/api/v2/getbtrialbcountyear', {
            params: {
              token: token,
              colid: colid,
              year: year,
              purpose: 'Scholarship'
            }
          });
          const response1 = await ep1.get('/api/v2/getscholcountyear', {
            params: {
              token: token,
              colid: colid,
              year: year
            }
          });
          if(response.data.data.classes.length==0) {
            //alert('No record added. Add MoU data.');
            var message='No record added for trial balance for year ' + year + '. Please add data in Accreditation - Trial balance. ';
            
          } else {
            
            trialamount=parseInt(response.data.data.classes[0].total_attendance);
          }
          if(response1.data.data.classes.length==0) {
            //alert('No record added. Add MoU data.');
            message=message + 'No record added for scholarship for ' + year + '. Please add data in Accreditation - Scholarship. ';
            
          } else {
          
            scholarshipamount=parseInt(response1.data.data.classes[0].total_attendance);
          }
          if(scholarshipamount==0 || trialamount==0) {
            setSuggestion(message);
          } else {
            if(scholarshipamount != trialamount) {
              message = 'Mismatch detected. Scholarship amount added is ' + scholarshipamount + '. Scholarship amount in trial balance is ' + trialamount +'.';
              setSuggestion(message);
            }
          }
          
        };
  
    const fetchViewPage = async () => {
      const response = await ep1.get('/api/v2/getscholnewbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getscholnewcountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getscholnewsecondbyfac', {
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
const scholarship=user.scholarship;
const type=user.type;
const student=user.student;
const regno=user.regno;
const amount=user.amount;
const doclink=user.doclink;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatescholnewbyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
scholarship:scholarship,
type:type,
student:student,
regno:regno,
amount:amount,
doclink:doclink,

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
      var itemstocheck=row.name + '~' + row.scholarship;
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
       <InputLabel id="year">Project duration</InputLabel>
       <Select labelId="year"
id="year"
inputRef={yearref}
sx={{ width: '200px', height: '40px'}}
>
<MenuItem value="24">6 months</MenuItem>
<MenuItem value="48">12 months</MenuItem>

</Select>


     </Box>
     <br />

     <Box>

     
        <TextField id="outlined-basic"  type="text" sx={{ width: "300px"}} label="Management hours per week"  variant="outlined" inputRef={mgmthoursref} />
        <TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="Mgmt monthly cost"  variant="outlined" inputRef={mgmtsalref} />
        <TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="Mgmt hours during submission"  variant="outlined" inputRef={mgmtsubref} />
        
      


     </Box>
     <br />

     <Box>

     
<TextField id="outlined-basic"  type="text" sx={{ width: "300px"}} label="Lead hours per week"  variant="outlined" inputRef={leadhoursref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="Lead monthly cost"  variant="outlined" inputRef={leadsalref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="No of leads"  variant="outlined" inputRef={leadnumberref} />


</Box>
<br />

<Box>

     
<TextField id="outlined-basic"  type="text" sx={{ width: "300px"}} label="Support hours per week"  variant="outlined" inputRef={supporthoutsref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="Support monthly cost"  variant="outlined" inputRef={supportsalref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="No of support staff"  variant="outlined" inputRef={supportnumberref} />


</Box>
<br />

<Box>

     
<TextField id="outlined-basic"  type="text" sx={{ width: "300px"}} label="Offline workshop total"  variant="outlined" inputRef={offlinenoref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="online workshop hrs per wk lead"  variant="outlined" inputRef={onlinenoref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="online workshop hrs per wk support"  variant="outlined" inputRef={onlinesupportref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="offline training per week"  variant="outlined" inputRef={offlinetrainingref} />



</Box>
<br />

<Box>

     
<TextField id="outlined-basic"  type="text" sx={{ width: "300px"}} label="Profitabilit percentage"  variant="outlined" inputRef={profitabilityref} />




</Box>
<br />


<Button onClick={calculateprof}
     variant="contained"
     color="secondary"
     style={{ padding: '5px 10px', marginLeft: '20px', fontSize: '12px', height: '30px', width: '180px' }}
   >
    Suggest pricing
   </Button>

   <br /><br />

     {suggestion}

     <br /><br />

     <Box>

     
<TextField id="outlined-basic"  type="text" sx={{ width: "300px"}} label="Fixed revenue"  variant="outlined" inputRef={accreditationref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="No of students"  variant="outlined" inputRef={studentsref} />
<TextField id="outlined-basic"  type="text" sx={{ width: "300px", marginLeft: 3}} label="Revenue per student"  variant="outlined" inputRef={studentrevenueref} />




</Box>
<br />
<Button onClick={calculaterev}
     variant="contained"
     color="secondary"
     style={{ padding: '5px 10px', marginLeft: '20px', fontSize: '12px', height: '30px', width: '180px' }}
   >
    Calculate profitability
   </Button>

   <br /><br />

     {buffer}

     <br /><br />


   
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
              {/* <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}> */}
              {/* <h1>Table Component</h1> */}
             


               
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
              {/* </Paper> */}
            </Grid>
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
