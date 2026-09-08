// IDCardManager.jsx
import React, { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import BulkIDCardGenerator from "./BulkIDCardGenerator";
import SingleIDCardGenerator from "./SigleIDCardGenerator";

const IDCardManager = () => {
  const [mode, setMode] = useState("bulk");

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        ID Card Generator
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Button
          variant={mode === "single" ? "contained" : "outlined"}
          onClick={() => setMode("single")}
        >
          Add Single ID Card
        </Button>

        <Button
          variant={mode === "bulk" ? "contained" : "outlined"}
          onClick={() => setMode("bulk")}
        >
          Generate Bulk ID Cards
        </Button>
      </Box>

      {mode === "bulk" ? <BulkIDCardGenerator /> : <SingleIDCardGenerator />}
    </Container>
  );
};

export default IDCardManager;