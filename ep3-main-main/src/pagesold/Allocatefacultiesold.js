import React, { useEffect, useState } from 'react';
import { Container, Button, Stack, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

const API_BASE = process.env.REACT_APP_API || 'http://localhost:4000/api/alloc';

export default function App() {
const [avail, setAvail] = useState([]);
const [inputs, setInputs] = useState({});
const [loading, setLoading] = useState(false);

const colid=global1.colid;
const program=global1.program;
const year=global1.year;
const semester=global1.semester;
const examode=global1.examode;

const fetchAvailable = async () => {
try {
// const res = await fetch(`${API_BASE}/available`);
const res = await ep1.get('/api/alloc/available', { 
    params: { 
        colid : colid,
        program : program,
        semester : semester,
        examode : examode,
        year : year                                                       
    } 
});
console.log(res.result);
// const data = await res.json();
setAvail(res.result);
} catch (err) {
console.error(err);
alert('Failed to fetch availability');
}
};

useEffect(() => { fetchAvailable(); }, []);

const handleChange = (course, value, max) => {
let num = parseInt(value, 10) || 0;
if (num > max) num = max;
setInputs({ ...inputs, [course]: num });
};

const handleAllocate = async (course, max) => {
const count = inputs[course] || 0;
if (count <= 0 || count > max) {
alert('Enter a valid number (<= available)');
return;
}
setLoading(true);
try {
// const res = await fetch(`${API_BASE}/allocate`, {
const res = await ep1.post('/api/alloc/allocate', {
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ course, colid, count })
});
const data = await res.json();
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
<Container sx={{ mt: 4 }}>
<Typography variant="h4" gutterBottom>Faculty Allocation by Course</Typography>

<Paper sx={{ p: 2 }}>
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
<Button variant="contained" onClick={() => handleAllocate(course, available)} disabled={loading}>Allocate</Button>
</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</Paper>
</Container>
);

}