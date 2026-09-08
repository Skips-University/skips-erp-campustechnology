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

export default function POPrintPage() {

  const [rfps, setRfps] = useState([]);
  const [rfpid, setRfpId] = useState('');

  const [pos, setPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [vendor, setVendor] = useState(null);

  /* ================= LOAD RFP ================= */
  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    const res = await ep1.get(`/vrfp?colid=${global1.colid}`);
    setRfps(res.data);
  };

  /* ================= LOAD PO LIST ================= */
  const loadPOs = async (id) => {
    const res = await ep1.get(`/po/vpo?rfpid=${id}`);
    setPOs(res.data);
  };

  /* ================= LOAD PO DETAILS ================= */
  const loadPODetails = async (poid) => {
    const res = await ep1.get(`/po/vpo/full?poid=${poid}`);
    setSelectedPO(res.data.po);
    setVendor(res.data.vendor);
  };

  return (
    <Grid container spacing={2} padding={2}>

      {/* ================= HEADER ================= */}
      <Grid item xs={12}>
        <Typography variant="h5">
          PO Print Preview
        </Typography>
      </Grid>

      {/* ================= RFP SELECT ================= */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select RFP"
          value={rfpid}
          onChange={(e) => {
            setRfpId(e.target.value);
            loadPOs(e.target.value);
            setSelectedPO(null);
          }}
        >
          {rfps.map(r => (
            <MenuItem key={r._id} value={r._id}>
              {r._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ================= PO SELECT ================= */}
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Select PO"
          value={selectedPO?._id || ''}
          onChange={(e) => loadPODetails(e.target.value)}
        >
          {pos.map(po => (
            <MenuItem key={po._id} value={po._id}>
              {po.vendorname} - {po._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ================= PRINT BUTTON ================= */}
      <Grid item xs={4}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => window.print()}
          disabled={!selectedPO}
        >
          Print PO
        </Button>
      </Grid>

      {/* ================= PRINT AREA ================= */}
      {selectedPO && (
        <Grid item xs={12}>

          <Paper style={{ padding: 20 }}>

            <div id="printArea">

              {/* ================= PRINT CSS ================= */}
              <style>
                {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printArea, #printArea * {
                    visibility: visible;
                  }
                  #printArea {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                }

                .po-container {
                  width: 100%;
                  font-family: Arial;
                }

                .po-header {
                  text-align: center;
                  margin-bottom: 20px;
                }

                .po-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }

                .po-table th {
                  background: #f5f5f5;
                  border: 1px solid #ccc;
                  padding: 10px;
                  text-align: left;
                }

                .po-table td {
                  border: 1px solid #ccc;
                  padding: 10px;
                }

                .po-section {
                  margin-top: 20px;
                }
                `}
              </style>

              <div className="po-container">

                {/* ================= LOGO ================= */}
                <div className="po-header">
                  <img
                    src="https://dypvp.edu.in/image/dypdpu-logo.png"
                    alt="logo"
                    style={{ height: 70 }}
                  />
                  <h2>Purchase Order</h2>
                </div>

                {/* ================= DETAILS ================= */}
                <div className="po-section">

                  <table style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <td><b>Vendor:</b> {vendor?.vendorname || '-'}</td>
                        <td><b>PO ID:</b> {selectedPO._id}</td>
                      </tr>
                      <tr>
                        <td><b>Email:</b> {vendor?.email || '-'}</td>
                        <td><b>Date:</b> {new Date(selectedPO.createdAt).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td><b>Phone:</b> {vendor?.phone || '-'}</td>
                        {/* <td><b>Status:</b> {selectedPO.status}</td> */}
                      </tr>
                    </tbody>
                  </table>

                </div>

                {/* ================= ITEMS TABLE ================= */}
                <table className="po-table">

                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedPO.items.map((it, i) => (
                      <tr key={i}>
                        <td>{it.itemname}</td>
                        <td>{it.description}</td>
                        <td>{it.quantity}</td>
                        <td>{it.price}</td>
                        <td>{it.quantity * it.price}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>

                {/* ================= CHARGES ================= */}
                <div
                  className="po-section"
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                >

                  <table style={{ width: 300 }}>

                    <tbody>
                      <tr><td>Transport</td><td>{selectedPO.transport}</td></tr>
                      <tr><td>Loading</td><td>{selectedPO.loadingfees}</td></tr>
                      <tr><td>P&F</td><td>{selectedPO.pandffees}</td></tr>
                      <tr><td>GST</td><td>{selectedPO.gst}</td></tr>

                      <tr>
                        <td><b>Total</b></td>
                        <td><b>{selectedPO.total}</b></td>
                      </tr>

                    </tbody>

                  </table>

                </div>

                <div>
                    <p>Terms and Conditions:</p>
                    <p>1. the amount value is rounded to the nearest amount.</p>
                    <p>2. The advances released for this work order shall be utilized for this work only. It will neither be used for any other work order nor for adjusting aginst outstanding from institution.</p>
                    <p>3. The rates mentioned in the Purchase Order / Work Order shall be firm for all supplies imcluding an extension of time.</p>
                    <p>4. As per applicable rates under Goods and Services Tax Act 2017, the vendor is responsoible to prepare an E-way bill online on the prescribed GST portal for transportation of goods. Any delivery, not accompanied by E-way bill is liable to be rejected.</p>
                </div>

              </div>
            </div>

          </Paper>
        </Grid>
      )}

    </Grid>
  );
}