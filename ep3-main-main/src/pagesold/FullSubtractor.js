import React, { useState } from "react";
import styles from "./FullSubtractor.module.css";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const circleOff1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-355-circleBtnOn.png";

const circleOn1 =
  " https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4059-circleBtnOff.png";

const circleOff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4024-switchOff.png";

const circleOn =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4112-switchOn.png";

function createData(inputA, inputB, inputC, borrow, output) {
  return { inputA, inputB, inputC, borrow, output };
}

const rows = [
  createData(0, 0, 0, 0, 0),
  createData(0, 0, 1, 1, 1),
  createData(0, 1, 0, 1, 1),
  createData(0, 1, 1, 1, 0),
  createData(1, 0, 0, 0, 1),
  createData(1, 0, 1, 0, 0),
  createData(1, 1, 0, 0, 0),
  createData(1, 1, 1, 1, 1),
];

function FullSubtractor() {
  const [isRedOne, setIsRedOne] = useState(false);
  const [isRedTwo, setIsRedTwo] = useState(false);
  const [isInputC, setIsInputC] = useState(false);

  const lightOn = isRedOne;
  const lightOn1 = isRedTwo;
  const lightOn2 = isRedOne && isRedTwo;
  const lightOn3 = isInputC;
  const lightOn4 = isRedTwo && isInputC;
  const lightOn5 = isRedOne && isRedTwo && isInputC;

  return (
    <>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={12}>
          <div className={styles.csstop}>
            <div className={styles.wrapper}>
              {/* HalfSubtractor image here */}
              <img
                src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-7-3046-full-subtractor.png"
                alt="fullSubtractor"
                className="background-image"
              />

              {/* On & Off Button */}
              <img
                src={!isRedOne ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedOne ? ${styles.offbtn1} : ${styles.onbtn1}`}
                onClick={() => setIsRedOne(!isRedOne)}
              />

              <img
                src={!isRedTwo ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedOne ? ${styles.offbtn2} : ${styles.onbtn2}`}
                onClick={() => setIsRedTwo(!isRedTwo)}
              />

              <img
                src={!isInputC ? circleOff : circleOn}
                alt="offbtn"
                className={`isInputC ? ${styles.offbtn7} : ${styles.onbtn7}`}
                onClick={() => setIsInputC(!isInputC)}
              />

              {/* Circle Off Buttons */}
              <img src={circleOff1} alt="offbtn" className={styles.offbtn3} />
              <img src={circleOff1} alt="offbtn" className={styles.offbtn5} />

              {lightOn && !lightOn2 && (
                <img src={circleOn1} alt="offbtn" className={styles.onbtn6} />
              )}

              {lightOn1 && !lightOn2 && (
                <>
                  <img src={circleOn1} alt="offbtn" className={styles.onbtn4} />
                  <img src={circleOn1} alt="offbtn" className={styles.onbtn6} />
                </>
              )}

              {lightOn3 && !lightOn2 && (
                <>
                  <img src={circleOn1} alt="offbtn" className={styles.onbtn4} />
                  <img src={circleOn1} alt="offbtn" className={styles.onbtn6} />
                </>
              )}

              {lightOn4 && (
                <img src={circleOff1} alt="offbtn" className={styles.offbtn5} />
              )}

              {lightOn5 && (
                <>
                  <img src={circleOn1} alt="offbtn" className={styles.onbtn4} />
                  <img src={circleOn1} alt="offbtn" className={styles.onbtn6} />
                </>
              )}
            </div>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div className="css-card">
            <Typography sx={{ paddingBottom: "16px" }}>
              Truth Table&nbsp;(On-1 & Off-0)
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Input-A</TableCell>
                    <TableCell align="right">Input-B</TableCell>
                    <TableCell align="right">Input-C</TableCell>
                    <TableCell align="right">Borrow</TableCell>
                    <TableCell align="right">Output</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.inputA}
                      </TableCell>
                      <TableCell align="right">{row.inputB}</TableCell>
                      <TableCell align="right">{row.inputC}</TableCell>
                      <TableCell align="right">{row.borrow}</TableCell>
                      <TableCell align="right">{row.output}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Grid>
      </Grid>
    </>
  );
}

export default FullSubtractor;
