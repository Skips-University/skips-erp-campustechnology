import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Pagination,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";

const IssuedBooksPage = () => {
  const { id: libraryId } = useParams(); // Get library ID from URL
  const navigate = useNavigate();

  const [issuedBooks, setIssuedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const fetchIssuedBooks = async () => {
    setLoading(true);
    try {
      const res = await ep1.get(
        `/api/v2/issuebook/get?libraryid=${libraryId}`
      );
      setIssuedBooks(res.data.data || []);
      setFilteredBooks(res.data.data || []);
    } catch (error) {
      console.error("Error fetching issued books:", error);
    } finally {
      setLoading(false);
    }
  };

 const handleStatusChange = async (id, newStatus) => {
  setStatusUpdating(id);
  try {
    const payload = {
      issuestatus: newStatus,
      id: id,
    };

    if (newStatus === "returned") {
      payload.returndate = new Date(); // Set return date
    }

    // 🔄 Update issued book status
    const res = await ep1.post(`/api/v2/issuedbook/update`, payload);
    const book = res.data?.data;

    // ✅ Update the book's status to 'available' if returned
    if (newStatus === "returned" && book?.bookid) {
      await ep1.post(`/api/v2/updatebook/${book.bookid}`, {
        issuedstatus: "available",
      });
    }
    setSnackbar({
      open: true,
      message: "Status updated successfully",
      severity: "success",
    });

    fetchIssuedBooks();
  } catch (error) {
    console.error("Update error:", error);
    setSnackbar({
      open: true,
      message: "Failed to update status",
      severity: "error",
    });
  } finally {
    setStatusUpdating(null);
  }
};


  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = issuedBooks.filter(
      (book) =>
        book.bookname?.toLowerCase().includes(value) ||
        book.student?.toLowerCase().includes(value) ||
        book.regno?.toLowerCase().includes(value)
    );
    setFilteredBooks(filtered);
    setPage(1);
  };

  const calculateFine = (book) => {
    if (!book.duedate || book.issuestatus === "returned" || !book.fineperday)
      return "0";
    const due = new Date(book.duedate);
    const today = new Date();
    if (today <= due) return "0";
    const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
    return (diffDays * parseFloat(book.fineperday || "0")).toFixed(2);
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, [libraryId]);

  const paginatedBooks = filteredBooks.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box p={3} display="flex" flexDirection="column" alignItems="center">
      <Box alignSelf="flex-start" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowBack
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/library/${libraryId}`)}
          />
          <Typography
            variant="body1"
            sx={{ cursor: "pointer", color: "primary.main" }}
            onClick={() => navigate(`/library/${libraryId}`)}
          >
            Back to Library
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="h5"
        gutterBottom
        align="center"
        fontWeight={600}
        color="primary"
      >
        Issued Books
      </Typography>

      <Box mb={2} width="60%">
        <TextField
          label="Search by student, book or regno"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearch}
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper} sx={{ maxWidth: "90vw" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Book</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Fine</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBooks.map((book) => (
                  <TableRow key={book._id}>
                    <TableCell>{book.transactionid}</TableCell>
                    <TableCell>
                      {book.student} ({book.regno})
                    </TableCell>
                    <TableCell>{book.bookname}</TableCell>
                    <TableCell>
                      {book.issuedate
                        ? new Date(book.issuedate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {book.duedate
                        ? new Date(book.duedate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {book.returndate
                        ? new Date(book.returndate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{calculateFine(book)}</TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={book.issuestatus}
                          onChange={(e) =>
                            handleStatusChange(book._id, e.target.value)
                          }
                          disabled={statusUpdating === book._id}
                        >
                          <MenuItem value="issued">Issued</MenuItem>
                          <MenuItem value="returned">Returned</MenuItem>
                          <MenuItem value="overdue">Overdue</MenuItem>
                          <MenuItem value="lost">Lost</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2}>
            <Pagination
              count={Math.ceil(filteredBooks.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IssuedBooksPage;
