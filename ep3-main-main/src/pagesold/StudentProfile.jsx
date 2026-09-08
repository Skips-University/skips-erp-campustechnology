import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Avatar,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Book as BookIcon,
  School as SchoolIcon,
  FileCopy as FileCopyIcon,
  DirectionsBus as LocalBusIcon,
  Event as EventIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Badge as BadgeIcon,
  EmojiTransportation as EmojiTransportationIcon,
  AirlineSeatReclineNormal as SeatIcon,
  Bed as BedIcon,          // <-- Add this line
} from "@mui/icons-material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StudentProfile = () => {
  const navigate = useNavigate();
  const colid = global1.colid;
  const regno = global1.regno;
  const email = global1.user;

  // State variables
  const [userData, setUserData] = useState(null);
  const [examMarksData, setExamMarksData] = useState([]); // Array now
  const [applicationFormData, setApplicationFormData] = useState(null);
  const [busSeatAllocationData, setBusSeatAllocationData] = useState(null);
  const [eventRegistrationData, setEventRegistrationData] = useState([]);
  const [hostelBedAllocationData, setHostelBedAllocationData] = useState(null);
  const [rubricData, setRubricData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Helper render function for consistent field display
  const renderField = (label, value, icon, sideBySide = false) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <Box
        key={label}
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          mb: sideBySide ? 1.5 : 2,
          flexWrap: sideBySide ? "wrap" : "nowrap",
        }}
      >
        {icon && (
          <Box
            sx={{
              color: "primary.main",
              minWidth: 24,
              textAlign: "center",
              ml: 0.5,
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            sx={{ mr: 1, fontWeight: 600, fontSize: "0.9rem" }}
          >
            {label}:
          </Typography>
          <Typography
            variant="body1"
            fontWeight={500}
            sx={{ fontSize: "1rem", wordBreak: "break-word" }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Reusable card wrapper
  const ProfileCard = ({ title, icon, children }) => (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        width: "100%",
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        avatar={icon}
        title={
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "white",
              fontSize: isSmallScreen ? "1.2rem" : "1.4rem",
              letterSpacing: "0.03em",
            }}
          >
            {title}
          </Typography>
        }
        sx={{
          bgcolor: "primary.main",
          borderRadius: "8px 8px 0 0",
          px: 3,
          py: 1.5,
        }}
      />
      <Divider />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          px: 3,
          py: 2.5,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );

  // Render application sections dynamically
  const renderSection = (title, fields) => {
    const present = fields.filter(
      (f) =>
        applicationFormData?.[f] !== undefined &&
        applicationFormData?.[f] !== null &&
        applicationFormData?.[f] !== ""
    );
    if (present.length === 0) return null;
    return (
      <Accordion
        defaultExpanded
        sx={{
          mb: 1,
          boxShadow: "none",
          borderRadius: 2,
          border: "1px solid #ddd",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ px: 2, minHeight: 48 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.2rem",
              letterSpacing: "0.03em",
            }}
          >
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 2 }}>
          <Grid container spacing={2}>
            {present.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  {f.replace(/([A-Z])/g, " $1")}
                </Typography>
                <Typography sx={{ fontSize: "1rem", fontWeight: 500, mt: 0.5 }}>
                  {String(applicationFormData?.[f])}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Render array fields in application form data
  const renderArraySection = (title, arrKey) => {
    const list = applicationFormData?.[arrKey];
    if (!Array.isArray(list) || list.length === 0) return null;
    return (
      <Accordion
        sx={{
          mb: 1,
          boxShadow: "none",
          borderRadius: 2,
          border: "1px solid #ddd",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ px: 2, minHeight: 48 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.2rem",
              letterSpacing: "0.03em",
            }}
          >
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 2 }}>
          <Grid container spacing={2}>
            {list.map((item, idx) => (
              <Grid item xs={12} key={idx}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, backgroundColor: "#fafafa", borderRadius: 1 }}
                >
                  <Grid container spacing={2}>
                    {Object.entries(item).map(([k, v]) => (
                      <Grid item xs={12} sm={6} md={4} key={k}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                        >
                          {k.replace(/([A-Z])/g, " $1")}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "1rem", fontWeight: 500, mt: 0.5 }}
                        >
                          {String(v)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          userRes,
          examRes,
          appFormRes,
          busRes,
          eventRes,
          hostelRes,
          rubricRes,
        ] = await Promise.all([
          ep1.get(
            `/api/v2/getuserds?colid=${colid}&regno=${regno}&email=${email}`
          ),
          ep1.get(`/api/v2/getexammarks?colid=${colid}&regno=${regno}`),
          ep1.get(`/api/v2/getapplicationformds?colid=${colid}&email=${email}`),
          ep1.get(`/api/v2/getbusseatallocation?colid=${colid}&regno=${regno}`),
          ep1.get(`/api/v2/geteventregistration?colid=${colid}&email=${email}`),
          ep1.get(
            `/api/v2/gethostelbedallocation?colid=${colid}&regno=${regno}`
          ),
          ep1.get(`/api/v2/getrubricds?colid=${colid}&regno=${regno}`),
        ]);

        setUserData(userRes.data);
        setExamMarksData(
          Array.isArray(examRes.data)
            ? examRes.data
            : examRes.data
            ? [examRes.data]
            : []
        );
        setApplicationFormData(appFormRes.data);
        setBusSeatAllocationData(busRes.data);
        setEventRegistrationData(eventRes.data);
        setHostelBedAllocationData(hostelRes.data);
        setRubricData(Array.isArray(rubricRes.data) ? rubricRes.data : []);
      } catch (err) {
        setError(
          err.response?.data?.error || err.message || "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (colid && regno && email) {
      fetchData();
    } else {
      navigate("/", { replace: true });
    }
  }, [colid, regno, email, navigate]);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={80} />
      </Box>
    );

  if (error)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="error" sx={{ maxWidth: 500, m: "auto" }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 4, maxWidth: 1200, mx: "auto" }}>
      {/* Profile Header */}
      <Card
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          p: isSmallScreen ? 2 : 3,
          mb: 5,
          boxShadow: 4,
          borderRadius: 3,
          width: "100%",
        }}
      >
        <Avatar
          src={userData?.photo || ""}
          alt={userData?.name}
          sx={{
            width: 140,
            height: 140,
            mr: isSmallScreen ? 0 : 4,
            mb: isSmallScreen ? 2 : 0,
            boxShadow: 3,
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            fontWeight="bold"
            sx={{ mb: 0.5 }}
          >
            {userData?.name}
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mb: 1, fontSize: isSmallScreen ? "1rem" : "1.1rem" }}
          >
            {userData?.department} | {userData?.programcode}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 0.7, fontWeight: 600, fontSize: "1.05rem" }}
          >
            Reg No: {userData?.regno}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: "0.9rem", fontWeight: 500 }}
          >
            Semester {userData?.semester} | Admission Year{" "}
            {userData?.admissionyear}
          </Typography>
          <Box
            mt={2}
            display="flex"
            gap={3}
            flexWrap="wrap"
            sx={{ fontSize: "1rem" }}
          >
            {renderField(
              "Email",
              userData?.email,
              <EmailIcon fontSize="small" />
            )}
            {renderField(
              "Phone",
              userData?.phone,
              <PhoneIcon fontSize="small" />
            )}
          </Box>
        </Box>
      </Card>

      {/* Info Cards - Stacked in Column*/}
      <Grid container direction="column" rowSpacing={4}>
        {/* Application Form Data */}
        {applicationFormData && Object.keys(applicationFormData).length > 0 && (
          <Grid item xs={12}>
            <ProfileCard
              title="Application Info"
              icon={<FileCopyIcon sx={{ color: "white" }} />}
            >
              {renderSection("Personal Details", [
                "name",
                "email",
                "phone",
                "dateOfBirth",
                "maritalStatus",
                "bloodGroup",
                "address",
                "category",
                "caste",
                "reservedCategory",
                "religion",
                "aadhaarNumber",
                "language1",
                "language2",
              ])}
              {renderSection("Parent / Guardian", [
                "parentName",
                "parentPhoneNumber",
                "parentAnnualIncome",
                "parentOccupation",
                "guardianName",
                "guardianPhoneNumber",
              ])}
              {renderSection("Program Choice", [
                "programOptingFor",
                "previousQualifyingExamRegNo",
                "capID",
                "referenceNumber",
                "hostelRequired",
                "transportationRequired",
              ])}
              {renderSection("10th Details", [
                "tenthExamName",
                "tenthBoardName",
                "tenthMarks",
                "tenthSchoolName",
                "tenthYearOfPassing",
                "tenthNoOfAttempts",
              ])}
              {renderSection("12th Details", [
                "twelfthExamName",
                "twelfthBoardName",
                "twelfthMarks",
                "twelfthSchoolName",
                "twelfthYearOfPassing",
                "twelfthNoOfAttempts",
              ])}
              {renderSection("UG Details", [
                "institutionName",
                "universityName",
                "ugCGPA",
                "ugYearOfPassing",
                "ugNoOfChances",
              ])}
              {renderArraySection("10th Subjects", "tenthSubjects")}
              {renderArraySection("12th Subjects", "twelfthSubjects")}
              {renderArraySection("UG Semesters", "semesters")}
            </ProfileCard>
          </Grid>
        )}

        {/* Academic Info: Multiple exam marks accordions */}
        {examMarksData && examMarksData.length > 0 && (
          <Grid item xs={12}>
            <ProfileCard
              title="Academic Info"
              icon={<SchoolIcon sx={{ color: "white" }} />}
            >
              {examMarksData.map((exam, idx) => (
                <Accordion
                  key={exam._id || idx}
                  defaultExpanded
                  sx={{ mb: 1, borderRadius: 2, border: "1px solid #ddd" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 2, minHeight: 48 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {`${exam.coursecode || "Course Code"} - ${
                        exam.course || "Course"
                      } (${exam.semester || ""})`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        {renderField(
                          "Course Code",
                          exam.coursecode,
                          <BookIcon />,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "Exam Code",
                          exam.examcode,
                          <BadgeIcon />,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "IA Marks",
                          exam.iamarks,
                          <FileCopyIcon />,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "EA Marks",
                          exam.eamarks,
                          <FileCopyIcon />,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "Total Marks",
                          exam.totalmarks,
                          <BadgeIcon />,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField("Grade", exam.egrade, <BadgeIcon />, true)}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </ProfileCard>
          </Grid>
        )}

        {/* Bus Seat Allocation */}
        {busSeatAllocationData &&
          Object.keys(busSeatAllocationData).length > 0 && (
            <Grid item xs={12}>
              <ProfileCard
                title="Bus Seat Allocation"
                icon={<LocalBusIcon sx={{ color: "white" }} />}
              >
                {renderField(
                  "Bus Number",
                  busSeatAllocationData?.busnumber,
                  <EmojiTransportationIcon />
                )}
                {renderField(
                  "Seat No",
                  busSeatAllocationData?.seatno,
                  <SeatIcon />
                )}
              </ProfileCard>
            </Grid>
          )}

        {/* Hostel Bed Allocation */}
        {hostelBedAllocationData &&
          Object.keys(hostelBedAllocationData).length > 0 && (
            <Grid item xs={12}>
              <ProfileCard
                title="Hostel Info"
                icon={<HomeIcon sx={{ color: "white" }} />}
              >
                {renderField(
                  "Building",
                  hostelBedAllocationData?.buildingname,
                  <ApartmentIcon />
                )}
                {renderField(
                  "Room",
                  hostelBedAllocationData?.roomname,
                  <HomeIcon />
                )}
                {renderField(
                  "Bed",
                  hostelBedAllocationData?.bednumber,
                  <BedIcon />
                )}
              </ProfileCard>
            </Grid>
          )}

        {/* Event Participation */}
        {eventRegistrationData && eventRegistrationData.length > 0 && (
          <Grid item xs={12}>
            <ProfileCard
              title="Event Participation"
              icon={<EventIcon sx={{ color: "white" }} />}
            >
              {eventRegistrationData.map((eventRegistration, index) => (
                <Accordion
                  key={eventRegistration._id || index}
                  defaultExpanded
                  sx={{ mb: 1, borderRadius: 2, border: "1px solid #ddd" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 2, minHeight: 48 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      Event {index + 1}:{" "}
                      {eventRegistration.eventid?.name || "N/A"}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        {renderField(
                          "Start Date",
                          eventRegistration.eventid?.startdate
                            ? new Date(
                                eventRegistration.eventid.startdate
                              ).toLocaleDateString()
                            : "N/A",
                          <EventIcon />
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "Description",
                          eventRegistration.eventid?.description,
                          null,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "Coordinator",
                          eventRegistration.eventid?.coordinator,
                          null,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "Type",
                          eventRegistration.eventid?.type,
                          null,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "Level",
                          eventRegistration.eventid?.level,
                          null,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "Collaboration",
                          eventRegistration.eventid?.collab,
                          null,
                          true
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        {renderField(
                          "Duration",
                          eventRegistration.eventid?.duration,
                          null,
                          true
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </ProfileCard>
          </Grid>
        )}

        {/* Rubric Marks Section */}
        {rubricData.length > 0 && (
          <Grid item xs={12}>
            <ProfileCard
              title="Rubric Marks Details"
              icon={<BadgeIcon sx={{ color: "white" }} />}
            >
              {rubricData.map((rubric, idx) => (
                <Accordion
                  key={rubric._id || idx}
                  defaultExpanded
                  sx={{ mb: 1, borderRadius: 2, border: "1px solid #ddd" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 2, minHeight: 48 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {`${rubric.coursecode || "Course Code"} - ${
                        rubric.course || "Course"
                      } (${rubric.semester} ${rubric.year})`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 2 }}>
                    {/* Internal Marks */}
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      Internal Marks
                    </Typography>
                    {rubric.internalmarks && rubric.internalmarks.length > 0 ? (
                      rubric.internalmarks.map((im, i) => (
                        <Typography key={i} sx={{ mb: 0.5, fontSize: "1rem" }}>
                          {im.internalexamname}: {im.internalobtainmark} /{" "}
                          {im.internalfull}
                        </Typography>
                      ))
                    ) : (
                      <Typography sx={{ fontStyle: "italic" }}>
                        No Internal Marks
                      </Typography>
                    )}

                    {/* Attendance Marks */}
                    <Typography
                      variant="subtitle1"
                      mt={3}
                      gutterBottom
                      sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      Attendance Marks
                    </Typography>
                    {rubric.attendancemarks &&
                    rubric.attendancemarks.length > 0 ? (
                      rubric.attendancemarks.map((am, i) => (
                        <Typography key={i} sx={{ mb: 0.5, fontSize: "1rem" }}>
                          {am.attendancename}: {am.attendanceobtainmark} /{" "}
                          {am.attendancefull}
                        </Typography>
                      ))
                    ) : (
                      <Typography sx={{ fontStyle: "italic" }}>
                        No Attendance Marks
                      </Typography>
                    )}

                    {/* Internship Marks */}
                    <Typography
                      variant="subtitle1"
                      mt={3}
                      gutterBottom
                      sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      Internship Marks
                    </Typography>
                    {rubric.internshipmarks &&
                    rubric.internshipmarks.length > 0 ? (
                      rubric.internshipmarks.map((imk, i) => (
                        <Typography key={i} sx={{ mb: 0.5, fontSize: "1rem" }}>
                          {imk.internshipname}: {imk.internshipobtainmark} /{" "}
                          {imk.internshipfull}
                        </Typography>
                      ))
                    ) : (
                      <Typography sx={{ fontStyle: "italic" }}>
                        No Internship Marks
                      </Typography>
                    )}

                    {/* Extracurricular Marks */}
                    <Typography
                      variant="subtitle1"
                      mt={3}
                      gutterBottom
                      sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      Extracurricular Marks
                    </Typography>
                    {rubric.extracurriculummarks &&
                    rubric.extracurriculummarks.length > 0 ? (
                      rubric.extracurriculummarks.map((em, i) => (
                        <Typography key={i} sx={{ mb: 0.5, fontSize: "1rem" }}>
                          {em.extracurriculumname}:{" "}
                          {em.extracurriculumobtainmark} /{" "}
                          {em.extracurriculumfull}
                        </Typography>
                      ))
                    ) : (
                      <Typography sx={{ fontStyle: "italic" }}>
                        No Extracurricular Marks
                      </Typography>
                    )}

                    {/* External Marks */}
                    <Typography
                      variant="subtitle1"
                      mt={3}
                      sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      External Marks: {rubric.externalmarks || "N/A"} /{" "}
                      {rubric.externalfull || "N/A"}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </ProfileCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default StudentProfile;
