import React from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { amountInWords } from "./feesReceiptUtils";

const fmt = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateText = (value) => value ? new Date(value).toLocaleDateString("en-IN") : "";

export default function CounterFee2ReceiptView({ receipt, institution, note }) {
  if (!receipt) return null;
  const items = (receipt.items || []).map((item, index) => ({ ...item, id: `${item.ledgerid || index}-${index}`, sl: index + 1 }));

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" className="no-print" sx={{ mb: 1 }}>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print Receipt</Button>
      </Stack>
      <Paper
        id="counter-fee-2-receipt"
        sx={{
          p: 2.5,
          maxWidth: 900,
          mx: "auto",
          color: "#111",
          overflow: "hidden",
          "@media print": {
            boxShadow: "none",
            width: "190mm",
            maxWidth: "190mm",
            minHeight: "auto",
            p: "6mm"
          }
        }}
      >
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #counter-fee-2-receipt, #counter-fee-2-receipt * { visibility: visible; }
            #counter-fee-2-receipt { position: absolute; left: 0; top: 0; }
            .no-print { display: none !important; }
            @page { size: A4; margin: 8mm; }
            #counter-fee-2-receipt table { page-break-inside: auto; }
            #counter-fee-2-receipt tr { page-break-inside: avoid; page-break-after: auto; }
          }
        `}</style>
        <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 1 }}>
          {institution?.logolink && (
            <Box component="img" src={institution.logolink} alt="logo" sx={{ height: 72, objectFit: "contain" }} />
          )}
          <Typography variant="h5" fontWeight={900}>{institution?.institutionname || receipt.institution || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>Counter Fee Receipt</Typography>
        </Stack>

        <Divider sx={{ my: 1.5 }} />
        <Grid container spacing={1.2} sx={{ mb: 1.5 }}>
          <Grid item xs={12} sm={6}><Typography><b>Transaction ID:</b> {receipt.transactionid}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Payment Date:</b> {dateText(receipt.paiddate)}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Reference No:</b> {receipt.referenceNumber || receipt.chequenumber || receipt.paydetails || "NA"}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Mode:</b> {receipt.paymode || "NA"}</Typography></Grid>
          {receipt.chequenumber && <Grid item xs={12} sm={6}><Typography><b>Cheque No:</b> {receipt.chequenumber}</Typography></Grid>}
          {receipt.paydetails && <Grid item xs={12} sm={6}><Typography><b>Pay Details:</b> {receipt.paydetails}</Typography></Grid>}
        </Grid>

        <Box sx={{ border: "1px solid #d7dee8", borderRadius: 1, p: 1.5, mb: 1.5 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><b>Student:</b> {receipt.student}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><b>Reg No:</b> {receipt.regno}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><b>Email:</b> {receipt.email || "NA"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><b>Phone:</b> {receipt.phone || "NA"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><b>Program:</b> {receipt.program || "NA"} {receipt.programcode ? `(${receipt.programcode})` : ""}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><b>Academic Year:</b> {receipt.academicyear || "NA"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><b>Regulation:</b> {receipt.regulation || "NA"}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><b>Semester:</b> {receipt.semester || "NA"} {receipt.section ? ` | Section ${receipt.section}` : ""}</Typography></Grid>
            <Grid item xs={12}><Typography><b>Address:</b> {receipt.address || "NA"}</Typography></Grid>
          </Grid>
        </Box>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            borderColor: "#c8d1de",
            boxShadow: "none",
            overflowX: "hidden",
            "@media print": {
              width: "100%",
              overflow: "visible"
            }
          }}
        >
          <Table
            size="small"
            sx={{
              tableLayout: "fixed",
              width: "100%",
              "& th": {
                backgroundColor: "#eef3f8",
                color: "#111",
                fontWeight: 900,
                border: "1px solid #c8d1de",
                fontSize: 12,
                lineHeight: 1.25,
                px: 0.75,
                py: 0.75
              },
              "& td": {
                color: "#111",
                border: "1px solid #d7dee8",
                fontSize: 12,
                lineHeight: 1.25,
                px: 0.75,
                py: 0.65,
                verticalAlign: "top",
                wordBreak: "break-word"
              },
              "@media print": {
                "& th, & td": {
                  fontSize: 10.5,
                  px: 0.45,
                  py: 0.45
                }
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "5%" }}>#</TableCell>
                <TableCell sx={{ width: "16%" }}>Fee Group</TableCell>
                <TableCell sx={{ width: "23%" }}>Fee Item</TableCell>
                <TableCell align="right" sx={{ width: "13%" }}>Amount</TableCell>
                <TableCell align="right" sx={{ width: "16%" }}>Previous Balance</TableCell>
                <TableCell align="right" sx={{ width: "13%" }}>Paid</TableCell>
                <TableCell align="right" sx={{ width: "14%" }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.sl}</TableCell>
                  <TableCell>{item.feegroup || "NA"}</TableCell>
                  <TableCell>{item.feeitem || "NA"}</TableCell>
                  <TableCell align="right">{fmt(item.amount)}</TableCell>
                  <TableCell align="right">{fmt(item.previousbalance)}</TableCell>
                  <TableCell align="right">{fmt(item.paidamount)}</TableCell>
                  <TableCell align="right">{fmt(item.newbalance)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 900 }}>Total Paid</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>{fmt(receipt.totalpaid)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
          <Typography variant="h6" fontWeight={900}>Total Paid: Rs. {fmt(receipt.totalpaid)}</Typography>
        </Stack>
        <Typography sx={{ mt: 0.75, fontWeight: 800 }}>Amount in Words: {amountInWords(receipt.totalpaid)}</Typography>

        {note?.note && (
          <Box sx={{ mt: 2, border: "1px solid #d7dee8", borderRadius: 1, p: 1.25 }}>
            <Typography fontWeight={900}>Note</Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{note.note}</Typography>
          </Box>
        )}

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={4}><Typography sx={{ borderTop: "1px solid #111", pt: 0.5, textAlign: "center" }}>Prepared By</Typography></Grid>
          <Grid item xs={4}><Typography sx={{ borderTop: "1px solid #111", pt: 0.5, textAlign: "center" }}>Checked By</Typography></Grid>
          <Grid item xs={4}><Typography sx={{ borderTop: "1px solid #111", pt: 0.5, textAlign: "center" }}>Authorized Signatory</Typography></Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
