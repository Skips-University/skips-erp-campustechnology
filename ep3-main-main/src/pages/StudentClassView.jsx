import React, { useState, useEffect } from "react";
import {
  Box, Button, Container, Typography, Grid, Paper, TextField,
  Card, CardContent, Divider, Chip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { GroupWork, CalendarToday, Schedule, School, Person } from "@mui/icons-material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";

const filterFields = [
  { label: "Program Code", name: "programcode" },
  { label: "Course Code", name: "coursecode" },
  { label: "Year", name: "year" },
  { label: "Semester", name: "semester" },
  { label: "Section", name: "section" },
];

export default function StudentClassView() {
  const navigate = useNavigate();
  const [allClasses, setAllClasses] = useState([]);
  const [displayClasses, setDisplayClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    programcode: "", coursecode: "", year: "", semester: "", section: ""
  });
  const [filterApplied, setFilterApplied] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch ALL classes based on filters
  const fetchAllClasses = async () => {
    setLoading(true);
    const params = { ...filters, colid: global1.colid };
    
    try {
      const res = await ep1.get("/api/v2/getallclasses", { params });
      setAllClasses(res.data);
      setDisplayClasses(res.data);
    } catch (error) {
      setAllClasses([]);
      setDisplayClasses([]);
    }
    setLoading(false);
  };

  const filterClassesByDate = (date) => {
    if (!date || !allClasses.length) {
      setDisplayClasses(allClasses);
      return;
    }
    
    const selectedDateStr = dayjs(date).format('YYYY-MM-DD');
    const filteredClasses = allClasses.filter(classItem => {
      const classDateStr = dayjs(classItem.classdate).format('YYYY-MM-DD');
      return classDateStr === selectedDateStr;
    });
    
    setDisplayClasses(filteredClasses);
  };

  const handleApplyFilter = () => {
    setFilterApplied(true);
    setSelectedDate(null);
    fetchAllClasses();
  };

  const handleCalendarDateChange = (newDate) => {
    setSelectedDate(newDate);
    filterClassesByDate(newDate);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Navigate to Student Breakout Room
  const handleNavigateToStudentBreakoutRoom = async (classData) => {
    try {
      // First check if student is assigned to any breakout room for this class
      const response = await ep1.get(`/api/v2/getstudentassignedroom?classid=${classData._id}&studentUser=${global1.user}&colid=${global1.colid}`);
      
      if (response.data.success) {
        // Student has an assigned room, navigate to it
        navigate(`/student-breakout-room/${response.data.roomid}`, {
          state: {
            classData: {
              classId: classData._id,
              coursecode: classData.coursecode,
              topic: classData.topic,
              classdate: classData.classdate,
              classtime: classData.classtime
            },
            studentUser: global1.user
          }
        });
      } else {
        // Student not assigned to any room
        alert("You are not assigned to any breakout room for this class yet. Please contact your instructor.");
      }
    } catch (error) {
      alert("Unable to access breakout room. Please try again later.");
    }
  };

  const columns = [
    { 
      field: "classdate", 
      headerName: "Date", 
      width: 120,
      renderCell: ({ value }) => (
        <Chip 
          icon={<CalendarToday />}
          label={dayjs(value).format("DD/MM/YY")}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    { 
      field: "classtime", 
      headerName: "Time", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip 
          icon={<Schedule />}
          label={value}
          size="small"
          color="secondary"
          variant="outlined"
        />
      )
    },
    { 
      field: "topic", 
      headerName: "Topic", 
      width: 300,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      )
    },
    { field: "module", headerName: "Module", width: 120 },
    { 
      field: "coursecode", 
      headerName: "Course", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color="info" />
      )
    },
    { 
      field: "classtype", 
      headerName: "Type", 
      width: 100,
      renderCell: ({ value }) => (
        <Chip 
          label={value} 
          size="small" 
          color={
            value === 'Online' ? 'success' : 
            value === 'Offline' ? 'warning' : 'info'
          }
        />
      )
    },
    {
      field: "instructor", 
      headerName: "Instructor", 
      width: 150,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Person fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {row.user || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      field: "actions", 
      headerName: "Actions", 
      width: 200,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1} flexWrap="wrap">
          {/* Breakout Room Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<GroupWork />}
            onClick={() => handleNavigateToStudentBreakoutRoom(row)}
            sx={{ 
              fontSize: '0.75rem',
              px: 1,
              py: 0.5,
              minWidth: 'auto',
              color: 'secondary.main',
              borderColor: 'secondary.main',
              '&:hover': {
                backgroundColor: 'secondary.light',
                borderColor: 'secondary.dark'
              }
            }}
          >
            Breakout
          </Button>
        </Box>
      )
    }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Student Header */}
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}
        >
          <Box textAlign="center">
            <Typography variant="h3" fontWeight={800} gutterBottom>
              🎓 My Class Schedule
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Welcome back, {global1.name}!
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
              View your classes, join meetings, and access breakout rooms
            </Typography>
          </Box>
        </Paper>

        {/* Filter Section */}
        <Card elevation={4} sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <School color="primary" />
              <Typography variant="h6" fontWeight={600} color="primary.main">
                Filter Your Classes
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {filterFields.map((field) => (
                <Grid item xs={12} sm={6} md={2} key={field.name}>
                  <TextField
                    label={field.label}
                    name={field.name}
                    value={filters[field.name]}
                    onChange={handleFilterChange}
                    size="small"
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
              ))}
              <Grid item xs={12} sm={6} md={2}>
                <Button 
                  onClick={handleApplyFilter} 
                  variant="contained" 
                  fullWidth
                  size="large"
                  sx={{ 
                    height: "100%",
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
            
            {!filterApplied && (
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  backgroundColor: 'info.light', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'info.main'
                }}
              >
                <Typography variant="body2" color="info.dark" textAlign="center">
                  📋 Please apply filters first to load your classes and enable calendar features.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Calendar and Classes Section */}
        {filterApplied && (
          <Grid container spacing={4} justifyContent={'center'} alignItems={'flex-start'}>
            {/* Calendar Section */}
            <Grid item xs={12} lg={4}>
              <Card elevation={4} sx={{ borderRadius: 3, height: 'fit-content' }}>
                <CardContent sx={{ p: 0 }}>
                  {/* Calendar Header */}
                  <Box 
                    sx={{ 
                      p: 3, 
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderRadius: '12px 12px 0 0'
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} textAlign="center">
                      📅 Select Date
                    </Typography>
                  </Box>
                  
                  {/* Calendar Body */}
                  <Box sx={{ 
                    p: 4, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center'
                  }}>
                    <DateCalendar
                      value={selectedDate}
                      onChange={handleCalendarDateChange}
                      sx={{
                        width: '100%',
                        maxWidth: '380px',
                        minWidth: '350px',
                        height: '280px',
                        '& .MuiPickersCalendarHeader-root': {
                          paddingLeft: 1,
                          paddingRight: 1,
                          marginBottom: 1,
                        },
                        '& .MuiDayCalendar-header': {
                          paddingLeft: 0,
                          paddingRight: 0,
                        },
                        '& .MuiDayCalendar-monthContainer': {
                          height: '200px',
                        },
                        '& .MuiPickersDay-root': {
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          width: '36px',
                          height: '36px',
                          margin: '2px',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white'
                          }
                        },
                        '& .MuiPickersDay-today': {
                          backgroundColor: 'secondary.main',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'secondary.dark',
                          }
                        },
                        '& .Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          }
                        },
                        '& .MuiPickersArrowSwitcher-root': {
                          '& .MuiIconButton-root': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                            }
                          }
                        },
                        '& .MuiPickersCalendarHeader-label': {
                          fontSize: '1.1rem',
                          fontWeight: 600,
                        }
                      }}
                    />
                  </Box>

                  {/* Selected Date Display */}
                  {selectedDate && (
                    <Box sx={{ px: 3, pb: 2 }}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'success.light',
                          borderRadius: 2,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="body1" fontWeight={600} color="success.dark">
                          Selected: {dayjs(selectedDate).format("DD MMMM YYYY")}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                  
                  {/* Class Count Info */}
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center', backgroundColor: 'info.light' }}>
                          <Typography variant="h6" fontWeight={700} color="info.dark">
                            {allClasses.length}
                          </Typography>
                          <Typography variant="caption" color="info.dark">
                            Total Classes
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center', backgroundColor: 'warning.light' }}>
                          <Typography variant="h6" fontWeight={700} color="warning.dark">
                            {displayClasses.length}
                          </Typography>
                          <Typography variant="caption" color="warning.dark">
                            {selectedDate ? 'On Date' : 'Showing'}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Classes Table Section */}
            <Grid item xs={12} lg={8}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  {/* Table Header */}
                  <Box 
                    sx={{ 
                      p: 3, 
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        📚 My Classes
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {selectedDate 
                          ? `Classes for ${dayjs(selectedDate).format("DD MMMM YYYY")}`
                          : "All your enrolled classes"
                        }
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${displayClasses.length} Classes`}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  {/* DataGrid */}
                  <Box sx={{ p: 3 }}>
                    <DataGrid
                      rows={displayClasses}
                      columns={columns}
                      getRowId={(row) => row._id}
                      loading={loading}
                      autoHeight
                      pageSizeOptions={[5, 10, 20]}
                      initialState={{
                        pagination: { paginationModel: { pageSize: 10 } }
                      }}
                      sx={{
                        border: 'none',
                        '& .MuiDataGrid-root': {
                          border: 'none'
                        },
                        '& .MuiDataGrid-cell': {
                          borderBottom: '1px solid #f0f0f0',
                          fontSize: '0.9rem'
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#f8f9fa',
                          borderBottom: '2px solid #e9ecef',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#495057'
                        },
                        '& .MuiDataGrid-row': {
                          '&:hover': {
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer'
                          },
                          '&:nth-of-type(even)': {
                            backgroundColor: '#fafbfc',
                          }
                        },
                        '& .MuiDataGrid-footerContainer': {
                          borderTop: '2px solid #e9ecef',
                          backgroundColor: '#f8f9fa'
                        },
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                      slots={{
                        noRowsOverlay: () => (
                          <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            height="300px"
                            flexDirection="column"
                            gap={2}
                          >
                            <Typography variant="h6" color="text.secondary">
                              📅 No Classes Found
                            </Typography>
                            <Typography color="text.secondary" textAlign="center">
                              {selectedDate 
                                ? `No classes scheduled for ${dayjs(selectedDate).format("DD MMMM YYYY")}`
                                : "No classes match your current filters"
                              }
                            </Typography>
                            {loading && (
                              <Typography variant="body2" color="primary">
                                Loading classes...
                              </Typography>
                            )}
                          </Box>
                        )
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </LocalizationProvider>
  );
}
