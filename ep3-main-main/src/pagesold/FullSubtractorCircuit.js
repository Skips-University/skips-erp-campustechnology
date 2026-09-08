import { Paper, Button,  Typography, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import styles from "./FullSubtractorCircuit.module.css"

const FullSubtractorCircuit = () => {

    const [show, setShow] = useState(false)
    const [powersupplyOn, setPowersupplyOn] = useState(false)
    const [inputAOn, setInputAOn] = useState(false)
    const [inputBOn, setInputBOn] = useState(false)
    const [binOn, setBinOn] = useState(false)
    const [ledOn1, setLedOn1] = useState(false)
    const [ledOn2, setLedOn2] = useState(false)

    const [tableData, setTableData] = useState([])


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
            } else if (!inputAOn && inputBOn && binOn) {
                setLedOn2(true)
                setLedOn1(false)
            }else {
                setLedOn1(false)
                setLedOn2(false)
            }
        } else {
            setInputAOn(false)
            setInputBOn(false)
            setBinOn(false)
        }

    }, [powersupplyOn, inputAOn, inputBOn, binOn])


    const handleAdd = () => {
        if (powersupplyOn) {

            if (inputAOn && !inputBOn && !binOn) {
                setTableData([...tableData, { inpA: 1, inpB: 0,bin:0 ,diff: 1, bout: 0 }])
            } else if (!inputAOn && inputBOn && !binOn) {
                setTableData([...tableData, { inpA: 0, inpB: 1,bin:0, diff: 1, bout: 1 }])
            } else if (!inputAOn && !inputBOn && binOn) {
                setTableData([...tableData, { inpA: 0, inpB: 0,bin:1 ,diff: 1, bout: 1 }])
            }else if (inputAOn && inputBOn && !binOn) {
                setTableData([...tableData, { inpA: 1, inpB: 1,bin:0 ,diff: 0, bout: 0 }])
            }else if (inputAOn && !inputBOn && binOn) {
                setTableData([...tableData, { inpA: 1, inpB: 0,bin:1 ,diff: 0, bout: 0 }])
            }else if (!inputAOn && inputBOn && binOn) {
                setTableData([...tableData, { inpA: 0, inpB: 1,bin:1 ,diff: 0, bout: 1 }])
            }else if (inputAOn && inputBOn && binOn) {
                setTableData([...tableData, { inpA: 1, inpB: 1,bin:1 ,diff: 1, bout: 1 }])
            }else {
                setTableData([...tableData, { inpA: 0, inpB: 0, bin:0, diff: 0, bout: 0 }])
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
            <Typography variant='h5' className={styles.heading}> Experiment to perform logic of Full Subtractor on kit</Typography>
            <Box className={styles.wrapper}>
                <Box className={styles.instructionBox}>
                    <Button variant='contained' onClick={() => setShow(!show)}>
                        Instructions
                    </Button>
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
            </Box>
        </Box>
    )
}

export default FullSubtractorCircuit