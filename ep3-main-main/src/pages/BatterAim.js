import { Box, Button, Container, Typography, Dialog } from "@mui/material";
import React, { useState, useEffect } from "react";
import global1 from "./global1";
import FinalGamePage from "./FinalGamePage";

// Global data here
const username = global1.name;
const registerNo = global1.regno;
const avatarImg = global1.profileImage; // global1 profile pic here

const name = global1.name;
const regno = global1.regno;

const BetterAimGame2 = () => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [dots, setDots] = useState([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [dotTimeout, setDotTimeout] = useState(null);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  //   const [openModal, setOpenModal] = useState(false);

  // Game Objective
  const objective =
    "BetterAim is a fast-paced game that sharpens your reflexes and hand-eye coordination while providing engaging, vibrant gameplay. With customizable difficulty levels, it suits both beginners and seasoned players. Compete with friends to boost motivation, track your progress, and enjoy a fun way to relieve stress. Dive in and challenge yourself today!";

  // Difficulty state
  const [difficulty, setDifficulty] = useState(null);

  const createDot = () => {
    const newDot = {
      id: Date.now(),
      left: Math.random() * 90 + "%",
      top: Math.random() * 90 + "%",
    };
    setDots((prevDots) => [...prevDots, newDot]);

    // Set timeout based on difficulty level
    const timeoutDuration =
      difficulty === "easy"
        ? 1500
        : difficulty === "medium"
        ? 1000
        : difficulty === "hard"
        ? 500
        : 800; // Default

    const timeout = setTimeout(() => {
      setDots((prevDots) => prevDots.filter((dot) => dot.id !== newDot.id));
    }, timeoutDuration);

    setDotTimeout(timeout);
  };

  const handleDotClick = (id) => {
    const dotElement = document.getElementById(id);
    if (dotElement) {
      dotElement.style.transform = "scale(0)";
      dotElement.style.opacity = "0"; // Fade out
    }

    setTimeout(() => {
      // Update score and ensure it stays within limits
      setScore((prevScore) => {
        const newScore = prevScore + 5;
        return Math.min(newScore, 100); // Limit score to a maximum of 100
      });
      setDots((prevDots) => prevDots.filter((dot) => dot.id !== id));
      clearTimeout(dotTimeout);
    }, 200); // Wait for the animation to finish before removing the dot
  };

  useEffect(() => {
    if (isGameActive) {
      createDot();
      const interval = setInterval(createDot, 1000); // Create a new dot every second

      return () => clearInterval(interval);
    }
  }, [isGameActive]);

  useEffect(() => {
    if (isGameActive) {
      const timerInterval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerInterval);
            setIsGameActive(false); // End game when timer reaches zero
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [isGameActive]);

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setDots([]);
    setTimer(300); // Reset timer to 5 minutes
    setIsNextEnabled(false); // Disable Next button when game starts
  };

  const stopGame = () => {
    setIsGameActive(false); // Stop the game
    setIsNextEnabled(true); // Enable Next button when game stops
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const handleClickNext = () => {
    if (!isGameActive) {
      setIsFinished(true);
      //   setTimeout(() => {
      //     // setOpenModal(false);
      //     setLevel((prev) => prev - 1); // Go to next level
      //   }, 3000);
    }
  };

  const handleClickEasy = () => {
    setDifficulty("easy");
    setLevel(2);
  };

  const handleClickMedium = () => {
    setDifficulty("medium");
    setLevel(2);
  };

  const handleClickHard = () => {
    setDifficulty("hard");
    setLevel(2);
  };

  return (
    <>
      {/* Header and Score */}
      {!isFinished && (
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
            Reg no: {regno}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            Score: {score}
          </Typography>
        </Container>
      )}

      {/* Game Levels */}
      {level === 0 && (
        <Container>
          <Box sx={{ width: "100%", position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "30%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Typography variant="h4" sx={{ mb: "20px" }}>
                Aim Master/Dot Dash Challenge
              </Typography>
              <Button
                variant="contained"
                onClick={() => setLevel((prev) => prev + 1)}
                sx={{ left: "40%" }}
              >
                Play Game
              </Button>
            </Box>
          </Box>
        </Container>
      )}

      {!isFinished && level === 1 && (
        <Container>
          <Button
            variant="outlined"
            color="success"
            onClick={handleClickEasy}
            sx={{ ml: 0, mr: 1 }}
          >
            Easy
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClickMedium}
            sx={{ ml: 1, mr: 1 }}
          >
            Medium
          </Button>
          <Button
            variant="outlined"
            onClick={handleClickHard}
            sx={{ ml: 1, mr: 1 }}
          >
            Hard
          </Button>
        </Container>
      )}

      {!isFinished && level === 2 && difficulty && (
        <Container>
          <Box sx={{ marginTop: "20px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1 style={styles.title}>BetterAim Game</h1>
              <h2 style={styles.timer}>Time: {formatTime(timer)}</h2>
            </Box>
            <Box>
              <Button
                onClick={isGameActive ? stopGame : startGame}
                style={styles.startButton}
              >
                {isGameActive ? "Stop Game" : "Start Game"}
              </Button>
            </Box>
          </Box>
          <div style={styles.container}>
            {isGameActive && (
              <div style={styles.dotContainer}>
                {dots.map((dot) => (
                  <div
                    key={dot.id}
                    id={dot.id} // Add id for animation
                    style={{
                      ...styles.dot,
                      left: dot.left,
                      top: dot.top,
                    }}
                    onClick={() => handleDotClick(dot.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <Box sx={{ marginTop: "20px" }}>
            <Button
              variant="outlined"
              onClick={handleClickNext}
              disabled={!isNextEnabled} // Enable button only if isNextEnabled is true
            >
              Next
            </Button>
          </Box>

          {/* Modal for score and congratulatory message
          <Dialog open={openModal} onClose={() => setOpenModal(false)}>
            <Box sx={{ padding: 4, textAlign: "center" }}>
              <Typography variant="h6">Congratulations!</Typography>
              <Typography variant="body1">Your score: {score} 🎉</Typography>
            </Box>
          </Dialog> */}
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
          title="Aim Master"
          rating=""
        />
      )}
    </>
  );
};

const styles = {
  container: {
    height: "500px",
    width: "100%",
    position: "relative",
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    marginBottom: "10px",
  },
  timer: {
    margin: "10px 0",
  },
  startButton: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  dotContainer: {
    position: "relative",
    height: "100%",
    width: "100%",
  },
  dot: {
    position: "absolute",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "red",
    cursor: "pointer",
    transition: "transform 0.2s ease, background-color 0.2s",
    animation: "dotAnimation 0.5s ease-out forwards", // Add animation
  },
};

export default BetterAimGame2;
