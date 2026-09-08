import { useState } from "react";
import ep1 from '../api/ep1';
import global1 from './global1';
import { TextField, Button } from "@mui/material";

export default function BellConfig() {

  const [config, setConfig] = useState({
    colid: global1.colid,
    useNormalization: false,
    targetMean: 50,
    targetStdDev: 10,
    grades: []
  });

  const addGrade = () => {
    setConfig({
      ...config,
      grades: [...config.grades, { grade: "", minZ: "", maxZ: "", gradepoint: "" }]
    });
  };

  const save = async () => {
    await ep1.post("/bell/config/save", config);
    alert("Saved");
  };

  return (
    <div>
      <h2>Bell Curve Config</h2>

      {/* <TextField label="ColID"
        onChange={e => setConfig({ ...config, colid: e.target.value })} /> */}

      <TextField label="Target Mean"
        onChange={e => setConfig({ ...config, targetMean: e.target.value })} />

      <TextField label="Std Dev"
        onChange={e => setConfig({ ...config, targetStdDev: e.target.value })} />

      <Button onClick={addGrade}>Add Grade</Button>

      <Button onClick={async () => {
  await ep1.post("/bell/config/auto", { colid: global1.colid });
  alert("Auto bands generated");
}}>
  Auto Generate Bands
</Button>

      {config.grades.map((g, i) => (
        <div key={i}>
          <input placeholder="Grade"
            onChange={e => g.grade = e.target.value} />
          <input placeholder="MinZ"
            onChange={e => g.minZ = e.target.value} />
          <input placeholder="MaxZ"
            onChange={e => g.maxZ = e.target.value} />
          <input placeholder="Point"
            onChange={e => g.gradepoint = e.target.value} />
        </div>
      ))}

      <Button onClick={save}>Save Config</Button>
    </div>
  );
}