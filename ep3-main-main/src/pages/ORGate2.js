import React, { useState } from "react";
import styles from "../virtuallabcss/ORGate.module.css";
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

function ORGate2() {
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
    const expectedOutput = inputA === 1 || inputB === 1 ? 1 : 0;
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
          <Box className={styles.cardWrapperFirstORGate}>
            <Box className={styles.instrauctionwrapper}>
              <h3>INSTRUCTIONS</h3>
              <ol>
                <li>Enter the Boolean input "A" and "B".</li>
                <li>Enter the Boolean output for your corresponding inputs.</li>
                <li>Click on "Check" Button to verify your output.</li>
                <li>
                  Click "Print" if you want to get a printout of the Truth
                  Table.
                </li>
              </ol>
            </Box>
          </Box>
          <Box className={styles.cardWrapperFirstORGate}>
            <Box className={styles.titleOrGate}>
              <marquee>
                <h3>Verification of truth table for OR gate</h3>
              </marquee>
            </Box>
            {/* Displaying the image based on button states */}
            <img
              src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-26-2221-or_gate_part2.png"
              alt="AND logic gate 2"
              className={styles.backgroundImageORGate}
            />

            <TextField
              id="inputA"
              type="text"
              label="Input A"
              variant="outlined"
              sx={{ position: "absolute", zIndex: 2, top: "15%", left: "8%" }}
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
              sx={{ position: "absolute", zIndex: 2, top: "28%", left: "8%" }}
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
              sx={{ position: "absolute", zIndex: 2, top: "22%", right: "12%" }}
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
                top: "34.5%",
                right: "20.5%",
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

export default ORGate2;
