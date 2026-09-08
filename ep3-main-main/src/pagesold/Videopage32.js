import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    Component,
  } from "react";
  import ReactPlayer from "react-player/lazy";
  import global1 from './global1';
  import {
    Box,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Typography,
  } from "@mui/material";
  import PlayArrowIcon from "@mui/icons-material/PlayArrow";
  import PauseIcon from "@mui/icons-material/Pause";
  import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
  import ChevronRightIcon from "@mui/icons-material/ChevronRight";
  import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
  // CSS path here make sure change the path here
//   import styles from "../css/Video2.module.css";
import styles from "./Video3.module.css";
  
  import {
    TransformWrapper,
    TransformComponent,
    useControls,
  } from "react-zoom-pan-pinch";
  
  const videostoadd = [
    {
      video: "https://youtu.be/l-qU7FvFRT4",
      image: "",
      title: "Learning...",
      voicetext: "Welcome to AI Video",
      duration: 4,
      type: "video",
    }
  ];
  
//   const videos = [
//     {
//       video: "https://www.youtube.com/watch?v=CrHeuJqkJX4",
//       image: "",
//       title: "Learning...",
//       voicetext: "New Product Launch | Teaser",
//       duration: 23,
//       type: "video",
//     },
//     {
//       video: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
//       image: "",
//       title: "Text is not able to see.",
//       voicetext: "Sintel | Halina Reijn | Thom Hoffman",
//       duration: 52,
//       type: "video",
//     },
//     {
//       video: "https://www.youtube.com/watch?v=I9tGP4z7ETQ",
//       image: "",
//       title: "This video created by campus technology.",
//       voicetext:
//         "An Initiative By Campus.Technology | www.campus.technology | Suman Nandy",
//       duration: 49,
//       type: "video",
//     },
//     {
//       video: "",
//       image:
//         "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5tBCXngoqUVlR4bwi619gquT3UtCHBSffOQ2EM5rWr4Zh3Ht9XoCqMgnrN7FC2FzupYHuj3UhIhf_oz0rglhGt0UcFzcVgJV0Hg6ANOYWqAt0ubOc1AGJ7AXJqQ5p8cADuwvw_fYFmd-J/s1600/learning-1959541_1920.jpg",
//       title: "Learn from here",
//       voicetext: "It's Learning images",
//       duration: 5,
//       type: "text-image",
//     },
//     {
//       video: "",
//       title: "Welcome to video page",
//       image: "",
//       voicetext:
//         "Text-to-speech feature is now available on relatively any website or blog",
//       duration: 10,
//       type: "text",
//     },
//     {
//       video: "",
//       title:
//         "Text-to-speech feature is now available on relatively any website or blog. It's a game changer that you can listen to the content instead of reading it. Especially effective for people with visual or cognitive impairments or people who are on the go. I came up with the idea to implement it for my blog, so this is how I started doing a research on this topic which ended up being a tutorial for you. So in this tutorial, we will go through the process of building a text-to-speech component in React. We will use the Web Speech API to implement the text-to-speech functionality.",
//       image: "",
//       voicetext: "It's second text",
//       duration: 62,
//       type: "text",
//     },
//     {
//       video: "",
//       title: "Text are not visiable",
//       image:
//         "https://th.bing.com/th/id/R.ff3a044a3fa044105293a5fd1fda1d7f?rik=QIfOnCdYyhmZSA&riu=http%3a%2f%2feducation.okfn.org%2ffiles%2f2015%2f07%2fedusoft.jpg&ehk=a33FReMH2rrdBgDFgp%2fKM0wrjqXgbgGoEi%2b5vtu0toE%3d&risl=&pid=ImgRaw&r=0",
//       voicetext: "It's second image",
//       duration: 10,
//       type: "image",
//     },
//     {
//       video: "",
//       title: "It is a 3rd image",
//       image:
//         "https://opensource.com/sites/default/files/lead-images/computer_desk_home_laptop_browser.png",
//       voicetext: "It's third image",
//       duration: 10,
//       type: "image",
//     },
//     {
//       video: "",
//       title: "Let start from here second slide",
//       image: "",
//       voicetext: "It's third text",
//       duration: 8,
//       type: "text",
//     },
//   ];
  
  const VideoPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(
      "speechSynthesis" in window
    );
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [transitioning, setTransitioning] = useState(false);
    const playerRef = useRef(null);
    const progressTimerRef = useRef(null);
  
    // State for isSpeaking or not
    const [isSpeaking, setIsSpeaking] = useState(false);
  
    //const videos=global1.videos1;
  
    const videos=videostoadd.concat(global1.videos1);
  
    const Controls = () => {
      const { zoomIn, zoomOut, resetTransform } = useControls();
  
      return (
        <div className="tools">
          <button onClick={() => zoomIn()}>+</button>
          <button onClick={() => zoomOut()}>-</button>
          <button onClick={() => resetTransform()}>x</button>
        </div>
      );
    };
  
    // Load available voices
    useEffect(() => {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(availableVoices[0]);
        }
      };
  
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }, [selectedVoice]);
  
    // Handle progress and automatic progression
    useEffect(() => {
      let timer;
      if (isPlaying) {
        timer = setInterval(() => {
          setProgress((prevProgress) => {
            const newProgress = prevProgress + 1;
            if (newProgress >= videos[currentIndex].duration) {
              clearInterval(timer);
              handleNext();
            }
            return Math.min(newProgress, videos[currentIndex].duration);
          });
        }, 1000);
      } else if (playerRef.current) {
        setProgress(playerRef.current.getCurrentTime());
      }
  
      return () => clearInterval(timer);
    }, [isPlaying, currentIndex]);
  
    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (event) => {
        switch (event.key) {
          case "ArrowLeft":
            handlePrevious();
            break;
          case "ArrowRight":
            handleNext();
            break;
          case " ":
            handlePlayPause();
            break;
          default:
            break;
        }
      };
  
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isPlaying, currentIndex]);
  
    // Handle content transitions
    useEffect(() => {
      if (transitioning) {
        const timer = setTimeout(() => {
          setTransitioning(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [transitioning]);
  
    useEffect(() => {
      setProgress(0);
      setIsPlaying(true);
    }, [currentIndex]);
  
    useEffect(() => {
      // Speak when the video data changes, except for video types
      if (
        selectedVoice &&
        videos[currentIndex].voicetext &&
        videos[currentIndex].type !== "video"
      ) {
        speakText(videos[currentIndex].voicetext);
      }
      // Stop speech when the component is unmounted or video changes
      return () => cancelSpeech();
    }, [currentIndex]);
  
    useEffect(() => {
      return () => {
        cancelSpeech();
        setIsPlaying(false);
      };
    }, []);
  
    // Cleanup on component unmount or page refresh
    useEffect(() => {
      console.log(progressTimerRef, "progressTimer");
      return () => {
        cancelSpeech();
        setIsPlaying(false);
        clearInterval(progressTimerRef.current);
      };
    }, []);
  
    const handlePlayPause = () => {
      if (isPlaying) {
        setIsPlaying(false);
        cancelSpeech(); // Cancel speech when pausing
      } else {
        cancelSpeech(); // Cancel speech when playing
        setIsPlaying(true); // Resume video playback
      }
    };
  
    const handleNext = () => {
      if (currentIndex < videos.length - 1) {
        setTransitioning(true);
        setTimeout(() => {
          cancelSpeech();
          setCurrentIndex((prev) => prev + 1);
          setProgress(0);
          setTransitioning(false);
        }, 600); // Match this duration with the CSS animation duration
      } else {
        setIsPlaying(false);
      }
    };
  
    const handlePrevious = () => {
      if (currentIndex > 0) {
        setTransitioning(true);
        setTimeout(() => {
          cancelSpeech();
          setCurrentIndex((prev) => prev - 1);
          setProgress(0);
          setTransitioning(false);
        }, 600); // Match this duration with the CSS animation duration
      }
    };
  
    const handleProgressChange = (event, newValue) => {
      setProgress(newValue);
      if (playerRef.current) {
        playerRef.current.seekTo(
          newValue / videos[currentIndex].duration,
          "fraction"
        );
      }
    };
  
    const formatDuration = (duration) => {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor(duration % 60);
      return `${hours > 0 ? `${hours}:` : ""}${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };
  
    const renderContent = useCallback(() => {
      const { video, image, title, type } = videos[currentIndex];
      const contentClasses = transitioning
        ? `${styles.flipOut}` // You can switch this to slideOut or zoomOut for different effects
        : `${styles.flipIn}`; // You can switch this to slideIn or zoomIn for different effects
  
      switch (type) {
        case "video":
          return (
            <Box className={`${styles.videoContainer} ${contentClasses}`}>
              <ReactPlayer
                url={video}
                playing={isPlaying}
                className={styles.videoPlayer}
                ref={playerRef}
                onProgress={({ playedSeconds }) => {
                  if (isPlaying) setProgress(playedSeconds);
                }}
              />
            </Box>
          );
        case "text-image":
          return (
            <Box className={`${styles.videoContainer} ${contentClasses}`}>
              <Box className={`${styles.textOverlay} ${contentClasses}`}>
                {title}
                {/* {speechSupported && (
                  <Box className={styles.voiceControls}>
                    <FormControl className={styles.voiceSelect}>
                      <InputLabel>Voice</InputLabel>
                      <Select
                        value={selectedVoice ? selectedVoice.name : ""}
                        onChange={(e) => {
                          const voice = voices.find(
                            (v) => v.name === e.target.value
                          );
                          setSelectedVoice(voice);
                        }}
                      >
                        {voices.map((voice) => (
                          <MenuItem key={voice.name} value={voice.name}>
                            {voice.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton
                      className={styles.speakButton}
                      onClick={() => speakText(videos[currentIndex].voicetext)}
                    >
                      <KeyboardVoiceIcon />
                    </IconButton>
                  </Box>
                )} */}
              </Box>
              {image && (
                <img
                  src={image}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                  alt="content"
                />
              )}
            </Box>
          );
        case "image":
          return (
            <Box className={`${styles.videoContainer} ${contentClasses}`}>
              <TransformWrapper initialScale={0.9}>
                {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                  <>
                    <Box className={`${styles.textOverlay} ${contentClasses}`}>
                      <Controls />
                    </Box>
                    <TransformComponent>
                      <img
                        src={image}
                        style={{
                          display: "block",
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                        alt="content"
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </Box>
          );
        case "text":
          return (
            <Box className={`${styles.textContent} ${contentClasses}`}>
              {speechSupported && (
                <Box>
                  <Typography variant="body1">{title}</Typography>
                  {/* <Box className={styles.voiceControls}>
                    <FormControl className={styles.voiceSelect}>
                      <InputLabel>Voice</InputLabel>
                      <Select
                        value={selectedVoice ? selectedVoice.name : ""}
                        onChange={(e) => {
                          const voice = voices.find(
                            (v) => v.name === e.target.value
                          );
                          setSelectedVoice(voice);
                        }}
                      >
                        {voices.map((voice) => (
                          <MenuItem key={voice.name} value={voice.name}>
                            {voice.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton
                      className={styles.speakButton}
                      onClick={() => speakText(videos[currentIndex].voicetext)}
                    >
                      <KeyboardVoiceIcon />
                    </IconButton>
                  </Box> */}
                </Box>
              )}
            </Box>
          );
        default:
          return null;
      }
    }, [
      currentIndex,
      transitioning,
      isPlaying,
      speechSupported,
      voices,
      selectedVoice,
    ]);
  
    const speakText = (text) => {
      if (
        speechSupported &&
        selectedVoice &&
        videos[currentIndex].type !== "video"
      ) {
        cancelSpeech(); // Cancel any ongoing speech
  
        const chunkSize = 500;
        let start = 0;
  
        const speakNextChunk = () => {
          if (start >= text.length) return;
  
          const chunk = text.slice(start, start + chunkSize);
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.voice = selectedVoice;
  
          utterance.onend = () => {
            start += chunkSize;
            speakNextChunk();
          };
  
          window.speechSynthesis.speak(utterance);
          setIsSpeaking(true);
        };
  
        speakNextChunk();
      }
    };
  
    // Cancel function for remove speech
    const cancelSpeech = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  
    // const getlink=()=> {
    //   return 'https://campus.technology/videoshare/' + global1.videoid;
    // }
  
    return (
      <Box className={styles.container} sm={12} md={8}>
        <Box
          sx={{
            height: "522px",
            backgroundColor: "black",
            color: "#fff",
            borderRadius: "5px",
          }}
        >
          {renderContent()}
        </Box>
        {/* <Box className={styles.containerContent}>
          {videos[currentIndex].voicetext}
        </Box> */}
        <Slider
          className={styles.progressSlider}
          value={progress}
          min={0}
          max={videos[currentIndex].duration}
          onChange={handleProgressChange}
          disabled={!isPlaying}
        />
        <Box className={styles.handlerWrapper}>
          <Box className={styles.controlPanel}>
            <IconButton onClick={handlePrevious} className={styles.prevButton}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={handlePlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={handleNext} className={styles.nextButton}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Typography className={styles.durationText}>
            {formatDuration(progress)} /{" "}
            {formatDuration(videos[currentIndex].duration)}
          </Typography>
        </Box>
        {/* <Box>
          <FormControl className={styles.voiceSelect}>
            <InputLabel>Voice</InputLabel>
            <Select
              value={selectedVoice ? selectedVoice.name : ""}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                setSelectedVoice(voice);
              }}
            >
              {voices.map((voice) => (
                <MenuItem key={voice.name} value={voice.name}>
                  {voice.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box> */}
        {speechSupported && (
          <Box className={styles.voiceControls}>
            <FormControl className={styles.voiceSelect}>
              <InputLabel>Voice</InputLabel>
              <Select
                value={selectedVoice ? selectedVoice.name : ""}
                onChange={(e) => {
                  const voice = voices.find((v) => v.name === e.target.value);
                  setSelectedVoice(voice);
                }}
              >
                {voices.map((voice) => (
                  <MenuItem key={voice.name} value={voice.name}>
                    {voice.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              className={styles.speakButton}
              onClick={() => speakText(videos[currentIndex].voicetext)}
            >
              <KeyboardVoiceIcon />
            </IconButton>
          </Box>
        )}
        <Box>
          <br />
          Share link &nbsp;&nbsp;
          <a href="#" target="_blank">
            getlink
          </a>
        </Box>
      </Box>
    );
  };
  
  export default VideoPage;
  