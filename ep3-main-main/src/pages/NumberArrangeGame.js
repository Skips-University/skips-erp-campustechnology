import { useEffect, useState } from "react";
import { Container, Button, Typography, Box, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import global1 from "../pages/global1";
import FinalGamePage from "./FinalGamePage";

// Shuffle function to initialize the array
function shuffleArray() {
    let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, ""];
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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

// Tile styling for filled and empty tiles
const FilledTile = styled(Paper)(({ theme, isCorrect }) => ({
    width: 80,
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isCorrect ? "#FADFA1" : "#7E60BF",
    cursor: "pointer",
    "&:hover": {
        backgroundColor: theme.palette.grey[700],
    },
}));

const EmptyTile = styled(Paper)(({ theme }) => ({
    width: 80,
    height: 80,
    backgroundColor: theme.palette.grey[100],
}));

// Puzzle grid where the tiles are displayed
function Puzzle({ shuffledArray, dragOver, dragStart, dropped }) {
    return (
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 3, width: "400px" }}>
            {shuffledArray.map((value, index) => {
                if (value === "")
                    return (
                        <Grid item key={index} id={`tile-${index}`}>
                            <EmptyTile onDragOver={dragOver} onDrop={(e) => dropped(e, index)} />
                        </Grid>
                    );
                return (
                    <Grid item key={index} id={`tile-${index}`}>
                        <FilledTile
                            id={`tile-${value}`}
                            isCorrect={index === value - 1}
                            draggable="true"
                            onDragStart={(e) => dragStart(e, index)}
                        >
                            <Typography variant="h5" component="div">
                                {value}
                            </Typography>
                        </FilledTile>
                    </Grid>
                );
            })}
        </Grid>
    );
}

// Main game component with logic for moves, win condition, and game over
export default function NumberArrangeGame() {
    const username = global1.name;
    const regno = global1.regno;
    const profileImg = global1.profileImage;

    const [level, setLevel] = useState(0);
    const [shuffledArray, setShuffledArray] = useState(shuffleArray());
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(900);
    const [timerActive, setTimerActive] = useState(false);
    const [win, setWin] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [rating, setRating] = useState("");
    const [score, setScore] = useState(0);
    const [previousShuffledArray, setPreviousShuffledArray] = useState(shuffleArray());

    let title = "Number Arranging Game";
    let objective =
        "The Number Arranging Game is a sliding puzzle where players arrange numbered tiles in sequence within a time limit. It sharpens problem-solving, strategic thinking, memory, and spatial awareness, while also improving focus, logical reasoning, and time management. The game fosters patience as players strive to complete the puzzle efficiently with minimal moves.";

    let finalPageprops = {
        username,
        regno,
        profileImg,
        objective,
        score,
        title,
        rating,
    };

    // Check win condition when moves or shuffledArray changes
    useEffect(() => {
        if (moves === 1) setTimerActive(true);
        let won = true;
        for (let i = 0; i < shuffledArray.length - 1; i++) {
            const value = shuffledArray[i];
            if (i === value - 1) continue;
            else {
                won = false;
                break;
            }
        }
        if (won) {
            setWin(true);
            setLevel(prev => prev + 1)
            setTimerActive(false);
        }

    }, [moves, shuffledArray]);

    // Reset game function
    const newGame = () => {
        setMoves(0);
        setTimerActive(false);
        setTime(900);
        setShuffledArray(shuffleArray());
        setWin(false);
        setGameOver(false);
        setLevel(0);
        setScore(0);
        setPreviousShuffledArray(shuffleArray());
    };

    // End game when time runs out
    const endGame = () => {
        setTimerActive(false);
        setGameOver(true);
        setLevel(prev => prev + 1)
    };

    const dragStart = (e, index) => {
        e.dataTransfer.setData("draggedIndex", index);
    };

    const dragOver = (e) => {
        e.preventDefault();
    };

    const dropped = (e, dropIndex) => {
        e.preventDefault();
        const draggedIndex = e.dataTransfer.getData("draggedIndex");

        // Ensure the move is valid (adjacent tile movement)
        if (!(Math.abs(draggedIndex - dropIndex) === 4 || Math.abs(draggedIndex - dropIndex) === 1)) return;

        // Swap the tiles
        const newShuffledArray = [...shuffledArray];
        [newShuffledArray[draggedIndex], newShuffledArray[dropIndex]] = [
            newShuffledArray[dropIndex],
            newShuffledArray[draggedIndex],
        ];

        // Update score based on correct or incorrect tile positions
        let newScore = score;
        for (let i = 0; i < newShuffledArray.length - 1; i++) {
            if (newShuffledArray[i] === i + 1) {
                if (previousShuffledArray[i] !== i + 1) {
                    if (score < 98) {
                        newScore += 7;
                    } else {
                        newScore += 2;
                    }
                }
            } else {
                if (previousShuffledArray[i] === i + 1) {
                    newScore -= 7;
                }
            }
        }

        // Ensure score doesn't go below zero
        newScore = Math.max(newScore, 0);

        setShuffledArray(newShuffledArray);
        setMoves(moves + 1);
        setScore(newScore);
        setPreviousShuffledArray(newShuffledArray);
    };

    return (
        <Box sx={{ height: level === 0 && "100vh" }}>
            {/* Conditionally render FinalGamePage when game is over */}
            {(win || gameOver) ? (
                <FinalGamePage {...finalPageprops} />
            ) : (
                <>
                    {level <= 1 && <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", p: '20px' }}>
                        <Box>
                            <Typography variant='h6' fontWeight="bold">
                                Student Name : {username}
                            </Typography>
                            <Typography variant='h6' fontWeight="bold">
                                Registration No. : {regno}
                            </Typography>
                        </Box>

                        <Box >
                            <Typography variant='h6' borderRadius="5px" padding="8px 14px" fontWeight="bold" bgcolor="#B0DAFF" color="#021526" >
                                Score - {score}
                            </Typography>
                        </Box>

                    </Container>}
                    {level <= 1 && <Container>
                        <Typography variant='h4' textAlign="center" fontWeight="bold" my={3}>
                            {title}
                        </Typography>
                    </Container>}

                    {
                        level === 0 ?
                            (
                                <Container sx={{ margin: "20px auto", background: "white", color: "black" }}>
                                    <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Box sx={{ position: "relative", width: "40%" }}>
                                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-11-1937-numberArrangingImg.png" alt="img" style={{ mx: 'auto', width: "100%" }} />
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
                            )

                            :
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",

                                }}
                            >

                                <Container sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <Typography variant="h6">Moves: {moves}</Typography>
                                    <Timer time={time} timerActive={timerActive} setTime={setTime} endGame={endGame} />
                                </Container>
                                <Puzzle shuffledArray={shuffledArray} dragStart={dragStart} dragOver={dragOver} dropped={dropped} />
                                <Box sx={{ mt: 4 }}>
                                    <Button onClick={newGame} variant="contained" color="success">
                                        {gameOver || win ? "Restart Game" : "New Game"}
                                    </Button>
                                </Box>
                            </Box>
                    }
                </>
            )}
        </Box>
    );
}
