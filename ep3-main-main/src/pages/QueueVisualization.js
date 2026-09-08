import React, { useState } from 'react';
import { Button, Box, Typography, Grid, Paper, Divider } from '@mui/material';
import * as d3 from 'd3';

const QueueVisualization = () => {
  const [queue, setQueue] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [instruction, setInstruction] = useState('');

  const handleEnqueue = () => {
    if (inputValue === '') {
      alert('Please enter a value');
      return;
    }
    const newQueue = [...queue, inputValue];
    setQueue(newQueue);
    setInputValue('');
    setInstruction(`
      Enqueue Operation:
      - Add the new value "${inputValue}" to the end of the queue.
      Algorithm:
      1. Check if input value is not empty.
      2. Add the input value to the end of the queue array.
      3. Update the queue visualization.
    `);
  };

  const handleDequeue = () => {
    if (queue.length === 0) {
      alert('Queue is empty');
      return;
    }
    const newQueue = [...queue];
    const dequeued = newQueue.shift();
    setQueue(newQueue);
    setInstruction(`
      Dequeue Operation:
      - Remove the value "${dequeued}" from the front of the queue.
      Algorithm:
      1. Check if the queue is not empty.
      2. Remove the first element from the queue array.
      3. Return the dequeued value.
      4. Update the queue visualization.
    `);
    alert(`Dequeued value: ${dequeued}`);
  };

  const handleFront = () => {
    if (queue.length === 0) {
      alert('Queue is empty');
      return;
    }
    const frontValue = queue[0];
    setInstruction(`
      Front Operation:
      - View the front value "${frontValue}" of the queue without removing it.
      Algorithm:
      1. Check if the queue is not empty.
      2. Access the first element of the queue array.
      3. Display the front value.
    `);
    alert(`Front value: ${frontValue}`);
  };

  const handleClear = () => {
    setQueue([]);
    setInstruction(`
      Clear Operation:
      - Remove all values from the queue.
      Algorithm:
      1. Set the queue array to an empty array.
      2. Update the queue visualization.
    `);
  };

  const handleClearHistory = () => {
  
    setInstruction(`
      History cleared:
      - All previous instructions are removed.
    `);
  };

  const visualizeQueue = () => {
    d3.select('#queueContainer').selectAll('*').remove();
    const svg = d3.select('#queueContainer')
      .append('svg')
      .attr('width', 600)
      .attr('height', 100);

    svg.selectAll('rect')
      .data(queue)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 60 + 10)
      .attr('y', 20)
      .attr('width', 50)
      .attr('height', 50)
      .attr('fill', 'teal');

    svg.selectAll('text')
      .data(queue)
      .enter()
      .append('text')
      .attr('x', (d, i) => i * 60 + 35)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '20px')
      .text(d => d);
  };

  React.useEffect(() => {
    visualizeQueue();
  }, [queue]);

  return (
    <Box padding={4}>
      <Box >
        <Typography variant="h5" style={{fontWeight:"bold"}} >Queue Visualization</Typography>
        <Paper elevation={3} sx={{ padding: '15px', marginTop: "10px", width: '90vw', backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6">Data Structures Overview: Queue</Typography>
          <Typography variant="body1" sx={{ marginBottom: '10px' }}>
            <strong>Queue:</strong>
            A queue is a linear data structure that follows the First In, First Out (FIFO) principle.
            The first element added to the queue is the first one to be removed. Common operations include:
          </Typography>
          <Typography variant="body2" sx={{ marginLeft: '20px' }}>
            1. <strong>Enqueue:</strong> Add an element to the end of the queue.<br />
            2. <strong>Dequeue:</strong> Remove the element from the front of the queue.<br />
            3. <strong>Front:</strong> View the front element of the queue without removing it.<br />
            4. <strong>Clear:</strong> Remove all elements from the queue.<br />
            5. <strong>Clear History:</strong> Remove all previous instruction logs.
          </Typography>
        </Paper>

        <Grid container spacing={2} style={{ marginTop: '20px' }}>
          <Grid item xs={12} md={6}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value"
              style={{padding:"10px"}}
            />
          </Grid>
          <Grid item xs={12} md={6} style={{display:"flex", gap:"10px"}}>
            <Button variant="contained" onClick={handleEnqueue}>Enqueue</Button>
            <Button variant="contained" onClick={handleDequeue} >Dequeue</Button>
            <Button variant="contained" onClick={handleFront} >Front</Button>
            <Button variant="contained" onClick={handleClear} >Clear</Button>
            <Button variant="contained" onClick={handleClearHistory} >Clear History</Button>
          </Grid>
        </Grid>

        {queue.length === 0 ? <Typography variant='h5' sx={{ textAlign: "center", marginTop: "100px" }}>Please push some value to see the Queue</Typography> : <Box id="queueContainer" sx={{ marginTop: '20px', minHeight: '100px' }}></Box>}
      </Box>

      <Paper elevation={3} sx={{ padding: '15px', maxWidth: '600px', backgroundColor: 'yellow', marginTop: "60px" }}>
        <Typography variant="h6">Instruction</Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {instruction || 'Select an operation to see its details and algorithm here.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default QueueVisualization;
