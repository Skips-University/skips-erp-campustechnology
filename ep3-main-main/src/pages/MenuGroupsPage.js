import { Grid, Card, CardActionArea, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { menuGroups } from "../menuData";

export default function MenuGroupsPage() {
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <Grid container spacing={3}>
        {menuGroups.map((group) => (
          <Grid item xs={12} sm={6} md={2.4} key={group.id}>
            <Card>
              <CardActionArea
                onClick={() => navigate(`/menu/${group.id}`)}
                sx={{ height: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}
              >
                {group.icon}
                <Typography mt={1}>{group.title}</Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}