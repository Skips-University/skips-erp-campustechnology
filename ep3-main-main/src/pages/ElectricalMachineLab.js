import React, { useState } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  TextField,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const experiments = ['DC Motor', 'Transformers', 'Induction Motor', 'Synchronous Generator'];

const ElectricalMachineLab = () => {
  const [selectedExp, setSelectedExp] = useState('DC Motor');
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [data, setData] = useState([]);
  const [result, setResult] = useState(null);

  const runSimulation = () => {
    const num = parseFloat(voltage) * parseFloat(current);
    const simData = Array.from({ length: 10 }, (_, i) => ({
      time: i,
      power: (i + 1) * num * 0.1,
    }));
    setData(simData);
    setResult(`Power: ${num.toFixed(2)} Watts`);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Virtual Lab Simulation – Electrical Machines
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6">Experiment Selection</Typography>
            <Select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            >
              {experiments.map((exp) => (
                <MenuItem key={exp} value={exp}>
                  {exp}
                </MenuItem>
              ))}
            </Select>

            <Typography variant="h6" sx={{ mt: 4 }}>
              Parameters
            </Typography>
            <TextField
              label="Voltage (V)"
              type="number"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label="Current (A)"
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              onClick={runSimulation}
            >
              Run Simulation
            </Button>

            {result && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                {result}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6">Simulation Output</Typography>
            <LineChart width={600} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="power" stroke="#8884d8" />
            </LineChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ElectricalMachineLab;
