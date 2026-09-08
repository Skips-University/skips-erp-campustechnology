import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MenuPageShell from "./MenuPageShell";
import { menuitemsall } from "./menuall";
import global1 from "./global1";
import ep1 from "../api/ep1";

const normalize = (value) => String(value || "").trim().toLowerCase();

const flattenChildren = (children) => React.Children.toArray(children).filter(Boolean);

const getElementText = (node) => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!React.isValidElement(node)) return "";
  if (typeof node.props?.primary === "string") return node.props.primary;
  return flattenChildren(node.props?.children).map(getElementText).filter(Boolean).join(" ");
};

const findFirstPrimary = (node) => {
  if (!React.isValidElement(node)) return "";
  if (typeof node.props?.primary === "string") return node.props.primary;
  for (const child of flattenChildren(node.props?.children)) {
    const text = findFirstPrimary(child);
    if (text) return text;
  }
  return "";
};

const collectPages = (node, group, pages = []) => {
  if (!React.isValidElement(node)) return pages;
  if (node.props?.to) {
    const title = findFirstPrimary(node);
    if (title && node.props.to) {
      pages.push({ group, title, path: node.props.to });
    }
  }
  flattenChildren(node.props?.children).forEach((child) => collectPages(child, group, pages));
  return pages;
};

const extractMenuItems = () => {
  const tree = menuitemsall();
  const accordions = flattenChildren(tree.props?.children);
  return accordions.flatMap((accordion) => {
    if (!React.isValidElement(accordion)) return [];
    const children = flattenChildren(accordion.props?.children);
    const group = getElementText(children[0]).trim();
    return collectPages(children[1], group);
  });
};

const applyRoleAccess = (items, rules) => {
  const role = normalize(global1.role);
  if (role === "all" || role === "admin") return items;

  const allowedKeys = new Set();
  const allowedPaths = new Set();
  const deniedKeys = new Set();
  const deniedPaths = new Set();

  (rules || []).forEach((rule) => {
    const ruleRole = normalize(rule.role);
    if (ruleRole !== role && ruleRole !== "all") return;

    const key = `${normalize(rule.menugroup)}|${normalize(rule.title)}`;
    const path = normalize(rule.path);
    const displayGroup = rule.groupname || rule.menugroup;
    if (normalize(rule.access) === "allow") {
      allowedKeys.add(key);
      allowedPaths.add(path);
      rule.displayGroup = displayGroup;
    } else {
      deniedKeys.add(key);
      deniedPaths.add(path);
    }
  });

  return items.filter((item) => {
    if (normalize(item.path) === "/menusearch") return true;
    const key = `${normalize(item.group)}|${normalize(item.title)}`;
    const path = normalize(item.path);
    if (deniedKeys.has(key) || deniedPaths.has(path)) return false;
    return allowedKeys.has(key) || allowedPaths.has(path);
  }).map((item) => {
    const matchingRule = (rules || []).find((rule) => {
      const ruleRole = normalize(rule.role);
      if (ruleRole !== role && ruleRole !== "all") return false;
      if (normalize(rule.access) !== "allow") return false;
      return normalize(rule.path) === normalize(item.path)
        || `${normalize(rule.menugroup)}|${normalize(rule.title)}` === `${normalize(item.group)}|${normalize(item.title)}`;
    });
    return matchingRule?.groupname ? { ...item, group: matchingRule.groupname } : item;
  });
};

const groupItems = (items) => items.reduce((acc, item) => {
  const group = item.group || "Other";
  if (!acc[group]) acc[group] = [];
  acc[group].push(item);
  return acc;
}, {});

export default function MenuSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isStudent = normalize(global1.role) === "student";

  useEffect(() => {
    const role = normalize(global1.role);
    if (role === "all" || role === "admin" || role === "student") return;

    const loadRules = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await ep1.get("/api/v2/menu-access", {
          params: { colid: global1.colid }
        });
        setRules(res.data?.data || []);
      } catch (err) {
        setError("Unable to load menu access rules. Please try again.");
        setRules([]);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  const visibleItems = useMemo(() => {
    if (isStudent) return [];
    return applyRoleAccess(extractMenuItems(), rules);
  }, [rules, isStudent]);

  const filteredItems = useMemo(() => {
    const term = normalize(query);
    const items = !term ? visibleItems : visibleItems.filter((item) => (
      normalize(item.group).includes(term)
      || normalize(item.title).includes(term)
      || normalize(item.path).includes(term)
    ));
    return items.sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
  }, [query, visibleItems]);

  const grouped = useMemo(() => groupItems(filteredItems), [filteredItems]);
  const groupNames = Object.keys(grouped).sort();

  const logout = () => {
    navigate("/");
  };

  return (
    <MenuPageShell title="Menu search">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
            <Box>
              <Breadcrumbs sx={{ mb: 1 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/dashdashfacnew">Dashboard</Link>
                <Typography color="text.primary">Menu search</Typography>
              </Breadcrumbs>
              <Typography variant="h4" fontWeight={700}>Menu search</Typography>
              <Typography color="text.secondary">Search the pages available for your current role.</Typography>
            </Box>
            <Button variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
              Logout
            </Button>
          </Stack>

          {isStudent && (
            <Alert severity="info">Menu search is available only for non-student roles.</Alert>
          )}
          {error && <Alert severity="warning">{error}</Alert>}

          <Card sx={{ borderRadius: 2, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Search menu"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Type page, group, or route"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip label={`${filteredItems.length} result${filteredItems.length === 1 ? "" : "s"}`} color="primary" variant="outlined" />
                  <Chip label={`${groupNames.length} group${groupNames.length === 1 ? "" : "s"}`} variant="outlined" />
                  {loading && <CircularProgress size={22} />}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {!loading && !isStudent && filteredItems.length === 0 && (
            <Alert severity="info">No matching menu links found.</Alert>
          )}

          <Grid container spacing={2}>
            {groupNames.map((group) => (
              <Grid item xs={12} md={6} lg={4} key={group}>
                <Card sx={{ height: "100%", borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Typography variant="h6" fontWeight={700}>{group}</Typography>
                      {grouped[group].map((item) => (
                        <Button
                          key={`${item.group}-${item.title}-${item.path}`}
                          component={RouterLink}
                          to={item.path}
                          variant="text"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          sx={{
                            justifyContent: "space-between",
                            textAlign: "left",
                            color: "#111827",
                            borderRadius: 1,
                            px: 1.25,
                            py: 1,
                            "&:hover": { backgroundColor: "#eef2ff" }
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={600} sx={{ whiteSpace: "normal", overflowWrap: "anywhere" }}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", whiteSpace: "normal", overflowWrap: "anywhere" }}>
                              {item.path}
                            </Typography>
                          </Box>
                        </Button>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </MenuPageShell>
  );
}
