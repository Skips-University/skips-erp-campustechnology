import { Paper, Button, Container, Typography, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack, Checkbox, FormControlLabel } from '@mui/material'
import React, { useEffect, useState } from 'react'
import styles from "../virtuallabcss/HalfSubtractorCircuit.module.css"
import labgameCss from "../virtuallabcss/LabGame.module.css";
import global1 from "../pages/global1";

const HalfSubtractorCircuitGame = () => {


    const username = global1.name;
    const regno = global1.regno;

    const [show, setShow] = useState(false)
    const [powersupplyOn, setPowersupplyOn] = useState(false)
    const [inputAOn, setInputAOn] = useState(false)
    const [inputBOn, setInputBOn] = useState(false)
    const [ledOn1, setLedOn1] = useState(false)
    const [ledOn2, setLedOn2] = useState(false)
    const [tableData, setTableData] = useState([])
    const [turn, setTurn] = useState({
        singleLedOn: 0,
        bothLedOn: 0,
        addsingleLedOn: 0,
        addbothLedOn: 0
    })

    const [isChecked, setIsChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);

    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
        if(event.target.checked){
            setScore(prev => prev+20)
        }else{
            setScore(prev => prev -20)
        }
    };


    const handleInpABtn = () => {
        if (powersupplyOn) {
            setInputAOn(!inputAOn)
        } else {
            alert("Please turn on the power supply switch")
        }
    }

    const handleInpBBtn = () => {
        if (powersupplyOn) {
            setInputBOn(!inputBOn)
        }
        else {
            alert("Please turn on the power supply switch")
        }
    }
    useEffect(() => {
        if (powersupplyOn) {
            if (inputAOn && !inputBOn) {
                setLedOn1(true)
                if (turn.singleLedOn < 1) {
                    setScore(prev => prev + 10)
                    setTurn((prev) => ({ ...prev, singleLedOn: prev.singleLedOn + 1 }))
                }
            }
            else if (inputBOn && !inputAOn) {
                setLedOn1(true)
                setLedOn2(true)
                if (turn.bothLedOn < 1) {
                    setScore(prev => prev + 10)
                    setTurn((prev) => ({ ...prev, bothLedOn: prev.bothLedOn + 1 }))
                }
            }
            else {
                setLedOn1(false)
                setLedOn2(false)
            }
        } else {

            setInputAOn(false)
            setInputBOn(false)
        }

    }, [powersupplyOn, inputAOn, inputBOn])

    const handleAdd = () => {
        if (powersupplyOn) {
            if (inputAOn && !inputBOn) {
                setTableData([...tableData, { inpA: 1, inpB: 0, diff: 1, borrow: 0 }])
                if (turn.addsingleLedOn < 1) {
                    setScore(prev => prev + 20)
                    setTurn((prev) => ({ ...prev, addsingleLedOn: prev.addsingleLedOn + 1 }))
                }
            } else if (inputAOn && inputBOn) {
                setTableData([...tableData, { inpA: 1, inpB: 1, diff: 0, borrow: 0 }])
            } else if (!inputAOn && inputBOn) {
                setTableData([...tableData, { inpA: 0, inpB: 1, diff: 1, borrow: 1 }])
                if (turn.addbothLedOn < 1) {
                    setScore(prev => prev + 40)
                    setTurn((prev) => ({ ...prev, addbothLedOn: prev.addbothLedOn + 1 }))
                }
            } else {
                setTableData([...tableData, { inpA: 0, inpB: 0, diff: 0, borrow: 0 }])
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

    const handleNext=()=>{
        if(score>=50){
            setLevel(prev => prev + 1)
        }else{
            alert("you should score atleast 50 ")
        }
    }
    return (
        <Container >
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
                    Experiment to perform logic of half Subtractor on kit
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
                            <p>{`2) Press the Switches from inputs "A" and "B". `} </p>
                            <p>The switch On is state <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" alt='swtichOn' width={40} />
                                and the switch in OFF state is <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png" alt="switchOff" width={40} />
                            </p>
                            <p>{`3) Click "Add" To Obtain the Truth Table For different Input`}</p>
                            <p>{`4) After Obtaining Truth Table Click "Print"`}</p>
                        </Box>}
                    </Box>

                    <Box className={styles.diagram}>


                        <Box className={styles.diagramWrapper}>
                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1139-halfSubtractorGate.png" alt="logicGate" width="1000px" className={styles.logicGate} />

                            <Box className={styles.powerBtnBox}>
                                <Typography variant='body1'>Power Supply</Typography>
                                <img src={powersupplyOn ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png"}
                                    alt='swtich' className={`${styles.switch} `} onClick={() => {
                                        setPowersupplyOn(!powersupplyOn)

                                    }} />
                            </Box>
                            <Box className={styles.inpABtnBox}>
                                <Typography variant='body1'>Input A</Typography>
                                <img src={inputAOn ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png"}
                                    alt='swtich' className={`${styles.switch} `} onClick={handleInpABtn} />
                            </Box>
                            <Box className={styles.inpBBtnBox}>
                                <Typography variant='body1'>Input B</Typography>
                                <img src={inputBOn ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1137-Swtich_on_btn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-1113-Switch_off_btn.png"}
                                    alt='swtich' className={`${styles.switch}`} onClick={handleInpBBtn} />
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
                                        <TableCell >Difference</TableCell>
                                        <TableCell >Borrow</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.inpA}</TableCell>
                                            <TableCell>{row.inpB}</TableCell>
                                            <TableCell>{row.diff}</TableCell>
                                            <TableCell>{row.borrow}</TableCell>

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
                </Box>            }
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

        </Container>
    )
}

export default HalfSubtractorCircuitGame