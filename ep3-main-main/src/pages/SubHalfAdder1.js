import React, { useState } from "react";
import "./SubHalfAdder.css";
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

function createData(name, calories, fat, carbs) {
  return { name, calories, fat, carbs };
}

const rows = [
  createData(0, 0, 0, 0),
  createData(0, 1, 0, 1),
  createData(1, 0, 0, 1),
  createData(1, 1, 1, 0),
];

function SubHalfAdder1() {
  const [isRedOne, setIsRedOne] = useState(false);
  const [isRedTwo, setIsRedTwo] = useState(false);
  const [isRedThree, setIsRedThree] = useState(false);
  const [isRedFour, setIsRedFour] = useState(false);

  return (
    <>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={12}>
          <div className="csstop">
            <div className="wrapper">
              <img
                src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4149-Combinational-circuit-half.webp"
                alt="Combinational Circuit"
                className="background-image"
              />

              <img
                src={!isRedOne ? circleOff : circleOn}
                alt="offbtn"
                className={isRedOne ? "offbtn1" : "onbtn1"}
                onClick={() => setIsRedOne(!isRedOne)}
              />

              <img
                src={!isRedTwo ? circleOff : circleOn}
                alt="offbtn"
                className={isRedOne ? "offbtn2" : "onbtn2"}
                onClick={() => setIsRedTwo(!isRedTwo)}
              />

              {!isRedOne && !isRedTwo ? (
                <img
                  src={circleOff1}
                  alt="offbtn"
                  className="offbtn3"
                  onClick={() => setIsRedThree(!isRedThree)}
                />
              ) : (
                <img
                  src={circleOn1}
                  alt="offbtn"
                  className="onbtn4"
                  onClick={() => setIsRedThree(!isRedThree)}
                />
              )}

              {isRedOne && isRedTwo ? (
                <img
                  src={circleOn1}
                  alt="offbtn"
                  className="onbtn6"
                  onClick={() => setIsRedFour(!isRedFour)}
                />
              ) : (
                <img
                  src={circleOff1}
                  alt="offbtn"
                  className="offbtn5"
                  onClick={() => setIsRedFour(!isRedFour)}
                />
              )}

              {isRedOne && isRedTwo && (
                <img
                  src={circleOff1}
                  alt="offbtn"
                  className="offbtn3"
                  onClick={() => setIsRedThree(!isRedThree)}
                />
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
                    <TableCell align="right">Carry</TableCell>
                    <TableCell align="right">Sum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.calories}</TableCell>
                      <TableCell align="right">{row.fat}</TableCell>
                      <TableCell align="right">{row.carbs}</TableCell>
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

export default SubHalfAdder1;
