import ep1 from '../api/ep1';
import epai1 from '../api/epai';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmmcoursematerial';
import AddUserModalBulk from './Addmmcoursematerialbulk';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { useNavigate } from 'react-router-dom';

// const { youtube } = require('scrape-youtube');
const youtubesearchapi = require("youtube-search-api");


function ViewPage() {
  const navigate = useNavigate();
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

    const apikeyref=useRef();
    const keywordsref=useRef();
    const modulesref=useRef();
    const topicref=useRef();

    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;

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
        const response = await ep1.get('/api/v2/deletemcoursematerialbyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const onButtonClickv = async(e, row) => {
      e.stopPropagation();
      //do whatever you want with the row
      //alert(row._id);
      
      global1.voicetext=row.voicetext;
      global1.moduleid=row._id;
     
      
      navigate('/dashmslideshow');
    
    };


    const createreport = async() => {
      
      const apikey=apikeyref.current.value;
      const keywords=keywordsref.current.value;
      const topic=topicref.current.value;
      if(!keywords || !apikey || !topic) {
        alert('Please enter keywords and apikey and topic');
        return;
      }
      setOpen(true);
      
   
    const response = await ep1.get('/api/v2/testgemini', {
          params: {
             
              user: user,
              colid: colid,
              apikey: apikey,
              question:'Create a detailed presription with list of medicines on ' + topic + ' with focus on ' + keywords
          }

      });
      var backend= '<html><head><title>' + topic + '</title></head><body>'; 
      backend=backend + '<br /><br />';
      backend=backend + '<h5>' + topic +  '</h5><hr />';
      //alert(response.data.data.classes);
      //const a=response.data.data.classes;
      const aiarray=response.data.data.classes.split('\n');
      //console.log('Count ' + aiarray.length);


    for(var i=0;i<aiarray.length; i++) {
      var c1=aiarray[i].toString();
      // var find13 = '**';
      // var re13 = new RegExp(find13, 'g');
      // c1=c1.toString().replace(re13,'');

      let cleanedParagraph = c1.replace(/\*\*/g, '');
      let cleanedParagraph1 = cleanedParagraph.replace(/###/g, '');
    
        // backend=backend + aiarray[i].toString() + '<br />';
        backend=backend + cleanedParagraph1 + '<br />';
        
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
    element.download = topic + ".html";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
      //const a = await fetchViewPage();
  };

    const onButtonClickm = async(e, row) => {
      e.stopPropagation();

      const apikey=apikeyref.current.value;
      const keywords=keywordsref.current.value;
      if(!keywords || !apikey) {
        alert('Please enter keywords and apikey');
        return;
      }
      setOpen(true);
      
   
    const response = await ep1.get('/api/v2/testgemini', {
          params: {
             
              user: user,
              colid: colid,
              apikey: apikey,
              question:'Create a detailed report on ' + row.description + ' with focus on ' + keywords
          }

      });
      var backend= '<html><head><title>' + row.description + '</title></head><body>'; 
      backend=backend + '<br /><br />';
      backend=backend + '<h5>' + row.description +  '</h5><hr />';
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
    element.download = row.description + ".html";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
      //const a = await fetchViewPage();
  };

   const onButtonClicky = async(e, row) => {
      e.stopPropagation();

      //setOpen(true);
      

      // const videos=youtubesearchapi.GetListByKeyword(row.description,false,10,[{type:"video"}]);
      // console.log(videos.items);

      window.open('https://www.youtube.com/results?search_query=' + row.description);
  

     

    //   var backend= '<html><head><title>' + row.description + '</title></head><body>'; 
    //   backend=backend + '<br /><br />';
    //   backend=backend + '<h5>' + row.description +  '</h5><hr />';
   
    //   backend=backend + '<h3>' + row.title + '</h3></br />\n;'

    // for(var i=0;i<videos.items.length;i++) {
    //     backend=backend + '<table cellspaing="20" cellpadding="20">';
    //     backend=backend + '<tr>';
    //     backend=backend + '<td><img width="100" height="100" src="' + videos.items[i].thumbnail + '" /><br /></td>\n';
    //     backend=backend + '<td>';
    //     backend=backend + '<b>' + videos[i].title + '</b><br />\n';
    //     backend=backend + videos[i].views + ' ' + videos[i].description + '<br />';
    //     backend=backend + '<a href="' + videos[i].link + '">Click here</a><br />';
    //     backend=backend + '</td></tr></table>';
        
    //     const views=videos[i].views + '+ views';

    // }

    // backend=backend + '<br />';

    // backend=backend + '<div id="google_translate_element"></div>\n';

    // backend=backend + '<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>\n';

    // backend=backend + '<script type="text/javascript">\n';
    // backend=backend + 'function googleTranslateElementInit() {\n';
    // backend=backend + "new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');\n";
    // backend=backend + '}\n';
    // backend = backend + '</script>\n';



    //              backend=backend + '</body></html>';

    //              setOpen(false);

    // const element = document.createElement("a");
    // const file = new Blob([backend], {type: 'text/plain'});
    // element.href = URL.createObjectURL(file);
    // element.download = row.title + ".html";
    // document.body.appendChild(element); 
    // element.click();
      
  };

  // const onButtonClicky = async(e, row) => {
  //     e.stopPropagation();

  //     setOpen(true);
      
  

  //     const options = {
  //       type: 'video',
  //       request: {
  //           headers: {
  //               Cookie: 'PREF=f2=8000000',
  //               'Accept-Language': 'en'
  //           }
  //       }
  //   };

   

    
  //   const { videos } = await youtube.search(row.description, options);
     

  //     var backend= '<html><head><title>' + row.description + '</title></head><body>'; 
  //     backend=backend + '<br /><br />';
  //     backend=backend + '<h5>' + row.description +  '</h5><hr />';
   
  //     backend=backend + '<h3>' + row.title + '</h3></br />\n;'

  //   for(var i=0;i<videos.length;i++) {
  //       backend=backend + '<table cellspaing="20" cellpadding="20">';
  //       backend=backend + '<tr>';
  //       backend=backend + '<td><img width="100" height="100" src="' + videos[i].thumbnail + '" /><br /></td>\n';
  //       backend=backend + '<td>';
  //       backend=backend + '<b>' + videos[i].title + '</b><br />\n';
  //       backend=backend + videos[i].views + ' ' + videos[i].description + '<br />';
  //       backend=backend + '<a href="' + videos[i].link + '">Click here</a><br />';
  //       backend=backend + '</td></tr></table>';
        
  //       const views=videos[i].views + '+ views';

  //   }

  //   backend=backend + '<br />';

  //   backend=backend + '<div id="google_translate_element"></div>\n';

  //   backend=backend + '<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>\n';

  //   backend=backend + '<script type="text/javascript">\n';
  //   backend=backend + 'function googleTranslateElementInit() {\n';
  //   backend=backend + "new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');\n";
  //   backend=backend + '}\n';
  //   backend = backend + '</script>\n';



  //                backend=backend + '</body></html>';

  //                setOpen(false);

  //   const element = document.createElement("a");
  //   const file = new Blob([backend], {type: 'text/plain'});
  //   element.href = URL.createObjectURL(file);
  //   element.download = row.title + ".html";
  //   document.body.appendChild(element); 
  //   element.click();
      
  // };

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
field:'slideno',
headerName:'Module',
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
field:'title',
headerName:'Title',
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
field:'imagelink',
headerName:'Image link',
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
field:'voicetext',
headerName:'Voice text',
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
field:'mode',
headerName:'Mode',
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

  
          { field: 'actions', headerName: 'Actions', width: 460, renderCell: (params) => {
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
                onClick={(e) => onButtonClickm(e, params.row)}
                variant="contained"
              >
                Material
              </Button>
                  </td>
                   <td width="10px"></td>
                  <td>
                  <Button
                onClick={(e) => onButtonClicky(e, params.row)}
                variant="contained"
              >
                Youtube Videos
              </Button>
                  </td>
                   <td width="10px"></td>
                  <td>
                  <Button
                onClick={(e) => onButtonClicka(e, params.row)}
                variant="contained"
              >
                Assignment
              </Button>
                  </td>
                  {/* <td width="10px"></td>
                  <td>
                  <Button
                onClick={(e) => onButtonClickv(e, params.row)}
                variant="contained"
              >
                Videos
              </Button>
                  </td> */}
                </tr>
          
            
              </table>
            );
          } }
      ];


    const coursetitleref = useRef();

    const coursename=global1.faccoursename;
    const coursecode=global1.faccoursecode;
    const lmsyear=global1.lmsyear;

    const onButtonClicka = async(e, row) => {
      e.stopPropagation();
       const apikey=apikeyref.current.value;
        const keywords=keywordsref.current.value;
      if(!apikey || !keywords) {
        alert('Please enter modules and apikey and keywords');
        return;
      }
       const question='Write a prescription with list of medicines available in India for ' + row.description + ' for ' + coursename + ' for advanced students with focus on ' + keywords + '. The assignment should be suitable for ' + coursecode + ' and should be for self-study. Provide the assignment in detail with title and description.';
      setOpen(true);
      const response = await ep1.get('/api/v2/testgemini3', {
        params: {
          token: token,
          apikey: apikey,
          question: question,
          colid: colid,
          user: user,
          name: global1.name,
          course: coursename,
          coursecode: coursecode,
          year: lmsyear
        }
      });
      //fetchViewPage();
      setOpen(false);
      alert('Assignment created');

    };


    const onButtonClickg= async () => {
        const modules=parseInt(modulesref.current.value);
        const apikey=apikeyref.current.value;
        const keywords=keywordsref.current.value;
      if(!modules || !apikey || !keywords) {
        alert('Please enter modules and apikey and keywords');
        return;
      }
      const question='Write a prescription with a list of medicines available in India for ' + modules + ' modules for ' + coursename + ' with focus on ' + keywords + ' and employability . Each module should have 2 to 3 topics.';
      setOpen(true);
      const response = await ep1.get('/api/v2/geminimodules1', {
        params: {
          token: token,
          apikey: apikey,
          question: question,
          colid: colid,
          user: user,
          name: global1.name,
          course: coursename,
          coursecode: coursecode,
          year: lmsyear
        }
      });
      fetchViewPage();
      setOpen(false);
      
    };
  
    const fetchViewPage = async () => {
      const response = await ep1.get('/api/v2/getmcoursematerialbyfac', {
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
      const response = await ep1.get('/api/v2/getmcoursematerialcountbyfac', {
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
      const response = await ep1.get('/api/v2/getmcoursematerialsecondbyfac', {
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
    //   fetchViewPage();
    //   getgraphdata();
    //   getgraphdatasecond();
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
const course=user.course;
const coursecode=user.coursecode;
const slideno=user.slideno;
const title=user.title;
const description=user.description;
const imagelink=user.imagelink;
const voicetext=user.voicetext;
const doclink=user.doclink;
const type=user.type;
const mode=user.mode;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatemcoursematerialbyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
course:course,
coursecode:coursecode,
slideno:slideno,
title:title,
description:description,
imagelink:imagelink,
voicetext:voicetext,
doclink:doclink,
type:type,
mode:mode,

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
      
          <Grid container spacing={3}>

        
<p>Generate reports with Gemini</p>
<br />
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Gemini API Key"  variant="outlined" inputRef={apikeyref} /><br /><br />
<br /><br />
 {/* <TextField id="outlined-basic"  type="number" sx={{ width: "100%"}} label="No. of modules"  variant="outlined" inputRef={modulesref} /><br /><br />
<br /><br /> */}
<TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Illness"  variant="outlined" inputRef={topicref} /><br /><br />
<br /><br />
 <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Keywords"  variant="outlined" inputRef={keywordsref} /><br /><br />
<br /><br />
 <Button onClick={createreport}
             variant="contained"
             color="secondary"
             style={{  fontSize: '12px', marginTop: '30px', height: '40px' }}
           >
             Generate through AI
           </Button>
<br /><br />






<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>



            <Grid item xs={12}>
              {/* <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
          
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
              </Paper> */}
            </Grid>
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
