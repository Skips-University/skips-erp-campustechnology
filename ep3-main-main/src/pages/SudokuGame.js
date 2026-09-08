import React, { useEffect, useState } from 'react';
import { Grid, Container, Button, Typography, Box } from '@mui/material';
import global1 from "../pages/global1";
import FinalGamePage from './FinalGamePage';

const initialBoard = [
  [6, 3, 1, 5, 9, 8, 7, 2, ''],
  [5, '', 9, 3, '', '', 8, '', ''],
  [8, '', 2, '', 6, 1, '', '', 5],
  [7, 9, 4, '', 8, 3, 1, '', ''],
  ['', 5, 6, 9, 4, '', '', '', 3],
  [3, '', '', 6, '', 1, 4, 9, ''],
  [9, '', '', '', 3, 7, '', '', 8],
  ['', 8, '', '', 9, '', 9, 3, 7],
  [4, '', 5, '', 3, 6, 9, '', 2]
];

const solvedBoard = [
  [6, 3, 1, 5, 9, 8, 7, 2, 4],
  [5, 4, 9, 3, 7, 2, 8, 6, 1],
  [8, 7, 2, 4, 6, 1, 3, 9, 5],
  [7, 9, 4, 2, 8, 3, 1, 5, 6],
  [1, 5, 6, 9, 4, 7, 2, 8, 3],
  [3, 2, 8, 6, 5, 1, 4, 9, 7],
  [9, 6, 3, 7, 2, 4, 5, 1, 8],
  [2, 8, 7, 1, 9, 5, 6, 4, 3],
  [4, 1, 5, 8, 3, 6, 9, 7, 2]
];

// Timer component to handle countdown
function Timer({ time, setTime, timerActive, endGame }) {
  useEffect(() => {
    let interval = null;
    if (timerActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      endGame(); // Call endGame when the timer hits 0
    }

    return () => {
      clearInterval(interval);
    };
  }, [timerActive, time]);

  return <Typography variant="h6">Time Left: {Math.floor(time / 60)}:{("0" + (time % 60)).slice(-2)} mins</Typography>;
}

const SudokuGame = () => {
  const username = global1.name;
  const regno = global1.regno;
  const profileImg = global1.profileImage;

  const [board, setBoard] = useState(initialBoard);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [hintCount, setHintCount] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [time, setTime] = useState(360);
  const [timerActive, setTimerActive] = useState(false);
  const [rating, setRating ] = useState("");


  let title = "Sudoku Game";
  let objective = "Sudoku is a logic-based puzzle where the objective is to fill a 9x9 grid so that each row, column, and 3x3 sub-grid contains the numbers 1 to 9 without repetition. The game enhances logical thinking, problem-solving, attention to detail, concentration, and pattern recognition, while also improving memory and patience. It's a fun way to sharpen analytical and cognitive skills.";

  let finalPageprops = {
    username, regno, profileImg, objective, score, title, rating
  };



  const handleCellClick = (rowIndex, cellIndex) => {
    setTimerActive(true)
    if (board[rowIndex][cellIndex] === '') {
      const newBoard = [...board];
      newBoard[rowIndex][cellIndex] = selectedNumber;
      setBoard(newBoard);
    }
  };

  // End game when time runs out
  const endGame = () => {
    handleSolve()
    setTimerActive(false);
    setIsGameFinished(true);
    setLevel(prev => prev + 1)
  };

  const handleSolve = () => {
    let isCorrect = true;
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
      for (let cellIndex = 0; cellIndex < board[rowIndex].length; cellIndex++) {
        if (board[rowIndex][cellIndex] !== solvedBoard[rowIndex][cellIndex] && initialBoard[rowIndex][cellIndex] === '') {
          isCorrect = false;
          break;
        }
      }
      if (!isCorrect) break;
    }
    if (isCorrect) {
      setLevel(prev => prev + 1)
      setIsGameFinished(true)
      alert('Click on OK to finish the game and see the result');
    } else {
      alert('You have not played the game correctly. Please try again.');

    }
    if (hintCount <= 3) {
      if (time < 360 && time >= 240) {
        setScore(100)
      } else if (time < 240 && time >= 120) {
        setScore(60)
      } else if (time < 120 && time >= 0){
        setScore(20)
      }
    } else {
      alert("Your score is zero cause you have taken more than 3 times hint");
      setScore(0)
    }
    
 

      if (time < 360 && time >= 240) {
        setRating(`Hurray! You completed this game in ${Math.floor((900 - time) / 60)}:${("0" + (900 - time) % 60).slice(-2)} mins`);
      }else if(time < 240 && time >= 120  ){
        setRating(`You completed this game in ${Math.floor((900 - time) / 60)}:${("0" + ((900 - time) % 60)).slice(-2)} mins`);
      } else{
        setRating(`Try Again! You completed this game in ${Math.floor((900 - time) / 60)}:${("0" + ((900 - time) % 60)).slice(-2)} mins`);
      };
 

  }
  const handleHint = () => {
    // Adding a simple hint by placing the first missing number
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
      for (let cellIndex = 0; cellIndex < board[rowIndex].length; cellIndex++) {
        if (board[rowIndex][cellIndex] === '') {
          const newBoard = [...board];
          newBoard[rowIndex][cellIndex] = solvedBoard[rowIndex][cellIndex];
          setBoard(newBoard);
          setHintCount(hintCount + 1);
          return;
        }
      }
    }
  };


  const numberButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <Box sx={{mb:"30px"}} >
      {!isGameFinished &&
        <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", p: '20px' }}>
          <Box>
            <Typography variant='h6' fontWeight="bold">
              Student Name : {username}
            </Typography>
            <Typography variant='h6' fontWeight="bold">
              Registration No. : {regno}
            </Typography>
          </Box>

          <Box>
            <Typography variant='h6' borderRadius="5px" padding="8px 14px" fontWeight="bold" bgcolor="#B0DAFF" color="#021526">
              Score - {score}
            </Typography>
          </Box>
        </Container>}

      {!isGameFinished &&
        <Container>
          <Typography variant='h4' textAlign="center" fontWeight="bold" my={3}>
            {title}
            {timerActive && <Timer time={time} timerActive={timerActive} setTime={setTime} endGame={endGame} />}
          </Typography>
        </Container>}

      {level === 0 && (
        <Container sx={{ margin: "20px auto", background: "white", color: "black" }}>
          <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ position: "relative", width: "40%" }}>
              <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-11-3416-sudukoGameImg.png" alt="img" style={{ mx: 'auto', width: "100%" }} />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="contained"
                  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setLevel(prev => prev + 1)}
                >
                  Play Game
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      )}

      {level === 1 && (
        <Box width="100%">
          <Grid container justifyContent="center" alignItems="center" sx={{ width: " 50%", margin: "0px auto" }}>
            {board.map((row, rowIndex) => (
              <Grid container key={rowIndex} sx={{ width: "100%" }}>
                <Grid item xs={1} />
                {row.map((cell, cellIndex) => (
                  <Grid
                    item
                    key={cellIndex}
                    xs={1}
                    onClick={() => handleCellClick(rowIndex, cellIndex)}
                    sx={{
                      border: '1px solid #1E3A8A',
                      width: '100%',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      cursor: cell === '' ? 'pointer' : 'not-allowed',
                      backgroundColor: cell === '' ? '#f0f0f0' : '#ffffff',
                    }}
                  >
                    {cell}
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", gap: "10px", mt: "20px" }}>
            {numberButtons.map((number) => (
              <Button
                key={number}
                variant={selectedNumber === number ? 'contained' : 'outlined'}
                onClick={() => setSelectedNumber(number)}
              >
                {number}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", gap: "10px", mt: "20px" }}>
            <Button variant='contained' color='primary' onClick={handleSolve}>
              Solve
            </Button>
            <Button variant='contained' color='secondary' onClick={handleHint}>
              Hint {hintCount}
            </Button>
          </Box>
        </Box>
      )}

      {isGameFinished && <FinalGamePage {...finalPageprops} />}
    </Box>
  );
}

export default SudokuGame;







