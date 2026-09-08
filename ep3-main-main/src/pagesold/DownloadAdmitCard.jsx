import { useState } from "react";
import axios from "axios";
import global1 from './global1';
import ep1 from '../api/ep1';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import InputField from "../components/InputField";
import { generateAdmitCardPDF } from "../utils/generateAdmitCardPDF";

const DownloadAdmitCard = () => {
  const [regno, setRegno] = useState("");
  const [loading, setLoading] = useState(false);
  const [admitCardData, setAdmitCardData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setErrorMsg("");
    setAdmitCardData(null);

    try {
      const res = await ep1.get(`/api/v2/admitcard/${regno.trim()}`);
      setAdmitCardData(res.data);
    } catch (err) {
      setErrorMsg("❌ Admit card not released yet or invalid registration number.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!admitCardData) return;

    const {
      studentname,
      regno,
      program,
      semester,
      examdate,
      subjects,
      examCenter,
      template
    } = admitCardData;

    const mappedSubjects = subjects.map((sub) => ({
      subjectcode: sub.subjectcode,
      subjectname: sub.subjectname,
      examtime: sub.examtime || "TBD",
    }));

    generateAdmitCardPDF({
      studentname,
      regno,
      program,
      semester,
      examdate,
      examCenter,
      subjects: mappedSubjects,
      template,
      photo: "" // Optional: attach if available
    });
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} p={4} boxShadow={3} borderRadius={2} bgcolor="background.paper">
        <Typography variant="h5" gutterBottom>
          Download Admit Card
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <InputField
          label="Registration Number"
          name="regno"
          type="text"
          value={regno}
          onChange={(e) => setRegno(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleFetch}
          disabled={loading || !regno.trim()}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : "Check & Fetch Admit Card"}
        </Button>

        {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}

        {admitCardData && (
          <Box mt={3}>
            <Alert severity="success">
              ✅ Admit card is available for <strong>{admitCardData.studentname}</strong>
            </Alert>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleDownload}
              sx={{ mt: 2 }}
            >
              Download Admit Card PDF
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default DownloadAdmitCard;

