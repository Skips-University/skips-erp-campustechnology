



import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Paper, Grid } from '@mui/material';

const BubbleSort = () => {
  const [array, setArray] = useState([]);
  const [iteration, setIteration] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [sorted, setSorted] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    resetArray();
  }, []);

  const resetArray = () => {
    const newArray = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 10);
    setArray(newArray);
    setIteration(0);
    setCurrentStep(0);
    setSorted(false);
    setHistory([]);
  };

  const startSorting = () => {
    if (sorted) return;
    setHistory([array]);
  };

  const nextStep = () => {
    if (sorted || currentStep >= array.length - iteration - 1) return;

    let arr = [...array];
    if (arr[currentStep] > arr[currentStep + 1]) {
      [arr[currentStep], arr[currentStep + 1]] = [arr[currentStep + 1], arr[currentStep]];
    }

    setArray(arr);
    setHistory([...history, arr]);
    setCurrentStep(currentStep + 1);

    if (currentStep >= array.length - iteration - 2) {
      setIteration(iteration + 1);
      setCurrentStep(0);
    }

    if (iteration >= array.length - 1) {
      setSorted(true);
    }
  };

  const swap = () => {
    if (sorted) return;

    let arr = [...array];
    if (arr[currentStep] > arr[currentStep + 1]) {
      [arr[currentStep], arr[currentStep + 1]] = [arr[currentStep + 1], arr[currentStep]];
    }

    setArray(arr);
    setHistory([...history, arr]);
  };

  const undo = () => {
    if (history.length <= 1) return;

    history.pop();
    setArray(history[history.length - 1]);
    setHistory([...history]);
  };

  const submit = () => {
    let isSorted = true;
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] > array[i + 1]) {
        isSorted = false;
        break;
      }
    }
    setSorted(isSorted);
    if (isSorted) {
      alert('Array is sorted correctly!');
    } else {
      alert('Array is not sorted correctly.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ minWidth: '700px', overflow: 'auto', p: 2 }}>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6">
            Bubble Sort Visualization
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Instructions</Typography>
        <ul>
          <li>Click on the <b>Start</b> button to start the exercise.</li>
          <li>Click on the <b>Swap</b> or <b>Next</b> to perform these operations.</li>
          <li>Click on <b>Submit</b> to check your result!</li>
          <li>Click on <b>Reset</b> to start over with a new set of numbers</li>
        </ul>
      </Paper>
      <Typography variant="h6">
        <b>Question:</b> Sort the given array using Bubble Sort.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2, overflowX: 'auto' }}>
        {array.map((value, index) => (
          <Paper
            key={index}
            sx={{
              backgroundColor: index === currentStep || index === currentStep + 1 ? 'green' : 'blue',
              color: 'white',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              m: 0.5,
              flexShrink: 0
            }}
          >
            {value}
          </Paper>
        ))}
      </Box>
      <Typography variant="h6">
        <b>Observations:</b>
      </Typography>
      <Typography>
        Number of iterations: {iteration}
      </Typography>
      <Grid container spacing={2} justifyContent="center" mt={2}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={startSorting} disabled={sorted}>
            Start
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={nextStep} disabled={sorted}>
            Next
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={swap} disabled={sorted}>
            Swap
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={undo}>
            Undo
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={submit}>
            Submit
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={resetArray}>
            Reset
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default BubbleSort;

