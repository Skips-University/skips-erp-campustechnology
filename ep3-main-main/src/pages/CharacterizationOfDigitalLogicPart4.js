import React, { useEffect, useState } from "react";
import styles from "./CharacterizationOfDigitalLogic.module.css";
import { Box, Button, Grid, Slider, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import CanvasJSReact from "@canvasjs/react-charts";

// const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

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

function CharacterizationOfDigitalLogicPart4() {
  const [isRedOne, setIsRedOne] = useState(false);
  const [isRedTwo, setIsRedTwo] = useState(false);
  const [isRedThree, setIsRedThree] = useState(false);
  const [isRedFour, setIsRedFour] = useState(false);
  const [isRedFive, setIsRedFive] = useState(false);
  const [isRedSix, setIsRedSix] = useState(false);

  //arrow state for all buttons
  const [isRotateArrow, setIsRotateArrow] = useState(11);
  const [isRotateArrowThree, setIsRotateArrowThree] = useState(13);
  const [isRotateArrowFive, setIsRotateArrowFive] = useState(15);
  const [isRotateArrowSeven, setIsRotateArrowSeven] = useState(17);
  const [isRotateArrowNine, setIsRotateArrowNine] = useState(19);
  const [isRotateArrowEleven, setIsRotateArrowEleven] = useState(21);

  // This state for updating arrow
  const [isRotating, setIsRotating] = useState(true);
  const [isRotatingTwo, setIsRotatingTwo] = useState(true);
  const [isRotatingThree, setIsRotatingThree] = useState(true);
  const [isRotatingFour, setIsRotatingFour] = useState(true);
  const [isRotatingFive, setIsRotatingFive] = useState(true);
  const [isRotatingSix, setIsRotatingSix] = useState(true);

  // State for Figure
  const [showFigureImageLow, setShowFigureImageLow] = useState(false);
  const [showFigureImageHigh, setShowFigureImageHigh] = useState(false);

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

  // Created a Graph
  const options = {
    theme: "light2",
    animationEnabled: true,
    exportEnabled: true,
    title: {
      text: "NAND-2",
    },
    axisY: {
      title: "NAND-2 output((v)",
      suffix: "",
      minimum: 0,
      maximum: 5,
      interval: 1,
    },
    axisX: {
      title: "NAND-2 Input (v)",
      prefix: "",
      minimum: 0,
      maximum: 5,
      interval: 1,
    },
    // axisY: {
    //   title: "NAND-2 OUTPUT[V]",
    // },
    data: [
      {
        type: "area",
        toolTipContent: "Nand-out {x} : {y}",
        dataPoints: [
          { x: 0, y: 3.94 },
          { x: 0.2, y: 3.92 },
          { x: 0.4, y: 3.76 },
          { x: 0.6, y: 3.53 },
          { x: 0.8, y: 3.22 },
          { x: 1, y: 2.02 },
          { x: 1.2, y: 0.31 },
          { x: 1.4, y: 0.17 },
          { x: 1.6, y: 0.15 },
          { x: 1.8, y: 0.15 },
          { x: 2, y: 0.15 },
          { x: 2.2, y: 0.15 },
          { x: 2.4, y: 0.15 },
          { x: 2.6, y: 0.15 },
          { x: 2.8, y: 0.15 },
          { x: 3, y: 0.15 },
          { x: 3.2, y: 0.15 },
          { x: 3.4, y: 0.15 },
          { x: 3.6, y: 0.15 },
          { x: 3.8, y: 0.15 },
          { x: 4, y: 0.15 },
          { x: 4.2, y: 0.15 },
          { x: 4.4, y: 0.15 },
          { x: 4.6, y: 0.15 },
          { x: 4.8, y: 0.15 },
          { x: 5, y: 0.15 },
        ],
      },
    ],
  };

  return (
    <>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={12}>
          <div className={styles.cardWrapperFirst}>
            <div className={styles.wrapper}>
              <Box
                sx={{
                  width: "108px",
                  position: "absolute",
                  zIndex: 2,
                  bottom: "293px",
                  left: "17px",
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
                  bottom: "201px",
                  right: "87px",
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
                  bottom: "172px",
                  right: "87px",
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
                  bottom: "139px",
                  right: "87px",
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
                  bottom: "104px",
                  right: "87px",
                }}
              >
                <Typography>{displayValue}</Typography>
              </Box>

              {/* CharacterizationOfDigitalLogic nand-1 image here */}
              <img
                src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-14-270-nand.png"
                alt="nand1"
                className={styles.backgroundNandImage}
              />

              {/*Switch Button On & Off here*/}
              {/* First button */}
              <img
                src={isRedOne ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedOne ? ${styles.offbtn11} : ${styles.onbtn11}`}
                onClick={handleRotate}
              />

              {/* Second button */}
              <img
                src={!isRedTwo ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedTwo ? ${styles.offbtn12} : ${styles.onbtn12}`}
                onClick={handleRotate2}
              />

              {/* Third button */}
              <img
                src={!isRedThree ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedThree ? ${styles.offbtn13} : ${styles.onbtn13}`}
                onClick={handleRotate1}
              />

              {/* Fourth button */}
              <img
                src={isRedFour ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedFour ? ${styles.offbtn14} : ${styles.onbtn14}`}
                onClick={handleRotate3}
              />

              {/* Five button */}
              <img
                src={!isRedFive ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedFive ? ${styles.offbtn15} : ${styles.onbtn15}`}
                onClick={handleRotate4}
              />

              {/* Six button */}
              <img
                src={!isRedSix ? boxBtnOff : boxBtnOn}
                alt="off&onbtn"
                className={`isRedSix ? ${styles.offbtn16} : ${styles.onbtn16}`}
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
                className={`${styles.arrowDivEle} ${
                  styles[`rotate${isRotateArrowThree}`]
                }`}
              ></div>

              {/* arrow three */}
              <div
                className={`${styles.arrowDivEle} ${
                  styles[`rotate${isRotateArrowFive}`]
                }`}
              ></div>

              {/* arrow four */}
              <div
                className={`${styles.arrowDivEle} ${
                  styles[`rotate${isRotateArrowSeven}`]
                }`}
              ></div>

              {/* arrow five */}
              <div
                className={`${styles.arrowDivEle} ${
                  styles[`rotate${isRotateArrowNine}`]
                }`}
              ></div>

              {/* arrow six */}
              <div
                className={`${styles.arrowDivEle} ${
                  styles[`rotate${isRotateArrowEleven}`]
                }`}
              ></div>
            </div>
          </div>

          {/* Figure image */}
          {showFigure && (
            <>
              <div className={styles.cardWrapperSecond}>
                <Button onClick={() => setShowFigureImage(!showFigureImage)}>
                  Characteristic Plot
                </Button>
                {showFigureImage && (
                  <div>
                    <CanvasJSChart options={options} />
                  </div>
                )}
              </div>

              {/* low-high/high-low graph image */}
              <div className={styles.cardWrapperLowHighImage}>
                <Button
                  onClick={() => setShowFigureImageLow(!showFigureImageLow)}
                >
                  Characteristic Low-High
                </Button>
                <Button
                  onClick={() => setShowFigureImageHigh(!showFigureImageHigh)}
                >
                  Characteristic High-Low
                </Button>
                {showFigureImageLow && (
                  <div>
                    <img
                      src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-12-5018-ch-part3-low.png"
                      className={styles.lowGraphImagepart4}
                    />
                  </div>
                )}
                {showFigureImageHigh && (
                  <div>
                    <img
                      src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-12-5110-ch-part3-high.png"
                      className={styles.highGraphImagepart4}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default CharacterizationOfDigitalLogicPart4;
