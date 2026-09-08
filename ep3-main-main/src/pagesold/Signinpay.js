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

    const searchapi = async () => {
        //alert('checking ' + email + ' ' + password);

    const username=email;

        if(!username || !password) {
            alert('Please enter username and password');
            return;
        }
        
        const response = await ep1.get('/api/v1/loginapi', {
            params: {
                email: username.toLowerCase(),
                password: password

            }
        });
        //alert(response.data);
        console.log(response.data);
    
        if (response.data.status == "Success") {
            const user=response.data.user;
            const name=response.data.name;
            const colid=response.data.colid;
            const role=response.data.role;
            // //localStorage.setItem('user', user);
            // //localStorage.setItem('name', name);
            // //localStorage.setItem('colid', colid);
            // //localStorage.setItem('role', role);
            const department=response.data.department;
            // //localStorage.setItem('department', department);
            // //localStorage.setItem('admincolid', colid);
            global1.studid = response.data.user;
            global1.user = response.data.user;
            global1.name = response.data.name;
            global1.name1 = response.data.name;
            global1.colid = response.data.colid;
            global1.admincolid = response.data.colid;
            global1.token = response.data.token;
            global1.department = response.data.department;
            global1.programcode = response.data.programcode;

            const lastlogin=new Date(response.data.lastlogin);
            const todaydate=new Date();
            var diffDays = lastlogin.getDate() - todaydate.getDate(); 
            //alert(diffDays);
            if(diffDays<1) {
              alert('Your access expired. Please renew.');
              return;
            }

            global1.regno = response.data.regno;

            global1.semester = response.data.semester;
            global1.section = response.data.section;
            global1.role=response.data.role;

            global1.aqaryear='2020-21';
            global1.calendaryear='2020';
            global1.assessment='2017-18,2018-19,2019-20,2020-21,2021-22';
            
    
            const response1 = await ep1.get('/api/v1/getinstitutionname', {
                params: {
                    user: user,
                    token: response.data.token,
                    colid: colid
                }
            });
    
            global1.instype='';
            global1.insname='';
    
            global1.bulkuploadurl='https://canvasapi5u.azurewebsites.net/';

            var status1='Submitted';
    
            try {
                status1=response1.data.data.classes[0].status;
            } catch(err) {
    
            }
            if(status1=='Blocked') {
                // return <Navigate to="/noaccess" />;
                alert('Access is suspended.')
                return;
    
            }

            if(status1=='Auto') {
              // return <Navigate to="/noaccess" />;
              global1.autorenew='Yes';
  
          }
    
            try {
               
                global1.instype=response1.data.data.classes[0].type;
                //localStorage.setItem('instype', response1.data.data.classes[0].type);
            } catch(err) {
    
            }
            try {
                
                global1.insname=response1.data.data.classes[0].institutionname;
                //localStorage.setItem('insname', response1.data.data.classes[0].institutionname);
            } catch(err) {
    
            }
    
            try {
             
                global1.univid=response1.data.data.classes[0].admincolid;
                //localStorage.setItem('univid', response1.data.data.classes[0].admincolid);
            } catch(err) {
    
            }
    
            try {
            
                global1.collegecode=response1.data.data.classes[0].institutioncode;
                //localStorage.setItem('collegecode', response1.data.data.classes[0].institutioncode);
            } catch(err) {
    
            }
            var name1=name;
            try {
                
                name1=name1 + ' ' + response1.data.data.classes[0].institutionname;
                //localStorage.setItem('name1', name1);
                
            } catch(err) {
    
            }
    
            if (response.data.role=='Student') {
                const response12 = await ep1.get('/api/v1/getcurrentyearbyprg', {
                    params: {
                        programcode: response.data.programcode,
                        semester: response.data.semester,
                        section: response.data.section,
                        token: response.data.token,
                        colid: colid
                    }
                });
                var lmsyear='2022-23';
                console.log(response12.data.data);
    
                
                try {
                    lmsyear= response12.data.data.classes[0].year;
    
                } catch (err) {
    
                }
                global1.lmsyear=lmsyear;
                // return <Navigate to="/dashstud1" />;
               
            } else if (response.data.role=='Faculty') {
             
                navigate('/dashmmfaccourses')
            } else if (response.data.role=='Admin') {
                
                navigate('/dashmncas11admin')
            } else if (response.data.role=='Super') {
                //history.replace('/dashmydetails');
                // return <Navigate to="/viewcourse1" />;
            } else if (response.data.role=='HoD') {
                // return <Navigate to="/viewcourse1" />;
            }
        }
        else {
            alert('Invalid Username or Password. Please try again.');
            //setTerm2('Invalid Username or Password. Please try again.');
        }
        
       
    };

    const getpay=(monthssub, amount)=> {
        const user=global1.user;
        const colid=global1.colid;
        var amount1=amount;
        if(email=='TRISHIKA') {
            amount1=amount - 100;
        } else if (email=='CTAI') {
            amount1=amount - 50;
        }
        window.location.href='https://campus.technology/campusnewreg.php?orderid=123456&colid=' + colid + '&user=' + user + '&amount=' + amount1 + '&monthssub=' + monthssub + '&type=extending';
    }

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
                    label="Promo code (Optional)"
                    variant="outlined"
                    type="email"
                    size="small"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                 <Grid item xs={12}>
                  <Button
                   
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ padding: 1.5 }}
                    onClick={() => getpay(1,399)}
                  >
                    1 month Rs. 399
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                   
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ padding: 1.5 }}
                    onClick={() => getpay(2,699)}
                  >
                    2 months Rs. 699
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                   
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ padding: 1.5 }}
                    onClick={() => getpay(3,999)}
                  >
                    3 months Rs. 999
                  </Button>
                </Grid>
                {/* <Grid item xs={12}>
                <Typography variant="body1" align="center" color='black' sx={{ mt: 2, mb: 1 }}>
                    <a href="https://campus.technology">One month Rs. 399</a>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                <Typography variant="body1" align="center" color='black' sx={{ mt: 2, mb: 1 }}>
                    <a href="https://campus.technology">Three months Rs. 699</a>
                  </Typography>
                </Grid> */}
               
               
               
               
              
                {/* <Grid item xs={12}>
                  <Typography variant="body1" align="center" color='black' sx={{ mt: 2, mb: 1 }}>
                    Don't have an account? <a href="/signuppage">Sign up</a>
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
