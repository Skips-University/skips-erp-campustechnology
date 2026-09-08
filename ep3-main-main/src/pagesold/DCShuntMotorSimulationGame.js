import React, { useState } from "react";
import { TextField, Button, Container, Typography, Grid, Box, List, ListItem, ListItemText, Checkbox, FormControlLabel } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';
import labgameCss from "../virtuallabcss/LabGame.module.css"
import global1 from "../pages/global1";

// Register chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

function DCShuntMotorSimulationGame() {

  const username = global1.name;
  const regno = global1.regno;

  const [voltage, setVoltage] = useState("");
  const [fieldResistance, setFieldResistance] = useState("");
  const [armatureResistance, setArmatureResistance] = useState("");
  const [backEmf, setBackEmf] = useState(0);
  const [armatureCurrent, setArmatureCurrent] = useState(0);
  const [fieldCurrent, setFieldCurrent] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [torque, setTorque] = useState(0);
  const [data, setData] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [level, setLevel] = useState(0)
  const [score, setScore] = useState(0)

  // Handle input changes
  const handleInputChange = (event, setter) => {
    setter(parseFloat(event.target.value));
  };


  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  // Calculate the results
  const calculateMotorParameters = () => {
    if (!voltage && !fieldResistance && !armatureResistance) {
      alert("To calculate the DC Motor Performance Value Please give the input values.");
      return;
    }

    // Field current: Ish = V / Rsh
    const Ish = voltage / fieldResistance;

    // Back EMF (Eb)
    const Eb = voltage * 0.9;

    // Armature current: Ia = (V - Eb) / Ra
    const Ia = (voltage - Eb) / armatureResistance;

    // Torque: T = Ia * Ish
    const T = Ia * Ish;

    // Speed approximation
    const N = Eb / (fieldResistance * Ia);

    // Store calculated values
    setBackEmf(Eb.toFixed(2));
    setArmatureCurrent(Ia.toFixed(2));
    setFieldCurrent(Ish.toFixed(2));
    setTorque(T.toFixed(2));
    setSpeed(N.toFixed(2));

    // Update the graph data
    setData([...data, { speed: N, torque: T, armatureCurrent: Ia }]);
    setShowResult(true);
    setVoltage("");
    setFieldResistance("");
    setArmatureResistance("");
  };

  // Prepare data for Speed vs Torque chart
  const speedVsTorqueData = {
    labels: data.map((_, index) => `Data ${index + 1}`),
    datasets: [
      {
        label: 'Speed (rpm)',
        data: data.map(d => d.speed),
        fill: false,
        borderColor: '#8884d8',
        tension: 0.1,
      },
      {
        label: 'Torque (Nm)',
        data: data.map(d => d.torque),
        fill: false,
        borderColor: '#82ca9d',
        tension: 0.1,
      }
    ],
  };

  // Prepare data for Speed vs Armature Current chart
  const speedVsArmatureCurrentData = {
    labels: data.map((_, index) => `Data ${index + 1}`),
    datasets: [
      {
        label: 'Speed (rpm)',
        data: data.map(d => d.speed),
        fill: false,
        borderColor: '#8884d8',
        tension: 0.1,
      },
      {
        label: 'Armature Current (A)',
        data: data.map(d => d.armatureCurrent),
        fill: false,
        borderColor: '#ffc658',
        tension: 0.1,
      }
    ],
  };

  return (
    <Container sx={{ margin: "20px auto" }}>

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
          Checking the Phase Sequence of Synchronous Machine
        </Typography>
        {level > 0 && level < 3 && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor: "yellow", margin: "10px 0px" }}>
            <Typography variant='h6' className={labgameCss.level}>
              Level- {level}
            </Typography>
          </div>
        )}
      </Container>

      {
        level === 0 && (
          <Container sx={{ margin: "20px auto", padding: "10px", border: "5px solid grey" }}>
            <Typography variant='h5'>DC Motor Construction -</Typography>
            <Typography variant='h6'>What is DC Motor?</Typography>
            <Typography variant='subtitle1'>DC Motor is an electrical machine which, when provided with direct current electrical energy, converts it into mechanical energy. It is based on electromagnetic induction, where a conductor carrying current (normally a coil of wire) placed in a magnetic field experiences force to rotate. This rotation is used to perform mechanical work.</Typography>
            <Typography variant='h6'>DC Motor Parts</Typography>
            <ul>
              <li>Field System or Stator</li>
              <li>Armature</li>
              <li>Commutator</li>
              <li>Brushes</li>
            </ul>
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
      {level === 1 &&
        <Box sx={{ padding: "40px" }}>
          <Typography variant='h5'>DC Motor Construction -</Typography>
          <Box sx={{ border: "2px solid black", padding: "20px", bgcolor: "lightgray" }}>
            <Typography variant='h6'>Instruction to perform Experiment</Typography>
            <Typography variant='subtitle1' py="5px"><b>Step 1:</b> Add inputs value </Typography>
            <Typography variant='subtitle1' ><u>Demo value:</u> </Typography>
            <Typography variant='body2'>{`Terminal Voltage (in volt) : 230`} </Typography>
            <Typography variant='body2'>{`Feild Resistance (in Ohm) : 160`} </Typography>
            <Typography variant='body2'>{`Armature Resistance (in Ohm) : 1`} </Typography>
            <Typography variant='subtitle1' py="5px"><b>Step 2:</b> After giving the value please click on Calculate Button to get the output</Typography>
            <Typography variant='subtitle1' py="5px"><b>Step 3:</b> Output value</Typography>
            <Typography variant='body2'>{`Back EMF (Eb) : 270.00 V`} </Typography>
            <Typography variant='body2'>{`Armature Current (Ia) : 23.00 A`} </Typography>
            <Typography variant='body2'>{`Field Current (Ish) : 1.44 A`} </Typography>
            <Typography variant='body2'>{`Torque (T) : 33.06 Nm`} </Typography>
            <Typography variant='body2'>{`Speed (N) : 0.06 rpm`} </Typography>
          </Box>
          <Box textAlign="center" mt={2} sx={{ display: "flex", margin: "10px auto", gap: "10px" }}>
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
              label="Read the Procedure"
            />
            <Button
              variant="contained"
              color="success"
              disabled={!isChecked}
              sx={{ ml: 2 }}
              onClick={() => {
                alert('Proceeding to the next level!')
                setLevel(prev => prev + 1)
                if (showDiagram) {
                  setScore(prev => prev + 40)
                } else {
                  setScore(prev => prev + 20)
                }
              }}
            >
              Next
            </Button>
            <Button variant="contained" color="primary" onClick={() => setShowDiagram(!showDiagram)}>
              Show Diagram
            </Button>
          </Box>
          {showDiagram && <Grid container >
            <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" flexDirection="column" marginTop="30px">
              <Typography variant="h6">Design of Inner Construction of DC Motor</Typography>
              <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-20-3517-InnerDCmotor.jpeg" alt="dcMotor" width="60%" style={{ margin: "40px 0px" }} />
            </Grid>
          </Grid>
          }
        </Box>
      }

      {level === 2 && <Container>
        {/* Input Fields */}
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box p="14px">
                <TextField
                  fullWidth
                  label="Terminal Voltage (V)"
                  type="number"
                  value={voltage}
                  onChange={(e) => handleInputChange(e, setVoltage)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Field Resistance (Rsh) in Ω"
                  type="number"
                  value={fieldResistance}
                  onChange={(e) => handleInputChange(e, setFieldResistance)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Armature Resistance (Ra) in Ω"
                  type="number"
                  value={armatureResistance}
                  onChange={(e) => handleInputChange(e, setArmatureResistance)}
                  margin="normal"
                  required
                />

                {/* Display Results */}
                {showResult && <Box my="20px">
                  <Typography variant="h5" gutterBottom>Results</Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Back EMF (Eb)" secondary={`${backEmf} V`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Armature Current (Ia)" secondary={`${armatureCurrent} A`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Field Current (Ish)" secondary={`${fieldCurrent} A`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Torque (T)" secondary={`${torque} Nm`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Speed (N)" secondary={`${speed} rpm`} />
                    </ListItem>
                  </List>
                </Box>}
              </Box>
            </Grid>
            <Grid item md={6}>
              <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-20-3546-DC_motor.jpeg" alt="dcMotor" width="80%" />
            </Grid>
          </Grid>
        </Container>

        {/* Calculate Button */}
        <Box textAlign="center" mt={4}>
          <Button variant="contained" color="primary" onClick={calculateMotorParameters}>
            Calculate Motor Parameters
          </Button>
        </Box>


        {/* Charts Section */}
        {showResult && (
          <Grid container spacing={4} mt={4}>
            {/* Speed vs Torque Chart */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Speed vs Torque</Typography>
              <Line data={speedVsTorqueData} />
            </Grid>

            {/* Speed vs Armature Current Chart */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Speed vs Armature Current</Typography>
              <Line data={speedVsArmatureCurrentData} />
            </Grid>
          </Grid>
        )}

        <Box sx={{ width: "100px ", margin: "30px auto" }}>
          <Button
            variant="contained"
            color="success"
            sx={{ ml: 2 }}
            onClick={() => {
              if (showResult) {
                setLevel(prev => prev + 1)
                setScore(prev => prev + 60)
              }else{
                alert("Please perform the experiment ")
              }
            }}
          >
            Next
          </Button>
        </Box>
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

          </Container>
        )
      }
    </Container>
  );
}

export default DCShuntMotorSimulationGame;
