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
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import global1 from "./global1";

// Create a username and register no
const username = global1.name;
const registerNo = global1.regno;

const FingerPrintPatterns = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentVal, setCurrentVal] = useState("Mongoloid");
  const [w, setW] = useState("");
  const [l, setL] = useState("");
  const [a, setA] = useState("");
  const [hoveredImage, setHoveredImage] = useState("");
  const [nextBtn, setNextBtn] = useState(true);
  // const [nextBtn2, setNextBtn2] = useState(false);

  const checkResponse = () => {
    const aNum = parseInt(w);
    const bNum = parseInt(l);
    const cNum = parseInt(a);

    if (
      aNum >= 40 &&
      aNum <= 50 &&
      bNum >= 50 &&
      bNum <= 60 &&
      cNum >= 1 &&
      cNum <= 2 &&
      currentVal === "Mongoloid"
    ) {
      alert("Correct");
      setNextBtn(false);
      setScore((prev) => prev + 100);
    } else if (
      aNum >= 20 &&
      aNum <= 30 &&
      bNum >= 60 &&
      bNum <= 70 &&
      cNum >= 4 &&
      cNum <= 7 &&
      currentVal === "Caucasoid"
    ) {
      alert("Correct");
      setNextBtn(false);
      setScore((prev) => prev + 100);
    } else if (
      aNum === 30 &&
      bNum >= 50 &&
      bNum <= 60 &&
      cNum >= 6 &&
      cNum <= 7 &&
      currentVal === "Negroid"
    ) {
      alert("Correct");
      setNextBtn(false);
      setScore((prev) => prev + 100);
    } else {
      alert("Wrong");
      setNextBtn(false);
      let randomNumber = Math.floor(Math.random() * 60);
      setScore(randomNumber);
    }
  };

  const handalClickNext = () => {
    if (!nextBtn && score > 60) {
      setLevel((prev) => prev + 1);
      setIsFinished(true);
    } else if (!nextBtn && score < 60) {
      setLevel((prev) => prev + 1);
    }
  };

  const handleMouseEnter = (imageSrc) => {
    setHoveredImage(imageSrc);
  };

  const handleMouseLeave = () => {
    setHoveredImage("");
  };

  const images = [
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-533-f1.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-557-f2.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-619-f3.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-646-f4.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-710-f5.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-732-f6.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-754-f7.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-816-f8.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-837-f9.png",
    "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-19-857-f10.png",
  ];

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
                Digital Anthropology Lab <br />
                Identification of finger prints patterns
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
          <Container maxWidth="md" sx={{ border: "2px dashed #ccc", my: 2 }}>
            <Typography
              sx={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: "30px",
                color: "#FF0000",
                my: 1,
                ml: 2,
              }}
            >
              Digital Anthropology Lab
            </Typography>
            <Typography
              sx={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: "24px",
                color: "#aaa",
                my: 1,
                ml: 2,
              }}
            >
              Identification of finger prints patterns
            </Typography>
            <Typography
              sx={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "16px",
                color: "#aaa",
                my: 1,
                ml: 2,
              }}
            >
              Aim: It includes identification of finger patterns of different
              individuals
            </Typography>
            <Grid container>
              <Grid item xs={12} md={8}>
                {/* First Row of Images */}
                <Box
                  sx={{
                    my: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {images.slice(0, 5).map((image, index) => (
                    <Box key={index}>
                      <img
                        src={image}
                        width={100}
                        height={100}
                        alt={`img${index + 1}`}
                        onMouseEnter={() => handleMouseEnter(image)}
                        onMouseLeave={handleMouseLeave}
                      />
                      <Typography
                        textAlign="center"
                        sx={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Second Row of Images */}
                <Box
                  sx={{
                    my: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {images.slice(5, 10).map((image, index) => (
                    <Box key={index}>
                      <img
                        src={image}
                        width={100}
                        height={100}
                        alt={`img${index + 1}`}
                        onMouseEnter={() => handleMouseEnter(image)}
                        onMouseLeave={handleMouseLeave}
                      />
                      <Typography
                        textAlign="center"
                        sx={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    my: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="left">Population</TableCell>
                        <TableCell align="center">Whorls &nbsp;(%)</TableCell>
                        <TableCell align="center">Loops &nbsp;(%)</TableCell>
                        <TableCell align="center">Arches &nbsp;(%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell align="left">Mongoloid</TableCell>
                        <TableCell align="center">40 to 50</TableCell>
                        <TableCell align="center">50 to 60</TableCell>
                        <TableCell align="center">1 to 2</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="left">Caucasoid</TableCell>
                        <TableCell align="center">20 to 30</TableCell>
                        <TableCell align="center">60 to 70</TableCell>
                        <TableCell align="center">4 to 7</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="left">Negroid</TableCell>
                        <TableCell align="center">30</TableCell>
                        <TableCell align="center">50 to 60</TableCell>
                        <TableCell align="center">6 to 7</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>

                <Box
                  sx={{
                    my: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <TextField
                    label="Whorls"
                    variant="outlined"
                    value={w}
                    onChange={(e) => setW(e.target.value)}
                  />
                  <TextField
                    label="Loops"
                    variant="outlined"
                    value={l}
                    onChange={(e) => setL(e.target.value)}
                  />
                  <TextField
                    label="Arches"
                    variant="outlined"
                    value={a}
                    onChange={(e) => setA(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    border: "2px dashed #aaa",
                    height: "250px",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {hoveredImage ? (
                    <img
                      src={hoveredImage}
                      alt="Hovered"
                      width="100%"
                      height="210px"
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      Stay on the images & count the amount of whorls, loops &
                      arches, Enter the amount into the boxes & write the type
                      into the last box then submit.
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <FormControl>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={currentVal}
                      onChange={(e) => setCurrentVal(e.target.value)}
                    >
                      <MenuItem value="Mongoloid">Mongoloid</MenuItem>
                      <MenuItem value="Caucasoid">Caucasoid</MenuItem>
                      <MenuItem value="Negroid">Negroid</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={checkResponse}
                    disabled={!nextBtn}
                  >
                    Submit
                  </Button>

                  <Box
                    sx={{ marginTop: 4, textAlign: "center", color: "#000" }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handalClickNext}
                      sx={{ marginTop: 2 }}
                      // disabled={nextBtn2}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
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
            Identification of finger prints patterns
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
            <Box sx={{ width: "400px", overflow: "hidden",display: "grid", placeItems: "center"}}>
              <Typography
                variant="h5"
                sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: "700" }}
              >
                {isFinished ? `Well Done ${username} 🎉` : `Try again ${username} 😕`}
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
};

export default FingerPrintPatterns;
