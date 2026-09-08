import React, { useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Container,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";

export default function SeatAllocator() {
  const [rooms, setRooms] = useState([{ roomName: "", capacity: "" }]);
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddRoom = () => {
    setRooms([...rooms, { roomName: "", capacity: "" }]);
  };

  const handleRemoveRoom = (index) => {
    const updated = rooms.filter((_, i) => i !== index);
    setRooms(updated);
  };

  const handleRoomChange = (index, field, value) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError("");
    if (selectedFile) {
      readExcelFile(selectedFile);
    }
  };

  // Read Excel file and extract student data
  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map the Excel data to student objects
        const studentList = jsonData.map((row) => ({
          name: row.Name || row.name || "",
          regNo: row.RegNo || row.regno || row.RegistrationNumber || "",
          program: row.Program || row.program || row.Course || "",
        }));

        setStudents(studentList);
        setSuccess(`Successfully loaded ${studentList.length} students`);
      } catch (err) {
        setError("Error reading Excel file. Please check the format.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Shuffle helper - from backend
  const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Ensure no two adjacent students of same program - from backend
  const generateRoomSeating = (students) => {
    let shuffledStudents = shuffle([...students]);
    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 500) {
      valid = true;
      for (let i = 0; i < shuffledStudents.length - 1; i++) {
        if (shuffledStudents[i].program === shuffledStudents[i + 1].program) {
          valid = false;
          shuffledStudents = shuffle([...students]);
          break;
        }
      }
      attempts++;
    }

    return shuffledStudents.map((s, i) => ({
      seatNumber: i + 1,
      name: s.name,
      regNo: s.regNo,
      program: s.program,
    }));
  };

  // FIXED: Distribute students across rooms - from backend logic
  const distributeStudents = (students, rooms) => {
    // First shuffle all students globally
    const shuffledStudents = shuffle([...students]);

    let index = 0;
    const resultRooms = [];

    for (const room of rooms) {
      const capacity = parseInt(room.capacity);
      const assigned = shuffledStudents.slice(index, index + capacity);
      index += capacity;

      if (assigned.length === 0) break;

      // Apply seating arrangement for this room
      const arranged = generateRoomSeating(assigned);
      
      resultRooms.push({
        roomName: room.roomName,
        capacity: capacity,
        allocated: arranged.length,
        students: arranged,
      });
    }

    return resultRooms;
  };

  // Allocate students to rooms
  const allocateSeats = () => {
    setError("");
    setSuccess("");

    if (students.length === 0) {
      setError("Please upload an Excel file with student data");
      return;
    }

    if (rooms.some((r) => !r.roomName || !r.capacity)) {
      setError("Please fill in all room details");
      return;
    }

    setLoading(true);

    const totalCapacity = rooms.reduce(
      (sum, r) => sum + parseInt(r.capacity || 0),
      0
    );

    if (students.length > totalCapacity) {
      setError(
        `Total capacity (${totalCapacity}) is less than number of students (${students.length})`
      );
      setLoading(false);
      return;
    }

    // Use the backend distribution logic
    const allocations = distributeStudents(students, rooms);

    setResult(allocations);
    setSuccess("Seats allocated successfully!");
    setLoading(false);
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!result) {
      setError("Please allocate seats first");
      return;
    }

    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Exam Seat Allocation", 105, 15, { align: "center" });

      let startY = 25;

      result.forEach((room, index) => {
        if (index > 0) {
          doc.addPage();
          startY = 15;
        }

        doc.setFontSize(14);
        doc.text(`Room: ${room.roomName}`, 14, startY);
        doc.setFontSize(11);
        doc.text(
          `Capacity: ${room.capacity} | Allocated: ${room.allocated}`,
          14,
          startY + 7
        );

        const tableData = room.students.map((s) => [
          s.seatNumber,
          s.name,
          s.regNo,
          s.program,
        ]);

        autoTable(doc, {
          startY: startY + 12,
          head: [["Seat No", "Name", "Reg No", "Program"]],
          body: tableData,
          theme: "grid",
          headStyles: {
            fillColor: [66, 139, 202],
            fontSize: 10,
            fontStyle: "bold",
          },
          bodyStyles: {
            fontSize: 9,
          },
          margin: { left: 14, right: 14 },
        });

        startY = doc.lastAutoTable.finalY + 10;
      });

      doc.save("seat_allocation.pdf");
      setSuccess("PDF exported successfully!");
    } catch (err) {
      console.error("PDF Export Error:", err);
      setError("Failed to export PDF. Please check console for details.");
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (!result) {
      setError("Please allocate seats first");
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      result.forEach((room) => {
        const worksheetData = [
          [`Room: ${room.roomName}`],
          [`Capacity: ${room.capacity} | Allocated: ${room.allocated}`],
          [],
          ["Seat No", "Name", "Reg No", "Program"],
          ...room.students.map((s) => [
            s.seatNumber,
            s.name,
            s.regNo,
            s.program,
          ]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          room.roomName.slice(0, 31)
        );
      });

      XLSX.writeFile(workbook, "seat_allocation.xlsx");
      setSuccess("Excel exported successfully!");
    } catch (err) {
      console.error("Excel Export Error:", err);
      setError("Failed to export Excel. Please check console for details.");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
        Exam Seat Allocator
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Room Configuration */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Room Configuration
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {rooms.map((room, index) => (
          <Box
            key={index}
            sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}
          >
            <TextField
              label="Room Name"
              variant="outlined"
              value={room.roomName}
              onChange={(e) =>
                handleRoomChange(index, "roomName", e.target.value)
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Capacity"
              variant="outlined"
              type="number"
              value={room.capacity}
              onChange={(e) =>
                handleRoomChange(index, "capacity", e.target.value)
              }
              sx={{ width: 150 }}
              size="small"
            />
            {rooms.length > 1 && (
              <IconButton
                color="error"
                onClick={() => handleRemoveRoom(index)}
                aria-label="delete room"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRoom}
          sx={{ mt: 1 }}
        >
          Add Room
        </Button>
      </Paper>

      {/* File Upload */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Student Data
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          sx={{ mb: 2 }}
        >
          Upload Excel File
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </Button>
        {file && (
          <Typography variant="body2" sx={{ ml: 2, display: "inline" }}>
            {file.name}
          </Typography>
        )}
        {students.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`${students.length} students loaded`}
              color="success"
              icon={<UploadIcon />}
            />
          </Box>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            loading ? <CircularProgress size={20} /> : <CalculateIcon />
          }
          onClick={allocateSeats}
          disabled={loading}
          size="large"
        >
          {loading ? "Allocating..." : "Allocate Seats"}
        </Button>

        {result && (
          <>
            <Button
              variant="contained"
              color="error"
              startIcon={<PdfIcon />}
              onClick={exportToPDF}
              size="large"
            >
              Export to PDF
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ExcelIcon />}
              onClick={exportToExcel}
              size="large"
            >
              Export to Excel
            </Button>
          </>
        )}
      </Box>

      {/* Results Display */}
      {result && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Seat Allocation Results
          </Typography>
          {result.map((room, roomIndex) => (
            <Paper elevation={3} key={roomIndex} sx={{ p: 3, mb: 4 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">{room.roomName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Capacity: {room.capacity} | Allocated: {room.allocated}
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                {room.students.map((student) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={2.4}
                    key={student.seatNumber}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        borderColor: "primary.main",
                        borderWidth: 2,
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          color="primary"
                          align="center"
                          gutterBottom
                        >
                          Seat {student.seatNumber}
                        </Typography>
                        <Typography
                          variant="body2"
                          align="center"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {student.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          align="center"
                          display="block"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {student.regNo}
                        </Typography>
                        <Chip
                          label={student.program}
                          size="small"
                          color="success"
                          sx={{ width: "100%", mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
}
