
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Editor } from "@monaco-editor/react";
import { useSnackbar } from "notistack";
import axios from "axios";

// creating an API instance
export const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston/",
});

// API call to fetch available runtimes (languages)
export const getLanguage = async () => {
  try {
    const res = await API.get("/runtimes");
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};


const CODE_SNIPPETS = {
  javascript: '\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n',
  typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: '\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n',
  java: '\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello Alex");\n\t}\n}\n',
  csharp: '\nusing System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello Alex in C#");\n\t\t}\n\t}\n}\n',
  php: '\n<?php\n\n$name = "Alex";\necho "Hello, " . $name . "!";\n?>\n',
  bash: '\n#!/bin/bash\n\nname="Alex"\necho "Hello, $name!"\n',
  brainfuck: '\n++++++++[>++++++++<-]>.<++++[>++<-]>-.+++++++++++++.---------.+++.------.--------.\n',
  dart: '\nvoid main() {\n\tString name = "Alex";\n\tprint("Hello, $name!");\n}\n',
  go: '\npackage main\n\nimport "fmt"\n\nfunc main() {\n\tname := "Alex"\n\tfmt.Printf("Hello, %s!\\n", name)\n}\n',
  elixir: '\ndefmodule Greet do\n\tdef hello(name) do\n\t\tIO.puts "Hello, \#{name}!"\n\tend\nend\n\nGreet.hello("Alex")\n',
  rust: '\nfn main() {\n\tlet name = "Alex";\n\tprintln!("Hello, {}!", name);\n}\n',
  kotlin: '\nfun main() {\n\tval name = "Alex"\n\tprintln("Hello, $name!")\n}\n',
  haskell: '\nmain = do\n\tlet name = "Alex"\n\tputStrLn ("Hello, " ++ name ++ "!")\n',
  lua: '\nname = "Alex"\nprint("Hello, " .. name .. "!")\n',
  c: '\n#include <stdio.h>\n\nvoid greet(const char* name) {\n\tprintf("Hello, %s!\\n", name);\n}\n\nint main() {\n\tgreet("Alex");\n\treturn 0;\n}\n',
  "c++": '\n#include <iostream>\nusing namespace std;\n\nvoid greet(string name) {\n\tcout << "Hello, " << name << "!" << endl;\n}\n\nint main() {\n\tgreet("Alex");\n\treturn 0;\n}\n',
};


const LanguageSelector = ({ language, onSelect, languageList }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ marginLeft: 2, marginBottom: 4 }}>
      <Typography mb={2} variant="h6">
        Choose Language
      </Typography>
      <Button onClick={handleClick} variant="contained">
        {language}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {languageList.map((langItem) => (
          <MenuItem
            key={langItem.language}
            onClick={() => {
              onSelect(langItem.language);
              handleClose();
            }}
            sx={{
              color: langItem.language === language ? "#42a5f5" : "inherit",
              backgroundColor:
                langItem.language === language ? "#424242" : "transparent",
              "&:hover": {
                color: "#42a5f5",
                backgroundColor: "#424242",
              },
            }}
          >
            {langItem.language}
            &nbsp;
            <Typography component="span" color="gray" fontSize="small">
              ({langItem.version})
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const CodeEditor = () => {
  const editorRef = useRef(null);
  const [value, setValue] = useState(CODE_SNIPPETS["javascript"]); 
  const [language, setLanguage] = useState("javascript");

  const { enqueueSnackbar } = useSnackbar();

  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [languageList, setLanguageList] = useState([]); 

  useEffect(() => {
    const fetchLanguages = async () => {
      const data = await getLanguage();
      setLanguageList(data); 
    };

    fetchLanguages();
  }, []);

  const executeCode = async (language, srcCode) => {
    const selectedLang = languageList.find((item) => item.language === language);
    const version = selectedLang ? selectedLang.version : null;
    
    if (!version) {
      enqueueSnackbar("Version not found for the selected language", {
        variant: "error",
      });
      return;
    }

    const res = await API.post("/execute", {
      language: language,
      version: version,
      files: [
        {
          content: srcCode,
        },
      ],
    });
    return res.data;
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setValue(CODE_SNIPPETS[lang] || "");
  };

  const runCodeOutput = async () => {
    const srcCode = editorRef.current.getValue();

    if (!srcCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, srcCode);
      const finalResult = result.output.split("\n");
      setOutput(finalResult);
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (err) {
      console.log(err);
      enqueueSnackbar(err.message || "Unable to run code", {
        variant: "error",
        autoHideDuration: 6000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        preventDuplicate: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <LanguageSelector
            language={language}
            onSelect={handleLanguageSelect}
            languageList={languageList} 
          />
          <Editor
            options={{
              minimap: { enabled: false },
            }}
            height="75vh"
            language={language}
            value={value}
            theme="vs-dark"
            onMount={handleEditorMount}
            onChange={(newValue) => setValue(newValue || "")}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              margin: "10px",
              padding: "10px",
            }}
          >
            <Typography sx={{ mb: 2, fontSize: "18px", color: "grey.500" }}>
              Output
            </Typography>
            <Button
              variant="outlined"
              color="success"
              sx={{ mb: 4 }}
              onClick={runCodeOutput}
            >
              {isLoading ? "loading..." : "Run Code"}
            </Button>
            <Box
              sx={{
                height: "75vh",
                p: 2,
                border: "1px solid",
                borderRadius: "4px",
                borderColor: `${isError ? "#f44336" : "grey.500"}`,
                color: `${isError ? "#ef5350" : ""}`,
                boxShadow: 0,
              }}
            >
              {output ? (
                output.map((line, i) => <Typography key={i}>{line}</Typography>)
              ) : (
                <Typography sx={{ color: "grey.600" }}>
                  Click "Run Code" to see the output here.
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CodeEditor;
