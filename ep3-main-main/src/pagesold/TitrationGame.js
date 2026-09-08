import React, { useState } from 'react';
import { Container, Grid, Slider, Box, Button, Typography } from '@mui/material';
import labgameCss from "../virtuallabcss/LabGame.module.css";
import global1 from "../pages/global1";

const TitrationGame = () => {

    const username = global1.name;
    const regno = global1.regno;

    const [score, setScore] = useState(0);
    const [step, setStep] = useState(0);
    const [method, setMethod] = useState({
        column: false,
        bubble: false
    });
    const [columnDone, setColumnDone] = useState({
        phenolphthaleinTitration: false,
        methylOrangeTitration: false
    });
    const [bubbleDone, setBubbleDone] = useState(false);  
    const [bubbleMethylIndicator, setBubbleMethylIndicator] = useState(false)

    const [columnIndicator, setColumnIndicator] = useState({
        phenolphthalein: false,
        methylOrange: false
    })
    const { phenolphthalein, methylOrange } = columnIndicator
    const { column, bubble } = method;

    const [sliderValues, setSliderValues] = useState({
        naohConcentration: 0,
        liquidFlowRate: 0,
        gaseousFlowRate: 0,
        naohBubblePotConcentration: 0,
    });

    const normalSolution = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-23-346-normalSolution.png";
    const phenolphthaleinSolution = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-27-554-neutralizedSolutionBeaker.png";
    const methylOrangeSolution = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-27-5541-methyl_orange.png";

    const handleSliderChange = (name) => (event, newValue) => {
        setSliderValues((prevValues) => ({
            ...prevValues,
            [name]: newValue,
        }));
    };

    const handleTitrationMethod = (type) => {
        if (type === 'column') {
            setMethod({ column: true, bubble: false });
            setStep((prev) => prev + 1)
        } else if (type === 'bubble') {
            if (method.column) {
                setMethod({ column: false, bubble: true });
            } else {
                alert("First complete Level 3")
            }
        }
    };

    const handleColumnTitration = (type) => {
        if (type === 'phenolphthalein' && phenolphthalein) {
            setScore((prev) => prev + 20);
            setColumnDone((prev) => ({ ...prev, phenolphthaleinTitration: true }));
            alert("Phenolphthalein Experiment is done, check the score")
        } else if (type === 'methylOrange' && methylOrange) {
           
            setScore((prev) => prev + 20);
            setColumnDone((prev) => ({ ...prev, methylOrangeTitration: true }));
            alert("Methyl Orange Experiment is done, check the score")
        } else {
            alert("Please add the Indicator first");
        }
    };

    const handleBubbleTitration = (type) => {
        if (type === 'methylOrange' && bubbleMethylIndicator) {
            setScore((prev) => prev + 20);
            setBubbleDone(true);
            alert("Methyl Orange Experiment is done, check the score")
        } else {
            alert("Please add the Indicator first");
        }
    };

    const handleNextBtn = () => {
        if (sliderValues.naohConcentration === 0 ||
            sliderValues.liquidFlowRate === 0 ||
            sliderValues.gaseousFlowRate === 0 ||
            sliderValues.naohBubblePotConcentration === 0) {
            alert("All the values should be more than zero. Click OK to start again.");
            setStep((prev) => prev - 1);
        } else {
            setStep((prev) => prev + 1);
            setScore((prev) => prev + 40);
        }
    };

    return (
        <Box p="30px">
            <Container sx={{ display: 'flex', justifyContent: 'space-between', pb: '10px' }}>
                <Box>
                    <Typography variant='h6' fontWeight="bold">
                        Student Name : {username}
                    </Typography>
                    <Typography variant='h6' fontWeight="bold">
                        Registration No. : {regno}
                    </Typography>
                </Box>
                {step <= 4 ? (
                    <Box >
                        <Typography variant='h6' borderRadius="5px" padding="8px 14px" fontWeight="bold" bgcolor="#B0DAFF" color="#021526" >
                            Score - {score}
                        </Typography>
                    </Box>
                ) : (
                    <Button variant='contained' sx={{height:"40px"}} onClick={() => {
                        window.print()
                    }}>
                        Print Result
                    </Button>
                )}
            </Container>

            <Container>
                <Typography variant='h4' textAlign="center" fontWeight="bold">
                    Gas-Liquid Absorption
                </Typography>
                {step > 0 && step < 5 && (
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor: "yellow", margin: "10px 0px" }}>
                        <Typography variant='h6' className={labgameCss.level}>
                            Level- {step}
                        </Typography>
                    </div>
                )}
            </Container>

            {!column && !bubble && (
                <Container sx={{ border: "5px solid grey", padding: "20px", margin: "20px auto" }}>
                    {step === 0 && (
                        <Box>
                            <Typography variant='h5'>Constant Parameters </Typography>
                            <Typography variant='subtitle2'>Parameters that remain constant throughout experiment and to be used in calculation</Typography>
                            <Typography variant='subtitle2'>Concentration of HCl = 1 M</Typography>
                            <Typography variant='subtitle2'>Volume collected for titration =10 ml</Typography>
                            <Typography variant='subtitle2'>Time of run of experiment =10 min</Typography>
                            <Typography variant='subtitle2'>Volume of NaOH initially in Bubbling Pot = 3 l</Typography>
                            <Button variant='contained' sx={{ margin: "20px 0px" }} onClick={() => setStep(prev => prev + 1)}>Procced for experiment </Button>
                        </Box>
                    )}

                    {step === 1 && (
                        <Box>
                            <Typography variant='h5'>Input Parameters</Typography>
                            <Typography variant='subtitle1'>Select the values to run the experiment</Typography>
                            <Typography variant='h6'>Input parameters for column</Typography>
                            <hr />
                            {/* Sliders for input values */}
                            {/* Slider 1: NaOH Concentration */}
                            <Box p="20px" >
                                <Typography variant="subtitle1">Concentration of NaOH</Typography>
                                <Slider
                                    value={sliderValues.naohConcentration}
                                    min={0}
                                    max={3}
                                    step={0.1}
                                    onChange={handleSliderChange('naohConcentration')}
                                    aria-label="NaOH Concentration"
                                    valueLabelDisplay="auto"
                                    sx={{ width: 200 }}
                                />
                                <Box sx={{ padding: "10px", width: "50px", fontSize: "20px", bgcolor: "green", textAlign: "center" }}>{sliderValues.naohConcentration}</Box>
                            </Box>

                            {/* Slider 2: Flow rate of liquid phase */}
                            <Box p="20px">
                                <Typography variant="subtitle1">Flow rate of liquid phase</Typography>
                                <Slider
                                    value={sliderValues.liquidFlowRate}
                                    min={0}
                                    max={10}
                                    step={1}
                                    onChange={handleSliderChange('liquidFlowRate')}
                                    aria-label="Liquid Flow Rate"
                                    valueLabelDisplay="auto"
                                    sx={{ width: 200 }}
                                />
                                <Box sx={{ padding: "10px", width: "50px", fontSize: "20px", bgcolor: "green", textAlign: "center" }}>{sliderValues.liquidFlowRate}</Box>
                            </Box>

                            {/* Slider 3: Flow rate of gaseous phase */}
                            <Box p="20px">
                                <Typography variant="subtitle1">Flow rate of gaseous phase</Typography>
                                <Slider
                                    value={sliderValues.gaseousFlowRate}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onChange={handleSliderChange('gaseousFlowRate')}
                                    aria-label="Gaseous Flow Rate"
                                    valueLabelDisplay="auto"
                                    sx={{ width: 200 }}
                                />
                                <Box sx={{ padding: "10px", width: "50px", fontSize: "20px", bgcolor: "green", textAlign: "center" }}>{sliderValues.gaseousFlowRate}</Box>
                            </Box>

                            <Typography variant='h6'>Input parameters for bubble pot</Typography>
                            <hr />
                            {/* Slider 4: NaOH concentration in bubble pot */}
                            <Box p="20px">
                                <Typography variant="subtitle1">Concentration of NaOH in bubble pot</Typography>
                                <Slider
                                    value={sliderValues.naohBubblePotConcentration}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                    onChange={handleSliderChange('naohBubblePotConcentration')}
                                    aria-label="NaOH in Bubble Pot"
                                    valueLabelDisplay="auto"
                                    sx={{ width: 200 }}
                                />
                                <Box sx={{ padding: "10px", width: "50px", fontSize: "20px", bgcolor: "green", textAlign: "center" }}>{sliderValues.naohBubblePotConcentration}</Box>
                            </Box>
                            <Button
                                variant='contained'
                                sx={{ margin: "20px 0px" }}
                                onClick={handleNextBtn}
                            >
                                Proceed for next step
                            </Button>
                        </Box>
                    )}

                    {step === 2 && (
                        <Box>
                            <Box>
                                <Button variant='contained' color="success" sx={{ margin: "10px" }} onClick={() => handleTitrationMethod('column')}>
                                    level 3
                                </Button>
                                <Button variant='contained' color="success" sx={{ margin: "10px" }} onClick={() => handleTitrationMethod('bubble')}>
                                    Level 4
                                </Button>
                            </Box>
                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-23-109-titrationImg.png" alt="titration" width={"80%"} height={"600px"} />
                        </Box>
                    )}
                </Container>
            )
            }

            {/* If column is true, show the column titration component */}
            {
                column && step === 3 && (
                    <Container>
                        <Grid container>
                            <Box sx={{ bgcolor: "lightgrey", padding: "20px", margin: "20px 0px" }}>
                                <Typography variant="h5">Titration of column sample</Typography>
                                <Typography variant="subtitle1">{`1) The liquid sample coming out from column contains NaOH and Na2CO3. The sample is titrated with HCl in presence of Phenolphthalein Indicator. The (first) end point is obtained by change of color of solution from pink to colorless.`}</Typography>
                                <Typography variant="subtitle1">{`2) Titrated sample is now further titrated with HCl in presence of Methyl Orange Indicator. The (second) end point is obtained by change of color of solution from yellow to Orange.`}</Typography>
                            </Box>
                            <Grid item xs={12} md={6} display="flex" justifyContent="center">
                                <Box >
                                    <Box sx={{ position: "relative" }}>
                                        <img src={normalSolution} alt="normalSolution" height={"500px"} />
                                        {phenolphthalein && <img src={phenolphthaleinSolution} alt="phenolphthaleinSolution" style={{ position: "absolute", bottom: "125px", left: "91px", width: "100px" }} className={labgameCss.fadeInAnimation} />}
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                                        {phenolphthalein && <Typography variant='h6' sx={{ margin: "10px 0px", width: "350px" }} color="error">Check the Solution color has been changed from colorless to pink. </Typography>}
                                        <Button variant='contained' sx={{ width: "250px" }} onClick={() => {
                                            setColumnIndicator((prev) => ({ ...prev, phenolphthalein: true }))
                                        }}> Add Phenolphthalein</Button>
                                        <Button variant='contained' sx={{ width: "250px" }} onClick={() => handleColumnTitration("phenolphthalein")}> Perform Titration</Button>
                                        {columnDone.phenolphthaleinTitration && <Typography variant='h6' width="350px">Volume of HCl used in Second titration 20-25 mL</Typography>}
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} display="flex" justifyContent="center">
                                <Box>
                                    <Box sx={{ position: "relative" }}>
                                        <img src={normalSolution} alt="normalSolution" height={"500px"} />
                                        {methylOrange && <img src={methylOrangeSolution} alt="methylOrangeSolution" style={{ position: "absolute", bottom: "126px", left: "95px", width: "100px" }} className={labgameCss.fadeInAnimation} />}
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "30px", margin: "0px" }}>
                                        {methylOrange && <Typography variant='h6' sx={{ margin: "10px 0px", width: "350px" }} color="error">Check the Solution color has been changed from colorless to Orange. </Typography>}
                                        <Button variant='contained' sx={{ width: "250px" }} onClick={() => {
                                            setColumnIndicator((prev) => ({ ...prev, methylOrange: true }))
                                        }}> Add methyl Orange</Button>

                                        <Button variant='contained' sx={{ width: "250px" }} onClick={() => handleColumnTitration("methylOrange")}> Perform Titration</Button>
                                        {columnDone.methylOrangeTitration && <Typography variant='h6' width="350px">Volume of HCl used in Second titration 20-25 mL</Typography>}
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                        <Button variant='contained' color='success' sx={{ display: "flex", margin: "20px auto", }}
                            onClick={() => {
                                if (columnDone.phenolphthaleinTitration || columnDone.methylOrangeTitration) {
                                    setStep(prev => prev + 1)
                                    setMethod({ column: false, bubble: true });
                                } else {
                                    alert("Perfom the Experiment to go for next level")
                                }
                            }}>Next Level</Button>
                    </Container>
                )
            }

            {/* If bubble is true, show the bubble titration component */}
            {
                bubble && step === 4 && (
                    <Container>
                        <Grid conatiner>
                            <Box sx={{ bgcolor: "lightgrey", padding: "20px", margin: "20px 0px" }}>
                                <Typography variant="h5">Titration of column sample</Typography>
                                <Typography variant="subtitle1">{`1) The liquid sample coming out from column contains NaOH and Na2CO3. The sample is titrated with HCl in presence of Phenolphthalein. The (first) end point is obtained by change of color of solution from pink to colorless.`}</Typography>
                                <Typography variant="subtitle1">{`2) Titrated sample is now further titrated with HCl in presence of Methyl Orange. The (second) end point is obtained by change of color of solution from yellow to Orange.`}</Typography>
                            </Box>
                            <Grid container>
                                <Grid item xs={12} md={2}></Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ position: "relative" }}>
                                        <img src={normalSolution} alt="normalSolution" height={"500px"} />
                                        {bubbleMethylIndicator && <img src={methylOrangeSolution} alt="methylOrangeSolution" style={{ position: "absolute", bottom: "126px", left: "95px", width: "100px" }} className={labgameCss.fadeInAnimation} />}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "30px", margin: "50px 0px" }}>
                                        {bubbleMethylIndicator && <Typography variant='h6' sx={{ margin: "10px 0px", width: "400px" }} color="error">Check the Solution color has been changed from colorless to Orange. </Typography>}
                                        <Button variant='contained' onClick={() => {
                                            setBubbleMethylIndicator(true)
                                        }}> Add Methyl Orange</Button>
                                        <Button variant='contained' onClick={() => handleBubbleTitration("methylOrange")}> Perform Titration</Button>
                                        {bubbleDone && <Typography variant='h6'>Volume of HCl used in titration 26 ml</Typography>}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={3}></Grid>
                            </Grid>
                        </Grid>
                        <Button variant='contained' color='success' onClick={() => {
                            if (bubbleDone) {
                                setStep(prev => prev + 1)
                            } else {
                                alert("Complete this level  ")
                            }
                        }}>Next Level</Button>
                    </Container>
                )
            }
            {
                step > 4 && (
                    <Container
                        sx={{
                            width: "100%",
                            height: "400px",
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
                                bgcolor: "lightblue",
                                padding: "20px",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px"
                            }}
                        >
                            <Box >
                                <Typography variant="h5">{(columnDone.methylOrangeTitration && columnDone.phenolphthaleinTitration) ? "Well Done Sonali 🎉" : " Sonali"}</Typography>
                                <Typography variant="subtitle1" sx={{ fontSize: "2rem" }}>
                                    Your total score is  <br />{score} / 100
                                </Typography>
                                {(!columnDone.methylOrangeTitration || !columnDone.phenolphthaleinTitration) && (
                                    <Typography variant="subtitle1" sx={{ fontSize: "1rem" }}>
                                        You haven't completed the task properly
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                    </Container>
                )
            }
        </Box >
    );
};

export default TitrationGame;
