import React, { useState } from "react";
import global1 from "./global1";
import {
  Box,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

const getMoldImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-274-get_mold.png";
const mortarImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-4848-fill_solution.png";
const microwave =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-4916-microwave_img.png";
const sampleBeakerImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-505-sample.png";
const sampleTiledBeakerImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-5043-sample_tiled.png";
const mortarActiveImg2 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-5120-solution.png";
const mortarActiveImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-520-solution_fill.png";
const solventBeakerImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-5233-solvent.png";
const solventTiledBeakerImg =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-26-5313-solventTiled.png";

const mortarDefaultImg = mortarImg;

// Create a username and register no
const username = global1.name;
const registerNo = global1.regno;

const GetMold = () => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [apparatus, setApparatus] = useState({
    sampleBeaker: false,
    solventBeaker: false,
    mortar: false,
    irplate: false,
    desiccator: false,
  });
  const { sampleBeaker, solventBeaker, mortar, irplate, desiccator } =
    apparatus;

  const [sampleBeakerRotation, setSampleBeakerRotation] = useState(0);
  const [solventBeakerRotation, setSolventBeakerRotation] = useState(0);
  const [currentSampleBeakerImg, setCurrentSampleBeakerImg] =
    useState(sampleBeakerImg);
  const [currentSolventBeakerImg, setCurrentSolventBeakerImg] =
    useState(solventBeakerImg);
  const [currentMortarImg, setCurrentMortarImg] = useState(mortarDefaultImg);
  const [isSampleBeakerClicked, setIsSampleBeakerClicked] = useState(false);
  const [finalMotorImage, setFinalMotorImage] = useState(false);
  const [animateMortar, setAnimateMortar] = useState(false);
  const [animateMold, setAnimateMold] = useState(false);
  const [showMoldImg, setShowMoldImg] = useState(false);
  const [showMortarImages, setShowMortarImages] = useState(true);
  const [microwaveClicked, setMicrowaveClicked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Track if the actions have been completed
  const [sampleBeakerUsed, setSampleBeakerUsed] = useState(false);
  const [solventBeakerUsed, setSolventBeakerUsed] = useState(false);
  const [microwaveUsed, setMicrowaveUsed] = useState(false);
  const [isMortarClicked, setIsMortarClicked] = useState(false);

  const handleSampleBeakerClick = () => {
    if (!sampleBeakerUsed) {
      setSampleBeakerUsed(true);
      setSampleBeakerRotation(90);
      setCurrentSampleBeakerImg(sampleTiledBeakerImg);
      setCurrentMortarImg(mortarActiveImg2);
      setIsSampleBeakerClicked(true);

      setTimeout(() => {
        setSampleBeakerRotation(0);
        setCurrentSampleBeakerImg(sampleBeakerImg);
        setCurrentMortarImg(mortarDefaultImg);
        setIsSampleBeakerClicked(false);
      }, 2000);

      setScore((prev) => Math.min(prev + 30, 100));
    } else {
      alert("Don't touch again.");
    }
  };

  const handleSolventBeakerClick = () => {
    if (isSampleBeakerClicked && !solventBeakerUsed) {
      setSolventBeakerUsed(true);
      setSolventBeakerRotation(-90);
      setCurrentSolventBeakerImg(solventTiledBeakerImg);
      setCurrentMortarImg(mortarActiveImg);

      setTimeout(() => {
        setSolventBeakerRotation(0);
        setCurrentSolventBeakerImg(solventBeakerImg);
      }, 2000);
      setScore((prev) => Math.min(prev + 20, 100));
    } else {
      alert("Don't touch again.");
    }
    setFinalMotorImage(true);
  };

  const handleMortarClick = () => {
    if (!finalMotorImage) return;
    setAnimateMortar(true);
    setIsMortarClicked(true);
    setTimeout(() => {
      setShowMortarImages(false);
    }, 2000);
  };

  const handleMicrowaveClick = () => {
    if (!microwaveClicked && isMortarClicked) {
      setShowMoldImg(true);
      setAnimateMold(true);
      setMicrowaveClicked(true);
      setScore((prev) => Math.min(prev + 50, 100));
      setIsFinished(true);
      setTimeout(() => {
        setAnimateMold(false);
      }, 2000);
    } else {
      alert("Don't touch again.");
    }
  };

  return (
    <Box p="40px 0px">
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
        {level > 1 ? (
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
        <Container
          sx={{ border: "5px solid green", p: "10px 0px", borderRadius: "5px" }}
        >
          <Typography variant="h4" textAlign="center" fontWeight="bold">
            Preparation of Gels
          </Typography>
          <Box>
            <Typography
              variant="h6"
              textAlign="center"
              fontWeight="bold"
              mt="30px"
            >
              Task Instructions
            </Typography>
            <Typography
              variant="subtitle2"
              textAlign="justify"
              bgcolor="lightblue"
              fontSize="20px"
              fontWeight="300"
              width="80%"
              mx="auto"
              p="20px"
            >
              {/* Theory content here */}
              <ol style={{ marginLeft: "20px" }}>
                <li>
                  Click on the Agarose Beaker option in the Apparatus Menu to
                  introduce it into the workspace.
                </li>
                <li>
                  Click on the Buffer Solution Beaker option in the Apparatus
                  Menu to introduce it into the workspace.
                </li>
                <li>
                  Click on the Solution Beaker option in the Apparatus Menu to
                  introduce it into the workspace.
                </li>
                <li>
                  Click on the Microwave option in the Apparatus Menu to
                  introduce it into the workspace.
                </li>
                <li>
                  Click on the Gel Mold option in the Apparatus Menu to
                  introduce it into the workspace.
                </li>
                <li>
                  Click on the Agarose Beaker to transfer a small amount (around
                  1 mg) of Agarose into the empty Solution Beaker.
                </li>
                <li>
                  Click on the Buffer Beaker to transfer 5 ml of the Buffer
                  Solution to the Solution Beaker.
                </li>
                <li>
                  Click on the Solution Beaker to shake it and make a clear
                  solution.
                </li>
                <li>
                  Click on the Solution Beaker to place it in the Microwave. The
                  solution needs to be heated at high temperature for some time.
                </li>
                <li>
                  Click on the Microwave now to take out the Solution Beaker.
                </li>
                <li>
                  Click on the Solution Beaker to transfer some amount of the
                  Gel Solution to the Gel Mold.
                </li>
                <li>
                  Wait for the Gel Solution to cool down in the mold, and then
                  you have successfully prepared your Gel.
                </li>
                <li>
                  Click on the Restart option in the Control Menu to restart the
                  experiment from scratch.
                </li>
              </ol>
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              my: "30px",
            }}
            onClick={() => setLevel((prev) => prev + 1)}
          >
            Click to start
          </Button>
        </Container>
      )}

      {level === 1 && (
        <Container>
          <Typography variant="h6">Level - {level}</Typography>
          <Box sx={{ display: "flex", margin: "40px 0px" }}>
            <Box sx={{ width: "20%" }}>
              <Box>
                <Typography variant="h6">Apparatus Menu</Typography>
                <List>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        setApparatus((prev) => ({
                          ...prev,
                          sampleBeaker: true,
                        }))
                      }
                    >
                      <ListItemText primary="Agarose Beaker" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        setApparatus((prev) => ({
                          ...prev,
                          solventBeaker: true,
                        }))
                      }
                    >
                      <ListItemText primary="Buffer Solution Beaker" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        setApparatus((prev) => ({ ...prev, mortar: true }))
                      }
                    >
                      <ListItemText primary="Solution Beaker" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        setApparatus((prev) => ({ ...prev, irplate: true }))
                      }
                    >
                      <ListItemText primary="Gel Mold" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        setApparatus((prev) => ({ ...prev, desiccator: true }))
                      }
                    >
                      <ListItemText primary="Microwave" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Box>
            <Box
              sx={{
                width: "80%",
                height: "500px",
                padding: "20px",
                border: "2px solid green",
                display: "flex",
              }}
            >
              <Grid container sx={{ display: "flex" }}>
                <Grid item xs={8}>
                  <Grid container>
                    <Grid item xs={5}>
                      {sampleBeaker && (
                        <>
                          <img
                            src={currentSampleBeakerImg}
                            alt="sampleBeaker"
                            height={"200px"}
                            onClick={handleSampleBeakerClick}
                            style={{
                              transform: `rotate(${sampleBeakerRotation}deg)`,
                              transition: "transform 0.5s",
                              position: "relative",
                              cursor: "pointer",
                            }}
                          />
                          <Typography textAlign="center" width="144px">
                            Agarose Beaker
                          </Typography>
                        </>
                      )}
                    </Grid>
                    <Grid item xs={7}>
                      {solventBeaker && (
                        <>
                          <img
                            src={currentSolventBeakerImg}
                            alt="solventBeaker"
                            height={"200px"}
                            onClick={handleSolventBeakerClick}
                            style={{
                              transform: `rotate(${solventBeakerRotation}deg)`,
                              transition: "transform 0.5s",
                              position: "relative",
                              right: "93px",
                              cursor: "pointer",
                            }}
                          />
                          <Typography
                            textAlign="center"
                            width="144px"
                            position="relative"
                            right="74px"
                          >
                            Buffer Beaker
                          </Typography>
                        </>
                      )}
                    </Grid>
                    <Grid
                      item
                      width="53%"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {finalMotorImage && showMortarImages ? (
                        <img
                          src={mortarActiveImg}
                          alt="mortar"
                          onClick={handleMortarClick}
                          style={{
                            animation: animateMortar
                              ? "moveRight 2s forwards"
                              : "none",
                            cursor: "pointer",
                            transformOrigin: "center",
                          }}
                        />
                      ) : (
                        mortar &&
                        showMortarImages && (
                          <img src={currentMortarImg} alt="mortar" />
                        )
                      )}
                    </Grid>
                    <Grid item sx={{ display: "grid", placeItems: "center" }}>
                      {irplate && showMoldImg && (
                        <img
                          src={getMoldImg}
                          alt="mold"
                          width="250px"
                          style={{
                            animation: animateMold
                              ? "moveLeft 2s forwards"
                              : "none",
                          }}
                        />
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={4}>
                  {desiccator && (
                    <img
                      src={microwave}
                      onClick={handleMicrowaveClick}
                      alt="microwave"
                      width="300px"
                      style={{
                        cursor: microwaveClicked ? "not-allowed" : "pointer",
                        marginTop: "190px",
                      }}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          </Box>

          <style>
            {`
              @keyframes moveRight {
                0% { transform: translateX(0) scale(1); opacity: 1; }
                99% { opacity: 1; }
                100% { transform: translateX(600px) scale(0.5); opacity: 0; }
              }

              @keyframes moveLeft {
                0% { transform: translateX(300px) scale(0.5); opacity: 1; }
                99% { opacity: 0; }
                100% { transform: translateX(0) scale(1); opacity: 0; }
              }
            `}
          </style>

          <Button
            variant="contained"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              my: "30px",
            }}
            onClick={() => setLevel((prev) => prev + 1)}
          >
            Next
          </Button>
        </Container>
      )}

      {level > 1 && (
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
            Preparation of Gels
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

export default GetMold;
