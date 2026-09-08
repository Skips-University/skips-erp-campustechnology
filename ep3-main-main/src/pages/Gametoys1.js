import React, { useState } from "react";
import {
  Container,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField
} from "@mui/material";

// import API from "./api";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function App() {
  const [colid, setColid] = useState(global1.colid);
  const [game, setGame] = useState(null);

  const initGame = async () => {
    const res = await ep1.post("/ex/init", { colid });
    setGame(res.data);
  };

  const hireAgent = async () => {
    const res = await ep1.post("/ex/hire", { colid });
    setGame(res.data.game);
  };

  const runDay = async () => {
    const res = await ep1.post("/ex/run", { colid });
    setGame(res.data.game);
  };

  return (
    <Container style={{ marginTop: 40 }}>
      <Typography variant="h3" gutterBottom>
        🏭 Toy Empire
      </Typography>

      {/* <TextField
        label="COLID"
        value={colid}
        onChange={(e) => setColid(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      <br /> */}

      <Button variant="contained" onClick={initGame}>
        Start Game
      </Button>

      <Button variant="contained" onClick={hireAgent} style={{ marginLeft: 10 }}>
        Hire Agent
      </Button>

      <Button variant="contained" onClick={runDay} style={{ marginLeft: 10 }}>
        Run Day
      </Button>

      <Box>
        <TextField id="outlined-basic" placeholder="Salary per month"  type="number" sx={{ marginLeft: 0, width: 300}} label=""  variant="outlined" inputRef={salaryref} />
        
      </Box>

      {game && (
        <Grid container spacing={2} style={{ marginTop: 20 }}>
          <Grid item xs={4}>
            <Card sx={{ bgcolor: "#111", color: "#0f0" }}>
              <CardContent>
                <Typography>Balance</Typography>
                <Typography variant="h5">₹ {game.balance}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={4}>
            <Card sx={{ bgcolor: "#111", color: "#0ff" }}>
              <CardContent>
                <Typography>Total Toys</Typography>
                <Typography variant="h5">{Math.floor(game.totalToys)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={4}>
            <Card sx={{ bgcolor: "#111", color: "#f0f" }}>
              <CardContent>
                <Typography>Agents</Typography>
                <Typography variant="h5">
                  {game.agents?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}