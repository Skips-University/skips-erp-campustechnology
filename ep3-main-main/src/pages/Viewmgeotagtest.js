import ep1 from '../api/ep1';
import epai1 from '../api/epai';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmeventsnew1';
import AddUserModalBulk from './Addmeventsnew1bulk';
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

import exifr from 'exifr';


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

    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);

    const [lat, setLat] = useState('');
    const [long, setLong] = useState('');

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
        const response = await ep1.get('/api/v2/deleteeventsnew1byfac', {
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


      const keywords=row.description;
      // if(!keywords) {
      //   alert('Please enter keywords');
      //   return;
      // }
      setOpen(true);
      
      //alert('Please wait while document is generated');
     

      //do whatever you want with the row
      //alert(row._id);
      const response = await epai1.get('/api/v1/getresponse2', {
          params: {
             
              user: user,
              colid: colid,
              prompt:'Create a detailed two page report for event ' + row.event + ' with details such as ' + row.description + ' conducted on ' + formatdates(row.startdate)
          }

      });
      var backend= '<html><head><title>' + row.event + '</title></head><body>'; 
      backend=backend + '<br /><br />';
      backend=backend + '<h5>' + row.event +  '</h5><hr />';
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
    element.download = 'report ' + row.event + ".html";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
      //const a = await fetchViewPage();
  };

  const onButtonClickb = async(e, row) => {
    e.stopPropagation();


    const keywords=row.description;
    // if(!keywords) {
    //   alert('Please enter keywords');
    //   return;
    // }
    setOpen(true);
    
    //alert('Please wait while document is generated');
   

    //do whatever you want with the row
    //alert(row._id);
    const response = await epai1.get('/api/v1/getresponse2', {
        params: {
           
            user: user,
            colid: colid,
            prompt:'Create a detailed brochure for event ' + row.event + ' with details such as ' + row.description + ' conducted on ' + formatdates(row.startdate)
        }

    });
    var backend= '<html><head><title>' + row.event + '</title></head><body>'; 
    backend=backend + '<br /><br />';
    backend=backend + '<h5>' + row.event +  '</h5><hr />';
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
  element.download = 'brochure_' + row.event + ".html";
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
    //const a = await fetchViewPage();
};

  const formatdates = (date1) => {
    var dt1=new Date(date1);
    var month=dt1.getMonth() + 1;
    return dt1.getDate() + '/' + month + '/' + dt1.getFullYear();
}

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
field:'event',
headerName:'Event',
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
field:'department',
headerName:'Department',
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
field:'startdate',
headerName:'Start date',
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
field:'description',
headerName:'Description',
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
field:'brochurelink',
headerName:'Brochure link',
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
field:'reportlink',
headerName:'Report link',
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
field:'coordinator',
headerName:'Coordinator',
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
{
field:'collab',
headerName:'Collaborating agency',
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
field:'moulink',
headerName:'MoU link',
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
field:'participants',
headerName:'No of participants',
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
field:'duration',
headerName:'Duration in days',
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

  
          { field: 'actions', headerName: 'Actions', width: 600, renderCell: (params) => {
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
                AI report
              </Button>
                  </td>

                  <td width="10px"></td>
                  <td>
                  <Button
                onClick={(e) => onButtonClickb(e, params.row)}
                variant="contained"
              >
                AI brochure
              </Button>
                  </td>
                 
                </tr>
              </table>
            );
          } }
      ];


    const coursetitleref = useRef();
  
    const fetchViewPage = async () => {
      const response = await ep1.get('/api/v2/geteventsnew1byfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/geteventsnew1countbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/geteventsnew1secondbyfac', {
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
const event=user.event;
const department=user.department;
const startdate=new Date(user.startdate);
const description=user.description;
const brochurelink=user.brochurelink;
const reportlink=user.reportlink;
const coordinator=user.coordinator;
const type=user.type;
const level=user.level;
const collab=user.collab;
const moulink=user.moulink;
const participants=user.participants;
const duration=user.duration;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updateeventsnew1byfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
event:event,
department:department,
startdate:startdate,
description:description,
brochurelink:brochurelink,
reportlink:reportlink,
coordinator:coordinator,
type:type,
level:level,
collab:collab,
moulink:moulink,
participants:participants,
duration:duration,

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

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
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

  const checkgeotag= async () => {
    let {latitude, longitude} = await exifr.gps(URL.createObjectURL(selectedFile));
    alert(latitude + ' ' + longitude);
    setLat(latitude);
    setLong(longitude);
    //setIsValidated(true);
    alert('Geo tagged information verified. Please click on upload');
  }

  const processimage1=async()=> {
    setOpen(true);
    if(!selectedFile) {
      alert('Please select image');
      setOpen(false);
      return;
    }
    try
    {
        // let a=await exifr.gps(URL.createObjectURL(selectedFile));
        // alert(a);
        let {latitude, longitude} = await exifr.gps(URL.createObjectURL(selectedFile));
//alert(latitude + ' ' + longitude);
setLat(latitude);
setLong(longitude);
//setIsValidated(true);
alert('Geo tagged information verified. Please click on upload');

    } catch(err) {
        //alert(err);
        setLat(null);
        setLong(null);
        alert('Geo tagged information not detected. Please retake photo.')
        

    }
    setOpen(false);

  }

  const openlink = async () => {   
    if(!lat) {
        alert('Invalid address');
        return;
    }  
    var link='https://www.google.com/maps?q=' + lat + ',' + long;    
 var win = window.open(link, '_blank');
 win.focus();
};

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
       
          <Grid container spacing={3}>

         
          <Grid item xs={9}>

<br />

Select image file for checking geotag information
 
  {/* Checking for {itemstocheck} */}
  <br /><br />
 
  <table>
    <tr>
   
    
      <td>Select image</td>
      <td width="20px"></td>
      <td>
      {/* <input type="file" accept="image/*" onChange={handleImageUpload} /> */}
      <input type="file" name="file" onChange={changeHandler} />
      </td>
    
    </tr>
  </table>

  <br /><br />
  <Button onClick={processimage1}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '180px' }}
           >
             Check image
           </Button>


  

<br /><br />
  {/* <Button onClick={processimage1}>
            Check image
          </Button> */}

       

          Latitude {lat} Longitude {long}

          <br /><br />
          <Button onClick={openlink}
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '230px' }}
           >
             Check location in map
           </Button>
           <br /><br />

</Grid>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>


          
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
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
