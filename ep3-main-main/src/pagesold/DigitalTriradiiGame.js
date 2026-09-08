import React, { useState } from "react";
import global1 from "./global1";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Container,
} from "@mui/material";

const img12 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-20-513-triradii3.png";
const img23 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-20-358-triradii.png";

// Create a username and register no
const username = global1.name;
const registerNo = global1.regno;

const DigitalTriradii = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [inputs, setInputs] = useState(Array(4).fill(""));
  const [droppedLetters, setDroppedLetters] = useState(Array(4).fill(""));
  const [droppedLetters2, setDroppedLetters2] = useState(Array(4).fill(""));
  const [availableLetters, setAvailableLetters] = useState([
    "a",
    "b",
    "c",
    "d",
  ]);
  const [availableLetters2, setAvailableLetters2] = useState([
    "d",
    "c",
    "b",
    "a",
  ]);

  // State for final next button
  const [isNext, setIsNext] = useState(false);

  const handleInputChange = (index) => (event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
  };

  const check = () => {
    const [a, b, c, d, e, f, g, h] = inputs.map(Number);
    if (
      a === 12 &&
      b === 10 &&
      c === 8 &&
      d === 6 &&
      e === 12 &&
      f === 10 &&
      g === 8 &&
      h === 6
    ) {
      alert("Correct");
      setScore((prev) => prev + 60);
    } else {
      alert("Enter the values correctly");
    }
  };

  // Handle for final next button
  const handleNextButton = () => {
    if (score > 60) {
      setIsFinished(true);
    }
    setIsNext(!isNext);
    setLevel((prev) => prev + 1);
  };

  const handleNext = () => {
    // Check if all dropped letters are filled
    const allDroppedFilled =
      droppedLetters.every((letter) => letter) &&
      droppedLetters2.every((letter) => letter);

    if (allDroppedFilled) {
      setScore((prev) => prev + 40);
      setLevel((prev) => prev + 1);
    } else {
      alert("Please drop all letters into the boxes before proceeding.");
    }
  };

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData("text/plain");
    const newDroppedLetters = [...droppedLetters];
    newDroppedLetters[index] = letter;

    // Remove the letter from available letters
    setAvailableLetters((prev) => prev.filter((l) => l !== letter));
    setDroppedLetters(newDroppedLetters);
  };

  const handleDragStart = (letter) => (e) => {
    e.dataTransfer.setData("text/plain", letter);
  };

  const handleDrop2 = (index) => (e) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData("text/plain");
    const newDroppedLetters = [...droppedLetters2];
    newDroppedLetters[index] = letter;

    // Remove the letter from available letters
    setAvailableLetters2((prev) => prev.filter((l) => l !== letter));
    setDroppedLetters2(newDroppedLetters);
  };

  const handleDragStart2 = (letter) => (e) => {
    e.dataTransfer.setData("text/plain", letter);
  };

  return (
    <Box p="20px 0px">
      <Container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: "20px",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Username: {username}
          <br />
          Register no: {registerNo}
        </Typography>
        {level > 2 ? (
          <Button variant="contained" onClick={() => window.print()}>
            Print result
          </Button>
        ) : (
          <Typography
            variant="h5"
            fontWeight="bold"
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
                border: "2px dashed #ccc",
                height: "100%",
                padding: "1rem",
                my: 2,
                borderRadius: "5px",
              }}
            >
              <Typography variant="h4" textAlign="center" color="#FF0000">
                Identify the Digital Triradii
              </Typography>
              <Box>
                <Typography variant="h6">Instruction:</Typography>
                <Typography sx={{ py: 1, px: 4 }}>
                  <ol>
                    <li>Identify the Digital Triradii.</li>
                    <li>Given boxes for dropping letters.</li>
                    <li>
                      Before going to the next step, put all letters correctly
                      inside the box.
                    </li>
                    <li>
                      Drop the letters one by one, starting from the left to go
                      right.
                    </li>
                    <li>
                      Once you have dropped all the letters inside the box, you
                      can go to the next step and see the exact answer.
                    </li>
                  </ol>
                </Typography>
              </Box>
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
          <Box
            sx={{
              border: "2px dashed #ccc",
              height: "100%",
              padding: "2rem",
              my: 2,
              borderRadius: "5px",
            }}
          >
            <Typography textAlign="center" my="10px" variant="h6">
              Drag and Drop the following symbols to identify the Digital
              Triradii
            </Typography>
            <>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Box
                    sx={{
                      height: 501,
                      width: 601,
                      backgroundRepeat: "no-repeat",
                      position: "relative",
                    }}
                  >
                    <img src={img23} alt="..." width="600" height="500" />
                    <Box
                      sx={{
                        position: "absolute",
                        display: "flex",
                        flexDirection: "row",
                        gap: "10px",
                        top: "10px",
                        right: "10px",
                        mx: 2,
                      }}
                    >
                      {availableLetters.map((letter) => (
                        <Typography
                          key={letter}
                          sx={{ cursor: "grab" }}
                          draggable
                          onDragStart={handleDragStart(letter)}
                        >
                          {letter}
                        </Typography>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        display: "flex",
                        flexDirection: "row",
                        gap: "10px",
                        top: "10px",
                        left: "10px",
                        mx: 2,
                      }}
                    >
                      {availableLetters2.map((letter) => (
                        <Typography
                          key={letter}
                          sx={{ cursor: "grab" }}
                          draggable
                          onDragStart={handleDragStart2(letter)}
                        >
                          {letter}
                        </Typography>
                      ))}
                    </Box>

                    {/* Positioning each box differently */}
                    <Box
                      onDrop={handleDrop(0)}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #ccc",
                        position: "absolute",
                        top: "91px",
                        right: "193px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 1,
                      }}
                    >
                      {droppedLetters[0]}
                    </Box>
                    <Box
                      onDrop={handleDrop(1)}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #ccc",
                        position: "absolute",
                        top: "63px",
                        right: "141px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 1,
                      }}
                    >
                      {droppedLetters[1]}
                    </Box>
                    <Box
                      onDrop={handleDrop(2)}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #ccc",
                        position: "absolute",
                        top: "69px",
                        right: "84px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 1,
                      }}
                    >
                      {droppedLetters[2]}
                    </Box>
                    <Box
                      onDrop={handleDrop(3)}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #ccc",
                        position: "absolute",
                        top: "120px",
                        right: "51px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 1,
                      }}
                    >
                      {droppedLetters[3]}
                    </Box>

                    {/* Positioning each box differently */}
                    <Box
                      onDrop={handleDrop2(0)}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #ccc",
                        position: "absolute",
                        top: "78px",
                        left: "212px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 1,
                      }}
                    >
                      {droppedLetters2[0]}
                    </Box>
                    <Box
                      onDrop={handleDrop2(1)}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #ccc",
                        position: "absolute",
                        top: "63px",
                        left: "151px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 1,
                      }}
                    >
                      {droppedLetters2[1]}
                    </Box>
                    <Box
                      onDrop={handleDrop2(2)}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #ccc",
                        position: "absolute",
                        top: "65px",
                        left: "87px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 1,
                      }}
                    >
                      {droppedLetters2[2]}
                    </Box>
                    <Box
                      onDrop={handleDrop2(3)}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #ccc",
                        position: "absolute",
                        top: "86px",
                        left: "38px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 1,
                      }}
                    >
                      {droppedLetters2[3]}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ marginTop: 4, textAlign: "center", color: "#000" }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleNext}
                  sx={{ marginTop: 2 }}
                >
                  Next
                </Button>
              </Box>
            </>
          </Box>
        </Container>
      )}

      {level === 2 && (
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
          <Box
            sx={{
              border: "2px dashed #ccc",
              height: "100%",
              padding: "2rem",
              my: 2,
              borderRadius: "5px",
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Box
                  sx={{
                    height: 501,
                    width: 601,
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                  }}
                >
                  <img src={img12} alt="..." width="600" height="500" />
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ marginTop: 4, textAlign: "center", color: "#000" }}>
              <Typography variant="h6">MAIN LINE FORMULA:</Typography>
              <Typography variant="body1">
                TYPE INTO THE BOXES ALL LETTER VALUE AND CLICK SUBMIT:
              </Typography>
              <Grid container spacing={1} justifyContent="center" marginTop={2}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <Grid item key={index}>
                    <TextField
                      variant="outlined"
                      size="small"
                      value={inputs[index]}
                      onChange={handleInputChange(index)}
                      inputProps={{ style: { height: 30, width: 30 } }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Box>
                <Button
                  variant="contained"
                  onClick={check}
                  sx={{ marginTop: 2 }}
                >
                  SUBMIT
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleNextButton}
                  sx={{ marginLeft: 2, marginTop: 2 }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      )}

      {level > 2 && (
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
            fontWeight="bold"
            mb={"30px"}
          >
            Identify the Digital Triradii
          </Typography>
          <Box
            sx={{
              width: "400px",
              height: "200px",
              bgcolor: isFinished ? "lightblue" : "#FF0000",
              color: !isFinished && "#FFFFFF",
              padding: "20px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            }}
          >
            <Box>
              <Typography variant="h5">
                {isFinished ? `Well Done ${username} 🎉` : `${username} 😕`}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontSize: "2rem" }}>
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
};

export default DigitalTriradii;
