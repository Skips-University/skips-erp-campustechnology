import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ep1 from "../api/ep1";
import global1 from "./global1";

const detailFields = [
  ["Academic Year", "academicyear"],
  ["Name", "name"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["Address", "address"],
  ["Pin", "pin"],
  ["Gender", "gender"],
  ["Category", "category"],
  ["EWS", "ews"],
  ["PH", "ph"],
  ["Minority", "minority"],
  ["Tenth Marks", "tenthmarks"],
  ["Twelve Marks", "twelvemarks"],
  ["External Theory Marks", "externaltheorymarks"],
  ["English Marks", "englishmarks"],
  ["Date of Birth", "dateofbirth"],
  ["Date of Application", "dateofapplication"],
  ["Age", "age"],
  ["Twelve Subjects", "twelvesubjects"],
  ["Program Applied", "programapplied"],
  ["Program Code", "programcode"],
  ["Validation Status", "validationstatus"],
  ["Validation Comments", "validationcomments"],
  ["Application Status", "applicationstatus"]
];

export default function DynamicAdmissionProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
    loadProfile();
    loadInstitution();
  }, [id]);

  const loadProfile = async () => {
    const res = await ep1.get(`/admission-dynamic/application?colid=${global1.colid}&id=${id}`);
    setApplication(res.data || null);
  };

  const loadInstitution = async () => {
    const res = await ep1.get(`/vins?colid=${global1.colid}`);
    setInstitution(res.data || null);
  };

  const subjectRows = (rows = []) => rows.map((row, index) => ({ id: index + 1, ...row }));
  const extraRows = Object.entries(application?.extraFields || {}).map(([field, value], index) => ({
    id: index + 1,
    field,
    value
  }));
  const documentRows = (application?.documents || []).map((document, index) => ({
    id: index + 1,
    ...document,
    uploadedAtText: document.uploadedAt ? new Date(document.uploadedAt).toLocaleString("en-IN") : ""
  }));
  const photoDocument = (application?.documents || []).find((document) => (
    String(document.documenttype || "").toLowerCase() === "photo" && document.url
  ));

  const subjectColumns = [
    { field: "subject", headerName: "Subject", flex: 1 },
    { field: "marks", headerName: "Marks", flex: 0.6 }
  ];

  const extraColumns = [
    { field: "field", headerName: "Field", flex: 1 },
    { field: "value", headerName: "Value", flex: 1.5 }
  ];

  const documentColumns = [
    { field: "documenttype", headerName: "Document Type", flex: 1 },
    { field: "originalname", headerName: "File Name", flex: 1.4, valueGetter: (params) => params.row.originalname || params.row.filename || "" },
    { field: "description", headerName: "Description", flex: 1.5 },
    { field: "uploadedAtText", headerName: "Uploaded At", flex: 1 },
    {
      field: "view",
      headerName: "View",
      flex: 0.7,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.row.url ? (
        <Button
          size="small"
          startIcon={<OpenInNewIcon />}
          onClick={() => window.open(params.row.url, "_blank", "noopener,noreferrer")}
        >
          Open
        </Button>
      ) : null
    }
  ];

  return (
    <Grid container spacing={2} padding={2}>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .admission-profile-print, .admission-profile-print * { visibility: visible; }
            .admission-profile-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
            .no-print { display: none !important; }
            .MuiDataGrid-toolbarContainer, .MuiDataGrid-footerContainer { display: none !important; }
          }
        `}
      </style>

      <Grid item xs={12} className="no-print">
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dynamic-admission-applications")}>
            Back
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} disabled={!application}>
            Print
          </Button>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <Paper className="admission-profile-print" sx={{ p: 3 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {institution?.logolink && (
              <Box component="img" src={institution.logolink} alt="Institution logo" sx={{ maxHeight: 90, maxWidth: 180, objectFit: "contain", mb: 1 }} />
            )}
            <Typography variant="h5" fontWeight={700}>{institution?.institutionname || global1.insname || "Institution"}</Typography>
            <Typography color="text.secondary">{institution?.address || ""}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>Admission Student Profile</Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {application && (
            <>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={photoDocument ? 9 : 12}>
                  <Grid container spacing={1.5}>
                    {detailFields.map(([label, field]) => (
                      <Grid item xs={12} md={4} key={field}>
                        <Paper variant="outlined" sx={{ p: 1.5, minHeight: 72 }}>
                          <Typography variant="caption" color="text.secondary">{label}</Typography>
                          <Typography fontWeight={600}>{application[field] || "N/A"}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                {photoDocument && (
                  <Grid item xs={12} md={3}>
                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
                      <Box component="img" src={photoDocument.url} alt="Student" sx={{ width: "100%", maxHeight: 260, objectFit: "contain" }} />
                      <Typography variant="caption" color="text.secondary">{photoDocument.originalname || photoDocument.filename || "Uploaded Photo"}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Tenth Subject Marks</Typography>
                  <DataGrid
                    rows={subjectRows(application.tenthsubjectmarks)}
                    columns={subjectColumns}
                    autoHeight
                    slots={{ toolbar: GridToolbar }}
                    hideFooter
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Twelve Subject Marks</Typography>
                  <DataGrid
                    rows={subjectRows(application.twelvesubjectmarks)}
                    columns={subjectColumns}
                    autoHeight
                    slots={{ toolbar: GridToolbar }}
                    hideFooter
                  />
                </Grid>
                {extraRows.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Additional Details</Typography>
                    <DataGrid
                      rows={extraRows}
                      columns={extraColumns}
                      autoHeight
                      slots={{ toolbar: GridToolbar }}
                      hideFooter
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Uploaded Documents</Typography>
                  <DataGrid
                    rows={documentRows}
                    columns={documentColumns}
                    autoHeight
                    slots={{ toolbar: GridToolbar }}
                    hideFooter
                    localeText={{ noRowsLabel: "No documents uploaded" }}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
