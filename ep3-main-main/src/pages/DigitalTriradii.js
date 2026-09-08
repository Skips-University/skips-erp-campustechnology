import React, { useState } from "react";
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

const DigitalTriradii = () => {
  const [stateTrue, setStateTrue] = useState(false);
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
    } else {
      alert("Enter the values correctly");
    }
  };

  const handleNext = () => {
    // Check if all dropped letters are filled
    const allDroppedFilled =
      droppedLetters.every((letter) => letter) &&
      droppedLetters2.every((letter) => letter);

    if (allDroppedFilled) {
      setStateTrue((prev) => !prev);
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
    <Container maxWidth="md">
      <Box
        sx={{
          border: "2px dashed #ccc",
          height: "100%",
          padding: "1rem",
          my: 2,
        }}
      >
        <Box>
          <Typography variant="h6">Instruction:</Typography>
          <Typography sx={{ py: 1, px: 4 }}>
            <ol>
              <li>Identify the Digital Triradii</li>
              <li>Given a boxes for drop letter.</li>
              <li>
                Before going next step put all letters correct inside box.
              </li>
              <li>Drop letter one by one staring from left to go right.</li>
              <li>
                Once you will drop all letter inside box then you will go next
                step and see exact answer.
              </li>
            </ol>
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          border: "2px dashed #ccc",
          height: "100%",
          padding: "2rem",
          my: 2,
        }}
      >
        <Typography textAlign="center" my="10px" variant="h6">
          Drag and Drop the following symbols to identify the Digital Triradii
        </Typography>
        {stateTrue ? (
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
              <Button variant="contained" onClick={check} sx={{ marginTop: 2 }}>
                SUBMIT
              </Button>
            </Box>
          </>
        ) : (
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
                onClick={handleNext}
                sx={{ marginTop: 2 }}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default DigitalTriradii;
