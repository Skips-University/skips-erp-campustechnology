import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, CircularProgress } from '@mui/material';
// import axios from 'axios';
import SearchBar from './SearchBar';
import CourseCard from './CourseCard';
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

  const level=global1.internlevel;

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
    const colid=global1.colid;
    const user=global1.user;
    //   const response = await ep1.get('/api/v2/getminewmbyfac', {
    //         params: {
    //           colid: colid,
    //           user: user
    //         }
    //       });
    
    const response = await ep1.get('/api/v2/getminewmsearchhei1', {
        params: {
          colid: 111362,
          user: 'ct@ctexam.in',
          searchstring: searchQuery,
          type: 'HEI',
          level: level
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
      <Typography variant="h4" align="center" gutterBottom>
       {level} Internship(s)
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
