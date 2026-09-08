import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
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

export default function CounterFee4ReceiptView({ receipt, institution, note }) {
  const [showFeeGroup, setShowFeeGroup] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showSemester, setShowSemester] = useState(true);

  const items = useMemo(() => (receipt?.items || []).map((item, index) => ({ ...item, id: `${item.ledgerid || index}-${index}`, sl: index + 1 })), [receipt]);

  if (!receipt) return null;

  const paymentRows = [{
    id: receipt.transactionid,
    paymode: receipt.paymode || "NA",
    referenceNumber: receipt.referenceNumber || receipt.chequenumber || "NA",
    paiddate: receipt.paiddate,
    amount: receipt.totalpaid,
    paydetails: receipt.paydetails || "NA"
  }];
  const transactionRemarks = receipt.transactionremarks || receipt.remarks || "";
  const receiptDate = new Date();

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} className="no-print" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <FormControlLabel control={<Switch checked={showFeeGroup} onChange={(e) => setShowFeeGroup(e.target.checked)} />} label="Fee Group" />
          <FormControlLabel control={<Switch checked={showAddress} onChange={(e) => setShowAddress(e.target.checked)} />} label="Address" />
          <FormControlLabel control={<Switch checked={showSemester} onChange={(e) => setShowSemester(e.target.checked)} />} label="Semester" />
        </Stack>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print Receipt</Button>
      </Stack>
      <Paper
        id="counter-fee-4-receipt"
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
            p: "6mm"
          }
        }}
      >
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #counter-fee-4-receipt, #counter-fee-4-receipt * { visibility: visible; }
            #counter-fee-4-receipt { position: absolute; left: 0; top: 0; }
            .no-print { display: none !important; }
            @page { size: A4; margin: 8mm; }
            #counter-fee-4-receipt tr { page-break-inside: avoid; page-break-after: auto; }
          }
        `}</style>
        <Stack alignItems="center" spacing={0.35} sx={{ textAlign: "center", mb: 1 }}>
          {institution?.logolink && (
            <Box component="img" src={institution.logolink} alt="logo" sx={{ height: 66, objectFit: "contain" }} />
          )}
          <Typography variant="h5" fontWeight={900}>{institution?.institutionname || receipt.institution || "Institution"}</Typography>
          <Typography variant="body2">{institution?.address || ""}</Typography>
          <Typography variant="h6" fontWeight={900} sx={{ mt: 0.75 }}>Counter Fee Receipt</Typography>
        </Stack>

        <Divider sx={{ my: 1.25 }} />

        <Grid container spacing={1.2} sx={{ mb: 1.5 }}>
          <Grid item xs={12} sm={6}>
            <Typography><b>Name:</b> {receipt.student || "NA"}</Typography>
            <Typography><b>Reg No:</b> {receipt.regno || "NA"}</Typography>
            <Typography><b>Phone:</b> {receipt.phone || "NA"}</Typography>
            {showSemester && <Typography><b>Semester:</b> {receipt.semester || "NA"}</Typography>}
            <Typography><b>Admission Year:</b> {receipt.admissionyear || "NA"}</Typography>
            {showAddress && <Typography><b>Address:</b> {receipt.address || "NA"}</Typography>}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><b>Receipt No:</b> {receipt.transactionid}</Typography>
            <Typography><b>Receipt Date:</b> {dateText(receiptDate)}</Typography>
            <Typography><b>Programme:</b> {receipt.program || "NA"} {receipt.programcode ? `(${receipt.programcode})` : ""}</Typography>
            <Typography><b>Section:</b> {receipt.section || "NA"}</Typography>
            <Typography><b>Academic Year:</b> {receipt.academicyear || "NA"}</Typography>
            <Typography><b>Email:</b> {receipt.email || "NA"}</Typography>
          </Grid>
        </Grid>

        <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "#c8d1de", boxShadow: "none", mb: 1.5 }}>
          <Table size="small" sx={{
            tableLayout: "fixed",
            "& th": { backgroundColor: "#eef3f8", color: "#111", fontWeight: 900, border: "1px solid #c8d1de", fontSize: 12 },
            "& td": { color: "#111", border: "1px solid #d7dee8", fontSize: 12, wordBreak: "break-word" }
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "6%" }}>#</TableCell>
                {showFeeGroup && <TableCell sx={{ width: "18%" }}>Fee Group</TableCell>}
                <TableCell>Fee Item</TableCell>
                <TableCell align="right" sx={{ width: "14%" }}>Amount</TableCell>
                <TableCell align="right" sx={{ width: "16%" }}>Previous Balance</TableCell>
                <TableCell align="right" sx={{ width: "14%" }}>Paid</TableCell>
                <TableCell align="right" sx={{ width: "14%" }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.sl}</TableCell>
                  {showFeeGroup && <TableCell>{item.feegroup || "NA"}</TableCell>}
                  <TableCell>{item.feeitem || "NA"}</TableCell>
                  <TableCell align="right">{fmt(item.amount)}</TableCell>
                  <TableCell align="right">{fmt(item.previousbalance)}</TableCell>
                  <TableCell align="right">{fmt(item.paidamount)}</TableCell>
                  <TableCell align="right">{fmt(item.newbalance)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={showFeeGroup ? 5 : 4} align="right" sx={{ fontWeight: 900 }}>Total Paid</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>{fmt(receipt.totalpaid)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography sx={{ mb: 1.25, fontWeight: 800 }}>Amount in Words: {amountInWords(receipt.totalpaid)}</Typography>

        <Typography fontWeight={900} sx={{ mb: 0.5 }}>Payment Details</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "#c8d1de", boxShadow: "none", mb: 1.5 }}>
          <Table size="small" sx={{
            "& th": { backgroundColor: "#eef3f8", color: "#111", fontWeight: 900, border: "1px solid #c8d1de", fontSize: 12 },
            "& td": { color: "#111", border: "1px solid #d7dee8", fontSize: 12, wordBreak: "break-word" }
          }}>
            <TableHead>
              <TableRow>
                <TableCell>Payment Mode</TableCell>
                <TableCell>Reference No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Pay Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.paymode}</TableCell>
                  <TableCell>{row.referenceNumber}</TableCell>
                  <TableCell>{dateText(row.paiddate)}</TableCell>
                  <TableCell align="right">{fmt(row.amount)}</TableCell>
                  <TableCell>{row.paydetails}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {transactionRemarks && (
          <Box sx={{ mb: 1.5 }}>
            <Typography fontWeight={900}>Transaction Remarks</Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{transactionRemarks}</Typography>
          </Box>
        )}

        {note?.note && (
          <Box sx={{ mt: 1.5, border: "1px solid #d7dee8", borderRadius: 1, p: 1.25 }}>
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
