import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, Paper, Chip, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import StudentNavbards from '../../components/Student/StudentNavbards';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ep1 from '../../api/ep1';
import global1 from '../global1';

const StudentMaterialsLibraryds = () => {
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filteredMaterials, setFilteredMaterials] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    let filtered = materials;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(material => 
        material.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'All') {
      filtered = filtered.filter(material => material.type === filterType);
    }

    setFilteredMaterials(filtered);
  }, [searchQuery, filterType, materials]);

  const fetchMaterials = async () => {
    try {
      const res = await ep1.post('/api/v2/alumnimaterialsds/list', {
        colid: global1.colid
      });
      setMaterials(res.data);
      setFilteredMaterials(res.data);
    } catch (err) {
      console.error("Failed to fetch materials", err);
    }
  };

  const handleDownload = async (materialId, fileUrl) => {
    try {
      // Track download
      await ep1.post('/api/v2/alumnimaterialsds/download', {
        id: materialId,
        colid: global1.colid
      });
      
      // Open material in new tab
      window.open(fileUrl, '_blank');
    } catch (err) {
      console.error("Failed to track download", err);
      // Still open the file even if tracking fails
      window.open(fileUrl, '_blank');
    }
  };

  const uniqueTypes = ['All', ...new Set(materials.map(m => m.type).filter(Boolean))];

  return (
    <>
      <StudentNavbards />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LibraryBooksIcon sx={{ fontSize: 50, mr: 2 }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                Materials Library
              </Typography>
              <Typography variant="h6">
                Access learning resources shared by alumni
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search materials by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter by Type"
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {uniqueTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {filteredMaterials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material._id}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {material.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                    {material.description || 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {material.type && <Chip label={material.type} size="small" color="success" />}
                    {material.category && <Chip label={material.category} size="small" />}
                  </Box>

                  {material.department && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Department: {material.department}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block">
                    Downloads: {material.downloadCount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Uploaded by: {material.uploadedByName || 'Alumni'}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(material._id, material.fileUrl)}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    View Material
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredMaterials.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery || filterType !== 'All' 
                ? 'No materials found matching your criteria' 
                : 'No materials available at the moment'}
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default StudentMaterialsLibraryds;
