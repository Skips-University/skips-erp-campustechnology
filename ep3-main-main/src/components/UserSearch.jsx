import { useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import ep1 from '../api/ep1';
import global1 from '../pages/global1';

const UserSearch = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = async (_, newInput) => {
    if (!newInput) return setOptions([]);
    setLoading(true);
    const { data } = await ep1.get('/api/v2/searchuserbyemailorname', { params: { q: newInput,
      colid: global1.colid
     } });
    setOptions(data);
    setLoading(false);
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      onChange={(_, v) => onChange(v)}
      getOptionLabel={(u) => `${u.name} <${u.email}>`}
      isOptionEqualToValue={(o, v) => o.email === v.email}
      options={options}
      loading={loading}
      onInputChange={handleInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
};

export default UserSearch;