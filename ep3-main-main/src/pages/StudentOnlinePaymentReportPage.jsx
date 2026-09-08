import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Add, Delete, FilterAlt, Print, ReceiptLong, Refresh } from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import MenuPageShell from "./MenuPageShell";

const filterFields = [
  { field: "academicyear", label: "Academic Year" },
  { field: "programcode", label: "Program Code" },
  { field: "semester", label: "Semester" },
  { field: "gateway", label: "Gateway" },
  { field: "paymentstatus", label: "Status" },
  { field: "regno", label: "Reg No" },
  { field: "student", label: "Student" },
  { field: "feegroup", label: "Fee Group" },
  { field: "feeitem", label: "Fee Item" }
];

const currency = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDate = (value) => (value ? new Date(value).toLocaleString("en-IN") : "");

const makeRows = (payments) => payments.flatMap((payment) => {
  const items = payment.ledgeritems?.length ? payment.ledgeritems : [{}];
  return items.map((item, index) => ({
    id: `${payment._id}-${index}`,
    paymentid: payment._id,
    refno: payment.gatewayrefno || payment.refno,
    paiddate: payment.paiddate,
    initiationdate: payment.initiationdate,
    paymentstatus: payment.paymentstatus,
    gateway: payment.gateway,
    student: payment.student,
    regno: payment.regno,
    studentemail: payment.studentemail,
    academicyear: item.academicyear || payment.academicyear,
    programcode: payment.programcode,
    semester: item.semester || payment.semester,
    feegroup: item.feegroup,
    feeitem: item.feeitem,
    feecategory: item.feecategory,
    feetype: item.feetype,
    amount: item.amount,
    paidbefore: item.paidbefore,
    balancebefore: item.balancebefore,
    payingamount: item.payingamount,
    paidafter: item.paidafter,
    balanceafter: item.balanceafter,
    totalamount: payment.totalamount,
    paidamount: payment.paidamount
  }));
});

export default function StudentOnlinePaymentReportPage({ studentOnly = false }) {
  const [filters, setFilters] = useState([{ field: "paymentstatus", value: "" }]);
  const [fromdate, setFromdate] = useState("");
  const [todate, setTodate] = useState("");
  const [options, setOptions] = useState({});
  const [payments, setPayments] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableFilterFields = useMemo(
    () => studentOnly ? filterFields.filter((field) => !["regno", "student"].includes(field.field)) : filterFields,
    [studentOnly]
  );
  const rows = useMemo(() => makeRows(payments), [payments]);
  const totals = useMemo(() => rows.reduce((acc, row) => {
    acc.amount += Number(row.amount || 0);
    acc.paid += Number(row.payingamount || 0);
    acc.balanceAfter += Number(row.balanceafter || 0);
    return acc;
  }, { amount: 0, paid: 0, balanceAfter: 0 }), [rows]);

  const loadOptions = async () => {
    try {
      const params = { colid: global1.colid };
      if (studentOnly) params.regno = global1.regno;
      const res = await ep1.get("/api/v2/studentonlinepayment/options", { params });
      setOptions(res.data.data || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load filter options");
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { colid: global1.colid, fromdate, todate };
      if (studentOnly) params.regno = global1.regno;
      filters.forEach((filter) => {
        if (filter.field && filter.value) params[filter.field] = filter.value;
      });
      const res = await ep1.get("/api/v2/studentonlinepayment", { params });
      setPayments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load online payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ep1.get("/api/v2/salary-payment/institution", { params: { colid: global1.colid } })
      .then((res) => setInstitution(res.data?.data || null))
      .catch(() => setInstitution(null));
    loadOptions();
    loadPayments();
  }, []);

  const updateFilter = (index, key, value) => {
    setFilters((prev) => prev.map((filter, i) => (i === index ? { ...filter, [key]: value, ...(key === "field" ? { value: "" } : {}) } : filter)));
  };

  const printReport = () => {
    const printContents = document.getElementById("student-online-payment-print")?.innerHTML || "";
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Online Payment Report</title></head><body>${printContents}</body></html>`);
    win.document.close();
    win.print();
  };

  const receiptHtml = (payment) => {
    const institutionName = institution?.institutionname || institution?.insname || global1.insname || "Institution";
    const institutionAddress = institution?.address || institution?.insaddress || "";
    const logo = institution?.logo || institution?.logolink || "";
    const items = payment?.ledgeritems?.length ? payment.ledgeritems : [];
    const rowsHtml = items.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.academicyear || payment.academicyear || ""}</td>
        <td>${item.feegroup || ""}</td>
        <td>${item.feeitem || ""}</td>
        <td>${item.feecategory || ""}</td>
        <td style="text-align:right">${currency(item.payingamount)}</td>
      </tr>
    `).join("");
    return `
      <div style="font-family:Arial,sans-serif;max-width:760px;margin:0 auto;color:#111827;">
        <div style="text-align:center;border-bottom:2px solid #111827;padding-bottom:10px;margin-bottom:14px;">
          ${logo ? `<img src="${logo}" alt="logo" style="width:64px;height:64px;object-fit:contain;margin-bottom:6px;" />` : ""}
          <h2 style="margin:0;">${institutionName}</h2>
          <div style="font-size:12px;">${institutionAddress}</div>
          <div style="font-size:13px;">Online Fee Payment Receipt</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px;">
          <tbody>
            <tr><td style="padding:5px;font-weight:700;">Student</td><td style="padding:5px;">${payment.student || ""}</td><td style="padding:5px;font-weight:700;">Reg No</td><td style="padding:5px;">${payment.regno || ""}</td></tr>
            <tr><td style="padding:5px;font-weight:700;">Program</td><td style="padding:5px;">${payment.program || payment.programcode || ""}</td><td style="padding:5px;font-weight:700;">Semester</td><td style="padding:5px;">${payment.semester || ""}</td></tr>
            <tr><td style="padding:5px;font-weight:700;">Reference No</td><td style="padding:5px;">${payment.gatewayrefno || payment.refno || ""}</td><td style="padding:5px;font-weight:700;">Payment Date</td><td style="padding:5px;">${shortDate(payment.paiddate || payment.updatedAt)}</td></tr>
            <tr><td style="padding:5px;font-weight:700;">Gateway</td><td style="padding:5px;">${payment.gateway || ""}</td><td style="padding:5px;font-weight:700;">Status</td><td style="padding:5px;">${payment.paymentstatus || ""}</td></tr>
          </tbody>
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              ${["Sl", "Year", "Fee Group", "Fee Item", "Category", "Paid Amount"].map((h) => `<th style="border:1px solid #111827;padding:7px;background:#f3f4f6;">${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot><tr><td colspan="5" style="border:1px solid #111827;padding:7px;text-align:right;font-weight:700;">Total Paid</td><td style="border:1px solid #111827;padding:7px;text-align:right;font-weight:700;">${currency(payment.paidamount || payment.totalamount)}</td></tr></tfoot>
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:42px;font-size:13px;">
          <div>Checked by</div>
          <div>Authorized Signatory</div>
        </div>
      </div>
    `;
  };

  const PrintHeader = ({ title }) => (
    <Box sx={{ textAlign: "center", mb: 2 }}>
      {(institution?.logo || institution?.logolink) && (
        <Box component="img" src={institution.logo || institution.logolink} alt="logo" sx={{ width: 64, height: 64, objectFit: "contain", mb: 1 }} />
      )}
      <Typography variant="h6" fontWeight={900}>{institution?.institutionname || institution?.insname || global1.insname || "Institution"}</Typography>
      <Typography variant="body2">{institution?.address || institution?.insaddress || ""}</Typography>
      <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
    </Box>
  );

  const printReceipt = (payment) => {
    if (!payment) return;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Online Fee Receipt</title></head><body>${receiptHtml(payment)}</body></html>`);
    win.document.close();
    win.print();
  };

  const paymentById = useMemo(() => new Map(payments.map((payment) => [payment._id, payment])), [payments]);

  const columns = [
    {
      field: "receipt",
      headerName: "Receipt",
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<ReceiptLong />}
          onClick={(event) => {
            event.stopPropagation();
            const payment = paymentById.get(params.row.paymentid);
            setSelectedReceipt(payment || null);
            printReceipt(payment);
          }}
        >
          Receipt
        </Button>
      )
    },
    { field: "paiddate", headerName: "Paid Date", minWidth: 170, valueGetter: (params) => shortDate(params.row.paiddate) },
    { field: "refno", headerName: "Reference", minWidth: 190 },
    { field: "paymentstatus", headerName: "Status", minWidth: 120 },
    { field: "gateway", headerName: "Gateway", minWidth: 140 },
    { field: "student", headerName: "Student", minWidth: 200, flex: 1 },
    { field: "regno", headerName: "Reg No", minWidth: 150 },
    { field: "academicyear", headerName: "Year", minWidth: 110 },
    { field: "programcode", headerName: "Program Code", minWidth: 130 },
    { field: "feegroup", headerName: "Fee Group", minWidth: 170 },
    { field: "feeitem", headerName: "Fee Item", minWidth: 220, flex: 1 },
    { field: "payingamount", headerName: "Paid Online", minWidth: 140, type: "number", valueFormatter: (params) => currency(params.value) },
    { field: "balanceafter", headerName: "Balance After", minWidth: 140, type: "number", valueFormatter: (params) => currency(params.value) }
  ];

  return (
    <MenuPageShell title={studentOnly ? "My online payments" : "Online payment"} menuType={studentOnly ? "student" : undefined}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{studentOnly ? "My Online Payments" : "Online Payment Report"}</Typography>
            <Typography variant="body2" color="text.secondary">{studentOnly ? "Your online fee payment records and printable receipts." : "Student-wise, fee-wise online payment records with date range and dynamic filters."}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadPayments} disabled={loading}>Refresh</Button>
            <Button variant="contained" startIcon={<Print />} onClick={printReport}>Print</Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="From paid date" value={fromdate} onChange={(event) => setFromdate(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="To paid date" value={todate} onChange={(event) => setTodate(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            {filters.map((filter, index) => (
              <React.Fragment key={`${filter.field}-${index}`}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField select fullWidth size="small" label="Filter field" value={filter.field} onChange={(event) => updateFilter(index, "field", event.target.value)}>
                    {availableFilterFields.map((field) => <MenuItem key={field.field} value={field.field}>{field.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    freeSolo
                    options={options[filter.field] || []}
                    value={filter.value || ""}
                    onInputChange={(event, value) => updateFilter(index, "value", value)}
                    renderInput={(params) => <TextField {...params} size="small" label="Value" />}
                  />
                </Grid>
              </React.Fragment>
            ))}
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<Add />} variant="outlined" onClick={() => setFilters((prev) => [...prev, { field: "student", value: "" }])}>Add filter</Button>
                <Button startIcon={<FilterAlt />} variant="contained" onClick={loadPayments}>Apply</Button>
                <Tooltip title="Remove last filter">
                  <span><IconButton disabled={filters.length <= 1} onClick={() => setFilters((prev) => prev.slice(0, -1))}><Delete /></IconButton></span>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            ["Total Fee Amount", totals.amount],
            ["Paid Online", totals.paid],
            ["Balance After", totals.balanceAfter]
          ].map(([label, value]) => (
            <Grid item xs={12} md={4} key={label}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={800}>Rs. {currency(value)}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ height: 600, borderRadius: 2, overflow: "hidden" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, csvOptions: { fileName: "online_payment_report" } } }}
          />
        </Paper>

        {selectedReceipt && (
          <Paper sx={{ p: 2, mt: 2, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={800}>Selected Receipt Preview</Typography>
              <Button variant="outlined" startIcon={<Print />} onClick={() => printReceipt(selectedReceipt)}>Print Receipt</Button>
            </Stack>
            <Box dangerouslySetInnerHTML={{ __html: receiptHtml(selectedReceipt) }} />
          </Paper>
        )}

        <Box id="student-online-payment-print" sx={{ display: "none" }}>
          <PrintHeader title={studentOnly ? "My Online Payment Report" : "Online Payment Report"} />
          <p style={{ fontSize: 13 }}>Total paid online: Rs. {currency(totals.paid)}</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>{columns.slice(1, 13).map((column) => <th key={column.field} style={{ border: "1px solid #999", padding: 4 }}>{column.headerName}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{shortDate(row.paiddate)}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.refno}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.paymentstatus}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.gateway}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.student}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.regno}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.academicyear}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.programcode}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.feegroup}</td>
                  <td style={{ border: "1px solid #999", padding: 4 }}>{row.feeitem}</td>
                  <td style={{ border: "1px solid #999", padding: 4, textAlign: "right" }}>{currency(row.payingamount)}</td>
                  <td style={{ border: "1px solid #999", padding: 4, textAlign: "right" }}>{currency(row.balanceafter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </MenuPageShell>
  );
}
