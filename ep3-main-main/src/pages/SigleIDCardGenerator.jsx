import React, { useEffect, useState } from "react";
import ep1 from '../api/ep1';
import { Box, Button,  TextField, Typography } from "@mui/material";
import generateSingleIDCardPDF from "../utils/generalsingleidcard";
import axios from "axios";
import global1 from './global1';

const SingleIDCardGenerator = () => {
  const [regno, setRegno] = useState("");
  const [user, setUser] = useState(null);

  

  const handleSearch = async() => {
    if (!regno) return alert("Enter a registration number.");
    const response = await ep1.get(`/api/v2/users/byregno/${regno}`, {});
    setUser(response.data);
    // axios
    //   .get(`http://localhost:8080/api/v2/users/byregno/${regno}`)
    //   .then((res) => setUser(res.data))
    //   .catch(() => {
    //     alert("Student not found");
    //   });
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'white', boxShadow: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight="medium" gutterBottom>
        Single ID Card Generator
      </Typography>
      <TextField
        fullWidth
        label="Enter Registration Number"
        value={regno}
        onChange={(e) => setRegno(e.target.value)}
        margin="normal"
      />
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button variant="outlined" onClick={handleSearch}>Search Student</Button>
        <Button variant="contained" color="primary" disabled={!user} onClick={() => generateSingleIDCardPDF(user)}>
          Generate ID Card
        </Button>
      </Box>
    </Box>
  );
};
export default SingleIDCardGenerator;