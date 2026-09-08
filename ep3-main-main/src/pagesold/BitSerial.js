import React, { useState } from "react";
import styles from "../virtuallabcss/BitSerial.module.css";
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
} from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { useSnackbar } from "notistack";

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

function BitSerial() {
  const { enqueueSnackbar } = useSnackbar();

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

  return (
    <>
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
              <ol>
                <li>Connect battery to supply 5V to the circuit.</li>
                <li>Keep the RESET and PRESET as active high signals.</li>
                <li>Apply the data at Data Input.</li>
                <li>
                  Apply one clock pulse at clock 1 and observe this data at LED
                  Q.
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
                  " Button to add data to the Truth Table.
                </li>
                <li>Apply the next data at Data Input.</li>
                <li>
                  <b>
                    Apply one clock pulse at clock 2, observe that the data on Q
                    <sub>3</sub> will shift to Q<sub>2</sub> and the new data
                    applied will appear at Q<sub>3</sub>.
                  </b>
                </li>
                <li>
                  Repeat steps 3 to 5 till all the 4 bits data appear at the
                  output of shift register.
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
                  " to get the print out of the Truth Table.
                </li>
              </ol>
            </Box>
          </Box>
          <Box className={styles.cardWrapperBitSerial}>
            <Box className={styles.titleBitSerial}>
              <marquee>
                <h3>
                  Design and verification of 4-Bit Serial In Parallel Out Shift
                  Register
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
                transform: shiftBattery ? "translateX(26px)" : "translateX(0)",
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
              className={!pReset ? styles.powerbtngreen1 : styles.powerbtnred1}
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
    </>
  );
}

export default BitSerial;
