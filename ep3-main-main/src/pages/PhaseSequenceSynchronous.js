import React, { useEffect, useState } from 'react'
import { Grid, Box, Button, Typography, Container } from '@mui/material'
import phaseSeq from "../virtuallabcss/PhaseSequenceSynchronous.module.css"

const PhaseSequenceSynchronous = () => {
    const [isClockwise, setIsClockwise] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [threePhase, setThreePhase] = useState(false);
    const [dcSupply, setDCSupply] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [lastClickedRadio, setLastClickedRadio] = useState(null);

    const [connections, setConnections] = useState({
        oneToRed: false,
        twoToYellow: false,
        threeToBlue: false,
        twoToBlue: false,
        threeToYellow: false,
    });

    const [radioState, setRadioState] = useState({
        one: false,
        two: false,
        three: false,
        red: false,
        yellow: false,
        blue: false,
    });

    // const { one, two, three, red, yellow, blue } = radioState;
    const { oneToRed, twoToYellow, threeToBlue, twoToBlue, threeToYellow } = connections;

    const handleRadioChange = (radioName) => {
        setRadioState((prevState) => ({
            ...prevState,
            [radioName]: !prevState[radioName],
        }));

        setSelectedText(radioName);

        // Track the last clicked radio button to form connections
        if (lastClickedRadio === null) {
            setLastClickedRadio(radioName);
        } else {
            // Check for valid connections
            const newConnections = { ...connections };

            if ((lastClickedRadio === "one" && radioName === "red") || (lastClickedRadio === "red" && radioName === "one")) {
                newConnections.oneToRed = true;
            } else if ((lastClickedRadio === "two" && radioName === "yellow") || (lastClickedRadio === "yellow" && radioName === "two")) {
                newConnections.twoToYellow = true;
            } else if ((lastClickedRadio === "three" && radioName === "blue") || (lastClickedRadio === "blue" && radioName === "three")) {
                newConnections.threeToBlue = true;
            } else if ((lastClickedRadio === "two" && radioName === "blue") || (lastClickedRadio === "blue" && radioName === "two")) {
                newConnections.twoToBlue = true;
            } else if ((lastClickedRadio === "three" && radioName === "yellow") || (lastClickedRadio === "yellow" && radioName === "three")) {
                newConnections.threeToYellow = true;
            } else {
                // Reset connection if invalid pair
                newConnections.oneToRed = false;
                newConnections.twoToYellow = false;
                newConnections.threeToBlue = false;
                newConnections.twoToBlue = false;
                newConnections.threeToYellow = false;
            }

            setConnections(newConnections);
            setLastClickedRadio(null);
        }
    };

    const checkRotation = () => {
        // First condition: One to Red, Two to Yellow, Three to Blue
        if (oneToRed && twoToYellow && threeToBlue) {
            if (threePhase) {
                setIsClockwise(true);
                setIsRotating(true);
            } else if (dcSupply) {
                setIsClockwise(false);
                setIsRotating(true);
            } else {
                setIsRotating(false);
            }
        }
        // Second condition: One to Red, Two to Blue, Three to Yellow
        else if (oneToRed && twoToBlue && threeToYellow) {
            setIsClockwise(false);
            setIsRotating(threePhase || dcSupply);
        } else {
            setIsRotating(false);
        }
    };

    useEffect(() => {
        checkRotation();
    }, [connections, threePhase, dcSupply]);

    const handleConnection = (val) => {
        if (val === "3phase") {
            setThreePhase(!threePhase);
            setDCSupply(false);
        } else {
            setThreePhase(false);
            setDCSupply(!dcSupply);
        }
    };

    // Clear button to reset all the radio buttons and state
    const handleClear = () => {
        setRadioState({
            one: false,
            two: false,
            three: false,
            red: false,
            yellow: false,
            blue: false,
        });

        setConnections({
            oneToRed: false,
            twoToYellow: false,
            threeToBlue: false,
            twoToBlue: false,
            threeToYellow: false,
        });

        setIsRotating(false);
        setIsClockwise(false);
        setThreePhase(false);
        setDCSupply(false);
        setSelectedText("");
        setLastClickedRadio(null);
    };


    return (
        <Box sx={{ minWidth: "900px", padding: "60px 10px" }}>
            <Typography variant='h4' textAlign="center">Checking the Phase Sequence of Synchronous Machine</Typography>

            <Box sx={{ padding: "40px" }}>
                <Typography variant='h5'>Procedure -</Typography>
                <Box sx={{border:"2px solid black", padding:"20px", bgcolor:"lightgray"}}>
                    <Typography variant='subtitle1'> 1. To make connections</Typography>
                    <Typography variant='subtitle1'> Click on radio buttons "1 & R", "2 & Y" and "3 & B" respectively</Typography>
                    <Typography variant='subtitle1'> 2. Click on 3-Phase switch to close</Typography>
                    <Typography variant='subtitle1'> {`3. Observe Synchronous Machine rotation (Clockwise)`}</Typography>
                    <Typography variant='subtitle1'> {`4. Click on 3-Phase switch to open and Click on 2-Phase switch (DC Switch) at right hand side`}</Typography>
                    <Typography variant='subtitle1'>{`Observe rotation (Anticlockwise)`}</Typography>
                    <Typography variant='subtitle1'>5. To make same direction of rotation, change phase sequence</Typography>
                    <Typography variant='subtitle1'>6. Open DC switch</Typography>
                    <Typography variant='subtitle1'>7. Open DC switch</Typography>
                    <Typography variant='subtitle1'>7. Click on "clear Connections" Button</Typography>
                    <Typography variant='subtitle1'>8. Click on radio buttons "1 & R", "2 & B" and "3 & Y" respectively</Typography>
                    <Typography variant='subtitle1'>9. Close 3-phase switch</Typography>
                    <Typography variant='subtitle1'>Now rotation is Anticlockwise</Typography>
                    <Typography variant='subtitle1'>11. Hence phase sequence is same</Typography>
                </Box>
            </Box>


            <Grid container>
                <Grid item xs={1}></Grid>
                <Grid item xs={10} sx={{ position: "relative" }} >
                    <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-2950-SyncMotor.png" alt="Motor Diagram" />

                    {/* Radio buttons */}
                    <input
                        type="radio"
                        checked={radioState.one}
                        onChange={() => handleRadioChange("one")}
                        className={`${phaseSeq.radioOne} ${phaseSeq.radioBtn}`}
                    />
                    <input
                        type="radio"
                        checked={radioState.two}
                        onChange={() => handleRadioChange("two")}
                        className={`${phaseSeq.radioTwo} ${phaseSeq.radioBtn}`}
                    />
                    <input
                        type="radio"
                        checked={radioState.three}
                        onChange={() => handleRadioChange("three")}
                        className={`${phaseSeq.radioThree} ${phaseSeq.radioBtn}`}
                    />
                    <input
                        type="radio"
                        checked={radioState.red}
                        onChange={() => handleRadioChange("red")}
                        className={`${phaseSeq.radioRed} ${phaseSeq.radioBtn}`}
                    />
                    <input
                        type="radio"
                        checked={radioState.yellow}
                        onChange={() => handleRadioChange("yellow")}
                        className={`${phaseSeq.radioYellow} ${phaseSeq.radioBtn}`}
                    />
                    <input
                        type="radio"
                        checked={radioState.blue}
                        onChange={() => handleRadioChange("blue")}
                        className={`${phaseSeq.radioBlue} ${phaseSeq.radioBtn}`}
                    />

                    {/* Three-Phase and DC Supply Controls */}
                    <Box onClick={() => handleConnection("3phase")} sx={{ cursor: "pointer" }}>
                        <div className={`${phaseSeq.line}`} style={{ top: threePhase ? "64px" : "52px", left: threePhase ? "125px" : "120px", transform: threePhase ? "rotate(0deg)" : "rotate(-45deg)" }} />
                        <div className={`${phaseSeq.line}`} style={{ top: threePhase ? "151px" : "140px", left: threePhase ? "125px" : "120px", transform: threePhase ? "rotate(0deg)" : "rotate(-45deg)" }} />
                        <div className={`${phaseSeq.line}`} style={{ top: threePhase ? "232px" : "220px", left: threePhase ? "125px" : "120px", transform: threePhase ? "rotate(0deg)" : "rotate(-45deg)" }} />
                    </Box>

                    <Box onClick={() => handleConnection("dcSupply")} sx={{ cursor: "pointer" }}>
                        <div className={`${phaseSeq.line}`} style={{ top: dcSupply ? "100px" : "89px", left: dcSupply ? "985px" : "981px", transform: dcSupply ? "rotate(0deg)" : "rotate(-45deg)" }} />
                        <div className={`${phaseSeq.line}`} style={{ top: dcSupply ? "160px" : "149px", left: dcSupply ? "985px" : "981px", transform: dcSupply ? "rotate(0deg)" : "rotate(-45deg)" }} />
                    </Box>

                    {/* Line Connections */}
                    <Box>
                        {oneToRed && <div className={`${phaseSeq.lineConn} ${phaseSeq.lineConn1toR}`} />}
                        {twoToYellow && <div className={`${phaseSeq.lineConn} ${phaseSeq.lineConn2toY}`} />}
                        {threeToBlue && <div className={`${phaseSeq.lineConn} ${phaseSeq.lineConn3toB}`} />}
                        {twoToBlue && <div className={`${phaseSeq.lineConn} ${phaseSeq.lineConn2toB}`} />}
                        {threeToYellow && <div className={`${phaseSeq.lineConn} ${phaseSeq.lineConn3toY}`} />}
                        
                    </Box>
                </Grid>
                <Grid item xs={1}></Grid>
            </Grid>

            <Box >
                <Typography variant='h6' color='error' padding="20px 40px ">{selectedText} Selected</Typography>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>


                    {/* Rotating Image */}
                    <Box
                        component="img"
                        src={isClockwise ? "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-4418-clockwiseArrow.png" : "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-442-anticlockwiseArrow.png"}
                        alt="Rotating Image"
                        className={isRotating ? (isClockwise ? `${phaseSeq.rotateClockwise}` : `${phaseSeq.rotateAntiClockwise}`) : ''}
                        sx={{
                            width: isClockwise ? '50px' : '100px',
                            height: 'auto',

                        }}

                    />
                </Box>
                <Typography variant='h5' textAlign="center" marginY="30px" >{isRotating ? (isClockwise ? "Clockwise" : "AntiClockwise") : ""}</Typography>

                <Container sx={{border:"2px solid black", padding:"20px", marginY:"10px", bgcolor:"lightgray"}} >
                    <Typography variant='h6' textAlign="center" fontWeight="bold"> Phase Sequence Simulation</Typography>
                    <Typography variant='subtitle2' sx={{ marginBottom: "40px" }}> Run DC Shunt motor and check the direction of rotation of motor. Now switch off the DC supply and give three phase
                        supply to Synchronous machine from Grid supply and run as motor. Again Check the direction of rotation. If both rotations are same
                        means Phase Sequence is Same otherwise the Phase Sequence is Opposite. In case of Oppositet Phase Sequence change anyy two phases of Synchronous machine.</Typography>
                </Container>

                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button onClick={handleClear} variant="contained" color="secondary" >
                        Clear Connections
                    </Button>
                </Box>

            </Box>
        </Box>
    );
};

export default PhaseSequenceSynchronous;
