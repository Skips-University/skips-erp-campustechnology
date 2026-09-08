import { TextField, MenuItem, Box } from "@mui/material";

const FormField = ({ label, type, name, value, onChange, options = [] }) => {
  const isSelect = type === "select";
  const isDate = type === "date";

  return (
    <Box mb={2}>
      {isSelect ? (
        <TextField
          select
          fullWidth
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          variant="outlined"
          size="small"
        >
          <MenuItem value="">-- Select --</MenuItem>
          {options.map((opt, idx) => (
            <MenuItem key={idx} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          fullWidth
          type={type}
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          variant="outlined"
          size="small"
          InputLabelProps={isDate ? { shrink: true } : {}}
        />
      )}
    </Box>
  );
};

export default FormField;


