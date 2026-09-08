import React, { useEffect, useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Paper
} from '@mui/material';

import axios from 'axios';
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function PrApproverScreen() {

    const [colid, setColid] = useState(global1.colid);
    const [prList, setPrList] = useState([]);

    const fetchPRs = async () => {
        // const res = await axios.post('http://localhost:5000/getPrList', { colid });
        const res = await ep1.post('/getPrList', { colid });
        setPrList(res.data);
    };

    const handleNext = async (id) => {
        // await axios.post('http://localhost:5000/nextApprover', { prid: id });
        await ep1.post('/nextApprover', { prid: id });
        fetchPRs();
    };

    return (
        <Container maxWidth="lg">
            <Paper style={{ padding: 20, marginTop: 20 }} elevation={3}>
                <Typography variant="h5" gutterBottom>
                    MRN Approver Screen
                </Typography>

                {/* <TextField
                    label="COL ID"
                    value={colid}
                    onChange={(e) => setColid(e.target.value)}
                    style={{ marginRight: 10 }}
                /> */}

                <Button
                    variant="contained"
                    onClick={fetchPRs}
                >
                    Load MRNs
                </Button>
            </Paper>

            <Paper style={{ marginTop: 20 }} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>MRN ID</TableCell>
                            <TableCell>Template</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Approver</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {prList.map((pr) => (
                            <TableRow key={pr._id}>
                                <TableCell>{pr._id}</TableCell>
                                <TableCell>{pr.templateid}</TableCell>
                                <TableCell>{pr.level}</TableCell>
                                <TableCell>{pr.approverid}</TableCell>

                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleNext(pr._id)}
                                    >
                                        Next Approver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
}