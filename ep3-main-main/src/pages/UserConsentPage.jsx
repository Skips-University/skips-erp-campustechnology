import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function UserConsentPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const role = global1.role || "User";
  const isStudent = /^student$/i.test(role);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [contentRes, statusRes] = await Promise.all([
        ep1.get("/api/v2/user-consent-content-current", { params: { colid: global1.colid, role } }),
        ep1.get("/api/v2/user-consent-status", { params: { colid: global1.colid, owneruser: global1.user, role } })
      ]);
      setContent(contentRes.data || null);
      setStatus(statusRes.data || null);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load consent details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const giveConsent = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-consent-give", {
        colid: global1.colid,
        role,
        owneruser: global1.user,
        ownername: global1.name,
        actoruser: global1.user,
        actorname: global1.name
      });
      setMessage("Consent recorded successfully");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to record consent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuPageShell title="Data Processing Consent" menuType={isStudent ? "student" : undefined}>
      <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
        <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>Data Processing Consent</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Review the institutional data processing notice and provide consent to continue using profile services.</Typography>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {status?.hasConsent && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Consent is active. Last recorded on {status.latest?.activitytime ? new Date(status.latest.activitytime).toLocaleString() : ""}.
          </Alert>
        )}
        <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>{content?.title || "Consent Notice"}</Typography>
              <Typography color="text.secondary">Applicable role: {role}</Typography>
            </Box>
            <Chip color={content?.defaultcontent ? "warning" : "primary"} label={content?.defaultcontent ? "Standard notice" : "Custom role notice"} />
          </Stack>
          <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{content?.content || ""}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={giveConsent} disabled={loading || status?.hasConsent}>
              {status?.hasConsent ? "Consent Given" : "I Agree and Give Consent"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/userconsentwithdraw")}>Withdraw Consent</Button>
            <Button variant="text" onClick={() => navigate(isStudent ? "/studentprofiledynamic" : "/userprofileedit")}>Back to Profile</Button>
          </Stack>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
