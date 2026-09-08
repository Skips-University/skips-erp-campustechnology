import React, { useState, useEffect } from "react";
import {
  Container, Typography, Card, CardContent, Box, IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import dayjs from "dayjs";

export default function FeedbackInternalResponses() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, [feedbackId]);

  const fetchResponses = async () => {
    try {
      const res = await ep1.get("/api/v2/getfeedbackinternalresponsesds", {
        params: { feedbackId, colid: global1.colid }
      });
      setResponses(res.data);
    } catch (error) {
    }
    setLoading(false);
  };

  const columns = [
    { field: "respondentname", headerName: "Name", width: 200 },
    { field: "respondentemail", headerName: "Email", width: 250 },
    { field: "respondentregno", headerName: "Reg No", width: 120 },
    { field: "programcode", headerName: "Program", width: 100 },
    { field: "coursecode", headerName: "Course", width: 100 },
    { field: "year", headerName: "Year", width: 80 },
    { field: "semester", headerName: "Sem", width: 80 },
    { 
      field: "createdAt", 
      headerName: "Submitted", 
      width: 150,
      renderCell: ({ value }) => dayjs(value).format("DD/MM/YYYY HH:mm")
    }
  ];

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
            <IconButton color="inherit" onClick={() => navigate('/feedbackinternalmanagement')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight={600}>
              👥 Internal Feedback Responses
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <DataGrid
              rows={responses}
              columns={columns}
              getRowId={(row) => row._id}
              loading={loading}
              autoHeight
              pageSizeOptions={[10, 20, 50]}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 700,
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
