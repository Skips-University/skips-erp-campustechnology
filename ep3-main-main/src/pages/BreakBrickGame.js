import { Box, Button, Container, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import global1 from "./global1";
import FinalGamePage from "./FinalGamePage";

// Game data
const data = {
    ballObj: {
        x: 20,
        y: 200,
        dx: 5,
        dy: 5,
        rad: 10,
        speed: 10,
    },
    brickObj: {
        x: 0.5,
        y: 50,
        height: 20,
        density: 2,
        colors: ["red", "lightblue"],
    },
    player: {
        name: "Player",
        lives: 5,
        score: 0,
        level: 0,
    },
    paddleProps: {
        height: 20,
        width: 100,
        x: 100,
        color: "orange",
    },
};

// Resets ball to paddle position
function resetBall(ballObj, canvas, paddleProps) {
    ballObj.x = paddleProps.x;
    ballObj.y = paddleProps.y - 80;
    ballObj.dx = 6 * (Math.random() * 2 - 1);
    ballObj.dy = -6;
}

// Checks if all bricks are broken
function allBroken(bricks, player, canvas, ballObj) {
    let { brickObj, paddleProps } = data;
    let total = 0;
    for (let i = 0; i < bricks.length; i++) {
        if (bricks[i].broke) {
            total++;
        }
    }
    if (total === bricks.length) {
        player.level++;
        resetBall(ballObj, canvas, paddleProps);
        brickObj.y = 50;
    }
}

// Wall collision logic
function wallCollision(ballObj, canvas, player, paddleProps) {
    if (ballObj.y + ballObj.rad > canvas.height) {
        player.lives--;
        resetBall(ballObj, canvas, paddleProps);
    }
    if (ballObj.y - ballObj.rad < 0) {
        ballObj.dy *= -1;
    }
    if (ballObj.x + ballObj.rad > canvas.width || ballObj.x - ballObj.rad < 0) {
        ballObj.dx *= -1;
    }
}

// Paddle hit logic
function paddleHit(ballObj, paddleProps) {
    if (
        ballObj.x < paddleProps.x + paddleProps.width &&
        ballObj.x > paddleProps.x &&
        paddleProps.y < paddleProps.y + paddleProps.height &&
        ballObj.y + ballObj.rad > paddleProps.y - paddleProps.height / 2
    ) {
        let collidePoint = ballObj.x - (paddleProps.x + paddleProps.width / 2);
        collidePoint = collidePoint / (paddleProps.width / 2);
        let angle = (collidePoint * Math.PI) / 3;
        ballObj.dx = ballObj.speed * Math.sin(angle);
        ballObj.dy = -ballObj.speed * Math.cos(angle);
    }
}

// Brick collision logic
function brickCollision(circle, rect) {
    var distX = Math.abs(circle.x - rect.x - rect.width / 2);
    var distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > rect.width / 2 + circle.rad || distY > rect.height / 2 + circle.rad) {
        return { hit: false };
    }

    if (distX <= rect.width / 2) {
        return { hit: true, axis: "Y" };
    }

    if (distY <= rect.height / 2) {
        return { hit: true, axis: "X" };
    }

    var dx = distX - rect.width / 2;
    var dy = distY - rect.height / 2;
    return {
        hit: dx * dx + dy * dy <= circle.rad * circle.rad,
        axis: "X",
    };
}

// Paddle component
const Paddle = (ctx, canvas, paddleProps) => {
    class Paddle {
        constructor(x) {
            this.x = x;
            this.y = canvas.height - 10;
            this.height = 20;
            this.width = paddleProps.width;
            this.colors = ["red", "#0088FF"];
        }
        move() {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.colors[1];
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    let paddle = new Paddle(paddleProps.x);
    paddle.move();
    if (paddleProps.x <= 0) {
        paddleProps.x = 0;
    } else if (paddleProps.x + paddleProps.width >= canvas.width) {
        paddleProps.x = canvas.width - paddleProps.width;
    }
};

// Brick component logic
function Brick(level, bricks, canvas, brick) {
    brick.width = canvas.width / 5 - 1;
    let newBricks = [];
    if (!bricks) {
        return [];
    }
    if (bricks.length >= 5 * level) {
        return;
    }

    for (let i = 0; i < 5 * level; i++) {
        let newBrick = new SingleBrick(
            brick.x + brick.width,
            brick.y,
            brick.width,
            brick.height,
            brick.colors
        );
        newBricks.push(newBrick);
        brick.x += brick.width + 1;
        if (brick.x + brick.width >= canvas.width) {
            brick.x = 0.5;
            brick.y += brick.height + 1;
        }
    }
    return newBricks;
}

// Single brick class
class SingleBrick {
    constructor(x, y, w, h, c) {
        this.x = x - w;
        this.y = y;
        this.width = w;
        this.height = h;
        this.colors = c;
        this.broke = false;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.broke ? "rgba(19, 73, 89, 0)" : this.colors[1];
        ctx.strokeStyle = this.broke ? "rgba(19, 73, 89, 0)" : "transparent";
        ctx.fill();
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Ball movement logic
function BallMovement(ctx, ballObj) {
    let data = new Ball(ballObj.x, ballObj.y, ballObj.rad);
    data.draw(ctx);
    ballObj.x += ballObj.dx;
    ballObj.y += ballObj.dy;
}

// Ball class
class Ball {
    constructor(x, y, rad) {
        this.x = x;
        this.y = y;
        this.rad = rad;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "#58a6ff";
        ctx.arc(this.x, this.y, this.rad, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#58a6ff";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Player stats display
function PlayerStats(ctx, player, canvas) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`Level: ${player.level}`, 20, 30);

    ctx.fillStyle = "red";
    let gap = 0;
    for (let i = 0; i < player.lives; i++) {
        ctx.fillText("❤️", canvas.width / 2 + gap, 30);
        gap += 30;
    }

    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${player.score}`, canvas.width - 140, 30);
}

// Main game component
export default function BreakBrickGame() {

    const username = global1.name;
    const regno = global1.regno;
    const profileImg = global1.profile;

    const [showfinalScore, setShowfinalScore] = useState(false)
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [isGameFinished, setIsGameFinished] = useState(false)
    const [rating, setRating] = useState("");
    const canvasRef = useRef(null);

    let { ballObj, paddleProps, brickObj, player } = data;
    let bricks = [];

    let title = "Brick Breakout Game";
    let objective =
        "The objective of the Brick Breakout Game is to break all the bricks on the screen using a ball, which the player controls with a paddle. The player must strategically bounce the ball off the paddle to hit and break the bricks.The game enhances hand-eye coordination, strategic planning, and reflexes as the player navigates through increasingly complex challenges.";

    let finalPageprops = {
        username,
        regno,
        profileImg,
        objective,
        score: player.score,
        title,
        rating,
    };


    useEffect(() => {

        const render = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            paddleProps.y = canvas.height - paddleProps.height;

            // Assign bricks
            let newBrickSet = Brick(player.level, bricks, canvas, brickObj);
            if (newBrickSet && newBrickSet.length > 0) {
                bricks = newBrickSet;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            PlayerStats(ctx, player, canvas);

            // Display bricks
            bricks.forEach((brick) => brick.draw(ctx));

            // Ball movement
            BallMovement(ctx, ballObj);

            // Check all bricks are broken
            allBroken(bricks, player, canvas, ballObj);

            // Game over logic
            if (player.lives === 0) {
                setShowfinalScore(true)
                setIsGameFinished(true)
            }

            // Ball and wall collision
            wallCollision(ballObj, canvas, player, paddleProps);

            // Brick collision detection
            for (let i = 0; i < bricks.length; i++) {
                let brickCollisionResult = brickCollision(ballObj, bricks[i]);
                if (brickCollisionResult.hit && !bricks[i].broke) {
                    if (brickCollisionResult.axis === "X") {
                        ballObj.dx *= -1;
                        bricks[i].broke = true;
                    } else if (brickCollisionResult.axis === "Y") {
                        ballObj.dy *= -1;
                        bricks[i].broke = true;
                    }
                    if (player.score < 100) {
                        player.score += 5
                    } else {
                        setShowfinalScore(true)
                    }
                }
            }

            // Paddle hit detection
            paddleHit(ballObj, paddleProps);

            // Draw paddle
            Paddle(ctx, canvas, paddleProps);
        };

        if (isGameStarted && player.level === 1) {
            const interval = setInterval(render, 1000 / 60);
            return () => clearInterval(interval);
        }
    }, [bricks]);

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        paddleProps.x = e.clientX - canvas.offsetLeft - paddleProps.width / 2;
    };



    return (
        <Box sx={{ color: "black", bgcolor: isGameStarted && !showfinalScore ? "lightGray" : "", }}>
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

                    <Box >
                        <Typography variant='h6' borderRadius="5px" padding="8px 14px" fontWeight="bold" bgcolor="#B0DAFF" color="#021526" >
                            Score - {player.score}
                        </Typography>
                    </Box>

                </Container>
            }
            {!isGameFinished && <Container>
                <Typography variant='h4' textAlign="center" fontWeight="bold" my={3}>
                    {title}
                </Typography>
            </Container>}
            {player.level === 0 && !isGameStarted &&
                (<Container sx={{ margin: "20px auto", background: "white", color: "black" }}>
                    <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Box sx={{ position: "relative", width: "40%" }}>
                            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-9-74-imageBrick.png" alt="img" style={{ mx: 'auto', width: "100%" }} />
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
                                    onClick={() => {
                                        setIsGameStarted(true)
                                        player.level = 1
                                    }}
                                >
                                    Play Game
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                </Container>
                )}

            {isGameStarted && !showfinalScore && <Container sx={{ width: "100", color: "black", }}>
                <canvas
                    id="breakout-canvas"
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    height="500"
                    width="800"
                    style={{ margin: "60px 188px", border: "2px solid black", background: "green" }}

                />
            </Container>}

            {showfinalScore && isGameFinished && (
                <FinalGamePage
                    {...finalPageprops}
                   
                />
            )}
        </Box>
    );
}


