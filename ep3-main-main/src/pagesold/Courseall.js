import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, CircularProgress, Box, Paper } from '@mui/material';
// import axios from 'axios';
import SearchBar from './SearchBar';
import CourseCard from './CourseExam';
// import Pagination from './Pagination';
import ep1 from '../api/ep1';
import global1 from './global1';
import NavigationMenu from './NavTop';
import Footer from './Footer1';

const App = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  //const level=global1.internlevel;

  const fetchCourses = async () => {
    setLoading(true);
    try {
    //   const response = await axios.get('https://www.edx.org/api/v1/catalog/search', {
    //     params: {
    //       q: searchQuery,
    //       page: page,
    //       page_size: 10,
    //     },
    //   });
    //const colid=global1.colid;
    //const user=global1.user;
    //   const response = await ep1.get('/api/v2/getminewmbyfac', {
    //         params: {
    //           colid: colid,
    //           user: user
    //         }
    //       });
    
    const response = await ep1.get('/api/v2/getmtestnewmsearch', {
        params: {
          colid: 111362,
          user: 'ct@ctexam.in',
          searchstring: searchQuery,
          type: 'HEI'
        }
      });
      setCourses(response.data.data.classes);
      setTotalPages(response.data.num_pages);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [searchQuery, page]);

  return (
    <Container>
      <NavigationMenu />
      <br />

         <Box sx={{ maxWidth: '100%', flexGrow: 1, mx: 'auto', mt: 4 }}>
              <Paper square elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6">Get Certified, Show your skills to prospective employers.</Typography>
                <Typography variant="body1" mt={1}>
                  Each exam is online one hour exam through AI Mentor app.
                </Typography>

                 <Typography variant="body1" mt={1}>
                  Pay Rs. 600 per month for unlimited access to platform including exam and internship. No rescheduling or reappear fee.
                </Typography>
             
        
                <br /><br />
               
              <Typography variant="h5" gutterBottom>
               
              </Typography>
              <Typography variant="body1" mb={3}>
                Also get MOOC learning content from the app.
              </Typography>
        
              <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                <a
                  href="https://apps.apple.com/in/app/ai-mentor-one-hour-challenge/id6476015516"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="Download on the App Store"
                    style={{ height: 50 }}
                  />
                </a>
        
                <a
                  href="https://play.google.com/store/apps/details?id=com.nandy2k2.aimentor&hl=en_IN&pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt="Get it on Google Play"
                    style={{ height: 50 }}
                  />
                </a>
              </Box>
        
               </Paper>
              </Box>

        <br /><br />

      <Typography variant="h4" align="center" gutterBottom>
       Certification exam list
      </Typography>
      <SearchBar setSearchQuery={setSearchQuery} />
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={2}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.uuid}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
          {/* <Pagination page={page} setPage={setPage} totalPages={totalPages} /> */}
        </>
      )}
      <br />
      <Footer />
    </Container>
  );
};

export default App;
