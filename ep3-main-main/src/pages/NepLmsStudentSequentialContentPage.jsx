import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import { ArrowBack, CheckCircle, Lock, PlayCircle, Refresh } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const uniqueSorted = (values = []) => [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b));

const tabMeta = [
  { key: "completed", label: "Completed", color: "success", icon: <CheckCircle fontSize="small" /> },
  { key: "pending", label: "Pending", color: "primary", icon: <PlayCircle fontSize="small" /> },
  { key: "notopened", label: "Not opened", color: "default", icon: <Lock fontSize="small" /> }
];

export default function NepLmsStudentSequentialContentPage() {
  const [searchParams] = useSearchParams();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ academicyear: "", semester: "" });
  const [courseId, setCourseId] = useState("");
  const [lessonContent, setLessonContent] = useState([]);
  const [tab, setTab] = useState(0);
  const [selectedSequenceId, setSelectedSequenceId] = useState("");
  const [flippedCards, setFlippedCards] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCourse = useMemo(() => courses.find((row) => row._id === courseId) || null, [courses, courseId]);
  const years = useMemo(() => uniqueSorted(courses.map((row) => row.academicyear)), [courses]);
  const semesters = useMemo(() => uniqueSorted(courses.filter((row) => !filters.academicyear || row.academicyear === filters.academicyear).map((row) => row.semester)), [courses, filters.academicyear]);
  const filteredCourses = useMemo(() => courses.filter((row) => (
    (!filters.academicyear || row.academicyear === filters.academicyear)
    && (!filters.semester || row.semester === filters.semester)
  )), [courses, filters]);

  const sequences = useMemo(() => {
    const map = new Map();
    [...lessonContent].sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0)).forEach((item) => {
      const key = String(item.lessonresourceid || "general");
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title: item.lessonplantitle || "Lesson sequence",
          module: item.module || "",
          topic: item.topics || "",
          rows: []
        });
      }
      map.get(key).rows.push(item);
    });
    return [...map.values()].map((sequence) => {
      const total = sequence.rows.length;
      const completedCount = sequence.rows.filter((item) => item.completed).length;
      const status = total && completedCount === total
        ? "completed"
        : completedCount > 0
          ? "pending"
          : "notopened";
      const nextItem = sequence.rows.find((item) => !item.completed && !item.locked) || null;
      return {
        ...sequence,
        total,
        completedCount,
        status,
        nextItem
      };
    });
  }, [lessonContent]);

  const selectedSequence = useMemo(() => sequences.find((sequence) => sequence.id === selectedSequenceId) || null, [sequences, selectedSequenceId]);

  useEffect(() => {
    const requestedSequenceId = searchParams.get("sequenceid") || "";
    const requestedContentId = searchParams.get("contentid") || "";
    if (!sequences.length || selectedSequenceId) return;
    const requestedSequence = sequences.find((sequence) => (
      (requestedSequenceId && String(sequence.id) === String(requestedSequenceId))
      || (requestedContentId && sequence.rows.some((row) => String(row._id) === String(requestedContentId)))
    ));
    if (requestedSequence) {
      setSelectedSequenceId(requestedSequence.id);
      setTab(tabMeta.findIndex((item) => item.key === requestedSequence.status));
    }
  }, [searchParams, selectedSequenceId, sequences]);

  const grouped = useMemo(() => ({
    completed: sequences.filter((sequence) => sequence.status === "completed"),
    pending: sequences.filter((sequence) => sequence.status === "pending"),
    notopened: sequences.filter((sequence) => sequence.status === "notopened")
  }), [sequences]);

  const displayRowsForSequence = useMemo(() => {
    if (!selectedSequence) return [];
    let previousComplete = true;
    return selectedSequence.rows.map((row) => {
      const effectiveLocked = !previousComplete;
      previousComplete = previousComplete && Boolean(row.completed);
      return { ...row, locked: effectiveLocked };
    });
  }, [selectedSequence]);

  const currentSequenceStatus = useMemo(() => {
    if (!selectedSequence) return null;
    const total = displayRowsForSequence.length;
    const completedCount = displayRowsForSequence.filter((item) => item.completed).length;
    return { total, completedCount, percent: total ? Math.round((completedCount / total) * 100) : 0 };
  }, [selectedSequence, displayRowsForSequence]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) loadSequentialContent(selectedCourse);
    else setLessonContent([]);
  }, [courseId]);

  const baseParams = (extra = {}) => ({
    colid: global1.colid,
    regno: global1.regno,
    ...extra
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/student-workspace/courses", { params: baseParams() });
      const nextCourses = res.data?.courses || [];
      const nextStudent = res.data?.student || null;
      setStudent(nextStudent);
      setCourses(nextCourses);
      const defaultYear = nextStudent?.academicyear || uniqueSorted(nextCourses.map((row) => row.academicyear))[0] || "";
      const defaultSemester = nextStudent?.semester || uniqueSorted(nextCourses.filter((row) => !defaultYear || row.academicyear === defaultYear).map((row) => row.semester))[0] || "";
      const requestedCourseId = searchParams.get("courseid") || "";
      const requestedCourseCode = searchParams.get("coursecode") || "";
      const requestedCourse = nextCourses.find((row) => (
        (requestedCourseId && String(row._id) === requestedCourseId)
        || (requestedCourseCode && String(row.coursecode || "").toLowerCase() === requestedCourseCode.toLowerCase())
      ));
      const defaultCourse = requestedCourse || nextCourses.find((row) => (!defaultYear || row.academicyear === defaultYear) && (!defaultSemester || row.semester === defaultSemester)) || nextCourses[0];
      setFilters({ academicyear: defaultYear, semester: defaultSemester });
      setCourseId(defaultCourse?._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load student courses");
    } finally {
      setLoading(false);
    }
  };

  const loadSequentialContent = async (course = selectedCourse) => {
    if (!course) {
      setLessonContent([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await ep1.get("/api/v2/neplms/student-workspace/lesson-content", {
        params: baseParams({
          academicyear: course.academicyear,
          semester: course.semester,
          coursecode: course.coursecode
        })
      });
      setLessonContent(res.data?.data || []);
    } catch (err) {
      setLessonContent([]);
      setError(err.response?.data?.message || "Unable to load sequential content");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (field, value) => {
    const nextFilters = { ...filters, [field]: value };
    if (field === "academicyear") {
      nextFilters.semester = uniqueSorted(courses.filter((row) => row.academicyear === value).map((row) => row.semester))[0] || "";
    }
    setFilters(nextFilters);
    const nextCourse = courses.find((row) => (
      (!nextFilters.academicyear || row.academicyear === nextFilters.academicyear)
      && (!nextFilters.semester || row.semester === nextFilters.semester)
    ));
    setCourseId(nextCourse?._id || "");
  };

  const completeContent = async (content) => {
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const res = await ep1.post("/api/v2/neplms/student-workspace/lesson-content-complete", {
        colid: global1.colid,
        regno: global1.regno,
        user: global1.user,
        contentid: content._id
      });
      const progress = res.data?.progress;
      setMessage(progress
        ? `Step ${content.sequence || ""} completed. Progress: ${progress.completedsteps}/${progress.totalsteps} (${progress.progresspercentage}%).`
        : "Content marked completed.");
      await loadSequentialContent();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark content completed");
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelect = (label, value, onChange, options) => (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <MenuItem key={option.value || option} value={option.value || option}>
            <Checkbox checked={String(value) === String(option.value || option)} />
            <ListItemText primary={option.label || option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderSequenceCard = (sequence) => {
    const state = tabMeta.find((item) => item.key === sequence.status) || tabMeta[2];
    return (
      <Card
        key={sequence.id}
        variant="outlined"
        sx={{
          height: "100%",
          borderRadius: 2,
          borderColor: sequence.status === "completed" ? "success.light" : sequence.status === "pending" ? "primary.light" : "grey.300",
          bgcolor: sequence.status === "notopened" ? "#f8fafc" : "background.paper",
          transition: "transform 180ms ease, box-shadow 180ms ease",
          "&:hover": { transform: "translateY(-3px)", boxShadow: 4 }
        }}
      >
        <CardActionArea onClick={() => setSelectedSequenceId(sequence.id)} sx={{ height: "100%", alignItems: "stretch" }}>
          <CardContent sx={{ height: "100%" }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Chip size="small" color={state.color} icon={state.icon} label={state.label} />
              <Chip size="small" label={`${sequence.completedCount}/${sequence.total} done`} />
              {sequence.nextItem && <Chip size="small" color="primary" label={`Next: Seq ${sequence.nextItem.sequence}`} />}
            </Stack>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>{sequence.title}</Typography>
            {sequence.topic && <Typography variant="body2" sx={{ mt: 1 }}>Topic: {sequence.topic}</Typography>}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Open this sequence to complete each task in order. The next task unlocks only after the previous task is completed.
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const flashcardKey = (item, card, index) => `${item?._id}-${card?._id || index}`;

  const renderContentBody = (item) => {
    if (item.locked) return <Alert severity="info">Complete the previous task in this sequence to unlock this item.</Alert>;
    return (
      <Stack spacing={2}>
        {["Text", "File Link", "Infographics"].includes(item.contenttype) && item.filelink && (
          <Button variant="outlined" href={item.filelink} target="_blank" rel="noreferrer">Open file/content</Button>
        )}
        {item.contenttype === "Video Link" && item.videolink && (
          <Button variant="outlined" href={item.videolink} target="_blank" rel="noreferrer">Open video</Button>
        )}
        {item.contenttype === "Quiz" && (
          <Alert severity="warning">This item is linked to quiz: {item.quiztitle || "Quiz"}. Submit the quiz from My NEP LMS before marking this item complete.</Alert>
        )}
        {item.contenttype === "Mindmap" && (
          <Button
            variant="outlined"
            component={RouterLink}
            to={`/studentneplmsmindmaps?coursecode=${encodeURIComponent(item.coursecode || selectedCourse?.coursecode || "")}&mindmapid=${encodeURIComponent(item.mindmapid || "")}`}
          >
            Open mindmap: {item.mindmaptitle || item.title || "Mindmap"}
          </Button>
        )}
        {item.contenttype === "Flash Card" && (
          <Grid container spacing={2}>
            {(item.flashcards || []).map((card, index) => {
              const key = flashcardKey(item, card, index);
              const flipped = Boolean(flippedCards[key]);
              return (
                <Grid item xs={12} md={6} key={key}>
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => setFlippedCards((prev) => ({ ...prev, [key]: !prev[key] }))}
                    sx={{ perspective: "1200px", cursor: "pointer" }}
                  >
                    <Box sx={{
                      position: "relative",
                      minHeight: 220,
                      transformStyle: "preserve-3d",
                      transition: "transform 0.6s ease",
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}>
                      <Paper sx={{ position: "absolute", inset: 0, p: 2, backfaceVisibility: "hidden", borderRadius: 2, border: "1px solid #bfdbfe", bgcolor: "#eff6ff" }}>
                        <Chip size="small" label={`Card ${index + 1}`} color="primary" sx={{ mb: 1 }} />
                        <Typography variant="overline">Question</Typography>
                        <Typography fontWeight={800}>{card.question}</Typography>
                        {card.questionimage && <Box component="img" src={card.questionimage} alt="Flash card" sx={{ maxWidth: "100%", maxHeight: 110, objectFit: "contain", mt: 1 }} />}
                      </Paper>
                      <Paper sx={{ position: "absolute", inset: 0, p: 2, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 2, border: "1px solid #bbf7d0", bgcolor: "#f0fdf4" }}>
                        <Chip size="small" label={`Card ${index + 1}`} color="success" sx={{ mb: 1 }} />
                        <Typography variant="overline">Answer</Typography>
                        <Typography fontWeight={800}>{card.answer}</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Stack>
    );
  };

  const renderSequenceViewer = () => {
    if (!selectedSequence) return null;
    return (
      <Dialog open={Boolean(selectedSequence)} onClose={() => setSelectedSequenceId("")} fullWidth maxWidth="lg">
        <DialogTitle>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>{selectedSequence.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Complete each task in order. The next level opens only after the previous task is completed.
              </Typography>
            </Box>
            {currentSequenceStatus && <Chip color="primary" label={`${currentSequenceStatus.completedCount}/${currentSequenceStatus.total} complete (${currentSequenceStatus.percent}%)`} />}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {displayRowsForSequence.map((item, index) => (
              <Paper
                key={item._id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: item.completed ? "success.light" : item.locked ? "grey.300" : "primary.light",
                  bgcolor: item.locked ? "#f8fafc" : "background.paper"
                }}
              >
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 1 }}>
                  <Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      <Chip size="small" label={`Level ${index + 1}`} color={item.completed ? "success" : item.locked ? "default" : "primary"} />
                      <Chip size="small" label={`Seq ${item.sequence || index + 1}`} />
                      <Chip size="small" label={item.contenttype || "Content"} />
                    {item.completed && <Chip size="small" color="success" label={`Completed${item.completedat ? ` ${new Date(item.completedat).toLocaleString()}` : ""}`} />}
                      {item.locked && <Chip size="small" icon={<Lock fontSize="small" />} label="Locked" />}
                    </Stack>
                    <Typography variant="h6" fontWeight={800}>{item.title || "Untitled content"}</Typography>
                    {item.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{item.description}</Typography>}
                  </Box>
                  <Button
                    variant={item.completed ? "outlined" : "contained"}
                    disabled={item.locked || item.completed || submitting}
                    onClick={() => completeContent(item)}
                  >
                    {item.completed ? "Completed" : item.locked ? "Complete previous" : "Mark complete"}
                  </Button>
                </Stack>
                {renderContentBody(item)}
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSequenceId("")}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <MenuPageShell title="Sequential Content" menuType="student">
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Button size="small" component={RouterLink} to="/dashmclassenr1stud" startIcon={<ArrowBack />}>Dashboard</Button>
          <Typography color="text.primary">My LMS</Typography>
          <Typography color="text.primary">Sequential Content</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>Sequential Content</Typography>
              <Typography color="text.secondary">Select your course and open learning content in sequence.</Typography>
            </Box>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadCourses}>Refresh</Button>
          </Stack>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
          {student && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <Chip label={`Student: ${student.name}`} />
              <Chip label={`Reg No: ${student.regno}`} />
              <Chip label={`Academic Year: ${student.academicyear}`} />
              <Chip label={`Program: ${student.programcode || student.program}`} />
            </Stack>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>{renderSelect("Academic Year", filters.academicyear, (value) => updateFilter("academicyear", value), years)}</Grid>
            <Grid item xs={12} md={3}>{renderSelect("Semester", filters.semester, (value) => updateFilter("semester", value), semesters)}</Grid>
            <Grid item xs={12} md={6}>{renderSelect("Course", courseId, setCourseId, filteredCourses.map((course) => ({
              value: course._id,
              label: `${course.coursecode} - ${course.course} | ${course.subject || course.major || ""}`
            })))}</Grid>
          </Grid>
        </Paper>

        {selectedCourse && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip color="primary" label={`${selectedCourse.coursecode} - ${selectedCourse.course}`} />
              <Chip label={`Faculty: ${selectedCourse.facultyname || "-"}`} />
              <Chip label={`Semester: ${selectedCourse.semester || "-"}`} />
            </Stack>
          </Paper>
        )}

        <Paper sx={{ mb: 2, borderRadius: 2 }}>
          <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
            {tabMeta.map((item) => (
              <Tab key={item.key} label={`${item.label} (${grouped[item.key].length})`} />
            ))}
          </Tabs>
        </Paper>

        <Grid container spacing={2}>
          {grouped[tabMeta[tab].key].map((sequence) => (
            <Grid item xs={12} md={4} key={sequence.id}>{renderSequenceCard(sequence)}</Grid>
          ))}
          {!grouped[tabMeta[tab].key].length && (
            <Grid item xs={12}>
              <Alert severity="info">No content in {tabMeta[tab].label}.</Alert>
            </Grid>
          )}
        </Grid>

        {renderSequenceViewer()}
      </Box>
    </MenuPageShell>
  );
}
