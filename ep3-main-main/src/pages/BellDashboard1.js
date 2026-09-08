import { useState } from "react";
import axios from "axios";
import BellChart from "./BellChart2";
import ep1 from '../api/ep1';
import global1 from './global1';

export default function BellDashboard() {

  const [colid, setColid] = useState(global1.colid);
  const [data, setData] = useState([]);

  const load = async () => {
    const res = await ep1.post("/bell/exam/list", { colid });
    setData(res.data);
  };

  const apply = async () => {
    await ep1.post("/bell/curve/apply", { colid });
    load();
  };

  return (
    <div>
      {/* <input onChange={e => setColid(e.target.value)} /> */}
    

      <button onClick={load}>Load</button>
      <button onClick={apply}>Apply Curve</button>

      <BellChart data={data} />

      {data.map(d => (
        <div key={d._id}>
          {d.student} - {d.totalmarks} - {d.grade}
        </div>
      ))}
    </div>
  );
}