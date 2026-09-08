// src/pages/ResponsesPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const ROWS_PER_PAGE = 10;

export default function ResponsePage() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [page, setPage] = useState(0);
  const colid = global1.colid;

  const load = async () => {
    const [fRes, rRes] = await Promise.all([
      ep1.get("/api/v2/getsingleform", { params: { colid, formId } }),
      ep1.get("/api/v2/getresponses", { params: { colid, formId } }),
    ]);
    setForm(fRes.data);
    setResponses(rRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  if (!form) return <Typography>Loading…</Typography>;

  const handleChangePage = (_, newPage) => setPage(newPage);
  const paginated = responses.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE
  );

  return (
    <React.Fragment>
      <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h4" mb={2}>
            Responses: {form.title}
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  {form.fields.map((f) => (
                    <TableCell key={f.label}>{f.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((r) => (
                  <TableRow key={r._id}>
                    {form.fields.map((f) => (
                      <TableCell key={f.label}>
                        {r.data[f.label] ?? ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            component="div"
            count={responses.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={ROWS_PER_PAGE}
            rowsPerPageOptions={[]} // hide rows-per-page selector
            sx={{ mt: 2 }}
          />

          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={() => window.open(`/fill/${formId}`, "_blank")}
            >
              Share Link
            </Button>
          </Box>
        </Paper>
      </Container>
    </React.Fragment>
  );
}
