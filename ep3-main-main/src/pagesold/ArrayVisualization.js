import React, { useState, useEffect } from 'react';
import { Button, Grid, TextField, Box, Container, Typography, Paper } from '@mui/material';
import * as d3 from 'd3';

const ArrayVisualization = () => {
  const [array, setArray] = useState([23, 11, 39, 76, 12, 1, 6, 32, 45]); // Initial array
  const [inputValue, setInputValue] = useState('');
  const [startIndex, setStartIndex] = useState('');
  const [deleteCount, setDeleteCount] = useState('');
  const [fillValue, setFillValue] = useState('');
  const [arrayLength, setArrayLength] = useState(5); 

  useEffect(() => {
    visualizeArray();
  }, [array]);

  const visualizeArray = () => {
    d3.select('#arrayContainer').selectAll('*').remove();
    const svg = d3.select('#arrayContainer')
      .append('svg')
      .attr('width', 900)
      .attr('height', 100);

    svg.selectAll('rect')
      .data(array)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 60 + 10)
      .attr('y', 20)
      .attr('width', 50)
      .attr('height', 50)
      .attr('fill', 'teal');

    svg.selectAll('text')
      .data(array)
      .enter()
      .append('text')
      .attr('x', (d, i) => i * 60 + 35)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '20px')
      .text(d => d);
  };

  const handleOperation = (operation) => {
    let newArray = [...array];

    switch (operation) {
      case 'push':
        if (!inputValue) {
          alert("Please enter a value to push into the array.");
        } else {
          newArray.push(Number(inputValue));
          alert(`${inputValue} has been pushed to the array.`);
        }
        setInputValue('');
        break;
      case 'pop':
        const poppedItem = newArray.pop();
        alert(`Popped item: ${poppedItem}`);
        break;
      case 'shift':
        const shiftedItem = newArray.shift();
        alert(`Shifted item: ${shiftedItem}`);
        break;
      case 'unshift':
        if (!inputValue) {
          alert("Please enter a value to unshift into the array.");
        } else {
          newArray.unshift(Number(inputValue));
          alert(`${inputValue} has been unshifted to the beginning of the array.`);
        }
        setInputValue('');
        break;
      case 'splice':
        if (startIndex === '' || deleteCount === '' || !inputValue) {
          alert("Please enter start index, delete count and input value for splice operation.");
        } else {
          newArray.splice(Number(startIndex), Number(deleteCount), inputValue ? Number(inputValue) : undefined);
          alert(`Array spliced with start index ${startIndex}, delete count ${deleteCount}, and added value ${inputValue}.`);
        }
        break;
      case 'reverse':
        newArray.reverse();
        alert("Array has been reversed, click on ok to see the changes");
        break;
      case 'sort':
        newArray.sort((a, b) => a - b);
        alert("Array has been sorted, click on ok to see the changes ");
        break;
      case 'fill':
        if (fillValue === '') {
          alert("Please enter fill value, start index, and end index for fill operation.");
        } else {
          newArray.fill(Number(fillValue));
          alert(`Array filled with value ${fillValue}`);
        }
        break;
      case 'slice':
        if (startIndex === '' || deleteCount === '') {
          alert("Please enter start index and end index for slice operation.");
        } else {
          newArray = newArray.slice(Number(startIndex), Number(deleteCount));
          alert(`Array sliced from index ${startIndex} to index ${deleteCount}.`);
        }
        break;
      default:
        break;
    }

    setArray(newArray);
  };

  const generateRandomArray = () => {
    if (isNaN(arrayLength) || arrayLength <= 0) {
      alert("Please enter a valid array length greater than 0.");
      return;
    }

    const randomArray = Array.from({ length: Number(arrayLength) }, () => Math.floor(Math.random() * 100));
    setArray(randomArray);
  };

  return (
    <Container sx={{ minWidth: "900px" }}>
      <Typography variant="h5"  style={{fontWeight:"bold"}} gutterBottom>
        Array Methods Visualization
      </Typography>

      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px', }}>
        <Typography variant="h6">Instructions</Typography>
        <Typography variant="body1">
          1. The current array is displayed and visualized below.
          <br />
          2. Enter the required input in the provided text fields if necessary.
          <br />
          3. Click on any of the buttons to perform the corresponding array operation.
          <br />
          4. The array will update, and you will see the changes reflected both textually and visually.
          <br />
          5. You can perform multiple operations sequentially.
        </Typography>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Current Array: {JSON.stringify(array)}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Array Length"
            variant="outlined"
            type="number"
            value={arrayLength}
            onChange={(e) => setArrayLength(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Input Value"
            variant="outlined"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Start Index"
            variant="outlined"
            value={startIndex}
            onChange={(e) => setStartIndex(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Delete Count"
            variant="outlined"
            value={deleteCount}
            onChange={(e) => setDeleteCount(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Fill Value"
            variant="outlined"
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('push')}>Push</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('pop')}>Pop</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('shift')}>Shift</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('unshift')}>Unshift</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('splice')}>Splice</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('reverse')}>Reverse</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('sort')}>Sort</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('fill')}>Fill</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => handleOperation('slice')}>Slice</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={generateRandomArray}>Generate Random Array</Button>
        </Grid>
      </Grid>

      <Box id="arrayContainer" sx={{ marginTop: '20px', minHeight: '120px' }}></Box>
    </Container>
  );
};

export default ArrayVisualization;
