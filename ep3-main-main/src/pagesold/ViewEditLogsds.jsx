import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const ViewEditLogsds = () => {
  const { questionbankcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await ep1.get('/api/v2/getlogsbyqbcode', {
        params: {
          questionbankcode: questionbankcode,
          colid: global1.colid,
        },
      });
      setLogs(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Question Edit Logs</Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/questionbanklistds`)}
        >
          Back to Question Banks
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Alert severity="info">No edit logs found for this question bank.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {logs.map((log, index) => (
            <Card key={log._id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Edit #{index + 1}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Edited by: <strong>{log.name}</strong> ({log.user})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {formatDate(log.createdAt)}
                    </Typography>
                  </Box>
                  <Chip label={`Section ${log.section}`} color="primary" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error">
                    Previous Question:
                  </Typography>
                  <Typography variant="body2" sx={{ p: 1, bgcolor: '#ffebee', borderRadius: 1 }}>
                    {log.prevquestion}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="success">
                    Edited Question:
                  </Typography>
                  <Typography variant="body2" sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                    {log.editedquestion}
                  </Typography>
                </Box>

                {log.prevoptions && log.prevoptions.length > 0 && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="error">
                        Previous Options:
                      </Typography>
                      <Box sx={{ p: 1, bgcolor: '#ffebee', borderRadius: 1 }}>
                        {log.prevoptions.map((opt, i) => (
                          <Typography key={i} variant="body2">
                            {String.fromCharCode(65 + i)}. {opt}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="success">
                        Edited Options:
                      </Typography>
                      <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                        {log.editedoptions.map((opt, i) => (
                          <Typography key={i} variant="body2">
                            {String.fromCharCode(65 + i)}. {opt}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </>
                )}

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="subtitle2" color="error">
                      Previous Answer:
                    </Typography>
                    <Typography variant="body2" sx={{ p: 1, bgcolor: '#ffebee', borderRadius: 1 }}>
                      {log.prevanswer}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="success">
                      Edited Answer:
                    </Typography>
                    <Typography variant="body2" sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                      {log.editedanswer}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ViewEditLogsds;
