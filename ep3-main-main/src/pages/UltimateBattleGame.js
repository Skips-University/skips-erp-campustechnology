import React, { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  List,
  Container,
} from "@mui/material";
import global1 from "./global1";
import FinalGamePage from "./FinalGamePage";

// Global data here
const username = global1.name;
const registerNo = global1.regno;
const avatarImg = global1.profileImage; // global1 profile pic here

function Square({ value, onSquareClick, color, isWinningSquare }) {
  return (
    <Button
      variant="contained"
      onClick={onSquareClick}
      style={{
        width: "60px",
        height: "60px",
        fontSize: "24px",
        fontWeight: "bold",
        color: color,
        backgroundColor: isWinningSquare ? "#00FF00" : "#e0e0e0",
        border: "2px solid #ccc",
        margin: "5px",
      }}
    >
      {value}
    </Button>
  );
}

function Board({ xIsNext, squares, onPlay, player1, player2 }) {
  const winner = calculateWinner(squares);
  const status = winner
    ? `${winner === "X" ? player1 : player2} Wins!`
    : `Next player: ${xIsNext ? player1 : player2}`;

  const winningSquares = winner ? calculateWinningSquares(squares) : [];
  const isTie = !winner && squares.every((square) => square !== null);

  if (isTie) {
    alert("It's a tie! Play again.");
    return null; // Return null to prevent rendering the board after tie alert
  }

  return (
    <Box textAlign="center">
      <Typography variant="h6" gutterBottom>
        {status}
      </Typography>
      <Box display="flex">
        {[0, 1, 2].map((i) => (
          <Square
            key={i}
            value={squares[i]}
            onSquareClick={() => handleClick(i)}
            color={getSquareColor(squares[i])}
            isWinningSquare={winningSquares.includes(i)}
          />
        ))}
      </Box>
      <Box display="flex">
        {[3, 4, 5].map((i) => (
          <Square
            key={i}
            value={squares[i]}
            onSquareClick={() => handleClick(i)}
            color={getSquareColor(squares[i])}
            isWinningSquare={winningSquares.includes(i)}
          />
        ))}
      </Box>
      <Box display="flex">
        {[6, 7, 8].map((i) => (
          <Square
            key={i}
            value={squares[i]}
            onSquareClick={() => handleClick(i)}
            color={getSquareColor(squares[i])}
            isWinningSquare={winningSquares.includes(i)}
          />
        ))}
      </Box>
    </Box>
  );

  function handleClick(i) {
    if (winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  function getSquareColor(value) {
    if (value === "X") return "#0000FF";
    if (value === "O") return "#FF0000";
    return "#333";
  }
}

export default function UltimateBattleGame() {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false); // State for Next button
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const objective =
    'Dive into "X vs O: The Ultimate Battle" 🎮, where strategy meets fun in a classic showdown of Tic-Tac-Toe! Challenge your friends or family 👨‍👩‍👧‍👦 in a competitive environment while honing your critical thinking skills 🧠. With vibrant visuals and engaging gameplay, every match is a new opportunity to outsmart your opponent 🥳. Plus, with random score rewards for wins and ties, the excitement never ends! 🎉';

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const winner = calculateWinner(nextSquares);
    const isTie = !winner && nextSquares.every((square) => square !== null);

    // Enable Next button if there's a winner or a tie
    setIsNextEnabled(winner || isTie);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const startGame = () => {
    if (player1 && player2) {
      setIsGameStarted(true);
      setHistory([Array(9).fill(null)]);
      setCurrentMove(0);
      setIsNextEnabled(false); // Reset Next button when starting a new game
    }
  };

  // Handle to play again
  const handleToPlayAgain = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setIsNextEnabled(false); // Reset button state
    setIsFinished(false); // Reset finish state
  };

  // Handle for next button
  const handleNext = () => {
    const winner = calculateWinner(currentSquares);
    const isTie = !winner && currentSquares.every((square) => square !== null);

    if (winner) {
      const randomScore = Math.floor(Math.random() * 11) + 90; // Random number between 90 and 100
      setScore(randomScore);
    } else if (isTie) {
      const randomScore = Math.floor(Math.random() * 21) + 20; // Random number between 20 and 40
      setScore(randomScore);
    }

    setIsFinished(true);
    setLevel((prev) => prev + 1);
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
            Username: {username}
            <br />
            Register no: {registerNo}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            Score: {score}
          </Typography>
          {/* <Typography variant="h5" fontWeight="bold">
            Time Left: {Math.floor(timer / 60)}:{("0" + (timer % 60)).slice(-2)}
          </Typography> */}
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
              <Typography variant="h4" sx={{ mb: "20px", fontWeight: 800 }}>
                X vs O: The Ultimate Battle
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
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          bgcolor="white"
          borderRadius="8px"
          p={2}
        >
          {!isGameStarted ? (
            <Box mb={2}>
              <Typography
                variant="h4"
                textAlign="center"
                sx={{ mb: "20px", fontWeight: 800 }}
              >
                X vs O: The Ultimate Battle
              </Typography>
              <Typography variant="h5" sx={{ mb: "10px" }}>
                Enter Player Names
              </Typography>
              <TextField
                label="Player 1 (X)"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                variant="outlined"
                style={{ marginRight: "10px" }}
              />
              <TextField
                label="Player 2 (O)"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                variant="outlined"
                style={{ marginRight: "10px" }}
              />
              <Button variant="contained" onClick={startGame}>
                Start Game
              </Button>
            </Box>
          ) : (
            <>
              <Box mb={2}>
                <Board
                  xIsNext={xIsNext}
                  squares={currentSquares}
                  onPlay={handlePlay}
                  player1={player1}
                  player2={player2}
                />
              </Box>
              <List style={{ padding: 0 }}>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={handleToPlayAgain}
                    sx={{ mx: 1 }}
                  >
                    Play again
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleNext}
                    disabled={!isNextEnabled}
                  >
                    Next
                  </Button>
                </Box>
              </List>
            </>
          )}
        </Box>
      )}

      {/* Finish Screen */}
      {isFinished && (
        <FinalGamePage
          username={username}
          regno={registerNo}
          profileImg={avatarImg}
          objective={objective}
          score={score}
          title="X vs O: The Ultimate Battle"
          rating=""
        />
      )}
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function calculateWinningSquares(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c]; // Return the winning squares
    }
  }
  return [];
}
