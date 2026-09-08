import React, { useState, useRef, useEffect } from 'react';
import { Button, Slider, Box, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const InsertionSort = () => {
    const [array, setArray] = useState([32, 21, 55, 30, 97, 70, 89, 30, 45, 26, 32, 68]);
    const [speed, setSpeed] = useState(500);
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(null);
    const [sortedIdx, setSortedIdx] = useState([0]);
    const [swapCount, setSwapCount] = useState(0);
    const [timeTaken, setTimeTaken] = useState(0);
    const [open, setOpen] = useState(false); // State for dialog

    const sortingRef = useRef(false);
    const startTimeRef = useRef(null);

    useEffect(() => {
        return () => {
            sortingRef.current = false;
        };
    }, []);

    const insertionSort = async () => {
        let arr = [...array];
        let swaps = 0;
        startTimeRef.current = performance.now();

        for (let i = 1; i < arr.length; i++) {
            if (!sortingRef.current) return;
            let key = arr[i];
            let j = i - 1;

            while (j >= 0 && arr[j] > key) {
                if (!sortingRef.current) return;
                arr[j + 1] = arr[j];
                j -= 1;
                swaps += 1;
                setSwapCount(swaps);
                setCurrentIdx(j + 1);
                await new Promise((resolve) => setTimeout(resolve, speed));
                setArray([...arr]);
            }

            arr[j + 1] = key;
            setSortedIdx((prev) => [...prev, i]); 
            setArray([...arr]);
        }

        setSorting(false);
        sortingRef.current = false;
        setTimeTaken((performance.now() - startTimeRef.current) / 1000);
    };

    const startSorting = () => {
        setSorting(true);
        setPaused(false);
        sortingRef.current = true;
        setSwapCount(0);
        setTimeTaken(0);
        setSortedIdx([0]); 
        insertionSort();
    };

    const pauseSorting = () => {
        setPaused(true);
        setSorting(false);
        sortingRef.current = false;
    };

    const generateRandomArray = () => {
        const array = [];
        for (let i = 0; i < 12; i++) {
            array.push(Math.floor(Math.random() * 100) + 1);
        }
        return array;
    };

    const resetArray = () => {
        setSorting(false);
        setPaused(false);
        sortingRef.current = false;
        setArray(generateRandomArray());
        setCurrentIdx(null);
        setSortedIdx([0]); 
        setSwapCount(0);
        setTimeTaken(0);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Insertion Sort
            </Typography>
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Instructions
                </Typography>
                <ul>
                    <li>Click on the Start button to start the demo.</li>
                    <li>Move the slider to adjust the speed of the demo.</li>
                    <li>Click on the Pause button if you want to stop and manually click the Next button to have a step-by-step realization of the process.</li>
                    <li>Click on the Reset button to start all over with a new set of random numbers!</li>
                </ul>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, marginBottom: 2 }}>
                {array.map((value, index) => (
                    <Paper
                        key={index}
                        elevation={3}
                        sx={{
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: sortedIdx.includes(index)
                                ? '#4caf50' 
                                : index === currentIdx
                                    ? '#ff5722'
                                    : '#2196f3', 
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        {value}
                    </Paper>
                ))}
            </Box>

            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Observations
                </Typography>
                <ul>
                    <li>Number of Swaps: {swapCount}</li>
                    <li>Time Taken: {timeTaken.toFixed(2)} seconds</li>
                    <li>Element being iterated: {currentIdx !== null ? array[currentIdx] : 'N/A'}</li>
                </ul>
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, maxWidth: '300px' }}>
                <Typography>Min. Speed</Typography>
                <Slider
                    value={speed}
                    min={50}
                    max={2000}
                    onChange={(e, newValue) => setSpeed(newValue)}
                    sx={{ marginX: 2 }}
                />
                <Typography>Max. Speed</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={startSorting}
                    disabled={sorting && !paused}
                >
                    Start
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={resetArray}
                >
                    Reset
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={pauseSorting}
                    disabled={!sorting}
                >
                    Pause
                </Button>
                <Button
                    variant="contained"
                    color="info"
                    onClick={handleClickOpen}
                >
                    Show Algorithm
                </Button>
            </Box>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Insertion Sort Algorithm</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                            {`function insertionSort(array) {
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      j -= 1;
    }
    array[j + 1] = key;
  }
  return array;
}`}
                        </pre>
                        <Typography variant="h6" gutterBottom>
                            Steps of the Insertion Sort Algorithm:
                        </Typography>
                        <ol>
                            <li>
                                **Start from the second element**: Assume that the first element is sorted, then pick the next element (key).
                            </li>
                            <li>
                                **Compare the key with the previous elements**: Move elements that are greater than the key to one position ahead of their current position.
                            </li>
                            <li>
                                **Insert the key at its correct position**: Insert the key into its correct position among the sorted elements.
                            </li>
                            <li>
                                **Repeat for all elements**: Continue picking the next element as key and insert it into the sorted part of the array.
                            </li>
                        </ol>
                        <Typography>
                            This process continues until the entire array is sorted. The time complexity of Insertion Sort is O(n²) in the average and worst case, but it is more efficient than other quadratic sorting algorithms for small or nearly sorted data sets.
                    </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Close</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default InsertionSort;


