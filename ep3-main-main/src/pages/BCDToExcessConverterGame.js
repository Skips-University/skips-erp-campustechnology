import { Button, Typography, Box, Container, Checkbox, FormControlLabel, } from '@mui/material';
import React, { useState, useEffect } from 'react';
import styles from "../virtuallabcss/BCDtoExcess.module.css";
import labgameCss from "../virtuallabcss/LabGame.module.css";
import global1 from "../pages/global1";

const BCDToExcess3ConverterGame = () => {

    const username = global1.name;
    const regno = global1.regno;

    const [btnStates, setBtnStates] = useState({ b3: false, b2: false, b1: false, b0: false });
    const [lightStates, setLightStates] = useState({ b3: false, b2: false, b1: false, b0: false });

    const [binaryValue, setBinaryValue] = useState([0, 0, 0, 0]);
    const [excess3Value, setExcess3Value] = useState([0, 0, 0, 0]);
    const [isChecked, setIsChecked] = useState(false);

    const [run, setRun] = useState(0)
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);

    const handleSwitchToggle = (btn) => {
        setBtnStates(prevState => ({
            ...prevState,
            [btn]: !prevState[btn]
        }));
    };

    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
    };

    // Function to convert BCD to Excess-3 code
    const convertBCDToExcess3 = (bcd) => {
        const decimal = binaryToDecimal(bcd.join(''));
        if (decimal > 9) {
            alert("Invalid input! BCD value must be between 0 and 9.");
            return [0, 0, 0, 0]; // Reset to zero
        } else {

            setRun(prev => prev + 1)
            const excess3Decimal = decimal + 3;
            const excess3Binary = decimalToBinary(excess3Decimal);
            return excess3Binary;
        }

    };

    // Function to convert binary string to decimal
    const binaryToDecimal = (binaryStr) => {
        let decimalValue = 0;
        let length = binaryStr.length;

        for (let i = 0; i < length; i++) {
            let bit = parseInt(binaryStr[i]);
            if (bit !== 0 && bit !== 1) {
                return 'Invalid binary input';
            }
            decimalValue += bit * Math.pow(2, length - i - 1);
        }

        return decimalValue;
    };

    // Function to convert decimal to binary (4-bit)
    const decimalToBinary = (decimal) => {
        return decimal.toString(2).padStart(4, '0').split('').map(Number);
    };

    const handleRun = () => {
        const newExcess3Value = convertBCDToExcess3(binaryValue);
        setExcess3Value(newExcess3Value);

    };

    const handleClear = () => {
        setBtnStates({ b3: false, b2: false, b1: false, b0: false });
        setLightStates({ b3: false, b2: false, b1: false, b0: false });
        setBinaryValue([0, 0, 0, 0]);
        setExcess3Value([0, 0, 0, 0]);
    };

    useEffect(() => {
        const newBinaryValue = [btnStates.b3 ? 1 : 0, btnStates.b2 ? 1 : 0, btnStates.b1 ? 1 : 0, btnStates.b0 ? 1 : 0];
        setBinaryValue(newBinaryValue);
    }, [btnStates]);

    useEffect(() => {
        const newLightStates = { b3: false, b2: false, b1: false, b0: false };
        excess3Value.forEach((item, idx) => {
            if (item === 1) {
                if (idx === 0) newLightStates.b3 = true;
                else if (idx === 1) newLightStates.b2 = true;
                else if (idx === 2) newLightStates.b1 = true;
                else newLightStates.b0 = true;
            }
        });
        setLightStates(newLightStates);
    }, [excess3Value]);

    const handleNext = () => {
        if (run > 0 && run <= 3) {
            setScore(prev => prev + 20)
            setLevel(prev => prev + 1)
        } else if (run > 3 && run <= 6) {
            setScore(prev => prev + 20)
            setLevel(prev => prev + 1)
        } else if (run > 6 && run <= 9) {
            setScore(prev => prev + 20)
            setLevel(prev => prev + 1)
        } else {
            alert("Please perform the experiment")
        }

    }

    return (
        <Box sx={{ padding: "30px", minWidth: "1200px" }}>
            <Container sx={{ display: 'flex', justifyContent: 'space-between', pb: '10px' }}>
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
                    BCD to Excess-3 Converter
                </Typography>
                {level > 0 && level < 3 && (
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor: "yellow", margin: "10px 0px" }}>
                        <Typography variant='h6' className={labgameCss.level}>
                            Level- {level}
                        </Typography>
                    </div>
                )}
                {level === 2  && <Typography variant='h6' textAlign="right" fontWeight="bold" my={5}>
                    No. of runs = {run}
                </Typography>}
            </Container>

            {
                level === 0 && (
                    <Container sx={{ margin: "20px auto", border: "5px solid grey" }}>
                        <Box>
                            <Typography variant='h6' textAlign="center" fontWeight="bold" >
                                Theory
                            </Typography>
                            <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="6px 20px">
                                A BCD to Excess-3 Code Converter is a combinational logic circuit that converts a Binary Coded Decimal (BCD) input into its corresponding Excess-3 code output.
                            </Typography>
                            <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="6px 20px">
                                <b>Circuit Design:</b><br />
                                The circuit can be designed using 4-bit binary adders, logic gates (AND, OR, XOR), or by using the truth table and deriving minimized Boolean expressions for each output bit.<br />
                                Based on the truth table, you can use Karnaugh maps (K-maps) to minimize the logic expressions and implement them with logic gates.
                            </Typography>
                            <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="6px 20px">
                                <b>Conversion Logic:</b><br />

                                The BCD to Excess-3 converter works by adding a binary 3 (0011) to the BCD code.<br />
                                This can be represented as a 4-bit addition.<br />
                                The truth table for converting BCD to Excess-3 looks like this:
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
            {level === 1 && <Container width="100%">
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-4-541-BCDtoExcessTruthTable.png" alt='truthTbale' style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "50px auto", width: "50%" }} />
                <Box textAlign="center" >
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
                        label="Read and Note dwon the Truth Table"
                    />
                    <Button
                        variant="contained"
                        color="success"
                        disabled={!isChecked}
                        sx={{ ml: 2 }}
                        onClick={() => {
                            alert('Proceeding to the next level!')
                            setLevel(prev => prev + 1)
                            setScore(prev => prev + 10)
                        }}
                    >
                        Next
                    </Button>
                </Box>
            </Container>}

            {level === 2 &&
                <Container >
                    <Box sx={{ display: "flex", gap: "10px", paddingLeft: "60px" }}>
                        <Button variant='contained' onClick={handleRun} >Run</Button>
                        <Button variant='outlined' onClick={handleClear} style={{
                            '&:hover': {
                                backgroundColor: 'red',
                                borderColor: '#3f51b5',
                                color: '#3f51b5',
                            },
                        }} >Clear</Button>
                    </Box>
                    <Box className={styles.diagramWrapper}>
                        <Box className={styles.diagram}>
                            <div className={`${styles.binaryInpVal} ${styles.btnB3}`}>{btnStates.b3 ? 1 : 0}</div>
                            <div className={`${styles.binaryInpVal} ${styles.btnB2}`}>{btnStates.b2 ? 1 : 0}</div>
                            <div className={`${styles.binaryInpVal} ${styles.btnB1}`}>{btnStates.b1 ? 1 : 0}</div>
                            <div className={`${styles.binaryInpVal} ${styles.btnB0}`}>{btnStates.b0 ? 1 : 0}</div>

                            <img src={btnStates.b3 ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-713-BtnOn.png"
                                : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-722-BtnOff.png"} alt='btnB3'
                                width="40px" onClick={() => handleSwitchToggle("b3")} className={`${styles.switchbtn} ${styles.btnB3}`}
                            />
                            <img src={btnStates.b2 ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-713-BtnOn.png"
                                : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-722-BtnOff.png"} alt='btnB2'
                                width="40px" onClick={() => handleSwitchToggle("b2")} className={`${styles.switchbtn} ${styles.btnB2}`}
                            />
                            <img src={btnStates.b1 ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-713-BtnOn.png"
                                : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-722-BtnOff.png"} alt='btnB1'
                                width="40px" onClick={() => handleSwitchToggle("b1")} className={`${styles.switchbtn} ${styles.btnB1}`}
                            />
                            <img src={btnStates.b0 ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-713-BtnOn.png"
                                : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-722-BtnOff.png"} alt='btnB0'
                                width="40px" onClick={() => handleSwitchToggle("b0")} className={`${styles.switchbtn} ${styles.btnB0}`}
                            />

                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-4-438-BCDtoExcessCircuit.png"
                                alt='BCDToExcess3Circuit' width="600px" className={styles.circuit} />

                            <div className={`${styles.lightBtn} ${styles.lightE3} ${lightStates.b3 ? `${styles.btnGreen}` : `${styles.btngrey}`}`} />
                            <div className={`${styles.lightBtn} ${styles.lightE2} ${lightStates.b2 ? `${styles.btnGreen}` : `${styles.btngrey}`}`} />
                            <div className={`${styles.lightBtn} ${styles.lightE1} ${lightStates.b1 ? `${styles.btnGreen}` : `${styles.btngrey}`}`} />
                            <div className={`${styles.lightBtn} ${styles.lightE0} ${lightStates.b0 ? `${styles.btnGreen}` : `${styles.btngrey}`}`} />

                            <div className={`${styles.greyInpVal}  ${styles.lightE3} `}>{lightStates.b3 ? 1 : 0}</div>
                            <div className={`${styles.greyInpVal}  ${styles.lightE2} `}>{lightStates.b2 ? 1 : 0}</div>
                            <div className={`${styles.greyInpVal}  ${styles.lightE1} `}>{lightStates.b1 ? 1 : 0}</div>
                            <div className={`${styles.greyInpVal}  ${styles.lightE0} `}>{lightStates.b0 ? 1 : 0}</div>

                            <div className={styles.converterWrapper}>
                                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-4-511-BCDtoExcessConverter.png" alt="converter" className={styles.converter} />
                                <div className={styles.binaryConvertingValBox}>
                                    <p className={styles.binaryConvertingVal}>
                                        {binaryValue.join('')}
                                    </p>
                                    <p className={styles.decimalBinary}>Decimal :  {binaryToDecimal(binaryValue.join(''))}</p>
                                </div>
                                <div className={styles.greyConvertingValBox}>
                                    <p className={styles.greyConvertingVal}>
                                        {excess3Value.join('')}
                                    </p>
                                    <p className={styles.decimalGrey}>Decimal :      {binaryToDecimal(excess3Value.join(''))} </p>
                                </div>
                            </div>
                        </Box>

                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-evenly", marginTop: "40px" }}>
                        <Box className={{ position: "absolute" }}>
                            <Typography variant='h6'><b>BCD INPUT</b></Typography>
                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-4-621-BCDLineGraph.png" alt="graph" width="400px" />
                        </Box>
                        <Box className={{ position: "absolute" }}>
                            <Typography variant='h6'><b>Excess Output</b></Typography>
                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-4-75-ExcessLineGraph.png" alt="graph" width="400px" />

                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        color="success"
                        sx={{ ml: 2, width: "100px", margin: "30px auto", display: "flex" }}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </Container>
            }
            {
                level > 2 && (
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
                                <Typography variant="h5">{score > 60 ? "Well Done 🎉" : ""}</Typography>
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
        </Box >
    );
};

export default BCDToExcess3ConverterGame;



