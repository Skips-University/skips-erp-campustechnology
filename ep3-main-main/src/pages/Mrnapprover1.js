import React, { useState } from 'react';
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
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

export default function PrApproverScreen() {

    const [colid, setColid] = useState(global1.colid);
    const [prList, setPrList] = useState([]);
    const [selectedPrId, setSelectedPrId] = useState(null);
    const [prItems, setPrItems] = useState([]);

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

    // 🔥 NEW: Load PR Items on row click
    const handleRowClick = async (pr) => {
        setSelectedPrId(pr._id);

        // const res = await axios.post('http://localhost:5000/getPrItems', {
        const res = await ep1.post('/getPrItems', {
            prid: pr._id
        });

        setPrItems(res.data);
    };

    return (
        <Container maxWidth="lg">

            {/* FILTER */}
            <Paper style={{ padding: 20, marginTop: 20 }} elevation={3}>
                <Typography variant="h5">MRN Approver Screen</Typography>

                {/* <TextField
                    label="COL ID"
                    value={colid}
                    onChange={(e) => setColid(e.target.value)}
                    style={{ marginRight: 10 }}
                /> */}

                <Button variant="contained" onClick={fetchPRs}>
                    Load MRNs
                </Button>
            </Paper>

            {/* PR LIST */}
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
                            <TableRow
                                key={pr._id}
                                hover
                                onClick={() => handleRowClick(pr)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor:
                                        selectedPrId === pr._id ? '#f0f7ff' : 'white'
                                }}
                            >
                                <TableCell>{pr._id}</TableCell>
                                <TableCell>{pr.templateid}</TableCell>
                                <TableCell>{pr.level}</TableCell>
                                <TableCell>{pr.approverid}</TableCell>

                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent row click
                                            handleNext(pr._id);
                                        }}
                                    >
                                        Next
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* 🔥 PR ITEMS SECTION */}
            {selectedPrId && (
                <Paper style={{ marginTop: 20, padding: 20 }} elevation={3}>
                    <Typography variant="h6">
                    Items for: {selectedPrId}
                    </Typography>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell>Category</TableCell>
                                {/* <TableCell>Qty</TableCell>
                                <TableCell>Price</TableCell> */}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {prItems.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>{item.item}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.qty}</TableCell>
                                    <TableCell>{item.price}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Container>
    );
}