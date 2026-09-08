import React, { useState } from "react";
import { Box, Button, Typography, Grid, Container } from "@mui/material";
import global1 from "./global1";

const img12 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3258-humanskeleton.jpg";
const part1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3329-skeleton_part-1.png";
const part2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3354-skeleton_part-2.png";
const part3 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3430-skeleton_part-3.png";
const part4 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-353-skeleton_part-4.png";
const part5 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3531-skeleton_part-5.png";
const part6 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3654-skeleton_part--6.png";
const part7 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3724-skeleton_part-7.png";
const part8 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3752-skeleton_part--8.png";
const part9 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3819-skeleton_part-9.png";
const part10 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3849-skeleton_part-10.png";
const part11 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3920-skeleton_part-11.png";
const part12 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3950-skeleton_part-12.png";

// Create a username and register no
const username = global1.name;
const registerNo = global1.regno;

const SkeletonExp = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [stateTrue, setStateTrue] = useState(false);
  const [droppedImages, setDroppedImages] = useState(Array(12).fill(""));
  const [availableImages, setAvailableImages] = useState([
    part1,
    part2,
    part3,
    part4,
    part5,
    part6,
    part7,
    part8,
    part9,
    part10,
    part11,
    part12,
  ]);

  const handleNext = () => {
    const allDroppedFilled = droppedImages.every((img) => img);
    if (allDroppedFilled) {
      alert("Correct!");
    } else {
      alert("Incorrect!");
    }
  };

  const handleNext2 = () => {
    const allDroppedFilled = droppedImages.every((img) => img);
    if (allDroppedFilled) {
      setScore((prev) => prev + 100);
      setIsFinished(true);
      setLevel((prev) => prev + 1);
    } else {
      alert("Haven't complete!");
      let randomNumber = Math.floor(Math.random() * 60);
      setScore(randomNumber);
      setLevel((prev) => prev + 1);
    }
  };

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    const image = e.dataTransfer.getData("text/plain");

    if (availableImages.includes(image) && !droppedImages.includes(image)) {
      const newDroppedImages = [...droppedImages];
      newDroppedImages[index] = image;
      setAvailableImages((prev) => prev.filter((img) => img !== image));
      setDroppedImages(newDroppedImages);
    }
  };

  const handleDragStart = (img) => (e) => {
    e.dataTransfer.setData("text/plain", img);
  };

  // Custom styles for each drop box
  const dropBoxStyles = [
    {
      width: "40px",
      height: "115px",
      top: "105px",
      left: "189px",
      transform: "rotate(-10deg)",
    },
    {
      width: "40px",
      height: "115px",
      top: "101px",
      left: "40px",
      transform: "rotate(10deg)",
    },
    {
      width: "45px",
      height: "66px",
      top: "254px",
      left: "110px",
      zIndex: 1,
    },
    {
      width: "35px",
      height: "55px",
      top: "209px",
      left: "115px",
    },
    {
      width: "40px",
      height: "130px",
      top: "190px",
      left: "219px",
      transform: "rotate(8deg)",
    },
    {
      width: "40px",
      height: "141px",
      top: "183px",
      left: "11px",
      transform: "rotate(-12deg)",
    },
    {
      width: "49px",
      height: "172px",
      top: "305px",
      left: "147px",
    },
    {
      width: "49px",
      height: "180px",
      top: "299px",
      left: "69px",
    },
    {
      width: "40px",
      height: "146px",
      top: "473px",
      left: "134px",
      transform: "rotate(-3deg)",
    },
    { width: "32px", height: "151px", top: "472px", left: "99px" },
    {
      width: "50px",
      height: "71px",
      top: "255px",
      left: "79px",
    },
    {
      width: "50px",
      height: "71px",
      top: "257px",
      left: "135px",
    },
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
                Skeleton
                <br />
                Assembling, Identification & Labeling
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
            <Box sx={{ border: "2px dashed #ccc", padding: "1rem", my: 2 }}>
              <Typography textAlign="center" my="10px" variant="h6">
                Skeleton - Assembling, Identification & Labeling
              </Typography>
              {!stateTrue && (
                <>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item>
                      <Box sx={{ position: "relative" }}>
                        <img
                          src={img12}
                          alt="Skeleton"
                          width="300"
                          height="700"
                        />
                        {/* Drop boxes */}
                        {dropBoxStyles.map((style, index) => (
                          <Box
                            key={index}
                            onDrop={handleDrop(index)}
                            onDragOver={(e) => e.preventDefault()}
                            sx={{
                              ...style,
                              position: "absolute",
                              // border: "1px dashed #ccc",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: 1,
                            }}
                          >
                            {droppedImages[index] && (
                              <img
                                src={droppedImages[index]}
                                alt={`Part ${index + 1}`}
                                //   width="100%"
                                height="100%"
                              />
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                    <Grid item>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          width: "300px",
                        }}
                      >
                        {availableImages.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt="skeleton-part"
                            draggable
                            onDragStart={handleDragStart(img)}
                            style={{
                              width: "50px",
                              height: "50px",
                              margin: "5px",
                              cursor: "grab",
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{ marginTop: 4, textAlign: "center", color: "#000" }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ marginTop: 2 }}
                    >
                      Submit
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleNext2}
                      sx={{ marginTop: 2, marginLeft: 2 }}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}
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
            Skeleton - Assembling, Identification & Labeling
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
              borderRadius: "5px",
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: "700" }}
              >
                {isFinished ? `Well Done ${username} 🎉` : `${username} 😕`}
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

export default SkeletonExp;
