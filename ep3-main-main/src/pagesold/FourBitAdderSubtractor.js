import React, { useState } from "react";
import styles from "./FourBitAdderSubtractor.module.css";
import { Grid } from "@mui/material";

const circleOff1 =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-355-circleBtnOn.png";

const circleOn1 =
  " https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-5-4059-circleBtnOff.png";

const circleOff =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-8-4818-off.png";

const circleOn =
  "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-8-4752-on.png";

function FourBitAdderSubtractor() {
  const [isRedOne, setIsRedOne] = useState(false);
  const [isRedTwo, setIsRedTwo] = useState(false);
  const [isRedThree, setIsRedThree] = useState(false);
  const [isRedFour, setIsRedFour] = useState(false);
  const [isRedFive, setIsRedFive] = useState(false);
  const [isRedSix, setIsRedSix] = useState(false);
  const [isRedSeven, setIsRedSeven] = useState(false);
  const [isRedEight, setIsRedEight] = useState(false);
  const [isRedNine, setIsRedNine] = useState(false);

  const lightOn = isRedOne || isRedTwo;
  const lightOn1 = isRedThree || isRedFour;
  const lightOn2 = isRedThree && isRedFour;
  const lightOn3 = isRedOne && isRedTwo;
  const lightOn4 = isRedFive || isRedSix;
  const lightOn5 = isRedFive && isRedSix;
  const lightOn6 = isRedSeven || isRedEight;
  const lightOn7 = isRedSeven && isRedEight;
  const lightOn8 = isRedNine && isRedSeven;
  const lightOn9 = isRedNine && isRedFive;
  const lightOn10 = isRedNine && isRedThree;
  const lightOn12 = isRedNine && isRedSeven && isRedFive;
  const lightOn13 =
    (isRedNine && isRedSeven && isRedThree) ||
    (isRedNine && isRedFive && isRedThree);
  const lightOn14 =
    (isRedNine && isRedThree && isRedOne) ||
    (isRedNine && isRedFive && isRedOne) ||
    (isRedNine && isRedSeven && isRedOne);
  const lightOff1 = isRedNine && isRedEight && isRedSeven;

  //   const lightOn13 = isRedNine && isRedSeven && isRedFive

  return (
    <>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={12}>
          <div className={styles.csstop}>
            <div className={styles.wrapper}>
              {/* HalfSubtractor image here */}
              <img
                src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/8-2024-8-5014-adder-subtractor.png"
                alt="HalfSubTractor"
                className={styles.backgroundImage}
              />

              {/* On & Off Button B3 & A3*/}
              <img
                src={!isRedOne ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedOne ? ${styles.offbtn1} : ${styles.onbtn1}`}
                onClick={() => setIsRedOne(!isRedOne)}
              />

              <img
                src={!isRedTwo ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedOne ? ${styles.offbtn2} : ${styles.onbtn2}`}
                onClick={() => setIsRedTwo(!isRedTwo)}
              />

              {/* Button B2 & A2 */}
              <img
                src={!isRedThree ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedThree ? ${styles.offbtn7} : ${styles.onbtn7}`}
                onClick={() => setIsRedThree(!isRedThree)}
              />

              <img
                src={!isRedFour ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedFour ? ${styles.offbtn8} : ${styles.onbtn8}`}
                onClick={() => setIsRedFour(!isRedFour)}
              />

              {/* Button B1 & A1 */}
              <img
                src={!isRedFive ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedFive ? ${styles.offbtn9} : ${styles.onbtn9}`}
                onClick={() => setIsRedFive(!isRedFive)}
              />

              <img
                src={!isRedSix ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedSix ? ${styles.offbtn10} : ${styles.onbtn10}`}
                onClick={() => setIsRedSix(!isRedSix)}
              />

              {/* Button B0 & A0 */}
              <img
                src={!isRedSeven ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedSeven ? ${styles.offbtn11} : ${styles.onbtn11}`}
                onClick={() => setIsRedSeven(!isRedSeven)}
              />

              <img
                src={!isRedEight ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedEight ? ${styles.offbtn12} : ${styles.onbtn12}`}
                onClick={() => setIsRedEight(!isRedEight)}
              />

              {/* Button A/S */}
              <img
                src={!isRedNine ? circleOff : circleOn}
                alt="offbtn"
                className={`isRedNine ? ${styles.offbtn13} : ${styles.onbtn13}`}
                onClick={() => setIsRedNine(!isRedNine)}
              />

              {/* Circle Off Buttons */}
              <img src={circleOff1} alt="offbtn" className={styles.offbtn3} />
              <img src={circleOff1} alt="offbtn" className={styles.offbtn5} />
              <img src={circleOff1} alt="offbtn" className={styles.offbtns2} />
              <img src={circleOff1} alt="offbtn" className={styles.offbtns1} />
              <img src={circleOff1} alt="offbtn" className={styles.offbtns0} />

              {lightOn && !lightOn3 && (
                <img src={circleOn1} alt="offbtn" className={styles.onbtn6} />
              )}

              {lightOn3 && (
                <>
                  <img src={circleOn1} alt="onbtn" className={styles.onbtn4} />
                  <img
                    src={circleOff1}
                    alt="offbtn"
                    className={styles.offbtn5}
                  />
                </>
              )}

              {lightOn1 && !lightOn2 && (
                <img src={circleOn1} alt="onbtns2" className={styles.onbtns2} />
              )}

              {lightOn2 && (
                <>
                  <img src={circleOn1} alt="onbtn6" className={styles.onbtn6} />
                  <img
                    src={circleOff1}
                    alt="offbtns2"
                    className={styles.offbtns2}
                  />
                </>
              )}

              {lightOn4 && (
                <img src={circleOn1} alt="onbtns1" className={styles.onbtns1} />
              )}

              {lightOn5 && (
                <>
                  <img
                    src={circleOn1}
                    alt="onbtns2"
                    className={styles.onbtns2}
                  />
                  <img
                    src={circleOff1}
                    alt="offbtns1"
                    className={styles.offbtns1}
                  />
                </>
              )}

              {lightOn6 && (
                <img src={circleOn1} alt="onbtns0" className={styles.onbtns0} />
              )}

              {lightOn7 && (
                <>
                  <img
                    src={circleOn1}
                    alt="onbtns1"
                    className={styles.onbtns1}
                  />
                  <img
                    src={circleOff1}
                    alt="offbtns0"
                    className={styles.offbtns0}
                  />
                </>
              )}

              {isRedNine && (
                <img src={circleOn1} alt="onbtn4" className={styles.onbtn4} />
              )}

              {lightOn8 && !isRedEight && (
                <>
                  <img
                    src={circleOn1}
                    alt="onbtns0"
                    className={styles.onbtns0}
                  />
                  <img
                    src={circleOn1}
                    alt="onbtns1"
                    className={styles.onbtns1}
                  />
                  <img
                    src={circleOn1}
                    alt="onbtns2"
                    className={styles.onbtns2}
                  />
                  <img src={circleOn1} alt="onbtn6" className={styles.onbtn6} />
                  <img
                    src={circleOff1}
                    alt="offbtn3"
                    className={styles.offbtn3}
                  />
                </>
              )}

              {lightOn9 && (
                <>
                  <img
                    src={circleOn1}
                    alt="onbtns1"
                    className={styles.onbtns1}
                  />
                  <img
                    src={circleOn1}
                    alt="onbtns2"
                    className={styles.onbtns2}
                  />
                  <img src={circleOn1} alt="onbtn6" className={styles.onbtn6} />
                  <img
                    src={circleOff1}
                    alt="offbtn3"
                    className={styles.offbtn3}
                  />
                </>
              )}

              {lightOn12 && (
                <img
                  src={circleOff1}
                  alt="offbtns1"
                  className={styles.offbtns1}
                />
              )}

              {lightOn10 && (
                <>
                  <img
                    src={circleOn1}
                    alt="onbtns2"
                    className={styles.onbtns2}
                  />
                  <img src={circleOn1} alt="onbtn6" className={styles.onbtn6} />
                  <img
                    src={circleOff1}
                    alt="offbtn3"
                    className={styles.offbtn3}
                  />
                </>
              )}

              {lightOn13 && (
                <img
                  src={circleOff1}
                  alt="offbtns2"
                  className={styles.offbtns2}
                />
              )}

              {lightOn14 && (
                <img
                  src={circleOff1}
                  alt="offbtn5"
                  className={styles.offbtn5}
                />
              )}

              {lightOff1 && (<img
                  src={circleOff1}
                  alt="offbts1"
                  className={styles.offbtns1}
                />)}
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  );
}

export default FourBitAdderSubtractor;
