import { useParams, useNavigate } from "react-router-dom";
import { menuGroups } from "../menuData";
import { Grid, Card, CardActionArea, Typography, Box, Button } from "@mui/material";

export default function MenuItemsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const group = menuGroups.find(g => g.id === groupId);

  if (!group) return <div>Not found</div>;

  return (
    <Box p={4}>
      <Button variant="contained" onClick={() => navigate("/")}>Back</Button>

      <Typography variant="h5" mb={3}>{group.title}</Typography>

      <Grid container spacing={3}>
        {group.items.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardActionArea
                onClick={() => navigate(item.path)}
                sx={{ height: 110, display: "flex", flexDirection: "column", justifyContent: "center" }}
              >
                {item.icon}
                <Typography mt={1} align="center">
                  {item.name}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}