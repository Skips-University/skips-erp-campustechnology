import React, { useState } from "react";
import styles from "../virtuallabcss/NORGateGame.module.css";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

// Import global1 file here
import global1 from "./global1";

const MAX_VAL = 1;
const MIN_VAL = 0;

const btnRed =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4024-switchOff.png";

const btnGreen =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4112-switchOn.png";

const img1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-29-312-nor-gate1.png";

const img2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-29-332-nor-gate2.png";

const img3 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-29-51-nor-gate3.png";

const img4 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-29-520-nor-gate4.png";

const img5 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-29-540-nor-gate5.png";

const batteryimg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-28-3857-new_battery.png";

const lightoff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-3936-bulboff.png";

const lighton =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-4010-bulbon.png";

// Global1 username and regno
const username = global1.name;
const registerNo = global1.regno;

function NORGate() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [batteryClicked, setBatteryClicked] = useState(false); // New state

  // State for button clicks
  const [btnClick1, setBtnClick1] = useState(false);
  const [btnClick2, setBtnClick2] = useState(false);
  const [btnClick3, setBtnClick3] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // State for battery image position
  const [shiftBattery, setShiftBattery] = useState(false);

  // State for inputs
  const [inputAVal, setInputAVal] = useState("");
  const [inputBVal, setInputBVal] = useState("");
  const [outputVal, setOutputVal] = useState("");

  // State for error messages
  const [errorMsgA, setErrorMsgA] = useState("");
  const [errorMsgB, setErrorMsgB] = useState("");
  const [errorMsgOut, setErrorMsgOut] = useState("");

  // State to hold table data
  const [tableData, setTableData] = useState([]);

  // Determine which image to show based on button states
  const getImage = () => {
    if (shiftBattery) {
      if (btnClick1 && btnClick2 && btnClick3) return img5;
      if (btnClick1 && btnClick2) return img3;
      if (btnClick1 && btnClick3) return img4;
      if (btnClick1) return img2;
    }
    return img1;
  };

  // Checking if all button on then trun on the light
  const getImageLight = () => {
    if (shiftBattery && btnClick1 && btnClick2 && btnClick3) return lightoff;
    if (shiftBattery && ((btnClick1 && btnClick2) || (btnClick1 && btnClick3)))
      return lightoff;
    if (shiftBattery && btnClick1) return lighton;
    return lightoff;
  };

  const handleButtonClick = (setter, value) => {
    // Prevent further action if shiftBattery is off
    if (!shiftBattery) {
      enqueueSnackbar("Connect the battery first", {
        autoHideDuration: 2000,
        variant: "warning",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        preventDuplicate: true,
      });
      return;
    }

    // Check if btnClick1 is off and btnClick2 or btnClick3 are being clicked
    if (!btnClick1 && (setter === setBtnClick2 || setter === setBtnClick3)) {
      enqueueSnackbar("First turn on switch 1", {
        autoHideDuration: 2000,
        variant: "error",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        preventDuplicate: true,
      });
      return;
    }

    // Proceed with updating the state if all conditions are satisfied
    setter(!value);
  };

  const handleBatteryClick = () => {
    if (!batteryClicked) {
      // Check if battery has already been clicked
      setScore(score + 40);
      setBatteryClicked(true); // Set the batteryClicked state to true
    }

    const message = !shiftBattery
      ? "Wonderful, Battery connected!"
      : "Oops, Battery disconnected!";

    // Use SpeechSynthesis to speak the message
    const utterance = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(utterance);

    // Update battery state
    setShiftBattery(!shiftBattery);

    // Show snackbar with the same message
    enqueueSnackbar(message, {
      autoHideDuration: 2000,
      variant: !shiftBattery ? "success" : "error",
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "center",
      },
      preventDuplicate: true,
    });
  };

  // Handle next button click
  const handleNextClick = () => {
    if (batteryClicked) {
      // Check if battery has already been clicked
      setScore(score + 20);
      setLevel((prev) => prev + 1);
      setBatteryClicked(true); // Set the batteryClicked state to true
    } else {
      setLevel((prev) => prev + 1);
      let randomNumber = Math.floor(Math.random() * 30);
      setScore(randomNumber);
    }
  };

  const validateBooleanValue = (value) => {
    return value !== MAX_VAL && value !== MIN_VAL;
  };

  const validateInputs = () => {
    const aValid = !validateBooleanValue(Number(inputAVal));
    const bValid = !validateBooleanValue(Number(inputBVal));
    const outValid = !validateBooleanValue(Number(outputVal));

    setErrorMsgA(aValid ? "" : "Provide input value 0 & 1");
    setErrorMsgB(bValid ? "" : "Provide input value 0 & 1");
    setErrorMsgOut(outValid ? "" : "Provide input value 0 & 1");

    return aValid && bValid && outValid;
  };

  const handleCheckClick = () => {
    if (validateInputs()) {
      const newEntry = {
        inputA: inputAVal,
        inputB: inputBVal,
        output: outputVal,
        isCorrect: checkOutputCorrectOrNot(
          Number(inputAVal),
          Number(inputBVal),
          Number(outputVal)
        ),
      };
      setTableData((prevData) => [...prevData, newEntry]);
      // Clear inputs after adding to table
      setInputAVal("");
      setInputBVal("");
      setOutputVal("");
    }
  };

  const handleResetClick = () => {
    setTableData([]);
    // clear input values and error messages
    setInputAVal("");
    setInputBVal("");
    setOutputVal("");
    setErrorMsgA("");
    setErrorMsgB("");
    setErrorMsgOut("");
  };

  const handleInputChange = (setter, value, errorSetter) => {
    // Restrict input to only '0' or '1' and allow only one character
    const validValue =
      value.length === 0 || (value.length === 1 && ["0", "1"].includes(value));
    setter(value);
    errorSetter(validValue ? "" : "Provide only boolean value 0 & 1");
  };

  // Function to check if all inputs are provided
  const areInputsValid = () => {
    return inputAVal && inputBVal && outputVal;
  };

  // Function to check if the output is correct for the AND gate
  const checkOutputCorrectOrNot = (inputA, inputB, output) => {
    const expectedOutput = inputA === 1 || inputB === 1 ? 0 : 1;
    return expectedOutput === output;
  };

  // Handle Print Click
  const handlePrintClick = () => {
    window.print();
  };

  // Handle next button click
  const handleNextClick2 = () => {
    if (score >= 60) {
      // Check if battery has already been clicked
      setScore(score + 40);
      setLevel((prev) => prev + 1);
      setIsFinished(true);
    } else {
      setLevel((prev) => prev + 1);
      setScore(score + 20);
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
                Verification and interpretation of truth table for <br /> NOR
                gate / NOR gate 2
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
                Verification and interpretation of truth table for AND, OR, NOT,
                NAND, NOR, Ex-OR, Ex-NOR gates.
              </h3>
              <Box className={styles.cardWrapperFirstNORGate}>
                <Box className={styles.instrauctionwrapper}>
                  <h3>
                    <span className={styles.unText}>INSTRUCTIONS</span>
                  </h3>
                  <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <li>Connect the battery first.</li>
                    <li>
                      Press the switch 1 for the battery to be connected to the
                      circuit.
                    </li>
                    <li>
                      Press the switch 2 for input A and switch 3 for input B.
                    </li>
                    <li>
                      The{" "}
                      <span style={{ color: "red", fontWeight: "600" }}>
                        LED
                      </span>{" "}
                      glows both the switches (2 and 3) are{" "}
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "red",
                          fontWeight: "600",
                        }}
                      >
                        OFF
                      </span>{" "}
                      and does not glow if both the switches (2 and 3) are{" "}
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "green",
                          fontWeight: "600",
                        }}
                      >
                        ON
                      </span>
                      .
                    </li>
                  </ol>
                  <h3>
                    <span className={styles.unText}>SPECIFICATIONS</span>
                  </h3>
                  <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <li>Battery = 5V</li>
                    <li>Resistor R3 = 1 Kohm & R1 & R2 = 10 Kohm</li>
                    <li>Transistors Q1 & Q2 = NPN 2N3904</li>
                  </ol>
                </Box>
              </Box>
              <div className={styles.cardWrapperFirstNORGate}>
                <div className={styles.titleNORGate}>
                  <marquee>
                    <h3>
                      Experiment to perform NOR gate on kit. NOR gate using
                      Resistor-Transistor Logic(RTL)
                    </h3>
                  </marquee>
                </div>
                {/* Displaying the image based on button states */}
                <img
                  src={getImage()}
                  alt="AND logic gate"
                  className={styles.backgroundImageNORGate}
                />

                {/* Battery image with dynamic position */}
                <img
                  src={batteryimg}
                  alt="battery"
                  className={styles.backgroundImageNORGateBattery}
                  style={{
                    transform: shiftBattery
                      ? "translateX(-26px)"
                      : "translateX(0)",
                  }}
                  onClick={handleBatteryClick}
                />

                {/* Light image with trun on & off */}
                <img
                  src={getImageLight()}
                  alt="lighton&off"
                  className={styles.backgroundImageNORGateLight}
                />

                {/* Button images */}
                <img
                  src={btnClick1 ? btnGreen : btnRed}
                  className={styles.btnOffNORgate1}
                  alt="button1"
                  onClick={() => handleButtonClick(setBtnClick1, btnClick1)}
                />

                <img
                  src={btnClick2 ? btnGreen : btnRed}
                  className={styles.btnOffNORgate2}
                  alt="button2"
                  onClick={() => handleButtonClick(setBtnClick2, btnClick2)}
                />

                <img
                  src={btnClick3 ? btnGreen : btnRed}
                  className={styles.btnOffNORgate3}
                  alt="button3"
                  onClick={() => handleButtonClick(setBtnClick3, btnClick3)}
                />
              </div>
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

          <Grid container spacing={2} direction="column" alignItems="center">
            <Grid item xs={12}>
              <h3>
                Verification and interpretation of truth table for AND, OR, NOT,
                NAND, NOR, Ex-OR, Ex-NOR gates.
              </h3>
              <Box className={styles.cardWrapperFirstNORGate}>
                <Box className={styles.instrauctionwrapper}>
                  <h3>
                    <span className={styles.unText}>INSTRUCTIONS</span>
                  </h3>
                  <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <li>Enter the Boolean input "A" and "B".</li>
                    <li>
                      Enter the Boolean output for your corresponding inputs.
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
                        Check
                      </span>
                      " Button to verify your output.
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
                      " if you want to get print out of Truth Table.
                    </li>
                  </ol>
                </Box>
              </Box>
              <Box className={styles.cardWrapperFirstNORGate}>
                <Box className={styles.titleNORGate}>
                  <marquee>
                    <h3>Verification of truth table for NOR gate</h3>
                  </marquee>
                </Box>
                {/* Displaying the image based on button states */}
                <img
                  src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-29-138-nor-gate-part2.png"
                  alt="AND logic gate 2"
                  className={styles.backgroundImageNORGate}
                />

                <TextField
                  id="inputA"
                  type="text"
                  label="Input A"
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    top: "16%",
                    left: "13%",
                  }}
                  value={inputAVal}
                  onChange={(e) =>
                    handleInputChange(
                      setInputAVal,
                      e.target.value,
                      setErrorMsgA
                    )
                  }
                  error={!!errorMsgA}
                  helperText={errorMsgA}
                />
                <TextField
                  id="inputB"
                  type="text"
                  label="Input B"
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    top: "26.8%",
                    left: "13%",
                  }}
                  value={inputBVal}
                  onChange={(e) =>
                    handleInputChange(
                      setInputBVal,
                      e.target.value,
                      setErrorMsgB
                    )
                  }
                  error={!!errorMsgB}
                  helperText={errorMsgB}
                />
                <TextField
                  id="output"
                  type="text"
                  label="Output"
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    top: "22%",
                    right: "3%",
                  }}
                  value={outputVal}
                  onChange={(e) =>
                    handleInputChange(
                      setOutputVal,
                      e.target.value,
                      setErrorMsgOut
                    )
                  }
                  error={!!errorMsgOut}
                  helperText={errorMsgOut}
                />

                <Button
                  variant="contained"
                  color="success"
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    top: "32%",
                    right: "15.8%",
                    marginRight: 2,
                  }}
                  onClick={handleCheckClick}
                  disabled={!areInputsValid()} // Disable button if not all inputs are provided
                >
                  Check
                </Button>

                {/* Table to display data */}
                <Box className={styles.tablewrappernorgate}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleResetClick}
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
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Input A</TableCell>
                          <TableCell>Input B</TableCell>
                          <TableCell>Output</TableCell>
                          <TableCell>Correct/Incorrect</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.inputA}</TableCell>
                            <TableCell>{row.inputB}</TableCell>
                            <TableCell>{row.output}</TableCell>
                            <TableCell>
                              {row.isCorrect ? (
                                <CheckIcon color="success" />
                              ) : (
                                <ClearIcon color="error" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Container>
            <Box sx={{ marginTop: 4, textAlign: "center", color: "#000" }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleNextClick2}
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
            Verification and interpretation of truth table for NOR gate / NOR
            gate2
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

export default NORGate;
