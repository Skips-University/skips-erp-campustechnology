import React, { useState } from "react";
import styles from "../virtuallabcss/BitSerialGame.module.css";
import {
  Box,
  Button,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
} from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { useSnackbar } from "notistack";

// Import global1 file here
import global1 from "./global1";

const btnRed =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4024-switchOff.png";
const btnGreen =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4112-switchOn.png";
const lightoff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-3936-bulboff.png";
const lighton =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-4010-bulbon.png";
const batteryimg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-2616-battery-filp-button-new-Photo.png";

// Global1 username and regno
const username = global1.name;
const registerNo = global1.regno;

function BitSerial() {
  const { enqueueSnackbar } = useSnackbar();

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [batteryClicked, setBatteryClicked] = useState(false); // New state

  // State for button and battery states
  const [btnClick1, setBtnClick1] = useState(false);
  const [shiftBattery, setShiftBattery] = useState(false);

  // State for reset and preset button
  const [reset, setReset] = useState(false);
  const [pReset, setPReset] = useState(false);

  // State to track the number of clock clicks and store the data
  const [clockClicks, setClockClicks] = useState(0);
  const [tableData, setTableData] = useState([]); // State to store table data

  // Handle battery click
  const handleBatteryClick = () => {
    if (!batteryClicked) {
      // Check if battery has already been clicked
      setScore(score + 55);
      setBatteryClicked(true); // Set the batteryClicked state to true
    }

    const message = shiftBattery
      ? "Battery disconnected!"
      : "Battery connected!";

    const utterance = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(utterance);

    setShiftBattery(!shiftBattery);

    enqueueSnackbar(message, {
      autoHideDuration: 2000,
      variant: shiftBattery ? "error" : "success",
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "center",
      },
      preventDuplicate: true,
    });
  };

  // Handle button click: Toggle between 0 and 1
  const handleButtonClick = () => {
    if (!shiftBattery) {
      enqueueSnackbar("Connect the battery first!", {
        variant: "warning",
        autoHideDuration: 2000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        preventDuplicate: true,
      });
      return;
    }
    setBtnClick1((prev) => !prev);
  };

  // Handle clock click
  const handleClockClick = () => {
    if (shiftBattery && btnClick1) {
      if (reset || !pReset) {
        setClockClicks((prevClicks) => prevClicks + 1);
      }
    } else {
      enqueueSnackbar("Ensure both the button data input and battery are on!", {
        variant: "warning",
        autoHideDuration: 2000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        preventDuplicate: true,
      });
    }
  };

  // Handle print click
  const handlePrintClick = () => {
    window.print();
  };

  // Determine which light images to show based on the clock clicks
  const getLightValue = (lightNumber) => {
    return clockClicks >= lightNumber ? 1 : 0; // Return 1 for lighton, 0 for lightoff
  };

  const getLightImage = (lightNumber) => {
    return clockClicks >= lightNumber ? lighton : lightoff;
  };

  const handleResetClick = () => {
    setReset(!reset);
    setClockClicks(4); // All lights on
  };

  const handlePresetClick = () => {
    setPReset(!pReset);
    setClockClicks(0); // All lights off
  };

  // Handle adding a row to the table
  const handleAddClick = () => {
    const dataInput = btnClick1 ? 1 : 0; // Get current data input value
    const newRow = {
      clock: clockClicks + 1,
      dataInput: dataInput,
      Q3: getLightValue(4),
      Q2: getLightValue(3),
      Q1: getLightValue(2),
      Q0: getLightValue(1),
    };

    setTableData([...tableData, newRow]);
  };

  // Handle reset for table data
  const handleResetTableData = () => {
    setTableData([]);
  };

  // Handle next button click
  const handleNextClick = () => {
    if (batteryClicked) {
      // Check if battery has already been clicked
      setScore(score + 45);
      setLevel((prev) => prev + 1);
      setIsFinished(true);
      setBatteryClicked(true); // Set the batteryClicked state to true
    } else {
      setLevel((prev) => prev + 1);
      let randomNumber = Math.floor(Math.random() * 40);
      setScore(randomNumber);
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
        {level > 1 ? (
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
                Design and verification of 4-Bit Serial In Parallel Out Shift
                Register
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

          <Grid container spacing={2} direction="column" alignItems="center">
            <Grid item xs={12}>
              <h3>
                Design and verification of 4-Bit Serial In Parallel Out Shift
                Register.
              </h3>
              <Box className={styles.cardWrapperBitSerial}>
                <Box className={styles.instrauctionwrapper}>
                  <h3>
                    <span className={styles.unText}>INSTRUCTIONS</span>
                  </h3>
                  <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <li>Connect the battery to supply 5V to the circuit.</li>
                    <li>Keep the RESET and PRESET as active high signals.</li>
                    <li>Apply the data at the Data Input.</li>
                    <li>
                      Apply one clock pulse at Clock 1 and observe this data at
                      LED Q.
                    </li>
                    <li>
                      Click on "
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "#008000",
                          fontWeight: "600",
                        }}
                      >
                        Add
                      </span>
                      " button to add data to the Truth Table.
                    </li>
                    <li>Apply the next data at the Data Input.</li>
                    <li>
                      <b>
                        Apply one clock pulse at Clock 2; observe that the data
                        on Q<sub>3</sub> will shift to Q<sub>2</sub>, and the
                        new data applied will appear at Q<sub>3</sub>.
                      </b>
                    </li>
                    <li>
                      Repeat steps 3 to 5 until all 4 bits of data appear at the
                      output of the shift register.
                    </li>
                    <li>
                      Click "
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "#0000FF",
                          fontWeight: "600",
                        }}
                      >
                        Print
                      </span>
                      " to get a printout of the Truth Table.
                    </li>
                  </ol>
                </Box>
              </Box>
              <Box className={styles.cardWrapperBitSerial}>
                <Box className={styles.titleBitSerial}>
                  <marquee>
                    <h3>
                      Design and verification of 4-Bit Serial In Parallel Out
                      Shift Register
                    </h3>
                  </marquee>
                </Box>
                {/* Displaying the image based on button states */}
                <img
                  src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-3-5236-bit-serial.png"
                  alt="4-bit-serial logic gate"
                  className={styles.backgroundImageBitSerial}
                />

                {/* Light images, updated to show based on the number of clock clicks */}
                <img
                  src={getLightImage(4)}
                  alt="light1"
                  className={styles.backgroundImageBitSerialLight}
                />

                <img
                  src={getLightImage(3)}
                  alt="light2"
                  className={styles.backgroundImageBitSerialLight2}
                />

                <img
                  src={getLightImage(2)}
                  alt="light3"
                  className={styles.backgroundImageBitSerialLight3}
                />

                <img
                  src={getLightImage(1)}
                  alt="light4"
                  className={styles.backgroundImageBitSerialLight4}
                />

                {/* Battery image with dynamic position */}
                <img
                  src={batteryimg}
                  alt="battery"
                  className={styles.backgroundImageBitSerialBattery}
                  style={{
                    transform: shiftBattery
                      ? "translateX(26px)"
                      : "translateX(0)",
                  }}
                  onClick={handleBatteryClick}
                />

                {/* Button images */}
                <img
                  src={btnClick1 ? btnGreen : btnRed}
                  className={styles.btnOffBitSerial1}
                  alt="button1"
                  onClick={handleButtonClick}
                />

                {/* Button box for reset and preset */}
                <Box
                  className={!reset ? styles.powerbtngreen : styles.powerbtnred}
                  onClick={handleResetClick}
                >
                  {!reset ? <CheckOutlinedIcon /> : <ClearOutlinedIcon />}
                </Box>

                <Box
                  className={
                    !pReset ? styles.powerbtngreen1 : styles.powerbtnred1
                  }
                  onClick={handlePresetClick}
                >
                  {!pReset ? <CheckOutlinedIcon /> : <ClearOutlinedIcon />}
                </Box>

                {/* Clock button */}
                <Button
                  variant="contained"
                  color="success"
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    top: "44.8%",
                    left: "91px",
                    marginRight: 2,
                  }}
                  onClick={handleClockClick}
                  disabled={!shiftBattery || !btnClick1 || reset || pReset}
                >
                  Clock
                </Button>

                {/* Table to display data */}
                <Box className={styles.tablewrappernorgate}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAddClick} // Add click handler
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleResetTableData}
                    sx={{ marginLeft: "10px" }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ position: "absolute", right: 0 }}
                    onClick={handlePrintClick}
                  >
                    Print
                  </Button>
                  <Typography sx={{ textAlign: "center", fontWeight: 700 }}>
                    TRUTH TABLE
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Clock</TableCell>
                          <TableCell>Data Input</TableCell>
                          <TableCell>Q3</TableCell>
                          <TableCell>Q2</TableCell>
                          <TableCell>Q1</TableCell>
                          <TableCell>Q0</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.clock}</TableCell>
                            <TableCell>{row.dataInput}</TableCell>
                            <TableCell>{row.Q0}</TableCell>
                            <TableCell>{row.Q1}</TableCell>
                            <TableCell>{row.Q2}</TableCell>
                            <TableCell>{row.Q3}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ marginTop: 4, textAlign: "center", color: "#000" }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleNextClick}
              sx={{ marginTop: 2 }}
            >
              Next
            </Button>
          </Box>
        </>
      )}

      {level > 1 && (
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
            Design and verification of 4-Bit Serial In Parallel Out Shift
            Register
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
            <Box
              sx={{
                width: "400px",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
              }}
            >
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
}

export default BitSerial;
