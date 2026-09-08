import React, { useEffect, useState } from 'react';
import ep1 from '../api/ep1';
import global1 from './global1';

import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Button
} from '@mui/material';

import {
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function VendorComparisonPage() {

  const [rfps, setRfps] = useState([]);
  const [rfpid, setRfpId] = useState('');

  const [vendors, setVendors] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [techScore, setTechScore] = useState({});

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    const res = await ep1.get(`/rfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  /* ================= LOAD COMPARISON ================= */
//   const loadComparison = async (id) => {

//     const res = await ep1.get(`/vcomparison/byrfp?rfpid=${id}`);
//     const data = res.data;

//     setVendors(data);

//     /* L1 */
//     const minTotal = Math.min(...data.map(v => v.total));

//     /* BUILD ROW MAP */
//     let itemMap = {};

//     data.forEach(v => {

//       v.items.forEach(it => {

//         if (!itemMap[it.itemname]) {
//           itemMap[it.itemname] = { id: it.itemname, item: it.itemname };
//         }

//         itemMap[it.itemname][v.vendorname] = it.price;
//       });

//       /* ADD CHARGES */
//       const charges = [
//         { key: 'transport', label: 'Transport' },
//         { key: 'loadingfees', label: 'Loading' },
//         { key: 'pandffees', label: 'P&F' },
//         { key: 'gst', label: 'GST' },
//         { key: 'total', label: 'Total' }
//       ];

//       charges.forEach(c => {

//         if (!itemMap[c.label]) {
//           itemMap[c.label] = { id: c.label, item: c.label };
//         }

//         itemMap[c.label][v.vendorname] = v[c.key];
//       });
//     });

//     setRows(Object.values(itemMap));

//     /* BUILD DYNAMIC COLUMNS */
//     let cols = [
//       {
//         field: 'item',
//         headerName: 'Item / Charges',
//         flex: 1,
//         pinned: 'left'
//       }
//     ];

//     data.forEach(v => {

//       cols.push({
//         field: v.vendorname,
//         headerName: v.vendorname,
//         flex: 1,

//         renderCell: (params) => {

//           const isTotalRow = params.row.item === 'Total';
//           const isL1 = isTotalRow && params.value === minTotal;

//           return (
//             <div
//               style={{
//                 width: '100%',
//                 textAlign: 'center',
//                 fontWeight: isTotalRow ? 'bold' : 'normal',
//                 background: isL1 ? '#c8e6c9' : 'transparent'
//               }}
//             >
//               {params.value ?? '-'}
//             </div>
//           );
//         }
//       });
//     });

//     setColumns(cols);
//   };

const loadComparison = async (id) => {

  const res = await ep1.get(`/vcomparison/full?rfpid=${id}`);

  const data = res.data.submissions;
  const rfp = res.data.rfp;

  setVendors(data);

  const minTotal = Math.min(...data.map(v => v.total));

  let itemMap = {};

  /* ================= ITEMS ================= */
  rfp.items.forEach(it => {

    itemMap[it.itemname] = {
      id: it.itemname,
      item: it.itemname,
      description: it.description
    };

    data.forEach(v => {

      const found = v.items.find(x => x.itemname === it.itemname);

      itemMap[it.itemname][v.vendorname] =
        found?.price || 0;
    });
  });

  /* ================= CHARGES ================= */
  const charges = [
    { key: 'transport', label: 'Transport' },
    { key: 'loadingfees', label: 'Loading' },
    { key: 'pandffees', label: 'P&F' },
    { key: 'gst', label: 'GST' },
    { key: 'total', label: 'Total' }
  ];

  charges.forEach(c => {

    itemMap[c.label] = {
      id: c.label,
      item: c.label,
      description: ''
    };

    data.forEach(v => {
      itemMap[c.label][v.vendorname] = v[c.key];
    });
  });

  /* ================= WARRANTY ================= */
  itemMap['Warranty'] = {
    id: 'Warranty',
    item: 'Warranty',
    description: ''
  };

  data.forEach(v => {
    itemMap['Warranty'][v.vendorname] = v.warranty;
  });

  /* ================= TECH DETAILS ================= */
  itemMap['Technical'] = {
    id: 'Technical',
    item: 'Technical Details',
    description: ''
  };

  data.forEach(v => {
    itemMap['Technical'][v.vendorname] = v.technicaldetails;
  });

  setRows(Object.values(itemMap));

  /* ================= COLUMNS ================= */
  let cols = [
    {
      field: 'item',
      headerName: 'Item',
      flex: 1
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2
    }
  ];

  data.forEach(v => {

    cols.push({
      field: v.vendorname,
      headerName: v.vendorname,
      flex: 1,

      renderCell: (params) => {

        const isTotalRow = params.row.item === 'Total';
        const isL1 = isTotalRow && params.value === minTotal;

        return (
          <div
            style={{
              width: '100%',
              padding: '4px',
              background: isL1 ? '#c8e6c9' : '',
              whiteSpace: 'normal'
            }}
          >
            {params.value ?? '-'}
          </div>
        );
      }
    });
  });

  setColumns(cols);
};

  /* ================= TECH SCORE ================= */
  const handleScore = (vendor, value) => {
    setTechScore({ ...techScore, [vendor]: value });
  };

  /* ================= CREATE PO ================= */
  const createPO = async (v) => {

    await ep1.post('/vcomparison/createpo', {
      rfpid,
      colid:global1.colid,
      vendor: v
    });

    alert('PO Created');
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* HEADER */}
      <Grid item xs={12}>
        <Typography variant="h5">
          Vendor Comparison and PO Creation
        </Typography>
      </Grid>

      {/* RFP SELECT */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={rfpid}
          onChange={(e) => {
            setRfpId(e.target.value);
            loadComparison(e.target.value);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id} - {r.title || 'Untitled RFP'}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* GRID */}
      <Grid item xs={12}>
        <Paper>

          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight

            getRowClassName={(params) =>
              params.row.item === 'Total' ? 'total-row' : ''
            }

            slots={{ toolbar: GridToolbar }}
          />

        </Paper>
      </Grid>

      {/* TECH SCORE + ACTION */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>

          {vendors.map(v => (
            <Grid container spacing={2} key={v._id} alignItems="center">

              <Grid item xs={3}>
                <Typography>{v.vendorname}</Typography>
              </Grid>

              <Grid item xs={3}>
                <TextField
                  label="Technical Score"
                  type="number"
                  value={techScore[v.vendorname] || ''}
                  onChange={(e) =>
                    handleScore(v.vendorname, e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={3}>
                <Button
                  variant="contained"
                  onClick={() => createPO(v)}
                >
                  Select & Create PO
                </Button>
              </Grid>

            </Grid>
          ))}

        </Paper>
      </Grid>

      {/* GRAPH */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>

          <Typography variant="h6">
            Total Comparison Chart
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={vendors.map(v => ({
                name: v.vendorname,
                total: v.total
              }))}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="total" fill="#ff9800" />
            </BarChart>
          </ResponsiveContainer>

        </Paper>
      </Grid>

    </Grid>
  );
}
