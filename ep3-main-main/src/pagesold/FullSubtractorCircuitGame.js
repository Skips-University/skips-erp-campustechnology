import { Paper, Button, Typography, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Container, Checkbox, FormControlLabel } from '@mui/material'
import React, { useEffect, useState } from 'react'
import styles from "../virtuallabcss/FullSubtractorCircuit.module.css"
import labgameCss from "../virtuallabcss/LabGame.module.css";
import global1 from "../pages/global1";

const FullSubtractorCircuitGame = () => {

    const username = global1.name;
    const regno = global1.regno;

    const [show, setShow] = useState(false)
    const [powersupplyOn, setPowersupplyOn] = useState(false)
    const [inputAOn, setInputAOn] = useState(false)
    const [inputBOn, setInputBOn] = useState(false)
    const [binOn, setBinOn] = useState(false)
    const [ledOn1, setLedOn1] = useState(false)
    const [ledOn2, setLedOn2] = useState(false)
    const [tableData, setTableData] = useState([])


    const [isChecked, setIsChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);

    const [turn, setTurn] = useState({
        led1On: 0,
        led2On: 0,
        ledbothOn: 0,
        addled1On: 0,
        addled2On: 0,
        addbothLedOn: 0
    })


    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
        if (event.target.checked) {
            setScore(prev => prev + 20)
        } else {
            setScore(prev => prev - 20)
        }
    };

    const handleSwitch = (btn) => {
        if (powersupplyOn) {
            if (btn === "inpA") {
                setInputAOn(!inputAOn)
            } else if (btn === "inpB") {
                setInputBOn(!inputBOn)
            } else {
                setBinOn(!binOn)
            }
        } else {
            alert("Please turn on the Power Supply ")
        }
    }

    useEffect(() => {
        if (powersupplyOn) {
            if ((!inputAOn && inputBOn && !binOn) || (!inputAOn && !inputBOn && binOn) || (inputAOn && inputBOn && binOn)) {
                setLedOn1(true)
                setLedOn2(true)

            } else if (inputAOn && !inputBOn && !binOn) {
                setLedOn2(false)
                setLedOn1(true)
                // setTurn((prev) => ({ ...prev, led2On: prev.led2On + 1 }))
            } else if (!inputAOn && inputBOn && binOn) {
                setLedOn2(true)
                setLedOn1(false)
                // setTurn((prev) => ({ ...prev, ledbothOn: prev.ledbothOn + 1 }))
            } else {
                setLedOn1(false)
                setLedOn2(false)
            }
        } else {
            setInputAOn(false)
            setInputBOn(false)
            setBinOn(false)
        }

    }, [powersupplyOn, inputAOn, inputBOn, binOn])


    const handleNext = () => {
        if (score >= 50) {
            setLevel(prev => prev + 1)
        } else {
            alert("you should score atleast 50 ")
        }
    }

    const handleAdd = () => {
        if (powersupplyOn) {

            if (inputAOn && !inputBOn && !binOn) {
                setTableData([...tableData, { inpA: 1, inpB: 0, bin: 0, diff: 1, bout: 0 }])
                if (turn.led1On < 1) {
                    setScore(prev => prev + 20)
                    setTurn((prev) => ({ ...prev, led1On: prev.led1On + 1 }))
                }
            } else if (!inputAOn && inputBOn && !binOn) {
                setTableData([...tableData, { inpA: 0, inpB: 1, bin: 0, diff: 1, bout: 1 }])
                if (turn.ledbothOn < 1) {
                    setScore(prev => prev + 10)
                    setTurn((prev) => ({ ...prev, ledbothOn: prev.ledbothOn + 1 }))
                }

            } else if (!inputAOn && !inputBOn && binOn) {
                setTableData([...tableData, { inpA: 0, inpB: 0, bin: 1, diff: 1, bout: 1 }])
                if (turn.ledbothOn > 1 && turn.ledbothOn < 2) {
                    setScore(prev => prev + 10)
                    setTurn((prev) => ({ ...prev, ledbothOn: prev.ledbothOn + 1 }))
                }
            } else if (inputAOn && inputBOn && !binOn) {
                setTableData([...tableData, { inpA: 1, inpB: 1, bin: 0, diff: 0, bout: 0 }])

            } else if (inputAOn && !inputBOn && binOn) {
                setTableData([...tableData, { inpA: 1, inpB: 0, bin: 1, diff: 0, bout: 0 }])
            } else if (!inputAOn && inputBOn && binOn) {
                setTableData([...tableData, { inpA: 0, inpB: 1, bin: 1, diff: 0, bout: 1 }])
                if (turn.led2On < 1) {
                    setScore(prev => prev + 20)
                    setTurn((prev) => ({ ...prev, led2On: prev.led2On + 1 }))
                }
            } else if (inputAOn && inputBOn && binOn) {
                setTableData([...tableData, { inpA: 1, inpB: 1, bin: 1, diff: 1, bout: 1 }])
                if (turn.ledbothOn > 2 && turn.ledbothOn < 3) {
                    setScore(prev => prev + 20)
                    setTurn((prev) => ({ ...prev, ledbothOn: prev.ledbothOn + 1 }))
                }
            } else {
                setTableData([...tableData, { inpA: 0, inpB: 0, bin: 0, diff: 0, bout: 0 }])
            }
        } else {
            alert("Please Perfom experiment to add the data in table")
        }

    }
    const handleReset = () => {
        setTableData([])
    }


    const handlePrintClick = () => {
        window.print();
    };

    return (
        <Box>
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
                    Experiment to perform logic of Full Subtractor on kit
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
                                A Full Subtractor is a combinational logic circuit that performs subtraction of three binary bits: the minuend (A), the subtrahend (B), and the borrow-in (Bin), producing two outputs: difference (D) and borrow-out (Bout). The Full Subtractor accounts for cases where borrowing from a higher significant bit is necessary, making it more versatile than the Half Subtractor, which only subtracts two bits.
                            </Typography>
                            <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="6px 20px">
                                <b>The subtraction logic follows these rules:</b><br />
                                When subtracting three bits, if you subtract 1 from 0, you will need to borrow (Bout = 1) from the next significant bit, and the difference will be adjusted accordingly.
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
            {level >= 1 && level < 2 &&
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
                            <p>{`1) Connect the Supply(+5V) to the IC.( on Power Supply Switch)`}</p>
                            <p>{`2) Press the Switches from inputs "A" and "B" and "Bin" . `} </p>
                            <p>The switch On is state <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" alt='swtichOn' width={40} />
                                and the switch in OFF state is <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png" alt="switchOff" width={40} />
                            </p>
                            <p>{`3) Click "Add" To Obtain the Truth Table For different Input`}</p>
                            <p>{`4) After Obtaining Truth Table Click "Print"`}</p>
                        </Box>}
                    </Box>

                    <Box className={styles.diagram}>

                        <Box className={styles.diagramWrapper}>
                            <img src=" https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-29-348-fullSub.png" alt="logicGate" width="1000px" className={styles.logicGate} />

                            <Box className={`${styles.powerBtnBox} ${styles.commonSwitchStyle}`}>
                                <Typography variant='body2'>Power Supply</Typography>
                                <img src={powersupplyOn ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png"}
                                    alt='swtich' className={`${styles.switch} `} onClick={() => setPowersupplyOn(!powersupplyOn)} />
                            </Box>
                            <Box className={`${styles.inpABtnBox} ${styles.commonSwitchStyle}`}>
                                <Typography variant='body2'>Input A</Typography>
                                <img src={inputAOn ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png"}
                                    alt='swtich' className={`${styles.switch} `} onClick={() => handleSwitch("inpA")} />
                            </Box>
                            <Box className={`${styles.inpBBtnBox} ${styles.commonSwitchStyle}`}>
                                <Typography variant='body2'>Input B</Typography>
                                <img src={inputBOn ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png"}
                                    alt='swtich' className={`${styles.switch}`} onClick={() => handleSwitch("inpB")} />
                            </Box>
                            <Box className={`${styles.binBtnBox} ${styles.commonSwitchStyle}`}>
                                <Typography variant='body2'>Bin</Typography>
                                <img src={binOn ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png"}
                                    alt='swtich' className={`${styles.switch}`} onClick={() => handleSwitch("bin")} />
                            </Box>

                            <img src={ledOn1 ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-16-5543-bulbon.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-16-5510-bulboff.png"}
                                alt='swtich' className={` ${styles.ledBtn1}`} />

                            <img src={ledOn2 ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-16-5543-bulbon.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-16-5510-bulboff.png"}
                                alt='swtich' className={` ${styles.ledBtn2}`} />
                        </Box>

                    </Box>

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
                                <Button
                                    variant="contained"
                                    color="primary"

                                    onClick={handleAdd}
                                >
                                    Add
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
                                        <TableCell >Bin</TableCell>
                                        <TableCell >{`Difference (D)`}</TableCell>
                                        <TableCell >Bout</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.inpA}</TableCell>
                                            <TableCell>{row.inpB}</TableCell>
                                            <TableCell>{row.bin}</TableCell>
                                            <TableCell>{row.diff}</TableCell>
                                            <TableCell>{row.bout}</TableCell>

                                        </TableRow>
                                    ))}

                                </TableBody>
                            </Table>
                        </TableContainer>
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
                                bgcolor: score > 60 ? "lightblue" : "#ff0000",
                                padding: "20px",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px"
                            }}
                        >
                            <Box >
                                <Typography variant="h5">{score > 60 ? "Well Done  🎉" : ""}</Typography>
                                <Typography variant="subtitle1" sx={{ fontSize: "2rem" }}>
                                    Your total score is  <br />{score} / 100
                                </Typography>
                                {score <= 60 && (
                                    <Typography variant="subtitle1" sx={{ fontSize: "1rem" }}>
                                        You haven't completed the task properly
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                    </Container>)
            }
        </Box>
    )
}

export default FullSubtractorCircuitGame


