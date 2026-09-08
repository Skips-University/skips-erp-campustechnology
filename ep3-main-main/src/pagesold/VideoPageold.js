import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player/lazy";
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
import styles from "./Video2.module.css";

const videos = [
  {
    video: "https://www.youtube.com/watch?v=CrHeuJqkJX4",
    image: "",
    text: "Learning...",
    content: "New Product Launch | Teaser",
    duration: 23,
    type: "video",
  },
  {
    video: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    image: "",
    text: "Text is not able to see.",
    content: "Sintel | Halina Reijn | Thom Hoffman",
    duration: 52,
    type: "video",
  },
  {
    video: "https://www.youtube.com/watch?v=I9tGP4z7ETQ",
    image: "",
    text: "This video created by campus technology.",
    content:
      "An Initiative By Campus.Technology | www.campus.technology | Suman Nandy",
    duration: 49,
    type: "video",
  },
  {
    video: "",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5tBCXngoqUVlR4bwi619gquT3UtCHBSffOQ2EM5rWr4Zh3Ht9XoCqMgnrN7FC2FzupYHuj3UhIhf_oz0rglhGt0UcFzcVgJV0Hg6ANOYWqAt0ubOc1AGJ7AXJqQ5p8cADuwvw_fYFmd-J/s1600/learning-1959541_1920.jpg",
    text: "Learn from here",
    content: "It's Learning images",
    duration: 5,
    type: "text-image",
  },
  {
    video: "",
    text: "Welcome to video page",
    image: "",
    content: "It's text",
    duration: 10,
    type: "text",
  },
  {
    video: "",
    text: "Text-to-speech feature is now available on relatively any website or blog. It's a game changer that you can listen to the content instead of reading it. Especially effective for people with visual or cognitive impairments or people who are on the go. I came up with the idea to implement it for my blog, so this is how I started doing a research on this topic which ended up being a tutorial for you. So in this tutorial, we will go through the process of building a text-to-speech component in React. We will use the Web Speech API to implement the text-to-speech functionality.",
    image: "",
    content: "It's second text",
    duration: 62,
    type: "text",
  },
  {
    video: "",
    text: "Text are not visiable",
    image:
      "https://th.bing.com/th/id/R.ff3a044a3fa044105293a5fd1fda1d7f?rik=QIfOnCdYyhmZSA&riu=http%3a%2f%2feducation.okfn.org%2ffiles%2f2015%2f07%2fedusoft.jpg&ehk=a33FReMH2rrdBgDFgp%2fKM0wrjqXgbgGoEi%2b5vtu0toE%3d&risl=&pid=ImgRaw&r=0",
    content: "It's second image",
    duration: 10,
    type: "image",
  },
  {
    video: "",
    text: "It is a 3rd image",
    image:
      "https://opensource.com/sites/default/files/lead-images/computer_desk_home_laptop_browser.png",
    content: "It's third image",
    duration: 10,
    type: "image",
  },
  {
    video: "",
    text: "Let start from here second slide",
    image: "",
    content: "It's third text",
    duration: 8,
    type: "text",
  },
];

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

  // Handle text-to-speech
  useEffect(() => {
    if (speechSupported) {
      cancelSpeech();
      if (
        videos[currentIndex].type === "text" ||
        videos[currentIndex].type === "text-image" ||
        videos[currentIndex].type === "image"
      ) {
        handleSpeakText();
      }
    }
  }, [currentIndex, selectedVoice, speechSupported]);

  // Handle content transitions
  useEffect(() => {
    if (transitioning) {
      const timer = setTimeout(() => {
        setTransitioning(false);
      }, 500); // Duration of the fade-out animation
      return () => clearTimeout(timer);
    }
  }, [transitioning]);

  useEffect(() => {
    // Reset progress when video changes
    setProgress(0);
    // setIsPlaying(true);
  }, [currentIndex]);

  // Cleanup on component unmount or page refresh
  useEffect(() => {
    console.log(progressTimerRef, "progressTimer");
    return () => {
      cancelSpeech();
      setIsPlaying(false);
      clearInterval(progressTimerRef.current);
    };
  }, []);

  const handlePlayPause = () => setIsPlaying((prev) => !prev);

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      cancelSpeech();
      setTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      cancelSpeech();
      setTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
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
    const { video, image, text, type } = videos[currentIndex];
    const contentClasses = transitioning
      ? `${styles.fadeOut}`
      : `${styles.fadeIn}`;

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
          <Box className={`${styles.textImageContent} ${contentClasses}`}>
            <Box className={`${styles.textOverlay} ${contentClasses}`}>
              {text}
              {speechSupported && (
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
                    onClick={handleSpeakText}
                  >
                    <KeyboardVoiceIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            {image && <img src={image} alt="content" />}
          </Box>
        );
      case "image":
        return (
          <Box className={`${styles.videoContainer} ${contentClasses}`}>
            <img src={image} alt="content" />
          </Box>
        );
      case "text":
        return (
          <Box className={`${styles.textContent} ${contentClasses}`}>
            {speechSupported && (
              <Box>
                <Typography variant="body1">{text}</Typography>
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
                    onClick={handleSpeakText}
                  >
                    <KeyboardVoiceIcon />
                  </IconButton>
                </Box>
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

  const handleSpeakText = useCallback(() => {
    if (speechSupported) {
      cancelSpeech();

      const text = videos[currentIndex].content;
      const chunkSize = 500;
      let start = 0;

      const speakNextChunk = () => {
        if (start >= text.length) return;

        const chunk = text.slice(start, start + chunkSize);
        const utterance = new SpeechSynthesisUtterance(chunk);
        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.onend = () => {
          start += chunkSize;
          speakNextChunk();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    }
  }, [currentIndex, selectedVoice, speechSupported]);

  const cancelSpeech = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return (
    <Box className={styles.container} sm={12} md={8}>
      <Box
        sx={{
          height: "652px",
          backgroundColor: "black",
          color: "#fff",
          borderRadius: "5px",
        }}
      >
        {renderContent()}
      </Box>
      <Box className={styles.containerContent}>
        {videos[currentIndex].content}
      </Box>
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
    </Box>
  );
};

export default VideoPage;
