import axios from "axios";
import global1 from "./global1";
import ep1 from '../api/ep1';

export default function BellConfig(){

  const colid = global1.colid;

  return(
    <div>

      <button onClick={()=>ep1.post("/rbell/config/auto",{colid})}>
        Auto Z Bands
      </button>

      <button onClick={()=>ep1.post("/rbell/config/percentile/auto",{colid})}>
        Auto Percentile
      </button>

    </div>
  );
}