import React, { useState, useRef, useEffect } from 'react';
import { Button, Slider, Box, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const SelectionSort = () => {
    const [array, setArray] = useState([32, 21, 55, 30, 97, 70, 89, 30, 45, 26, 32, 68]);
    const [speed, setSpeed] = useState(500);
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(null);
    const [minIdx, setMinIdx] = useState(null);
    const [sortedIdx, setSortedIdx] = useState([]);
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

    const selectionSort = async () => {
        let arr = [...array];
        let swaps = 0;
        startTimeRef.current = performance.now();

        for (let i = 0; i < arr.length; i++) {
            if (!sortingRef.current) return;
            setCurrentIdx(i);
            let minIndex = i;
            for (let j = i + 1; j < arr.length; j++) {
                if (!sortingRef.current) return;
                setCurrentIdx(j);
                setMinIdx(minIndex);

                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                    setMinIdx(minIndex);
                }
                await new Promise((resolve) => setTimeout(resolve, speed));
                setArray([...arr]);
            }

            if (minIndex !== i) {
                [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
                swaps += 1;
                setSwapCount(swaps);
            }

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
        setSortedIdx([]);
        selectionSort();
    };

    const pauseSorting = () => {
        setPaused(true);
        setSorting(false);
        sortingRef.current = false;
    };

    const resetArray = () => {
        setSorting(false);
        setPaused(false);
        sortingRef.current = false;
        setArray([32, 21, 55, 30, 97, 70, 89, 30, 45, 26, 32, 68]);
        setCurrentIdx(null);
        setMinIdx(null);
        setSortedIdx([]);
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
        <Box sx={{ padding: 4, minWidth: "900px" }}>
            <Typography variant="h4" gutterBottom>
                Selection Sort
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
                                : index === minIdx
                                    ? '#ff5722'
                                    : index === currentIdx
                                        ? '#ffc107'
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
                    <li>Minimum element in current iteration: {minIdx !== null ? array[minIdx] : 'N/A'}</li>
                </ul>
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, maxWidth: "300px" }}>
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
                            {`function selectionSort(array) {
  for (let i = 0; i < array.length; i++) {
    // Find the minimum element in the unsorted part
    let minIndex = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    // Swap the found minimum element with the first element
    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
    }
  }
  return array;
}`}
                        </pre>
                        <Typography variant="h6" gutterBottom>
                            Steps of the Selection Sort Algorithm:
                        </Typography>
                        <ol>
                            <li>
                                **Start with the first element**: Assume that the first element is the minimum in the array.
                            </li>
                            <li>
                                **Find the minimum element**: Traverse the remaining part of the array to find the actual minimum element.
                            </li>
                            <li>
                                **Swap**: Swap the found minimum element with the first element of the unsorted part of the array.
                            </li>
                            <li>
                                **Move to the next element**: Repeat the process for the next element, treating it as the first element of the unsorted part.
                            </li>
                            <li>
                                **Continue until the array is sorted**: Keep repeating the above steps until the entire array is sorted.
                            </li>
                        </ol>
                        <Typography>
                            This process continues until all elements are sorted. The time complexity of Selection Sort is O(n²), making it inefficient on large lists, and generally performs worse than the similar Insertion Sort.
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

export default SelectionSort;
