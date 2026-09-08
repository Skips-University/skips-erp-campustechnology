import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Backdrop,
  CircularProgress,
  IconButton,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import axios from "axios"; // ✅ For external API calls
import global1 from "./global1";
import * as XLSX from "xlsx";

export default function AiDataManager() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I can help you add data to your system. Type the module name to get started (e.g., students, leads, projects).",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // State management
  const [selectedApi, setSelectedApi] = useState(null);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [bulkUploadMode, setBulkUploadMode] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState(false);
  const [manualEntryData, setManualEntryData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lastUploadedData, setLastUploadedData] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchGeminiApiKey();
  }, []);

  // Fetch Gemini API Key
  const fetchGeminiApiKey = async () => {
    try {
      const response = await ep1.get("/api/v2/getactiveapikeyds", {
        params: {
          colid: global1.colid,
          user: global1.user,
        },
      });
      if (response.data.success) {
        setGeminiApiKey(response.data.data.geminiApiKey);
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
    }
  };

  // ==================== ✅ API CALL HELPER ====================
  // This function handles both internal (ep1) and external (axios) API calls
  // Also respects paramLocation (body/query/both)
  const makeApiCall = async (apiConfig, endpoint, payload, method = null) => {
    const httpMethod = (method || apiConfig.method || "POST").toUpperCase();
    const isInternal = apiConfig.isInternalApi !== false;
    const paramLocation = apiConfig.paramLocation || "body";

    try {
      let response;

      if (isInternal) {
        console.log(`📡 Internal API: ${httpMethod} ${endpoint}`);
        console.log(`📦 Param Location: ${paramLocation}`);
        console.log(`📨 Payload:`, payload);

        // ✅ FIXED: Use explicit method calls instead of ep1[httpMethod]
        if (paramLocation === "query") {
          // Send everything in query string
          if (httpMethod === "GET") {
            response = await ep1.get(endpoint, { params: payload });
          } else if (httpMethod === "POST") {
            response = await ep1.post(endpoint, null, { params: payload });
          } else if (httpMethod === "PUT") {
            response = await ep1.put(endpoint, null, { params: payload });
          } else if (httpMethod === "DELETE") {
            response = await ep1.delete(endpoint, { params: payload });
          }
        } else if (paramLocation === "both") {
          // Send in both query and body
          if (httpMethod === "GET") {
            response = await ep1.get(endpoint, { params: payload });
          } else if (httpMethod === "POST") {
            response = await ep1.post(endpoint, payload, { params: payload });
          } else if (httpMethod === "PUT") {
            response = await ep1.put(endpoint, payload, { params: payload });
          }
        } else {
          // Default: send in body
          if (httpMethod === "GET") {
            response = await ep1.get(endpoint, { params: payload });
          } else if (httpMethod === "POST") {
            response = await ep1.post(endpoint, payload);
          } else if (httpMethod === "PUT") {
            response = await ep1.put(endpoint, payload);
          } else if (httpMethod === "PATCH") {
            response = await ep1.patch(endpoint, payload);
          } else if (httpMethod === "DELETE") {
            response = await ep1.delete(endpoint, { data: payload });
          }
        }
      } else {
        // External API with axios
        const fullUrl = `${apiConfig.domain || ""}${endpoint}`;
        console.log(`🌐 External API: ${httpMethod} ${fullUrl}`);
        console.log(`📦 Param Location: ${paramLocation}`);
        console.log(`📨 Payload:`, payload);

        const axiosConfig = {
          method: httpMethod,
          url: fullUrl,
          timeout: apiConfig.timeout || 30000,
          headers: {},
        };

        if (apiConfig.headers) {
          try {
            axiosConfig.headers = JSON.parse(apiConfig.headers);
          } catch (e) {
            axiosConfig.headers = {};
          }
        }

        if (apiConfig.authType === "bearer" && apiConfig.authToken) {
          axiosConfig.headers.Authorization = `Bearer ${apiConfig.authToken}`;
        } else if (
          apiConfig.authType === "apikey" &&
          apiConfig.authToken &&
          apiConfig.authHeader
        ) {
          axiosConfig.headers[apiConfig.authHeader] = apiConfig.authToken;
        } else if (
          apiConfig.authType === "basic" &&
          apiConfig.username &&
          apiConfig.password
        ) {
          const credentials = btoa(
            `${apiConfig.username}:${apiConfig.password}`
          );
          axiosConfig.headers.Authorization = `Basic ${credentials}`;
        }

        if (paramLocation === "query") {
          axiosConfig.params = payload;
        } else if (paramLocation === "both") {
          axiosConfig.params = payload;
          axiosConfig.data = payload;
        } else {
          if (httpMethod === "GET") {
            axiosConfig.params = payload;
          } else {
            axiosConfig.data = payload;
          }
        }

        response = await axios(axiosConfig);
      }

      console.log("✅ Response:", response.data);
      return response;
    } catch (error) {
      console.error("❌ API Call Error:", error);
      console.error("Error details:", error.response?.data || error.message);
      throw error;
    }
  };

  // Search for configured data APIs
  const searchDataApis = async (searchString) => {
    try {
      // ✅ UPDATED: Search without user/colid filter
      const response = await ep1.get("/api/v2/searchdataapis", {
        params: {
          searchstring: searchString,
        },
      });

      if (response.data.status === "success" && response.data.data.length > 0) {
        const buttons = response.data.data.map((api) => ({
          id: api._id,
          label: api.name,
          apiname: api.apiname,
          config: api,
        }));

        return {
          text: `Found ${buttons.length} module(s) matching "${searchString}":`,
          buttons: buttons,
        };
      } else {
        return {
          text: `No modules found matching "${searchString}". Please configure the API first or try different keywords.`,
          buttons: [{ id: "config_new", label: "Configure New Module" }],
        };
      }
    } catch (error) {
      return {
        text: `Error searching modules: ${error.message}`,
      };
    }
  };

  // Show options after selecting a module
  const showModuleOptions = (apiConfig) => {
    setSelectedApi(apiConfig);

    const buttons = [];

    if (apiConfig.supportsManualEntry) {
      buttons.push({
        id: "manual_entry",
        label: "✍️ Add Data Manually",
        handler: () => startManualEntry(apiConfig),
      });
    }

    buttons.push({
      id: "bulk_upload",
      label: "📁 Upload from Excel",
      handler: () => startBulkUpload(apiConfig),
    });

    buttons.push({
      id: "image_upload",
      label: "🖼️ Extract from Image/PDF (AI)",
      handler: () => startImageUpload(apiConfig),
    });

    buttons.push({
      id: "download_format",
      label: "📥 Download Excel Format",
      handler: () => downloadFormat(apiConfig),
    });

    buttons.push({
      id: "search_again",
      label: "🔍 Search Another Module",
      handler: () => handleSearchAgain(),
    });

    return {
      text: `Selected: ${apiConfig.name}\n\nWhat would you like to do?`,
      buttons: buttons,
    };
  };

  // Start image upload mode
  const startImageUpload = (apiConfig) => {
    setImageUploadMode(true);
    setManualEntryMode(false);
    setBulkUploadMode(false);
    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    const requiredFields = apiConfig.requiredFields
      .split(",")
      .map((f) => f.trim());
    const optionalFields = apiConfig.optionalFields
      ? apiConfig.optionalFields.split(",").map((f) => f.trim())
      : [];

    let fieldsList = "**Fields to Extract:**\n";
    requiredFields.forEach((field) => {
      fieldsList += `• ${field} (required)\n`;
    });

    if (optionalFields.length > 0) {
      optionalFields.forEach((field) => {
        fieldsList += `• ${field} (optional)\n`;
      });
    }

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Extract from Image/PDF (AI)" },
      {
        sender: "bot",
        text: `🖼️ AI Extraction Mode!\n\n${fieldsList}\nSupported: Images (JPG, PNG), PDFs, Word docs.\n\nUpload a file and AI will extract the data.`,
        buttons: [
          {
            id: "select_image",
            label: "📷 Select File",
            handler: () => imageInputRef.current?.click(),
          },
          {
            id: "cancel_image",
            label: "Cancel",
            handler: () => cancelImageUpload(),
          },
        ],
      },
    ]);
  };

  const cancelImageUpload = () => {
    setImageUploadMode(false);
    setSelectedImage(null);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "File upload cancelled." },
    ]);
  };

  // Handle image/file selection
  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!validTypes.includes(file.type)) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Unsupported file type. Please use: JPG, PNG, PDF, or DOCX",
        },
      ]);
      return;
    }

    setSelectedImage(file);

    // For images, show preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview({
          url: e.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + " KB",
          type: file.type,
        });

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `📷 File "${file.name}" loaded!\n\nClick "Extract Data" to analyze.`,
            buttons: [
              {
                id: "extract_data",
                label: "🤖 Extract Data with AI",
                handler: () => handleImageExtraction(file),
              },
              {
                id: "cancel",
                label: "Cancel",
                handler: () => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                  }
                },
              },
            ],
          },
        ]);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs and docs, no preview
      setImagePreview({
        url: null,
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        type: file.type,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `📄 File "${file.name}" loaded!\n\nClick "Extract Data" to analyze.`,
          buttons: [
            {
              id: "extract_data",
              label: "🤖 Extract Data with AI",
              handler: () => handleImageExtraction(file),
            },
            {
              id: "cancel",
              label: "Cancel",
              handler: () => {
                setSelectedImage(null);
                setImagePreview(null);
                if (imageInputRef.current) {
                  imageInputRef.current.value = "";
                }
              },
            },
          ],
        },
      ]);
    }
  };

  // Handle AI image/file extraction
  const handleImageExtraction = async (file) => {
    if (!geminiApiKey || geminiApiKey.length < 10) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Gemini API key not configured. Please configure it in settings.",
        },
      ]);
      return;
    }

    setOpen(true);

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Extract Data with AI" },
      { sender: "bot", text: "🤖 AI is analyzing... Please wait." },
    ]);

    try {
      const requiredFields = selectedApi.requiredFields
        .split(",")
        .map((f) => f.trim());
      const optionalFields = selectedApi.optionalFields
        ? selectedApi.optionalFields.split(",").map((f) => f.trim())
        : [];
      const allFields = [...requiredFields, ...optionalFields];

      let fieldTypes = {};
      let fieldOptions = {};

      try {
        fieldTypes = JSON.parse(selectedApi.fieldTypes || "{}");
      } catch (e) {
        fieldTypes = {};
      }

      try {
        fieldOptions = JSON.parse(selectedApi.fieldOptions || "{}");
      } catch (e) {
        fieldOptions = {};
      }

      let fieldInfo = "";
      allFields.forEach((field) => {
        const type = fieldTypes[field] || "text";
        const options = fieldOptions[field];

        if (type === "select" && options && options.length > 0) {
          fieldInfo += `\n- ${field} (select): Choose from [${options.join(
            ", "
          )}]`;
        } else {
          fieldInfo += `\n- ${field} (${type})`;
        }
      });

      const prompt = `Extract data from this document/image.

**Required Fields:**
${requiredFields.map((f) => `- ${f}`).join("\n")}

**Optional Fields:**
${optionalFields.map((f) => `- ${f}`).join("\n")}

**Field Details:**${fieldInfo}

**Instructions:**
1. Extract all visible information
2. Match to specified fields
3. Return ONLY valid JSON
4. Use exact field names
5. Empty string "" for missing fields
6. For select fields, choose from given options
7. Dates in YYYY-MM-DD format
8. Clean and format data

**Response format:**
{"field1": "value1", "field2": "value2"}

Return ONLY JSON, no markdown, no explanations.`;

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(",")[1];

          const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: prompt },
                      {
                        inline_data: {
                          mime_type: file.type,
                          data: base64Data,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.4,
                  topK: 32,
                  topP: 1,
                  maxOutputTokens: 2048,
                },
              }),
            }
          );

          if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(errorData.error?.message || "API failed");
          }

          const result = await apiResponse.json();

          let responseText = "";

          if (result.candidates && result.candidates.length > 0) {
            const candidate = result.candidates[0];
            if (
              candidate.content &&
              candidate.content.parts &&
              candidate.content.parts.length > 0
            ) {
              responseText = candidate.content.parts[0].text;
            } else {
              throw new Error("No content in response");
            }
          } else {
            throw new Error("No candidates in response");
          }

          if (!responseText) {
            throw new Error("Empty AI response");
          }

          console.log("📝 AI Response Text:", responseText);

          // Extract JSON
          let extractedData;
          try {
            let cleanedResponse = responseText.trim();
            cleanedResponse = cleanedResponse.replace(/``````\s*/g, "");
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
              extractedData = JSON.parse(jsonMatch[0]);
            } else {
              extractedData = JSON.parse(cleanedResponse);
            }
          } catch (e) {
            throw new Error(`Parse error: ${e.message}`);
          }

          console.log("✅ Extracted Data:", extractedData);

          setOpen(false);
          setImageUploadMode(false);
          setSelectedImage(null);
          setImagePreview(null);

          if (imageInputRef.current) {
            imageInputRef.current.value = "";
          }

          const dataPreview = JSON.stringify(extractedData, null, 2);

          // CRITICAL FIX: Pass extractedData directly in closure
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `✅ AI extracted:\n\n\`\`\`json\n${dataPreview}\n\`\`\`\n\nWhat to do?`,
              buttons: [
                {
                  id: "submit_extracted",
                  label: "✅ Submit Data",
                  // PASS DATA DIRECTLY - Don't rely on state
                  handler: async () => {
                    console.log("Submit clicked, data:", extractedData);

                    const reqFields = selectedApi.requiredFields
                      .split(",")
                      .map((f) => f.trim());
                    const missing = reqFields.filter(
                      (f) => !extractedData[f] || extractedData[f] === ""
                    );

                    if (missing.length > 0) {
                      setMessages((prev) => [
                        ...prev,
                        {
                          sender: "bot",
                          text: `❌ Missing: ${missing.join(", ")}`,
                        },
                      ]);
                      return;
                    }

                    setOpen(true);
                    setMessages((prev) => [
                      ...prev,
                      { sender: "user", text: "Submit Extracted Data" },
                      { sender: "bot", text: "Processing..." },
                    ]);

                    try {
                      const endpoint =
                        selectedApi.singleEntryEndpoint || selectedApi.api;
                      const payload = { ...extractedData };

                      if (selectedApi.useColid) payload.colid = global1.colid;
                      if (selectedApi.useUser) {
                        payload.user = global1.user;
                        payload.name = global1.name;
                      }
                      if (selectedApi.useToken && global1.token)
                        payload.token = global1.token;

                      console.log("📤 Sending:", payload);

                      // ✅ Use helper function for internal/external API
                      const response = await makeApiCall(
                        selectedApi,
                        endpoint,
                        payload
                      );

                      setOpen(false);

                      if (
                        response.data.status === "Success" ||
                        response.data.success
                      ) {
                        setMessages((prev) => [
                          ...prev,
                          {
                            sender: "bot",
                            text: `✅ Success! ID: ${
                              response.data.data?._id || "N/A"
                            }`,
                            buttons: [
                              {
                                id: "extract_another",
                                label: "📷 Extract Another",
                                handler: () => startImageUpload(selectedApi),
                              },
                              {
                                id: "done",
                                label: "Done",
                                handler: () => handleSearchAgain(),
                              },
                            ],
                          },
                        ]);
                      } else {
                        setMessages((prev) => [
                          ...prev,
                          {
                            sender: "bot",
                            text: `❌ ${response.data.message}`,
                          },
                        ]);
                      }
                    } catch (error) {
                      setOpen(false);
                      setMessages((prev) => [
                        ...prev,
                        { sender: "bot", text: `❌ ${error.message}` },
                      ]);
                    }
                  },
                },
                {
                  id: "edit_extracted",
                  label: "✏️ Review & Edit",
                  handler: () => {
                    setManualEntryData(extractedData);
                    setManualEntryMode(true);
                    setFormDialogOpen(true);
                  },
                },
                {
                  id: "try_again",
                  label: "🔄 Try Another",
                  handler: () => startImageUpload(selectedApi),
                },
                {
                  id: "cancel",
                  label: "Cancel",
                  handler: () => handleSearchAgain(),
                },
              ],
            },
          ]);
        } catch (error) {
          setOpen(false);
          console.error("❌ Error:", error);

          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `❌ Error: ${error.message}`,
              buttons: [
                {
                  id: "try_again",
                  label: "🔄 Try Again",
                  handler: () => startImageUpload(selectedApi),
                },
                {
                  id: "manual_entry",
                  label: "✍️ Add Manually",
                  handler: () => startManualEntry(selectedApi),
                },
              ],
            },
          ]);
        }
      };

      reader.onerror = (error) => {
        setOpen(false);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `❌ Error reading file: ${error.message}` },
        ]);
      };
    } catch (error) {
      setOpen(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `❌ Error: ${error.message}` },
      ]);
    }
  };

  // Start manual entry mode
  const startManualEntry = (apiConfig) => {
    setManualEntryMode(true);
    setBulkUploadMode(false);
    setImageUploadMode(false);
    setManualEntryData({});

    const requiredFields = apiConfig.requiredFields
      .split(",")
      .map((f) => f.trim());
    const optionalFields = apiConfig.optionalFields
      ? apiConfig.optionalFields.split(",").map((f) => f.trim())
      : [];

    let fieldsList = "**Required:**\n";
    requiredFields.forEach((field) => {
      fieldsList += `• ${field}\n`;
    });

    if (optionalFields.length > 0) {
      fieldsList += "\n**Optional:**\n";
      optionalFields.forEach((field) => {
        fieldsList += `• ${field}\n`;
      });
    }

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Add Data Manually" },
      {
        sender: "bot",
        text: `📝 Manual Entry!\n\n${fieldsList}`,
        buttons: [
          {
            id: "show_form",
            label: "📋 Show Form",
            handler: () => setFormDialogOpen(true),
          },
          {
            id: "cancel_entry",
            label: "Cancel",
            handler: () => cancelManualEntry(),
          },
        ],
      },
    ]);
  };

  const cancelManualEntry = () => {
    setManualEntryMode(false);
    setManualEntryData({});
    setMessages((prev) => [...prev, { sender: "bot", text: "Cancelled." }]);
  };

  // Handle manual entry submission
  const handleManualEntrySubmit = async () => {
    console.log("handleManualEntrySubmit");
    console.log("Data:", manualEntryData);

    const requiredFields = selectedApi.requiredFields
      .split(",")
      .map((f) => f.trim());
    const missingFields = requiredFields.filter(
      (field) => !manualEntryData[field] || manualEntryData[field] === ""
    );

    if (missingFields.length > 0) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `❌ Missing: ${missingFields.join(", ")}` },
      ]);
      return;
    }

    setFormDialogOpen(false);
    setOpen(true);

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Submit" },
      { sender: "bot", text: "Processing..." },
    ]);

    try {
      const endpoint = selectedApi.singleEntryEndpoint || selectedApi.api;
      const payload = { ...manualEntryData };

      if (selectedApi.useColid) payload.colid = global1.colid;
      if (selectedApi.useUser) {
        payload.name = global1.name;
        payload.user = global1.user;
      }
      if (selectedApi.useToken && global1.token) payload.token = global1.token;

      console.log("📤 Payload:", payload);

      // ✅ Use helper function for internal/external API
      const response = await makeApiCall(selectedApi, endpoint, payload);

      setOpen(false);

      if (response.data.status === "success" || response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `✅ Success! ID: ${response.data.data?._id || "N/A"}`,
            buttons: [
              {
                id: "add_another",
                label: "➕ Add Another",
                handler: () => startManualEntry(selectedApi),
              },
              {
                id: "done",
                label: "Done",
                handler: () => handleSearchAgain(),
              },
            ],
          },
        ]);
        setManualEntryMode(false);
        setManualEntryData({});
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `❌ ${response.data.message}` },
        ]);
      }
    } catch (error) {
      setOpen(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `❌ ${error.message}` },
      ]);
    }
  };

  // Start bulk upload mode
  const startBulkUpload = (apiConfig) => {
    setBulkUploadMode(true);
    setManualEntryMode(false);
    setImageUploadMode(false);
    setSelectedFile(null);
    setFilePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const method = apiConfig.supportsBulkUpload ? "Bulk API" : "Row-by-row";

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Upload from Excel" },
      {
        sender: "bot",
        text: `📁 Excel Upload!\n\nMethod: ${method}`,
        buttons: [
          {
            id: "select_file",
            label: "📂 Select Excel",
            handler: () => fileInputRef.current?.click(),
          },
          {
            id: "download_format",
            label: "📥 Download Format",
            handler: () => downloadFormat(apiConfig),
          },
          {
            id: "cancel_upload",
            label: "Cancel",
            handler: () => cancelBulkUpload(),
          },
        ],
      },
    ]);
  };

  const cancelBulkUpload = () => {
    setBulkUploadMode(false);
    setSelectedFile(null);
    setFilePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setMessages((prev) => [...prev, { sender: "bot", text: "Cancelled." }]);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `✅ Loaded ${jsonData.length} records.`,
            buttons: [
              {
                id: "upload_data",
                label: `📤 Upload ${jsonData.length}`,
                handler: () => handleBulkUpload(jsonData),
              },
              {
                id: "cancel",
                label: "Cancel",
                handler: () => {
                  setSelectedFile(null);
                  setFilePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                },
              },
            ],
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `❌ ${error.message}` },
        ]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle bulk upload
  const handleBulkUpload = async (data) => {
    setOpen(true);

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Upload" },
      { sender: "bot", text: `Uploading ${data.length}...` },
    ]);

    try {
      const enrichedData = data.map((record) => {
        const enriched = { ...record };

        if (selectedApi.useColid) enriched.colid = global1.colid;
        if (selectedApi.useUser) {
          enriched.name = global1.name;
          enriched.user = global1.user;
        }
        if (selectedApi.useToken && global1.token)
          enriched.token = global1.token;

        return enriched;
      });

      let successCount = 0;
      let failedCount = 0;
      let errors = [];

      if (selectedApi.supportsBulkUpload && selectedApi.bulkUploadEndpoint) {
        // ✅ Use helper function for bulk endpoint
        const response = await makeApiCall(
          selectedApi,
          selectedApi.bulkUploadEndpoint,
          {
            collection: selectedApi.collectionName,
            data: enrichedData,
          }
        );

        if (response.data.status === "Success" || response.data.success) {
          successCount = enrichedData.length;
        } else {
          failedCount = enrichedData.length;
          errors.push(response.data.message);
        }
      } else {
        const endpoint = selectedApi.singleEntryEndpoint || selectedApi.api;

        for (let i = 0; i < enrichedData.length; i++) {
          try {
            if (i % 5 === 0 || i === enrichedData.length - 1) {
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  sender: "bot",
                  text: `Processing ${i + 1}/${enrichedData.length}...`,
                };
                return newMessages;
              });
            }

            // ✅ Use helper function for each row
            const response = await makeApiCall(
              selectedApi,
              endpoint,
              enrichedData[i]
            );

            if (response.data.status === "success" || response.data.success) {
              successCount++;
            } else {
              failedCount++;
              errors.push(`Row ${i + 1}: ${response.data.message}`);
            }
          } catch (error) {
            failedCount++;
            errors.push(`Row ${i + 1}: ${error.message}`);
          }
        }
      }

      setOpen(false);

      let resultMessage = "";

      if (successCount > 0 && failedCount === 0) {
        resultMessage = `✅ Success! ${successCount} uploaded.`;
      } else if (successCount > 0 && failedCount > 0) {
        resultMessage = `⚠️ Partial!\n✅ ${successCount}\n❌ ${failedCount}\n\n${errors
          .slice(0, 3)
          .join("\n")}`;
      } else {
        resultMessage = `❌ Failed!\n\n${errors.slice(0, 3).join("\n")}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: resultMessage,
          buttons: [
            {
              id: "upload_another",
              label: "📁 Upload Another",
              handler: () => startBulkUpload(selectedApi),
            },
            {
              id: "done",
              label: "Done",
              handler: () => handleSearchAgain(),
            },
          ],
        },
      ]);

      setBulkUploadMode(false);
      setSelectedFile(null);
      setFilePreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setOpen(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `❌ ${error.message}` },
      ]);
    }
  };

  // Download Excel format
  const downloadFormat = (apiConfig) => {
    try {
      const requiredFields = apiConfig.requiredFields
        .split(",")
        .map((f) => f.trim());
      const optionalFields = apiConfig.optionalFields
        ? apiConfig.optionalFields.split(",").map((f) => f.trim())
        : [];
      const allFields = [...requiredFields, ...optionalFields];

      const headers = [allFields];

      let exampleData = null;
      try {
        exampleData = JSON.parse(apiConfig.exampleData || "{}");
      } catch (e) {
        exampleData = {};
      }

      const exampleRow = allFields.map((field) => exampleData[field] || "");
      headers.push(exampleRow);

      const worksheet = XLSX.utils.aoa_to_sheet(headers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const filename = `${apiConfig.collectionName}_format.xlsx`;
      XLSX.writeFile(workbook, filename);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `📥 Downloaded: ${filename}` },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `❌ ${error.message}` },
      ]);
    }
  };

  // Handle search again
  const handleSearchAgain = () => {
    setSelectedApi(null);
    setManualEntryMode(false);
    setBulkUploadMode(false);
    setImageUploadMode(false);
    setManualEntryData({});
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "Search Another" },
      { sender: "bot", text: "Type module name." },
    ]);
  };

  // Fetch bot response
  const fetchBotResponse = async (userText) => {
    if (userText.toLowerCase().includes("help")) {
      return {
        text: "Actions:\n1. Search modules\n2. Add manually\n3. Upload Excel\n4. Extract from image/PDF\n5. Configure",
      };
    }

    return await searchDataApis(userText);
  };

  // Handle button click
  const handleButtonClick = async (button) => {
    console.log("Button clicked:", button.id);

    if (button.id === "config_new") {
      navigate("/dataconfig");
      return;
    }

    if (button.id === "search_again") {
      handleSearchAgain();
      return;
    }

    if (button.handler) {
      button.handler();
      return;
    }

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `Selected: ${button.label}` },
    ]);

    const result = showModuleOptions(button.config);

    const formattedResponse = {
      sender: "bot",
      text: result.text,
      buttons: result.buttons?.map((btn) => ({
        ...btn,
        handler: btn.handler || (() => handleButtonClick(btn)),
      })),
    };

    setMessages((prev) => [...prev, formattedResponse]);
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    const botResponse = await fetchBotResponse(userInput);

    const formattedResponse = {
      sender: "bot",
      text: botResponse.text,
      buttons: botResponse.buttons?.map((btn) => ({
        ...btn,
        handler: btn.handler || (() => handleButtonClick(btn)),
      })),
    };

    setMessages((prev) => [...prev, formattedResponse]);
  };

  // Handle field change
  const handleFieldChange = (field, value) => {
    setManualEntryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Render form
  const renderManualEntryForm = () => {
    if (!selectedApi) return null;

    const requiredFields = selectedApi.requiredFields
      .split(",")
      .map((f) => f.trim());
    const optionalFields = selectedApi.optionalFields
      ? selectedApi.optionalFields.split(",").map((f) => f.trim())
      : [];
    const allFields = [...requiredFields, ...optionalFields];

    let fieldTypes = {};
    let fieldOptions = {};

    try {
      fieldTypes = JSON.parse(selectedApi.fieldTypes || "{}");
    } catch (e) {
      fieldTypes = {};
    }

    try {
      fieldOptions = JSON.parse(selectedApi.fieldOptions || "{}");
    } catch (e) {
      fieldOptions = {};
    }

    return (
      <Grid container spacing={2}>
        {allFields.map((field, index) => {
          const fieldType = fieldTypes[field] || "text";
          const isRequired = requiredFields.includes(field);
          const options = fieldOptions[field] || [];

          const label = field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          if (fieldType === "textarea") {
            return (
              <Grid item xs={12} key={index}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={label}
                  value={manualEntryData[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  required={isRequired}
                />
              </Grid>
            );
          } else if (fieldType === "select") {
            return (
              <Grid item xs={12} md={6} key={index}>
                <TextField
                  fullWidth
                  select
                  label={label}
                  value={manualEntryData[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  required={isRequired}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {options.map((option, idx) => (
                    <MenuItem key={idx} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          } else {
            return (
              <Grid item xs={12} md={6} key={index}>
                <TextField
                  fullWidth
                  type={fieldType}
                  label={label}
                  value={manualEntryData[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  required={isRequired}
                  InputLabelProps={
                    fieldType === "date" ? { shrink: true } : undefined
                  }
                />
              </Grid>
            );
          }
        })}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">AI Data Manager</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dataconfig")}
        >
          Configure
        </Button>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          m: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: "70%",
                  bgcolor: msg.sender === "user" ? "#1976d2" : "#e0e0e0",
                  color: msg.sender === "user" ? "white" : "black",
                }}
              >
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {msg.text}
                </Typography>

                {msg.buttons && (
                  <Box
                    sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}
                  >
                    {msg.buttons.map((btn, i) => (
                      <Button
                        key={i}
                        variant="contained"
                        size="small"
                        onClick={() => {
                          if (btn.handler) btn.handler();
                        }}
                        sx={{
                          bgcolor: msg.sender === "user" ? "white" : "#1976d2",
                          color: msg.sender === "user" ? "#1976d2" : "white",
                          "&:hover": {
                            bgcolor:
                              msg.sender === "user" ? "#f0f0f0" : "#1565c0",
                          },
                        }}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Box>

        {filePreview && (
          <Paper
            sx={{
              p: 1,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#fff3e0",
            }}
          >
            <Typography variant="caption">
              📎 {filePreview.name} ({filePreview.size})
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setSelectedFile(null);
                setFilePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        )}

        {imagePreview && (
          <Paper sx={{ p: 1, mb: 1, bgcolor: "#e3f2fd" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="caption">
                📷 {imagePreview.name} ({imagePreview.size})
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            {imagePreview.url && (
              <img
                src={imagePreview.url}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "8px",
                  objectFit: "contain",
                }}
              />
            )}
          </Paper>
        )}

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
            accept=".xlsx,.xls"
          />

          <input
            type="file"
            ref={imageInputRef}
            style={{ display: "none" }}
            onChange={handleImageSelect}
            accept="image/*,.pdf,.doc,.docx"
          />

          <IconButton
            onClick={() => fileInputRef.current?.click()}
            title="Excel"
          >
            <AttachFileIcon />
          </IconButton>

          <IconButton
            onClick={() => imageInputRef.current?.click()}
            title="Image/PDF"
          >
            <ImageIcon />
          </IconButton>

          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type module name..."
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Data - {selectedApi?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>{renderManualEntryForm()}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleManualEntrySubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
