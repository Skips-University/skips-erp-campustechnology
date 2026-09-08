import React, { useState, useEffect } from "react";
import { Box, Typography, Button, MenuItem, TextField, Paper, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

import ep1 from "../api/ep1.js";
import global1 from "./global1.js";

const CrmdsSourceWiseLeadsReport = () => {

    const [counsellors, setCounsellors] = useState([]);
    const [counsellor, setCounsellor] = useState("ALL");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [leads, setLeads] = useState([]);
    const [summary, setSummary] = useState([]);

    const colid = global1.colid;
    const chartRef = React.useRef(null);

    const loadCounsellors = async () => {

        const res = await ep1.post("/api/v2/crmds/get-counsellors", { colid });
        setCounsellors(res.data.data);

    };

    const generateReport = async () => {

        const res = await ep1.post("/api/v2/crmds/sourcewise-report", {
            counselor: counsellor,
            startDate,
            endDate,
            colid
        });

        setLeads(res.data.data);
        setSummary(res.data.summary);

    };

    const exportToExcel = () => {
        if (leads.length === 0) return alert("No data to export");
        const exportData = leads.map(l => ({
            Name: l.name,
            Phone: l.phone,
            Email: l.email,
            Source: l.source,
            Counsellor: l.assignedto
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Source Wise Leads");
        XLSX.writeFile(wb, "Source_Wise_Leads_Report.xlsx");
    };

    const exportToPDF = async () => {
        if (leads.length === 0) return alert("No data to export");
        const doc = new jsPDF();
        doc.text("Source Wise Leads Report", 14, 15);

        let currentY = 20;

        // Capture Chart if exists
        if (chartRef.current) {
            try {
                const canvas = await html2canvas(chartRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');

                const pdfWidth = doc.internal.pageSize.getWidth();
                const padding = 14;
                const imgWidth = pdfWidth - (padding * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.addImage(imgData, 'PNG', padding, currentY, imgWidth, imgHeight);
                currentY += imgHeight + 10;
            } catch (err) {
                console.error("Could not export chart", err);
            }
        }

        const tableColumn = ["Name", "Phone", "Email", "Source", "Counsellor"];
        const tableRows = leads.map(l => [
            l.name,
            l.phone,
            l.email,
            l.source,
            l.assignedto
        ]);
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: currentY
        });
        doc.save("Source_Wise_Leads_Report.pdf");
    };

    useEffect(() => {
        loadCounsellors();
    }, []);

    const columns = [

        { field: "name", headerName: "Name", width: 200 },
        { field: "phone", headerName: "Phone", width: 150 },
        { field: "email", headerName: "Email", width: 200 },
        { field: "source", headerName: "Source", width: 200 },
        { field: "assignedto", headerName: "Counsellor", width: 200 }

    ];

    return (

        <Box p={3}>

            <Typography variant="h5">Source Wise Leads Report</Typography>

            <Grid container spacing={2} mt={2} mb={3}>

                <Grid item xs={2}>
                    <TextField type="date" label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        fullWidth />
                </Grid>

                <Grid item xs={2}>
                    <TextField type="date" label="End Date"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        fullWidth />
                </Grid>

                <Grid item xs={3}>
                    <TextField select label="Counsellor"
                        value={counsellor}
                        onChange={(e) => setCounsellor(e.target.value)}
                        fullWidth>

                        <MenuItem value="ALL">All Counsellors</MenuItem>

                        {counsellors.map((c, i) => (
                            <MenuItem key={i} value={c}>{c}</MenuItem>
                        ))}

                    </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box display="flex" gap={1} height="100%">
                        <Button variant="contained" onClick={generateReport} fullWidth>Generate</Button>
                        <Button variant="outlined" color="success" onClick={exportToExcel} disabled={leads.length === 0} fullWidth>Excel</Button>
                        <Button variant="outlined" color="error" onClick={exportToPDF} disabled={leads.length === 0} fullWidth>PDF</Button>
                    </Box>
                </Grid>

            </Grid>

            <Paper sx={{ p: 3, mb: 3 }} ref={chartRef}>

                <Typography variant="h6">Leads by Source</Typography>

                <ResponsiveContainer width="100%" height={350}>

                    <BarChart data={summary} margin={{ top: 20, right: 30, left: 0, bottom: 90 }}>

                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalLeads" fill="#4caf50" />

                    </BarChart>

                </ResponsiveContainer>

            </Paper>

            <Paper sx={{ p: 3 }}>

                <DataGrid
                    rows={leads.map((r, i) => ({ id: i, ...r }))}
                    columns={columns}
                    pagination
                    paginationModel={{ page: 0, pageSize: 10 }}
                    pageSizeOptions={[10, 20, 50]}
                    autoHeight
                />

            </Paper>

        </Box>

    );

};

export default CrmdsSourceWiseLeadsReport;