import React, { useState } from "react";
import { Box, Grid } from "@mui/material";
import styles from "../virtuallabcss/ORGate.module.css";
import { useSnackbar } from "notistack";

const btnRed =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4024-switchOff.png";

const btnGreen =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4112-switchOn.png";

const img1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-26-2358-or_gate1.png";

const img2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-26-2516-or_gate2.png";

const img3 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-26-2634-or_gate3.png";

const img4 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-26-2659-or_gate4.png";

const batteryimg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-3855-battery-preview.png";

const lightoff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-3936-bulboff.png";

const lighton =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-4010-bulbon.png";

function ORGate() {
  const { enqueueSnackbar } = useSnackbar();

  // State for button clicks
  const [btnClick1, setBtnClick1] = useState(false);
  const [btnClick2, setBtnClick2] = useState(false);
  //   const [btnClick3, setBtnClick3] = useState(false);

  // State for battery image position
  const [shiftBattery, setShiftBattery] = useState(false);

  // Determine which image to show based on button states
  const getImage = () => {
    if (shiftBattery) {
      if (btnClick1 && btnClick2) return img4;
      if (btnClick2) return img3;
      if (btnClick1) return img2;
    }
    return img1;
  };

  // Checking if all button on then trun on the light
  const getImageLight = () => {
    if (shiftBattery && (btnClick1 || btnClick2)) return lighton;
    return lightoff;
  };

  const handleButtonClick = (setter, value) => {
    // console.log(setter(!value), "setter")
    setter(!value);
    if (!shiftBattery) {
      if (!btnClick1 || !btnClick2) {
        enqueueSnackbar("Connect the battery first!", {
          variant: "error",
          autoHideDuration: 1000,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
          preventDuplicate: true,
        });
      }
    }
  };

  const handleBatteryClick = () => {
    setShiftBattery(!shiftBattery);
    if (!shiftBattery) {
      enqueueSnackbar("Battery Connected!", {
        variant: "success",
        autoHideDuration: 1000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        preventDuplicate: true,
      });
    } else {
      enqueueSnackbar("Battery Disconnected!", {
        variant: "error",
        autoHideDuration: 1000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        preventDuplicate: true,
      });
    }
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
                <li>Connect the battery to the circuit.</li>
                <li>Press the switches 1 and 2 for inputs "A" and "B".</li>
                <li>
                  The{" "}
                  <span style={{ color: "red", fontWeight: "600" }}>LED</span>{" "}
                  glows if any one or both the switches are{" "}
                  <span
                    style={{
                      textDecoration: "underline",
                      color: "green",
                      fontWeight: "600",
                    }}
                  >
                    ON
                  </span>{" "}
                  and it doesn't glow if both the swicthes are{" "}
                  <span
                    style={{
                      textDecoration: "underline",
                      color: "red",
                      fontWeight: "600",
                    }}
                  >
                    OFF
                  </span>
                  .
                </li>
              </ol>
            </Box>
          </Box>
          <Box className={styles.cardWrapperFirstORGate}>
            <Box className={styles.titleOrGate}>
              <marquee>
                <h3>
                  Experiment to perform OR gate on kit. OR logic implementation
                  using DRL(Diode Resistance Logic).
                </h3>
              </marquee>
            </Box>
            {/* Displaying the image based on button states */}
            <img
              src={getImage()}
              alt="AND logic gate"
              className={styles.backgroundImageORGate}
            />
            <Box className={styles.sub}>-</Box>
            <Box className={styles.add}>+</Box>

            {/* Battery image with dynamic position */}
            <img
              src={batteryimg}
              alt="battery"
              className={styles.backgroundImageORGateBattery}
              style={{
                transform: shiftBattery ? "translateX(-26px)" : "translateX(0)",
              }}
              onClick={handleBatteryClick}
            />

            {/* Light image with trun on & off */}
            <img
              src={getImageLight()}
              alt="lighton&off"
              className={styles.backgroundImageORGateLight}
            />

            {/* Button images */}
            <img
              src={btnClick1 ? btnGreen : btnRed}
              className={styles.btnOffORgate1}
              alt="button1"
              onClick={() => handleButtonClick(setBtnClick1, btnClick1)}
            />

            <img
              src={btnClick2 ? btnGreen : btnRed}
              className={styles.btnOffORgate2}
              alt="button2"
              onClick={() => handleButtonClick(setBtnClick2, btnClick2)}
            />
            {/* 
            <img
              src={btnClick3 ? btnGreen : btnRed}
              className={styles.btnOffORgate3}
              alt="button3"
              onClick={() => handleButtonClick(setBtnClick3, btnClick3)}
            /> */}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default ORGate;
