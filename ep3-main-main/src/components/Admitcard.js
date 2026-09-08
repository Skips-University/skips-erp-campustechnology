import React from 'react';
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
  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Admit Card
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1"><strong>Name:</strong> {student.name}</Typography>
            <Typography variant="body1"><strong>Roll No:</strong> {student.regno}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1"><strong>Semester:</strong> {student.semester}</Typography>
            <Typography variant="body1"><strong>Program:</strong> {student.programcode}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Subjects
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Subject Code</TableCell>
              <TableCell>Subject Name</TableCell>
              {/* <TableCell>Exam Date</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject, index) => (
              <TableRow key={index}>
                <TableCell>{subject.course}</TableCell>
                <TableCell>{subject.coursecode}</TableCell>
                {/* <TableCell>{subject.date}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default AdmitCard;
