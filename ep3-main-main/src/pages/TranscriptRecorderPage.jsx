import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ep1 from "../api/ep1";
import global1 from "./global1";

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export default function TranscriptRecorderPage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [translateToEnglish, setTranslateToEnglish] = useState(false);
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [emailForm, setEmailForm] = useState({
    to: "",
    cc: "",
    subject: "Audio transcript"
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const SpeechRecognitionApi = useMemo(() => getSpeechRecognition(), []);
  const speechSupported = useMemo(() => Boolean(SpeechRecognitionApi), [SpeechRecognitionApi]);

  const startAudioCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setError("Audio recording is not supported in this browser.");
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      return true;
    } catch (err) {
      setError(`Microphone recording could not start: ${err.message}`);
      return false;
    }
  };

  const startListening = async () => {
    setError("");
    setMessage("");
    setAudioBlob(null);
    setAudioFile(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }

    const recordingStarted = await startAudioCapture();
    if (!recordingStarted) return;

    if (!speechSupported) {
      setMessage("Recording started. Browser live speech recognition is not available, but Gemini can transcribe after you stop.");
      setListening(true);
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += text;
        else interim += text;
      }
      if (finalText) {
        setTranscript((prev) => `${prev}${prev ? " " : ""}${finalText.trim()}`);
      }
      setInterimText(interim);
    };
    recognition.onerror = (event) => {
      setError(event.error ? `Speech recognition error: ${event.error}` : "Speech recognition error");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setInterimText("");
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setListening(false);
    setInterimText("");
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimText("");
    setEnglishTranslation("");
    setSummary("");
    setActionItems("");
    setMessage("");
    setError("");
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setAudioBlob(null);
    setAudioFile(null);
  };

  const getAudioFilename = () => {
    const mimeType = audioBlob?.type || "audio/webm";
    if (mimeType.includes("mp4")) return "recorded-audio.mp4";
    if (mimeType.includes("mpeg")) return "recorded-audio.mp3";
    if (mimeType.includes("wav")) return "recorded-audio.wav";
    if (mimeType.includes("ogg")) return "recorded-audio.ogg";
    return "recorded-audio.webm";
  };

  const transcribeWithGemini = async () => {
    try {
      if (!audioBlob) {
        setError("Please record audio first.");
        return;
      }
      setTranscribing(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("colid", global1.colid);
      formData.append("user", global1.user || "");
      formData.append("translateToEnglish", translateToEnglish ? "Yes" : "No");
      formData.append("audio", audioBlob, getAudioFilename());

      const res = await ep1.post("/api/v2/transcript/gemini-transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setTranscript(res.data?.transcript || "");
      setEnglishTranslation(res.data?.englishTranslation || "");
      setSummary(res.data?.summary || "");
      setActionItems(res.data?.actionItems || "");
      setAudioFile(res.data?.audioFile || null);
      setInterimText("");
      setMessage("Audio uploaded to AWS and Gemini transcript generated successfully.");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to transcribe audio with Gemini");
    } finally {
      setTranscribing(false);
    }
  };

  const sendEmail = async () => {
    try {
      setSending(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/transcript/send-email", {
        colid: global1.colid,
        senderName: global1.name || global1.insname || "Institution",
        to: emailForm.to,
        cc: emailForm.cc,
        subject: emailForm.subject,
        transcript
      });
      setMessage(res.data?.msg || "Transcript email sent");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to send transcript email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f6f8fb", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 1100, mx: "auto" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Audio Transcript</Typography>
            <Typography variant="body2" color="text.secondary">Record speech, convert it to text, edit the transcript, and send it by email.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {!listening ? (
              <Button variant="contained" startIcon={<MicIcon />} onClick={startListening}>Start Recording</Button>
            ) : (
              <Button variant="contained" color="error" startIcon={<StopIcon />} onClick={stopListening}>Stop</Button>
            )}
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={clearTranscript}>Clear</Button>
          </Stack>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-line" }} onClose={() => setError("")}>{error}</Alert>}
        {!speechSupported && <Alert severity="warning" sx={{ mb: 2 }}>Speech recognition is not supported in this browser.</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={10}
              label="Transcript"
              value={`${transcript}${interimText ? `${transcript ? " " : ""}${interimText}` : ""}`}
              onChange={(event) => {
                setTranscript(event.target.value);
                setInterimText("");
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={translateToEnglish}
                  onChange={(event) => setTranslateToEnglish(event.target.checked)}
                />
              }
              label="Translate to English"
            />
          </Grid>
          {translateToEnglish && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={6}
                label="English Translation"
                value={englishTranslation}
                onChange={(event) => setEnglishTranslation(event.target.value)}
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Action Items"
              value={actionItems}
              onChange={(event) => setActionItems(event.target.value)}
            />
          </Grid>
          {audioUrl && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Recorded audio</Typography>
              <audio controls src={audioUrl} style={{ width: "100%" }} />
              {audioFile?.url && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Audio saved in AWS:{" "}
                  <Link href={audioFile.url} target="_blank" rel="noopener noreferrer">
                    {audioFile.originalname || audioFile.filename || audioFile.url}
                  </Link>
                </Alert>
              )}
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={transcribing ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
              disabled={transcribing || listening || !audioBlob}
              onClick={transcribeWithGemini}
            >
              Upload Audio to AWS and Transcribe
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="To email" value={emailForm.to} onChange={(event) => setEmailForm({ ...emailForm, to: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="CC" value={emailForm.cc} onChange={(event) => setEmailForm({ ...emailForm, cc: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Subject" value={emailForm.subject} onChange={(event) => setEmailForm({ ...emailForm, subject: event.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="success" startIcon={<SendIcon />} disabled={sending || !transcript.trim()} onClick={sendEmail}>
              Send as Email
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
