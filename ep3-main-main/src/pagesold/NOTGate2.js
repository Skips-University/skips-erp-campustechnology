import React, { useState } from "react";
import styles from "../virtuallabcss/NOTGate.module.css";
import {
  Box,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

const MAX_VAL = 1;
const MIN_VAL = 0;

function NOTGate2() {
  // State for inputs
  const [inputAVal, setInputAVal] = useState("");
  const [outputVal, setOutputVal] = useState("");

  // State for error messages
  const [errorMsgA, setErrorMsgA] = useState("");
  const [errorMsgOut, setErrorMsgOut] = useState("");

  // State to hold table data
  const [tableData, setTableData] = useState([]);

  const validateBooleanValue = (value) => {
    return value !== MAX_VAL && value !== MIN_VAL;
  };

  const validateInputs = () => {
    const aValid = !validateBooleanValue(Number(inputAVal));
    const outValid = !validateBooleanValue(Number(outputVal));

    setErrorMsgA(aValid ? "" : "Provide input value 0 & 1");
    setErrorMsgOut(outValid ? "" : "Provide input value 0 & 1");

    return aValid && outValid;
  };

  const handleCheckClick = () => {
    if (validateInputs()) {
      const newEntry = {
        inputA: inputAVal,
        output: outputVal,
        isCorrect: checkOutputCorrectOrNot(
          Number(inputAVal),
          Number(outputVal)
        ),
      };
      setTableData((prevData) => [...prevData, newEntry]);
      // Clear inputs after adding to table
      setInputAVal("");
      setOutputVal("");
    }
  };

  const handleResetClick = () => {
    setTableData([]);
    // clear input values and error messages
    setInputAVal("");
    setOutputVal("");
    setErrorMsgA("");
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
    return inputAVal && outputVal;
  };

  // Function to check if the output is correct for the AND gate
  const checkOutputCorrectOrNot = (inputA, output) => {
    const expectedOutput = inputA === 1 ? 0 : 1;
    return expectedOutput === output;
  };

  // Handle Print Click
  const handlePrintClick = () => {
    window.print();
  };

  return (
    <>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={12}>
          <h3>
            Verification and interpretation of truth table for AND, OR, NOT,
            NAND, NOR, Ex-OR, Ex-NOR gates.
          </h3>
          <Box className={styles.cardWrapperFirstNOTGate}>
            <Box className={styles.instrauctionwrapper}>
              <h3>
                <span className={styles.unText}>INSTRUCTIONS</span>
              </h3>
              <ol>
                <li>Enter the Boolean input "A".</li>
                <li>Enter the Boolean output for your corresponding input.</li>
                <li>Press the switch 2 for input A.</li>
                <li>
                  Click on{" "}
                  <span style={{ color: "green", fontWeight: "600" }}>
                    "Check"
                  </span>{" "}
                  Button to verify your output.
                </li>
                <li>
                  Click{" "}
                  <span style={{ color: "blue", fontWeight: "600" }}>
                    "Print"
                  </span>{" "}
                  if you want to get print out of Truth Table.
                </li>
              </ol>
            </Box>
          </Box>
          <Box className={styles.cardWrapperFirstNOTGate}>
            <Box className={styles.wrapper}>
              <Box className={styles.titleNOTGate}>
                <marquee>
                  <h3>Verification of truth table for NOT gate</h3>
                </marquee>
              </Box>
              {/* Displaying the NOT GATE 2 image*/}
              <img
                src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-27-317-not_gate_part2.png"
                alt="AND logic gate 2"
                className={styles.backgroundImageNOTGate}
              />

              <TextField
                id="inputA"
                type="text"
                label="Input A"
                variant="outlined"
                sx={{
                  position: "absolute",
                  zIndex: 2,
                  top: "22%",
                  left: "10%",
                }}
                value={inputAVal}
                onChange={(e) =>
                  handleInputChange(setInputAVal, e.target.value, setErrorMsgA)
                }
                error={!!errorMsgA}
                helperText={errorMsgA}
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
                  right: "5%",
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
                  right: "3.6%",
                  marginRight: 2,
                }}
                onClick={handleCheckClick}
                disabled={!areInputsValid()} // Disable button if not all inputs are provided
              >
                Check
              </Button>

              {/* Table to display data */}
              <Box className={styles.tablewrapper}>
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
                        <TableCell>Output</TableCell>
                        <TableCell>Correct/Incorrect</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.inputA}</TableCell>
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
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default NOTGate2;
