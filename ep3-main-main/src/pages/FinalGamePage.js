import {
  Avatar,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";

// const username = "rohit mehra";
// const regno = "223kkv345";

// const avatarImg =
//   "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/50dab922-5d48-4c6b-8725-7fd0755d9334/3a3f2d35-8167-4708-9ef0-bdaa980989f9.png";

function FinalGamePage({
  username,
  regno,
  profileImg,
  objective,
  score,
  title,
  rating,
}) {
  const progressValue = score; // Set progress value (0-100)
  const [congra, setCongra] = useState("");
  const [img, setImg] = useState(profileImg);

  useEffect(() => {
    if (progressValue >= 91 && progressValue <= 100) {
      setCongra("Excellent");
    } else if (progressValue >= 71 && progressValue <= 90) {
      setCongra("Very Good");
    } else if (progressValue >= 51 && progressValue <= 70) {
      setCongra("Not Bad");
    } else {
      setCongra("Poor");
    }
  }, [progressValue]);

  // Function to determine color based on progress value
  const getProgressColor = (value) => {
    if (value >= 91) return "#4caf50"; // Green
    if (value >= 71) return "#ffeb3b"; // Yellow
    if (value >= 51) return "#ff9800"; // Orange
    return "#f44336"; // Red
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          backgroundColor: "#4c82af",
          // placeItems: "center",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "30px 0px",
        }}
      >
        <Box
          sx={{
            px: "3%",
            pb: "3%",
            width: "70%",
            // fontFamily: "Roboto, sans-serif",
            // fontFamily: "Playfair Display, serif",
          }}
        >
          <Typography
            sx={{
              // mt: "0px",
              fontFamily: "Playfair Display, serif",
              fontWeight: 500,
              fontSize: "40px",
              color: "#FFF",
            }}
            textAlign="center"
            variant="h5"
          >
            {title}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <img
              src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-2048-FullLogo_Transparent_NoBuffer.png"
              alt="ct_logo"
              style={{ width: "120px" }}
            />
            <Button
              variant="contained"
              onClick={handlePrint}
              sx={{ mt: 2, backgroundColor: "#4c82af" }}
            >
              Print Result
            </Button>
          </Box>
          <Box>
            <Grid container>
              <Grid item md="12" sx={{ backgroundColor: "#fbd37d" }}>
                <Grid container sx={{ padding: "10px" }}>
                  <Grid
                    item
                    md="3"
                    xs="12"
                    sm="12"
                    sx={{ display: "grid", placeItems: "center" }}
                  >
                    <Avatar
                      alt={username}
                      src={img ? profileImg : ""}
                      sx={{
                        width: "100px",
                        height: "100px",
                        boxShadow: "rgba(3, 102, 214, 0.3) 0px 0px 0px 3px",
                        textTransform: "uppercase",
                        objectFit: "cover",
                        fontSize: "40px",
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    md="9"
                    xs="12"
                    sm="12"
                    sx={{
                      paddingTop: "2px",
                      paddingLeft: "12px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        textTransform: "capitalize",
                        fontFamily: "Playfair Display, serif",
                        fontWeight: 600,
                        fontSize: "34px",
                        letterSpacing: "1px",
                      }}
                    >
                      {username}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        textTransform: "capitalize",
                        fontFamily: "revert",
                        fontWeight: 300,
                        fontSize: "20px",
                        letterSpacing: "1px",
                      }}
                    >
                      {regno}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item md="12">
                <Grid container sx={{ minHeight: "300px", overflow: "hidden" }}>
                  <Grid
                    item
                    md="8"
                    xs="12"
                    sm="12"
                    sx={{
                      fontFamily: "Playfair Display, serif",
                      fontWeight: 300,
                      fontSize: "16px",
                      backgroundColor: "#FFFFFF",
                      padding: "10px 16px",
                      textAlign: "justify",
                      // paddingLeft: "40px",
                      // paddingRight: "30px",
                      // paddingTop: "10px",
                      // paddingBottom: "20px",
                    }}
                  >
                    <b>Objective:</b>
                    <br />
                    {objective}
                    <br />
                    <br />
                    <span style={{ fontWeight: 600, fontSize: "16px" }}>
                      {" "}
                      {rating}
                    </span>
                  </Grid>
                  <Grid
                    item
                    md="4"
                    xs="12"
                    sm="12"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#c1dfe1",
                      padding: "20px",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontFamily: "Playfair Display, serif",
                        fontWeight: 700,
                      }}
                    >
                      Overall Score
                    </Typography>
                    <CircularProgress
                      variant="determinate"
                      value={progressValue}
                      size={100}
                      sx={{
                        color: getProgressColor(progressValue), // Change color based on progress
                        position: "relative",
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        position: "absolute",
                        transform: "translate(-50%, 50%)",
                        left: "50%",
                        top: "30%",
                        fontSize: "36px",
                        // fontFamily: "Playfair Display, serif",
                        fontWeight: 600,
                      }}
                    >
                      {`${progressValue}`}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        mt: 2,
                        color: "#2c2724",
                        fontFamily: "Playfair Display, serif",
                        fontWeight: 700,
                      }}
                    >
                      "{congra}"
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="success"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                my: "30px",
              }}
              onClick={() => window.location.reload()}
            >
              Play Again
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default FinalGamePage;
