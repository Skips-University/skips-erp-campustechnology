import React, { useEffect, useState } from "react";
import styles from "./CharacterizationOfDigitalLogic.module.css";
import { Box, Button, Grid, Slider, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

const boxBtnOff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4024-switchOff.png";

const boxBtnOn =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4112-switchOn.png";

const MAX = 5;
const MIN = 0;
const marks = [
  {
    value: MIN,
    label: "",
  },
  {
    value: MAX,
    label: "",
  },
];

const boxValue = {
  0: 3.94,
  0.2: 3.92,
  0.4: 3.76,
  0.6: 3.53,
  0.8: 3.22,
  1: 2.02,
  1.2: 0.31,
  1.4: 0.17,
  1.6: 0.15,
  1.8: 0.15,
  2: 0.15,
  2.2: 0.15,
  2.4: 0.15,
  2.6: 0.15,
  2.8: 0.15,
  3: 0.15,
  3.2: 0.15,
  3.4: 0.15,
  3.6: 0.15,
  3.8: 0.15,
  4: 0.15,
  4.2: 0.15,
  4.4: 0.15,
  4.6: 0.15,
  4.8: 0.15,
  5: 0.15,
};

function CharacterizationOfDigitalLogic() {
  const [isRedOne, setIsRedOne] = useState(false);
  const [isRedTwo, setIsRedTwo] = useState(false);
  const [isRedThree, setIsRedThree] = useState(false);
  const [isRedFour, setIsRedFour] = useState(false);
  const [isRedFive, setIsRedFive] = useState(false);
  const [isRedSix, setIsRedSix] = useState(false);

  //arrow state for all buttons
  const [isRotateArrow, setIsRotateArrow] = useState(1);
  const [isRotateArrowThree, setIsRotateArrowThree] = useState(3);
  const [isRotateArrowFive, setIsRotateArrowFive] = useState(5);
  const [isRotateArrowSeven, setIsRotateArrowSeven] = useState(7);
  const [isRotateArrowNine, setIsRotateArrowNine] = useState(9);
  const [isRotateArrowEleven, setIsRotateArrowEleven] = useState(11);

  // This state for updating arrow
  const [isRotating, setIsRotating] = useState(true);
  const [isRotatingTwo, setIsRotatingTwo] = useState(true);
  const [isRotatingThree, setIsRotatingThree] = useState(true);
  const [isRotatingFour, setIsRotatingFour] = useState(true);
  const [isRotatingFive, setIsRotatingFive] = useState(true);
  const [isRotatingSix, setIsRotatingSix] = useState(true);

  // Using notiStack for showing error message
  const { enqueueSnackbar } = useSnackbar();

  // State for range
  const [val, setVal] = useState(MIN);
  const [displayValue, setDisplayValue] = useState(boxValue[MIN]);

  // State for figure image
  const [showFigure, setShowFigure] = useState(false);
  const [showFigureImage, setShowFigureImage] = useState(false);

  useEffect(() => {
    setDisplayValue(boxValue[val]);

    if (val === MAX) {
      setShowFigure(true);
    } else {
      setShowFigure(false);
    }
  }, [val]);

  const handleChange = (_, newValue) => {
    setVal(newValue);
  };

  // HandleClick for 1st button
  const handleRotate = () => {
    setIsRedOne(!isRedOne);
    setIsRotateArrow((prev) => {
      let newDeg = isRotating ? prev + 1 : prev - 1;
      return newDeg;
    });

    setIsRotating(!isRotating);
  };

  // HandleClick for 3rd button
  const handleRotate1 = () => {
    setIsRedThree(!isRedThree);
    setIsRotateArrowFive((prev) => {
      let newDeg = isRotatingThree ? prev + 1 : prev - 1;
      return newDeg;
    });

    setIsRotatingThree(!isRotatingThree);
  };

  // HandleClick for 2rd button
  const handleRotate2 = () => {
    setIsRedTwo(!isRedTwo);
    setIsRotateArrowThree((prev) => {
      let newDeg = isRotatingTwo ? prev + 1 : prev - 1;
      return newDeg;
    });

    setIsRotatingTwo(!isRotatingTwo);
  };

  // HandleClick for 4th button
  const handleRotate3 = () => {
    setIsRedFour(!isRedFour);
    setIsRotateArrowSeven((prev) => {
      let newDeg = isRotatingFour ? prev + 1 : prev - 1;
      return newDeg;
    });

    setIsRotatingFour(!isRotatingFour);
  };

  // HandleClick for 5th button
  const handleRotate4 = () => {
    setIsRedFive(!isRedFive);
    setIsRotateArrowNine((prev) => {
      let newDeg = isRotatingFive ? prev + 1 : prev - 1;
      return newDeg;
    });

    setIsRotatingFive(!isRotatingFive);
  };

  // HandleClick for 6th button
  const handleRotate5 = () => {
    setIsRedSix(!isRedSix);
    setIsRotateArrowEleven((prev) => {
      let newDeg = isRotatingSix ? prev + 1 : prev - 1;
      return newDeg;
    });

    setIsRotatingSix(!isRotatingSix);
  };

  // Written enquesnackbar message here
  if (isRedOne || isRedFour) {
    enqueueSnackbar("Connect VCC and Ground proper", {
      variant: "error",
      autoHideDuration: 1000,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "center",
      },
      preventDuplicate: true,
    });
  }

  return (
    <>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={12}>
          <div className={styles.cardWrapperFirst}>
            <div className={styles.wrapper}>
              <Box
                sx={{
                  width: 155,
                  position: "absolute",
                  zIndex: 2,
                  bottom: "75px",
                  left: "288px",
                  padding: "0",
                }}
              >
                <Slider
                  marks={marks}
                  step={0.2}
                  value={val}
                  valueLabelDisplay="auto"
                  min={MIN}
                  max={MAX}
                  onChange={handleChange}
                />
              </Box>
              <Box
                sx={{
                  minWidth: "62px",
                  background: "green",
                  color: "white",
                  textAlign: "center",
                  borderRadius: "5px",
                  boxShadow: "2px 2px 8px grey",
                  position: "absolute",
                  zIndex: 2,
                  bottom: "93px",
                  right: "5px",
                }}
              >
                <Typography>{displayValue}</Typography>
              </Box>
              <Box
                sx={{
                  minWidth: "62px",
                  background: "green",
                  color: "white",
                  textAlign: "center",
                  borderRadius: "5px",
                  boxShadow: "2px 2px 8px grey",
                  position: "absolute",
                  zIndex: 2,
                  bottom: "66px",
                  right: "5px",
                }}
              >
                <Typography>{displayValue}</Typography>
              </Box>

              <Box
                sx={{
                  minWidth: "62px",
                  background: "green",
                  color: "white",
                  textAlign: "center",
                  borderRadius: "5px",
                  boxShadow: "2px 2px 8px grey",
                  position: "absolute",
                  zIndex: 2,
                  bottom: "39px",
                  right: "5px",
                }}
              >
                <Typography>{displayValue}</Typography>
              </Box>

              <Box
                sx={{
                  minWidth: "62px",
                  background: "green",
                  color: "white",
                  textAlign: "center",
                  borderRadius: "5px",
                  boxShadow: "2px 2px 8px grey",
                  position: "absolute",
                  zIndex: 2,
                  bottom: "12px",
                  right: "5px",
                }}
              >
                <Typography>{displayValue}</Typography>
              </Box>

              {/* CharacterizationOfDigitalLogic nand-1 image here */}
              <img
                src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-9-2512-nand (1).jpg"
                alt="nand1"
                className={styles.backgroundImage}
              />

              {/*Switch Button On & Off here*/}
              {/* First button */}
              <img
                src={isRedOne ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedOne ? ${styles.offbtn1} : ${styles.onbtn1}`}
                onClick={handleRotate}
              />

              {/* Second button */}
              <img
                src={!isRedTwo ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedTwo ? ${styles.offbtn2} : ${styles.onbtn2}`}
                onClick={handleRotate2}
              />

              {/* Third button */}
              <img
                src={!isRedThree ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedThree ? ${styles.offbtn3} : ${styles.onbtn3}`}
                onClick={handleRotate1}
              />

              {/* Fourth button */}
              <img
                src={isRedFour ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedFour ? ${styles.offbtn4} : ${styles.onbtn4}`}
                onClick={handleRotate3}
              />

              {/* Five button */}
              <img
                src={!isRedFive ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedFive ? ${styles.offbtn5} : ${styles.onbtn5}`}
                onClick={handleRotate4}
              />

              {/* Six button */}
              <img
                src={!isRedSix ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedSix ? ${styles.offbtn6} : ${styles.onbtn6}`}
                onClick={handleRotate5}
              />

              {/* Arrow line */}
              {/* arrow one */}
              <div
                className={`${styles.arrow} ${
                  styles[`rotate${isRotateArrow}`]
                }`}
              ></div>

              {/* arrow two */}
              <div
                className={`${styles.arrow} ${
                  styles[`rotate${isRotateArrowThree}`]
                }`}
              ></div>

              {/* arrow three */}
              <div
                className={`${styles.arrow} ${
                  styles[`rotate${isRotateArrowFive}`]
                }`}
              ></div>

              {/* arrow four */}
              <div
                className={`${styles.arrow} ${
                  styles[`rotate${isRotateArrowSeven}`]
                }`}
              ></div>

              {/* arrow five */}
              <div
                className={`${styles.arrow} ${
                  styles[`rotate${isRotateArrowNine}`]
                }`}
              ></div>

              {/* arrow six */}
              <div
                className={`${styles.arrow} ${
                  styles[`rotate${isRotateArrowEleven}`]
                }`}
              ></div>
            </div>
          </div>

          {/* Figure image */}
          {showFigure && (
            <div className={styles.cardWrapperSecond}>
              <Button onClick={() => setShowFigureImage(!showFigureImage)}>
                Characteristic Plot
              </Button>
              {!showFigureImage && (
                <img
                  src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-12-5125-nand-2figure.png"
                  className={styles.backgroundFigureImage}
                />
              )}
            </div>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default CharacterizationOfDigitalLogic;
