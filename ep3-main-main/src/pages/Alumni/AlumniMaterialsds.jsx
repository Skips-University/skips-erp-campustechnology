import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardContent, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material';
import AlumniNavbards from '../../components/Alumni/AlumniNavbards';
import global1 from '../global1';
import ep1 from '../../api/ep1';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const AlumniMaterialsds = () => {
  const [materials, setMaterials] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    fileUrl: '', 
    type: '', 
    category: '', 
    department: '', 
    description: '' 
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await ep1.post('/api/v2/alumnimaterialsds/mymaterials', {
        colid: global1.colid,
        email: global1.user
      });
      setMaterials(res.data);
    } catch (err) {
      console.error("Failed to fetch materials", err);
    }
  };

  const handleUpload = async () => {
    try {
      await ep1.post('/api/v2/alumnimaterialsds/upload', {
        colid: global1.colid,
        email: global1.user,
        ...formData
      });
      setOpen(false);
      setFormData({ title: '', fileUrl: '', type: '', category: '', department: '', description: '' });
      fetchMaterials();
      alert("Material uploaded successfully!");
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await ep1.get('/api/v2/alumnimaterialsds/delete', {
        params: {
          id,
          colid: global1.colid,
          email: global1.user
        }
      });
      fetchMaterials();
      alert("Material deleted successfully!");
    } catch (err) {
      alert("Failed to delete material");
      console.error(err);
    }
  };

  return (
    <>
      <AlumniNavbards />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LibraryBooksIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Learning Materials
                </Typography>
                <Typography variant="body1">
                  Share and access educational resources
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setOpen(true)}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                background: 'white',
                color: '#2e7d32',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                }
              }}
            >
              Upload Material
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material._id}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)' 
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {material.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                    {material.type || 'Document'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {material.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Category: {material.category || 'General'}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Downloads: {material.downloadCount || 0}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      href={material.fileUrl}
                      target="_blank"
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      View Material
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(material._id)}
                      sx={{ borderRadius: 2 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {materials.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, mt: 3, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No materials uploaded yet
            </Typography>
          </Paper>
        )}

        <Dialog 
          open={open} 
          onClose={() => setOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
            Upload Material
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="File URL"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder="https://example.com/file.pdf"
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Type (PDF/PPT/DOC)"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpen(false)} 
              sx={{ textTransform: 'none', fontWeight: 600, color: '#666' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleUpload}
              sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AlumniMaterialsds;
