import React, { useState, useEffect } from "react";
import {
  Container, Typography, Card, CardContent, Box, IconButton, 
  Accordion, AccordionSummary, AccordionDetails, Chip, Rating,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid
} from "@mui/material";
import { ArrowBack, ExpandMore, QuestionAnswer } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import dayjs from "dayjs";

export default function FeedbackInternalResponses1() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
    fetchFeedbackDetails();
  }, [feedbackId]);

  const fetchResponses = async () => {
    try {
      const res = await ep1.get("/api/v2/getfeedbackinternalresponsesds1", {
        params: { feedbackId, colid: global1.colid }
      });
      setResponses(res.data);
    } catch (error) {
    }
    setLoading(false);
  };

  const fetchFeedbackDetails = async () => {
    try {
      const res = await ep1.get("/api/v2/getsinglefeedbackinternalds1", {
        params: { feedbackId, colid: global1.colid }
      });
      setFeedbackDetails(res.data);
    } catch (error) {
    }
  };

  // Get all CO/PO mappings from all questions
  const getAllCOPOMappings = () => {
    if (!feedbackDetails?.questions) return { cos: [], pos: [] };
    
    const allCOs = new Set();
    const allPOs = new Set();
    
    feedbackDetails.questions.forEach(question => {
      if (question.co) {
        question.co.split(',').forEach(co => {
          allCOs.add(co.trim());
        });
      }
      if (question.po) {
        question.po.split(',').forEach(po => {
          allPOs.add(po.trim());
        });
      }
    });
    
    return {
      cos: Array.from(allCOs).sort(),
      pos: Array.from(allPOs).sort()
    };
  };

  // Component to render individual response details
  const ResponseDetails = ({ response }) => {
    const { responses: regularResponses, coratings, poratings } = response;

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
          📝 Response Details for {response.respondentname}
        </Typography>

        {/* Auto-Generated CO/PO Rating Summary */}
        {((coratings && Object.keys(coratings).length > 0) || (poratings && Object.keys(poratings).length > 0)) && (
          <Card sx={{ mb: 3, backgroundColor: '#f0f8ff', border: '2px solid #2196f3' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="primary.main">
                🎯 Auto-Generated CO/PO Ratings (from question responses)
              </Typography>
              
              <Grid container spacing={2}>
                {/* CO Ratings */}
                {coratings && Object.keys(coratings).length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1} color="primary.main">
                      Course Outcome Ratings:
                    </Typography>
                    {Object.entries(coratings).map(([co, rating]) => (
                      <Box key={co} display="flex" alignItems="center" gap={2} mb={1}>
                        <Chip label={co} size="small" color="primary" />
                        <Rating value={rating} readOnly size="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {rating}/5
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}
                
                {/* PO Ratings */}
                {poratings && Object.keys(poratings).length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1} color="secondary.main">
                      Program Outcome Ratings:
                    </Typography>
                    {Object.entries(poratings).map(([po, rating]) => (
                      <Box key={po} display="flex" alignItems="center" gap={2} mb={1}>
                        <Chip label={po} size="small" color="secondary" />
                        <Rating value={rating} readOnly size="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {rating}/5
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}
              </Grid>
              
              <Typography variant="caption" color="text.secondary" mt={2} display="block">
                💡 These CO/PO ratings are automatically generated from the user's question ratings
              </Typography>
            </CardContent>
          </Card>
        )}
        
        {/* Individual Question Responses */}
        <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', mb: 2 }}>
          📋 Individual Question Responses
        </Typography>
        
        {feedbackDetails?.questions?.map((question) => {
          const questionId = question._id.toString();
          const regularResponse = regularResponses?.[questionId];

          return (
            <Card key={questionId} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {question.questiontext}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`Type: ${question.questiontype}`} 
                      size="small" 
                      variant="outlined" 
                    />
                    {question.co && question.co.split(',').map(co => (
                      <Chip 
                        key={co}
                        label={`CO: ${co.trim()}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    ))}
                    {question.po && question.po.split(',').map(po => (
                      <Chip 
                        key={po}
                        label={`PO: ${po.trim()}`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Response</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          {question.questiontype === 'rating' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating 
                                value={parseInt(regularResponse) || 0} 
                                readOnly 
                                size="small" 
                              />
                              <Typography variant="body2">
                                ({regularResponse || 'No response'})
                              </Typography>
                              {((question.co && question.co.trim()) || (question.po && question.po.trim())) && (
                                <Chip 
                                  label="Used for CO/PO" 
                                  size="small" 
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2">
                              {regularResponse || 'No response'}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box 
            sx={{ 
              p: 3, 
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <IconButton color="inherit" onClick={() => navigate('/feedbackinternalmanagement1')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight={600}>
              👥 Internal Feedback Responses
            </Typography>
          </Box>
          
          {feedbackDetails && (
            <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom>
                📋 {feedbackDetails.title}
              </Typography>
              {feedbackDetails.description && (
                <Typography variant="body2" color="text.secondary">
                  {feedbackDetails.description}
                </Typography>
              )}
              
              {/* Show CO/PO Mappings */}
              <Box sx={{ mt: 2 }}>
                {(() => {
                  const { cos, pos } = getAllCOPOMappings();
                  return (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        📊 CO/PO Outcomes tracked in this feedback:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {cos.map(co => (
                          <Chip
                            key={co}
                            label={`CO: ${co}`}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {pos.map(po => (
                          <Chip
                            key={po}
                            label={`PO: ${po}`}
                            color="secondary"
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          )}
          
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              📊 Responses Overview ({responses.length} total)
            </Typography>
            
            {responses.map((response) => (
              <Accordion key={response._id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {response.respondentname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {response.respondentemail}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {response.respondentregno}
                    </Typography>
                    
                    {/* Show CO/PO rating counts */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {response.coratings && Object.keys(response.coratings).length > 0 && (
                        <Chip 
                          label={`${Object.keys(response.coratings).length} CO`}
                          size="small" 
                          color="primary"
                          variant="filled"
                        />
                      )}
                      {response.poratings && Object.keys(response.poratings).length > 0 && (
                        <Chip 
                          label={`${Object.keys(response.poratings).length} PO`}
                          size="small" 
                          color="secondary"
                          variant="filled"
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ ml: 'auto' }}>
                      <Chip 
                        label={dayjs(response.createdAt).format("DD/MM/YYYY HH:mm")} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <ResponseDetails response={response} />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
