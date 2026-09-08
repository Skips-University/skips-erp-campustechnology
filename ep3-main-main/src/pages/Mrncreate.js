import React, { useEffect, useState } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Grid,
    Autocomplete
} from "@mui/material";

// import api from "../api";
import ep1 from "../api/ep1";
import global1 from "./global1";

export default function PRCreate() {

    const [colid] = useState(global1.colid); // fixed or from login
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [form, setForm] = useState({
        name: global1.name,
        user:global1.user,
        faculty:global1.name,
        facultyid:global1.name,
        category:"",
        description: "",
        template: "",
        level: 1
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const res = await ep1.post("/getTemplates", { colid });
        setTemplates(res.data);
    };

    const handleSubmit = async () => {
        const payload = {
            ...form,
            template: selectedTemplate?._id,
            colid
        };

        await ep1.post("/createPR", payload);

        alert("MRN Created");

        setForm({
            name: "",
            description: "",
            template: "",
            level: 1
        });

        setSelectedTemplate(null);
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={4} sx={{ p: 4, mt: 5, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Create MRN
                </Typography>

                <Grid container spacing={3}>

                    {/* Template Dropdown (Searchable) */}
                    <Grid item xs={12}>
                        <Autocomplete
                            options={templates}
                            getOptionLabel={(option) => option.template || ""}
                            value={selectedTemplate}
                            onChange={(e, val) => setSelectedTemplate(val)}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Template" />
                            )}
                        />
                    </Grid>

                    {/* Name */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Category"
                            value={form.template}
                            onChange={(e) =>
                                setForm({ ...form, category: e.target.value })
                            }
                        />
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />
                    </Grid>

                    {/* Level (readonly default 1) */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Level"
                            value={1}
                            disabled
                        />
                    </Grid>

                    {/* Submit */}
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                        >
                            Submit PR
                        </Button>
                    </Grid>

                </Grid>
            </Paper>
        </Container>
    );
}