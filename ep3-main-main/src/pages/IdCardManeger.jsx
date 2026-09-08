// IDCardManager.jsx
import React, { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import BulkIDCardGenerator from "./BulkIDCardGenerator";
import SingleIDCardGenerator from "./SigleIDCardGenerator";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const IDCardManager = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("bulk");

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                          <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate("/dashdashfacnew")}
                          >
                            Back
                          </Button>
                        </Box>
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