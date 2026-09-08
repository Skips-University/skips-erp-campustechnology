import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Logicgate from "../assets/Logicgate.png";
import SwitchOff from "../assets/switchOff.png"
import SwitchOn from "../assets/switchOn.png"
import LedOn from "../assets/Ledon.jpg";
import LedOff from "../assets/Ledoff.jpg";
import styles from "./basicLogicGates.module.css";

const SecondSimulator = () => {
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
        <Box sx={{ minWidth: "900px" }}>
            <Typography variant="h4" component="h2" sx={{ textAlign: "center", marginTop: "20px" ,width:"100%"}}>
                Analysis and Synthesis of Boolean Expressions using Basic Logic Gates - Experiment 2
            </Typography>
            <div>
                <div className={styles.imgContainer}>
                    <img src={Logicgate} alt="logic-gate" className={styles.img} />

                    {/* Light On/Off Images */}
                    <img 
                    width="30"
                    height="20"
                        src={toggleFirstSwitch ? SwitchOn : SwitchOff} 
                        alt={toggleFirstSwitch ? 'Switch-on' : 'Switch-off'} 
                        className={styles.firstSwitchBtn} 
                        onClick={() => setToggleFirstSwitch(!toggleFirstSwitch)} 
                    />
                    <img 
                        src={toggleSecondSwitch ? SwitchOn : SwitchOff} 
                        alt={toggleSecondSwitch ? 'Switch-on' : 'Switch-off'} 
                        className={styles.secondSwitchBtn} 
                        onClick={() => setToggleSecondSwitch(!toggleSecondSwitch)} 
                    />
                    <img 
                        src={toggleThirdSwitch ? SwitchOn : SwitchOff} 
                        alt={toggleThirdSwitch ? 'Switch-on' : 'Switch-off'} 
                        className={styles.thirdSwitchBtn} 
                        onClick={() => setToggleThirdSwitch(!toggleThirdSwitch)} 
                    />

                    {/* LED Images */}
                    <img 
                        src={toggleLed ? LedOn : LedOff} 
                        alt={toggleLed ? 'Led-On' : 'Led-Off'} 
                        className={toggleLed ? styles.ledOn : styles.ledOff} 
                    />
                </div>
            </div>
        </Box>
    );
}

export default SecondSimulator;
