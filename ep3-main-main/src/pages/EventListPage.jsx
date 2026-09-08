// src/pages/EventsListPage.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import global1 from "./global1";
import ep1 from "../api/ep1";

export default function EventsListPage() {
  const colid = global1.colid;
  const userRole = global1.role;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!colid) return;
    const user=global1.user;
    
    ep1
      // .get(`/api/v2/getevents?colid=${colid}`)
      .get(`/api/v2/geteventsuser?colid=${colid}&user=${user}`)
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, [colid]);

  if (loading)
    return (
      <CircularProgress style={{ display: "block", margin: "64px auto" }} />
    );

  return (
    <React.Fragment>
    <Paper style={{ padding: 16, marginTop: 8 }}>
      <Typography variant="h5" gutterBottom>
        All Events
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Start&nbsp;Date</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Coordinator</TableCell>
              {/* <TableCell>Status</TableCell> */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {events.map((ev) => {
              const upcoming = ev.status1 === "Upcoming";
              return (
                <TableRow key={ev._id}>
                  <TableCell>{ev.event}</TableCell>
                  <TableCell>
                    {new Date(ev.startdate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{ev.department}</TableCell>
                  <TableCell>{ev.type}</TableCell>
                  <TableCell>{ev.coordinator}</TableCell>
                  {/* <TableCell>
                    <Chip label={ev.status1} size="small" />
                  </TableCell> */}

                  <TableCell>
                    <Box display="flex" gap={1} alignItems="center">
                      {/* <Button
                        variant="outlined"
                        size="small"
                        disabled={!upcoming}
                        onClick={() => navigate(`/event/${ev._id}/register`)}
                      >
                        Register
                      </Button> */}

                      {/* <Button
                        variant="contained"
                        size="small"
                        disabled={!upcoming}
                        onClick={() => navigate(`/event/${ev._id}/${colid}`)}
                      >
                        Enter
                      </Button> */}

                      {userRole === "Faculty" && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            navigate(`/event/${ev._id}/approvespeakers`)
                          }
                        >
                          Approve
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    </React.Fragment>
  );
}
