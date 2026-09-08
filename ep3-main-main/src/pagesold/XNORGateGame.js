import React, { useState } from "react";
import styles from "../virtuallabcss/XNORGateGame.module.css";
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
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
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
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-1124-ex-nor1.png";

const img2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-1144-ex-nor2.png";

const img3 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-128-ex-nor3.png";

const img4 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-1230-ex-nor4.png";

const img5 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-1252-ex-nor5.png";

const lightoff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-3936-bulboff.png";

const lighton =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-4010-bulbon.png";

// Global1 username and regno
const username = global1.name;
const registerNo = global1.regno;

function XNORGate() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [batteryClicked, setBatteryClicked] = useState(false); // New state

  // State for button clicks
  const [btnClick1, setBtnClick1] = useState(false);
  const [btnClick2, setBtnClick2] = useState(false);
  const [btnClick3, setBtnClick3] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

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
    if (btnClick1) {
      if (btnClick1 && btnClick2 && btnClick3) return img5;
      if (btnClick1 && btnClick2) return img3;
      if (btnClick1 && btnClick3) return img4;
      if (btnClick1) return img2;
    }
    return img1;
  };

  // Checking if all button on then turn on the light
  const getImageLight = () => {
    if (btnClick1 && btnClick2 && btnClick3) return lighton;
    if (btnClick1 && (btnClick2 || btnClick3)) return lightoff;
    if (btnClick1) return lighton;
    return lightoff;
  };

  const handleButtonClick = (setter, currentValue) => {
    if (!btnClick1) {
      enqueueSnackbar("Provide Power Supply first!", {
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

    setter(!currentValue);
  };

  const handleBtn1Click = () => {
    if (!batteryClicked) {
      // Check if battery has already been clicked
      setScore(score + 40);
      setBatteryClicked(true); // Set the batteryClicked state to true
    }

    const message = btnClick1 ? "Power off!" : "Power on!";

    const utterance = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(utterance);

    setBtnClick1(!btnClick1);

    enqueueSnackbar(message, {
      autoHideDuration: 2000,
      variant: btnClick1 ? "error" : "success",
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
    const expectedOutput =
      (inputA === 0 || inputB === 1) && (inputA === 1 || inputB === 0) ? 1 : 0;

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
                Verification and interpretation of truth table for <br /> XNOR
                gate / XNOR gate 2
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
              <Box className={styles.cardWrapperFirstXNORGate}>
                <Box className={styles.instrauctionwrapper}>
                  <h3>
                    <span className={styles.unText}>INSTRUCTIONS</span>
                  </h3>
                  <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <li>
                      Provide Power to the circuit by pressing on the Power
                      button.
                    </li>
                    <li>
                      Press the switch 1 for input A and switch 2 for input B.
                    </li>
                    <li>
                      The{" "}
                      <span style={{ color: "red", fontWeight: "600" }}>
                        LED
                      </span>{" "}
                      does not glow if one of the switches is{" "}
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "red",
                          fontWeight: "600",
                        }}
                      >
                        OFF
                      </span>{" "}
                      and one of the switches is{" "}
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "green",
                          fontWeight: "600",
                        }}
                      >
                        ON
                      </span>{" "}
                      and the{" "}
                      <span style={{ color: "red", fontWeight: "600" }}>
                        LED
                      </span>{" "}
                      glows if both the switches are{" "}
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "green",
                          fontWeight: "600",
                        }}
                      >
                        ON
                      </span>{" "}
                      or if both the switches are{" "}
                      <span
                        style={{
                          textDecoration: "underline",
                          color: "red",
                          fontWeight: "600",
                        }}
                      >
                        OFF
                      </span>{" "}
                      .
                    </li>
                  </ol>
                  <h3>
                    <span className={styles.unText}>SPECIFICATIONS</span>
                  </h3>
                  <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <li>Battery 5V</li>
                    <li>Resistors R 1,2,5,6,7,8,11,12 = 10 Kohm</li>
                    <li>Resistors R 3,4,9,10,13 = 5 Kohm</li>
                    <li>Transistor Q1 to Q8 = NPN 2N3904</li>
                  </ol>
                </Box>
              </Box>
              <Box className={styles.cardWrapperFirstXNORGate}>
                <Box className={styles.titleXNORGate}>
                  <marquee>
                    <h3>
                      Experiment to perform XNOR gate on kit. XNOR gate using
                      Resistor-Transistor Logic(RTL)
                    </h3>
                  </marquee>
                </Box>
                {/* Displaying the image based on button states */}
                <img
                  src={getImage()}
                  alt="XOR logic gate"
                  className={styles.backgroundImageXNORGate}
                />

                {/* Light image with turn on & off */}
                <img
                  src={getImageLight()}
                  alt="lighton&off"
                  className={styles.backgroundImageXNORGateLight}
                />

                {/* Button images */}
                <Box
                  className={
                    btnClick1 ? styles.powerbtngreen : styles.powerbtnred
                  }
                  onClick={handleBtn1Click}
                >
                  <PowerSettingsNewIcon />
                </Box>

                <img
                  src={btnClick2 ? btnGreen : btnRed}
                  className={styles.btnOffXNORgate2}
                  alt="button2"
                  onClick={() => handleButtonClick(setBtnClick2, btnClick2)}
                />

                <img
                  src={btnClick3 ? btnGreen : btnRed}
                  className={styles.btnOffXNORgate3}
                  alt="button3"
                  onClick={() => handleButtonClick(setBtnClick3, btnClick3)}
                />
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
              <Box className={styles.cardWrapperFirstXNORGate}>
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
              <Box className={styles.cardWrapperFirstXNORGate}>
                <Box className={styles.titleXNORGate}>
                  <marquee>
                    <h3>Verification of truth table for XNOR gate</h3>
                  </marquee>
                </Box>
                {/* Displaying the image based on button states */}
                <img
                  src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-2-831-ex-nor-part2.png"
                  alt="AND logic gate 2"
                  className={styles.backgroundImageXNORGate}
                />

                <TextField
                  id="inputA"
                  type="text"
                  label="Input A"
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    top: "18%",
                    left: "10%",
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
                    top: "28.5%",
                    left: "10%",
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
                    top: "23%",
                    right: "4%",
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
                    top: "33%",
                    right: "16.7%",
                    marginRight: 2,
                  }}
                  onClick={handleCheckClick}
                  disabled={!areInputsValid()} // Disable button if not all inputs are provided
                >
                  Check
                </Button>

                {/* Table to display data */}
                <Box className={styles.tablewrapperXnorgate}>
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
            Verification and interpretation of truth table for XNOR gate / XNOR
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

export default XNORGate;
