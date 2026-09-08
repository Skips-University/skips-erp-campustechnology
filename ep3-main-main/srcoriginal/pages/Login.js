import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';
import { Navigate } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import ep1 from '../api/ep1';
import global1 from './global1';

const theme = createTheme();

function Login() {

  //const favcontxt=useContext(FavoritesContext);
  const navigate = useNavigate()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const usernameref=useRef();
  const passwordref=useRef();

  //const history=useHistory();

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Handle login logic
    console.log('Email:', email);
    console.log('Password:', password);
  };

  const searchapi = async () => {
    // const username=usernameref.current.value;
    // const password=passwordref.current.value;

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
    console.log(response.data);
    // if(response.data.statuslog == "0") {

    //     history.replace('/noaccess');
    //     return;

    // }
    if (response.data.status == "Success") {
        const user=response.data.user;
        const name=response.data.name;
        const colid=response.data.colid;
        const role=response.data.role;
        //localStorage.setItem('user', user);
        //localStorage.setItem('name', name);
        //localStorage.setItem('colid', colid);
        //localStorage.setItem('role', role);
        const department=response.data.department;
        //localStorage.setItem('department', department);
        //localStorage.setItem('admincolid', colid);
        global1.studid = response.data.user;
        global1.user = response.data.user;
        global1.name = response.data.name;
        global1.name1 = response.data.name;
        global1.colid = response.data.colid;
        global1.admincolid = response.data.colid;
        global1.token = response.data.token;
        global1.department = response.data.department;
        global1.programcode = response.data.programcode;
        // //global1.programid = response.data[0].programid;
        // //global1.batch = response.data[0].batch;
        global1.regno = response.data.regno;
        // //global1.photos1 = response.data[0].photos1;
        global1.semester = response.data.semester;
        global1.section = response.data.section;
        global1.role=response.data.role;
        //alert(colid + '-' + name + '-' + user);

        global1.aqaryear='2020-21';
        global1.calendaryear='2020';
        global1.assessment='2017-18,2018-19,2019-20,2020-21,2021-22';
        
        
        // const fuser = firebase.auth().currentUser;
        // if (fuser != null) {    
        // } else {
        //     skipuser();
        // }

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

        //global1.bulkuploadurl='https://canvasapi1.azurewebsites.net/';

        //global1.bulkuploadurl='http://localhost:3000/';

        var status1='Submitted';

        try {
            status1=response1.data.data.classes[0].status;
        } catch(err) {

        }
        if(status1=='Blocked') {

            //history.replace('/noaccess');
            return <Navigate to="/noaccess" />;
            return;

        }




        
        try {
            //console.log(response1.data.data.classes);
            //alert(response1.data.data.classes[0].type + ' ' + response1.data.data.classes[0].institutionname);
            global1.instype=response1.data.data.classes[0].type;
            //localStorage.setItem('instype', response1.data.data.classes[0].type);
        } catch(err) {

        }
        try {
            //console.log(response1.data.data.classes);
            //alert(response1.data.data.classes[0].type + ' ' + response1.data.data.classes[0].institutionname);
            global1.insname=response1.data.data.classes[0].institutionname;
            //localStorage.setItem('insname', response1.data.data.classes[0].institutionname);
        } catch(err) {

        }

        try {
            //console.log(response1.data.data.classes);
            //alert(response1.data.data.classes[0].type + ' ' + response1.data.data.classes[0].institutionname);
            global1.univid=response1.data.data.classes[0].admincolid;
            //localStorage.setItem('univid', response1.data.data.classes[0].admincolid);
        } catch(err) {

        }

        try {
            //console.log(response1.data.data.classes);
            //alert(response1.data.data.classes[0].type + ' ' + response1.data.data.classes[0].institutionname);
            global1.collegecode=response1.data.data.classes[0].institutioncode;
            //localStorage.setItem('collegecode', response1.data.data.classes[0].institutioncode);
        } catch(err) {

        }
        var name1=name;
        try {
            //console.log(response1.data.data.classes);
            //alert(response1.data.data.classes[0].type + ' ' + response1.data.data.classes[0].institutionname);
            name1=name1 + ' ' + response1.data.data.classes[0].institutionname;
            //localStorage.setItem('name1', name1);
            
        } catch(err) {

        }

        // favcontxt.addFavorite({
        //     studid: user,
        //     name: name1,
        //     course: 0,
        // },response.data.role,colid,name1);

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

            //history.replace('/dashstud1');
            return <Navigate to="/dashstud1" />;
            //alert('Student login is not enabled. Please login from app');
        } else if (response.data.role=='Faculty') {
            // history.replace('/dasherp1');
            //history.replace('/selectbrowser');
            //return <Navigate to="/viewcourse1" />;
            //alert('logged in');
            navigate('/viewcourse1')
        } else if (response.data.role=='Admin') {
            // history.replace('/dasherpadmin1');
            //history.replace('/selectbrowseradmin');
            return <Navigate to="/viewcourse1" />;
        } else if (response.data.role=='Super') {
            //history.replace('/dashmydetails');
            return <Navigate to="/viewcourse1" />;
        } else if (response.data.role=='HoD') {
            //history.replace('/dasherp1');
            return <Navigate to="/viewcourse1" />;
        }
        

        //setTerm2('Thank you');  
        //navigation.navigate('Nland1');  
    }
    else {
        alert('Invalid Username or Password. Please try again.');
        //setTerm2('Invalid Username or Password. Please try again.');
    }
    //history.replace('/viewtasks');
   
};

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="xl" sx={{ backgroundColor:'#e1f5fe', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: 3, flexDirection: 'column', width: '100%', maxWidth: '400px', bgcolor: 'white' }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary',borderRadius:'0', width: 200, height: 40 }} src="/images/LogoLogin.png" alt="Logo" /> 
          {/* <Typography component="h1" variant="h5">
            Login
          </Typography> */}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              // type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={searchapi}
            >
              Login
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                {/* <Link component={RouterLink} to="/signup" variant="body1">
                  Don't have an account? Sign up 
                </Link> */}
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default Login;