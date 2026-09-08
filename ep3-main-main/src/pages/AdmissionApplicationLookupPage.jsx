import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";

const isPaid = (status, paidamount) => String(status || "").toUpperCase() === "SUCCESS" || Number(paidamount || 0) > 0;

export default function AdmissionApplicationLookupPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const colid = query.get("colid") || "";
  const paymentRefno = query.get("refno") || "";
  const paymentStatus = query.get("status") || "";
  const [applicationNumber, setApplicationNumber] = useState(query.get("applicationid") || "");
  const [application, setApplication] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [fields, setFields] = useState([]);
  const [formDefinition, setFormDefinition] = useState(null);
  const [applicationFee, setApplicationFee] = useState(null);
  const [provisionalFee, setProvisionalFee] = useState(null);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [selectedPaymentGatewayId, setSelectedPaymentGatewayId] = useState("");
  const [activePaymentTab, setActivePaymentTab] = useState(0);
  const [printMode, setPrintMode] = useState("application");
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (colid) {
      loadInstitution();
      loadPaymentGateways();
    }
  }, [colid]);

  const loadInstitution = async () => {
    const res = await ep1.get(`/vins?colid=${colid}`);
    setInstitution(res.data || null);
  };

  const loadPaymentGateways = async () => {
    try {
      const res = await ep1.get("/api/v2/mastergateway", { params: { colid, status: "Active" } });
      const gateways = res.data?.data || [];
      setPaymentGateways(gateways);
      const defaultGateway = gateways.find((item) => item.default === "Yes") || gateways[0];
      if (defaultGateway) setSelectedPaymentGatewayId(defaultGateway._id);
    } catch (err) {
      setPaymentGateways([]);
    }
  };

  const loadFieldsAndForm = async (item) => {
    const formid = item.formid || "default";
    const [fieldRes, formRes] = await Promise.all([
      ep1.get(`/admission-dynamic/fields?colid=${colid}&formid=${encodeURIComponent(formid)}`),
      ep1.get(`/admission-dynamic/form?colid=${colid}&formid=${encodeURIComponent(formid)}`).catch(() => ({ data: null }))
    ]);
    setFields(fieldRes.data || []);
    setFormDefinition(formRes.data || null);
  };

  const getApplicationFee = async (item) => {
    const res = await ep1.get("/api/v2/applicationfee", {
      params: { colid, academicyear: item.academicyear, programcode: item.programcode, active: "Yes" }
    });
    return (res.data?.data || []).find((fee) => Number(fee.amount || 0) > 0) || null;
  };

  const getProvisionalFee = async (item) => {
    const res = await ep1.get("/api/v2/provisionaladmissionfee", {
      params: { colid, academicyear: item.academicyear, programcode: item.programcode }
    });
    return (res.data?.data || []).find((fee) => Number(fee.amount || 0) > 0) || null;
  };

  const loadApplication = async () => {
    if (!colid || !applicationNumber.trim()) {
      setMessage("Please enter application number.");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const res = await ep1.get("/admission-dynamic/application", {
        params: { colid, id: applicationNumber.trim() }
      });
      const item = res.data;
      setApplication(item);
      await loadFieldsAndForm(item);
      const [fee, provisional] = await Promise.all([getApplicationFee(item), getProvisionalFee(item)]);
      setApplicationFee(fee);
      setProvisionalFee(provisional);
    } catch (err) {
      setApplication(null);
      setMessage(err.response?.data?.msg || "Unable to load application.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (colid && applicationNumber) {
      loadApplication();
    }
    if (paymentRefno || paymentStatus) {
      setMessage(`Payment ${paymentStatus || "status"}${paymentRefno ? ` for reference ${paymentRefno}` : ""}.`);
    }
  }, [colid, applicationNumber, paymentRefno, paymentStatus]);

  const makePayment = async (paymentKind) => {
    const selectedFee = paymentKind === "Provisional" ? provisionalFee : applicationFee;
    if (!application || !selectedFee) return;
    const selectedGateway = paymentGateways.find((item) => item._id === selectedPaymentGatewayId);
    try {
      setPaymentLoading(true);
      setMessage("");
      const applicationId = String(application._id || "").trim();
      const studentName = String(application.name || application.email || "Admission Applicant").trim();
      const feeItem = paymentKind === "Provisional" ? "Provisional Admission Fee" : "Application Fee";
      const feeAmount = Number(selectedFee.amount || 0);
      const normalizedGatewayName = String(selectedGateway?.gatewayname || "").replace(/\s|-/g, "").toLowerCase();
      const useExternalGateway = selectedGateway?.type === "External" && !normalizedGatewayName.includes("easebuzz");
      if (useExternalGateway) {
        if (!selectedGateway.externallink) {
          setMessage("Selected gateway is not configured with an external payment link.");
          return;
        }
        const params = new URLSearchParams({
          colid: String(colid),
          applicationid: applicationId,
          student: studentName,
          name: studentName,
          email: application.email || "",
          phone: application.phone || "",
          academicyear: application.academicyear || "",
          program: application.programapplied || "",
          programcode: application.programcode || "",
          feeitem: feeItem,
          amount: String(feeAmount),
          type: "Admission",
          paymentfor: paymentKind,
          gateway: selectedGateway.gatewayname || "",
          returnurl: selectedGateway.callbackurl || window.location.href
        });
        const joiner = selectedGateway.externallink.includes("?") ? "&" : "?";
        window.location.assign(`${selectedGateway.externallink}${joiner}${params.toString()}`);
        return;
      }
      const paymentEndpoint = normalizedGatewayName.includes("icici") ? "/api/v2/icicipayment/initiate" : "/api/v2/easebuzzpayment/initiate";
      const paymentResponse = await ep1.post(paymentEndpoint, {
        colid,
        user: studentName,
        name: studentName,
        student: studentName,
        regno: applicationId,
        feeitem: feeItem,
        amount: String(feeAmount),
        type: "Admission",
        paymentfor: paymentKind,
        applicationid: applicationId,
        description: `${feeItem} for ${application.programapplied || application.programcode || "Admission"}`,
        email: application.email || "",
        phone: application.phone || "",
        gateway: selectedGateway?.gatewayname || "",
        frontendcallbackurl: window.location.href
      });
      const paymentUrl =
        paymentResponse?.data?.data?.paymenturl ||
        paymentResponse?.data?.paymenturl ||
        paymentResponse?.data?.url ||
        paymentResponse?.data?.redirectUrl;
      if (paymentUrl) window.location.href = paymentUrl;
      else setMessage("Payment was initiated but payment URL was not returned.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to initiate payment.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const exportApplication = () => {
    if (!application) return;
    const data = {
      applicationid: application._id,
      academicyear: application.academicyear,
      name: application.name,
      email: application.email,
      phone: application.phone,
      program: application.programapplied,
      programcode: application.programcode,
      applicationstatus: application.applicationstatus,
      applicationfeeamount: application.applicationfeeamount,
      paymentstatus: application.paymentstatus,
      paymentrefno: application.paymentrefno,
      provisionalfeeamount: application.provisionalfeeamount,
      provisionalpaymentstatus: application.provisionalpaymentstatus,
      provisionalpaymentrefno: application.provisionalpaymentrefno,
      ...(application.extraFields || {})
    };
    const ws = XLSX.utils.json_to_sheet([data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Application");
    XLSX.writeFile(wb, `Admission_Application_${application._id}.xlsx`);
  };

  const money = (value) => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" });
  const shortDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "");
  const receiptDate = () => new Date().toLocaleDateString("en-IN");

  const buildReceiptPayment = (paymentKind) => {
    if (!application) return null;
    if (paymentKind === "Provisional") {
      return {
        paymenttype: "Provisional Fee",
        paymentstatus: application.provisionalpaymentstatus || "Paid",
        paymentrefno: application.provisionalpaymentrefno || "",
        paidamount: Number(application.provisionalpaidamount || application.provisionalfeeamount || provisionalFee?.amount || 0),
        paiddate: application.provisionalpaiddate || application.updatedAt || application.createdAt
      };
    }
    return {
      paymenttype: "Application Fee",
      paymentstatus: application.paymentstatus || "Paid",
      paymentrefno: application.paymentrefno || "",
      paidamount: Number(application.paidamount || application.applicationfeeamount || applicationFee?.amount || 0),
      paiddate: application.paiddate || application.updatedAt || application.createdAt
    };
  };

  const printReceipt = (paymentKind) => {
    const receipt = buildReceiptPayment(paymentKind);
    if (!receipt) return;
    setReceiptPayment(receipt);
    setPrintMode("receipt");
    setTimeout(() => window.print(), 100);
  };

  const printApplication = () => {
    setPrintMode("application");
    setTimeout(() => window.print(), 100);
  };

  const renderValue = (label, value) => (
    <Grid item xs={12} sm={6} md={4} key={label}>
      <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, p: 1, minHeight: 56, bgcolor: "#fff" }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>{value || "-"}</Typography>
      </Box>
    </Grid>
  );

  const renderSubjectTable = (title, rows = []) => (
    <Grid item xs={12}>
      <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
        <Typography sx={{ bgcolor: "#e2e8f0", px: 1.25, py: 0.75, fontWeight: 800 }}>{title}</Typography>
        <Grid container sx={{ bgcolor: "#f8fafc", borderTop: "1px solid #cbd5e1" }}>
          <Grid item xs={8} sx={{ px: 1.25, py: 0.75, borderRight: "1px solid #e5e7eb" }}>
            <Typography variant="caption" fontWeight={900}>Subject</Typography>
          </Grid>
          <Grid item xs={4} sx={{ px: 1.25, py: 0.75, textAlign: "right" }}>
            <Typography variant="caption" fontWeight={900}>Marks</Typography>
          </Grid>
        </Grid>
        {(rows.length ? rows : [{ subject: "-", marks: "-" }]).map((row, index) => (
          <Grid container key={`${title}-${index}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
            <Grid item xs={8} sx={{ px: 1.25, py: 0.75, borderRight: "1px solid #f1f5f9" }}>
              <Typography variant="body2">{row.subject || "-"}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ px: 1.25, py: 0.75, textAlign: "right" }}>
              <Typography variant="body2">{row.marks || "-"}</Typography>
            </Grid>
          </Grid>
        ))}
      </Box>
    </Grid>
  );

  const paymentPanel = application && (
    (applicationFee && !isPaid(application.paymentstatus, application.paidamount)) ||
    (provisionalFee && !isPaid(application.provisionalpaymentstatus, application.provisionalpaidamount))
  );

  const commonDetails = application ? [
    ["Application ID", application._id],
    ["Academic Year", application.academicyear],
    ["Name", application.name],
    ["Email", application.email],
    ["Phone", application.phone],
    ["Address", application.address],
    ["Gender", application.gender],
    ["Category", application.category],
    ["Program Type", application.programtype],
    ["Program Applied", application.programapplied],
    ["Program Code", application.programcode],
    ["Tenth Marks", application.tenthmarks],
    ["Twelve Marks", application.twelvemarks],
    ["External Theory Marks", application.externaltheorymarks],
    ["English Marks", application.englishmarks],
    ["Date of Birth", application.dateofbirth],
    ["Date of Application", application.dateofapplication],
    ["Age", application.age],
    ["Twelve Subjects", application.twelvesubjects],
    ["Application Status", application.applicationstatus]
  ] : [];

  const dynamicDetails = application ? fields
    .map((field) => [field.label, application.extraFields?.[field.fieldname]])
    .filter((item) => item[1] !== undefined && item[1] !== "") : [];
  const documents = application?.documents || [];
  const photoDocument = documents.find((doc) => String(doc.documenttype || "").toLowerCase() === "photo" && doc.url);
  const canPrintApplicationFeeReceipt = application && isPaid(application.paymentstatus, application.paidamount);
  const canPrintProvisionalFeeReceipt = application && isPaid(application.provisionalpaymentstatus, application.provisionalpaidamount);
  const activeReceipt = receiptPayment || (canPrintApplicationFeeReceipt ? buildReceiptPayment("Application") : canPrintProvisionalFeeReceipt ? buildReceiptPayment("Provisional") : null);

  return (
    <Box sx={{ bgcolor: "#f5f7fb", minHeight: "100vh", py: 3 }}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden; }
            ${printMode === "receipt" ? "#admission-fee-receipt-print, #admission-fee-receipt-print * { visibility: visible; }" : "#application-print-view, #application-print-view * { visibility: visible; }"}
            ${printMode === "receipt" ? "#admission-fee-receipt-print" : "#application-print-view"} { position: absolute; left: 0; top: 0; width: 190mm; box-shadow: none !important; border: 0 !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <Paper className="no-print" sx={{ maxWidth: 860, mx: "auto", p: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Admission Application Print View</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField fullWidth label="Application number" value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} />
          <Button variant="contained" disabled={loading} onClick={loadApplication}>{loading ? "Loading..." : "Load"}</Button>
          {application && <Button variant="outlined" onClick={printApplication}>Print</Button>}
          {application && <Button variant="outlined" onClick={exportApplication}>Export</Button>}
        </Stack>
        {message && <Alert severity="info" sx={{ mt: 2 }}>{message}</Alert>}
      </Paper>

      {paymentPanel && (
        <Paper className="no-print" sx={{ maxWidth: 860, mx: "auto", p: 2, mb: 2 }}>
          <Tabs value={activePaymentTab} onChange={(_, value) => setActivePaymentTab(value)} sx={{ mb: 2 }}>
            <Tab label="Application Fee" />
            <Tab label="Provisional Fee" />
          </Tabs>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
            <TextField select size="small" label="Payment Gateway" value={selectedPaymentGatewayId} onChange={(e) => setSelectedPaymentGatewayId(e.target.value)} sx={{ minWidth: 250 }}>
              <MenuItem value="">Easebuzz (existing configuration)</MenuItem>
              {paymentGateways.map((gateway) => <MenuItem key={gateway._id} value={gateway._id}>{gateway.gatewayname} ({gateway.type})</MenuItem>)}
            </TextField>
            {activePaymentTab === 0 && (
              applicationFee && !isPaid(application.paymentstatus, application.paidamount)
                ? <Button variant="contained" color="success" disabled={paymentLoading} onClick={() => makePayment("Application")}>{paymentLoading ? "Processing..." : `Pay Application Fee Rs. ${Number(applicationFee.amount || 0).toLocaleString("en-IN")}`}</Button>
                : <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flex: 1 }}>
                    <Alert severity="success" sx={{ flex: 1 }}>Application fee is already paid or not required.</Alert>
                    {canPrintApplicationFeeReceipt && <Button variant="outlined" onClick={() => printReceipt("Application")}>Download Receipt</Button>}
                  </Stack>
            )}
            {activePaymentTab === 1 && (
              provisionalFee && !isPaid(application.provisionalpaymentstatus, application.provisionalpaidamount)
                ? <Button variant="contained" color="success" disabled={paymentLoading} onClick={() => makePayment("Provisional")}>{paymentLoading ? "Processing..." : `Pay Provisional Fee Rs. ${Number(provisionalFee.amount || 0).toLocaleString("en-IN")}`}</Button>
                : <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flex: 1 }}>
                    <Alert severity="success" sx={{ flex: 1 }}>Provisional fee is already paid or not required.</Alert>
                    {canPrintProvisionalFeeReceipt && <Button variant="outlined" onClick={() => printReceipt("Provisional")}>Download Receipt</Button>}
                  </Stack>
            )}
          </Stack>
        </Paper>
      )}

      {application && (
        <>
        <Paper className="no-print" sx={{ maxWidth: 860, mx: "auto", p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Fee Receipts</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" disabled={!canPrintApplicationFeeReceipt} onClick={() => printReceipt("Application")}>Download Application Fee Receipt</Button>
            <Button variant="outlined" disabled={!canPrintProvisionalFeeReceipt} onClick={() => printReceipt("Provisional")}>Download Provisional Fee Receipt</Button>
          </Stack>
        </Paper>

        <Paper id="application-print-view" sx={{ maxWidth: "210mm", mx: "auto", p: 3, bgcolor: "#fff", color: "#111827", border: "1px solid #d1d5db" }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={9}>
              <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", pb: 1.5, borderBottom: "2px solid #1f2937" }}>
                {institution?.logolink && <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 72, maxWidth: 150, objectFit: "contain" }} />}
                <Typography variant="h6" fontWeight={900}>{institution?.institutionname || "Institution"}</Typography>
                <Typography variant="body2">{institution?.address || ""}</Typography>
                <Typography variant="subtitle1" fontWeight={900}>Admission Application Acknowledgement</Typography>
                <Typography variant="body2">{formDefinition?.title || "Admission Application"}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ height: 145, border: "2px dashed #64748b", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", p: 1 }}>
                {photoDocument ? (
                  <Box component="img" src={photoDocument.url} alt="Applicant" sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  <Typography variant="caption" color="text.secondary">Paste recent passport size photo here</Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ bgcolor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 1, p: 1.25 }}>
                <Typography variant="body2"><b>Application ID:</b> {application._id}</Typography>
                <Typography variant="body2"><b>Submitted on:</b> {new Date(application.createdAt || Date.now()).toLocaleString("en-IN")}</Typography>
                <Typography variant="body2"><b>Application Fee:</b> {applicationFee ? `Rs. ${Number(applicationFee.amount || application.applicationfeeamount || 0).toLocaleString("en-IN")}` : "Not required"}</Typography>
                <Typography variant="body2"><b>Application Fee Status:</b> {application.paymentstatus || "Not Required"} {application.paymentrefno ? `(${application.paymentrefno})` : ""}</Typography>
                <Typography variant="body2"><b>Provisional Fee:</b> {provisionalFee ? `Rs. ${Number(provisionalFee.amount || application.provisionalfeeamount || 0).toLocaleString("en-IN")}` : "Not required"}</Typography>
                <Typography variant="body2"><b>Provisional Fee Status:</b> {application.provisionalpaymentstatus || "Not Required"} {application.provisionalpaymentrefno ? `(${application.provisionalpaymentrefno})` : ""}</Typography>
              </Box>
            </Grid>

            {commonDetails.map(([label, value]) => renderValue(label, value))}
            {dynamicDetails.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mt: 1 }}>Additional Details</Typography>
              </Grid>
            )}
            {dynamicDetails.map(([label, value]) => renderValue(label, value))}

            {renderSubjectTable("Tenth Subjects and Marks", application.tenthsubjectmarks || [])}
            {renderSubjectTable("Twelve Subjects and Marks", application.twelvesubjectmarks || [])}

            {documents.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, overflow: "hidden" }}>
                  <Typography sx={{ bgcolor: "#e2e8f0", px: 1.25, py: 0.75, fontWeight: 800 }}>Uploaded Documents</Typography>
                  <Grid container sx={{ bgcolor: "#f8fafc", borderTop: "1px solid #cbd5e1" }}>
                    {["Document Type", "File", "Description"].map((heading) => (
                      <Grid item xs={4} key={heading} sx={{ px: 1.25, py: 0.75, borderRight: "1px solid #e5e7eb" }}>
                        <Typography variant="caption" fontWeight={900}>{heading}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                  {documents.map((doc, index) => (
                    <Grid container key={`${doc.key || doc.url || doc.filename}-${index}`} sx={{ borderTop: "1px solid #e5e7eb" }}>
                      <Grid item xs={4} sx={{ px: 1.25, py: 0.75 }}>
                        <Typography variant="body2">{doc.documenttype || "-"}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ px: 1.25, py: 0.75 }}>
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{doc.originalname || doc.filename || "-"}</Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ px: 1.25, py: 0.75 }}>
                        <Typography variant="body2">{doc.description || "-"}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ border: "1px solid #cbd5e1", borderRadius: 1, p: 1.5, mt: 1 }}>
                <Typography variant="subtitle2" fontWeight={900}>Declaration</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  I hereby declare that the information submitted in this application is true and correct to the best of my knowledge. I understand that admission is subject to verification of documents, eligibility, seat availability, and the rules and regulations of the institution. If any information is found incorrect or incomplete, my application/admission may be cancelled by the institution.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}><Box sx={{ height: 70, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}><Typography variant="body2">Applicant Signature</Typography></Box></Grid>
            <Grid item xs={6}><Box sx={{ height: 70, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}><Typography variant="body2">Date</Typography></Box></Grid>

            <Grid item xs={12}>
              <Box sx={{ border: "2px solid #1f2937", borderRadius: 1, p: 1.5, mt: 1 }}>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>For Office Use Only</Typography>
                <Grid container spacing={2}>
                  {["Documents Checked By", "Eligibility Verified By", "Approved By", "Remarks"].map((label) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ height: 54, borderBottom: "1px solid #111827", display: "flex", alignItems: "flex-end", pb: 0.5 }}>
                        <Typography variant="body2">{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        <Box id="admission-fee-receipt-print" sx={{ display: "none", "@media print": { display: printMode === "receipt" ? "block" : "none" }, bgcolor: "white", color: "#111827", maxWidth: "190mm", mx: "auto", p: 3, border: "1px solid #d1d5db" }}>
          {activeReceipt && (
            <>
              <Stack alignItems="center" spacing={0.5} sx={{ textAlign: "center", mb: 2 }}>
                {institution?.logolink && <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />}
                <Typography variant="h6" fontWeight={900}>{institution?.institutionname || "Institution"}</Typography>
                {institution?.address && <Typography variant="body2">{institution.address}</Typography>}
                <Typography variant="h6" fontWeight={900} sx={{ mt: 1, textTransform: "uppercase" }}>Admission Fee Receipt</Typography>
              </Stack>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={6}><Typography variant="body2"><b>Receipt No:</b> AFR-{String(activeReceipt.paymentrefno || application._id || "").slice(-10).toUpperCase()}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" textAlign="right"><b>Receipt Date:</b> {receiptDate()}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><b>Application ID:</b> {application._id || "NA"}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" textAlign="right"><b>Academic Year:</b> {application.academicyear || "NA"}</Typography></Grid>
              </Grid>

              <Paper elevation={0} sx={{ p: 1.5, mb: 2, border: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}><Typography variant="body2"><b>Student:</b> {application.name || "NA"}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2"><b>Phone:</b> {application.phone || "NA"}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2"><b>Email:</b> {application.email || "NA"}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2"><b>Program:</b> {application.programapplied || "NA"} {application.programcode ? `(${application.programcode})` : ""}</Typography></Grid>
                </Grid>
              </Paper>

              <Box sx={{ border: "1px solid #111827", borderRadius: 0.5, overflow: "hidden", mb: 2 }}>
                <Grid container sx={{ bgcolor: "#111827", color: "#fff", fontWeight: 900 }}>
                  <Grid item xs={4} sx={{ p: 1, borderRight: "1px solid #374151" }}>Item</Grid>
                  <Grid item xs={2} sx={{ p: 1, borderRight: "1px solid #374151" }}>Amount</Grid>
                  <Grid item xs={3} sx={{ p: 1, borderRight: "1px solid #374151" }}>Reference Number</Grid>
                  <Grid item xs={2} sx={{ p: 1, borderRight: "1px solid #374151" }}>Pay Date</Grid>
                  <Grid item xs={1} sx={{ p: 1 }}>Status</Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={4} sx={{ p: 1, borderRight: "1px solid #d1d5db" }}>{activeReceipt.paymenttype}</Grid>
                  <Grid item xs={2} sx={{ p: 1, borderRight: "1px solid #d1d5db" }}>{money(activeReceipt.paidamount)}</Grid>
                  <Grid item xs={3} sx={{ p: 1, borderRight: "1px solid #d1d5db", wordBreak: "break-word" }}>{activeReceipt.paymentrefno || "NA"}</Grid>
                  <Grid item xs={2} sx={{ p: 1, borderRight: "1px solid #d1d5db" }}>{shortDate(activeReceipt.paiddate) || "NA"}</Grid>
                  <Grid item xs={1} sx={{ p: 1 }}>{activeReceipt.paymentstatus || "Paid"}</Grid>
                </Grid>
              </Box>

              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
                <Box sx={{ width: 260, borderTop: "2px solid #111827", pt: 1 }}>
                  <Typography variant="body2" fontWeight={900}>Total Amount: {money(activeReceipt.paidamount)}</Typography>
                </Box>
              </Stack>

              <Typography variant="body2" sx={{ mb: 4 }}>
                Received the above amount towards {activeReceipt.paymenttype} from {application.name || "the applicant"}.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Prepared by</Typography></Grid>
                <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Checked by</Typography></Grid>
                <Grid item xs={4}><Typography variant="body2" fontWeight={700}>Authorized Signatory</Typography></Grid>
              </Grid>
            </>
          )}
        </Box>
        </>
      )}
    </Box>
  );
}
