// src/Profile.js
import React from 'react';
import {
    Avatar,
    Button,
    Container,
    Grid,
    Paper,
    
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Upload } from '@mui/icons-material';

const userProfile = {
    name: 'Sharanya',
    designation: 'Software Engineer',
    email: 'bsharanya25@gmail.com',
    phone: '+91-8088351591',
    picture: '/images/piccc.jpg', 
}

const Profile = () => {
    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar
                            alt={userProfile.name}
                            src={userProfile.picture}
                            sx={{ width: 150, height: 150, margin: '0 auto 20px' }}
                        />
                        <Typography variant="h6">{userProfile.name}</Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            {userProfile.designation}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Email: {userProfile.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Phone: {userProfile.phone}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            sx={{ marginRight: 2 }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Upload />}
                            sx={{ marginRight: 2 }}
                        >
                            Upload image
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Additional Information
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Here you can add additional details about the user, such as a
                            short biography, work history, skills, and other relevant
                            information.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
