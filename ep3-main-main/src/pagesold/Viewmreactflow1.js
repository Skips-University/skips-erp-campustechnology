import React, { useState, useEffect, useRef, useCallback } from "react";
import ep1 from '../api/ep1';
import global1 from './global1';
import ReactPlayer from "react-player/lazy";
import {
  Box,
  Button,
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

import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import styles from "./Video2.module.css";
import { useNavigate } from 'react-router-dom';



const videos2 = [
//   {
//     video: "https://www.youtube.com/watch?v=CrHeuJqkJX4",
//     image: "",
//     title: "Learning...",
//     voicetext: "New Product Launch | Teaser",
//     duration: 23,
//     type: "video",
//   },
//   {
//     video: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
//     image: "",
//     title: "Text is not able to see.",
//     voicetext: "Sintel | Halina Reijn | Thom Hoffman",
//     duration: 52,
//     type: "video",
//   },
//   {
//     video: "https://www.youtube.com/watch?v=I9tGP4z7ETQ",
//     image: "",
//     title: "This video created by campus technology.",
//     voicetext:
//       "An Initiative By Campus.Technology | www.campus.technology | Suman Nandy",
//     duration: 49,
//     type: "video",
//   },
//   {
//     video: "",
//     image:
//       "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg5tBCXngoqUVlR4bwi619gquT3UtCHBSffOQ2EM5rWr4Zh3Ht9XoCqMgnrN7FC2FzupYHuj3UhIhf_oz0rglhGt0UcFzcVgJV0Hg6ANOYWqAt0ubOc1AGJ7AXJqQ5p8cADuwvw_fYFmd-J/s1600/learning-1959541_1920.jpg",
//       title: "Learn from here",
//       voicetext: "It's Learning images",
//     duration: 5,
//     type: "text-image",
//   },
//   {
//     video: "",
//     title: "Welcome to video page",
//     image: "",
//     voicetext: "It's text",
//     duration: 10,
//     type: "text",
//   },
//   {
//     video: "",
//     title: "Text-to-speech feature is now available on relatively any website or blog. It's a game changer that you can listen to the content instead of reading it. Especially effective for people with visual or cognitive impairments or people who are on the go. I came up with the idea to implement it for my blog, so this is how I started doing a research on this topic which ended up being a tutorial for you. So in this tutorial, we will go through the process of building a text-to-speech component in React. We will use the Web Speech API to implement the text-to-speech functionality.",
//     image: "",
//     voicetext: "It's second text",
//     duration: 62,
//     type: "text",
//   },
//   {
//     video: "",
//     title: "Text are not visiable",
//     image:
//       "https://th.bing.com/th/id/R.ff3a044a3fa044105293a5fd1fda1d7f?rik=QIfOnCdYyhmZSA&riu=http%3a%2f%2feducation.okfn.org%2ffiles%2f2015%2f07%2fedusoft.jpg&ehk=a33FReMH2rrdBgDFgp%2fKM0wrjqXgbgGoEi%2b5vtu0toE%3d&risl=&pid=ImgRaw&r=0",
//       voicetext: "It's second image",
//     duration: 10,
//     type: "image",
//   },
//   {
//     video: "",
//     title: "It is a 3rd image",
//     image:
//       "https://opensource.com/sites/default/files/lead-images/computer_desk_home_laptop_browser.png",
//       voicetext: "It's third image",
//     duration: 10,
//     type: "image",
//   },
  {
    video: "",
    title: "Please wait while the video is loaded",
    image: "",
    voicetext: "Please wait while the video is loaded",
    duration: 8,
    type: "text",
  },
];

const VideoPage = () => {
    const navigate = useNavigate();
 

  const edges = [
    { id: '1-2', source: '1', target: '2', label: 'to the', type: 'step' },
  ];
   
  const nodes = [
    {
      id: '1',
      data: { label: 'Hello' },
      position: { x: 0, y: 0 },
      type: 'input',
    },
    {
      id: '2',
      data: { label: 'World' },
      position: { x: 100, y: 100 },
    },
  ];

  return (
    
    <div style={{ height: '600px', width: '600px', padding: 40 }}>
    <ReactFlow nodes={nodes} edges={edges}>
      <Background />
      <Controls />
    </ReactFlow>
  </div>
  );
};

export default VideoPage;
