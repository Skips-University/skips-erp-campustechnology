import React, { useEffect, useState, useRef } from 'react';
import { 
  Container, 
  Button, 
  Stack, 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Paper, 
  TextField,
  Box
} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

export default function App() {
  const [avail, setAvail] = useState([]);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const programref=useRef();
  const programcoderef=useRef();
  
  const colid = global1.colid;
  const program = global1.program;
  const year = global1.year;
  const semester = global1.semester;
  const examode = global1.examode;

  //alert(`College ID: ${colid}, Program: ${program}, Year: ${year}, Semester: ${semester}, Exam Mode: ${examode}`);

  const fetchAvailable = async () => {
    try {
      const res = await ep1.get('/api/alloc/available', {
        params: {
          colid: colid,
          program: program,
          semester: semester,
          examode: examode,
          year: year
        }
      });
      
      const data = res.data;
      setAvail(data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch availability');
    }
  };

  useEffect(() => { 
    fetchAvailable(); 
  }, []);

  const handleChange = (course, value, max) => {
    let num = parseInt(value, 10) || 0;
    if (num > max) num = max;
    setInputs({ ...inputs, [course]: num });
  };

  const handleAllocate = async (course, max) => {
    const program1=programref.current.value;
    const programcode=programcoderef.current.value;
    if (!program1 || !programcode) {
      alert('Please enter faculty and faculty user id');
      return;
    }
    const count = inputs[course] || 0;
    
    if (count <= 0 || count > max) {
      alert('Enter a valid number (<= available)');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await ep1.post('/api/alloc/allocate', {
        course, 
        colid, 
        examode, 
        count,
        program1,
        programcode
      });
      
      const data = res.data;
      alert(`Allocated ${data.updatedCount} for ${course}`);
      fetchAvailable();
    } catch (err) {
      console.error(err);
      alert('Allocation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Faculty Allocation by Course</Typography>

        
        <Paper>
          <Box>
            <p>Add faculty (examiner) details for allocation</p>
            <p>Faculty</p>
            <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programref} /><br /><br />
            
            <p>Faculty user id </p>
            <TextField id="outlined-basic"  type="text" sx={{ width: "100%"}} label=""  variant="outlined" inputRef={programcoderef} /><br /><br />
            
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Available (faculty blank)</TableCell>
                <TableCell>Allocate Count</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {avail.map(({ course, available }) => (
                <TableRow key={course}>
                  <TableCell>{course}</TableCell>
                  <TableCell>{available}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={inputs[course] || ''}
                      onChange={(e) => handleChange(course, e.target.value, available)}
                      inputProps={{ min: 0, max: available }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      onClick={() => handleAllocate(course, available)} 
                      disabled={loading}
                    >
                      Allocate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Container>
  );
}
