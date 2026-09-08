import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Grid, Paper, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AlumniNavbards from '../../components/Alumni/AlumniNavbards';
import global1 from '../global1';
import ep1 from '../../api/ep1';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const AlumniDocumentsds = () => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await ep1.post('/api/v2/alumnidocumentsds/mydocuments', {
        colid: global1.colid,
        email: global1.user
      });
      setDocs(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await ep1.get('/api/v2/alumnidocumentsds/delete', {
        params: {
          id,
          colid: global1.colid,
          email: global1.user
        }
      });
      fetchDocs();
      alert("Document deleted successfully!");
    } catch (err) {
      alert("Failed to delete document");
      console.error(err);
    }
  };

  return (
    <>
      <AlumniNavbards />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)', color: 'white', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InsertDriveFileIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                My Documents
              </Typography>
              <Typography variant="body1">
                Access your uploaded documents
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {docs.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ fontSize: 40, color: '#f57c00', mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {doc.documentName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doc.documentType || 'Document'}
                    </Typography>
                  </Box>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(doc._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {doc.description || 'No description available'}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  href={doc.fileUrl}
                  target="_blank"
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  View Document
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {docs.length === 0 && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No documents available
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default AlumniDocumentsds;
