import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Grid, Paper, Divider } from '@mui/material';
import * as d3 from 'd3';

const StackVisualization = () => {
  const [stack, setStack] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [instruction, setInstruction] = useState('');

  const handlePush = () => {
    if (inputValue === '') {
      alert('Please enter a value');
      return;
    }
    const newStack = [...stack, inputValue];
    setStack(newStack);
    setInputValue('');
    setInstruction(`
      Push Operation:
      - Add the new value "${inputValue}" to the top of the stack.
      Algorithm:
      1. Check if input value is not empty.
      2. Add the input value to the end of the stack array.
      3. Update the stack visualization.
    `);
  };

  const handlePop = () => {
    if (stack.length === 0) {
      alert('Stack is empty');
      return;
    }
    const newStack = [...stack];
    const popped = newStack.pop();
    setStack(newStack);
    setInstruction(`
      Pop Operation:
      - Remove the value "${popped}" from the top of the stack.
      Algorithm:
      1. Check if the stack is not empty.
      2. Remove the last element from the stack array.
      3. Return the popped value.
      4. Update the stack visualization.
    `);
    alert(`Popped value: ${popped}`);
  };

  const handlePeek = () => {
    if (stack.length === 0) {
      alert('Stack is empty');
      return;
    }
    const topValue = stack[stack.length - 1];
    setInstruction(`
      Peek Operation:
      - View the top value "${topValue}" of the stack without removing it.
      Algorithm:
      1. Check if the stack is not empty.
      2. Access the last element of the stack array.
      3. Display the top value.
    `);
    alert(`Top value: ${topValue}`);
  };

  const handleClear = () => {
    setStack([]);
    setInstruction(`
      Clear Operation:
      - Remove all values from the stack.
      Algorithm:
      1. Set the stack array to an empty array.
      2. Update the stack visualization.
    `);
  };

  const handleClearHistory = () => {
    setInstruction(`
      History cleared:
      - All previous instructions are removed.
    `);
  };

  const visualizeStack = () => {
    const height = Math.max(300, stack.length * 40); 

    d3.select('#stackContainer').selectAll('*').remove();
    const svg = d3.select('#stackContainer')
      .append('svg')
      .attr('width', 200)
      .attr('height', height);

    svg.selectAll('rect')
      .data(stack)
      .enter()
      .append('rect')
      .attr('x', 50)
      .attr('y', (d, i) => height - (i + 1) * 40)
      .attr('width', 100)
      .attr('height', 30)
      .attr('fill', 'teal');

    svg.selectAll('text')
      .data(stack)
      .enter()
      .append('text')
      .attr('x', 100)
      .attr('y', (d, i) => height - (i + 1) * 40 + 20) 
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text(d => d);
  };

  useEffect(() => {
    visualizeStack();
  }, [stack]);

  return (
    <Box padding={4} >
      <Box >
        <Typography variant="h5" style={{fontWeight:"bold"}}>Stack Visualization</Typography>

        <Paper elevation={3} sx={{ padding: '15px', width: '90vw',marginTop:"10px", backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6">Data Structures Overview: Stack</Typography>
        <Typography variant="body1" sx={{ marginBottom: '10px' }}>
          <strong>Stack:</strong> 
          A stack is a linear data structure that follows the Last In, First Out (LIFO) principle. 
          The last element added to the stack is the first one to be removed. Common operations include:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '20px' }}>
          1. <strong>Push:</strong> Add an element to the top of the stack.<br/>
          2. <strong>Pop:</strong> Remove the element from the top of the stack.<br/>
          3. <strong>Peek:</strong> View the top element of the stack without removing it.<br/>
          4. <strong>Clear:</strong> Remove all elements from the stack.<br/>
          5. <strong>Clear History:</strong> Remove all previous instruction logs.
        </Typography>
      </Paper>

        <Grid container spacing={2} style={{ marginTop: '20px' }}>
          <Grid item  xs={12} md={6}>
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="Enter value" 
              style={{padding:"10px"}}
            />
          </Grid>
          <Grid item  xs={12} md={6} style={{display:"flex", gap:"10px"}}>
            <Button variant="contained" onClick={handlePush}>Push</Button>
            <Button variant="contained" onClick={handlePop} >Pop</Button>
            <Button variant="contained" onClick={handlePeek} >Peek</Button>
            <Button variant="contained" onClick={handleClear} >Clear</Button>
            <Button variant="contained" onClick={handleClearHistory} >Clear History</Button>
          </Grid>
        </Grid>
        {stack.length === 0 ? <Typography variant='h5' sx={{textAlign:"center", marginTop:"100px"}}>Please Push some value to see the stack</Typography>:<Box id="stackContainer" sx={{ marginTop: '20px', display:"flex", justifyContent:"center" }}></Box>}
      </Box>

      <Paper elevation={3} sx={{ padding: '15px', maxWidth: '600px',backgroundColor: 'yellow', marginTop:"60px" }}>
        <Typography variant="h6">Instruction</Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {instruction || 'Select an operation to see its details and algorithm here.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default StackVisualization;
