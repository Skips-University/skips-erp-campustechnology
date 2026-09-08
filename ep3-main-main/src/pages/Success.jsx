import { useLocation, useNavigate } from "react-router-dom";
import generatePDF from "../utils/generatePDF";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container
} from "@mui/material";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;

  if (!formData) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" color="error" fontWeight="bold">
          No data found
        </Typography>
        <Button
          onClick={() => navigate("/")}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Go Back to Form
        </Button>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#f9fafb"
      px={2}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>
            🎉 Application Submitted!
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Thank you, <strong>{formData.name}</strong>.<br />
            Your application has been submitted successfully.
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => generatePDF(formData)}
          >
            ⬇️ Download Application PDF
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Success;

