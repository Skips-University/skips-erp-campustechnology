import { TextField, MenuItem, Box, FormControlLabel, Checkbox } from "@mui/material";

const InputField = ({ label, type, name, value, onChange, options = [] }) => {
  const isSelect = type === "select";
  const isDate = type === "date";
  const isCheckbox = type === "checkbox";

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
      ) : isCheckbox ? (
        <FormControlLabel
          control={
            <Checkbox
              name={name}
              checked={!!value}
              onChange={onChange}
            />
          }
          label={label}
        />
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

export default InputField;

