import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmclassenr1stud';
import AddUserModalBulk from './Addmclassenr1bulkstud';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import TextToSpeech from './TextToSpeech';
import { useNavigate } from 'react-router-dom';

import Tooltip from '@mui/material/Tooltip';

import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import Battery4BarIcon from '@mui/icons-material/Battery4Bar';
import BookIcon from '@mui/icons-material/Book';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuizIcon from '@mui/icons-material/Quiz';


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

    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;

    const regno=global1.regno;
    

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
        const response = await ep1.get('/api/v2/deleteclassenr1byfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const onButtonClickas = async(e, row) => {
      e.stopPropagation();
      global1.lmsyear=row.year;
      global1.faccoursename=row.course;
      global1.faccoursecode=row.coursecode;
      global1.lmsfaculty=row.user;
      navigate('/dashmmassignmentsstud');
    };
    
    const onButtonClickan = async(e, row) => {
      e.stopPropagation();
      global1.lmsyear=row.year;
      global1.faccoursename=row.course;
      global1.faccoursecode=row.coursecode;
      global1.lmsfaculty=row.user;
      navigate('/dashmmanouncementsstud');
    };
    
    const onButtonClickou = async(e, row) => {
      e.stopPropagation();
      global1.lmsyear=row.year;
      global1.faccoursename=row.course;
      global1.faccoursecode=row.coursecode;
      global1.lmsfaculty=row.user;
      navigate('/dashmmcoursecostud');
    };
    
    const onButtonClickca = async(e, row) => {
      e.stopPropagation();
      global1.lmsyear=row.year;
      global1.faccoursename=row.course;
      global1.faccoursecode=row.coursecode;
      global1.lmsfaculty=row.user;
      navigate('/dashmmcalendarstud');
    };
    
    const onButtonClickma = async(e, row) => {
      e.stopPropagation();
      global1.lmsyear=row.year;
      global1.faccoursename=row.course;
      global1.faccoursecode=row.coursecode;
      global1.lmsfaculty=row.user;
      navigate('/dashmmcoursematerialstud');
    };

    const onButtonClickq = async(e, row) => {
      e.stopPropagation();
      global1.lmsyear=row.year;
      global1.faccoursename=row.coursename;
      global1.faccoursecode=row.coursecode;
      global1.lmsfaculty=row.user;
      navigate('/dashmtestnewstud');
    };

    const columns = [
        // { field: '_id', headerName: 'ID' },

        {
          field:'semester',
          headerName:'Semester',
          type:'dropdown',
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
    field:'name',
    headerName:'Faculty',
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
  field:'program',
  headerName:'Program',
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
  field:'programcode',
  headerName:'Program code',
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
// {
// field:'student',
// headerName:'Student',
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
// {
// field:'regno',
// headerName:'Reg no',
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
// {
// field:'learning',
// headerName:'Learning level',
// type:'dropdown',
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
// {
// field:'gender',
// headerName:'Gender',
// type:'dropdown',
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
field:'classgroup',
headerName:'Class group',
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
field:'coursetype',
headerName:'Course type',
type:'dropdown',
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

// {
// field:'active',
// headerName:'Is active',
// type: "singleSelect",
//   valueOptions: ["Yes", "No"],
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

  
          { field: 'actions', headerName: 'Actions', width: 650, renderCell: (params) => {
            return (
              <div>
                <table>
                  <tr>
                    <td>
                    <Button
                onClick={(e) => onButtonClicksy(e, params.row)}
                variant="contained"
              >
                 <Tooltip title="Syllabus">
      <BookIcon />
      </Tooltip>
              </Button>
                    </td>
                    <td width="5px"></td>
                    <td>
    <Button
      onClick={(e) => onButtonClickas(e, params.row)}
      variant="contained"
    >
       <Tooltip title="Assignments">
      <AssignmentIcon />
      </Tooltip>
    </Button>
                    </td>
                    <td width="5px"></td>
                    <td>
    <Button
      onClick={(e) => onButtonClickou(e, params.row)}
      variant="contained"
    >
       <Tooltip title="Course outcome">
      <EmojiObjectsIcon />
      </Tooltip>
    </Button>
                    </td>
                    <td width="5px"></td>
                    <td>
    <Button
      onClick={(e) => onButtonClickma(e, params.row)}
      variant="contained"
    >
       <Tooltip title="Course material">
      <LibraryBooksIcon />
      </Tooltip>
    </Button>
                    </td>
                    <td width="5px"></td>
                    <td>
    <Button
      onClick={(e) => onButtonClickan(e, params.row)}
      variant="contained"
    >
       <Tooltip title="Course announcement">
      <AnnouncementIcon />
      </Tooltip>
    </Button>
                    </td>
                    <td width="5px"></td>
                    <td>
    <Button
      onClick={(e) => onButtonClickca(e, params.row)}
      variant="contained"
    >
       <Tooltip title="Course calendar">
      <CalendarMonthIcon />
      </Tooltip>
    </Button>
                    </td>
                    <td width="5px"></td>
                    <td>
    <Button
      onClick={(e) => onButtonClickq(e, params.row)}
      variant="contained"
    >
       <Tooltip title="Assessment">
      <QuizIcon />
      </Tooltip>
    </Button>
                    </td>
                  </tr>
                </table>
            
              </div>
            );
          } }
      ];


    const coursetitleref = useRef();

    const onButtonClicksy = async(e, row) => {
      e.stopPropagation();
      //do whatever you want with the row
      //alert(row._id);
      global1.lmsyear=row.year;
      global1.faccoursename=row.coursename;
      global1.faccoursecode=row.coursecode;
      navigate('/dashmmsyllabusstud');
    };
  
    const fetchViewPage = async () => {
      const response = await ep1.get('/api/v2/getclassenr1studbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user,
          regno: regno
        }
      });
      setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getclassenr1countbystud', {
        params: {
          token: token,
          colid: colid,
          user: user,
          regno: regno
        }
      });
      setResults(response.data.data.classes);
    };



    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getclassenr1secondbystud', {
        params: {
          token: token,
          colid: colid,
          user: user,
          regno: regno
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
const program=user.program;
const programcode=user.programcode;
const course=user.course;
const coursecode=user.coursecode;
const student=user.student;
const regno=user.regno;
const learning=user.learning;
const gender=user.gender;
const classgroup=user.classgroup;
const coursetype=user.coursetype;
const semester=user.semester;
const active=user.active;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updateclassenr1byfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
program:program,
programcode:programcode,
course:course,
coursecode:coursecode,
student:student,
regno:regno,
learning:learning,
gender:gender,
classgroup:classgroup,
coursetype:coursetype,
semester:semester,
active:active,

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

    const text =
    "Text-to-speech feature is now available on relatively any website or blog. It's a game changer that you can listen to the content instead of reading it. Especially effective for people with visual or cognitive impairments or on the go. I came up with the idea to implement it for my blog, so this is how I started researching this topic which ended up being a tutorial for you. So in this tutorial, we will go through the process of building a text-to-speech component in React. We will use the `Web Speech API` to implement the text-to-speech functionality.";

  
    return (
      <React.Fragment>
        <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        {/* <Box display="flex" marginBottom={4} marginTop={2}>
           
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
         </Box> */}


         {/* <TextToSpeech text={text} /> */}
         
          <Grid container spacing={3}>

          <Grid item xs={6}>
          
          <div style={{textAlign: 'center'}}>
          Semester wise summary
          </div>
          <br />
        <BarChart
    xAxis={[
      {
        id: 'barCategories',
        data: second.map((labels) => {
          return (
              labels._id        
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
          Course type summary
          </div>
 <br />
 <PieChart
 colors={['#D1A3B4','#BBD1A3', '#A3C4D1','#EDDBAC','#A6DAEE','#DEBFEB',,'#C85479','#F3646E','#AED3AD']} 
series={[
  {
    data: 
      results.map((labels1,i) => {
        return { id: i, value: parseInt(labels1.total_attendance)  , label: labels1._id}
        }),
  },
  
]}
width={400}
height={250}
/>

</Grid>



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
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
