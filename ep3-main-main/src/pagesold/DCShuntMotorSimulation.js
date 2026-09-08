import React, { useState } from "react";
import { TextField, Button, Container, Typography, Grid, Box, List, ListItem, ListItemText } from "@mui/material";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function DCShuntMotorSimulation() {
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

  // Handle input changes
  const handleInputChange = (event, setter) => {
    setter(parseFloat(event.target.value));
  };

  // Calculate the results
  const calculateMotorParameters = () => {
    if (!voltage && !fieldResistance && !armatureResistance) {
      alert("To calculate the DC Motor Perfomance Value Please give the inputs value from your experiment notebook")
      return;
    }


    // Field current: Ish = V / Rsh
    const Ish = voltage / fieldResistance;

    // Armature current: Ia = (V - Eb) / Ra
    // First calculate an initial estimate for the Back EMF (simplified)
    const Eb = voltage * 0.9;

    // Calculate armature current: Ia = (V - Eb) / Ra
    const Ia = (voltage - Eb) / armatureResistance;

    // Torque: T = Ia * Ish
    const T = Ia * Ish;

    // Speed: Speed is proportional to Back EMF, approximating Speed = Eb / k (k constant)
    const N = Eb / (fieldResistance * Ia); 

    // Store calculated values with proper formatting
    setBackEmf(Eb.toFixed(2));
    setArmatureCurrent(Ia.toFixed(2));
    setFieldCurrent(Ish.toFixed(2));
    setTorque(T.toFixed(2));
    setSpeed(N.toFixed(2));

    // Update the graph data
    setData([...data, { speed: N.toFixed(2), torque: T.toFixed(2), armatureCurrent: Ia.toFixed(2) }]);
    setShowResult(true)
    setVoltage("")
    setFieldResistance("")
    setArmatureResistance("")
  };

  return (
    <Container sx={{margin:"20px auto"}}>
      <Box textAlign="center" mt={4}>
        <Typography variant="h4" gutterBottom>DC Shunt Motor Simulation</Typography>
      </Box>


      <Box sx={{ padding: "40px" }}>
        <Typography variant='h5'>DC Motor Construction -</Typography>
        <Box sx={{ border: "2px solid black", padding: "20px", bgcolor: "lightgray" }}>
          <Typography variant='h6'>What is DC Motor?</Typography>
          <Typography variant='subtitle1'>DC Motor is an electrical machine which, when provided with direct current electrical energy, converts it into mechanical energy. It is based on electromagnetic induction, where a conductor carrying current (normally a coil of wire) placed in a magnetic field experiences force to rotate. This rotation is used to perform mechanical work.</Typography>
          <Typography variant='h6'>DC Motor Parts</Typography>
          <ul>
            <li>Field System or Stator</li>
            <li>Armature</li>
            <li>Commutator</li>
            <li>Brushes</li>
          </ul>
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
      </Box>
      <Container>
        <Grid container spacing={3} >
          {/* Inputs */}
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

              {/* Results */}
              {showResult && <Box my="20px">
                <Typography variant="h5" gutterBottom>Results</Typography>
                <List>
                  <ListItem sx={{ padding: "0px " }}>
                    <ListItemText primary="Back EMF (Eb)" secondary={`${backEmf} V`} />
                  </ListItem>
                  <ListItem sx={{ padding: "0px" }}>
                    <ListItemText primary="Armature Current (Ia)" secondary={`${armatureCurrent} A`} />
                  </ListItem>
                  <ListItem sx={{ padding: "0px" }}>
                    <ListItemText primary="Field Current (Ish)" secondary={`${fieldCurrent} A`} />
                  </ListItem>
                  <ListItem sx={{ padding: "0px" }}>
                    <ListItemText primary="Torque (T)" secondary={`${torque} Nm`} />
                  </ListItem>
                  <ListItem sx={{ padding: "0px" }}>
                    <ListItemText primary="Speed (N)" secondary={`${speed} rpm`} />
                  </ListItem>
                </List>
              </Box>
              }

            </Box>
          </Grid>
          <Grid item md={6} >
            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-20-3546-DC_motor.jpeg" alt="dcMotor" width="80%" />
          </Grid>

        </Grid>
      </Container>
      <Box textAlign="center" mt={4}>
        <Button variant="contained" color="primary" onClick={calculateMotorParameters}>
          Calculate Motor Parameters
        </Button>
      </Box>
      <Box textAlign="center" mt={2}>
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

      {/* Graphs */}
     {showResult && <Grid container>
        <Grid item xs={6}>
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Speed vs Torque</Typography>
          <LineChart width={500} height={300} data={data}>
            <Line type="monotone" dataKey="speed" stroke="#8884d8" />
            <Line type="monotone" dataKey="torque" stroke="#82ca9d" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="speed" label={{ value: "Speed (rpm)", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Torque (Nm)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
          </LineChart>
        </Box>
        </Grid>
        <Grid item xs={6}>
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Speed vs Armature Current</Typography>
          <LineChart width={500} height={300} data={data}>
            <Line type="monotone" dataKey="speed" stroke="#8884d8" />
            <Line type="monotone" dataKey="armatureCurrent" stroke="#ffc658" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="speed" label={{ value: "Speed (rpm)", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Armature Current (A)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
          </LineChart>
        </Box>
        </Grid>
      </Grid>}
    </Container>
  );
}

export default DCShuntMotorSimulation;

