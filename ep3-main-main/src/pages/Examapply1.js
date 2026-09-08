import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar, Box
} from "@mui/material";
import axios from "axios";
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

// // 👉 Global object
// const global1 = {
//   regno: "123",
//   colid: 1
// };

export default function ExForm() {
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);

  const [semester, setSemester] = useState("");
  const [course, setCourse] = useState("");

  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  const [exams, setExams] = useState([]);
  const [rows, setRows] = useState([]);

   const [year, setYear] = useState(false);
          const [exam, setExam] = useState(false);
          const [program, setProgram] = useState(false);

          const [programs, setPrograms] = useState([]);
          

   const user=global1.user;
      const token=global1.token;
      const colid=global1.colid;
      const name=global1.name;
      const regno=global1.regno;

          const yearref=useRef();
              const examref=useRef();
              const programref=useRef();


                  
                      const handleyearchange = async (e) => {
                  
                        setYear(e.target.value);
                  
                      
                          const year1=e.target.value;
                          //alert(year);
                  
                        const response = await ep1.get('/api/v2/getexamdcode', {
                          params: {
                            token: token,
                            colid: colid,
                            year:year1,
                            user: user
                          }
                        });
                        setExams(response.data.data.classes);
                      };
                  
                       const handlexamchange = async (e) => {
                  
                        setExam(e.target.value);
                  
                        const exam1=e.target.value;
                  
                        
                         // const year=e.target.value;
                          //alert(year);
                  
                        const response = await ep1.get('/api/v2/getexamprograms', {
                          params: {
                            token: token,
                            colid: colid,
                            year:year,
                            user: user,
                            examcode: exam1
                          }
                        });
                        setPrograms(response.data.data.classes);
                      };
              
                        const handleprogramchange = async (e) => {
                  
                        setProgram(e.target.value);
                  
                        const program1=e.target.value;
                  
                        
                         // const year=e.target.value;
                          //alert(year);
                  
                        const response = await ep1.get('/api/v2/getexamsemester', {
                          params: {
                            token: token,
                            colid: colid,
                            year:year,
                            user: user,
                            examcode: exam,
                            program: program1
                          }
                        });
                        setSemesters(response.data.data.classes);
                      };
                
                  const fetchViewPage = async (e) => {
                      const semester1=e.target.value;
                      setSemester(e.target.value);
                    const response = await ep1.get('/api/v2/getexambyyrprogsem', {
                      params: {
                        token: token,
                        colid: colid,
                        year: year,
                        examcode: exam,
                        program: program,
                        type: semester1
                      }
                    });
                    setRows(response.data.data.classes);
                  };

  // 👉 Load semesters
  useEffect(() => {
    ep1
    //   .get("http://localhost:5000/ex-get-semesters", {
    .get("/ex-get-semesters", {
        params: {
          regno: global1.regno,
          colid: global1.colid
        }
      })
      .then((res) => setSemesters(res.data));
  }, []);

  // 👉 Load courses based on semester
  const handleSemesterChange = (value) => {
    setSemester(value);

    // axios
    //   .get("http://localhost:5000/ex-get-courses", {
    ep1
      .get("/ex-get-courses", {
        params: {
          regno: global1.regno,
          semester: value,
          colid: global1.colid
        }
      })
      .then((res) => setCourses(res.data));
  };

  // 👉 Submit
  const handleSubmit = () => {
    const program1=programref.current.value;
    const year1=yearref.current.value;
    const exam1=examref.current.value;
    // axios
    //   .post("http://localhost:5000/ex-check-insert", {
    ep1
      .post("/ex-check-insert", {
        regno: global1.regno,
        semester,
        course,
        exam:exam1,
        year:year1,
        program:program1,
        student:global1.name,
        colid: global1.colid
      })
      .then((res) => {
        setMsg(res.data.message);
        setOpen(true);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h4>Exam Registration Form</h4>

      <Box sx={{marginTop: 2, marginBottom: 2}}>
        <FormControl fullWidth style={{ marginBottom: 20 }}>
         <InputLabel id="year">Academic year</InputLabel>
                    <Select labelId="year"
                    onChange={handleyearchange}
             id="year"
             inputRef={yearref}
            //  sx={{ width: '200px', height: '40px'}}
             >
             <MenuItem value="2017-18">2017-18</MenuItem>
             <MenuItem value="2018-19">2018-19</MenuItem>
             <MenuItem value="2019-20">2019-20</MenuItem>
             <MenuItem value="2020-21">2020-21</MenuItem>
             <MenuItem value="2021-22">2021-22</MenuItem>
             <MenuItem value="2022-23">2022-23</MenuItem>
             <MenuItem value="2023-24">2023-24</MenuItem>
             <MenuItem value="2024-25">2024-25</MenuItem>
             <MenuItem value="2025-26">2025-26</MenuItem>
             </Select>
             </FormControl>
        
        <FormControl fullWidth style={{ marginBottom: 20 }}>
              <InputLabel id="exam">Exam</InputLabel>
               <Select labelId="exam"
               onChange={handlexamchange}
        id="exam"
        inputRef={examref}
        // sx={{ width: '200px', height: '40px'}}
        >
        {/* <MenuItem value="AMBA">AMBA</MenuItem> */}
        
        {exams.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
        
        </Select>
        </FormControl>
        
        <FormControl fullWidth style={{ marginBottom: 20 }}>
         <InputLabel id="program">Program</InputLabel>
               <Select labelId="program"
            //    onChange={handleprogramchange}
        id="program"
        inputRef={programref}
        // sx={{ width: '200px', height: '40px'}}
        >
        {/* <MenuItem value="AMBA">AMBA</MenuItem> */}
        
        {programs.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
        
        </Select>
        </FormControl>
      </Box>

      {/* Semester Dropdown */}
      <FormControl fullWidth style={{ marginBottom: 20 }}>
        <InputLabel>Semester</InputLabel>
        <Select
          value={semester}
          onChange={(e) => handleSemesterChange(e.target.value)}
        >
          {semesters.map((sem, i) => (
            <MenuItem key={i} value={sem}>
              {sem}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Course Dropdown */}
      <FormControl fullWidth style={{ marginBottom: 20 }}>
        <InputLabel>Course</InputLabel>
        <Select value={course} onChange={(e) => setCourse(e.target.value)}>
          {courses.map((c, i) => (
            <MenuItem key={i} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Submit */}
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>

      {/* Popup */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        message={msg}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}