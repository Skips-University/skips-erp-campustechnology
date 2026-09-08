import ep1 from '../api/ep1';
import epai1 from '../api/epai';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmtestq';
import AddUserModalBulk from './Addmtestqbulk';
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
    const [rows2, setRows2] = useState([]);
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

    const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // const deadline = "December, 31, 2022";
  const deadline = global1.endtime;

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();

    if(time<=0) {
      alert('Exam over');
      navigate('/dashmtestnewstud');
    }

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(deadline), 1000);

    return () => clearInterval(interval);
  }, []);

    const [selectedImage, setSelectedImage] = useState(null);
  const handleImageUpload = (event) => {
    const image = event.target.files[0];
    setSelectedImage(URL.createObjectURL(image));
  };

    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;

    const regno=global1.regno;
    const student=global1.student;

    const lmsyear=global1.lmsyear;
    const faccoursecode=global1.faccoursecode;

    const testid=global1.testid;
    const year=global1.lmsyear;
    const coursecode=global1.faccoursecode;
    const coursename=global1.faccoursename;

    const [open, setOpen] = React.useState(false);
    const keywordsref=useRef();

    const [question, setQuestion] = useState();
    const [module, setModule] = useState();
    const [questionid, setQuestionid] = useState();
    const [options, setOptions] = useState([]);

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
        const response = await ep1.get('/api/v2/deletetestqbyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const onButtonClickq = async(e, row) => {
      e.stopPropagation();
      global1.questionid=row._id;
      
      navigate('/dashmtesto');
    };

    const onButtonClickoptions = async(questionid, question, module) => {
        setQuestion(question);
        setQuestionid(questionid);
        setModule(module);
        setOptions([]);
        setDialogopen(true);

        //fetchViewPageo();
        
       // navigate('/dashmtesto');
      };


    const onButtonClickm = async() => {
      //e.stopPropagation();


      
      const keywords=keywordsref.current.value;
      if(!keywords) {
        alert('Please enter Keywords');
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
              prompt:'Create ten MCQ questions with right and wrong options for ' + coursename + ' with focus on ' + keywords
          }

      });
      var backend= '<html><head><title>' + coursename + '</title></head><body>'; 
      backend=backend + '<br /><br />';
      backend=backend + '<h5>' + coursename +  '</h5><hr />';
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
    element.download = 'Sample_mcq_' + coursename + ".html";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
      //const a = await fetchViewPage();
  };


    const columns = [
        // { field: '_id', headerName: 'ID' },
    
//      {
// field:'testid',
// headerName:'Test id',
// type:'text',
// width:200,
// editable:true,
// valueFormatter: (params) => {
// if (params.value) {
// return params.value;
// } else {
// return '';
// }
// }
//  },
{
field:'question',
headerName:'Question',
type:'text',
width:400,
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
field:'option',
headerName:'Option',
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
// {
// field:'score',
// headerName:'Score',
// type:'text',
// width:200,
// editable:true,
// valueFormatter: (params) => {
// if (params.value) {
// return params.value;
// } else {
// return '';
// }
// }
//  },


  
         
      ];


    const coursetitleref = useRef();

    const fetchViewPage = async () => {
      const response = await ep1.get('/api/v2/gettestqbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          testid: testid
        }
      });
      setRows(response.data.data.classes);
      getgraphdata();
      getgraphdatasecond();
    };
  
    const fetchViewPage2 = async () => {
      const response = await ep1.get('/api/v2/gettestscoresstudbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          testid: testid,
          regno: regno
        }
      });
      setRows2(response.data.data.classes);
      getgraphdata();
      getgraphdatasecond();
    };

    const fetchViewPageo = async () => {
        const response = await ep1.get('/api/v2/gettestobyfac', {
          params: {
            token: token,
            colid: colid,
            user: user,
            testid: testid,
            questionid: questionid
          }
        });
        setOptions(response.data.data.classes);
      };



  const searchapi = async (difficulty,optionselected,score) => {

    const token=global1.token;
       

        const response = await ep1.get('/api/v2/createtestscoresbyfac', {
            params: {
                token:token,
                name: name,
                colid: colid,
                user: user,
                year:lmsyear,
    coursecode:faccoursecode,
    module:module,
    difficulty:difficulty,
    testid:testid,
    student:name,
    regno:regno,
    questionid:questionid,
    question:question,
    option:optionselected,
    score:score,
    status1:'Submitted',
                comments:''
    
            }
        });
      
    setDialogopen(false);
    fetchViewPage2();
       
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/gettestqcountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          testid: testid
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/gettestqsecondbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          testid: testid
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
      fetchViewPage2();
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
            const testid=user.testid;
const question=user.question;
const type=user.type;
const imagelink=user.imagelink;
const videolink=user.videolink;
const doclink=user.doclink;
const co=user.co;
const po=user.po;
const module=user.module;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updatetestqbyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            testid:testid,
question:question,
type:type,
imagelink:imagelink,
videolink:videolink,
doclink:doclink,
co:co,
po:po,
module:module,

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
      
          <Grid container spacing={3}>

         


<br />


<Dialog
        open={dialogopen}
        onClose={handleDialogclose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullScreen
      >
        <DialogTitle id="alert-dialog-title">
          {"Select or enter answer"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">


<Grid item xs={12}>
<Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
<Box>

  {question} 
 
  {/* Checking for {itemstocheck} */}
  <br /><br />


  <Button
             variant="contained"
             color="primary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '180px' }}
             onClick={() => fetchViewPageo()}
           >
             Load options
           </Button>

           <br /><br />


{options.map((meetup3) => {
                return (
                  <div>
                    <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                   <br />
                    {meetup3.option}
                    <br /><br />

                    {meetup3.imagelink=='NA' ? (
			<div>
        {/* No image available <br /><br /> */}
        
      </div>
			) : (
                <div> <img src={meetup3.imagelink} style={{ width: 600}} /><br /><br /></div>
			)} 

{meetup3.doclink=='NA' ? (
			<div>
        {/* No image available <br /><br /> */}
        
      </div>
			) : (
                <div> <a href={meetup3.doclink} target="_blank">{meetup3.doclink}</a><br /><br /></div>
			)} 

{meetup3.videolink=='NA' ? (
			<div>
        {/* No image available <br /><br /> */}
        
      </div>
			) : (
                <div> <a href={meetup3.videolink} target="_blank">{meetup3.videolink}</a><br /><br /></div>
			)} 


                    
                    {/* <img src={meetup3.imagelink} /><br /><br />
                    Document link <a href={meetup3.doclink} target="_blank">{meetup3.doclink}</a><br />
                    
                    Video link <a href={meetup3.videolink} target="_blank">{meetup3.videolink}</a><br />
                   */}

                    <Button
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '150px' }}
             onClick={() => searchapi(meetup3.difficulty,meetup3.option, meetup3.score)}
           >
             Select as Answer
           </Button>
           
                    {/* Image link {meetup3.imagelink}<br /><br />
                    Docu{meetup3.doclink}<br /><br /> */}
                    {/* Image link <a href={meetup3.imagelink} target="_blank">{meetup3.imagelink}</a><br /> */}
                   
                    </Paper>
                    <br /><br />
                  </div>
                   
                  

                );
            })}

 
 

</Box>
</Paper>
</Grid>

</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogclose} autoFocus>Close</Button>
          {/* <Button onClick={processpdf}>
            Check pdf
          </Button>
          <Button onClick={processimage}>
            Check image
          </Button> */}
        </DialogActions>
      </Dialog>






<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>

<br />


{/* // start render */}
<Grid item xs={12}>

  Time remaining {days} days {hours} hours {minutes} minutes {seconds} seconds

  <br /><br />

<h4>Questions</h4>
<br />



{rows.map((meetup3) => {
                return (
                  <div>
                    <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {/* Question<br /><br /> */}
                    {meetup3.question}
                    <br /><br />
                    
                    {meetup3.imagelink=='NA' ? (
			<div>
        {/* No image available <br /><br /> */}
        
      </div>
			) : (
                <div> <img src={meetup3.imagelink}  style={{ width: 600}} /><br /><br /></div>
			)} 

{meetup3.doclink=='NA' ? (
			<div>
        {/* No image available <br /><br /> */}
        
      </div>
			) : (
                <div> <a href={meetup3.doclink} target="_blank">{meetup3.doclink}</a><br /><br /></div>
			)} 

{meetup3.videolink=='NA' ? (
			<div>
        {/* No image available <br /><br /> */}
        
      </div>
			) : (
                <div> <a href={meetup3.videolink} target="_blank">{meetup3.videolink}</a><br /><br /></div>
			)} 



                    {/* <img src={meetup3.imagelink} /><br /><br /> */}
                    {/* Document link <a href={meetup3.doclink} target="_blank">{meetup3.doclink}</a><br /> */}
                    
                    {/* Video link <a href={meetup3.videolink} target="_blank">{meetup3.videolink}</a><br /> */}
                  

                    <Button
             variant="contained"
             color="secondary"
             style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
             onClick={() => onButtonClickoptions(meetup3._id,meetup3.question, meetup3.module)}
           >
             Options
           </Button>
           
                    {/* Image link {meetup3.imagelink}<br /><br />
                    Docu{meetup3.doclink}<br /><br /> */}
                    {/* Image link <a href={meetup3.imagelink} target="_blank">{meetup3.imagelink}</a><br /> */}
                   
                    </Paper>
                    <br /><br />
                  </div>
                   
                  

                );
            })}

  
  </Grid>

  {/* // end render */}

  <br /><br />





            <Grid item xs={12}>
              <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
              {/* <h1>Table Component</h1> */}

              Questions answered

              <br /><br />
             


                <DataGrid getRowId={(row) => row._id} 
                
        rows={rows2}
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
