import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
} from "@mui/material";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import global1 from "./global1";
// import ep1 from "../ap1/ep1";
import ep1 from '../api/ep1';

const LIMIT = 10;

const LibraryBooksPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [libraryName, setLibraryName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({
    bookId: "",
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publishedDate: "",
    accessid: "",
    category: "",
    booklanguage: "",
    issuedstatus: "available",
    colid: Number(global1.colid),
  });
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState([]);

  const [issueForm, setIssueForm] = useState({
    regno: "",
    student: "",
    bookid: "",
    bookname: "",
    issuedate: "",
    duedate: "",
    expectedreturndate: "",
    fineperday: "",
    programcode: "",
    semester: "",
  });

  const fetchLibrary = async () => {
    try {
      const res = await ep1.get(`/api/v2/getlibrary/${id}`);
      const name = res.data.data?.libraryname || "";
      setLibraryName(name);
    } catch (error) {}
  };

  const fetchBooks = async (page = 1) => {
    try {
      console.log(global1.colid);

      const res = await ep1.get("/api/v2/getbooks", {
        params: {
          libraryid: id,
          page,
          limit: LIMIT,
          colid: Number(global1.colid),
        },
      });
      console.log(res);

      setBooks(res.data.data.books);
      setTotalPages(Math.ceil(res.data.data.total / LIMIT));
    } catch (error) {}
  };

  const handleOpenIssueDialog = (book) => {
    setSelectedBook(book);
    setIssueForm({
      regno: "",
      student: "",
      bookid: book.bookId,
      bookname: book.title,
      issuedate: "",
      duedate: "",
      expectedreturndate: "",
      fineperday: "",
      colid: Number(global1.colid) || 0,
    });
    setStudentQuery("");
    setStudentResults([]);
    setIssueDialogOpen(true);
  };

  const handleOpenEditDialog = (book) => {
    setEditForm(book);
    setEditDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setAddForm({
      bookId: "",
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      publishedDate: "",
      accessid: "",
      category: "",
      booklanguage: "",
      colid: Number(global1.colid),
      issuedstatus: "available",
    });
    setAddDialogOpen(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await ep1.get(`/api/v2/deletebook/${bookId}`);
      alert("Book deleted successfully!");
      fetchBooks(page);
    } catch (err) {
      alert("Failed to delete book.");
    }
  };

  const handleSubmitIssue = async () => {
    if (!issueForm.student || !issueForm.regno) {
      alert("Please select a valid student before issuing.");
      return;
    }

    const issueDate = new Date(issueForm.issuedate);
    const dueDate = new Date(issueForm.duedate);
    const finePerDay = parseFloat(issueForm.fineperday || "0");

    let fineAmount = 0;

    // ✅ Only calculate fine if book is being issued after due date (late issue)
    if (issueDate > dueDate && finePerDay > 0) {
      const daysLate = Math.ceil((issueDate - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * finePerDay;
    }

    const payload = {
      transactionid: `TXN-${Date.now()}`,
      libraryid: id,
      libraryname: libraryName,
      bookid: issueForm.bookid,
      bookname: issueForm.bookname,
      colid: Number(issueForm.colid) || 0,
      regno: issueForm.regno,
      student: issueForm.student,
      issuedate: issueForm.issuedate,
      duedate: issueForm.duedate,
      expectedreturndate: issueForm.expectedreturndate,
      fineperday: issueForm.fineperday,
      issuestatus: "issued",
    };

    try {
      // ✅ 1. Create issued book record
      const res = await ep1.post("/api/v2/issuebook/create", payload);

      // ✅ 2. Update book's issued status
      await ep1.post(`/api/v2/updatebook/${selectedBook._id}`, {
        issuedstatus: "issued",
      });

      // ✅ 3. Create fine entry only if calculated fineAmount > 0
      if (fineAmount > 0) {
        const finePayload = {
          name: global1.name,
          user: global1.user,
          feegroup: "Library",
          regno: issueForm.regno,
          student: issueForm.student,
          feeitem: `Fine for ${issueForm.bookname}`,
          amount: parseFloat(fineAmount.toFixed(2)),
          paymode: "unpaid",
          paydetails: "",
          feecategory: "fine",
          semester: issueForm.semester,
          type: "library",
          installment: "N/A",
          comments: `Late issue fine`,
          academicyear: "2025-26",
          colid: Number(global1.colid) || 0,
          classdate: issueDate,
          status: "due",
          programcode: issueForm.programcode
        };

        await ep1.post(`/api/v2/createledgerstud`, finePayload);
      }

      alert("Book issued successfully!");
      setIssueDialogOpen(false);
      fetchBooks(page);
    } catch (error) {
      alert("Failed to issue book.");
    }
  };

  const handleSubmitEdit = async () => {
    try {
      await ep1.post(`/api/v2/updatebook/${editForm._id}`, editForm);
      alert("Book updated successfully!");
      setEditDialogOpen(false);
      fetchBooks(page);
    } catch (err) {
      alert("Failed to update book.");
    }
  };

  const handleSubmitAdd = async () => {
    try {
      await ep1.post("/api/v2/createbook", {
        ...addForm,
        libraryid: id,
        libraryname: libraryName,
      });
      alert("Book added successfully!");
      setAddDialogOpen(false);
      fetchBooks(page);
    } catch (err) {
      alert("Failed to add book.");
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return fetchBooks(1);
    try {
      const res = await ep1.get("/api/v2/searchbooks", {
        params: { query: search, libraryid: id, page, limit: LIMIT },
      });
      setBooks(res.data.data);
      setTotalPages(Math.ceil(res.data.total / LIMIT));
    } catch (error) {}
  };

  useEffect(() => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setIssueDialogOpen(false);
    fetchLibrary();
  }, [id]);

  useEffect(() => {
    fetchBooks(page);
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const trimmedQuery = studentQuery.trim();
      if (!trimmedQuery) {
        setStudentResults([]);
        setIssueForm((prev) => ({ ...prev, student: "" }));
        return;
      }

      try {
        const res = await ep1.get("/api/v2/searchstudent", {
          params: { regno: trimmedQuery },
        });

        if (res.data?.data) {
          const s = res.data.data;
          const student = { regno: s.regno, name: s.name, programcode: s.programcode, semester: s.semester };

          // 🟢 Update both state and UI fields
          setStudentResults([student]);
          setIssueForm((prev) => ({
            ...prev,
            regno: student.regno,
            student: student.name,
            programcode: student.programcode,
            semester: student.semester
          }));
        } else {
          setStudentResults([]);
          setIssueForm((prev) => ({ ...prev, student: "" }));
        }
      } catch {
        setStudentResults([]);
        setIssueForm((prev) => ({ ...prev, student: "" }));
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [studentQuery]);
  return (
    <Box>
      <Button>
        <ArrowBack onClick={() => navigate("/admin/libraries")} />
      </Button>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: 600 }}
      >
        {libraryName ? `${libraryName} - Books` : "Library Books"}
      </Typography>

      <Box
        display="flex"
        justifyContent="center"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books"
          size="small"
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setSearch("");
            fetchBooks(1);
          }}
        >
          Clear
        </Button>
      </Box>

      <Box display="flex" justifyContent="center" gap={2} mb={2}>
        <Button variant="contained" onClick={handleOpenAddDialog}>
          Add Book
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate(`/library/${id}/issuedbooks`)}
        >
          View Issued Books
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(`/library/${id}/report`)}
        >
          View Report
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxWidth: 1000, mx: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Publisher</TableCell>
              <TableCell>Published Date</TableCell>
              <TableCell>Access ID</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book._id} hover>
                <TableCell
                  sx={{
                    color:
                      book.issuedstatus === "available"
                        ? "green"
                        : book.issuedstatus === "issued"
                        ? "orange"
                        : "inherit",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {book.issuedstatus}
                </TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.isbn}</TableCell>
                <TableCell>{book.publisher}</TableCell>
                <TableCell>{book.publishedDate}</TableCell>
                <TableCell>{book.accessid}</TableCell>
                <TableCell>{book.category}</TableCell>
                <TableCell>{book.booklanguage}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenEditDialog(book)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteBook(book._id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleOpenIssueDialog(book)}
                      disabled={book.issuedstatus === "issued"}
                    >
                      Issue
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Add Book Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add Book</DialogTitle>
        <DialogContent>
          {Object.keys(addForm)
            .filter((field) => field !== "colid" && field !== "issuedstatus")
            .map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                fullWidth
                margin="dense"
                value={addForm[field] || ""}
                onChange={(e) =>
                  setAddForm({ ...addForm, [field]: e.target.value })
                }
              />
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Book - {editForm.title}</DialogTitle>
        <DialogContent>
          {Object.keys(addForm).map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              fullWidth
              margin="dense"
              value={editForm[field] || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, [field]: e.target.value })
              }
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Issue Book Dialog */}
      <Dialog open={issueDialogOpen} onClose={() => setIssueDialogOpen(false)}>
        <DialogTitle>Issue Book - {selectedBook?.title}</DialogTitle>
        <DialogContent>
          {/* Student search input */}
          <TextField
            label="Search Student"
            fullWidth
            margin="dense"
            value={studentQuery}
            onChange={(e) => {
              const value = e.target.value;
              setStudentQuery(value);
              setIssueForm((prev) => ({ ...prev, regno: value }));
            }}
          />

          {/* 🔽 Dropdown suggestion box */}
          {studentResults.map((s) => (
            <Box
              key={s.regno}
              onClick={() => {
                setIssueForm((prev) => ({
                  ...prev,
                  regno: s.regno,
                  student: s.name,
                }));
                setStudentQuery(`${s.regno}`); // Keep only regno in input
                setStudentResults([]);
              }}
              sx={{
                p: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "#eee" },
              }}
            >
              {s.name} ({s.regno})
            </Box>
          ))}

          {/* ✅ Read-only student name display */}
          {issueForm.student && (
            <TextField
              label="Student Name"
              fullWidth
              margin="dense"
              value={issueForm.student}
              InputProps={{ readOnly: true }}
            />
          )}

          {/* Rest of the fields */}
          <TextField
            label="Issue Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={issueForm.issuedate}
            onChange={(e) =>
              setIssueForm({ ...issueForm, issuedate: e.target.value })
            }
          />
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={issueForm.duedate}
            onChange={(e) =>
              setIssueForm({ ...issueForm, duedate: e.target.value })
            }
          />
          <TextField
            label="Expected Return Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={issueForm.expectedreturndate}
            onChange={(e) =>
              setIssueForm({ ...issueForm, expectedreturndate: e.target.value })
            }
          />
          <TextField
            label="Fine Per Day"
            fullWidth
            margin="dense"
            value={issueForm.fineperday}
            onChange={(e) =>
              setIssueForm({ ...issueForm, fineperday: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitIssue}>
            Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LibraryBooksPage;
