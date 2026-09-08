import React, { useRef, useEffect, useState } from 'react';
import { TextField, Button, Grid, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const nameref=useRef();
  const emailref=useRef();
  const passwordref=useRef();
  const phoneref=useRef();
  const departmentref=useRef();
  const payfromref=useRef();
  const paydateref=useRef();
  const payref=useRef();

  const searchapi = async () => {
       

    const username=nameref.current.value;
    const email=emailref.current.value;
    const password=passwordref.current.value;
    //const department=departmentref.current.value;
    const phone=phoneref.current.value;
    const payfrom=payfromref.current.value;
    const payrefnum=payref.current.value;
    const paydate1=paydateref.current.value;
    


    //alert(username + ' ' + email + ' ' + password + ' ' + department  + ' ' + phone);

    if(!username || !email || !password || !payfrom || !paydate1 || !payrefnum) {
      alert('All fields are required.');
      return;
    }

    const paydate=new Date(paydate1);
  
    
    
        const response = await ep1.get('/api/v2/createmctalentregbyfac', {
            params: {
                colid: 30,
                user: 'system@campus.technology',
                email: email,
                name: username,
                student: username,
              password: password,
              phone: phone,
              guardian: username,
              gphone: phone,
              payref: payrefnum,
              payname:payfrom,
              paydate: paydate,
              source: 'Website',
              type: 'CAT'

    
            }
        });
     
        if(response.data.status=='Success') {

    
        alert('Access created. Please send email to team@epaathsala.com with transaction details.');


          
          navigate('/campustalent');
        } else {
          alert('Error creating access. Please send an email to support@campus.technology or team@epaathsala.com.');
        }
       
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
          // height: "100vh",
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
            <Typography variant="body2" align="center" gutterBottom color='black'>
              Rs. 400 exam fee
            </Typography>
            <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/11-2024-28-5017-sbiqrnew.png" width="180" height="180" />


            
           
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    required
                    size="small"
                    inputRef={nameref}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    type="email"
                    size="small"
                    required
                    inputRef={emailref}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    type="password"
                    size="small"
                    required
                    inputRef={passwordref}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    variant="outlined"
                    inputRef={phoneref}
                    size="small"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment from name"
                    variant="outlined"
                    inputRef={payfromref}
                    size="small"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment ref id"
                    variant="outlined"
                    inputRef={payref}
                    size="small"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label=""
                    variant="outlined"
                    inputRef={paydateref}
                    size="small"
                    type="date"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ padding: 1.5 }}
                    onClick={searchapi}
                  >
                    Sign Up
                  </Button>
                </Grid>
                {/* <Grid item xs={12}>
                  <Typography variant="body1" align="center" color='black' sx={{ mt: 2, mb: 1 }}>
                    Already have an account? <a href="/login">Login</a>
                  </Typography>
                </Grid> */}
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
       
          </Box>
        </Box>
        <Box sx={{ 
          width: { xs: "90%", sm: "70%", md: "45%" }, 
          zIndex: 1, 
          textAlign: { xs: "center", md: "right" }, 
          padding: { xs: 2, md: 0 } 
        }}>
          <Typography variant='h4' fontWeight="bold" fontSize={{ xs: '1.5rem', sm: '2.5rem', md: '3rem' }} textTransform="uppercase" display={{xs:"none",md:"block"}}>
          Pay Rs. 400 through QR code and add ref no. in form. Times of India group portfolio.
          </Typography>
          <br /><br />
          {/* <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-29-08-ctsbi.png" style={{ width: 250, height: 250}} /> */}
          <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/11-2024-28-5017-sbiqrnew.png" style={{ width: 250, height: 250}} />
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
