
import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Input, Select, MenuItem, InputLabel } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function AddRoleListds({ open, handleClose, fetchViewPage }) {
    const nameref = useRef();
    const emailref = useRef();
    const Phoneref = useRef();
    const Passwordref = useRef();
    const Departmentref = useRef();
    const roleref = useRef();
    const genderref = useRef();
    const categoryref = useRef();

    const colid = global1.colid;
    const user = global1.user;
    const token = global1.token;

    const {
        transcript,
        listening,
        resetTranscript
    } = useSpeechRecognition();

    const setname = (id) => { if (transcript) { nameref.current.value = transcript; } }
    const setemail = (id) => { if (transcript) { emailref.current.value = transcript; } }
    const setPhone = (id) => { if (transcript) { Phoneref.current.value = transcript; } }
    const setPassword = (id) => { if (transcript) { Passwordref.current.value = transcript; } }
    const setDepartment = (id) => { if (transcript) { Departmentref.current.value = transcript; } }

    const searchapi = async () => {
        const name1 = nameref.current.value;
        const email = emailref.current.value;
        const Phone = Phoneref.current.value;
        const Password = Passwordref.current.value;
        const Department = Departmentref.current.value;
        const role = roleref.current.value;
        const gender = genderref.current.value;
        const category = categoryref.current.value;

        const response1 = await ep1.get('/api/v1/loginapif', { params: { email: email } });
        if (response1.data.status == 'Success') {
            alert('Email already exists.');
            return;
        }

        const response = await ep1.get('/api/v2/createnewfaculty1', {
            params: {
                user: user,
                token: token,
                colid: colid,
                name: name1,
                email: email,
                phone: Phone,
                password: Password,
                department: Department,
                role: role,
                gender: gender,
                category: category,
                status1: 'Submitted',
                comments: ''
            }
        });

        fetchViewPage();
        handleClose();
    };

    return (
        <Dialog fullScreen open={open} onClose={handleClose}>
            <DialogTitle>Add User with Role</DialogTitle>
            <DialogContent>
                <p>Microphone: {listening ? 'on' : 'off'}</p>
                <button onClick={SpeechRecognition.startListening}>Start</button>
                <button onClick={SpeechRecognition.stopListening}>Stop</button>
                <button onClick={resetTranscript}>Reset</button>
                <p>{transcript}</p>

                <button onClick={setname}>Set Name</button>
                <button onClick={setemail}>Set Email</button>
                <button onClick={setPhone}>Set Phone</button>
                <button onClick={setPassword}>Set Password</button>
                <button onClick={setDepartment}>Set Department</button>

                <br /><br />

                <p>Name</p>
                <TextField id="outlined-basic" type="text" sx={{ width: "100%" }} label="" variant="outlined" inputRef={nameref} /><br /><br />

                <p>Email</p>
                <TextField id="outlined-basic" type="text" sx={{ width: "100%" }} label="" variant="outlined" inputRef={emailref} /><br /><br />

                <p>Phone</p>
                <TextField id="outlined-basic" type="text" sx={{ width: "100%" }} label="" variant="outlined" inputRef={Phoneref} /><br /><br />

                <p>Password</p>
                <TextField id="outlined-basic" type="text" sx={{ width: "100%" }} label="" variant="outlined" inputRef={Passwordref} /><br /><br />

                <p>Department</p>
                <TextField id="outlined-basic" type="text" sx={{ width: "100%" }} label="" variant="outlined" inputRef={Departmentref} /><br /><br />

                <p>Role</p>
                <Select
                    sx={{ width: "100%" }}
                    displayEmpty
                    inputRef={roleref}
                    defaultValue=""
                >
                    <MenuItem value="">
                        <em>Select role</em>
                    </MenuItem>
                    <MenuItem value="Store">Store</MenuItem>
                    <MenuItem value="Purchase Manager">Purchase Manager</MenuItem>
                    <MenuItem value="Delivery">Delivery</MenuItem>
                    <MenuItem value="OE">OE</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                </Select>
                <br /><br />

                <p>Gender</p>
                <TextField id="outlined-basic" type="text" sx={{ width: "100%" }} label="" variant="outlined" inputRef={genderref} /><br /><br />

                <p>Category</p>
                <TextField id="outlined-basic" type="text" sx={{ width: "100%" }} label="" variant="outlined" inputRef={categoryref} /><br /><br />

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={searchapi} color="primary">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddRoleListds;
