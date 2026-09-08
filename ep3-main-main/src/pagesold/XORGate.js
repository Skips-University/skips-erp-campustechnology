import React, { useState } from "react";
import styles from "../virtuallabcss/XORGate.module.css";
import { Box, Grid } from "@mui/material";
import { useSnackbar } from "notistack";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

const btnRed =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4024-switchOff.png";

const btnGreen =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4112-switchOn.png";

const img1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-30-4954-xor-gate1.png";

const img2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-30-5019-xor-gate2.png";

const img3 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-30-5044-xor-gate3.png";

const img4 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-30-519-xor-gate4.png";

const img5 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-30-5135-xor-gate5.png";

const lightoff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-3936-bulboff.png";

const lighton =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-22-4010-bulbon.png";

function XORGate() {
  // State for button clicks
  const [btnClick1, setBtnClick1] = useState(false);
  const [btnClick2, setBtnClick2] = useState(false);
  const [btnClick3, setBtnClick3] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

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
    if (btnClick1 && btnClick2 && btnClick3) return lightoff;
    if (btnClick1 && ((btnClick2 && !btnClick3) || (btnClick3 && !btnClick2)))
      return lighton;
    return lightoff;
  };

  const handleButtonClick = (setter, currentValue) => {
    if (!btnClick1) {
      enqueueSnackbar("Turn on the power first", {
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

  return (
    <>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={12}>
          <h3>
            Verification and interpretation of truth table for AND, OR, NOT,
            NAND, NOR, Ex-OR, Ex-NOR gates.
          </h3>
          <Box className={styles.cardWrapperFirstXORGate}>
            <Box className={styles.instrauctionwrapper}>
              <h3>
                <span className={styles.unText}>INSTRUCTIONS</span>
              </h3>
              <ol>
                <li>
                  Provide Power to the circuit by pressing on the Power button.
                </li>
                <li>
                  Press the switch 1 for input A and switch 2 for input B.
                </li>
                <li>
                  The{" "}
                  <span style={{ color: "red", fontWeight: "600" }}>LED</span>{" "}
                  glows if one of the switches is{" "}
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
                  <span style={{ color: "red", fontWeight: "600" }}>LED</span>{" "}
                  does not glow if both the switches are{" "}
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
              <ol>
                <li>Battery= 5V</li>
                <li>Resistors R 1,2,4,5,7,8 = 10 kilo-ohm </li>
                <li>Resistors R 3,6,9 = 5 kilo-ohm</li>
                <li>Transistors Q1 to Q6 = NPN 2N3904</li>
              </ol>
            </Box>
          </Box>
          <Box className={styles.cardWrapperFirstXORGate}>
            <Box className={styles.titleXORGate}>
              <marquee>
                <h3>
                  Experiment to perform XOR gate on kit. XOR gate using
                  Resistor-Transistor Logic(RTL)
                </h3>
              </marquee>
            </Box>
            {/* Displaying the image based on button states */}
            <img
              src={getImage()}
              alt="XOR logic gate"
              className={styles.backgroundImageXORGate}
            />

            {/* Light image with turn on & off */}
            <img
              src={getImageLight()}
              alt="lighton&off"
              className={styles.backgroundImageXORGateLight}
            />

            {/* Button images */}
            <Box className={btnClick1 ? styles.powerbtngreen : styles.powerbtnred} onClick={handleBtn1Click}>
              <PowerSettingsNewIcon />
            </Box>

            <img
              src={btnClick2 ? btnGreen : btnRed}
              className={styles.btnOffXORgate2}
              alt="button2"
              onClick={() => handleButtonClick(setBtnClick2, btnClick2)}
            />

            <img
              src={btnClick3 ? btnGreen : btnRed}
              className={styles.btnOffXORgate3}
              alt="button3"
              onClick={() => handleButtonClick(setBtnClick3, btnClick3)}
            />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default XORGate;
