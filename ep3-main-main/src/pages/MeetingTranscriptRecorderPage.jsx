import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import MicIcon from "@mui/icons-material/Mic";
import PrintIcon from "@mui/icons-material/Print";
import StopIcon from "@mui/icons-material/Stop";
import ep1 from "../api/ep1";
import global1 from "./global1";
import PlacementCoordinatorShell from "./PlacementCoordinatorShell";

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const text = (value) => String(value || "");
const escapeHtml = (value) => text(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const paragraphHtml = (value) => escapeHtml(value || "").split("\n").map((line) => `<p>${line || "&nbsp;"}</p>`).join("");

const buildMinutesHtml = (meeting, institution) => {
  const participants = (meeting?.participants || []).map((item) => `${item.name || ""}${item.email ? ` (${item.email})` : ""}`).join(", ");
  return `<!doctype html>
<html>
<head>
  <title>Meeting Minutes</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font-family: Arial, sans-serif; color: #111827; font-size: 12px; line-height: 1.45; }
    .header { text-align: center; border-bottom: 1px solid #111827; padding-bottom: 10px; margin-bottom: 14px; }
    .logo { max-height: 72px; max-width: 110px; object-fit: contain; margin-bottom: 6px; }
    h1 { font-size: 20px; margin: 4px 0; }
    h2 { font-size: 15px; margin: 14px 0 6px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    td { border: 1px solid #d1d5db; padding: 6px; vertical-align: top; color: #111827; }
    td:first-child { width: 28%; font-weight: 700; background: #f9fafb; }
    a { color: #111827; word-break: break-all; }
    .section { page-break-inside: avoid; }
  </style>
</head>
<body>
  <div class="header">
    ${institution?.logolink ? `<img class="logo" src="${escapeHtml(institution.logolink)}" />` : ""}
    <h1>${escapeHtml(institution?.institutionname || global1.insname || "Institution")}</h1>
    <div>${escapeHtml(institution?.address || "")}</div>
  </div>
  <h1>Meeting Minutes</h1>
  <table>
    <tbody>
      <tr><td>Title</td><td>${escapeHtml(meeting?.topic)}</td></tr>
      <tr><td>Date and Time</td><td>${escapeHtml(formatDateTime(meeting?.startDateTime))} - ${escapeHtml(formatDateTime(meeting?.endDateTime))}</td></tr>
      <tr><td>Host</td><td>${escapeHtml(meeting?.hostName)} (${escapeHtml(meeting?.hostEmail)})</td></tr>
      <tr><td>Participants</td><td>${escapeHtml(participants)}</td></tr>
      <tr><td>Meeting Link</td><td>${meeting?.meetingLink ? `<a href="${escapeHtml(meeting.meetingLink)}">${escapeHtml(meeting.meetingLink)}</a>` : ""}</td></tr>
      <tr><td>Audio Link</td><td>${meeting?.audioUrl ? `<a href="${escapeHtml(meeting.audioUrl)}">${escapeHtml(meeting.audioUrl)}</a>` : ""}</td></tr>
    </tbody>
  </table>
  <div class="section"><h2>Summary</h2>${paragraphHtml(meeting?.summary)}</div>
  <div class="section"><h2>Action Items</h2>${paragraphHtml(meeting?.actionItems)}</div>
  <div class="section"><h2>Transcript</h2>${paragraphHtml(meeting?.transcript)}</div>
  <div class="section"><h2>English Translation</h2>${paragraphHtml(meeting?.englishTranslation)}</div>
</body>
</html>`;
};

export default function MeetingTranscriptRecorderPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const meetingId = params.get("meetingid") || params.get("id") || "";
  const [meeting, setMeeting] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [listening, setListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [translateToEnglish, setTranslateToEnglish] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const SpeechRecognitionApi = useMemo(() => getSpeechRecognition(), []);
  const speechSupported = useMemo(() => Boolean(SpeechRecognitionApi), [SpeechRecognitionApi]);

  useEffect(() => {
    loadMeeting();
    loadInstitution();
  }, [meetingId]);

  const loadInstitution = async () => {
    try {
      const res = await ep1.get("/vins", { params: { colid: global1.colid } });
      setInstitution(res.data || null);
    } catch (err) {
      setInstitution(null);
    }
  };

  const hydrateFromMeeting = (data) => {
    setMeeting(data);
    setTranscript(data?.transcript || "");
    setEnglishTranslation(data?.englishTranslation || "");
    setSummary(data?.summary || "");
    setActionItems(data?.actionItems || "");
  };

  const loadMeeting = async () => {
    try {
      if (!meetingId) {
        setError("Meeting id is required");
        return;
      }
      const res = await ep1.get("/api/v2/transcript-meeting", { params: { id: meetingId, colid: global1.colid } });
      hydrateFromMeeting(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load meeting");
    }
  };

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
        const textValue = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += textValue;
        else interim += textValue;
      }
      if (finalText) setTranscript((prev) => `${prev}${prev ? " " : ""}${finalText.trim()}`);
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

  const clearRecording = () => {
    setMessage("");
    setError("");
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setAudioBlob(null);
  };

  const getAudioFilename = () => {
    const mimeType = audioBlob?.type || "audio/webm";
    if (mimeType.includes("mp4")) return "meeting-audio.mp4";
    if (mimeType.includes("mpeg")) return "meeting-audio.mp3";
    if (mimeType.includes("wav")) return "meeting-audio.wav";
    if (mimeType.includes("ogg")) return "meeting-audio.ogg";
    return "meeting-audio.webm";
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
      formData.append("meetingId", meetingId);
      formData.append("translateToEnglish", translateToEnglish ? "Yes" : "No");
      formData.append("audio", audioBlob, getAudioFilename());

      const res = await ep1.post("/api/v2/transcript/gemini-transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setTranscript(res.data?.transcript || "");
      setEnglishTranslation(res.data?.englishTranslation || "");
      setSummary(res.data?.summary || "");
      setActionItems(res.data?.actionItems || "");
      if (res.data?.meeting) hydrateFromMeeting(res.data.meeting);
      setInterimText("");
      setMessage("Meeting audio uploaded, analyzed, and saved successfully.");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to transcribe meeting audio with Gemini");
    } finally {
      setTranscribing(false);
    }
  };

  const printMinutes = () => {
    const html = buildMinutesHtml({
      ...meeting,
      transcript,
      englishTranslation,
      summary,
      actionItems
    }, institution);
    const popup = window.open("", "_blank", "width=900,height=700");
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <PlacementCoordinatorShell title="Meeting recorder">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Meeting Recorder</Typography>
            <Typography variant="body2" color="text.secondary">{meeting?.topic || ""}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={printMinutes} disabled={!meeting}>Print Minutes</Button>
            {!listening ? (
              <Button variant="contained" startIcon={<MicIcon />} onClick={startListening}>Start Recording</Button>
            ) : (
              <Button variant="contained" color="error" startIcon={<StopIcon />} onClick={stopListening}>Stop</Button>
            )}
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={clearRecording}>Clear Recording</Button>
          </Stack>
        </Stack>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-line" }} onClose={() => setError("")}>{error}</Alert>}
        {!speechSupported && <Alert severity="warning" sx={{ mb: 2 }}>Speech recognition is not supported in this browser.</Alert>}

        {meeting && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#f8fafc" }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={6}><Typography><b>Host:</b> {meeting.hostName} ({meeting.hostEmail})</Typography></Grid>
              <Grid item xs={12} md={6}><Typography><b>Date:</b> {formatDateTime(meeting.startDateTime)} - {formatDateTime(meeting.endDateTime)}</Typography></Grid>
              <Grid item xs={12}><Typography><b>Participants:</b> {(meeting.participants || []).map((p) => `${p.name || ""}${p.email ? ` (${p.email})` : ""}`).join(", ")}</Typography></Grid>
              {meeting.meetingLink && <Grid item xs={12}><Link href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">{meeting.meetingLink}</Link></Grid>}
            </Grid>
          </Paper>
        )}

        <Grid container spacing={2}>
          {audioUrl && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Recorded audio</Typography>
              <audio controls src={audioUrl} style={{ width: "100%" }} />
            </Grid>
          )}
          {meeting?.audioUrl && (
            <Grid item xs={12}>
              <Alert severity="info">
                Saved audio: <Link href={meeting.audioUrl} target="_blank" rel="noopener noreferrer">{meeting.audioUrl}</Link>
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControlLabel control={<Checkbox checked={translateToEnglish} onChange={(event) => setTranslateToEnglish(event.target.checked)} />} label="Translate to English" />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={transcribing ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
              disabled={transcribing || listening || !audioBlob}
              onClick={transcribeWithGemini}
            >
              Upload Audio to AWS, Analyze and Save Meeting
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={8} label="Transcript" value={`${transcript}${interimText ? `${transcript ? " " : ""}${interimText}` : ""}`} onChange={(event) => {
              setTranscript(event.target.value);
              setInterimText("");
            }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={5} label="English Translation" value={englishTranslation} onChange={(event) => setEnglishTranslation(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth multiline minRows={5} label="Summary" value={summary} onChange={(event) => setSummary(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth multiline minRows={5} label="Action Items" value={actionItems} onChange={(event) => setActionItems(event.target.value)} />
          </Grid>
        </Grid>
      </Paper>
    </PlacementCoordinatorShell>
  );
}
