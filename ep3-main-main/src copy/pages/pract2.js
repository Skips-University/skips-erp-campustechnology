import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import global1 from './global1';
import Title from '../Title';
import { Button, Box, Paper, Container, Grid } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddUserModal from '../Crud/Add';
import EditUserModal from '../Crud/Edit';
import DeleteUserModal from '../Crud/Delete';
import ExportPract1Modal from '../Crud/Export';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';


function Pract1() {
    const [rows, setRows] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openExport, setOpenExport] = useState(false);
    const [selectedUser, setSelectedUser] = useState();
    const [newUser, setNewUser] = useState({
      coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtime: '', imagelink: '',
      price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '', dateadded: ''
    });

    const handleDeleteClick = async (id) => {
        alert(id);
        // const response = await ep1.get('/api/v1/deleteaddoncbyfac', {
        //     params: {
        //         id: id,
        //         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVtb0BjYW1wdXMudGVjaG5vbG9neSIsImNvbGlkIjoiMzAiLCJpYXQiOjE3MTY3ODk5NTEsImV4cCI6MTcxNzUwOTk1MX0.eXO0DAHibVppz9hj2LkIEE3nMY8xPNxg1OmasdRus1s",
        //         user: "demo@campus.technology"
        //     }

        // });
        // alert(response.data.status);
        //const a=await fetchPract1();
      };

      const onButtonClick = async(e, row) => {
        e.stopPropagation();
        //do whatever you want with the row
        //alert(row._id);
        const response = await ep1.get('/api/v1/deleteaddoncbyfac', {
            params: {
                id: row._id,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVtb0BjYW1wdXMudGVjaG5vbG9neSIsImNvbGlkIjoiMzAiLCJpYXQiOjE3MTY3ODk5NTEsImV4cCI6MTcxNzUwOTk1MX0.eXO0DAHibVppz9hj2LkIEE3nMY8xPNxg1OmasdRus1s",
                user: "demo@campus.technology"
            }

        });
        alert(response.data.status);
        const a=await fetchPract1();
    };

    const columns = [
        // { field: '_id', headerName: 'ID' },
        {
          field: 'coursetitle',
          headerName: 'Course title',
          width: 200,
          editable: true,
        },
        {
          field: 'coursecode',
          headerName: 'Course code',
          width: 150,
          editable: true,
        },
        {
          field: 'duration',
          headerName: 'Duration',
          width: 110,
          editable: true,
        },
        {
          field: 'coursetype',
          headerName: 'Course type',
          width: 160,
          editable: true,
        },
        {
            field: 'coursehours',
            headerName: 'Course hours',
            type: 'number',
            width: 160,
            editable: true,
          },
          {
            field: 'dateadded',
            headerName: 'Date added',
            type: 'date',
            valueGetter: (value) => {
                if (!value) {
                  return new Date();
                }
                // Convert the decimal value to a percentage
                return new Date(value);
              },
            // valueFormatter: params => 
            //     dayjs(params?.value),
            width: 160,
            editable: true,
          },
        //   {
        //     field: 'actions',
        //     type: 'actions',
        //     headerName: 'Actions',
        //     width: 100,
        //     cellClassName: 'actions',
            
        //     getActions: ({ id }) => {
        //         return [
        //           <GridActionsCellItem
        //             icon={<DeleteIcon />}
        //             label="Delete"
        //             onClick={handleDeleteClick(id)}
        //             color="inherit"
        //           />,
        //         ];
        //       },
        //   },
          { field: 'actions', headerName: 'Actions', width: 400, renderCell: (params) => {
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
  
    const fetchPract1 = async () => {
      const response = await ep1.get('/api/v1/addoncdocs', {
        params: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVtb0BjYW1wdXMudGVjaG5vbG9neSIsImNvbGlkIjoiMzAiLCJpYXQiOjE3MTY2MzA5NzQsImV4cCI6MTcxNzM1MDk3NH0.sfg5Ie0OCSc-hA6A4uv8AR8bfjuWiu1ILhHdqKIrxxc',
          colid: 30,
        }
      });
      setRows(response.data.data.classes);
    };
  
    useEffect(() => {
      fetchPract1();
    }, []);
  
    const handleExport = () => {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pract1');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'Pract1_data.xlsx');
      setOpenExport(false);
    };
  
    const handleOpenAdd = () => {
      setOpenAdd(true);
    };
  
    const handleCloseAdd = () => {
      setOpenAdd(false);
      setNewUser({
        coursecode: '', coursetitle: '', year: '', coursetype: '', duration: '', offeredtime: '', imagelink: '',
        price: '', category: '', department: '', coursehours: '', totalstudents: '', studentscompleted: '', dateadded: ''
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
    const handleOpenEdit1 = (user) => {
    
            //const title=titleref.current.value;
            var coursetitle=user.coursetitle;
            const coursecode=user.coursecode;
            const coursetype=user.coursetype;
            const year=user.year;
            const offeredtimes=user.offeredtimes;
            const duration=user.duration;
            const imagelink=user.imagelink;
            const price=user.price;
            const category=user.category;
            const department=user.department;
            const coursehours=user.coursehours;
            const totalstudents=user.totalstudents;
            const studentscompleted=user.studentscompleted;
            const dateadded=user.dateadded;
             alert(coursetitle + ' - ' + dateadded);
             
   
            // const response = await ep1.get('/api/v1/updateaddoncbyfac', {
            // params: {
            // id: selectedUser._id,
            // user: 'demo@campus.technology',
            // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVtb0BjYW1wdXMudGVjaG5vbG9neSIsImNvbGlkIjoiMzAiLCJpYXQiOjE3MTY3MDMyODEsImV4cCI6MTcxNzQyMzI4MX0.iYCySX06YHLadFFzslKMBiZCSUB3junXp9TQTngSVR8',
            // name: 'demo',
            // colid: 30,
            // coursetitle:coursetitle,
            // coursecode:coursecode,
            // coursetype:coursetype,
            // year:year,
            // offeredtimes:offeredtimes,
            // duration:duration,
            // imagelink:imagelink,
            // price:price,
            // category:category,
            // department:department,
            // coursehours:coursehours,
            // totalstudents:totalstudents,
            // studentscompleted:studentscompleted,
            // dateadded:dateadded,
            // status1:'Submitted',
            // comments:''
            
            // }
            // });
    
            
    
            // const a = await fetchPract1();
           
            // alert(response.data.status);
  
  
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
            <Grid item xs={12}>
              <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                {/* <Title>Users</Title> */}
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
                    color="primary"
                    style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
                    onClick={() => setOpenExport(true)}
                  >
                    Export
                  </Button>

                  <Button onClick={fetchPract1}
                    variant="contained"
                    color="secondary"
                    style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}
                  >
                    Refresh
                  </Button>
                </Box>
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
  
                <AddUserModal
                  open={openAdd}
                  handleClose={handleCloseAdd}
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
  
                <ExportPract1Modal
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
  
  export default Pract1;
