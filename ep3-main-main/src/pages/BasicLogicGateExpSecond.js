import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';



// import gate from "../../../assets/basic-logic-gates/gateExpSec.jpg";
// import SwitchOff from "../../../assets/button/switchOff.png"
// import SwitchOn from "../../../assets/button/switchOn.png"
// import LedOn from "../../../assets/basic-logic-gates/Ledon.jpg";
// import LedOff from "../../../assets/basic-logic-gates/Ledoff.jpg";
import styles from "./basicLogicGates.module.css";



const BasicLogicGateExpSecond = () => {
    const [toggleFirstSwitch, setToggleFirstSwitch] = useState(false);
    const [toggleSecondSwitch, setToggleSecondSwitch] = useState(false);
    const [toggleThirdSwitch, setToggleThirdSwitch] = useState(false);
    const [toggleLed, setToggleLed] = useState(false);

    useEffect(() => {
        if ((toggleFirstSwitch && toggleSecondSwitch && !toggleThirdSwitch) ||
            (toggleFirstSwitch && toggleSecondSwitch && toggleThirdSwitch) ||
            (!toggleFirstSwitch && !toggleSecondSwitch && toggleThirdSwitch) ||
            (!toggleFirstSwitch && toggleSecondSwitch && toggleThirdSwitch)) {
            setToggleLed(true);
        } else {
            setToggleLed(false);
        }
    }, [toggleFirstSwitch, toggleSecondSwitch, toggleThirdSwitch]);

    return (
        <Box sx={{ minWidth:"900px", padding:"20px"}}>
            <Typography variant="h4" component="h2" sx={{ textAlign: "center", marginTop: "20px" ,width:"100%"}}>
                Analysis and Synthesis of Boolean Expressions using Basic Logic Gates - Experiment 2
            </Typography>
            <div >
                <div className={styles.imgContainer}>
                    <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-1313-gateExpSec.jpg" alt="logic-gate" className={styles.img} />

                    {/* Light On/Off Images */}
                    <img 
                    width="30"
                    height="20"
                        src={toggleFirstSwitch ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-927-switchOn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4244-switchOff.png"} 
                        alt={toggleFirstSwitch ? 'Switch-on' : 'Switch-off'} 
                        className={styles.firstSwitchBtn} 
                        onClick={() => setToggleFirstSwitch(!toggleFirstSwitch)} 
                    />
                    <img 
                        src={toggleSecondSwitch ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-927-switchOn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4244-switchOff.png"} 
                        alt={toggleSecondSwitch ? 'Switch-on' : 'Switch-off'} 
                        className={styles.secondSwitchBtn} 
                        onClick={() => setToggleSecondSwitch(!toggleSecondSwitch)} 
                    />
                    <img 
                        src={toggleThirdSwitch ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-927-switchOn.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4244-switchOff.png"} 
                        alt={toggleThirdSwitch ? 'Switch-on' : 'Switch-off'} 
                        className={styles.thirdSwitchBtn} 
                        onClick={() => setToggleThirdSwitch(!toggleThirdSwitch)} 
                    />

                    {/* LED Images */}
                    <img 
                        src={toggleLed ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-210-Ledon.jpg" : " https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-1759-Ledoff.jpg"} 
                        alt={toggleLed ? 'Led-On' : 'Led-Off'} 
                        className={toggleLed ? styles.ledOn : styles.ledOff} 
                    />
                </div>
            </div>
        </Box>
    );
}

export default BasicLogicGateExpSecond;
