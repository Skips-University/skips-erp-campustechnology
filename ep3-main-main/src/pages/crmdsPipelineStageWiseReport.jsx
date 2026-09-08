import React, { useState, useEffect, useRef } from "react";
import ep1 from "../api/ep1.js";
import {
  Box, Typography, Button, MenuItem, TextField, Paper, Grid, FormControl, InputLabel, Select
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import global1 from "./global1.js";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#06b6d4", "#f43f5e", "#84cc16"];



const CrmdsPipelineStageWiseReport = () => {
  const [pipelineStage, setPipelineStage] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selectedGraphCounselor, setSelectedGraphCounselor] = useState(null);
  const [pipelineStagesList, setPipelineStagesList] = useState([]);
  const printRef = useRef();
  const chartRef = useRef();
  const colid = global1.colid;

  const loadPipelineStages = async () => {
    try {
      const res = await ep1.get("/api/v2/getallpipelinestageag", {
        params: { colid }
      });
      if (res.data.status === "Success" || res.data.success || res.status === 200) {
        const stages = res.data.data.map(stage => stage.stagename).filter(Boolean);
        setPipelineStagesList(stages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateReport = async () => {
    try {
      setSelectedGraphCounselor(null); // Reset drill-down
      const res = await ep1.post("/api/v2/crmds/pipelinewise-report", {
        pipelineStage: pipelineStage,
        startDate,
        endDate,
        colid
      });
      if (res.data.success) {
        setLeads(res.data.data || []);
        setSummary(res.data.summary || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto load on mount to show default distribution
  useEffect(() => {
    loadPipelineStages();
    generateReport();
  }, []);

  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedCounselor = data.activePayload[0].payload.counselor;
      setSelectedGraphCounselor(
        selectedGraphCounselor === clickedCounselor ? null : clickedCounselor
      );
    }
  };

  const exportExcel = () => {
    if (!leads.length) return alert("No data to export");
    const exportData = leads.map(d => ({
      "Lead Name": d.name,
      "Phone": d.phone,
      "Email": d.email,
      "Pipeline Stage": d.pipeline_stage,
      "Counselor": d.assignedto,
      "Created Date": new Date(d.createdAt).toLocaleDateString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pipeline Stage Leads");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Pipeline_Stage_Report.xlsx");
  };

  const exportPDF = async () => {
    if (!leads.length) return alert("No data to export");
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.setFontSize(22);
    pdf.setTextColor(88, 28, 135);
    pdf.text("Pipeline Stage Wise Report", 14, 20);
    pdf.setFontSize(11);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    pdf.text(`Total Leads: ${leads.length}`, 14, 34);

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

    if (summary.length > 0) {
      pdf.setFontSize(13);
      pdf.setTextColor(30, 41, 59);
      pdf.text("Stage Distribution Summary", 14, currentY + 2);
      autoTable(pdf, {
        startY: currentY + 6,
        head: [["Counsellor", "Total Leads"]],
        body: summary.map(r => [r.counselor, r.total]),
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [126, 34, 206], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 243, 255] },
        margin: { left: 14, right: 14 }
      });
    }

    const afterSummary = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 8 : currentY + 8;
    pdf.setFontSize(13);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Detailed Leads", 14, afterSummary);
    autoTable(pdf, {
      startY: afterSummary + 4,
      head: [["Lead Name", "Phone", "Email", "Pipeline Stage", "Counsellor", "Created Date"]],
      body: leads.map(d => [
        d.name || "",
        d.phone || "",
        d.email || "",
        d.pipeline_stage || "",
        d.assignedto || "",
        new Date(d.createdAt).toLocaleDateString('en-IN')
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [126, 34, 206], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      margin: { left: 14, right: 14 }
    });

    pdf.save("Pipeline_Stage_Report.pdf");
  };

  const columns = [
    { field: "name", headerName: "Lead Name", flex: 1.5 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "pipeline_stage", headerName: "Pipeline Stage", flex: 1.2 },
    { field: "assignedto", headerName: "Counsellor", flex: 1 },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 1,
      valueGetter: (params) => new Date(params.value).toLocaleDateString('en-IN')
    }
  ];

  const displayedLeads = selectedGraphCounselor
    ? leads.filter(l => (l.assignedto || "Unassigned") === selectedGraphCounselor)
    : leads;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f8fafc' }}>

      <Box sx={{ background: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)', borderRadius: 3, p: 4, mb: 4, color: 'white', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.5)' }}>
        <FilterAltIcon sx={{ fontSize: 40, opacity: 0.9 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Pipeline Stage Wise Report
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8, fontWeight: 500 }}>
            Analyze counsellor performance across specific pipeline stages
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="stage-select">Select Pipeline Stage</InputLabel>
              <Select
                labelId="stage-select"
                value={pipelineStage}
                label="Select Pipeline Stage"
                onChange={(e) => setPipelineStage(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">All Stages</MenuItem>
                {pipelineStagesList.map((s, i) => (
                  <MenuItem key={i} value={s}>{s}</MenuItem>
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
              sx={{ flex: 1, borderRadius: 2, fontWeight: 700, textTransform: 'none', py: 1, bgcolor: '#9333ea', '&:hover': { bgcolor: '#7e22ce' }, boxShadow: '0 4px 12px rgba(147,51,234,0.3)' }}
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

        {summary.length > 0 && (
          <Paper ref={chartRef} elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              Counsellors Assignees for "{pipelineStage === "ALL" ? "All Stages" : pipelineStage}"
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
              Click on a bar to filter the leads details table below by counsellor.
            </Typography>

            <Box sx={{ width: "100%", height: 450 }}>
              <ResponsiveContainer>
                <BarChart data={summary} margin={{ top: 20, right: 30, left: 0, bottom: 140 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="counselor"
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
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    <LabelList dataKey="total" position="top" style={{ fill: '#475569', fontWeight: 800, fontSize: 13 }} />
                    {summary.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedGraphCounselor === entry.counselor ? '#ec4899' : COLORS[index % COLORS.length]}
                        style={{ transition: 'fill 0.3s' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        {/* Print Only Summary Table for PDF */}
        {summary.length > 0 && (
          <Box className="pdf-summary-table" sx={{ mb: 4, px: 2, display: { xs: 'none', print: 'block' } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>Stage Distribution Summary</Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif' }}>
              <thead>
                <tr style={{ background: '#f5f3ff' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd6fe', color: '#5b21b6' }}>Counsellor</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd6fe', color: '#5b21b6' }}>Total Leads</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', color: '#475569', fontWeight: 500 }}>{row.counselor}</td>
                    <td style={{ padding: '10px', color: '#0f172a', fontWeight: 700 }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}

        <Paper elevation={0} sx={{ p: 0, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Pipeline Leads Details {selectedGraphCounselor ? `for ${selectedGraphCounselor}` : ''}
            </Typography>
            {selectedGraphCounselor && (
              <Button size="small" variant="text" onClick={() => setSelectedGraphCounselor(null)} sx={{ fontWeight: 600, color: '#9333ea' }}>
                Clear Filter
              </Button>
            )}
          </Box>
          <Box sx={{ height: 600, width: "100%", bgcolor: '#ffffff' }}>
            <DataGrid
              rows={displayedLeads.map((r, i) => ({ id: r._id || i, ...r }))}
              columns={columns}
              rowHeight={55}
              columnHeaderHeight={55}
              pageSizeOptions={[20, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
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

export default CrmdsPipelineStageWiseReport;