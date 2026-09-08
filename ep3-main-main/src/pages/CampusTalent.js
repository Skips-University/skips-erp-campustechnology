import React, { useRef, useState } from 'react';
import { TextField, Stack, Button, Box, Card, Typography, Container, AppBar, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, CardMedia, CardContent, CardActions, ListItemIcon, useMediaQuery } from '@mui/material';
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
        title: "Knowledge review and recall",
    },
    {
        icon: <SettingsSuggestIcon sx={{ fontSize: "100px" }} />,
        title: "Concept understanding",
    },
    {
        icon: <DeblurIcon sx={{ fontSize: "100px" }} />,
        title: "Practical application",
    },
    {
        icon: <DiamondIcon sx={{ fontSize: "100px" }} />,
        title: "Critical thinking ability",
    },
    {
        icon: <Diversity3Icon sx={{ fontSize: "100px" }} />,
        title: "Thinking outside box",
    },
    {
        icon: <InsightsIcon sx={{ fontSize: "100px" }} />,
        title: "Creative synthesis of concepts",
    },
    {
        icon: <AutoStoriesIcon sx={{ fontSize: "100px" }} />,
        title: "Competecncy development",
    },
    {
        icon: <AddModeratorIcon sx={{ fontSize: "100px" }} />,
        title: "Independent thinking ",
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
                    {/* <Box sx={{ mt: 2 }}>
                        <a href='/Login' style={{ backgroundColor: '#0f6fdb', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>
                            Get started
                        </a>
                    </Box> */}
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
                    heading="AI Based Competency assessment as per Blooms Taxonomy and with virtual lab"
                    subheading="India's only AI based competency assessment program using virtual lab and as per blooms taxonomy. Registration closes November 18, 2024."
                    image="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-535-h1.png"
                />
                <CarousalCard
                    heading="Develop skills and prepare for future competitions"
                    subheading="With our advanced platform and assessment methodology using international Blooms Taxonomy standards, students can gain exposure, develop skills and prepare for future competitions."
                    image="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-535-h1.png"
                />
                <CarousalCard
                    heading="Competency assessment in multiple subjects"
                    subheading="AI based Competency assessment in Science, Mathematics and English. Multiple assessment techniques including MCQ, Case studies, Projects and Virtual Lab."
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

const AboutPage = () => {
    const navigate2 = useNavigate();
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/11-2024-8-278-blooms levels.png"
                    alt='img1' style={{ width: '100%', height: 'auto' }} />
            </Box>

            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    New age assessment aligned to Bloom's Taxonomy
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    India's only new age competency assessment aligned to all levels of Bloom's Taxonomy, ensuring, all students achieve the desired competency.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    A variery of assessment tools such as MCQ, Case Studies, Virtual Lab etc. are used to assess competencies at different levels.
                </Typography>
                <Box sx={{ mt: 2 }}>
                    {/* <Button variant="contained" color="success" sx={{ mr: 2 }}>
                        About Us
                    </Button> */}
                    {/* <a href='/Examregister' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a> */}
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
                    Remembering
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                These activities require students to recall or recognize specific terms, facts, and concepts. Each activity is structured to test knowledge recall and recognition, ideal for foundational understanding before progressing to higher-order cognitive skills. 
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                    Example: <br /><br />
                    Labeling Diagrams - 
Anatomy Example: Provide a diagram of the human skeletal system and ask students to label the following bones: femur, skull, ribs, pelvis.
<br /><br />
Matching Questions
Biology Example: Match the terms in Column A with their definitions in Column B


                </Typography>
                {/* <Box sx={{ mt: 2 }}>
                <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                 
                </Box> */}
            </Box>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
            {/* <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/11-2024-8-278-blooms levels.png"
                    alt='img1' style={{ width: '100%', height: 'auto' }} /> */}
            
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
                    Understanding
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                These activities encourage students to process, interpret, and relate information, helping them demonstrate comprehension rather than simple recall. Examples below:
<br /><br />
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                Science Example: "Write a summary of the documentary Planet Earth, explaining the significance of biodiversity in different ecosystems."_____."
                <brb /><br />
                Matching Questions: Match the terms in Column A with their definitions in Column B
                <br /><br />
                Question format: MCQ
                </Typography>
                {/* <Box sx={{ mt: 2 }}>
                <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                 
                </Box> */}
            </Box>
        </Box>
    );
};

const AboutPage4 = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>



            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Applying
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                These activities emphasize using knowledge, concepts, and procedures to solve problems, complete tasks, and make informed decisions on the appropriate methods or processes.
Examples below. 
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                In a virtual; lab, students perform a titration to determine the concentration of an unknown acidic solution by neutralizing it with a base.
                <br /><br />
                A car accelerates from rest to 60 km/h in 10 seconds. Calculate the car's acceleration.
                <br /><br />
                Question format: MCQ

                </Typography>
                {/* <Box sx={{ mt: 2 }}>
                   
                    <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                </Box> */}
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
                    Analyzing
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                These activities encourage students to analyze information, identify relationships, assess underlying messages, and evaluate bias or relevance across core subjects.
Example below.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                case study: Identify the key elements of the mangrove ecosystem and determine how each part supports the system as a whole."
                <br /><br />
                Determine the similarities and differences between shapes, such as squares, rhombuses, and parallelograms, and identify how their properties relate
                <br /><br />
                Analyze the map and select only the regions suitable for agriculture based on climate and terrain.
                <br /><br />
                Question format: MCQ
                </Typography>
                {/* <Box sx={{ mt: 2 }}>
                    
                    <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                </Box> */}
            </Box>
        </Box>
    );
};

const AboutPage6 = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>



            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Evaluating
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                These activities encourage students to judge, critique, and make informed decisions about academic content, performances, and products by comparing them against established standards.
Examples below.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                Critique your peer’s essay based on argument strength, use of examples, and clarity. Provide constructive feedback.
                <br /><br />
                Evaluate the effectiveness of different economic policies on poverty reduction and job creation india
                <br /><br />
                Analyze the code for errors and improve it to ensure it functions efficiently and meets the task requirements
                <br /><br />
                Question format: MCQ
                </Typography>
                {/* <Box sx={{ mt: 2 }}>
                   
                    <a href='/Login' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                </Box> */}
            </Box>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-11-1338-lms2.jpeg"
                    alt='img1' style={{ width: '100%', height: 'auto' }} />
            </Box>


        </Box>
    );
};

const AboutPage7 = () => {
    const navigate2 = useNavigate();
    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 10, padding: 6, marginBlock: "80px" }}>

            <Box sx={{ width: "40%", display: 'flex', justifyContent: 'center' }}>
                <img src="https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-10-5255-h2.jpg"
                    alt='img1' style={{ width: '100%', height: 'auto' }} />
            </Box>

            <Box sx={{ width: "65%", }}>
                <Typography variant='h4' component="h4" sx={{ textTransform: "uppercase", mb: 4, fontWeight: "bold" }}>
                    Creating
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                These activities encourage students to design, generate, or produce something original, applying their knowledge and creativity in various subjects.
Examples below.
                </Typography>
                <Typography variant='subtitle1' component="p" sx={{ mb: 6, fontSize: "20px" }}>
                Write a short story featuring a protagonist facing and overcoming a challenge. Include descriptive language and dialogue.
                <br /><br />
                Create a survey, collect data, and represent your findings using charts and graphs
                <br /><br />
                Compose a poem that explores a specific theme, using figurative language and vivid imagery.
                <br /><br />
                This assessment is taken through Virtual Lab and Projects in Second round. Students need to work on the virtual lab or project and submit report through app.
                
                </Typography>
                {/* <Box sx={{ mt: 2 }}>
                 
                    <a href='/Examregister' style={{ backgroundColor: '#c811ed', color: '#fff', display: 'block', padding: 15, width: 150, fontSize: 16, textDecoration: 'none' }}>GET STARTED</a>
                   
                </Box> */}
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
                                    Examination fees
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
                                        Individual
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹350
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per exam
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "250px", padding: " 30px", overflowY: "scroll" }}>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Round 1 + Round 2" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Exam through mobile app" />
                                    </Box>
                                </ListItem>
                                {/* <ListItem disablePadding>
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
                                        <ListItemText primary="Host in your server" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Arrange for API keys" />
                                    </Box>
                                </ListItem> */}
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
                                        Individual
                                    </Typography>
                                    <Typography gutterBottom variant="h4" component="h4" fontWeight="bold">
                                        ₹300
                                    </Typography>
                                    <Typography gutterBottom variant="subtitle2" component="p">
                                        per exam
                                    </Typography>
                                </Box>
                            </Box>
                            <List sx={{ width: "300px", height: "250px", padding: " 30px", overflowY: "scroll" }}>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Round 1 + Round 2" />
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
                                        <ListItemText primary="Host in your server" />
                                    </Box>
                                </ListItem>
                                <ListItem disablePadding>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <CheckCircleOutlineIcon sx={{ color: "grey" }} />
                                        <ListItemText primary="Arrange for API keys" />
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

    const onButtonClickhome = async () => {
        navigate('/CampusWebsite');
    };

    const onButtonClickregister = async () => {
      navigate('/campustalentregister');
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
                <ListItem disablePadding component={RouterLink} to="/campustalentregister">
                    <ListItemButton sx={{ textAlign: "center" }}>
                        <ListItemText primary="Register" />
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
                        <Button variant="outlined" color="secondary" sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }} onClick={onButtonClickhome}>
                            Home
                        </Button>

                        {/* <Button variant="outlined" color="secondary" sx={{ color: "#000", padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px', marginLeft: '5px', marginRight: '5px' }} onClick={onButtonClickloginstud}>
                            Student Login
                        </Button> */}

                        <Button
                            variant="contained"
                            color="secondary"
                            style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '150px' }}
                            onClick={onButtonClickregister}
                        >
                            Register for exam
                        </Button>
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
                    <AboutPage />
                    <AboutPage2 />
                    <AboutPage3 />
                    <AboutPage4 />
                    <AboutPage5 />
                    <AboutPage6 />
                    <AboutPage7 />
                    <CategoryPage />
                    {/* <PricingPage /> */}
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
                                    Registration fee Rs. 300 per exam
                                </Typography>
                                <br /><br />
                                {/* <Typography variant='h6' component="h6" sx={{ px: 6 }}>
                                    Our extended IQAC team works with you online along with your IQAC team. Reporting to IQAC coordinator, 
                                    they assist with the process of data collection, validation, follow up, assisting with documentation, reports etc.
                                </Typography>
                                    <br /><br />
                                <Typography variant='h6' component="h6" sx={{ px: 6 }}>
                                    We also have consulting team comprising of senior consultants assisting you with overall Institutional Development and streamlining operation.
                                </Typography> */}
                                {/* <br /><br />
                                <Typography variant='h6' component="h6" sx={{ px: 6 }}>
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
                                </Typography>

                              <div style={{ textAlign: 'center'}}>
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




