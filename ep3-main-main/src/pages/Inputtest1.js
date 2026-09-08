import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AccountEntryForm() {
  const [rows, setRows] = useState([
    { account: "", type: "Debit", amount: "" },
  ]);

  // Add a new empty row
  const addRow = () => {
    setRows([...rows, { account: "", type: "Debit", amount: "" }]);
  };

  // Delete a row by index
  const deleteRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  // Handle field changes
  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // Submit all rows
  const handleSubmit = async () => {
    try {
      for (let entry of rows) {
        await fetch("/api/create-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
      }
      alert("Accounts submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error submitting accounts");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Account</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  value={row.account}
                  onChange={(e) => handleChange(index, "account", e.target.value)}
                  placeholder="Enter account"
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <Select
                  value={row.type}
                  onChange={(e) => handleChange(index, "type", e.target.value)}
                  fullWidth
                >
                  <MenuItem value="Debit">Debit</MenuItem>
                  <MenuItem value="Credit">Credit</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={row.amount}
                  onChange={(e) => handleChange(index, "amount", e.target.value)}
                  placeholder="Enter amount"
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <IconButton
                  color="error"
                  onClick={() => deleteRow(index)}
                  disabled={rows.length === 1} // keep at least 1 row
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={addRow}>
          Add Row
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}
