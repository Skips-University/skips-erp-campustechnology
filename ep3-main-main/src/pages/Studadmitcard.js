// import React from 'react';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import ep1 from '../api/ep1';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Divider
} from '@mui/material';

const AdmitCard = ({ student, subjects }) => {

    const [rows, setRows] = useState([]);
    const [photolink, setPhotolink] = useState('');

    const logo=global1.logo;
    const insname=global1.insname;

     const user=global1.user;
        const token=global1.token;
        const colid=global1.colid;
        const name=global1.name;
        const regno=global1.regno;

        const semester=global1.semester;
        const programcode=global1.programcode;

        const adsemester=global1.adsemester;
        const examcode=global1.adexamcode;
        const adprogram=global1.adprogram;
        const adyear=global1.adyear;


        useEffect(() => {
            //   fetchViewPage();
            //   getgraphdata();
            //   getgraphdatasecond();
            fetchViewPage();
            getphotolink();
            }, []);

            const fetchViewPage = async () => {
                    
                  const response = await ep1.get('/api/v2/getadmitprogs', {
                    params: {
                      token: token,
                      colid: colid,
                      year: adyear,
                      examcode: examcode,
                      program: adprogram,
                      semester: adsemester,
                      regno: regno
                    }
                  });
                  setRows(response.data.data.classes);
                };

                 const getphotolink = async () => {
                    
                  const response = await ep1.get('/api/v2/getphotolink', {
                    params: {
                      token: token,
                      colid: colid,
                      email: user
                    }
                  });
                  var photolink1=response.data.photo;
                  if(!photolink1) {
                    photolink1='https://onehourchallenge.in/learn/user1.png';
                  }
                  // setRows(response.data.data.classes);
                  setPhotolink(photolink1);
                  //alert(response.data.photo);
                };


  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
       <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <Paper elevation={3} sx={{ padding: 4,
         background: 'rgba(249, 244, 244, 0.75)',
        backdropFilter: 'blur(10px)',
        borderRadius: 4,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
       }}>
         <img src={logo} width="100%" height="150px" />
         <br /><br />
         <Typography variant="h4" gutterBottom align="center">
          {insname}
        </Typography>
        <Typography variant="h5" gutterBottom align="center">
          Admit Card for {examcode}
        </Typography>

        <Typography variant="h5" gutterBottom align="center">
          
        </Typography>

       

        {/* {adyear} {adsemester} {examcode} {adprogram} {regno} {colid} <br /> */}

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          
          <Grid item xs={8}>
            <Typography variant="body1"><strong>Name:</strong> {name}</Typography>
            <Typography variant="body1"><strong>Roll No:</strong> {regno}</Typography>
             <Typography variant="body1"><strong>Semester:</strong> {semester}</Typography>
            <Typography variant="body1"><strong>Program:</strong> {programcode}</Typography>
          </Grid>
          <Grid item xs={4}>
            <img src={photolink} width="100px" height="100px" />
          </Grid>
        </Grid>

        {/* <Grid container spacing={2}>
          
          <Grid item xs={6}>
            <Typography variant="body1"><strong>Name:</strong> {name}</Typography>
            <Typography variant="body1"><strong>Roll No:</strong> {regno}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1"><strong>Semester:</strong> {semester}</Typography>
            <Typography variant="body1"><strong>Program:</strong> {programcode}</Typography>
          </Grid>
        </Grid> */}

        <Divider sx={{ my: 2 }} />

        {/* <Typography variant="h6" gutterBottom>
          Subjects
        </Typography> */}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Subject Code</TableCell>
              <TableCell>Subject Name</TableCell>
              {/* <TableCell>Exam Date</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((subject, index) => (
              <TableRow key={index}>
                <TableCell>{subject.course}</TableCell>
                <TableCell>{subject.coursecode}</TableCell>
                {/* <TableCell>{subject.date}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <br />
        <p>
            1. Please make sure your photo is visible in the admit card. 
        </p>
        <p>
          2. Carry a valid Govt Issued photo identity card with you.
        </p>
     
      </Paper>
      </div>
    </Container>
  );
};

export default AdmitCard;
