import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, InputLabel, Select, MenuItem } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from './Addmexamtimetable';
import AddUserModalBulk from './Addmexamtimetablebulk';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportUserModal from './Export';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useNavigate } from 'react-router-dom';


function ViewPage() {
  const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [semesters, setSemesters] = useState([]);

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

     const [year, setYear] = useState(false);
        const [exam, setExam] = useState(false);
        const [program, setProgram] = useState(false);
        const [semester, setSemester] = useState(false);

    const user=global1.user;
    const token=global1.token;
    const colid=global1.colid;
    const name=global1.name;
    const regno=global1.regno;

       const accreditationref=useRef();
        const yearref=useRef();
        const examref=useRef();
        const programref=useRef();
        const semesterref=useRef();

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
        const response = await ep1.get('/api/v2/deleteexamtimetablebyfac', {
            params: {
                id: row._id,
                token: token,
                user: user
            }

        });
        alert(response.data.status);
        const a = await fetchViewPage();
    };

    const onButtonClickgo = async() => {
      // e.stopPropagation();
      //do whatever you want with the row
      //alert(row._id);
      global1.adexamcode=exam;
      global1.adprogram=program;
      global1.adsemester=semester;
      global1.adyear=yearref.current.value;
      navigate('/studadmitcard');
     
      
  };

  

    const onButtonClickadd = async(e, row) => {
        e.stopPropagation();
        //do whatever you want with the row
        //alert(row._id);
        const programcode=row.programcode;
        const course=row.course;
        const coursecode=row.coursecode;



         const response = await ep1.get('/api/v2/createexamadmitbyfac', {
        params: {
            user: user,
            token: token,
            colid: colid,
            name: name,
           year:year,
exam:exam,
examcode:exam,
program:program,
programcode:programcode,
course:course,
coursecode:coursecode,
semester:semester,
student:name,
regno:regno,
enabled:'No',
type:'NA',
level:'NA',

status1:'Submitted',
            comments:''

        }
    });

        // const response1 = await ep1.get('/api/v2/deleteexamtimetablebyfac', {
        //     params: {
        //         id: row._id,
        //         token: token,
        //         user: user
        //     }

        // });
        alert(response.data.status);
        // const a = await fetchViewPage();
    };

    const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

    const columns = [
        // { field: '_id', headerName: 'ID' },
    
   

{
field:'examdate',
headerName:'Exam date',
type:'Date',
width:200,
editable:false,
valueFormatter: (params) => {
if (params.value) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(params.value).toLocaleDateString(undefined, options);
// return params.value;
} else {
return '';
}
}
 },
{
field:'examslot',
headerName:'Exam time slot',
type:'String',
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
type:'String',
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
type:'String',
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


  
          { field: 'actions', headerName: 'Actions', width: 100, renderCell: (params) => {
            return (
            //   <Button
            //     onClick={(e) => onButtonClick(e, params.row)}
            //     variant="contained"
            //   >
            //     Delete
            //   </Button>
            <Button
                onClick={(e) => onButtonClickadd(e, params.row)}
                variant="contained"
              >
                Apply
              </Button>
            );
          } }
      ];


    const coursetitleref = useRef();


    
    
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
    
          const response = await ep1.get('/api/v2/getexamprograms', {
            params: {
              token: token,
              colid: colid,
              year:year,
              user: user,
              examcode: exam1
            }
          });
          setPrograms(response.data.data.classes);
        };

          const handleprogramchange = async (e) => {
    
          setProgram(e.target.value);
    
          const program1=e.target.value;
    
          
           // const year=e.target.value;
            //alert(year);
    
          const response = await ep1.get('/api/v2/getexamsemester', {
            params: {
              token: token,
              colid: colid,
              year:year,
              user: user,
              examcode: exam,
              program: program1
            }
          });
          setSemesters(response.data.data.classes);
        };
  
    const fetchViewPage = async (e) => {
        const semester1=e.target.value;
        setSemester(e.target.value);
      const response = await ep1.get('/api/v2/getexambyyrprogsem', {
        params: {
          token: token,
          colid: colid,
          year: year,
          examcode: exam,
          program: program,
          type: semester1
        }
      });
      setRows(response.data.data.classes);
    };

    const getgraphdata = async () => {
      const response = await ep1.get('/api/v2/getexamtimetablecountbyfac', {
        params: {
          token: token,
          colid: colid,
          user: user
        }
      });
      setResults(response.data.data.classes);
    };

    const getgraphdatasecond = async () => {
      const response = await ep1.get('/api/v2/getexamtimetablesecondbyfac', {
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
const examcode=user.examcode;
const examdate=user.examdate;
const examslot=user.examslot;
const program=user.program;
const programcode=user.programcode;
const course=user.course;
const coursecode=user.coursecode;
const type=user.type;

            //alert(coursetitle + ' - ' + studentscompleted);
             
     
            const response =await ep1.get('/api/v2/updateexamtimetablebyfac', {
            params: {
            id: user._id,
            user: user.user,
            token:token,
            name: user.name,
            colid: colid,
            year:year,
examcode:examcode,
examdate:examdate,
examslot:examslot,
program:program,
programcode:programcode,
course:course,
coursecode:coursecode,
type:type,

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

 <InputLabel id="program">Program</InputLabel>
       <Select labelId="program"
       onChange={handleprogramchange}
id="program"
inputRef={programref}
sx={{ width: '200px', height: '40px'}}
>
{/* <MenuItem value="AMBA">AMBA</MenuItem> */}

{programs.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}

</Select>

<InputLabel id="semester">Semester</InputLabel>
       <Select labelId="semester"
       onChange={fetchViewPage}
id="semester"
inputRef={semesterref}
sx={{ width: '200px', height: '40px'}}
>
{/* <MenuItem value="AMBA">AMBA</MenuItem> */}

{semesters.map((option) => (
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
                 Download admit card
                </Button>
     
          </Box>
          <br />


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
          <Grid container spacing={3}>

         



            {/* <Grid item xs={12}>
              <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>

              </Paper>
            </Grid> */}
          </Grid>
        </Container>
      </React.Fragment>
    );
  }
  
  export default ViewPage;
