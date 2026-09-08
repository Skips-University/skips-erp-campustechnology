import React, { useState } from "react";
import styles from "../virtuallabcss/XNORGate.module.css";
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

function XNORGate2() {
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

  return (
    <>
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
              <ol>
                <li>Enter the Boolean input "A" and "B".</li>
                <li>Enter the Boolean output for your corresponding inputs.</li>
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
              sx={{ position: "absolute", zIndex: 2, top: "18%", left: "10%" }}
              value={inputAVal}
              onChange={(e) =>
                handleInputChange(setInputAVal, e.target.value, setErrorMsgA)
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
                handleInputChange(setInputBVal, e.target.value, setErrorMsgB)
              }
              error={!!errorMsgB}
              helperText={errorMsgB}
            />
            <TextField
              id="output"
              type="text"
              label="Output"
              variant="outlined"
              sx={{ position: "absolute", zIndex: 2, top: "23%", right: "4%" }}
              value={outputVal}
              onChange={(e) =>
                handleInputChange(setOutputVal, e.target.value, setErrorMsgOut)
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
    </>
  );
}

export default XNORGate2;
