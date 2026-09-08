import React, { useState } from "react";
import styles from "../virtuallabcss/SubHalfAdderGame.module.css"; // Import the CSS module
import {
  Box,
  Button,
  Checkbox,
  Container,
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

// Import the global1 file
import global1 from "./global1";

const circleOff1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-355-circleBtnOn.png";

const circleOn1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4059-circleBtnOff.png";

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

// Create a username and register no
const username = global1.name;
const registerNo = global1.regno;

function SubHalfAdder1() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isRedOne, setIsRedOne] = useState(false);
  const [isRedTwo, setIsRedTwo] = useState(false);
  const [isRedThree, setIsRedThree] = useState(false);
  const [isRedFour, setIsRedFour] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false); // State for the checkbox

  // Handle next button click
  const handleNextClick = () => {
    setLevel((prev) => prev + 1);

    // Set score based on checkbox state
    const randomScore = checkboxChecked
      ? Math.floor(Math.random() * 40) + 61 // 61 to 100
      : Math.floor(Math.random() * 60) + 1; // 1 to 60

    setScore(randomScore);
    // Set isFinished based on whether the checkbox is checked
    setIsFinished(checkboxChecked);
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
        {level > 1 ? (
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
                // border: "2px dashed #ccc",
                // height: "100%",
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
                Sub-Half-Adder
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
          <Container>
            <Grid container spacing={2} direction="column" alignItems="center">
              <Grid item xs={12}>
                <div className={styles.csstop}>
                  <div className={styles.wrapper}>
                    <img
                      src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4149-Combinational-circuit-half.webp"
                      alt="Combinational Circuit"
                      className={styles["background-image"]}
                    />

                    <img
                      src={!isRedOne ? circleOff : circleOn}
                      alt="offbtn"
                      className={isRedOne ? styles.offbtn1 : styles.onbtn1}
                      onClick={() => setIsRedOne(!isRedOne)}
                    />

                    <img
                      src={!isRedTwo ? circleOff : circleOn}
                      alt="offbtn"
                      className={isRedTwo ? styles.offbtn2 : styles.onbtn2}
                      onClick={() => setIsRedTwo(!isRedTwo)}
                    />

                    {!isRedOne && !isRedTwo ? (
                      <img
                        src={circleOff1}
                        alt="offbtn"
                        className={styles.offbtn3}
                        onClick={() => setIsRedThree(!isRedThree)}
                      />
                    ) : (
                      <img
                        src={circleOn1}
                        alt="offbtn"
                        className={styles.onbtn4}
                        onClick={() => setIsRedThree(!isRedThree)}
                      />
                    )}

                    {isRedOne && isRedTwo ? (
                      <img
                        src={circleOn1}
                        alt="offbtn"
                        className={styles.onbtn6}
                        onClick={() => setIsRedFour(!isRedFour)}
                      />
                    ) : (
                      <img
                        src={circleOff1}
                        alt="offbtn"
                        className={styles.offbtn5}
                        onClick={() => setIsRedFour(!isRedFour)}
                      />
                    )}

                    {isRedOne && isRedTwo && (
                      <img
                        src={circleOff1}
                        alt="offbtn"
                        className={styles.offbtn3}
                        onClick={() => setIsRedThree(!isRedThree)}
                      />
                    )}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={styles["css-card"]}>
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
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
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

            <Box sx={{ marginTop: 2, textAlign: "center" }}>
              <Typography>
                <Checkbox
                  checked={checkboxChecked}
                  onChange={() => setCheckboxChecked(!checkboxChecked)}
                />
                If checked, you performed the experiment
              </Typography>
            </Box>

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
          </Container>
        </>
      )}

      {level > 1 && (
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
            Color Code for Resistor
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

export default SubHalfAdder1;
