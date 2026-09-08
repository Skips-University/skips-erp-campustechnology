import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AccountEntryForm() {
  const [rows, setRows] = useState([
    { accountgroup: "", account: "", type: "Debit", amount: "" },
  ]);

  const [accountGroups, setAccountGroups] = useState([]);
  const [accounts, setAccounts] = useState({}); // store accounts by groupId

  // Fetch account groups on mount
  useEffect(() => {
    fetch("/api/account-groups")
      .then((res) => res.json())
      .then((data) => setAccountGroups(data))
      .catch((err) => console.error("Error fetching groups", err));
  }, []);

  // Fetch accounts for a specific group
  const fetchAccountsForGroup = async (groupId) => {
    if (!groupId) return;
    if (accounts[groupId]) return; // already cached

    try {
      const res = await fetch(`/api/accounts?group=${groupId}`);
      const data = await res.json();
      setAccounts((prev) => ({ ...prev, [groupId]: data }));
    } catch (err) {
      console.error("Error fetching accounts", err);
    }
  };

  const addRow = () => {
    setRows([
      ...rows,
      { accountgroup: "", account: "", type: "Debit", amount: "" },
    ]);
  };

  const deleteRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  const handleChange = async (index, field, value) => {
    const updatedRows = [...rows];

    if (field === "accountgroup") {
      updatedRows[index].accountgroup = value;
      updatedRows[index].account = ""; // reset account when group changes
      setRows(updatedRows);
      await fetchAccountsForGroup(value); // fetch accounts for new group
      return;
    }

    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

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
            <TableCell>Account Group</TableCell>
            <TableCell>Account</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {/* Account Group Dropdown */}
              <TableCell>
                <Select
                  value={row.accountgroup}
                  onChange={(e) =>
                    handleChange(index, "accountgroup", e.target.value)
                  }
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">
                    <em>Select Group</em>
                  </MenuItem>
                  {accountGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>

              {/* Account Dropdown (dependent) */}
              <TableCell>
                <Select
                  value={row.account}
                  onChange={(e) =>
                    handleChange(index, "account", e.target.value)
                  }
                  displayEmpty
                  fullWidth
                  disabled={!row.accountgroup}
                >
                  <MenuItem value="">
                    <em>Select Account</em>
                  </MenuItem>
                  {accounts[row.accountgroup]?.map((acc) => (
                    <MenuItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>

              {/* Type Dropdown */}
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

              {/* Amount Field */}
              <TableCell>
                <TextField
                  type="number"
                  value={row.amount}
                  onChange={(e) => handleChange(index, "amount", e.target.value)}
                  placeholder="Enter amount"
                  fullWidth
                />
              </TableCell>

              {/* Delete Button */}
              <TableCell>
                <IconButton
                  color="error"
                  onClick={() => deleteRow(index)}
                  disabled={rows.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Action Buttons */}
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
