import React, { useState, useRef, useContext, useEffect }  from 'react';
import { TextField, Button, Grid, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useNavigate } from 'react-router-dom';
import global1 from './global1';
import ep1 from '../api/ep1';

const Signup = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const validateEmail = (email) => {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };

    const searchapi = async () => {
        //alert('checking ' + email + ' ' + password);

    const username=email;

        if(!username) {
            alert('Please enter email.');
            return;
        }

        if(validateEmail(username)) {

        } else {
            alert('Please enter a valid email');
            return;
        }
        
        const response = await ep1.get('/api/v2/sendpassword', {
            params: {
                email: username

            }
        });
        //alert(response.data);
        console.log(response.data);

        alert('If you have an account with us and email is valid, password is sent in your email.')
    
       
        
       
    };

  return (
    <Box
      sx={{
        backgroundColor: "#1343c7",
        position: "relative",
        overflow: "hidden",
        marginX: "auto",
        maxWidth: "1500px",
        height:{xs:"100%" ,md: "100vh"}
      }}
    >
      {/* Background div behind the content */}
      <div
        style={{
          position: "absolute",
          maxWidth: "850px",
          width: "100%",
          height: "200vh",
          backgroundColor: "#9fadf0",
          right: "-170px",
          top: "-150px",
          rotate: "36deg",
          
        }}
        className='backgroundBox'
      />

      {/* Main content */}
      <Box
        sx={{
          height: "100vh",
          boxSizing: "border-box",
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: "center",
          gap: { xs: "20px", sm: "30px", md: "150px" },
          marginX: "auto",
          color: "white",
          padding: { xs: "20px", sm: "30px" },
          backgroundColor: 'transparent',
          width: { xs: "100%", md: "90%" }
        }}
      >
        <Box sx={{ width: { xs: "90%", sm: "70%", md: "35%" }, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Box
            sx={{
              padding: { xs: 2, sm: 4 },
              boxShadow: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              zIndex: 1,
              width: '100%',
            }}
          >
            <div style={{ alignItems: 'center', width: 300, marginLeft: 100}}>
             <img
              src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-2048-FullLogo_Transparent_NoBuffer.png"
              alt="ct_logo"
              width="150"
              height="60"

              style={{
                objectFit: "cover",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
                marginBottom: 30
              }}
            />
            </div>
            {/* <Typography variant="h4" align="center" gutterBottom color='black'>
              Login
            </Typography> */}
            <form>
              <Grid container spacing={2}>
                {/* <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    required
                    size="small"
                  />
                </Grid> */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    type="email"
                    size="small"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                {/* <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    type="password"
                    size="small"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Grid> */}
                {/* <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    variant="outlined"
                    type="password"
                    size="small"
                    required
                  />
                </Grid> */}
                <Grid item xs={12}>
                  <Button
                   
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ padding: 1.5 }}
                    onClick={searchapi}
                  >
                    Send password
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" align="center" color='black' sx={{ mt: 2, mb: 1 }}>
                    Remember password? <a href="/Login">Sign in</a>
                  </Typography>
                  {/* <Typography variant="body1" align="center" color='black' sx={{ mt: 2, mb: 1 }}>
                    <a href="/signinpay">Pay</a>
                  </Typography> */}
                </Grid>
                {/* <Grid item xs={12}>
                  <Typography variant="body1" align="center" color='black' sx={{ mt: 2, mb: 1 }}>
                    Or sign up with
                  </Typography>
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={2}>
                  <a href='#' sx={{ mb: 1 }}>
                    <GoogleIcon />
                  </a>
                </Grid>
           
                <Grid item xs={2}>
                  <a href='#' sx={{ mb: 1 }}>
                    <FacebookIcon />
                  </a>
                </Grid> */}
                <Grid item xs={4} />
              </Grid>
            </form>
          </Box>
        </Box>
        <Box sx={{ 
          width: { xs: "90%", sm: "70%", md: "45%" }, 
          zIndex: 1, 
          textAlign: { xs: "center", md: "right" }, 
          padding: { xs: 2, md: 0 } 
        }}>
          <Typography variant='h2' fontWeight="bold" fontSize={{ xs: '1.5rem', sm: '2.5rem', md: '3rem' }} textTransform="uppercase" display={{xs:"none",md:"block"}}>
            Access LMS and Accreditation Management Platform with Generative AI.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
