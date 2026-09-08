import { Box, Button, Container, Grid, Typography } from "@mui/material";
import React, { useState } from "react";

const volts =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-17-5130-volt-meter.jpeg";
const ammeterImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-17-5151-ameter.png";
const box1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-17-5459-Vector%201.png";
const bulbon =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-17-5341-Simple_light_bulb_graphic.png";
const leftbox =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-17-5541-Vector%208.png";
const rightbox =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-17-5520-Vector%207.png";
const batteryImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-17-5318-Rectangle_battery.png";
const StefanGraph =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-17-5415-Stefan's_graph.png";

// Constants
const STEFAN_BOLTZMANN_CONSTANT = 5.67e-8; // W/(m^2 K^4)

// Function to calculate radiation based on temperature
function calculateRadiation(temperature) {
  return STEFAN_BOLTZMANN_CONSTANT * Math.pow(temperature, 4);
}

// Function to map voltage to ammeter value
function calculateAmmeterValue(voltage) {
  if (voltage < 0) return 0;
  if (voltage > 15) return 90;
  return 15 + (voltage / 0.1) * 0.5; // Calculate based on voltage step of 0.1 V
}

const StefansLawVerification = () => {
  const [voltage, setVoltage] = useState(0); // Voltmeter reading in volts
  const [temperature, setTemperature] = useState(300); // default temperature in Kelvin
  const [radiation, setRadiation] = useState(calculateRadiation(temperature));
  const [power, setPower] = useState(0); // Electrical power in watts

  const [isPowerEnable, setIsPowerEnable] = useState(false);
  const [voltmeter, setVoltmeter] = useState(false);
  const [ammeter, setAmmeter] = useState(false);
  const [bulb, setBulb] = useState(false);
  const [battery, setBattery] = useState(false);
  const [connect, setConnect] = useState(false);
  const [completeConnections, setCompleteConnections] = useState(false);

  const handlePowerButton = () => {
    // Only toggle power if all connections are verified
    if (
      voltmeter &&
      ammeter &&
      bulb &&
      battery &&
      connect &&
      completeConnections
    ) {
      setIsPowerEnable((prev) => !prev);
    } else {
      alert("Please complete all connections before enabling power.");
    }
  };

  const handleBtn1Click = () => {
    setVoltmeter(!voltmeter);
  };

  const handleBtn2Click = () => {
    setAmmeter(!ammeter);
  };

  const handleBtn3Click = () => {
    setBulb(!bulb);
  };

  const handleBtn4Click = () => {
    setBattery(!battery);
  };

  const handleBtn5Click = () => {
    setConnect(!connect);
  };

  const handleBtn6Click = () => {
    setCompleteConnections(!completeConnections);
  };

  // Calculate ammeter value based on voltage
  const ammeterValue = calculateAmmeterValue(voltage);

  // Calculate power
  const current = ammeterValue / 1000; // Convert mA to A

  const handleVoltageChange = (event) => {
    const newVoltage = parseFloat(event.target.value);
    setVoltage(newVoltage);
    updatePower(newVoltage, current);
  };

  const handleTemperatureChange = (event) => {
    const newTemperature = parseFloat(event.target.value);
    setTemperature(newTemperature);
    setRadiation(calculateRadiation(newTemperature));
  };

  const updatePower = (voltage, current) => {
    setPower(voltage * current);
  };

  return (
    <Container maxWidth="md" sx={{ border: "1px solid", textAlign: "center" }}>
      <Box>
        <Typography variant="h4" sx={{ my: 2 }}>
          Verification of Stefan’s Law Using Voltage and Current
        </Typography>
        <img
          src={StefanGraph}
          alt="Stefan's Law"
          style={{ width: "100%", maxWidth: "600px" }}
        />

        <Grid container sx={{ my: 2 }}>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            sx={{ bgcolor: "grey", color: "#FFFFFF", p: 1 }}
          >
            <Typography sx={{ fontSize: "22px" }}>
              VERIFICATION OF STEFAN'S LAW
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Box sx={{ p: 3 }}>
              <h2>Voltmeter (V)</h2>
              <p style={{ padding: "16px" }}>{voltage} V</p>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Box sx={{ p: 3 }}>
              <h2>Ammeter Reading:</h2>
              <p style={{ padding: "16px" }}>{ammeterValue.toFixed(2)} mA</p>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6} sx={{ p: 3 }}>
            {isPowerEnable && (
              <label>
                Voltage (V):
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.01"
                  value={voltage}
                  onChange={handleVoltageChange}
                  style={{ width: "300px" }}
                />
                <span>{voltage.toFixed(2)} V</span>
              </label>
            )}
            {<br />}
            <Button
              variant="outlined"
              color={isPowerEnable ? "success" : "error"}
              sx={{ mx: 1, my: 2 }}
              onClick={handlePowerButton}
            >
              {isPowerEnable ? "Power on" : "Enable Power"}
            </Button>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={6}
            sx={{
              height: "400px",
              width: "200px",
              position: "relative",
            }}
          >
            {voltmeter && (
              <img
                src={volts}
                style={{
                  position: "absolute",
                  top: "174px",
                  left: "201px",
                  width: "62px",
                  height: "62px",
                  zIndex: 1,
                }}
                alt="volts"
              />
            )}
            {ammeter && (
              <img
                src={ammeterImg}
                style={{
                  position: "absolute",
                  top: "210px",
                  left: "322px",
                  width: "62px",
                  height: "62px",
                  zIndex: 1,
                }}
                alt="ammeter"
              />
            )}
            {connect && (
              <img
                src={box1}
                style={{
                  height: "74px",
                  width: "172px",
                  position: "absolute",
                  top: "130px",
                  left: "110px",
                }}
                alt="connect"
              />
            )}
            {bulb && (
              <img
                src={bulbon}
                style={{
                  position: "absolute",
                  top: "80px",
                  width: "55px",
                  height: "55px",
                  left: "121px",
                }}
                alt="bulb"
              />
            )}
            {battery && (
              <img
                src={batteryImg}
                style={{
                  position: "absolute",
                  top: "307px",
                  right: "190px",
                  width: "61px",
                  height: "19px",
                }}
                alt="batteryImg"
              />
            )}
            {completeConnections && (
              <>
                <img
                  src={leftbox}
                  style={{
                    position: "absolute",
                    top: "188px",
                    width: "121px",
                    height: "130px",
                    right: "249px",
                  }}
                  alt="leftbox"
                />
                <img
                  src={rightbox}
                  style={{
                    position: "absolute",
                    top: "188px",
                    width: "121px",
                    height: "130px",
                    right: "69px",
                  }}
                  alt="rightbox"
                />
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Button
              variant="outlined"
              sx={{ mx: 1, my: 2 }}
              onClick={handleBtn1Click}
            >
              Select Voltmeter
            </Button>
            <Button
              variant="outlined"
              sx={{ mx: 1, my: 2 }}
              onClick={handleBtn2Click}
            >
              Select Ammeter
            </Button>
            <Button
              variant="outlined"
              sx={{ mx: 1, my: 2 }}
              onClick={handleBtn3Click}
            >
              Select Bulb
            </Button>
            <Button
              variant="outlined"
              sx={{ mx: 1, my: 2 }}
              onClick={handleBtn4Click}
            >
              Select Battery
            </Button>
            <Button
              variant="outlined"
              sx={{ mx: 1, my: 2 }}
              onClick={handleBtn5Click}
            >
              Connect Bulb with Voltmeter
            </Button>
            <Button
              variant="outlined"
              sx={{ mx: 1, my: 2 }}
              onClick={handleBtn6Click}
            >
              Complete Connections
            </Button>
          </Grid>
        </Grid>
        {/* <Box>
          <label>
            Voltage (V):
            <input
              type="range"
              min="0"
              max="15"
              step="0.01"
              value={voltage}
              onChange={handleVoltageChange}
              style={{ width: "300px" }}
            />
            <span>{voltage.toFixed(2)} V</span>
          </label>
        </Box> */}
        {/* <div>
          <label>
            Temperature (K):
            <input
              type="number"
              value={temperature}
              onChange={handleTemperatureChange}
              min="0"
            />
          </label>
        </div>
        <div>
          <h2>Calculated Radiation:</h2>
          <p>{radiation.toFixed(2)} W/m²</p>
        </div>
        <div>
          <h2>Measured Electrical Power:</h2>
          <p>{power.toFixed(2)} W</p>
        </div>
        <div>
          <h2>Ammeter Reading:</h2>
          <p>{ammeterValue.toFixed(2)} mA</p>
        </div> */}
      </Box>
    </Container>
  );
};

export default StefansLawVerification;
