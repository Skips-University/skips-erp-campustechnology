import React, { useState } from 'react';
import { Box, Button, Container, Grid, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import styles from "../virtuallabcss/InfraRedSpectros.module.css";
import global1 from './global1';

const spoon = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-25-5113-spoon.png"
const spoonFilled = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-25-5134-spoonFilled.png"
const Rocking = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-330-rocking.png"
const Symmetric = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-441-Symmetric.png"
const Asymmetric = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-121-asymmetric.png"
const Scissoring = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-45-scissoring.png"

const sampleBeakerImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-25-4634-sampleBeaker.png";
const sampleTiledBeakerImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-4923-sampleTiledBeaker.png";
const solventBeakerImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-25-478-solventBeaker.png";
const solventTiledBeakerImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-4359-solventTiledBeaker.png";
const mortarImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-318-mortor.png";
const irplateImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-25-4557-IRPLate.png";
const desiccatorImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-133-Desiccator.png";
const mortarSampleImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-3153-mortorSample.png";
const mortarSamplesolventImg = "https://jadavpuruniversity.s3-ap-south-1.amazonaws.com/9-2024-24-323-mortarSamplesolvent.png";



const InfraRedSpectros = () => {
    const [level, setLevel] = useState(0);
    const [score, setScore] = useState(0);
    const [droppedItems, setDroppedItems] = useState({
        Symmetric: "",
        Asymmetric: "",
        Scissoring: "",
        Rocking: ""
    });
    const [draggedItem, setDraggedItem] = useState(null);
    const [usedOptions, setUsedOptions] = useState([]);
    const [isSpoonFilled, setIsSpoonFilled] = useState(false);
    const [isSpoonmoving, setIsSpoonmoving] = useState(false);
    const [isIRPlatemoving, setIsIRPlatemoving] = useState(false);
    const [isfinished, setIsfinished] = useState(false);
    const [showgreenIRplate, setShowgreenIRplate] = useState(false);
    const [apparatus, setApparatus] = useState({
        sampleBeaker: false,
        sampleTiledBeaker: false,
        solventBeaker: false,
        solventTiledBeaker: false,
        mortar: false,
        mortarSamplesolvent: false,
        mortorSample: false,
        mortarGreenMix: false,
        irplate: false,
        desiccator: false
    })
    const { sampleBeaker,
        sampleTiledBeaker,
        solventBeaker,
        solventTiledBeaker,
        mortar,
        mortarSamplesolvent,
        mortarSample,
        mortarGreenMix,
        irplate,
        desiccator } = apparatus

        const regno=global1.regno;
        const name=global1.name;

    // Define conditions to check if the next item can be clicked
    const isClickable = (apparatusName) => {
        switch (apparatusName) {
            case 'solventBeaker':
                return apparatus.sampleBeaker; 
            case 'mortar':
                return apparatus.solventBeaker; 
            case 'irplate':
                return apparatus.mortar; 
            case 'desiccator':
                return apparatus.irplate;
            default:
                return true; 
        }
    };

    const correctMatches = {
        Symmetric: "Symmetric Stretching",
        Asymmetric: "Asymmetric Stretching",
        Scissoring: "Scissoring",
        Rocking: "Rocking",
    };

    // Handling dragging start
    const handleDragStart = (optionName) => {
        if (usedOptions.includes(optionName)) return;
        setDraggedItem(optionName);
    };

    // Handling drop onto a target
    const handleDrop = (targetName) => {
        if (!draggedItem || usedOptions.includes(draggedItem)) return;

        setDroppedItems((prevState) => ({
            ...prevState,
            [targetName]: draggedItem,
        }));

        setUsedOptions((prev) => [...prev, draggedItem]);
        setDraggedItem(null);
    };

    // Check correctness and handle next button click
    const handleNextClick = () => {
        let correctCount = 0;
        for (let key in correctMatches) {
            if (droppedItems[key] === correctMatches[key]) {
                correctCount++;
            }
        }

        if (correctCount >= 2) {
            const scoreIncrement = correctCount * 10;
            setScore(score + scoreIncrement);
            setLevel((prev) => prev + 1);
            // resetDroppedItems();
        } else {
            alert(`Alteast you should select more than two correct answer Restarting...`);
            setLevel(0);
            setScore(0);
            resetDroppedItems();
        }
    };

    // Reset the dropped items to initial state
    const resetDroppedItems = () => {
        setDroppedItems({
            Symmetric: "",
            Asymmetric: "",
            Scissoring: "",
            Rocking: ""
        });
        setUsedOptions([]);
    };



    // Function to handle clicking on list items
    const handleListItemClick = (apparatusName) => {
        setApparatus((prevApparatus) => ({
            ...prevApparatus,
            [apparatusName]: true
        }));
    };

    const handleSample = () => {

        setApparatus((prevApparatus) => ({
            ...prevApparatus,
            sampleBeaker: false,
            sampleTiledBeaker: true
        }));
        setTimeout(() => {
            setApparatus((prevApparatus) => ({
                ...prevApparatus,
                mortarSample: true,
                mortar: false,
                mortarSamplesolvent: false

            }));
        }, 1000)
    }

    const handleSolvent = () => {
        setApparatus((prevApparatus) => ({
            ...prevApparatus,
            solventBeaker: false,
            solventTiledBeaker: true,
        }));
        setTimeout(() => {
            setApparatus((prevApparatus) => ({
                ...prevApparatus,
                mortarSample: false,
                mortar: false,
                mortarSamplesolvent: true,

            }));
        }, 1000)
        setTimeout(() => {
            setApparatus((prevApparatus) => ({
                ...prevApparatus,
                mortarSample: false,
                mortar: false,
                mortarSamplesolvent: true,
                mortarGreenMix: true
            }));
        }, 5000)
    }




    // Add drag-and-drop functionality

    // Function to handle drag start
    const handleapparatusDragStart = (event, apparatusName) => {
        event.dataTransfer.setData("apparatus", apparatusName);
    };

    // Function to allow drop over mortar
    const allowDrop = (event) => {
        event.preventDefault();
    };

    // Function to handle drop
    const handleapparatusDrop = (event) => {
        event.preventDefault();
        const apparatusName = event.dataTransfer.getData("apparatus");
        if (apparatusName === 'sampleBeaker') {
            handleSample();

        } else if (apparatusName === 'solventBeaker') {
            handleSolvent();
        }
        const spoonName = event.dataTransfer.getData("spoon");
        if (spoonName === 'spoon') {
            setIsSpoonFilled(true);

        }
    };

    const handlspoonFilledClick = () => {
        setIsSpoonmoving(true)
        setTimeout(() => {
            setShowgreenIRplate(true)
        }, 4000)
    }

    // Function to handle drag start
    const handleSpoonDragStart = (event) => {
        event.dataTransfer.setData("spoon", "spoon");
    };

    const handleIrPlatemove = () => {
        setIsIRPlatemoving(true)
        setTimeout(() => {
            setIsfinished(true)
        }, 4000)
    }


    return (
        <Box p="40px 0px">
            <Container sx={{ display: 'flex', justifyContent: 'space-between', pb: '10px' }}>
                <Box>
                    <Typography variant='h6' fontWeight="bold">
                        Student Name : {name}
                    </Typography>
                    <Typography variant='h6' fontWeight="bold">
                        Registration No. : {regno}
                    </Typography>
                </Box>
                {level <= 2 && <Box sx={{ bgcolor: "green", padding: "20px", borderRadius: "20px" }}>
                    <Typography variant='h6' fontWeight="bold" color="white">
                        Score - {score}
                    </Typography>
                </Box>}
            </Container>
            {level === 0 && (
                <Container sx={{ border: "5px solid grey", p: "10px 0px" }}>
                    <Typography variant='h4' textAlign="center" fontWeight="bold">
                        Instrumentation and Working Principles of Infra-Red (IR) Spectroscopy Using Salt Plates
                    </Typography>
                    <Box>
                        <Typography variant='h6' textAlign="center" fontWeight="bold" mt="30px">
                            Theory
                        </Typography>
                        <Typography variant='subtitle2' textAlign="justify" bgcolor="lightblue" fontSize="20px" width="80%" mx="auto" p="20px">

                            When two atoms combine to form a stable covalent molecular, there are two repulsion forces acting between the two heteroatoms. One between the positively charged nuclei of both the atoms and the other between the negative electron clouds. The other force is the attraction between the nucleus of one atom with the electrons of the other atom. Balancing the forces between them, the two atoms settle at a mean internuclear distance or the bond length where the total energy of the system is minimum. Any change like pulling the atoms away or squeezing them brings a change in the bond length which requires an input of energy.
                        </Typography>

                    </Box>
                    <Button
                        variant='contained'
                        sx={{ display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", my: "30px" }}
                        onClick={() => setLevel(1)}
                    >
                        Start Experiment
                    </Button>
                </Container>
            )
            }

            {
                level === 1 && (
                    <Container sx={{ border: "5px solid grey", p: "10px 0px" }}>
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor: "yellow", margin: "10px 0px" }}>
                            <Typography
                                variant='h6'
                                className={styles.level}
                            >
                                Level- {level}
                            </Typography>
                        </div>
                        <Typography variant='h6' sx={{ margin: "40px 0px", fontSize: "24px", textAlign: "center" }}>Choose the Correct option and drop to specific position  </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} display="flex" flexDirection="column" alignItems="center">
                                <Box
                                    sx={{
                                        border: "2px dashed grey",
                                        padding: "20px",
                                        width: "180px",
                                        height: "230px",
                                        backgroundColor: droppedItems.Symmetric ? "lightgreen" : "white",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop("Symmetric")}
                                >
                                    <img src={Symmetric} alt="Symmetric" style={{ width: '150px', height: '150px' }} />
                                    <input
                                        value={droppedItems.Symmetric || ""}
                                        readOnly
                                        style={{ marginTop: "10px", textAlign: "center", fontSize: "16px" }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={6} display="flex" flexDirection="column" alignItems="center">
                                <Box
                                    sx={{
                                        border: "2px dashed grey",
                                        padding: "20px",
                                        width: "180px",
                                        height: "230px",
                                        backgroundColor: droppedItems.Asymmetric ? "lightgreen" : "white",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop("Asymmetric")}
                                >
                                    <img src={Asymmetric} alt="Asymmetric" style={{ width: '150px', height: '150px' }} />
                                    <input
                                        value={droppedItems.Asymmetric || ""}
                                        readOnly
                                        style={{ marginTop: "10px", textAlign: "center", fontSize: "16px" }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={6} display="flex" flexDirection="column" alignItems="center">
                                <Box
                                    sx={{
                                        border: "2px dashed grey",
                                        padding: "20px",
                                        width: "180px",
                                        height: "230px",
                                        backgroundColor: droppedItems.Scissoring ? "lightgreen" : "white",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop("Scissoring")}
                                >
                                    <img src={Scissoring} alt="Scissoring" style={{ width: '150px', height: '150px' }} />
                                    <input
                                        value={droppedItems.Scissoring || ""}
                                        readOnly
                                        style={{ marginTop: "10px", textAlign: "center", fontSize: "16px" }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={6} display="flex" flexDirection="column" alignItems="center">
                                <Box
                                    sx={{
                                        border: "2px dashed grey",
                                        padding: "20px",
                                        width: "180px",
                                        height: "230px",
                                        backgroundColor: droppedItems.Rocking ? "lightgreen" : "white",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop("Rocking")}
                                >
                                    <img src={Rocking} alt="Rocking" style={{ width: '150px', height: '150px' }} />
                                    <input
                                        value={droppedItems.Rocking || ""}
                                        readOnly
                                        style={{ marginTop: "10px", textAlign: "center", fontSize: "16px" }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Box display="flex" alignItems="center" justifyContent="center" gap="20px" margin="20px">
                            <Typography
                                draggable
                                onDragStart={() => handleDragStart("Symmetric Stretching")}
                                variant='h6'
                                sx={{
                                    bgcolor: "lightgray",
                                    padding: "6px 10px",
                                    borderRadius: "20px",
                                    cursor: usedOptions.includes("Symmetric Stretching") ? "not-allowed" : "pointer",
                                }}
                            >
                                Symmetric Stretching
                            </Typography>
                            <Typography
                                draggable
                                onDragStart={() => handleDragStart("Asymmetric Stretching")}
                                variant='h6'
                                sx={{
                                    bgcolor: "lightgray",
                                    padding: "6px 10px",
                                    borderRadius: "20px",
                                    cursor: usedOptions.includes("Asymmetric Stretching") ? "not-allowed" : "pointer",
                                }}
                            >
                                Asymmetric Stretching
                            </Typography>
                            <Typography
                                draggable
                                onDragStart={() => handleDragStart("Scissoring")}
                                variant='h6'
                                sx={{
                                    bgcolor: "lightgray",
                                    padding: "6px 10px",
                                    borderRadius: "20px",
                                    cursor: usedOptions.includes("Scissoring") ? "not-allowed" : "pointer",
                                }}
                            >
                                Scissoring
                            </Typography>
                            <Typography
                                draggable
                                onDragStart={() => handleDragStart("Rocking")}
                                variant='h6'
                                sx={{
                                    bgcolor: "lightgray",
                                    padding: "6px 10px",
                                    borderRadius: "20px",
                                    cursor: usedOptions.includes("Rocking") ? "not-allowed" : "pointer",
                                }}
                            >
                                Rocking
                            </Typography>
                        </Box>

                        <Button variant="contained" onClick={handleNextClick}>
                            Next Level
                        </Button>
                    </Container>
                )
            }
            {
                level === 2 && (
                    <Container>
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor: "yellow", margin: "10px 0px" }}>
                            <Typography
                                variant='h6'
                                className={styles.level}
                            >
                                Level- {level}
                            </Typography>
                        </div>
                        <Box sx={{ border: "2px solid black", padding: "20px", bgcolor: "lightgray" }}>
                            <Typography variant='h6'>Procedure  </Typography>
                            <Typography variant='subtitle1'>1. First from the left sidebar click on list one by one.   </Typography>
                            <Typography variant='subtitle1'>2. Once you click on all the list item you can see the image on the right side.  </Typography>
                            <Typography variant='subtitle1'>3. Now Drag  and drop the Sample Beaker over the Motar to pour the sample to motar.</Typography>
                            <Typography variant='subtitle1'>4. Next Drag and drop the Solvent Beaker over the Motar to pour the Solvent to motar. </Typography>
                            <Typography variant='subtitle1'>5. Once you pour both solution you need to wait until it will perform some reaction and will chnage the solution color into green </Typography>
                            <Typography variant='subtitle1'>6. Now drag and drop the spoon over to green mixture to take some amount of mixture from that. </Typography>
                            <Typography variant='subtitle1'>7. Once the spoon is filled you should click on spoon. </Typography>
                            <Typography variant='subtitle1'>8. Now the IR Plate has that solution next clik on IR Plate to put that IR plate inside the Desiccator.</Typography>
                        </Box>

                        <Box sx={{ display: "flex", margin: "40px 0px", border: "2px solid black" }}>
                            <Box sx={{ width: "20%", bgcolor: "lightblue", padding: "10px", border: "2px solid black" }}>
                                <Box >
                                    <Typography variant='h6'>Apparatus Menu</Typography>
                                    <List>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => handleListItemClick('sampleBeaker')}
                                                disabled={apparatus.sampleBeaker} // Disable if already clicked
                                            >
                                                <ListItemText primary="Sample Beaker" />
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => handleListItemClick('solventBeaker')}
                                                disabled={!isClickable('solventBeaker') || apparatus.solventBeaker} // Check if it's clickable and not already clicked
                                            >
                                                <ListItemText primary="Solvent Beaker" />
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => handleListItemClick('mortar')}
                                                disabled={!isClickable('mortar') || apparatus.mortar}
                                            >
                                                <ListItemText primary="Mortar" />
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => handleListItemClick('irplate')}
                                                disabled={!isClickable('irplate') || apparatus.irplate}
                                            >
                                                <ListItemText primary="IR Plate" />
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                onClick={() => handleListItemClick('desiccator')}
                                                disabled={!isClickable('desiccator') || apparatus.desiccator}
                                            >
                                                <ListItemText primary="Desiccator" />
                                            </ListItemButton>
                                        </ListItem>
                                    </List>
                                </Box>
                            </Box>
                            <Box sx={{ width: "90%", height: '500px', padding: "20px", border: "2px solid black", display: "flex" }} >
                                <Grid conatiner sx={{ display: "flex", gap: "20px" }}>
                                    <Grid item xs={8}>
                                        <Grid container>
                                            <Grid item xs={5}>
                                                {sampleBeaker && (
                                                    <img
                                                        src={sampleBeakerImg}
                                                        alt="sampleBeaker"
                                                        height={"200px"}
                                                        draggable
                                                        onDragStart={(e) => handleapparatusDragStart(e, 'sampleBeaker')}
                                                    />
                                                )}
                                                {sampleTiledBeaker && <img src={sampleTiledBeakerImg} alt="sampleTiledBeakerImg" height={"200px"} />}
                                            </Grid>
                                            <Grid item xs={7}>
                                                {solventBeaker && (
                                                    <img
                                                        src={solventBeakerImg}
                                                        alt="solventBeaker"
                                                        height={"200px"}
                                                        draggable
                                                        onDragStart={(e) => handleapparatusDragStart(e, 'solventBeaker')}
                                                    />
                                                )}
                                                {solventTiledBeaker && <img src={solventTiledBeakerImg} alt="solventTiledBeakerImg" height={"200px"} />}
                                            </Grid>
                                            <Grid item xs={9} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
                                                {/* Allow drop on mortar */}
                                                <div onDrop={handleapparatusDrop} onDragOver={allowDrop}>
                                                    {mortar && <img src={mortarImg} alt="mortar" />}
                                                    {mortarSample && <img src={mortarSampleImg} alt="mortarSample" />}
                                                    {mortarSamplesolvent && (
                                                        <Box position="relative">
                                                            <img src={mortarSamplesolventImg} alt="mortarSamplesolvent" />
                                                            <div className={`${styles.stick} ${styles.slidein}`} />
                                                            {mortarGreenMix && <div className={`${styles.greenSolution} ${mortarGreenMix ? styles.fadeInAnimation : ""}`} />}
                                                        </Box>
                                                    )}
                                                </div>
                                            </Grid>

                                            <Grid item xs={3}>
                                                {irplate && (
                                                    <Box position="relative"  >
                                                        <Box className={isIRPlatemoving ? styles.irplateSliding : ""} onClick={handleIrPlatemove}>
                                                            <img src={irplateImg} alt="IRPLate" width="100%" onClick={handleIrPlatemove} />
                                                            {showgreenIRplate && <div className={`${styles.irplategreenSolution} ${isIRPlatemoving ? styles.irplateSliding : ""} ${showgreenIRplate ? styles.fadeInAnimation : ""}`} onClick={handleIrPlatemove} />}
                                                        </Box>
                                                        {isSpoonFilled ? (
                                                            <img
                                                                id="spoon-filled"
                                                                src={spoonFilled}
                                                                alt="spoon filled"
                                                                width="100%"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: "57px",
                                                                    left: "-208px",
                                                                }}
                                                                className={isSpoonmoving && styles.movingAnimation}
                                                                onClick={handlspoonFilledClick}
                                                            />
                                                        ) : (
                                                            <img
                                                                src={spoon}
                                                                alt="spoon"
                                                                width="100%"
                                                                draggable
                                                                onDragStart={handleSpoonDragStart}
                                                            />
                                                        )}
                                                    </Box>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={4} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
                                        {desiccator && <img src={desiccatorImg} alt="Desiccator" width="350px" />}
                                    </Grid>

                                </Grid>
                            </Box>
                        </Box>

                        <Button variant="contained" sx={{ display: "flex", justifyContent: "center", alignItems: "center", mx: "auto" }}
                            onClick={() => {
                                setLevel(prev => prev + 1)
                                if (isfinished) {
                                    setScore(prev => prev + 20)
                                }
                            }}
                        >
                            Next
                        </Button>
                    </Container>
                )}
            {
                level > 2 && (
                    <Container
                        sx={{
                            width: "100%",
                            height: "400px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                        }}
                    >
                        <Typography
                            variant="h5"
                            textAlign="center"
                            fontWeight="bold"
                            mb={"30px"}
                        >
                            Instrumentation and Working Principles of Infra-Red (IR) Spectroscopy Using Salt Plates
                        </Typography>
                        <Box
                            sx={{
                                width: "400px",
                                height: "200px",
                                bgcolor: "lightblue",
                                padding: "20px",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                               boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px"
                            }}
                        >
                            <Box > 
                                <Typography variant="h5">{isfinished ? "Well Done Sonali 🎉" :" Sonali"}</Typography>
                                <Typography variant="subtitle1" sx={{ fontSize: "2rem" }}>
                                    Your total score is  <br />{score} / 60
                                </Typography>
                                {!isfinished && (
                                    <Typography variant="subtitle1" sx={{ fontSize: "1rem" }}>
                                        You haven't completed the task properly
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Container>
                )
            }
        </Box >
    );
};

export default InfraRedSpectros;











