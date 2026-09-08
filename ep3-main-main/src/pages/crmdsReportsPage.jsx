import React, { useEffect, useState, useRef } from "react";
import ep1 from "../api/ep1.js";
import {
    Box, Button, Select, MenuItem, Typography, Paper, TextField, InputLabel, FormControl, Grid, Divider
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import global1 from "./global1.js";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f43f5e", "#84cc16"];

const CrmdsUpcomingFollowupPage = () => {
    const [counsellors, setCounsellors] = useState([]);
    const [counselor, setCounselor] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState([]);
    const printRef = useRef();
    const chartRef = useRef();

    const colid = global1.colid;

    useEffect(() => {
        loadCounsellors();
    }, []);

    const loadCounsellors = async () => {
        try {
            const res = await ep1.post("/api/v2/crmds/get-counsellors", { colid });
            if (res.data.success) {
                setCounsellors(res.data.data.filter(c => c));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const generateReport = async () => {
        try {
            const payload = { counselor, colid };
            if (startDate) payload.startDate = startDate;
            if (endDate) payload.endDate = endDate;

            const response = await ep1.post("/api/v2/crmds/upcoming-followup-report", payload);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Chart Data (Aggregated by counselor)
    const chartData = Object.values(
        data.reduce((acc, item) => {
            const key = item.assignedto || "Unassigned";
            if (!acc[key]) acc[key] = { name: key, count: 0 };
            acc[key].count++;
            return acc;
        }, {})
    ).sort((a, b) => b.count - a.count);

    // Grid Columns for Detailed Table
    const columns = [
        { field: "name", headerName: "Lead Name", flex: 1.5 },
        { field: "phone", headerName: "Phone", flex: 1 },
        { field: "assignedto", headerName: "Counselor", flex: 1 },
        { field: "pipeline_stage", headerName: "Pipeline Stage", flex: 1.2 },
        {
            field: "next_followup_date",
            headerName: "Followup Date",
            flex: 1,
            renderCell: (params) => {
                if (!params.value) return "Invalid Date";
                const d = new Date(params.value);
                return isNaN(d) ? "Invalid Date" : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            }
        }
    ];

    const gridRows = data.map((item, index) => ({ id: item._id || index, ...item }));

    const exportExcel = () => {
        if (data.length === 0) return alert("No data to export");
        const exportData = data.map(d => ({
            "Lead Name": d.name,
            "Phone": d.phone,
            "Email": d.email,
            "Counselor": d.assignedto,
            "Pipeline Stage": d.pipeline_stage,
            "Followup Date": d.next_followup_date ? new Date(d.next_followup_date).toLocaleDateString() : "",
            "Comments": d.fcomments || ""
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Upcoming_Followups");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Upcoming_Followups_Report.xlsx");
    };

    const exportPDF = async () => {
        if (data.length === 0) return alert("No data to export");
        const pdf = new jsPDF('p', 'mm', 'a4');

        pdf.setFontSize(22);
        pdf.setTextColor(30, 58, 138);
        pdf.text("Upcoming Followup Report", 14, 20);
        pdf.setFontSize(11);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        pdf.text(`Total Upcoming Followups: ${data.length}`, 14, 34);

        let currentY = 40;

        // Chart
        if (chartRef.current) {
            const canvas = await html2canvas(chartRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = pdf.internal.pageSize.getWidth() - 28;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 14, currentY, pdfWidth, imgHeight);
            currentY += imgHeight + 8;
        }

        if (chartData.length > 0) {
            pdf.setFontSize(13);
            pdf.setTextColor(30, 41, 59);
            pdf.text("Counselor Summary", 14, currentY + 2);
            autoTable(pdf, {
                startY: currentY + 6,
                head: [["Counselor", "Upcoming Followups"]],
                body: chartData.map(r => [r.name, r.count]),
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [30, 58, 138], textColor: 255 },
                alternateRowStyles: { fillColor: [241, 245, 249] },
                margin: { left: 14, right: 14 }
            });
        }

        const afterSummary = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 8 : currentY + 8;
        pdf.setFontSize(13);
        pdf.setTextColor(30, 41, 59);
        pdf.text("Detailed Followup Data", 14, afterSummary);
        autoTable(pdf, {
            startY: afterSummary + 4,
            head: [["Lead Name", "Phone", "Counselor", "Pipeline Stage", "Followup Date"]],
            body: data.map(d => [
                d.name || "",
                d.phone || "",
                d.assignedto || "",
                d.pipeline_stage || "",
                d.next_followup_date ? new Date(d.next_followup_date).toLocaleDateString('en-IN') : ""
            ]),
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [30, 58, 138], textColor: 255 },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            margin: { left: 14, right: 14 }
        });

        pdf.save("Upcoming_Followups_Report.pdf");
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f8fafc' }}>

            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', borderRadius: 3, p: 4, mb: 4, color: 'white', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>
                <CalendarMonthIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
                        Upcoming Followups Report
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.8, fontWeight: 500 }}>
                        Track and manage scheduled interactions with your leads
                    </Typography>
                </Box>
            </Box>

            {/* Filter Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="counselor-select-label">Counselor</InputLabel>
                            <Select
                                labelId="counselor-select-label"
                                value={counselor}
                                label="Counselor"
                                onChange={(e) => setCounselor(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="ALL">All Counselors</MenuItem>
                                {counsellors.map((c) => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2.5}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2.5}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="contained"
                            onClick={generateReport}
                            sx={{ flex: 1, borderRadius: 2, fontWeight: 700, textTransform: 'none', py: 1, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                        >
                            Generate
                        </Button>
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={exportExcel}
                            startIcon={<DownloadIcon />}
                            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', borderColor: '#10b981', color: '#10b981', '&:hover': { borderColor: '#059669', bgcolor: '#ecfdf5' } }}
                        >
                            Excel
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={exportPDF}
                            startIcon={<PictureAsPdfIcon />}
                            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', borderColor: '#f43f5e', color: '#f43f5e', '&:hover': { borderColor: '#e11d48', bgcolor: '#fff1f2' } }}
                        >
                            PDF
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Box ref={printRef} sx={{ background: '#f8fafc', p: 1 }}>

                {data.length > 0 && (
                    <Paper ref={chartRef} elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                            Upcoming Followups by Counselor
                            <Box component="span" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', px: 1.5, py: 0.5, borderRadius: '99px', fontSize: '0.875rem' }}>
                                Total: {data.length}
                            </Box>
                        </Typography>

                        <Box sx={{ width: "100%", height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 140 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                    />
                                    <YAxis
                                        tick={{ fill: '#64748b', fontSize: 13 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                        <LabelList dataKey="count" position="top" style={{ fill: '#475569', fontWeight: 800, fontSize: 13 }} />
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                )}

                {/* Print Only Summary Table for PDF */}
                {data.length > 0 && (
                    <Box className="pdf-summary-table" sx={{ mb: 4, px: 2, display: { xs: 'none', print: 'block' } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>Counselor Summary</Typography>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cbd5e1', color: '#334155' }}>Counselor</th>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cbd5e1', color: '#334155' }}>Upcoming Followups</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '10px', color: '#475569', fontWeight: 500 }}>{row.name}</td>
                                        <td style={{ padding: '10px', color: '#0f172a', fontWeight: 700 }}>{row.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}

                <Paper elevation={0} sx={{ p: 0, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                    <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            Detailed Followup Data
                        </Typography>
                    </Box>
                    <Box sx={{ height: 600, width: "100%", bgcolor: '#ffffff' }}>
                        <DataGrid
                            rows={gridRows}
                            columns={columns}
                            rowHeight={55}
                            columnHeaderHeight={55}
                            pageSizeOptions={[20, 50, 100]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 20 } },
                            }}
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.875rem' },
                                '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem', display: 'flex', alignItems: 'center' },
                                '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
                            }}
                        />
                    </Box>
                </Paper>
            </Box>

            <style>{`
                @media print {
                    .pdf-summary-table { display: block !important; }
                }
            `}</style>
        </Box>
    );
};

export default CrmdsUpcomingFollowupPage;