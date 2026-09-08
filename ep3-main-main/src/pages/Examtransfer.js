import React, { useState } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

function ExApp() {
    const [regno, setRegno] = useState('');
    const [colid, setColid] = useState(global1.colid);
    const [message, setMessage] = useState('');

    const exHandleSubmit = async () => {
        try {
            // const res = await axios.post('http://localhost:5000/exUpdateMarks', {
            const res = await ep1.post('/exUpdateMarks', {
                regno,
                colid,
                name: global1.name,
                user:global1.user
            });

            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error occurred');
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: 50 }}>
            <Typography variant="h5" gutterBottom>
                Update Student Marks
            </Typography>

            <TextField
                fullWidth
                label="Registration Number"
                margin="normal"
                value={regno}
                onChange={(e) => setRegno(e.target.value)}
            />
{/* 
            <TextField
                fullWidth
                label="College ID"
                margin="normal"
                value={colid}
                onChange={(e) => setColid(e.target.value)}
            /> */}

            <Button
                variant="contained"
                color="primary"
                onClick={exHandleSubmit}
                fullWidth
                style={{ marginTop: 20 }}
            >
                Update Marks
            </Button>

            {message && (
                <Typography style={{ marginTop: 20 }}>
                    {message}
                </Typography>
            )}
        </Container>
    );
}

export default ExApp;