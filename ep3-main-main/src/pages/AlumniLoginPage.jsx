import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import global1 from "./global1";
import ep1 from "../api/ep1";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await ep1.post("/api/v2/login", formData);
      const { colid, name, email, regno, role } = res.data;

      // Store credentials in global1
      global1.name = name;
      global1.colid = Number(colid);
      global1.user = email;
      global1.regno = regno;
      global1.role = role;

      setSuccess("Login successful!");
      setError("");
      console.log('Logged in user:', global1);

      // Redirect based on role
      if (role === 'Admin') {
        navigate("/admin/alumni/dashboard");
      } else {
        navigate("/student/jobs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setSuccess("");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Admin & Student Login
        </Typography>

        {error && <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: "100%", mb: 2 }}>{success}</Alert>}

        <TextField
          margin="normal"
          required
          fullWidth
          label="Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          onClick={handleLogin}
        >
          Login
        </Button>
        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/')}
          sx={{
            color: '#667eea',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)'
            }
          }}
        >
          ← Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
