import React from 'react';
import { Box, Typography, Link, Grid } from '@mui/material';

const navLinks = [
  { label: 'Home', href: '/' },
//   { label: 'About', href: '/about' },
  { label: 'Certification', href: '/Courseall' },
//   { label: 'Contact', href: '/contact' },
];

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 4,
        px: 2,
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Grid container spacing={4} justifyContent="space-between">
        {/* Branding Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            AI Mentor
          </Typography>
          <Typography variant="body2">
            Empowering your mind with AI challenges – one hour at a time.
          </Typography>
        </Grid>

        {/* Navigation Links */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" gutterBottom>
            Navigation
          </Typography>
          {navLinks.map((link) => (
            <Typography key={link.href}>
              <Link href={link.href} underline="hover" color="inherit">
                {link.label}
              </Link>
            </Typography>
          ))}
        </Grid>
      </Grid>

      {/* Copyright */}
      <Box mt={4} textAlign="center">
        <Typography variant="caption" color="gray">
          © {new Date().getFullYear()} AI Mentor. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
