import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import FinalGamePage from "./FinalGamePage";
import global1 from "./global1";

// Global data here
//const username = global1.name;
const registerNo = global1.regno;
const avatarImg = global1.profileImage; // global1 profile pic here


const name = global1.name;
const regno = global1.regno;

// Dummy data for the game
const imageData = [
  {
    id: 1,
    img1: "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-7-2344-diff1.png",
    img2: "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-7-2449-diff2.png",
    differences: 9,
  },
  {
    id: 2,
    img1: "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-7-2533-diff3.png",
    img2: "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-7-269-diff4.png",
    differences: 10,
  },
];

const FindDiff = () => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);

  // Game Objective
  const objective =
    'Embark on an exciting adventure with our "Find the Differences" game! Challenge your keen eye as you discover hidden differences between pairs of images. Each level offers unique puzzles that enhance your concentration and problem-solving skills. Rack up points with every correct answer and strive for the top of the leaderboard—let the fun begin!';

  const handleAnswerChange = (e) => {
    setUserAnswers(e.target.value);
  };

  const handleSubmit = () => {
    const correctAnswers = imageData[currentImageIndex].differences;

    if (userAnswers.trim().length === 0) {
      alert("Please enter your answer.");
      return;
    }

    const userAnswerCount = parseInt(userAnswers.trim(), 10);

    if (userAnswerCount === correctAnswers) {
      alert(
        `Correct! The number of differences is ${correctAnswers}. click on next button to go next level.`
      );
      setIsSubmit(true);
      setUserAnswers("");
    } else {
      alert(`Incorrect. Game over!`);
      window.location.reload();
    }
  };

  const handleNext1 = () => {
    if (isSubmit) {
      setLevel((prev) => prev + 1);
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
      setScore((prev) => prev + 50);
      setIsSubmit(false);
    }
  };

  const handleNext2 = () => {
    if (isSubmit) {
      setScore((prev) => prev + 50);
      setIsFinished(true); // Open the final page
    }
  };

  return (
    <>
      {!isFinished && (
        <>
          {/* Header and Score */}
          <Container
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              my: "20px",
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Student: {name}
              <br />
              Register no: {regno}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              Score: {score} {level > 0}
            </Typography>
          </Container>
        </>
      )}

      {level === 0 && (
        <Container
          sx={{ display: "grid", placeItems: "center", height: "100vh" }}
        >
          <Box sx={{ width: "400px", height: "auto", position: "relative" }}>
            <Typography
              gutterBottom
              color="#000000"
              sx={{
                fontFamily: "Spicy Rice, serif",
                fontWeight: 400,
                fontSize: "1.8rem",
                position: "absolute",
                left: "50px",
              }}
            >
              Find the Differences!
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="success"
            onClick={() => setLevel((prev) => prev + 1)}
          >
            Play Game
          </Button>
        </Container>
      )}

      {!isFinished && level === 1 && (
        <Container
          maxWidth="xll"
          sx={{ marginTop: "15px", marginBottom: "15px" }}
        >
          <Typography variant="h4" gutterBottom textAlign="center">
            Find the Differences!
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={6}>
              <img
                src={imageData[currentImageIndex].img1}
                alt="Image1"
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={6}>
              <img
                src={imageData[currentImageIndex].img2}
                alt="Image2"
                style={{ width: "100%" }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Enter the number of differences"
            variant="outlined"
            size="medium"
            sx={{ width: "50ch" }}
            value={userAnswers}
            onChange={handleAnswerChange}
            style={{ marginTop: 50 }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              style={{ marginTop: 20 }}
            >
              Submit
            </Button>

            <Button
              variant="outlined"
              onClick={handleNext1}
              style={{ marginTop: 20 }}
            >
              Next
            </Button>
          </Box>
        </Container>
      )}

      {!isFinished && level === 2 && (
        <Container maxWidth="xll">
          <Typography variant="h4" gutterBottom textAlign="center">
            Find the Differences!
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={6}>
              <img
                src={imageData[currentImageIndex].img1}
                alt="Image3"
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={6}>
              <img
                src={imageData[currentImageIndex].img2}
                alt="Image4"
                style={{ width: "100%" }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Enter the number of differences"
            variant="outlined"
            size="medium"
            sx={{ width: "50ch" }}
            value={userAnswers}
            onChange={handleAnswerChange}
            style={{ marginTop: 50 }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              style={{ marginTop: 20 }}
            >
              Submit
            </Button>

            <Button
              variant="outlined"
              onClick={handleNext2}
              color="secondary"
              style={{ marginTop: 20 }}
            >
              Finish
            </Button>
          </Box>
        </Container>
      )}

      {/* Finish Screen */}
      {isFinished && (
        <FinalGamePage
          username={name}
          regno={regno}
          profileImg={avatarImg}
          objective={objective}
          score={score}
          title="Find the Differences!"
          rating=""
        />
      )}
    </>
  );
};

export default FindDiff;
