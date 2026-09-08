import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Container, Typography } from "@mui/material";
import global1 from "./global1";

const imgSkeleton1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-27-1636-skeleton2_level_1.png";

const imgSkeleton2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-27-177-skeleton2_level_2.png";

// Create a username and register no
const username = global1.name;
const registerNo = global1.regno;

const SkeletonExpPart2 = () => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [inputs, setInputs] = useState({
    humarus: "",
    innominate: "",
    patella: "",
    tibia: "",
    fibula: "",
    cranium: "",
    mandible: "",
    rib: "",
    vertebra: "",
    radius: "",
    femur: "",
  });
  const [isFinished, setIsFinished] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInputs({ ...inputs, [id]: value });
  };

  useEffect(() => {
    const correctAnswers = {
      humarus: "humarus",
      innominate: "innominate",
      patella: "patella",
      tibia: "tibia",
      fibula: "fibula",
      cranium: "cranium",
      mandible: "mandible",
      rib: "rib",
      vertebra: "vertebra",
      radius: "radius",
      femur: "femur",
    };

    let newScore = 1;

    Object.keys(correctAnswers).forEach((key) => {
      if (inputs[key] === correctAnswers[key]) {
        newScore += 9; // increase score by 10 for each correct input value
      }
    });

    // Ensure the score is between 0 to 100
    newScore = Math.min(Math.max(newScore, 0), 100);

    setScore(newScore); // updated the score state
  }, [inputs]);

  const checkAnswers1 = () => {
    const correctAnswers = {
      humarus: "humarus",
      innominate: "innominate",
      patella: "patella",
      tibia: "tibia",
      fibula: "fibula",
      cranium: "cranium",
      mandible: "mandible",
      rib: "rib",
      vertebra: "vertebra",
      radius: "radius",
      femur: "femur",
    };

    // console.log(newScore, "newScore+++++++++");

    if (score === 100) {
      alert("All answers are correct! You scored 100.");
    } else if (score > 0) {
      alert(`You scored ${score}. keep trying`);
    } else {
      alert("No correct answers. Try again!");
    }

    const isCorrect = Object.keys(correctAnswers).every(
      (key) => inputs[key] === correctAnswers[key]
    );

    if (isCorrect) {
      alert("Correct");
    } else {
      alert("Enter a correct value");
    }

    if (score > 30) {
      setLevel((prev) => prev + 1);
    }
  };

  const checkAnswers2 = () => {
    const correctAnswers = {
      humarus: "humarus",
      innominate: "innominate",
      patella: "patella",
      tibia: "tibia",
      fibula: "fibula",
      cranium: "cranium",
      mandible: "mandible",
      rib: "rib",
      vertebra: "vertebra",
      radius: "radius",
      femur: "femur",
    };

    // console.log(newScore, "newScore+++++++++");

    if (score === 100) {
      alert("All answers are correct! You scored 100.");
    } else if (score > 0) {
      alert(`You scored ${score}. keep trying`);
    } else {
      alert("No correct answers. Try again!");
    }

    const isCorrect = Object.keys(correctAnswers).every(
      (key) => inputs[key] === correctAnswers[key]
    );

    if (isCorrect) {
      alert("Correct");
    } else {
      alert("Enter a correct value");
    }

    if (score > 75) {
      setIsFinished(true);
      setLevel((prev) => prev + 1);
    } else if (score > 60) {
      setLevel((prev) => prev + 1);
    }
  };

  const allowDrop = (ev) => {
    ev.preventDefault();
  };

  const drag = (ev) => {
    ev.dataTransfer.setData("text", ev.target.id);
  };

  const drop = (ev) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const targetInput = document.getElementById(data);
    if (targetInput) {
      targetInput.value = data;
    }
  };

  return (
    <Box p="20px 0px">
      <Container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: "20px",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Username: {username}
          <br />
          Register no: {registerNo}
        </Typography>
        {level > 2 ? (
          <Button variant="contained" onClick={() => window.print()}>
            Print result
          </Button>
        ) : (
          <Typography
            variant="h5"
            fontWeight="bold"
            bgcolor="#B0DAFF"
            color="#021526"
            padding="8px 14px"
            border="none"
            borderRadius="5px"
          >
            Score: {score}
          </Typography>
        )}
      </Container>
      {level === 0 && (
        <Box>
          <Container
            sx={{ display: "grid", placeItems: "center", height: "700px" }}
          >
            <Typography variant="h4" color="#FF0000">Identification & labeling bones in a skeleton</Typography>
            <Button
              variant="contained"
              onClick={() => setLevel((prev) => prev + 1)}
            >
              Click here to start
            </Button>
          </Container>
        </Box>
      )}
      {level === 1 && (
        <Container>
          <Typography variant="h6" marginBottom="10px" bgcolor="#FFFF00" textAlign="center" borderRadius="5px">
            Level - {level}
          </Typography>
          <Box sx={{ border: "2px dashed #ccc", p: 2, borderRadius: "5px" }}>
            <Typography
              variant="h6"
              textAlign="center"
              sx={{
                backgroundColor: "#ff0000",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "5px",
                textDecoration: "underline",
              }}
            >
              Identification & labeling bones in a skeleton :
            </Typography>
            <Box
              display="flex"
              flexDirection="row"
              position="relative"
              width="100%"
            >
              <Box
                id="mainimg"
                onDrop={drop}
                onDragOver={allowDrop}
                sx={{
                  width: "660px",
                  marginLeft: "300px",
                  position: "relative",
                }}
              >
                <Box>
                  <img src={imgSkeleton1} alt="human_skeleton" height="800" />
                  <TextField
                    id="humarus"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", left: -172, top: 250 }}
                  />
                  <TextField
                    id="innominate"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", left: -172, top: 320 }}
                  />
                  <TextField
                    id="patella"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", left: -172, bottom: 238 }}
                  />
                  <TextField
                    id="tibia"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", left: -172, bottom: 171 }}
                  />
                  <TextField
                    id="fibula"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", left: -172, bottom: 105 }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "end" }}>
                  <Button onClick={checkAnswers1} variant="contained" color="success">
                    {/* {isNext ? "Next" : "Check"} */}
                    Next
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      )}

      {level === 2 && (
        <Container>
          <Typography variant="h6" marginBottom="10px" bgcolor="#FFFF00" textAlign="center" borderRadius="5px">
            Level - {level}
          </Typography>
          <Box sx={{ border: "2px dashed #ccc", p: 2, borderRadius: "5px" }}>
            <Typography
              variant="h6"
              textAlign="center"
              sx={{
                backgroundColor: "#ff0000",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "5px",
                textDecoration: "underline",
              }}
            >
              Identification & labeling bones in a skeleton :
            </Typography>
            <Box
              display="flex"
              flexDirection="row"
              position="relative"
              width="100%"
            >
              <Box
                id="mainimg"
                onDrop={drop}
                onDragOver={allowDrop}
                sx={{
                  width: "660px",
                  marginLeft: "300px",
                  position: "relative",
                }}
              >
                <Box>
                  <img src={imgSkeleton2} alt="human_skeleton" height="800" />
                  <TextField
                    id="cranium"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", right: -34, top: 35 }}
                  />
                  <TextField
                    id="mandible"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", right: -34, top: 140 }}
                  />
                  <TextField
                    id="rib"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", right: -34, top: 211 }}
                  />
                  <TextField
                    id="vertebra"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", right: -34, top: 285 }}
                  />
                  <TextField
                    id="radius"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", right: -34, top: 350 }}
                  />
                  <TextField
                    id="femur"
                    label="Enter name of this part"
                    onChange={handleChange}
                    sx={{ position: "absolute", right: -34, bottom: 270 }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "end" }}>
                  <Button onClick={checkAnswers2} variant="contained" color="success">
                    {/* {isNext ? "Next" : "Check"} */}
                    Next
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      )}

      {level > 2 && (
        <Container
          sx={{
            width: "100%",
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight="bold"
            mb={"30px"}
          >
            Identification & labeling bones in a skeleton
          </Typography>
          <Box
            sx={{
              width: "400px",
              height: "200px",
              bgcolor: isFinished ? "lightblue" : "#FF0000",
              color: !isFinished && "#FFFFFF",
              padding: "20px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            }}
          >
            <Box>
              <Typography variant="h5">
                {isFinished ? `Well Done ${username} 🎉` : `${username} 😕`}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontSize: "2rem" }}>
                Your total score is <br />
                {score} / 100
              </Typography>
              {!isFinished && (
                <Typography variant="subtitle1" sx={{ fontSize: "1rem" }}>
                  You haven't completed the task properly
                </Typography>
              )}
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default SkeletonExpPart2;
