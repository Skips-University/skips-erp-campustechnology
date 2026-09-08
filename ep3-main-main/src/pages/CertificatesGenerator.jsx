import { useState } from "react";
import global1 from './global1';
import ep1 from '../api/ep1';
import {
  Box,
  Button,
  Container,
  Divider,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import generateBonafidePDF from "../utils/generatebonafidecertif";
import generateDegreePDF from "../utils/generateDegreeCertificate";
import generateTransferPDF from "../utils/generateTC";
import generateAdmissionLetterPDF from "../utils/generateadmissionletter";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const CERTIFICATE_TYPES = [
  "Bonafide",
  "Degree",
  "Transfer",
  "Admission Letter",
];

const CertificateGenerator = () => {
  const navigate = useNavigate();
  const [regno, setRegno] = useState("");
  const [certificateType, setCertificateType] = useState("Bonafide");
  const [userData, setUserData] = useState(null);
  const [additionalData, setAdditionalData] = useState({});

  const fetchUser = async () => {
    try {
       const response = await ep1.get(`/api/v2/users/byregno/${regno}`, { });
      // const res = await axios.get(
      //   `http://localhost:8080/api/v2/users/byregno/${regno}`
      // );
      setUserData(response.data);
    } catch (err) {
      alert("User not found");
    }
  };

  const handleGenerate = () => {
    if (!userData) return alert("Please fetch user first");
    const payload = { ...userData, ...additionalData };

    switch (certificateType) {
      case "Bonafide":
        generateBonafidePDF(payload);
        break;
      case "Degree":
        generateDegreePDF(payload);
        break;
      case "Transfer":
        generateTransferPDF(payload);
        break;
      case "Admission Letter":
        generateAdmissionLetterPDF(payload);
        break;
      default:
        alert("Invalid type");
    }
  };

  const renderAdditionalFields = () => {
    switch (certificateType) {
      case "Bonafide":
        return (
          <>
      <TextField
        label="Purpose"
        fullWidth
        margin="dense"
        value={additionalData.purpose || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, purpose: e.target.value })
        }
      />
      <TextField
        label="Institution Name"
        fullWidth
        margin="dense"
        value={additionalData.institutionName || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            institutionName: e.target.value,
          })
        }
      />
      <TextField
        label="Authorized Person Name"
        fullWidth
        margin="dense"
        value={additionalData.signatoryName || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            signatoryName: e.target.value,
          })
        }
      />
    </>
        );
      case "Degree":
        return (
          <>
            <TextField
              label="Major Field"
              fullWidth
              margin="dense"
              value={additionalData.majorField || ""}
              onChange={(e) =>
                setAdditionalData({ ...additionalData, majorField: e.target.value })
              }
            />
            <TextField
              label="Issue Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              margin="dense"
              value={additionalData.issueDate || ""}
              onChange={(e) =>
                setAdditionalData({ ...additionalData, issueDate: e.target.value })
              }
            />
            <TextField
              label="Chancellor Name"
              fullWidth
              margin="dense"
              value={additionalData.chancellor || ""}
              onChange={(e) =>
                setAdditionalData({ ...additionalData, chancellor: e.target.value })
              }
            />
            <TextField
              label="Dean Name"
              fullWidth
              margin="dense"
              value={additionalData.dean || ""}
              onChange={(e) =>
                setAdditionalData({ ...additionalData, dean: e.target.value })
              }
            />
            <TextField
              label="Registrar Name"
              fullWidth
              margin="dense"
              value={additionalData.registrar || ""}
              onChange={(e) =>
                setAdditionalData({ ...additionalData, registrar: e.target.value })
              }
            />
            <TextField
              label="Faculty Name"
              fullWidth
              margin="dense"
              value={additionalData.facultyName || ""}
              onChange={(e) =>
                setAdditionalData({ ...additionalData, facultyName: e.target.value })
              }
            />
          </>
        );
      case "Transfer":
        return (
          <>
      <TextField
        label="Institution Name"
        fullWidth
        margin="dense"
        value={additionalData.institutionName || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, institutionName: e.target.value })
        }
      />
      <TextField
        label="Authorized Person Name"
        fullWidth
        margin="dense"
        value={additionalData.authorizedName || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, authorizedName: e.target.value })
        }
      />
      <TextField
        label="Location"
        fullWidth
        margin="dense"
        value={additionalData.location || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, location: e.target.value })
        }
      />
      <TextField
        label="Date of Admission"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        margin="dense"
        value={additionalData.admissionDate || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            admissionDate: e.target.value,
          })
        }
      />
      <TextField
        label="Date of Leaving"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        margin="dense"
        value={additionalData.leavingDate || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            leavingDate: e.target.value,
          })
        }
      />
      <TextField
        label="Reason for Leaving"
        fullWidth
        margin="dense"
        value={additionalData.reason || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, reason: e.target.value })
        }
      />
      <TextField
        label="Performance"
        fullWidth
        margin="dense"
        value={additionalData.performance || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, performance: e.target.value })
        }
      />
    </>
        );
      case "Admission Letter":
        return (
          <>
      <TextField
        label="Specialization"
        fullWidth
        margin="dense"
        value={additionalData.specialization || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, specialization: e.target.value })
        }
      />
      <TextField
        label="Start Date"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        margin="dense"
        value={additionalData.startDate || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, startDate: e.target.value })
        }
      />
      <TextField
        label="Program Duration"
        fullWidth
        margin="dense"
        value={additionalData.duration || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, duration: e.target.value })
        }
      />
      <TextField
        label="Admission Fee"
        fullWidth
        margin="dense"
        value={additionalData.admissionFee || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, admissionFee: e.target.value })
        }
      />
      <TextField
        label="Acceptance Deadline"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        margin="dense"
        value={additionalData.acceptanceDeadline || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, acceptanceDeadline: e.target.value })
        }
      />
      <TextField
        label="Portal Link"
        fullWidth
        margin="dense"
        value={additionalData.portalLink || ""}
        onChange={(e) =>
          setAdditionalData({ ...additionalData, portalLink: e.target.value })
        }
      />
      <TextField
        label="Institution Name"
        fullWidth
        margin="dense"
        value={additionalData.institution?.name || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            institution: {
              ...(additionalData.institution || {}),
              name: e.target.value,
            },
          })
        }
      />
      <TextField
        label="Institution Address"
        fullWidth
        margin="dense"
        value={additionalData.institution?.address || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            institution: {
              ...(additionalData.institution || {}),
              address: e.target.value,
            },
          })
        }
      />
      <TextField
        label="Admissions Email"
        fullWidth
        margin="dense"
        value={additionalData.institution?.admissionsEmail || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            institution: {
              ...(additionalData.institution || {}),
              admissionsEmail: e.target.value,
            },
          })
        }
      />
      <TextField
        label="Admissions Phone"
        fullWidth
        margin="dense"
        value={additionalData.institution?.admissionsPhone || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            institution: {
              ...(additionalData.institution || {}),
              admissionsPhone: e.target.value,
            },
          })
        }
      />
      <TextField
        label="Signatory Name"
        fullWidth
        margin="dense"
        value={additionalData.authorizedSignatory?.name || ""}
        onChange={(e) =>
          setAdditionalData({
            ...additionalData,
            authorizedSignatory: {
              ...(additionalData.authorizedSignatory || {}),
              name: e.target.value,
            },
          })
        }
      />
    </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
       <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                                <Button
                                  startIcon={<ArrowBack />}
                                  onClick={() => navigate("/dashdashfacnew")}
                                >
                                  Back
                                </Button>
                              </Box>
      <Typography variant="h5" gutterBottom>
        Certificate Generator (Admin)
      </Typography>

      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <TextField
          label="Enter Reg No"
          value={regno}
          onChange={(e) => setRegno(e.target.value)}
        />
        <Button variant="contained" onClick={fetchUser}>
          Fetch Student
        </Button>
      </Box>

      {userData && (
        <Box mb={2}>
          <Typography variant="subtitle1">Name: {userData.name}</Typography>
          <Typography variant="subtitle2">
            Program: {userData.programcode}, Reg: {userData.regno}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box mb={2}>
        <Select
          fullWidth
          value={certificateType}
          onChange={(e) => {
            setCertificateType(e.target.value);
            setAdditionalData({});
          }}
        >
          {CERTIFICATE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {renderAdditionalFields()}

      <Button variant="contained" color="primary" fullWidth onClick={handleGenerate}>
        Generate {certificateType} PDF
      </Button>
    </Container>
  );
};

export default CertificateGenerator;