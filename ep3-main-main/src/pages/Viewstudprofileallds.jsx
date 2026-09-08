import ep1 from '../api/ep1';
import React, { useEffect, useState, useRef } from 'react';
import global1 from './global1';
import { Button, Box, Paper, Container, Grid, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';


function ViewPage() {

    const navigate = useNavigate();

    const emailref = useRef();
    const regnoref = useRef();

    const user = global1.user;
    const token = global1.token;
    const colid = global1.colid;
    const name = global1.name;

    const handlenavigate = async () => {

        const email = emailref.current.value;
        const regno = regnoref.current.value;
        if (!email || !regno) {
            alert('All fields are required. Please enter email and regno');
            return;
        }

        global1.studemail = email;
        global1.studregno = regno;
        // Navigate to the NEW profile page
        navigate('/studentprofile1ds');

    };

    return (
        <React.Fragment>
            <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
                <p>Enter student username and regno (Refactored for ExamMarks2ds)</p> <br />
                <Box display="flex" marginBottom={4} marginTop={2}>
                    <TextField id="outlined-basic" type="text" sx={{ width: "200px" }} label="Username" variant="outlined" inputRef={emailref} />
                    <TextField id="outlined-basic" type="text" sx={{ width: "200px", marginLeft: 5 }} label="Reg no" variant="outlined" inputRef={regnoref} />
                </Box>
                <Box display="flex" marginBottom={4} marginTop={2}>

                    <Button
                        variant="contained"
                        color="success"
                        style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '180px' }}
                        onClick={handlenavigate}
                    >
                        View profile
                    </Button>

                </Box>
                <Grid container spacing={3}>

                </Grid>
            </Container>
        </React.Fragment>
    );
}

export default ViewPage;
