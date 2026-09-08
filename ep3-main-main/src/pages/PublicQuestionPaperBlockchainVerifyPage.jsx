import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedIcon from "@mui/icons-material/Verified";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import PrintIcon from "@mui/icons-material/Print";
import ep1 from "../api/ep1";

export default function PublicQuestionPaperBlockchainVerifyPage() {
  const [paperid, setPaperid] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [result, setResult] = useState(null);
  const [printRules, setPrintRules] = useState("");
  const [formattedHtml, setFormattedHtml] = useState("");
  const [error, setError] = useState("");

  const verify = async (paperValue = paperid, hashValue = hash) => {
    if (!String(paperValue || "").trim() && !String(hashValue || "").trim()) {
      setError("Paper id or hash is required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setFormattedHtml("");
      const res = await ep1.get("/api/v2/public/conductexam/question-paper-blockchain-verify", {
        params: { paperid: paperValue, hash: hashValue }
      });
      setResult(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify question paper from blockchain.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPaper = params.get("paperid") || "";
    const queryHash = params.get("hash") || "";
    if (queryPaper || queryHash) {
      setPaperid(queryPaper);
      setHash(queryHash);
      verify(queryPaper, queryHash);
    }
  }, []);

  const records = result?.data || [];
  const active = records[0] || null;
  const payload = active?.payload || {};
  const institution = result?.institution || {};

  const formatWithGemini = async () => {
    if (!active?.colid || !payload?.paperid) {
      setError("Verified question paper is required before formatting.");
      return;
    }
    try {
      setFormatting(true);
      setError("");
      const res = await ep1.post("/api/v2/public/conductexam/question-paper-print-format", {
        colid: active.colid,
        paperid: payload.paperid,
        hash: active.hash,
        payload,
        rules: printRules
      });
      setFormattedHtml(res.data?.html || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to format print preview with Gemini.");
    } finally {
      setFormatting(false);
    }
  };

  const printPreview = () => {
    window.print();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7fb", py: { xs: 2, md: 5 } }}>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-area { display: block !important; box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
          .print-area * { color: #111 !important; }
        }
      `}</style>
      <Container maxWidth="lg">
        <Paper className="no-print" elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <VerifiedIcon color="success" sx={{ fontSize: 44 }} />
            <Typography variant="h4" fontWeight={900}>Question Paper Blockchain Verification</Typography>
            <Typography color="text.secondary">Verify an accepted examination question paper stored in blockchain.</Typography>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Paper className="no-print" elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}><TextField fullWidth label="Paper ID" value={paperid} onChange={(event) => setPaperid(event.target.value)} /></Grid>
            <Grid item xs={12} md={5}><TextField fullWidth label="Blockchain Hash" value={hash} onChange={(event) => setHash(event.target.value)} /></Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={<SearchIcon />} onClick={() => verify()} disabled={loading} sx={{ height: 56 }}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </Grid>
          </Grid>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {result && (
          <Stack spacing={2}>
          <Paper className="no-print" elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={900}>{result.verified ? "Verified question paper found" : "No verified question paper found"}</Typography>
                <Typography color="text.secondary">{records.length} blockchain record(s) matched.</Typography>
              </Box>
              <Chip color={result.verified ? "success" : "error"} label={result.verified ? "Blockchain Verified" : "Not Verified"} />
            </Stack>
            {active && (
              <Grid container spacing={1.5}>
                {[
                  ["Paper ID", payload.paperid],
                  ["Exam", `${payload.exam || ""} (${payload.examcode || ""})`],
                  ["Program", `${payload.program || ""} (${payload.programcode || ""})`],
                  ["Course", `${payload.course || ""} (${payload.coursecode || ""})`],
                  ["Paper Setter", `${payload.papersettername || ""} (${payload.papersetteremail || ""})`],
                  ["Accepted By", payload.acceptedby],
                  ["Stored On", active.timestamp ? String(active.timestamp).slice(0, 19).replace("T", " ") : ""],
                  ["Hash", active.hash]
                ].map(([label, value]) => (
                  <Grid item xs={12} md={label === "Hash" ? 12 : 3} key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography fontWeight={800} sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
          {active && (
            <>
              <Paper className="no-print" elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="stretch">
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Rules for print formatting"
                      placeholder="Example: Make it compact, show marks on right, keep answer hidden, use formal exam layout, add signature area."
                      value={printRules}
                      onChange={(event) => setPrintRules(event.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button fullWidth variant="outlined" startIcon={formatting ? <LinearProgress /> : <AutoFixHighIcon />} disabled={formatting} onClick={formatWithGemini} sx={{ height: "100%" }}>
                      {formatting ? "Formatting..." : "Gemini Format"}
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button fullWidth variant="contained" startIcon={<PrintIcon />} onClick={printPreview} sx={{ height: "100%" }}>Print Preview</Button>
                  </Grid>
                </Grid>
                {formatting && <LinearProgress sx={{ mt: 2 }} />}
              </Paper>

              <Paper className="print-area" elevation={0} sx={{ p: { xs: 2, md: 4 }, border: "1px solid #d1d5db", borderRadius: 2, bgcolor: "#fff" }}>
                {formattedHtml ? (
                  <Box dangerouslySetInnerHTML={{ __html: formattedHtml }} />
                ) : (
                  <Box>
                    <Stack alignItems="center" textAlign="center" spacing={0.75} sx={{ mb: 2 }}>
                      {institution.logolink && <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 72, maxWidth: 120, objectFit: "contain" }} />}
                      <Typography variant="h5" fontWeight={900}>{institution.institutionname || "Institution"}</Typography>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{institution.address || ""}</Typography>
                      <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Question Paper</Typography>
                    </Stack>

                    <Grid container spacing={1} sx={{ mb: 2, borderTop: "1px solid #111", borderBottom: "1px solid #111", py: 1 }}>
                      {[
                        ["Exam", `${payload.exam || ""} (${payload.examcode || ""})`],
                        ["Academic Year", payload.academicyear],
                        ["Program", `${payload.program || ""} (${payload.programcode || ""})`],
                        ["Course", `${payload.course || ""} (${payload.coursecode || ""})`],
                        ["Regulation", payload.regulation],
                        ["Paper Setter", payload.papersettername]
                      ].map(([label, value]) => (
                        <Grid item xs={12} md={4} key={label}>
                          <Typography variant="caption" color="text.secondary">{label}</Typography>
                          <Typography fontWeight={800}>{value || "-"}</Typography>
                        </Grid>
                      ))}
                    </Grid>

                    <Stack spacing={2}>
                      {(payload.sections || []).map((section, sectionIndex) => (
                        <Box key={section._id || sectionIndex}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography fontWeight={900}>{section.title || `Section ${sectionIndex + 1}`}</Typography>
                            <Typography fontWeight={800}>Marks: {section.marks || 0}</Typography>
                          </Stack>
                          {section.instructions && <Typography variant="body2" sx={{ mb: 1 }}>{section.instructions}</Typography>}
                          <Stack spacing={1}>
                            {(section.questions || []).map((question, questionIndex) => (
                              <Box key={question._id || questionIndex} sx={{ borderBottom: "1px solid #e5e7eb", pb: 1 }}>
                                <Stack direction="row" justifyContent="space-between" spacing={2}>
                                  <Typography sx={{ whiteSpace: "pre-wrap" }}><b>Q{questionIndex + 1}.</b> {question.question || "-"}</Typography>
                                  <Typography sx={{ minWidth: 70, textAlign: "right" }}>{question.marks || 0} marks</Typography>
                                </Stack>
                                <Typography variant="caption">CO: {question.conumber || question.co || "-"} | Bloom: {(question.bloomlevels || []).join(", ") || "-"}</Typography>
                                {question.answer && <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}><b>Answer:</b> {question.answer}</Typography>}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>

                    <Box sx={{ mt: 3, pt: 1, borderTop: "1px solid #111" }}>
                      <Typography variant="caption" sx={{ wordBreak: "break-word" }}>Blockchain hash: {active.hash}</Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </>
          )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
