import React, { useEffect, useState } from "react";
import { Alert, Box, Button, LinearProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuPageShell from "./MenuPageShell";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function UserConsentWithdrawPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const role = global1.role || "User";
  const isStudent = /^student$/i.test(role);

  const load = async () => {
    try {
      setLoading(true);
      const res = await ep1.get("/api/v2/user-consent-status", { params: { colid: global1.colid, owneruser: global1.user, role } });
      setStatus(res.data || null);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load consent status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const withdraw = async () => {
    if (!window.confirm("Withdraw consent? This may restrict profile editing and some services.")) return;
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await ep1.post("/api/v2/user-consent-withdraw", {
        colid: global1.colid,
        role,
        owneruser: global1.user,
        ownername: global1.name,
        actoruser: global1.user,
        actorname: global1.name,
        comments
      });
      setMessage("Consent withdrawal recorded");
      setComments("");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to withdraw consent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuPageShell title="Withdraw Consent" menuType={isStudent ? "student" : undefined}>
      <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>Withdraw Consent</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>A withdrawal record will be stored with your user details, IP address, and timestamp.</Typography>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          {status?.hasConsent ? (
            <Alert severity="success" sx={{ mb: 2 }}>Current consent status: Active</Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>No active consent is currently recorded.</Alert>
          )}
          <TextField fullWidth multiline minRows={5} label="Reason / comments" value={comments} onChange={(event) => setComments(event.target.value)} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="error" disabled={loading || !status?.hasConsent} onClick={withdraw}>Withdraw Consent</Button>
            <Button variant="outlined" onClick={() => navigate("/userconsent")}>Give Consent</Button>
            <Button variant="text" onClick={() => navigate(isStudent ? "/studentprofiledynamic" : "/userprofileedit")}>Back to Profile</Button>
          </Stack>
        </Paper>
      </Box>
    </MenuPageShell>
  );
}
