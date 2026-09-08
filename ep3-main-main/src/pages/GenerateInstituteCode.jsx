// pages/GenerateInstituteCode.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  TextField,
} from "@mui/material";
import { ContentCopy, CheckCircle, ArrowBack } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { useNavigate } from "react-router-dom";

const GenerateInstituteCode = () => {
  const navigate = useNavigate();
  // Keep colid internal only; do not render it
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setMsg("");
    setErr("");
    setResult(null);
    setCopied(false);

    const numericColid = Number(global1.colid);
    if (!numericColid || Number.isNaN(numericColid)) {
      setErr("Missing or invalid colid in session");
      return;
    }

    setLoading(true);
    try {
      const r = await ep1.post("/api/v2/generateinstitutecode", {
        colid: numericColid,
      });
      if (r.data?.success) {
        setResult(r.data.data);
        setMsg("Institute code generated successfully");
      } else {
        setErr(r.data?.message || "Failed to generate institute code");
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to generate institute code");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!result?.instituteCode) return;
    try {
      await navigator.clipboard.writeText(result.instituteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore clipboard errors silently
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                                <Button
                                  startIcon={<ArrowBack />}
                                  onClick={() => navigate("/dashdashfacnew")}
                                >
                                  Back
                                </Button>
                              </Box>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Generate Institute Code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Securely creates an institute code and share it with your students and faculties. They may register from https://ctapp1.netlify.app using this code.
        </Typography>

        {msg && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg("")}>
            {msg}
          </Alert>
        )}
        {err && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr("")}>
            {err}
          </Alert>
        )}

        <Stack spacing={2}>
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={loading}
            sx={{
              alignSelf: "flex-start",
              backgroundColor: "#16a34a",
              "&:hover": { backgroundColor: "#15803d" },
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
            }}
          >
            {loading ? "Generating…" : "Generate Code"}
          </Button>

          {result?.instituteCode && (
            <>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                {/* Do NOT render colid — only show the code */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    fullWidth
                    label="Institute Code"
                    value={result.instituteCode}
                    InputProps={{ readOnly: true }}
                  />
                  <Tooltip title={copied ? "Copied!" : "Copy"}>
                    <IconButton
                      onClick={copyCode}
                      sx={{
                        bgcolor: copied ? "#e6ffed" : "transparent",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {copied ? (
                        <CheckCircle color="success" />
                      ) : (
                        <ContentCopy />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default GenerateInstituteCode;
