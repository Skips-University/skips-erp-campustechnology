import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";
import { Autocomplete, Button, TextField } from "@mui/material";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.png";
import img5 from "../assets/img5.png";
import img6 from "../assets/img6.png";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function createData(name, colorName, digit, multiplier, tolerance) {
  return { name, colorName, digit, multiplier, tolerance };
}

const colorMap = {
  Black: "#000000",
  Brown: "#8B4513",
  Red: "#FF0000",
  Orange: "#FFA500",
  Yellow: "#FFFF00",
  Green: "#008000",
  Blue: "#0000FF",
  Violet: "#8A2BE2",
  Grey: "#808080",
  White: "#FFFFFF",
  Gold: "#FFD700",
  Silver: "#C0C0C0",
  None: "#FFFFFF", // No color
};

const optionsmega = [
  { label: "Ω" },
  { label: "KΩ" },
  { label: "MΩ" },
  { label: "GΩ" },
];

const correctAnswers = {
  exp1: { res: "47", unit: "KΩ", tol: "5" },
  exp2: { res: "5.2", unit: "Ω", tol: "10" },
  exp3: { res: "97", unit: "Ω", tol: "20" },
  exp4: { res: "3.3/3300", unit: "KΩ/Ω", tol: "0.1" },
  exp5: { res: "158", unit: "GΩ", tol: "2" },
  exp6: { res: "615", unit: "GΩ", tol: "0.25" },
};

const answerVals = {
  exp1: {
    res: "The value of resistance is 47",
    unit: "The unit is KΩ",
    tol: "The value of tolerance is 5",
  },
  exp2: {
    res: "The value of resistance is 5.2",
    unit: "The unit is Ω",
    tol: "The value of tolerance is 10",
  },
  exp3: {
    res: "The value of resistance is 97",
    unit: "The unit is Ω",
    tol: "The value of tolerance is 20",
  },
  exp4: {
    res: "The value of resistance is 3.3/3300",
    unit: "The unit is KΩ/Ω",
    tol: "The value of tolerance is 0.1",
  },
  exp5: {
    res: "The value of resistance is 158",
    unit: "The unit is GΩ",
    tol: "The value of tolerance is 2",
  },
  exp6: {
    res: "The value of resistance is 615",
    unit: "The unit is GΩ",
    tol: "The value of tolerance is 0.25",
  },
};

const experimentImages = {
  exp1: img1,
  exp2: img2,
  exp3: img3,
  exp4: img4,
  exp5: img5,
  exp6: img6,
};

const rows = [
  createData("", "Black", 0, "10^0", ""),
  createData("Ice cream sandwich", "Brown", 1, "10^1", 1),
  createData("Eclair", "Red", 2, "10^2", 2),
  createData("Cupcake", "Orange", 3, "10^3", ""),
  createData("Gingerbread", "Yellow", 4, "10^4", ""),
  createData("Gingerbread", "Green", 5, "10^5", 0.5),
  createData("Gingerbread", "Blue", 6, "10^6", 0.25),
  createData("Gingerbread", "Violet", 7, "10^7", 0.1),
  createData("Gingerbread", "Grey", 8, "10^8", 0.05),
  createData("Gingerbread", "White", 9, "10^9", ""),
  createData("Gingerbread", "Gold", "", "10^-1", 5),
  createData("Gingerbread", "Silver", "", "10^-2", 10),
  createData("Gingerbread", "None", "", "-", 20),
];

export default function Resistor() {
  const [showExperiment, setShowExperiment] = useState(null);
  const [resistor, setResistor] = useState("");
  const [toleranceValue, setToleranceValue] = useState("");
  const [unit, setUnit] = useState(null);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [currentExperiment, setCurrentExperiment] = useState("");

  const [resistorStyle, setResistorStyle] = useState({});
  const [toleranceStyle, setToleranceStyle] = useState({});
  const [unitStyle, setUnitStyle] = useState({});

  const handleExperimentClick = (exp) => {
    setCurrentExperiment(exp);
    setShowExperiment(exp);
  };

  const handleExperimentClose = () => {
    setShowExperiment(null);
    setResistor("");
    setToleranceValue("");
    setUnit(null);
    setResistorStyle({});
    setToleranceStyle({});
    setUnitStyle({});
  };

  const validateInputs = () => {
    const currentAnswers = correctAnswers[currentExperiment];
    let valid = true;

    if (!resistor || isNaN(resistor)) {
      setResistorStyle({ borderColor: "red" });
      valid = false;
    } else {
      setResistorStyle({
        borderColor: resistor === currentAnswers.res ? "green" : "red",
      });
    }

    if (!toleranceValue || isNaN(toleranceValue)) {
      setToleranceStyle({ borderColor: "red" });
      valid = false;
    } else {
      setToleranceStyle({
        borderColor: toleranceValue === currentAnswers.tol ? "green" : "red",
      });
    }

    if (!unit) {
      setUnitStyle({ borderColor: "red" });
      valid = false;
    } else {
      setUnitStyle({
        borderColor: unit === currentAnswers.unit ? "green" : "red",
      });
    }

    return valid;
  };

  const handleCheck = () => {
    validateInputs();
  };

  const showCheckAnswerButtonDisabled = !resistor || !toleranceValue || !unit;
  return (
    <>
      <Typography variant="h5">Color Code for Resistor</Typography>
      <div className="csstop">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>ColorBand</StyledTableCell>
                <StyledTableCell align="right">ColorName</StyledTableCell>
                <StyledTableCell align="right">Digit</StyledTableCell>
                <StyledTableCell align="right">Multiplier</StyledTableCell>
                <StyledTableCell align="right">
                  Tolerance&nbsp;(%)
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <StyledTableRow>
                  <StyledTableCell component="th" scope="row">
                    <div
                      style={{
                        width: 90,
                        height: 20,
                        backgroundColor: colorMap[row.colorName] || "#FFFFFF",
                        display: "inline-block",
                        marginRight: 8,
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.colorName}
                  </StyledTableCell>
                  <StyledTableCell align="right">{row.digit}</StyledTableCell>
                  <StyledTableCell align="right">
                    {row.multiplier}&nbsp;Ω
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.tolerance}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* ResistorButtons */}
      <div className="csstop">
        {showExperiment === null ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {[...Array(6).keys()].map((i) => (
              <Button
                key={`exp${i + 1}`}
                fullWidth
                variant="contained"
                onClick={() => handleExperimentClick(`exp${i + 1}`)}
              >
                Open Experiment {i + 1}
              </Button>
            ))}
          </div>
        ) : (
          <div style={{ width: "100%" }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleExperimentClose}
            >
              Close Experiment
            </Button>
            <Card sx={{ maxWidth: "100%" }}>
              <CardMedia
                sx={{
                  height: 140,
                  width: "50%",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
                image={experimentImages[currentExperiment]}
                title={`Experiment ${showExperiment.charAt(3)}`}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {`Resistor ${showExperiment.charAt(3)}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <TextField
                    fullWidth
                    label="Enter the resistance value"
                    id="resistor"
                    sx={{ margin: "10px 0px", ...resistorStyle }}
                    value={resistor}
                    onChange={(e) => setResistor(e.target.value)}
                    error={resistorStyle.borderColor === "red"}
                    helperText={
                      resistorStyle.borderColor === "red"
                        ? "Invalid resistance value"
                        : ""
                    }
                  />
                  <Autocomplete
                    disablePortal
                    id="unit-selector"
                    options={optionsmega}
                    value={unit ? { label: unit } : null}
                    onChange={(event, newValue) =>
                      setUnit(newValue?.label || null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unit"
                        error={unitStyle.borderColor === "red"}
                        helperText={
                          unitStyle.borderColor === "red"
                            ? "Please select a valid unit"
                            : ""
                        }
                        sx={{ ...unitStyle }}
                      />
                    )}
                  />
                  <TextField
                    fullWidth
                    label="Enter the tolerance +/-"
                    id="tolerance"
                    value={toleranceValue}
                    onChange={(e) => setToleranceValue(e.target.value)}
                    sx={{ margin: "10px 0px", ...toleranceStyle }}
                    error={toleranceStyle.borderColor === "red"}
                    helperText={
                      toleranceStyle.borderColor === "red"
                        ? "Invalid tolerance value"
                        : ""
                    }
                  />
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={handleCheck}>
                  Check
                </Button>
                <Button
                  size="small"
                  onClick={() => setAnswerVisible(true)}
                  disabled={showCheckAnswerButtonDisabled}
                >
                  Show Answer
                </Button>
              </CardActions>
              {answerVisible && (
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="left"
                  >
                    <p>{answerVals[currentExperiment].res}</p>
                    <p>{answerVals[currentExperiment].unit}</p>
                    <p>{answerVals[currentExperiment].tol}</p>
                  </Typography>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
