import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Typography,
  Box,
  Dialog,
  Grid,
} from "@mui/material";
import global1 from "./global1";
import FinalGamePage from "./FinalGamePage";

// Global data here
//const username = global1.name;
const registerNo = global1.regno;
const avatarImg = global1.profileImage; // global1 profile pic here


const name = global1.name;
const regno = global1.regno;

const t1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-5-2518-output-onlinegiftools.gif";

const t2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-5-260-rabbit-eating%EF%BF%BCcarrot.gif";

const r2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-5-2256-r2-removebg-preview.png";

const bgimg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-5-2128-blank-nature-park-landscape-at-daytime-scene-with-many-tree-background-free-vector.jpg";

const bgimg2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-5-592-second-bg1.png";

const bgimg3 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-7-2848-bg3_three.png";

const woodboard =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-5-2031-wood_board_-removebg-preview.png";

const finishLine = 1600; // Set a fixed width for the finish line

const RaceGame = () => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [turtlePosition, setTurtlePosition] = useState(0);
  const [rabbitPosition, setRabbitPosition] = useState(0);
  const [raceOver, setRaceOver] = useState(false);
  const [winner, setWinner] = useState("");
  const [isRabbitPaused, setIsRabbitPaused] = useState(false);
  const [pauseIndex, setPauseIndex] = useState(0); // Track current pause index
  const [lastRabbitSpeed, setLastRabbitSpeed] = useState(0);
  const [rabbitImage, setRabbitImage] = useState(t1); // Track rabbit image
  const [raceStarted, setRaceStarted] = useState(false); // Track if the race has started
  const [openDialog, setOpenDialog] = useState(false); // Control dialog visibility

  // Game Objective
  const objective =
    "Dive into the excitement of the Turtle and Rabbit Race! Experience the thrill of friendly competition as you guide your turtle to victory against the speedy rabbit. With each level, the stakes rise, and your skills are put to the test! Enjoy vibrant backgrounds, engaging challenges, and the satisfaction of strategic gameplay. Will you claim the title of champion? Join the race and find out! 🐢🏁🐇";

  const resetRace = () => {
    setTurtlePosition(0);
    setRabbitPosition(0);
    setRaceOver(false);
    setWinner("");
    setIsRabbitPaused(false);
    setPauseIndex(0); // Reset pause index
    setLastRabbitSpeed(0);
    setRabbitImage(t1); // Reset to original image
    setRaceStarted(false); // Reset race started state
    setOpenDialog(false); // Close the dialog
  };

  const startRace = () => {
    setRaceStarted(true); // Set race to started
  };

  // // Function to handle keyboard events
  // const handleKeyDown = (event) => {
  //   if (event.key === "ArrowRight" || event.key === " ") {
  //     advanceTurtle();
  //   }
  // };

  // // Add event listener for keydown
  // useEffect(() => {
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  const advanceTurtle = () => {
    if (!raceOver) {
      setTurtlePosition((prev) =>
        Math.min(prev + Math.random() * 10, finishLine)
      );
    }
  };

  const advanceRabbit = () => {
    if (!isRabbitPaused && !raceOver) {
      const randomSpeed = Math.random() * 15;
      setLastRabbitSpeed(randomSpeed);
      setRabbitPosition((prev) => {
        const newPosition = Math.min(prev + randomSpeed, finishLine);

        // Define stopping points based on level
        const stoppingPoints =
          level === 1
            ? [300, 700, 950] // Level 1: 3 stops
            : level === 2
            ? [300, 700] // Level 2: 2 stops
            : [300]; // Level 3: 1 stop

        // Check if the rabbit should pause at the next stopping point
        if (
          pauseIndex < stoppingPoints.length &&
          newPosition >= stoppingPoints[pauseIndex]
        ) {
          setIsRabbitPaused(true);
          setRabbitImage(t2); // Change image to paused image
        }

        return newPosition;
      });
    }
  };

  useEffect(() => {
    // Determine if there is a winner
    if (turtlePosition >= finishLine && rabbitPosition >= finishLine) {
      setRaceOver(true);
      setWinner("It's a tie!");
    } else if (turtlePosition >= finishLine) {
      setRaceOver(true);
      setWinner("Turtle wins!");
    } else if (rabbitPosition >= finishLine) {
      setRaceOver(true);
      setWinner("Rabbit wins!");
    }
  }, [turtlePosition, rabbitPosition]);

  useEffect(() => {
    let interval;

    if (isRabbitPaused) {
      interval = setTimeout(() => {
        setIsRabbitPaused(false); // Resume rabbit movement after 10 seconds
        setRabbitImage(t1); // Revert back to original image
        setPauseIndex((prev) => prev + 1); // Move to the next pause index
      }, 10000); // Pause for 10 seconds
    }

    return () => clearTimeout(interval);
  }, [isRabbitPaused]);

  useEffect(() => {
    const rabbitInterval = setInterval(() => {
      if (raceStarted && !raceOver) {
        // Ensure race is running
        advanceRabbit();
      }
    }, 200); // Rabbit moves every 200ms

    return () => clearInterval(rabbitInterval);
  }, [isRabbitPaused, raceStarted, raceOver]); // Include raceOver to stop interval

  //   Handle for next level
  const handleClickNext1 = () => {
    setLevel((prev) => prev + 1);
    if (winner === "Turtle wins!") {
      setScore((prev) => prev + 30);
    }
    setTurtlePosition(0);
    setRabbitPosition(0);
    setRaceOver(false);
    setWinner("");
    setIsRabbitPaused(false);
    setPauseIndex(0); // Reset pause index
    setLastRabbitSpeed(0);
    setRabbitImage(t1); // Reset to original image
    setRaceStarted(false); // Reset race started state
    setOpenDialog(false); // Close the dialog
  };

  //   Handle for next level
  const handleClickNext2 = () => {
    setLevel((prev) => prev + 1);
    if (winner === "Turtle wins!") {
      setScore((prev) => prev + 30);
    }
    setTurtlePosition(0);
    setRabbitPosition(0);
    setRaceOver(false);
    setWinner("");
    setIsRabbitPaused(false);
    setPauseIndex(0); // Reset pause index
    setLastRabbitSpeed(0);
    setRabbitImage(t1); // Reset to original image
    setRaceStarted(false); // Reset race started state
    setOpenDialog(false); // Close the dialog
  };

  //   Handle for next level
  const handleClickNext3 = () => {
    setLevel((prev) => prev + 1);
    if (winner === "Turtle wins!") {
      setScore((prev) => prev + 40);
    }
    setTurtlePosition(0);
    setRabbitPosition(0);
    setRaceOver(false);
    setWinner("");
    setIsRabbitPaused(false);
    setPauseIndex(0); // Reset pause index
    setLastRabbitSpeed(0);
    setRabbitImage(t1); // Reset to original image
    setRaceStarted(false); // Reset race started state
    setOpenDialog(false); // Close the dialog
    setIsFinished(true);
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
          <Grid container>
            <Grid
              item
              md={6}
              xs={12}
              sx={{
                display: "grid",
                placeItems: "center",
              }}
            >
              <Box
                sx={{ width: "400px", height: "auto", position: "relative" }}
              >
                <img
                  src={woodboard}
                  alt="board"
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "cover",
                  }}
                />
                <Typography
                  gutterBottom
                  color="#000000"
                  sx={{
                    fontFamily: "Spicy Rice, serif",
                    fontWeight: 400,
                    fontSize: "1.8rem",
                    position: "absolute",
                    top: "230px",
                    left: "50px",
                  }}
                >
                  Turtle and Rabbit Race
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
              sx={{
                display: "grid",
                placeItems: "center",
              }}
            >
              <Button
                variant="contained"
                color="success"
                onClick={() => setLevel((prev) => prev + 1)}
              >
                Play Game
              </Button>
            </Grid>
          </Grid>
        </Container>
      )}

      {!isFinished && level === 1 && (
        <Box sx={{ width: "100%", height: "100vh", position: "relative" }}>
          <img
            src={bgimg}
            alt="background_image"
            style={{ width: "100%", height: "100%" }}
          />

          <Container
            maxWidth="xll"
            style={{
              textAlign: "center",
              marginTop: "20px",
              position: "absolute",
              bottom: 0,
            }}
          >
            <Box sx={{ position: "relative", height: "150px", mb: 4 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: `${turtlePosition}px`,
                  bottom: "80px",
                  transition: "left 0.2s",
                }}
              >
                <img src={r2} alt="Turtle" style={{ width: "100px" }} />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: `${rabbitPosition}px`,
                  bottom: "0",
                  transition: "left 0.2s",
                }}
              >
                <img
                  src={rabbitImage}
                  alt="Rabbit"
                  style={{ width: "100px" }}
                />
              </Box>
            </Box>

            <Box sx={{ margin: "10px" }}>
              {!raceStarted && ( // Show the start button if race hasn't started
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startRace}
                  style={{ marginRight: "10px" }}
                >
                  Start Race
                </Button>
              )}

              {raceOver ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setOpenDialog(true)}
                  style={{ marginTop: "0px" }}
                >
                  Show Result
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={advanceTurtle}
                  disabled={raceOver || !raceStarted} // Disable button if race hasn't started or is over
                >
                  Move Turtle
                </Button>
              )}
            </Box>

            {raceOver && (
              <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <Box sx={{ padding: 2 }}>
                  <Typography
                    gutterBottom
                    color="#00FF00"
                    sx={{
                      fontFamily: "Spicy Rice, serif",
                      fontWeight: 100,
                      fontSize: "2rem",
                      letterSpacing: 1.5,
                    }}
                  >
                    Turtle and Rabbit Race
                  </Typography>
                  <Typography
                    textAlign="center"
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "1.5rem",
                    }}
                  >
                    {winner}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={resetRace}
                      style={{ marginTop: "10px" }}
                    >
                      Restart Race
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleClickNext1}
                      style={{ marginTop: "10px", marginLeft: "10px" }}
                    >
                      Next Level
                    </Button>
                  </Box>
                </Box>
              </Dialog>
            )}
          </Container>
        </Box>
      )}

      {!isFinished && level === 2 && (
        <Box sx={{ width: "100%", height: "100vh", position: "relative" }}>
          <img
            src={bgimg2}
            alt="background_image"
            style={{ width: "100%", height: "100%" }}
          />

          <Container
            maxWidth="xll"
            style={{
              textAlign: "center",
              marginTop: "20px",
              position: "absolute",
              bottom: 0,
            }}
          >
            <Box sx={{ position: "relative", height: "150px", mb: 4 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: `${turtlePosition}px`,
                  bottom: "80px",
                  transition: "left 0.2s",
                }}
              >
                <img src={r2} alt="Turtle" style={{ width: "100px" }} />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: `${rabbitPosition}px`,
                  bottom: "0",
                  transition: "left 0.2s",
                }}
              >
                <img
                  src={rabbitImage}
                  alt="Rabbit"
                  style={{ width: "100px" }}
                />
              </Box>
            </Box>

            <Box sx={{ margin: "10px" }}>
              {!raceStarted && ( // Show the start button if race hasn't started
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startRace}
                  style={{ marginRight: "10px" }}
                >
                  Start Race
                </Button>
              )}

              {raceOver ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setOpenDialog(true)}
                  style={{ marginTop: "0px" }}
                >
                  Show Result
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={advanceTurtle}
                  disabled={raceOver || !raceStarted} // Disable button if race hasn't started or is over
                >
                  Move Turtle
                </Button>
              )}
            </Box>

            {raceOver && (
              <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <Box sx={{ padding: 2 }}>
                  <Typography
                    gutterBottom
                    color="#00FF00"
                    sx={{
                      fontFamily: "Spicy Rice, serif",
                      fontWeight: 100,
                      fontSize: "2rem",
                      letterSpacing: 1.5,
                    }}
                  >
                    Turtle and Rabbit Race
                  </Typography>
                  <Typography
                    textAlign="center"
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "1.5rem",
                    }}
                  >
                    {winner}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={resetRace}
                      style={{ marginTop: "10px" }}
                    >
                      Restart Race
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleClickNext2}
                      style={{ marginTop: "10px", marginLeft: "10px" }}
                    >
                      Next Level
                    </Button>
                  </Box>
                </Box>
              </Dialog>
            )}
          </Container>
        </Box>
      )}

      {!isFinished && level === 3 && (
        <Box sx={{ width: "100%", height: "100vh", position: "relative" }}>
          <img
            src={bgimg3}
            alt="background_image"
            style={{ width: "100%", height: "100%" }}
          />

          <Container
            maxWidth="xll"
            style={{
              textAlign: "center",
              marginTop: "20px",
              position: "absolute",
              bottom: 0,
            }}
          >
            <Box sx={{ position: "relative", height: "150px", mb: 4 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: `${turtlePosition}px`,
                  bottom: "80px",
                  transition: "left 0.2s",
                }}
              >
                <img src={r2} alt="Turtle" style={{ width: "100px" }} />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: `${rabbitPosition}px`,
                  bottom: "0",
                  transition: "left 0.2s",
                }}
              >
                <img
                  src={rabbitImage}
                  alt="Rabbit"
                  style={{ width: "100px" }}
                />
              </Box>
            </Box>

            <Box sx={{ margin: "10px" }}>
              {!raceStarted && ( // Show the start button if race hasn't started
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startRace}
                  style={{ marginRight: "10px" }}
                >
                  Start Race
                </Button>
              )}

              {raceOver ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setOpenDialog(true)}
                  style={{ marginTop: "0px" }}
                >
                  Show Result
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={advanceTurtle}
                  disabled={raceOver || !raceStarted} // Disable button if race hasn't started or is over
                >
                  Move Turtle
                </Button>
              )}
            </Box>

            {raceOver && (
              <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <Box sx={{ padding: 2 }}>
                  <Typography
                    gutterBottom
                    color="#00FF00"
                    sx={{
                      fontFamily: "Spicy Rice, serif",
                      fontWeight: 100,
                      fontSize: "2rem",
                      letterSpacing: 1.5,
                    }}
                  >
                    Turtle and Rabbit Race
                  </Typography>
                  <Typography
                    textAlign="center"
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "1.5rem",
                    }}
                  >
                    {winner}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={resetRace}
                      style={{ marginTop: "10px" }}
                    >
                      Restart Race
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleClickNext3}
                      style={{ marginTop: "10px", marginLeft: "10px" }}
                    >
                      Finish
                    </Button>
                  </Box>
                </Box>
              </Dialog>
            )}
          </Container>
        </Box>
      )}

      {/* Finish Screen */}
      {isFinished && (
        <FinalGamePage
          username={name}
          regno={regno}
          profileImg={avatarImg}
          objective={objective}
          score={score}
          title="Turtle and Rabbit Race"
          rating=""
        />
      )}
    </>
  );
};

export default RaceGame;
