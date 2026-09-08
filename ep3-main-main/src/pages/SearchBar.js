import React from 'react';
import { TextField, Box } from '@mui/material';

const SearchBar = ({ setSearchQuery }) => {
  const handleChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Box my={2}>
      <TextField
        fullWidth
        label="Search"
        variant="outlined"
        onChange={handleChange}
      />
    </Box>
  );
};

export default SearchBar;
