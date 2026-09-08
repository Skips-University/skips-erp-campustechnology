import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Typography, Snackbar, Alert
} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';
import { ArrowBack } from '@mui/icons-material';

export default function BusDetailPage() {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [studentReg, setStudentReg] = useState('');
  const [studentName, setStudentName] = useState('');
  const [alreadyAllocated, setAlreadyAllocated] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const colid = Number(global1.colid);

  const fetchBus = async () => {
    try {
      const res = await ep1.get(`/api/v2/getbusbyid?id=${busId}`);
      setBus(res.data.data);
    } catch (err) {
      showSnackbar('Error loading bus data', 'error');
    }
  };

  const fetchAllocations = async () => {
    if (!bus) return;
    try {
      const res = await ep1.get(`/api/v2/getallocationsbybusid?busid=${busId}&colid=${colid}`);
      const allocations = res.data.data || [];

      const allocatedMap = allocations.reduce((acc, a) => {
        acc[a.seatno] = {
          student: a.studentname,
          regno: a.regno,
          allocationId: a._id,
        };
        return acc;
      }, {});

      const seatArr = Array.from({ length: bus.noofseat }, (_, i) => {
        const seatNo = i + 2; // Start seat numbers from 2 to account for driver seat
        return {
          seatNo,
          ...(allocatedMap[seatNo] || {}),
        };
      });

      // Add driver seat (seatNo 1)
      seatArr.unshift({
        seatNo: 1,
        student: bus.drivername,
        regno: bus.driveridno,
        isDriverSeat: true,
      });

      setSeats(seatArr);
    } catch (err) {
      showSnackbar('Error loading seat data', 'error');
    }
  };

  useEffect(() => {
    fetchBus();
  }, [busId]);

  useEffect(() => {
    fetchAllocations();
  }, [bus]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const searchStudent = async () => {
    const trimmedRegno = studentReg.trim();
    if (!trimmedRegno) return;

    try {
      const res = await ep1.get(`/api/v2/searchstudentbyregno?regno=${trimmedRegno}&colid=${colid}`);
      const student = res.data?.data;

      if (!student) {
        setStudentName('');
        setAlreadyAllocated(false);
        showSnackbar('Student not found', 'warning');
        return;
      }

      setStudentName(student.name || '');

      const check = await ep1.get(`/api/v2/checkseatallocation?regno=${trimmedRegno}&colid=${colid}`);
      const already = (check.data?.data || []).length > 0;
      setAlreadyAllocated(already);
    } catch (err) {
      console.error('Error searching student:', err);
      setStudentName('');
      setAlreadyAllocated(false);
      showSnackbar('Error searching student', 'error');
    }
  };

  const handleAllocate = async () => {
    if (!studentReg || !studentName || !selectedSeat || alreadyAllocated) return;

    // create ledgerstud
      await ep1.post("/api/v2/createledgerstud", {
      name: `${global1.name}`,
      user: "NA",
      feegroup: "Bus Seat Rent",
      regno: studentReg,
      student: studentName,
      feeitem: `Bus Seat Price - ${bus.busname}`,
      amount: parseInt(bus.priceperseat || 0), // POSITIVE
      paymode: "Not Paid",
      paydetails: "",
      feecategory: "Bus Seat Rent",
      semester: "",
      type: "Debit",
      installment: "One-time",
      comments: `Allocated Seat ${selectedSeat.seatNo} in ${bus.busname}`,
      academicyear: "2025-26",
      colid: parseInt(global1.colid),
      classdate: new Date(),
      status: "Due",
    });

    try {
      await ep1.post('/api/v2/createallocation', {
        name: studentName,
        user: studentReg,
        colid,
        studentname: studentName,
        regno: studentReg,
        busid: busId,
        busnumber: bus.busnumber,
        seatNo: selectedSeat.seatNo,
      });

      setOpen(false);
      setStudentReg('');
      setStudentName('');
      setSelectedSeat(null);
      fetchAllocations();
      showSnackbar('Seat allocated successfully');
    } catch (err) {
      showSnackbar('Error allocating seat', 'error');
    }
  };
const handleDeallocate = async (allocationId, seatNo, regno, student) => {
  if (!window.confirm('Are you sure you want to deallocate this seat?')) return;
  try {
    await ep1.post("/api/v2/createledgerstud", {
      name: `${global1.name}`,
      user: "NA",
      feegroup: "Bus Seat Rent Reversal",
      regno: regno || "",                 // ✅ safe fallback
      student: student || "",             // ✅ safe fallback
      feeitem: `Bus Seat Price Refund - ${bus.busname}`,
      amount: -parseInt(bus.priceperseat || 0),
      paymode: "Adjustment",
      paydetails: "",
      feecategory: "Bus Seat Rent",
      semester: "",
      type: "Credit",
      installment: "One-time",
      comments: `Deallocate Seat ${seatNo} in ${bus.busname}`,
      academicyear: "2025-26",
      colid: parseInt(global1.colid),
      classdate: new Date(),
      status: "Due",
    });

    await ep1.get(`/api/v2/deleteallocation?id=${allocationId}`);
    fetchAllocations();
    showSnackbar('Seat deallocated successfully');
  } catch (err) {
    showSnackbar('Error deallocating seat', 'error');
    console.log(err);
  }
};



  const openDialog = (seat) => {
    setSelectedSeat(seat);
    setStudentReg('');
    setStudentName('');
    setAlreadyAllocated(false);
    setOpen(true);
  };

  if (!bus) return null;

  // Build seat matrix
  const seatMatrix = [];
  const seatsPerRow = 4;
  const totalSeats = seats.length - 1; // Exclude driver seat

  // First row for driver seat
  seatMatrix.push([
    seats.find((seat) => seat.isDriverSeat) || { seatNo: 1, student: 'Driver', regno: '', isDriverSeat: true },
  ]);

  // Remaining seats
  for (let i = 1; i < totalSeats; i += seatsPerRow) {
    seatMatrix.push(seats.slice(i, i + seatsPerRow));
  }

  return (
    <Box p={3}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1) } sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h4" gutterBottom>
        {bus.busname} ({bus.busnumber})
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total Seats (incl. Driver): {bus.noofseat + 1}
      </Typography>

      <Box
        sx={{
          mt: 3,
          maxWidth: 460,
          mx: 'auto',
          border: '2px solid #000',
          borderRadius: 2,
          p: 1,
          backgroundColor: '#f9f9f9',
        }}
      >
        {seatMatrix.map((row, rowIndex) => (
          <Box key={`row-${rowIndex}`} display="flex" justifyContent="space-around" mb={1}>
            {row.map((seat) => {
              if (!seat) return <Box sx={{ width: 90 }} />;
              const { seatNo, student, regno, allocationId, isDriverSeat } = seat;
              const isOccupied = Boolean(student);

              return (
                <Box
                  key={`seat-${seatNo}`}
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: 2,
                    backgroundColor: isDriverSeat
                      ? '#003366'
                      : isOccupied
                      ? '#2e7d32'
                      : '#9e9e9e',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    cursor: isDriverSeat ? 'default' : 'pointer',
                    boxShadow: 2,
                  }}
                  onClick={() => {
                    if (!isDriverSeat) {
                      isOccupied ?handleDeallocate(allocationId, seatNo, regno, student) : openDialog(seat);
                    }
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {isDriverSeat ? 'Driver' : `Seat ${seatNo}`}
                  </div>
                  <div style={{ fontSize: 12, textAlign: 'center' }}>
                    {student && student}
                  </div>
                  <div style={{ fontSize: 10, textAlign: 'center' }}>
                    {regno && `(${regno})`}
                  </div>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Allocation Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Allocate Seat #{selectedSeat?.seatNo}</DialogTitle>
        <DialogContent>
          <TextField
            label="Student Reg. No"
            value={studentReg}
            onChange={(e) => setStudentReg(e.target.value)}
            onBlur={searchStudent}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                searchStudent();
              }
            }}
            fullWidth
            sx={{ mt: 2 }}
          />
          {studentName && (
            <Typography sx={{ mt: 1 }} color="green">
              Student: {studentName}
            </Typography>
          )}
          {alreadyAllocated && (
            <Typography sx={{ mt: 1 }} color="error">
              ⚠️ Student already has a seat allocated.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAllocate}
            variant="contained"
            disabled={!studentReg || !studentName || alreadyAllocated}
          >
            Allocate
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}