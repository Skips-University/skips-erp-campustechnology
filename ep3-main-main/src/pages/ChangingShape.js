import { Box, Button, Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import global1 from "../pages/global1";
import FinalGamePage from './FinalGamePage';



const img1 = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-8-2720-mtachstick.png";

const ChangingShape = () => {

  const username = global1.name;
  const regno = global1.regno;
  const profileImg = global1.profile;

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);


  const [matchsticks, setMatchsticks] = useState([
    { id: 'stick1', top: 125, left: 278, rotation: 0 },
    { id: 'stick2', top: 26, left: 371, rotation: 90 },
    { id: 'stick3', top: 129, left: 463, rotation: 180 },
    { id: 'stick4', top: 222, left: 371, rotation: -90 },
    { id: 'stick5', top: 25, left: 566, rotation: 90 },
    { id: 'stick6', top: 130, left: 656, rotation: 180 },
    { id: 'stick7', top: 327, left: 278, rotation: 180 },
    { id: 'stick8', top: 323, left: 464, rotation: 180 },
    { id: 'stick9', top: 324, left: 655, rotation: -180 },
    { id: 'stick10', top: 416, left: 553, rotation: -90 },
    { id: 'stick11', top: 416, left: 371, rotation: -90 },
    { id: 'stick12', top: 222, left: 553, rotation: -90 },
  ]);

  const [filledTargetNo, setFilledTargetNo] = useState({
    target2: true,
    target4: true,
    target5: true,
    target7: true,
    target8: true,
    target9: false,
    target10: true,
    target11: false,
    target13: true,
    target14: true,
    target15: false,
    target16: true,
    target17: true,
    target19: true,
    target20: false,
    target21: true,
    target22: false,
  });

  const [correctArrangements, setCorrectArrangements] = useState(0);
  const [noOfdrag, setNoOfDrag] = useState(0)
  const [won, setWon] = useState(false)

  let title = "Changing Shape Game";
  let objective =
    "The objective of the matchstick puzzle is to move three matchsticks to transform four squares into three squares. This game enhances problem-solving, spatial reasoning, and logical thinking by challenging players to think critically and creatively while rearranging the matchsticks. It also promotes patience and focus as players work toward finding the solution.";

  let finalPageprops = {
    username,
    regno,
    profileImg,
    objective,
    score,
    title,
    rating:"",
  };


  useEffect(() => {
    console.log(filledTargetNo);
  }, [filledTargetNo]);

  const onDragStart = (e, id) => {
    e.dataTransfer.setData("id", id);
    setNoOfDrag(prev => prev + 1)
  };

  const onDrop = (e, targetArea, targetId) => {
    const id = e.dataTransfer.getData("id");

    const updatedMatchsticks = matchsticks.map((stick) => {
      if (stick.id === id) {
        return {
          ...stick,
          top: targetArea.top,
          left: targetArea.left,
        };
      }
      return stick;
    });
    setMatchsticks(updatedMatchsticks);

    const isTargetAreaFilled = filledTargetNo[targetId];

    // Check for correct arrangements
    let isCorrect = false;
    if (noOfdrag <= 3) {
      if (
        (id === 'stick2' || id === 'stick10') && (targetId === 'target20' || targetId === 'target22') ||
        (id === 'stick1' && targetId === 'target15')
      ) {
        isCorrect = true;
      }
    } else {
      alert("You can only move three sticks.")
      setTimeout(()=>{
        setLevel(prev => prev + 1)
      },2000)

    }

    if (isCorrect) {
      setCorrectArrangements((prev) => prev + 1);
      // alert("you've arraged correctly")
      if (correctArrangements + 1 === 1) {
        setScore(prev => prev + 30)
      } else if (correctArrangements + 1 === 2) {
        setScore(prev => prev + 30)
      } else if (correctArrangements + 1 === 3) {
        setScore(prev => prev + 40)
        // alert("It's correctly arranged");
        setTimeout(()=>{
          setLevel(prev => prev + 1)
        },2000)
      }
    }

    setFilledTargetNo((prevState) => ({
      ...prevState,
      [targetId]: !isTargetAreaFilled,
    }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const renderMatchstick = (stick) => (
    <img
      key={stick.id}
      src={img1}
      alt={`stick ${stick.id}`}
      height="200px"
      style={{
        position: "absolute",
        top: stick.top,
        left: stick.left,
        transform: `rotate(${stick.rotation}deg)`,
        cursor: "move",
        zIndex: 2,
      }}
      draggable
      onDragStart={(e) => onDragStart(e, stick.id)}
    />
  );

  const renderTargetArea = (targetId, top, left, width, height, color, dropHandler) => (
    <div
      onDragOver={onDragOver}
      onDrop={dropHandler}
      style={{
        position: 'absolute',
        width: width,
        height: height,
        top: top,
        left: left,

      }}
      id={targetId}
    />
  );

  return (
    <Box>
      {level <= 1 &&
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
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/10-2024-11-1618-MatchstickGameImg.png" alt="img" style={{ mx: 'auto', width: "100%" }} />
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



      {level === 1 && <Container>
        <Box sx={{ position: "relative", height: "600px", bgcolor: "gray", }}>
          <Typography variant='h5' textAlign="center" paddingTop="30px" color="white">Move three matchsticks to form three squares</Typography>
          {matchsticks.map(renderMatchstick)}
          {renderTargetArea('target2', 118, 279, '15px', '200px', [255, 0, 0], (e) => onDrop(e, { top: 118, left: 279 }, 'target2'))}
          {renderTargetArea('target4', 118, 279, '200px', '15px', [0, 255, 0], (e) => onDrop(e, { top: 26, left: 376 }, 'target4'))}
          {renderTargetArea('target5', 129, 463, '15px', '200px', [0, 0, 255], (e) => onDrop(e, { top: 129, left: 463 }, 'target5'))}
          {renderTargetArea('target7', 313, 279, '200px', '15px', [255, 255, 0], (e) => onDrop(e, { top: 221, left: 368 }, 'target7'))}
          {renderTargetArea('target8', 118, 471, '200px', '15px', [255, 0, 255], (e) => onDrop(e, { top: 26, left: 560 }, 'target8'))}
          {renderTargetArea('target9', 118, 671, '200px', '15px', [255, 0, 255], (e) => onDrop(e, { top: 26, left: 758 }, 'target9'))}
          {renderTargetArea('target10', 130, 656, '15px', '200px', [0, 255, 255], (e) => onDrop(e, { top: 130, left: 656 }, 'target10'))}
          {renderTargetArea('target11', 130, 856, '15px', '200px', [0, 255, 255], (e) => onDrop(e, { top: 130, left: 856 }, 'target11'))}
          {renderTargetArea('target13', 327, 278, '15px', '200px', [255, 165, 0], (e) => onDrop(e, { top: 327, left: 278 }, 'target13'))}
          {renderTargetArea('target14', 323, 464, '15px', '200px', [128, 0, 128], (e) => onDrop(e, { top: 323, left: 464 }, 'target14'))}
          {renderTargetArea('target15', 323, 856, '15px', '200px', [128, 0, 128], (e) => onDrop(e, { top: 323, left: 856 }, 'target15'))}
          {renderTargetArea('target16', 324, 655, '15px', '200px', [0, 128, 0], (e) => onDrop(e, { top: 324, left: 655 }, 'target16'))}
          {renderTargetArea('target17', 509, 282, '200px', '15px', [0, 128, 0], (e) => onDrop(e, { top: 419, left: 370 }, 'target17'))}
          {renderTargetArea('target19', 511, 468, '200px', '15px', [128, 0, 128], (e) => onDrop(e, { top: 419, left: 559 }, 'target19'))}
          {renderTargetArea('target20', 511, 664, '200px', '15px', [0, 128, 0], (e) => onDrop(e, { top: 421, left: 750 }, 'target20'))}
          {renderTargetArea('target21', 314, 470, '200px', '15px', [0, 128, 0], (e) => onDrop(e, { top: 221, left: 558 }, 'target21'))}
          {renderTargetArea('target22', 314, 670, '200px', '15px', [0, 128, 0], (e) => onDrop(e, { top: 221, left: 758 }, 'target22'))}

        </Box>
      </Container>}

      {
        level > 1 && (
          <FinalGamePage {...finalPageprops} />
        )
      }
    </Box>
  );
};

export default ChangingShape;