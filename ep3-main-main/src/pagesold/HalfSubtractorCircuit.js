import { Paper, Button, Container, Typography, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import styles from "./HalfSubtractorCircuit.module.css"

const HalfSubtractorCircuit = () => {

    const [show, setShow] = useState(false)
    const [powersupplyOn, setPowersupplyOn] = useState(false)
    const [inputAOn, setInputAOn] = useState(false)
    const [inputBOn, setInputBOn] = useState(false)
    const [ledOn1, setLedOn1] = useState(false)
    const [ledOn2, setLedOn2] = useState(false)

    const [tableData, setTableData] = useState([])


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
            }
            else if (inputBOn && !inputAOn) {
                setLedOn1(true)
                setLedOn2(true)
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
            } else if (inputAOn && inputBOn) {
                setTableData([...tableData, { inpA: 1, inpB: 1, diff: 0, borrow: 0 }])
            } else if (!inputAOn && inputBOn) {
                setTableData([...tableData, { inpA: 0, inpB: 1, diff: 1, borrow: 1 }])
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

    return (
        <Container >
            <Typography variant='h5' className={styles.heading}> Experiment to perform logic of half Subtractor on kit</Typography>
            <Box className={styles.wrapper}>
                <Box className={styles.instructionBox}>
                    <Button variant='contained' onClick={() => setShow(!show)}>
                        Instructions
                    </Button>
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
                                alt='swtich' className={`${styles.switch} `} onClick={() => setPowersupplyOn(!powersupplyOn)} />
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
            </Box>
        </Container>
    )
}

export default HalfSubtractorCircuit