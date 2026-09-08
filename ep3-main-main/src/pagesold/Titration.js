import React, { useState } from 'react'
import { Grid, Slider, Box, Button, Typography } from '@mui/material'


const Titration = () => {

    const [step, setStep] = useState(1)
    const [result, setResult] = useState(false)
    const [method, setMethod] = useState({
        column: false,
        bubble: false
    })

    const [columntitration, setColumntitration] = useState({
        phenolphthaleinTitration: false,
        methylOrangeTitration: false
    })

    const [phenolphthalein, setPhenolphthalein] = useState(false)
    const [methylOrange, setmethylOrange] = useState(false)
    const { column, bubble } = method
    const { phenolphthaleinTitration, methylOrangeTitration } = columntitration

    // Single state object to store all slider values
    const [sliderValues, setSliderValues] = useState({
        naohConcentration: 0,
        liquidFlowRate: 0,
        gaseousFlowRate: 0,
        naohBubblePotConcentration: 0,
    });

    const normalSolution = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-23-346-normalSolution.png"
    const phenolphthaleinSolution = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-23-42-neutralizedSolution.png"
    const methylOrangeSolution = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-23-321-MithyleSolution.png"

    // Generic handle change function
    const handleSliderChange = (name) => (event, newValue) => {
        setSliderValues((prevValues) => ({
            ...prevValues,
            [name]: newValue,
        }));
    };

    // Function to handle button clicks and update the state
    const handleTitrationMethod = (type) => {
        if (type === 'column') {
            setMethod({ column: true, bubble: false });
        } else if (type === 'bubble') {
            setMethod({ column: false, bubble: true });
        }

    };

    // Function to handle button clicks and update the state
    const handleColumnTitration = (type) => {
        if (type === 'phenolphthalein') {
            setColumntitration({ phenolphthaleinTitration: true, methylOrangeTitration: false });
            setResult(true)
        } else if (type === 'methylOrange') {
            setColumntitration({ phenolphthaleinTitration: false, methylOrangeTitration: true });
            setResult(true)
        }
    };

  


    return (
        <Box p="30px">
            <Typography variant='h4' textAlign="center" fontWeight="bold">Gas- Liquid Absorption</Typography>

            {/* Only show this section if neither column nor bubble is selected */}
            {!column && !bubble && (
                <Box sx={{ border: "5px solid grey", padding: "20px", margin: "20px 0px" }}>
                    {step === 1 && (
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

                    {step === 2 && (
                        <Box>
                            <Typography variant='h5'>Input Parameters</Typography>
                            <Typography variant='subtitle1'>Select the values to run the experiment</Typography>
                            <Typography variant='h6'>Input parameters for column</Typography>
                            <hr />
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
                                onClick={() => setStep(prev => prev + 1)}
                                disabled={
                                    sliderValues.naohConcentration === 0 ||
                                    sliderValues.liquidFlowRate === 0 ||
                                    sliderValues.gaseousFlowRate === 0 ||
                                    sliderValues.naohBubblePotConcentration === 0
                                }
                            >
                                Proceed for next step
                            </Button>
                        </Box>
                    )}

                    {step === 3 && (
                        <Box>
                            <Button variant='contained' sx={{ margin: "10px" }} onClick={() => handleTitrationMethod('column')}>Perform Titration of column sample</Button>
                            <Button variant='contained' sx={{ margin: "10px" }} onClick={() => handleTitrationMethod('bubble')}>Perform Titration of Bubble pot</Button>
                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-23-109-titrationImg.png" alt="titration" width={"80%"} height={"600px"} />
                        </Box>
                    )}
                </Box>
            )}

            {/* If column is true, show the column titration component */}
            {column && (
                <Box>

                    <Grid container>

                        <Box sx={{ bgcolor: "lightgrey", padding: "20px", margin: "20px 0px" }}>

                            <Typography variant="h5">Titration of column sample</Typography>
                            <Typography variant="subtitle1">{`1) The liquid sample coming out from column contains NaOH and Na2CO3. The sample is titrated with HCl in presence of Phenolphthalein. The (first) end point is obtained by change of color of solution from pink to colorless.`}</Typography>
                            <Typography variant="subtitle1">{`2) Titrated sample is now further titrated with HCl in presence of Methyl Orange. The (second) end point is obtained by change of color of solution from yellow to Orange.`}</Typography>
                        </Box>
                        <Grid item xs={12} md={6}>
                            <Box>
                                <img src={phenolphthalein ? phenolphthaleinSolution : normalSolution} alt="normalSolution" height={"500px"} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                                    {phenolphthalein && <Typography variant='h6' sx={{ margin: "10px 0px", width: "400px" }} color="error">Check the Solution color has been changed from colorless to pink. </Typography>}
                                    <Button variant='contained' sx={{ width: "250px" }} onClick={() => {
                                        setPhenolphthalein(true)
                                        alert("Phenolphthalein Added to the solution ");
                                        // handleColumnTitration("phenolphthalein")
                                    }}> Add Phenolphthalein</Button>
                                    <Button variant='contained' sx={{ width: "250px" }} onClick={() => handleColumnTitration("phenolphthalein")}> Perform Titration</Button>
                                    {phenolphthaleinTitration && <Typography variant='h6'>Volume of HCl used in first titration 20-25 mL</Typography>}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box>
                                <img src={methylOrange ? methylOrangeSolution : normalSolution} alt="normalSolution" height={"500px"} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "30px", margin: "0px" }}>
                                    {methylOrange && <Typography variant='h6' sx={{ margin: "10px 0px", width: "400px" }} color="error">Check the Solution color has been changed from colorless to Orange. </Typography>}
                                    <Button variant='contained' sx={{ width: "250px" }} onClick={() => {
                                        setmethylOrange(true)
                                        alert("methyl Orange Added to the solution")

                                    }}> Add methyl Orange</Button>

                                    <Button variant='contained' sx={{ width: "250px" }} onClick={() => handleColumnTitration("methylOrange")}> Perform Titration</Button>
                                    {methylOrangeTitration && <Typography variant='h6'>Volume of HCl used in Second titration 20-25 mL</Typography>}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* <Button variant='contained' color="error" sx={{ margin: "20px 0px" }} onClick={handleBack}> Go Back</Button> */}





                </Box>
            )}

            {/* If bubble is true, show the bubble titration component */}
            {bubble && (
                <Grid conatiner>
                    <Box sx={{ bgcolor: "lightgrey", padding: "20px", margin: "20px 0px" }}>
                        <Typography variant="h5">Titration of column sample</Typography>
                        <Typography variant="subtitle1">{`1) The liquid sample coming out from column contains NaOH and Na2CO3. The sample is titrated with HCl in presence of Phenolphthalein. The (first) end point is obtained by change of color of solution from pink to colorless.`}</Typography>
                        <Typography variant="subtitle1">{`2) Titrated sample is now further titrated with HCl in presence of Methyl Orange. The (second) end point is obtained by change of color of solution from yellow to Orange.`}</Typography>
                    </Box>
                    <Grid container>
                        <Grid item xs={12} md={2}></Grid>
                        <Grid item xs={12} md={4}>
                            <img src={methylOrange ? methylOrangeSolution : normalSolution} alt="normalSolution" height={"500px"} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "30px", margin: "50px 0px" }}>
                                {methylOrange && <Typography variant='h6' sx={{ margin: "10px 0px", width: "400px" }} color="error">Check the Solution color has been changed from colorless to Orange. </Typography>}
                                <Button variant='contained' onClick={() => {
                                    setmethylOrange(true)
                                    alert("Methyl Orange Added to the solution ");
                                }}> Add Methyl Orange</Button>
                                <Button variant='contained' onClick={() => handleColumnTitration("methylOrange")}> Perform Titration</Button>
                                {result && <Typography variant='h6'>Volume of HCl used in titration 26 ml</Typography>}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}></Grid>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default Titration;



