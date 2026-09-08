import { Button, Typography, Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import styles from "../virtuallabcss/BCDtoExcess.module.css";

const BCDToExcess3Converter = () => {

    const [btnStates, setBtnStates] = useState({ b3: false, b2: false, b1: false, b0: false });
    const [lightStates, setLightStates] = useState({ b3: false, b2: false, b1: false, b0: false });

    const [binaryValue, setBinaryValue] = useState([0, 0, 0, 0]);
    const [excess3Value, setExcess3Value] = useState([0, 0, 0, 0]);

    const handleSwitchToggle = (btn) => {
        setBtnStates(prevState => ({
            ...prevState,
            [btn]: !prevState[btn]
        }));
    };

    // Function to convert BCD to Excess-3 code
    const convertBCDToExcess3 = (bcd) => {
        const decimal = binaryToDecimal(bcd.join(''));
        if (decimal > 9) {
            alert("Invalid input! BCD value must be between 0 and 9.");
            return [0, 0, 0, 0]; // Reset to zero
        }
        const excess3Decimal = decimal + 3;
        const excess3Binary = decimalToBinary(excess3Decimal);
        return excess3Binary;
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

    return (
        <Box sx={{ border: "4px solid green", padding: "30px", minWidth: "1200px" }}>
            <Typography variant="h4" textAlign="center" fontWeight="bold" marginBottom="30px">BCD to Excess-3 Converter</Typography>
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
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-4-541-BCDtoExcessTruthTable.png" alt='truthTbale' style={{ paddingTop: "100px", width: "340px", height: "60%" }} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly", marginTop: "40px" }}>
                <Box className={{position:"absolute"}}>
                    <Typography variant='h6'><b>BCD INPUT</b></Typography>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-4-621-BCDLineGraph.png" alt="graph" width="400px" />
                </Box>
                <Box className={{position:"absolute"}}>
                    <Typography variant='h6'><b>Excess Output</b></Typography>
                    <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-4-75-ExcessLineGraph.png" alt="graph" width="400px" />
                
                </Box>
            </Box>
        </Box>
    );
};

export default BCDToExcess3Converter;



