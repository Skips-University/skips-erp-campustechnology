import React, { useState } from 'react';
import { Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import styles from "../virtuallabcss/BinaryArithmetic.module.css"

const generateBinaryData = (bits) => {
  const data = bits === 4 ? [
    { id: 1, binary: '0000', twosComp: 0, onesComp: 0, unsigned: 0, signed: 0 },
    { id: 2, binary: '0001', twosComp: 1, onesComp: 1, unsigned: 1, signed: 1 },
    { id: 3, binary: '0010', twosComp: 2, onesComp: 2, unsigned: 2, signed: 2 },
    { id: 4, binary: '0011', twosComp: 3, onesComp: 3, unsigned: 3, signed: 3 },
    { id: 5, binary: '0100', twosComp: 4, onesComp: 4, unsigned: 4, signed: 4 },
    { id: 6, binary: '0101', twosComp: 5, onesComp: 5, unsigned: 5, signed: 5 },
    { id: 7, binary: '0110', twosComp: 6, onesComp: 6, unsigned: 6, signed: 6 },
    { id: 8, binary: '0111', twosComp: 7, onesComp: 7, unsigned: 7, signed: 7 },
    { id: 9, binary: '1000', twosComp: -8, onesComp: -7, unsigned: 8, signed: -8 },
    { id: 10, binary: '1001', twosComp: -7, onesComp: -6, unsigned: 9, signed: -7 },
    { id: 11, binary: '1010', twosComp: -6, onesComp: -5, unsigned: 10, signed: -6 },
    { id: 12, binary: '1011', twosComp: -5, onesComp: -4, unsigned: 11, signed: -5 },
    { id: 13, binary: '1100', twosComp: -4, onesComp: -3, unsigned: 12, signed: -4 },
    { id: 14, binary: '1101', twosComp: -3, onesComp: -2, unsigned: 13, signed: -3 },
    { id: 15, binary: '1110', twosComp: -2, onesComp: -1, unsigned: 14, signed: -2 },
    { id: 16, binary: '1111', twosComp: -1, onesComp: 0, unsigned: 15, signed: -1 },
  ] : [
    { id: 1, binary: '00000', twosComp: 0, onesComp: 0, unsigned: 0, signed: 0 },
    { id: 2, binary: '00001', twosComp: 1, onesComp: 1, unsigned: 1, signed: 1 },
    { id: 3, binary: '00010', twosComp: 2, onesComp: 2, unsigned: 2, signed: 2 },
    { id: 4, binary: '00011', twosComp: 3, onesComp: 3, unsigned: 3, signed: 3 },
    { id: 5, binary: '00100', twosComp: 4, onesComp: 4, unsigned: 4, signed: 4 },
    { id: 6, binary: '00101', twosComp: 5, onesComp: 5, unsigned: 5, signed: 5 },
    { id: 7, binary: '00110', twosComp: 6, onesComp: 6, unsigned: 6, signed: 6 },
    { id: 8, binary: '00111', twosComp: 7, onesComp: 7, unsigned: 7, signed: 7 },
    { id: 9, binary: '01000', twosComp: 8, onesComp: 8, unsigned: 8, signed: 8 },
    { id: 10, binary: '01001', twosComp: 9, onesComp: 9, unsigned: 9, signed: 9 },
    { id: 11, binary: '01010', twosComp: 10, onesComp: 10, unsigned: 10, signed: 10 },
    { id: 12, binary: '01011', twosComp: 11, onesComp: 11, unsigned: 11, signed: 11 },
    { id: 13, binary: '01100', twosComp: 12, onesComp: 12, unsigned: 12, signed: 12 },
    { id: 14, binary: '01101', twosComp: 13, onesComp: 13, unsigned: 13, signed: 13 },
    { id: 15, binary: '01110', twosComp: 14, onesComp: 14, unsigned: 14, signed: 14 },
    { id: 16, binary: '01111', twosComp: 15, onesComp: 15, unsigned: 15, signed: 15 },
    { id: 17, binary: '10000', twosComp: -16, onesComp: -15, unsigned: 16, signed: -16 },
    { id: 18, binary: '10001', twosComp: -15, onesComp: -14, unsigned: 17, signed: -15 },
    { id: 19, binary: '10010', twosComp: -14, onesComp: -13, unsigned: 18, signed: -14 },
    { id: 20, binary: '10011', twosComp: -13, onesComp: -12, unsigned: 19, signed: -13 },
    { id: 21, binary: '10100', twosComp: -12, onesComp: -11, unsigned: 20, signed: -12 },
    { id: 22, binary: '10101', twosComp: -11, onesComp: -10, unsigned: 21, signed: -11 },
    { id: 23, binary: '10110', twosComp: -10, onesComp: -9, unsigned: 22, signed: -10 },
    { id: 24, binary: '10111', twosComp: -9, onesComp: -8, unsigned: 23, signed: -9 },
    { id: 25, binary: '11000', twosComp: -8, onesComp: -7, unsigned: 24, signed: -8 },
    { id: 26, binary: '11001', twosComp: -7, onesComp: -6, unsigned: 25, signed: -7 },
    { id: 27, binary: '11010', twosComp: -6, onesComp: -5, unsigned: 26, signed: -6 },
    { id: 28, binary: '11011', twosComp: -5, onesComp: -4, unsigned: 27, signed: -5 },
    { id: 29, binary: '11100', twosComp: -4, onesComp: -3, unsigned: 28, signed: -4 },
    { id: 30, binary: '11101', twosComp: -3, onesComp: -2, unsigned: 29, signed: -3 },
    { id: 31, binary: '11110', twosComp: -2, onesComp: -1, unsigned: 30, signed: -2 },
    { id: 32, binary: '11111', twosComp: -1, onesComp: 0, unsigned: 31, signed: -1 },
  ];

  return data;
};

const BinaryArithmeticSimulation = () => {
  const [bitSize, setBitSize] = useState(4);
  const [binaryData, setBinaryData] = useState(generateBinaryData(bitSize));
  const [selectedRows, setSelectedRows] = useState([]);
  const [result, setResult] = useState(null);
  const [overflow, setOverflow] = useState(false);

  const handleRowClick = (row) => {
    if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter(selectedRow => selectedRow !== row));
    } else if (selectedRows.length === 2) {
      setSelectedRows([row]);
    } else {
      setSelectedRows([...selectedRows, row]);
    }
    setResult(null);
  };


  const handleAdd = () => {
    if (selectedRows.length === 2) {
      const binarySum = parseInt(selectedRows[0].binary, 2) + parseInt(selectedRows[1].binary, 2);
      const maxNumber = Math.pow(2, bitSize);
      const binarySumStr = binarySum.toString(2).padStart(bitSize, '0').slice(-bitSize);

      const overflowCheck = binarySum >= maxNumber;
      setOverflow(overflowCheck);

      const unsignedResult = binarySum % maxNumber;

      const resultRow = binaryData.find(row => row.binary === binarySumStr);

      setResult({
        ...resultRow,
        binary: binarySumStr,
        unsigned: unsignedResult,
      });

      alert("To see the result scroll down");
    }
  };

  const handleReset = () => {
    setSelectedRows([]);
    setResult(null);
    setOverflow(false);
  };

  const handleBitSizeChange = () => {
    const newBitSize = bitSize === 4 ? 5 : 4;
    setBitSize(newBitSize);
    setBinaryData(generateBinaryData(newBitSize));
    handleReset();
  };

  return (
    <Container className={styles.container}>
      <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold">Representation of Integers and their Arithmetic</Typography>
      {result ? (<Typography variant="body1" style={{ backgroundColor: "yellow", padding: "10px", borderRadius: "0px 20px 20px 0px", marginBlock: "20px" }} gutterBottom>
        Results are highlighted green, and overflow is displayed in the result table. Click on a row to select. You can only select two rows at a time.
      </Typography>) : (

        <Typography variant="body1" style={{ color: "white", backgroundColor: "green", padding: "10px", borderRadius: "0px 20px 20px 0px", marginBlock: "20px" }} gutterBottom>
          Hover over the 4-bit table and Select any two rows to add
        </Typography>
      )
      }
      <Box mb={2}>
        <Button variant="contained" className={styles.binaryArithBtn} onClick={handleAdd} disabled={selectedRows.length !== 2} sx={{ mr: 2 }}>
          Add
        </Button>
        <Button variant="contained" className={styles.binaryArithBtn} onClick={handleReset} sx={{ mr: 2 }}>
          Reset
        </Button>
        <Button variant="contained" className={`${styles.binaryArithBtn} ${styles.bitToggle}`} color='success' onClick={handleBitSizeChange} >
          Toggle to {bitSize === 4 ? '5-bit' : '4-bit'} Table
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table className={styles.binaryArithTable}>
          <TableHead> 
            <TableRow>
              <TableCell className={styles.tableHead}>#</TableCell>
              <TableCell className={styles.tableHead}>Binary</TableCell>
              <TableCell className={styles.tableHead}>2's Comp</TableCell>
              <TableCell className={styles.tableHead}>1's Comp</TableCell>
              <TableCell className={styles.tableHead}>Unsigned</TableCell>
              <TableCell className={styles.tableHead}>Signed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {binaryData.map(row => (
              <TableRow
                key={row.id}
                onClick={() => handleRowClick(row)}
                className={
                  selectedRows.includes(row)
                    ? `${styles.tableHead}`
                    : result && result.binary === row.binary
            ?  `${styles.resultRow}`
            :  `${styles.binaryRow}`
                }
            sx={{ '&:hover': { bgcolor: "#CDE8E5" } }}
              >
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.binary}</TableCell>
            <TableCell>{row.twosComp}</TableCell>
            <TableCell>{row.onesComp}</TableCell>
            <TableCell>{row.unsigned}</TableCell>
            <TableCell>{row.signed}</TableCell>
          </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
      {
    result && (
      <Box mt={4}>
        <Typography variant="h6">Results</Typography>
        <TableContainer component={Paper} className={styles.resultTableBox}>
          <Table className={`${styles.resultTable} ${styles.binaryArithTable}`}>
            <TableBody>
              <TableRow>
                <TableCell>Binary Rep</TableCell>
                <TableCell>{result.binary}</TableCell>
                {overflow && <TableCell sx={{ bgcolor: "#28a745" }}>Overflow</TableCell>}
              </TableRow>
              <TableRow>
                <TableCell>2's Comp</TableCell>
                <TableCell>{result.twosComp}</TableCell>
                {overflow && <TableCell sx={{ bgcolor: "#28a745" }}>Overflow</TableCell>}
              </TableRow>
              <TableRow>
                <TableCell>1's Comp</TableCell>
                <TableCell>{result.onesComp}</TableCell>
                {overflow && <TableCell sx={{ bgcolor: "#28a745" }}>Overflow</TableCell>}
              </TableRow>
              <TableRow>
                <TableCell>Unsigned</TableCell>
                <TableCell>{result.unsigned}</TableCell>
                {overflow && <TableCell sx={{ bgcolor: "#28a745" }}>Overflow</TableCell>}
              </TableRow>
              <TableRow>
                <TableCell>Signed</TableCell>
                <TableCell>{result.signed}</TableCell>
                {overflow && <TableCell sx={{ bgcolor: "#28a745" }}>Overflow</TableCell>}
              </TableRow>
            </TableBody>
          </Table>


        </TableContainer>
      </Box>
    )
  }
    </Container >
  );
};

export default BinaryArithmeticSimulation;
