import React, { useState } from 'react';
import { Box, Paper, Grid, Button, Typography, Container } from '@mui/material';
import global1 from "../pages/global1";
import FinalGamePage from './FinalGamePage';

const TowerOfHanoi = () => {

  const username = global1.name;
  const regno = global1.regno;
  const profileImg = global1.profileImage;

  const [level, setLevel] = useState(0); // Track the current level (1: Easy, 2: Medium, 3: Hard)
  const [score, setScore] = useState(0);
  const [rods, setRods] = useState({
    rodA: [3, 2, 1], // Start with 3 disks for the easy level
    rodB: [],
    rodC: [],
  });
  const [draggedDisk, setDraggedDisk] = useState(null); // Track the disk being dragged
  const [moveCount, setMoveCount] = useState(0); // Track the number of moves
  const [message, setMessage] = useState(''); // To display the result message
  const [gameOver, setGameOver] = useState(false); // Track if the current level is completed

  let title = "Tower of Hanoi";
  let objective = "The Tower of Hanoi game is a classic puzzle that enhances problem-solving, logical thinking, and recursive algorithm skills. By playing or learning it, you develop an understanding of recursion and its practical application in programming. It also sharpens your ability to think strategically and break down complex tasks into smaller, manageable steps.";

  let finalPageprops = {
    username, regno, profileImg, objective, score, title, rating: ""
  };

  // Define the number of disks for each level
  const diskCounts = {
    1: 3, // Easy: 3 disks
    2: 4, // Medium: 4 disks
    3: 5, // Hard: 5 disks
  };

  // Function to reset the rods based on the current level
  const resetRodsForLevel = (level) => {
    const diskCount = diskCounts[level];
    const newDisks = Array.from({ length: diskCount }, (_, i) => diskCount - i);
    setRods({ rodA: newDisks, rodB: [], rodC: [] });
    setMoveCount(0);
    setMessage('');
    setGameOver(false);
  };

  // Function to handle dragging of disks
  const handleDragStart = (disk, fromRod) => {
    setDraggedDisk({ disk, fromRod });
  };

  // Function to move a disk from one rod to another
  const moveDisk = (fromRod, toRod) => {
    const from = [...rods[fromRod]];
    const to = [...rods[toRod]];

    // Only allow the move if the rules of Tower of Hanoi are followed
    if (from.length > 0 && (to.length === 0 || from[from.length - 1] < to[to.length - 1])) {
      to.push(from.pop());
      setRods({ ...rods, [fromRod]: from, [toRod]: to });
      setMoveCount(moveCount + 1);
    }
  };

  // Handle drop on rods
  const handleDrop = (toRod) => {
    if (draggedDisk) {
      const { fromRod, disk } = draggedDisk;

      const toRodDisks = rods[toRod];
      // Allow drop only if the destination rod is empty or the top disk is larger than the dragged disk
      if (toRodDisks.length === 0 || disk < toRodDisks[toRodDisks.length - 1]) {
        moveDisk(fromRod, toRod); // Move the disk
      }
      setDraggedDisk(null); // Clear the dragged disk
    }
  };

  // Allow drag to continue
  const allowDrag = (event) => {
    event.preventDefault();
  };


  // Check if the current level is completed by moving all disks to rodC
  const checkCompletion = () => {
    const diskCount = diskCounts[level];
    if (rods.rodC.length === diskCount) {
      // Check for the number of moves and update the score based on the level
      if (level === 1) {
        // Easy Level
        if (moveCount <= 7) {
          setScore(prev => prev + 30); 
        } else {
          setScore(prev => prev + 10); 
        }
      } else if (level === 2) {
        // Medium Level
        if (moveCount <= 15) {
          setScore(prev => prev + 30); 
        } else {
          setScore(prev => prev + 10); 
        }
      } else if (level === 3) {
        // Hard Level
        if (moveCount <= 31) {
          setScore(prev => prev + 40); 
        } else {
          setScore(prev => prev + 20); 
        }
      }
      setGameOver(true);
    } else {
    }
      setMessage("You have not completed the game");
  };

  // Proceed to the next level
  const nextLevel = () => {
    if (level < 3) {
      setLevel(level + 1);
      resetRodsForLevel(level + 1);
    } else {
      setMessage('You have completed all levels!');
      setLevel(level + 1);
      setGameOver(true)
    }
  };


  return (
    <Box >
      {level <= 3 && (<Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", p: '20px' }}>
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
      </Container>)}

     {level <= 3 && <Container>
        <Typography variant='h4' textAlign="center" fontWeight="bold" my={3}>
          {title}
        </Typography>
      </Container>}

      {level === 0 && (
        <Container sx={{ margin: "20px auto", background: "white", color: "black" }}>
          <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ position: "relative", width: "40%" }}>
              <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-14-2848-tower.png" alt="img" style={{ mx: 'auto', width: "100%" }} />
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


      {level > 0 && level <=3 && (<Container>
        <Container sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          {/* Display the move count */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Moves: {moveCount}
          </Typography>
          {/* Display the current level */}
          <Typography variant="h6">Level: <b>{level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'}</b></Typography>
        </Container>


        {/* Grid for the three rods */}
        <Grid container spacing={2} justifyContent="center" textAlign="center" marginBottom="20px">
          <Grid item>
            <Rod
              disks={rods.rodA}
              rodName="rodA"
              onDrop={() => handleDrop('rodA')}
              onDragOver={allowDrag}
              onDragStart={handleDragStart}
            />
            Source
          </Grid>
          <Grid item>
            <Rod
              disks={rods.rodB}
              rodName="rodB"
              onDrop={() => handleDrop('rodB')}
              onDragOver={allowDrag}
              onDragStart={handleDragStart}
            />
            Auxiliary
          </Grid>
          <Grid item>
            <Rod
              disks={rods.rodC}
              rodName="rodC"
              onDrop={() => handleDrop('rodC')}
              onDragOver={allowDrag}
              onDragStart={handleDragStart}
            />
            Destination
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", margin: "20px 0px 20px 0px" }}>
          {/* Button to check the arrangement and progress to the next level */}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={checkCompletion}
            disabled={gameOver}
          >
            Check Completion
          </Button>

          {/* Button to go to the next level */}
          {gameOver && level <= 3 && (
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 3, ml: 2 }}
              onClick={nextLevel}
            >
              Next Level
            </Button>
          )}
        </Box>
          <Typography variant="h6" sx={{ my: 3, textAlign: "center", color: 'green' }}>
            {message}
          </Typography>
      </Container>)}

      {gameOver && level > 3 && <FinalGamePage {...finalPageprops} />}

    </Box>
  );
};

// Rod component to display the rod and disks
const Rod = ({ disks, rodName, onDrop, onDragOver, onDragStart }) => {
  return (
    <Box
      sx={{
        width: 100,
        height: 300,
        backgroundColor: '#f0f0f0',
        position: 'relative',
        cursor: 'pointer',
        marginBottom: "10px"
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {/* Vertical rod */}
      <Box
        sx={{
          position: 'absolute',
          width: '10px',
          height: '100%',
          backgroundColor: 'black',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Display disks on the rod */}
      {disks.map((disk, index) => (
        <Box
          key={index}
          layout
          animate={{ y: [0, -50 * (disks.length - index - 1)] }} // Animate the disk's movement
          transition={{ duration: 0.5 }}
        >
          <Paper
            draggable
            onDragStart={() => onDragStart(disk, rodName)} // Enable dragging
            sx={{
              width: `${disk * 20}px`,
              height: '20px',
              backgroundColor: ['red', 'green', 'blue', 'orange', 'purple'][disk - 1], // Colors for disks
              position: 'absolute',
              bottom: `${index * 25}px`,
              left: `calc(50% - ${disk * 10}px)`, // Center the disk on the rod
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default TowerOfHanoi;
