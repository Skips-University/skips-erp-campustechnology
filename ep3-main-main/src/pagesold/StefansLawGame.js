import { Box, Button, Container, Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import global1 from "./global1";

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

// Create a username and register no
const username = global1.name;
const registerNo = global1.regno;

const StefansLawVerification = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
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
  const [disablePower, setDisablePower] = useState(false);
  const [disableBtn1, setDisableBtn1] = useState(false);
  const [disableBtn2, setDisableBtn2] = useState(false);
  const [disableBtn3, setDisableBtn3] = useState(false);
  const [disableBtn4, setDisableBtn4] = useState(false);
  const [disableBtn5, setDisableBtn5] = useState(false);
  const [disableBtn6, setDisableBtn6] = useState(false);

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
      setIsPowerEnable(true);
      setScore((prev) => prev + 40);
      setDisablePower(true);
    } else {
      alert("Please complete all connections before enabling power.");
    }
  };

  const handleBtn1Click = () => {
    setVoltmeter(!voltmeter);
    setDisableBtn1(true);
    setScore((prev) => prev + 5);
  };

  const handleBtn2Click = () => {
    setAmmeter(!ammeter);
    setDisableBtn2(true);
    setScore((prev) => prev + 5);
  };

  const handleBtn3Click = () => {
    setBulb(!bulb);
    setDisableBtn3(true);
    setScore((prev) => prev + 5);
  };

  const handleBtn4Click = () => {
    setBattery(!battery);
    setDisableBtn4(true);
    setScore((prev) => prev + 5);
  };

  const handleBtn5Click = () => {
    setConnect(!connect);
    setDisableBtn5(true);
    setScore((prev) => prev + 5);
  };

  const handleBtn6Click = () => {
    setCompleteConnections(!completeConnections);
    setDisableBtn6(true);
    setScore((prev) => prev + 5);
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

  // Handle for next level
  const handleClickNext = () => {
    if (score >= 0 && score <= 100) {
      setScore((prev) => prev + 30);
      setLevel((prev) => prev + 1);
    }
  };

  const handleClickNext2 = () => {
    if (score >= 0 && score <= 100) {
      if (score > 60) {
        setIsFinished(true);
        setLevel((prev) => prev + 1);
      } else {
        setLevel((prev) => prev + 1);
      }
    }
  };

  return (
    <Box p="20px 0px">
      <Container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: "20px",
          fontFamily: "Montserrat sans-serif",
        }}
      >
        <Typography variant="h5" fontWeight="700">
          Username: {username}
          <br />
          Register no: {registerNo}
        </Typography>
        {level > 2 ? (
          <Button variant="contained" onClick={() => window.print()}>
            Print result
          </Button>
        ) : (
          <Typography
            variant="h5"
            fontWeight="400"
            bgcolor="#B0DAFF"
            color="#021526"
            padding="8px 14px"
            border="none"
            borderRadius="5px"
          >
            Score: {score}
          </Typography>
        )}
      </Container>

      {level === 0 && (
        <Box>
          <Container
            sx={{ display: "grid", placeItems: "center", height: "700px" }}
          >
            <Box
              sx={{
                padding: "1rem",
                my: 2,
                borderRadius: "5px",
              }}
            >
              <Typography
                variant="h4"
                textAlign="center"
                color="#FF0000"
                fontFamily="Montserrat, sans-serif"
                fontWeight="700"
                textTransform="uppercase"
              >
                VERIFICATION OF STEFAN'S LAW <br />
                Radiation with Temperature Change Using Stefan’s Law
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => setLevel((prev) => prev + 1)}
            >
              Click here to start
            </Button>
          </Container>
        </Box>
      )}

      {level === 1 && (
        <>
          <Container>
            <Typography
              variant="h6"
              marginBottom="10px"
              bgcolor="#FFFF00"
              textAlign="center"
              borderRadius="5px"
            >
              Level - {level}
            </Typography>
          </Container>
          <Container
            maxWidth="md"
            sx={{ border: "1px solid", textAlign: "center" }}
          >
            <Box>
              <Typography variant="h4" sx={{ my: 2 }}>
                Verification of Stefan’s Law Using Voltage and Current
              </Typography>
              <img
                src={StefanGraph}
                alt="Stefan's Law"
                style={{ width: "100%", maxWidth: "600px" }}
              />
            </Box>

            <Box sx={{ marginTop: 4, textAlign: "center", color: "#000" }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleClickNext}
                sx={{ marginTop: 2 }}
              >
                Next
              </Button>
            </Box>
          </Container>
        </>
      )}

      {level === 2 && (
        <>
          <Container>
            <Typography
              variant="h6"
              marginBottom="10px"
              bgcolor="#FFFF00"
              textAlign="center"
              borderRadius="5px"
            >
              Level - {level}
            </Typography>
          </Container>
          <Container
            maxWidth="md"
            sx={{ border: "1px solid", textAlign: "center" }}
          >
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
                  <p style={{ padding: "16px" }}>
                    {ammeterValue.toFixed(2)} mA
                  </p>
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
                  disabled={disablePower}
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
                  disabled={disableBtn1}
                >
                  Select Voltmeter
                </Button>
                <Button
                  variant="outlined"
                  sx={{ mx: 1, my: 2 }}
                  onClick={handleBtn2Click}
                  disabled={disableBtn2}
                >
                  Select Ammeter
                </Button>
                <Button
                  variant="outlined"
                  sx={{ mx: 1, my: 2 }}
                  onClick={handleBtn3Click}
                  disabled={disableBtn3}
                >
                  Select Bulb
                </Button>
                <Button
                  variant="outlined"
                  sx={{ mx: 1, my: 2 }}
                  onClick={handleBtn4Click}
                  disabled={disableBtn4}
                >
                  Select Battery
                </Button>
                <Button
                  variant="outlined"
                  sx={{ mx: 1, my: 2 }}
                  onClick={handleBtn5Click}
                  disabled={disableBtn5}
                >
                  Connect Bulb with Voltmeter
                </Button>
                <Button
                  variant="outlined"
                  sx={{ mx: 1, my: 2 }}
                  onClick={handleBtn6Click}
                  disabled={disableBtn6}
                >
                  Complete Connections
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ marginTop: 4, textAlign: "center", color: "#000" }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleClickNext2}
                sx={{ marginTop: 2 }}
              >
                Next
              </Button>
            </Box>
          </Container>
        </>
      )}

      {level > 2 && (
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
          <Typography
            variant="h5"
            textAlign="center"
            fontFamily="Montserrat, sans-serif"
            fontWeight="400"
            mb={"30px"}
            textTransform="capitalize"
          >
            verification of stefan's law
          </Typography>
          <Box
            sx={{
              bgcolor: isFinished ? "lightblue" : "#FF0000",
              color: !isFinished && "#FFFFFF",
              padding: "20px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "5px",
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            }}
          >
            <Box sx={{ width: "400px", overflow: "hidden",display: "grid", placeItems: "center"}}>
              <Typography
                variant="h5"
                sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: "700" }}
              >
                {isFinished
                  ? `Well Done ${username} 🎉`
                  : `Try again ${username} 😕`} 
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: "2rem",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: "400",
                }}
              >
                Your total score is <br />
                {score} / 100
              </Typography>
              {!isFinished && (
                <Typography variant="subtitle1" sx={{ fontSize: "1rem" }}>
                  You haven't completed the task properly
                </Typography>
              )}
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default StefansLawVerification;
