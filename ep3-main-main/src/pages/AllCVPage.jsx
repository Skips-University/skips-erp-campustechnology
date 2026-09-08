import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  TextField,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ep1 from "../api/ep1";
import global1 from "./global1";

const CVCard = ({ cv }) => (
  <Card elevation={3} sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" fontWeight={600}>
        {cv.studentname}
      </Typography>
      <Typography color="text.secondary">{cv.studentemail}</Typography>
      <Typography variant="body2">Program: {cv.programcode || "—"}</Typography>
      <Typography variant="body2">
        Institute: {cv.institutename || "—"}
      </Typography>
      <Typography variant="body2">
        CGPA: {cv.totalcgpa || "—"} | 10th: {cv.tenthmarks} | 12th:{" "}
        {cv.twelthmarks}
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
        {cv.skills?.map((s) => (
          <Chip label={s} size="small" key={s} />
        ))}
      </Box>

      {cv.experience?.length && (
        <Accordion elevation={0} sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">
              Experience ({cv.experience.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {cv.experience.map((e, i) => (
              <Box key={i} mb={1}>
                <Typography fontWeight={600}>{e.companyname}</Typography>
                <Typography variant="body2">{e.desc}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {cv.projects?.length && (
        <Accordion elevation={0} sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">
              Projects ({cv.projects.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {cv.projects.map((p, i) => (
              <Box key={i} mb={1}>
                <Typography fontWeight={600}>{p.projectname}</Typography>
                <Typography variant="body2">{p.technologies}</Typography>
                <Typography variant="body2">{p.desc}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </CardContent>
  </Card>
);

const AllCVPage = () => {
  const [cvs, setCVs] = useState([]);
  const [loading, setLoading] = useState(true);

  // single source of truth for every filter
  const [program, setProgram] = useState("");
  const [tenthMin, setTenthMin] = useState("");
  const [twelthMin, setTwelthMin] = useState("");
  const [cgpaMin, setCgpaMin] = useState("");
  const [skills, setSkills] = useState("");

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchCVs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { colid: global1.colid };
      if (program.trim()) params.programcode = program.trim();
      if (tenthMin) params.tenthmin = tenthMin;
      if (twelthMin) params.twelthmin = twelthMin;
      if (cgpaMin) params.cgpamin = cgpaMin;
      if (skills.trim()) params.skills = skills.trim();

      const res = await ep1.get("/api/v2/searchcv", { params });
      setCVs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [program, tenthMin, twelthMin, cgpaMin, skills]);

  useEffect(() => {
    const delayed = debounce(fetchCVs, 300);
    delayed();
  }, [fetchCVs]);

  const clearAllFilters = () => {
    setProgram("");
    setTenthMin("");
    setTwelthMin("");
    setCgpaMin("");
    setSkills("");
    // fetchCVs will auto-run via useEffect
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        All CVs (Live Search)
      </Typography>

      {/* LIVE FILTER BAR */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3} alignItems="center">
        <TextField
          label="Program code"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          size="small"
        />
        <TextField
          label="≥ 10th %"
          value={tenthMin}
          onChange={(e) => setTenthMin(e.target.value)}
          size="small"
          type="number"
        />
        <TextField
          label="≥ 12th %"
          value={twelthMin}
          onChange={(e) => setTwelthMin(e.target.value)}
          size="small"
          type="number"
        />
        <TextField
          label="≥ CGPA"
          value={cgpaMin}
          onChange={(e) => setCgpaMin(e.target.value)}
          size="small"
          type="number"
        />
        <TextField
          label="Skills (comma separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          size="small"
        />
        <Button variant="outlined" color="secondary" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : cvs.length ? (
        cvs.map((cv) => <CVCard key={cv._id} cv={cv} />)
      ) : (
        <Typography>No CVs found</Typography>
      )}
    </Container>
  );
};

export default AllCVPage;
