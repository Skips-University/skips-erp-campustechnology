import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function POPrintPage() {
  const navigate = useNavigate();

  const [rfps, setRfps] = useState([]);
  const [rfpid, setRfpId] = useState('');

  const [pos, setPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [vendor, setVendor] = useState(null);

  const [institution, setInstitution] = useState(null);

  /* ================= LOAD RFP ================= */
  useEffect(() => {
    loadRFPs();
    loadInstitution();
  }, []);

  const loadInstitution = async () => {
  const res = await ep1.get(`/vins?colid=${global1.colid}`);
  setInstitution(res.data);
};

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

      <Grid item xs={12}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashdashfacnew')}
        >
          Back
        </Button>
      </Grid>

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
              {r._id} - {r.title || 'Untitled RFP'}
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
              {po.vendorname} - {po.title || 'Untitled PO'} - {po._id}
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
                .po-detail-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  border: 1px solid #d1d5db;
                  margin-top: 20px;
                }
                .po-detail-cell {
                  padding: 10px;
                  border-right: 1px solid #e5e7eb;
                  border-bottom: 1px solid #e5e7eb;
                }
                .po-grid-header,
                .po-grid-row {
                  display: grid;
                  grid-template-columns: 1.5fr 2fr 0.7fr 0.8fr 0.9fr;
                }
                .po-grid-header {
                  background: #f3f4f6;
                  font-weight: bold;
                  border: 1px solid #d1d5db;
                  border-bottom: none;
                }
                .po-grid-row {
                  border-left: 1px solid #e5e7eb;
                  border-right: 1px solid #e5e7eb;
                  border-bottom: 1px solid #e5e7eb;
                }
                .po-grid-cell {
                  padding: 9px;
                  border-right: 1px solid #e5e7eb;
                  word-break: break-word;
                }
                .po-charge-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  width: 320px;
                  border: 1px solid #d1d5db;
                }
                .po-sign-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  text-align: center;
                  gap: 18px;
                }
                `}
              </style>

              <div className="po-container">

                {/* ================= LOGO ================= */}
                {/* <div className="po-header">
                  <img
                    src="https://dypvp.edu.in/image/dypdpu-logo.png"
                    alt="logo"
                    style={{ height: 70 }}
                  />
                  <h2>Purchase Order</h2>
                </div> */}
                <div className="po-header">

  {institution?.logolink && (
    <img
      src={institution.logolink}
      alt="logo"
      style={{ height: 70 }}
    />
  )}

  <h2>{institution?.institutionname}</h2>

  <p style={{ margin: 0 }}>
    {institution?.address}
  </p>

  <h3 style={{ marginTop: 10 }}>Purchase Order</h3>

</div>

                {/* ================= DETAILS ================= */}
                <div className="po-section">
                  <div className="po-detail-grid">
                    <div className="po-detail-cell"><b>Vendor:</b> {vendor?.vendorname || '-'}</div>
                    <div className="po-detail-cell"><b>PO ID:</b> {selectedPO._id}</div>
                    <div className="po-detail-cell"><b>Email:</b> {vendor?.email || '-'}</div>
                    <div className="po-detail-cell"><b>Date:</b> {new Date(selectedPO.createdAt).toLocaleDateString()}</div>
                    <div className="po-detail-cell"><b>Phone:</b> {vendor?.phone || '-'}</div>
                    <div className="po-detail-cell"><b>PO Title:</b> {selectedPO.title || '-'}</div>
                  </div>
                </div>

                {/* ================= ITEMS GRID ================= */}
                <div className="po-section">
                  <div className="po-grid-header">
                    {['Item', 'Description', 'Qty', 'Price', 'Total'].map((heading) => (
                      <div className="po-grid-cell" key={heading}>{heading}</div>
                    ))}
                  </div>
                  {selectedPO.items.map((it, i) => (
                    <div className="po-grid-row" key={i}>
                      <div className="po-grid-cell">{it.itemname || '-'}</div>
                      <div className="po-grid-cell">{it.description || '-'}</div>
                      <div className="po-grid-cell" style={{ textAlign: 'right' }}>{it.quantity}</div>
                      <div className="po-grid-cell" style={{ textAlign: 'right' }}>{it.price}</div>
                      <div className="po-grid-cell" style={{ textAlign: 'right' }}>{it.quantity * it.price}</div>
                    </div>
                  ))}
                </div>

                {/* ================= CHARGES ================= */}
                <div
                  className="po-section"
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                  <div className="po-charge-grid">
                    {[
                      ['Transport', selectedPO.transport],
                      ['Loading', selectedPO.loadingfees],
                      ['P&F', selectedPO.pandffees],
                      ['GST', `${selectedPO.gst} %`],
                      ['Total', selectedPO.total]
                    ].map(([label, value]) => (
                      <React.Fragment key={label}>
                        <div className="po-grid-cell"><b>{label}</b></div>
                        <div className="po-grid-cell" style={{ textAlign: 'right' }}>{value}</div>
                      </React.Fragment>
                    ))}
                  </div>

                </div>

                <div>
                    <p>Terms and Conditions:</p>
                    <p>1. the amount value is rounded to the nearest amount.</p>
                    <p>2. The advances released for this work order shall be utilized for this work only. It will neither be used for any other work order nor for adjusting aginst outstanding from institution.</p>
                    <p>3. The rates mentioned in the Purchase Order / Work Order shall be firm for all supplies imcluding an extension of time.</p>
                    <p>4. As per applicable rates under Goods and Services Tax Act 2017, the vendor is responsoible to prepare an E-way bill online on the prescribed GST portal for transportation of goods. Any delivery, not accompanied by E-way bill is liable to be rejected.</p>
                    <p>5. You will be fully responsible for the safety of the workforce employed by you at the above site and we will not entertain any claim from you or your workers towards compensation or damages while working at the above site.</p>
                    <p>6. Above rates will be valid for working at all heights, depths and floor levels.</p>
                    <p>7. Material supplied by you shall be checked & validated by our IT Department & Store Department.</p>
                </div>

                <div className="po-section" style={{ marginTop: 40 }}>

  <div className="po-sign-grid">
    {['Prepared by', 'Checked by', 'Chancellor / Pro Chancellor'].map((label) => (
      <div key={label}>
        <div>____________________</div>
        <div style={{ marginTop: 8 }}>{label}</div>
      </div>
    ))}
  </div>

</div>

              </div>
            </div>

          </Paper>
        </Grid>
      )}

    </Grid>
  );
}
