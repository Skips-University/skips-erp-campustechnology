
import { Alert, Paper, Button, Typography, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material';
import React, { useState } from 'react';
import styles from "./FullSubCircuitVerify.module.css";

const FullSubCircuitVerify = () => {
    const [show, setShow] = useState(false);
    const [showCircuit, setShowCircuit] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [inpVal, setInpVal] = useState({
        inpA: "",
        inpB: "",
        bin: "",
        inpDiff: "",
        inpBout: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (value === '' || value === '0' || value === '1') {
            setInpVal({
                ...inpVal,
                [name]: value
            });
        } else {
            alert('Please enter only 0 or 1');
            setInpVal({
                ...inpVal,
                [name]: ""
            });
        }
    };

    const checkTruthTable = () => {
        const { inpA, inpB, bin, inpDiff, inpBout } = inpVal;

        if (inpA !== "" && inpB !== "" && bin !== "" && inpDiff !== "" && inpBout !== "") {
            const isCorrect = (
                (inpA === "0" && inpB === "0" && bin === "0" && inpDiff === "0" && inpBout === "0") ||
                (inpA === "0" && inpB === "0" && bin === "1" && inpDiff === "1" && inpBout === "1") ||
                (inpA === "0" && inpB === "1" && bin === "0" && inpDiff === "1" && inpBout === "1") ||
                (inpA === "0" && inpB === "1" && bin === "1" && inpDiff === "0" && inpBout === "1") ||
                (inpA === "1" && inpB === "0" && bin === "0" && inpDiff === "1" && inpBout === "0") ||
                (inpA === "1" && inpB === "0" && bin === "1" && inpDiff === "0" && inpBout === "0") ||
                (inpA === "1" && inpB === "1" && bin === "0" && inpDiff === "0" && inpBout === "0") ||
                (inpA === "1" && inpB === "1" && bin === "1" && inpDiff === "1" && inpBout === "1")
            );

            setTableData([...tableData, { inpA, inpB, bin, inpDiff, inpBout, remarks: isCorrect }]);
        } else {
            alert("Please fill all the input fields");
        }
    };

    const handleReset = () => {
        setTableData([]);
        setInpVal({
            inpA: "",
            inpB: "",
            bin: "",
            inpDiff: "",
            inpBout: "",
        });
    };

    const handlePrintClick = () => {
        window.print();
    };

    const notify = () => {
        setShowCircuit(!showCircuit);
    };

    return (
        <Box>
            <Typography variant='h5' className={styles.heading}> Experiment to perform logic of Full Subtractor on kit</Typography>
            <Box className={styles.wrapper}>
                <Box className={styles.instructionBox}>
                    <Button variant='contained' onClick={() => setShow(!show)}>
                        Instructions
                    </Button>
                    {show && <Box className={styles.instruction}>
                        <p>{`1) Enter the Boolean input "A" and "B".`}</p>
                        <p>{`2) Enter the Boolean output for your corresponding inputs.`}</p>
                        <p>{`3) Click on "Check" button to verify your output.`}</p>
                        <p>{`4) Click "Print" if you want to get a printout of the Truth Table.`}</p>
                        <p>{`5) Click "Reset" if you want to reset inputs and outputs.`}</p>
                    </Box>}
                </Box>

                <Typography variant='h6' fontWeight="bold" marginTop="20px" bgcolor="lightblue" padding="10px" fontFamily="inherit">Verification of truth table for Full Subtractor Circuit</Typography>
                {showCircuit && <Alert severity="info" sx={{ marginTop: "10px" }} onClose={() => { setShowCircuit(false) }}>
                    The logic gate image is displayed below, please scroll down to see.
                </Alert>}

                <Box className={styles.diagramWrapper}>
                    <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-2343-FullSubCircuitVerify.png" alt="logicGate" width="600px" className={styles.logicGate} />

                    <input name='inpA' value={inpVal.inpA} placeholder='Input A' onChange={handleChange} className={`${styles.inputBox} ${styles.inpA}`} />
                    <input name='inpB' value={inpVal.inpB} placeholder='Input B' onChange={handleChange} className={`${styles.inputBox} ${styles.inpB}`} />
                    <input name='bin' value={inpVal.bin} placeholder='Input Bin' onChange={handleChange} className={`${styles.inputBox} ${styles.bin}`} />
                    <input name='inpDiff' value={inpVal.inpDiff} placeholder='Input Diff' onChange={handleChange} className={`${styles.inputBox} ${styles.inpDiff}`} />
                    <input name='inpBout' value={inpVal.inpBout} placeholder='Input Bout' onChange={handleChange} className={`${styles.inputBox} ${styles.inpBout}`} />

                    <Button variant='contained' color='success' onClick={checkTruthTable} className={styles.checkBtn}>Check</Button>
                    <Button variant='contained' color='error' className={styles.diagramBtn} onClick={notify}>Check diagram</Button>
                </Box>

                {showCircuit && <Box className={styles.circuitImage}>
                    <img src='https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-3743-FullSubLogicGate.png' alt="circuitImage" />
                </Box>}

                <Box className={styles.tableWrapper}>
                    <Box display="flex" justifyContent="space-between">
                        <Stack spacing={2} direction="row">
                            <Button variant="contained" color="error" onClick={handleReset}>Reset</Button>
                        </Stack>
                        <Button variant="contained" onClick={handlePrintClick}>Print</Button>
                    </Box>
                    <TableContainer component={Paper} style={{ height: "300px", border: "3px solid black", marginTop: "5px" }}>
                        <Table>
                            <TableHead>
                                <TableRow className={styles.tableHeadRow}>
                                    <TableCell>Serial No.</TableCell>
                                    <TableCell>Input A</TableCell>
                                    <TableCell>Input B</TableCell>
                                    <TableCell>Bin</TableCell>
                                    <TableCell>{`Diff (D)`}</TableCell>
                                    <TableCell>Bout</TableCell>
                                    <TableCell>Remarks</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.inpA}</TableCell>
                                        <TableCell>{row.inpB}</TableCell>
                                        <TableCell>{row.bin}</TableCell>
                                        <TableCell>{row.inpDiff}</TableCell>
                                        <TableCell>{row.inpBout}</TableCell>
                                        <TableCell>{row.remarks ? '✔️' : '❌'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
    );
}

export default FullSubCircuitVerify;
