import React, { useState, useEffect } from "react";
import dragStyle from "../virtuallabcss/OpticalFibre.module.css";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import global1 from "./global1";

const screen2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-5343-output_screen.svg";

const DiameterFibreValue = [
  0, 1.11, 2.222, 3.332, 4.444, 5.554, 6.666, 7.776, 8.888, 9.998, 11.11, 12.22,
  13.332, 14.442, 15.554, 16.664, 17.776, 18.886, 19.998, 21.108, 22.22,
];

const DiameterGlassValue = [
  0, 1.902, 3.806, 5.708, 7.612, 9.514, 11.418, 13.32, 15.224, 17.126, 19.028,
  20.932, 22.834, 24.738, 26.64, 28.544, 30.446, 32.35, 34.252, 36.154, 38.054,
];

// Create a username and register no
const username = global1.name;
const registerNo = global1.regno;

const OpticalFibre = () => {
  const imageUrls = [
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-289-emitt.svg",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-2354-stand_1.svg",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-322-stand_2.svg",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-2746-wire.svg",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-510-output_screen_small.svg",
  ];

  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [availableImages, setAvailableImages] = useState(imageUrls);
  const [droppedImages, setDroppedImages] = useState(
    Array(imageUrls.length).fill(null)
  );
  const [draggedImage, setDraggedImage] = useState(null);
  const [cable, setCable] = useState("");
  const [rangeValue, setRangeValue] = useState(10);
  const [cableOne, setCableOne] = useState(false);
  const [cableTwo, setCableTwo] = useState(false);
  const [isDropdownDisabled, setIsDropdownDisabled] = useState(true);

  const handleChange = (event) => {
    const valNum = Number(event.target.value);
    setCable(valNum);
    setCableOne(valNum === 1);
    setCableTwo(valNum === 2);
  };

  const handleDragStart = (image) => {
    setDraggedImage(image);
  };

  const handleDropImage = (index, event) => {
    event.preventDefault();
    if (draggedImage) {
      setDroppedImages((prevImages) => {
        const newDroppedImages = [...prevImages];
        newDroppedImages[index] = draggedImage;
        return newDroppedImages;
      });
      setAvailableImages((prevImages) =>
        prevImages.filter((img) => img !== draggedImage)
      );
      setDraggedImage(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRangeChange = (event) => {
    setRangeValue(event.target.value);
  };

  // Get the diameter value based on selected cable and rangeValue
  const diameterValues = cable === 1 ? DiameterFibreValue : DiameterGlassValue;
  const diameterIndex = Math.floor((rangeValue / 21) * diameterValues.length);
  const currentDiameterValue = diameterValues[diameterIndex] || 0;

  // Check if all images are dropped to enable the dropdown
  useEffect(() => {
    const allDropped = droppedImages.every((image) => image !== null);
    setIsDropdownDisabled(!allDropped);
  }, [droppedImages]);

  // Handle for next click
  const handleNextClick = () => {
    setLevel((prev) => prev + 1);
    setScore((prev) => prev + 65);
  };

  const handleNext2 = () => {
    setIsFinished(true);
    setLevel((prev) => prev + 1);
    setScore((prev) => prev + 35);
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
                Measurement of Numerical Aperture of Optical Fiber
              </Typography>
              <Box>
                <Typography variant="h6">Instruction:</Typography>
                <Typography sx={{ py: 1, px: 4 }}>
                  <ol>
                    <li>
                      First, arrange all the tools given in the image below.
                    </li>
                    <li>
                      Once you have arranged all the tools, you will be able to
                      click <b style={{ color: "blue" }}>select cable</b>{" "}
                      button.
                    </li>
                    <li>
                      Select a cable; we have two types: fiber cable and glass
                      cable.
                    </li>
                    <li>
                      Once you select any option, you will see{" "}
                      <b>Distance of Screen (L) in mm:</b> and in the table
                      below, you will see the diameter with its value.
                    </li>
                    <li>
                      The Distance of Screen: when you decrease or increase the
                      range, you will see the effect on the right side{" "}
                      <b>output screen</b>.
                    </li>
                    <li>
                      Finally, you will see the Measurement of Numerical
                      Aperture of Optical Fiber with fiber and glass.
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
          <Container maxWidth="md">
            <Box className={dragStyle.containerWrapper}>
              <h1>Experiment name:</h1>
              <h1 style={{ textDecoration: "underline", color: "#FF0000" }}>
                Measurement of Numerical Aperture of Optical Fiber
              </h1>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box className={dragStyle.container}>
                    <Typography>Tools:</Typography>
                    <Box className={dragStyle.imageContainer}>
                      {availableImages.map((image) => (
                        <Box
                          key={image}
                          draggable
                          onDragStart={() => handleDragStart(image)}
                          className={dragStyle.imageItem}
                        >
                          <img
                            src={image}
                            alt={image}
                            style={{
                              width: "113px",
                              height: "133px",
                              objectFit: "fill",
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box className={dragStyle.dropContainer}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Box
                        key={index}
                        className={dragStyle.dropZone}
                        onDrop={(event) => handleDropImage(index, event)}
                        onDragOver={handleDragOver}
                      >
                        <Typography>Drop Tool Here {index + 1}</Typography>
                        {droppedImages[index] && (
                          <Box
                            className={`${dragStyle.imageItem} ${
                              dragStyle[`imageDropped${index}`]
                            }`}
                          >
                            <img
                              src={droppedImages[index]}
                              alt={`Dropped ${index + 1}`}
                              className={dragStyle.droppedImage}
                            />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ border: "2px dashed #ccc", my: 4, mr: 2 }}>
              <Typography
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  ml: 1,
                  p: 2,
                }}
              >
                Arrange the tools in this way
              </Typography>
              <img
                src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-5727-optical_fib1.png"
                alt="optical_fiber"
                style={{ width: "100%" }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleNextClick}
                variant="contained"
                color="success"
                disabled={isDropdownDisabled}
              >
                Next
              </Button>
            </Box>
          </Container>
        </>
      )}

      {level === 2 && (
        <>
          <Container>
            <Typography
              variant="h6"
              marginBottom="50px"
              bgcolor="#FFFF00"
              textAlign="center"
              borderRadius="5px"
            >
              Level - {level}
            </Typography>
          </Container>
          <Container maxWidth="md">
            <Grid container spacing={2}>
              <Grid
                item
                xs={6}
                sx={{
                  border: "2px dashed #ccc",
                  p: 2,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Select Cable
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={cable}
                    label="Fibre Cable"
                    onChange={handleChange}
                    disabled={isDropdownDisabled} // Disable the dropdown if needed
                  >
                    <MenuItem value={1}>Fibre Cable</MenuItem>
                    <MenuItem value={2}>Glass Cable</MenuItem>
                  </Select>
                </FormControl>
                <Typography component="div">
                  {(cableOne || cableTwo) && (
                    <label>
                      Distance of Screen (L) in mm:
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={rangeValue}
                        onChange={handleRangeChange}
                        style={{ width: "300px" }}
                      />
                    </label>
                  )}
                </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                sx={{
                  position: "relative",
                  border: "2px dashed #ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box>
                  <img src={screen2} alt="screen2" />
                  {cableOne && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "96px",
                        left: "204px",
                        transform: `scale(${rangeValue * 0.1})`,
                        borderRadius: "50%",
                        backgroundColor: "#00ff00",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow:
                          "0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00, 0 0 20px #00ff00",
                        transition: "transform 0.2s",
                      }}
                    ></Box>
                  )}
                  {cableTwo && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "87px",
                        left: "196px",
                        transform: `scale(${rangeValue * 0.1})`,
                        borderRadius: "50%",
                        backgroundColor: "#00ff00",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow:
                          "0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00",
                        transition: "transform 0.2s",
                      }}
                    ></Box>
                  )}
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ border: "2px dashed #ccc", my: 2, mr: 2 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" colSpan={2}>
                      Message
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center">Diameter&nbsp;(D)</TableCell>
                    <TableCell align="center">Value&nbsp;(mm)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center">{currentDiameterValue}</TableCell>
                    <TableCell align="center">{rangeValue}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={handleNext2}
                variant="contained"
                color="success"
                disabled={isDropdownDisabled}
              >
                Next
              </Button>
            </Box>
          </Container>
        </>
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
            Measurement of Numerical Aperture of Optical Fiber
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

export default OpticalFibre;
