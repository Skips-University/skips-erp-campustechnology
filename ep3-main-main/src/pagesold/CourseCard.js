// import React from 'react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent,CardMedia, Typography, CardActions, Button } from '@mui/material';
import "./TwoLineText.css";

const CourseCard = ({ course }) => {

    const getRandomImageUrl = () => {
  const width = 300;
  const height = 150;
  const icons=[46,1,30,32,33,34,35,38,36,37,39,41,42,43,44,46,47,48,49,50,51,52,53,54,55,57,58,59];
  const index = Math.floor(Math.random() * icons.length);
  const seed = Math.floor(Math.random() * 1000); // Add randomness to prevent caching
//   return `https://picsum.photos/seed/${seed}/${width}/${height}`;
return `https://picsum.photos/id/${icons[index]}/${width}/${height}`;
};
const [imageUrl, setImageUrl] = useState(getRandomImageUrl());

  return (
    <Card>
      <CardContent>
         <CardMedia
        component="img"
        height="150"
        image={imageUrl}
        alt="Random"
      />
      <br /><br />
        <Typography variant="h6">
            {/* {course.testc} */}
             <div className="two-line-wrapper">
      <div className="two-line-text">{course.testc}</div>
    </div>
            </Typography>
        <Typography variant="body2" color="textSecondary">
          {/* {course.description} */}
          <div className="two-line-wrapper">
      <div className="two-line-text">{course.description}</div>
    </div>
        </Typography>
      </CardContent>
      {/* <CardActions>
        <Button size="small" href={course.level} target="_blank">
          Learn More
        </Button>
      </CardActions> */}
    </Card>
  );
};

export default CourseCard;
