import React from "react";
import { Card, CardContent, Typography, Divider, Grid, Box, Button, Avatar } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import global1 from './global1';


function ViewPage() {


  const handlePrint = () => {
    window.print();
  };

  const logoURL=global1.logo;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Card sx={{ width: 500, boxShadow: 5, borderRadius: 3, p: 2 }}>
        <CardContent>
          {/* Logo and Header */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Avatar 
              src={logoURL} 
              alt="Logo" 
              variant="square" 
              sx={{ width: 80, height: 80, borderRadius: 2 }}
            />
          </Box>

          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold" }}>
            Fee Payment Receipt
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Thank you for your payment
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Receipt Details */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Receipt No:</Typography>
              <Typography variant="subtitle1" fontWeight="500">{global1.receiptnumber}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Date:</Typography>
              {/* <Typography variant="subtitle1" fontWeight="500">{global1.paydate}</Typography> */}
              <Typography variant="subtitle1" fontWeight="500">
  {new Date(global1.paydate).toLocaleString("en-GB", { 
    day: "2-digit", month: "2-digit", year: "numeric", 
    hour: "2-digit", minute: "2-digit", hour12: false 
  })}
</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Student Name:</Typography>
              <Typography variant="subtitle1" fontWeight="500">{global1.studentname}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Reg no:</Typography>
              <Typography variant="subtitle1" fontWeight="500">{global1.regno}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Payment Mode:</Typography>
              <Typography variant="subtitle1" fontWeight="500">{global1.paymode}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Amount Paid:</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                ₹ {global1.amount.toLocaleString()}
              </Typography>
            </Grid>


             <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Fee Group:</Typography>
              <Typography variant="subtitle1" fontWeight="500">{global1.feegroup}</Typography>
            </Grid>
             <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Fee Item:</Typography>
              <Typography variant="subtitle1" fontWeight="500">{global1.feeitem}</Typography>
            </Grid>
          </Grid>

          

          <Divider sx={{ my: 3 }} />

          {/* Signature Section */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", flexDirection: "column", alignItems: "flex-end" }}>
            {/* <Avatar 
              src={signatureUrl} 
              alt="Signature" 
              variant="square" 
              sx={{ width: 120, height: 40, mb: 1, borderRadius: 1 }}
            /> */}
            <Typography variant="subtitle2" fontWeight="500">Computer generated, Signature not required</Typography>
          </Box>

          {/* Print Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Print Receipt
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ViewPage;
