import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Grid } from "@mui/material";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ep1 from '../api/ep1';
import global1 from './global1';

export default function PrepDepartmentDetails() {
  const { name } = useParams();

  const [items, setItems] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const fetchData = () => {
    ep1
      .get(`/prep/dept-items?department=${name}&colid=${global1.colid}`)
      .then((res) => setItems(res.data));

    ep1
      .get(`/prep/category-summary?department=${name}&colid=${global1.colid}`)
      .then((res) => setCategoryData(res.data));
  };

  useEffect(() => {
    fetchData();
  }, [name]);

  const columns = [
    { field: "itemname", headerName: "Item", flex: 1 },
    { field: "quantity", headerName: "Qty", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 }
  ];

  return (
    <Grid container spacing={2} p={2}>
      
      {/* ITEMS GRID */}
      <Grid item xs={12} md={7}>
        <div style={{ height: 450 }}>
          <DataGrid
            rows={items.map((d) => ({ id: d._id, ...d }))}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
          />
        </div>
      </Grid>

      {/* CATEGORY GRAPH */}
      <Grid item xs={12} md={5}>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="total"
              nameKey="_id"
              outerRadius={120}
            >
              {categoryData.map((_, i) => (
                <Cell key={i} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Grid>

    </Grid>
  );
}
