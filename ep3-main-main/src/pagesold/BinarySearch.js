import React, { useState } from 'react';
import { Button, Box, Grid, Typography, TextField, Modal } from '@mui/material';
import styles from "../virtuallabcss/BinarySearch.module.css";

const BinarySearch = () => {
    const [array, setArray] = useState(generateRandomSortedArray());
    const [target, setTarget] = useState('');
    const [currentIndices, setCurrentIndices] = useState({ low: null, mid: null, high: null });
    const [isSearching, setIsSearching] = useState(false);
    const [found, setFound] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    function generateRandomSortedArray() {
        const length = Math.max(Math.floor(Math.random() * 10) + 10, 10); // Ensures at least 10 elements
        const arr = Array.from({ length }, () => Math.floor(Math.random() * 100));
        return arr.sort((a, b) => a - b);
    }

    const binarySearch = async (arr, target) => {
        let low = 0;
        let high = arr.length - 1;
        setIsSearching(true);
        setFound(null);

        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            setCurrentIndices({ low, mid, high });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (arr[mid] === target) {
                setFound(mid);
                setIsSearching(false);
                alert(`Value found at index ${mid}`);
                return;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        setIsSearching(false);
        alert('Value not present in the array.');
    };

    const handleSearch = () => {
        if (target === '' || isNaN(target)) return;
        binarySearch(array, parseInt(target));
    };

    const generateNewArray = () => {
        setArray(generateRandomSortedArray());
        setTarget('');
        setCurrentIndices({ low: null, mid: null, high: null });
        setFound(null);
        setIsSearching(false);
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    return (
        <Box className={styles.container} sx={{ minWidth: "800px", width: "600px", padding: "40px", margin: "auto" }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "green" }}>Binary Search Visualization</Typography>
            <Box sx={{ backgroundColor: "rgba(181, 193, 142,.9)", padding: "6px", display:"flex", alignItems:"center"}}>
                <marquee>
                    <Box sx={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "baseline", padding:"0px",margin:"0px" }}>
                        <Typography variant="h6" gutterBottom className={`${styles.barHeading} ${styles.low}`}>
                            <div style={{ backgroundColor: "yellow", width: "4px", height: "10px" }} />Low value
                        </Typography>
                        <Typography variant="h6" gutterBottom className={`${styles.barHeading} ${styles.mid}`}>
                            <div style={{ backgroundColor: "green", width: "4px", height: "20px" }} /> Mid value
                        </Typography>
                        <Typography variant="h6" gutterBottom className={`${styles.barHeading} ${styles.high}`}>
                            <div style={{ backgroundColor: "red", width: "4px", height: "25px" }} /> High value
                        </Typography>
                    </Box>
                </marquee>
            </Box>
            <Grid container spacing={1} className={styles.barContainer}>
                {array.map((value, idx) => (
                    <Grid item key={idx}>
                        <Box
                            className={`${styles.bar} ${idx === found ? `${styles.found}` :
                                currentIndices.low === idx ? `${styles.low}` :
                                    currentIndices.mid === idx ? `${styles.mid}` :
                                        currentIndices.high === idx ? `${styles.high}` :
                                            ''
                                }`}
                            style={{ height: `${value * 3}px` }}
                        >
                            {value}
                        </Box>
                    </Grid>
                ))}
            </Grid>
            <Box mt={4}>
                <TextField
                    label="Target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    variant="outlined"
                    disabled={isSearching}
                />
            </Box>
            <Box mt={2}>
                <Button variant="contained" color="primary" onClick={handleSearch} disabled={isSearching}>
                    Start Search
                </Button>
                <Button variant="contained" color="secondary" onClick={generateNewArray} style={{ marginLeft: '10px' }}>
                    Generate New Array
                </Button>
                <Button variant="contained" color="info" onClick={handleOpenModal} style={{ marginLeft: '10px' }}>
                    Learn About Binary Search
                </Button>
            </Box>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="binary-search-modal-title"
                aria-describedby="binary-search-modal-description"
            >
                <Box sx={{ width: '600px', margin: 'auto', marginTop: '10%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: 24 }}>
                    <Typography id="binary-search-modal-title" variant="h5" component="h2" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                        Binary Search Algorithm
                    </Typography>
                    <Typography id="binary-search-modal-description" sx={{ mt: 2 }}>
                        Binary Search is an efficient algorithm for finding an item from a sorted list of items. 
                        It works by repeatedly dividing in half the portion of the list that could contain the item, 
                        until you've narrowed down the possible locations to just one.
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                        Algorithm Steps:
                    </Typography>
                    <ol>
                        <li>Start with the middle element of the sorted array.</li>
                        <li>If the target value is equal to the middle element, you've found the target.</li>
                        <li>If the target value is smaller than the middle element, repeat the search on the left half.</li>
                        <li>If the target value is larger than the middle element, repeat the search on the right half.</li>
                        <li>Repeat until the target value is found or the array cannot be split further.</li>
                    </ol>
                    <Button variant="contained" color="primary" onClick={handleCloseModal} sx={{ marginTop: "20px" }}>
                        Close
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
};

export default BinarySearch;
