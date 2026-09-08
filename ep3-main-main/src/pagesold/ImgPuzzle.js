import React, { useState, useEffect } from "react";
import { JigsawPuzzle } from "react-jigsaw-puzzle/lib";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import styles from "../virtuallabcss/Puzzle.module.css";
import global1 from "./global1";
import { Box, Container } from "@mui/system";
import { Button, Typography, Modal } from "@mui/material";
import FinalGamePage from "./FinalGamePage";

// const avatarImg =
//   "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/50dab922-5d48-4c6b-8725-7fd0755d9334/3a3f2d35-8167-4708-9ef0-bdaa980989f9.png";

const screenImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-8-4435-screen-1.png";
const img =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-8-4246-FindDiff.png";
const img2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-8-4227-bg3.jpg";
const img3 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-8-4330-FindDiff3.png";
const img4 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-8-437-FindDiff2.png";
const img5 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-8-4352-FindDiff4.png";
const img6 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-8-4412-FindDiff5.png";

// Global data here
const username = global1.name;
const registerNo = global1.regno;
const avatarImg = global1.profileImage; // global1 profile pic

const name = global1.name;
const regno = global1.regno;

function ImgPuzzle() {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [title, setTitle] = useState("Unpuzzle the pieces!");
  const [isSolved, setIsSolved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // Initial timer
  const [openModal, setOpenModal] = useState(false);

  // Game Objective
  const objective =
    "The game enhances cognitive skills like problem-solving and spatial awareness while providing an engaging and fun experience. It may become repetitive for some players, and the time pressure could induce stress rather than enjoyment. The game is a jigsaw puzzle challenge that consists of 8 levels, each with a specific time limit and increasing difficulty. Players earn points based on their performance and must complete the puzzles to advance; finishing all levels displays their final score and allows for a replay.";

  // Timer duration for each level
  const timerDuration = [30, 50, 80, 120, 180, 270, 360, 400]; // Timer for each level

  useEffect(() => {
    if (level > 0) {
      setTimeLeft(timerDuration[level - 1]); // Reset timer for current level
    }
  }, [level]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setOpenModal(true); // Open modal when time runs out
      return; // Exit early if time is out
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup the interval
  }, [timeLeft]);

  const handleNextLevel = () => {
    if (isSolved) {
      const points = level > 6 ? 20 : 10; // Dynamic points based on level
      setScore((prev) => prev + points);
      setIsSolved(false);
      if (level < 8) {
        setLevel((prev) => prev + 1); // Increment level if less than 8
      } else {
        setIsFinished(true); // Show final screen if level is 8
      }
      setTitle("Unpuzzle the pieces!");
    }
  };

  // const handleRestart = () => {
  //   setOpenModal(false);
  //   setTimeLeft(timerDuration[level - 1]); // Reset to the current level's timer
  // };

  return (
    <>
      {/* Modal for timer expiration */}
      {level > 0 && (
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{ ...modalStyle }}>
            <Typography variant="h6" textAlign="center">
              Time's Up!
            </Typography>
            {/* <Button onClick={handleRestart}>Restart Level</Button> */}
            <Button onClick={() => window.location.reload()} color="secondary">
              Restart Again
            </Button>
          </Box>
        </Modal>
      )}

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
            Student name: {name}
            <br />
            Reg no: {regno}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            Score: {score} {level > 0 && `| Time Left: ${timeLeft}s`}
          </Typography>
        </Container>
      )}

      {/* Game Levels */}
      {level === 0 && (
        <Container>
          <Box sx={{ width: "100%", position: "relative" }}>
            <img
              src={screenImg}
              className="hover-image"
              style={{ width: "100%", transition: "filter 0.3s ease" }}
              alt="screen-demo"
            />
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#fff",
              }}
            >
              <Typography variant="h6">Unpuzzle the pieces of image</Typography>
              <Button
                variant="contained"
                onClick={() => setLevel((prev) => prev + 1)}
                sx={{ left: "32%" }}
              >
                Play Game
              </Button>
            </Box>
          </Box>
        </Container>
      )}

      {/* Puzzle Components */}
      {!isFinished && level > 0 && level <= 8 && (
        <Container>
          <h2 className={styles.tag}>{title}</h2>
          <Box
            sx={{
              boxShadow:
                "rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px",
              borderRadius: "5px",
              width: "100%",
            }}
          >
            <JigsawPuzzle
              imageSrc={
                level === 1
                  ? img
                  : level === 2
                  ? img2
                  : level === 3
                  ? img3
                  : level === 4
                  ? img4
                  : level === 5
                  ? img5
                  : img6
              }
              rows={level + 1}
              columns={level + 1}
              onSolved={() => setIsSolved(true)}
              className={styles.jigsawPuzzle}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <Button onClick={handleNextLevel}>Next Level {level + 1}</Button>
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
          title="Unpuzzle the pieces of image"
          rating=""
        />
      )}

      <style>
        {`
        .hover-image {
          filter: brightness(100%);
        }
        .hover-image:hover {
          filter: brightness(50%);
        }
      `}
      </style>
    </>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffcccb",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

export default ImgPuzzle;
