import { Slider, Switch } from "@mui/material";

export default function BellCurveControls({ config, setConfig }) {

  return (
    <div>

      <Switch
        checked={config.useNormalization}
        onChange={e =>
          setConfig({...config, useNormalization: e.target.checked})
        }
      />

      <p>Mean: {config.targetMean}</p>
      <Slider min={0} max={100}
        value={config.targetMean}
        onChange={(e, val) =>
          setConfig({...config, targetMean: val})
        }
      />

      <p>Std Dev: {config.targetStdDev}</p>
      <Slider min={1} max={30}
        value={config.targetStdDev}
        onChange={(e, val) =>
          setConfig({...config, targetStdDev: val})
        }
      />

    </div>
  );
}