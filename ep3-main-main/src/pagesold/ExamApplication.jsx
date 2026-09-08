import { useEffect, useState } from "react";
import global1 from './global1';
import ep1 from '../api/ep1';
import {
  Container,
  Box,
  Typography,
  Divider,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import InputField from "../components/InputField";

const ExamApplication = () => {
  const [formData, setFormData] = useState({
    studentname: "",
    studentemail: "",
    regno: "",
    program: "",
    semester: "",
    examYear: "", // ✅ Ensure this exists
    examdate: "",
    examname: "",
    subjects: [],
    applicationstatus: "pending",
  });

  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [filteredExam, setFilteredExam] = useState(null);

  // Dummy student info
  useEffect(() => {
    const dummyUser = {
      name: global1.name,
      email: global1.user,
      regno: global1.regno,
    };
    setFormData((prev) => ({
      ...prev,
      studentname: dummyUser.name,
      studentemail: dummyUser.email,
      regno: dummyUser.regno,
    }));
  }, []);

  // Get distinct programs and semesters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await ep1.get('/api/v2/exams/filters');
        // const res = await axios.get("http://localhost:8080/api/v2/exams/filters");
        if (response.data.status) {
          setAvailablePrograms(response.data.programs || []);
          setAvailableSemesters(response.data.semesters || []);
        }
      } catch (err) {
      }
    };
    fetchFilters();
  }, []);

  // Fetch exact exam when all filters are selected
  useEffect(() => {
    const { examYear, program, semester } = formData;

    if (examYear && program && semester) {
      const fetchExam = async () => {
        try {
          const response = await ep1.get("/api/v2/exams/byyear", {
            params: { year: examYear, program, semester },
          });

          const exam = response.data.data;

          if (exam && exam.subjects?.length > 0) {
            setFilteredExam(exam);
            setFormData((prev) => ({
              ...prev,
              examname: exam.examname,
              examdate: exam.examdate,
              subjects: [],
            }));
          } else {
            setFilteredExam(null);
            setFormData((prev) => ({
              ...prev,
              examname: "",
              examdate: "",
              subjects: [],
            }));
          }
        } catch (err) {
          
        }
      };
      fetchExam();
    }
  }, [formData.examYear, formData.program, formData.semester]);

  // Form field handler
  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name.startsWith("subject_")) {
      const subjectname = name.replace("subject_", "");
      const subjectcode = filteredExam?.subjects.find(
        (s) => s.subjectname === subjectname
      )?.subjectcode;

      setFormData((prev) => {
        const updatedSubjects = checked
          ? [...prev.subjects, { subjectname, subjectcode, enabled: "yes" }]
          : prev.subjects.filter((s) => s.subjectname !== subjectname);

        return { ...prev, subjects: updatedSubjects };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ep1.post(
        "/api/v2/examapplication/create",
        formData
      );
      if (response.status === 201) {
        alert("✅ Application submitted successfully");
      } else {
        alert("❌ Submission failed");
      }
    } catch (err) {
      alert("❌ Failed to submit form");
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={3} p={3} bgcolor="background.paper" boxShadow={3} borderRadius={2}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Exam Application Form
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          {/* Read-only student fields */}
          <InputField label="Student Name" name="studentname" value={formData.studentname} readOnly />
          <InputField label="Email" name="studentemail" value={formData.studentemail} readOnly />
          <InputField label="Reg No" name="regno" value={formData.regno} readOnly />

          {/* Year selection */}
          <InputField
            label="Select Year"
            name="examYear"
            type="select"
            value={formData.examYear}
            onChange={handleChange}
            options={[
              { label: "-- Select Year --", value: "" },
              { label: "2024", value: "2024" },
              { label: "2025", value: "2025" },
            ]}
          />

          {/* Program selection */}
          <InputField
            label="Select Program"
            name="program"
            type="select"
            value={formData.program}
            onChange={handleChange}
            options={[
              { label: "-- Select Program --", value: "" },
              ...availablePrograms.map((prog) => ({ label: prog, value: prog })),
            ]}
          />

          {/* Semester selection */}
          <InputField
            label="Select Semester"
            name="semester"
            type="select"
            value={formData.semester}
            onChange={handleChange}
            options={[
              { label: "-- Select Semester --", value: "" },
              ...availableSemesters.map((sem) => ({ label: sem, value: sem })),
            ]}
          />

          {/* Subjects Checkboxes */}
          {filteredExam ? (
            filteredExam.subjects?.length > 0 ? (
              <Box mt={3}>
                <Typography variant="h6">Select Subjects</Typography>
                {filteredExam.subjects.map((subject, idx) => (
                  <FormControlLabel
                    key={idx}
                    control={
                      <Checkbox
                        name={`subject_${subject.subjectname}`}
                        checked={formData.subjects.some(
                          (s) => s.subjectname === subject.subjectname
                        )}
                        onChange={handleChange}
                      />
                    }
                    label={`${subject.subjectname} (${subject.subjectcode})`}
                  />
                ))}
              </Box>
            ) : (
              <Typography color="error" mt={2}>
                ⚠️ No subjects found for this exam.
              </Typography>
            )
          ) : (
            formData.examYear &&
            formData.program &&
            formData.semester && (
              <Typography color="error" mt={2}>
                ⚠️ No exam found for the selected filters.
              </Typography>
            )
          )}

          <Box mt={4}>
            <Button type="submit" variant="contained">
              Submit Application
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default ExamApplication;

