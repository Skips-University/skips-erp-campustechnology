import { Box, Button, Container, Grid, Typography } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import global1 from "./global1";
import FinalGamePage from "./FinalGamePage";

const imgScreen = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-17-3818-m1.jpg";
const img2 = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-17-3836-m2.jpg";

// Global data here
const name = global1.name;
const regno = global1.regno;
const avatarImg = global1.profileImage; // global1 profile pic here

const COLS = 10;
const ROWS = 20;

const SHAPES = [
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "blue",
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "green",
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "red",
  },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "yellow",
  },
  { shape: [[1, 1, 1, 1]], color: "cyan" },
];

const createEmptyScene = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const useInterval = (callback, delay) => {
  const callbackRef = useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const interval = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(interval);
  }, [delay]);
};

// Random shape function
const randomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];

const TetrisGame = () => {
  const [level, setLevel] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [scene, setScene] = useState(createEmptyScene());
  const [shape, setShape] = useState(randomShape());
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rowsToClear, setRowsToClear] = useState(10);

  const startGame = () => {
    setScene(createEmptyScene());
    setGameOver(false);
    setGameComplete(false);
    setRowsToClear(10);
    spawnNewShape();
  };

  const spawnNewShape = () => {
    const newShape = randomShape();
    setShape(newShape);
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
  };

  const mergeIntoScene = (scene, shape, position) => {
    shape.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          scene[position.y + y][position.x + x] = shape.color;
        }
      });
    });
    return scene;
  };

  const clearFullRows = (scene) => {
    const newScene = scene.filter((row) => row.some((cell) => cell === null));
    const clearedRows = ROWS - newScene.length;

    // Add empty rows at the top
    for (let i = 0; i < clearedRows; i++) {
      newScene.unshift(Array(COLS).fill(null));
    }

    if (clearedRows > 0) {
      setRowsToClear((prevCount) => Math.max(0, prevCount - clearedRows));
      setScore((prev) => Math.min(prev + 10, 100));
    }

    return newScene;
  };

  const checkGameComplete = (scene) => {
    return scene[0].some((cell) => cell !== null);
  };

  const moveShape = (dx, dy) => {
    const newPosition = { x: position.x + dx, y: position.y + dy };
    if (!collides(newPosition)) {
      setPosition(newPosition);
    } else if (dy > 0) {
      // Fix the piece in place
      const updatedScene = mergeIntoScene(scene, shape, position);
      const clearedScene = clearFullRows(updatedScene);
      setScene(clearedScene);
      spawnNewShape();
      if (checkGameComplete(clearedScene)) {
        alert("Game Over! You hit the top!");
        setGameOver(true);
      }
      if (rowsToClear <= 0) {
        alert("You Win!");
        setGameComplete(true);
        setGameOver(true);
      }
    }
  };

  const rotateShape = () => {
    const rotatedShape = {
      ...shape,
      shape: shape.shape[0].map((val, index) =>
        shape.shape.map((row) => row[index]).reverse()
      ),
    };
    if (!collides(position, rotatedShape)) {
      setShape(rotatedShape);
    }
  };

  const collides = (newPosition, newShape = shape) => {
    return newShape.shape.some((row, y) =>
      row.some((value, x) => {
        if (value) {
          const newX = newPosition.x + x;
          const newY = newPosition.y + y;
          return (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && scene[newY][newX])
          );
        }
        return false;
      })
    );
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          moveShape(-1, 0);
          break;
        case "ArrowRight":
          moveShape(1, 0);
          break;
        case "ArrowDown":
          moveShape(0, 1);
          break;
        case "ArrowUp":
          rotateShape();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [scene, shape, position]);

  useInterval(() => {
    if (!gameOver) {
      moveShape(0, 1); // Move shape down
    }
  }, 600);

  const handleNext = () => {
    if (score > 40) {
      setIsFinished(true);
      setLevel((pev) => pev + 1);
    } else {
      alert("You should play the game first and get 50 score to go next.");
    }
  };

  return (
    <>
      {/* Header and Score */}
      {!isFinished && (
        <Typography
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mx: "15%",
            my: "20px",
            // backgroundColor: "red",
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Student: {name}
            <br />
            Register no: {regno}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            Score: {score}
          </Typography>
        </Typography>
      )}

      {/* Game Levels */}
      {level === 0 && <StartGame toggle={() => setLevel((pev) => pev + 1)} />}

      {!isFinished && level === 1 && (
        <Container>
          <Grid container>
            <Grid item md={6}>
              <div className="tetris-container">
                <style>
                  {`
          .tetris-container {
            position: relative;
            width: 300px;
            height: 605px;
            border: 2px solid #333;
            margin: 0 auto;
            background-color: #f0f0f0;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            font-family: 'Arial', sans-serif;
          }

          .tetris-row {
            display: flex;
          }

          .tetris-cell {
            width: 30px;
            height: 30px;
            border: 1px solid #ddd;
            transition: background-color 0.2s;
          }

          .tetris-cell:hover {
            background-color: #e0e0e0;
          }

          .current-shape {
            position: absolute;
            width: 30px;
            height: 30px;
            border: 1px solid #333;
            transition: background-color 0.2s;
          }

          .start-button {
            // position: absolute;
            // bottom: 10px;
            margin-top: 20px;
            margin-left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            font-size: 16px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          .start-button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }

          .start-button:hover:not(:disabled) {
            background-color: #218838;
          }

          .game-over {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            color: red;
            font-weight: bold;
          }
        `}
                </style>
                {/* Render the scene */}
                {scene.map((row, rowIndex) => (
                  <div key={rowIndex} className="tetris-row">
                    {row.map((cell, colIndex) => (
                      <div
                        key={colIndex}
                        className="tetris-cell"
                        style={{
                          backgroundColor: cell ? cell : "white",
                        }}
                      />
                    ))}
                  </div>
                ))}
                {/* Render the current falling shape */}
                {shape.shape.map((row, y) =>
                  row.map((value, x) => {
                    if (value) {
                      const shapeX = position.x + x;
                      const shapeY = position.y + y;
                      return (
                        <div
                          key={`${shapeX}-${shapeY}`}
                          className="current-shape"
                          style={{
                            left: shapeX * 30,
                            top: shapeY * 30,
                            backgroundColor: shape.color,
                          }}
                        />
                      );
                    }
                    return null;
                  })
                )}
                {/* Display Game Over message when the game is complete */}
                {gameOver && <div className="game-over">Game Over!</div>}
              </div>
              <div>
                {" "}
                <button
                  onClick={startGame}
                  disabled={!gameOver}
                  className="start-button"
                >
                  Start Game
                </button>
              </div>
            </Grid>
            <Grid item md={6}>
              <div style={{ position: "relative" }}>
                {/* Display rows left to clear */}

                <img
                  src={img2}
                  alt="img2"
                  style={{ width: "100%", height: "600px" }}
                />
                {!gameOver && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      fontSize: "18px",
                      color: "#00FF00",
                      fontWeight: "bold",
                    }}
                  >
                    Rows to Clear: {rowsToClear}
                  </div>
                )}
              </div>
            </Grid>
          </Grid>
          <Box textAlign="end">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowRules((prev) => !prev)}
              sx={{ mx: 2 }}
            >
              {showRules ? "Hide" : "Show"} Rules
            </Button>
            <Button variant="outlined" onClick={handleNext}>
              Next
            </Button>
          </Box>
          <Box sx={{ margin: "20px" }}>{showRules && <Rules />}</Box>
        </Container>
      )}

      {/* Finish Screen */}
      {isFinished && (
        <FinalGamePage
          username={name}
          regno={regno}
          profileImg={avatarImg}
          objective="Playing Tetris is not just a fun experience; it also offers fantastic cognitive benefits! 🧠✨ This classic game sharpens your problem-solving skills and enhances spatial awareness as you strategize to clear rows. 🔄 Plus, it promotes quick decision-making and improves hand-eye coordination, making it both entertaining and a great mental workout! 🎮💪 Dive into Tetris to challenge yourself and enjoy the satisfaction of mastering each step! 🎉"
          score={score}
          title="Tetris Game"
          rating=""
        />
      )}
    </>
  );
};

const StartGame = ({ toggle }) => (
  <Container>
    <div
      style={{
        maxWidth: "1180px",
        height: "700px",
        display: "flex",
        margin: "0 auto",
        alignItems: "center",
      }}
    >
      <img
        src={imgScreen}
        alt="dices"
        style={{ width: "550px", height: "530px" }}
      />
      <div style={{ marginLeft: "25px" }}>
        {" "}
        <h1 style={{ fontSize: "96px", whiteSpace: "nowrap" }}>Tetris Game</h1>
        <Button variant="outlined" onClick={toggle}>
          Play Now
        </Button>
      </div>
    </div>
  </Container>
);

const Rules = () => (
  <div
    style={{
      maxWidth: "800px",
      margin: "0 auto",
      backgroundColor: "#fbf1f1",
      padding: "20px",
      marginTop: "40px",
      borderRadius: "10px",
    }}
  >
    <h2 style={{ fontSize: "24px" }}>How to play tetris game</h2>
    <div style={{ marginTop: "24px", paddingLeft: "20px" }}>
      <div className="instructions">
        <h2>Welcome to Tetris!</h2>

        <p>
          <strong>Get Started:</strong>
        </p>
        <ul>
          <li>
            <strong>Click the "Start Game" Button:</strong> Begin your Tetris
            journey by clicking the "Start Game" button. This will initialize
            the game and prepare your first falling shape!
          </li>
        </ul>

        <p>
          <strong>Objective:</strong>
        </p>
        <ul>
          <li>
            <strong>Clear Rows:</strong> Your goal is to clear a total of{" "}
            <strong>10 rows</strong> during the game. As you play, you’ll see a
            counter on the right indicating how many rows you have left to
            clear.
          </li>
        </ul>

        <p>
          <strong>Game Mechanics:</strong>
        </p>
        <ul>
          <li>
            <strong>Game Over Condition:</strong> If any blocks reach the top of
            the game area, it’s game over! Don’t worry—if that happens, you can
            click the "Next" button to see your final score and stats.
          </li>
        </ul>

        <p>
          <strong>Scoring:</strong>
        </p>
        <ul>
          <li>
            <strong>Aim for a High Score:</strong> Clearing 10 rows will
            significantly boost your score. The more rows you clear, the better
            your score will be, so keep an eye on your strategy!
          </li>
        </ul>

        <p>
          <strong>Tips for Success:</strong>
        </p>
        <ul>
          <li>
            <strong>Stay Focused:</strong> Pay attention to the shapes falling
            and think ahead about where you want to place them.
          </li>
          <li>
            <strong>Utilize Rotations:</strong> Don’t forget to rotate shapes to
            fit them perfectly into gaps!
          </li>
        </ul>

        <p>
          <strong>Enjoy the Challenge!</strong> Have fun, and may the best
          player win!
        </p>
      </div>
    </div>
  </div>
);

export default TetrisGame;
