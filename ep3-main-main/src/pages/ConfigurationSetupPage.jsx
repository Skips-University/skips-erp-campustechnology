import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import ProgramManagementPage from "./ProgramManagementPage";
import Mbuser from "./Mbuser";
import MenuAccessControlPage from "./MenuAccessControlPage";
import AwsConfigCrudPage from "./AwsConfigCrudPage";
import EmailConfigurationPage from "./EmailConfigurationPage";
import AiConfigurationPage from "./AiConfigurationPage";

const setupTabs = [
  { key: "programs", label: "Program List" },
  { key: "users", label: "Non Student Users" },
  { key: "menu", label: "Menu Access Control" },
  { key: "aws", label: "AWS Configuration" },
  { key: "email", label: "Email Configuration" },
  { key: "ai", label: "AI Configuration" }
];

const getArrayLength = (payload) => {
  if (Array.isArray(payload)) return payload.length;
  if (Array.isArray(payload?.data)) return payload.data.length;
  return 0;
};

export default function ConfigurationSetupPage() {
  const navigate = useNavigate();
  const colid = global1.colid;
  const [tab, setTab] = useState(0);
  const [counts, setCounts] = useState({
    programs: 0,
    users: 0,
    menu: 0,
    aws: 0,
    email: 0,
    ai: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const completedCount = useMemo(
    () => setupTabs.filter((item) => (counts[item.key] || 0) > 0).length,
    [counts]
  );
  const progress = Math.round((completedCount / setupTabs.length) * 100);
  const hasPrograms = (counts.programs || 0) > 0;

  const updateCount = (key, rows) => {
    setCounts((prev) => ({ ...prev, [key]: Array.isArray(rows) ? rows.length : 0 }));
  };

  const refreshProgress = async () => {
    if (!colid) {
      setError("College id is not available. Please login again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [programs, users, menu, aws, email, ai] = await Promise.all([
        ep1.get("/api/v2/mprograms-management", { params: { colid } }),
        ep1.get("/mbusers", { params: { colid } }),
        ep1.get("/api/v2/menu-access", { params: { colid } }),
        ep1.get("/api/v2/aws-config", { params: { colid } }),
        ep1.get("/api/v2/email-configuration", { params: { colid } }),
        ep1.get("/api/v2/ai-configuration", { params: { colid } })
      ]);

      setCounts({
        programs: getArrayLength(programs.data),
        users: getArrayLength(users.data),
        menu: getArrayLength(menu.data),
        aws: getArrayLength(aws.data),
        email: getArrayLength(email.data),
        ai: getArrayLength(ai.data)
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || err.message || "Unable to load setup progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProgress();
  }, [colid]);

  const handleTabChange = (event, nextTab) => {
    if (!hasPrograms && nextTab !== 0) {
      setError("Please add at least one program before opening other configuration pages.");
      setTab(0);
      return;
    }
    setError("");
    setTab(nextTab);
  };

  const renderTabContent = () => {
    switch (setupTabs[tab].key) {
      case "programs":
        return <ProgramManagementPage embedded onRowsChange={(rows) => updateCount("programs", rows)} />;
      case "users":
        return <Mbuser embedded onRowsChange={(rows) => updateCount("users", rows)} />;
      case "menu":
        return <MenuAccessControlPage embedded onRowsChange={(rows) => updateCount("menu", rows)} />;
      case "aws":
        return <AwsConfigCrudPage embedded onRowsChange={(rows) => updateCount("aws", rows)} />;
      case "email":
        return <EmailConfigurationPage embedded onRowsChange={(rows) => updateCount("email", rows)} />;
      case "ai":
        return <AiConfigurationPage embedded onRowsChange={(rows) => updateCount("ai", rows)} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Configuration</Typography>
            <Typography variant="body2" color="text.secondary">
              Complete the basic setup before moving into the rest of the system.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshProgress} disabled={loading}>
              Refresh progress
            </Button>
            <Button
              variant="contained"
              startIcon={<DashboardIcon />}
              disabled={!hasPrograms}
              onClick={() => navigate("/dashdashfacnew")}
            >
              Dashboard
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {!hasPrograms && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Add at least one program in the first tab. Other pages and the dashboard will unlock after that.
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} sx={{ mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 10 }} />
          </Box>
          <Typography variant="body2" fontWeight={700}>{progress}% complete</Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {setupTabs.map((item) => {
            const complete = (counts[item.key] || 0) > 0;
            return (
              <Chip
                key={item.key}
                icon={complete ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                color={complete ? "success" : "default"}
                variant={complete ? "filled" : "outlined"}
                label={`${item.label}: ${complete ? "Complete" : "Pending"}`}
              />
            );
          })}
        </Stack>
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {setupTabs.map((item, index) => {
            const complete = (counts[item.key] || 0) > 0;
            return (
              <Tab
                key={item.key}
                disabled={!hasPrograms && index !== 0}
                icon={complete ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
                iconPosition="start"
                label={item.label}
              />
            );
          })}
        </Tabs>
      </Paper>

      {renderTabContent()}
    </Container>
  );
}
