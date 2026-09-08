import React, { useState } from "react";
import { Box, TextField, Button, Container, Typography } from "@mui/material";

const imgSkeleton =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-5837-skeleton_part2_new.png";

const SkeletonExpPart2 = () => {
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInputs({ ...inputs, [id]: value });
  };

  const checkAnswers = () => {
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

    const isCorrect = Object.keys(correctAnswers).every(
      (key) => inputs[key] === correctAnswers[key]
    );

    if (isCorrect) {
      alert("Correct");
    } else {
      alert("Enter a correct value");
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
    <Container sx={{ border: "2px dashed #ccc", p: 2, borderRadius: "5px" }}>
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
      <Box display="flex" flexDirection="row" position="relative" width="100%">
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
            <img src={imgSkeleton} alt="human_skeleton" height="800" />
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
            <Button onClick={checkAnswers} variant="contained">
              Check
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SkeletonExpPart2;
