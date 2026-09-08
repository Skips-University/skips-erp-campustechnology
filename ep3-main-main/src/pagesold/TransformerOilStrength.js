
import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, Typography, Container } from '@mui/material';

const TransformerOilStrength = () => {
    const [voltage, setVoltage] = useState(0);
    const [observations, setObservations] = useState([]);
    const [numberOfTest, setNumberOfTest] = useState(3);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [showBlast, setShowBlast] = useState(false);
    const [isTestCompleted, setIsTestCompleted] = useState(false);
    const [currentGraph, setCurrentGraph] = useState(0);  

    useEffect(() => {
        if (observations.length >= 3) {
            setIsTestCompleted(true);
            setIsButtonDisabled(true);
        }
    }, [observations]);

    const handleVoltage = () => {
        let randomOffset = Math.random();

        let maxVoltage;
        if (numberOfTest === 3) {
            maxVoltage = 31 + randomOffset;
        } else if (numberOfTest === 2) {
            maxVoltage = 29 + randomOffset;
        } else {
            maxVoltage = 26 + randomOffset;
        }

        if (voltage >= maxVoltage) {
            setObservations([...observations, { breakdown: 4 - numberOfTest, observeVoltage: voltage.toFixed(1) }]);
            setIsButtonDisabled(true);
            setShowBlast(true);
            setCurrentGraph(4 - numberOfTest);  
        } else {
            if (numberOfTest === 3 && voltage < 29) {
                setVoltage(voltage + 1);
            } else if (numberOfTest === 2 && voltage < 28) {
                setVoltage(voltage + 1);
            } else if (numberOfTest === 1 && voltage < 26) {
                setVoltage(voltage + 1);
            } else {
                setVoltage(voltage + 0.1);
            }
            setShowBlast(false);
        }
    };

    const handleRestartTest = () => {
        if (numberOfTest > 1) {
            setNumberOfTest(numberOfTest - 1);
        } else {
            setNumberOfTest(3);
        }
        setVoltage(0);
        setIsButtonDisabled(false);
        setShowBlast(false);
    };

    const handleChangeTransformerOil = () => {
        setVoltage(0);
        setObservations([]);
        setNumberOfTest(3);
        setIsButtonDisabled(false);
        setShowBlast(false);
        setIsTestCompleted(false);
        setCurrentGraph(0); 
    };

    return (
        <Box sx={{ padding: "10px", minWidth: "900px" }}>
            <Typography variant='h4' padding="30px 0px" textAlign="center" >
                Checking the Dielectric Strength of Transformer Oil
            </Typography>
            <Grid container>
                <Grid item xs={1} />
                <Grid item xs={4}>
                    <Box sx={{ width: "100%", border: "4px solid black", bgcolor: "white" }}>
                        <Box sx={{ width: "60%", border: "4px dashed green", margin: "20px auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
                            <Typography variant="h6" gutterBottom>{`Voltmeter (KV)`}</Typography>
                            <Typography variant="h6" gutterBottom sx={{ padding: "2px 30px", textAlign: "center", bgcolor: "black", color: "lightgreen", border: "2px solid Green", width: "100px" }}>{voltage.toFixed(1)}</Typography>
                        </Box>
                        <Box sx={{ width: "60%", border: "4px dashed green", margin: "20px auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
                            <Typography variant="h6" gutterBottom>Increase Voltage </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    width: "15px",
                                    height: "50px",
                                    bgcolor: isButtonDisabled ? "blue" : "pink",
                                    border: "2px solid brown",
                                    boxShadow: "rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px",
                                    '&:hover': {
                                        boxShadow: "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px",
                                        bgcolor: "lightblue",
                                    },
                                }}
                                onClick={handleVoltage}
                                disabled={isButtonDisabled}
                            />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Button
                                variant="contained"
                                sx={{ width: "50%", bgcolor: "lightgrey", color: "black", margin: "20px auto" }}
                                onClick={handleRestartTest}
                                disabled={isTestCompleted}
                            >
                                Restart Test
                            </Button>
                        </Box>
                    </Box>
                  {currentGraph >= 3 &&  <Typography variant='h6' color="red">It is recomended to change the fluid after 3 breakdowns</Typography>}
                    <Button
                        variant="contained"
                        sx={{ bgcolor: "lightgrey", color: "black", margin: "20px 0px" }}
                        onClick={handleChangeTransformerOil}
                    >
                        Change Transformer Oil
                    </Button>
                </Grid>
                <Grid item xs={2} sx={{ position: "relative" }} >
                    <div style={{ width: "100%", height: "6px", backgroundColor: "black", position: "absolute", top: "140px", left: "8px" }}></div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "black", position: "absolute", top: "240px", left: "8px" }}></div>
                </Grid>
                <Grid item xs={5} sx={{ position: "relative" }}>
                    {/* First image (Transformer) */}
                    <Box sx={{ position: "relative" }}>
                        <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-438-transformer.webp" alt="transformer" width={400} style={{ border: "4px solid black" }} />
                        {showBlast && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "60%",
                                    left: "35%",
                                    transform: "translate(-50%, -50%) scale(0)",
                                    animation: 'zoomIn .4s ease-in-out forwards',
                                    '@keyframes zoomIn': {
                                        '0%': { transform: 'translate(-50%, -50%) scale(0)' },
                                        '100%': { transform: 'translate(-50%, -50%) scale(4)' }
                                    }
                                }}
                            >
                                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-256-blast.png" alt="transformer-blast" />
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>
            <Container>
                <Grid container>
                    <Grid item xs={4} padding="20px">
                        <Box>
                            <Typography variant="h6" gutterBottom>BreakDowns:</Typography>
                            <Box sx={{ border: "2px solid grey", height: "200px", overflowY: "scroll", padding: "10px" }}>
                                {observations.map((obs, index) => (
                                    <Typography key={index}>
                                        <strong>{`${obs.breakdown} Step`}</strong> - Breakdown Voltage Observed = {`${obs.observeVoltage} KV`}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6} padding="20px" >
                        {/* Conditionally show graphs based on the current test */}
                        <Box sx={{display:"flex",flex:"wrap", gap:"20px"}}>

                    
                        {currentGraph >= 1 && (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>Graph for 1st Observation:</Typography>
                                {/* Render your 1st observation graph here */}
                                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-1239-graph1.png" alt="graph1" width={200} />
                            </Box>
                        )}
                        {currentGraph >= 2 && (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>Graph for 2nd Observation:</Typography>
                                {/* Render your 2nd observation graph here */}
                                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-1257-grapgh2.png" alt="graph2" width={200} />
                            </Box>
                        )}
                        {currentGraph >= 3 && (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>Graph for 3rd Observation:</Typography>
                                {/* Render your 3rd observation graph here */}
                                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-1315-graph3.png" alt="graph3" width={200} />
                            </Box>
                        )}
                            </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default TransformerOilStrength;
