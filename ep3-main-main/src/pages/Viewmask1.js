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
    const questionref=useRef();
    const answerref=useRef();
    const institutionref=useRef();
    const doclinkref=useRef();

     const searchapi = async () => {

        //alert(doclinkref.current.value);

        const answer=answerref.current.value;
        const doclink='NA';
        //const doclink=doclinkref.current.value;

        if(!answer || !doclink) {
            alert('Please enter document link and answer');
            return;
        } else {
            alert('Thank you');
        }
           
    
    //     const coursetitle=coursetitleref.current.value;
    // const coursecode=coursecoderef.current.value;
    // const coursetype=coursetyperef.current.value;
    // const year=yearref.current.value;
    // const offeredtimes=offeredtimesref.current.value;
    // const duration=durationref.current.value;
    // const imagelink=imagelinkref.current.value;
    // const price=priceref.current.value;
    // const category=categoryref.current.value;
    // const department=departmentref.current.value;
    // const coursehours=coursehoursref.current.value;
    // const totalstudents=totalstudentsref.current.value;
    // const studentscompleted=studentscompletedref.current.value;
    // const dateadded=dateaddedref.current.value;
    
    const year=global1.year;
    const acreditation=global1.accreditation;
    const criteria=global1.criteria;
    const qno=global1.qno;
    const question=global1.question;
    //const answer=answerref.current.value;
    const sequence=global1.sequence;
    //const doclink=doclinkref.current.value;
    const type='Online';
    const level='Internal';
    
    
    //alert(coursetitle + '-' + dateadded);
    
        //alert(department);
        //setLoading(true);
        //setIsuploading(true);
        const response = await ep1.get('/api/v2/createnallaccransbyfac', {
            params: {
                user: user,
                token: token,
                colid: colid,
                name: name,
               year:year,
    acreditation:acreditation,
    criteria:criteria,
    qno:qno,
    question:question,
    answer:answer,
    sequence:sequence,
    doclink:doclink,
    type:type,
    level:level,
    
    status1:'Submitted',
                comments:''
    
            }
        });
        
        alert(response.data.status);
        //history.replace('/viewnaddonc');
  
       
    };

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
      const policy=questionref.current.value;
      const institution=institutionref.current.value;

      if(!keywords || !policy || !institution) {
        alert('Please enter Keywords and Question and Institution');
        return;
      }
      setOpen(true);

      const accreditation = global1.accreditation;
      const qno=global1.qno;
      
      //alert('Please wait while document is generated');
     

      //do whatever you want with the row
      //alert(row._id);
      const response = await epai1.get('/api/v1/getresponse2', {
          params: {
              user:user,
              colid:colid,
              prompt:'Create a detailed answer for ' + policy + ' for question no ' + qno + ' for ' + accreditation + ' accreditation ' + 'with focus on ' + keywords + ' with a list of supporting documents for ' + institution
          }

      });
      answerref.current.value=response.data.data.classes;
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
    element.download ='qualitative_' +  policy + ".html";
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
        const keywords=keywordsref.current.value;
      const policy=questionref.current.value;
      setOpen(true);
      const response = await ep1.get('http://4.240.102.83:8080/search', {
        params: {
          q: policy,
          f:keywords
        }
      });
    //   setRows(response.data.data.classes);
    //alert(response.data);
    answerref.current.value=response.data;
    setOpen(false);
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
    //   fetchViewPage();
    //   getgraphdata();
    //   getgraphdatasecond();
    //questionref.current.value=global1.question;
    //keywordsref.current.value=global1.keywords;

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

                <Box>
                    <p>This page used AI NLP (Natural Language Processing) to find answer from a knowledgebase.</p>
                    <br />
                    <p>The knowledgebase must be created by the user and uploaded to the server. For any questions on how to do it, please mail to team@epaathsala.com.</p>
                    <br /><br />

                    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Question"  variant="outlined" inputRef={questionref} /><br /><br />

                    <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label="Knowledgebase name"  variant="outlined" inputRef={keywordsref} /><br /><br />

                   

                    <TextField id="outlined-basic" multiline rows={12}  type="text" sx={{ width: "100%"}} label="Answer"  variant="outlined" inputRef={answerref} /><br /><br />

                </Box>
             

<br /><br />
<Button onClick={fetchViewPage}
             variant="contained"
             color="secondary"
             style={{  fontSize: '12px', marginTop: '-30px', height: '40px', width: '300px' }}
           >
             Generate through AI
           </Button>

           <br /><br />

           
              
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
