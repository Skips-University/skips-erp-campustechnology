import { Button, Typography, Box } from '@mui/material'
import React, { useState, useEffect } from 'react'
import styles from "../virtuallabcss/GrayToBinaryConverter.module.css"

const GrayToBinaryConverter = () => {
 
    const [btnStates, setBtnStates] = useState({ b3: false, b2: false, b1: false, b0: false });
    const [lightStates, setLightStates] = useState({ b3: false, b2: false, b1: false, b0: false });

    const [binaryValue, setBinaryValue] = useState([0, 0, 0, 0]);
    const [grayValue, setGrayValue] = useState([0, 0, 0, 0]);

    const handleSwitchToggle = (btn) => {
        setBtnStates(prev => ({
            ...prev,
            [btn]: !prev[btn]
        }));
    };

    // Function to convert Gray code to Binary
    const convertGrayToBinary = (gray) => {
        const binary = [];
        binary[0] = gray[0];
        for (let i = 1; i < gray.length; i++) {
            binary[i] = binary[i - 1] ^ gray[i];
        }
        return binary;
    };

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
        const newGrayValue = convertGrayToBinary(binaryValue);
        setGrayValue(newGrayValue);
    };

    const handleClear = () => {
        setBtnStates({ b3: false, b2: false, b1: false, b0: false });
        setLightStates({ b3: false, b2: false, b1: false, b0: false });
        setBinaryValue([0, 0, 0, 0]);
        setGrayValue([0, 0, 0, 0]);
    };

    useEffect(() => {
        const newBinaryValue = [btnStates.b3 ? 1 : 0, btnStates.b2 ? 1 : 0, btnStates.b1 ? 1 : 0, btnStates.b0 ? 1 : 0];
        setBinaryValue(newBinaryValue);
    }, [btnStates]);

    useEffect(() => {
        const newLightStates = grayValue.reduce((acc, item, idx) => {
            acc[`b${3 - idx}`] = item === 1;
            return acc;
        }, {});
        setLightStates(newLightStates);
    }, [grayValue]);


    return (
        <Box sx={{ border: "4px solid green", padding: "30px", minWidth: "1200px" }}>
            <Typography variant="h4" textAlign="center" fontWeight="bold" marginBottom="30px">Gray to Binary Converter</Typography>
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


                    <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-1339-GraytobinaryCircuit.png"
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
                        <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-136-GraytobinaryConverter.png" alt="converter" className={styles.converter} />
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
                <Box>
                    <img src='https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-1353-GraytobinaryTruthTable.png' alt='truthTbale' width="100%" style={{ paddingTop: "20px" }} />

                </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly", marginTop: "40px" }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-5439-GrayLineGraph.png" alt="graph" width="400px" />
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-5422-binaryLineGraph.png" alt="graph" width="400px" />
            </Box>
        </Box>
    )
}

export default GrayToBinaryConverter




