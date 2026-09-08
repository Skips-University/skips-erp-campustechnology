import { Alert, Paper, Button, Typography, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Container,Checkbox, FormControlLabel } from '@mui/material'
import React, { useState } from 'react'
import styles from "../virtuallabcss/HalfSubCircuitVerifyGame.module.css"
import labgameCss from "../virtuallabcss/LabGame.module.css";
import global1 from "../pages/global1";


const HalfSubCircuitVerifyGame = () => {

    const username = global1.name;
    const regno = global1.regno;

    const [isChecked, setIsChecked] = useState(false);
    const [show, setShow] = useState(false)
    const [showCircuit, setShowCircuit] = useState(false)
    const [tableData, setTableData] = useState([])
    const [inpVal, setInpVal] = useState({
        inpA: "",
        inpB: "",
        inpDiff: "",
        inpBorrow: "",
    });

    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);

    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
    };

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
        const { inpA, inpB, inpDiff, inpBorrow } = inpVal


        if (inpA && inpB && inpDiff && inpBorrow !== "") {
            const isCorrect = (
                (inpA === "1" && inpB === "0" && inpDiff === "1" && inpBorrow === "0") ||
                (inpA === "0" && inpB === "1" && inpDiff === "1" && inpBorrow === "1") ||
                (inpA === "0" && inpB === "0" && inpDiff === "0" && inpBorrow === "0") ||
                (inpA === "1" && inpB === "1" && inpDiff === "0" && inpBorrow === "0")
            );
            setTableData([...tableData, { inpA, inpB, inpDiff, inpBorrow, remarks: isCorrect }]);
            if ((inpA === "1" && inpB === "0" && inpDiff === "1" && inpBorrow === "0") ||
                (inpA === "0" && inpB === "1" && inpDiff === "1" && inpBorrow === "1") ||
                (inpA === "0" && inpB === "0" && inpDiff === "0" && inpBorrow === "0") ||
                (inpA === "1" && inpB === "1" && inpDiff === "0" && inpBorrow === "0")) {
                setScore(prev => prev + 15)
            }
        } else {
            alert("Please fill all the input fields");
        }

    }

    const handleReset = () => {
        setTableData([])
    }



    const handlePrintClick = () => {
        window.print();
    };

    const notify = () => {
        setShowCircuit(!showCircuit)
    };

    const handleNext = () => {
        if (score > 30) {
            if (isChecked) {
                setScore(prev => prev + 20)
            }
            if (showCircuit) {
                setScore(prev => prev + 20)
            }
            setLevel(prev => prev + 1)
        } else {
            alert("You should score at least 50")
        }

    }


    return (
        <Container>
            <Container sx={{ display: 'flex', justifyContent: 'space-between', p: '20px' }}>
                <Box>
                    <Typography variant='h6' fontWeight="bold">
                        Student Name : {username}
                    </Typography>
                    <Typography variant='h6' fontWeight="bold">
                        Registration No. : {regno}
                    </Typography>
                </Box>
                {level <= 4 ? (
                    <Box >
                        <Typography variant='h6' borderRadius="5px" padding="8px 14px" fontWeight="bold" bgcolor="#B0DAFF" color="#021526" >
                            Score - {score}
                        </Typography>
                    </Box>
                ) : (
                    <Button variant='contained' sx={{ height: "40px" }} onClick={() => {
                        window.print()
                    }}>
                        Print Result
                    </Button>
                )}
            </Container>
            <Container>
                <Typography variant='h4' textAlign="center" fontWeight="bold" my={5}>
                    Experiment to perform logic of Half Subtractor on kit
                </Typography>
                {level > 0 && level < 2 && (
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor: "yellow", margin: "10px 0px" }}>
                        <Typography variant='h6' className={labgameCss.level}>
                            Level- {level}
                        </Typography>
                    </div>
                )}

            </Container>

            {
                level === 0 && (
                    <Container sx={{ margin: "20px auto", border: "5px solid grey" }}>
                        <Box>
                            <Typography variant='h6' textAlign="center" fontWeight="bold" >
                                Theory
                            </Typography>
                            <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="6px 20px">

                                A Half Adder-Subtractor is a combinational logic circuit that can perform both addition and subtraction of two single-bit binary numbers. This circuit combines the functionalities of a Half Adder (which performs addition) and a Half Subtractor (which performs subtraction), controlled by a Mode Selector (also called an operation control bit).
                            </Typography>
                            <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="6px 20px">
                                <b> {`Difference (D):`}</b> The result of the subtraction.<br />
                                <b>{`Borrow (Bout):`}</b> The borrow generated by the subtraction if needed.
                            </Typography>

                        </Box>
                        <Button
                            variant='contained'
                            sx={{ display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", my: "30px" }}
                            onClick={() => setLevel(prev => prev + 1)}
                        >
                            Start Experiment
                        </Button>
                    </Container>
                )
            }

            {level === 1 &&
                <Box className={styles.wrapper}>
                    <Box className={styles.instructionBox}>
                        <Button variant='contained' onClick={() => setShow(!show)}>
                            Instructions
                        </Button>
                        <Box >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isChecked}
                                        onChange={handleCheckboxChange}
                                        inputProps={{ 'aria-label': 'Read the Procedure' }}
                                        sx={{
                                            display: "block",
                                            transform: 'scale(1.1)',
                                            '& .MuiSvgIcon-root': { fontSize: 28 },
                                        }}
                                    />
                                }
                                label="Read and Note down the instruction."
                            />
                        </Box>
                        {show && <Box className={styles.instruction}>
                            <p>{`1) Enter the Boolean input "A" and "B".`}</p>
                            <p>{`2) Enter the Boolean output for your corresponding inputs. `} </p>
                            <p>{`3) Click on "Check" button to verify you output.`}   </p>
                            <p>{`4) Click "Print" if you want to get print out of the Truth Table.`}</p>
                            <p>{`5) Click "Reset" if you want to reset inputs and outputs`}</p>
                        </Box>}
                    </Box>



                    <Typography variant='h6' fontWeight="bold" marginTop="20px" bgcolor="lightblue" padding="10px" fontFamily="inherit">Verification of truth table for Half Subtractor Circuit</Typography>
                    {showCircuit && <Alert severity="info" sx={{ marginTop: "10px" }} onClose={() => { setShowCircuit(false) }}>
                        The logic gate image is displayed below please scroll down to see.
                    </Alert>}

                    <Box className={styles.diagramWrapper}>

                        <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-30-3941-halfSubCircuitVerify.png" alt="logicGate" width="600px" className={styles.logicGate} />

                        <input name='inpA' value={inpVal.inpA} placeholder='Input A' onChange={handleChange} className={`${styles.inputBox} ${styles.inpA}`} />
                        <input name='inpB' value={inpVal.inpB} placeholder='Input B' onChange={handleChange} className={`${styles.inputBox} ${styles.inpB}`} />
                        <input name='inpDiff' value={inpVal.inpDiff} placeholder='Input Diff' onChange={handleChange} className={`${styles.inputBox} ${styles.inpDiff}`} />
                        <input name='inpBorrow' value={inpVal.inpBorrow} placeholder='Input Borrow' onChange={handleChange} className={`${styles.inputBox} ${styles.inpBorrow}`} />
                        <Button variant='contained' color='success' onClick={checkTruthTable} className={styles.checkBtn} >Check</Button>
                        <Button variant='contained' color='error' className={styles.diagramBtn} onClick={notify}
                        >Check diagram</Button>



                    </Box>
                    <Box display="flex" alignItems="center" gap='20px'>

                        <Box className={styles.tableWrapper}>
                            <Box display="flex" justifyContent="space-between" >
                                <Stack spacing={2} direction="row" >
                                    <Button
                                        variant="contained"
                                        color="error"

                                        onClick={handleReset}
                                    >
                                        Reset
                                    </Button>
                                </Stack>
                                <Button
                                    variant="contained"
                                    onClick={handlePrintClick}
                                >
                                    Print
                                </Button>
                            </Box>
                            <TableContainer component={Paper} style={{ height: "300px", border: "3px solid black", marginTop: "5px" }}>
                                <Table>
                                    <TableHead >
                                        <TableRow className={styles.tableHeadRow}>
                                            <TableCell >Serial No.</TableCell>
                                            <TableCell >Input A</TableCell>
                                            <TableCell >Input B</TableCell>
                                            <TableCell >{`Difference (D)`}</TableCell>
                                            <TableCell >Borrow</TableCell>
                                            <TableCell >Remarks</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{row.inpA}</TableCell>
                                                <TableCell>{row.inpB}</TableCell>
                                                <TableCell>{row.inpDiff}</TableCell>
                                                <TableCell>{row.inpBorrow}</TableCell>
                                                <TableCell>{row.remarks ? '✔️' : '❌'}</TableCell>

                                            </TableRow>
                                        ))}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        {showCircuit && <Box className={styles.circuitImage}>
                            <img src='https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-30-4017-halfSubLogicGate.png' alt="circuitImage" />
                        </Box>}
                    </Box>
                    <Button
                        variant="contained"
                        color="success"
                        sx={{ ml: 2, width: "100px", margin: "30px auto", display: "flex" }}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </Box>
            }
             {
                level > 1 && (
                    <Container
                        sx={{
                            width: "100%",
                            height: "300px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                        }}
                    >
                        <Box
                            sx={{
                                width: "400px",
                                height: "200px",
                                bgcolor: score > 80 ? "lightblue" : "#ff0000",
                                padding: "20px",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px"
                            }}
                        >
                            <Box >
                                <Typography variant="h5">{score > 80 ? "Well Done  🎉" : ""}</Typography>
                                <Typography variant="subtitle1" sx={{ fontSize: "2rem" }}>
                                    Your total score is  <br />{score} / 100
                                </Typography>
                                {score <= 80 && (
                                    <Typography variant="subtitle1" sx={{ fontSize: "1rem" }}>
                                        You haven't completed the task properly
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                    </Container>)
            }
        </Container>
    )
}

export default HalfSubCircuitVerifyGame;