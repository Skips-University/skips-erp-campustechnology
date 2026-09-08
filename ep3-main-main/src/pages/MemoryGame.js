import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Card, CardContent, Typography, Container, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import global1 from "../pages/global1";


import FinalGamePage from './FinalGamePage';

const cardsData = [
    { id: 1, content: '🍎' },
    { id: 2, content: '🍌' },
    { id: 3, content: '🍍' },
    { id: 4, content: '🍇' },
    { id: 5, content: '🍓' },
    { id: 6, content: '🍉' },
    { id: 7, content: '🍒' },
    { id: 8, content: '🍍' },
    { id: 9, content: '🍓' },
    { id: 10, content: '🥭' },
    { id: 11, content: '🍎' },
    { id: 12, content: '🍌' },
    { id: 13, content: '🍇' },
    { id: 14, content: '🍉' },
    { id: 15, content: '🍒' },
    { id: 16, content: '🥭' },
];

const shuffleCards = () => {
    const shuffled = [...cardsData].sort(() => Math.random() - 0.5);
    return shuffled.map((card, index) => ({ ...card, matched: false, flipped: false, index }));
};

const MemoryGame = () => {
    const username = global1.name;
    const regno = global1.regno;
    const profileImg = global1.profileImage;

    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);
    const [cards, setCards] = useState(shuffleCards);
    const [flippedCards, setFlippedCards] = useState([]);
    const [moves, setmoves] = useState(20);
    const [matches, setMatches] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [rating, setRating] = useState("");


    let title = "Memory Game"
    let objective = "The Memory Card Game enhances cognitive skills by improving short-term memory, concentration, and recall. It fosters visual pattern recognition, strengthens strategic thinking, and promotes problem-solving. Additionally, it develops patience, persistence, and logical reasoning, all while engaging players in a fun, mentally stimulating activity."

    let finalPageprops = {
        username, regno, profileImg, objective, score, title, rating
    }

    useEffect(() => {
        if (matches === cardsData.length / 2 || moves === 0) {
            if (matches === cardsData.length / 2 || moves === 0) {
                setLevel(prev => prev + 1)
            }
        }
        if (moves <= 10) {
            setRating(`Try again! you've completed the game in ${20-moves} moves and you got 3⭐`)
        } else if (moves > 10 && moves <= 15) {
            setRating(`Good Job! you've completed the game in ${20-moves} moves and you got 4⭐`)
        } else {
            setRating(`Hurrey! you've completed the game in ${20-moves} moves and you got 5⭐`)
        }

      

    }, [matches, moves]);



    let timer = score >= 60 ? 100 : 300

    const handleCardClick = (index) => {
        if (gameOver || cards[index].flipped || flippedCards.length === 2) return;

        const updatedCards = [...cards];
        updatedCards[index].flipped = true;
        setCards(updatedCards);
        setFlippedCards([...flippedCards, index]);

        if (flippedCards.length === 1) {
            const firstCard = cards[flippedCards[0]];
            const secondCard = updatedCards[index];

            if (firstCard.content === secondCard.content) {
                updatedCards[flippedCards[0]].matched = true;
                updatedCards[index].matched = true;
                setMatches((prevMatches) => prevMatches + 1);
                if (score >= 60) {
                    setScore(prev => prev + 20);
                } else {
                    setScore(prev => prev + 10);
                }
                setFlippedCards([]);
            } else {
                setTimeout(() => {
                    updatedCards[flippedCards[0]].flipped = false;
                    updatedCards[index].flipped = false;
                    setCards(updatedCards);
                    setFlippedCards([]);
                }, timer);
            }
            setmoves((prevmoves) => prevmoves - 1);
        }
    };

    const handleRestart = () => {
        setCards(shuffleCards());
        setFlippedCards([]);
        setmoves(20);
        setMatches(0);
        setGameOver(false);
        setLevel(0)
    };

    return (
        <Box >
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
                level === 0 && (
                    <Container sx={{ margin: "20px auto", background: "white", color: "black" }}>
                        <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box sx={{ position: "relative", width: "40%" }}>
                                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-11-1912-memoryGameImg.png"alt="img" style={{ mx: 'auto', width: "100%" }} />
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

                        {/* </Box> */}
                    </Container>
                )
            }


            {level === 1 && <Container style={{ textAlign: 'center', marginTop: '20px' }}>
                <Typography variant="h6">Moves Left: {moves}</Typography>
                <Grid container spacing={2} justifyContent="center" style={{ maxWidth: 600, margin: '30px auto' }}>
                    {cards.map((card, index) => (
                        <Grid item xs={3} key={index}>
                            <Card
                                onClick={() => handleCardClick(index)}
                                style={{
                                    width: 100,
                                    height: 100,
                                    backgroundColor: card.flipped || card.matched ? '#3C3D37' : '#ccc',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: "0px 10px"
                                }}
                            >
                                {card.flipped || card.matched ? (
                                    <CardContent>
                                        <Typography variant="h3">{card.content}</Typography>
                                    </CardContent>
                                ) : (
                                    <CardContent></CardContent>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Button
                    variant="contained"
                    color="success"
                    sx={{ ml: 2, width: "100px", margin: "30px auto", display: "flex" }}
                    onClick={handleRestart}
                >
                    Restart
                </Button>
            </Container>}


            {
                level > 1 && (
                    <FinalGamePage {...finalPageprops} />
                )
            }
        </Box>
    );
};

export default MemoryGame;
