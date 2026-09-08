import React from 'react';
import { Card, CardContent, Typography, Accordion, AccordionSummary, AccordionDetails, Container, Box, CardMedia } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AcademicAuditInfo = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
        
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Academic and Administrative Audit (AAA)
          </Typography>
          <Typography variant="body1" paragraph>
            Academic and Administrative Audit (AAA) is a structured internal or external mechanism used in Indian educational institutions to assess and enhance the academic and administrative performance. It ensures accountability, quality assurance, and continuous improvement aligned with the standards of regulatory bodies like NAAC and UGC.
          </Typography>
        </CardContent>
      </Card>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Benefits of Academic and Administrative Audit
        </Typography>

          <CardMedia
          component="img"
          height="180"
          image="https://images.unsplash.com/photo-1581091215367-3a89e0f665d3?auto=format&fit=crop&w=1200&q=80"
          alt="Team meeting"
          sx={{ my: 2, borderRadius: 2 }}
        />

        {[
          {
            title: 'Quality Enhancement',
            detail:
              'Helps identify strengths and areas for improvement in teaching, learning, research, and administration.',
          },
          {
            title: 'Regulatory Compliance',
            detail:
              'Ensures compliance with accreditation and quality standards set by NAAC, UGC, and other bodies.',
          },
          {
            title: 'Performance Benchmarking',
            detail:
              'Provides a framework for comparing institutional performance against national or global standards.',
          },
          {
            title: 'Strategic Planning',
            detail:
              'Supports evidence-based decision making for future development and resource allocation.',
          },
          {
            title: 'Transparency and Accountability',
            detail:
              'Promotes a culture of responsibility and documentation across academic and administrative units.',
          },
          {
            title: 'Stakeholder Confidence',
            detail:
              'Improves confidence among students, parents, and employers by showing commitment to quality education.',
          },
        ].map((item, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{item.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{item.detail}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default AcademicAuditInfo;
