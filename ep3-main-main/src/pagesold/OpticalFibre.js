import React, { useState, useEffect } from "react";
import dragStyle from "../virtuallabcss/OpticalFibre.module.css";
import {
  Box,
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

const OpticalFibre = () => {
  const imageUrls = [
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-289-emitt.svg",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-2354-stand_1.svg",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-322-stand_2.svg",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-2746-wire.svg",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-18-510-output_screen_small.svg",
  ];

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

  return (
    <Container maxWidth="md">
      <Box sx={{ border: "2px dashed #ccc", mt: 2 }}>
        <Typography sx={{ p: 1, fontSize: "22px" }}>
          <b>Instructions: </b>
        </Typography>
        <Typography sx={{ ml: 3, px: 2 }}>
          <ol>
            <li>First arrenge the all tools given a image below.</li>
            <li>
              Once you arreged all tools then you will able to click{" "}
              <b style={{ color: "blue" }}>select cable</b> button.
            </li>
            <li>Select cable we have two value fibre cable and glass cable.</li>
            <li>
              Once you seleted any value then you will see{" "}
              <b>Distance of Screen (L) in mm:</b> and in down table you will
              see diameter with value.
            </li>
            <li>
              Distance of Screen, when you will decrease and increase the range,
              you will see effect on right side <b>output screen</b>
            </li>
            <li>
              Finally you will see Measurement of Numerical Aperture of Optical
              Fiber with fibre and glass.
            </li>
          </ol>
        </Typography>
      </Box>
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
        <Box sx={{ border: "2px dashed #ccc", my: 4, mr: 2 }}>
          <Typography
            sx={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              ml: 1,
              p: 2,
            }}
          >
            Arrenge the tool like this way
          </Typography>
          <img
            src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-5727-optical_fib1.png"
            alt="optical_fiber"
            style={{ width: "100%" }}
          />
        </Box>
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
                    left: "195px",
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
                    left: "187px",
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
        <Box sx={{ border: "2px dashed #ccc", my: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center"><div style={{color: '#000' }}>Diameter&nbsp;(D)</div></TableCell>
                <TableCell align="center"><div style={{color: '#000' }}>Value&nbsp;(mm)</div></TableCell>
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
      </Box>
    </Container>
  );
};

export default OpticalFibre;
