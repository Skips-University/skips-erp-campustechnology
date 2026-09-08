
import { Button, Typography, Box, Container, Checkbox, FormControlLabel, } from '@mui/material'
import React, { useState, useEffect } from 'react'
import styles from "../virtuallabcss/BinaryToGrayConverter.module.css"
import labgameCss from "../virtuallabcss/LabGame.module.css";
import global1 from "../pages/global1";

const BinaryToGrayConverterGame = () => {

    const username = global1.name;
    const regno = global1.regno;

    const [btnStates, setBtnStates] = useState({ b3: false, b2: false, b1: false, b0: false });
    const [lightStates, setLightStates] = useState({ b3: false, b2: false, b1: false, b0: false });

    const [binaryValue, setBinaryValue] = useState([0, 0, 0, 0]);
    const [grayValue, setGrayValue] = useState([0, 0, 0, 0]);

    const [isChecked, setIsChecked] = useState(false);
    const [run, setRun] = useState(0)
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);


    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
    };

    const handleSwitchToggle = (btn) => {
        setBtnStates(prevState => ({
            ...prevState,
            [btn]: !prevState[btn]
        }));
    }

    // Function to convert Binary to Gray code
    const convertBinaryToGray = (binary) => {
        const gray = [];
        gray[0] = binary[0];
        for (let i = 1; i < binary.length; i++) {
            gray[i] = binary[i - 1] ^ binary[i];
        }
        setRun(prev => prev + 1)
        return gray;
    }

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

    const handleRun = () => {
        const newGrayValue = convertBinaryToGray(binaryValue);
        setGrayValue(newGrayValue);
        if (run >= 0 && run <= 4) {
            setScore(prev => prev + 5)
            // setLevel(prev => prev + 1)
        } else if (run > 4 && run <= 8) {
            setScore(prev => prev + 5)
            // setLevel(prev => prev + 1)
        } else if (run > 8 && run <= 12) {
            setScore(prev => prev + 5)
            // setLevel(prev => prev + 1)
        } else if (run > 12 && run <= 16) {
            setScore(prev => prev + 5)
            // setLevel(prev => prev + 1)
        } else {
            alert("Please perform the experiment")
        }
    }

    const handleClear = () => {
        setBtnStates({ b3: false, b2: false, b1: false, b0: false });
        setLightStates({ b3: false, b2: false, b1: false, b0: false });
        setBinaryValue([0, 0, 0, 0]);
        setGrayValue([0, 0, 0, 0]);
    }

    useEffect(() => {
        const newBinaryValue = [btnStates.b3 ? 1 : 0, btnStates.b2 ? 1 : 0, btnStates.b1 ? 1 : 0, btnStates.b0 ? 1 : 0];
        setBinaryValue(newBinaryValue);
    }, [btnStates]);

    useEffect(() => {
        const newLightStates = { b3: false, b2: false, b1: false, b0: false };
        grayValue.forEach((item, idx) => {
            if (item === 1) {
                if (idx === 0) newLightStates.b3 = true;
                else if (idx === 1) newLightStates.b2 = true;
                else if (idx === 2) newLightStates.b1 = true;
                else newLightStates.b0 = true;
            }
        });
        setLightStates(newLightStates);
    }, [grayValue]);

    const handleNext = () => {
        setLevel(prev => prev + 1)
    }

    return (
        <Container sx={{ padding: "30px", minWidth: "1200px" }}>
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
                    Binary to Gray Converter
                </Typography>
                {level > 0 && level < 3 && (
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor: "yellow", margin: "10px 0px" }}>
                        <Typography variant='h6' className={labgameCss.level}>
                            Level- {level}
                        </Typography>
                    </div>
                )}
                {level === 2 && <Typography variant='h6' textAlign="right" fontWeight="bold" my={5}>
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
                                A Binary to Gray Code Converter is a combinational circuit that converts a binary number into its equivalent Gray code. Gray code is a binary numeral system where two successive numbers differ in only one bit, which helps reduce errors during transitions in digital systems.
                            </Typography>
                            <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="6px 20px">
                                <b>Circuit Design:</b><br />
                                A Binary to Gray code converter can be implemented using XOR gates. Each bit of the Gray code is generated by performing the XOR operation between the corresponding binary bit and the bit that comes before it in the binary sequence.<br />
                                For a 4-bit binary number (B3 B2 B1 B0), the Gray code (G3 G2 G1 G0) is derived as <br />
                                G3 = B3 {`(The most significant bit remains the same)`},
                                G2 = B3 ⊕ B2,
                                G1 = B2 ⊕ B1,
                                G0 = B1 ⊕ B0
                            </Typography>
                            <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="6px 20px">
                                <b>Conversion Logic:</b><br />

                                The most significant bit (MSB) of the Gray code is the same as the MSB of the Binary code.
                                <br />
                                For each successive bit, the Gray code bit is obtained by performing the XOR operation between the corresponding binary bit and the binary bit that is just to its left.<br />
                                The truth table for converting Binary to Gray looks like this:
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
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-054-binarytoGrayTruthTable.png" alt='truthTbale' style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "50px auto", width: "50%" }} />
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
                            setScore(prev => prev + 20)
                        }}
                    >
                        Next
                    </Button>
                </Box>
            </Container>}
            {level === 2 && <Container>
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


                        <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-927-binarytoGrayCircuit.png"
                            alt='BinaryToGrayCircuit' width="600px" className={styles.circuit} />

                        {lightStates.b3 ? <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-416-GreenLight.png"
                            alt='btnB3' className={`${styles.greenlightBtn} ${styles.lightB3}`}
                        /> : <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-426-GreyLight.jpeg" alt='btnB3'
                            className={`${styles.greylightBtn} ${styles.btnB3} ${styles.greylight}`}
                        />}

                        {lightStates.b2 ? <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-416-GreenLight.png"
                            alt='btnB2' className={`${styles.greenlightBtn} ${styles.lightB2}`}
                        /> :
                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-426-GreyLight.jpeg" alt='btnB2'
                                className={`${styles.greylightBtn} ${styles.btnB2} ${styles.greylight}`}
                            />}
                        {lightStates.b1 ? <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-416-GreenLight.png"
                            alt='btnB1' className={`${styles.greenlightBtn} ${styles.lightB1}`}
                        /> : <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-426-GreyLight.jpeg" alt='btnB1'
                            className={`${styles.greylightBtn} ${styles.btnB1} ${styles.greylight}`}
                        />}
                        {lightStates.b0 ? <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-416-GreenLight.png"
                            alt='btnB0' className={`${styles.greenlightBtn} ${styles.lightB0}`}
                        /> : <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-426-GreyLight.jpeg" alt='btnB0'
                            className={`${styles.greylightBtn} ${styles.btnB0} ${styles.greylight}`}
                        />}


                        <div className={`${styles.greyInpVal} ${styles.btnB3}`}>{lightStates.b3 ? 1 : 0}</div>
                        <div className={`${styles.greyInpVal} ${styles.btnB2}`}>{lightStates.b2 ? 1 : 0}</div>
                        <div className={`${styles.greyInpVal} ${styles.btnB1}`}>{lightStates.b1 ? 1 : 0}</div>
                        <div className={`${styles.greyInpVal} ${styles.btnB0}`}>{lightStates.b0 ? 1 : 0}</div>

                        <div className={styles.converterWrapper}>
                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-62-binarytoGrayConverter.png" alt="converter" className={styles.converter} />
                            <div className={styles.binaryConvertingValBox}>
                                <p className={styles.binaryConvertingVal}>
                                    {binaryValue.join('')}
                                </p>
                                <p className={styles.decimalBinary}>Decimal :  {binaryToDecimal(binaryValue.join(''))}</p>
                            </div>
                            <div className={styles.greyConvertingValBox}>
                                <p className={styles.greyConvertingVal}>
                                    {grayValue.join('')}
                                </p>
                                <p className={styles.decimalGrey}>Decimal :      {binaryToDecimal(grayValue.join(''))} </p>
                            </div>
                        </div>
                    </Box>

                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-evenly", marginTop: "40px" }}>
                    <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-5536-binaryLineGraph.png" alt="graph" width="400px" />
                    <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-5740-GrayLineGraph.png" alt="graph" width="400px" />
                </Box>
                <Button
                    variant="contained"
                    color="success"
                    sx={{ ml: 2, width: "100px", margin: "30px auto", display: "flex" }}
                    onClick={handleNext}
                >
                    Next
                </Button>
            </Container>}
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
                                <Typography variant="h5">{score > 80 ? "Well Done Sonali 🎉" : " Sonali"}</Typography>
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

export default BinaryToGrayConverterGame

