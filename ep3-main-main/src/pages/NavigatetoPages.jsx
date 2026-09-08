import { Box, Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const NavigatetoPages = () => {
    const navigate = useNavigate();
  return (
    <Box>
      <Button
       variant="contained" color="primary" fullWidth
       onClick={()=> navigate("/setuppage")}
      >Go to Setup Page</Button>
      <Button
       variant="contained" color="primary" fullWidth
       onClick={()=> navigate("/leavespage")}
      >Go to Leave Page</Button>
    </Box>
  )
}

export default NavigatetoPages
