import React, { useRef, useState } from 'react';
import { TextField, Stack, Button, Box, Card, Typography, Container, AppBar, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, CardMedia, CardContent, CardActions, ListItemIcon, useMediaQuery, Menu, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import DeblurIcon from '@mui/icons-material/Deblur';
import DiamondIcon from '@mui/icons-material/Diamond';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import InsightsIcon from '@mui/icons-material/Insights';
import MenuIcon from "@mui/icons-material/Menu";
import PropTypes from "prop-types";
import CssBaseline from "@mui/material/CssBaseline";
// importing react-slick for carousal
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Link, Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import styles from "../virtuallabcss/CampusWebsite.module.css";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTheme } from '@mui/material/styles';

import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import GoogleIcon from "@mui/icons-material/Google";



const categoryData = [
    {
        icon: <ConnectWithoutContactIcon sx={{ fontSize: "100px" }} />,
        title: "Generative AI for Education",
    },
    {
        icon: <SettingsSuggestIcon sx={{ fontSize: "100px" }} />,
        title: "New Age LMS solution",
    },
    {
        icon: <DeblurIcon sx={{ fontSize: "100px" }} />,
        title: "Accreditation Management",
    },
    {
        icon: <DiamondIcon sx={{ fontSize: "100px" }} />,
        title: "AI Video Maker for Creating Video",
    },
    {
        icon: <Diversity3Icon sx={{ fontSize: "100px" }} />,
        title: "Generate Course Content and Exam",
    },
    {
        icon: <InsightsIcon sx={{ fontSize: "100px" }} />,
        title: "CO Attainment Calculation",
    },
    {
        icon: <AutoStoriesIcon sx={{ fontSize: "100px" }} />,
        title: "Generate or Update Syllabus",
    },
    {
        icon: <AddModeratorIcon sx={{ fontSize: "100px" }} />,
        title: "AI Mentor addon app for students",
    },
]

// Login Component
export const LoginPage = () => {
    return (
        <Box
            sx={{
                backgroundColor: "#1343c7",
                position: "relative",
                overflow: "hidden",
                marginX: "auto",
                height: "100vh",
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
                className="backgroundBox"
            />

            {/* Main content */}
            <Container
                maxWidth="xl"
                sx={{
                    height: "100vh",
                    boxSizing: "border-box",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: { sm: "30px", md: "150px" },
                    marginX: "auto",
                    color: "white",
                    padding: "30px",
                    backgroundColor: "transparent",
                    width: { sm: "100%", md: "90%" },
                }}
            >
                <Box
                    sx={{
                        width: "30%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            padding: 4,
                            boxShadow: 3,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            zIndex: 1,
                        }}
                    >
                        <Typography variant="h4" align="center" gutterBottom color="black">
                            Login
                        </Typography>
                        <form>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        variant="outlined"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        variant="outlined"
                                        type="password"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ padding: 1.5 }}
                                    >
                                        Login
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        color="black"
                                        sx={{ mt: 2, mb: 1 }}
                                    >
                                        <small>
                                            Forgot{" "}
                                            <Link to="#" className={styles.signUpText}>
                                                Username
                                            </Link>
                                            /
                                            <Link to="#" className={styles.signUpText}>
                                                Password?
                                            </Link>
                                        </small>
                                        <br />
                                        <small>
                                            Don't have an account?{" "}
                                            <Link to="/signup" className={styles.signUpText}>
                                                Sign up now
                                            </Link>
                                        </small>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        color="black"
                                        sx={{ mt: 2, mb: 1 }}
                                    >
                                        Or login with
                                    </Typography>
                                </Grid>
                                {/* Login with Google */}
                                <Grid item xs={4} />
                                <Grid
                                    item
                                    xs={2}
                                    sx={{ display: "flex", justifyContent: "end" }}
                                >
                                    <a href="#" sx={{ mb: 1 }}>
                                        <GoogleIcon />
                                    </a>
                                </Grid>
                                {/* Login with Facebook */}
                                <Grid item xs={2}>
                                    <a href="#" sx={{ mb: 1 }}>
                                        <FacebookIcon />
                                    </a>
                                </Grid>
                                <Grid item xs={4} />
                            </Grid>
                        </form>
                    </Box>
                </Box>
                <Box sx={{ width: "45%", zIndex: 1, textAlign: { md: "right" } }}>
                    <Typography variant="h2" fontWeight="bold">
                        Access personalized learning and mentorship tools.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

// Contact Us Component
export const ContactPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        console.log(firstName, lastName, email, phone);
    }
    return (
        <Container maxWidth="xl" sx={{ my: 4, p: 4 }}>
            <Grid container spacing={0}>
                <Grid xs={12} sm={12} md={6} xl={6} sx={{ p: 4 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            my: 4,
                            fontWeight: 700,
                            color: "#444",
                            textShadow:
                                "1px 0px 1px #ccc, 0px 1px 1px #eee, 2px 1px 1px #ccc, 1px 2px 1px #eee, 3px 2px 1px #ccc, 2px 3px 1px #eee, 4px 3px 1px #ccc, 3px 4px 1px #eee, 5px 4px 1px #ccc, 4px 5px 1px #eee, 6px 5px 1px #ccc, 5px 6px 1px #eee, 7px 6px 1px #ccc;",
                        }}
                    >
                        Contact Us
                    </Typography>
                    <Typography sx={{ my: 4, color: "#aaa" }}>
                        Need to get in touch with us? Either fill out the form with your
                        inquiry or find the department email you'd like to contact below.
                    </Typography>
                </Grid>
                <Grid
                    xs={12}
                    sm={12}
                    md={6}
                    xl={6}
                    sx={{ backgroundColor: "none", color: "#aaa" }}
                >
                    <>
                        <form
                            onSubmit={handleSubmit}
                            action={<Link to="/login" />}
                            style={{ marginTop: "8px", marginBottom: "8px" }}
                        >
                            <Stack spacing={2} direction="row" sx={{ marginBottom: 4 }}>
                                <TextField
                                    type="text"
                                    variant="outlined"
                                    color="secondary"
                                    label="First Name"
                                    onChange={(e) => setFirstName(e.target.value)}
                                    value={firstName}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    type="text"
                                    variant="outlined"
                                    color="secondary"
                                    label="Last Name"
                                    onChange={(e) => setLastName(e.target.value)}
                                    value={lastName}
                                    fullWidth
                                    required
                                />
                            </Stack>
                            <TextField
                                type="email"
                                variant="outlined"
                                color="secondary"
                                label="Email"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                fullWidth
                                required
                                sx={{ mb: 4 }}
                            />
                            <TextField
                                type="tel"
                                variant="outlined"
                                color="secondary"
                                label="Phone"
                                onChange={(e) => setPhone(e.target.value)}
                                value={phone}
                                required
                                fullWidth
                                sx={{ mb: 4 }}
                            />
                            <Button variant="outlined" color="secondary" type="submit">
                                Submit
                            </Button>
                        </form>
                    </>
                </Grid>
            </Grid>
        </Container>
    );
};

const CarousalCard = ({ heading, subheading, image }) => {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Container>
            <Grid container spacing={2} sx={{ display: "flex", alignItems: "center", gap: isMobile ?"100px": "50px", color: isMobile ?"black": "white", padding: "20px", paddingTop: "40px", height: "auto", position: "relative", zIndex: 10 }}>
                <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
                    <Typography variant="h4" component="h4" sx={{ fontSize: { xs: "24px", md: "32px" }, fontWeight: 600 }}>
                        {heading}
                    </Typography>
                    <Typography variant="subtitle1" component="p" sx={{ fontSize: { xs: "16px", md: "20px" } }}>
                        {subheading}
                    </Typography>
                     <Typography variant="subtitle1" component="p" sx={{ fontSize: { xs: "16px", md: "20px" }, marginTop: "10px" }}>
                        With Guidance from experienced consulting team having worked with more than 30 A/A+/A++ institutions.
                    </Typography>
                    <Typography variant="subtitle1" component="p" sx={{ fontSize: { xs: "16px", md: "20px" }, marginTop: "10px" }}>
                        A portfolio company of Times of India group.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <a href='/Login' style={{ backgroundColor: '#0f6fdb', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>
                            GET STARTED
                        </a>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
                    <img src={image} alt="img" style={{ maxWidth: "100%", height: "auto" }} />
                </Grid>
            </Grid>
        </Container>
    );
};

function SimpleSlider() {
    const sliderRef = useRef(null);

    var settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false, // We will manage the arrows manually
        responsive: [
            {
                breakpoint: 768, // For tablet and mobile screens
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    return (
        <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
            <Slider ref={sliderRef} {...settings}>
                <CarousalCard
                    heading="Accreditation with Generative AI + Consulting + Gap improvement"
                    subheading="Experience the power of Generative AI for Accreditation. Reduce overall Time to Complete and Improve Quality. Also, you don't need a big team working overnight."
                    image="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-535-h1.png"
                />
                <CarousalCard
                    heading="Automation + Quality. With Generative AI"
                    subheading="Check data and documents with validation across metrics. Generate missing documents. Validate data against master data, across individual metrics and also with financial data where applicable. Automatically track deviation and non compliance."
                    image="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-535-h1.png"
                />
                <CarousalCard
                    heading="Improve gap through AI Mentor"
                    subheading="We conduct various activities for students and faculties including value added courses, internship, skill development and placement training, FDP etc. mapped to various metrics of accreditation."
                    image="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-535-h1.png"
                />
                <CarousalCard
                    heading="Quality Monitoring and Readiness Audit"
                    subheading="Conduct Academic and Administrative Audit, Quality Audit, Green Audit, Accreditation readiness audit through the portal."
                    image="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-535-h1.png"
                />
            </Slider>

            {/* Arrow buttons */}
            <Box sx={{ position: 'absolute', top: '50%', left: { xs: '10px', md: '30px' }, transform: 'translateY(-50%)', zIndex: 20 }}>
                <ArrowCircleLeftIcon onClick={() => sliderRef.current.slickPrev()} sx={{ fontSize: { xs: 40, md: 60 }, color: "cyan", cursor: "pointer" }} />
            </Box>

            <Box sx={{ position: 'absolute', top: '50%', right: { xs: '10px', md: '30px' }, transform: 'translateY(-50%)', zIndex: 20 }}>
                <ArrowCircleRightIcon onClick={() => sliderRef.current.slickNext()} sx={{ fontSize: { xs: 40, md: 60 }, color: "cyan", cursor: "pointer" }} />
            </Box>
        </Box>
    );
}

const ClientPage = () => {
    const navigate2 = useNavigate();
    return (
        // <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 6, padding: 6, marginBlock: "80px" }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 6, padding: 6, marginTop: "80px" }}>
            

            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>

             <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>

             <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
           
         

            
        </Box>
    );
};

const ClientPage2 = () => {
    const navigate2 = useNavigate();
    return (
        // <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 6, padding: 6, marginBlock: "80px" }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 6, padding: 6, marginTop: "0px" }}>
            

            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>

             <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
            <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>

             <Box sx={{ width: "150px", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '150px', height: '150px' }} />
            </Box>
           
         

            
        </Box>
    );
};

const AboutPage = () => {
    const navigate2 = useNavigate();
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '100%', height: 'auto' }} />
            </Box>

            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Generative AI + COnsulting
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    Our accreditation management software with Generative AI will help you to aggregate and validate data and documents and generate missing documents.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    An experienced consulting team will handhold for all types of accreditation and rankings. There are enough success stories from top institutions.
                </Typography>
                <Box sx={{ mt: 2 }}>
                    {/* <Button variant="contained" color="success" sx={{ mr: 2 }}>
                        About Us
                    </Button> */}
                    <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                    {/* <Button variant="contained" color="primary" onClick={navigate2('/Login')}>
                    <a href='/Login'>Get started</a>
                    </Button> */}
                </Box>
            </Box>
        </Box>
    );
};

const AboutPage2 = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>



            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Cut down time and cost, not quality
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    Generative AI validates all data and documents and also generates missing documents based on data. So you do not need a big team or a lot of time to prepare for accreditation.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    Upload data only once, reports may be exported for multiple accreditation and ranking frameworks.
                </Typography>
                <Box sx={{ mt: 2 }}>
                <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                    {/* <Button variant="contained" color="success" sx={{ mr: 2 }}>
                        About Us
                    </Button>
                    <Button variant="contained" color="primary">
                        Get Started
                    </Button> */}
                </Box>
            </Box>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-319-3784896.jpg"
                    alt='img1' style={{ width: '100%', height: 'auto' }} />
            </Box>


        </Box>
    );
};

const AboutPage3 = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-449-lms1.jpeg"
                    alt='img1' style={{ width: '100%', height: 'auto' }} />
            </Box>

            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Accreditation Simplified - With Generative AI
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    The AI scripts are trained as per requirements of various accreditation and ranking.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    If any documentation is missing, use Generative AI to create contextual documents as per accreditation requirements as per your data. Generate various documentation such as circular, brochure, reports, annual reports, declarations, mapping, sanction letters, policies, answers to qualitative questions, SWOC analysis and many more.
                </Typography>
                <Box sx={{ mt: 2 }}>
                <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                    {/* <Button variant="contained" color="success" sx={{ mr: 2 }}>
                        About Us
                    </Button>
                    <Button variant="contained" color="primary">
                        Get Started
                    </Button> */}
                </Box>
            </Box>
        </Box>
    );
};

const AboutPage4 = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>



            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Data and Document checking across metrics
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    In accreditation many metrics are related, and our AI software understands that.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    Check for consistency and discrepancies across metrics. Many metrics are prepared by our software from master data to avoid issues.
                </Typography>
                <Box sx={{ mt: 2 }}>
                    {/* <Button variant="contained" color="success" sx={{ mr: 2 }}>
                        About Us
                    </Button>
                    <Button variant="contained" color="primary">
                        Get Started
                    </Button> */}
                    <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                </Box>
            </Box>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-612-lms3.jpeg"
                    alt='img1' style={{ width: '70%', height: 'auto' }} />
            </Box>


        </Box>
    );
};

const AboutPage5 = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-1237-Wavy_Edu-04_Single-05.jpg"
                    alt='img1' style={{ width: '100%', height: 'auto' }} />
            </Box>

            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Dashboard - Check what is working and what is not
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    Check the new dashboard with metrics to point the gap areas.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    Also check the deficiencies and sufficiency of data in different areas with regular reports.
                </Typography>
                <Box sx={{ mt: 2 }}>
                    {/* <Button variant="contained" color="success" sx={{ mr: 2 }}>
                        About Us
                    </Button>
                    <Button variant="contained" color="primary">
                        Get Started
                    </Button> */}
                    <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                </Box>
            </Box>
        </Box>
    );
};

const AboutPage6 = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>



            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Address some gaps with AI Mentor
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    We conduct various activities such as MOOC course platform, certification, Value added courses, internship, placement training, skill development MOOC courses etc. to help students build competencies and skills.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    These activities are mapped to various metrics of accreditation and helps you to improve score in those metrics.
                </Typography>
                <Box sx={{ mt: 2 }}>
                    {/* <Button variant="contained" color="success" sx={{ mr: 2 }}>
                        About Us
                    </Button>
                    <Button variant="contained" color="primary">
                        Get Started
                    </Button> */}
                    <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                </Box>
            </Box>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-1338-lms2.jpeg"
                    alt='img1' style={{ width: '100%', height: 'auto' }} />
            </Box>


        </Box>
    );
};


const CategoryPage = () => {
    return (
        <Box sx={{ backgroundColor: "#1CBBB4", padding: "20px", color: "white", }}>
            <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", margin: "auto", color: "white", borderBottom: "2px solid ", display: "flex", justifyContent: "center", width: "fit-content", textDecoration: 'none' }}> What we provide</Typography>
            <Box container paddingTop="50px">
                <Box sx={{ display: "flex", gap: "30px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
                    {
                        categoryData.map(({ icon, title }, index) => (
                            <Box sx={{ width: "240px", textAlign: "center", marginBlock: "20px" }} key={index} >
                                {icon}
                                <Typography variant='subtitle1' component="h5">{title}</Typography>
                            </Box>
                        ))
                    }
                </Box>
            </Box>
        </Box>
    )
}

const PricingPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const settings = {
        dots: true,
        lazyLoad: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 2
    };

    return (
        <Box sx={{ width: "100%" }}>

<Typography
                                    variant="h4"
                                    component="h4"
                                    sx={{
                                        fontWeight: 700,
                                        textAlign: "center",
                                        mb: 2,
                                        color: "#444",
                                        marginTop: 20
                                    }}
                                >
                                    Pricing Per User
                                </Typography>


            {isMobile ? (
                <div className="slider-container">
                    <Slider {...settings}>
                        <Box sx={{ width: "90vw", display: "flex", justifyContent: "center", padding: "30px", overflow: "hidden" }}>
                        <Card className={`${styles.pricingCardMobile}`} sx={{ height: "500px" }}>
                        <CardContent sx={{ padding: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1343c7", borderRadius: "0px 0px 100% 100% ", height: "200px", width: "100%", }}>
                                <Box sx={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Typography gutterBottom variant="h5" component="h5" fontWeight="bold" textTransform="uppercase">
                                        Subscription
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹399
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per month
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "250px", padding: " 30px", overflowY: "scroll" }}>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Advanced LMS" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Accreditation management" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="CO PO attainment" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="AI Video creator" />
                                    </Box>
                                </ListItem>
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Student access" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Generative AI" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Document validation" />
                                    </Box>
                                </ListItem>
                            </List>
                        </CardContent>
                        {/* <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                            <Link to="#" ><Button size="small" variant='contained'>Choose Plan</Button></Link>
                        </CardActions> */}
                    </Card>
                        </Box>
                        <Box sx={{ width: "90vw", display: "flex", justifyContent: "center", padding: "30px", overflow: "hidden" }}>
                        <Card className={`${styles.pricingCardMobile}`} sx={{ height: "500px" }}>
                        <CardContent sx={{ padding: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1343c7", borderRadius: "0px 0px 100% 100% ", height: "200px", width: "100%", }}>
                                <Box sx={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Typography gutterBottom variant="h5" component="h5" fontWeight="bold" textTransform="uppercase">
                                        Starter
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹150
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per month
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "600px", padding: " 30px", overflowY: "scroll" }}>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="All items in Free version" />
                                    </Box>
                                </ListItem>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="50 Generative AI credits" />
                                    </Box>
                                </ListItem>
                              
                            
                            
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Accreditation documentation with Generative AI" />
                                    </Box>
                                </ListItem>

                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="₹3 per additional AI credit" />
                                    </Box>
                                </ListItem>
                            </List>
                        </CardContent>
                        {/* <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                            <Link to="#" ><Button size="small" variant='contained'>Choose Plan</Button></Link>
                        </CardActions> */}
                    </Card>
                        </Box>
                        <Box sx={{ width: "90vw", display: "flex", justifyContent: "center", padding: "30px", overflow: "hidden" }}>
                        <Card className={`${styles.pricingCardMobile}`} sx={{ height: "500px" }}>
                        <CardContent sx={{ padding: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1343c7", borderRadius: "0px 0px 100% 100% ", height: "200px", width: "100%", }}>
                                <Box sx={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Typography gutterBottom variant="h5" component="h5" fontWeight="bold" textTransform="uppercase">
                                        Standard
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹500
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per month
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "250px", padding: " 30px", overflowY: "scroll" }}>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="All items in Free version" />
                                    </Box>
                                </ListItem>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="200 Generative AI credits" />
                                    </Box>
                                </ListItem>
                              
                              
                             
                            
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Accreditation documentation with Generative AI" />
                                    </Box>
                                </ListItem>

                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="₹2 per additional AI credit" />
                                    </Box>
                                </ListItem>

                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Online technical support" />
                                    </Box>
                                </ListItem>








                            </List>
                        </CardContent>
                        {/* <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                            <Link to="#" ><Button size="small" variant='contained'>Choose Plan</Button></Link>
                        </CardActions> */}
                    </Card>
                        </Box>
                        <Box sx={{ width: "90vw", display: "flex", justifyContent: "center", padding: "30px", overflow: "hidden" }}>
                        <Card className={`${styles.pricingCardMobile}`} sx={{ height: "500px" }}>
                        <CardContent sx={{ padding: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1343c7", borderRadius: "0px 0px 100% 100% ", height: "200px", width: "100%", }}>
                                <Box sx={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Typography gutterBottom variant="h5" component="h5" fontWeight="bold" textTransform="uppercase">
                                        Premium
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹1200
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per month
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "250px", padding: " 30px", overflowY: "scroll" }}>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Minimum 10 users" />
                                    </Box>
                                </ListItem>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="All items in Free version" />
                                    </Box>
                                </ListItem>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="500 Generative AI credits" />
                                    </Box>
                                </ListItem>
                              
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Two online Accreditation Consulting meetings" />
                                    </Box>
                                </ListItem>
                            
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Accreditation documentation with Generative AI" />
                                    </Box>
                                </ListItem>

                                
                             

                              

                            

                            </List>
                        </CardContent>
                        {/* <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                            <Link to="#" ><Button size="small" variant='contained'>Choose Plan</Button></Link>
                        </CardActions> */}
                    </Card>
                        </Box>
                    </Slider>
                </div>
            ) : (
                <Container sx={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center", paddingBlock: "100px" }}>
                    <Card className={`${styles.pricingCard}`} sx={{ height: "500px" }}>
                        <CardContent sx={{ padding: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1343c7", borderRadius: "0px 0px 100% 100% ", height: "200px", width: "100%", }}>
                                <Box sx={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Typography gutterBottom variant="h5" component="h5" fontWeight="bold" textTransform="uppercase">
                                        Starter
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹399
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per month
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "250px", padding: " 30px", overflowY: "scroll" }}>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Advanced LMS" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Student access" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="CO PO attainment" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="AI Video creator" />
                                    </Box>
                                </ListItem>
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Accreditation software" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Generative AI" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Document validation" />
                                    </Box>
                                </ListItem>
                            </List>
                        </CardContent>
                        {/* <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                            <Link to="#" ><Button size="small" variant='contained'>Choose Plan</Button></Link>
                        </CardActions> */}
                    </Card>

                    <Card className={`${styles.pricingCard}`} sx={{ height: "500px" }}>
                        <CardContent sx={{ padding: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1343c7", borderRadius: "0px 0px 100% 100% ", height: "200px", width: "100%", }}>
                                <Box sx={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Typography gutterBottom variant="h5" component="h5" fontWeight="bold" textTransform="uppercase">
                                        AI credits
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹3
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per credit
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "600px", padding: " 30px", overflowY: "scroll" }}>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="1 credit required for 1 document" />
                                    </Box>
                                </ListItem>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Minimum purchase 100 credits" />
                                    </Box>
                                </ListItem>
                              
                            
{/*                             
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Accreditation documentation with Generative AI" />
                                    </Box>
                                </ListItem>

                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="₹3 per additional AI credit" />
                                    </Box>
                                </ListItem> */}
                            </List>
                        </CardContent>
                        {/* <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                            <Link to="#" ><Button size="small" variant='contained'>Choose Plan</Button></Link>
                        </CardActions> */}
                    </Card>

                    <Card className={`${styles.pricingCard}`} sx={{ height: "500px" }}>
                        <CardContent sx={{ padding: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1343c7", borderRadius: "0px 0px 100% 100% ", height: "200px", width: "100%", }}>
                                <Box sx={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Typography gutterBottom variant="h5" component="h5" fontWeight="bold" textTransform="uppercase">
                                        Standard
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹500
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per month
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "250px", padding: " 30px", overflowY: "scroll" }}>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="All items in Free version" />
                                    </Box>
                                </ListItem>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="200 Generative AI credits" />
                                    </Box>
                                </ListItem>
                              
                              
                             
                            
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Accreditation documentation with Generative AI" />
                                    </Box>
                                </ListItem>

                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="₹2 per additional AI credit" />
                                    </Box>
                                </ListItem>

                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Online technical support" />
                                    </Box>
                                </ListItem>








                            </List>
                        </CardContent>
                        {/* <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                            <Link to="#" ><Button size="small" variant='contained'>Choose Plan</Button></Link>
                        </CardActions> */}
                    </Card>
                    <Card className={`${styles.pricingCard}`} sx={{ height: "500px" }}>
                        <CardContent sx={{ padding: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1343c7", borderRadius: "0px 0px 100% 100% ", height: "200px", width: "100%", }}>
                                <Box sx={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Typography gutterBottom variant="h5" component="h5" fontWeight="bold" textTransform="uppercase">
                                        Premium
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹1200
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per month
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "250px", padding: " 30px", overflowY: "scroll" }}>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Minimum 10 users" />
                                    </Box>
                                </ListItem>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="All items in Free version" />
                                    </Box>
                                </ListItem>
                            <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="500 Generative AI credits" />
                                    </Box>
                                </ListItem>
                              
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Two online Accreditation Consulting meetings" />
                                    </Box>
                                </ListItem>
                            
                              
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Accreditation documentation with Generative AI" />
                                    </Box>
                                </ListItem>

                                
                             

                              

                            

                            </List>
                        </CardContent>
                        {/* <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                            <Link to="#" ><Button size="small" variant='contained'>Choose Plan</Button></Link>
                        </CardActions> */}
                    </Card>
                </Container>
            )}
        </Box>
    );
};



const drawerWidth = 240;
const navItems = ["Home", "About", "Contact", "Login"];

function CampusWebsite(props) {


    const navigate = useNavigate();
    const { window } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    // const [scrolled, setScrolled] = useState(false);

     const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

   const [anchorElai, setAnchorElai] = useState(null);
  const openai = Boolean(anchorElai);

  const handleClickai = (event) => {
    setAnchorElai(event.currentTarget);
  };

  const handleCloseai = () => {
    setAnchorElai(null);
  };

  const [anchorElau, setAnchorElau] = useState(null);
  const openau = Boolean(anchorElau);

  const handleClickau = (event) => {
    setAnchorElau(event.currentTarget);
  };

  const handleCloseau = () => {
    setAnchorElau(null);
  };

  const links = [
    { label: 'Faculty login', url: '/Login' },
    { label: 'Student login', url: '/loginstud' },
    { label: 'Company login', url: '/logincompany' },
    // { label: 'Stack Overflow', url: 'https://stackoverflow.com' },
  ];

  const linksai = [
    { label: 'Internship', url: '/Internselect' },
    { label: 'Certification', url: '/Courseall' },
    // { label: 'Stack Overflow', url: 'https://stackoverflow.com' },
  ];

  const linksau = [
    { label: 'Academic and Administrative Audit', url: '/AcademicAuditInfo' },
    { label: 'Green Audit', url: '/GreenAudit' },
    // { label: 'Stack Overflow', url: 'https://stackoverflow.com' },
  ];

    // State for subscribe button
    const [subscribeVal, setSubscribeVal] = useState();
    //   const [isSubscribe, setIsSubscribe] = useState(false);

    // Handle for subscript button
    const handleSubscribe = () => {
        if (subscribeVal) {
            alert("Thank you for subscribe!");
        } else {
            alert("Please Enter Your Email");
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const onButtonClicklogin = async () => {
        navigate('/Login');
    };

    const onButtonClickintern = async () => {
        navigate('/Internselect');
    };

    const onButtonClickexam = async () => {
        navigate('/Courseall');
    };

    const onButtonClicktalent = async () => {
        navigate('/campustalent');
    };

    const onButtonClickregister = async () => {
      navigate('/SignupAdmin');
  };

  const onButtonClickpricing = async () => {
      navigate('/campuspricing');
  };

  const onButtonClickloginstud = async () => {
    navigate('/loginstud');
};

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
            <Typography variant="h6" component="h6" sx={{ my: 2, px: 2, fontWeight: "700" }}>
                CAMPUS TECHNOLOGY
            </Typography>
            <Divider />
            <List>
                {/* {navItems.map((item) => (
                    <ListItem key={item} disablePadding>
                        <ListItemButton sx={{ textAlign: "center" }}>
                            <ListItemText primary={item} />
                        </ListItemButton>
                    </ListItem>
                ))} */}
                <ListItem disablePadding component={RouterLink} to="/Login">
                    <ListItemButton sx={{ textAlign: "center" }}>
                        <ListItemText primary="Login" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    const container =
        window !== undefined ? () => window().document.body : undefined;

    return (
        // <ThemeProvider theme={theme}>

        <Box sx={{ display: "flex", }}>
            <CssBaseline />
            <AppBar
                component="nav"
                sx={{
                    backgroundColor: "#fff",
                    color: "#000",
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="h6"
                        sx={{
                            flexGrow: 1,
                            display: { xs: "none", sm: "flex" },
                            justifyContent: "start",
                            alignItems: "center",
                        }}
                    >
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
                            }}
                        />

                    </Typography>
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        {/* {navItems.map((item) => (
                            <Button key={item} sx={{ color: "#000" }}>
                                {item}
                            </Button>
                        ))} */}
                         {/* <Button variant="outlined" color="secondary" sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '250px', marginLeft: '5px', marginRight: '5px' }} onClick={onButtonClicktalent}>
                            Competency Assessment
                        </Button> */}
                        {/* <Button variant="outlined" color="secondary" sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }} onClick={onButtonClicklogin}>
                            Faculty Login
                        </Button>

                        <Button variant="outlined" color="secondary" sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }} onClick={onButtonClickloginstud}>
                            Student Login
                        </Button> */}

                        <Button
                            variant="contained"
                            color="secondary"
                            style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px' }}
                            onClick={onButtonClickregister}
                        >
                            Start free
                        </Button>

                         <Button
                            variant="contained"
                            color="secondary"
                            style={{ padding: '5px 10px', marginLeft: 3, fontSize: '12px', height: '30px', width: '150px' }}
                            onClick={onButtonClickpricing}
                        >
                            Pricing 
                        </Button>
                         {/* <Button variant="outlined" color="secondary" sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }} onClick={onButtonClickintern}>
                            Internship
                        </Button>
                         <Button variant="outlined" color="secondary" sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }} onClick={onButtonClickexam}>
                            Certification
                        </Button> */}


                        <Button
        variant="outlined"  
        // color="secondary" 
        sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }}
        onClick={handleClick}
      >
        Login
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {links.map((link, index) => (
          <MenuItem
            key={index}
            component="a"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
          >
            {link.label}
          </MenuItem>
        ))}
      </Menu>

        <Button
        variant="outlined"  
        // color="secondary" 
        sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }}
        onClick={handleClickai}
      >
        AI Mentor
      </Button>
      <Menu
        anchorEl={anchorElai}
        open={openai}
        onClose={handleCloseai}
      >
        {linksai.map((link, index) => (
          <MenuItem
            key={index}
            component="a"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCloseai}
          >
            {link.label}
          </MenuItem>
        ))}
      </Menu>


         <Button
        variant="outlined"  
        // color="secondary" 
        sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }}
        onClick={handleClickau}
      >
        Audit
      </Button>
      <Menu
        anchorEl={anchorElau}
        open={openau}
        onClose={handleCloseau}
      >
        {linksau.map((link, index) => (
          <MenuItem
            key={index}
            component="a"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCloseau}
          >
            {link.label}
          </MenuItem>
        ))}
      </Menu>




                    </Box>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
            <Box sx={{ width: "100%" }}>
                <Box sx={{ position: "relative", maxWidth: "1500px", margin: "auto", marginTop: "64px" }}>
                    {/* Background Box 1 (Left) */}
                    <Box
                        sx={{
                            width: "50%",
                            height: "420px",
                            position: "absolute",
                            top: "20",
                            left: "0",
                            backgroundColor: "#1A2E35",
                            zIndex: 0,
                        }}
                    ></Box>

                    <Box
                        sx={{
                            width: "50%",
                            height: "420px",
                            position: "absolute",
                            top: "20",
                            right: "0",
                            backgroundColor: "#1CBBB4",
                            zIndex: 0,
                        }}
                    ></Box>

                    <SimpleSlider />
                    {/* <ClientPage />
                    <ClientPage2 /> */}
                    <AboutPage />
                    <AboutPage2 />
                    <AboutPage3 />
                    <AboutPage4 />
                    <AboutPage5 />
                    <AboutPage6 />
                    {/* <CategoryPage />
                    <PricingPage /> */}
                    <Container>
                        <Box
                            component="main"
                            sx={{ p: 2, backgroundColor: "#fff", color: "#0c0c0c" }}
                        >
                            <Box>
                                <img
                                    src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5245-about-img.jpg"
                                    alt="about_img"
                                    className={styles.aboutImage}
                                />
                                
                                <Typography
                                    variant="h4"
                                    component="h4"
                                    sx={{
                                        fontWeight: 700,
                                        textAlign: "center",
                                        mb: 2,
                                        color: "#444",
                                        textShadow:
                                            "1px 0px 1px #ccc, 0px 1px 1px #eee, 2px 1px 1px #ccc, 1px 2px 1px #eee, 3px 2px 1px #ccc, 2px 3px 1px #eee, 4px 3px 1px #ccc, 3px 4px 1px #eee, 5px 4px 1px #ccc, 4px 5px 1px #eee, 6px 5px 1px #ccc, 5px 6px 1px #eee, 7px 6px 1px #ccc;",
                                    }}
                                >
                                    Extended IQAC Team and Consulting
                                </Typography>
                                <br /><br />
                                <Typography variant='h6' component="h6" sx={{ px: 6 }}>
                                    Our extended IQAC team works with you online along with your IQAC team. Reporting to IQAC coordinator, 
                                    they assist with the process of data collection, validation, follow up, assisting with documentation, reports etc.
                                </Typography>
                                    <br /><br />
                                <Typography variant='h6' component="h6" sx={{ px: 6 }}>
                                    We also have consulting team comprising of senior consultants assisting you with overall Institutional Development and streamlining operation.
                                </Typography>
                                <br /><br />
                                <Typography variant='h6' component="h6" sx={{ px: 6 }}>
                                    Our consulting team has helped mopre than thirty top institutions achieving high grades (A / A+ / A++) in NAAC or NBA or NIRF or QS through institutional developmnent and data and document management.
                                </Typography>
                                <br /><br />
                                {/* <Typography variant='h6' component="h6" sx={{ px: 6 }}>
                                    Extended IQAC team is available at a fee of Rs. 60000 per month. For consulting engagements, please contact us at support@campus.technology to discuss scope and pricing.
                                </Typography> */}

                                {/* <Typography
                                    variant="h4"
                                    component="h4"
                                    sx={{
                                        fontWeight: 700,
                                        textAlign: "center",
                                        mb: 2,
                                        color: "#444",
                                        marginTop: 20
                                    }}
                                >
                                    Pricing Per Student for AI Mentor app
                                </Typography> */}

                              {/* <div style={{ textAlign: 'center'}}>
                                <Typography variant='h6' component="h6" sx={{ px: 6, marginTop: 10, marginBottom: 10, alignSelf: 'center' }}>
                                    Rs. 50 per student per month
                                </Typography>
                                </div> */}
                                {/* <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Button variant="contained" color="primary" sx={{ my: 4 }}>
                                        Read more
                                    </Button>
                                </Box> */}
                            </Box>
                        </Box>
                    </Container>
                    {/* <PricingPage /> */}
                    {/* Contact page */}
                    {/* <ContactPage /> */}

                </Box>
                {/* Footer Section*/}
                <Box sx={{ backgroundColor: "#0c0c0c", color: "#fff", p: 2 }}>
                    <Container maxWidth="xl" sx={{ backgroundColor: "none", mt: 2 }}>
                        {/* Grid for footer logo and social links */}
                        <Grid
                            container
                            spacing={0}
                            sx={{ backgroundColor: "none", color: "#cdcdcd" }}
                        >
                            <Grid item xs={12} sm={12} md={6} sx={{ p: 2 }}>
                                <img
                                    src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-2048-FullLogo_Transparent_NoBuffer.png"
                                    alt="footer_ct_logo"
                                    width="150"
                                    height="60"
                                    style={{
                                        objectFit: "cover",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                />
                            </Grid>
                            {/* <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    justifyContent: "end",
                                    alignItems: "center",
                                    gap: "14px",
                                }}
                            >
                                <Typography sx={{ color: "#1877F2" }}>
                                    <FacebookIcon />
                                </Typography>

                                <Typography sx={{ color: "#657786" }}>
                                    <XIcon />
                                </Typography>

                                <Typography sx={{ color: "#0072b1" }}>
                                    <LinkedInIcon />
                                </Typography>

                                <Typography sx={{ color: "#d62976" }}>
                                    <InstagramIcon />
                                </Typography>

                                <Typography sx={{ color: "#FF0000" }}>
                                    <YouTubeIcon />
                                </Typography>
                            </Grid> */}
                        </Grid>

                        {/* Grid for footer info */}
                        <Grid
                            container
                            spacing={0}
                            sx={{ backgroundColor: "#0c0c0c", color: "#cdcdcd" }}
                        >
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                                xl={3}
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    textAlign: "start",
                                    justifyContent: "start",
                                    alignItems: "start",
                                    textTransform: "uppercase",
                                    fontWeight: 700,
                                }}
                            >
                                Useful Link
                                <Typography sx={{ mt: 1 }}>
                                    <Link to="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-13-5058-Terms and Conditions.pdf" className={styles.atag}>
                                        Terms and conditions
                                    </Link>
                                </Typography>
                                <Typography>
                                    <Link to="http://kahantechnologies.com/privacypolicy.html" className={styles.atag}>
                                        Privacy policy
                                    </Link>
                                </Typography>
                                <Typography>
                                    <Link to="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-13-5156-Refund policy.pdf" className={styles.atag}>
                                        Refund policy
                                    </Link>
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                                xl={3}
                                sx={{
                                    p: 2,
                                    display: "block",
                                    textTransform: "uppercase",
                                    fontWeight: 700,
                                }}
                            >
                                Office
                                <Typography sx={{ mt: 1, textTransform: "none" }}>
                                2JJJ+56G, Service Rd, HBR Layout 4th Block, HBR Layout, Bengaluru, Karnataka 560048
                                </Typography>
                                {/* <Typography sx={{ mt: 1, textTransform: "none" }}>
                                196 Block B Bangur Avenue Kolkata 700055
                                </Typography> */}
                                <Typography sx={{ mt: 1, textTransform: "none" }}>
                                Contact: support@campus.technology
                                </Typography>
                                <Typography sx={{ mt: 1, textTransform: "none" }}>
                                Copyright @ 2025 Campus Technology - All rights reserved
                                </Typography>
                                
                            </Grid>
                            {/* <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                                xl={3}
                                sx={{
                                    p: 2,
                                    display: "grid",
                                    textTransform: "uppercase",
                                    fontWeight: 700,
                                }}
                            >
                                Information
                                <Typography sx={{ mt: 1, textTransform: "none" }}>
                                    Generative AI for LMS and Accreditation. Generate syllabus to
                                    course material to assignments. Validate documents. Generate
                                    course material as per the learning level of students.
                                </Typography>
                            </Grid> */}
                            {/* <Grid
                                item
                                xs={12}
                                sm={12}
                                md={6}
                                xl={3}
                                sx={{
                                    p: 2,
                                    display: "block",
                                    textTransform: "uppercase",
                                    fontWeight: 700,
                                }}
                            >
                                Newsletter
                                <Typography
                                    component="div"
                                    sx={{ mt: 1, textTransform: "none" }}
                                >
                                    <TextField
                                        size="small"
                                        fullWidth
                                        // label="Email"
                                        placeholder="Email"
                                        id="fullWidth"
                                        sx={{ backgroundColor: "#fff", borderRadius: "4px" }}
                                        value={subscribeVal}
                                        onChange={(e) => setSubscribeVal(e.target.value)}
                                    />
                                    <Button
                                        variant="contained"
                                        sx={{ my: 1 }}
                                        onClick={handleSubscribe}
                                    >
                                        Subscribe
                                    </Button>
                                </Typography>
                            </Grid> */}
                        </Grid>

                        {/* CopyRight text */}
                        {/* <Typography
              component="div"
              sx={{
                color: "#cdcdcd",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              &copy; www.campustechnology.com
            </Typography> */}
                    </Container>
                </Box>



            </Box>
        </Box>
        // </ThemeProvider>
    );
}

CampusWebsite.propTypes = {
    window: PropTypes.func,
};


export default CampusWebsite;




