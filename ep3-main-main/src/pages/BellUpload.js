import { useState } from "react";
import { TextField, Button, Container } from "@mui/material";
import axios from "axios";
import ep1 from '../api/ep1';
import global1 from './global1';


export default function BellUpload() {
  const [data, setData] = useState({
    colid: global1.colid,
    student: "",
    regno: "",
    totalmarks: ""
  });

  const submit = async () => {
    await ep1.post("/bell/exam/create", data);
    alert("Saved");
  };

  return (
    <Container>
      <h2>Upload Marks</h2>

      {/* <TextField label="ColID" onChange={e => setData({...data, colid: e.target.value})} /> */}
      <TextField label="Student" onChange={e => setData({...data, student: e.target.value})} />
      <TextField label="Reg No" onChange={e => setData({...data, regno: e.target.value})} />
      <TextField label="Marks" onChange={e => setData({...data, totalmarks: e.target.value})} />

      <Button onClick={submit}>Save</Button>
    </Container>
  );
}