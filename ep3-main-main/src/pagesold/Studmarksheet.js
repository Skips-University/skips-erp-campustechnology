// import React from 'react';
import React, { useEffect, useState, useRef } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
} from '@mui/material';

const student = {
  name: 'Alice Johnson',
  rollNumber: '23CS1024',
  class: '10th Grade',
  section: 'A',
};

const subjects = [
  { name: 'Mathematics', marks: 95 },
  { name: 'English', marks: 88 },
  { name: 'Science', marks: 91 },
  { name: 'History', marks: 85 },
  { name: 'Computer', marks: 98 },
];

const MarkSheet = () => {
//   const totalallMarks = subjects.reduce((acc, sub) => acc + sub.marks, 0);
//   const percentage = (totalMarks / (subjects.length * 100)) * 100;
  const [rows, setRows] = useState([]);
  const [tm, setTm] = useState(0);
  const [tp, setTp] = useState(0);
  const [photolink, setPhotolink] = useState('');
  
  const colid=global1.colid;
  const token=global1.token;

   const year=global1.msyear;
          const examcode=global1.msexamcode;
          const regno=global1.regno;
          const program=global1.msprogram;
          const semester=global1.mssemester;
          const insname=global1.insname;

   useEffect(() => {
      fetchViewPage();
      setPhotolink(global1.logo);
      //   getgraphdata();
      //   getgraphdatasecond();
      }, []);

  const fetchViewPage = async (e) => {
          //const semester1=e.target.value;
          //setSemester(e.target.value);
         

        const response = await ep1.get('/api/v2/getmexambyyrprogsem', {
          params: {
            token: token,
            colid: colid,
            year: year,
            examcode: examcode,
            program: program,
            semester: semester,
            regno: regno
          }
        });
        setRows(response.data.data.classes);
        setTm(response.data.data.classes.reduce((acc, sub) => acc + sub.totalmarks, 0));
        setTp(response.data.data.classes.reduce((acc, sub) => acc + sub.totalmarks, 0)/response.data.data.classes.length);
        
      };



  return (
     <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
    <Paper elevation={4} sx={{ padding: 4, maxWidth: 800, margin: 'auto',
        background: 'rgba(249, 244, 244, 0.75)',
        backdropFilter: 'blur(10px)',
        borderRadius: 4,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
     }}>
         <img src={photolink} width="100%" height="150px" />
         <br /><br />
          <Typography variant="h4" align="center" gutterBottom>
        {insname} 
      </Typography>
      <Typography variant="h4" align="center" gutterBottom>
        Student Mark Sheet
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle1"><strong>Name:</strong> {global1.name}</Typography>
          <Typography variant="subtitle1"><strong>Roll No:</strong> {global1.regno}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1"><strong>Program:</strong> {program}</Typography>
          <Typography variant="subtitle1"><strong>Semester:</strong> {semester}</Typography>
        </Grid>
      </Grid>

      {/* {program} {semester} {examcode} {year} {tm} {tp} */}

      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell align="center"><strong>Subject</strong></TableCell>
            <TableCell><strong>Internal</strong></TableCell>
            <TableCell><strong>External</strong></TableCell>
            <TableCell><strong>Total</strong></TableCell>
            <TableCell><strong>Percentage</strong></TableCell>
            <TableCell><strong>Grade</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((subject, index) => (
            <TableRow key={index}>
              <TableCell>{subject.course}</TableCell>
              <TableCell>{subject.iamarks}</TableCell>
              <TableCell>{subject.eamarks}</TableCell>
              <TableCell>{subject.totalmarks}</TableCell>
              <TableCell>{subject.totalp}</TableCell>
              <TableCell>{subject.egrade}</TableCell>
            </TableRow>
          ))}
          {/* <TableRow>
            <TableCell><strong>Total</strong></TableCell>
            <TableCell align="right"><strong>{totalMarks}</strong></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Percentage</strong></TableCell>
            <TableCell align="right"><strong>{percentage.toFixed(2)}%</strong></TableCell>
          </TableRow> */}
        </TableBody>
      </Table>
      <br />
      <Typography variant="subtitle1"><strong>Total marks obtained:</strong> {tm}</Typography>
          <Typography variant="subtitle1"><strong>Percentage:</strong> {tp}</Typography>
      
      <br /><br />
      <Grid container spacing={3}>
        <Grid item xs={6}>
            <Typography variant="subtitle1"><strong>Date of issue</strong></Typography>
        </Grid>
        <Grid item xs={6}>
             <Typography variant="subtitle1"><strong>Controller of Examination</strong></Typography>
        </Grid>


      </Grid>
    </Paper>
    </div>
  );
};

export default MarkSheet;
