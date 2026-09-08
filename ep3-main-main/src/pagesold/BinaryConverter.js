import React, { useState } from "react";
import { Box, TextField, Button, Typography, Grid, Container } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./BinaryConverter.module.css";

function BinaryConverter() {
    const [decimalNumber, setDecimalNumber] = useState("");
    const [bitsExponent, setBitsExponent] = useState("");
    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const handleSubmit = () => {
       
        if (!decimalNumber || isNaN(decimalNumber)) {
            toast.error("Please enter a valid decimal number");
            return;
        }

        const bitsExponentValue = parseInt(bitsExponent, 10);
        if (bitsExponentValue < 1 || bitsExponentValue > 6) {
            toast.error("Bits For Exponent should be between 1 and 6");
            return;
        }

        const decimal = parseFloat(decimalNumber);

      
        if (decimal === 0) {
            setResults({
                binaryRepresentation: "0",
                integralPart: "0",
                fractionalPart: "0",
                binaryRepresentationOfNumber: "0.0",
                normalizedNumber: "0.0 x 2^0",
                bias: 2 ** (bitsExponentValue - 1) - 1,
                sign: "0",
                mantissa: "00000000",
                exponentDecimal: "0",
                binary8Bit: "00000000",
            });
            setShowResults(true);
            return;
        }

        // Convert decimal to binary string
        const integralPart = Math.floor(decimal).toString(2);
        let fractionalPart = (decimal % 1).toFixed(8).substring(2); // limiting to 8 decimal places

        // Normalize the number
        let exponent = 0;
        let normalizedIntegral = integralPart;
        let normalizedFractional = fractionalPart;

        // Normalize the integral part
        if (integralPart.length > 0) {
            normalizedIntegral = integralPart;
            exponent = integralPart.length - 1;
        } else {
           
            while (parseFloat(`0.${fractionalPart}`) < 1 && fractionalPart.length > 0) {
                fractionalPart = fractionalPart.slice(1);
                exponent -= 1;
            }
            normalizedIntegral = "0";
        }

        const normalizedNumber = `${normalizedIntegral.length > 0 ? normalizedIntegral[0] : "0"}.${normalizedIntegral.length > 1 ? normalizedIntegral.slice(1) : "0"}${fractionalPart}`;
        const bias = 2 ** (bitsExponentValue - 1) - 1;
        const exponentValue = exponent + bias;

     
        if (exponentValue < 0 || exponentValue >= 2 ** bitsExponentValue) {
            toast.error("Exponent value out of range for the given bit size");
            return;
        }

        const exponentBinary = exponentValue.toString(2).padStart(bitsExponentValue, "0");

     
        let mantissa = normalizedIntegral.slice(1) + fractionalPart;
        mantissa = mantissa.slice(0, 8).padEnd(8, "0");

       
        const totalLength = 1 + bitsExponentValue + mantissa.length; 
        if (totalLength > 8) {
            const excessBits = totalLength - 8;
            mantissa = mantissa.slice(0, 8 - bitsExponentValue); 
        }

        // Construct 8-bit binary representation
        const signBit = decimal < 0 ? "1" : "0";
        const binary8Bit = `${signBit}${exponentBinary}${mantissa}`;

        setResults({
            binaryRepresentation: decimal.toString(2),
            integralPart: integralPart,
            fractionalPart: fractionalPart,
            binaryRepresentationOfNumber: `${integralPart}.${fractionalPart}`,
            normalizedNumber: `${normalizedIntegral[0]}.${normalizedIntegral.slice(1)}${fractionalPart} x 2^${exponent}`,
            bias: bias,
            sign: signBit,
            mantissa: mantissa,
            exponentDecimal: exponentValue,
            binary8Bit: binary8Bit.slice(0, 8), 
        });

        setShowResults(true);
    };

    return (
        <Container className={styles.container}>
            <Typography variant="h5" textAlign="center" fontWeight="bold" marginBlock="30px" color="primary" gutterBottom>
                Floating Point Numbers Representation
            </Typography>
            {decimalNumber && bitsExponent ? (
                <Typography variant="h5" className={styles.notificationBar} gutterBottom>
                    Click on submit to get result
                </Typography>
            ) :
                (<Typography variant="h5" className={styles.notificationBar} gutterBottom>
                    Enter the decimal number and bits for exponent to be converted
                </Typography>)}
            <Box className={styles.wrapperBox}>
                <div className={styles.inputSection}>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Decimal Number"
                                variant="outlined"
                                fullWidth
                                value={decimalNumber}
                                onChange={(e) => setDecimalNumber(e.target.value)}

                            />
                        </Grid>
                        <Grid item sm={6} />

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Bits For Exponent (1-6)"
                                variant="outlined"
                                fullWidth
                                value={bitsExponent}
                                onChange={(e) => setBitsExponent(e.target.value)}
                                helperText="Enter a value between 1 and 6"

                            />
                        </Grid>
                        <Grid item xs={12} sm={6} />

                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                className={styles.buttonPrimary}
                                fullWidth
                                onClick={handleSubmit}
                            >
                                Submit
                            </Button>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Button
                                variant="outlined"
                                className={styles.buttonSecondary}
                                fullWidth
                                onClick={() => {
                                    setDecimalNumber("");
                                    setBitsExponent("");
                                    setShowResults(false);
                                    setResults(null);
                                }}
                            >
                                Reset
                            </Button>
                        </Grid>
                    </Grid>
                </div>

                {results && (
                    <div className={`${styles.resultsSection} ${showResults ? "visible" : ""}`}>
                        <Typography variant="h6" color="primary" fontWeight="600" align="center" marginBottom="20px" gutterBottom>
                            Results
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    8-bit binary:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.binary8Bit}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    Binary Representation Of Integral Part:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.integralPart}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    Binary Representation Of Fractional Part:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.fractionalPart}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    Binary Representation of the Number:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.binaryRepresentationOfNumber}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    Normalized Representation of the Number:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.normalizedNumber}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    Sign:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.sign}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    Mantissa:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.mantissa}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    Bias:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.bias}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                    Exponent:
                                </Typography>
                                <Typography variant="body1" className={styles.typography}>
                                    {results.exponentDecimal}
                                </Typography>
                            </Grid>
                        </Grid>
                    </div>
                )}
            </Box>

            <ToastContainer />
        </Container>
    );
}

export default BinaryConverter;
