import React, { useState } from "react";
import { Box, Grid } from "@mui/material";
import styles from "../virtuallabcss/NOTGate.module.css";
import { useSnackbar } from "notistack";

const btnRed =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4024-switchOff.png";

const btnGreen =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4112-switchOn.png";

const img1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-27-911-not_gate.png";

const img2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-27-942-not_gate2.png";

const img3 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-27-1011-not_gate3.png";

const batteryimg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-3855-battery-preview.png";

const lightoff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-3936-bulboff.png";

const lighton =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-4010-bulbon.png";

function NOTGate() {
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
      if (btnClick1 && btnClick2) return img3;
      if (btnClick1 && btnClick2) return img3;
      if (btnClick1) return img2;
    }
    return img1;
  };

  // Checking if all button on then trun on the light
  const getImageLight = () => {
    if (shiftBattery && btnClick1 && btnClick2) return lightoff;
    if (shiftBattery && btnClick1) return lighton;
    return lightoff;
  };

  const handleButtonClick = (setter, value) => {
    // console.log(setter(!value), "setter")
    setter(!value);
    if (!shiftBattery) {
      if (!btnClick1 || !btnClick2) {
        enqueueSnackbar(
          "Please trun off the switch and Connect the battery first!",
          {
            variant: "error",
            autoHideDuration: 3000,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "center",
            },
            preventDuplicate: true,
          }
        );
      }
    } else if (shiftBattery) {
      if (btnClick2) {
        enqueueSnackbar("Press switch 1!", {
          variant: "error",
          autoHideDuration: 2000,
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
          <Box className={styles.cardWrapperFirstNOTGate}>
            <Box className={styles.instrauctionwrapper}>
              <h3>
                <span className={styles.unText}>INSTRUCTIONS</span>
              </h3>
              <ol>
                <li>Connect the battery first.</li>
                <li>
                  Press the switch 1 for the battery to be connected to the
                  circuit.
                </li>
                <li>Press the switch 2 for input A.</li>
                <li>
                  The{" "}
                  <span style={{ color: "red", fontWeight: "600" }}>LED</span>{" "}
                  glows if the switch 2 is{" "}
                  <span
                    style={{
                      textDecoration: "underline",
                      color: "red",
                      fontWeight: "600",
                    }}
                  >
                    OFF
                  </span>{" "}
                  and doesn't glow if the swicth 2 is{" "}
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
              <ol>
                <li>Battery = 5V</li>
                <li>Resistor R1 = 1 kohm, R2= 10 Kohm</li>
                <li>Transistor = NPN 2N3904</li>
              </ol>
            </Box>
          </Box>
          <Box className={styles.cardWrapperFirstNOTGate}>
            <div className={styles.wrapper}>
              <Box className={styles.titleNOTGate}>
                <marquee>
                  <h3>
                    Experiment to perform NOT gate on kit. Transistor as a NOT
                    gate
                  </h3>
                </marquee>
              </Box>
              {/* Displaying the image based on button states */}
              <img
                src={getImage()}
                alt="AND logic gate"
                className={styles.backgroundImageNOTGate}
              />

              {/* Battery image with dynamic position */}
              <img
                src={batteryimg}
                alt="battery"
                className={styles.backgroundImageNOTGateBattery}
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
                className={styles.backgroundImageNOTGateLight}
              />

              {/* Button images */}
              <img
                src={btnClick1 ? btnGreen : btnRed}
                className={styles.btnOffNOTgate1}
                alt="button1"
                onClick={() => handleButtonClick(setBtnClick1, btnClick1)}
              />

              <img
                src={btnClick2 ? btnGreen : btnRed}
                className={styles.btnOffNOTgate2}
                alt="button2"
                onClick={() => handleButtonClick(setBtnClick2, btnClick2)}
              />
            </div>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default NOTGate;
