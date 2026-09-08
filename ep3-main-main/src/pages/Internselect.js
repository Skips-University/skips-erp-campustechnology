import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, CircularProgress, Card, CardContent,CardMedia, CardActions, Button, Box, Paper } from '@mui/material';
// import axios from 'axios';
import SearchBar from './SearchBar';
import CourseCard from './CourseList';
// import Pagination from './Pagination';
import ep1 from '../api/ep1';
import global1 from './global1';
import { useNavigate } from 'react-router-dom';
import NavigationMenu from './NavTop';
import Footer from './Footer1';

const App = () => {
    const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
    const icons=[46,1,30,32,33,34,35,38,36,37,39,41,42,43,44,46,47,48,49,50,51,52,53,54,55,57,58,59];

    var index=0;

    const getRandomIcon = () => {
  var index = Math.floor(Math.random() * icons.length);
  return icons[index];
};

var index1=0;

   const getRandomImageUrl = () => {
    const width = 300;
    const height = 150;
    // if(index1<icons.length) {
    //     index=index1;
    //     index1 = index1 + 1;
    // } else {
    //     index=0;
    //     index1=0;
    // }
    
    index = Math.floor(Math.random() * icons.length);
    const seed = Math.floor(Math.random() * 1000); // Add randomness to prevent caching
  //   return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  return `https://picsum.photos/id/${icons[index]}/${width}/${height}`;
// return `https://picsum.photos/id/${getRandomIcon()}/${width}/${height}`;
  };
  const [imageUrl, setImageUrl] = useState(getRandomImageUrl());

  const takeexam = async(item) => {
    //alert(item);
   
        global1.internlevel=item;
       
        navigate('/Internall');
    
    };

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
    const response = await ep1.get('/api/v2/getinternlevel', {
        params: {
          colid: 111362,
          user: 'ct@ctexam.in',
          searchstring: '',
          type: 'HEI'
        }
      });
      setCourses(response.data.data.classes);
      //setTotalPages(response.data.num_pages);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [searchQuery, page]);

  return (
    <Container sx={{width:'100%'}}>
      <NavigationMenu />
      <br />
      {/* <Typography variant="h4" align="center" gutterBottom>
        AIMentor Internship
      </Typography> */}
       <Box sx={{ maxWidth: '100%', flexGrow: 1, mx: 'auto', mt: 4 }}>
      <Paper square elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6">Access Internship through AI Mentor App</Typography>
        <br />
        <Typography variant="body1" mt={1}>
          Register for Online internship without stipend or apply for offline internship with or without stipend.
        </Typography>
          <Typography variant="body1" mt={1}>
                          Pay Rs. 600 per month for unlimited access to platform including exam and internship. No rescheduling or reappear fee.
                        </Typography>
     

        <br /><br />
       
      <Typography variant="h5" gutterBottom>
       
      </Typography>
      <Typography variant="body1" mb={3}>
        Also get MOOC certifications and learning content from the app.
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
    
      {/* <SearchBar setSearchQuery={setSearchQuery} /> */}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={2}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.uuid}>
                {/* {course}
                <br /> */}
                {/* <CourseCard course={course} /> */}
                 <Card>
      <CardContent>
         <CardMedia
        component="img"
        height="150"
        image={getRandomImageUrl()}
        alt="Random"
      />
      <br /><br />
        <Typography variant="h6">
            {/* {course.testc} */}
             <div className="two-line-wrapper">
      <div className="two-line-text">{course}</div>
    </div>
            </Typography>
            <Button size="small" onClick={() => takeexam(course)}>Explore internship</Button>
      
      </CardContent>
      {/* <CardActions>
        <Button size="small" onPress={() => takeexam(course)}>Explore</Button>
     
      </CardActions> */}
    </Card>
              </Grid>
            ))}
          </Grid>
          {/* <Pagination page={page} setPage={setPage} totalPages={totalPages} /> */}
        </>
      )}
      <br /><br />
      <Footer />
    </Container>
  );
};

export default App;
